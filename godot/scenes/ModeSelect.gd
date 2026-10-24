extends Control
## Selección de modo: bairros, todos los lugares o una categoría.

@onready var list: VBoxContainer = %List
@onready var back_button: Button = %BackButton


func _ready() -> void:
	back_button.pressed.connect(func() -> void: Transition.go("res://scenes/MainMenu.tscn"))
	for m: Dictionary in Game.MODES:
		var count := Game.targets_for(m).size()
		if count == 0:
			continue
		var unit := "bairros" if m.mode == Scoring.Mode.NEIGHBORHOODS else "lugares"
		var best := Save.best_score(m.id)
		var button := Button.new()
		button.custom_minimum_size = Vector2(0, 112)
		button.text = "%s\n%d %s%s" % [m.label, count, unit,
			"  •  recorde %s" % Format.integer(best) if best > 0 else ""]
		button.add_theme_font_size_override("font_size", 32)
		if m.id != "neighborhoods":
			button.theme_type_variation = &"SecondaryButton"
		button.pressed.connect(_start.bind(m.id))
		list.add_child(button)


func _start(id: String) -> void:
	Game.select_mode(id)
	Sfx.play("start")
	Transition.go("res://scenes/Match.tscn")
