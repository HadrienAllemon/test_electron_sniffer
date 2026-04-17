import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH   = path.resolve(__dirname, '../db/itemsHistory.db');

export interface IPetItemXpRatio {
    itemId:            number;
    name:              string;
    xp:                number;
    by1:               number;
    by10:              number;
    by100:             number;
    xpPerKama_by1:     number;
    xpPerKama_by10:    number;
    xpPerKama_by100:   number;
}

export const getPetItemXpRatios = (db: Database.Database): IPetItemXpRatio[][] => {
    if (!db) return [];
    const select = db.prepare<IPetItemXpRatio[], []>(`
        SELECT
            p.itemId,
            n.fr                            AS name,
            p.xp,
            pr.by1,
            pr.by10,
            pr.by100,
            p.xp / pr.by1                   AS xpPerKama_by1,
            p.xp / pr.by10  * 10            AS xpPerKama_by10,
            p.xp / pr.by100 * 100           AS xpPerKama_by100
        FROM PetItemXp p
        INNER JOIN itemsPrices pr ON p.itemId = pr.itemId
        LEFT  JOIN itemNames   n  ON p.itemId = n.itemId
        ORDER BY xpPerKama_by10 DESC
    `);
    return select.all();

}


function main(){
    const db = new Database(DB_PATH);
    const rows = getPetItemXpRatios(db);
    console.table(rows);
}

main()