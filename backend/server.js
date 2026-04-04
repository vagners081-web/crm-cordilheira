const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ─── BANCO SIMPLES (arquivo JSON) ─────────────────────────
const DB_FILE = './db.json';

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      usuarios: [
        { id: 1, nome: 'Admin', email: 'admin@admin.com', senha: '123456' }
      ],
      clientes: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── LOGIN ───────────────────────────────────────────────
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const db = loadDB();

  const user = db.usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  res.json({
    token: 'fake-jwt',
    user: { nome: user.nome, email: user.email }
  });
});

// ─── USUÁRIOS ────────────────────────────────────────────
app.get('/usuarios', (req, res) => {
  const db = loadDB();
  res.json(db.usuarios);
});

app.post('/usuarios', (req, res) => {
  const db = loadDB();
  const novo = { id: Date.now(), ...req.body };
  db.usuarios.push(novo);
  saveDB(db);
  res.json(novo);
});

// ─── CLIENTES ────────────────────────────────────────────
app.get('/clientes', (req, res) => {
  const db = loadDB();
  res.json(db.clientes);
});

app.post('/clientes', (req, res) => {
  const db = loadDB();
  const novo = { id: Date.now(), ...req.body };
  db.clientes.push(novo);
  saveDB(db);
  res.json(novo);
});

// ─── ROOT ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Backend rodando 🚀');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});