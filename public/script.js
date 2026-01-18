// Variável global para armazenar o status das ferramentas que será buscado do servidor
let serverToolStatus = {};

// Função auxiliar para exibir resultados nas áreas de resultado
const showResult = (elementId, data) => {
    const resultDiv = document.getElementById(elementId); // Busca o elemento pelo ID
    resultDiv.innerHTML = ''; // Limpa o conteúdo anterior da div

    // Verifica se há erro na resposta e exibe mensagem de erro
    if (data.error) {
        resultDiv.innerHTML = `<p style="color: #ffbaba;"><strong>Erro:</strong> ${data.error}</p>`;
        // Se há detalhes do erro, também os exibe
        if(data.details) {
             resultDiv.innerHTML += `<p style="color: #ffbaba; font-size: 0.9em;">Detalhes: ${JSON.stringify(data.details)}</p>`;
        }
    } else {
        // Se não há erro, processa o resultado conforme o tipo de ferramenta
        if (elementId === 'uuidResult') {
            // Formatação específica para resultados de UUID
            let html = `<h4>UUIDs Gerados:</h4><ul>`;
            data.uuids.forEach(uuid => { html += `<li><code>${uuid}</code></li>`; }); // Itera sobre cada UUID
            html += `</ul>`;
            resultDiv.innerHTML = html;
        }
        else if (elementId === 'aiResult') {
            // ALTERAÇÃO AQUI: Simplificamos como a resposta da IA é lida
            const aiResponse = data.ai_response || 'Nenhuma resposta válida.';
            resultDiv.innerHTML = `<h4>Resposta da IA:</h4><p>${aiResponse}</p>`;
        }
        else {
            // Formatação específica para contador de palavras
            const totalWords = data.total_words;
            const wordCounts = data.word_counts;
            let html = `<h4>Análise Completa:</h4>`;
            html += `<p><strong>Total de Palavras Únicas:</strong> ${Object.keys(wordCounts).length}</p>`;
            html += `<p><strong>Total de Palavras (Geral):</strong> ${totalWords}</p><ul>`;
            // Itera sobre cada palavra e sua contagem
            for (const word in wordCounts) { html += `<li><strong>${word}:</strong> ${wordCounts[word]}</li>`; }
            html += `</ul>`;
            resultDiv.innerHTML = html;
        }
    }
};
// Função assíncrona para contar palavras
const countWords = async () => {
  // Verifica se a ferramenta está online antes de prosseguir
  if (serverToolStatus['word-count']?.status !== 'online') {
    showResult('wordCountResult', { error: "A ferramenta Contador de Palavras está offline." });
    return; // Sai da função se offline
  }
  // Obtém o texto digitado pelo usuário
  const text = document.getElementById('textInput').value;
  // Verifica se o texto não está vazio (remove espaços em branco)
  if (!text.trim()) {
    showResult('wordCountResult', { error: "Por favor, digite algum texto para contar as palavras." });
    return; // Sai da função se vazio
  }
  try {
    // Faz uma requisição POST para a API do servidor
    const response = await fetch('/api/word-count', {
      method: 'POST', // Método HTTP POST
      headers: {'Content-Type': 'application/json'}, // Define o tipo de conteúdo como JSON
      body: JSON.stringify({ text: text }) // Converte o texto para JSON e envia no corpo da requisição
    });
    // Converte a resposta para JSON
    const data = await response.json();
    // Verifica se a resposta não foi bem-sucedida
    if (!response.ok) {
        showResult('wordCountResult', { error: `Erro na API: ${response.status}`, details: data });
        return; // Sai se houver erro
    }
    // Exibe o resultado se tudo correu bem
    showResult('wordCountResult', data);
  } catch (error) {
    // Captura erros de conexão ou outros erros inesperados
    showResult('wordCountResult', { error: "Não foi possível conectar ao servidor.", details: error.message });
  }
};

// Função assíncrona para gerar UUIDs
const generateUUIDs = async () => {
  // Verifica se a ferramenta está online antes de prosseguir
  if (serverToolStatus['generate-uuid']?.status !== 'online') {
    showResult('uuidResult', { error: "A ferramenta Gerador de UUID está offline." });
    return; // Sai da função se offline
  }
  // Obtém a quantidade desejada e converte para número inteiro
  const count = parseInt(document.getElementById('uuidCount').value, 10);
  // Obtém o formato selecionado (com ou sem hífens)
  const format = document.getElementById('uuidFormat').value;
  // Valida se a quantidade é um número válido e positivo
  if (isNaN(count) || count <= 0) {
    showResult('uuidResult', { error: "Por favor, insira um número válido e positivo." });
    return; // Sai da função se inválido
  }
  try {
    // Faz uma requisição POST para a API do servidor
    const response = await fetch('/api/generate-uuid', {
      method: 'POST', // Método HTTP POST
      headers: {'Content-Type': 'application/json'}, // Define o tipo de conteúdo como JSON
      body: JSON.stringify({ count: count, format: format }) // Envia quantidade e formato como JSON
    });
    // Converte a resposta para JSON
    const data = await response.json();
    // Verifica se a resposta não foi bem-sucedida
    if (!response.ok) {
        showResult('uuidResult', { error: `Erro na API: ${response.status}`, details: data });
        return; // Sai se houver erro
    }
    // Exibe o resultado se tudo correu bem
    showResult('uuidResult', data);
  } catch (error) {
    // Captura erros de conexão ou outros erros inesperados
    showResult('uuidResult', { error: "Não foi possível conectar ao servidor.", details: error.message });
  }
};

// Função assíncrona para enviar prompt para a IA
const sendAIPrompt = async () => {
  // Verifica se a ferramenta de IA está online antes de prosseguir
  if (serverToolStatus['ai-tool']?.status !== 'online') {
    showResult('aiResult', { error: "A ferramenta de IA está temporariamente offline." });
    return; // Sai da função se offline
  }
  // Obtém o prompt digitado pelo usuário
  const prompt = document.getElementById('aiPrompt').value;
  // Verifica se o prompt não está vazio (remove espaços em branco)
  if (!prompt.trim()) {
    showResult('aiResult', { error: "Por favor, digite um prompt para a IA." });
    return; // Sai da função se vazio
  }
  try {
    // Faz uma requisição POST para a API da IA
    const response = await fetch('/api/ai-tool', {
      method: 'POST', // Método HTTP POST
      headers: {'Content-Type': 'application/json'}, // Define o tipo de conteúdo como JSON
      body: JSON.stringify({ prompt: prompt }) // Envia o prompt como JSON
    });
    // Converte a resposta para JSON
    const data = await response.json();
    // Verifica se a resposta não foi bem-sucedida
     if (!response.ok) {
        showResult('aiResult', { error: `Erro na API: ${response.status}`, details: data });
        return; // Sai se houver erro
    }
    // Exibe o resultado se tudo correu bem
    showResult('aiResult', data);
  } catch (error) {
    // Captura erros de conexão ou outros erros inesperados
    showResult('aiResult', { error: "Não foi possível conectar ao servidor.", details: error.message });
  }
};

// Função para atualizar a interface do usuário com o status das ferramentas
const updateUIWithStatus = (statuses) => {
  // Itera sobre cada ferramenta no objeto de status
  for (const toolId in statuses) {
    // Determina se a ferramenta está online
    const isOnline = statuses[toolId].status === 'online';
    // Busca o card da ferramenta pelo ID
    const card = document.getElementById(`card-${toolId}`);
    if (!card) continue; // Pula se o card não existir

    // Busca os elementos dentro do card
    const badge = card.querySelector('.card-status'); // Badge de status
    const text = card.querySelector('p > span'); // Texto de status
    const button = card.querySelector('button'); // Botão da ferramenta

    // Se todos os elementos existem, atualiza a interface
    if (badge && text && button) {
      // Atualiza o texto do badge
      badge.textContent = isOnline ? 'Online' : 'Offline';
      // Adiciona ou remove classes CSS baseado no status
      badge.classList.toggle('status-online', isOnline);
      badge.classList.toggle('status-offline', !isOnline);

      // Atualiza o texto de status se o ID corresponder
      if (text.id === `status-text-${toolId}`) {
          text.textContent = isOnline ? 'Online' : 'Offline';
      }

      // Desabilita o botão se a ferramenta estiver offline
      button.disabled = !isOnline;
      if (!isOnline) {
        // Aplica estilos visuais para botão desabilitado
        button.style.backgroundColor = '#6c757d';
        button.style.cursor = 'not-allowed';
      }
    }
  }
};

// Event listener que executa quando o DOM está completamente carregado
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Faz uma requisição GET para obter o status das ferramentas do servidor
    const response = await fetch('/api/status');
    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) throw new Error('Falha ao buscar status do servidor.');
    
    // Converte a resposta para JSON e armazena na variável global
    serverToolStatus = await response.json();
    // Atualiza a interface com o status obtido
    updateUIWithStatus(serverToolStatus);
  } catch (error) {
    // Em caso de erro, registra no console
    console.error("Erro ao buscar status das ferramentas:", error);
    // Cria um objeto com status offline para todas as ferramentas
    const offlineStatus = {
        'word-count': { status: 'offline' },
        'generate-uuid': { status: 'offline' },
        'ai-tool': { status: 'offline' }
    };
    // Atualiza a interface mostrando todas as ferramentas como offline
    updateUIWithStatus(offlineStatus);
    // Exibe mensagens de erro em todas as áreas de resultado
    showResult('wordCountResult', {error: 'Não foi possível conectar ao servidor para verificar o status.'});
    showResult('uuidResult', {error: 'Não foi possível conectar ao servidor para verificar o status.'});
    showResult('aiResult', {error: 'Não foi possível conectar ao servidor para verificar o status.'});
  }
});
