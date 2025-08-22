// Importa tipos Request e Response do Express para tipagem das funções de handler
import { Request, Response } from 'express';
// Importa Zod para validação de dados de entrada
import { z } from 'zod';
// Importa fetch para fazer requisições HTTP (usado para API do Claude)
import fetch from 'node-fetch';

// Importa a lógica de negócio dos arquivos de ferramentas
import { countWordFrequency } from '../tools/wordCounter.js';
import { generateUuids } from '../tools/uuidGenerator.js';
// Importa a configuração validada (variáveis de ambiente)
import { config } from '../config.js';

// Schemas de validação com Zod para cada rota da API
// Define a estrutura esperada dos dados de entrada para cada endpoint

// Schema para validação do contador de palavras
const wordCountSchema = z.object({
  text: z.string().min(1, "O campo de texto não pode estar vazio.") // Campo obrigatório, deve ser string não vazia
});

// Schema para validação do gerador de UUID
const generateUuidSchema = z.object({
  count: z.number().int().positive().optional().default(1), // Número inteiro positivo, padrão 1, campo opcional
  format: z.enum(['formatted', 'raw']).optional().default('formatted'), // Enum com duas opções, padrão 'formatted'
});

// Schema para validação da ferramenta de IA
const aiToolSchema = z.object({
  prompt: z.string().min(1, "O prompt não pode estar vazio.") // Campo obrigatório, deve ser string não vazia
});

// -- Handlers do Controller --
// Funções que processam as requisições HTTP para cada ferramenta

// Handler para o contador de palavras
export const handleWordCount = (req: Request, res: Response) => {
  // Valida os dados de entrada usando o schema definido
  const result = wordCountSchema.safeParse(req.body);
  // Se a validação falhar, retorna erro 400 (Bad Request)
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  // Chama a função de contagem de palavras com o texto validado
  const wordFrequency = countWordFrequency(result.data.text);
  // Calcula o total de palavras somando todas as frequências
  const totalWords = Object.values(wordFrequency).reduce((sum, count) => sum + count, 0);

  // Retorna a resposta JSON com os resultados
  res.json({
    text_input: result.data.text, // Texto original enviado
    word_counts: wordFrequency, // Objeto com frequência de cada palavra
    total_words: totalWords // Total geral de palavras
  });
};

// Handler para o gerador de UUID
export const handleGenerateUuid = (req: Request, res: Response) => {
  // Valida os dados de entrada usando o schema definido
  const result = generateUuidSchema.safeParse(req.body);
  // Se a validação falhar, retorna erro 400 (Bad Request)
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  // Chama a função de geração de UUIDs com os parâmetros validados
  const uuids = generateUuids(result.data);
  // Retorna a resposta JSON com sucesso e os UUIDs gerados
  res.json({ success: true, uuids });
};

// Handler assíncrono para a ferramenta de IA (Claude)
export const handleAiTool = async (req: Request, res: Response) => {
  // Valida os dados de entrada usando o schema definido
  const result = aiToolSchema.safeParse(req.body);
  // Se a validação falhar, retorna erro 400 (Bad Request)
  if (!result.success) {
    return res.status(400).json({ error: "Dados inválidos.", issues: result.error.flatten() });
  }

  try {
    // Faz uma requisição POST para a API do Claude
    const claudeResponse = await fetch(config.CLAUDE_API_URL, {
      method: 'POST', // Método HTTP POST
      headers: {
        'Content-Type': 'application/json', // Tipo de conteúdo JSON
        'x-api-key': config.CLAUDE_API_KEY, // Chave de API do Claude
        'anthropic-version': '2023-06-01' // Versão da API do Anthropic
      },
      // Corpo da requisição com configurações do modelo e prompt do usuário
      body: JSON.stringify({
        model: "claude-3-opus-20240229", // Modelo específico do Claude a ser usado
        max_tokens: 1024, // Limite máximo de tokens na resposta
        messages: [{ role: "user", content: result.data.prompt }] // Array com a mensagem do usuário
      })
    });

    // Converte a resposta da API para JSON
    const data = await claudeResponse.json();

    // Verifica se a requisição não foi bem-sucedida
    if (!claudeResponse.ok) {
      return res.status(claudeResponse.status).json({
        error: `Erro na API do Claude: ${claudeResponse.statusText}`, // Mensagem de erro
        details: data, // Detalhes adicionais do erro
      });
    }

    // Retorna sucesso com a resposta da IA
    res.json({ success: true, ai_response: data });
  } catch (error: any) {
    // Captura erros de conexão ou outros erros inesperados
    console.error('Erro ao processar a requisição da IA:', error);
    // Retorna erro 500 (Internal Server Error) com detalhes
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
};
