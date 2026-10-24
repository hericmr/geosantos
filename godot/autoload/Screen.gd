extends Node
## Ajusta la resolución base a la orientación: 720x1280 en vertical y 1280x720 en
## horizontal, para que la interfaz no se encoja al girar el celular o en desktop.

const PORTRAIT := Vector2i(720, 1280)
const LANDSCAPE := Vector2i(1280, 720)


func _ready() -> void:
	get_window().size_changed.connect(_update)
	_update()


func _update() -> void:
	var size := get_window().size
	var base := LANDSCAPE if size.x > size.y else PORTRAIT
	if get_window().content_scale_size != base:
		get_window().content_scale_size = base
