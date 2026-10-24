#!/usr/bin/env python3
# Escribe godot/data/supabase.json (no versionado) con la URL y la clave anon de Supabase,
# tomadas de VITE_SUPABASE_URL / VITE_SUPABASE_KEY del entorno o del .env:
#   python3 scripts/write_godot_supabase_config.py

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "godot/data/supabase.json"


def read_dotenv():
    env = {}
    path = ROOT / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def main():
    env = {**read_dotenv(), **os.environ}
    url, key = env.get("VITE_SUPABASE_URL", ""), env.get("VITE_SUPABASE_KEY", "")
    if not url or not key:
        print("Faltan VITE_SUPABASE_URL / VITE_SUPABASE_KEY: el ranking quedará desactivado", file=sys.stderr)
    OUT.write_text(json.dumps({"url": url, "key": key}), encoding="utf-8")
    print(f"escrito {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
