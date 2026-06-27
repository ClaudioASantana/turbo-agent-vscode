# Análise do Projeto: Turbo Agent VS Code Extension

## 🛠️ Arquitetura da Extensão (VS Code)

### 1. Integração via Webview (Sidebar)
A extensão registra o provedor `TurboAgentViewProvider` na Activity Bar (barra lateral) com o ID `turboAgent.chatView`. Ela carrega exatamente os arquivos estáticos compilados em `resources/ui/index.html` (gerados a partir do projeto React/Vite principal).

### 2. Sistema de Comunicação Bidirecional (Editor ↔ UI)
Foi implementada uma excelente troca de mensagens entre o VS Code e a interface React:

*   **Editor -> UI (`CONTEXT_UPDATE`)**: 
    A extensão monitora ativamente mudanças na aba aberta (`onDidChangeActiveTextEditor`) e na seleção de texto (`onDidChangeTextEditorSelection`). Ela envia em tempo real para a interface React informações cruciais de contexto:
    *   Nome do arquivo atual (`fileName`)
    *   Linguagem (`languageId`)
    *   Texto selecionado (`selectedText`)
    *   Linha do cursor (`cursorLine`)
    *   Caminho do workspace (`workspacePath`)

*   **UI -> Editor**: 
    A interface pode disparar comandos de volta para o VS Code:
    *   `OPEN_FILE`: Abre um arquivo diretamente no editor lado a lado (`ViewColumn.Beside`).
    *   `OPEN_DIFF`: Abre a tela de *diff* nativa do VS Code (`vscode.diff`) para comparar o arquivo original com o arquivo modificado pelo agente ("Preview: Alteração do Agente").

### 3. Gerenciamento de CSP (Segurança e Rede)
Para que o React funcione dentro do iFrame restrito do VS Code, o `extension.ts` injeta dinamicamente regras de `Content-Security-Policy`. 
O mais importante aqui é que ele está liberando requisições (`connect-src`) para `http://localhost:3333` e WebSockets em `ws://localhost:3333`. É exatamente por essa porta que a interface do VS Code se comunica com o servidor/core do Agente.

## 🔄 Sobre o F5 (Modo de Depuração)
O motivo pelo qual a tecla `F5` abre um novo VS Code (o *Extension Development Host*) é porque a pasta `.vscode` do projeto contém o arquivo `launch.json`, que já está devidamente configurado para rodar a extensão em modo de desenvolvimento, injetando o código recém compilado na nova instância do editor.

---
**Estado Geral:** A arquitetura está muito bem delineada, servindo perfeitamente como uma ponte (View) entre o usuário escrevendo código e o back-end poderoso do LangGraph rodando no projeto principal (`turbo-agent`).
