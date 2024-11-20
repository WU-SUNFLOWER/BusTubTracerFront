import { app, BrowserWindow } from 'electron';

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 1800,
    })
    mainWindow.loadURL("http://localhost:5173/");
}

app.whenReady().then(() => {
    createWindow()
})

// 证书的链接验证失败时，触发该事件
app.on(
    "certificate-error",
    function (event, webContents, url, error, certificate, callback) {
        event.preventDefault();
        callback(true);
    }
);

