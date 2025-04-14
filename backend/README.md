# Keysee Backend

Keysee is a real-time keyboard and mouse input visualization tool.
This backend captures input events on Windows and streams them to a client via WebSocket.

## Features
- Tracks keyboard input, mouse clicks, and scroll wheel movements
- Detects modifier keys: Ctrl, Alt, Shift, Win

## Run
```bash
go mod tidy
go run .
```

## Build
```bash
go build -o ../frontend/keysee-backend.exe .
```

## Notes
- The server listens on ws://localhost:12834
- Only one client can connect to the WebSocket server at a time
- Windows-only (uses low-level Windows API hooks)