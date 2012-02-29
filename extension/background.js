
chrome.browserAction.onClicked.addListener(function() {
    chrome.windows.getCurrent(function(win) {
        chrome.tabs.getSelected(win.id, actionClicked);
    });
});

// All this stuff should be moved into a popup?
// But the popup must communicate with bg process to keep the socket running ...

var conn = io.connect("http://192.168.0.7:5050/");

// Need to add support for multiple pages. All messages then have to have ids with them
function actionClicked(tab) {
    var tab_id = {tabId: tab.id};
    conn.emit("register_page", {msg:"Help me, debug my page!!!", tab_id: tab_id});
    chrome.debugger.attach(tab_id, "1.0", function () {
        chrome.debugger.onEvent.addListener(function (id, method, params) {
            console.log({method: method, params: params});
            conn.emit("event", {method: method, params: params, tab_id:id});
        });
        chrome.debugger.onDetach.addListener(function () {
            conn.emit("detached", tab_id);
        });
    });
    // Commands are just redirected from server, and then replied
    conn.on("command", function (msg,cont) {
        console.log(msg);
        chrome.debugger.sendCommand(msg.tab_id, msg.method, msg.params, function (reply) {
            console.log(reply);
            cont(reply);
        });
    });
}

