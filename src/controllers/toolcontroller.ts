// src/controllers/toolcontroller.ts

import { Request, Response } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';

// Importa a lógica de negócio dos arquivos de ferramentas
import { countWordFrequency } from '../tools/wordCounter.js';
import { generateUuids } from '../tools/uuidGenerator.js';
// Importa a configuração validada
import { config } from '../config.js';

// Schemas de validação com Zod para cada rota
const wordCountSchema = z.object({
  text: z.string().min(1, "O campo de texto não pode estar vazio.")
});

const generateUuidSchema = z.object({
  count: z.number().int().positive().optional().default(1),
  format: z.enum(['formatted', 'raw']).optional().default('formatted'),
});

const aiToolSchema = z.object({
  prompt: z.string().min(1, "O prompt não pode estar vazio.")
});

// -- Handlers do Controller --

export const handleWordCount = (req: Request, res: Response) => {
  const result = wordCountSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  const wordFrequency = countWordFrequency(result.data.text);
  const totalWords = Object.values(wordFrequency).reduce((sum, count) => sum + count, 0);

  res.json({
    text_input: result.data.text,
    word_counts: wordFrequency,
    total_words: totalWords
  });
};

export const handleGenerateUuid = (req: Request, res: Response) => {
  const result = generateUuidSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  const uuids = generateUuids(result.data);
  res.json({ success: true, uuids });
};

export const handleAiTool = async (req: Request, res: Response) => {
  const result = aiToolSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
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
