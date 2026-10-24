extends Node2D
## Arranque: los datos ya se cargaron en el autoload Data; pasa al menú.


func _ready() -> void:
	get_tree().change_scene_to_file.call_deferred("res://scenes/MainMenu.tscn")
