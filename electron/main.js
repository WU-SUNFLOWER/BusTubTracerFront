import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path, { resolve, dirname } from 'path';
import process from 'process';
import BusTubCore from './bustub_core.js';
import { fileURLToPath } from 'url';

// Reference: https://www.npmjs.com/package/electron-is-dev
const isDev = () => {
    if (typeof electron === 'string') {
        throw new TypeError('Not running in an Electron environment!');
    }
    
    const { env } = process;
    const isEnvSet = 'ELECTRON_IS_DEV' in env;
    const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
    
    return isEnvSet ? getFromEnv : !app.isPackaged;
};

const createWindow = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const htmlPath = "./dist/index.html";
    const preloadPath = "./electron/preload.js"

    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        //resizable: false,
        webPreferences: {
            preload: path.join(__dirname, '../', preloadPath),
        },
    });

    if (isDev()) {
        mainWindow.loadURL("http://localhost:5173/");
    } else {
        mainWindow.setMenu(null);
        mainWindow.loadFile(path.join(__dirname, '../', htmlPath));
    }

    // Catch window closing event.
    mainWindow.on('close', (e) => {
        e.preventDefault();
        closeConfirmDialog(e, mainWindow);
    });
};

const closeConfirmDialog = (e, window) => {
    const choice = dialog.showMessageBoxSync(window, {
      type: 'question',
      buttons: ['Cancel', 'OK'],
      defaultId: 0,
      cancelId: 0,
      title: 'Are you sure you want to exit the app?',
      message: 'After exiting, all your operations in BusTub will be cleared!'
    });
  
    if (choice === 1) {
      // 移除所有监听器，防止再次触发
      window.removeAllListeners('close');
      // 销毁窗口
      window.close();
    } else {
      e.preventDefault();
    }
};

const handleIpcRequirement = () => {
    ipcMain.handle('sendMessage', async (event, api, data) => {
        return await sendMessageToBustub(api, data);
    });
};

const sendMessageToBustub = async (api, data = {}) => {
    let request = JSON.stringify({ api, data });
    let response = await BusTubCore.sendMessage(request);
    return JSON.parse(response);
};

const initTestTables = async () => {
    // Create test tables
    await BusTubCore.executeSQL("create table department (id int, name varchar(128))");
    await BusTubCore.executeSQL("create table teacher (id int, name varchar(128), did int)");
    await BusTubCore.executeSQL("create table course (id int, name varchar(128), credit int)");
    await BusTubCore.executeSQL("create table course_teacher (cid int, tid int)");

    // Init `department` table
    let departments = [
        "Computer Science", "Software Engineering", 
        "Information Security", "Teaching and Research Section"
    ];
    let values = [];
    for (let i = 0; i < departments.length; ++i) {
        values.push(`(${i}, '${departments[i]}')`);
    }
    await BusTubCore.executeSQL(`insert into department values ${values.join(',')}`);        
    
    // Init `teacher` table
    let teacheres = [
        ['CZX', 3], ['HT', 0], ['LBL', 1], ['HPY', 3], 
        ['FJ', 0], ['SC', 0], ['XB', 1], ['LCX', 0],
        ['BCZ', 0], ['DXY', 0], ['CWG', 0], ['JZY', 0],
        ['SJ', 2], ['HBH', 2], ['ZDH', 2], ['YT', 2],
        ['WQ', 0], ['XGL', 0], ['KDK', 0], ['DJF', 1]
    ];
    values = [];
    for (let i = 0; i < teacheres.length; ++i) {
        let [name, did] = teacheres[i];
        values.push(`(${i}, '${name}', ${did})`);
    }
    await BusTubCore.executeSQL(`insert into teacher values ${values.join(',')}`);

    // Init `course` table
    let courses = [
        ['C Language Programming', 4], ['Discrete Mathematics', 3],
        ['Linux Basics', 2], ['Principles of Database', 3],
        ['Digital Logic', 1], ['C++ Language Programming', 2],
        ['Database Course Design', 1], ['Computer Architecture', 3],
        ['Data Science', 1], ['Digital Image Processing', 2],
        ['Introduction to AI', 2], ['Software Development Practice', 3]
    ];
    values = [];
    for (let i = 0; i < courses.length; ++i) {
        let [name, credits] = courses[i];
        values.push(`(${i}, '${name}', ${credits})`);
    }
    await BusTubCore.executeSQL(`insert into course values ${values.join(',')}`);

    // Init `course_teacher` table
    let course_teacher = [
        [0, 7], [1], [2], [3, 14], [4],
        [5, 11], [6], [8], [9], [10],
        [16, 17, 9], [18]   
    ];
    values = [];
    for (let cid = 0; cid < course_teacher.length; ++cid) {
        for (let tid of course_teacher[cid]) {
            values.push(`(${cid}, ${tid})`);
        }
    }
    await BusTubCore.executeSQL(`insert into course_teacher values ${values.join(',')}`);

    await BusTubCore.executeSQL(`create index idx_colA on test_table_1(colA)`);
    await BusTubCore.executeSQL(`create index idx_colA on test_table_2(colA)`);
    await BusTubCore.executeSQL(`create index idx_colA on test_table_3(colA)`);
};

app.whenReady().then(async () => {
    await BusTubCore.init();
    await initTestTables();
    handleIpcRequirement();
    createWindow();
});

// 在所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    // 对于 macOS，不要调用 app.quit()
    if (process.platform !== 'darwin') {
        BusTubCore.exit();
        app.quit();
    }
});

// 证书的链接验证失败时，触发该事件
app.on(
    "certificate-error",
    function (event, webContents, url, error, certificate, callback) {
        event.preventDefault();
        callback(true);
    }
);