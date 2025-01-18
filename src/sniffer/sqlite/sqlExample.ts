var sqlite3 = require('sqlite3');
export let mcudb= new sqlite3.Database('db/mcu.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err:any) => {
    console.log(err);
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err);
            return (1);
    }
    runQueries(mcudb);
});

function createDatabase() {
    console.log("CREATING MCU DATABASE")
    var newdb = new sqlite3.Database('mcu.db', (err:any) => {
        if (err) {
            console.log("Getting error " + err);
            return (1);
        }
        createTables(newdb);
    });
}

function createTables(newdb:any) {
    newdb.exec(`
    create table hero (
        hero_id int primary key not null,
        hero_name text not null,
        is_xman text not null,
        was_snapped text not null
    );
    insert into hero (hero_id, hero_name, is_xman, was_snapped)
        values (1, 'Spiderman', 'N', 'Y'),
               (2, 'Tony Stark', 'N', 'N'),
               (3, 'Jean Grey', 'Y', 'N');

    create table hero_power (
        hero_id int not null,
        hero_power text not null
    );

    insert into hero_power (hero_id, hero_power)
        values (1, 'Web Slinging'),
               (1, 'Super Strength'),
               (1, 'Total Nerd'),
               (2, 'Total Nerd'),
               (3, 'Telepathic Manipulation'),
               (3, 'Astral Projection');
        `, ()  => {
            runQueries(newdb);
    });
}

function runQueries(db:any) {
    db.all(`select hero_name, is_xman, was_snapped from hero h
   inner join hero_power hp on h.hero_id = hp.hero_id
   where hero_power = ?`, "Total Nerd", (err:any, rows:any) => {
        rows.forEach((row:any) => {
            console.log(row.hero_name + "\t" +row.is_xman + "\t" +row.was_snapped);
        });
    });
}