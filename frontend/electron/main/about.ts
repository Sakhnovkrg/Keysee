import { BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { shell } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let aboutWindow: BrowserWindow | null = null

export function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus()
    return
  }

  aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'About Keysee',
    icon: path.join(__dirname, '../../public/icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/index.mjs'),
    },
  })

  aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  
  aboutWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== aboutWindow!.webContents.getURL()) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  aboutWindow.setMenuBarVisibility(false)

  const htmlPath = import.meta.env.DEV
    ? 'http://localhost:5173/about.html'
    : path.join(process.env.VITE_PUBLIC!, 'about.html')

  aboutWindow.loadURL(htmlPath)

  aboutWindow.on('closed', () => {
    aboutWindow = null
  })
}
