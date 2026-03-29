const bcrypt = require('bcrypt');
const db = require('./db');

db.serialize(async () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      permissoes TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      especie TEXT NOT NULL,
      raca TEXT,
      porte TEXT,
      cliente_id INTEGER,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      duracao_min INTEGER,
      preco REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      pet_id INTEGER,
      servico_id INTEGER,
      data_hora DATETIME NOT NULL,
      status TEXT DEFAULT 'pendente',
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (pet_id) REFERENCES pets(id),
      FOREIGN KEY (servico_id) REFERENCES servicos(id)
    )
  `);

  const senhaHash = await bcrypt.hash('123456', 10);

  db.get('select * from usuarios where email = ?', ['admin@petagenda.com'], (err, row) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return;
    }

    if (!row) {
      db.run(
        'insert into usuarios (nome, email, senha, permissoes) values (?, ?, ?, ?)',
        ['Administrador', 'admin@petagenda.com', senhaHash, 'administrador'],
        (insertErr) => {
          if (insertErr) {
            console.error('Erro ao inserir usuário inicial:', insertErr.message);
          } else {
            console.log('Usuário inicial criado com sucesso.');
          }
        }
      );
    } else {
      console.log('Usuário inicial já existe.');
    }
  });
});