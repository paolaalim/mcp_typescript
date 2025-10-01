import { z } from 'zod'; 

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  GEMINI_API_KEY: z.string().optional().default(''),
  
  /*
   URL da API do Google Gemini, a usar a versão estável 'v1'
   e o modelo padrão 'gemini-pro'.
   */
  GEMINI_API_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'),
});

export const config = envSchema.parse(process.env);
