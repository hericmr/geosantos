extends Node2D
## Partida (fase 1): navegar por el mapa, colocar el pin y confirmar.

@onready var camera: MapCamera = $MapCamera
@onready var map: SantosMap = $SantosMap
@onready var gestures: MapGestures = $MapGestures
@onready var pin: Pin = $Pin
@onready var hint_label: Label = %HintLabel
@onready var result_panel: PanelContainer = %ResultPanel
@onready var result_label: Label = %ResultLabel
@onready var confirm_button: Button = %ConfirmButton

## Radio (px de pantalla) alrededor de la cabeza del pin para poder arrastrarlo.
const PIN_GRAB_RADIUS := 60.0

var _dragging_pin := false
## Diferencia entre el dedo y la punta del pin al empezar a arrastrarlo.
var _pin_grab := Vector2.ZERO


func _ready() -> void:
	camera.zoom_changed.connect(_on_zoom_changed)
	camera.setup(Data.play_bounds, Data.bounds)
	pin.hide()
	result_panel.hide()
	confirm_button.disabled = true
	hint_label.text = "Toque no mapa para marcar"

	gestures.tapped.connect(_on_tapped)
	gestures.drag_started.connect(_on_drag_started)
	gestures.dragged.connect(_on_dragged)
	gestures.drag_ended.connect(_on_drag_ended)
	gestures.pinched.connect(_on_pinched)
	gestures.zoomed.connect(func(center: Vector2, factor: float) -> void: camera.zoom_at(center, factor))
	gestures.panned.connect(func(delta: Vector2) -> void: camera.pan_screen(delta))
	confirm_button.pressed.connect(_on_confirm)


func _on_zoom_changed(z: float) -> void:
	map.set_view_zoom(z)
	pin.set_view_zoom(z)


func _on_tapped(pos: Vector2) -> void:
	camera.stop()
	_place_pin(camera.screen_to_world(pos))
	pin.drop()


func _on_drag_started(pos: Vector2) -> void:
	camera.stop()
	var pin_screen := camera.world_to_screen(pin.position)
	_dragging_pin = pin.visible and pos.distance_to(pin_screen + pin.grab_offset()) <= PIN_GRAB_RADIUS
	_pin_grab = pin_screen - pos


func _on_dragged(pos: Vector2, delta: Vector2) -> void:
	if _dragging_pin:
		_place_pin(camera.screen_to_world(pos + _pin_grab))
	else:
		camera.pan_screen(delta)


func _on_drag_ended(velocity: Vector2) -> void:
	if _dragging_pin:
		_dragging_pin = false
	else:
		camera.fling(velocity)


func _on_pinched(center: Vector2, factor: float, pan: Vector2) -> void:
	camera.stop()
	camera.pan_screen(pan)
	camera.zoom_at(center, factor)


func _place_pin(world_pos: Vector2) -> void:
	pin.position = world_pos.clamp(Data.play_bounds.position, Data.play_bounds.end)
	pin.show()
	confirm_button.disabled = false
	hint_label.text = "Arraste o marcador para ajustar"
	result_panel.hide()
	map.clear_highlights()


func _on_confirm() -> void:
	var latlon := Data.world_to_latlon(pin.position)
	var neighborhood := Data.neighborhood_at(pin.position)
	result_label.text = "%s\n%.5f, %.5f" % [
		neighborhood if neighborhood != "" else "Fora dos bairros",
		latlon.x, latlon.y,
	]
	result_panel.show()
	if neighborhood != "":
		map.highlight(neighborhood, Color("7ccf6b"))
