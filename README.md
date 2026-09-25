# Actus Language Support for VS Code

Official VS Code extension for the Actus programming language.

The extension provides:

- `.act` file association and Actus language metadata;
- TextMate syntax highlighting for declarations, roles, control flow,
  ownership markers, types, operators, strings, numbers, and comments;
- the Actus file icon in the Explorer;
- LSP diagnostics, hover information, go-to-definition, and formatting;
- configuration for selecting the `actus` compiler binary.

## Requirements

The Actus compiler must be available as `actus` on `PATH`, or configured
explicitly through `actus.lsp.path`.

The extension first checks a workspace-local debug build when the default path
is used, then falls back to the system `actus` command.

## Development

```sh
npm install
npm run build
```

Open this directory in VS Code and press `F5` to launch an Extension
Development Host.

## Configuration

To use a specific compiler binary:

```json
{
  "actus.lsp.path": "/path/to/actus"
}
```

The language server is started as:

```text
actus lsp
```

Communication uses stdio JSON-RPC through the VS Code Language Client.

## Icons

`images/extension-icon.png` is the 128×128 Marketplace/extension icon.
`images/actus.svg` is the shared `.act` file icon used for both light and dark
VS Code themes.

## Project layout

```text
vscode-actus/
├── src/extension.ts
├── syntaxes/actus.tmLanguage.json
├── images/
│   ├── actus.svg
│   └── extension-icon.png
├── language-configuration.json
├── package.json
└── tsconfig.json
```
