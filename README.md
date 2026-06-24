# 🚀 Turbo-Agent VS Code Extension

**O seu assistente pessoal conectado ao Turbo-Agent local diretamente do VS Code.**

A extensão **Turbo-Agent** traz todo o poder do seu agente autônomo de IA local para dentro da sua IDE. Converse com seu agente, execute tarefas, analise código e interaja com o sistema operacional sem precisar sair do Visual Studio Code.

---

## ✨ Principais Funcionalidades

- **Chat Integrado na Sidebar**: Uma interface webview moderna nativa do VS Code, permitindo fácil acesso ao seu assistente.
- **Conexão Direta com o Turbo-Agent Local**: Se comunica nativamente com o seu `turbo-agent` rodando localmente na sua máquina.
- **Automação de Tarefas e Análise de Código**: Peça para o agente explicar trechos de código, refatorar funções ou criar novos arquivos diretamente do seu editor.
- **Segurança e Privacidade**: Todo o processamento continua seguindo a arquitetura local e as diretrizes do `turbo-agent` original (sem vazar segredos).

---

## 🚀 Como Começar

### Pré-requisitos
Para utilizar esta extensão, você precisa ter o projeto base do **Turbo-Agent** configurado e rodando na sua máquina.

### Instalação (Desenvolvimento Local)
Como esta extensão ainda está em desenvolvimento, você pode instalá-la manualmente:

1. Clone o repositório do `turbo-agent-vscode`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Gere o pacote da extensão `.vsix`:
   ```bash
   npm run package
   ```
4. Instale a extensão no seu VS Code:
   Abra o VS Code > Vá na aba Extensions (Extensões) > Clique nos `...` no canto superior direito > Selecione **Install from VSIX...** e escolha o arquivo `.vsix` gerado (`turbo-agent-vscode-0.0.1.vsix`).

### Utilização

1. Certifique-se de que o backend do **Turbo-Agent** local está rodando e acessível.
2. No VS Code, abra a barra lateral e clique no ícone do **Turbo Agent** (Activity Bar).
3. Uma janela de **Chat** será aberta. Comece a enviar comandos e interagir com seu assistente local!
4. Você também pode invocar o agente através da *Command Palette* (`Ctrl+Shift+P` ou `Cmd+Shift+P`) buscando por: `Start Turbo Agent`.

---

## 🏗️ Estrutura do Projeto

A extensão foi construída para ser leve e reativa:

- **Webview (`turboAgent.chatView`)**: Renderiza a interface de chat interativa direto na Sidebar da IDE.
- **Webpack**: Empacotamento ágil do código fonte para máxima performance dentro do editor (`npm run compile`, `npm run watch`).
- **TypeScript**: Todo o código é fortemente tipado para prevenir bugs durante a comunicação com a API do agente.

---

## 🔮 Próximos Passos (Roadmap)
- **Contexto Automático de Código**: Enviar o texto selecionado ou arquivos atualmente abertos como contexto imediato para o agente.
- **Ações Inteligentes no Editor**: Aplicar *diffs* de código sugeridos pelo agente com um único clique (Apply to Editor).
- **Lançamento Oficial**: Publicar a extensão no VS Code Marketplace.
