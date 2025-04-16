import { app, BrowserWindow, shell, ipcMain, Tray, Menu, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { spawn } from 'child_process'
import store from './settingsStore'
import { createSettingsWindow } from './settings'
import { createAboutWindow } from './about'
import semver from 'semver'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CURRENT_VERSION = app.getVersion()
let tray: Tray | null = null
let win: BrowserWindow | null = null
let backendProcess: ReturnType<typeof spawn> | null = null

const APP_ROOT = path.join(__dirname, '../..')
const MAIN_DIST = path.join(APP_ROOT, 'dist-electron')
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST

process.env.APP_ROOT = APP_ROOT
process.env.VITE_PUBLIC = VITE_PUBLIC

if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()
if (process.platform === 'win32') app.setAppUserModelId('com.keysee.app')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// IPC
ipcMain.handle('settings:get', () => store.store)
ipcMain.handle('settings:set', (_event, payload) => store.set(payload))
ipcMain.handle('settings:update', (_event, payload) => {
  store.set(payload)
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('settings-updated', payload)
  })
})

// Window
async function createWindow() {
  win = new BrowserWindow({
    frame: false,
    transparent: true,
    fullscreen: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    alwaysOnTop: true,
    icon: path.join(process.resourcesPath, 'assets', 'icon.ico'),
    title: 'Keysee',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.setIgnoreMouseEvents(true)
  win.setAlwaysOnTop(true, 'screen-saver')

  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    await win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Tray
function createTray() {
  tray = new Tray(path.join(VITE_PUBLIC, 'icon.png'))
  const menu = Menu.buildFromTemplate([
    { label: 'Settings', click: createSettingsWindow },
    { label: 'About', click: createAboutWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setToolTip('Keysee')
  tray.setContextMenu(menu)
}

// Backend
function resolveBackendPath(): string {
  if (VITE_DEV_SERVER_URL) return path.join(APP_ROOT, 'keysee-backend.exe')

  const local = path.join(process.resourcesPath, 'keysee-backend.exe')
  if (fs.existsSync(local)) return local

  return path.join(path.dirname(app.getPath('exe')), 'keysee-backend.exe')
}

function launchBackend() {
  const exe = resolveBackendPath()

  if (!fs.existsSync(exe)) {
    dialog.showMessageBox({
      type: 'error',
      title: 'Backend Missing',
      message: 'Keysee backend is missing.\nPlease reinstall the app.',
    })
    return
  }

  backendProcess = spawn(exe, [], { stdio: 'ignore', detached: true })
  backendProcess.unref()
}

function shouldCheckForUpdates(): boolean {
  const snoozeUntil = store.get('snoozeUpdateCheckUntil') as string | undefined
  if (!snoozeUntil) return true

  const now = new Date()
  return now > new Date(snoozeUntil)
}

export async function checkForUpdates() {
  try {
    const res = await fetch('https://api.github.com/repos/Sakhnovkrg/Keysee/releases/latest')

    if (!res.ok) {
      console.warn('Update check failed:', res.status)
      return
    }

    const data = await res.json()
    const latest = data.tag_name?.replace(/^v/, '')

    if (!latest) {
      console.warn('Update check failed: no tag_name')
      return
    }

    if (semver.gt(latest, CURRENT_VERSION)) {
      const result = await dialog.showMessageBox({
        type: 'info',
        title: 'Update available',
        message: `New version ${latest} is available.`,
        buttons: ['Download', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })

      if (result.response === 0) {
        shell.openExternal('https://github.com/Sakhnovkrg/Keysee/releases/latest')
      } else {
        const snoozeUntil = new Date()
        snoozeUntil.setDate(snoozeUntil.getDate() + 7)
        store.set({ snoozeUpdateCheckUntil: snoozeUntil.toISOString() })
      }
    }
  } catch (err) {
    console.warn('Update check error:', err)
  }
}

// Init
app.whenReady().then(() => {
  launchBackend()
  createWindow()
  createTray()

  if (shouldCheckForUpdates()) {
    checkForUpdates()
  }
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  backendProcess?.kill()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
