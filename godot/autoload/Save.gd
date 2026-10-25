extends Node
## Progreso y preferencias guardados en el dispositivo (user://save.json).

const PATH := "user://save.json"
const DEFAULTS := {
	"player_name": "",
	"music_volume": 0.6,
	"sfx_volume": 0.9,
	"vibration": true,
	## imagen de satélite de fondo (se descarga por tiles; se puede apagar para ahorrar datos)
	"satellite": true,
	## id del modo -> mejor puntuación
	"best_scores": {},
	## puntuaciones que no se pudieron enviar al ranking (se reintentan)
	"pending_scores": [],
}

var data: Dictionary = DEFAULTS.duplicate(true)


func _ready() -> void:
	if not FileAccess.file_exists(PATH):
		return
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(PATH))
	if typeof(parsed) == TYPE_DICTIONARY:
		for key: String in DEFAULTS:
			if parsed.has(key):
				data[key] = parsed[key]


func get_value(key: String) -> Variant:
	return data.get(key, DEFAULTS.get(key))


func set_value(key: String, value: Variant) -> void:
	data[key] = value
	save()


func best_score(mode_id: String) -> int:
	return int(data.best_scores.get(mode_id, 0))


## Guarda la puntuación si es récord. Devuelve true si lo fue.
func submit_best(mode_id: String, score: int) -> bool:
	if score <= best_score(mode_id):
		return false
	data.best_scores[mode_id] = score
	save()
	return true


func save() -> void:
	var f := FileAccess.open(PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data))
