### Standard Notes Indent Editor

This is a text editor for the encrypted note taking app https://standardnotes.org/.

A simple text editor that makes it easy to write and read nested notes.

Online demo with explanations: https://maxlap.github.io/standard-notes-indent-editor/demo.html

The [demo](https://maxlap.github.io/standard-notes-indent-editor/demo.html)shows everything nicely, but compared to a basic text editor:

* Press `Tab` to indent the line (or selected lines) with 2 spaces (even if in the middle of the line).
* Press `Shift` + `Tab` removes 2 spaces from the beginning of line (or selected lines).
* `Enter` creates a new line with the same indentation as the current line.
* Empty lines are smaller than a normal line, giving you more control over spacing.
* Lines can wrap.
* When lines wrap, they will align with the same indentation as the first line.
* Stars (*), dashes (-), greater than (>) and plus (+) are considered part of indentation. This means: 
  * Lines wrap until after those characters too.
  * Pressing `Enter` copies the *->+ along with the spaces.
  * Indentation uses a fixed-width font, so it always align nicely.
* Lines that wrap are shown as paragraph of around 50 characters wide. This keeps them from being super large and hard to read
* Lines that wrap are slightly closer together vertically.
* Lines starting with a number sign (#) are headers, shown as bold and bigger text.
* You can use backticks (\`) to put code in a line, this will look similar to Markdown, but the backticks are not hidden: `` `code` `` 
* Text between triple backticks \``` (they must be at the end of lines) is shown as a blocks of code. Again, this will look similar to Markdown, but without the box:
  ````
  ```
  function hello() {
    console.log('hello world')
  }
  ```
  ````

### How to install

In Standard Notes (either browser or desktop), click Extension, then Import Extension, paste this link: `https://listed.to/p/eUPdNELfEu`, press Enter.

You should then be able to select the Indent Editor in your list of editors.

### The goals

* A simple text editor that makes it easy to write and read nested notes.
* Be your main text & notes editor

This means:
* Grouping things help: natural indentation, lists and vertical spacing handling
* Splitting lines is troublesome: long lines wrap nicely.
* What you see come from the text: no formatting buttons or commands.
* See your text: Every character is displayed, nothing is hidden.
* Not locked in: The text will look fine in any other editor, you wouldn't lose anything.

### Basic of how to dev:

Clone the repo.

Install the dependencies:

    npm install

To run the server to try out the editor:

    python3 -m http.server 8080

To update dist/ files which are sent as editor, run:

    grunt

You can use the demo to just try out the editor:

    http://localhost:8080/demo.html

To refresh your editor with the modified version, the way that always work is to open the Chrome console, then right-click the refresh icon and do a "Empty cache and hard reload". Other ways of doing hard refreshes may work, but the cache clearing has sometimes been necessary for me.

You can also try it in StandardNotes (but it's more painful to do so):

Import the local test extension if you didn't already. Do it from the desktop app because otherwise, it's a http call within a https one which is refused by your browser. This is the link to the extension:

    http://localhost:8080/local_ext.json

Once the app is imported, you can test it from:
* the browser app: It's possible it wont work until you allow Mixed Content in the page page. Search online for how to enable it for your browser.
* the desktop app. I have no idea how often the desktop will refresh the extensions, so that may be painful except as last validation.

