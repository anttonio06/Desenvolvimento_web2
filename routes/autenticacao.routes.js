const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/dashboard');
  }

  res.render('autenticacao/login', {
    title: 'Login - PetAgenda',
    erro: null,
    sucesso: null,
    cadastrado: req.query.cadastrado === '1'
  });
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.render('autenticacao/login', {
      title: 'Login - PetAgenda',
      erro: 'Preencha email e senha.',
      sucesso: null,
      cadastrado: false
    });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
    if (err) {
      console.log(err);
      return res.render('autenticacao/login', {
        title: 'Login - PetAgenda',
        erro: 'Erro interno no servidor.',
        sucesso: null, cadastrado: false
      });
    }

    if (!usuario) {
      return res.render('autenticacao/login', {
        title: 'Login - PetAgenda',
        erro: 'Email ou senha inválidos.',
        sucesso: null, cadastrado: false
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.render('autenticacao/login', {
        title: 'Login - PetAgenda',
        erro: 'Email ou senha inválidos.',
        sucesso: null, cadastrado: false
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      permissoes: usuario.permissoes
    };

    res.redirect('/dashboard');
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.get('/esqueci-senha', (req, res) => {
  res.render('autenticacao/esqueci-senha', {
    title: 'Esqueci minha senha',
    erro: null,
    sucesso: null
  });
});

router.post('/esqueci-senha', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.render('autenticacao/esqueci-senha', {
      title: 'Esqueci minha senha',
      erro: 'Informe o email.',
      sucesso: null
    });
  }

  res.render('autenticacao/esqueci-senha', {
    title: 'Esqueci minha senha',
    erro: null,
    sucesso: 'Se o email existir, enviaremos instruções para redefinir a senha.'
  });
});

router.get('/cadastro', (req, res) => res.redirect('/login'));
router.post('/cadastro', (req, res) => res.redirect('/login'));

module.exports = router;