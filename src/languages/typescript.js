"use strict";

const { scan } = require("./javascript");

const keywords = new Set([
  "async", "await", "abstract", "as", "break", "case", "catch", "class",
  "const", "continue", "debugger", "declare", "default", "delete", "do",
  "else", "enum", "export", "extends", "finally", "for", "from", "function",
  "get", "if", "implements", "import", "in", "infer", "instanceof",
  "interface", "is", "keyof", "let", "module", "namespace", "never",
  "new", "of", "override", "package", "private", "protected", "public",
  "readonly", "return", "set", "static", "switch", "throw", "try", "type",
  "typeof", "unique", "var", "void", "while", "with", "yield",
]);

const langVars = /\b(this|super)\b/g;

module.exports = {
  ids: ["typescript", "typescriptreact"],
  keywords,
  langVars,
  scan, // same tokenizer rules as JS
};
