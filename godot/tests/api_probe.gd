extends Node
## Prueba de solo lectura del ranking (no escribe nada):
##   godot --headless --path godot res://tests/api_probe.tscn


func _ready() -> void:
	print("configurado: ", Api.is_configured())
	var top := await Api.get_top(3)
	for row: Dictionary in top:
		print("  %s  %d" % [row.player_name, row.score])
	print("posição de 50000: ", await Api.get_position(50000))
	get_tree().quit(0 if top.size() > 0 else 1)
