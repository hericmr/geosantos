class_name RoundGenerator
extends RefCounted
## Sortea objetivos sin repetir hasta agotar la lista; después vuelve a barajar
## evitando que el primero de la nueva tanda sea igual al último.

var _items: Array
var _bag: Array = []
var _last: Variant = null


func _init(items: Array) -> void:
	_items = items.duplicate()


func next() -> Variant:
	if _bag.is_empty():
		_bag = _items.duplicate()
		_bag.shuffle()
		if _bag.size() > 1 and _bag.back() == _last:
			_bag.reverse()
	_last = _bag.pop_back()
	return _last
