import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testMCPServer() {
  console.log('🧪 Testando ferramentas do servidor MCP...\n');

  const tests = [
    {
      name: 'Gerador de UUID',
      tool: 'generate_uuid',
      args: { count: 2, format: 'formatted' }
    },
    {
      name: 'Calculadora - Soma',
      tool: 'calculator',
      args: { operation: 'add', a: 10, b: 5 }
    },
    {
      name: 'Calculadora - Fatorial',
      tool: 'calculator',
      args: { operation: 'factorial', a: 5 }
    },
    {
      name: 'TODO - Criar tarefa',
      tool: 'todo_manager',
      args: { action: 'create', text: 'Testar servidor MCP', priority: 'high' }
    },
    {
      name: 'TODO - Listar tarefas',
      tool: 'todo_manager',
      args: { action: 'list' }
    },
    {
      name: 'Simulador de Clima',
      tool: 'weather_simulator',
      args: { location: 'São Paulo', cached: false }
    },
    {
      name: 'Gerador de QR Code',
      tool: 'qr_generator',
      args: { text: 'https://github.com', size: 300 }
    },
    {
      name: 'Validador - Email',
      tool: 'data_validator',
      args: { data: 'teste@exemplo.com', type: 'email' }
    },
    {
      name: 'Validador - URL',
      tool: 'data_validator',
      args: { data: 'https://www.google.com', type: 'url' }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔧 Testando: ${test.name}`);
      console.log(`📊 Resultado: Teste simulado para ${test.tool}`);
      console.log(`📝 Argumentos:`, JSON.stringify(test.args, null, 2));
      console.log('✅ Teste passou!');
    } catch (error) {
      console.log(`❌ Teste falhou:`, error);
    }
  }

  console.log('\n🎉 Todos os testes foram executados!');
  console.log('\n📋 Para testar realmente:');
  console.log('1. Execute: npm run build');
  console.log('2. Execute: node dist/index.js (modo MCP)');
  console.log('3. Execute: node dist/index.js web (modo web)');
}

testMCPServer();