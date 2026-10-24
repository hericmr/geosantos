extends CanvasLayer
## Cambio de escena con fundido.

const DURATION := 0.25
const COLOR := Color(0.04, 0.15, 0.24, 1)

var _rect := ColorRect.new()
var _busy := false


func _ready() -> void:
	layer = 100
	process_mode = Node.PROCESS_MODE_ALWAYS
	_rect.color = COLOR
	_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_rect.modulate.a = 0.0
	add_child(_rect)


func go(scene_path: String) -> void:
	if _busy:
		return
	_busy = true
	_rect.mouse_filter = Control.MOUSE_FILTER_STOP
	await create_tween().tween_property(_rect, "modulate:a", 1.0, DURATION).finished
	get_tree().paused = false
	get_tree().change_scene_to_file(scene_path)
	await get_tree().process_frame
	await create_tween().tween_property(_rect, "modulate:a", 0.0, DURATION).finished
	_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_busy = false
