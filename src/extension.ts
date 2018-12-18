'use strict';
import { window, workspace, ExtensionContext, TextDocumentWillSaveEvent, TextEdit, TextDocumentSaveReason, Range, Position, TextLine, commands } from 'vscode';
import * as vscode from 'vscode';


export function activate(context: ExtensionContext) {

    const disposable = workspace.onWillSaveTextDocument(willSaveTextDocument);
    context.subscriptions.push(disposable);

    context.subscriptions.push(commands.registerCommand('extension.auto-fix-redux-action-types', (e) => {
        let editor = window.activeTextEditor;
        if (!editor) {
            return;
        }

        doFixAllProblems(editor);
    }));
}

function willSaveTextDocument(e: TextDocumentWillSaveEvent) {
    const document = e.document;
    const languageIds = ['typescript', 'javascript'];

    const documentText = document.getText();
    const isEnableAutoFixActionTypes = /^\/\/\s*enableAutoFixActionTypes/.test(documentText);
    if (languageIds.indexOf(document.languageId) > -1 && isEnableAutoFixActionTypes && e.reason === TextDocumentSaveReason.Manual) {
        doFixAllProblems(undefined, e);
    }
}


function doFixAllProblems(editor?: vscode.TextEditor, e?: TextDocumentWillSaveEvent) {
    const document = editor ? editor.document : (e ? e.document : null);
    if (!document) {
        return;
    }
    const lineCount = document.lineCount;
    const regClsStart = /class\s+\w+\s*{/;
    const regClsEnd = /^}$/;
    const reg = /\s*\/\/\s*(\w+)\s*->\s*(.*)/;
    const reg1 = /\s*\/\/\s*(\w+)\s*=\s*(.*)/;
    const generats: Array<string> = [];
    let lineNumber: number,
        line: TextLine,
        clsStartLine = 0,
        clsEndLine = 0;

    for (lineNumber = 0; lineNumber < lineCount; lineNumber++) {
        line = document.lineAt(lineNumber);
        if (regClsStart.test(line.text)) {
            clsStartLine = lineNumber;
            break;
        }
    }

    for (lineNumber = lineCount - 1; lineNumber >= 0; lineNumber--) {
        line = document.lineAt(lineNumber);
        if (regClsEnd.test(line.text)) {
            clsEndLine = lineNumber;
            break;
        }
    }

    for (lineNumber = 0; lineNumber < lineCount; lineNumber++) {
        line = document.lineAt(lineNumber);
        const match = line.text.match(reg);
        if (match) {
            const name = match[1];
            const comment = match[2] || '---';

            generats.push([
                `\n    /**\n     * ${comment}-开始\n     */\n    static readonly ${name.toLocaleUpperCase()}_REQUEST = "${name.toLocaleLowerCase() + '_request'}"`,
                `\n    /**\n     * ${comment}-成功\n     */\n    static readonly ${name.toLocaleUpperCase()}_SUCCESS = "${name.toLocaleLowerCase() + '_success'}"`,
                `\n    /**\n     * ${comment}-失败\n     */\n    static readonly ${name.toLocaleUpperCase()}_FAILURE = "${name.toLocaleLowerCase() + '_failure'}"\n`,
            ].join(''));
        }

        const match1 = line.text.match(reg1);
        if (match1) {
            const name = match1[1];
            const comment = match1[2] || '---';

            generats.push([
                `\n    /**\n     * ${comment}\n     */\n    static readonly ${name.toLocaleUpperCase()} = "${name.toLocaleLowerCase()}"\n`,
            ].join(''));
        }
    }

    if (editor) {
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(new Range(new Position(clsStartLine + 1, 0), new Position(clsEndLine, 0)), generats.join('\n    // ------------------------------------------------------------------------------------\n'));
            window.showInformationMessage("auto fix action types success");
        });
    }

    if (e) {
        const replaceEdit = TextEdit.replace(new Range(new Position(clsStartLine + 1, 0), new Position(clsEndLine, 0)), generats.join('\n    // ------------------------------------------------------------------------------------\n'));
        e.waitUntil(Promise.resolve([replaceEdit]));
        window.showInformationMessage("auto fix action types success");
    }
}
