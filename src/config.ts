
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  // ALTERAÇÃO AQUI: Torna a CLAUDE_API_KEY opcional
  CLAUDE_API_KEY: z.string().optional().default(''),
  CLAUDE_API_URL: z.string().url().default('https://api.anthropic.com/v1/messages'),
});

export const config = envSchema.parse(process.env);
