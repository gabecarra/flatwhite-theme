'use strict';

const vscode = require('vscode');
const { COLORS } = require('./src/colors');
const { applyDecorations } = require('./src/decorator');

let decorationTypes;
let updateTimer;

function activate(context) {
    decorationTypes = {
        purple: vscode.window.createTextEditorDecorationType({ backgroundColor: COLORS.purple, borderRadius: '2px' }),
        green:  vscode.window.createTextEditorDecorationType({ backgroundColor: COLORS.green,  borderRadius: '2px' }),
        teal:   vscode.window.createTextEditorDecorationType({ backgroundColor: COLORS.teal,   borderRadius: '2px' }),
        blue:   vscode.window.createTextEditorDecorationType({ backgroundColor: COLORS.blue,   borderRadius: '2px' }),
        orange: vscode.window.createTextEditorDecorationType({ backgroundColor: COLORS.orange, borderRadius: '2px' }),
    };

    for (const dt of Object.values(decorationTypes)) {
        context.subscriptions.push(dt);
    }

    const schedule = (editor) => {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => applyDecorations(editor, decorationTypes), 120);
    };

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => { if (editor) schedule(editor); },
        null, context.subscriptions,
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) schedule(editor);
        },
        null, context.subscriptions,
    );

    vscode.workspace.onDidChangeConfiguration(
        (event) => {
            if (event.affectsConfiguration('workbench.colorTheme')) {
                const editor = vscode.window.activeTextEditor;
                if (editor) applyDecorations(editor, decorationTypes);
            }
        },
        null, context.subscriptions,
    );

    if (vscode.window.activeTextEditor) {
        applyDecorations(vscode.window.activeTextEditor, decorationTypes);
    }
}

function deactivate() {}

module.exports = { activate, deactivate };
