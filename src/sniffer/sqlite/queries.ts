import { getDb } from "./ensureDatabase"
import { EventEmitter } from "events";
import { IItemSold, IItemBought, ITransaction, ITax } from "../../interfaces";
import { IDbItemSold } from "@src/interfaces/dbReady/IDbItemSold";
import { IDbItemBought } from "@src/interfaces/dbReady/IDbItemBought";
import { IDbTax } from "@src/interfaces/dbReady/IDbTax";
import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";

export const dbEvents = new EventEmitter();

export const selectItems = () => {
    const db = getDb();
    if (!db) return;
    const select = db.prepare(`select * from itemsSold`)
    let rows = select.all()
    rows.forEach((row: any) => {
        console.log(row.itemId + "\t" +
            row.amountSold + "\t" +
            row.profit);
    });
}
export const addItemsSold = (items: IDbItemSold[]) => {
    const db = getDb();
    if (!db) return;
    const insert = db.prepare("insert into itemsSold (itemId, profit, amountSold, created_at) values (?,?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.profit, item.amountSold, new Date().toISOString())
    })
}
export const addItemsBought = (items: IDbItemBought[]) => {
    const db = getDb();
    if (!db) return;
    const insert = db.prepare("insert into itemsBought (itemId, price, amountbought, created_at) values (?,?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.price, item.amountBought, new Date().toISOString())
    })
}

export const addItemPrice = (itemPrice: IDbItemPrice): void => {
    const db = getDb();
    if (!db) return;
    const upsert = db.prepare(`
        insert into itemsPrices (itemId, by1, by10, by100, by1000, created_at)
        values (?, ?, ?, ?, ?, ?)
        on conflict(itemId) do update set
            by1 = excluded.by1,
            by10 = excluded.by10,
            by100 = excluded.by100,
            by1000 = excluded.by1000,
            created_at = excluded.created_at
    `)
    upsert.run(itemPrice.itemId, itemPrice.by1, itemPrice.by10, itemPrice.by100, itemPrice.by1000, new Date().toISOString())
    dbEvents.emit('price-updated');
}

export const addTax = (taxes: IDbTax[]) => {
    const db = getDb();
    if (!db) return;
    console.log("adding taxes", taxes);
    const insert = db.prepare("insert into taxes (tax_nature, value, created_at) values (?,?,?)");

    taxes.forEach(tax => {
        insert.run(tax.tax_nature, tax.value, new Date().toISOString())
    })
}

export const addPetItemXp = (itemId: number, xp: number) => {
    const db = getDb();
    if (!db) return;
    const upsert = db.prepare(`
        insert into PetItemXp (itemId, xp, created_at)
        values (?, ?, ?)
        on conflict(itemId) do update set
            xp = excluded.xp,
            created_at = excluded.created_at
    `)
    upsert.run(itemId, xp, new Date().toISOString())
}

export const getItemsBought = () => {
    const db = getDb();
    if (!db) return;
    const select = db.prepare(`
        select
            itemsBought.id,
            itemsBought.itemId,
            level,
            iconId,
            amountBought,
            price,
            de,en,fr,es,
            created_at
        from itemsBought
            left join itemNames
            on itemsBought.itemId = itemNames.itemId
            left join items
            on itemsBought.itemId = items.id`)
    const rows = select.all();
    return rows;
}
export const getItemsSold = (): IItemSold[] => {
    const db = getDb();
    if (!db) return;
    const select = db.prepare<IItemSold[], IItemSold>(`
        select
            itemsSold.id,
            itemsSold.itemId,
            level,
            iconId,
            amountSold,
            profit,
            de,en,fr,es,
            created_at
        from itemsSold
            left join itemNames
            on itemsSold.itemId = itemNames.itemId
            left join items
            on itemsSold.itemId = items.id`)
    const rows = select.all();
    return rows;

}

export const getTaxes = (): ITax[] => {
    const db = getDb();
    if (!db) return;
    const select = db.prepare<ITax[], ITax>(`
        select
            id,
            tax_nature,
            value,
            created_at
        from taxes`)
    const rows = select.all();
    return rows;
}
export interface IItemSearchResult {
    itemId: number;
    name: string;
    description?: string;
    level:number;
    iconId: number;
}

// SQLite LIKE is case-insensitive for ASCII. Accent-insensitive matching is
// done in JS below via Unicode normalization, so no ICU extension is needed.
// It might be best to find a way to optimise this in the future if performance becomes an issue.
export const searchItems = (query: string): IItemSearchResult[] => {
    const db = getDb();
    if (!db) return [];
    const select = db.prepare<[string], IItemSearchResult>(`
        SELECT n.itemId, n.fr name, i.iconId, i.level, d.fr description
        FROM itemNames n
        LEFT JOIN items i ON n.itemId = i.id
        LEFT JOIN Categories  c  ON i.typeId = c.id
        LEFT JOIN itemDescriptions d on d.itemId = n.itemId
        WHERE c.superTypeId == ${superTypeByName.get("Ressource")?.id}
        AND n.fr LIKE '%' || ? || '%'
        LIMIT 5
    `);
    const normalized = query.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const rows = select.all(query);
    const collator = new Intl.Collator('fr', { sensitivity: 'base' });

    const q = normalized.toLowerCase();

    rows.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);

        if (aStarts !== bStarts) {
            return aStarts ? -1 : 1;
        }

        return collator.compare(aName, bName);
    });
    // Secondary filter: accent-insensitive match so "epi" finds "Épi de blé"
    return rows.filter(row =>
        row.name.normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .includes(normalized.toLowerCase())
    );
};

interface IPetItemXpRatioRaw {
    itemId: number;
    name: string;
    xp: number;
    by1: number | null;
    by10: number | null;
    by100: number | null;
    by1000: number | null;
    created_at: string | null;
}

export interface IPetItemXpRatio {
    itemId: number;
    iconId?: number;
    name: string;
    xp: number;
    by1: number | null;
    by10: number | null;
    by100: number | null;
    by1000: number | null;
    xpPerKama_by1: number | null;
    xpPerKama_by10: number | null;
    xpPerKama_by100: number | null;
    xpPerKama_by1000: number | null;
    bestXpRatio?: number;
    created_at?: Date;
}

const ratio = (xp: number, price: number | null, qty: number): number | null =>
    price ? (xp / price) * qty : null;

export const getPetItemXpRatios = (): IPetItemXpRatio[] => {
    const db = getDb();
    if (!db) return [];
    const select = db.prepare<[], IPetItemXpRatioRaw>(`
        SELECT
            p.itemId,
            i.iconId,
            n.fr  AS name,
            p.xp,
            pr.by1,
            pr.by10,
            pr.by100,
            pr.by1000,
            pr.created_at
        FROM PetItemXp p
        LEFT  JOIN itemsPrices pr ON p.itemId = pr.itemId
        LEFT  JOIN itemNames   n  ON p.itemId = n.itemId
        LEFT  JOIN items       i  ON p.itemId = i.id
    `);
    return select.all()
        .map(row => ({
            ...row,
            xpPerKama_by1: ratio(row.xp, row.by1, 1),
            xpPerKama_by10: ratio(row.xp, row.by10, 10),
            xpPerKama_by100: ratio(row.xp, row.by100, 100),
            xpPerKama_by1000: ratio(row.xp, row.by1000, 1000),
            bestXpRatio: Math.max(
                ratio(row.xp, row.by1, 1) ?? -Infinity,
                ratio(row.xp, row.by10, 10) ?? -Infinity,
                ratio(row.xp, row.by100, 100) ?? -Infinity,
                ratio(row.xp, row.by1000, 1000) ?? -Infinity,
            ),
            created_at: row.created_at ? new Date(row.created_at) : undefined,
        }))
        .sort((a, b) => (b.xpPerKama_by1 ?? -Infinity) - (a.xpPerKama_by1 ?? -Infinity));
}

export const itemIdNameMap = new Map<number, string>();
export const itemIdSet = new Set<number>();
export const getItemsRaw = (): Promise<boolean> => {
    const db = getDb();
    if (!db) return;
    return new Promise((resolve) => {
        const select = db.prepare(`
            select distinct itemId, fr from itemNames
            where fr is not null
            `)
        const rows = select.all();
        rows.forEach((row: any) => itemIdNameMap.set(row.itemId, row.fr));
        itemIdNameMap.forEach((name, id) => itemIdSet.add(id));
        console.log("Loaded item IDs:", itemIdSet.size);
        resolve(true);
    });
}

// Loaded once when the db is initialized
interface SuperType {
    id: number;
    className: string;
    fr: string;
    en: string;
    de: string;
    es: string;
    pt: string;
}
export const superTypeCache = new Map<number, SuperType>();
export const superTypeByName = new Map<string, SuperType>();
export const loadSuperTypes = async () => {
    const db = getDb();
    if (!db) return false;
    const rows = db.prepare(`
        SELECT st.id, st.className, stn.fr, stn.en, stn.de, stn.es, stn.pt
        FROM CategoriesSuperType st
        JOIN CategoriesSuperTypeNames stn ON stn.superTypeId = st.id
    `).all() as any[];
    for (const row of rows) {
        superTypeCache.set(row.id, row);
        superTypeByName.set(row.fr, row);
    }
    return true;
};


export const getTransactions = (): ITransaction[] => {
    const itemsSold = getItemsSold().map(mapSold);
    const itemsBought = getItemsBought().map(mapBought);
    const taxes = getTaxes().map(mapTax);
    const allTransactions = [...itemsSold, ...itemsBought, ...taxes].sort((a, b) => b.date.getTime() - a.date.getTime());
    return allTransactions
}




function mapSold(row: IItemSold): ITransaction {
    return {
        id: row.id,
        name: row.fr,
        type: "sold",
        date: new Date(row.created_at),
        amount: row.amountSold,
        value: row.profit, // already positive
        label: `Item #${row.itemId}`,
        itemId: row.itemId,
        iconId: row.iconId,
    };
}

function mapBought(row: IItemBought): ITransaction {
    return {
        id: row.id,
        type: "bought",
        name: row.fr,
        date: new Date(row.created_at),
        amount: row.amountBought,
        value: -row.price, // negative
        label: `Item #${row.itemId}`,
        itemId: row.itemId,
        iconId: row.iconId,
    };
}

function mapTax(row: ITax): ITransaction {
    return {
        id: row.id,
        type: "tax",
        name: `Tax #${row.tax_nature}`,
        date: new Date(row.created_at),
        amount: 1,
        value: -row.value, // negative
        label: row.tax_nature.toString(),
    };
}
