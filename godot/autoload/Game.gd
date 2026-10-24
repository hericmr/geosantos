extends Node
## Estado compartido entre escenas: modo elegido y resultado de la última partida.

## Mismas fases que GAME_PHASES en src/utils/gameConstants.ts, más "todos os lugares".
const MODES: Array[Dictionary] = [
	{"id": "neighborhoods", "label": "Bairros", "mode": Scoring.Mode.NEIGHBORHOODS, "category": ""},
	{"id": "places", "label": "Todos os lugares", "mode": Scoring.Mode.PLACES, "category": ""},
	{"id": "historico", "label": "Histórico", "mode": Scoring.Mode.PLACES, "category": "Patrimônio Histórico"},
	{"id": "cultura", "label": "Cultural", "mode": Scoring.Mode.PLACES, "category": "Cultura"},
	{"id": "saude", "label": "Saúde", "mode": Scoring.Mode.PLACES, "category": "Saúde"},
	{"id": "lazer", "label": "Lazer", "mode": Scoring.Mode.PLACES, "category": "Lazer"},
	{"id": "educacao", "label": "Educação", "mode": Scoring.Mode.PLACES, "category": "Educação"},
	{"id": "religiao", "label": "Religião", "mode": Scoring.Mode.PLACES, "category": "Religião"},
	{"id": "assistencia", "label": "Assistência", "mode": Scoring.Mode.PLACES, "category": "Assistência Social"},
]

var current_mode: Dictionary = MODES[0]
## { mode_id, score, rounds, correct, total_distance_m, play_time_s, record }
var last_result: Dictionary = {}


func select_mode(id: String) -> void:
	for m in MODES:
		if m.id == id:
			current_mode = m
			return


## Objetivos del modo actual: barrios o lugares (filtrados por categoría).
func targets_for(mode: Dictionary) -> Array:
	if mode.mode == Scoring.Mode.NEIGHBORHOODS:
		return Data.neighborhoods
	if mode.category == "":
		return Data.places
	return Data.places.filter(func(p: Dictionary) -> bool: return p.category == mode.category)
