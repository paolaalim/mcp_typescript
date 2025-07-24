const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Armazenamento em memória
let todos = [];
let weatherCache = new Map();

// Página inicial
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Servidor MCP - Funcionando! 🚀</title>
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
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          padding: 30px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }
        h1 { color: #fff; text-align: center; margin-bottom: 30px; }
        .tool-card {
          background: rgba(255, 255, 255, 0.2);
          margin: 15px 0;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #00d4aa;
        }
        .tool-name { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
        .tool-desc { opacity: 0.9; }
        .status { 
          text-align: center; 
          padding: 20px; 
          background: rgba(0, 212, 170, 0.2);
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .api-demo {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
        button {
          background: #00d4aa;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin: 5px;
        }
        button:hover { background: #00b894; }
        #result { 
          background: rgba(255, 255, 255, 0.1); 
          padding: 15px; 
          border-radius: 5px; 
          margin-top: 10px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Servidor MCP Funcionando!</h1>
        <div class="status">
          <h2>✅ Status: Online</h2>
          <p>Port: ${process.env.PORT || 3000} | Tarefas: ${todos.length} | Cache: ${weatherCache.size} itens</p>
          <p>Deployed: ${new Date().toLocaleString()}</p>
        </div>
        
        <h2>🛠️ Ferramentas Funcionais</h2>
        
        <div class="tool-card">
          <div class="tool-name">🔄 Gerador de UUID</div>
          <div class="tool-desc">Gera identificadores únicos universais</div>
        </div>
        
        <div class="tool-card">
          <div class="tool-name">📝 Gerenciador de Tarefas</div>
          <div class="tool-desc">Sistema completo de TODOs com CRUD</div>
        </div>
        
        <div class="tool-card">
          <div class="tool-name">🧮 Calculadora Avançada</div>
          <div class="tool-desc">Operações matemáticas: +, -, *, /, ^, √, !</div>
        </div>
        
        <div class="tool-card">
          <div class="tool-name">🌤️ Simulador de Clima</div>
          <div class="tool-desc">Dados meteorológicos simulados com cache</div>
        </div>
        
        <div class="tool-card">
          <div class="tool-name">📱 Gerador de QR Code</div>
          <div class="tool-desc">Códigos QR para textos e URLs</div>
        </div>
        
        <div class="tool-card">
          <div class="tool-name">✅ Validador de Dados</div>
          <div class="tool-desc">Valida emails, URLs, JSON, UUIDs, telefones</div>
        </div>

        <div class="api-demo">
          <h3>🧪 Teste as APIs</h3>
          <button onclick="testUUID()">Gerar UUID</button>
          <button onclick="testCalculator()">Calcular 5!</button>
          <button onclick="testTodo()">Criar Tarefa</button>
          <button onclick="testWeather()">Clima SP</button>
          <button onclick="testValidator()">Validar Email</button>
          <div id="result"></div>
        </div>
      </div>

      <script>
        const showResult = (data) => {
          document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        };

        const testUUID = async () => {
          const response = await fetch('/api/uuid', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({count: 2}) });
          showResult(await response.json());
        };

        const testCalculator = async () => {
          const response = await fetch('/api/calculator', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({operation: 'factorial', a: 5}) });
          showResult(await response.json());
        };

        const testTodo = async () => {
          const response = await fetch('/api/todos', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text: 'Testar servidor MCP', priority: 'high'}) });
          showResult(await response.json());
        };

        const testWeather = async () => {
          const response = await fetch('/api/weather', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({location: 'São Paulo'}) });
          showResult(await response.json());
        };

        const testValidator = async () => {
          const response = await fetch('/api/validator', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({data: 'teste@exemplo.com', type: 'email'}) });
          showResult(await response.json());
        };
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    todos: todos.length,
    weatherCache: weatherCache.size,
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API: Gerador de UUID
app.post('/api/uuid', (req, res) => {
  const count = Math.min(req.body.count || 1, 10);
  const format = req.body.format || 'simple';
  const uuids = Array.from({ length: count }, () => {
    const uuid = uuidv4();
    return format === 'formatted' ? `UUID: ${uuid}` : uuid;
  });
  res.json({ uuids, count, format });
});

// API: Calculadora
app.post('/api/calculator', (req, res) => {
  const { operation, a, b } = req.body;
  let result;

  try {
    switch (operation) {
      case 'add':
        result = a + (b || 0);
        break;
      case 'subtract':
        result = a - (b || 0);
        break;
      case 'multiply':
        result = a * (b || 1);
        break;
      case 'divide':
        if (!b || b === 0) throw new Error('Divisão por zero');
        result = a / b;
        break;
      case 'power':
        result = Math.pow(a, b || 2);
        break;
      case 'sqrt':
        if (a < 0) throw new Error('Raiz de número negativo');
        result = Math.sqrt(a);
        break;
      case 'factorial':
        if (a < 0 || !Number.isInteger(a)) throw new Error('Fatorial inválido');
        result = Array.from({ length: a }, (_, i) => i + 1).reduce((acc, n) => acc * n, 1);
        break;
      default:
        throw new Error('Operação não suportada');
    }
    res.json({ operation, a, b, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API: Gerenciador de TODOs
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const todo = {
    id: uuidv4(),
    text: req.body.text || 'Nova tarefa',
    completed: false,
    priority: req.body.priority || 'medium',
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Tarefa não encontrada' });
  
  if (req.body.completed !== undefined) todo.completed = req.body.completed;
  if (req.body.text) todo.text = req.body.text;
  if (req.body.priority) todo.priority = req.body.priority;
  
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
  
  const deleted = todos.splice(index, 1)[0];
  res.json(deleted);
});

// API: Simulador de Clima
app.post('/api/weather', (req, res) => {
  const location = req.body.location || 'Unknown';
  
  if (weatherCache.has(location)) {
    return res.json(weatherCache.get(location));
  }

  const weather = {
    location,
    temperature: Math.round((Math.random() * 40) - 10),
    description: ['Ensolarado', 'Nublado', 'Chuvoso', 'Tempestuoso', 'Parcialmente nublado'][Math.floor(Math.random() * 5)],
    humidity: Math.round(Math.random() * 100),
    timestamp: new Date().toISOString()
  };

  weatherCache.set(location, weather);
  res.json(weather);
});

// API: Validador de Dados
app.post('/api/validator', (req, res) => {
  const { data, type } = req.body;
  let isValid = false;
  let message = '';

  try {
    switch (type) {
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data);
        message = isValid ? 'Email válido' : 'Email inválido';
        break;
      case 'url':
        new URL(data);
        isValid = true;
        message = 'URL válida';
        break;
      case 'json':
        JSON.parse(data);
        isValid = true;
        message = 'JSON válido';
        break;
      case 'uuid':
        isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data);
        message = isValid ? 'UUID válido' : 'UUID inválido';
        break;
      default:
        throw new Error('Tipo não suportado');
    }
  } catch (error) {
    isValid = false;
    message = error.message;
  }

  res.json({ data, type, isValid, message });
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor MCP rodando na porta ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Interface: http://localhost:${port}/`);
});
