const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

const telPattern = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

router.get('/clientes', verificarAutenticacao, (req, res) => {
  db.all(`
    SELECT c.*,
      COUNT(p.id) AS total_pets,
      GROUP_CONCAT(p.nome, ', ') AS nomes_pets
    FROM clientes c
    LEFT JOIN pets p ON p.cliente_id = c.id
    WHERE c.email IS NULL
       OR c.email = ''
       OR c.email NOT IN (SELECT email FROM funcionarios WHERE email IS NOT NULL AND email != '')
    GROUP BY c.id
    ORDER BY c.nome ASC
  `, [], (err, clientes) => {
    res.render('clientes/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'clientes',
      clientes: err ? [] : clientes,
      erro: req.query.erro || null
    });
  });
});

router.post('/clientes', verificarAutenticacao, (req, res) => {
  const { nome, telefone, email } = req.body;
  const telValido = telefone && telefone.trim() ? telefone.trim() : null;
  const emailValido = email && email.trim() ? email.trim() : null;

  if (!nome || !nome.trim() || !telValido || !telPattern.test(telValido) || !emailValido || !emailPattern.test(emailValido)) {
    return res.redirect('/clientes');
  }

  db.get('SELECT id FROM funcionarios WHERE email = ?', [emailValido], (err0, rowFunc) => {
    if (rowFunc) return res.json({ ok: false, erro: 'email_funcionario' });
    db.get('SELECT id FROM clientes WHERE telefone = ?', [telValido], (err, rowTel) => {
      if (rowTel) return res.json({ ok: false, erro: 'telefone_duplicado' });
      db.get('SELECT id FROM clientes WHERE email = ?', [emailValido], (err2, rowEmail) => {
        if (rowEmail) return res.json({ ok: false, erro: 'email_duplicado' });
        db.run(
          'INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)',
          [nome.trim(), telValido, emailValido],
          (err3) => res.json({ ok: !err3 })
        );
      });
    });
  });
});

router.put('/clientes/:id', verificarAutenticacao, (req, res) => {
  const { nome, telefone, email } = req.body;
  const telValido = telefone && telefone.trim() ? telefone.trim() : null;
  const emailValido = email && email.trim() ? email.trim() : null;

  if (!nome || !nome.trim() || !telValido || !telPattern.test(telValido) || !emailValido || !emailPattern.test(emailValido)) {
    return res.json({ ok: false, erro: 'dados_invalidos' });
  }

  db.get('SELECT id FROM clientes WHERE telefone = ? AND id != ?', [telValido, req.params.id], (err, rowTel) => {
    if (rowTel) return res.json({ ok: false, erro: 'telefone_duplicado' });
    db.get('SELECT id FROM clientes WHERE email = ? AND id != ?', [emailValido, req.params.id], (err2, rowEmail) => {
      if (rowEmail) return res.json({ ok: false, erro: 'email_duplicado' });
      db.run(
        'UPDATE clientes SET nome = ?, telefone = ?, email = ? WHERE id = ?',
        [nome.trim(), telValido, emailValido, req.params.id],
        (err3) => res.json({ ok: !err3 })
      );
    });
  });
});

router.get('/clientes/:id/pets', verificarAutenticacao, (req, res) => {
  db.all(
    'SELECT id, nome, especie, raca, porte FROM pets WHERE cliente_id = ? ORDER BY nome ASC',
    [req.params.id],
    (err, pets) => res.json({ ok: !err, pets: err ? [] : pets })
  );
});

router.delete('/clientes/:id', verificarAutenticacao, (req, res) => {
  const id = req.params.id;
  db.run(
    `DELETE FROM agendamento_servicos WHERE agendamento_id IN (
       SELECT a.id FROM agendamentos a
       INNER JOIN pets p ON a.pet_id = p.id
       WHERE p.cliente_id = ?
     )`, [id], (err1) => {
    if (err1) return res.json({ ok: false });
    db.run(
      'DELETE FROM agendamentos WHERE pet_id IN (SELECT id FROM pets WHERE cliente_id = ?)',
      [id], (err2) => {
      if (err2) return res.json({ ok: false });
      db.run('DELETE FROM pets WHERE cliente_id = ?', [id], (err3) => {
        if (err3) return res.json({ ok: false });
        db.run('DELETE FROM clientes WHERE id = ?', [id], (err4) => {
          res.json({ ok: !err4 });
        });
      });
    });
  });
});

module.exports = router;
