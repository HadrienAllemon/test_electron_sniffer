import sqlite3  from "sqlite3";
import db from "./ensureDatabase"
import { itemBought, itemSold, tax } from "../interpretMessage/takeAction";
export const selectItems = () => {
    if (!db) return;
    db.all(`select * from itemsSold`, "", (err:any, rows:any) => {
        rows.forEach((row:any) => {
            console.log(row.item_id + "\t" +
            row.amountSold + "\t" +
            row.profit);
        });
    });
}
export const addItemsSold = (items:itemSold[]) => {
    if (!db) return;
    const insert = db.prepare("insert into itemsSold (item_id, profit, amountSold) values (?,?,?)")
    
    items.forEach(item => {
        insert.run(item.itemId, item.profit, item.amountSold)
    })
    insert.finalize();
}
export const addItemsBought = (items:itemBought[]) => {
    if (!db) return;
    const insert = db.prepare("insert into itemsBought (item_id, price, amountbought) values (?,?,?)")
    
    items.forEach(item => {
        insert.run(item.itemId, item.price, item.amountBought)
    })
    insert.finalize();
}

export const addTax = (taxes:tax[]) => {
    if (!db) return;
    const insert = db.prepare("insert into taxes (tax_nature, value) values (?,?)");
    
    taxes.forEach(tax => {
        insert.run(tax.tax_nature, tax.value)
    })
    insert.finalize();
}

