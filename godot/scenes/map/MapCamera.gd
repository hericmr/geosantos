class_name MapCamera
extends Camera2D
## Cámara del mapa: paneo, zoom anclado a un punto, inercia, límites y vuelos animados.
## El mundo está en metros; zoom = píxeles por metro.

signal zoom_changed(zoom: float)

## Cuánto puede alejarse respecto del zoom que muestra todo el mapa.
const FIT_MARGIN := 0.92
## Zoom máximo: ~250 m de ancho en una pantalla de 720 px.
const MAX_ZOOM := 3.0
## Frenado exponencial de la inercia (1/s).
const FRICTION := 5.0
const MIN_FLING_SPEED := 20.0
const MAX_FLING_SPEED := 3000.0

## El centro de la cámara no puede salir de este rectángulo.
var limits := Rect2()
var min_zoom := 0.01
var _velocity := Vector2.ZERO
var _tween: Tween


## limits: área por la que se puede mover la cámara; focus: lo que se ve al empezar.
func setup(world_limits: Rect2, focus: Rect2) -> void:
	limits = world_limits
	get_viewport().size_changed.connect(_on_viewport_resized)
	_update_min_zoom()
	position = _clamped(focus.get_center())
	set_zoom_level(fit_zoom(focus))


func fit_zoom(rect: Rect2) -> float:
	var view := get_viewport_rect().size
	return minf(view.x / rect.size.x, view.y / rect.size.y) * FIT_MARGIN


func set_zoom_level(z: float) -> void:
	if not is_finite(z):
		return
	z = clampf(z, min_zoom, MAX_ZOOM)
	zoom = Vector2(z, z)
	zoom_changed.emit(z)


func screen_to_world(p: Vector2) -> Vector2:
	return position + (p - get_viewport_rect().size / 2.0) / zoom.x


func world_to_screen(p: Vector2) -> Vector2:
	return (p - position) * zoom.x + get_viewport_rect().size / 2.0


func pan_screen(delta: Vector2) -> void:
	if not delta.is_finite():
		return
	position -= delta / zoom.x
	_clamp_position()


func zoom_at(screen_pos: Vector2, factor: float) -> void:
	if not is_finite(factor) or factor <= 0.0:
		return
	var before := screen_to_world(screen_pos)
	set_zoom_level(zoom.x * factor)
	position += before - screen_to_world(screen_pos)
	_clamp_position()


func fling(velocity: Vector2) -> void:
	if not velocity.is_finite() or velocity.length() < MIN_FLING_SPEED:
		_velocity = Vector2.ZERO
		return
	_velocity = velocity.limit_length(MAX_FLING_SPEED)


func stop() -> void:
	_velocity = Vector2.ZERO
	if _tween:
		_tween.kill()


## Vuela hasta una posición del mundo con un zoom dado.
func fly_to(world_pos: Vector2, target_zoom: float, duration := 0.8) -> Tween:
	stop()
	_tween = create_tween().set_parallel().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
	_tween.tween_property(self, "position", world_pos, duration)
	_tween.tween_method(set_zoom_level, zoom.x, clampf(target_zoom, min_zoom, MAX_ZOOM), duration)
	return _tween


## Vuela para que el rectángulo del mundo quede dentro de una zona de la pantalla
## (por ejemplo, la parte que no tapa la interfaz).
func fly_to_rect(rect: Rect2, screen_area: Rect2, max_zoom := MAX_ZOOM, duration := 0.8) -> Tween:
	var z := minf(screen_area.size.x / rect.size.x, screen_area.size.y / rect.size.y) * FIT_MARGIN
	z = clampf(z, min_zoom, minf(max_zoom, MAX_ZOOM))
	# El centro del rect debe caer en el centro de la zona, no en el de la pantalla.
	var offset := (screen_area.get_center() - get_viewport_rect().size / 2.0) / z
	return fly_to(rect.get_center() - offset, z, duration)


func _process(delta: float) -> void:
	if _velocity == Vector2.ZERO:
		return
	pan_screen(_velocity * delta)
	_velocity *= exp(-FRICTION * delta)
	if _velocity.length() < MIN_FLING_SPEED:
		_velocity = Vector2.ZERO


func _on_viewport_resized() -> void:
	_update_min_zoom()
	set_zoom_level(zoom.x)
	_clamp_position()


func _update_min_zoom() -> void:
	min_zoom = fit_zoom(limits)


func _clamped(p: Vector2) -> Vector2:
	return p.clamp(limits.position, limits.end)


func _clamp_position() -> void:
	position = _clamped(position)
