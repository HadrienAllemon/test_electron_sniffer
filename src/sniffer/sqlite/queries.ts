import db from "./ensureDatabase"
import { itemBought, itemSold, tax } from "../interpretMessage/takeAction";
import { IItemSold, IItemBought, ITransaction, ITax } from "../../interfaces";

export const selectItems = () => {
    if (!db) return;
    const select = db.prepare(`select * from itemsSold`)
    let rows = select.all()
    rows.forEach((row: any) => {
        console.log(row.item_id + "\t" +
            row.amountSold + "\t" +
            row.profit);
    });
}
export const addItemsSold = (items: itemSold[]) => {
    if (!db) return;
    const insert = db.prepare("insert into itemsSold (item_id, profit, amountSold, created_at) values (?,?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.profit, item.amountSold, new Date().toISOString())
    })
}
export const addItemsBought = (items: itemBought[]) => {
    if (!db) return;
    const insert = db.prepare("insert into itemsBought (item_id, price, amountbought, created_at) values (?,?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.price, item.amountBought, new Date().toISOString())
    })
}

export const addTax = (taxes: tax[]) => {
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
            item_id, 
            level, 
            iconId, 
            amountBought, 
            price, 
            de,en,fr,es,
            created_at
        from itemsBought 
            left join itemNames
            on itemsBought.item_id = itemNames.itemId
            left join items 
            on itemsBought.item_id = items.id`)
    const rows = select.all();
    return rows;
}
export const getItemsSold = (): IItemSold[] => {
    if (!db) return;
    const select = db.prepare<IItemSold[], IItemSold>(`
        select 
            itemsSold.id, 
            item_id, 
            level, 
            iconId, 
            amountSold, 
            profit, 
            de,en,fr,es,
            created_at
        from itemsSold 
            left join itemNames
            on itemsSold.item_id = itemNames.itemId
            left join items 
            on itemsSold.item_id = items.id`)
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
        label: `Item #${row.item_id}`,
        itemId: row.item_id,
        iconId:row.iconId,
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
        label: `Item #${row.item_id}`,
        itemId: row.item_id,
        iconId:row.iconId,
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