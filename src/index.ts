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
  // O status da ferramenta de IA depende se a chave de API está configurada
  // Se a chave existir e não for vazia, o status é 'online', caso contrário, é 'offline'
  'ai-tool': { status: config.CLAUDE_API_KEY ? 'online' : 'offline' }
};

// Armazena o objeto toolStatus na aplicação Express para acesso global
app.set('toolStatus', toolStatus);

// Rotas da Aplicação

// Rota de Health Check para monitoramento do servidor
// Endpoint GET /health que retorna informações sobre o status do servidor
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy', // Indica que o servidor está funcionando
    timestamp: new Date().toISOString(), // Data/hora atual em formato ISO
    uptime: process.uptime() // Tempo em segundos desde que o servidor foi iniciado
  });
});

// Rota para a interface web obter o status das ferramentas
// Endpoint GET /api/status que retorna o objeto 'toolStatus' como JSON
// Usado pelo frontend para saber quais ferramentas estão disponíveis
app.get('/api/status', (req: Request, res: Response) => {
  res.json(toolStatus); // Retorna o objeto com status de todas as ferramentas
});

// Conecta todas as rotas da API sob o prefixo '/api'
// Qualquer requisição que comece com '/api' será tratada pelo roteador 'apiRoutes'
// Por exemplo: /api/word-count, /api/generate-uuid, /api/ai-tool
app.use('/api', apiRoutes);

// Inicialização do Servidor

// Inicia o servidor HTTP na porta definida em `config.PORT`
app.listen(config.PORT, () => {
  console.log('-------------------------------------------');
  // Mensagem no console indicando que o servidor foi iniciado com sucesso
  console.log(`Servidor MCP rodando na porta ${config.PORT}`);
  // URL para acesso à interface web
  console.log(`Interface: http://localhost:${config.PORT}/`);
  console.log('-------------------------------------------');
});
