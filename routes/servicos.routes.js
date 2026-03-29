const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

router.get('/servicos', verificarAutenticacao, (req, res) => {
  db.all('SELECT * FROM servicos ORDER BY nome ASC', [], (err, servicos) => {
    res.render('servicos/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'servicos',
      servicos: err ? [] : servicos
    });
  });
});

module.exports = router;
