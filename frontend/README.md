# Keysee Frontend

Keysee Frontend is a simple Electron + Vue 3 application for real-time visualization of keyboard and mouse input.
It provides a transparent on-screen overlay designed for tutorials, software demonstrations, and screen recordings.

The frontend connects to the Keysee Backend via WebSocket to receive input events..

## Features

- Minimal overlay displaying key presses, mouse clicks, and scroll actions
- Smooth animations for showing and hiding events
- Basic appearance customization

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes
- Expects keysee-backend.exe to be located in the project root directory.
- Runs only on Windows