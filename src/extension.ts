import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const configuredPath = vscode.workspace
    .getConfiguration('actus')
    .get<string>('lsp.path', 'actus');
  const command = resolveActusCommand(configuredPath, context);
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const output = vscode.window.createOutputChannel('Actus Language Server');
  context.subscriptions.push(output);
  const serverOptions: ServerOptions = async () => {
    const child = spawn(command, ['lsp'], {
      cwd: workspaceRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    child.stderr?.on('data', data => output.appendLine(data.toString().trimEnd()));
    child.on('error', error => output.appendLine(`failed to start ${command}: ${error.message}`));
    child.on('exit', (code, signal) => output.appendLine(`actus lsp exited: code=${code} signal=${signal}`));
    output.appendLine(`starting ${command} lsp`);
    return child;
  };
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'actus' }],
    outputChannelName: 'Actus Language Server',
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
    cargoInstalledExecutable(),
  ].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.find(candidate => fs.existsSync(candidate)) ?? configuredPath;
}

function cargoInstalledExecutable(): string | undefined {
  const home = process.env.HOME ?? process.env.USERPROFILE;
  return home && path.join(home, '.cargo', 'bin', executableName());
}

function executableName(): string {
  return process.platform === 'win32' ? 'actus.exe' : 'actus';
}
