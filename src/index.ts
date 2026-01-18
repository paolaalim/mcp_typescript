import 'dotenv/config';

// Importa o Express e os tipos Request e Response para criar o servidor web
import express, { Request, Response } from 'express';
// Importa path para manipulação de caminhos de arquivos
import path from 'path';
// Importa função para converter URLs de arquivo para caminhos (necessário para ES modules)
import { fileURLToPath } from 'url';
// Importa as configurações validadas (variáveis de ambiente)
import { config } from './config.js';
// Importa as rotas da API
import apiRoutes from './routes/apiRoutes.js';


// Converte import.meta.url para caminho de arquivo (compatibilidade ES modules)
const __filename = fileURLToPath(import.meta.url);
// Obtém o diretório do arquivo atual
const __dirname = path.dirname(__filename);
// Cria a instância da aplicação Express
const app = express();

// Configura middlewares do Express
app.use(express.json()); // Middleware para parsing de JSON no corpo das requisições
app.use(express.static(path.join(__dirname, '../public'))); // Serve arquivos estáticos da pasta public

// Objeto que define o status de cada ferramenta disponível
const toolStatus = {
  'word-count': { status: 'online' }, // Contador de palavras sempre online
  'generate-uuid': { status: 'online' }, // Gerador de UUID sempre online
  // O status da ferramenta de IA depende se a chave de API do Gemini está configurada
  // Se a chave existir e não for vazia, o status é 'online', caso contrário, é 'offline'
  'ai-tool': { status: config.GEMINI_API_KEY ? 'online' : 'online' }
};

// Armazena o objeto toolStatus na aplicação Express para acesso global
app.set('toolStatus', toolStatus);

// Rotas da Aplicação

// Rota de Health Check para monitoramento do servidor
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

// Conecta todas as rotas da API sob o prefixo '/api'
app.use('/api', apiRoutes);

// Inicialização do Servidor

// Inicia o servidor HTTP na porta definida em `config.PORT`
app.listen(config.PORT, () => {
  console.log('-------------------------------------------');
  console.log(`Servidor MCP rodando na porta ${config.PORT}`);
  console.log(`Interface: http://localhost:${config.PORT}/`);
  console.log('-------------------------------------------');
});