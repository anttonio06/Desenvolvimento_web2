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

router.get('/cadastro', (req, res) => {
  res.render('autenticacao/cadastro', {
    title: 'Cadastro - PetAgenda',
    erro: null,
    sucesso: null,
    dados: {}
  });
});

router.post('/cadastro', async (req, res) => {
  const { nome, telefone, email, senha, confirmarSenha } = req.body;

  if (!nome || !telefone || !email || !senha || !confirmarSenha) {
    return res.render('autenticacao/cadastro', {
      title: 'Cadastro - PetAgenda',
      erro: 'Preencha todos os campos.',
      sucesso: null,
      dados: { nome, telefone, email }
    });
  }

  if (senha !== confirmarSenha) {
    return res.render('autenticacao/cadastro', {
      title: 'Cadastro - PetAgenda',
      erro: 'As senhas não coincidem.',
      sucesso: null,
      dados: { nome, telefone, email }
    });
  }

  if (senha.length < 6) {
    return res.render('autenticacao/cadastro', {
      title: 'Cadastro - PetAgenda',
      erro: 'A senha deve ter no mínimo 6 caracteres.',
      sucesso: null,
      dados: { nome, telefone, email }
    });
  }

  db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
    if (err) {
      console.log(err);
      return res.render('autenticacao/cadastro', {
        title: 'Cadastro - PetAgenda',
        erro: 'Erro ao verificar email.',
        sucesso: null,
        dados: { nome, telefone, email }
      });
    }

    if (usuario) {
      return res.render('autenticacao/cadastro', {
        title: 'Cadastro - PetAgenda',
        erro: 'Este email já está cadastrado.',
        sucesso: null,
        dados: { nome, telefone, email }
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    db.run(
      'INSERT INTO usuarios (nome, email, senha, senha_texto, permissoes) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, senha, 'cliente'],
      function (err) {
        if (err) {
          console.log(err);
          return res.render('autenticacao/cadastro', {
            title: 'Cadastro - PetAgenda',
            erro: 'Erro ao cadastrar usuário.',
            sucesso: null,
            dados: { nome, telefone, email }
          });
        }

        res.redirect('/login?cadastrado=1');
      }
    );
  });
});

module.exports = router;