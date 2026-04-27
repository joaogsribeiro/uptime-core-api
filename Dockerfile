# Usa a imagem oficial do Node.js (versão 24, a mesma da sua máquina)
FROM node:24-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependência primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

# Expõe a porta que a API vai rodar
EXPOSE 3000

# Comando para iniciar o servidor (em dev)
CMD ["npm", "run", "dev"]