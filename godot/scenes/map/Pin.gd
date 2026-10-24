class_name Pin
extends Node2D
## Marcador del jugador. La punta está en el origen; se dibuja en píxeles de pantalla
## (la escala compensa el zoom de la cámara) para tener siempre el mismo tamaño.

const HEAD_RADIUS := 20.0
const HEAD_Y := -52.0
const FILL := Color("e8483b")
const OUTLINE := Color("ffffff")
const SHADOW := Color(0, 0, 0, 0.28)

## Desplazamiento vertical de la animación de caída (px de pantalla).
var _drop := 0.0:
	set(value):
		_drop = value
		queue_redraw()


func set_view_zoom(z: float) -> void:
	scale = Vector2.ONE / z


## Punto (en px de pantalla, relativo a la punta) donde conviene agarrar el pin.
func grab_offset() -> Vector2:
	return Vector2(0, HEAD_Y)


func drop() -> void:
	_drop = -60.0
	create_tween().tween_property(self, "_drop", 0.0, 0.35) \
		.set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)


func _draw() -> void:
	draw_set_transform(Vector2.ZERO, 0, Vector2(1, 0.4))
	draw_circle(Vector2.ZERO, 10.0, SHADOW)
	draw_set_transform(Vector2(0, _drop))

	var head := Vector2(0, HEAD_Y)
	var body := PackedVector2Array([
		Vector2.ZERO,
		head + Vector2(-HEAD_RADIUS * 0.82, HEAD_RADIUS * 0.58),
		head + Vector2(HEAD_RADIUS * 0.82, HEAD_RADIUS * 0.58),
	])
	draw_circle(head, HEAD_RADIUS + 4.0, OUTLINE)
	draw_colored_polygon(PackedVector2Array([
		Vector2(0, 5),
		head + Vector2(-HEAD_RADIUS - 3.0, HEAD_RADIUS * 0.55),
		head + Vector2(HEAD_RADIUS + 3.0, HEAD_RADIUS * 0.55),
	]), OUTLINE)
	draw_colored_polygon(body, FILL)
	draw_circle(head, HEAD_RADIUS, FILL)
	draw_circle(head, HEAD_RADIUS * 0.38, OUTLINE)
