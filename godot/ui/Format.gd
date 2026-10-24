class_name Format
## Formato de números para pt-BR.


static func integer(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "." + s.right(3) + out
		s = s.left(s.length() - 3)
	return ("-" if n < 0 else "") + s + out


static func decimal(x: float) -> String:
	return ("%.1f" % x).replace(".", ",")


static func distance(m: float) -> String:
	if m < 1000.0:
		return "%d m" % roundi(m)
	return "%s km" % decimal(m / 1000.0)


static func duration(seconds: float) -> String:
	var s := roundi(seconds)
	return "%d:%02d" % [s / 60, s % 60]
