import sqlite3 from "sqlite3";
import fs from "node:fs"

let db: sqlite3.Database = new sqlite3.Database('./db/itemsHistory.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err && err.message == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
    } else if (err) {
        console.log("Getting error " + err);
    }
    createTables(db)
    addItemsIdToDb()
    // runQueries(db);
});
export const ensureDB = () => {
    db = new sqlite3.Database('./itemsHistory.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err && err.message == "SQLITE_CANTOPEN") {
            createDatabase();
            return;
        } else if (err) {
            console.log("Getting error " + err);
        }
        // runQueries(db);
    });
}

const createDatabase = () => {
    var db = new sqlite3.Database('db/itemsHistory.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            return (1);
        }
        console.log("CREATING TABLE");
        createTables(db);
    });
    console.log("DATABASE CREATED")

}

function createTables(db: sqlite3.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS itemsSold (
        id INTEGER PRIMARY KEY ,
        item_id int not null,
        amountSold int not null,
        profit int not null
    )`, err => {
        if (err) console.log(err)
    });
    db.exec(`
        CREATE TABLE IF NOT EXISTS itemsBought (
            id INTEGER PRIMARY KEY ,
            item_id int not null,
            amountBought int not null,
            price int not null
        )`, err => {
            if (err) console.log(err)
        });
    db.exec(`
    CREATE TABLE IF NOT EXISTS taxes (
        id INTEGER PRIMARY KEY ,
        tax_nature int not null,
        value int not null
    )`, err => {
        if (err) console.log(err)
    });
    db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY ,
            typeId integer not null
        )`, err => {
        if (err) console.log(err)
    });
    db.exec(`
        CREATE TABLE IF NOT EXISTS itemDescriptions (
            id INTEGER PRIMARY KEY ,
            itemId smallint not null,
            pt text,
            de text,
            en text,
            fr text,
            es text
        )`, err => {
        if (err) console.log(err)
    });
    db.exec(`
        CREATE TABLE IF NOT EXISTS itemNames (
            id INTEGER PRIMARY KEY ,
            itemId integer not null,
            pt text,
            de text,
            en text,
            fr text,
            es text
        )`, err => {
        if (err) console.log(err)
    });

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_item_id ON items(id);
        CREATE INDEX IF NOT EXISTS idx_type_id ON items(typeId);
        CREATE INDEX IF NOT EXISTS idx_item_description_item_id ON itemDescriptions(itemId);
        CREATE INDEX IF NOT EXISTS idx_item_name_item_id ON itemNames(itemId);
    `);
    console.log("TABLE CREATED")
}

const addItemsIdToDb = (index = 0) => {
    if (fs.existsSync(`./items/items${index}.json`)) {
        console.log("start reading", `./items/items${index}.json`);
        fs.readFile(`./items/items${index}.json`, 'utf8', (err, data) => {
            const items: any[] = JSON.parse(data);
            const insertId = db.prepare("insert or ignore into items (id, typeId) values (?,?)")
            const insertDescription = db.prepare("insert or ignore into itemDescriptions (id, itemId, pt, de, en, fr, es) values (?,?,?,?,?,?,?)")
            const insertName = db.prepare("insert or ignore into itemNames (id, itemId, pt, de, en, fr, es) values (?,?,?,?,?,?,?)")
            for (let i = 0; i < items.length; i++) {
                insertId.run(items[i].id, items[i].typeId)
                insertDescription.run(items[i].description.id, items[i].id, items[i].description.pt, items[i].description.de, items[i].description.en, items[i].description.fr, items[i].description.es)
                insertName.run(items[i].name.id, items[i].id, items[i].name.pt, items[i].name.de, items[i].name.en, items[i].name.fr, items[i].name.es)
            }
        })
        addItemsIdToDb(index+1)
    } else {
        console.log("no such file ", `./items/items${index}.json`)
        return
    }
};



export default db;

