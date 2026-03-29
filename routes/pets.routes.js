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
    db.all('SELECT id, nome FROM clientes ORDER BY nome ASC', [], (err2, clientes) => {
      res.render('pets/index', {
        usuario: req.session.usuario,
        paginaAtiva: 'pets',
        pets: err ? [] : pets,
        clientes: err2 ? [] : clientes
      });
    });
  });
});

router.post('/pets', verificarAutenticacao, (req, res) => {
  const { nome, especie, raca, porte, cliente_id } = req.body;
  if (!nome || !nome.trim() || !especie) {
    return res.redirect('/pets');
  }
  db.run(
    'INSERT INTO pets (nome, especie, raca, porte, cliente_id) VALUES (?, ?, ?, ?, ?)',
    [nome.trim(), especie, raca || null, porte || null, cliente_id || null],
    (err) => {
      res.redirect('/pets');
    }
  );
});

router.delete('/pets/:id', verificarAutenticacao, (req, res) => {
  db.run('DELETE FROM pets WHERE id = ?', [req.params.id], (err) => {
    res.json({ ok: !err });
  });
});

module.exports = router;
