# 🟢 UptimeCore API

Uma API RESTful desenvolvida em Node.js para monitoramento de disponibilidade de serviços e URLs. Este projeto está sendo construído de forma iterativa, com foco em boas práticas de engenharia de software, conteinerização e arquitetura moderna.

---

## 🛠️ Tecnologias e Decisões Arquiteturais

* **Node.js 24 (ES Modules):** Utilização nativa do padrão ESM (`import`/`export`) para um código mais limpo e alinhado aos padrões atuais do JavaScript.
* **Express.js:** Framework minimalista para roteamento da API.
* **PostgreSQL:** Banco de dados relacional escolhido pela sua robustez e integridade de dados.
* **Prisma ORM (v7):** Configurado utilizando a arquitetura moderna de **Driver Adapters** em conjunto com o pacote nativo `pg` para gerenciamento de *Connection Pooling*, garantindo alta performance e tipagem segura.
* **Docker & Docker Compose:** Todo o ecossistema (API e Banco de Dados) está 100% conteinerizado para eliminar divergências de ambiente e facilitar testes locais.
* **Bcryptjs:** Criptografia de via única (Blowfish) para armazenamento seguro de credenciais.

---

## 📦 Escopo Atual (Semana 1 - MVP Base)

Até o momento, a fundação de infraestrutura está concluída e as seguintes entidades de domínio estão operacionais:

* **Usuários (Users):** Rotas de CRUD completas, com ofuscação de dados sensíveis nas respostas HTTP.
* **Monitores (Monitors):** Rotas de CRUD completas. Implementação de integridade referencial com exclusão em cascata (Cascade Delete) e validação nativa de formato de URLs.

---

## 🚀 Como Executar o Projeto Localmente

O projeto foi desenhado para ser executado com o mínimo de atrito possível.

**Pré-requisitos:**
* [Docker](https://www.docker.com/) e Docker Compose instalados na máquina.

**Passo a passo:**

1. Clone o repositório:
```bash
git clone https://github.com/joaogsribeiro/uptime-core-api.git
cd uptime-core-api
```

2. Suba a infraestrutura completa (Banco e API) via Docker:
```bash
docker-compose up -d --build
```
> O servidor estará disponível na porta `3000` e o banco PostgreSQL na porta `5432`.

3. A aplicação executará automaticamente as migrações do banco de dados na inicialização do contêiner da API.

---

## 🧪 Testes de API

Para facilitar a avaliação das rotas, uma *Collection* completa do Postman foi versionada junto ao projeto.
* Importe o arquivo localizado em `docs/User_CRUD.postman_collection.json` no seu Postman ou Insomnia para ter acesso imediato aos *payloads* de teste.

---

## 👨‍💻 Autor

**João Guilherme**
Desenvolvido como desafio prático de engenharia de backend.