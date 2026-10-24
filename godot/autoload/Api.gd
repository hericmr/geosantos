extends Node
## Ranking en Supabase por la API REST (misma tabla `ranking` del juego React).
## La URL y la clave anon salen de res://data/supabase.json, que genera el CI
## (o scripts/export_godot_data.py en local, desde el .env).

const CONFIG_PATH := "res://data/supabase.json"
const TIMEOUT_S := 10.0

var _url := ""
var _key := ""


func _ready() -> void:
	if FileAccess.file_exists(CONFIG_PATH):
		var cfg: Variant = JSON.parse_string(FileAccess.get_file_as_string(CONFIG_PATH))
		if typeof(cfg) == TYPE_DICTIONARY:
			_url = str(cfg.get("url", "")).trim_suffix("/")
			_key = str(cfg.get("key", ""))
	if is_configured():
		retry_pending.call_deferred()


func is_configured() -> bool:
	return _url != "" and _key != ""


## Las mejores puntuaciones: [{ player_name, score, rounds_played, accuracy, play_time, created_at }].
func get_top(limit := 20) -> Array:
	var res := await _request(
		"/rest/v1/ranking?select=player_name,score,rounds_played,accuracy,play_time,created_at&order=score.desc&limit=%d" % limit)
	return res.body if res.ok and res.body is Array else []


## Posición que tendría una puntuación (1 = primero), o -1 si no se pudo consultar.
func get_position(score: int) -> int:
	var res := await _request("/rest/v1/ranking?select=score&score=gt.%d&limit=1" % score,
		HTTPClient.METHOD_GET, null, ["Prefer: count=exact"])
	if not res.ok:
		return -1
	# Content-Range: 0-0/42  ->  42 puntuaciones mayores
	var total := str(res.headers.get("content-range", "")).get_slice("/", 1)
	return int(total) + 1 if total.is_valid_int() else -1


## Envía una puntuación. Si falla, queda guardada para reintentar.
func add_score(entry: Dictionary) -> bool:
	var res := await _request("/rest/v1/ranking", HTTPClient.METHOD_POST, entry, ["Prefer: return=minimal"])
	if not res.ok:
		var pending: Array = Save.get_value("pending_scores")
		pending.append(entry)
		Save.set_value("pending_scores", pending)
	return res.ok


func retry_pending() -> void:
	var pending: Array = Save.get_value("pending_scores")
	if pending.is_empty():
		return
	Save.set_value("pending_scores", [])
	for entry: Dictionary in pending:
		await add_score(entry)


func _request(path: String, method := HTTPClient.METHOD_GET, body: Variant = null,
		extra_headers: Array = []) -> Dictionary:
	if not is_configured():
		return {"ok": false, "body": null, "headers": {}}
	var http := HTTPRequest.new()
	http.timeout = TIMEOUT_S
	add_child(http)
	var headers := PackedStringArray([
		"apikey: " + _key,
		"Authorization: Bearer " + _key,
		"Content-Type: application/json",
	])
	headers.append_array(extra_headers)
	var payload := JSON.stringify(body) if body != null else ""
	var err := http.request(_url + path, headers, method, payload)
	if err != OK:
		http.queue_free()
		return {"ok": false, "body": null, "headers": {}}
	var result: Array = await http.request_completed
	http.queue_free()
	var code: int = result[1]
	var response_headers := {}
	for h: String in result[2]:
		var i := h.find(":")
		if i > 0:
			response_headers[h.left(i).strip_edges().to_lower()] = h.substr(i + 1).strip_edges()
	var text: String = (result[3] as PackedByteArray).get_string_from_utf8()
	return {
		"ok": result[0] == HTTPRequest.RESULT_SUCCESS and code >= 200 and code < 300,
		"body": JSON.parse_string(text) if text != "" else null,
		"headers": response_headers,
	}
