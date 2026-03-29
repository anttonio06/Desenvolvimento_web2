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

module.exports = router;
