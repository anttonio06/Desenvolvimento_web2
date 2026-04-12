const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'petagenda.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar no SQLite:', err.message);
  } else {
    console.log('Conectado ao banco SQLite.');
    db.run('PRAGMA foreign_keys = ON');
  }
});

module.exports = db;