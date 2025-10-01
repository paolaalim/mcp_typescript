import { z } from 'zod'; 

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  // Garante que a variável do Gemini está a ser lida
  GEMINI_API_KEY: z.string().optional().default(''),
  
  /*
   URL da API do Google Gemini, a usar o modelo padrão 'gemini-pro'
   que é compatível com a versão v1beta.
   */
  GEMINI_API_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'),
});

export const config = envSchema.parse(process.env);
