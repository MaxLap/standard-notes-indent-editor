/**
 * This file handles the Standard Notes related stuff and config stuff:
 * * loading up the editor
 * * saving the node
 * * changing and saving settings
 */
document.addEventListener("DOMContentLoaded", function(event) {

  var componentManager;
  var workingNote;
  var lastValue, lastUUID;
  var editor, indent_editor;
  var ignoreTextChange = false;
  var initialLoad = true;
  var clientData = {monospace: 'default'}

  function loadComponentManager() {
    var permissions = [{name: "stream-context-item"}];
    componentManager = new ComponentManager(permissions, function(){
      // on ready
      var platform = componentManager.platform;
      if (platform) {
        document.body.classList.add(platform);
      }
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
      if(clientData) {
        indent_editor.setAllowLongerLinesNoRefresh(finalOptionAllowLongerLines());
        indent_editor.setColorHeaders(finalOptionColorHeaders());
        indent_editor.setMonospaceNoRefresh(finalOptionMonospace());
      }

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


  function loadEditor() {
    indent_editor = new IndentEditor(document.getElementById("code"), finalOptions());
    editor = indent_editor.editor;
    window.editor = editor;

    editor.on("change", function(){
      if(ignoreTextChange) {return;}
      save();
    });
  }

  function finalOptions() {
    return {
      allow_longer_lines: finalOptionAllowLongerLines(),
      color_headers: finalOptionColorHeaders(),
      monospace: finalOptionMonospace(),
    }
  }

  function finalOptionAllowLongerLines() {
    return finalOption('allow_longer_lines', ['yes', 'no'])
  }

  function finalOptionColorHeaders() {
    return finalOption('color_headers', ['yes', 'no'])
  }

  function finalOptionMonospace() {
    return finalOption('monospace', ['no', 'yes'])
  }

  // the first valid_values is used as default value
  function finalOption(option_name, valid_values) {
    var value = clientData[option_name];
    if (!valid_values.includes(value)) {
      value = chosenDefault(option_name, valid_values);
    }
    return yesNoToBool(value)
  }


  function chosenDefault(option_name, valid_values) {
    if (componentManager && componentManager.componentData) {
      var value = componentManager.componentDataValueForKey(option_name + "_default");
      if (valid_values.includes(value)) {
        return value;
      } else {
        return valid_values[0];
      }
    } else {
      return valid_values[0];
    }
  }

  function yesNoToBool(value) {
    if (value == 'yes') {
      return true;
    } else if (value == 'no') {
      return false;
    } else {
      throw 'Expected yes or no';
    }
  }

  window.displayConfigPanel = function() {
    if (componentManager && componentManager.componentData && componentManager.componentDataValueForKey("monospace_default") == 'yes') {
      document.querySelectorAll('[name="monospace_default"][value="yes"]')[0].checked = true;
    } else {
      // default is no
      document.querySelectorAll('[name="monospace_default"][value="no"]')[0].checked = true;
    }

    if (clientData.monospace == 'yes') {
      document.querySelectorAll('[name="monospace"][value="yes"]')[0].checked = true;
    } else if (clientData.monospace == 'no') {
      document.querySelectorAll('[name="monospace"][value="no"]')[0].checked = true;
    } else {
      document.querySelectorAll('[name="monospace"][value="default"]')[0].checked = true;
    }

    if (componentManager && componentManager.componentData && componentManager.componentDataValueForKey("allow_longer_lines_default") == 'no') {
      document.querySelectorAll('[name="allow_longer_lines_default"][value="no"]')[0].checked = true;
    } else {
      // default is yes
      document.querySelectorAll('[name="allow_longer_lines_default"][value="yes"]')[0].checked = true;
    }

    if (clientData.allow_longer_lines == 'yes') {
      document.querySelectorAll('[name="allow_longer_lines"][value="yes"]')[0].checked = true;
    } else if (clientData.allow_longer_lines == 'no') {
      document.querySelectorAll('[name="allow_longer_lines"][value="no"]')[0].checked = true;
    } else {
      document.querySelectorAll('[name="allow_longer_lines"][value="default"]')[0].checked = true;
    }
    
    if (componentManager && componentManager.componentData && componentManager.componentDataValueForKey("color_headers_default") == 'no') {
      document.querySelectorAll('[name="color_headers_default"][value="no"]')[0].checked = true;
    } else {
      // default is yes
      document.querySelectorAll('[name="color_headers_default"][value="yes"]')[0].checked = true;
    }

    if (clientData.color_headers == 'yes') {
      document.querySelectorAll('[name="color_headers"][value="yes"]')[0].checked = true;
    } else if (clientData.color_headers == 'no') {
      document.querySelectorAll('[name="color_headers"][value="no"]')[0].checked = true;
    } else {
      document.querySelectorAll('[name="color_headers"][value="default"]')[0].checked = true;
    }
    
    document.getElementById('config-panel').style.display = 'block';
    editor.getWrapperElement().style.display = 'none';
    document.getElementById('config-panel-toggle').style.display = 'none';
  }

  window.hideConfigPanel = function() {
    document.getElementById('config-panel').style.display = 'none';
    editor.getWrapperElement().style.display = 'block';
    document.getElementById('config-panel-toggle').style.display = 'inline';
  }

  window.changeAllowLongerLinesConfig = function(new_value) {
    if (clientData) {
      clientData.allow_longer_lines = new_value;
    }
    indent_editor.setAllowLongerLines(finalOptionAllowLongerLines());
    save();
  }

  window.changeColorHeadersConfig = function(new_value) {
    if (clientData) {
      clientData.color_headers = new_value;
    }
    indent_editor.setColorHeaders(finalOptionColorHeaders());
    save();
  }

  window.changeMonospaceConfig = function(new_value) {
    if (clientData) {
      clientData.monospace = new_value;
    }
    indent_editor.setMonospace(finalOptionMonospace());
    save();
  }

  window.changeAllowLongerLinesDefaultConfig = function(new_value) {
    if (componentManager) {
      componentManager.setComponentDataValueForKey("allow_longer_lines_default", new_value);
    }
    indent_editor.setAllowLongerLines(finalOptionAllowLongerLines());
  }

  window.changeColorHeadersDefaultConfig = function(new_value) {
    if (componentManager) {
      componentManager.setComponentDataValueForKey("color_headers_default", new_value);
    }
    indent_editor.setColorHeaders(finalOptionColorHeaders());
  }

  window.changeMonospaceDefaultConfig = function(new_value) {
    if (componentManager) {
      componentManager.setComponentDataValueForKey("monospace_default", new_value);
    }
    indent_editor.setMonospace(finalOptionMonospace());
  }

  loadEditor();
  loadComponentManager();
});
