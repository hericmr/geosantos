# GeoSantos en Godot — Planning

Rehacer GeoSantos como un juego de verdad en **Godot 4**, pensado primero para el celular, sin depender de Leaflet ni del DOM. El juego React actual sigue en línea hasta que la versión Godot lo supere.

---

## 1. Objetivos

1. **Sentirse un juego, no un sitio:** pantalla completa, escenas con transiciones, animaciones, sonido y feedback táctil.
2. **Mobile-first:** vertical por defecto, se adapta a cualquier tamaño y respeta el notch y la safe area. En desktop se juega igual con el mouse.
3. **Mismo contenido:** los 59 barrios y los 242 lugares, con sus textos históricos y categorías.
4. **Distribución:**
   - Fase 1: web (GitHub Pages, por link).
   - Fase 2: APK/AAB de Android.
   - iOS es opcional y queda para después.
5. **Abierto:** proyecto MIT/libre, que cualquier estudiante pueda abrir en Godot sin crear una cuenta.

## 2. Qué se reutiliza del proyecto actual

| Recurso | Origen | Uso en Godot |
|---|---|---|
| 59 polígonos de barrios | `public/data/bairros.geojson` (`NOME`) | Mapa dibujado con `Polygon2D` |
| 242 lugares | `src/data/famous_places.json` | Rondas del modo Lugares |
| Reglas de puntuación | `src/utils/gameConstants.ts`, `src/utils/shared/scoring.ts` | Portadas a `Scoring.gd` |
| Ranking | Supabase, tabla `ranking` | API REST vía `HTTPRequest` |
| Audios | `public/assets/audio/*` (música, acierto, error y voces "olha, confundiu Santos com…") | `AudioStreamPlayer` |
| Sprites | `public/assets/marker_bandeira_lugar_correto*`, `markerclick`, `bandeira1/2.png`, `logo.png` | `AnimatedSprite2D` |
| Fuentes | `public/fonts/*`, `laCartoonerie.TTF` | `FontFile` (verificar los acentos) |

Datos relevados:
- Los barrios cubren la parte insular de Santos: lon −46.40 a −46.29 y lat −23.99 a −23.92, con unos 19 mil vértices.
- Los lugares por categoría son Salud 70, Asistencia Social 49, Ocio 30, Educación 23, Patrimonio Histórico 22 y otras.
- 120 de los 242 lugares tienen `imageUrl`.

## 3. Stack y versiones

- **Godot 4.x estable** (4.5 o más reciente), con **GDScript** tipado.
- **Renderer Compatibility** (GL ES 3 / WebGL 2): es el más liviano y el que mejor anda en celulares modestos y en la web.
- Exportación web **single-thread**, sin depender de los headers COOP/COEP, porque GitHub Pages no permite configurarlos.
- Un script Python (en `scripts/`) para preprocesar los datos.
- CI con GitHub Actions: export headless a web y deploy a Pages.

## 4. Estructura del proyecto

```
godot/
├── project.godot
├── autoload/
│   ├── Game.gd            # estado global: modo, partida actual, settings
│   ├── Data.gd            # carga barrios y lugares (JSON preprocesado)
│   ├── Save.gd            # progreso local (user://save.json)
│   ├── Api.gd             # Supabase REST (ranking)
│   └── Sfx.gd             # música y efectos, volumen y mute
├── core/
│   ├── GeoProjection.gd   # lat/lon ↔ coordenadas del mundo (metros)
│   ├── Scoring.gd         # puntuación, rachas, bonus de tiempo (portado del TS)
│   └── RoundGenerator.gd  # sorteo de rondas sin repetición, filtro por categoría
├── scenes/
│   ├── Boot.tscn          # splash y carga de datos
│   ├── MainMenu.tscn      # jugar, modos, ranking, opciones, créditos
│   ├── ModeSelect.tscn    # Barrios / Lugares / (futuro) Desafío diario
│   ├── Match.tscn         # la partida: mapa + HUD
│   ├── map/
│   │   ├── SantosMap.tscn # Node2D con los Polygon2D de los barrios, mar y decorado
│   │   ├── MapCamera.gd   # Camera2D con paneo, pinch-zoom, límites y tweens
│   │   └── Pin.tscn       # marcador del jugador (arrastrable)
│   ├── hud/
│   │   ├── TopBar.tscn    # objetivo de la ronda, tiempo, puntaje, racha
│   │   ├── ConfirmButton.tscn
│   │   └── RoundResult.tscn  # distancia, puntos, texto del lugar, "siguiente"
│   ├── Results.tscn       # fin de partida, estadísticas, guardar en el ranking
│   └── Leaderboard.tscn
├── ui/theme/
│   └── geosantos_theme.tres   # theme único: fuentes, colores, botones
├── data/
│   ├── bairros.json       # generado por el script (proyectado y simplificado)
│   └── places.json        # generado por el script
└── assets/ (audio/, sprites/, fonts/)
```

Flujo de escenas: `Boot → MainMenu → ModeSelect → Match → Results → (MainMenu | Match)`. Las transiciones usan un `CanvasLayer` con fade o wipe que vive en un autoload.

## 5. Pipeline de datos

Script `scripts/export_godot_data.py`, que se corre una vez o cuando cambian los datos:

1. Lee `bairros.geojson` y `famous_places.json`.
2. **Proyecta** lat/lon a metros locales con una equirectangular centrada en Santos (`x = (lon − lon0) · cos(lat0) · 111320`, `y = −(lat − lat0) · 110540`). En un área de unos 11 km el error es despreciable.
3. **Simplifica** los polígonos con Douglas-Peucker y una tolerancia de unos 3–5 m, para bajar de unos 19 mil a unos 5 mil vértices.
4. Valida los polígonos (sin auto-intersecciones; si las hay, `Geometry2D.triangulate_polygon` falla) y calcula el **centroide** de cada barrio para ubicar etiquetas.
5. Limpia la descripción de los lugares: quita el markdown o lo convierte a BBCode para `RichTextLabel`.
6. Escribe `godot/data/bairros.json` y `godot/data/places.json`.

La distancia real para la puntuación se calcula con **haversine** sobre lat/lon originales, igual que hoy, y no en coordenadas de pantalla.

**Pendiente:** el GeoJSON no tiene la línea de costa ni los municipios vecinos. Para que el mapa se vea como una isla se necesita:
- un polígono de mar de fondo;
- el contorno de São Vicente, Guarujá y la parte continental, como decorado no jugable, sacado de OpenStreetMap (ODbL, con atribución).

## 6. El mapa (lo que lo hace un juego)

- **Render propio:** cada barrio es un `Polygon2D` con relleno y un `Line2D` para el borde. Nada de tiles: el estilo es ilustrado, con paleta caiçara, mar animado con un shader simple de ondas y sombra suave bajo la isla.
- **Estados visuales de un barrio:** neutro, hover/tocado, correcto (pulso verde), error (sacudida roja) y revelado (se pinta y aparece el nombre).
- **Cámara (`MapCamera.gd`):**
  - Paneo con un dedo o arrastrando el mouse, con inercia.
  - **Pinch-zoom** con dos dedos (manejo manual de `InputEventScreenTouch`/`ScreenDrag` por índice, más `InputEventMagnifyGesture` en trackpad) y rueda del mouse.
  - Zoom limitado entre la isla entera y el nivel de cuadra, con límites de paneo.
  - Tweens para "volar" a la respuesta correcta después de cada ronda.
- **Tocar vs. arrastrar:** si el dedo se mueve menos de unos 10 px y dura menos de unos 250 ms, es un toque. Si no, es un paneo. Esto resuelve el problema principal que hoy tiene el celular.
- **Pin + Confirmar:** en el celular, un toque **coloca el pin** (que se puede arrastrar para ajustar) y un botón grande **Confirmar** cierra la respuesta. En desktop se puede activar "clic = confirmar" en las opciones.
- **Resultado de la ronda:**
  - Línea animada del pin a la respuesta, que se dibuja de a poco.
  - Bandera animada con el sprite de 16 frames ya existente.
  - Partículas, contador de puntos que sube, vibración (`Input.vibrate_handheld`) y una voz cómica si el error es grande.

## 7. Reglas del juego (fase 1: paridad con el actual)

Se portan tal cual las constantes de `gameConstants.ts`:

- **Barrios:** se muestra el nombre y el jugador toca dentro del polígono.
  - Si toca dentro: 1000 + hasta 2000 por tiempo.
  - Si toca cerca del borde: 600 + hasta 1400.
  - Si toca fuera: puntuación decreciente con la distancia, hasta 2000 m.
- **Lugares:** se muestra nombre, foto y categoría.
  - Dentro de 300 m es acierto: 1000 + hasta 2000 por tiempo.
  - Más lejos: decreciente con la distancia.
- **Racha:** +10% por acierto seguido, hasta +50%.
- **Tiempo:** 15 s iniciales con bonus por desempeño (hasta 4 s en barrios y 5 s en lugares). Este es el modo **Arcade** de hoy.

Dejarlo como modo Arcade preserva lo que ya funciona. Los modos nuevos van en la fase 4.

## 8. Interfaz responsiva

- Resolución base **720×1280 vertical**, `stretch_mode = canvas_items` y `aspect = expand`. En horizontal o desktop, el HUD se reacomoda a los costados con contenedores y anclas, no con posiciones fijas.
- **Safe area:** se lee `DisplayServer.get_display_safe_area()` para no tapar el notch ni la barra de gestos.
- Un único `Theme` (`geosantos_theme.tres`), con botones de al menos 48 dp, textos legibles en 5" y alto contraste.
- La descripción de los lugares va en un `RichTextLabel` con scroll, dentro de una hoja inferior (bottom sheet) que se desliza.

## 9. Backend (Supabase)

- `Api.gd` con `HTTPRequest` a `https://<proyecto>.supabase.co/rest/v1/ranking`, con los headers `apikey` y `Authorization: Bearer <anon>`.
  - `GET ?select=*&order=score.desc&limit=10`
  - `POST` con `player_name, score, play_time, rounds_played, accuracy`
- La clave anon va en el build, igual que hoy. Hay que **revisar las políticas RLS** de la tabla `ranking`: solo insert y select, sin update ni delete.
- **Modo offline:** si la API falla, el juego sigue y el puntaje queda guardado localmente para reintentar.
- **Fotos de los lugares:** se descargan por `HTTPRequest`, se leen con `Image.load_*_from_buffer` y se cachean en `user://`. En la web depende de que el storage tenga CORS habilitado (el de Supabase lo tiene).
- El panel admin (`/admin/famous-places`) **sigue en React**: no tiene sentido rehacerlo en Godot.

## 10. Build y deploy

- `export_presets.cfg` versionado con los presets **Web** y **Android**.
- **GitHub Actions** (imagen `barichello/godot-ci` o setup de Godot headless):
  1. `godot --headless --export-release "Web" build/web/index.html`
  2. Publicar en Pages.
  - Durante el desarrollo se publica en una **subruta** (`/geosantos/jogo/`) para no pisar la versión React. Cuando la versión Godot la supere, pasa a la raíz.
- **Peso objetivo en web:** menos de 15 MB comprimido (gzip/brotli), con audio en Ogg Vorbis y sprites en WebP/atlas. Se muestra una barra de carga propia.
- **PWA:** el export web de Godot genera manifest y service worker. Con eso se puede "instalar" desde el navegador y funciona offline.
- **Android (fase 5):** keystore, AAB y ficha en Play Store.

## 11. Fases y entregables

| Fase | Entregable | Criterio de "listo" |
|---|---|---|
| **0. Setup** (1–2 días) | Proyecto Godot en `godot/`, script de datos, CI publicando un "hola mundo" en `/jogo/` | Se abre en el celular por link |
| **1. Mapa jugable** (1 semana) | `SantosMap` con los 59 barrios, cámara con paneo y pinch, tap vs. drag, pin + confirmar | En el celular se navega por el mapa sin trabas y se coloca el pin con precisión |
| **2. Partida mínima** (1 semana) | Modos Barrios y Lugares con la puntuación portada, tiempo, racha y resultado de ronda animado | Paridad de reglas con la versión React (mismos puntos ante el mismo toque) |
| **3. Juego completo** (1–2 semanas) | Menú, selección de modo, resultados, ranking Supabase, opciones de audio, transiciones, voces y partículas | Una partida entera de punta a punta sin tocar el juego viejo |
| **4. Más que un sitio** (2+ semanas) | Campaña por regiones con estrellas, desafío diario (misma semilla para todos), álbum de lugares descubiertos y logros, todo guardado en `user://` | Hay motivos para volver mañana |
| **5. Lanzamiento** | Godot pasa a la raíz de Pages, APK/AAB de Android, actualizar el README | La versión React queda archivada |

## 12. Riesgos y cómo mitigarlos

| Riesgo | Mitigación |
|---|---|
| Polígonos inválidos rompen la triangulación | Validarlos y corregirlos en el script Python (`shapely.make_valid`) |
| Rendimiento con unos 19 mil vértices en celulares modestos | Simplificar en el pipeline; un solo `Polygon2D` por barrio; renderer Compatibility |
| Primera carga web lenta en el celular | Pantalla de carga, assets comprimidos, PWA con caché |
| Fuentes sin acentos (ã, ç, é) | Probar cada fuente con "Mães, Jabaquara, Saboó, Conceiçãozinha"; si falla, usar un fallback (Noto Sans) |
| Audio bloqueado en la web hasta la primera interacción | Iniciar la música recién después del primer toque en el menú |
| Mapa "flotando" sin costa | Agregar contorno de OSM (sección 5) o, como mínimo, un mar estilizado |

## 13. Decisiones abiertas

1. **Estilo visual del mapa:** ¿ilustrado y plano (flat, colores caiçara) o pixel art (ya existe `pixel-art-ui.css`)?
2. **¿Agregamos la costa y los vecinos desde OSM** en la fase 1, o vamos con mar plano y lo sumamos después?
3. **¿Ranking por modo** (Barrios / Lugares / Diario) o uno solo, como hoy? Si es por modo, la tabla `ranking` necesita una columna `mode`.
4. **¿Quién instala Godot?** Hoy no está en la máquina. Se puede instalar por Flatpak (`org.godotengine.Godot`) o con el binario oficial.
