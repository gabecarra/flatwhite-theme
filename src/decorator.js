"use strict";

const vscode = require("vscode");
const { CONSTANTS, NUMBERS } = require("./colors");
const { span, buildExclusionChecker, defaultScan } = require("./scanner");
const { KEYWORDS, KEYWORD_FLAGS, LANG_VARS, KEY_HANDLERS, SCANNERS } = require("./languages");

const VARIANT_BY_THEME = { "Flatwhite": "light", "Flatwhite Dark": "dark" };

function applyDecorations(editor, decorationTypes) {
  const theme = vscode.workspace
    .getConfiguration("workbench")
    .get("colorTheme");

  const variant = VARIANT_BY_THEME[theme];

  if (!variant) {
    for (const dt of Object.values(decorationTypes.light))
      editor.setDecorations(dt, []);
    for (const dt of Object.values(decorationTypes.dark))
      editor.setDecorations(dt, []);
    return;
  }

  for (const dt of Object.values(decorationTypes[variant === "light" ? "dark" : "light"]))
    editor.setDecorations(dt, []);

  const doc = editor.document;
  const text = doc.getText();
  const lang = doc.languageId;

  if (text.length > 400_000) return;

  const result = computeRanges(text, lang, doc);
  for (const [key, ranges] of Object.entries(result)) {
    editor.setDecorations(decorationTypes[variant][key], ranges);
  }
}

function computeRanges(text, lang, doc) {
  const ranges = { purple: [], green: [], teal: [], blue: [], orange: [] };

  const scan = SCANNERS[lang] ?? defaultScan;
  const excluded = scan(text);

  for (const seg of excluded) {
    if (seg.type === "string") ranges.green.push(span(doc, seg.start, seg.end));
  }

  const isExcluded = buildExclusionChecker(excluded);

  const kwSet = KEYWORDS[lang];
  if (kwSet) {
    const pattern = new RegExp(`\\b(${[...kwSet].join("|")})\\b`, KEYWORD_FLAGS[lang] ?? "g");
    for (const m of text.matchAll(pattern)) {
      if (!isExcluded(m.index))
        ranges.purple.push(span(doc, m.index, m.index + m[0].length));
    }
  }

  const langVarPat = LANG_VARS[lang];
  if (langVarPat) {
    langVarPat.lastIndex = 0;
    for (const m of text.matchAll(langVarPat)) {
      if (!isExcluded(m.index))
        ranges.orange.push(span(doc, m.index, m.index + m[0].length));
    }
  }

  CONSTANTS.lastIndex = 0;
  for (const m of text.matchAll(CONSTANTS)) {
    if (!isExcluded(m.index))
      ranges.teal.push(span(doc, m.index, m.index + m[0].length));
  }

  NUMBERS.lastIndex = 0;
  for (const m of text.matchAll(NUMBERS)) {
    if (!isExcluded(m.index))
      ranges.teal.push(span(doc, m.index, m.index + m[0].length));
  }

  const keyHandler = KEY_HANDLERS[lang];
  if (keyHandler) keyHandler(text, doc, excluded, ranges, span);

  return ranges;
}

module.exports = { applyDecorations, computeRanges };
