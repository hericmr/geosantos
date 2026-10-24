extends Node2D
## Partida: rondas contra el reloj, resultado animado, pausa y fin de partida.
## Reglas iguales a las del juego React (ver core/Scoring.gd).

enum State { INTRO, GUESSING, RESULT, GAME_OVER }

const OPTIONS := preload("res://ui/Options.tscn")

const RESULT_LINE_PX := 4.0
const COLOR_CORRECT := Color("7ccf6b")
const COLOR_TARGET := Color("f2b134")
const COLOR_TIME_OK := Color("00ff66")
const COLOR_TIME_WARN := Color("ffd700")
const COLOR_TIME_LOW := Color("ff4444")
## Zoom máximo al mostrar el resultado (evita acercarse demasiado en un acierto).
const RESULT_MAX_ZOOM := 0.6
const INTRO_SECONDS := 0.6
## Pausa entre la bandera roja y la verde, como en el juego React.
const FLAG_SEQUENCE_DELAY := 0.2
## Pausa entre "tempo esgotado" y la pantalla de resultados.
const GAME_OVER_DELAY := 1.4

@onready var camera: MapCamera = $MapCamera
@onready var map: SantosMap = $SantosMap
@onready var gestures: MapGestures = $MapGestures
@onready var flag: PlantedFlag = $TargetFlag
@onready var click_flag: PlantedFlag = $ClickFlag
@onready var result_line: Line2D = $ResultLine
@onready var top_bar: PanelContainer = %TopBar
@onready var score_label: Label = %ScoreLabel
@onready var streak_label: Label = %StreakLabel
@onready var round_label: Label = %RoundLabel
@onready var prompt_label: Label = %PromptLabel
@onready var target_label: Label = %TargetLabel
@onready var category_label: Label = %CategoryLabel
@onready var time_bar: ProgressBar = %TimeBar
@onready var time_label: Label = %TimeLabel
@onready var bottom_slot: VBoxContainer = %BottomSlot
@onready var side_slot: VBoxContainer = %SideSlot
@onready var result_card: PanelContainer = %ResultCard
@onready var result_message: Label = %ResultMessage
@onready var result_detail: Label = %ResultDetail
@onready var result_points: Label = %ResultPoints
@onready var result_bonus: Label = %ResultBonus
@onready var place_info: RichTextLabel = %PlaceInfo
@onready var next_button: Button = %NextButton
@onready var pause_button: Button = %PauseButton
@onready var pause_menu: Control = %PauseMenu
@onready var resume_button: Button = %ResumeButton
@onready var pause_options_button: Button = %PauseOptionsButton
@onready var quit_button: Button = %QuitButton
@onready var time_up_label: Label = %TimeUpLabel
@onready var burst: CPUParticles2D = %Burst

var state := State.INTRO
var mode := Scoring.Mode.NEIGHBORHOODS
var score := 0
var time_left := Scoring.INITIAL_TIME
## Tiempo disponible al empezar la ronda (escala de la barra).
var round_initial_time := Scoring.INITIAL_TIME
var time_bonus := 0.0
var streak := 0
var round_number := 0
var correct_count := 0
var total_distance_m := 0.0
var target: Dictionary = {}
var _rounds: RoundGenerator
## Punto del mapa (mundo) que tocó el jugador en la ronda actual.
var _answer := Vector2.ZERO
var _time_fill := StyleBoxFlat.new()
var _started_at_ms := 0


func _ready() -> void:
	camera.zoom_changed.connect(_on_zoom_changed)
	camera.setup(Data.play_bounds, Data.bounds)
	time_bar.add_theme_stylebox_override("fill", _time_fill)
	_time_fill.set_corner_radius_all(8)

	gestures.is_over_ui = _is_over_ui
	gestures.tapped.connect(_on_tapped)
	gestures.drag_started.connect(func(_pos: Vector2) -> void: camera.stop())
	gestures.dragged.connect(func(_pos: Vector2, delta: Vector2) -> void: camera.pan_screen(delta))
	gestures.drag_ended.connect(func(velocity: Vector2) -> void: camera.fling(velocity))
	gestures.pinched.connect(_on_pinched)
	gestures.zoomed.connect(func(center: Vector2, factor: float) -> void: camera.zoom_at(center, factor))
	gestures.panned.connect(func(delta: Vector2) -> void: camera.pan_screen(delta))
	next_button.pressed.connect(_next_round)
	pause_button.pressed.connect(_set_paused.bind(true))
	resume_button.pressed.connect(_set_paused.bind(false))
	pause_options_button.pressed.connect(func() -> void: pause_menu.add_child(OPTIONS.instantiate()))
	quit_button.pressed.connect(func() -> void: Transition.go("res://scenes/MainMenu.tscn"))
	pause_menu.hide()
	time_up_label.hide()
	get_viewport().size_changed.connect(_apply_layout)
	_apply_layout()

	Sfx.play_music()
	_start_match(Game.current_mode)


func _notification(what: int) -> void:
	# Al salir de la app o cambiar de pestaña, se pausa para no perder tiempo.
	if what == NOTIFICATION_APPLICATION_FOCUS_OUT or what == NOTIFICATION_APPLICATION_PAUSED:
		if is_node_ready() and state != State.GAME_OVER:
			_set_paused(true)


func _process(delta: float) -> void:
	if state != State.GUESSING:
		return
	time_left = maxf(time_left - delta, 0.0)
	_update_time_ui()
	if time_left <= 0.0:
		_game_over()


# --- Flujo de la partida ---

func _start_match(game_mode: Dictionary) -> void:
	mode = game_mode.mode
	_rounds = RoundGenerator.new(Game.targets_for(game_mode))
	_started_at_ms = Time.get_ticks_msec()
	score = 0
	time_left = Scoring.INITIAL_TIME
	time_bonus = 0.0
	streak = 0
	round_number = 0
	correct_count = 0
	total_distance_m = 0.0
	prompt_label.text = "Encontre o bairro" if mode == Scoring.Mode.NEIGHBORHOODS else "Encontre o lugar"
	_next_round()


func _next_round() -> void:
	time_left += time_bonus
	time_bonus = 0.0
	round_initial_time = time_left
	round_number += 1
	target = _rounds.next()

	flag.hide()
	click_flag.hide()
	result_line.clear_points()
	map.clear_highlights()
	result_card.hide()

	target_label.text = target.name
	category_label.text = target.get("category", "")
	category_label.visible = category_label.text != ""
	_update_hud()
	_update_time_ui()

	state = State.INTRO
	camera.fly_to_rect(Data.bounds, _free_screen_area(), MapCamera.MAX_ZOOM, INTRO_SECONDS)
	# Con un timer y no con el fin del tween: tocar el mapa cancela el vuelo de la cámara.
	var round_at_start := round_number
	await get_tree().create_timer(INTRO_SECONDS).timeout
	if state == State.INTRO and round_number == round_at_start:
		state = State.GUESSING


## Un toque en el mapa responde la ronda, como en el juego React.
func _answer_at(world_pos: Vector2) -> void:
	if state != State.GUESSING and state != State.INTRO:
		return
	state = State.RESULT
	_answer = world_pos.clamp(Data.play_bounds.position, Data.play_bounds.end)
	var result: Dictionary
	if mode == Scoring.Mode.NEIGHBORHOODS:
		result = Scoring.evaluate_neighborhood(_answer, target, time_left, streak)
	else:
		result = Scoring.evaluate_place(_answer, target, time_left, streak)

	score += result.score
	time_bonus = Scoring.time_bonus(result.score, mode)
	total_distance_m += result.distance_m
	if result.correct:
		streak += 1
		correct_count += 1
	else:
		streak = 0

	var distance: float = result.distance_m
	if result.correct or distance <= Scoring.SUCCESS_SOUND_M:
		Sfx.play("success")
	elif distance >= Scoring.ERROR_SOUND_M:
		Sfx.play("error")
	if result.correct:
		burst.position = camera.world_to_screen(_answer)
		burst.restart()
	else:
		Sfx.vibrate(120)

	_show_result(result)
	_update_hud()


func _game_over() -> void:
	state = State.GAME_OVER
	pause_button.hide()
	Sfx.play("error")
	Sfx.vibrate(300)
	time_up_label.show()
	time_up_label.pivot_offset = time_up_label.size / 2.0
	time_up_label.scale = Vector2(0.4, 0.4)
	create_tween().tween_property(time_up_label, "scale", Vector2.ONE, 0.4) \
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

	var mode_id: String = Game.current_mode.id
	Game.last_result = {
		"mode_id": mode_id,
		"score": score,
		"rounds": round_number,
		"correct": correct_count,
		"total_distance_m": total_distance_m,
		"play_time_s": (Time.get_ticks_msec() - _started_at_ms) / 1000.0,
		"record": Save.submit_best(mode_id, score),
	}
	await get_tree().create_timer(GAME_OVER_DELAY).timeout
	Transition.go("res://scenes/Results.tscn")


func _set_paused(paused: bool) -> void:
	if state == State.GAME_OVER:
		return
	get_tree().paused = paused
	pause_menu.visible = paused


# --- Resultado de la ronda ---

func _show_result(result: Dictionary) -> void:
	var target_point: Vector2 = result.closest

	# Lo que hay que mostrar en el mapa: el barrio o el lugar correcto, y el toque.
	var frame := Rect2(_answer, Vector2.ZERO).expand(target_point)
	if mode == Scoring.Mode.NEIGHBORHOODS:
		map.highlight(target.name, COLOR_CORRECT if result.correct else COLOR_TARGET)
		for p: Vector2 in target.polygon:
			frame = frame.expand(p)

	_plant_flags()

	if not result.correct and not result.near_border:
		result_line.points = PackedVector2Array([_answer, _answer])
		create_tween().tween_method(_grow_result_line.bind(_answer, target_point), 0.0, 1.0, 0.6) \
			.set_delay(0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

	result_message.text = result.message
	result_message.add_theme_color_override("font_color", COLOR_CORRECT if result.correct else Color.WHITE)
	result_detail.text = _result_detail(result)
	result_bonus.text = "+%s s" % Format.decimal(time_bonus)
	result_points.text = "+0"
	create_tween().tween_method(func(v: float) -> void: result_points.text = "+" + Format.integer(roundi(v)),
		0.0, float(result.score), 0.8).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

	var description: String = target.get("description", "")
	place_info.visible = mode == Scoring.Mode.PLACES and description != ""
	place_info.text = description
	place_info.scroll_to_line(0)

	result_card.show()
	result_card.modulate.a = 0.0
	create_tween().tween_property(result_card, "modulate:a", 1.0, 0.25)
	# Espera un frame para que la tarjeta tenga su tamaño final antes de encuadrar.
	await get_tree().process_frame
	# Margen extra arriba: las banderas son altas y se dibujan sobre el punto.
	camera.fly_to_rect(frame.grow_individual(250.0, 650.0, 250.0, 250.0), _free_screen_area(true), RESULT_MAX_ZOOM)


## Secuencia original: la bandera roja se finca donde marcó el jugador y, al terminar,
## la verde se finca en el lugar correcto (solo en el modo Lugares).
func _plant_flags() -> void:
	var round_at_start := round_number
	await click_flag.plant(_answer)
	if mode != Scoring.Mode.PLACES or round_number != round_at_start:
		return
	await get_tree().create_timer(FLAG_SEQUENCE_DELAY).timeout
	if round_number == round_at_start and state == State.RESULT:
		flag.plant(target.pos)


func _result_detail(result: Dictionary) -> String:
	if mode == Scoring.Mode.NEIGHBORHOODS:
		if result.correct:
			return "Você acertou o bairro!"
		if result.near_border:
			return "Bem na divisa de %s" % target.name
		var clicked := Data.neighborhood_at(_answer)
		var where := "Você marcou %s" % clicked if clicked != "" else "Você marcou fora dos bairros"
		return "%s\n%s ficou a %s" % [where, target.name, Format.distance(result.distance_m)]
	if result.correct:
		return "A %s do lugar" % Format.distance(result.distance_m)
	return "Você errou por %s" % Format.distance(result.distance_m)


func _grow_result_line(t: float, from: Vector2, to: Vector2) -> void:
	result_line.points = PackedVector2Array([from, from.lerp(to, t)])


# --- HUD ---

func _update_hud() -> void:
	score_label.text = "%s pts" % Format.integer(score)
	round_label.text = "Rodada %d" % round_number
	streak_label.text = "Sequência %d" % streak if streak >= 2 else ""


func _update_time_ui() -> void:
	time_bar.max_value = maxf(round_initial_time, 0.1)
	time_bar.value = time_left
	time_label.text = "%s s" % Format.decimal(time_left)
	var pct := time_left / time_bar.max_value
	_time_fill.bg_color = COLOR_TIME_OK if pct > 0.6 else COLOR_TIME_WARN if pct > 0.3 else COLOR_TIME_LOW


## En horizontal la tarjeta de resultado va a la derecha; en vertical, abajo.
func _apply_layout() -> void:
	var view := get_viewport_rect().size
	var slot := side_slot if view.x > view.y else bottom_slot
	if result_card.get_parent() != slot:
		result_card.reparent(slot, false)
	side_slot.visible = slot == side_slot


## Zona de la pantalla que no tapa la interfaz, para encuadrar el mapa.
func _free_screen_area(with_result_card := false) -> Rect2:
	var view := get_viewport_rect().size
	var area := Rect2(Vector2.ZERO, view)
	var top := top_bar.get_global_rect().end.y
	if with_result_card and result_card.visible:
		var card := result_card.get_global_rect()
		if result_card.get_parent() == side_slot:
			area.size.x = card.position.x
		else:
			area.size.y = card.position.y
	area.position.y = top
	area.size.y = maxf(area.size.y - top, view.y * 0.25)
	return area


# --- Entrada en el mapa ---

func _on_zoom_changed(z: float) -> void:
	map.set_view_zoom(z)
	flag.set_view_zoom(z)
	click_flag.set_view_zoom(z)
	result_line.width = RESULT_LINE_PX / z


func _is_over_ui(pos: Vector2) -> bool:
	for control: Control in [top_bar, result_card, pause_menu]:
		if control.is_visible_in_tree() and control.get_global_rect().has_point(pos):
			return true
	return false


func _on_tapped(pos: Vector2) -> void:
	camera.stop()
	_answer_at(camera.screen_to_world(pos))


func _on_pinched(center: Vector2, factor: float, pan: Vector2) -> void:
	camera.stop()
	camera.pan_screen(pan)
	camera.zoom_at(center, factor)
