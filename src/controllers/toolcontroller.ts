// src/controllers/toolcontroller.ts

import { Request, Response } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';

import { countWordFrequency } from '../tools/wordCounter.ts';
import { generateUuids } from '../tools/uuidGenerator.ts';
import { config } from '../config.ts';

// ... (outros schemas e handlers) ...

export const handleAiTool = async (req: Request, res: Response) => {
  const result = aiToolSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  // ALTERAÇÃO AQUI: Verifique se a chave de API está disponível.
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
