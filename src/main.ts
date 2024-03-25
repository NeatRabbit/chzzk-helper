import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "path";
import {
  activeSetting,
  getDonationsSetting,
  getUserStatus,
  getLiveSetting,
  getCategory,
  setLiveSetting,
  commandSkip,
  connectWebsocket,
} from "./main/chzzkApi";
import { updateElectronApp } from "update-electron-app";
updateElectronApp(); // additional configuration options available

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

async function logOut() {
  return session.defaultSession.clearStorageData();
}

const createWindow = () => {
  ipcMain.handle("getUserStatus", getUserStatus);
  ipcMain.handle("getDonationsSetting", getDonationsSetting);
  ipcMain.handle("activeSetting", activeSetting);
  ipcMain.handle("getLiveSetting", getLiveSetting);
  ipcMain.handle("getCategory", getCategory);
  ipcMain.handle("setLiveSetting", setLiveSetting);
  ipcMain.handle("commandSkip", commandSkip);
  ipcMain.handle("connectWebsocket", connectWebsocket);
  ipcMain.handle("logOut", logOut);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 913,
    height: 685,
    // height: 725,
    icon: "public/icon.png",
    useContentSize: true,
    title: "치지직 스트리머 도우미",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      webSecurity: false,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Whale/3.24.223.21 Safari/537.36"
  );

  mainWindow.webContents.addListener("will-navigate", async (details) => {
    if (details.url !== "https://chzzk.naver.com/") return;

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  if (process.env.NODE_ENV === "development") {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
