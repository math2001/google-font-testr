"use strict";

chrome.browserAction.onClicked.addListener(tab => {
    chrome.tabs.executeScript(null, {file: 'insert.js'})
    // chrome.tabs.insertCSS(null, {file: 'popup.css'})
})
