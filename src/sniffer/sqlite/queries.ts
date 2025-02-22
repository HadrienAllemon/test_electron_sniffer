import db from "./ensureDatabase"
import { itemBought, itemSold, tax } from "../interpretMessage/takeAction";
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
    const insert = db.prepare("insert into itemsSold (item_id, profit, amountSold) values (?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.profit, item.amountSold)
    })
    insert.all();
}
export const addItemsBought = (items: itemBought[]) => {
    if (!db) return;
    const insert = db.prepare("insert into itemsBought (item_id, price, amountbought) values (?,?,?)")

    items.forEach(item => {
        insert.run(item.itemId, item.price, item.amountBought)
    })
    insert.all();
}

export const addTax = (taxes: tax[]) => {
    if (!db) return;
    const insert = db.prepare("insert into taxes (tax_nature, value) values (?,?)");

    taxes.forEach(tax => {
        insert.run(tax.tax_nature, tax.value)
    })
    insert.all();
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
export const getItemsSold = () => {
    if (!db) return;
    const select = db.prepare(`
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
