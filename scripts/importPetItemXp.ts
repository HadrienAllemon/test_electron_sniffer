/**
 * One-time migration script: imports "Ressources Familier.csv" into the PetItemXp table.
 *
 * Run with:
 *   npm run import-pet-xp
 *
 * What it does:
 *   1. Parses the CSV (semicolon-delimited, French decimal commas, potentially Latin-1 encoded)
 *   2. Loads all French item names from the itemNames table
 *   3. Uses Fuse.js fuzzy matching to find the best itemId for each CSV row
 *   4. Prints a dry-run report — LOW CONFIDENCE matches (score < 0.35) are flagged
 *   5. Asks for confirmation, then creates the PetItemXp table and inserts the rows
 */

import Database from 'better-sqlite3';
import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';

// ─── Config ──────────────────────────────────────────────────────────────────

const DB_PATH   = path.resolve(__dirname, '../db/itemsHistory.db');
const CSV_PATH  = path.resolve(__dirname, '../assets/Ressources Familier.csv');

/** Fuse score threshold: 0 = perfect match, 1 = no match. Flag anything above this. */
const FLAG_THRESHOLD = 0.35;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip accents and lowercase — handles "Planche a pain" vs "Planche à pain" */
function normalize(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/** French CSV uses commas as decimal separator */
function parseFloat_fr(value: string): number {
    return parseFloat(value.replace(',', '.'));
}

function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

// ─── Parse CSV ───────────────────────────────────────────────────────────────

interface CsvRow {
    rawName: string;
    xp: number;
}

function parseCsv(filePath: string): CsvRow[] {
    // Try Latin-1 first — CSV was likely saved with a French locale tool
    const raw = fs.readFileSync(filePath, 'latin1');
    const lines = raw.split(/\r?\n/);

    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {           // skip header
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(';');
        const rawName = cols[0]?.trim();
        const xpRaw   = cols[2]?.trim();

        if (!rawName || !xpRaw) continue;

        const xp = parseFloat_fr(xpRaw);
        if (isNaN(xp)) continue;                        // skip non-data rows

        rows.push({ rawName, xp });
    }

    return rows;
}

// ─── Load DB names ────────────────────────────────────────────────────────────

interface DbName {
    itemId: number;
    fr: string;
    normalized: string;
}

function loadDbNames(db: Database.Database): DbName[] {
    const rows = db.prepare('SELECT itemId, fr FROM itemNames WHERE fr IS NOT NULL').all() as { itemId: number; fr: string }[];
    return rows.map(r => ({
        itemId: r.itemId,
        fr: r.fr,
        normalized: normalize(r.fr),
    }));
}

// ─── Match ────────────────────────────────────────────────────────────────────

interface MatchResult {
    rawName:    string;
    xp:         number;
    matchedFr:  string;
    itemId:     number;
    score:      number;     // 0 = perfect, 1 = no match
    flagged:    boolean;
}

function matchAll(csvRows: CsvRow[], dbNames: DbName[]): MatchResult[] {
    const fuse = new Fuse(dbNames, {
        keys: ['normalized'],
        includeScore: true,
        threshold: 0.8,     // wide net — we'll flag low confidence ourselves
        ignoreLocation: true,
        minMatchCharLength: 3,
    });

    return csvRows.map(row => {
        const normalizedQuery = normalize(row.rawName);
        const results = fuse.search(normalizedQuery);

        if (!results.length) {
            return {
                rawName:   row.rawName,
                xp:        row.xp,
                matchedFr: '??? NO MATCH FOUND',
                itemId:    -1,
                score:     1,
                flagged:   true,
            };
        }

        const best = results[0];
        const score = best.score ?? 1;

        return {
            rawName:   row.rawName,
            xp:        row.xp,
            matchedFr: best.item.fr,
            itemId:    best.item.itemId,
            score,
            flagged:   score > FLAG_THRESHOLD,
        };
    });
}

// ─── Report ───────────────────────────────────────────────────────────────────

function printReport(matches: MatchResult[]): void {
    const col = (s: string, w: number) => s.padEnd(w).slice(0, w);

    console.log('\n' + '─'.repeat(110));
    console.log(
        col('CSV Name', 38) + ' │ ' +
        col('Matched DB Name', 40) + ' │ ' +
        col('Score', 6) + ' │ ' +
        col('ItemId', 8) + ' │ Flag'
    );
    console.log('─'.repeat(110));

    for (const m of matches) {
        const flag    = m.flagged ? ' ⚠ LOW CONFIDENCE' : '';
        const scoreFmt = (m.score * 100).toFixed(0).padStart(3) + '%';
        console.log(
            col(m.rawName, 38) + ' │ ' +
            col(m.matchedFr, 40) + ' │ ' +
            col(scoreFmt, 6) + ' │ ' +
            col(String(m.itemId), 8) + ' │' +
            flag
        );
    }

    console.log('─'.repeat(110));
    const flagged = matches.filter(m => m.flagged).length;
    console.log(`\nTotal: ${matches.length} rows  |  Flagged: ${flagged} rows needing review\n`);
}

// ─── DB write ─────────────────────────────────────────────────────────────────

function createTableAndInsert(db: Database.Database, matches: MatchResult[]): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS PetItemXp (
            id     INTEGER PRIMARY KEY,
            itemId INTEGER NOT NULL UNIQUE,
            xp     REAL    NOT NULL
        )
    `);

    const upsert = db.prepare(`
        INSERT INTO PetItemXp (itemId, xp)
        VALUES (?, ?)
        ON CONFLICT(itemId) DO UPDATE SET xp = excluded.xp
    `);

    const insertMany = db.transaction((rows: MatchResult[]) => {
        let inserted = 0;
        for (const row of rows) {
            if (row.itemId === -1) {
                console.warn(`  Skipped (no match): ${row.rawName}`);
                continue;
            }
            upsert.run(row.itemId, row.xp);
            inserted++;
        }
        return inserted;
    });

    const count = insertMany(matches);
    console.log(`\nDone. ${count} rows written to PetItemXp.\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n=== PetItemXp import ===\n');

    // 1. Parse CSV
    const csvRows = parseCsv(CSV_PATH);
    console.log(`Parsed ${csvRows.length} rows from CSV.`);

    // 2. Open DB and load names
    const db = new Database(DB_PATH);
    const dbNames = loadDbNames(db);
    console.log(`Loaded ${dbNames.length} French item names from DB.`);

    // 3. Fuzzy match
    const matches = matchAll(csvRows, dbNames);

    // 4. Dry-run report
    printReport(matches);

    // 5. Ask for confirmation
    const flaggedCount = matches.filter(m => m.flagged).length;
    if (flaggedCount > 0) {
        console.log(`⚠  ${flaggedCount} low-confidence match(es) above. You may want to review them before continuing.`);
    }

    const answer = await prompt('Proceed with insert of confident rows? (y/N): ');
    if (answer.trim().toLowerCase() !== 'y') {
        console.log('Aborted. No changes made.');
        db.close();
        return;
    }

    // 6. Write to DB
    let confidentMatches = matches.filter(m => !m.flagged);
    createTableAndInsert(db, confidentMatches);
    db.close();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
