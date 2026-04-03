const express = require('express');
const cors = require('cors');

const app = express();

// ✅ CORS liberado (Vercel + local)
app.use(cors({
  origin: [
    'https://crm-cordilheira-9yir.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// =============================
// 🔥 BANCO TEMPORÁRIO (MEMÓRIA)
// =============================
let usuarios = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@admin.com',
    senha: '123456',
    role: 'admin'
  }
];

// =============================
// 🚀 ROTAS
// =============================

// TESTE
app.get('/', (req, res) => {
  res.send('Backend rodando 🚀');
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  return res.json({
    token: 'fake-jwt-token',
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    }
  });
});

// USUÁRIO LOGADO
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 1,
    nome: 'Administrador',
    email: 'admin@admin.com',
    role: 'admin'
  });
});

// =============================
// 👥 USUÁRIOS (CRUD)
// =============================

// LISTAR
app.get('/api/auth/usuarios', (req, res) => {
  res.json(usuarios);
});

// CRIAR
app.post('/api/auth/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;

  const novo = {
    id: Date.now(),
    nome,
    email,
    senha,
    role: 'user'
  };

  usuarios.push(novo);
  res.json(novo);
});

// ATUALIZAR
app.put('/api/auth/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  usuarios[index] = { ...usuarios[index], ...req.body };
  res.json(usuarios[index]);
});

// DELETAR
app.delete('/api/auth/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  usuarios = usuarios.filter(u => u.id !== id);
  res.json({ sucesso: true });
});

// =============================
// 🚀 DASHBOARD (fake)
// =============================
app.get('/api/dashboard', (req, res) => {
  res.json({
    clientes: 10,
    vendas: 5,
    lances: 3
  });
});

// =============================
// 🚀 SERVER
// =============================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});