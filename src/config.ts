import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  GEMINI_API_KEY: z.string().optional().default(''),
  
  /*
   URL da API do Google Gemini, a usar o modelo 'gemini-2.0-flash-001'.
   Este nome foi obtido diretamente da sua lista de modelos disponíveis.
   */
  GEMINI_API_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent'),
});

export const config = envSchema.parse(process.env);