const express = require('express');
const db = require('../database/db');
const { verificarAutenticacao } = require('../middleware/controleLogin.middleware');

const router = express.Router();

// ── helpers ──────────────────────────────────────────────────────────────────

function carregarFormData(cb) {
  db.all(`
    SELECT p.id, p.nome, p.porte, p.especie, c.nome AS cliente_nome, c.id AS cliente_id
    FROM pets p LEFT JOIN clientes c ON p.cliente_id = c.id ORDER BY p.nome ASC
  `, [], (e1, pets) => {
    db.all('SELECT * FROM servicos ORDER BY nome ASC', [], (e2, servicos) => {
      db.all('SELECT * FROM funcionarios WHERE ativo = 1 ORDER BY nome ASC', [], (e3, funcionarios) => {
        cb(e1 ? [] : pets, e2 ? [] : servicos, e3 ? [] : funcionarios);
      });
    });
  });
}

function normalizarServicos(raw) {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function calcularValores(servicosSelecionados, pet) {
  const porteColors = { 'Pequeno': 'preco_pequeno', 'Médio': 'preco_medio', 'Grande': 'preco_grande' };
  const campoPreco = porteColors[pet.porte] || 'preco_medio';

  let subtotal = 0;
  const itens = servicosSelecionados.map(s => {
    const preco = parseFloat(s[campoPreco]) || 0;
    subtotal += preco;
    return { servico: s, preco };
  });

  const desconto = 0;
  const valorFinal = Math.round(subtotal * 100) / 100;

  return { itens, subtotal, desconto, valorFinal };
}

// ── Listar agendamentos ───────────────────────────────────────────────────────

router.get('/agendamentos', verificarAutenticacao, (req, res) => {
  db.all(`
    SELECT a.*,
           c.nome AS cliente_nome,
           p.nome AS pet_nome,
           p.porte AS pet_porte,
           GROUP_CONCAT(s.nome, ', ') AS servicos_nomes,
           f.nome AS funcionario_nome
    FROM agendamentos a
    LEFT JOIN clientes c ON a.cliente_id = c.id
    LEFT JOIN pets p ON a.pet_id = p.id
    LEFT JOIN agendamento_servicos ag_s ON ag_s.agendamento_id = a.id
    LEFT JOIN servicos s ON s.id = ag_s.servico_id
    LEFT JOIN funcionarios f ON f.id = a.funcionario_id
    GROUP BY a.id
    ORDER BY a.data_hora DESC
  `, [], (err, agendamentos) => {
    res.render('agendamentos/index', {
      usuario: req.session.usuario,
      paginaAtiva: 'agendamentos',
      agendamentos: err ? [] : agendamentos
    });
  });
});

// ── Formulário novo agendamento ───────────────────────────────────────────────

router.get('/agendamentos/novo', verificarAutenticacao, (req, res) => {
  carregarFormData((pets, servicos, funcionarios) => {
    res.render('agendamentos/novo', {
      usuario: req.session.usuario,
      paginaAtiva: 'agendamentos',
      pets, servicos, funcionarios, erro: null
    });
  });
});

// ── Criar agendamento ─────────────────────────────────────────────────────────

router.post('/agendamentos', verificarAutenticacao, (req, res) => {
  const { pet_id, data, hora, observacoes, funcionario_id } = req.body;
  const servicosIds = normalizarServicos(req.body.servicos);

  const renderErro = (erro) => {
    carregarFormData((pets, servicos, funcionarios) => {
      res.render('agendamentos/novo', {
        usuario: req.session.usuario, paginaAtiva: 'agendamentos',
        pets, servicos, funcionarios, erro
      });
    });
  };

  if (!pet_id || !data || !hora || servicosIds.length === 0) {
    return renderErro('Selecione o pet, ao menos um serviço, data e horário.');
  }

  const hoje = new Date().toISOString().split('T')[0];
  if (data < hoje) return renderErro('Não é possível agendar em uma data que já passou.');

  const data_hora = `${data} ${hora}:00`;
  const slotHora = `${data} ${hora.split(':')[0]}`;

  // Limite de 3 agendamentos por horário
  db.get(
    `SELECT COUNT(*) AS count FROM agendamentos WHERE strftime('%Y-%m-%d %H', data_hora) = ? AND status != 'cancelado'`,
    [slotHora],
    (err, row) => {
      if (!err && row && row.count >= 3) {
        return renderErro('Horário lotado! Já existem 3 agendamentos nesse horário. Escolha outro.');
      }

      // Impede o mesmo pet com os mesmos serviços no mesmo dia/hora
      const placeholdersServ = servicosIds.map(() => '?').join(',');
      db.get(
        `SELECT COUNT(*) AS count
         FROM agendamentos a
         JOIN agendamento_servicos ag_s ON ag_s.agendamento_id = a.id
         WHERE a.pet_id = ?
           AND strftime('%Y-%m-%d %H', a.data_hora) = ?
           AND ag_s.servico_id IN (${placeholdersServ})
           AND a.status != 'cancelado'`,
        [pet_id, slotHora, ...servicosIds],
        (err, dupRow) => {
          if (!err && dupRow && dupRow.count > 0) {
            return renderErro('Este pet já possui agendamento com o(s) mesmo(s) serviço(s) nesse dia e horário.');
          }

      db.get('SELECT p.*, c.id AS cliente_id FROM pets p LEFT JOIN clientes c ON p.cliente_id = c.id WHERE p.id = ?', [pet_id], (err, pet) => {
        if (err || !pet) return renderErro('Pet não encontrado.');

        const placeholders = servicosIds.map(() => '?').join(',');
        db.all(`SELECT * FROM servicos WHERE id IN (${placeholders})`, servicosIds, (err, servicosSel) => {
          if (err || !servicosSel.length) return renderErro('Serviço inválido.');

          const nomes = servicosSel.map(s => s.nome.toLowerCase().trim());
          const temBanho = nomes.includes('banho');
          if ((nomes.includes('tosa') || nomes.includes('hidratação')) && !temBanho) {
            return renderErro('Tosa e Hidratação só podem ser agendados junto com Banho.');
          }

          const { subtotal, desconto, valorFinal } = calcularValores(servicosSel, pet);

          const funcId = funcionario_id && parseInt(funcionario_id) > 0 ? parseInt(funcionario_id) : null;
          db.run(
            `INSERT INTO agendamentos (cliente_id, pet_id, data_hora, status, observacoes, valor, desconto, funcionario_id) VALUES (?, ?, ?, 'confirmado', ?, ?, ?, ?)`,
            [pet.cliente_id, pet_id, data_hora, observacoes || null, valorFinal, desconto, funcId],
            function(err) {
              if (err) return renderErro('Erro ao salvar. Tente novamente.');

              const agId = this.lastID;
              const porteMap = { 'Pequeno': 'preco_pequeno', 'Médio': 'preco_medio', 'Grande': 'preco_grande' };
              const campoPreco = porteMap[pet.porte] || 'preco_medio';

              const stmts = servicosSel.map(s =>
                new Promise((resolve, reject) => {
                  db.run(
                    `INSERT INTO agendamento_servicos (agendamento_id, servico_id, valor) VALUES (?, ?, ?)`,
                    [agId, s.id, parseFloat(s[campoPreco]) || 0],
                    err => err ? reject(err) : resolve()
                  );
                })
              );

              Promise.all(stmts)
                .then(() => res.redirect('/agendamentos'))
                .catch(() => renderErro('Erro ao salvar serviços.'));
            }
          );
        });
        });
        }
      );
    }
  );
});

// ── Formulário editar agendamento ─────────────────────────────────────────────

router.get('/agendamentos/:id/editar', verificarAutenticacao, (req, res) => {
  db.get(`SELECT a.* FROM agendamentos a WHERE a.id = ?`, [req.params.id], (err, agendamento) => {
    if (err || !agendamento) return res.redirect('/agendamentos');

    db.all(`SELECT servico_id FROM agendamento_servicos WHERE agendamento_id = ?`, [agendamento.id], (err, agServicos) => {
      const servicosSelecionadosIds = (agServicos || []).map(r => r.servico_id);

      carregarFormData((pets, servicos, funcionarios) => {
        const data = agendamento.data_hora.split(' ')[0] || agendamento.data_hora.split('T')[0];
        const hora = agendamento.data_hora.slice(11, 16);

        res.render('agendamentos/editar', {
          usuario: req.session.usuario,
          paginaAtiva: 'agendamentos',
          agendamento, pets, servicos, funcionarios,
          servicosSelecionadosIds,
          data, hora, erro: null
        });
      });
    });
  });
});

// ── Salvar edição ─────────────────────────────────────────────────────────────

router.post('/agendamentos/:id/editar', verificarAutenticacao, (req, res) => {
  const { pet_id, data, hora, status, observacoes, funcionario_id } = req.body;
  const servicosIds = normalizarServicos(req.body.servicos);
  const id = req.params.id;

  const renderErro = (erro) => {
    db.get(`SELECT * FROM agendamentos WHERE id = ?`, [id], (err, agendamento) => {
      db.all(`SELECT servico_id FROM agendamento_servicos WHERE agendamento_id = ?`, [id], (err, agServicos) => {
        const servicosSelecionadosIds = (agServicos || []).map(r => r.servico_id);
        carregarFormData((pets, servicos, funcionarios) => {
          res.render('agendamentos/editar', {
            usuario: req.session.usuario, paginaAtiva: 'agendamentos',
            agendamento, pets, servicos, funcionarios, servicosSelecionadosIds,
            data: agendamento.data_hora.split(' ')[0],
            hora: agendamento.data_hora.slice(11, 16),
            erro
          });
        });
      });
    });
  };

  if (!pet_id || !data || !hora || !status || servicosIds.length === 0) {
    return renderErro('Selecione o pet, ao menos um serviço, data e horário.');
  }

  const data_hora = `${data} ${hora}:00`;
  const slotHora = `${data} ${hora.split(':')[0]}`;

  // Limite de 3 por horário (excluindo o próprio)
  db.get(
    `SELECT COUNT(*) AS count FROM agendamentos WHERE strftime('%Y-%m-%d %H', data_hora) = ? AND status != 'cancelado' AND id != ?`,
    [slotHora, id],
    (err, row) => {
      if (!err && row && row.count >= 3) {
        return renderErro('Horário lotado! Já existem 3 agendamentos nesse horário.');
      }

      // Impede o mesmo pet com os mesmos serviços no mesmo dia/hora (excluindo o próprio)
      const placeholdersServ = servicosIds.map(() => '?').join(',');
      db.get(
        `SELECT COUNT(*) AS count
         FROM agendamentos a
         JOIN agendamento_servicos ag_s ON ag_s.agendamento_id = a.id
         WHERE a.pet_id = ?
           AND strftime('%Y-%m-%d %H', a.data_hora) = ?
           AND ag_s.servico_id IN (${placeholdersServ})
           AND a.status != 'cancelado'
           AND a.id != ?`,
        [pet_id, slotHora, ...servicosIds, id],
        (err, dupRow) => {
          if (!err && dupRow && dupRow.count > 0) {
            return renderErro('Este pet já possui agendamento com o(s) mesmo(s) serviço(s) nesse dia e horário.');
          }

      db.get('SELECT p.*, c.id AS cliente_id FROM pets p LEFT JOIN clientes c ON p.cliente_id = c.id WHERE p.id = ?', [pet_id], (err, pet) => {
        if (err || !pet) return renderErro('Pet não encontrado.');

        const placeholders = servicosIds.map(() => '?').join(',');
        db.all(`SELECT * FROM servicos WHERE id IN (${placeholders})`, servicosIds, (err, servicosSel) => {
          if (err || !servicosSel.length) return renderErro('Serviço inválido.');

          const nomes = servicosSel.map(s => s.nome.toLowerCase().trim());
          const temBanho = nomes.includes('banho');
          if ((nomes.includes('tosa') || nomes.includes('hidratação')) && !temBanho) {
            return renderErro('Tosa e Hidratação só podem ser agendados junto com Banho.');
          }

          const { subtotal, desconto, valorFinal } = calcularValores(servicosSel, pet);

          const funcId = funcionario_id && parseInt(funcionario_id) > 0 ? parseInt(funcionario_id) : null;
          db.run(
            `UPDATE agendamentos SET pet_id=?, cliente_id=?, data_hora=?, status=?, observacoes=?, valor=?, desconto=?, funcionario_id=? WHERE id=?`,
            [pet_id, pet.cliente_id, data_hora, status, observacoes || null, valorFinal, desconto, funcId, id],
            (err) => {
              if (err) return renderErro('Erro ao salvar.');

              db.run(`DELETE FROM agendamento_servicos WHERE agendamento_id = ?`, [id], () => {
                const porteMap = { 'Pequeno': 'preco_pequeno', 'Médio': 'preco_medio', 'Grande': 'preco_grande' };
                const campoPreco = porteMap[pet.porte] || 'preco_medio';

                const stmts = servicosSel.map(s =>
                  new Promise((resolve, reject) => {
                    db.run(
                      `INSERT INTO agendamento_servicos (agendamento_id, servico_id, valor) VALUES (?, ?, ?)`,
                      [id, s.id, parseFloat(s[campoPreco]) || 0],
                      err => err ? reject(err) : resolve()
                    );
                  })
                );

                Promise.all(stmts)
                  .then(() => res.redirect('/agendamentos'))
                  .catch(() => renderErro('Erro ao salvar serviços.'));
              });
            }
          );
        });
      });
        }
      );
    }
  );
});

// ── Deletar agendamento ───────────────────────────────────────────────────────

router.delete('/agendamentos/:id', verificarAutenticacao, (req, res) => {
  db.run('DELETE FROM agendamentos WHERE id = ?', [req.params.id], (err) => {
    res.json({ ok: !err });
  });
});

module.exports = router;
