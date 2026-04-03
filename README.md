# 💼 CRM Pro v2 — Sistema Profissional Multiusuário

Sistema CRM completo com autenticação JWT, controle de acesso por perfil, exportação Excel e preparado para deploy em produção.

---

## ✅ Funcionalidades

| Módulo        | Funcionalidades                                                    |
|---------------|--------------------------------------------------------------------|
| 🔐 Login      | JWT, bcrypt, proteção de rotas, sessão persistente                 |
| 👥 Clientes   | CRUD completo, busca em tempo real, exportação Excel               |
| 💰 Vendas     | CRUD completo, totais automáticos, exportação com totais           |
| 🎯 Lances     | CRUD completo, filtro por status, exportação Excel                 |
| ◉ Usuários    | Criação/edição/remoção de usuários (somente admin)                 |
| 📊 Dashboard  | Métricas, gráfico de vendas por mês, últimos registros             |
| 💾 Backup     | Download do banco SQLite (somente admin)                           |

---

## 🚀 Instalação Local

### Pré-requisitos
```
Node.js >= 18
npm >= 8
```

### 1. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend (novo terminal)
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
# Edite o .env e defina JWT_SECRET e credenciais do admin
```

### 3. Iniciar os servidores

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# Rodando em http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# Rodando em http://localhost:3000
```

### 4. Primeiro acesso

```
URL:   http://localhost:3000
Email: admin@crmpro.com
Senha: Admin@2024
```
> ⚠️ Troque a senha imediatamente após o primeiro login!

---

## 🌐 Deploy em Produção

### Opção A — Render.com (recomendado, gratuito)

1. Fork ou suba o projeto no GitHub
2. Acesse [render.com](https://render.com) e crie uma conta
3. Clique em **"New Blueprint"** e selecione seu repositório
4. O `render.yaml` configura tudo automaticamente
5. Edite as variáveis de ambiente no painel do Render:
   - `JWT_SECRET` → string aleatória longa (mín. 32 chars)
   - `ADMIN_PASSWORD` → senha forte
   - `ADMIN_EMAIL` → seu email
   - `FRONTEND_URL` → URL do frontend gerado pelo Render

### Opção B — Railway.app

```bash
# Instalar CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

Configure as variáveis no painel Railway:
```
NODE_ENV=production
JWT_SECRET=sua_chave_super_secreta_longa_aqui
ADMIN_EMAIL=admin@suaempresa.com
ADMIN_PASSWORD=SenhaForte@2024
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Opção C — VPS (Ubuntu/Debian)

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar e instalar
git clone <seu-repo> /opt/crm-pro
cd /opt/crm-pro
npm run install:all

# Build do frontend
cd frontend
REACT_APP_API_URL=https://api.seudominio.com/api npm run build

# Iniciar backend com PM2
sudo npm install -g pm2
cd /opt/crm-pro/backend
cp .env.example .env  # edite o .env
pm2 start server.js --name crm-backend
pm2 startup
pm2 save

# Nginx como proxy reverso (opcional)
# Configure para servir /opt/crm-pro/frontend/build e fazer proxy do /api para localhost:3001
```

---

## 🗂️ Estrutura do Projeto

```
crm-pro/
├── backend/
│   ├── middleware/
│   │   └── auth.js          ← Verificação JWT + adminOnly
│   ├── routes/
│   │   ├── auth.js          ← Login, usuários, senha
│   │   ├── clientes.js      ← CRUD + export Excel
│   │   ├── vendas.js        ← CRUD + export Excel
│   │   └── lances.js        ← CRUD + export Excel
│   ├── database.js          ← SQLite + seed admin
│   ├── server.js            ← Express + helmet + rate limit
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx  ← Menu lateral
│       │   └── Topbar.jsx   ← Barra superior + dropdown
│       ├── context/
│       │   ├── AuthContext.jsx  ← Estado global auth
│       │   └── ToastContext.jsx ← Notificações
│       ├── pages/
│       │   ├── Login.jsx    ← Tela de login
│       │   ├── Dashboard.jsx← Métricas + gráficos
│       │   ├── Clientes.jsx ← CRUD clientes
│       │   ├── Vendas.jsx   ← CRUD vendas
│       │   ├── Lances.jsx   ← CRUD lances
│       │   └── Usuarios.jsx ← Gestão de usuários (admin)
│       ├── services/api.js  ← Chamadas ao backend
│       ├── utils/format.js  ← BRL, datas, máscaras
│       ├── App.jsx          ← Roteamento + auth guard
│       └── index.css        ← Design dark SaaS completo
│
├── render.yaml              ← Deploy Render.com
├── railway.toml             ← Deploy Railway.app
├── Procfile                 ← Heroku/Railway
└── README.md
```

---

## 🔌 API Reference

### Auth
| Método | Rota                    | Acesso  | Descrição            |
|--------|-------------------------|---------|----------------------|
| POST   | /api/auth/login         | Público | Login                |
| GET    | /api/auth/me            | Auth    | Dados do usuário     |
| PUT    | /api/auth/senha         | Auth    | Alterar senha        |
| GET    | /api/auth/usuarios      | Admin   | Listar usuários      |
| POST   | /api/auth/usuarios      | Admin   | Criar usuário        |
| PUT    | /api/auth/usuarios/:id  | Admin   | Editar usuário       |
| DELETE | /api/auth/usuarios/:id  | Admin   | Remover usuário      |

### Clientes / Vendas / Lances
| Método | Rota              | Descrição       |
|--------|-------------------|-----------------|
| GET    | /api/clientes     | Listar (+ ?q=)  |
| POST   | /api/clientes     | Criar           |
| PUT    | /api/clientes/:id | Atualizar       |
| DELETE | /api/clientes/:id | Remover         |
| GET    | /api/clientes/export | Download Excel |

*(Mesma estrutura para /api/vendas e /api/lances)*

### Outros
| Método | Rota           | Acesso | Descrição         |
|--------|----------------|--------|-------------------|
| GET    | /api/dashboard | Auth   | Métricas gerais   |
| GET    | /api/backup    | Admin  | Download do banco |
| GET    | /api/health    | Público| Health check      |

---

## 🔒 Segurança

- Senhas criptografadas com **bcrypt** (salt rounds: 12)
- Autenticação via **JWT** (7 dias de expiração)
- **Helmet.js** para headers HTTP seguros
- **Rate limiting**: 500 req/15min global, 20 tentativas de login/15min
- **CORS** configurado por variável de ambiente
- Usuários comuns acessam apenas seus próprios dados
- Admin tem visibilidade global

---

## ⚠️ Solução de Problemas

**CORS error no frontend:**
Verifique se `FRONTEND_URL` no `.env` do backend corresponde exatamente à URL do frontend.

**Token expirado:**
O sistema detecta automaticamente e redireciona para o login.

**Banco não encontrado:**
O arquivo `crm.db` é criado automaticamente na pasta `/backend` na primeira execução.

**Porta 3001 em uso:**
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```
