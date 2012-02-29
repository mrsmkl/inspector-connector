
// Make a shared worker
function Handler(str) {
    if (typeof Worker == "undefined") return;
    this.worker = new Worker(str);
    this.uniq = 0;
    this.handlers = {};
    var self = this;
    this.worker.onmessage = function (msg) {
        var obj = JSON.parse(msg.data);
        var f = self.handlers[obj.id];
        delete self.handlers[obj.id];
        if (f) f(obj);
    };
}

exports.Handler = Handler;

Handler.prototype.handle = function (obj, cont) {
    this.uniq++;
    obj.id = this.uniq;
    this.handlers[obj.id] = function (dta) { if (cont) cont(dta.lst); };
    this.worker.postMessage(JSON.stringify(obj));
};

function SharedHandler(str) {
    if (typeof SharedWorker == "undefined") return;
    this.worker = new SharedWorker(str);
    this.uniq = 0;
    this.handlers = {};
    var self = this;
    this.worker.port.onmessage = function (msg) {
        var obj = JSON.parse(msg.data);
        var f = self.handlers[obj.id];
        delete self.handlers[obj.id];
        if (f) f(obj);
    };
}

exports.SharedHandler = SharedHandler;

SharedHandler.prototype.handle = function (obj, cont) {
    this.uniq++;
    obj.id = this.uniq;
    this.handlers[obj.id] = function (dta) { if (cont) cont(dta.lst); };
    this.worker.port.postMessage(JSON.stringify(obj));
};

exports.validRegex = function (str, modif) {
    try {
        var re = new RegExp(str, modif);
        return re;
    }
    catch (e) {
        return null;
    }
};

exports.hashFile = function () {
    var str = document.location.hash || "";
    var lst = str.split(":");
    var res = lst[0].length > 0 ? lst[0].substring(1) : "";
    // console.log("Hash: " + res);
    return res;
};

exports.htmlEntities = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>').replace(/( |\u00a0)/g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
};

function Selector() {
	this.list = [[]];
    this.x = 0;
    this.y = 0;
    this.current = null;
}

exports.Selector = Selector;

Selector.prototype.clear = function () {
    this.clearCurrent();
	this.list = [[]];
    this.x = 0;
	// this.x = this.y = -1;
};

Selector.prototype.clearCurrent = function () {
	if (this.list.length == 0) return;
	if (this.current) {
        // this.current.style["background-color"] = null;
        // this.current.style["text-shadow"] = null;
        $(this.current).removeClass("selector");
        this.current = null;
	}
};

Selector.prototype.setCurrent = function (x,y) {
    y = y || 0;
    if (this.list.length == 0) return;
    this.x = x%this.list.length;
    this.y = y%this.list[this.x].length;
    if (this.list[this.x].length == 0) return;
    this.clearCurrent();
    while (this.x > 0 && (!this.list[this.x][this.y] || !this.list[this.x][this.y].elem)) this.x--;
    var item = this.list[this.x][this.y];
    if (item.activated) item.activated();
	this.current = document.getElementById(item.elem);
	if (this.current) {
        $(this.current).addClass("selector");
        // this.current.style["background-color"] = "yellow";
	}
};

Selector.prototype.resetCurrent = function () {
    this.setCurrent(this.x, this.y);
};

Selector.prototype.add = function (x, y, elem, command, act) {
	if (!this.list[x]) this.list[x] = [];
    this.list[x][y] = {elem:elem, command:command, activated: act};
	if (this.x == -1) this.setCurrent(x,y);
};

Selector.prototype.handleKey = function (ev) {
	if (this.x == -1) return true;
    if (ev.keyIdentifier == "Up") {
		this.setCurrent(this.x, (this.y - 1 + this.list[this.x].length) % this.list[this.x].length);
        return false;
	}
	else if (ev.keyIdentifier == "Down") {
		this.setCurrent(this.x, (this.y + 1) % this.list[this.x].length);
        return false;
	}
    else if (ev.keyIdentifier == "Left") {
		this.setCurrent((this.x - 1 + this.list.length) % this.list.length, this.y);
        return false;
	}
	else if (ev.keyIdentifier == "Right") {
		this.setCurrent((this.x + 1) % this.list.length, this.y);
        return false;
	}
	else if (ev.keyIdentifier == "Enter") {
		this.list[this.x][this.y].command();
        return false;
	}
    return true;
};

exports.timed = function (f) {
    var t1 = new Date().getTime();
    f();
    var t2 = new Date().getTime();
    console.log(t2-t1);
};

