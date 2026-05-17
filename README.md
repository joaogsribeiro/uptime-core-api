# 🚀 **UptimeCore API**

![Node.js](https://img.shields.io/badge/Node.js-24-green)
![Express](https://img.shields.io/badge/Express-5.2-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.7-2D3748)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED)
![License](https://img.shields.io/badge/license-MIT-blue)

API RESTful para monitoramento de disponibilidade de serviços e URLs, com autenticação JWT, checagens periódicas, registro de incidentes, alertas por e-mail, documentação Swagger, testes automatizados e deploy conteinerizado.

A **UptimeCore API** permite cadastrar endpoints HTTP, monitorar disponibilidade, registrar falhas e manter histórico operacional de uptime e tempo de resposta.

---

# 🌐 **Produção**

* API: [https://uptime-core-api.onrender.com/api](https://uptime-core-api.onrender.com/api)
* Swagger: [https://uptime-core-api.onrender.com/api/docs](https://uptime-core-api.onrender.com/api/docs)

---

# 📚 **Sumário**

* [Funcionalidades](#-funcionalidades)
* [Stack Tecnológica](#️-stack-tecnológica)
* [Quick Start](#-quick-start)
* [Variáveis de Ambiente](#-variáveis-de-ambiente)
* [Documentação](#-documentação)
* [Visão Geral da API](#-visão-geral-da-api)
* [Scripts Disponíveis](#-scripts-disponíveis)
* [Estrutura do Projeto](#-estrutura-do-projeto)
* [Roadmap](#️-roadmap)
* [Contribuição](#-contribuição)
* [Licença](#-licença)

---

# ✨ **Funcionalidades**

* Cadastro e autenticação de usuários com JWT.
* Senhas protegidas com hash usando bcrypt.
* Recuperação de senha via token enviado por e-mail.
* Controle de acesso por usuário autenticado e perfil administrativo.
* CRUD de usuários com regras de autorização.
* CRUD de monitores HTTP.
* Validação de URL na criação e atualização de monitores.
* Execução periódica de checagens de disponibilidade.
* Registro de tempo de resposta em milissegundos.
* Registro de incidentes associados a monitores.
* Registro de alertas vinculados a incidentes.
* Health check para infraestrutura.
* Documentação interativa com Swagger UI.
* Testes de integração com Jest e Supertest.
* Ambiente conteinerizado com Docker e Docker Compose.
* Pipeline CI/CD com GitHub Actions, SonarCloud e deploy na Render.

---

# 🛠️ **Stack Tecnológica**

## 🔙 Backend

* Node.js 24
* Express 5
* ECMAScript Modules
* JWT
* bcryptjs
* Nodemailer
* node-cron
* Axios

## 🗄️ Banco de Dados

* PostgreSQL 15
* Prisma ORM
* Prisma Migrate

## 📖 Documentação e Testes

* Swagger UI Express
* swagger-autogen
* Jest
* Supertest
* Insomnia Collection

## 🚀 DevOps e Qualidade

* Docker
* Docker Compose
* GitHub Actions
* ESLint
* Prettier
* Husky
* lint-staged
* SonarCloud
* Render

---

# ⚡ **Quick Start**

## 📥 Clonar repositório

```bash
git clone https://github.com/joaogsribeiro/uptime-core-api.git
cd uptime-core-api
```

## 📦 Instalar dependências

```bash
npm install
```

## ⚙️ Configurar variáveis de ambiente

```bash
cp .env.example .env
```

## 🧬 Gerar Prisma Client

```bash
npx prisma generate
```

## 🗃️ Executar migrations do banco

```bash
npm run db:migrate
```

## ▶️ Iniciar servidor de desenvolvimento

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

A documentação Swagger ficará disponível em:

```text
http://localhost:3000/api/docs
```

---

# 🐳 **Executando com Docker**

```bash
docker compose up --build
```

## 🔄 Modo detached

```bash
docker compose up -d --build
```

## 🛑 Parar containers

```bash
docker compose down
```

O ambiente Docker inicia:

| Serviço         | Descrição                  | Porta  |
| --------------- | -------------------------- | ------ |
| `api`           | API Node.js/Express        | `3000` |
| `postgres_db`   | Banco PostgreSQL principal | `5432` |
| `postgres_test` | Banco PostgreSQL de testes | `5433` |

---

# 🔐 **Variáveis de Ambiente**

Crie um arquivo `.env` baseado no `.env.example`.

| Variável          | Descrição                                        |
| ----------------- | ------------------------------------------------ |
| `PORT`            | Porta da API                                     |
| `NODE_ENV`        | Ambiente de execução                             |
| `JWT_SECRET`      | Segredo utilizado para assinar tokens JWT        |
| `JWT_EXPIRES_IN`  | Tempo de expiração do JWT                        |
| `DATABASE_URL`    | String de conexão PostgreSQL usada pelo Prisma   |
| `DB_HOST`         | Host do PostgreSQL                               |
| `DB_PORT`         | Porta do PostgreSQL                              |
| `DB_USER`         | Usuário do PostgreSQL                            |
| `DB_PASS`         | Senha do PostgreSQL                              |
| `DB_NAME`         | Nome do banco PostgreSQL                         |
| `MAIL_HOST`       | Host SMTP                                        |
| `MAIL_PORT`       | Porta SMTP                                       |
| `MAIL_USER`       | Usuário SMTP                                     |
| `MAIL_PASS`       | Senha SMTP                                       |
| `ALLOWED_ORIGINS` | Origens permitidas no CORS separadas por vírgula |

## 📝 Exemplo

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_para_desenvolvimento
JWT_EXPIRES_IN=1d

DATABASE_URL=postgresql://admin:admin123@localhost:5432/api_monitor_db?schema=public

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=mailtrap_user
MAIL_PASS=mailtrap_password
```

---

# 📖 **Documentação**

A documentação completa está organizada em `/docs`.

| Documento                              | Descrição                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| [Architecture](./docs/architecture.md) | Arquitetura da aplicação, camadas, estrutura do projeto e modelo de banco       |
| [API](./docs/api.md)                   | Endpoints, autenticação, Swagger, Insomnia e exemplos de requisição             |
| [Services](./docs/services.md)         | Funcionamento do scheduler, pings, incidentes, alertas e fluxo de monitoramento |
| [Development](./docs/development.md)   | Configuração local, ambiente, scripts, testes, lint e troubleshooting           |
| [Operations](./docs/operations.md)     | Docker, deploy, CI/CD, segurança e observabilidade                              |

---

# 🧩 **Visão Geral da API**

## 🌍 URLs Base

```text
Local:      http://localhost:3000
Produção:   https://uptime-core-api.onrender.com
```

## 📌 Principais Rotas

| Método   | Rota                        | Auth  | Descrição                      |
| -------- | --------------------------- | ----- | ------------------------------ |
| `GET`    | `/`                         | Não   | Apresentação da API            |
| `GET`    | `/api`                      | Não   | Apresentação da API            |
| `GET`    | `/api/health`               | Não   | Health check                   |
| `POST`   | `/api/auth/register`        | Não   | Registrar usuário              |
| `POST`   | `/api/auth/login`           | Não   | Autenticar usuário             |
| `POST`   | `/api/auth/forgot-password` | Não   | Solicitar recuperação de senha |
| `POST`   | `/api/auth/reset-password`  | Não   | Redefinir senha                |
| `GET`    | `/api/users`                | Admin | Listar usuários                |
| `GET`    | `/api/users/:id`            | JWT   | Buscar usuário                 |
| `PUT`    | `/api/users/:id`            | JWT   | Atualizar usuário              |
| `DELETE` | `/api/users/:id`            | JWT   | Remover usuário                |
| `POST`   | `/api/monitors`             | JWT   | Criar monitor                  |
| `GET`    | `/api/monitors`             | JWT   | Listar monitores               |
| `GET`    | `/api/monitors/:id`         | JWT   | Buscar monitor                 |
| `PUT`    | `/api/monitors/:id`         | JWT   | Atualizar monitor              |
| `DELETE` | `/api/monitors/:id`         | JWT   | Remover monitor                |
| `GET`    | `/api/admin/status`         | Admin | Obter métricas do sistema      |

---

# 📡 **Exemplo de Requisição**

## 🔐 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "123456"
  }'
```

## 🧾 Exemplo de resposta

```json
{
  "user": {
    "id": "user-uuid",
    "name": "João Ribeiro",
    "email": "joao@example.com",
    "role": "USER"
  },
  "token": "jwt-token"
}
```

## 🌐 Criar monitor

```bash
curl -X POST http://localhost:3000/api/monitors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token" \
  -d '{
    "name": "UptimeCore API",
    "url": "https://uptime-core-api.onrender.com/api/health",
    "interval_minutes": 5
  }'
```

---

# 📜 **Scripts Disponíveis**

| Script                  | Descrição                                 |
| ----------------------- | ----------------------------------------- |
| `npm run swagger`       | Gera documentação Swagger                 |
| `npm run dev`           | Inicia a API em modo desenvolvimento      |
| `npm start`             | Inicia a API em modo produção/local       |
| `npm run lint`          | Executa ESLint                            |
| `npm run lint:fix`      | Corrige problemas de lint quando possível |
| `npm run db:migrate`    | Aplica migrations do Prisma               |
| `npm test`              | Executa a suíte de testes                 |
| `npm run test:watch`    | Executa testes em modo watch              |
| `npm run test:db-setup` | Aplica migrations no banco de testes      |

---

# 📁 **Estrutura do Projeto**

```text
uptime-core-api/
├── .github/
│   └── workflows/
├── docs/
│   ├── insomnia/
│   ├── architecture.md
│   ├── api.md
│   ├── development.md
│   └── operations.md
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── scripts/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── docs/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── tests/
│   └── integration/
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

---

# 🧪 **Testes**

## 🗃️ Preparar banco de testes

```bash
npm run test:db-setup
```

## ▶️ Executar testes

```bash
npm test
```

## 📊 Executar testes com cobertura

```bash
npm test -- --coverage
```

Mais detalhes estão disponíveis em [Development](./docs/development.md).

---

# ⚙️ **CI/CD**

O projeto utiliza GitHub Actions para:

* Instalação de dependências.
* Geração do Prisma Client.
* Análise estática com ESLint.
* Provisionamento do banco de testes.
* Execução de migrations do Prisma.
* Testes automatizados com cobertura.
* Análise no SonarCloud.
* Deploy na Render.

Mais detalhes estão disponíveis em [Operations](./docs/operations.md).

---

# 🗺️ **Roadmap**

* [ ] Adicionar rotação de refresh token.
* [ ] Adicionar rate limiting.
* [ ] Adicionar Helmet.
* [ ] Adicionar paginação nos endpoints de listagem.
* [ ] Adicionar filtros por status de monitor.
* [ ] Adicionar dashboard de histórico de uptime.
* [ ] Adicionar logging estruturado.
* [ ] Adicionar métricas Prometheus.
* [ ] Adicionar notificações via webhook.
* [ ] Adicionar notificações Slack ou Discord.
* [ ] Adicionar suporte a multi-tenancy.

---

# 🤝 **Contribuição**

Contribuições são bem-vindas.

## 1️⃣ Fazer fork do repositório

## 2️⃣ Criar uma branch de feature

```bash
git checkout -b feature/nome-da-feature
```

## 3️⃣ Instalar dependências

```bash
npm install
```

## 4️⃣ Fazer suas alterações

## 5️⃣ Executar lint e testes

```bash
npm run lint
npm test
```

## 6️⃣ Commitar alterações

```bash
git commit -m "feat: add feature name"
```

## 7️⃣ Fazer push da branch

```bash
git push origin feature/nome-da-feature
```

## 8️⃣ Abrir Pull Request

---

# 📄 **Licença**

Este projeto está licenciado sob a licença MIT.

Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

# 👨‍💻 **Autor**

**João Guilherme Santos Ribeiro**

* GitHub: [https://github.com/joaogsribeiro](https://github.com/joaogsribeiro)

---

**UptimeCore API** foi construída como um projeto de engenharia backend focado em design de APIs, autenticação, monitoramento, testes, documentação, conteinerização e práticas modernas de pipeline de entrega.
