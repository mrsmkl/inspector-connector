
var express = require("express");
var sockio = require("socket.io");

var app = express.createServer();
var io = sockio.listen(app);

io.set('log level', 1);

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var root_dir = "www/";

app.use(express.static(root_dir));

app.listen(5050, "0.0.0.0");

var pages = [];
var listeners = [];

function hasListener(s) {
    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] == s) return i;
    }
}

function clean(obj) {
    var res = {};
    for (var i in obj) {
        if (i != "socket" && i != "debug") res[i] = obj[i];
    }
    return res;
}

// There are two types of connections
// Then there is the index page that just queries for available pages
io.sockets.on("connection", function (s) {
    var listening = true;
    var cur_page = null;
    console.log("New client");
    s.on("list_pages", function (msg, cont) {
        if (listening) listeners.push(s);
        cont(pages.map(clean));
    });
    s.on("register_debugger", function (x, cont) {
        // Register debugger to page
        console.log("Register debugger");
        var page = pages[x.page];
        if (!page || page.reserved) {
            cont({error:"Page registered to other debugger"});
            return;
        }
        page.reserved = true;
        page.debug = s;
        s.on("message", function (msg) {
            console.log("Command: " + msg);
            var obj = JSON.parse(msg);
            page.socket.emit("command", {tab_id: page.tab_id, method:obj.method, params: obj.params}, function (result) {
                var x = {id: obj.id, result: result};
                console.log("Reply: " + JSON.stringify(x));
                s.emit("message", JSON.stringify(x));
            });
        });
        cont({msg:"Success"});
    });
    var sock_pages = {};
    s.on("event", function (ev) {
        console.log("Event: " + JSON.stringify(ev));
        if (sock_pages[ev.tab_id.tabId]) sock_pages[ev.tab_id.tabId].debug.emit("message", JSON.stringify({method:ev.method, params: ev.params}));
    });
    s.on("register_page", function (x, cont) {
        console.log("Register page");
        x.socket = s;
        x.id = pages.length;
        pages.push(x);
        sock_pages[x.tab_id.tabId] = x;
        // Signal all listeners that a new page is available
        listeners.forEach(function (l) { l.emit("list_pages", pages.map(clean)); });
        if (cont) cont();
    });
});

