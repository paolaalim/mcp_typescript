import { z } from 'zod';

/*
 Define o schema para as variáveis de ambiente usando Zod.
 Este schema atua como um "contrato", garantindo que todas as
 variáveis necessárias para a aplicação iniciar estejam presentes e com o formato correto.
 */
const envSchema = z.object({
  /*
   Converte a variável de ambiente PORT (que é uma string por padrão) para um número.
   Se a variável 'PORT' não for definida no ambiente, assume o valor padrão 3000.
   */
  PORT: z.coerce.number().default(3000),

  /*
   Define a chave de API do Google Gemini.
   Usamos '.optional()' para permitir que o servidor inicie mesmo sem a chave,
   e '.default('')' para garantir que ela seja sempre uma string vazia caso não seja fornecida.
   Isso evita que o servidor falhe na inicialização.
   */
  GEMINI_API_KEY: z.string().optional().default(''),
  
  /*
   Define a URL da API do Google Gemini.
   Usamos '.string().url()' para garantir que o valor seja uma URL válida.
   A API do Gemini tem um valor padrão, caso a variável não seja definida.
   */
  GEMINI_API_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'),
});

/*
 Valida as variáveis de ambiente (process.env) contra o schema definido.
 O método '.parse()' irá ler e validar todas as variáveis do sistema.
 Se a validação falhar, ele irá disparar um erro, interrompendo a inicialização do servidor.
 Este é o comportamento desejado para garantir que a aplicação não rode com configurações inválidas.
 */
export const config = envSchema.parse(process.env);