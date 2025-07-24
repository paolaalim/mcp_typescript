FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public # Comentário removido desta linha
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
