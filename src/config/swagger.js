import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.join(currentDir, 'swagger-output.json');

const fallbackSpec = {
  openapi: '3.0.0',
  info: {
    title: 'UptimeCore API',
    version: '1.0.0',
    description: 'Documentação interativa da API do UptimeCore.',
  },
  paths: {},
};

const swaggerSpec = fs.existsSync(specPath)
  ? JSON.parse(fs.readFileSync(specPath, 'utf8'))
  : fallbackSpec;

export default swaggerSpec;
