const app = {
  get: () => {},
  post: () => {},
  put: () => {},
  delete: () => {},
};

app.get('/api', (req, res) => {
  /* #swagger.tags = ['General'] */
  /* #swagger.summary = 'Apresentação da API (prefixo /api)' */
  /* #swagger.description = 'Espelha a rota raiz e retorna informações sobre a API, versão e links para endpoints principais.' */
  /* #swagger.responses[200] = { description: 'Informações sobre a API.' } */
  res.status(200).json({ status: 'ok', name: 'UptimeCore API', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  /* #swagger.tags = ['Health'] */
  /* #swagger.summary = 'Verifica se a API está operacional' */
  /* #swagger.description = 'Retorna o status atual da API e um timestamp no fuso de São Paulo.' */
  /* #swagger.responses[200] = { description: 'API operacional.' } */
  res.status(200).json({ status: 'ok', timestamp: '2026-05-17T12:00:00-03:00' });
});

app.post('/api/auth/register', (req, res) => {
  /* #swagger.tags = ['Auth'] */
  /* #swagger.summary = 'Cria um novo usuário' */
  /* #swagger.description = 'Registra um usuário com nome, e-mail e senha. O e-mail deve ser único.' */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "João Silva" },
                email: { type: "string", example: "joao@exemplo.com" },
                password: { type: "string", example: "senha-segura" }
              }
            }
          }
        }
      } */
  /* #swagger.responses[201] = { description: 'Usuário criado com sucesso.' } */
  /* #swagger.responses[400] = { description: 'Dados obrigatórios ausentes ou e-mail já em uso.' } */
  /* #swagger.responses[500] = { description: 'Erro interno do servidor.' } */
  res.status(201).json({
    id: 'id',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'USER',
    createdAt: '2026-05-17T12:00:00-03:00',
  });
});

app.post('/api/auth/login', (req, res) => {
  /* #swagger.tags = ['Auth'] */
  /* #swagger.summary = 'Autentica um usuário' */
  /* #swagger.description = 'Valida e-mail e senha e retorna o usuário autenticado com um token JWT.' */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", example: "joao@exemplo.com" },
                password: { type: "string", example: "senha-segura" }
              }
            }
          }
        }
      } */
  /* #swagger.responses[200] = { description: 'Autenticação realizada com sucesso.' } */
  /* #swagger.responses[400] = { description: 'E-mail ou senha ausentes.' } */
  /* #swagger.responses[401] = { description: 'Usuário ou senha incorretos.' } */
  /* #swagger.responses[500] = { description: 'Erro interno do servidor.' } */
  res.status(200).json({
    user: { id: 'id', name: 'João Silva', email: 'joao@exemplo.com', role: 'USER' },
    token: 'jwt-token',
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  /* #swagger.tags = ['Auth'] */
  /* #swagger.summary = 'Solicita recuperação de senha' */
  /* #swagger.description = 'Gera um token de recuperação e envia o link por e-mail quando o usuário existir.' */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { email: { type: "string", example: "joao@exemplo.com" } } }
          }
        }
      } */
  /* #swagger.responses[200] = { description: 'Solicitação aceita. O e-mail de recuperação será enviado se o usuário existir.' } */
  /* #swagger.responses[500] = { description: 'Erro interno no servidor ao tentar recuperar a senha.' } */
  res.status(200).json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
});

app.post('/api/auth/reset-password', (req, res) => {
  /* #swagger.tags = ['Auth'] */
  /* #swagger.summary = 'Redefine a senha do usuário' */
  /* #swagger.description = 'Valida e-mail, token e nova senha para concluir a troca de senha.' */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", example: "joao@exemplo.com" },
                token: { type: "string", example: "token-gerado" },
                newPassword: { type: "string", example: "nova-senha" }
              }
            }
          }
        }
      } */
  /* #swagger.responses[200] = { description: 'Senha atualizada com sucesso.' } */
  /* #swagger.responses[400] = { description: 'Campos obrigatórios ausentes, usuário não encontrado, token inválido ou token expirado.' } */
  /* #swagger.responses[500] = { description: 'Erro interno no servidor ao tentar redefinir a senha.' } */
  res.status(200).json({ message: 'Senha atualizada com sucesso.' });
});

app.get('/api/users', (req, res) => {
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Lista todos os usuários' */
  /* #swagger.description = 'Retorna todos os usuários cadastrados. Requer perfil ADMIN.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.responses[200] = { description: 'Lista de usuários retornada com sucesso.' } */
  /* #swagger.responses[403] = { description: 'Acesso negado. Apenas administradores podem listar usuários.' } */
  res.status(200).json([]);
});

app.get('/api/users/:id', (req, res) => {
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Busca um usuário pelo ID' */
  /* #swagger.description = 'Retorna o perfil do usuário autenticado ou de qualquer usuário se o perfil for ADMIN.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'ID do usuário', schema: { type: 'string' } } */
  /* #swagger.responses[200] = { description: 'Usuário encontrado com sucesso.' } */
  /* #swagger.responses[403] = { description: 'Você não tem permissão para ver este perfil.' } */
  /* #swagger.responses[404] = { description: 'Usuário não encontrado.' } */
  res.status(200).json({
    id: 'id',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'USER',
    createdAt: '2026-05-17T12:00:00-03:00',
  });
});

app.put('/api/users/:id', (req, res) => {
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Atualiza um usuário pelo ID' */
  /* #swagger.description = 'Atualiza nome e e-mail do usuário autenticado ou de qualquer usuário se o perfil for ADMIN.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'ID do usuário', schema: { type: 'string' } } */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" } } }
          }
        }
      } */
  /* #swagger.responses[200] = { description: 'Usuário atualizado com sucesso.' } */
  /* #swagger.responses[403] = { description: 'Você não tem permissão para editar este perfil.' } */
  /* #swagger.responses[404] = { description: 'Usuário não encontrado.' } */
  res.status(200).json({
    id: 'id',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'USER',
    updatedAt: '2026-05-17T12:00:00-03:00',
  });
});

app.delete('/api/users/:id', (req, res) => {
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Remove um usuário pelo ID' */
  /* #swagger.description = 'Remove o usuário autenticado ou qualquer usuário se o perfil for ADMIN.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'ID do usuário', schema: { type: 'string' } } */
  /* #swagger.responses[204] = { description: 'Usuário removido com sucesso.' } */
  /* #swagger.responses[403] = { description: 'Você não tem permissão para deletar este perfil.' } */
  /* #swagger.responses[404] = { description: 'Usuário não encontrado.' } */
  res.status(204).send();
});

app.post('/api/monitors', (req, res) => {
  /* #swagger.tags = ['Monitors'] */
  /* #swagger.summary = 'Cria um novo monitor' */
  /* #swagger.description = 'Cria um monitor para acompanhar disponibilidade e tempo de resposta de uma URL.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Site principal" },
                url: { type: "string", example: "https://exemplo.com" },
                interval_minutes: { type: "integer", example: 5 }
              }
            }
          }
        }
      } */
  /* #swagger.responses[201] = { description: 'Monitor criado com sucesso.' } */
  /* #swagger.responses[400] = { description: 'Campos obrigatórios ausentes ou URL inválida.' } */
  /* #swagger.responses[500] = { description: 'Erro interno do servidor.' } */
  res
    .status(201)
    .json({ id: 'id', name: 'Site principal', url: 'https://exemplo.com', interval_minutes: 5 });
});

app.get('/api/monitors', (req, res) => {
  /* #swagger.tags = ['Monitors'] */
  /* #swagger.summary = 'Lista os monitores do usuário' */
  /* #swagger.description = 'Retorna os monitores vinculados ao usuário autenticado.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.responses[200] = { description: 'Lista de monitores retornada com sucesso.' } */
  res.status(200).json([]);
});

app.get('/api/monitors/:id', (req, res) => {
  /* #swagger.tags = ['Monitors'] */
  /* #swagger.summary = 'Busca um monitor pelo ID' */
  /* #swagger.description = 'Retorna os detalhes do monitor, incluindo o dono, quando o usuário tiver permissão.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'ID do monitor', schema: { type: 'string' } } */
  /* #swagger.responses[200] = { description: 'Monitor encontrado com sucesso.' } */
  /* #swagger.responses[403] = { description: 'Você não tem permissão para acessar este monitor.' } */
  /* #swagger.responses[404] = { description: 'Monitor não encontrado.' } */
  res.status(200).json({
    id: 'id',
    name: 'Site principal',
    url: 'https://exemplo.com',
    interval_minutes: 5,
    status: 'up',
  });
});

app.put('/api/monitors/:id', (req, res) => {
  /* #swagger.tags = ['Monitors'] */
  /* #swagger.summary = 'Atualiza um monitor pelo ID' */
  /* #swagger.description = 'Atualiza os dados de um monitor existente, validando permissão e URL quando informada.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'ID do monitor', schema: { type: 'string' } } */
  /* #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { name: { type: "string" }, url: { type: "string" }, interval_minutes: { type: "integer" }, status: { type: "string" } } }
          }
        }
      } */
  /* #swagger.responses[200] = { description: 'Monitor atualizado com sucesso.' } */
  /* #swagger.responses[400] = { description: 'URL inválida.' } */
  /* #swagger.responses[403] = { description: 'Você não tem permissão para editar este monitor.' } */
  /* #swagger.responses[404] = { description: 'Monitor não encontrado.' } */
  res.status(200).json({
    id: 'id',
    name: 'Site principal',
    url: 'https://exemplo.com',
    interval_minutes: 5,
    status: 'up',
  });
});

app.delete('/api/monitors/:id', (req, res) => {
  /* #swagger.tags = ['Monitors'] */
  /* #swagger.summary = 'Remove um monitor pelo ID' */
  /* #swagger.description = 'Remove um monitor existente, respeitando as regras de permissão.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'ID do monitor', schema: { type: 'string' } } */
  /* #swagger.responses[204] = { description: 'Monitor removido com sucesso.' } */
  /* #swagger.responses[403] = { description: 'Você não tem permissão para deletar este monitor.' } */
  /* #swagger.responses[404] = { description: 'Monitor não encontrado.' } */
  res.status(204).send();
});

app.get('/api/admin/status', (req, res) => {
  /* #swagger.tags = ['Admin'] */
  /* #swagger.summary = 'Consulta o status geral do sistema' */
  /* #swagger.description = 'Retorna métricas agregadas do sistema, como total de usuários e monitores. Requer perfil ADMIN.' */
  /* #swagger.security = [{ bearerAuth: [] }] */
  /* #swagger.responses[200] = { description: 'Métricas retornadas com sucesso.' } */
  /* #swagger.responses[500] = { description: 'Erro ao buscar métricas.' } */
  res.status(200).json({ system: 'UptimeCore', metrics: { users: 0, monitors: 0 } });
});

export default app;
