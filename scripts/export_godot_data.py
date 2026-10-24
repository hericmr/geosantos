#!/usr/bin/env python3
# Genera los datos del juego Godot a partir de los datos del juego React:
#   python3 scripts/export_godot_data.py
#
# Proyecta lat/lon a metros locales (equirectangular centrada en Santos),
# simplifica los polígonos y convierte las descripciones de markdown a BBCode.

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BAIRROS_SRC = ROOT / "public/data/bairros.geojson"
PLACES_SRC = ROOT / "src/data/famous_places.json"
OUT_DIR = ROOT / "godot/data"

SIMPLIFY_TOLERANCE_M = 3.0
# Lugares más lejos que esto del centro de Santos tienen coordenadas erróneas.
MAX_PLACE_DISTANCE_M = 25000.0
M_PER_DEG_LAT = 110540.0
M_PER_DEG_LON = 111320.0


def douglas_peucker(points, tol):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    seg_len = math.hypot(dx, dy)
    max_d, idx = 0.0, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        if seg_len == 0:
            d = math.hypot(px - x1, py - y1)
        else:
            d = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / seg_len
        if d > max_d:
            max_d, idx = d, i
    if max_d <= tol:
        return [points[0], points[-1]]
    left = douglas_peucker(points[: idx + 1], tol)
    right = douglas_peucker(points[idx:], tol)
    return left[:-1] + right


def simplify_ring(ring, tol):
    # El anillo viene cerrado (primer punto == último); se parte en dos mitades
    # para que Douglas-Peucker no colapse el polígono a una línea.
    if ring[0] == ring[-1]:
        ring = ring[:-1]
    half = len(ring) // 2
    a = douglas_peucker(ring[: half + 1], tol)
    b = douglas_peucker(ring[half:] + [ring[0]], tol)
    return a[:-1] + b[:-1]


def _cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def find_self_intersection(ring):
    n = len(ring)
    for i in range(n):
        a, b = ring[i], ring[(i + 1) % n]
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            c, d = ring[j], ring[(j + 1) % n]
            if _cross(a, b, c) * _cross(a, b, d) < 0 and _cross(c, d, a) * _cross(c, d, b) < 0:
                return i, j
    return None


def clean_ring(ring):
    # Quita vértices repetidos y corta los pequeños lazos que cruzan el propio borde,
    # porque Godot no puede triangular polígonos con autointersecciones.
    seen, out = set(), []
    for p in ring:
        if p not in seen:
            seen.add(p)
            out.append(p)
    while (hit := find_self_intersection(out)) is not None:
        i, j = hit
        if j - i <= len(out) // 2:
            out = out[: i + 1] + out[j + 1 :]
        else:
            out = out[i + 1 : j + 1]
    return out


def ring_area_centroid(ring):
    area = cx = cy = 0.0
    n = len(ring)
    for i in range(n):
        x0, y0 = ring[i]
        x1, y1 = ring[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        area += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    area *= 0.5
    if area == 0:
        return 0.0, (sum(p[0] for p in ring) / n, sum(p[1] for p in ring) / n)
    return area, (cx / (6 * area), cy / (6 * area))


def md_to_bbcode(text):
    text = text.replace("\r\n", "\n").strip()
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r"[url=\2]\1[/url]", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"[b]\1[/b]", text)
    text = text.replace("**", "")
    return text


def main():
    geo = json.loads(BAIRROS_SRC.read_text(encoding="utf-8"))
    places_src = json.loads(PLACES_SRC.read_text(encoding="utf-8"))

    lons = [c[0] for f in geo["features"] for c in f["geometry"]["coordinates"][0]]
    lats = [c[1] for f in geo["features"] for c in f["geometry"]["coordinates"][0]]
    lon0 = (min(lons) + max(lons)) / 2
    lat0 = (min(lats) + max(lats)) / 2
    k_lon = M_PER_DEG_LON * math.cos(math.radians(lat0))

    def project(lon, lat):
        # Godot usa Y hacia abajo, por eso se invierte la latitud.
        return (round((lon - lon0) * k_lon, 1), round(-(lat - lat0) * M_PER_DEG_LAT, 1))

    neighborhoods = []
    total_in = total_out = 0
    for f in geo["features"]:
        ring = [project(lon, lat) for lon, lat in f["geometry"]["coordinates"][0]]
        simple = clean_ring(simplify_ring(ring, SIMPLIFY_TOLERANCE_M))
        area, centroid = ring_area_centroid(simple)
        if area < 0:
            simple.reverse()
        total_in += len(ring)
        total_out += len(simple)
        neighborhoods.append({
            "name": f["properties"]["NOME"].strip(),
            "centroid": [round(centroid[0], 1), round(centroid[1], 1)],
            "area_m2": round(abs(area)),
            "polygon": [list(p) for p in simple],
        })
    neighborhoods.sort(key=lambda n: n["name"])

    all_pts = [p for n in neighborhoods for p in n["polygon"]]
    bounds = {
        "min_x": min(p[0] for p in all_pts), "max_x": max(p[0] for p in all_pts),
        "min_y": min(p[1] for p in all_pts), "max_y": max(p[1] for p in all_pts),
    }

    places = []
    for p in places_src:
        lat, lon = p["latitude"], p["longitude"]
        # Algunos lugares tienen la longitud sin el signo negativo.
        if lon > 0:
            lon = -lon
            print(f"  corregido signo de longitud: {p['name']}")
        x, y = project(lon, lat)
        if math.hypot(x, y) > MAX_PLACE_DISTANCE_M:
            print(f"  descartado (coordenadas fuera de Santos): {p['name']} ({lat}, {lon})")
            continue
        places.append({
            "id": str(p["id"]),
            "name": p["name"].strip(),
            "category": p.get("category") or "",
            "description": md_to_bbcode(p.get("description") or ""),
            "address": p.get("address") or "",
            "image_url": p.get("imageUrl") or "",
            "lat": lat,
            "lon": lon,
            "pos": [x, y],
        })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    meta = {"origin": {"lat": lat0, "lon": lon0}, "bounds": bounds}
    (OUT_DIR / "bairros.json").write_text(
        json.dumps({**meta, "neighborhoods": neighborhoods}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    (OUT_DIR / "places.json").write_text(
        json.dumps({**meta, "places": places}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"{len(neighborhoods)} bairros: {total_in} -> {total_out} vértices")
    print(f"{len(places)} lugares")


if __name__ == "__main__":
    main()
