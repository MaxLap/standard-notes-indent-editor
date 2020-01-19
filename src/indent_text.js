(function(CodeMirror) {
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
        leadingSpaceContent: null,
        sawTextBeforeOnLine: false,
        inCodeBlock: false,
        codeBlockLeadingSpaceWidth: null,
        codeBlockHasReadText: false,
        headerLevel: 0,
      };
    },
    token: function(stream, state) {
      if (state.inCodeBlock) {
        return tokenInCodeBlock(stream, state);
      }

      if (stream.sol()) {
        state.sawTextBeforeOnLine = false;
        state.headerLevel = 0;
        var leadingSpace = matchIntoLeadingSpace(stream, state, /^[-*+>\s]+/);
        if (leadingSpace) {
          if (stream.eol() && /^\s*$/.test(leadingSpace)) {
            return "leadingspace line-blank-line";
          } else {
            state.prevTokenOfLineWasLeadingSpace = true;
            return "leadingspace";
          }
        }
      }

      var classesAnyToken = '';

      if (state.headerLevel > 0) {
        classesAnyToken += ' header-' + state.headerLevel;
      }

      if (state.foundBacktick) {
        state.foundBacktick = false;
        if (stream.match(/^```\s*$/, true)) {
          state.inCodeBlock = true;
          state.codeBlockHasReadText = false;
          state.codeBlockLeadingSpaceWidth = state.leadingSpaceContent.length;
          if (state.sawTextBeforeOnLine) {
            return 'comment' + classesAnyToken;
          } else {
            return 'comment line-comment-block-line' + classesAnyToken;
          }
        }
        if (stream.match(/^`[^`]+`/, true)) {
          return 'comment' + classesAnyToken;
        } else {
          stream.eat('`');
          return classesAnyToken;
        }
      }


      if (!state.sawTextBeforeOnLine) {
        var signs = matchRegexToString(stream, /#+/, true);
        if (signs) {
          // We got the start of a header!
          state.headerLevel = signs.length;
          if (state.headerLevel < 1) {
            state.headerLevel = 1;
          } else if (state.headerLevel > 4) {
            state.headerLevel = 4;
          }
          return 'formatting-header-' + state.headerLevel;
        }
      }

      if (stream.match(/^[^`]+/, true)) {
        state.sawTextBeforeOnLine = true;
      }

      if (!stream.eol()) {
        // If we didn't reach the end, it's because we met a backtick!
        state.foundBacktick = true;
      }

      return classesAnyToken;
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
})(CodeMirror);
