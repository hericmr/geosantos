extends Node2D
## Fondo de los menús: el mapa de Santos con una deriva lenta de la cámara.

const DRIFT_RADIUS_M := 900.0
const DRIFT_SPEED := 0.12

@onready var camera: Camera2D = $Camera2D
@onready var map: SantosMap = $SantosMap

var _t := 0.0


func _ready() -> void:
	get_viewport().size_changed.connect(_fit)
	_fit()


func _fit() -> void:
	var view := get_viewport_rect().size
	var b := Data.bounds
	var z := minf(view.x / b.size.x, view.y / b.size.y) * 1.15
	camera.zoom = Vector2(z, z)
	map.set_view_zoom(z)


func _process(delta: float) -> void:
	_t += delta * DRIFT_SPEED
	camera.position = Data.bounds.get_center() + Vector2(cos(_t), sin(_t * 0.7)) * DRIFT_RADIUS_M
