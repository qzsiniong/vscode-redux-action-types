'use strict';
import { window, workspace, ExtensionContext, TextDocumentWillSaveEvent, TextEdit, TextDocumentSaveReason, Range, Position } from 'vscode';


export function activate(context: ExtensionContext) {

    const disposable = workspace.onWillSaveTextDocument(willSaveTextDocument);

    context.subscriptions.push(disposable);
}

function willSaveTextDocument(e: TextDocumentWillSaveEvent) {
    const document = e.document;
    const languageIds = ['typescript', 'javascript'];

    const documentText = document.getText();
    const isEnableAutoFixActionTypes = documentText.includes('// enableAutoFixActionTypes');

    if (languageIds.indexOf(document.languageId) > -1 && isEnableAutoFixActionTypes && e.reason === TextDocumentSaveReason.Manual) {
        doFixAllProblems(e);
    }
}

function doFixAllProblems(e: TextDocumentWillSaveEvent) {
    const document = e.document;
    const lineCount = document.lineCount;
    let text = document.getText();

    text = text.replace(/(const\s+)(\w+)(\s*=\s*")([^"]*)(")/g, (_, ...args) => {
        const arr:string[] = args.slice(0,-2);
        arr[3] = arr[1].toLowerCase();
        return arr.join('');
    });

    const replaceEdit = TextEdit.replace(new Range(new Position(0, 0), new Position(lineCount,0)), text);

    e.waitUntil(Promise.resolve([replaceEdit]));
    window.showInformationMessage("auto fix action types success");
}
