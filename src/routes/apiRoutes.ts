import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import apiRoutes from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();


// -- Configuração do Servidor --

app.use(express.json()); // Middleware para interpretar JSON

app.use(express.static(path.join(__dirname, '../public'))); // Servir arquivos estáticos

// Central de Controle de Status das Ferramentas

const toolStatus = {

  'word-count': { status: 'online' },

  'generate-uuid': { status: 'online' },

  'ai-tool': { status: 'offline' }

};

// Disponibiliza o status para toda a aplicação (para o middleware de rotas acessar)

app.set('toolStatus', toolStatus);
// -- Rotas da Aplicação --


// Rota de Health Check para monitoramento

app.get('/health', (req: Request, res: Response) => {

  res.json({

    status: 'healthy',

    timestamp: new Date().toISOString(),

    uptime: process.uptime()

  });

});


// Rota para a interface web obter o status das ferramentas

app.get('/api/status', (req: Request, res: Response) => {

  res.json(toolStatus);

});

// Conecta todas as rotas da API sob o prefixo /api
app.use('/api', apiRoutes);

// -- Inicialização do Servidor --
app.listen(config.PORT, () => {

  console.log('-------------------------------------------');

  console.log(`⚡ Servidor MCP rodando na porta ${config.PORT}`);

  console.log(`🌐 Interface: http://localhost:${config.PORT}/`);

  console.log('-------------------------------------------');

});
