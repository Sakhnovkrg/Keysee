# Keysee

![Keysee Logo](keysee-logo.svg)

**Keysee** is a free and open-source tool for Windows that displays real-time keyboard and mouse input on screen. 

![Showcase](showcase.gif)

## Why use Keysee?

During tutorials or live demos, it's not always clear what keys or buttons are being used.
Keysee provides simple, clear input visuals without distracting from the main content.

## Highlights

- Displays keys, mouse buttons, and scroll events
- Filters out noise (like repeated keys)
- Detects combos (e.g. Ctrl + Shift + Z)
- Customizable appearance
- Fully open source

## Download

[Windows](https://github.com/sakhnovkrg/keysee/releases)

## License

[MIT License](LICENSE)

## Project Structure

| Component  | Purpose                          | Tech Stack                               |
|------------|----------------------------------|------------------------------------------|
| `backend/` | Low-level input capture engine   | ![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white) |
| `frontend/`| Visual overlay application       | ![Electron](https://img.shields.io/badge/-Electron-47848F?logo=electron&logoColor=white) ![Vue](https://img.shields.io/badge/-Vue.js-4FC08D?logo=vue.js&logoColor=white) |
