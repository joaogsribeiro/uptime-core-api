import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerAutogen from 'swagger-autogen';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputFile = path.join(rootDir, 'src/config/swagger-output.json');
const endpointsFiles = [path.join(rootDir, 'src/docs/swaggerSource.js')];

const doc = {
  info: {
    title: 'UptimeCore API',
    version: '1.0.0',
    description: 'Documentação interativa da API do UptimeCore.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento',
    },
    {
      url: 'https://uptime-core-api.onrender.com',
      description: 'Servidor de Produção',
    },
  ],
  tags: [
    { name: 'General', description: 'Rotas gerais de entrada e apresentação da API' },
    { name: 'Health', description: 'Verificação de disponibilidade da API' },
    { name: 'Auth', description: 'Autenticação e recuperação de senha' },
    { name: 'Users', description: 'Gerenciamento de usuários' },
    { name: 'Monitors', description: 'Gerenciamento de monitores' },
    { name: 'Admin', description: 'Operações administrativas' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

await swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);

console.log(`Swagger gerado em ${path.relative(rootDir, outputFile)}`);
