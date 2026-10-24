extends Control
## Panel de opciones: volumen de música y efectos, vibración.

signal closed

@onready var music_slider: HSlider = %MusicSlider
@onready var sfx_slider: HSlider = %SfxSlider
@onready var vibration_check: CheckButton = %VibrationCheck
@onready var back_button: Button = %BackButton


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	music_slider.value = Save.get_value("music_volume")
	sfx_slider.value = Save.get_value("sfx_volume")
	vibration_check.button_pressed = Save.get_value("vibration")
	music_slider.value_changed.connect(func(v: float) -> void:
		Save.set_value("music_volume", v)
		Sfx.apply_volumes())
	sfx_slider.value_changed.connect(func(v: float) -> void:
		Save.set_value("sfx_volume", v)
		Sfx.apply_volumes())
	sfx_slider.drag_ended.connect(func(_changed: bool) -> void: Sfx.play("success"))
	vibration_check.toggled.connect(func(on: bool) -> void:
		Save.set_value("vibration", on)
		if on:
			Sfx.vibrate(60))
	back_button.pressed.connect(func() -> void:
		closed.emit()
		queue_free())
