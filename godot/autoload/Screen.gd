extends Node
## Orientación de la pantalla. El juego es horizontal (base 1280x720):
## - en el navegador del celular pide pantalla completa y bloquea la orientación
##   al primer toque (Android); donde no se puede (iPhone), muestra un aviso para girar;
## - en una ventana vertical (desktop angosto) usa base 720x1280 para que la interfaz no se encoja.

const LANDSCAPE := Vector2i(1280, 720)
const PORTRAIT := Vector2i(720, 1280)
const LOCK_LANDSCAPE_JS := """
(async () => {
	try {
		if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
		await screen.orientation.lock('landscape');
	} catch (e) {}
})();
"""

var _rotate_hint := CanvasLayer.new()
var _lock_requested := false


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_rotate_hint()
	get_window().size_changed.connect(_update)
	_update()


func is_mobile_web() -> bool:
	return OS.has_feature("web_android") or OS.has_feature("web_ios")


func _input(event: InputEvent) -> void:
	# Pantalla completa y bloqueo de orientación necesitan un gesto del usuario.
	if _lock_requested or not is_mobile_web():
		return
	if (event is InputEventScreenTouch or event is InputEventMouseButton) and event.pressed:
		_lock_requested = true
		JavaScriptBridge.eval(LOCK_LANDSCAPE_JS, true)


func _update() -> void:
	var size := get_window().size
	var portrait := size.y > size.x
	var base := PORTRAIT if portrait else LANDSCAPE
	if get_window().content_scale_size != base:
		get_window().content_scale_size = base
	_rotate_hint.visible = portrait and is_mobile_web()


func _build_rotate_hint() -> void:
	_rotate_hint.layer = 120
	_rotate_hint.visible = false
	add_child(_rotate_hint)
	var bg := ColorRect.new()
	bg.color = Color(0.04, 0.15, 0.24, 1)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_rotate_hint.add_child(bg)
	var label := Label.new()
	label.text = "Gire o celular\npara jogar na horizontal"
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 52)
	label.set_anchors_preset(Control.PRESET_FULL_RECT)
	_rotate_hint.add_child(label)
