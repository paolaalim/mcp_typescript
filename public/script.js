// public/script.js

// Variável para armazenar o status das ferramentas que será buscado do servidor
let serverToolStatus = {};

// Função auxiliar para exibir resultados
const showResult = (elementId, data) => {
    const resultDiv = document.getElementById(elementId);
    resultDiv.innerHTML = ''; // Limpa o conteúdo anterior

    if (data.error) {
        resultDiv.innerHTML = `<p style="color: #ffbaba;"><strong>Erro:</strong> ${data.error}</p>`;
        if(data.details) {
             resultDiv.innerHTML += `<p style="color: #ffbaba; font-size: 0.9em;">Detalhes: ${JSON.stringify(data.details)}</p>`;
        }
    } else {
        if (elementId === 'uuidResult') {
            let html = `<h4>UUIDs Gerados:</h4><ul>`;
            data.uuids.forEach(uuid => { html += `<li><code>${uuid}</code></li>`; });
            html += `</ul>`;
            resultDiv.innerHTML = html;
        }
        else if (elementId === 'aiResult') {
            const aiResponse = data.ai_response && data.ai_response.content ? data.ai_response.content[0].text : 'Nenhuma resposta válida.';
            resultDiv.innerHTML = `<h4>Resposta da IA:</h4><p>${aiResponse}</p>`;
        }
        else {
            const totalWords = data.total_words;
            const wordCounts = data.word_counts;
            let html = `<h4>Análise Completa:</h4>`;
            html += `<p><strong>Total de Palavras Únicas:</strong> ${Object.keys(wordCounts).length}</p>`;
            html += `<p><strong>Total de Palavras (Geral):</strong> ${totalWords}</p><ul>`;
            for (const word in wordCounts) { html += `<li><strong>${word}:</strong> ${wordCounts[word]}</li>`; }
            html += `</ul>`;
            resultDiv.innerHTML = html;
        }
    }
};

const countWords = async () => {
  if (serverToolStatus['word-count']?.status !== 'online') {
    showResult('wordCountResult', { error: "A ferramenta Contador de Palavras está offline." });
    return;
  }
  const text = document.getElementById('textInput').value;
  if (!text.trim()) {
    showResult('wordCountResult', { error: "Por favor, digite algum texto para contar as palavras." });
    return;
  }
  try {
    const response = await fetch('/api/word-count', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text: text })
    });
    const data = await response.json();
    if (!response.ok) {
        showResult('wordCountResult', { error: `Erro na API: ${response.status}`, details: data });
        return;
    }
    showResult('wordCountResult', data);
  } catch (error) {
    showResult('wordCountResult', { error: "Não foi possível conectar ao servidor.", details: error.message });
  }
};

const generateUUIDs = async () => {
  if (serverToolStatus['generate-uuid']?.status !== 'online') {
    showResult('uuidResult', { error: "A ferramenta Gerador de UUID está offline." });
    return;
  }
  const count = parseInt(document.getElementById('uuidCount').value, 10);
  const format = document.getElementById('uuidFormat').value;
  if (isNaN(count) || count <= 0) {
    showResult('uuidResult', { error: "Por favor, insira um número válido e positivo." });
    return;
  }
  try {
    const response = await fetch('/api/generate-uuid', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ count: count, format: format })
    });
    const data = await response.json();
    if (!response.ok) {
        showResult('uuidResult', { error: `Erro na API: ${response.status}`, details: data });
        return;
    }
    showResult('uuidResult', data);
  } catch (error) {
    showResult('uuidResult', { error: "Não foi possível conectar ao servidor.", details: error.message });
  }
};

const sendAIPrompt = async () => {
  if (serverToolStatus['ai-tool']?.status !== 'online') {
    showResult('aiResult', { error: "A ferramenta de IA está temporariamente offline." });
    return;
  }
  const prompt = document.getElementById('aiPrompt').value;
  if (!prompt.trim()) {
    showResult('aiResult', { error: "Por favor, digite um prompt para a IA." });
    return;
  }
  try {
    const response = await fetch('/api/ai-tool', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ prompt: prompt })
    });
    const data = await response.json();
     if (!response.ok) {
        showResult('aiResult', { error: `Erro na API: ${response.status}`, details: data });
        return;
    }
    showResult('aiResult', data);
  } catch (error) {
    showResult('aiResult', { error: "Não foi possível conectar ao servidor.", details: error.message });
  }
};

const updateUIWithStatus = (statuses) => {
  for (const toolId in statuses) {
    const isOnline = statuses[toolId].status === 'online';
    const card = document.getElementById(`card-${toolId}`);
    if (!card) continue;

    const badge = card.querySelector('.card-status');
    const text = card.querySelector('p > span');
    const button = card.querySelector('button');

    if (badge && text && button) {
      badge.textContent = isOnline ? 'Online' : 'Offline';
      badge.classList.toggle('status-online', isOnline);
      badge.classList.toggle('status-offline', !isOnline);

      if (text.id === `status-text-${toolId}`) {
          text.textContent = isOnline ? 'Online' : 'Offline';
      }

      button.disabled = !isOnline;
      if (!isOnline) {
        button.style.backgroundColor = '#6c757d';
        button.style.cursor = 'not-allowed';
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) throw new Error('Falha ao buscar status do servidor.');
    
    serverToolStatus = await response.json();
    updateUIWithStatus(serverToolStatus);
  } catch (error) {
    console.error("Erro ao buscar status das ferramentas:", error);
    const offlineStatus = {
        'word-count': { status: 'offline' },
        'generate-uuid': { status: 'offline' },
        'ai-tool': { status: 'offline' }
    };
    updateUIWithStatus(offlineStatus);
    showResult('wordCountResult', {error: 'Não foi possível conectar ao servidor para verificar o status.'});
    showResult('uuidResult', {error: 'Não foi possível conectar ao servidor para verificar o status.'});
    showResult('aiResult', {error: 'Não foi possível conectar ao servidor para verificar o status.'});
  }
});
