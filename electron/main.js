import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import process from 'process';
import BusTubCore from './bustub_core.js';

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(process.cwd(), 'electron/preload.js'),
        },
    });
    mainWindow.loadFile(path.join(process.cwd(), 'test_front/index.html'));
    // mainWindow.loadURL("http://localhost:5173/");
};

const handleIpcRequirement = () => {
    ipcMain.handle('sendMessage', async (event, api, data = {}) => {
        let request = JSON.stringify({ api, data });
        let response = await BusTubCore.sendMessage(request);
        return JSON.parse(response);
    });
};

app.whenReady().then(async () => {
    console.log("before BusTubCore.init");
    await BusTubCore.init();
    console.log("after BusTubCore.init");
    handleIpcRequirement();
    createWindow();
});

// 证书的链接验证失败时，触发该事件
app.on(
    "certificate-error",
    function (event, webContents, url, error, certificate, callback) {
        event.preventDefault();
        callback(true);
    }
);

