import { Router } from 'express';
import { handleWordCount } from '../controllers/toolController';

const router = Router();

router.post('/word-count', handleWordCount);
// ... outras rotas

export default router;
