extends Node2D
## Dibuja los barrios de Santos a partir de Data.neighborhoods.

const LAND_COLOR := Color("f3e3b5")
const LAND_ALT_COLOR := Color("ead39a")
const BORDER_COLOR := Color("8a6a3a")
const BORDER_WIDTH := 6.0


func _ready() -> void:
	var i := 0
	for n in Data.neighborhoods:
		var poly := Polygon2D.new()
		poly.name = n.name
		poly.polygon = n.polygon
		poly.color = LAND_COLOR if i % 2 == 0 else LAND_ALT_COLOR
		add_child(poly)

		var border := Line2D.new()
		border.points = n.polygon
		border.closed = true
		border.width = BORDER_WIDTH
		border.default_color = BORDER_COLOR
		border.joint_mode = Line2D.LINE_JOINT_ROUND
		poly.add_child(border)
		i += 1
