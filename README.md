# Inspector Connector

Enables remote debugging for Chrome using an extension (instead of command line flag). Requires server. Works with Chrome 19, earlier versions do not work.

TODO:
 * Add some kind of popup to select the server...
 * Make a version that works in Chrome 18

## Instructions

The extension is at directory extension

Get https://github.com/mrsmkl/webkit-inspector-crx into www/webkit-inspector-crx

    cd www
    git clone git://github.com/mrsmkl/webkit-inspector-crx.git
    cd ..

Start the server using:

    node server.js

Then go to http://localhost:5050/index.html

