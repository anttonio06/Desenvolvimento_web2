const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

function verificarAdmin(req, res, next) {
  if (req.session.usuario && req.session.usuario.permissoes === 'administrador') return next();
  return res.redirect('/dashboard');
}

// ── Listar todos os usuários/funcionários ─────────────────────────────────────

router.get('/funcionarios', verificarAutenticacao, verificarAdmin, (req, res) => {
  db.all(`
    SELECT u.id, u.nome, u.email, u.senha_texto, u.permissoes,
           f.id AS func_id, f.telefone, f.ativo
    FROM usuarios u
    LEFT JOIN funcionarios f ON f.usuario_id = u.id
    ORDER BY u.nome ASC
  `, [], (err, usuarios) => {
    res.render('funcionarios/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'funcionarios',
      usuarios: err ? [] : usuarios
    });
  });
});

// ── Criar funcionário ─────────────────────────────────────────────────────────

router.post('/funcionarios', verificarAutenticacao, verificarAdmin, async (req, res) => {
  const { nome, telefone, email, senha } = req.body;

  if (!nome || !nome.trim())      return res.json({ ok: false, erro: 'nome_obrigatorio' });
  if (!email || !email.trim())    return res.json({ ok: false, erro: 'email_obrigatorio' });
  if (!senha || senha.length < 6) return res.json({ ok: false, erro: 'senha_curta' });

  db.get('SELECT id FROM usuarios WHERE email = ?', [email.trim()], async (err, row) => {
    if (row) return res.json({ ok: false, erro: 'email_duplicado' });

    const senhaHash = await bcrypt.hash(senha, 10);

    db.run(
      'INSERT INTO usuarios (nome, email, senha, senha_texto, permissoes) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), email.trim(), senhaHash, senha, 'funcionario'],
      function(err) {
        if (err) return res.json({ ok: false, erro: 'erro_db' });

        const usuarioId = this.lastID;
        db.run(
          'INSERT INTO funcionarios (nome, telefone, email, usuario_id, ativo) VALUES (?, ?, ?, ?, 1)',
          [nome.trim(), telefone ? telefone.trim() : null, email.trim(), usuarioId],
          function(err2) {
            if (err2) {
              db.run('DELETE FROM usuarios WHERE id = ?', [usuarioId]);
              return res.json({ ok: false, erro: 'erro_db' });
            }
            res.json({ ok: true });
          }
        );
      }
    );
  });
});

// ── Editar funcionário ────────────────────────────────────────────────────────

router.put('/funcionarios/:id', verificarAutenticacao, verificarAdmin, async (req, res) => {
  const { nome, telefone, ativo, nova_senha } = req.body;
  const usuarioId = req.params.id;

  if (!nome || !nome.trim()) return res.json({ ok: false, erro: 'nome_obrigatorio' });

  db.run('UPDATE usuarios SET nome=? WHERE id=?', [nome.trim(), usuarioId], async (err) => {
    if (err) return res.json({ ok: false });

    if (nova_senha && nova_senha.length >= 6) {
      const hash = await bcrypt.hash(nova_senha, 10);
      db.run('UPDATE usuarios SET senha=?, senha_texto=? WHERE id=?', [hash, nova_senha, usuarioId]);
    }

    db.run(
      'UPDATE funcionarios SET nome=?, telefone=?, ativo=? WHERE usuario_id=?',
      [nome.trim(), telefone ? telefone.trim() : null, ativo !== undefined ? ativo : 1, usuarioId],
      (err2) => res.json({ ok: !err2 })
    );
  });
});

// ── Agendamentos do funcionário ───────────────────────────────────────────────

router.get('/funcionarios/:id/agendamentos', verificarAutenticacao, verificarAdmin, (req, res) => {
  db.get('SELECT id FROM funcionarios WHERE usuario_id = ?', [req.params.id], (err, row) => {
    if (!row) return res.json({ ok: true, agendamentos: [] });

    db.all(`
      SELECT a.id, a.data_hora, a.status,
             c.nome AS cliente_nome,
             p.nome AS pet_nome,
             GROUP_CONCAT(s.nome, ', ') AS servicos_nomes
      FROM agendamentos a
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN agendamento_servicos ag_s ON ag_s.agendamento_id = a.id
      LEFT JOIN servicos s ON s.id = ag_s.servico_id
      WHERE a.funcionario_id = ? AND a.status != 'cancelado'
      GROUP BY a.id
      ORDER BY a.data_hora ASC
    `, [row.id], (err2, agendamentos) => {
      res.json({ ok: !err2, agendamentos: err2 ? [] : agendamentos });
    });
  });
});

// ── Excluir usuário/funcionário ───────────────────────────────────────────────

router.delete('/funcionarios/:id', verificarAutenticacao, verificarAdmin, (req, res) => {
  const usuarioId = req.params.id;

  db.get('SELECT id FROM funcionarios WHERE usuario_id = ?', [usuarioId], (err, row) => {
    if (row) {
      db.run('UPDATE agendamentos SET funcionario_id = NULL WHERE funcionario_id = ?', [row.id]);
      db.run('DELETE FROM funcionarios WHERE id = ?', [row.id]);
    }
    db.run('DELETE FROM usuarios WHERE id = ?', [usuarioId], (err2) => {
      res.json({ ok: !err2 });
    });
  });
});

// ── Redireciona /emails para /funcionarios ────────────────────────────────────

router.get('/emails', verificarAutenticacao, (req, res) => {
  res.redirect('/funcionarios');
});

module.exports = router;
