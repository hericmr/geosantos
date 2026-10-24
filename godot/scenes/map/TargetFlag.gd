class_name TargetFlag
extends AnimatedSprite2D
## Bandera animada que marca la respuesta correcta (sprite del juego React).

const FRAME_COUNT := 16
## Base del asta dentro del frame de 256 px.
const POLE_BASE := Vector2(172, 212)
const SCREEN_SCALE := 0.9


func _ready() -> void:
	var frames := SpriteFrames.new()
	frames.set_animation_loop("default", false)
	frames.set_animation_speed("default", 24.0)
	for i in range(1, FRAME_COUNT + 1):
		frames.add_frame("default", load("res://assets/sprites/flag/%d.png" % i))
	sprite_frames = frames
	centered = false
	offset = -POLE_BASE
	hide()


func set_view_zoom(z: float) -> void:
	scale = Vector2.ONE * SCREEN_SCALE / z


func plant(world_pos: Vector2) -> void:
	position = world_pos
	show()
	frame = 0
	play("default")
