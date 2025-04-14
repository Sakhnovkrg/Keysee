package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"syscall"
	"time"
	"unsafe"
)

func ensureSingleInstance(port int) bool {
	addr := fmt.Sprintf("127.0.0.1:%d", port)
	conn, err := net.Dial("tcp", addr)
	if err == nil {
		conn.Close()
		return false
	}

	return true
}

func main() {
	if !ensureSingleInstance(12834) {
		log.Println("Another instance is already running.")
		return
	}

	fmt.Println("Starting Keysee WebSocket hook server on :12834")

	go handleMessages()

	http.HandleFunc("/ws", handleConnections)
	go func() {
		log.Fatal(http.ListenAndServe(":12834", nil))
	}()

	hookProcKeyboard := syscall.NewCallback(KeyboardProc)
	hHookKeyboard, _, _ := procSetWindowsHookEx.Call(
		uintptr(WH_KEYBOARD_LL),
		hookProcKeyboard,
		0, 0)
	if hHookKeyboard == 0 {
		log.Println("Failed to set keyboard hook")
		return
	}

	hookProcMouse := syscall.NewCallback(MouseProc)
	hHookMouse, _, _ := procSetWindowsHookEx.Call(
		uintptr(WH_MOUSE_LL),
		hookProcMouse,
		0, 0)
	if hHookMouse == 0 {
		log.Println("Failed to set mouse hook")
		return
	}

	var msg struct {
		hwnd    uintptr
		message uint32
		wParam  uintptr
		lParam  uintptr
		time    uint32
		pt      struct{ x, y int32 }
	}

loop:
	for {
		select {
		case <-shutdownChan:
			log.Println("Shutting down from WebSocket command")
			break loop
		default:
			procGetMessageW.Call(uintptr(unsafe.Pointer(&msg)), 0, 0, 0)
			procTranslateMessage.Call(uintptr(unsafe.Pointer(&msg)))
			procDispatchMessage.Call(uintptr(unsafe.Pointer(&msg)))
			time.Sleep(10 * time.Millisecond)
		}
	}
}
