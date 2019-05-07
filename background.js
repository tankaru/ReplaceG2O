chrome.browserAction.onClicked.addListener(function(tab) {
  var param = {};
  chrome.tabs.sendMessage(tab.id, param, function(response) {
    //console.log("password view: complete");
  });
});
