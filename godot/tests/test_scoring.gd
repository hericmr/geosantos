extends SceneTree
## Compara Scoring.gd con valores generados por las funciones TypeScript del juego React.
##   godot --headless --path godot -s tests/test_scoring.gd

const EXPECTED := "res://tests/scoring_expected.json"
const MODES := {"neighborhoods": Scoring.Mode.NEIGHBORHOODS, "famous_places": Scoring.Mode.PLACES}

var _failures := 0
var _checks := 0


func _initialize() -> void:
	var cases: Array = JSON.parse_string(FileAccess.get_file_as_string(EXPECTED))
	for c: Dictionary in cases:
		match c.kind:
			"distance":
				var mode: Scoring.Mode = MODES[c.mode]
				var score := Scoring.distance_score(c.d, c.t, mode)
				_check(score == int(c.score), "distance %s d=%s t=%s: %d != %d" % [c.mode, c.d, c.t, score, c.score])
				_check(is_equal_approx(Scoring.time_bonus(score, mode), c.bonus), "bonus %s score=%d" % [c.mode, score])
			"correct":
				var score := Scoring.correct_score(c.t, int(c.streak))
				_check(score == int(c.score), "correct t=%s streak=%s: %d != %d" % [c.t, c.streak, score, c.score])
				_check(is_equal_approx(Scoring.time_bonus(score, Scoring.Mode.NEIGHBORHOODS), c.bonus_n), "bonus_n %d" % score)
				_check(is_equal_approx(Scoring.time_bonus(score, Scoring.Mode.PLACES), c.bonus_p), "bonus_p %d" % score)
			"border":
				var score := Scoring.near_border_score(c.t)
				_check(score == int(c.score), "border t=%s: %d != %d" % [c.t, score, c.score])
	_test_with_map_data()
	print("%d verificaciones, %d fallas" % [_checks, _failures])
	quit(1 if _failures > 0 else 0)


func _test_with_map_data() -> void:
	var data: Node = load("res://autoload/Data.gd").new()
	data._ready()
	var gonzaga: Dictionary = data.neighborhoods.filter(func(n): return n.name == "Gonzaga")[0]
	var hit := Scoring.evaluate_neighborhood(gonzaga.centroid, gonzaga, 15.0, 0)
	_check(hit.correct and hit.score == 3000, "centro de Gonzaga debería ser acierto con 3000")
	var far := Scoring.evaluate_neighborhood(gonzaga.centroid + Vector2(4000, 0), gonzaga, 0.0, 2)
	_check(not far.correct and far.distance_m > 1000.0, "4 km al este no debería ser acierto")
	var place: Dictionary = data.places[0]
	var on_place := Scoring.evaluate_place(place.pos + Vector2(100, 0), place, 7.5, 1)
	_check(on_place.correct and absf(on_place.distance_m - 100.0) < 2.0, "a 100 m del lugar debería ser acierto")
	data.free()


func _check(ok: bool, msg: String) -> void:
	_checks += 1
	if not ok:
		_failures += 1
		printerr("FALLA: ", msg)
