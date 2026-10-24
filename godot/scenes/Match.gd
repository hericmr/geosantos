extends Node2D
## Partida: elegir modo, rondas contra el reloj, resultado animado y fin de partida.
## Reglas iguales a las del juego React (ver core/Scoring.gd).

enum State { MENU, INTRO, GUESSING, RESULT, GAME_OVER }

## Radio (px de pantalla) alrededor de la cabeza del pin para poder arrastrarlo.
const PIN_GRAB_RADIUS := 60.0
const RESULT_LINE_PX := 4.0
const COLOR_CORRECT := Color("7ccf6b")
const COLOR_TARGET := Color("f2b134")
const COLOR_TIME_OK := Color("00ff66")
const COLOR_TIME_WARN := Color("ffd700")
const COLOR_TIME_LOW := Color("ff4444")
## Zoom máximo al mostrar el resultado (evita acercarse demasiado en un acierto).
const RESULT_MAX_ZOOM := 0.6
const INTRO_SECONDS := 0.6

@onready var camera: MapCamera = $MapCamera
@onready var map: SantosMap = $SantosMap
@onready var gestures: MapGestures = $MapGestures
@onready var pin: Pin = $Pin
@onready var flag: TargetFlag = $TargetFlag
@onready var result_line: Line2D = $ResultLine
@onready var success_sound: AudioStreamPlayer = $SuccessSound
@onready var error_sound: AudioStreamPlayer = $ErrorSound
@onready var top_bar: PanelContainer = %TopBar
@onready var score_label: Label = %ScoreLabel
@onready var streak_label: Label = %StreakLabel
@onready var round_label: Label = %RoundLabel
@onready var prompt_label: Label = %PromptLabel
@onready var target_label: Label = %TargetLabel
@onready var category_label: Label = %CategoryLabel
@onready var time_bar: ProgressBar = %TimeBar
@onready var time_label: Label = %TimeLabel
@onready var confirm_button: Button = %ConfirmButton
@onready var result_card: PanelContainer = %ResultCard
@onready var result_message: Label = %ResultMessage
@onready var result_detail: Label = %ResultDetail
@onready var result_points: Label = %ResultPoints
@onready var result_bonus: Label = %ResultBonus
@onready var place_info: RichTextLabel = %PlaceInfo
@onready var next_button: Button = %NextButton
@onready var overlay: ColorRect = %Overlay
@onready var overlay_title: Label = %OverlayTitle
@onready var overlay_text: Label = %OverlayText
@onready var neighborhoods_button: Button = %NeighborhoodsButton
@onready var places_button: Button = %PlacesButton

var state := State.MENU
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
var _dragging_pin := false
## Diferencia entre el dedo y la punta del pin al empezar a arrastrarlo.
var _pin_grab := Vector2.ZERO
var _time_fill := StyleBoxFlat.new()


func _ready() -> void:
	camera.zoom_changed.connect(_on_zoom_changed)
	camera.setup(Data.play_bounds, Data.bounds)
	time_bar.add_theme_stylebox_override("fill", _time_fill)
	_time_fill.set_corner_radius_all(8)

	gestures.tapped.connect(_on_tapped)
	gestures.drag_started.connect(_on_drag_started)
	gestures.dragged.connect(_on_dragged)
	gestures.drag_ended.connect(_on_drag_ended)
	gestures.pinched.connect(_on_pinched)
	gestures.zoomed.connect(func(center: Vector2, factor: float) -> void: camera.zoom_at(center, factor))
	gestures.panned.connect(func(delta: Vector2) -> void: camera.pan_screen(delta))
	confirm_button.pressed.connect(_on_confirm)
	next_button.pressed.connect(_next_round)
	neighborhoods_button.pressed.connect(_start_match.bind(Scoring.Mode.NEIGHBORHOODS))
	places_button.pressed.connect(_start_match.bind(Scoring.Mode.PLACES))

	_show_menu("GeoSantos", "Escolha um modo de jogo")


func _process(delta: float) -> void:
	if state != State.GUESSING:
		return
	time_left = maxf(time_left - delta, 0.0)
	_update_time_ui()
	if time_left <= 0.0:
		_game_over()


# --- Flujo de la partida ---

func _show_menu(title: String, text: String) -> void:
	if state != State.GAME_OVER:
		state = State.MENU
	overlay_title.text = title
	overlay_text.text = text
	neighborhoods_button.text = "Bairros"
	places_button.text = "Lugares"
	overlay.show()
	top_bar.hide()
	confirm_button.hide()
	result_card.hide()


func _start_match(new_mode: Scoring.Mode) -> void:
	mode = new_mode
	var pool: Array = Data.neighborhoods if mode == Scoring.Mode.NEIGHBORHOODS else Data.places
	_rounds = RoundGenerator.new(pool)
	score = 0
	time_left = Scoring.INITIAL_TIME
	time_bonus = 0.0
	streak = 0
	round_number = 0
	correct_count = 0
	total_distance_m = 0.0
	overlay.hide()
	top_bar.show()
	prompt_label.text = "Encontre o bairro" if mode == Scoring.Mode.NEIGHBORHOODS else "Encontre o lugar"
	_next_round()


func _next_round() -> void:
	time_left += time_bonus
	time_bonus = 0.0
	round_initial_time = time_left
	round_number += 1
	target = _rounds.next()

	pin.hide()
	flag.hide()
	result_line.clear_points()
	map.clear_highlights()
	result_card.hide()
	confirm_button.show()
	confirm_button.disabled = true

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


func _on_confirm() -> void:
	if state != State.GUESSING and state != State.INTRO:
		return
	state = State.RESULT
	var result: Dictionary
	if mode == Scoring.Mode.NEIGHBORHOODS:
		result = Scoring.evaluate_neighborhood(pin.position, target, time_left, streak)
	else:
		result = Scoring.evaluate_place(pin.position, target, time_left, streak)

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
		success_sound.play()
	elif distance >= Scoring.ERROR_SOUND_M:
		error_sound.play()
	if not result.correct and OS.has_feature("mobile"):
		Input.vibrate_handheld(120)

	_show_result(result)
	_update_hud()


func _game_over() -> void:
	state = State.GAME_OVER
	confirm_button.hide()
	var accuracy := 0 if round_number == 0 else roundi(100.0 * correct_count / round_number)
	_show_menu("Fim de jogo", "%s pontos\n%d rodadas  •  %d%% de acertos\n\nJogar de novo:" % [
		_format_int(score), round_number, accuracy,
	])


# --- Resultado de la ronda ---

func _show_result(result: Dictionary) -> void:
	confirm_button.hide()
	var target_point: Vector2 = result.closest

	# Lo que hay que mostrar en el mapa: el barrio o el lugar correcto, y el pin.
	var frame := Rect2(pin.position, Vector2.ZERO).expand(target_point)
	if mode == Scoring.Mode.NEIGHBORHOODS:
		map.highlight(target.name, COLOR_CORRECT if result.correct else COLOR_TARGET)
		for p: Vector2 in target.polygon:
			frame = frame.expand(p)
	else:
		flag.plant(target.pos)

	if not result.correct and not result.near_border:
		result_line.points = PackedVector2Array([pin.position, pin.position])
		create_tween().tween_method(_grow_result_line.bind(pin.position, target_point), 0.0, 1.0, 0.6) \
			.set_delay(0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

	result_message.text = result.message
	result_message.add_theme_color_override("font_color", COLOR_CORRECT if result.correct else Color.WHITE)
	result_detail.text = _result_detail(result)
	result_bonus.text = "+%s s" % _format_decimal(time_bonus)
	result_points.text = "+0"
	create_tween().tween_method(func(v: float) -> void: result_points.text = "+" + _format_int(roundi(v)),
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
	camera.fly_to_rect(frame.grow(250.0), _free_screen_area(true), RESULT_MAX_ZOOM)


func _result_detail(result: Dictionary) -> String:
	if mode == Scoring.Mode.NEIGHBORHOODS:
		if result.correct:
			return "Você acertou o bairro!"
		if result.near_border:
			return "Bem na divisa de %s" % target.name
		var clicked := Data.neighborhood_at(pin.position)
		var where := "Você marcou %s" % clicked if clicked != "" else "Você marcou fora dos bairros"
		return "%s\n%s ficou a %s" % [where, target.name, _format_distance(result.distance_m)]
	if result.correct:
		return "A %s do lugar" % _format_distance(result.distance_m)
	return "Você errou por %s" % _format_distance(result.distance_m)


func _grow_result_line(t: float, from: Vector2, to: Vector2) -> void:
	result_line.points = PackedVector2Array([from, from.lerp(to, t)])


# --- HUD ---

func _update_hud() -> void:
	score_label.text = "%s pts" % _format_int(score)
	round_label.text = "Rodada %d" % round_number
	streak_label.text = "Sequência %d" % streak if streak >= 2 else ""


func _update_time_ui() -> void:
	time_bar.max_value = maxf(round_initial_time, 0.1)
	time_bar.value = time_left
	time_label.text = "%s s" % _format_decimal(time_left)
	var pct := time_left / time_bar.max_value
	_time_fill.bg_color = COLOR_TIME_OK if pct > 0.6 else COLOR_TIME_WARN if pct > 0.3 else COLOR_TIME_LOW


## Zona de la pantalla que no tapa la interfaz, para encuadrar el mapa.
func _free_screen_area(with_result_card := false) -> Rect2:
	var view := get_viewport_rect().size
	var top := top_bar.get_global_rect().end.y if top_bar.visible else 0.0
	var bottom := result_card.get_global_rect().position.y if with_result_card \
		else confirm_button.get_global_rect().position.y
	bottom = maxf(bottom, top + view.y * 0.25)
	return Rect2(0.0, top, view.x, bottom - top)


# --- Entrada en el mapa ---

func _on_zoom_changed(z: float) -> void:
	map.set_view_zoom(z)
	pin.set_view_zoom(z)
	flag.set_view_zoom(z)
	result_line.width = RESULT_LINE_PX / z


func _can_place_pin() -> bool:
	return state == State.GUESSING or state == State.INTRO


func _on_tapped(pos: Vector2) -> void:
	camera.stop()
	if not _can_place_pin():
		return
	_place_pin(camera.screen_to_world(pos))
	pin.drop()


func _on_drag_started(pos: Vector2) -> void:
	camera.stop()
	var pin_screen := camera.world_to_screen(pin.position)
	_dragging_pin = _can_place_pin() and pin.visible \
		and pos.distance_to(pin_screen + pin.grab_offset()) <= PIN_GRAB_RADIUS
	_pin_grab = pin_screen - pos


func _on_dragged(pos: Vector2, delta: Vector2) -> void:
	if _dragging_pin and _can_place_pin():
		_place_pin(camera.screen_to_world(pos + _pin_grab))
	else:
		camera.pan_screen(delta)


func _on_drag_ended(velocity: Vector2) -> void:
	if _dragging_pin:
		_dragging_pin = false
	else:
		camera.fling(velocity)


func _on_pinched(center: Vector2, factor: float, pan: Vector2) -> void:
	camera.stop()
	camera.pan_screen(pan)
	camera.zoom_at(center, factor)


func _place_pin(world_pos: Vector2) -> void:
	pin.position = world_pos.clamp(Data.play_bounds.position, Data.play_bounds.end)
	pin.show()
	confirm_button.disabled = false


# --- Formato (pt-BR) ---

static func _format_int(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "." + s.right(3) + out
		s = s.left(s.length() - 3)
	return ("-" if n < 0 else "") + s + out


static func _format_decimal(x: float) -> String:
	return ("%.1f" % x).replace(".", ",")


static func _format_distance(m: float) -> String:
	if m < 1000.0:
		return "%d m" % roundi(m)
	return "%s km" % _format_decimal(m / 1000.0)
