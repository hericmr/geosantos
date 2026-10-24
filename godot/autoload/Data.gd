extends Node
## Carga los barrios y lugares generados por scripts/export_godot_data.py.

const BAIRROS_PATH := "res://data/bairros.json"
const PLACES_PATH := "res://data/places.json"
const EARTH_RADIUS_M := 6371000.0

var origin_lat: float
var origin_lon: float
## Rect2 en metros que contiene todos los barrios.
var bounds: Rect2
## [{ name: String, centroid: Vector2, area_m2: float, polygon: PackedVector2Array }]
var neighborhoods: Array[Dictionary] = []
## [{ id, name, category, description, address, image_url, lat, lon, pos: Vector2 }]
var places: Array[Dictionary] = []


func _ready() -> void:
	_load_neighborhoods()
	_load_places()


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
	origin_lat = d.origin.lat
	origin_lon = d.origin.lon
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


## Distancia real en metros entre dos puntos lat/lon (haversine).
static func distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
	var dlat := deg_to_rad(lat2 - lat1)
	var dlon := deg_to_rad(lon2 - lon1)
	var a := sin(dlat / 2) ** 2 + cos(deg_to_rad(lat1)) * cos(deg_to_rad(lat2)) * sin(dlon / 2) ** 2
	return 2.0 * EARTH_RADIUS_M * asin(sqrt(a))


## Convierte una posición del mundo (metros) de vuelta a lat/lon.
func world_to_latlon(pos: Vector2) -> Vector2:
	var k_lon := 111320.0 * cos(deg_to_rad(origin_lat))
	return Vector2(origin_lat - pos.y / 110540.0, origin_lon + pos.x / k_lon)
