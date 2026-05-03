import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// 1. Cria o pool de conexões com o banco via driver nativo
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Instancia o adaptador do Prisma para o Postgres
const adapter = new PrismaPg(pool);

// 3. Inicializa o cliente com o adaptador
const prisma = new PrismaClient({ adapter });

export default prisma;
