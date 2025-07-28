// src/index.ts

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // Importar node-fetch para fazer requisições HTTP

// Recrie as variáveis __filename e __dirname para o escopo de Módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Servir arquivos estáticos (interface web do contador de palavras)
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

// API: Contador de Frequência de Palavras
app.post('/api/word-count', (req: Request, res: Response) => {
  const { text } = req.body as { text: string };

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto inválido fornecido.' });
  }

  const wordFrequency = countWordFrequency(text);

  res.json({ text_input: text, word_counts: wordFrequency, total_words: Object.values(wordFrequency).reduce((sum: number, count: number) => sum + count, 0) });
});

// NOVO ENDPOINT: API para integração com IA (Claude)
app.post('/api/ai-tool', async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt: string };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt inválido fornecido.' });
  }

  // Obtenha a chave de API e o endpoint do Claude de variáveis de ambiente
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  // Este é um exemplo de endpoint. Verifique a documentação oficial do Claude para o endpoint correto.
  const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages'; 

  if (!CLAUDE_API_KEY) {
    console.error('CLAUDE_API_KEY não está configurada nas variáveis de ambiente.');
    return res.status(500).json({ error: 'Chave de API do Claude não configurada.' });
  }

  try {
    // Exemplo de como você faria a chamada para a API do Claude
    // ATENÇÃO: Os detalhes do corpo da requisição (model, messages, etc.) 
    // dependem da versão da API do Claude que você está usando. 
    // Consulte a documentação oficial da Anthropic (Claude) para obter o formato correto.
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        // Inclua outros headers necessários, como Anthropic-Version
        'anthropic-version': '2023-06-01' 
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229", // Ou outro modelo, como "claude-3-sonnet-20240229"
        max_tokens: 1024,
        messages: [
          { role: "user", content: prompt }
        ]
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
    // A estrutura da resposta do Claude pode variar, ajuste conforme necessário
    res.json({ success: true, ai_response: data });

  } catch (error: any) {
    console.error('Erro inesperado ao processar a requisição da IA:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a requisição de IA.', details: error.message });
  }
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor MCP (Contador de Palavras + IA) rodando na porta ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Interface do contador de palavras: http://localhost:${port}/`);
  console.log(`🤖 Endpoint de IA: POST http://localhost:${port}/api/ai-tool`);
});
