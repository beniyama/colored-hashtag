/*global $:false, chrome:false */

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  "use strict";

  if (changeInfo.status === 'complete') {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      if (typeof tabs !== void 0 && tabs !== null && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "onUpdated"}, function (response) {
        });
      }
    });
  }
});