extends Control
## Menú principal.

const OPTIONS := preload("res://ui/Options.tscn")

@onready var play_button: Button = %PlayButton
@onready var ranking_button: Button = %RankingButton
@onready var options_button: Button = %OptionsButton
@onready var credits_button: Button = %CreditsButton
@onready var credits: Control = %Credits
@onready var credits_close: Button = %CreditsClose
@onready var title: Label = %Title


func _ready() -> void:
	Sfx.play_music()
	credits.hide()
	play_button.pressed.connect(func() -> void: Transition.go("res://scenes/ModeSelect.tscn"))
	ranking_button.pressed.connect(func() -> void: Transition.go("res://scenes/Leaderboard.tscn"))
	options_button.pressed.connect(func() -> void: $UI.add_child(OPTIONS.instantiate()))
	credits_button.pressed.connect(credits.show)
	credits_close.pressed.connect(credits.hide)
	_animate_title()


func _animate_title() -> void:
	title.pivot_offset = title.size / 2.0
	var t := create_tween().set_loops()
	t.tween_property(title, "scale", Vector2(1.04, 1.04), 1.2).set_trans(Tween.TRANS_SINE)
	t.tween_property(title, "scale", Vector2.ONE, 1.2).set_trans(Tween.TRANS_SINE)
