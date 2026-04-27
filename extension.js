'use strict';

const vscode = require('vscode');

// Original flatwhite-syntax HSLA background values, converted to rgba()
const COLORS = {
    purple: 'rgba(206,  92, 255, 0.15)',
    green:  'rgba(132, 189,   0, 0.19)',
    teal:   'rgba(  0, 189, 163, 0.15)',
    blue:   'rgba(117, 163, 255, 0.20)',
    orange: 'rgba(240, 140,   0, 0.18)',
};

let decorationTypes;
let updateTimer;

// ---------------------------------------------------------------------------
// Keyword sets per language
// ---------------------------------------------------------------------------

const KEYWORDS = {
    javascript: new Set([
        'async','await','break','case','catch','class','const','continue',
        'debugger','default','delete','do','else','export','extends',
        'finally','for','from','function','get','if','import','in',
        'instanceof','let','new','of','return','set','static','switch',
        'throw','try','typeof','var','void','while','with','yield',
    ]),
    typescript: new Set([
        'async','await','abstract','as','break','case','catch','class',
        'const','continue','debugger','declare','default','delete','do',
        'else','enum','export','extends','finally','for','from','function',
        'get','if','implements','import','in','infer','instanceof',
        'interface','is','keyof','let','module','namespace','never',
        'new','of','override','package','private','protected','public',
        'readonly','return','set','static','switch','throw','try','type',
        'typeof','unique','var','void','while','with','yield',
    ]),
    python: new Set([
        'and','as','assert','async','await','break','class','continue',
        'def','del','elif','else','except','finally','for','from',
        'global','if','import','in','is','lambda','nonlocal','not',
        'or','pass','raise','return','try','while','with','yield',
    ]),
    java: new Set([
        'abstract','assert','break','case','catch','class','const',
        'continue','default','do','else','enum','extends','final',
        'finally','for','goto','if','implements','import','instanceof',
        'interface','native','new','package','permits','private',
        'protected','public','record','return','sealed','static',
        'strictfp','switch','synchronized','throw','throws','transient',
        'try','var','void','volatile','while',
    ]),
};
KEYWORDS.javascriptreact = KEYWORDS.javascript;
KEYWORDS.typescriptreact = KEYWORDS.typescript;

// language variables (this/self/super) → orange marker
const LANG_VARS = {
    javascript: /\b(this|super)\b/g,
    typescript: /\b(this|super)\b/g,
    javascriptreact: /\b(this|super)\b/g,
    typescriptreact: /\b(this|super)\b/g,
    python: /\b(self|cls)\b/g,
    java: /\b(this|super)\b/g,
};

// language constants (true/false/null/…) → teal marker
const CONSTANTS = /\b(true|false|null|undefined|None|True|False|nil|NULL|NaN|Infinity)\b/g;

// numbers → teal marker
const NUMBERS = /\b(0[xX][0-9a-fA-F]+[lLuU]?|0[bB][01]+[lLuU]?|0[oO][0-7]+[lLuU]?|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?[\d_]+)?[fFdDlLuU]?)\b/g;

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

function activate(context) {
    console.log('[flatwhite] extension activated');

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
        updateTimer = setTimeout(() => applyDecorations(editor), 120);
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
                if (editor) applyDecorations(editor);
            }
        },
        null, context.subscriptions,
    );

    if (vscode.window.activeTextEditor) {
        applyDecorations(vscode.window.activeTextEditor);
    }
}

function deactivate() {}

// ---------------------------------------------------------------------------
// Main decoration pass
// ---------------------------------------------------------------------------

function applyDecorations(editor) {
    const theme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    console.log(`[flatwhite] applyDecorations — theme="${theme}" file="${editor.document.fileName}"`);
    if (theme !== 'Flatwhite') {
        console.log('[flatwhite] theme is not Flatwhite, skipping');
        for (const dt of Object.values(decorationTypes)) {
            editor.setDecorations(dt, []);
        }
        return;
    }

    const doc   = editor.document;
    const text  = doc.getText();
    const lang  = doc.languageId;

    // Skip very large files
    if (text.length > 400_000) return;

    const result = computeRanges(text, lang, doc);
    const counts = Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length]));
    console.log('[flatwhite] decoration counts:', counts);

    for (const [key, ranges] of Object.entries(result)) {
        editor.setDecorations(decorationTypes[key], ranges);
    }
}

// ---------------------------------------------------------------------------
// Range computation
// ---------------------------------------------------------------------------

function computeRanges(text, lang, doc) {
    const ranges = { purple: [], green: [], teal: [], blue: [], orange: [] };

    // Phase 1: scan the raw text to find strings and comments.
    // Returns an array of { start, end, type } where type is 'string'|'comment'.
    const excluded = scanExcluded(text, lang);

    // All string spans → green
    for (const seg of excluded) {
        if (seg.type === 'string') {
            ranges.green.push(span(doc, seg.start, seg.end));
        }
    }

    // Build a fast exclusion checker using sorted intervals
    const isExcluded = buildExclusionChecker(excluded);

    // Phase 2: keywords → purple
    const kwSet = KEYWORDS[lang];
    if (kwSet) {
        // Build a single alternation regex for the known keywords
        const pattern = new RegExp(
            `\\b(${[...kwSet].join('|')})\\b`,
            'g',
        );
        for (const m of text.matchAll(pattern)) {
            if (!isExcluded(m.index)) {
                ranges.purple.push(span(doc, m.index, m.index + m[0].length));
            }
        }
    }

    // Phase 3: language variables (this/self/super) → orange
    const langVarPat = LANG_VARS[lang];
    if (langVarPat) {
        langVarPat.lastIndex = 0;
        for (const m of text.matchAll(langVarPat)) {
            if (!isExcluded(m.index)) {
                ranges.orange.push(span(doc, m.index, m.index + m[0].length));
            }
        }
    }

    // Phase 4: language constants → teal
    CONSTANTS.lastIndex = 0;
    for (const m of text.matchAll(CONSTANTS)) {
        if (!isExcluded(m.index)) {
            ranges.teal.push(span(doc, m.index, m.index + m[0].length));
        }
    }

    // Phase 5: numbers → teal
    NUMBERS.lastIndex = 0;
    for (const m of text.matchAll(NUMBERS)) {
        if (!isExcluded(m.index)) {
            ranges.teal.push(span(doc, m.index, m.index + m[0].length));
        }
    }

    // Phase 6: JSON / YAML keys → blue
    if (lang === 'json' || lang === 'jsonc') {
        applyJsonKeys(text, doc, excluded, ranges);
    } else if (lang === 'yaml') {
        applyYamlKeys(text, doc, ranges);
    }

    return ranges;
}

// ---------------------------------------------------------------------------
// String / comment scanner (language-aware)
// ---------------------------------------------------------------------------

function scanExcluded(text, lang) {
    const segs = [];
    const len  = text.length;
    let i = 0;

    const isJS = lang === 'javascript' || lang === 'typescript'
              || lang === 'javascriptreact' || lang === 'typescriptreact';

    while (i < len) {
        const ch  = text[i];
        const ch1 = text[i + 1];

        // ── Block comment /* … */
        if (ch === '/' && ch1 === '*' && lang !== 'python') {
            const start = i; i += 2;
            while (i < len - 1 && !(text[i] === '*' && text[i + 1] === '/')) i++;
            i += 2;
            segs.push({ start, end: i, type: 'comment' });
            continue;
        }

        // ── Line comment //
        if (ch === '/' && ch1 === '/' && (isJS || lang === 'java')) {
            const start = i;
            while (i < len && text[i] !== '\n') i++;
            segs.push({ start, end: i, type: 'comment' });
            continue;
        }

        // ── Line comment #  (Python, YAML, shell…)
        if (ch === '#' && (lang === 'python' || lang === 'yaml' || lang === 'shellscript')) {
            const start = i;
            while (i < len && text[i] !== '\n') i++;
            segs.push({ start, end: i, type: 'comment' });
            continue;
        }

        // ── Python triple-quoted strings  """…"""  '''…'''
        if (lang === 'python') {
            if (ch === '"' && ch1 === '"' && text[i + 2] === '"') {
                const start = i; i += 3;
                while (i < len - 2) {
                    if (text[i] === '\\') { i += 2; continue; }
                    if (text[i] === '"' && text[i+1] === '"' && text[i+2] === '"') { i += 3; break; }
                    i++;
                }
                segs.push({ start, end: i, type: 'string' });
                continue;
            }
            if (ch === "'" && ch1 === "'" && text[i + 2] === "'") {
                const start = i; i += 3;
                while (i < len - 2) {
                    if (text[i] === '\\') { i += 2; continue; }
                    if (text[i] === "'" && text[i+1] === "'" && text[i+2] === "'") { i += 3; break; }
                    i++;
                }
                segs.push({ start, end: i, type: 'string' });
                continue;
            }
        }

        // ── Java text blocks  """…"""
        if (lang === 'java' && ch === '"' && ch1 === '"' && text[i + 2] === '"') {
            const start = i; i += 3;
            while (i < len - 2) {
                if (text[i] === '\\') { i += 2; continue; }
                if (text[i] === '"' && text[i+1] === '"' && text[i+2] === '"') { i += 3; break; }
                i++;
            }
            segs.push({ start, end: i, type: 'string' });
            continue;
        }

        // ── Template literals  `…`  (JS/TS — include ${…} contents as part of the span)
        if (isJS && ch === '`') {
            const start = i; i++;
            let depth = 0;
            while (i < len) {
                const c = text[i];
                if (c === '\\') { i += 2; continue; }
                if (c === '$' && text[i + 1] === '{') { depth++; i += 2; continue; }
                if (c === '}' && depth > 0) { depth--; i++; continue; }
                if (c === '`' && depth === 0) { i++; break; }
                i++;
            }
            segs.push({ start, end: i, type: 'string' });
            continue;
        }

        // ── Double-quoted string
        if (ch === '"') {
            const start = i; i++;
            while (i < len && text[i] !== '"' && text[i] !== '\n') {
                if (text[i] === '\\') i++;
                i++;
            }
            if (i < len && text[i] === '"') i++;
            segs.push({ start, end: i, type: 'string' });
            continue;
        }

        // ── Single-quoted string / char literal
        if (ch === "'") {
            const start = i; i++;
            while (i < len && text[i] !== "'" && text[i] !== '\n') {
                if (text[i] === '\\') i++;
                i++;
            }
            if (i < len && text[i] === "'") i++;
            segs.push({ start, end: i, type: 'string' });
            continue;
        }

        i++;
    }

    return segs;
}

// ---------------------------------------------------------------------------
// JSON / YAML key handling
// ---------------------------------------------------------------------------

function applyJsonKeys(text, doc, excluded, ranges) {
    // A JSON key is a double-quoted string immediately followed (ignoring whitespace) by ':'
    // We already have the string spans in `excluded`; re-check which ones are keys.
    const stringSegs = excluded.filter(s => s.type === 'string');

    for (const seg of stringSegs) {
        // Only double-quoted strings in JSON
        if (text[seg.start] !== '"') continue;

        // Look past the closing quote for ':'
        let j = seg.end;
        while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;

        if (text[j] === ':') {
            // Re-classify this string as a blue key (remove from green, add to blue)
            const r = span(doc, seg.start, seg.end);
            // Remove from green (find by same position)
            const idx = ranges.green.findIndex(
                g => g.start.isEqual(r.start) && g.end.isEqual(r.end)
            );
            if (idx !== -1) ranges.green.splice(idx, 1);
            ranges.blue.push(r);
        }
    }
}

function applyYamlKeys(text, doc, ranges) {
    // YAML keys: word at the start of a line (possibly indented) followed by ':'
    const keyPat = /^[ \t]*([a-zA-Z_$][\w$-]*)[ \t]*:/mg;
    for (const m of text.matchAll(keyPat)) {
        const keyStart = m.index + m[0].indexOf(m[1]);
        ranges.blue.push(span(doc, keyStart, keyStart + m[1].length));
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function span(doc, start, end) {
    return new vscode.Range(doc.positionAt(start), doc.positionAt(end));
}

/**
 * Returns a function that tells whether a given offset falls inside any
 * excluded segment. Uses a linear scan (fast enough for typical files).
 */
function buildExclusionChecker(segs) {
    if (segs.length === 0) return () => false;
    return (offset) => {
        for (const s of segs) {
            if (offset >= s.start && offset < s.end) return true;
            if (s.start > offset) return false; // segs are in order
        }
        return false;
    };
}

module.exports = { activate, deactivate };
