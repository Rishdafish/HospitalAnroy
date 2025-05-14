const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
console.log('Current directory:', __dirname);
console.log('Looking for index.html at:', path.join(__dirname, 'my-electron-app', 'index.html'));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#f3f4f6', // Match the background color from CSS
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Correct the path to index.html inside my-electron-app folder
  mainWindow.loadFile(path.join(__dirname, 'my-electron-app', 'index.html'));
  
  // For debugging
  mainWindow.webContents.openDevTools();

  // Add console listeners
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
  });

  // Log when page fails to load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (${errorCode})`);
  });

  // Log when page is ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});