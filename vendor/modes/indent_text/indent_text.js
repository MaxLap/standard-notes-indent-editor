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
  /* Does a match(), but returns the matched string or ''. Expects a regex without groups. */
  function matchRegexToString(stream, regex, consume) {
    var match = stream.match(regex, consume);
    return match ? match[0] : '';
  }

  function matchIntoLeadingSpacesForCodeBlock(stream, state, max) {
    var regex_src;
    if (max <= 0) {
      state.leadingSpaceContent = '';
      return '';
    }
    regex_src = "^\\s{1," + state.codeBlockLeadingSpaceWidth + "}";
    return matchIntoLeadingSpace(stream, state, new RegExp(regex_src));
  }

  function matchIntoLeadingSpace(stream, state, regex) {
    var leadingSpace = matchRegexToString(stream, regex, true);
    state.leadingSpaceContent = leadingSpace;
    return leadingSpace;
  }

  function tokenInCodeBlock(stream, state) {
    if (stream.sol()) {
      var leadingSpace = matchIntoLeadingSpacesForCodeBlock(stream, state, state.codeBlockLeadingSpaceWidth);
      if (!state.codeBlockHasReadText && !stream.match(/^\s*$/, false)) {
        state.codeBlockHasReadText = true;
        state.codeBlockLeadingSpaceWidth = leadingSpace.length;
      }
      if (leadingSpace) {
        return "leadingspace line-comment-block-line";
      }
    }

    if (stream.match(/^.*```\s*$/, true)) {
      state.inCodeBlock = false;
    } else if (stream.match(/^\s+/, true)) {
      return 'comment line-comment-block-line comment-block-indentation';
    } else {
      stream.skipToEnd();
    }
    return 'comment line-comment-block-line';
  }

  var mode = {
    startState: function() {
      return {
        foundBacktick: false,
        inCodeBlock: false,
        leadingSpaceContent: null,
        codeBlockLeadingSpaceWidth: null,
        codeBlockHasReadText: false,
      };
    },
    token: function(stream, state) {
      if (state.inCodeBlock) {
        return tokenInCodeBlock(stream, state);
      }

      if (stream.sol()) {
        var leadingSpace = matchIntoLeadingSpace(stream, state, /^[-*+>\s]+/);
        if (leadingSpace) {
          if (stream.eol() && leadingSpace.match(/^\s*$/)) {
            return "leadingspace line-blank-line";
          } else {
            return "leadingspace";
          }
        }
      }

      if (state.foundBacktick) {
        state.foundBacktick = false;
        var hasTextBefore = stream.pos != state.leadingSpaceContent.length;
        if (stream.match(/^```\s*$/, true)) {
          state.inCodeBlock = true;
          state.codeBlockHasReadText = false;
          state.codeBlockLeadingSpaceWidth = state.leadingSpaceContent.length;
          if (hasTextBefore) {
            return 'comment';
          } else {
            return 'comment line-comment-block-line'
          }
        }
        if (stream.match(/^`[^`]+`/, true)) {
          return 'comment';
        } else {
          stream.eat('`');
          return null;
        }
      }

      stream.match(/^[^`]*/, true);
      if (!stream.eol()) {
        // If we didn't reach the end, it's because we met a backtick!
        state.foundBacktick = true;
      }

      return null;
    },

    blankLine: function(state) {
      if (state.inCodeBlock) {
        return 'line-comment-block-line';
      } else {
        return 'line-blank-line';
      }
    }
  };
  return mode;
}, "xml");
});
