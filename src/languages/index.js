"use strict";

const defs = [
  require("./javascript"),
  require("./typescript"),
  require("./python"),
  require("./java"),
  require("./json"),
  require("./yaml"),
  require("./rust"),
  require("./go"),
  require("./c"),
  require("./csharp"),
  require("./cpp"),
  require("./vb"),
  require("./sql"),
  require("./php"),
  require("./r"),
  require("./markdown"),
];

const KEYWORDS      = {};
const KEYWORD_FLAGS = {};
const LANG_VARS     = {};
const KEY_HANDLERS  = {};
const SCANNERS      = {};

for (const lang of defs) {
  for (const id of lang.ids) {
    if (lang.keywords)              KEYWORDS[id]      = lang.keywords;
    if (lang.keywordCaseInsensitive) KEYWORD_FLAGS[id] = "gi";
    if (lang.langVars)              LANG_VARS[id]     = lang.langVars;
    if (lang.applyKeys)             KEY_HANDLERS[id]  = lang.applyKeys;
    if (lang.scan)                  SCANNERS[id]      = lang.scan;
  }
}

module.exports = { KEYWORDS, KEYWORD_FLAGS, LANG_VARS, KEY_HANDLERS, SCANNERS };
