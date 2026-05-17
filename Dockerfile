# Usa a imagem oficial do Node.js (versão 24, a mesma da sua máquina)
FROM node:24-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependência primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências de forma limpa e exata (melhor prática para CI/CD)
RUN npm ci

# Copia o resto do código da aplicação
COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

# Gera a documentação do Swagger (garante que o arquivo exista antes do app rodar)
RUN npm run swagger

# Expõe a porta que a API vai rodar
EXPOSE 3000

# Comando para iniciar o servidor em PRODUÇÃO
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]