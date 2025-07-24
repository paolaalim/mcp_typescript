<!DOCTYPE html>
<html>
<head>
  <title>Servidor MCP - Contador de Palavras 🚀</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      text-align: center;
      width: 100%;
      max-width: 600px;
    }
    h1 { color: #fff; margin-bottom: 20px; }
    .status {
      padding: 15px;
      background: rgba(0, 212, 170, 0.2);
      border-radius: 10px;
      margin-bottom: 20px;
    }
    button {
      background: #00d4aa;
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 15px;
      font-size: 1.1em;
    }
    button:hover { background: #00b894; }
    #result {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
      font-family: monospace;
      white-space: pre-wrap;
      text-align: left;
    }
    .input-group {
      margin-bottom: 15px;
    }
    .input-group label { /* Estilo para o label inserido via JS */
      display: block;
      margin-bottom: 8px;
      color: white;
      font-size: 1em;
    }
    .input-group textarea {
      width: calc(100% - 22px);
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #00d4aa;
      background-color: rgba(255, 255, 255, 0.9);
      color: #333;
      font-size: 1em;
      min-height: 150px;
      resize: vertical;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Servidor MCP - Contador de Palavras</h1>
    <div class="status">
      <h2>✅ Status: Online</h2>
      <p>Port: <span id="serverPort"></span></p>
      <p>Deployed: <span id="deployDate"></span></p>
    </div>

    <h3>🛠️ Contador de Frequência de Palavras</h3>
    <div class="input-group">
      <textarea id="textInput" placeholder="Ex: Olá mundo, este é um teste de contador de palavras. Olá."></textarea>
    </div>
    <button onclick="countWords()">Contar Palavras</button>
    <div id="result"></div>
  </div>

  <script>
    const showResult = (data) => {
        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    };

    const countWords = async () => {
      const textInput = document.getElementById('textInput');
      const text = (textInput as HTMLTextAreaElement).value; // Coerção de tipo

      if (!text.trim()) {
        showResult({ error: "Por favor, digite algum texto para contar as palavras." });
        return;
      }

      try {
        const response = await fetch('/api/word-count', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          showResult({ error: `Erro na API: ${response.status}`, details: errorData });
          return;
        }

        const data = await response.json();
        showResult(data);
      } catch (error) {
        console.error('Erro ao conectar ou processar a resposta da API:', error);
        showResult({ error: "Não foi possível conectar ao servidor ou processar a resposta.", details: (error as Error).message });
      }
    };

    // Adiciona o label dinamicamente após o DOM ser carregado
    document.addEventListener('DOMContentLoaded', () => {
        const textInput = document.getElementById('textInput');
        if (textInput && textInput.parentNode) {
            const label = document.createElement('label');
            label.setAttribute('for', 'textInput');
            label.textContent = 'Digite seu texto:'; // Texto original do label
            textInput.parentNode.insertBefore(label, textInput);
        }

        // Popula as informações de status do servidor via JS
        // Essas informações virão de uma chamada ao /health endpoint se necessário
        // Por enquanto, vamos hardcodar ou deixá-las em branco para não complicar.
        // Se precisar que o JS no cliente busque essas informações do /health, podemos fazer depois.
        document.getElementById('serverPort')!.textContent = window.location.port || '80'; // Ou o port real do Easypanel
        document.getElementById('deployDate')!.textContent = new Date().toLocaleString();
    });
  </script>
</body>
</html>
