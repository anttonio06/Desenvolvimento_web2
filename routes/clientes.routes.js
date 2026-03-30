const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

const telPattern = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;

router.get('/clientes', verificarAutenticacao, (req, res) => {
  db.all('SELECT * FROM clientes ORDER BY nome ASC', [], (err, clientes) => {
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

  db.get('SELECT id FROM clientes WHERE telefone = ?', [telValido], (err, rowTel) => {
    if (rowTel) return res.redirect('/clientes?erro=telefone_duplicado');
    db.get('SELECT id FROM clientes WHERE email = ?', [emailValido], (err2, rowEmail) => {
      if (rowEmail) return res.redirect('/clientes?erro=email_duplicado');
      db.run(
        'INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)',
        [nome.trim(), telValido, emailValido],
        () => res.redirect('/clientes')
      );
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

router.delete('/clientes/:id', verificarAutenticacao, (req, res) => {
  db.run('DELETE FROM pets WHERE cliente_id = ?', [req.params.id], (err) => {
    if (err) return res.json({ ok: false });
    db.run('DELETE FROM clientes WHERE id = ?', [req.params.id], (err2) => {
      res.json({ ok: !err2 });
    });
  });
});

module.exports = router;
