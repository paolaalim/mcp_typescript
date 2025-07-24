import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

// Removido armazenamento em memória de todos e weatherCache
// para focar apenas no UUID.

// Página inicial - Simplificada para focar no Gerador de UUID
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>✨ Servidor MCP - Gerador de UUID ✨</title>
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
          max-width: 500px; /* Limite a largura para melhor visualização */
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
        .input-group input[type="number"] {
          width: calc(100% - 22px);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #00d4aa;
          background-color: rgba(255, 255, 255, 0.9);
          color: #333;
          font-size: 1em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✨ Servidor MCP - Gerador de UUID ✨</h1>
        <div class="status">
          <h2>✅ Status: Online</h2>
          <p>Port: ${process.env.PORT || 3000}</p>
          <p>Deployed: ${new Date().toLocaleString()}</p>
        </div>

        <h3>🛠️ Gerador de UUID</h3>
        <div class="input-group">
          <label for="uuidCount">Quantos UUIDs gerar (max 10):</label>
          <input type="number" id="uuidCount" value="1" min="1" max="10">
        </div>
        <button onclick="generateUUID()">Gerar UUID(s)</button>
        <div id="result"></div>
      </div>

      <script>
        const showResult = (data) => {
          document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        };

        const generateUUID = async () => {
          const countInput = document.getElementById('uuidCount');
          let count = parseInt((countInput).value);
          if (isNaN(count) || count < 1) count = 1;
          if (count > 10) count = 10;

          const response = await fetch('/api/uuid', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ count: count, format: 'simple' })
          });
          showResult(await response.json());
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

// API: Gerador de UUID - Única API funcional
app.post('/api/uuid', (req: Request, res: Response) => {
  const { count, format } = req.body as { count?: number; format?: string };
  const numCount = Math.min(count || 1, 10); // Limita a 10 UUIDs
  const selectedFormat = format || 'simple'; // Formato 'simple' ou 'formatted'
  const uuids = Array.from({ length: numCount }, () => {
    const uuid = uuidv4();
    return selectedFormat === 'formatted' ? `UUID: ${uuid}` : uuid;
  });
  res.json({ uuids, count: numCount, format: selectedFormat });
});

// Removidas todas as outras rotas (Calculadora, TODOs, Clima, Validador)
// para manter o servidor focado no Gerador de UUID.

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor MCP (Gerador de UUID) rodando na porta ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Interface: http://localhost:${port}/`);
});
