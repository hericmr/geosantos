class_name SatelliteLayer
extends Node2D
## Imagen de satélite (Esri World Imagery, la misma del juego React) cargada por tiles.
## Para no afectar el rendimiento:
## - una base de baja resolución cubre toda el área jugable y nunca se descarga;
## - encima se cargan solo los tiles visibles, con el nivel de detalle del zoom actual;
## - descargas simultáneas y tiempo de decodificación por frame limitados;
## - caché LRU de tiles de detalle y tope de tiles por vista.

const URL := "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/%d/%d/%d"
const ATTRIBUTION := "Imagem: Esri, Maxar, Earthstar Geographics"
const BASE_ZOOM := 13
const MAX_ZOOM := 18
const MAX_CONCURRENT := 6
const MAX_DETAIL_TILES := 120
## Tiempo máximo por frame decodificando imágenes (siempre al menos una).
const DECODE_BUDGET_US := 4000
## Si una vista necesita más tiles que esto, se baja un nivel de detalle.
const MAX_TILES_PER_VIEW := 70
const UPDATE_INTERVAL := 0.15
## Metros por píxel de tile en el ecuador con zoom 0 (Web Mercator).
const EQUATOR_M_PER_PX := 156543.03392
## Sesgo del nivel de detalle: > 0 más nítido (más tiles), < 0 más liviano.
const DETAIL_BIAS := 0.2
## Margen alrededor de la vista que también se carga (fracción del tamaño visible).
const PREFETCH := 0.15

## clave "z/x/y" -> Sprite2D
var _tiles: Dictionary = {}
## clave -> último instante (ms) en que estuvo visible
var _last_seen: Dictionary = {}
## claves de la capa base (no se descargan nunca)
var _base: Dictionary = {}
var _queue: Array[String] = []
var _wanted: Dictionary = {}
var _loading: Dictionary = {}
var _decode: Array = []
var _free_http: Array[HTTPRequest] = []
var _timer := 0.0
var _last_state := ""


func _ready() -> void:
	z_index = -50
	_add_attribution()
	for i in MAX_CONCURRENT:
		var http := HTTPRequest.new()
		http.accept_gzip = false
		http.timeout = 15.0
		add_child(http)
		_free_http.append(http)
	for key in _keys_for(Data.play_bounds, BASE_ZOOM):
		_base[key] = true
		_queue.append(key)


func _process(delta: float) -> void:
	_timer += delta
	if _timer >= UPDATE_INTERVAL:
		_timer = 0.0
		_update_wanted()
	_pump_downloads()
	_decode_some()


## Nivel de zoom de tiles que da ~1 píxel de tile por píxel real de pantalla.
func _detail_zoom(camera: Camera2D) -> int:
	var device_px_per_base := float(get_window().size.x) / get_viewport_rect().size.x
	var screen_m_per_px := 1.0 / (camera.zoom.x * maxf(device_px_per_base, 1.0))
	var m_per_px_z0 := EQUATOR_M_PER_PX * cos(deg_to_rad(Geo.origin_lat))
	return clampi(floori(log(m_per_px_z0 / screen_m_per_px) / log(2.0) + DETAIL_BIAS), BASE_ZOOM, MAX_ZOOM)


func _update_wanted() -> void:
	var camera := get_viewport().get_camera_2d()
	if camera == null:
		return
	var size := get_viewport_rect().size / camera.zoom
	var view := Rect2(camera.get_screen_center_position() - size / 2.0, size)
	var z := _detail_zoom(camera)
	var state := "%d|%s" % [z, view.grow(size.x * 0.05)]
	var now := Time.get_ticks_msec()
	if state == _last_state:
		for key: String in _wanted:
			_last_seen[key] = now
		return
	_last_state = state

	_wanted.clear()
	if z > BASE_ZOOM:
		var center := view.get_center()
		var area := view.grow(maxf(size.x, size.y) * PREFETCH)
		var keys := _keys_for(area, z)
		while keys.size() > MAX_TILES_PER_VIEW and z > BASE_ZOOM + 1:
			z -= 1
			keys = _keys_for(area, z)
		# Primero los tiles del centro de la pantalla.
		keys.sort_custom(func(a: String, b: String) -> bool:
			return _tile_rect(a).get_center().distance_squared_to(center) \
				< _tile_rect(b).get_center().distance_squared_to(center))
		for key in keys:
			_wanted[key] = true
			_last_seen[key] = now
			if not _tiles.has(key) and not _loading.has(key) and not _queue.has(key):
				_queue.append(key)
	# Lo que ya no se ve sale de la cola (la base siempre se mantiene).
	_queue = _queue.filter(func(key: String) -> bool: return _base.has(key) or _wanted.has(key))
	_evict()


func _pump_downloads() -> void:
	while not _queue.is_empty() and not _free_http.is_empty():
		var key: String = _queue.pop_front()
		var http: HTTPRequest = _free_http.pop_back()
		var parts := key.split("/")
		var err := http.request(URL % [int(parts[0]), int(parts[2]), int(parts[1])])
		if err != OK:
			_free_http.append(http)
			continue
		_loading[key] = http
		http.request_completed.connect(_on_downloaded.bind(key, http), CONNECT_ONE_SHOT)


func _on_downloaded(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray,
		key: String, http: HTTPRequest) -> void:
	_loading.erase(key)
	_free_http.append(http)
	if result == HTTPRequest.RESULT_SUCCESS and code == 200 and body.size() > 0:
		_decode.append([key, body])


func _decode_some() -> void:
	var start := Time.get_ticks_usec()
	while not _decode.is_empty():
		if Time.get_ticks_usec() - start > DECODE_BUDGET_US:
			return
		var item: Array = _decode.pop_front()
		var key: String = item[0]
		if not _base.has(key) and not _wanted.has(key):
			continue
		var image := Image.new()
		if image.load_jpg_from_buffer(item[1]) != OK and image.load_png_from_buffer(item[1]) != OK:
			continue
		var sprite := Sprite2D.new()
		sprite.texture = ImageTexture.create_from_image(image)
		sprite.centered = false
		var rect := _tile_rect(key)
		sprite.position = rect.position
		sprite.scale = rect.size / Vector2(image.get_size())
		# Los tiles más detallados se dibujan encima de los más gruesos.
		sprite.z_index = int(key.get_slice("/", 0))
		add_child(sprite)
		_tiles[key] = sprite


func _evict() -> void:
	var detail := _tiles.keys().filter(func(key: String) -> bool: return not _base.has(key))
	if detail.size() <= MAX_DETAIL_TILES:
		return
	detail.sort_custom(func(a: String, b: String) -> bool: return _last_seen.get(a, 0) < _last_seen.get(b, 0))
	for i in detail.size() - MAX_DETAIL_TILES:
		var key: String = detail[i]
		if _wanted.has(key):
			continue
		_tiles[key].queue_free()
		_tiles.erase(key)
		_last_seen.erase(key)


## Atribución exigida por Esri, en una esquina de la pantalla.
func _add_attribution() -> void:
	var layer := CanvasLayer.new()
	layer.layer = 3
	var label := Label.new()
	label.text = ATTRIBUTION
	label.add_theme_font_size_override("font_size", 14)
	label.add_theme_color_override("font_color", Color(1, 1, 1, 0.75))
	label.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.6))
	label.add_theme_constant_override("outline_size", 4)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	label.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	label.grow_vertical = Control.GROW_DIRECTION_BEGIN
	label.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	label.offset_left = -8.0
	label.offset_right = -8.0
	label.offset_top = -4.0
	label.offset_bottom = -4.0
	layer.add_child(label)
	add_child(layer)


# --- Matemática de tiles (Web Mercator) ---

static func _lon_to_x(lon: float, n: float) -> float:
	return (lon + 180.0) / 360.0 * n


static func _lat_to_y(lat: float, n: float) -> float:
	var r := deg_to_rad(lat)
	return (1.0 - log(tan(r) + 1.0 / cos(r)) / PI) / 2.0 * n


static func _x_to_lon(x: float, n: float) -> float:
	return x / n * 360.0 - 180.0


static func _y_to_lat(y: float, n: float) -> float:
	return rad_to_deg(atan(sinh(PI * (1.0 - 2.0 * y / n))))


func _keys_for(world_rect: Rect2, z: int) -> Array[String]:
	var n := float(1 << z)
	var nw := Geo.world_to_latlon(world_rect.position)
	var se := Geo.world_to_latlon(world_rect.end)
	var x0 := floori(_lon_to_x(nw.y, n))
	var x1 := floori(_lon_to_x(se.y, n))
	var y0 := floori(_lat_to_y(nw.x, n))
	var y1 := floori(_lat_to_y(se.x, n))
	var keys: Array[String] = []
	for x in range(x0, x1 + 1):
		for y in range(y0, y1 + 1):
			keys.append("%d/%d/%d" % [z, x, y])
	return keys


## Rectángulo del mundo (metros) que cubre un tile.
func _tile_rect(key: String) -> Rect2:
	var parts := key.split("/")
	var n := float(1 << int(parts[0]))
	var x := float(parts[1])
	var y := float(parts[2])
	var top_left := Geo.latlon_to_world(_y_to_lat(y, n), _x_to_lon(x, n))
	var bottom_right := Geo.latlon_to_world(_y_to_lat(y + 1.0, n), _x_to_lon(x + 1.0, n))
	return Rect2(top_left, bottom_right - top_left)
