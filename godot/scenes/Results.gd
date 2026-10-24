extends Control
## Fin de partida: puntuación, estadísticas y envío al ranking.

## Mismos mensajes y voces que GameOverModal.tsx del juego React.
const SCORE_MESSAGES := [
	[100000, "REI DA GEOGRAFIA! Você conhece Santos!"],
	[80000, "MITO SANTISTA! Até as ondas do mar te aplaudem!"],
	[60000, "LENDÁRIO! Você é um Pelé da geografia santista!"],
	[50000, "MESTRE DOS BAIRROS! Você é um GPS ambulante!"],
	[40000, "IMPRESSIONANTE! Quase um GPS humano!!"],
	[30000, "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA!"],
	[25000, "SANTISTA DE CORAÇÃO! Você manja dos bairros!"],
	[20000, "MUITO BOM! Você deve ter ido em algumas aulas de geografia!"],
	[15000, "BOM JOGO! Mas ainda precisa andar mais pela zona noroeste!"],
	[12000, "QUASE LÁ! Dá um role no bondinho pra pegar umas dicas!"],
	[10000, "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA!"],
	[8000, "Eita! Parece que você não sabe nada de Santos!"],
	[6000, "Confundiu Santos com o interior do Mato Grosso!"],
	[4000, "Te colocaram pra jogar vendado?"],
	[2000, "Você achava que o Boqueirão era em Salvador?"],
	[1000, "Eita! Parece que você não sabe nada de Santos!"],
	[500, "Confundiu Santos com o interior do Mato Grosso!"],
	[100, "Te colocaram pra jogar vendado?"],
]
const FALLBACK_MESSAGE := "Eita! Parece que você não sabe nada de Santos!"
const VOICES := {
	"BOM JOGO! Mas ainda precisa andar mais pela zona noroeste!": "uau_bom_jogo",
	"Confundiu Santos com o interior do Mato Grosso!": "confundiu_santos_com_ointerior_do_mato_grosso",
	"Eita! Parece que você não sabe nada de Santos!": "eita_parece_que_voce_nao_sabe_nada_de_santos_mesmo",
}
const MAX_NAME_LENGTH := 20
## Precisión como en el juego React: 1 - distancia total / 6 km.
const ACCURACY_DISTANCE_M := 6000.0

@onready var message_label: Label = %MessageLabel
@onready var score_label: Label = %ScoreLabel
@onready var record_label: Label = %RecordLabel
@onready var stats_label: Label = %StatsLabel
@onready var ranking_box: VBoxContainer = %RankingBox
@onready var name_edit: LineEdit = %NameEdit
@onready var save_button: Button = %SaveButton
@onready var status_label: Label = %StatusLabel
@onready var again_button: Button = %AgainButton
@onready var menu_button: Button = %MenuButton
@onready var ranking_button: Button = %RankingButton
@onready var confetti: CPUParticles2D = %Confetti

var _result: Dictionary


func _ready() -> void:
	_result = Game.last_result
	if _result.is_empty():
		_result = {"mode_id": "neighborhoods", "score": 0, "rounds": 0, "correct": 0,
			"total_distance_m": 0.0, "play_time_s": 0.0, "record": false}

	var message := _message_for(_result.score)
	message_label.text = message
	if VOICES.has(message):
		Sfx.play_voice(VOICES[message])

	record_label.visible = _result.record
	if _result.record:
		confetti.position = Vector2(get_viewport_rect().size.x / 2.0, -20.0)
		confetti.emitting = true
	score_label.text = "0"
	create_tween().tween_method(func(v: float) -> void: score_label.text = Format.integer(roundi(v)),
		0.0, float(_result.score), 1.2).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

	var rounds: int = _result.rounds
	stats_label.text = "%d rodadas  •  %d acertos\nDistância total: %s\nTempo de jogo: %s" % [
		rounds, _result.correct, Format.distance(_result.total_distance_m), Format.duration(_result.play_time_s),
	]

	ranking_box.visible = Api.is_configured() and _result.score > 0
	name_edit.max_length = MAX_NAME_LENGTH
	name_edit.text = Save.get_value("player_name")
	name_edit.text_submitted.connect(func(_t: String) -> void: _save_score())
	save_button.pressed.connect(_save_score)
	status_label.text = ""

	again_button.pressed.connect(func() -> void: Transition.go("res://scenes/Match.tscn"))
	menu_button.pressed.connect(func() -> void: Transition.go("res://scenes/MainMenu.tscn"))
	ranking_button.pressed.connect(func() -> void: Transition.go("res://scenes/Leaderboard.tscn"))


func _message_for(score: int) -> String:
	for level: Array in SCORE_MESSAGES:
		if score >= level[0]:
			return level[1]
	return FALLBACK_MESSAGE


func _save_score() -> void:
	var player := name_edit.text.strip_edges()
	if player == "":
		status_label.text = "Digite seu nome"
		name_edit.grab_focus()
		return
	Save.set_value("player_name", player)
	name_edit.editable = false
	save_button.disabled = true
	status_label.text = "Enviando..."
	var accuracy := clampf(1.0 - _result.total_distance_m / ACCURACY_DISTANCE_M, 0.0, 1.0)
	var ok := await Api.add_score({
		"player_name": player,
		"score": _result.score,
		"play_time": maxi(1, roundi(_result.play_time_s)),
		"rounds_played": _result.rounds,
		"accuracy": snappedf(accuracy, 0.01),
	})
	if not ok:
		status_label.text = "Sem conexão. Vamos enviar mais tarde."
		return
	var position := await Api.get_position(_result.score)
	status_label.text = "Salvo! Você ficou em %dº lugar" % position if position > 0 else "Salvo no ranking!"
