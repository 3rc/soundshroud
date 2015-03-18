'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

var backgroundTest = "The background page was called successfully."


console.log('\'Allo \'Allo! Event Page for Browser Action');
