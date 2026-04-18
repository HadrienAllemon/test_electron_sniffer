import db from "./ensureDatabase"
import { IItemSold, IItemBought, ITransaction, ITax } from "../../interfaces";
import { IDbItemSold } from "@src/interfaces/dbReady/IDbItemSold";
import { IDbItemBought } from "@src/interfaces/dbReady/IDbItemBought";
import { IDbTax } from "@src/interfaces/dbReady/IDbTax";
import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";

export const selectItems = () => {
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
    if (!db) return;
    const insert = db.prepare("insert into itemsSold (itemId, profit, amountSold, created_at) values (?,?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.profit, item.amountSold, new Date().toISOString())
    })
}
export const addItemsBought = (items: IDbItemBought[]) => {
    if (!db) return;
    const insert = db.prepare("insert into itemsBought (itemId, price, amountbought, created_at) values (?,?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.price, item.amountBought, new Date().toISOString())
    })
}

export const addItemPrice = (itemPrice: IDbItemPrice): void => {
    if (!db) return;
    const upsert = db.prepare(`
        insert into itemsPrices (itemId, by1, by10, by100, created_at)
        values (?, ?, ?, ?, ?)
        on conflict(itemId) do update set
            by1 = excluded.by1,
            by10 = excluded.by10,
            by100 = excluded.by100,
            created_at = excluded.created_at
    `)
    upsert.run(itemPrice.itemId, itemPrice.by1, itemPrice.by10, itemPrice.by100, new Date().toISOString())
}

export const addTax = (taxes: IDbTax[]) => {
    if (!db) return;
    console.log("adding taxes", taxes);
    const insert = db.prepare("insert into taxes (tax_nature, value, created_at) values (?,?,?)");

    taxes.forEach(tax => {
        insert.run(tax.tax_nature, tax.value, new Date().toISOString())
    })
}

export const getItemsBought = () => {
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

export const getPetItemXpRatios = (): IPetItemXpRatio[][] => {
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
        ORDER BY xpPerKama_by1 DESC
    `);
    return select.all();
}

export const itemIdSet = new Set<number>();
export const getItemsIds = (): Promise<boolean> => {
    if (!db) return;
    return new Promise((resolve) => {
        const select = db.prepare(`select distinct itemId from itemNames`)
        const rows = select.all();
        rows.forEach((row: any) => itemIdSet.add(row.itemId));
        console.log("Loaded item IDs:", itemIdSet.size);
        resolve(true);
    });
}


export const getTransactions = (): ITransaction[] => {
    const itemsSold = getItemsSold().map(mapSold);
    const itemsBought = getItemsBought().map(mapBought);
    const taxes = getTaxes().map(mapTax);
    console.log(taxes);
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