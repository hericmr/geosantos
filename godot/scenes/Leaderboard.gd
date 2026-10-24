extends Control
## Ranking global (Supabase).

const LIMIT := 30
const HIGHLIGHT := Color(1, 0.86, 0.35, 1)
const MEDALS := [Color("ffd54a"), Color("d6dde4"), Color("e0a36a")]

@onready var list: VBoxContainer = %List
@onready var status_label: Label = %StatusLabel
@onready var back_button: Button = %BackButton


func _ready() -> void:
	back_button.pressed.connect(func() -> void: Transition.go("res://scenes/MainMenu.tscn"))
	if not Api.is_configured():
		status_label.text = "Ranking indisponível nesta versão"
		return
	status_label.text = "Carregando..."
	var rows := await Api.get_top(LIMIT)
	if rows.is_empty():
		status_label.text = "Não foi possível carregar o ranking"
		return
	status_label.hide()
	var me := str(Save.get_value("player_name")).to_lower()
	for i in rows.size():
		list.add_child(_row(i + 1, rows[i], me != "" and str(rows[i].player_name).to_lower() == me))


func _row(position: int, entry: Dictionary, is_me: bool) -> Control:
	var panel := PanelContainer.new()
	panel.theme_type_variation = &"RowPanel"
	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", 16)
	panel.add_child(box)

	var pos := Label.new()
	pos.text = "%dº" % position
	pos.custom_minimum_size = Vector2(64, 0)
	pos.add_theme_font_size_override("font_size", 30)
	if position <= MEDALS.size():
		pos.add_theme_color_override("font_color", MEDALS[position - 1])
	box.add_child(pos)

	var name_label := Label.new()
	name_label.text = str(entry.player_name)
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	name_label.add_theme_font_size_override("font_size", 28)
	if is_me:
		name_label.add_theme_color_override("font_color", HIGHLIGHT)
	box.add_child(name_label)

	var score := Label.new()
	score.text = Format.integer(int(entry.score))
	score.add_theme_font_size_override("font_size", 28)
	score.add_theme_color_override("font_color", HIGHLIGHT)
	box.add_child(score)
	return panel
