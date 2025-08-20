import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import apiRoutes from './routes/apiRoutes.js';


// Configuração para obter o nome do diretório (__dirname) em módulos ES
// `import.meta.url` é a URL do módulo atual
// `path.dirname` extrai o nome do diretório de um caminho de arquivo
// Cria uma instância do aplicativo Express
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configuração do Servidor

// Middleware para analisar requisições com corpo JSON (por exemplo, de requisições POST)
// Middleware para servir arquivos estáticos (como HTML, CSS, JS do frontend)
// O servidor irá procurar arquivos na pasta 'public' dentro do diretório pai
app.use(express.json()); // Middleware para interpretar JSON
app.use(express.static(path.join(__dirname, '../public')));

// Central de Controle de Status das Ferramentas
// Objeto que armazena o status de diferentes ferramentas ou serviços
const toolStatus = {
  'word-count': { status: 'online' },
  'generate-uuid': { status: 'online' },
  'ai-tool': { status: 'offline' }
};
// Disponibiliza o objeto 'toolStatus' para toda a aplicação.
// Isso permite que outros middlewares ou rotas acessem este objeto usando `req.app.get('toolStatus')`

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
