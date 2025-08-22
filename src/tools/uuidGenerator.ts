// Importa a função v4 da biblioteca uuid para gerar UUIDs versão 4
// Renomeia v4 para uuidv4 para melhor legibilidade
import { v4 as uuidv4 } from 'uuid';

// Interface TypeScript que define a estrutura dos argumentos para geração de UUIDs
export interface GenerateUuidArgs {
  count?: number; // Quantidade de UUIDs a gerar (opcional)
  format?: 'formatted' | 'raw'; // Formato: 'formatted' com hífens ou 'raw' sem hífens (opcional)
}

// Função que gera um ou mais UUIDs com base nos parâmetros fornecidos
export function generateUuids(options: GenerateUuidArgs = {}): string[] {
  // Desestruturação com valores padrão: count = 1, format = 'formatted'
  const { count = 1, format = 'formatted' } = options;
  // Array para armazenar os UUIDs gerados
  const uuids: string[] = [];

  // Loop para gerar a quantidade especificada de UUIDs
  for (let i = 0; i < count; i++) {
    // Gera um novo UUID versão 4 (aleatório)
    const newUuid = uuidv4();
    // Adiciona ao array: se format é 'raw', remove os hífens, senão mantém formatado
    uuids.push(format === 'raw' ? newUuid.replace(/-/g, '') : newUuid);
  }

  // Retorna o array com todos os UUIDs gerados
  return uuids;
}
