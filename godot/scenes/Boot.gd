extends Node2D
## Arranque: los datos ya se cargaron en el autoload Data; pasa a la partida.


func _ready() -> void:
	get_tree().change_scene_to_file.call_deferred("res://scenes/Match.tscn")
