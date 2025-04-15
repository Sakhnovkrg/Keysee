export interface UseWebSocketOptions {
  url: string
  onMessage: (data: string) => void
  reconnectDelay?: number
}

export function useWebSocket({ url, onMessage, reconnectDelay = 1000 }: UseWebSocketOptions) {
  let socket: WebSocket | null = null

  function connect() {
    socket = new WebSocket(url)

    socket.onmessage = (msg) => {
      onMessage(msg.data)
    }

    socket.onclose = () => {
      console.warn(`[WebSocket] Disconnected. Reconnecting in ${reconnectDelay}ms...`)
      setTimeout(connect, reconnectDelay)
    }

    socket.onerror = (err) => {
      console.error("[WebSocket] Error:", err)
    }
  }

  connect()

  return {
    disconnect() {
      socket?.close()
    },
    isConnected: () => socket?.readyState === WebSocket.OPEN
  }
}
