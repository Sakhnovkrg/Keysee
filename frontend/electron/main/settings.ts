import { BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let settingsWindow: BrowserWindow | null = null

export function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 600,
    height: 700,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Keysee settings',
    icon: path.join(__dirname, '../../public/icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/index.mjs'),
    },
  })

  settingsWindow.setMenuBarVisibility(false)
  // settingsWindow.webContents.openDevTools()

  const htmlPath = import.meta.env.DEV
    ? 'http://localhost:5173/settings.html'
    : path.join(process.env.VITE_PUBLIC!, 'settings.html')

  settingsWindow.loadURL(htmlPath)

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}
