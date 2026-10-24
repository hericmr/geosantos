class_name Scoring
## Reglas de puntuación portadas tal cual del juego React
## (src/utils/gameConstants.ts, src/utils/gameUtils.ts y src/hooks/useMapGame.ts).

enum Mode { NEIGHBORHOODS, PLACES }

const INITIAL_TIME := 15.0
const ROUND_TIME := 15.0
const CORRECT_BASE := 1000
const CORRECT_TIME_BONUS := 2000
const NEAR_BORDER_BASE := 600
const NEAR_BORDER_TIME_BONUS := 1400
const NEAR_BORDER_M := 10.0
const PLACE_HIT_RADIUS_M := 300.0
const STREAK_PER_LEVEL := 0.1
const MAX_STREAK_LEVELS := 5
## Distancia (km) a partir de la cual un error vale 0 puntos por distancia.
const MAX_ERROR_KM := {Mode.NEIGHBORHOODS: 10.0, Mode.PLACES: 3.0}
const MAX_TIME_BONUS := {Mode.NEIGHBORHOODS: 4.0, Mode.PLACES: 5.0}
## Sonidos: acierto si la distancia es <= SUCCESS_SOUND_M, error si es >= ERROR_SOUND_M.
const SUCCESS_SOUND_M := 500.0
const ERROR_SOUND_M := 700.0


## Math.round de JavaScript (redondea .5 hacia arriba, también en negativos).
static func js_round(x: float) -> int:
	return floori(x + 0.5)


static func streak_multiplier(streak: int) -> float:
	return 1.0 + mini(streak, MAX_STREAK_LEVELS) * STREAK_PER_LEVEL


static func time_points(time_left: float, max_points: int) -> int:
	return js_round(time_left / ROUND_TIME * max_points)


## Acierto (dentro del barrio o a menos de 300 m del lugar).
static func correct_score(time_left: float, streak: int) -> int:
	return js_round((CORRECT_BASE + time_points(time_left, CORRECT_TIME_BONUS)) * streak_multiplier(streak))


## Toque a menos de 10 m del borde del barrio correcto.
static func near_border_score(time_left: float) -> int:
	return NEAR_BORDER_BASE + time_points(time_left, NEAR_BORDER_TIME_BONUS)


## Error: hasta 800 puntos por cercanía y hasta 200 por tiempo.
static func distance_score(distance_m: float, time_left: float, mode: Mode) -> int:
	var km := distance_m / 1000.0
	var distance_points := js_round(maxf(0.0, 800.0 * (1.0 - km / MAX_ERROR_KM[mode])))
	return distance_points + time_points(time_left, 200)


## Segundos que se suman al reloj en la ronda siguiente.
static func time_bonus(score: int, mode: Mode) -> float:
	if score <= 0:
		return 0.0
	var normalized := minf(score, 3000) / 3000.0
	return snappedf(normalized * MAX_TIME_BONUS[mode], 0.1)


static func neighborhood_miss_message(distance_m: float) -> String:
	var km := distance_m / 1000.0
	var options: Array
	if km < 0.5:
		options = ["QUASE PERFEITO!", "INCRÍVEL!", "EXCELENTE!", "FANTÁSTICO!", "IMPRESSIONANTE!"]
	elif km < 1.0:
		options = ["MUITO BOM!", "EXCELENTE!", "ÓTIMO!", "FANTÁSTICO!", "IMPRESSIONANTE!"]
	elif km < 2.0:
		options = ["BOM!", "LEGAL!", "OK!", "ACEITÁVEL!", "RAZOÁVEL!"]
	elif km < 5.0:
		options = ["QUASE LÁ!", "HMMM!", "OPS!", "QUASE!", "TENTE NOVAMENTE!"]
	else:
		options = ["OPS!", "EITA!", "UAU!", "VENDADO?", "CONFUSÃO!"]
	return options.pick_random()


static func place_miss_message(distance_m: float) -> String:
	var km := distance_m / 1000.0
	if km < 0.5:
		return "Quase lá!"
	if km < 1.0:
		return "Está no caminho certo!"
	if km < 2.0:
		return "Ainda longe!"
	return "Muito longe!"


## Evalúa un intento en el modo Bairros.
## Devuelve { score, correct, near_border, distance_m, closest: Vector2, message }.
static func evaluate_neighborhood(pin: Vector2, target: Dictionary, time_left: float, streak: int) -> Dictionary:
	var poly: PackedVector2Array = target.polygon
	if Geometry2D.is_point_in_polygon(pin, poly):
		var new_streak := streak + 1
		return {
			"score": correct_score(time_left, streak), "correct": true, "near_border": false,
			"distance_m": 0.0, "closest": pin,
			"message": "%d SEGUIDOS!" % new_streak if new_streak >= 2 else "ACERTOU!",
		}

	var closest := pin
	var best := INF
	for i in poly.size():
		var p := Geometry2D.get_closest_point_to_segment(pin, poly[i], poly[(i + 1) % poly.size()])
		var d := pin.distance_squared_to(p)
		if d < best:
			best = d
			closest = p
	var distance := Geo.world_distance_m(pin, closest)
	var near := distance < NEAR_BORDER_M
	return {
		"score": near_border_score(time_left) if near else distance_score(distance, time_left, Mode.NEIGHBORHOODS),
		"correct": false, "near_border": near, "distance_m": distance, "closest": closest,
		"message": "NA DIVISA!" if near else neighborhood_miss_message(distance),
	}


## Evalúa un intento en el modo Lugares.
static func evaluate_place(pin: Vector2, place: Dictionary, time_left: float, streak: int) -> Dictionary:
	var a := Geo.world_to_latlon(pin)
	var distance := Geo.distance_m(a.x, a.y, place.lat, place.lon)
	if distance <= PLACE_HIT_RADIUS_M:
		var new_streak := streak + 1
		return {
			"score": correct_score(time_left, streak), "correct": true, "near_border": false,
			"distance_m": distance, "closest": place.pos,
			"message": "%d SEGUIDOS!" % new_streak if new_streak >= 3 else "ACERTOU!",
		}
	return {
		"score": distance_score(distance, time_left, Mode.PLACES), "correct": false, "near_border": false,
		"distance_m": distance, "closest": place.pos, "message": place_miss_message(distance),
	}
