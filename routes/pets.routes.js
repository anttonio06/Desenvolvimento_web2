const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

router.get('/pets', verificarAutenticacao, (req, res) => {
  db.all(`
    SELECT p.*, c.nome AS cliente_nome
    FROM pets p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ORDER BY p.nome ASC
  `, [], (err, pets) => {
    res.render('pets/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'pets',
      pets: err ? [] : pets
    });
  });
});

module.exports = router;
