const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

router.get('/clientes', verificarAutenticacao, (req, res) => {
  db.all('SELECT * FROM clientes ORDER BY nome ASC', [], (err, clientes) => {
    res.render('clientes/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'clientes',
      clientes: err ? [] : clientes
    });
  });
});

router.post('/clientes', verificarAutenticacao, (req, res) => {
  const { nome, telefone, email } = req.body;
  if (!nome || !nome.trim()) {
    return res.redirect('/clientes');
  }
  db.run(
    'INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)',
    [nome.trim(), telefone || null, email || null],
    (err) => {
      res.redirect('/clientes');
    }
  );
});

router.delete('/clientes/:id', verificarAutenticacao, (req, res) => {
  db.run('DELETE FROM clientes WHERE id = ?', [req.params.id], (err) => {
    res.json({ ok: !err });
  });
});

module.exports = router;
