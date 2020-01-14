### Standard Notes Indent Editor

This is a text editor for the encrypted note taking web app https://standardnotes.org/.

The goal is to be a plain text editor with just a little bit of formatting, mostly spacing, added to make it nicer to use.

Compared to a basic text editor:

* Tab indents the line (or selected lines) with 2 spaces (even if in the middle of the line)
* Shift-Tab removes 2 spaces from the beginning of line (or selected lines)
* Enter creates a new line with the same indentation as the previous line
* Empty lines and lines with spaces are smaller than a normal line, giving you more control over spacing
* Lines can wrap
* When lines wrap, they will show at the same indentation as the first line
* Stars (*), dashes (-), greater than (>) and plus (+) that are before text are considered part of indentation.
  This means: lines wrap until after them and pressing Enter copies the *->+
* Lines that wrap are paragraph which have a smaller maximum width. This avoids paragraph that are super large and hard to read
* Lines that wrap are slightly closer together (vertically)

### How to install

In Standard Notes (either browser or desktop), click Extension, then Import Extension, paste this link: `https://listed.to/p/eUPdNELfEu`, press Enter.

You should then be able to select the Indent Editor in your list of editors.

### Basic of how to dev:

Clone the repo.

To run the server to try out the editor:

    python3 -m http.server 8080

From the StandardNotes, import the extension if you didn't already. It has to be from the app because otherwise, it's a http call within a https one which is refused.

    http://localhost:8080/local_ext.json

To update dist/ files which are sent as editor, run:

    grunt

To refresh your editor with the modified version, the way that always work is to open the Chrome console, then right-click the refresh icon and do a "Empty cash and hard reload".

