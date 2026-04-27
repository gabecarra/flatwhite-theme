"use strict";

const { scanLineComment, scanDoubleQuoted } = require("../scanner");

const keywords = new Set([
  "AddHandler", "AddressOf", "Alias", "And", "AndAlso", "As", "Boolean",
  "ByRef", "Byte", "ByVal", "Call", "Case", "Catch", "CBool", "CByte",
  "CChar", "CDate", "CDbl", "CDec", "Char", "CInt", "Class", "CLng",
  "CObj", "Const", "Continue", "CSByte", "CShort", "CSng", "CStr",
  "CType", "CUInt", "CULng", "CUShort", "Date", "Decimal", "Declare",
  "Default", "Delegate", "Dim", "DirectCast", "Do", "Double", "Each",
  "Else", "ElseIf", "End", "Enum", "Erase", "Error", "Event", "Exit",
  "False", "Finally", "For", "Friend", "Function", "Get", "GetType",
  "Global", "GoTo", "Handles", "If", "Implements", "Imports", "In",
  "Inherits", "Integer", "Interface", "Is", "IsNot", "Let", "Lib",
  "Like", "Long", "Loop", "Me", "Mod", "Module", "MustInherit",
  "MustOverride", "MyBase", "MyClass", "Namespace", "Narrowing", "New",
  "Next", "Not", "Nothing", "NotInheritable", "NotOverridable", "Object",
  "Of", "On", "Operator", "Option", "Optional", "Or", "OrElse", "Out",
  "Overloads", "Overridable", "Overrides", "ParamArray", "Partial",
  "Private", "Property", "Protected", "Public", "RaiseEvent", "ReadOnly",
  "ReDim", "RemoveHandler", "Resume", "Return", "SByte", "Select", "Set",
  "Shadows", "Shared", "Short", "Single", "Static", "Step", "Stop",
  "String", "Structure", "Sub", "SyncLock", "Then", "Throw", "To",
  "True", "Try", "TryCast", "TypeOf", "UInteger", "ULong", "UShort",
  "Using", "When", "While", "Widening", "With", "WithEvents",
  "WriteOnly", "Xor",
]);

const langVars = /\b(Me|MyBase|MyClass)\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i];
    // VB strings use only double-quotes; single-quote always starts a line comment
    if (ch === "'") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["vb"],
  keywords,
  langVars,
  scan,
};
