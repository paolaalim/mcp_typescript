import { Request, Response } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import { countWordFrequency } from '../tools/wordCounter.js';
import { generateUuids } from '../tools/uuidGenerator.js';
import { config } from '../config.js';

// Definição dos esquemas de validação
const wordCountSchema = z.object({
    text: z.string().min(1, "O texto não pode estar vazio."),
});

const uuidSchema = z.object({
    count: z.coerce.number().min(1).max(100).default(1),
    format: z.enum(['formatted', 'raw']).default('formatted'),
});

const aiToolSchema = z.object({
    prompt: z.string().min(1, "O prompt não pode estar vazio."),
});


export const handleWordCount = (req: Request, res: Response) => {
    const result = wordCountSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
    }
    const wordCounts = countWordFrequency(result.data.text);
    const totalWords = Object.values(wordCounts).reduce((sum, count) => sum + count, 0);
    res.json({ success: true, word_counts: wordCounts, total_words: totalWords });
};

export const handleGenerateUuid = (req: Request, res: Response) => {
    const result = uuidSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
    }
    const uuids = generateUuids(result.data);
    res.json({ success: true, uuids: uuids });
};

export const handleAiTool = async (req: Request, res: Response) => {
  const result = aiToolSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  if (!config.CLAUDE_API_KEY) {
    return res.status(503).json({ error: "Serviço de IA indisponível. A chave de API não foi configurada." });
  }

  try {
    const claudeResponse = await fetch(config.CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: result.data.prompt }]
      })
    });

    const data = await claudeResponse.json();

    if (!claudeResponse.ok) {
      return res.status(claudeResponse.status).json({
        error: `Erro na API do Claude: ${claudeResponse.statusText}`,
        details: data,
      });
    }

    res.json({ success: true, ai_response: data });
  } catch (error: any) {
    console.error('Erro ao processar a requisição da IA:', error);
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
};
