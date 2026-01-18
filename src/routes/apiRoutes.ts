import { Router } from 'express';
import { handleWordCount, handleGenerateUuid, handleAiTool } from '../controllers/toolcontroller.js';

const router = Router();

// Rotas existentes
router.post('/word-count', handleWordCount);
router.post('/generate-uuid', handleGenerateUuid);
router.post('/ai-tool', handleAiTool);

export default router;