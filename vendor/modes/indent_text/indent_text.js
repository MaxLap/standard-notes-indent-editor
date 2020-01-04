(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../xml/xml"), require("../meta"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../xml/xml", "../meta"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("indent_text", function(cmCfg, modeCfg) {
  function blankLine(state) {
    return 'line-blank-line';
  }

  var mode = {
    token: function(stream, state) {
      if (stream.match(/^\s*$/, true)) {
        return blankLine(state);
      }

      stream.skipToEnd();
      return null;
    },

    blankLine: blankLine
  };
  return mode;
}, "xml");
});
