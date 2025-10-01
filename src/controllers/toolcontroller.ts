// Importa tipos Request e Response do Express para tipagem das funções de handler
import { Request, Response } from 'express';
// Importa Zod para validação de dados de entrada
import { z } from 'zod';
// Importa fetch para fazer requisições HTTP
import fetch from 'node-fetch';

// Importa a lógica de negócio dos arquivos de ferramentas
import { countWordFrequency } from '../tools/wordCounter.js';
import { generateUuids } from '../tools/uuidGenerator.js';
// Importa a configuração validada (variáveis de ambiente)
import { config } from '../config.js';

// Schemas de validação com Zod para cada rota da API
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

// Handler para o contador de palavras
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

// Handler para o gerador de UUID
export const handleGenerateUuid = (req: Request, res: Response) => {
  const result = generateUuidSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  const uuids = generateUuids(result.data);
  res.json({ success: true, uuids });
};

// Handler assíncrono para a ferramenta de IA (Google Gemini)
export const handleAiTool = async (req: Request, res: Response) => {
  const result = aiToolSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  try {
    // Monta a URL completa com a chave da API
    const apiUrl = `${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`;

    // Faz uma requisição POST para a API do Google Gemini
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Corpo da requisição no formato esperado pelo Gemini
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: result.data.prompt
          }]
        }]
      })
    });

    // Converte a resposta da API para JSON
    const data: any = await geminiResponse.json();

    // Verifica se a requisição não foi bem-sucedida
    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: `Erro na API do Gemini: ${geminiResponse.statusText}`,
        details: data,
      });
    }

    // Extrai o texto da resposta do Gemini
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Não foi possível obter uma resposta da IA.';

    // Retorna sucesso com a resposta da IA
    res.json({ success: true, ai_response: aiResponseText });
  } catch (error: any) {
    // Captura erros de conexão ou outros erros inesperados
    console.error('Erro ao processar a requisição da IA:', error);
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
};