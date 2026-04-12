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
  if (!nome || !nome.trim() || !especie || !raca || !porte || !cliente_id) {
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

router.put('/pets/:id', verificarAutenticacao, (req, res) => {
  const { nome, especie, raca, porte, cliente_id } = req.body;
  if (!nome || !nome.trim() || !especie || !raca || !porte || !cliente_id) {
    return res.json({ ok: false, erro: 'Campos obrigatórios faltando' });
  }
  db.run(
    'UPDATE pets SET nome = ?, especie = ?, raca = ?, porte = ?, cliente_id = ? WHERE id = ?',
    [nome.trim(), especie, raca || null, porte || null, cliente_id || null, req.params.id],
    (err) => res.json({ ok: !err })
  );
});

router.delete('/pets/:id', verificarAutenticacao, (req, res) => {
  const id = req.params.id;
  db.run(
    'DELETE FROM agendamento_servicos WHERE agendamento_id IN (SELECT id FROM agendamentos WHERE pet_id = ?)',
    [id], (err1) => {
    if (err1) return res.json({ ok: false });
    db.run('DELETE FROM agendamentos WHERE pet_id = ?', [id], (err2) => {
      if (err2) return res.json({ ok: false });
      db.run('DELETE FROM pets WHERE id = ?', [id], (err3) => {
        res.json({ ok: !err3 });
      });
    });
  });
});

module.exports = router;
