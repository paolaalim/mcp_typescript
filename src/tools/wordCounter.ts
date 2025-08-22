// Função que analisa um texto e retorna a frequência de cada palavra única

// Função exportada que recebe uma string e retorna um objeto com contagem de palavras
export function countWordFrequency(text: string): { [word: string]: number } {
  // Usa regex para extrair apenas letras (Unicode) e converte para minúsculas
  // \p{L}+ = uma ou mais letras Unicode (suporta caracteres especiais e acentos)
  // 'gu' = global (todas as ocorrências) e unicode (suporte completo a Unicode)
  const words = text.toLowerCase().match(/\p{L}+/gu);
  
  // Objeto para armazenar a frequência de cada palavra
  const frequency: { [word: string]: number } = {};

  // Se foram encontradas palavras no texto
  if (words) {
    // Itera sobre cada palavra encontrada
    for (const word of words) {
      // Se a palavra já existe no objeto, incrementa o contador
      // Se não existe, inicializa com 1 (usando operador nullish coalescing ??)
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Retorna o objeto com a frequência de cada palavra
  return frequency;
}
