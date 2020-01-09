# Indent Text Editor


# Basic of how to dev:

Clone the repo.

To run the server to try out the editor:

    python3 -m http.server 8080

From the StandardNotes, import the extension if you didn't already. It has to be from the app because otherwise, it's a http call within a https one which is refused.

    http://localhost:8080/ext.json

To update dist/ files which are sent as editor, run:

    grunt

To refresh your editor with the modified version, the way that always work is to open the Chrome console, then right-click the refresh icon and do a "Empty cash and hard reload".

