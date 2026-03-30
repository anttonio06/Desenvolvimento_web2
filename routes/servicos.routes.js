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

router.put('/servicos/:id', verificarAutenticacao, (req, res) => {
  const { duracao_min, preco_pequeno, preco_medio, preco_grande } = req.body;
  db.run(
    'UPDATE servicos SET duracao_min = ?, preco_pequeno = ?, preco_medio = ?, preco_grande = ? WHERE id = ?',
    [duracao_min, preco_pequeno, preco_medio, preco_grande, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ ok: true });
    }
  );
});

module.exports = router;
