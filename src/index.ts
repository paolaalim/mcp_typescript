import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Função auxiliar para contar a frequência de palavras
function countWordFrequency(text: string): { [word: string]: number } {
  const words = text.toLowerCase().match(/\b\w+\b/g);

  const frequency: { [word: string]: number } = {};

  if (words) {
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }
  return frequency;
}

// Página inicial - Focada no Contador de Palavras
app.get('/', (req: Request, res: Response) => {
  res.send(`
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
        .input-group label {
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
          <p>Port: ${process.env.PORT || 3000}</p>
          <p>Deployed: ${new Date().toLocaleString()}</p>
        </div>

        <h3>🛠️ Contador de Frequência de Palavras</h3>
        <div class="input-group">
          <label for="textInput">Digite seu texto aqui:</label>
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
          const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
          const text = textInput.value;

          if (!text.trim()) {
            showResult({ error: "Por favor, digite algum texto para contar as palavras." });
            return;
          }

          try { // Adicionado bloco try-catch para lidar com erros de rede/API
            const response = await fetch('/api/word-count', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ text: text })
            });

            // Verifica se a resposta foi bem-sucedida (status 2xx)
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: response.statusText }));
              showResult({ error: `Erro na API: ${response.status}`, details: errorData });
              return;
            }

            const data = await response.json();
            showResult(data);
          } catch (error) { // Captura erros de rede ou problemas na parsing do JSON
            console.error('Erro ao conectar ou processar a resposta da API:', error);
            showResult({ error: "Não foi possível conectar ao servidor ou processar a resposta.", details: (error as Error).message });
          }
        };
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API: Contador de Frequência de Palavras - Nova e única API funcional
app.post('/api/word-count', (req: Request, res: Response) => {
  const { text } = req.body as { text: string };

  if (!text || typeof text !== 'string') {
    // Retorna erro 400 se o texto for inválido ou ausente
    return res.status(400).json({ error: 'Texto inválido fornecido.' });
  }

  const wordFrequency = countWordFrequency(text);

  res.json({ text_input: text, word_counts: wordFrequency, total_words: Object.values(wordFrequency).reduce((sum: number, count: number) => sum + count, 0) });
});

// Removidas todas as outras rotas (UUID, Calculadora, TODOs, Clima, Validador)
// para manter o servidor focado no Contador de Palavras.

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor MCP (Contador de Palavras) rodando na porta ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Interface: http://localhost:${port}/`);
});
