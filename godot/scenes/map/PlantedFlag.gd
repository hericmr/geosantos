class_name PlantedFlag
extends AnimatedSprite2D
## Animación de fincar la bandera, igual que en el juego React (Map.tsx):
## 16 frames a 25 fps; la bandera queda en el último frame hasta el fin de la ronda.

const FRAME_COUNT := 16
const FPS := 25.0
## En el juego React los sprites se dibujan en una caja de 122 px CSS ("object-fit: contain").
const REACT_BOX_PX := 122.0
## 1 px CSS de un celular de 375 px de ancho equivale a 720 / 375 px de nuestra resolución base.
const CSS_TO_BASE := 720.0 / 375.0

## Carpeta con los frames 1.png ... 16.png.
@export_dir var frames_dir := "res://assets/sprites/markerclick"
## Punto del frame (en px de la imagen original) que se clava en el mapa: la base del asta.
@export var anchor := Vector2(11.5, 75.0)

var _screen_scale := 1.0


func _ready() -> void:
	# Pixel art: sin suavizado al ampliar.
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var frames := SpriteFrames.new()
	frames.set_animation_loop("default", false)
	frames.set_animation_speed("default", FPS)
	for i in range(1, FRAME_COUNT + 1):
		frames.add_frame("default", load("%s/%d.png" % [frames_dir, i]))
	sprite_frames = frames
	centered = false
	offset = -anchor
	var size := frames.get_frame_texture("default", 0).get_size()
	_screen_scale = minf(REACT_BOX_PX / size.x, REACT_BOX_PX / size.y) * CSS_TO_BASE
	hide()


func set_view_zoom(z: float) -> void:
	scale = Vector2.ONE * _screen_scale / z


## Finca la bandera en la posición del mundo y espera a que termine la animación.
func plant(world_pos: Vector2) -> void:
	position = world_pos
	frame = 0
	show()
	play("default")
	await animation_finished
