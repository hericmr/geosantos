class_name SantosMap
extends Node2D
## Dibuja los barrios de Santos a partir de Data.neighborhoods.
## Con la imagen de satélite activada, los barrios son solo bordes sobre la foto;
## sin ella, se pintan con colores planos.

const LAND_COLORS: Array[Color] = [Color("f3e3b5"), Color("eedaa4"), Color("f6e9c4"), Color("e9d29a")]
const SHADOW_COLOR := Color("174d72")
const SHADOW_OFFSET := Vector2(25, 40)
const BORDER_COLOR := Color("a0804a")
const SATELLITE_BORDER_COLOR := Color(1, 1, 1, 0.75)
## Opacidad del resaltado de un barrio sobre la foto.
const SATELLITE_HIGHLIGHT_ALPHA := 0.45
## Grosor del borde en píxeles de pantalla, sin importar el zoom.
const BORDER_PX := 1.6

var satellite := false
## nombre -> Polygon2D
var _polygons: Dictionary = {}
var _borders: Array[Line2D] = []


func _ready() -> void:
	satellite = Save.get_value("satellite")
	if satellite:
		add_child(SatelliteLayer.new())
	else:
		var shadows := Node2D.new()
		shadows.name = "Shadows"
		add_child(shadows)
		for n in Data.neighborhoods:
			var shadow := Polygon2D.new()
			shadow.polygon = n.polygon
			shadow.position = SHADOW_OFFSET
			shadow.color = SHADOW_COLOR
			shadows.add_child(shadow)

	for n in Data.neighborhoods:
		var poly := Polygon2D.new()
		poly.name = n.name
		poly.polygon = n.polygon
		var base := LAND_COLORS[hash(n.name) % LAND_COLORS.size()]
		poly.color = Color(base, 0.0) if satellite else base
		poly.set_meta("base_color", poly.color)
		add_child(poly)
		_polygons[n.name] = poly

		var border := Line2D.new()
		border.points = n.polygon
		border.closed = true
		border.default_color = SATELLITE_BORDER_COLOR if satellite else BORDER_COLOR
		border.joint_mode = Line2D.LINE_JOINT_ROUND
		border.antialiased = true
		poly.add_child(border)
		_borders.append(border)


func set_view_zoom(z: float) -> void:
	var w := BORDER_PX / z
	for b in _borders:
		b.width = w


func highlight(neighborhood: String, color: Color) -> void:
	var poly: Polygon2D = _polygons.get(neighborhood)
	if poly == null:
		return
	if satellite:
		color.a = SATELLITE_HIGHLIGHT_ALPHA
	create_tween().tween_property(poly, "color", color, 0.25)


func clear_highlights() -> void:
	for poly: Polygon2D in _polygons.values():
		poly.color = poly.get_meta("base_color")
