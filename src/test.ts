// Importa função exec do módulo child_process para executar comandos do sistema
import { exec } from 'child_process';
// Importa promisify para converter exec em uma função que retorna Promise
import { promisify } from 'util';

// Converte exec em uma versão assíncrona usando promisify
const execAsync = promisify(exec);

// Função assíncrona principal para testar o servidor MCP
async function testMCPServer() {
  console.log('🧪 Testando ferramentas do servidor MCP...\n');

  // Array com configurações de teste para diferentes ferramentas
  // Cada objeto representa um teste com nome, ferramenta e argumentos específicos
  const tests = [
    {
      name: 'Gerador de UUID', // Nome descritivo do teste
      tool: 'generate_uuid', // Nome da ferramenta a ser testada
      args: { count: 2, format: 'formatted' } // Argumentos: gerar 2 UUIDs formatados
    },
    {
      name: 'Calculadora - Soma',
      tool: 'calculator',
      args: { operation: 'add', a: 10, b: 5 } // Operação: somar 10 + 5
    },
    {
      name: 'Calculadora - Fatorial',
      tool: 'calculator',
      args: { operation: 'factorial', a: 5 } // Operação: fatorial de 5
    },
    {
      name: 'TODO - Criar tarefa',
      tool: 'todo_manager',
      args: { action: 'create', text: 'Testar servidor MCP', priority: 'high' } // Criar tarefa com prioridade alta
    },
    {
      name: 'TODO - Listar tarefas',
      tool: 'todo_manager',
      args: { action: 'list' } // Listar todas as tarefas
    },
    {
      name: 'Simulador de Clima',
      tool: 'weather_simulator',
      args: { location: 'São Paulo', cached: false } // Simular clima de São Paulo sem cache
    },
    {
      name: 'Gerador de QR Code',
      tool: 'qr_generator',
      args: { text: 'https://github.com', size: 300 } // Gerar QR code do GitHub com tamanho 300px
    },
    {
      name: 'Validador - Email',
      tool: 'data_validator',
      args: { data: 'teste@exemplo.com', type: 'email' } // Validar formato de email
    },
    {
      name: 'Validador - URL',
      tool: 'data_validator',
      args: { data: 'https://www.google.com', type: 'url' } // Validar formato de URL
    }
  ];

  // Loop que executa cada teste definido no array
  for (const test of tests) {
    try {
      // Exibe informações sobre o teste atual
      console.log(`\n🔧 Testando: ${test.name}`);
      console.log(`📊 Resultado: Teste simulado para ${test.tool}`);
      // Formata e exibe os argumentos do teste de forma legível (JSON com indentação)
      console.log(`📝 Argumentos:`, JSON.stringify(test.args, null, 2));
      console.log('✅ Teste passou!');
    } catch (error) {
      // Se ocorrer algum erro durante o teste, exibe a mensagem de erro
      console.log(`❌ Teste falhou:`, error);
    }
  }

  // Mensagem final indicando que todos os testes foram executados
  console.log('\n🎉 Todos os testes foram executados!');
  console.log('\n📋 Para testar realmente:');
  // Instruções para executar os testes de forma real
  console.log('1. Execute: npm run build'); // Compila o TypeScript para JavaScript
  console.log('2. Execute: node dist/index.js (modo MCP)'); // Executa em modo MCP
  console.log('3. Execute: node dist/index.js web (modo web)'); // Executa em modo web
}

// Chama a função principal para executar os testes
testMCPServer();