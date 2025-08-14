# Dockerfile

FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm install
RUN npm run build
EXPOSE 3000
EXPOSE 9229 
CMD ["npm", "run", "start:debug"] 
