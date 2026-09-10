"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
} = require("../scanner");

const keywords = new Set([
  "alignas", "alignof", "and", "and_eq", "asm", "auto", "bitand",
  "bitor", "bool", "break", "case", "catch", "char", "char8_t",
  "char16_t", "char32_t", "class", "compl", "concept", "const",
  "consteval", "constexpr", "constinit", "const_cast", "continue",
  "co_await", "co_return", "co_yield", "decltype", "default", "delete",
  "do", "double", "dynamic_cast", "else", "enum", "explicit", "export",
  "extern", "false", "float", "for", "friend", "goto", "if", "inline",
  "int", "long", "mutable", "namespace", "new", "noexcept", "not",
  "not_eq", "nullptr", "operator", "or", "or_eq", "private", "protected",
  "public", "register", "reinterpret_cast", "requires", "return", "short",
  "signed", "sizeof", "static", "static_assert", "static_cast", "struct",
  "switch", "template", "this", "thread_local", "throw", "true", "try",
  "typedef", "typeid", "typename", "union", "unsigned", "using",
  "virtual", "void", "volatile", "wchar_t", "while", "xor", "xor_eq",
]);

const langVars = /\b(this)\b/g;

// Raw string literals: R"delim(...)delim" — delim is 0-16 chars, no parens/whitespace/backslash
function tryScanRawString(text, i, len) {
  const prev = text[i - 1];
  if (prev && /\w/.test(prev)) return null;
  if (text[i] !== "R" || text[i + 1] !== '"') return null;
  let j = i + 2;
  const delimStart = j;
  while (j < len && text[j] !== "(" && j - delimStart <= 16) j++;
  if (text[j] !== "(") return null;
  const delim = text.slice(delimStart, j);
  const start = i;
  const closer = ")" + delim + '"';
  const idx = text.indexOf(closer, j + 1);
  const end = idx === -1 ? len : idx + closer.length;
  return [{ start, end, type: "string" }, end];
}

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "R" && ch1 === '"') {
      const raw = tryScanRawString(text, i, len);
      if (raw) { segs.push(raw[0]); i = raw[1]; continue; }
    }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'")                { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["cpp"],
  keywords,
  langVars,
  scan,
};
