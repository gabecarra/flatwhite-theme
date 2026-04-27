"use strict";

const vscode = require("vscode");
const { CONSTANTS, NUMBERS } = require("./colors");
const { span, buildExclusionChecker, defaultScan } = require("./scanner");
const { KEYWORDS, KEYWORD_FLAGS, LANG_VARS, KEY_HANDLERS, SCANNERS } = require("./languages");

function applyDecorations(editor, decorationTypes) {
  const theme = vscode.workspace
    .getConfiguration("workbench")
    .get("colorTheme");
  if (theme !== "Flatwhite") {
    for (const dt of Object.values(decorationTypes))
      editor.setDecorations(dt, []);
    return;
  }

  const doc = editor.document;
  const text = doc.getText();
  const lang = doc.languageId;

  if (text.length > 400_000) return;

  const result = computeRanges(text, lang, doc);
  for (const [key, ranges] of Object.entries(result)) {
    editor.setDecorations(decorationTypes[key], ranges);
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
