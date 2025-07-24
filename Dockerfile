FROM node:18-alpine

WORKDIR /app

# Copiar todos os arquivos
COPY . .

# Instalar dependências e fazer build
RUN npm install && npm run build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/index.js", "web"]