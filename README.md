# Servidor MCP TypeScript 🚀

Um servidor Model Context Protocol (MCP) completo em TypeScript com 6 ferramentas funcionais e interface web.

## 🛠️ Ferramentas Disponíveis

1. **Gerador de UUID** - Gera identificadores únicos
2. **Calculadora Avançada** - Operações matemáticas complexas
3. **Gerenciador de Tarefas** - CRUD completo de TODOs
4. **Simulador de Clima** - Dados meteorológicos simulados
5. **Gerador de QR Code** - Códigos QR personalizáveis
6. **Validador de Dados** - Validação de emails, URLs, JSON, etc.

## 🚀 Instalação e Uso

### Instalação
```bash
npm install
npm run build
```

### Modo MCP (Protocolo)
```bash
npm start
# ou
node dist/index.js
```

### Modo Web (Interface)
```bash
node dist/index.js web
```

### Desenvolvimento
```bash
npm run dev
```

### Testes
```bash
npm run test
```

## 🐳 Deploy no EasyPanel

1. Faça upload do código para um repositório Git
2. No EasyPanel, crie uma nova aplicação
3. Configure o source como seu repositório
4. O EasyPanel detectará automaticamente o Dockerfile
5. A aplicação ficará disponível na porta 3000

### Variáveis de Ambiente
- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente de execução

## 🔧 Configuração MCP

Para usar com clientes MCP, adicione ao seu `mcp.json`:

```json
{
  "mcpServers": {
    "typescript-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/caminho/para/o/projeto"
    }
  }
}
```

## 📡 Endpoints

- `GET /` - Interface web
- `GET /health` - Status do servidor
- `GET /api/todos` - Lista de tarefas

## 🧪 Exemplos de Uso

### Gerar UUID
```javascript
{
  "tool": "generate_uuid",
  "arguments": {
    "count": 3,
    "format": "formatted"
  }
}
```

### Calculadora
```javascript
{
  "tool": "calculator",
  "arguments": {
    "operation": "factorial",
    "a": 5
  }
}
```

### Gerenciar Tarefas
```javascript
{
  "tool": "todo_manager",
  "arguments": {
    "action": "create",
    "text": "Implementar nova feature",
    "priority": "high"
  }
}
```

## 📦 Estrutura do Projeto

```
src/
├── index.ts          # Servidor principal
├── test.ts           # Testes das ferramentas
package.json          # Dependências
tsconfig.json         # Configuração TypeScript
Dockerfile           # Container Docker
easypanel.yml        # Configuração EasyPanel
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-ferramenta`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova ferramenta'`)
4. Push para a branch (`git push origin feature/nova-ferramenta`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.