class_name Geo
## Conversión entre coordenadas del mundo (metros) y lat/lon, y distancias reales.
## El origen lo define Data al cargar los barrios.

const EARTH_RADIUS_M := 6371000.0
const M_PER_DEG_LAT := 110540.0
const M_PER_DEG_LON := 111320.0

static var origin_lat := 0.0
static var origin_lon := 0.0


## Distancia real en metros entre dos puntos lat/lon (haversine).
static func distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
	var dlat := deg_to_rad(lat2 - lat1)
	var dlon := deg_to_rad(lon2 - lon1)
	var a := sin(dlat / 2) ** 2 + cos(deg_to_rad(lat1)) * cos(deg_to_rad(lat2)) * sin(dlon / 2) ** 2
	return 2.0 * EARTH_RADIUS_M * asin(sqrt(a))


## Posición del mundo (metros) -> Vector2(lat, lon).
static func world_to_latlon(pos: Vector2) -> Vector2:
	var k_lon := M_PER_DEG_LON * cos(deg_to_rad(origin_lat))
	return Vector2(origin_lat - pos.y / M_PER_DEG_LAT, origin_lon + pos.x / k_lon)


## Distancia real en metros entre dos posiciones del mundo.
static func world_distance_m(a: Vector2, b: Vector2) -> float:
	var la := world_to_latlon(a)
	var lb := world_to_latlon(b)
	return distance_m(la.x, la.y, lb.x, lb.y)
