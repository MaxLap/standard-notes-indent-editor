/**
 * This file handles part of the editor which is related to parsing the text and applying markup
 */

(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("indent_text", function(cmCfg, modeCfg) {
  var linkify = require('linkify-it')({'ftp:': null, '//': null}, {fuzzyEmail: false});

  // We only care about few things in the middle of text:
  // * backticks
  // * urls
  // This stops only for things that could look like urls and backticks
  var fastReadRegex = new RegExp('.*?(?:`|https?://|\\.(?:' + linkify.re.src_tlds + ')\\b)');
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
        stackOflinksOnLine: null,
        foundLink: false,
      };
    },
    token: function(stream, state) {
      if (state.inCodeBlock) {
        return tokenInCodeBlock(stream, state);
      }

      if (stream.sol()) {
        if (!state.foundLink) {
          state.stackOflinksOnLine = null;
        }
        state.sawTextBeforeOnLine = false;
        state.headerLevel = 0;
        var leadingSpace = matchIntoLeadingSpace(stream, state, /^(\s*\d+\.\s+|[-*+>\s]+)/);
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
        if (stream.match(/^```\S*\s*$/, true)) {
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

      if (state.foundLink) {
        state.foundLink = false;
        var linkInfos = state.stackOflinksOnLine.pop();
        stream.pos = linkInfos.lastIndex;
        return 'link' + classesAnyToken;
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

      var toInvestigate = stream.match(fastReadRegex, true);
      if (toInvestigate) {
        toInvestigate = toInvestigate[0];
        state.sawTextBeforeOnLine = true;
        if (toInvestigate[toInvestigate.length - 1] == '`') {
          stream.backUp(1);
          state.foundBacktick = true;
        } else {
          if (!state.stackOflinksOnLine) {
            var fullStringFromTokenStart = stream.string.slice(stream.start);
            var foundLinks = linkify.match(fullStringFromTokenStart) || [];

            for (var i = 0; i < foundLinks.length; i++) {
              var match = foundLinks[i];
              match.index += stream.start;
              match.lastIndex += stream.start;
            }
            state.stackOflinksOnLine = foundLinks.reverse();
          }

          var stackOflinksOnLine = state.stackOflinksOnLine;
          var linkToConsider;
          while ((linkToConsider = stackOflinksOnLine[stackOflinksOnLine.length - 1])
                 && linkToConsider.index < stream.start) {
            // We are now father than that. Possibly because a link was inside backticks.
            stackOflinksOnLine.pop();
          }

          if (linkToConsider && linkToConsider.index < stream.pos) {
            stream.pos = linkToConsider.index;
            state.foundLink = true;
          }
        }
      } else {
        stream.skipToEnd();
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
