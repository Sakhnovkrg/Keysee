<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettings } from './composables/useSettings'
import { applyCssVarsFromSettings } from './utils/applyCssVarsFromSettings'

const { settings, loadSettings } = useSettings()

type Event = {
  id: number
  type: string
  key?: string
  btn?: string
  direction?: string
  modifiers?: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    win?: boolean
  }
  count?: number
}

const events = ref<Event[]>([])
const clickRipples = ref<{ id: number; x: number; y: number; btn?: string }[]>([])

let counter = 0
let rippleId = 0
let lastEventKey: string | null = null
let lastEventId: number | null = null
let lastClickTime = 0
let lastClickSig = ''

const eventTimers = new Map<number, ReturnType<typeof setTimeout>>()
const activeCombos = new Map<string, { id: number; count: number }>()

function eventKey(e: Omit<Event, 'id'>): string {
  const mods = e.modifiers || {}
  return [
    e.type,
    mods.ctrl && 'Ctrl',
    mods.alt && 'Alt',
    mods.shift && 'Shift',
    mods.win && 'Win',
    e.key || e.btn || e.direction
  ].filter(Boolean).join('+')
}

function isModifierKey(key?: string): boolean {
  return [
    'Shift', 'LShift', 'RShift',
    'Control', 'LCtrl', 'RCtrl',
    'Alt', 'LAlt', 'RAlt',
    'Win', 'LWin', 'RWin'
  ].includes(key || '')
}

function hasAnyModifiers(e: Omit<Event, 'id'>): boolean {
  return !!e.modifiers && Object.values(e.modifiers).some(Boolean)
}

function formatWithModifiers(e: Event): string {
  const mods = []
  if (e.modifiers?.ctrl) mods.push('Ctrl')
  if (e.modifiers?.alt) mods.push('Alt')
  if (e.modifiers?.shift) mods.push('Shift')
  if (e.modifiers?.win) mods.push('Win')

  let key = e.key ?? e.btn ?? e.direction ?? ''
  if (e.direction === 'up') key = '🡅'
  if (e.direction === 'down') key = '🡇'

  if (key) mods.push(key)

  return mods
    .map(k => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase())
    .join(' + ')
}

function scheduleEventCleanup(id: number) {
  if (!settings.value?.eventDisplayDuration) return

  const existing = eventTimers.get(id)
  if (existing) clearTimeout(existing)

  const timeout = setTimeout(() => {
    events.value = events.value.filter(e => e.id !== id)
    eventTimers.delete(id)

    for (const [key, entry] of activeCombos) {
      if (entry.id === id) {
        activeCombos.delete(key)
        break
      }
    }

    if (lastEventId === id) {
      lastEventKey = null
      lastEventId = null
    }
  }, settings.value.eventDisplayDuration)

  eventTimers.set(id, timeout)
}

function handleRipple(data: any) {
  if (!settings.value?.rippleEnabled) return

  const { x, y, btn } = data
  const id = rippleId++

  clickRipples.value.push({ id, x, y, btn })

  setTimeout(() => {
    clickRipples.value = clickRipples.value.filter(r => r.id !== id)
  }, parseInt(settings.value.rippleDuration ?? '600'))
}

function handleEventMessage(raw: string) {
  const data = JSON.parse(raw) as Omit<Event, 'id'>

  if (data.type === 'mousedown') handleRipple(data)

  // Обработка двойного клика
  if (data.type === 'mousedown' && !hasAnyModifiers(data)) {
    const sig = data.btn || ''
    const now = Date.now()

    if (now - lastClickTime < 300 && sig === lastClickSig) {
      const dblEvent: Event = { ...data, id: counter++, type: 'dblclick', count: 1 }
      events.value.push(dblEvent)

      requestAnimationFrame(() => {
        document.querySelector(`[data-event-id="${dblEvent.id}"]`)?.classList.add('pulse')
      })

      scheduleEventCleanup(dblEvent.id)
      lastClickTime = 0
      lastClickSig = ''
      return
    }

    lastClickTime = now
    lastClickSig = sig
  }

  if (
    data.type === 'mouseup' ||
    (data.type === 'wheel' && !hasAnyModifiers(data)) ||
    (data.type === 'mousedown' && !hasAnyModifiers(data)) ||
    (data.type === 'keyboard' && isModifierKey(data.key) && !hasAnyModifiers(data))
  ) return

  const key = eventKey(data)

  if (key === lastEventKey && lastEventId !== null) {
    const ev = events.value.find(e => e.id === lastEventId)
    if (ev) {
      ev.count = (ev.count || 1) + 1
      scheduleEventCleanup(ev.id)

      const el = document.querySelector(`[data-event-id="${ev.id}"]`)
      if (el) {
        el.classList.remove('pulse')
        void (el as HTMLElement).offsetWidth
        el.classList.add('pulse')
      }
    }
    return
  }

  const item: Event = { ...data, id: counter++, count: 1 }
  events.value.push(item)
  lastEventKey = key
  lastEventId = item.id
  scheduleEventCleanup(item.id)
}

function connectWebSocket() {
  const ws = new WebSocket('ws://localhost:12834/ws')

  ws.onmessage = (msg) => handleEventMessage(msg.data)

  ws.onclose = () => setTimeout(connectWebSocket, 1000)
}

function getEventClass(e: Event): string {
  if (['dblclick', 'mousedown', 'mouseup', 'wheel'].includes(e.type)) return 'mouse-event'
  if (e.type === 'keyboard') {
    return hasAnyModifiers(e) ? 'combo-event' : 'key-event'
  }
  return ''
}

onMounted(async () => {
  window.ipcRenderer.on('settings-updated', async (_event, data) => {
    await loadSettings()
    applyCssVarsFromSettings(data)
  })

  await loadSettings()
  if (settings.value) applyCssVarsFromSettings(settings.value)

  connectWebSocket()
})
</script>

<template>
  <div class="ripples">
    <div
      v-for="r in clickRipples"
      :key="r.id"
      class="ripple"
      :class="`btn-${r.btn}`"
      :style="{ left: r.x + 'px', top: r.y + 'px' }"
    ></div>
  </div>

  <div class="overlay">
    <transition name="wrapper-fade">
      <div v-if="events.length" class="events-wrapper">
        <transition-group name="fade" tag="div" class="events">
          <div
            v-for="e in events"
            :key="e.id"
            class="event-wrapper"
          >
            <div
              class="event"
              :class="getEventClass(e)"
              :data-event-id="e.id"
            >
              <template v-if="e.type === 'keyboard'">
                {{ formatWithModifiers(e) }}
              </template>
              <template v-else-if="e.type === 'wheel'">
                Scroll {{ formatWithModifiers(e) }}
              </template>
              <template v-else-if="e.type === 'mousedown'">
                {{ formatWithModifiers(e) }} Click
              </template>
              <template v-else-if="e.type === 'dblclick'">
                Double {{ formatWithModifiers(e) }} Click
              </template>
              <template v-if="e.count && e.count > 1">
                &nbsp;x{{ e.count }}
              </template>
            </div>
          </div>
        </transition-group>
      </div>
    </transition>
  </div>
</template>
