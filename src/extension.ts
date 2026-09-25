import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const configuredPath = vscode.workspace
    .getConfiguration('actus')
    .get<string>('lsp.path', 'actus');
  const command = resolveActusCommand(configuredPath, context);
  const serverOptions: ServerOptions = {
    command,
    args: ['lsp'],
    transport: TransportKind.stdio,
  };
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'actus' }],
    synchronize: {
      configurationSection: 'actus',
    },
  };
  client = new LanguageClient('actusLsp', 'Actus Language Server', serverOptions, clientOptions);
  context.subscriptions.push(client);
  void client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

function resolveActusCommand(configuredPath: string, context: vscode.ExtensionContext): string {
  if (configuredPath !== 'actus') {
    return configuredPath;
  }
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const candidates = [
    workspaceRoot && path.join(workspaceRoot, 'target', 'debug', executableName()),
    path.join(context.extensionPath, '..', 'actus', 'target', 'debug', executableName()),
  ].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.find(candidate => fs.existsSync(candidate)) ?? configuredPath;
}

function executableName(): string {
  return process.platform === 'win32' ? 'actus.exe' : 'actus';
}
