const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend rodando 🚀');
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === 'admin@admin.com' && senha === '123456') {
    return res.json({ sucesso: true });
  }

  return res.status(401).json({ erro: 'Credenciais inválidas' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});