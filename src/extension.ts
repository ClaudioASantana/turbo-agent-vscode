import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const provider = new TurboAgentViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TurboAgentViewProvider.viewType, provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('turboAgent.start', () => {
      vscode.commands.executeCommand('workbench.view.extension.turbo-agent-sidebar');
    })
  );
}

class TurboAgentViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'turboAgent.chatView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === 'OPEN_FILE' && data.filePath) {
        try {
          const uri = vscode.Uri.file(data.filePath);
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: false });
        } catch (e) {
          vscode.window.showErrorMessage(`Failed to open file: ${e}`);
        }
      } else if (data.type === 'OPEN_DIFF' && data.originalPath && data.proposedPath) {
        try {
          const uriOriginal = vscode.Uri.file(data.originalPath);
          const uriProposed = vscode.Uri.file(data.proposedPath);
          await vscode.commands.executeCommand('vscode.diff', uriOriginal, uriProposed, 'Preview: Alteração do Agente');
        } catch (e) {
          vscode.window.showErrorMessage(`Failed to open diff: ${e}`);
        }
      }
    });

    // Listen for events from the active editor to send context to the webview
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        this.sendContextToWebview(editor);
      }
    });

    vscode.window.onDidChangeTextEditorSelection(e => {
      this.sendContextToWebview(e.textEditor);
    });

    // Send initial context
    setTimeout(() => {
      if (vscode.window.activeTextEditor) {
        this.sendContextToWebview(vscode.window.activeTextEditor);
      } else {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspacePath = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : '';
        if (this._view && workspacePath) {
          this._view.webview.postMessage({
            type: 'CONTEXT_UPDATE',
            payload: {
              fileName: '',
              languageId: '',
              selectedText: '',
              cursorLine: 0,
              workspacePath: workspacePath
            }
          });
        }
      }
    }, 1000); // Give the iframe a moment to load
  }

  private sendContextToWebview(editor: vscode.TextEditor) {
    if (!this._view) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const text = document.getText(selection);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspacePath = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : '';

    // This message will be received by window.addEventListener('message') in the React App
    this._view.webview.postMessage({
      type: 'CONTEXT_UPDATE',
      payload: {
        fileName: document.fileName,
        languageId: document.languageId,
        selectedText: text,
        cursorLine: selection.active.line + 1,
        workspacePath: workspacePath
      }
    });
  }

  private _getHtmlForWebview() {
    // Agora o React é embutido na própria extensão para evitar problemas com CSP e módulos!
    const uiPath = vscode.Uri.joinPath(this._extensionUri, 'resources', 'ui');
    const htmlPath = vscode.Uri.joinPath(uiPath, 'index.html');
    
    let html = '';
    try {
      html = fs.readFileSync(htmlPath.fsPath, 'utf-8');
    } catch (e) {
      return `<!DOCTYPE html><html><body><h1>Error loading UI: ${e}</h1></body></html>`;
    }

    // O Webview requer um schema especial (vscode-webview-resource://) para carregar os JS e CSS locais.
    // Vamos substituir os caminhos relativos do Vite ('/assets/...') para os URIs do webview
    const webviewUri = this._view?.webview.asWebviewUri(uiPath).toString();
    
    html = html.replace(/(href|src)="\/assets\//g, `$1="${webviewUri}/assets/`).replace(/\.js"/g, `.js?v=${Date.now()}"`).replace(/\.css"/g, `.css?v=${Date.now()}"`);
    
    // Adicionar a CSP exigida pelo VS Code e permitir requisições fetch para o backend do Turbo Agent
    html = html.replace('<head>', `<head>
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-webview-resource: https: http:; script-src 'unsafe-inline' vscode-webview-resource:; style-src 'unsafe-inline' vscode-webview-resource:; connect-src http://localhost:3333 ws://localhost:3333 http://127.0.0.1:3333 ws://127.0.0.1:3333;">
      <script>
        const vscode = acquireVsCodeApi();
        window.addEventListener('message', event => {
          if (event.data.type === 'CONTEXT_UPDATE') {
            window.dispatchEvent(new CustomEvent('vscode-context', { detail: event.data.payload }));
          }
        });
        window.addEventListener('vscode-command', event => {
          vscode.postMessage(event.detail);
        });
      </script>`);

    return html;
  }
}
