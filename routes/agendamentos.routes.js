const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

router.get('/agendamentos', verificarAutenticacao, (req, res) => {
  db.all(`
    SELECT a.*,
           c.nome AS cliente_nome,
           p.nome AS pet_nome,
           s.nome AS servico_nome
    FROM agendamentos a
    LEFT JOIN clientes c ON a.cliente_id = c.id
    LEFT JOIN pets p ON a.pet_id = p.id
    LEFT JOIN servicos s ON a.servico_id = s.id
    ORDER BY a.data_hora ASC
  `, [], (err, agendamentos) => {
    res.render('agendamentos/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'agendamentos',
      agendamentos: err ? [] : agendamentos
    });
  });
});

module.exports = router;
