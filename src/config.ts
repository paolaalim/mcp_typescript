// src/config.ts

import { z } from 'zod';

/**
 * Define o schema para as variáveis de ambiente usando Zod.
 * Isso garante que todas as variáveis necessárias estejam presentes e formatadas corretamente
 * quando a aplicação iniciar.
 */
const envSchema = z.object({
  // Converte a variável de ambiente PORT (que é uma string) para um número.
  // Se não for definida, assume o valor padrão 3000.
  PORT: z.coerce.number().default(3000),

  // ALTERAÇÃO AQUI: Torna a CLAUDE_API_KEY opcional
  // Se não for fornecida, o valor padrão será uma string vazia (''),
  // o que permite que o servidor inicie sem a chave.
  CLAUDE_API_KEY: z.string().optional().default(''),
  
  // Define a URL da API do Claude, com um valor padrão.
  CLAUDE_API_URL: z.string().url().default('https://api.anthropic.com/v1/messages'),
});

/**
 * Valida as variáveis de ambiente (process.env) contra o schema definido.
 * Se a validação falhar, o método .parse() irá disparar um erro, interrompendo
 * a inicialização do servidor, o que é o comportamento desejado ("fail-fast").
 */
export const config = envSchema.parse(process.env);
