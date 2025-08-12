// src/index.ts
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import apiRoutes from './routes/apiRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const app = express();
app.use(express.json());
app.use(express.static(...)); // Servir arquivos estáticos

app.get('/health', ...);
app.use('/api', apiRoutes); // Usar o módulo de rotas

app.listen(...);

//definir schema
const wordCountSchema = z.object({
  text: z.string().min(1, { message: "O campo de texto não pode estar vazio." })
});

app.post('/api/word-count', (req: Request, res: Response) => {
  const result = wordCountSchema.safeParse(req.body);

  if (!result.success) {
    // Retorna os erros de validação detalhados pelo Zod
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  // Para usar `result.data.text` com segurança
  const { text } = result.data;
  const wordFrequency = countWordFrequency(text);
  res.json({ text_input: text, word_counts: wordFrequency, total_words: Object.values(wordFrequency).reduce((sum: number, count: number) => sum + count, 0) });
});


// CENTRAL DE CONTROLE DE STATUS DAS FERRAMENTAS
// Para alterar o status de uma ferramenta, mude o valor de 'online' para 'offline'.
const toolStatus = {
  'word-count': { status: 'online' },
  'generate-uuid': { status: 'online' },
  'ai-tool': { status: 'offline' } 
};

// Função auxiliar para contar a frequência de palavras (COM SUPORTE A ACENTOS)
function countWordFrequency(text: string): { [word: string]: number } {
  const words = text.toLowerCase().match(/\p{L}+/gu);
  const frequency: { [word: string]: number } = {};
  if (words) {
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }
  return frequency;
}

// Função auxiliar para gerar UUIDs
interface GenerateUuidArgs {
  count?: number;
  format?: 'formatted' | 'raw';
}

function generateUuids(options: GenerateUuidArgs = {}): string[] {
  const { count = 1, format = 'formatted' } = options;
  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    const newUuid = uuidv4();
    uuids.push(format === 'raw' ? newUuid.replace(/-/g, '') : newUuid);
  }
  return uuids;
}

// Servir arquivos estáticos da interface web
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

app.get('/api/status', (req: Request, res: Response) => {
  res.json(toolStatus);
});

// API: Contador de Frequência de Palavras
app.post('/api/word-count', (req: Request, res: Response) => {
  // VERIFICAÇÃO DE STATUS
  if (toolStatus['word-count'].status === 'offline') {
    return res.status(503).json({ error: 'Serviço temporariamente indisponível.' });
  }

  const { text } = req.body as { text: string };
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto inválido fornecido.' });
  }
  const wordFrequency = countWordFrequency(text);
  res.json({ text_input: text, word_counts: wordFrequency, total_words: Object.values(wordFrequency).reduce((sum: number, count: number) => sum + count, 0) });
});

// API: Gerar UUIDs
app.post('/api/generate-uuid', (req: Request, res: Response) => {
  // VERIFICAÇÃO DE STATUS
  if (toolStatus['generate-uuid'].status === 'offline') {
    return res.status(503).json({ error: 'Serviço temporariamente indisponível.' });
  }

  const { count, format } = req.body as GenerateUuidArgs;
  if (count !== undefined && (typeof count !== 'number' || count <= 0)) {
    return res.status(400).json({ error: 'Parâmetro "count" inválido. Deve ser um número inteiro positivo.' });
  }
  if (format !== undefined && format !== 'formatted' && format !== 'raw') {
    return res.status(400).json({ error: 'Parâmetro "format" inválido. Use "formatted" ou "raw".' });
  }
  try {
    const uuids = generateUuids({ count, format });
    res.json({ success: true, uuids });
  } catch (error: any) {
    console.error('Erro ao gerar UUIDs:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao gerar UUIDs.', details: error.message });
  }
});

// Endpoint de IA: API para integração com IA (Claude)
app.post('/api/ai-tool', async (req: Request, res: Response) => {
  // VERIFICAÇÃO DE STATUS
  if (toolStatus['ai-tool'].status === 'offline') {
    return res.status(503).json({ error: 'A ferramenta de IA está temporariamente offline.' });
  }

  const { prompt } = req.body as { prompt: string };
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt inválido fornecido.' });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

  if (!CLAUDE_API_KEY) {
    console.error('CLAUDE_API_KEY não está configurada nas variáveis de ambiente.');
    return res.status(500).json({ error: 'Chave de API do Claude não configurada.' });
  }

  try {
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('Erro ao chamar a API do Claude:', claudeResponse.status, errorData);
      return res.status(claudeResponse.status).json({
        error: `Erro ao comunicar com a API do Claude: ${claudeResponse.statusText}`,
        details: errorData,
      });
    }

    const data = await claudeResponse.json();
    res.json({ success: true, ai_response: data });

  } catch (error: any) {
    console.error('Erro inesperado ao processar a requisição da IA:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a requisição de IA.', details: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`⚡ Servidor MCP (Contador de Palavras + IA + UUID) rodando na porta ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Interface do contador de palavras: http://localhost:${port}/`);
  console.log(`🤖 Endpoint de IA: POST http://localhost:${port}/api/ai-tool`);
  console.log(`🆔 Endpoint de Gerador de UUID: POST http://localhost:${port}/api/generate-uuid`);
});
