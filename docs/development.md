# 🛠️ Desenvolvimento

Este documento reúne as instruções para configurar, executar, testar e manter a UptimeCore API em ambiente de desenvolvimento.

Aqui estão concentrados os detalhes operacionais do dia a dia: instalação local, variáveis de ambiente, banco de dados, Docker, scripts, testes, lint e problemas comuns.

## 📚 Sumário

- [Pré-requisitos](#-pré-requisitos)
- [Instalação Local](#-instalação-local)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Banco de Dados](#-banco-de-dados)
- [Executando a API](#-executando-a-api)
- [Executando com Docker](#-executando-com-docker)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Lint e Formatação](#-lint-e-formatação)
- [Swagger em Desenvolvimento](#-swagger-em-desenvolvimento)
- [Fluxo de Desenvolvimento Recomendado](#-fluxo-de-desenvolvimento-recomendado)
- [Troubleshooting](#-troubleshooting)

## ✅ Pré-requisitos

Para rodar o projeto localmente, você precisa ter instalado:

- **Node.js 24+**
- **npm**
- **Docker**
- **Docker Compose**
- **Git**

Verifique as versões com:

```bash
node -v
npm -v
docker -v
docker compose version
git --version
```

## 🚀 Instalação Local

Clone o repositório:

```bash
git clone https://github.com/joaogsribeiro/uptime-core-api.git
cd uptime-core-api
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations no banco configurado:

```bash
npm run db:migrate
```

Inicie a API em modo desenvolvimento:

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

## 🔐 Variáveis de Ambiente

O projeto usa variáveis de ambiente para configurar servidor, autenticação, banco de dados, e-mail e CORS.

Crie um arquivo `.env` baseado em `.env.example`.

```bash
cp .env.example .env
```

Exemplo de configuração local:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=super_secret_jwt_key_para_desenvolvimento
JWT_EXPIRES_IN=1d

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASS=admin123
DB_NAME=api_monitor_db
DATABASE_URL=postgresql://admin:admin123@localhost:5432/api_monitor_db?schema=public

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=seu_user_do_mailtrap
MAIL_PASS=sua_senha_do_mailtrap

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Variáveis principais

| Variável | Descrição |
|---|---|
| `PORT` | Porta em que a API será executada |
| `NODE_ENV` | Ambiente de execução |
| `JWT_SECRET` | Chave usada para assinar tokens JWT |
| `JWT_EXPIRES_IN` | Tempo de expiração do token JWT |
| `DATABASE_URL` | String de conexão usada pelo Prisma |
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta do PostgreSQL |
| `DB_USER` | Usuário do banco |
| `DB_PASS` | Senha do banco |
| `DB_NAME` | Nome do banco |
| `MAIL_HOST` | Host SMTP |
| `MAIL_PORT` | Porta SMTP |
| `MAIL_USER` | Usuário SMTP |
| `MAIL_PASS` | Senha SMTP |
| `ALLOWED_ORIGINS` | Origens permitidas pelo CORS, separadas por vírgula |

> **Importante:** nunca versionar arquivos `.env` reais com credenciais sensíveis.

## 🗄️ Banco de Dados

O projeto usa **PostgreSQL** com **Prisma ORM**.

O schema principal está em:

```text
prisma/schema.prisma
```

As migrations ficam em:

```text
prisma/migrations/
```

### Gerar Prisma Client

Sempre que o schema Prisma mudar, gere novamente o client:

```bash
npx prisma generate
```

### Aplicar migrations

```bash
npm run db:migrate
```

Esse comando executa:

```bash
prisma migrate deploy
```

### Banco de desenvolvimento

No Docker Compose, o banco principal usa:

| Campo | Valor |
|---|---|
| Host | `localhost` fora do Docker ou `postgres_db` dentro da rede Docker |
| Porta | `5432` |
| Usuário | `admin` |
| Senha | `admin123` |
| Database | `api_monitor_db` |

String de conexão local comum:

```env
DATABASE_URL=postgresql://admin:admin123@localhost:5432/api_monitor_db?schema=public
```

String de conexão usada dentro do Docker:

```env
DATABASE_URL=postgresql://admin:admin123@postgres_db:5432/api_monitor_db?schema=public
```

### Banco de testes

O Docker Compose também sobe um banco exclusivo para testes:

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5433` |
| Usuário | `admin` |
| Senha | `admin` |
| Database | `api_monitor_test_db` |

String de conexão de teste:

```env
DATABASE_URL=postgresql://admin:admin@localhost:5433/api_monitor_test_db?schema=public
```

## ▶️ Executando a API

### Desenvolvimento

```bash
npm run dev
```

Esse comando:

1. Executa automaticamente o `predev`.
2. Gera a documentação Swagger.
3. Inicia o servidor com `nodemon`.

### Produção local

```bash
npm start
```

Esse comando inicia a API com:

```bash
node src/server.js
```

### Health check

Depois de subir a API, valide com:

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-05-17T17:00:00-03:00"
}
```

## 🐳 Executando com Docker

Suba a API e os bancos com:

```bash
docker compose up --build
```

Em segundo plano:

```bash
docker compose up -d --build
```

Parar containers:

```bash
docker compose down
```

Parar containers e remover volumes:

```bash
docker compose down -v
```

### Serviços do Docker Compose

| Serviço | Descrição | Porta |
|---|---|---|
| `api` | Aplicação Node.js/Express | `3000` |
| `postgres_db` | Banco PostgreSQL principal | `5432` |
| `postgres_test` | Banco PostgreSQL para testes | `5433` |

### O que o container da API executa

No ambiente Docker Compose, o serviço da API executa:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Isso garante que:

- O Prisma Client seja gerado.
- As migrations sejam aplicadas.
- O servidor suba em modo desenvolvimento.

## 📜 Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run swagger` | Gera a documentação Swagger |
| `npm run dev` | Inicia a API em desenvolvimento com Nodemon |
| `npm start` | Inicia a API sem Nodemon |
| `npm run lint` | Executa ESLint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente quando possível |
| `npm run db:migrate` | Aplica migrations do Prisma |
| `npm test` | Executa testes com Jest |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:db-setup` | Aplica migrations no banco de teste |

## 🧪 Testes

O projeto usa **Jest** e **Supertest** para testes de integração.

Os testes ficam em:

```text
tests/integration/
```

A configuração do Jest fica em:

```text
jest.config.js
```

O ambiente de testes usa:

```text
.env.test
```

### Preparar banco de testes

Antes de rodar os testes pela primeira vez, aplique as migrations no banco de teste:

```bash
npm run test:db-setup
```

### Rodar testes

```bash
npm test
```

### Rodar testes em modo watch

```bash
npm run test:watch
```

### Rodar testes com cobertura

```bash
npm test -- --coverage
```

### Estratégia dos testes

A suíte cobre fluxos de integração, incluindo:

- Inicialização da aplicação.
- Registro de usuários.
- Login.
- Recuperação de senha.
- Rotas protegidas por JWT.
- Regras de autorização.
- CRUD de usuários.
- CRUD de monitores.
- Incidentes.
- Rotas administrativas.

## 🧹 Lint e Formatação

O projeto usa **ESLint** e **Prettier**.

### Executar lint

```bash
npm run lint
```

### Corrigir problemas automaticamente

```bash
npm run lint:fix
```

### Hooks de Git

O projeto utiliza **Husky** e **lint-staged**.

Configuração atual:

```json
{
  "*.js": "eslint --fix"
}
```

Isso ajuda a manter o padrão de código antes dos commits.

## 📖 Swagger em Desenvolvimento

A documentação Swagger é gerada por script.

### Gerar Swagger manualmente

```bash
npm run swagger
```

### Geração automática no desenvolvimento

O projeto possui o script:

```json
"predev": "npm run swagger"
```

Isso significa que, ao executar:

```bash
npm run dev
```

a documentação Swagger é gerada antes da API iniciar.

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/docs/swaggerSource.js` | Fonte da documentação |
| `scripts/generateSwagger.js` | Script de geração |
| `src/config/swagger.js` | Carrega o Swagger no runtime |

A documentação fica disponível em:

```text
http://localhost:3000/api/docs
```

## 🔄 Fluxo de Desenvolvimento Recomendado

Um fluxo saudável para trabalhar no projeto:

1. Atualizar a branch local.

```bash
git pull origin develop
```

2. Instalar dependências, se necessário.

```bash
npm install
```

3. Subir banco local ou Docker Compose.

```bash
docker compose up -d postgres_db postgres_test
```

4. Aplicar migrations.

```bash
npm run db:migrate
npm run test:db-setup
```

5. Iniciar a API.

```bash
npm run dev
```

6. Implementar alterações.

7. Rodar lint.

```bash
npm run lint
```

8. Rodar testes.

```bash
npm test
```

9. Abrir Pull Request.

## 🧯 Troubleshooting

### Erro: banco indisponível

Verifique se o PostgreSQL está rodando.

```bash
docker compose ps
```

Se necessário, suba novamente:

```bash
docker compose up -d postgres_db
```

### Erro: porta 5432 já está em uso

Algum PostgreSQL local pode estar usando a porta.

Opções:

- Parar o PostgreSQL local.
- Alterar a porta no `docker-compose.yml`.
- Usar apenas o banco local e ajustar `DATABASE_URL`.

### Erro: porta 3000 já está em uso

Verifique processos usando a porta ou altere a variável:

```env
PORT=3001
```

### Erro: Prisma Client não gerado

Execute:

```bash
npx prisma generate
```

### Erro: migrations não aplicadas

Execute:

```bash
npm run db:migrate
```

Para o banco de testes:

```bash
npm run test:db-setup
```

### Erro: testes falhando por conexão com banco

Confirme se o banco de testes está ativo na porta `5433`.

```bash
docker compose up -d postgres_test
```

Depois aplique migrations:

```bash
npm run test:db-setup
```

### Swagger não aparece em `/api/docs`

Gere a documentação manualmente:

```bash
npm run swagger
```

Depois reinicie a API:

```bash
npm run dev
```

### E-mails de recuperação não chegam

Verifique as variáveis SMTP:

```env
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
```

Em desenvolvimento, recomenda-se usar Mailtrap ou serviço equivalente.

## ✅ Checklist Antes de Abrir PR

Antes de abrir um Pull Request, rode:

```bash
npm run lint
npm test
```

Também vale conferir:

- **A API sobe localmente.**
- **As migrations estão aplicadas.**
- **O Swagger foi atualizado se houve mudança de contrato.**
- **As variáveis novas foram documentadas no `.env.example`.**
- **Novos fluxos relevantes possuem teste.**