package main

import (
	"unsafe"
)

const (
	WH_MOUSE_LL    = 14
	WM_LBUTTONDOWN = 0x0201
	WM_LBUTTONUP   = 0x0202
	WM_RBUTTONDOWN = 0x0204
	WM_RBUTTONUP   = 0x0205
	WM_MBUTTONDOWN = 0x0207
	WM_MBUTTONUP   = 0x0208
	WM_MOUSEMOVE   = 0x0200
	WM_MOUSEWHEEL  = 0x020A
)

type MSLLHOOKSTRUCT struct {
	Pt          struct{ X, Y int32 }
	MouseData   uint32
	Flags       uint32
	Time        uint32
	DwExtraInfo uintptr
}

func MouseProc(nCode int, wParam uintptr, lParam uintptr) uintptr {
	if nCode != 0 {
		return CallNextHook(nCode, wParam, lParam)
	}

	mouse := (*MSLLHOOKSTRUCT)(unsafe.Pointer(lParam))
	x, y := mouse.Pt.X, mouse.Pt.Y
	mod := GetMouseModifiers()

	switch wParam {
	case WM_LBUTTONDOWN, WM_RBUTTONDOWN, WM_MBUTTONDOWN:
		event := MouseClickEvent{
			Type: "mousedown",
			MouseBaseEvent: MouseBaseEvent{
				X:         x,
				Y:         y,
				Modifiers: mod,
			},
			Btn: getMouseButton(wParam),
		}
		Emit(event)

	case WM_LBUTTONUP, WM_RBUTTONUP, WM_MBUTTONUP:
		event := MouseClickEvent{
			Type: "mouseup",
			MouseBaseEvent: MouseBaseEvent{
				X:         x,
				Y:         y,
				Modifiers: mod,
			},
			Btn: getMouseButton(wParam),
		}
		Emit(event)

	case WM_MOUSEWHEEL:
		delta := int16(mouse.MouseData >> 16)
		dir := "none"
		if delta > 0 {
			dir = "up"
		} else if delta < 0 {
			dir = "down"
		}
		event := MouseWheelEvent{
			Type: "wheel",
			MouseBaseEvent: MouseBaseEvent{
				X:         x,
				Y:         y,
				Modifiers: mod,
			},
			Direction: dir,
		}
		Emit(event)
	}

	return CallNextHook(nCode, wParam, lParam)
}

func getMouseButton(wParam uintptr) string {
	switch wParam {
	case WM_LBUTTONDOWN, WM_LBUTTONUP:
		return "left"
	case WM_RBUTTONDOWN, WM_RBUTTONUP:
		return "right"
	case WM_MBUTTONDOWN, WM_MBUTTONUP:
		return "middle"
	default:
		return ""
	}
}
