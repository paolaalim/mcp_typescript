// src/routes/apiRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
// Use .js para as importações
import { handleWordCount, handleGenerateUuid, handleAiTool } from '../controllers/toolcontroller.js';

const router = Router();

// todo o código do router

// Middleware para checar o status da ferramenta
const checkToolStatus = (toolName: 'word-count' | 'generate-uuid' | 'ai-tool') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const toolStatus = req.app.get('toolStatus'); 
    if (toolStatus[toolName]?.status === 'online') {
      next();
    } else {
      res.status(503).json({ error: `Serviço '${toolName}' temporariamente indisponível.` });
    }
  };
};

router.post('/ai-tool', checkToolStatus('ai-tool'), handleAiTool);

// Define as rotas da API, aplicando o middleware de status em cada uma
router.post('/word-count', checkToolStatus('word-count'), handleWordCount);
router.post('/generate-uuid', checkToolStatus('generate-uuid'), handleGenerateUuid);
router.post('/ai-tool', checkToolStatus('ai-tool'), handleAiTool);

export default router;
