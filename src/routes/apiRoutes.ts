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

// ...
router.post('/ai-tool', checkToolStatus('ai-tool'), handleAiTool);
