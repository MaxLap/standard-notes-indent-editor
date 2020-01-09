### Standard Notes Indent Editor

This is a text editor for the encrypted note taking web app https://standardnotes.org/.

Its goal is to be a plain text editor, with just a little bit of formatting added to make it nicer to use.

Compared to a basic text editor:

* Pressing tab indents the line (or selected lines) with 2 spaces
* The new line from pressing Enter copies the indentation of the previous line
* Lines without text are half the size of a normal line (So you can add smaller spacing)
* Lines can wrap
* When lines wrap, they will show at the same indentation as the first line
* Stars (*), dashes (-), greater than (>) and plus (+) that are before text are considered part of indentation. 
  This means: lines wrap until after them and pressing Enter copies the *->+.
* Lines that wrap are paragraph which have a smaller maximum width. This only has an impact desktop, as mobile's max length is already small enough.


### Basic of how to dev:

Clone the repo.

To run the server to try out the editor:

    python3 -m http.server 8080

From the StandardNotes, import the extension if you didn't already. It has to be from the app because otherwise, it's a http call within a https one which is refused.

    http://localhost:8080/ext.json

To update dist/ files which are sent as editor, run:

    grunt

To refresh your editor with the modified version, the way that always work is to open the Chrome console, then right-click the refresh icon and do a "Empty cash and hard reload".

