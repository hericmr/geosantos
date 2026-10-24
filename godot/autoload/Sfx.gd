extends Node
## Música de fondo y efectos de sonido, con volúmenes guardados en Save.

const SOUNDS := {
	"success": preload("res://assets/audio/success.mp3"),
	"error": preload("res://assets/audio/error.mp3"),
	"start": preload("res://assets/audio/start.mp3"),
}
const MUSIC := preload("res://assets/audio/music.mp3")
const MUSIC_BUS := "Music"
const SFX_BUS := "SFX"
## La música queda por debajo de los efectos, como en el juego React.
const MUSIC_GAIN := 0.45

var _music := AudioStreamPlayer.new()
var _players: Array[AudioStreamPlayer] = []


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for bus in [MUSIC_BUS, SFX_BUS]:
		if AudioServer.get_bus_index(bus) == -1:
			AudioServer.add_bus()
			AudioServer.set_bus_name(AudioServer.bus_count - 1, bus)
	var music: AudioStreamMP3 = MUSIC
	music.loop = true
	_music.stream = music
	_music.bus = MUSIC_BUS
	add_child(_music)
	for i in 4:
		var p := AudioStreamPlayer.new()
		p.bus = SFX_BUS
		add_child(p)
		_players.append(p)
	apply_volumes()


func apply_volumes() -> void:
	_set_bus_volume(MUSIC_BUS, float(Save.get_value("music_volume")) * MUSIC_GAIN)
	_set_bus_volume(SFX_BUS, float(Save.get_value("sfx_volume")))


func play_music() -> void:
	if not _music.playing:
		_music.play()


func play(sound: String) -> void:
	_play_stream(SOUNDS[sound])


func play_voice(file: String) -> void:
	var path := "res://assets/audio/voices/%s.ogg" % file
	if ResourceLoader.exists(path):
		_play_stream(load(path))


func vibrate(ms: int) -> void:
	if Save.get_value("vibration") and OS.has_feature("mobile"):
		Input.vibrate_handheld(ms)


func _play_stream(stream: AudioStream) -> void:
	for p in _players:
		if not p.playing:
			p.stream = stream
			p.play()
			return
	_players[0].stream = stream
	_players[0].play()


func _set_bus_volume(bus: String, linear: float) -> void:
	var idx := AudioServer.get_bus_index(bus)
	AudioServer.set_bus_mute(idx, linear <= 0.001)
	AudioServer.set_bus_volume_db(idx, linear_to_db(maxf(linear, 0.001)))
