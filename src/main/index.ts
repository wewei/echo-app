import { app, BrowserWindow, ipcMain } from 'electron';
import { updateElectronApp } from 'update-electron-app';
import { registerProfileHandlers } from './ipc/profileHandlers'
import { registerAssetHandlers } from './ipc/assetHandlers'
import { registerAssetProtocol } from './services/assetManager'
import { registerSettingsHandlers } from './ipc/settingsHandlers'
import { registerChatHandlers } from './ipc/chatHandler'
import { registerInteractionHandlers } from './ipc/interactionHandler';
import { registerVectorDbHandlers } from './ipc/vectorDbHandler';

updateElectronApp();
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      webSecurity: true,
      webviewTag: true,
      sandbox: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow?.close()
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  registerProfileHandlers();
  registerAssetHandlers();
  registerSettingsHandlers();
  registerAssetProtocol();
  registerChatHandlers();
  registerInteractionHandlers();
  registerVectorDbHandlers();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
console.log(app.getPath('userData'))

app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'webview') {
    // 限制 webview 的功能
    contents.on('will-navigate', (/* event, url */) => {
      // 可以在这里处理导航事件
    })
  }
})