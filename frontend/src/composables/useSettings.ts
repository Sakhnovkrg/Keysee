import { ref } from 'vue'

export type OverlayPosition = 'left' | 'center' | 'right'

export type Settings = {
  // Overlay appearance
  overlayBackground: string
  overlayTransparency: string
  overlayBorderRadius: string
  overlayBottomOffset: string
  overlaySideOffset: string
  overlayPosition: OverlayPosition

  // Input appearance
  singleKeyBgColor: string
  singleKeyTextColor: string

  comboKeyBgColor: string
  comboKeyTextColor: string

  mouseBgColor: string
  mouseTextColor: string

  fontSize: string
  keyBorderRadius: string
  keyBackgroundTransparency: string
  fontFamily: string
  eventDisplayDuration: number

  // Mouse click ripples
  rippleEnabled: boolean
  rippleSize: string
  rippleTransparency: number
  rippleDuration: string
  rippleColorLeft: string
  rippleColorMiddle: string
  rippleColorRight: string

  snoozeUpdateCheckUntil?: string
}

export const defaultSettings: Settings = {
  // Overlay appearance
  overlayBackground: '#000000',
  overlayTransparency: '80%',
  overlayBorderRadius: '8px',
  overlayBottomOffset: '50px',
  overlaySideOffset: '15px',
  overlayPosition: 'center',

  // Input appearance
  singleKeyBgColor: '#FFFFFF',
  singleKeyTextColor: '#000000',

  comboKeyBgColor: '#00FF88',
  comboKeyTextColor: '#000000',

  mouseBgColor: '#FFC800',
  mouseTextColor: '#000000',

  fontSize: '18px',
  keyBorderRadius: '4px',
  keyBackgroundTransparency: '30%',
  fontFamily: 'Segoe UI',
  eventDisplayDuration: 1200,

  // Mouse click ripples
  rippleEnabled: true,
  rippleSize: '22px',
  rippleTransparency: 0.3,
  rippleDuration: '600ms',
  rippleColorLeft: '#FFC800',
  rippleColorMiddle: '#00AAFF',
  rippleColorRight: '#FF5555'
}

const settings = ref<Settings>({ ...defaultSettings })

export async function loadSettings() {
  const loaded = await window.ipcRenderer.invoke('settings:get')
  settings.value = { ...defaultSettings, ...loaded }
}

export async function saveSettings(patch: Partial<Settings>) {
  settings.value = { ...settings.value, ...patch }
  await window.ipcRenderer.invoke('settings:set', patch)
}

export function useSettings() {
  return {
    settings,
    loadSettings,
    saveSettings,
  }
}
