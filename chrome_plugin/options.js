chrome.storage.sync.get('sessionId', result => {
    document.getElementById('sessionId').textContent = result.sessionId;
  });