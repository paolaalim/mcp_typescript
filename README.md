# Servidor MCP TypeScript 

Um servidor de backend em **TypeScript** que oferece um conjunto de ferramentas através de uma **API REST**, construído com **Node.js** e **Express**.  
O projeto inclui uma interface web interativa para utilizar as ferramentas e está configurado para **deploy fácil via Docker**.

---

## 🛠️ Ferramentas Disponíveis

Atualmente, o servidor oferece as seguintes ferramentas:

1. **Contador de Palavras** → Analisa um texto e retorna a frequência de cada palavra.  
2. **Gerador de UUID** → Gera identificadores únicos universalmente (UUID v4).  
3. **Ferramenta de IA (Claude)** → Integra-se à API do Claude da Anthropic para responder a prompts de texto.  

---

## 🚀 Instalação e Uso

### Requisitos
- Node.js (versão **18** ou superior)  
- npm  

### Instalação
Clone o repositório e instale as dependências:

```bash
git clone <url-do-seu-repositorio>
cd <nome-do-repositorio>
npm install
````

Para compilar o código TypeScript e iniciar o servidor de produção:

> O comando `postinstall` já executa o build automaticamente após `npm install`

```bash
npm start
```

O servidor estará rodando em [http://localhost:3000](http://localhost:3000).

Para rodar o servidor em modo de desenvolvimento com recarregamento automático (usando `tsx`):

```bash
npm run dev
```

---

## 🐳 Deploy no EasyPanel

Este projeto está pronto para deploy usando **Docker**. O arquivo `easypanel.yml` já está configurado.

1. Faça o push do seu código para um repositório Git (GitHub, GitLab, etc.).
2. No seu painel do EasyPanel, crie um novo serviço e aponte-o para o seu repositório.
3. O EasyPanel detectará o `Dockerfile` e construirá a imagem automaticamente.
4. Configure as variáveis de ambiente necessárias.

---

## ⚙️ Variáveis de Ambiente

Para rodar o projeto, as seguintes variáveis de ambiente são necessárias:

| Variável         | Descrição                                           | Padrão                                  |
| ---------------- | --------------------------------------------------- | --------------------------------------- |
| `PORT`           | Porta em que o servidor irá rodar                   | `3000`                                  |
| `NODE_ENV`       | Ambiente da aplicação (`production`, `development`) | -                                       |
| `CLAUDE_API_KEY` | Chave de API para o serviço Claude da Anthropic     | -                                       |
| `CLAUDE_API_URL` | URL da API do Claude                                | `https://api.anthropic.com/v1/messages` |

---

## 📡 Endpoints da API

* **GET /** → Serve a interface web principal.
* **GET /health** → Verifica a saúde do serviço.
* **GET /api/status** → Retorna o status (online/offline) de cada ferramenta.
* **POST /api/word-count** → Recebe um texto e conta a frequência das palavras.
* **POST /api/generate-uuid** → Gera um ou mais UUIDs.
* **POST /api/ai-tool** → Envia um prompt para a IA do Claude.

---

## 📦 Estrutura do Projeto

```
.
├── Dockerfile          # Configuração do container Docker
├── easypanel.yml       # Configuração para deploy no EasyPanel
├── package.json        # Dependências e scripts do projeto
├── tsconfig.json       # Configurações do compilador TypeScript
├── public/             # Arquivos da interface web
│   ├── index.html      # Estrutura da página
│   ├── style.css       # Estilos visuais
│   └── script.js       # Lógica do lado do cliente
└── src/                # Código-fonte do servidor
    ├── controllers/    # Controladores que lidam com a lógica das requisições
    │   └── toolcontroller.ts
    ├── routes/         # Definição das rotas da API
    │   └── apiRoutes.ts
    ├── tools/          # Lógica de negócio de cada ferramenta
    │   ├── uuidGenerator.ts
    │   └── wordCounter.ts
    ├── config.ts       # Configuração de variáveis de ambiente
    └── index.ts        # Arquivo principal do servidor Express
```

---

## 🤝 Contribuindo

Sinta-se à vontade para abrir *issues* e enviar *pull requests*.
Toda contribuição é bem-vinda! 🚀

---

## 📄 Licença

Este projeto é licenciado sob a **Licença MIT**.
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.


Quer que eu adicione uns **badges (Node.js, TypeScript, Docker, MIT License)** no topo também, pra dar aquele charme de projeto GitHub?
```
