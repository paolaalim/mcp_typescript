// Importa Router do Express para criar rotas modulares
// Importa tipos para Request, Response e NextFunction para tipagem TypeScript
import { Router, Request, Response, NextFunction } from 'express';
// Importa os handlers do controller (use .js para as importações em TypeScript compilado)
import { handleWordCount, handleGenerateUuid, handleAiTool } from '../controllers/toolcontroller.js';

// Cria uma nova instância de Router do Express
const router = Router();

// Middleware personalizado para verificar o status das ferramentas antes de executá-las
// Recebe o nome da ferramenta como parâmetro e retorna uma função middleware
const checkToolStatus = (toolName: 'word-count' | 'generate-uuid' | 'ai-tool') => {
  // Retorna a função middleware que será executada antes dos handlers das rotas
  return (req: Request, res: Response, next: NextFunction) => {
    // Obtém o objeto de status das ferramentas armazenado na aplicação Express
    const toolStatus = req.app.get('toolStatus'); 
    // Verifica se a ferramenta específica está online
    if (toolStatus[toolName]?.status === 'online') {
      next(); // Chama next() para continuar para o próximo middleware/handler
    } else {
      // Se a ferramenta estiver offline, retorna erro 503 (Service Unavailable)
      res.status(503).json({ error: `Serviço '${toolName}' temporariamente indisponível.` });
    }
  };
};

// Define as rotas da API, aplicando o middleware de verificação de status em cada uma

// Rota POST para contador de palavras
// Aplica o middleware checkToolStatus antes de executar handleWordCount
router.post('/word-count', checkToolStatus('word-count'), handleWordCount);

// Rota POST para gerador de UUID
// Aplica o middleware checkToolStatus antes de executar handleGenerateUuid
router.post('/generate-uuid', checkToolStatus('generate-uuid'), handleGenerateUuid);

// Rota POST para ferramenta de IA (Claude)
// Aplica o middleware checkToolStatus antes de executar handleAiTool
router.post('/ai-tool', checkToolStatus('ai-tool'), handleAiTool);

// Exporta o router como padrão para ser usado em outros arquivos
export default router;
