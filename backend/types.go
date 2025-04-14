package main

type Modifiers struct {
	Ctrl  bool `json:"ctrl"`
	Alt   bool `json:"alt"`
	Shift bool `json:"shift"`
	Win   bool `json:"win"`
}

type KeyEvent struct {
	Type      string    `json:"type"` // "keyboard"
	VK        uint32    `json:"vk"`
	Key       string    `json:"key"`
	Modifiers Modifiers `json:"modifiers"`
}

type MouseBaseEvent struct {
	X         int32     `json:"x"`
	Y         int32     `json:"y"`
	Modifiers Modifiers `json:"modifiers"`
}

type MouseClickEvent struct {
	MouseBaseEvent
	Type string `json:"type"`          // "mousedown" / "mouseup"
	Btn  string `json:"btn,omitempty"` // "left", "right", "middle"
}

type MouseWheelEvent struct {
	MouseBaseEvent
	Type      string `json:"type"`      // "wheel"
	Direction string `json:"direction"` // "up" / "down"
}
