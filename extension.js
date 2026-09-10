'use strict';

const vscode = require('vscode');
const { COLORS, COLORS_DARK } = require('./src/colors');
const { applyDecorations } = require('./src/decorator');

let decorationTypes;
let updateTimer;

function makeDecorationTypes(colors) {
    return {
        purple: vscode.window.createTextEditorDecorationType({ backgroundColor: colors.purple, borderRadius: '2px' }),
        green:  vscode.window.createTextEditorDecorationType({ backgroundColor: colors.green,  borderRadius: '2px' }),
        teal:   vscode.window.createTextEditorDecorationType({ backgroundColor: colors.teal,   borderRadius: '2px' }),
        blue:   vscode.window.createTextEditorDecorationType({ backgroundColor: colors.blue,   borderRadius: '2px' }),
        orange: vscode.window.createTextEditorDecorationType({ backgroundColor: colors.orange, borderRadius: '2px' }),
    };
}

function activate(context) {
    decorationTypes = {
        light: makeDecorationTypes(COLORS),
        dark:  makeDecorationTypes(COLORS_DARK),
    };

    for (const dt of Object.values(decorationTypes.light)) {
        context.subscriptions.push(dt);
    }
    for (const dt of Object.values(decorationTypes.dark)) {
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
