let webSocket = null;
let sessionId = null;
function connectToWebSocket() {
  webSocket = new WebSocket('ws://localhost:3008');

  webSocket.onopen = () => {
    console.log('WebSocket connected');
    changeIcon("../icons/server_up.png");
  };
  webSocket.onmessage = function (event) {
    const message = JSON.parse(event.data);
    if (message.type == 'sessionId') {
      if (message.data == 'null' || message.data == '-1') {
        sessionId = null;
      } else {
        sessionId = message.data;
        chrome.storage.sync.set({sessionId: sessionId}); 
      }
      console.log("SessionId : ", message.data)
    }
  };
  webSocket.onerror = (err) => {
    console.error('WebSocket error:', err);
    changeIcon("../icons/server_down.png");
  };
}

// Initial connection attempt
connectToWebSocket();

// Reconnect every 5 seconds if not connected
setInterval(() => {
  if (webSocket === null || webSocket.readyState !== WebSocket.OPEN) {
    connectToWebSocket();
  }
}, 5000);

// Message listener from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  message.sessionId = sessionId;
  if (sessionId && webSocket && webSocket.readyState === WebSocket.OPEN) {
    console.log( {payload: message.toString()} )
    webSocket.send(JSON.stringify(message));
  } else {
    console.log('WebSocket not ready, data ignored');
  }
  chrome.browserAction.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage(); 
  });
});

function changeIcon(imageIcon) {
  chrome.action.setIcon({ path: imageIcon });
}
