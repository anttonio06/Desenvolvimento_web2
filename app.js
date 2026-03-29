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
      db.all('SELECT nome, criado_em FROM clientes ORDER BY criado_em DESC LIMIT 3', [], (e3, ultimosClientes) => {
        res.render('dashboard/dashboard', {
          usuario: req.session.usuario,
          paginaAtiva: 'dashboard',
          totalClientes: (r1 && !e1) ? r1.total : 0,
          totalPets: (r2 && !e2) ? r2.total : 0,
          ultimosClientes: (ultimosClientes && !e3) ? ultimosClientes : []
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});