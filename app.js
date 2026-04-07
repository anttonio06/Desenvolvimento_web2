const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./database/db');
require('./database/init');

const autenticacaoRoutes = require('./routes/autenticacao.routes');
const clientesRoutes = require('./routes/clientes.routes');
const petsRoutes = require('./routes/pets.routes');
const servicosRoutes = require('./routes/servicos.routes');
const agendamentosRoutes = require('./routes/agendamentos.routes');
const { verificarAutenticacao } = require('./middleware/controleLogin.middleware');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: './database'
    }),
    secret: 'petagenda_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.use('/', autenticacaoRoutes);
app.use('/', clientesRoutes);
app.use('/', petsRoutes);
app.use('/', servicosRoutes);
app.use('/', agendamentosRoutes);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/dashboard', verificarAutenticacao, (req, res) => {
  db.get('SELECT COUNT(*) AS total FROM clientes', [], (e1, r1) => {
    db.get('SELECT COUNT(*) AS total FROM pets', [], (e2, r2) => {
      db.get('SELECT COUNT(*) AS total FROM servicos', [], (e3, r3) => {
        db.all('SELECT nome, criado_em FROM clientes ORDER BY criado_em DESC', [], (e4, ultimosClientes) => {
          db.all(`
            SELECT a.id, a.data_hora, a.status,
                   p.nome AS pet_nome,
                   s.nome AS servico_nome
            FROM agendamentos a
            LEFT JOIN pets p ON a.pet_id = p.id
            LEFT JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data_hora ASC
          `, [], (e5, agendamentos) => {
            const hoje = new Date().toISOString().split('T')[0];
            const totalHoje = (agendamentos || []).filter(a => a.data_hora && a.data_hora.startsWith(hoje)).length;
            res.render('dashboard/dashboard', {
              usuario: req.session.usuario,
              paginaAtiva: 'dashboard',
              totalClientes: (r1 && !e1) ? r1.total : 0,
              totalPets: (r2 && !e2) ? r2.total : 0,
              totalServicos: (r3 && !e3) ? r3.total : 0,
              ultimosClientes: (ultimosClientes && !e4) ? ultimosClientes : [],
              agendamentos: (agendamentos && !e5) ? agendamentos : [],
              totalHoje
            });
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});