extends Node2D
## Pantalla inicial temporal (fase 0): muestra el mapa entero ajustado a la pantalla.

const MAP_MARGIN := 0.9

@onready var camera: Camera2D = $Camera2D


func _ready() -> void:
	get_viewport().size_changed.connect(_fit_camera)
	_fit_camera()


func _fit_camera() -> void:
	var view := get_viewport_rect().size
	var b := Data.bounds
	camera.position = b.get_center()
	var z := minf(view.x / b.size.x, view.y / b.size.y) * MAP_MARGIN
	camera.zoom = Vector2(z, z)
