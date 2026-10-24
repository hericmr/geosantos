extends Node
## Carga los barrios y lugares generados por scripts/export_godot_data.py.

const BAIRROS_PATH := "res://data/bairros.json"
const PLACES_PATH := "res://data/places.json"

## Rect2 en metros que contiene todos los barrios.
var bounds: Rect2
## Área jugable: barrios + lugares fuera de la isla (São Vicente, Guarujá, continente).
var play_bounds: Rect2
## [{ name: String, centroid: Vector2, area_m2: float, polygon: PackedVector2Array }]
var neighborhoods: Array[Dictionary] = []
## [{ id, name, category, description, address, image_url, lat, lon, pos: Vector2 }]
var places: Array[Dictionary] = []


func _ready() -> void:
	_load_neighborhoods()
	_load_places()
	play_bounds = bounds
	for p in places:
		play_bounds = play_bounds.expand(p.pos)
	play_bounds = play_bounds.grow(300.0)


func _read_json(path: String) -> Dictionary:
	var text := FileAccess.get_file_as_string(path)
	var parsed: Variant = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		push_error("No se pudo leer %s" % path)
		return {}
	return parsed


func _load_neighborhoods() -> void:
	var d := _read_json(BAIRROS_PATH)
	if d.is_empty():
		return
	Geo.origin_lat = d.origin.lat
	Geo.origin_lon = d.origin.lon
	var b: Dictionary = d.bounds
	bounds = Rect2(b.min_x, b.min_y, b.max_x - b.min_x, b.max_y - b.min_y)
	for n: Dictionary in d.neighborhoods:
		var poly := PackedVector2Array()
		for p: Array in n.polygon:
			poly.append(Vector2(p[0], p[1]))
		if Geometry2D.triangulate_polygon(poly).is_empty():
			push_warning("Polígono inválido: %s" % n.name)
		neighborhoods.append({
			"name": n.name,
			"centroid": Vector2(n.centroid[0], n.centroid[1]),
			"area_m2": n.area_m2,
			"polygon": poly,
		})


func _load_places() -> void:
	var d := _read_json(PLACES_PATH)
	for p: Dictionary in d.get("places", []):
		p.pos = Vector2(p.pos[0], p.pos[1])
		places.append(p)


## Nombre del barrio que contiene la posición, o "" si cae fuera de todos.
func neighborhood_at(pos: Vector2) -> String:
	for n in neighborhoods:
		if Geometry2D.is_point_in_polygon(pos, n.polygon):
			return n.name
	return ""
