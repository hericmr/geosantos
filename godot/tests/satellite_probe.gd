extends Node2D
## Prueba visual y de rendimiento de la capa de satélite (abre una ventana unos segundos):
##   godot --path godot res://tests/satellite_probe.tscn
## Guarda capturas en user:// y muestra tiempos de frame y cantidad de tiles.

const OUT_DIR := "user://satellite_probe"

@onready var camera: Camera2D = $Camera2D
@onready var map: SantosMap = $SantosMap

var _frame_times: Array[float] = []


func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(OUT_DIR)
	var view := get_viewport_rect().size
	var b := Data.bounds
	await _shot("1_visao_geral", b.get_center(), minf(view.x / b.size.x, view.y / b.size.y) * 0.95)
	var gonzaga: Dictionary = Data.neighborhoods.filter(func(n): return n.name == "Gonzaga")[0]
	await _shot("2_gonzaga", gonzaga.centroid, 1.2)
	await _shot("3_rua", gonzaga.centroid, 3.0)
	var layer: SatelliteLayer = map.get_children().filter(func(c): return c is SatelliteLayer)[0]
	_frame_times.sort()
	var avg := 0.0
	for t in _frame_times:
		avg += t
	avg /= _frame_times.size()
	print("frames: %d  médio %.1f ms  p95 %.1f ms  máx %.1f ms" % [
		_frame_times.size(), avg, _frame_times[int(_frame_times.size() * 0.95)], _frame_times[-1]])
	print("tiles na memória: %d" % layer._tiles.size())
	print("capturas em: ", ProjectSettings.globalize_path(OUT_DIR))
	get_tree().quit()


func _process(delta: float) -> void:
	_frame_times.append(delta * 1000.0)


func _shot(name: String, center: Vector2, z: float) -> void:
	camera.position = center
	camera.zoom = Vector2(z, z)
	map.set_view_zoom(z)
	await get_tree().create_timer(5.0).timeout
	get_viewport().get_texture().get_image().save_png("%s/%s.png" % [OUT_DIR, name])
