import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import apiRoutes from './routes/apiRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const toolStatus = {
  'word-count': { status: 'online' },
  'generate-uuid': { status: 'online' },
  // O status da ferramenta de IA agora depende se a chave de API está configurada.
  // Se a chave existir, o status é 'online', caso contrário, é 'offline'.
  'ai-tool': { status: config.CLAUDE_API_KEY ? 'online' : 'offline' }
};

app.set('toolStatus', toolStatus);

// Rotas da Aplicação

// Rota de Health Check para monitoramento
// Responde com o status do servidor, data/hora e tempo de atividade
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota para a interface web obter o status das ferramentas
// Retorna o objeto 'toolStatus' como uma resposta JSON
app.get('/api/status', (req: Request, res: Response) => {
  res.json(toolStatus);
});

// Conecta todas as rotas da API sob o prefixo '/api'
// Qualquer requisição que comece com '/api' será tratada pelo roteador 'apiRoutes'
app.use('/api', apiRoutes);

// Inicialização do Servidor

// Inicia o servidor na porta definida em `config.PORT`
app.listen(config.PORT, () => {
  console.log('-------------------------------------------');
  // Mensagem no console indicando que o servidor foi iniciado com sucesso
  console.log(`Servidor MCP rodando na porta ${config.PORT}`);
  console.log(`Interface: http://localhost:${config.PORT}/`);
  console.log('-------------------------------------------');
});
