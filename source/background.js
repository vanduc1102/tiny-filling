var lipsumAll = " Lorem ipsum dolor sit amet, ."

var lipsum = lipsumAll.split(".");

function createRandomDateString() {
	var randomDate = new Date();
	var diffYear = Math.floor(Math.random() * 3) - 1;
	randomDate.setFullYear(randomDate.getFullYear() + diffYear);
	randomDate.setMonth(0);
	randomDate.setDate(Math.floor(Math.random() * 365) + 1);
	return formatDate(randomDate);
}

function createRandomDatePattern() {
	var s = settings.getDateFormat();
	s = s.replace("dd", "??");
	s = s.replace("MM", "??");
	s = s.replace("yyyy", "????");
	return s;
}

function createYesterdayString() {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return formatDate(yesterday);
}

function createTodayString() {
	var today = new Date();
	return formatDate(today);
}
function createTomorrowString() {
	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return formatDate(tomorrow);
}

function createParagraph(length, startWithLipsum) {
	var text = "";
	if (startWithLipsum) {
		text = lipsum[0];
		length = length - 1;
	}
	for (var i = 0; i < length; i++) {
		var ix = Math.floor(Math.random() * lipsum.length);
		text = text + lipsum[ix] + ".";
	}
	return text.substring(1);
}

function createParagraphs(numberOfParagraphs, paragraphLength, startWithLipsum) {
	var text = "";
	for (var i = 0; i < numberOfParagraphs; i++) {
		var p = createParagraph(paragraphLength, startWithLipsum && (i == 0));
		if (i > 0) text = text + "\n\n";
		text = text + p;
	}
	return text;
}

function createTitle(numberOfWords, startWithLipsum) {
	var words = [];
    while (words.length < numberOfWords) {
        var ix = startWithLipsum ? 0 : Math.floor(Math.random() * lipsum.length);
        var title = lipsum[ix];
        title = title.substring(1);
        title = title.split(",").join("");
        words = title.split(" ");
    }
    var ret = "";
    for (var i = 0; i < numberOfWords; i++) {
        if (i > 0) ret = ret + " ";
        ret = ret + words[i];
    }
	return ret;
}

function createMail() {
	return settings.getMail();
}

function createURL() {
	return settings.getURL();
}

function insertText(text, callback) {
	if (settings.isCopyToClipboard()) {
		var clipboard = document.getElementById("clipboard");
		clipboard.value = text;
		clipboard.select();
		document.execCommand("copy", false, true);
	}
	if (settings.isInsertIntoPage()) {
		chrome.tabs.getSelected(null, function(tab) {		
			chrome.tabs.sendMessage(tab.id, { type: "insertText", text: text}, function(response) {
				if (callback) callback(response);
		  });
		});
	} else {
		if (callback) callback({});
	}
}

function insertParagraphs(numberOfParagraphs, paragraphLength, callback) {
	var text = createParagraphs(numberOfParagraphs, paragraphLength, false);
	insertText(text, callback);
}

function insertTitle(numberOfWords, callback) {
	var text = createTitle(numberOfWords, false);
	insertText(text, callback);
}

function insertDate(date, callback) {
	insertText(formatDate(date), callback);
}

function formatDate(date) {
	var s = settings.getDateFormat();
	s = s.replace("dd", date.getDate());
	s = s.replace("MM", date.getMonth() + 1);
	s = s.replace("yyyy", date.getFullYear());
	return s;
}



var settings = {
	isInsertIntoPage : function() {
		if (typeof(localStorage["insertIntoPage"]) == 'undefined'){
			 settings.setInsertIntoPage(true);
		}
		return JSON.parse(localStorage["insertIntoPage"]);
	},
	
	setInsertIntoPage : function(val) {
		localStorage["insertIntoPage"] = JSON.stringify(val);
		settings.reloadContextMenu();
	},

	isCopyToClipboard : function() {
		if (typeof(localStorage["copyToClipboard"]) == 'undefined') {
			settings.setCopyToClipboard(true);
		}
		return JSON.parse(localStorage["copyToClipboard"]);
	},
	
	setCopyToClipboard : function(val) {
		localStorage["copyToClipboard"] = JSON.stringify(val);
		settings.reloadContextMenu();
	},
	
	isContextMenu: function() {
		if (typeof(localStorage["contextMenu"]) == 'undefined') {
			settings.setContextMenu(true);
		}
		return JSON.parse(localStorage["contextMenu"]);
	},
	
	reloadContextMenu: function() {
		chrome.contextMenus.removeAll();
		if (settings.isContextMenu()) {
			createContextMenu();
		}
	},
	
	setContextMenu : function(val) {
		localStorage["contextMenu"] = JSON.stringify(val);
		settings.reloadContextMenu();
	},
	
	getURL : function() {		
		if (typeof(localStorage["url"]) == 'undefined') {
			localStorage["url"] = "http://wwww.domain.tld";
		}
		return localStorage["url"];
	},
	
	setURL : function(val) {
		localStorage["url"] = val;
		settings.reloadContextMenu();
	},
	
	getMail : function() {
		if (typeof(localStorage["mail"]) == 'undefined'){
			localStorage["mail"] = "test@domain.tld";
		}			
		return localStorage["mail"];
	},
	
	setMail : function(val) {
		localStorage["mail"] = val;
		settings.reloadContextMenu();
	},
		
	getDateFormat : function() {
		if (typeof(localStorage["dateFormat"]) == 'undefined') {
			localStorage["dateFormat"] = "dd.MM.yyyy";
		}
		return localStorage["dateFormat"];
	},
	
	setDateFormat : function(val) {
		localStorage["dateFormat"] = val;
		settings.reloadContextMenu();
	}
	
};

function createContextMenu() {
	var topMenu = "YALIG";
	if (!settings.isInsertIntoPage()) {
		if (!settings.isCopyToClipboard()) {
			topMenu = topMenu + " (inactive)";
		} else {
			topMenu = topMenu + " (only clipboard)";
		}
	}
	var contextMenu = chrome.contextMenus.create({ "title" : topMenu, "contexts" : ["editable"]});
	chrome.contextMenus.create({
		"title" : "Title",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertTitle(4); }
	}); 
	chrome.contextMenus.create({
		"title" : "One Paragraph",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertParagraphs(1, 5);}
	});
	chrome.contextMenus.create({
		"title" : "Five Paragraphs",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertParagraphs(5, 5);}
	});
	chrome.contextMenus.create({
		"type" : "separator",
		"parentId" : contextMenu,
		"contexts" : ["editable"]
	});
	chrome.contextMenus.create({
		"title" : "Yesterday (" + createYesterdayString() + ")",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertText(createYesterdayString());}
	});
	chrome.contextMenus.create({
		"title" : "Today (" + createTodayString() + ")",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertText(createTodayString()); }
	});
	chrome.contextMenus.create({
		"title" : "Tomorrow (" + createTomorrowString() + ")",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertText(createTomorrowString()); }
	}); 
	chrome.contextMenus.create({
		"title" : "RandomDate (" + createRandomDatePattern() + ")",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertText(createRandomDateString()); }
	});
	chrome.contextMenus.create({
		"type" : "separator",
		"parentId" : contextMenu,
		"contexts" : ["editable"]
	});
	chrome.contextMenus.create({
		"title" : "E-Mail (" + createMail() + ")",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertText(createMail());}
	});
	chrome.contextMenus.create({
		"title" : "URL (" + createURL() + ")",
		"parentId" : contextMenu,
		"contexts" : ["editable"],
		"onclick": function(info, tab) { insertText(createURL()); }
	});
}
settings.reloadContextMenu();