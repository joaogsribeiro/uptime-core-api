# ⚙️ Operações

Este documento reúne as informações operacionais da UptimeCore API: Docker, deploy, CI/CD, segurança, observabilidade, health check e cuidados para execução em produção.

O objetivo é documentar como a aplicação é empacotada, publicada, monitorada e mantida.

## 📚 Sumário

- [Visão Geral](#-visão-geral)
- [Docker](#-docker)
- [Docker Compose](#-docker-compose)
- [Deploy](#-deploy)
- [CI/CD](#-cicd)
- [Health Check](#-health-check)
- [Segurança](#-segurança)
- [Observabilidade](#-observabilidade)
- [Logs](#-logs)
- [Banco de Dados em Produção](#-banco-de-dados-em-produção)
- [Variáveis de Produção](#-variáveis-de-produção)
- [Checklist de Produção](#-checklist-de-produção)
- [Roadmap Operacional](#-roadmap-operacional)

## 🧭 Visão Geral

A UptimeCore API foi preparada para execução conteinerizada com **Docker** e deploy em ambiente gerenciado.

A aplicação utiliza:

- **Dockerfile** para empacotar a API.
- **Docker Compose** para desenvolvimento local com PostgreSQL.
- **GitHub Actions** para CI/CD.
- **SonarCloud** para análise de qualidade.
- **Render** para deploy em produção.
- **Prisma Migrate** para aplicar migrations.
- **Health check** para validação operacional.

Fluxo geral:

```mermaid
flowchart TD
    Dev[Desenvolvedor] --> GitHub[GitHub Repository]
    GitHub --> Actions[GitHub Actions]
    Actions --> Lint[ESLint]
    Actions --> Tests[Jest + Supertest]
    Actions --> Sonar[SonarCloud]
    Actions --> Deploy[Render Deploy Hook]
    Deploy --> Render[Render Service]
    Render --> Docker[Docker Build]
    Docker --> Prisma[Prisma Migrate]
    Prisma --> API[UptimeCore API]
    API --> DB[(PostgreSQL)]
```

## 🐳 Docker

O projeto possui um `Dockerfile` para construir a imagem da API.

### Dockerfile

Fluxo principal do build:

1. Usa imagem base `node:24-alpine`.
2. Define o diretório de trabalho `/usr/src/app`.
3. Copia `package.json` e `package-lock.json`.
4. Instala dependências com `npm ci`.
5. Copia o restante do código.
6. Gera o Prisma Client.
7. Gera a documentação Swagger.
8. Expõe a porta `3000`.
9. Inicia a API aplicando migrations antes do servidor.

### Comando de produção

O container executa:

```bash
npx prisma migrate deploy && node src/server.js
```

Isso garante que as migrations pendentes sejam aplicadas antes da API começar a atender requisições.

### Build manual da imagem

```bash
docker build -t uptime-core-api .
```

### Executar container manualmente

```bash
docker run -p 3000:3000 --env-file .env uptime-core-api
```

## 🧩 Docker Compose

O `docker-compose.yml` é usado principalmente para desenvolvimento local e testes.

### Subir todos os serviços

```bash
docker compose up --build
```

### Subir em background

```bash
docker compose up -d --build
```

### Parar serviços

```bash
docker compose down
```

### Parar serviços e remover volumes

```bash
docker compose down -v
```

### Serviços

| Serviço | Descrição | Porta |
|---|---|---|
| `api` | Aplicação Node.js/Express | `3000` |
| `postgres_db` | Banco PostgreSQL principal | `5432` |
| `postgres_test` | Banco PostgreSQL de testes | `5433` |

### Volumes

| Volume | Descrição |
|---|---|
| `pgdata` | Persistência do banco principal |
| `pg_test_data` | Persistência do banco de testes |

### Health check do banco

O serviço `postgres_db` possui health check com:

```bash
pg_isready -U admin -d api_monitor_db
```

A API só inicia depois que o banco principal estiver saudável.

### Comando da API no Compose

No Docker Compose, a API executa:

```bash
npx prisma generate && npx prisma migrate deploy && npm run dev
```

Isso permite rodar o ambiente local com hot reload via `nodemon`.

## 🚀 Deploy

A aplicação está publicada na **Render**.

### URLs de produção

- API: [https://uptime-core-api.onrender.com/api](https://uptime-core-api.onrender.com/api)
- Swagger: [https://uptime-core-api.onrender.com/api/docs](https://uptime-core-api.onrender.com/api/docs)

### Estratégia de deploy

O deploy é acionado por meio de um **Render Deploy Hook** configurado como secret no GitHub Actions.

Fluxo:

1. Push ou Pull Request nas branches `develop` ou `main`.
2. GitHub Actions executa validações.
3. Pipeline roda lint.
4. Pipeline executa testes com banco PostgreSQL temporário.
5. Pipeline envia cobertura para análise do SonarCloud.
6. Pipeline chama o deploy hook da Render.
7. Render constrói a imagem Docker.
8. Container executa migrations.
9. API sobe em produção.

### Variável necessária no GitHub

```text
RENDER_DEPLOY_HOOK
```

Essa secret deve conter a URL do deploy hook gerado pela Render.

## 🔁 CI/CD

A pipeline está definida em:

```text
.github/workflows/pipeline.yml
```

Ela roda em:

```yaml
push:
  branches: ["develop", "main"]

pull_request:
  branches: ["develop", "main"]
```

## 🔎 Etapas da Pipeline

### Checkout do código

Usa:

```yaml
actions/checkout@v4
```

Com `fetch-depth: 0`, necessário para análises mais completas no SonarCloud.

### Setup do Node.js

Usa Node.js 24:

```yaml
node-version: "24"
```

### Instalação de dependências

```bash
npm ci
```

O `npm ci` garante instalação limpa e reprodutível baseada no `package-lock.json`.

### Geração do Prisma Client

```bash
npx prisma generate
```

### Análise estática

```bash
npm run lint
```

### Banco de testes

A pipeline provisiona um PostgreSQL temporário com:

| Campo | Valor |
|---|---|
| Usuário | `admin` |
| Senha | `admin` |
| Banco | `api_monitor_test_db` |
| Porta externa | `5433` |

### Configuração do `.env.test`

A pipeline cria dinamicamente:

```env
DATABASE_URL="postgresql://admin:admin@localhost:5433/api_monitor_test_db?schema=public"
JWT_SECRET="segredo_super_seguro_da_pipeline"
PORT=3001
```

### Migrations de teste

```bash
npm run test:db-setup
```

### Testes e cobertura

```bash
npm test -- --coverage
```

### SonarCloud

A análise de qualidade usa:

```yaml
SonarSource/sonarcloud-github-action@master
```

Secrets necessárias:

```text
GITHUB_TOKEN
SONAR_TOKEN
```

### Deploy

Ao final da pipeline, o deploy é acionado com:

```bash
curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## 🩺 Health Check

A API possui endpoint de health check em:

```http
GET /api/health
```

### Local

```bash
curl http://localhost:3000/api/health
```

### Produção

```bash
curl https://uptime-core-api.onrender.com/api/health
```

### Exemplo de resposta

```json
{
  "status": "ok",
  "timestamp": "2026-05-17T17:00:00-03:00"
}
```

O timestamp é formatado no fuso:

```text
America/Sao_Paulo
```

### Uso recomendado

Esse endpoint pode ser usado por:

- Render.
- Load balancers.
- Uptime monitors.
- Checks externos.
- Pipelines de smoke test.

## 🔐 Segurança

A aplicação possui algumas medidas importantes de segurança.

### Autenticação

- Uso de **JWT** para autenticação stateless.
- Tokens assinados com `JWT_SECRET`.
- Expiração configurável por `JWT_EXPIRES_IN`.

### Senhas

- Senhas não são armazenadas em texto puro.
- Hash de senha com **bcryptjs**.
- Salt gerado antes do hash.

### Autorização

- Rotas protegidas exigem token JWT.
- Rotas administrativas exigem perfil `ADMIN`.
- Usuários comuns só acessam recursos próprios.
- Controllers aplicam validações contra acesso indevido a recursos de terceiros.

### Recuperação de senha

- Token aleatório gerado com `crypto`.
- Expiração de token em 1 hora.
- Resposta genérica para solicitação de recuperação, evitando enumeração de e-mails.
- Token é removido após redefinição bem-sucedida.

### CORS

O CORS é configurável por variável de ambiente:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Se `ALLOWED_ORIGINS` não for definido, a aplicação usa fallback permissivo.

### Headers

A aplicação remove o header:

```text
X-Powered-By
```

Isso reduz exposição de informações sobre a stack.

### Validações

A API valida:

- Campos obrigatórios em fluxos críticos.
- Formato de URL em monitores.
- Permissões por usuário e por role.

## 🛡️ Recomendações de Segurança Futuras

Para endurecimento em produção, recomenda-se adicionar:

- **Helmet** para headers HTTP seguros.
- **Rate limiting** para reduzir abuso em login e recuperação de senha.
- **Request validation** com biblioteca dedicada, como Zod ou Joi.
- **Refresh token rotation**.
- **Revogação de tokens**.
- **Auditoria de ações administrativas**.
- **Logs estruturados de segurança**.
- **Bloqueio temporário após múltiplas tentativas de login.**
- **Separação de segredos por ambiente.**

## 📈 Observabilidade

A observabilidade atual é baseada em:

- Endpoint `/api/health`.
- Logs de inicialização.
- Logs de erro em controllers.
- Registro persistente de execuções de checagem.
- Registro persistente de incidentes.
- Registro persistente de alertas.

### Dados operacionais persistidos

| Entidade | Uso operacional |
|---|---|
| `CheckExecution` | Histórico de checagens e tempo de resposta |
| `Incident` | Acompanhamento de falhas abertas e resolvidas |
| `Alert` | Rastreamento de alertas enviados |

Essas entidades permitem evoluir a aplicação para dashboards, métricas e relatórios de disponibilidade.

## 📝 Logs

Atualmente, a aplicação utiliza logs via `console`.

Exemplos de eventos logados:

- Inicialização do servidor.
- Erros ao criar usuário.
- Erros de autenticação.
- Erros ao gerenciar monitores.
- Erros no fluxo de recuperação de senha.
- Erros ao buscar métricas administrativas.

### Recomendações futuras para logs

Para produção, recomenda-se evoluir para logs estruturados com:

- **Pino** ou **Winston**.
- Correlação por request ID.
- Nível de log por ambiente.
- Redação de dados sensíveis.
- Integração com ferramenta externa de logs.
- Separação entre logs operacionais e logs de auditoria.

## 🗄️ Banco de Dados em Produção

A aplicação usa PostgreSQL com Prisma.

### Migrations

Em produção, as migrations são aplicadas com:

```bash
npx prisma migrate deploy
```

Esse comando é adequado para ambientes produtivos porque aplica migrations já versionadas, sem tentar criar novas migrations interativamente.

### Prisma Client

O Prisma Client é gerado durante o build da imagem Docker:

```bash
npx prisma generate
```

### Boas práticas

- Usar banco PostgreSQL gerenciado em produção.
- Configurar backups automáticos.
- Restringir acesso externo ao banco.
- Usar credenciais diferentes por ambiente.
- Monitorar uso de CPU, memória, conexões e armazenamento.
- Evitar executar `prisma migrate dev` em produção.
- Validar migrations em ambiente de staging antes de produção.

## 🔑 Variáveis de Produção

Em produção, configure as variáveis no provedor de deploy.

### Obrigatórias

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=
JWT_EXPIRES_IN=1d
DATABASE_URL=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
ALLOWED_ORIGINS=
```

### Recomendações

- `JWT_SECRET` deve ser longo, aleatório e exclusivo por ambiente.
- `DATABASE_URL` deve apontar para o banco de produção.
- `ALLOWED_ORIGINS` deve permitir apenas domínios confiáveis.
- Credenciais SMTP devem ser de um provedor confiável.
- Secrets nunca devem ser commitadas no repositório.

## ✅ Checklist de Produção

Antes de publicar uma nova versão, confira:

- **Variáveis de ambiente configuradas no provedor.**
- **Banco de produção acessível pela aplicação.**
- **Migrations revisadas e versionadas.**
- **`DATABASE_URL` apontando para o ambiente correto.**
- **`JWT_SECRET` forte e exclusivo.**
- **`ALLOWED_ORIGINS` restrito.**
- **SMTP configurado para recuperação de senha.**
- **Swagger acessível, se desejado em produção.**
- **Endpoint `/api/health` respondendo.**
- **Pipeline passando com lint e testes.**
- **SonarCloud sem alertas críticos.**
- **Deploy hook configurado como secret.**
- **Logs verificados após subida.**

## 🧪 Smoke Test Pós-Deploy

Após o deploy, execute verificações rápidas.

### Health check

```bash
curl https://uptime-core-api.onrender.com/api/health
```

### Apresentação da API

```bash
curl https://uptime-core-api.onrender.com/api
```

### Swagger

Abra no navegador:

```text
https://uptime-core-api.onrender.com/api/docs
```

### Login ou registro

Teste um fluxo básico de autenticação para garantir que API, banco e JWT estão funcionando.

## 🧭 Roadmap Operacional

Melhorias recomendadas para evolução operacional:

- [ ] Adicionar Helmet.
- [ ] Adicionar rate limiting.
- [ ] Adicionar logs estruturados com Pino ou Winston.
- [ ] Adicionar request ID.
- [ ] Adicionar métricas Prometheus.
- [ ] Adicionar endpoint `/metrics`.
- [ ] Adicionar tracing distribuído.
- [ ] Adicionar dashboard de uptime.
- [ ] Adicionar alertas por webhook.
- [ ] Adicionar integração com Slack ou Discord.
- [ ] Separar worker de monitoramento da API HTTP.
- [ ] Adicionar fila para checagens.
- [ ] Adicionar ambiente de staging.
- [ ] Adicionar deploy preview para Pull Requests.
- [ ] Adicionar auditoria para ações administrativas.