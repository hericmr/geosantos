class_name MapGestures
extends Node
## Convierte toques y mouse en gestos de mapa: toque, arrastre, pinch y zoom.
## Las posiciones están en coordenadas del viewport.

signal tapped(pos: Vector2)
signal drag_started(pos: Vector2)
signal dragged(pos: Vector2, delta: Vector2)
signal drag_ended(velocity: Vector2)
signal pinched(center: Vector2, factor: float, pan: Vector2)
signal zoomed(center: Vector2, factor: float)
signal panned(delta: Vector2)

## Movimiento máximo (px) para que un toque siga contando como toque.
const TAP_SLOP := 14.0
const TAP_MAX_MS := 450
## Si el dedo se quedó quieto este tiempo antes de soltar, no hay inercia.
const FLING_IDLE_MS := 80
const WHEEL_STEP := 1.15
const MOUSE_INDEX := -1
## Tras un toque, el navegador manda eventos de mouse de compatibilidad; se ignoran.
const MOUSE_AFTER_TOUCH_MS := 800
const MIN_PINCH_DIST := 8.0
## La velocidad de la inercia se mide sobre los últimos movimientos de esta ventana.
const VELOCITY_WINDOW_US := 100_000
const MIN_VELOCITY_SPAN_S := 0.05

## índice del puntero -> posición actual
var _points: Dictionary = {}
var _start_pos := Vector2.ZERO
var _start_ms := 0
var _tap_candidate := false
var _dragging := false
## Tras un pinch, el dedo que queda no hace nada hasta soltarse (evita saltos).
var _ignore_until_release := false
var _pinch_dist := 0.0
var _pinch_center := Vector2.ZERO
## Muestras recientes del arrastre: [tiempo_us, posición]
var _samples: Array = []
var _last_move_us := 0
var _last_touch_ms := -100000


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		_last_touch_ms = Time.get_ticks_msec()
		if _points.has(MOUSE_INDEX):
			_points.erase(MOUSE_INDEX)
		_on_press(event.index, event.position, event.pressed)
	elif event is InputEventScreenDrag:
		_last_touch_ms = Time.get_ticks_msec()
		_on_move(event.index, event.position)
	elif event is InputEventMouseButton:
		# Un mismo dedo puede llegar como toque y como mouse; solo cuenta el toque.
		if _is_touch_mouse(event):
			return
		match event.button_index:
			MOUSE_BUTTON_LEFT:
				_on_press(MOUSE_INDEX, event.position, event.pressed)
			MOUSE_BUTTON_WHEEL_UP:
				if event.pressed:
					zoomed.emit(event.position, WHEEL_STEP)
			MOUSE_BUTTON_WHEEL_DOWN:
				if event.pressed:
					zoomed.emit(event.position, 1.0 / WHEEL_STEP)
	elif event is InputEventMouseMotion:
		if not _is_touch_mouse(event):
			_on_move(MOUSE_INDEX, event.position)
	elif event is InputEventMagnifyGesture:
		zoomed.emit(event.position, event.factor)
	elif event is InputEventPanGesture:
		panned.emit(-event.delta * 12.0)


func _is_touch_mouse(event: InputEvent) -> bool:
	return event.device == InputEvent.DEVICE_ID_EMULATION \
		or Time.get_ticks_msec() - _last_touch_ms < MOUSE_AFTER_TOUCH_MS


func _on_press(index: int, pos: Vector2, pressed: bool) -> void:
	if pressed:
		_points[index] = pos
		if _points.size() == 1:
			_start_pos = pos
			_start_ms = Time.get_ticks_msec()
			_tap_candidate = true
			_dragging = false
			_ignore_until_release = false
			_samples.clear()
		elif _points.size() == 2:
			_tap_candidate = false
			if _dragging:
				_dragging = false
				drag_ended.emit(Vector2.ZERO)
			_reset_pinch()
		return

	if not _points.has(index):
		return
	_points.erase(index)
	if _points.is_empty():
		if _tap_candidate and Time.get_ticks_msec() - _start_ms <= TAP_MAX_MS:
			tapped.emit(pos)
		elif _dragging:
			var idle_ms := (Time.get_ticks_usec() - _last_move_us) / 1000
			drag_ended.emit(Vector2.ZERO if idle_ms > FLING_IDLE_MS else _release_velocity())
		_dragging = false
		_ignore_until_release = false
	elif _points.size() == 1:
		_ignore_until_release = true
	else:
		_reset_pinch()


func _on_move(index: int, pos: Vector2) -> void:
	if not _points.has(index):
		return
	var prev: Vector2 = _points[index]
	_points[index] = pos
	if _ignore_until_release:
		return

	if _points.size() == 1:
		if not _dragging:
			if pos.distance_to(_start_pos) < TAP_SLOP:
				return
			_tap_candidate = false
			_dragging = true
			_last_move_us = Time.get_ticks_usec()
			drag_started.emit(_start_pos)
			prev = _start_pos
		_last_move_us = Time.get_ticks_usec()
		_samples.append([_last_move_us, pos])
		while _samples.size() > 2 and _last_move_us - _samples[0][0] > VELOCITY_WINDOW_US:
			_samples.pop_front()
		dragged.emit(pos, pos - prev)
	elif _points.size() == 2:
		var pts: Array = _points.values()
		var center: Vector2 = (pts[0] + pts[1]) / 2.0
		var dist: float = pts[0].distance_to(pts[1])
		if _pinch_dist >= MIN_PINCH_DIST and dist >= MIN_PINCH_DIST:
			pinched.emit(center, dist / _pinch_dist, center - _pinch_center)
		_pinch_dist = dist
		_pinch_center = center


func _release_velocity() -> Vector2:
	if _samples.size() < 2:
		return Vector2.ZERO
	var first: Array = _samples[0]
	var last: Array = _samples[-1]
	var span := maxf((last[0] - first[0]) / 1_000_000.0, MIN_VELOCITY_SPAN_S)
	return (last[1] - first[1]) / span


func _reset_pinch() -> void:
	_pinch_dist = 0.0
	if _points.size() >= 2:
		var pts: Array = _points.values()
		_pinch_center = (pts[0] + pts[1]) / 2.0
		_pinch_dist = pts[0].distance_to(pts[1])
