"use strict";

chrome.browserAction.onClicked.addListener(tab => {
    chrome.tabs.executeScript(null, {file: 'app.js'})
})
