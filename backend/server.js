const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Libera acesso do seu frontend (Vercel)
app.use(cors({
  origin: [
    'https://crm-cordilheira-9yir.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// ✅ Teste
app.get('/', (req, res) => {
  res.send('Backend rodando 🚀');
});

// ✅ LOGIN (IMPORTANTE: /api/auth/login)
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === 'admin@admin.com' && senha === '123456') {
    return res.json({
      token: '123456',
      user: {
        email: 'admin@admin.com',
        nome: 'Administrador'
      }
    });
  }

  return res.status(401).json({ error: 'Credenciais inválidas' });
});

// ✅ Rota de teste de usuário logado
app.get('/api/auth/me', (req, res) => {
  res.json({
    email: 'admin@admin.com',
    nome: 'Administrador'
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});