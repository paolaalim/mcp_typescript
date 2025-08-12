// src/index.ts

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js'; // Importa a configuração validada
import apiRoutes from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// -- Configuração do Servidor --

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const toolStatus = {
  'word-count': { status: 'online' },
  'generate-uuid': { status: 'online' },
  'ai-tool': { status: 'offline' } 
};
app.set('toolStatus', toolStatus);

// -- Rotas Principais --

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json(toolStatus);
});

// Conecta todas as rotas da API sob o prefixo /api
app.use('/api', apiRoutes);

// -- Inicialização do Servidor --

app.listen(config.PORT, () => {
  console.log(`⚡ Servidor MCP rodando na porta ${config.PORT}`);
  console.log(`🌐 Interface: http://localhost:${config.PORT}/`);
});
