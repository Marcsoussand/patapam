#!/usr/bin/env python3
"""Génère le SQL seed pour les félicitations FR à partir d'un dossier de .m4a.

Usage :
  python supabase/scripts/generate_congrats_seed.py "C:/chemin/vers/congrats"
  → copier la sortie dans le SQL Editor Supabase

Les fichiers doivent correspondre aux uploads Storage :
  patapam-audio/shared/fr/congrats/{nom}.m4a
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def clip_key_from_stem(stem: str) -> str:
    key = stem.lower().strip()
    key = re.sub(r"[^a-z0-9]+", "_", key)
    return key.strip("_") or "clip"


def label_from_stem(stem: str) -> str:
    text = stem.replace("-", " ").replace("_", " ").strip()
    if not text:
        return "Félicitations"
    return text[0].upper() + text[1:] + (" !" if not text.endswith("!") else "")


def main() -> None:
    if len(sys.argv) != 2:
        print(__doc__.strip(), file=sys.stderr)
        sys.exit(1)

    folder = Path(sys.argv[1])
    files = sorted(folder.glob("*.m4a"))
    if not files:
        print(f"Aucun fichier .m4a dans {folder}", file=sys.stderr)
        sys.exit(1)

    print("-- Seed congrats FR — généré par generate_congrats_seed.py")
    print(f"-- {len(files)} fichier(s)\n")
    print("INSERT INTO audio_clips (clip_key, category, locale, label, storage_path, sort_order)")
    print("VALUES")

    rows: list[str] = []
    for index, path in enumerate(files, start=1):
        key = clip_key_from_stem(path.stem)
        label = label_from_stem(path.stem).replace("'", "''")
        storage_path = f"shared/fr/congrats/{path.name}"
        rows.append(
            f"  ('{key}', 'congrats', 'fr', '{label}', '{storage_path}', {index})"
        )

    print(",\n".join(rows))
    print(
        "ON CONFLICT (clip_key, locale) WHERE voice_profile_id IS NULL DO UPDATE SET"
    )
    print("  label = EXCLUDED.label,")
    print("  storage_path = EXCLUDED.storage_path,")
    print("  sort_order = EXCLUDED.sort_order,")
    print("  is_active = true;")


if __name__ == "__main__":
    main()
