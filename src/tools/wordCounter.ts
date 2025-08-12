// Função que analisa um texto e retorna a frequência de cada palavra.

export function countWordFrequency(text: string): { [word: string]: number } {
  const words = text.toLowerCase().match(/\p{L}+/gu);
  const frequency: { [word: string]: number } = {};

  if (words) {
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  return frequency;
}
