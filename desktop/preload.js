// The bridge between the game page and the desktop app: the page is opened from disk, where a browser
// cannot fetch other files, so the app reads the 3D models for it (only files in web/models, by name).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('odDesktop', { model: name => ipcRenderer.invoke('od-model', String(name)) });
