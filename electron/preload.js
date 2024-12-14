const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('bustub', {
    sendMessage: (api, data) => ipcRenderer.invoke('sendMessage', api, data),
    showResultWindow: (sqlResult) => ipcRenderer.invoke('showResultWindow', sqlResult),
    receiveResult: (callback) => ipcRenderer.on('result-data', (event, result) => callback(result))
});