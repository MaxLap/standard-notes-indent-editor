document.addEventListener("DOMContentLoaded", function(event) {

  var componentManager;
  var workingNote, clientData;
  var lastValue, lastUUID;
  var editor;
  var ignoreTextChange = false;
  var initialLoad = true;

  function loadComponentManager() {
    var permissions = [{name: "stream-context-item"}]
    componentManager = new ComponentManager(permissions, function(){
      // on ready
      var platform = componentManager.platform;
      if (platform) {
        document.body.classList.add(platform);
      }

      // only use CodeMirror selection color if we're not on mobile.
      editor.setOption("styleSelectedText", !componentManager.isMobile);
    });

    componentManager.streamContextItem((note) => {
      onReceivedNote(note);
    });
  }

  function save() {
    if(workingNote) {
      // Be sure to capture this object as a variable, as this.note may be reassigned in `streamContextItem`, so by the time
      // you modify it in the presave block, it may not be the same object anymore, so the presave values will not be applied to
      // the right object, and it will save incorrectly.
      let note = workingNote;

      componentManager.saveItemWithPresave(note, () => {
        lastValue = editor.getValue();
        note.content.text = lastValue;
        note.clientData = clientData;

        // clear previews
        note.content.preview_plain = null;
        note.content.preview_html = null;
      });
    }
  }

  function onReceivedNote(note) {
    if(note.uuid !== lastUUID) {
      // Note changed, reset last values
      lastValue = null;
      initialLoad = true;
      lastUUID = note.uuid;
    }

    workingNote = note;

    // Only update UI on non-metadata updates.
    if(note.isMetadataUpdate) {
      return;
    }

    clientData = note.clientData;

    if(editor) {
      if(note.content.text !== lastValue) {
        ignoreTextChange = true;
        editor.getDoc().setValue(workingNote.content.text);
        ignoreTextChange = false;
      }

      if(initialLoad) {
        initialLoad = false;
        editor.getDoc().clearHistory();
      }
    }
  }

  function measureText(indentation, text) {
    var pre = document.createElement('pre');
    pre.className = "CodeMirror-line-like";
    var initSpan = document.createElement('span');
    pre.appendChild(initSpan);

    var indentSpan = document.createElement('span');
    indentSpan.className = 'cm-leadingspace';
    indentSpan.appendChild(document.createTextNode(indentation));
    pre.appendChild(indentSpan);

    pre.appendChild(document.createTextNode(text));

    var finalSpan = document.createElement('span');
    pre.appendChild(finalSpan);

    var measure = editor.display.measure;
    for (let count = measure.childNodes.length; count > 0; --count)
        measure.removeChild(measure.firstChild);

    measure.appendChild(pre);

    var indentRect = indentSpan.getBoundingClientRect();
    var indentWidth = (indentRect.right - indentRect.left);

    var textMustWrap = initSpan.offsetTop < finalSpan.offsetTop;
    return {indentWidth: indentWidth, textMustWrap: textMustWrap}
  }

  function loadEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById("code"), {
      mode: "indent_text",
      lineWrapping: true,
      tabSize: 2,
      indentUnit: 2,
      extraKeys: {"Alt-F": "findPersistent",
                  Tab: 'indentMore',
                  'Shift-Tab': 'indentLess',
                  "Enter": (cm) => {
                    var sels = cm.listSelections();
                    for (var i = sels.length - 1; i >= 0; i--) {
                      cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");
                    }
                    sels = cm.listSelections();
                    for (var i$1 = 0; i$1 < sels.length; i$1++) {
                      var prev_line = cm.doc.getLine(sels[i$1].anchor.line - 1);
                      var prev_indentation = /^[-*+>\s]*/.exec(prev_line)[0];
                      cm.replaceRange(prev_indentation, sels[i$1].anchor, sels[i$1].head, "+input");
                    }
                    cm.scrollIntoView();
                  },
                  "Home": "goLineLeftSmart",
                  "End": "goLineRight"
                 }
    });
    editor.setSize("100%", "100%");

    editor.addOverlay({
      token: function(stream) {
        if (stream.sol() && stream.match(/[-*+>\s]+/, true)) {
          return "leadingspace";
        } else {
          stream.skipToEnd();
          return null;
        }
      },

      name: "leadingspace"
    });

    editor.on("change", function(){
      if(ignoreTextChange) {return;}
      save();
    });

    var basePadding = 4;
    editor.on("renderLine", function(cm, line, elt) {
      var customIndentRegex = /^[-*+>\s]*/;
      var indentationText = (customIndentRegex.exec(line.text) || [""])[0];
      var text = line.text.substring(indentationText.length);

      var measures = measureText(indentationText, text);
      var indentationWidth = measures.indentWidth;

      var scrollInfo = cm.getScrollInfo();
      var maxOff = scrollInfo.width - 150;
      if (maxOff < 30) {
        maxOff = 30;
      }

      var wrapOffset = indentationWidth;
      if (wrapOffset > maxOff) {
        wrapOffset = maxOff;
      }

      if (measures.textMustWrap) {
        elt.className += " cm-line-is-wrapped";
      }

      elt.style.textIndent = "-" + wrapOffset + "px";
      elt.style.paddingLeft = (basePadding + wrapOffset) + "px";
    });
    editor.refresh();

    // Need to do refresh on the codemirror instance when there is resizing
    // This is necessary for to fix the max wrapping width in hte edge cases that it is necessary...
    var resize_timeout_handle;
    window.addEventListener('resize', function() {
      // We don't want to refresh instantly, to avoid making things too slow. So we only do it once it has
      // been 1s without resize
      clearTimeout(resize_timeout_handle);
      resize_timeout_handle = setTimeout(function() { editor.refresh(); }, 1000)
    });

  }

  loadEditor();
  loadComponentManager();
});
