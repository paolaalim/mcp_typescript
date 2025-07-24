import express, { Request, Response } from 'express';
import path from 'path'; // Importar o módulo 'path'

const app = express();
app.use(express.json());

// Função auxiliar para contar a frequência de palavras
function countWordFrequency(text: string): { [word: string]: number } {
  const words = text.toLowerCase().match(/\b\w+\b/g);

  const frequency: { [word: string]: number } = {};

  if (words) {
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }
  return frequency;
}

// Servir arquivos estáticos da pasta 'public'
// Isso fará com que 'index.html' seja servido automaticamente na rota '/'
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API: Contador de Frequência de Palavras - Única API funcional
app.post('/api/word-count', (req: Request, res: Response) => {
  const { text } = req.body as { text: string };

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto inválido fornecido.' });
  }

  const wordFrequency = countWordFrequency(text);

  res.json({ text_input: text, word_counts: wordFrequency, total_words: Object.values(wordFrequency).reduce((sum: number, count: number) => sum + count, 0) });
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor MCP (Contador de Palavras) rodando na porta ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Interface: http://localhost:${port}/`);
});
