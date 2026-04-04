const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === 'admin@admin.com' && senha === '123456') {
    return res.json({
      token: '123456789',
      user: {
        id: 1,
        nome: 'Administrador',
        email: 'admin@admin.com',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ error: 'Credenciais inválidas' });
});

// USUÁRIOS
let usuarios = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@admin.com',
    role: 'admin'
  }
];

app.get('/usuarios', (req, res) => {
  res.json(usuarios);
});

app.post('/usuarios', (req, res) => {
  const novo = {
    id: Date.now(),
    ...req.body
  };
  usuarios.push(novo);
  res.json(novo);
});

// CLIENTES (mock)
let clientes = [];

app.get('/clientes', (req, res) => {
  res.json(clientes);
});

app.post('/clientes', (req, res) => {
  const novo = { id: Date.now(), ...req.body };
  clientes.push(novo);
  res.json(novo);
});

// TESTE
app.get('/', (req, res) => {
  res.send('Backend rodando 🚀');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});