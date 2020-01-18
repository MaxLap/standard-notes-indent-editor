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

To run the server to try out the editor:

    python3 -m http.server 8080

From the StandardNotes, import the extension if you didn't already. It has to be from the app because otherwise, it's a http call within a https one which is refused.

    http://localhost:8080/local_ext.json

To update dist/ files which are sent as editor, run:

    grunt

To refresh your editor with the modified version, the way that always work is to open the Chrome console, then right-click the refresh icon and do a "Empty cash and hard reload".

