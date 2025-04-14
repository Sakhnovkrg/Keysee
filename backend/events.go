package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan interface{})
var shutdownChan = make(chan struct{})

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	if len(clients) >= 1 {
		log.Println("WebSocket rejected: only one client allowed")
		conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"only one client allowed"}`))
		conn.Close()
		return
	}

	log.Println("WebSocket connected")
	clients[conn] = true
	defer func() {
		delete(clients, conn)
		conn.Close()
		log.Println("WebSocket disconnected")
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var incoming map[string]interface{}
		if err := json.Unmarshal(msg, &incoming); err != nil {
			continue
		}
		if cmd, ok := incoming["command"]; ok {
			if cmdStr, ok := cmd.(string); ok && cmdStr == "shutdown" {
				log.Println("Shutdown command received from WebSocket")
				close(shutdownChan)
				break
			}
		}
	}
}

func handleMessages() {
	for event := range broadcast {
		msg, err := json.Marshal(event)
		if err != nil {
			log.Println("Marshal error:", err)
			continue
		}

		log.Printf("Broadcasting message: %s\n", string(msg))

		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Println("Write error:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func Emit(event interface{}) {
	broadcast <- event
}
