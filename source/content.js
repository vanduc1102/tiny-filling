/**
 * Retrieve active element of document and preserve iframe priority MULTILEVEL!
 * @return HTMLElement
 **/
function getActiveElement(document) {
	document = document || window.document;
	// Check if the active element is in the main web or iframe
	if (document.body === document.activeElement || document.activeElement.tagName == 'IFRAME') {
		// Get iframes
		var iframes = document.getElementsByTagName('iframe');
		for (var i = 0; i < iframes.length; i++) {
			// Recall
			var focused = getActiveElement(iframes[i].contentWindow.document);
			if (focused !== false) {
				return focused;
				// The focused
			}
		}
	} else {
		return document.activeElement;
	}

	return false;
};
function insertText(text) {
	console.log("text : "+text);
	var element = getActiveElement(document);
	if (!element)
		return false;
	if ( typeof (element.value) != "undefined")
		return insertIntoValueElement(element, text);
}

function getType() {
	var element = document.activeElement;
	if (element && typeof (element.value) != "undefined")
		return element.getAttribute("type");
}

function insertIntoValueElement(element, text) {
	var start = element.selectionStart;
	var end = element.selectionEnd;
	if (!start)
		start = 0;
	if (!end)
		end = 0;
	var prefix = element.value.substring(0, start);
	var suffix = element.value.substring(end, element.value.length);
	element.value = prefix + text + suffix;
	start = start + text.length;
	element.selectionStart = start;
	element.selectionEnd = start;
	element.focus();
	return true;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.type == 'insertText') {
		var success = insertText(request.text);
		var response = {};
		response.error = !success;
		sendResponse(response);
	} else if (request.type == 'inputType') {
		var response = {};
		response.inputType = getType();
		sendResponse(response);
	}
});
