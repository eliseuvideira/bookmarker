import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({ webPreferences: { nodeIntegration: true } });
  mainWindow.webContents.loadFile(__dirname + '/../assets/index.html');
});
