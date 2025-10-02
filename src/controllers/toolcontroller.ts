import { Request, Response } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import { countWordFrequency } from '../tools/wordCounter.js';
import { generateUuids } from '../tools/uuidGenerator.js';
import { config } from '../config.js';

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

// FERRAMENTA DE IA REATIVADA E A FUNCIONAR
export const handleAiTool = async (req: Request, res: Response) => {
  const result = aiToolSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }
  try {
    const apiUrl = `${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`;
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: result.data.prompt }] }]
      })
    });
    const data: any = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: `Erro na API do Gemini: ${geminiResponse.statusText}`,
        details: data,
      });
    }
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Não foi possível obter uma resposta da IA.';
    res.json({ success: true, ai_response: aiResponseText });
  } catch (error: any) {
    console.error('Erro ao processar a requisição da IA:', error);
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
};