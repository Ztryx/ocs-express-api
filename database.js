const path = require("path");
let sqlite3 = require('sqlite3').verbose();

const db_name = path.resolve(__dirname, "ocs_athletes.db");

const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err);
    }
});

module.exports = db;