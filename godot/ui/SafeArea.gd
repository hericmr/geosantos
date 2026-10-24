extends MarginContainer
## Margen que respeta el notch y la barra de gestos en el celular.

const BASE_MARGIN := 24


func _ready() -> void:
	get_viewport().size_changed.connect(_update)
	_update()


func _update() -> void:
	var inset := {"left": 0.0, "top": 0.0, "right": 0.0, "bottom": 0.0}
	if OS.has_feature("mobile"):
		var safe := DisplayServer.get_display_safe_area()
		var win := Vector2(DisplayServer.window_get_size())
		var k := get_viewport_rect().size / win
		inset.left = safe.position.x * k.x
		inset.top = safe.position.y * k.y
		inset.right = (win.x - safe.end.x) * k.x
		inset.bottom = (win.y - safe.end.y) * k.y
	for side: String in inset:
		add_theme_constant_override("margin_" + side, BASE_MARGIN + int(inset[side]))
