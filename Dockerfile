FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public # Adicione esta linha para copiar a pasta public
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
