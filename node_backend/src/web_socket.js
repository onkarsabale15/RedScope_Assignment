import { WebSocketServer } from 'ws';
import fs from 'fs-extra';
import { dataFolderName } from './constants.js'
import path from "path";


let sessionID= null;
const connectedClients = [];
const broadcastSessionID = (id) => {
  connectedClients.forEach(client => {
    client.send(JSON.stringify({ type: 'sessionId', data: id }));
  });
};
const startWebSocketServer = () => {
  const wss = new WebSocketServer({ port: 3008 });
  wss.on('connection', (ws) => {
    console.log('WebSocket connection established.');
    connectedClients.push(ws);
    sessionID && ws.send(JSON.stringify({ type: 'sessionId', data: sessionID }));
    ws.on('message', (message) => {
      const payload = JSON.parse(message.toString());
      const { type, url, data,sessionId } = payload;
      if(type == "session Id Change"){
        sessionID = data;
        if(data=='null'||data=='-1')
        broadcastSessionID(null)
      }else{
        sessionId && processPayload(payload);
      }
    });
  });
};

let allUrl = [];
let lastUrl = null;
let id = 1;
const processPayload = (payload) => {
  const { type, url, data, sessionId } = payload;
  console.log("*".repeat(80));
  console.log( {type, url, payload} );
  console.log("*".repeat(80));

  if (type !== 'rrweb events') {
    return;
  }
  const jsonData = JSON.parse(data);
  let dataFilePath;
  if(allUrl.includes(url)){
    id = allUrl.indexOf(url) + 1;
    dataFilePath = path.join(dataFolderName, id.toString());
    fs.writeJsonSync(dataFilePath, jsonData, { flag: 'a' });
  } else {
    id = allUrl.length + 1;
    allUrl.push(url);
    dataFilePath = path.join(dataFolderName, id.toString());
    fs.writeJsonSync(dataFilePath, jsonData);
  }
  // if (url === lastUrl) { // Simply append to the same file;  No change
  //   dataFilePath = path.join(dataFolderName, id.toString());
  //   fs.writeJsonSync(dataFilePath, jsonData, { flag: 'a' });
  // } else {
  //   dataFilePath = path.join(dataFolderName, id.toString());
  //   fs.writeJsonSync(dataFilePath, jsonData); // This would empty the files if there's already content
  // }

  lastUrl = url;
};


export {
  startWebSocketServer,
};
