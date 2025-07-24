#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tipos e interfaces
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  timestamp: string;
}

interface QRCodeData {
  text: string;
  url: string;
  format: 'png' | 'svg';
}

// Armazenamento em memória (em produção, use um banco de dados)
let todos: TodoItem[] = [];
let weatherCache: Map<string, WeatherData> = new Map();

/**
 * Cria o servidor MCP com todas as ferramentas
 */
function createMCPServer(): McpServer {
  const server = new McpServer(
    {
      name: 'typescript-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // FERRAMENTA 1: Gerador de UUID
  server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name === 'generate_uuid') {
      const schema = z.object({
        count: z.number().min(1).max(10).default(1),
        format: z.enum(['simple', 'formatted']).default('simple')
      });

      const { count, format } = schema.parse(request.params.arguments || {});
      const uuids = Array.from({ length: count }, () => {
        const uuid = uuidv4();
        return format === 'formatted' ? `UUID: ${uuid}` : uuid;
      });

      return {
        content: [
          {
            type: 'text',
            text: `Gerados ${count} UUID(s):\n${uuids.join('\n')}`
          }
        ]
      };
    }

    // FERRAMENTA 2: Calculadora Avançada
    if (request.params.name === 'calculator') {
      const schema = z.object({
        operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'factorial']),
        a: z.number(),
        b: z.number().optional()
      });

      const { operation, a, b } = schema.parse(request.params.arguments);
      let result: number;

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
          if (!b || b === 0) throw new Error('Divisão por zero não é permitida');
          result = a / b;
          break;
        case 'power':
          result = Math.pow(a, b || 2);
          break;
        case 'sqrt':
          if (a < 0) throw new Error('Raiz quadrada de número negativo não é real');
          result = Math.sqrt(a);
          break;
        case 'factorial':
          if (a < 0 || !Number.isInteger(a)) throw new Error('Fatorial só funciona para números inteiros não negativos');
          result = Array.from({ length: a }, (_, i) => i + 1).reduce((acc, n) => acc * n, 1);
          break;
        default:
          throw new Error('Operação não suportada');
      }

      return {
        content: [
          {
            type: 'text',
            text: `Resultado da operação ${operation}: ${result}`
          }
        ]
      };
    }

    // FERRAMENTA 3: Gerenciador de Tarefas (TODO)
    if (request.params.name === 'todo_manager') {
      const schema = z.object({
        action: z.enum(['create', 'list', 'complete', 'delete', 'update']),
        id: z.string().optional(),
        text: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional()
      });

      const { action, id, text, priority } = schema.parse(request.params.arguments);

      switch (action) {
        case 'create':
          if (!text) throw new Error('Texto da tarefa é obrigatório');
          const newTodo: TodoItem = {
            id: uuidv4(),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: priority || 'medium'
          };
          todos.push(newTodo);
          return {
            content: [
              {
                type: 'text',
                text: `Tarefa criada com sucesso!\nID: ${newTodo.id}\nTexto: ${newTodo.text}\nPrioridade: ${newTodo.priority}`
              }
            ]
          };

        case 'list':
          const todoList = todos.map(todo => 
            `[${todo.completed ? '✓' : ' '}] ${todo.text} (${todo.priority}) - ID: ${todo.id}`
          ).join('\n');
          return {
            content: [
              {
                type: 'text',
                text: `Lista de Tarefas (${todos.length} itens):\n${todoList || 'Nenhuma tarefa encontrada'}`
              }
            ]
          };

        case 'complete':
          if (!id) throw new Error('ID da tarefa é obrigatório');
          const todoToComplete = todos.find(t => t.id === id);
          if (!todoToComplete) throw new Error('Tarefa não encontrada');
          todoToComplete.completed = true;
          return {
            content: [
              {
                type: 'text',
                text: `Tarefa marcada como concluída: ${todoToComplete.text}`
              }
            ]
          };

        case 'delete':
          if (!id) throw new Error('ID da tarefa é obrigatório');
          const index = todos.findIndex(t => t.id === id);
          if (index === -1) throw new Error('Tarefa não encontrada');
          const deletedTodo = todos.splice(index, 1)[0];
          return {
            content: [
              {
                type: 'text',
                text: `Tarefa deletada: ${deletedTodo.text}`
              }
            ]
          };

        default:
          throw new Error('Ação não suportada');
      }
    }

    // FERRAMENTA 4: Simulador de Clima
    if (request.params.name === 'weather_simulator') {
      const schema = z.object({
        location: z.string(),
        cached: z.boolean().default(true)
      });

      const { location, cached } = schema.parse(request.params.arguments);
      
      if (cached && weatherCache.has(location)) {
        const weather = weatherCache.get(location)!;
        return {
          content: [
            {
              type: 'text',
              text: `Clima em ${weather.location} (cached):\nTemperatura: ${weather.temperature}°C\nDescrição: ${weather.description}\nUmidade: ${weather.humidity}%\nAtualizado: ${weather.timestamp}`
            }
          ]
        };
      }

      // Simular dados meteorológicos
      const weather: WeatherData = {
        location,
        temperature: Math.round((Math.random() * 40) - 10), // -10°C a 30°C
        description: ['Ensolarado', 'Nublado', 'Chuvoso', 'Tempestuoso', 'Parcialmente nublado'][Math.floor(Math.random() * 5)],
        humidity: Math.round(Math.random() * 100),
        timestamp: new Date().toISOString()
      };

      weatherCache.set(location, weather);

      return {
        content: [
          {
            type: 'text',
            text: `Clima em ${weather.location}:\nTemperatura: ${weather.temperature}°C\nDescrição: ${weather.description}\nUmidade: ${weather.humidity}%\nAtualizado: ${weather.timestamp}`
          }
        ]
      };
    }

    // FERRAMENTA 5: Gerador de QR Code
    if (request.params.name === 'qr_generator') {
      const schema = z.object({
        text: z.string(),
        size: z.number().min(100).max(1000).default(200)
      });

      const { text, size } = schema.parse(request.params.arguments);
      
      // Usando API pública para gerar QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
      
      return {
        content: [
          {
            type: 'text',
            text: `QR Code gerado para: "${text}"\nURL da imagem: ${qrUrl}\nTamanho: ${size}x${size}px`
          }
        ]
      };
    }

    // FERRAMENTA 6: Validador de Dados
    if (request.params.name === 'data_validator') {
      const schema = z.object({
        data: z.string(),
        type: z.enum(['email', 'url', 'json', 'uuid', 'phone', 'cpf'])
      });

      const { data, type } = schema.parse(request.params.arguments);
      let isValid = false;
      let message = '';

      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(data);
          message = isValid ? 'Email válido' : 'Email inválido';
          break;

        case 'url':
          try {
            new URL(data);
            isValid = true;
            message = 'URL válida';
          } catch {
            isValid = false;
            message = 'URL inválida';
          }
          break;

        case 'json':
          try {
            JSON.parse(data);
            isValid = true;
            message = 'JSON válido';
          } catch {
            isValid = false;
            message = 'JSON inválido';
          }
          break;

        case 'uuid':
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          isValid = uuidRegex.test(data);
          message = isValid ? 'UUID válido' : 'UUID inválido';
          break;

        case 'phone':
          const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
          isValid = phoneRegex.test(data);
          message = isValid ? 'Telefone válido' : 'Telefone inválido';
          break;

        case 'cpf':
          // Validação básica de CPF
          const cpf = data.replace(/\D/g, '');
          isValid = cpf.length === 11 && !/^(\d)\1{10}$/.test(cpf);
          message = isValid ? 'CPF válido (formato)' : 'CPF inválido';
          break;
      }

      return {
        content: [
          {
            type: 'text',
            text: `Validação de ${type.toUpperCase()}:\nDados: ${data}\nResultado: ${message}\nStatus: ${isValid ? '✅ Válido' : '❌ Inválido'}`
          }
        ]
      };
    }

    throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
  });

  // Lista de ferramentas disponíveis
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: [
        {
          name: 'generate_uuid',
          description: 'Gera UUIDs únicos',
          inputSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: 'Número de UUIDs para gerar (1-10)',
                minimum: 1,
                maximum: 10,
                default: 1
              },
              format: {
                type: 'string',
                enum: ['simple', 'formatted'],
                description: 'Formato de saída do UUID',
                default: 'simple'
              }
            }
          }
        },
        {
          name: 'calculator',
          description: 'Calculadora avançada com operações matemáticas',
          inputSchema: {
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                enum: ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'factorial'],
                description: 'Operação matemática a ser realizada'
              },
              a: {
                type: 'number',
                description: 'Primeiro número'
              },
              b: {
                type: 'number',
                description: 'Segundo número (opcional para algumas operações)'
              }
            },
            required: ['operation', 'a']
          }
        },
        {
          name: 'todo_manager',
          description: 'Gerenciador de tarefas completo',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['create', 'list', 'complete', 'delete', 'update'],
                description: 'Ação a ser realizada'
              },
              id: {
                type: 'string',
                description: 'ID da tarefa (necessário para complete, delete, update)'
              },
              text: {
                type: 'string',
                description: 'Texto da tarefa (necessário para create)'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Prioridade da tarefa',
                default: 'medium'
              }
            },
            required: ['action']
          }
        },
        {
          name: 'weather_simulator',
          description: 'Simulador de dados meteorológicos',
          inputSchema: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'Nome da cidade ou localização'
              },
              cached: {
                type: 'boolean',
                description: 'Usar dados em cache se disponíveis',
                default: true
              }
            },
            required: ['location']
          }
        },
        {
          name: 'qr_generator',
          description: 'Gerador de códigos QR',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Texto ou URL para codificar no QR'
              },
              size: {
                type: 'number',
                description: 'Tamanho da imagem em pixels (100-1000)',
                minimum: 100,
                maximum: 1000,
                default: 200
              }
            },
            required: ['text']
          }
        },
        {
          name: 'data_validator',
          description: 'Validador de diferentes tipos de dados',
          inputSchema: {
            type: 'object',
            properties: {
              data: {
                type: 'string',
                description: 'Dados a serem validados'
              },
              type: {
                type: 'string',
                enum: ['email', 'url', 'json', 'uuid', 'phone', 'cpf'],
                description: 'Tipo de validação a ser aplicada'
              }
            },
            required: ['data', 'type']
          }
        }
      ]
    };
  });

  return server;
}

/**
 * Interface web para demonstração
 */
function createWebInterface(): express.Application {
  const app = express();
  
  app.use(express.json());
  app.use(express.static('public'));

  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MCP Server - TypeScript</title>
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
          .endpoint {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Servidor MCP TypeScript</h1>
          <div class="status">
            <h2>✅ Servidor Funcionando</h2>
            <p>Port: ${process.env.PORT || 3000} | Status: Online | Ferramentas: 6</p>
          </div>
          
          <h2>🛠️ Ferramentas Disponíveis</h2>
          
          <div class="tool-card">
            <div class="tool-name">🔄 Gerador de UUID</div>
            <div class="tool-desc">Gera identificadores únicos universais em diferentes formatos</div>
          </div>
          
          <div class="tool-card">
            <div class="tool-name">🧮 Calculadora Avançada</div>
            <div class="tool-desc">Operações matemáticas: soma, subtração, multiplicação, divisão, potência, raiz quadrada, fatorial</div>
          </div>
          
          <div class="tool-card">
            <div class="tool-name">📝 Gerenciador de Tarefas</div>
            <div class="tool-desc">CRUD completo de tarefas com prioridades e controle de status</div>
          </div>
          
          <div class="tool-card">
            <div class="tool-name">🌤️ Simulador de Clima</div>
            <div class="tool-desc">Simula dados meteorológicos para qualquer localização com cache</div>
          </div>
          
          <div class="tool-card">
            <div class="tool-name">📱 Gerador de QR Code</div>
            <div class="tool-desc">Cria códigos QR para textos e URLs com tamanhos personalizáveis</div>
          </div>
          
          <div class="tool-card">
            <div class="tool-name">✅ Validador de Dados</div>
            <div class="tool-desc">Valida emails, URLs, JSON, UUIDs, telefones e CPFs</div>
          </div>

          <div class="endpoint">
            <strong>Endpoint MCP:</strong> stdio://mcp-server<br>
            <strong>Comando:</strong> node dist/index.js<br>
            <strong>Health Check:</strong> GET /health
          </div>
        </div>
      </body>
      </html>
    `);
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      tools: 6,
      todos: todos.length,
      weatherCache: weatherCache.size
    });
  });

  app.get('/api/todos', (req, res) => {
    res.json(todos);
  });

  return app;
}

/**
 * Função principal
 */
async function main() {
  const mode = process.argv[2] || 'mcp';

  if (mode === 'web') {
    // Modo web para demonstração
    const app = createWebInterface();
    const port = process.env.PORT || 3000;
    
    app.listen(port, () => {
      console.log(`🌐 Interface web rodando em http://localhost:${port}`);
    });
  } else {
    // Modo MCP padrão
    const server = createMCPServer();
    const transport = new StdioServerTransport();
    
    console.error('🚀 Iniciando servidor MCP TypeScript...');
    
    await server.connect(transport);
    console.error('✅ Servidor MCP conectado e pronto!');
  }
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

// Inicia o servidor
main().catch((error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});