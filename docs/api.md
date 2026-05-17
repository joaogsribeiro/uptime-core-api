# 📘 **API**

Este documento descreve os endpoints da UptimeCore API, o modelo de autenticação, exemplos de requisição, respostas esperadas, documentação Swagger e collection do Insomnia.

---

## 🔎 **Visão Geral**

A UptimeCore API expõe endpoints REST para:

* Apresentação da API.
* Health check.
* Registro e autenticação de usuários.
* Recuperação de senha.
* Gerenciamento de usuários.
* Gerenciamento de monitores.
* Consulta administrativa de métricas.

---

## 🌐 **Base URLs**

### Local

```text
http://localhost:3000
```

### Produção

```text
https://uptime-core-api.onrender.com
```

---

## 📖 **Documentação Interativa**

A documentação Swagger está disponível em:

### Local

```text
http://localhost:3000/api/docs
```

### Produção

```text
https://uptime-core-api.onrender.com/api/docs
```

---

## 🧪 **Collection do Insomnia**

O projeto também possui uma collection do Insomnia em:

```text
docs/insomnia/UptimeCore_API_Insomnia_2026-05-11.yaml
```

Essa collection pode ser importada no Insomnia para testar os endpoints da API com mais praticidade.

---

## 🔐 **Autenticação**

A API utiliza autenticação via JWT.

Após realizar login, o cliente recebe um token. Esse token deve ser enviado nas rotas protegidas usando o header `Authorization`.

```http
Authorization: Bearer jwt-token
```

Exemplo:

```bash
curl http://localhost:3000/api/monitors \
  -H "Authorization: Bearer jwt-token"
```

---

## 👤 **Perfis de Acesso**

| Perfil  | Descrição                                                              |
| ------- | ---------------------------------------------------------------------- |
| `USER`  | Pode gerenciar o próprio perfil e seus próprios monitores              |
| `ADMIN` | Pode acessar rotas administrativas e recursos com permissões ampliadas |

---

## 📦 **Convenções de Resposta**

A API utiliza respostas JSON.

### Exemplo de sucesso

```json
{
  "status": "ok"
}
```

### Exemplo de erro

```json
{
  "error": "Mensagem descritiva do erro."
}
```

---

## 📡 **Status Codes**

| Status | Significado                                         |
| ------ | --------------------------------------------------- |
| `200`  | Requisição processada com sucesso                   |
| `201`  | Recurso criado com sucesso                          |
| `204`  | Recurso removido com sucesso, sem corpo de resposta |
| `400`  | Dados inválidos ou obrigatórios ausentes            |
| `401`  | Não autenticado ou credenciais inválidas            |
| `403`  | Usuário autenticado sem permissão                   |
| `404`  | Recurso ou rota não encontrada                      |
| `500`  | Erro interno do servidor                            |

---

# 🧩 **Endpoints**

## 🌍 **Geral**

### Apresentação da API

```http
GET /
GET /api
```

Retorna informações básicas sobre a API, versão, documentação e principais grupos de endpoints.

#### Exemplo de resposta

```json
{
  "status": "ok",
  "name": "UptimeCore API",
  "version": "1.0.0",
  "description": "API de monitoramento de disponibilidade e tempo de resposta",
  "documentation": "/api/docs",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "users": "/api/users",
    "monitors": "/api/monitors",
    "admin": "/api/admin"
  }
}
```

### Health Check

```http
GET /api/health
```

Verifica se a API está online.

#### Exemplo de resposta

```json
{
  "status": "ok",
  "timestamp": "2026-05-17T17:00:00-03:00"
}
```

---

## 🔐 **Autenticação**

### Registrar Usuário

```http
POST /api/auth/register
```

Cria um novo usuário.

#### Body

```json
{
  "name": "João da Silva",
  "email": "joao@example.com",
  "password": "123456"
}
```

#### Exemplo com cURL

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João da Silva",
    "email": "joao@example.com",
    "password": "123456"
  }'
```

#### Exemplo de resposta

```json
{
  "id": "user-uuid",
  "name": "João da Silva",
  "email": "joao@example.com",
  "role": "USER",
  "createdAt": "2026-05-17T20:00:00.000Z"
}
```

### Login

```http
POST /api/auth/login
```

Autentica um usuário e retorna um token JWT.

#### Body

```json
{
  "email": "joao@example.com",
  "password": "123456"
}
```

#### Exemplo com cURL

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "123456"
  }'
```

#### Exemplo de resposta

```json
{
  "user": {
    "id": "user-uuid",
    "name": "João da Silva",
    "email": "joao@example.com",
    "role": "USER"
  },
  "token": "jwt-token"
}
```

### Solicitar Recuperação de Senha

```http
POST /api/auth/forgot-password
```

Gera um token de recuperação de senha e envia por e-mail.

#### Body

```json
{
  "email": "joao@example.com"
}
```

#### Exemplo de resposta

```json
{
  "message": "Se o e-mail existir, um link de recuperação será enviado."
}
```

Por segurança, a API retorna a mesma mensagem mesmo quando o e-mail não existe. Isso evita enumeração de usuários.

### Redefinir Senha

```http
POST /api/auth/reset-password
```

Redefine a senha usando o token recebido por e-mail.

#### Body

```json
{
  "email": "joao@example.com",
  "token": "token-de-recuperacao",
  "newPassword": "nova-senha-123"
}
```

#### Exemplo de resposta

```json
{
  "message": "Senha atualizada com sucesso."
}
```

---

## 👥 **Usuários**

Todas as rotas de usuários exigem autenticação JWT.

```http
Authorization: Bearer jwt-token
```

### Listar Usuários

```http
GET /api/users
```

Lista todos os usuários.

Requer perfil `ADMIN`.

#### Exemplo com cURL

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer jwt-token"
```

#### Exemplo de resposta

```json
[
  {
    "id": "user-uuid",
    "name": "João da Silva",
    "email": "joao@example.com",
    "role": "USER",
    "createdAt": "2026-05-17T20:00:00.000Z"
  }
]
```

### Buscar Usuário por ID

```http
GET /api/users/:id
```

Retorna os dados de um usuário.

Um usuário comum só pode consultar o próprio perfil. Usuários administradores podem consultar outros usuários.

#### Exemplo de resposta

```json
{
  "id": "user-uuid",
  "name": "João da Silva",
  "email": "joao@example.com",
  "role": "USER",
  "createdAt": "2026-05-17T20:00:00.000Z"
}
```

### Atualizar Usuário

```http
PUT /api/users/:id
```

Atualiza dados básicos de um usuário.

#### Body

```json
{
  "name": "João da Silva",
  "email": "joao.guilherme@example.com"
}
```

#### Exemplo de resposta

```json
{
  "id": "user-uuid",
  "name": "João da Silva",
  "email": "joao.guilherme@example.com",
  "role": "USER",
  "updatedAt": "2026-05-17T20:30:00.000Z"
}
```

### Remover Usuário

```http
DELETE /api/users/:id
```

Remove um usuário.

#### Resposta

```http
204 No Content
```

---

## 🌐 **Monitores**

Todas as rotas de monitores exigem autenticação JWT.

```http
Authorization: Bearer jwt-token
```

### Criar Monitor

```http
POST /api/monitors
```

Cria um monitor para uma URL.

#### Body

```json
{
  "name": "UptimeCore API",
  "url": "https://uptime-core-api.onrender.com/api/health",
  "interval_minutes": 5
}
```

#### Exemplo com cURL

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

#### Exemplo de resposta

```json
{
  "id": "monitor-uuid",
  "userId": "user-uuid",
  "name": "UptimeCore API",
  "url": "https://uptime-core-api.onrender.com/api/health",
  "interval_minutes": 5,
  "status": "ACTIVE",
  "createdAt": "2026-05-17T20:00:00.000Z",
  "updatedAt": "2026-05-17T20:00:00.000Z"
}
```

### Listar Monitores

```http
GET /api/monitors
```

Lista os monitores do usuário autenticado.

#### Exemplo de resposta

```json
[
  {
    "id": "monitor-uuid",
    "userId": "user-uuid",
    "name": "UptimeCore API",
    "url": "https://uptime-core-api.onrender.com/api/health",
    "interval_minutes": 5,
    "status": "ACTIVE",
    "createdAt": "2026-05-17T20:00:00.000Z",
    "updatedAt": "2026-05-17T20:00:00.000Z"
  }
]
```

### Buscar Monitor por ID

```http
GET /api/monitors/:id
```

Retorna os detalhes de um monitor.

Usuários comuns só podem acessar monitores próprios. Administradores podem acessar monitores de outros usuários.

#### Exemplo de resposta

```json
{
  "id": "monitor-uuid",
  "userId": "user-uuid",
  "name": "UptimeCore API",
  "url": "https://uptime-core-api.onrender.com/api/health",
  "interval_minutes": 5,
  "status": "ACTIVE",
  "createdAt": "2026-05-17T20:00:00.000Z",
  "updatedAt": "2026-05-17T20:00:00.000Z",
  "user": {
    "name": "João da Silva",
    "email": "joao@example.com"
  }
}
```

### Atualizar Monitor

```http
PUT /api/monitors/:id
```

Atualiza dados de um monitor.

#### Body

```json
{
  "name": "UptimeCore Production API",
  "url": "https://uptime-core-api.onrender.com/api/health",
  "interval_minutes": 10,
  "status": "ACTIVE"
}
```

Valores possíveis para `status`:

```text
ACTIVE
PAUSED
```

#### Exemplo de resposta

```json
{
  "id": "monitor-uuid",
  "userId": "user-uuid",
  "name": "UptimeCore Production API",
  "url": "https://uptime-core-api.onrender.com/api/health",
  "interval_minutes": 10,
  "status": "ACTIVE",
  "createdAt": "2026-05-17T20:00:00.000Z",
  "updatedAt": "2026-05-17T20:30:00.000Z"
}
```

### Remover Monitor

```http
DELETE /api/monitors/:id
```

Remove um monitor.

#### Resposta

```http
204 No Content
```

---

## 🛠️ **Administração**

Todas as rotas administrativas exigem:

1. Token JWT válido.
2. Perfil `ADMIN`.

### Status Administrativo

```http
GET /api/admin/status
```

Retorna métricas gerais do sistema.

#### Exemplo com cURL

```bash
curl http://localhost:3000/api/admin/status \
  -H "Authorization: Bearer jwt-token"
```

#### Exemplo de resposta

```json
{
  "system": "UptimeCore",
  "metrics": {
    "users": 10,
    "monitors": 25
  }
}
```

---

## 📋 **Resumo dos Endpoints**

| Método   | Rota                        | Autenticação | Descrição                      |
| -------- | --------------------------- | ------------ | ------------------------------ |
| `GET`    | `/`                         | Não          | Apresentação da API            |
| `GET`    | `/api`                      | Não          | Apresentação da API            |
| `GET`    | `/api/health`               | Não          | Health check                   |
| `POST`   | `/api/auth/register`        | Não          | Registrar usuário              |
| `POST`   | `/api/auth/login`           | Não          | Login                          |
| `POST`   | `/api/auth/forgot-password` | Não          | Solicitar recuperação de senha |
| `POST`   | `/api/auth/reset-password`  | Não          | Redefinir senha                |
| `GET`    | `/api/users`                | Admin        | Listar usuários                |
| `GET`    | `/api/users/:id`            | JWT          | Buscar usuário                 |
| `PUT`    | `/api/users/:id`            | JWT          | Atualizar usuário              |
| `DELETE` | `/api/users/:id`            | JWT          | Remover usuário                |
| `POST`   | `/api/monitors`             | JWT          | Criar monitor                  |
| `GET`    | `/api/monitors`             | JWT          | Listar monitores               |
| `GET`    | `/api/monitors/:id`         | JWT          | Buscar monitor                 |
| `PUT`    | `/api/monitors/:id`         | JWT          | Atualizar monitor              |
| `DELETE` | `/api/monitors/:id`         | JWT          | Remover monitor                |
| `GET`    | `/api/admin/status`         | Admin        | Métricas administrativas       |

---

## ❌ **Erros Comuns**

### Token ausente ou inválido

```json
{
  "error": "Token não fornecido."
}
```

ou:

```json
{
  "error": "Token inválido."
}
```

### Credenciais inválidas

```json
{
  "error": "Usuário ou senha incorretos."
}
```

### Acesso negado

```json
{
  "error": "Acesso negado. Apenas administradores podem acessar esta rota."
}
```

### Recurso não encontrado

```json
{
  "error": "Monitor não encontrado."
}
```

### URL inválida

```json
{
  "error": "Formato de URL inválido."
}
```

---

## 📝 **Observações**

* Todas as respostas são em JSON.
* Rotas protegidas exigem token JWT no header `Authorization`.
* Usuários comuns só podem acessar recursos próprios.
* Administradores possuem permissões ampliadas.
* O Swagger deve ser usado como fonte interativa para explorar os contratos da API.
* A collection do Insomnia ajuda a testar os fluxos sem precisar montar todas as requisições manualmente.