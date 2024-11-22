const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('bustub', {
    sendMessage: (api, data) => ipcRenderer.invoke('sendMessage', api, data),
});