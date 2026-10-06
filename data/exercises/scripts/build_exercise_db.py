#!/usr/bin/env python3
"""Regenera data/exercises para uso offline.

Fuente de los datos y de las fotos:
  yuhonas/free-exercise-db @ UPSTREAM_COMMIT (Unlicense)
  https://github.com/yuhonas/free-exercise-db

Las instrucciones en español parten de la traducción pública (también
Unlicense) de 0x10-z/free-exercise-db-es @ ES_COMMIT y se corrigen con el
glosario de este script. Los nombres no usan esa traducción: salen de
name_es.py. Los músculos, el equipo, la categoría y el nivel se traducen
aquí, no en el fork (allí «barbell» y «dumbbell» acabaron ambos como
«mancuerna», y «abductors» como «secuestradores»).

Tres ejercicios del upstream no traen imágenes (Kettlebell Halo y dos
variantes). No se incluyen: la ficha exige al menos una foto local.

Uso:
  python3 data/exercises/scripts/build_exercise_db.py
  python3 data/exercises/scripts/build_exercise_db.py --skip-images
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image

from name_es import translate_name

UPSTREAM_REPO = "https://github.com/yuhonas/free-exercise-db.git"
UPSTREAM_COMMIT = "f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5"
ES_COMMIT = "8615dab5028eca3ff069b1848f40b8c0a27fb393"
ES_URL = (
    "https://raw.githubusercontent.com/0x10-z/free-exercise-db-es/"
    f"{ES_COMMIT}/dist/exercises_es.json"
)

ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = ROOT / "data" / "exercises"
IMAGE_DIR = OUT_DIR / "images"

MUSCLES = {
    "abdominals": ("abdominales", "Abdominales"),
    "abductors": ("abductores", "Abductores"),
    "adductors": ("aductores", "Aductores"),
    "biceps": ("biceps", "Bíceps"),
    "calves": ("gemelos", "Gemelos"),
    "chest": ("pecho", "Pecho"),
    "forearms": ("antebrazos", "Antebrazos"),
    "glutes": ("gluteos", "Glúteos"),
    "hamstrings": ("isquiotibiales", "Isquiotibiales"),
    "lats": ("dorsales", "Dorsales"),
    "lower back": ("lumbares", "Lumbares"),
    "middle back": ("espalda-media", "Espalda media"),
    "neck": ("cuello", "Cuello"),
    "quadriceps": ("cuadriceps", "Cuádriceps"),
    "shoulders": ("hombros", "Hombros"),
    "traps": ("trapecios", "Trapecios"),
    "triceps": ("triceps", "Tríceps"),
}

EQUIPMENT = {
    "medicine ball": ("balon-medicinal", "Balón medicinal"),
    "dumbbell": ("mancuernas", "Mancuernas"),
    "body only": ("peso-corporal", "Peso corporal"),
    "bands": ("bandas", "Bandas elásticas"),
    "kettlebells": ("pesas-rusas", "Pesas rusas"),
    "foam roll": ("rodillo", "Rodillo de espuma"),
    "cable": ("polea", "Polea"),
    "machine": ("maquina", "Máquina"),
    "barbell": ("barra", "Barra"),
    "exercise ball": ("pelota", "Pelota de ejercicio"),
    "e-z curl bar": ("barra-z", "Barra Z"),
    "other": ("otro", "Otro"),
    None: ("sin-especificar", "Sin especificar"),
}

CATEGORIES = {
    "strength": ("fuerza", "Fuerza"),
    "stretching": ("estiramiento", "Estiramiento"),
    "cardio": ("cardio", "Cardio"),
    "plyometrics": ("pliometria", "Pliometría"),
    "powerlifting": ("powerlifting", "Powerlifting"),
    "olympic weightlifting": ("halterofilia", "Halterofilia"),
    "strongman": ("strongman", "Strongman"),
}

LEVELS = {
    "beginner": ("principiante", "Principiante"),
    "intermediate": ("intermedio", "Intermedio"),
    "expert": ("avanzado", "Avanzado"),
}

FORCES = {
    "push": ("empuje", "Empuje"),
    "pull": ("traccion", "Tracción"),
    "static": ("estatico", "Estático"),
    None: None,
}

MECHANICS = {
    "compound": ("compuesto", "Compuesto"),
    "isolation": ("aislamiento", "Aislamiento"),
    None: None,
}

# Imperativos de usted que se cuelan en la traducción base, pasados a tú.
TU_FIXES: list[tuple[str, str]] = [
    (r"\bAcuéstese\b", "Acuéstate"),
    (r"\bacuéstese\b", "acuéstate"),
    (r"\bSiéntese\b", "Siéntate"),
    (r"\bsiéntese\b", "siéntate"),
    (r"\bColóquese\b", "Colócate"),
    (r"\bcolóquese\b", "colócate"),
    (r"\bColoque\b", "Coloca"),
    (r"\bcoloque\b", "coloca"),
    (r"\bPóngase\b", "Ponte"),
    (r"\bpóngase\b", "ponte"),
    (r"\bPárese\b", "Ponte de pie"),
    (r"\bpárese\b", "ponte de pie"),
    (r"\bManténgalo\b", "Mantenlo"),
    (r"\bmanténgalo\b", "mantenlo"),
    (r"\bMantenga\b", "Mantén"),
    (r"\bmantenga\b", "mantén"),
    (r"\bSostenga\b", "Sostén"),
    (r"\bsostenga\b", "sostén"),
    (r"\bAsegúrese\b", "Asegúrate"),
    (r"\basegúrese\b", "asegúrate"),
    (r"\bComience\b", "Comienza"),
    (r"\bcomience\b", "comienza"),
    (r"\bRepita\b", "Repite"),
    (r"\brepita\b", "repite"),
    (r"\bRepetir\b", "Repite"),
    (r"\bRecupérese\b", "Recupérate"),
    (r"\brecupérese\b", "recupérate"),
    (r"\bContinúe\b", "Continúa"),
    (r"\bcontinúe\b", "continúa"),
    (r"\bInhale\b", "Inhala"),
    (r"\binhale\b", "inhala"),
    (r"\bExhale\b", "Exhala"),
    (r"\bexhale\b", "exhala"),
    (r"\bFlexione\b", "Flexiona"),
    (r"\bflexione\b", "flexiona"),
    (r"\bBaje\b", "Baja"),
    (r"\bbaje\b", "baja"),
    (r"\bJale\b", "Jala"),
    (r"\bjale\b", "jala"),
    (r"\bjales\b", "jalas"),
    (r"\bMueva\b", "Mueve"),
    (r"\bmueva\b", "mueve"),
    (r"\bLevante\b", "Levanta"),
    (r"\blevante\b", "levanta"),
    (r"\bEmpuje\b", "Empuja"),
    (r"\bAgarre\b", "Agarra"),
    (r"\bUtilice\b", "Utiliza"),
    (r"\butilice\b", "utiliza"),
    (r"\bCargue\b", "Carga"),
    (r"\bAsegure\b", "Asegura"),
    (r"\basegure\b", "asegura"),
    (r"\bAjuste\b", "Ajusta"),
    (r"\bajuste\b", "ajusta"),
    (r"\bExtienda\b", "Extiende"),
    (r"\bextienda\b", "extiende"),
    (r"\bGire\b", "Gira"),
    (r"\bgire\b", "gira"),
    (r"\bRegrese\b", "Regresa"),
    (r"\bregrese\b", "regresa"),
    (r"\bAlejarse del (?:soporte|rack) y posicionar", "Aléjate del soporte y coloca"),
    (r"\bAleiate\b", "Aléjate"),
    (r"\bAleiate\b", "Aléjate"),
    (r"\bAlejate\b", "Aléjate"),
    (r"\bmanténgala\b", "mantenla"),
    (r"\bManténgala\b", "Mantenla"),
    (r"\bmanténgalos\b", "mantenlos"),
    (r"\bsosténgala\b", "sostenla"),
    (r"\bSosténgala\b", "Sostenla"),
    (r"\bsosténgalos\b", "sostenlos"),
    (r"\bcolóquelos\b", "colócalos"),
    (r"\bColóquelos\b", "Colócalos"),
    (r"\bdéjela\b", "déjala"),
    (r"\bDéjela\b", "Déjala"),
    (r"\basegúrelas\b", "asegúralas"),
    (r"\basegúrelo\b", "asegúralo"),
    (r"(^|(?<=\. ))Sus\b", r"\1Tus"),
    (r"\bCaminar\b", "Camina"),
    (r"\bDesplazarse\b", "Desplázate"),
    (r"\bDoble las\b", "Dobla las"),
    (r"\bdoble las\b", "dobla las"),
    (r"\bDoble los\b", "Dobla los"),
    (r"\bdoble los\b", "dobla los"),
    (r"\bDoble ligeramente\b", "Dobla ligeramente"),
    (r"\bdoble ligeramente\b", "dobla ligeramente"),
]

# «Clean» en inglés se tradujo como lavar (limpiar). En halterofilia es la cargada.
CLEAN_FIXES: list[tuple[str, str]] = [
    (r"Limpiar y presionar", "Haz la cargada y luego el press de"),
    (r"limpiar y presionar", "haz la cargada y luego el press de"),
    (r"hacer una limpieza", "hacer la cargada"),
    (r"comenzar a limpiar", "empezar la cargada"),
    (r"Comienza a limpiar el tronco", "Empieza la cargada del tronco"),
    (r"comienza a limpiar el tronco", "empieza la cargada del tronco"),
    (r"Comienza a limpiar", "Empieza a hacer la cargada de"),
    (r"comienza a limpiar", "empieza a hacer la cargada de"),
    (r"completar la limpieza", "completar la cargada"),
    (r"posición limpia", "agarre de cargada"),
    (r"para comenzar la limpieza", "para empezar la cargada"),
    (r"posición de limpieza", "posición de cargada"),
    (r"levantamiento limpio", "cargada"),
    (r"pesa rusa limpiada", "pesa rusa que acabas de subir en cargada"),
    (r"Limpia dos kettlebells hasta los hombros", "Haz la cargada de dos pesas rusas hasta los hombros"),
    (r"Limpia dos pesas rusas hasta los hombros", "Haz la cargada de dos pesas rusas hasta los hombros"),
    (r"Limpia dos pesas rusas hasta tus hombros", "Haz la cargada de dos pesas rusas hasta los hombros"),
    (r"Limpia dos pesas rusas a tus hombros", "Haz la cargada de dos pesas rusas hasta los hombros"),
    (r"Limpiar dos pesas rusas hasta tus hombros", "Haz la cargada de dos pesas rusas hasta los hombros"),
    (r"Limpia las pesas rusas hasta tus hombros", "Haz la cargada de las pesas rusas hasta los hombros"),
    (r"Limpia las pesas rusas hasta los hombros", "Haz la cargada de las pesas rusas hasta los hombros"),
    (r"Limpie las pesas rusas hasta los hombros", "Haz la cargada de las pesas rusas hasta los hombros"),
    (r"Limpia una pesa rusa hasta el hombro", "Haz la cargada de una pesa rusa hasta el hombro"),
    (r"Limpia una pesa rusa hasta tu hombro", "Haz la cargada de una pesa rusa hasta el hombro"),
    (r"Limpiar la pesa rusa hasta el hombro", "Haz la cargada de la pesa rusa hasta el hombro"),
    (r"Limpie la pesa rusa hasta sus hombros", "Haz la cargada de la pesa rusa hasta los hombros"),
    (r"Limpia la pesa rusa hasta tus hombros", "Haz la cargada de la pesa rusa hasta los hombros"),
    (r"Limpia la pesa rusa hasta tu hombro", "Haz la cargada de la pesa rusa hasta el hombro"),
    (r"Limpia la pesa rusa hasta el hombro", "Haz la cargada de la pesa rusa hasta el hombro"),
    (r"Limpia la pesa rusa hacia tus hombros", "Haz la cargada de la pesa rusa hacia los hombros"),
    (r"Limpia la pesa rusa hacia tu hombro", "Haz la cargada de la pesa rusa hacia el hombro"),
    (r"Limpia la pesa rusa extendiendo", "Haz la cargada de la pesa rusa extendiendo"),
    (r"Limpie la pesa rusa hasta", "Haz la cargada de la pesa rusa hasta"),
    (r"limpie la pesa rusa alternativa", "haz la cargada con la otra pesa rusa"),
    (r"Limpiar la mancuerna", "Haz la cargada de la mancuerna"),
    (r"Limpia la mancuerna hasta", "Haz la cargada de la mancuerna hasta"),
    (r"limpia la mancuerna para", "haz la cargada de la mancuerna para"),
    (r"limpia las mancuernas de uno en uno", "haz la cargada de las mancuernas de una en una"),
    (r"limpia las pesas de una en una", "haz la cargada de las pesas de una en una"),
    (r"Limpia la pesa rusa", "Haz la cargada de la pesa rusa"),
    (r"Limpia la pesa", "Haz la cargada de la pesa"),
    (r"Limpia las pesas", "Haz la cargada de las pesas"),
]

TERM_FIXES: list[tuple[str, str]] = [
    (r"\bpesas?\s+kettlebells?\b", "pesas rusas"),
    (r"\bkettlebells\b", "pesas rusas"),
    (r"\bKettlebells\b", "Pesas rusas"),
    (r"\bkettlebell\b", "pesa rusa"),
    (r"\bKettlebell\b", "Pesa rusa"),
    (r"\bdumbbells\b", "mancuernas"),
    (r"\bDumbbells\b", "Mancuernas"),
    (r"\bdumbbell\b", "mancuerna"),
    (r"\bDumbbell\b", "Mancuerna"),
    (r"\bpull-?ups?\b", "dominadas"),
    (r"\bPull-?ups?\b", "Dominadas"),
    (r"\blos mancuernas\b", "las mancuernas"),
    (r"\bLos mancuernas\b", "Las mancuernas"),
    (r"\bel mancuerna\b", "la mancuerna"),
    (r"\bEl mancuerna\b", "La mancuerna"),
    (r"\bun mancuerna\b", "una mancuerna"),
    (r"\bUn mancuerna\b", "Una mancuerna"),
    (r"\blas omóplatos\b", "los omóplatos"),
    (r"\bLas omóplatos\b", "Los omóplatos"),
    (r"\blas omoplatos\b", "los omóplatos"),
    (r"\bLas omoplatos\b", "Los omóplatos"),
    (r"\bmáquina de curl de piernas\b", "máquina de curl femoral"),
    (r"\bcurl de piernas\b", "curl femoral"),
    (r"\bcurl de pierna\b", "curl femoral"),
    (r"\bCurl de piernas\b", "Curl femoral"),
    (r"\bCurl de pierna\b", "Curl femoral"),
    (r"\bcon rizo\b", "en curl"),
    (r"\bde rizos\b", "de curl"),
    (r"\brizo de pierna\b", "curl femoral"),
    (r"\bvuelo inverso\b", "apertura inversa"),
    (r"\bVuelo inverso\b", "Apertura inversa"),
    (r"\bmentiros[oa]\b", "tumbado"),
    (r"\bMentiros[oa]\b", "Tumbado"),
    (r"\blats\b", "dorsales"),
    (r"\bLats\b", "Dorsales"),
    (r"\bpress de banco\b", "press de banca"),
    (r"\bPress de banco\b", "Press de banca"),
    (r"\bprensa de banco\b", "press de banca"),
    (r"\bPrensa de banco\b", "Press de banca"),
    (r"\bPrensa de banca\b", "Press de banca"),
    (r"\brack de potencia\b", "jaula de potencia"),
    (r"\brack de sentadillas\b", "jaula de sentadillas"),
    (r"\bdel rack\b", "del soporte"),
    (r"\bal rack\b", "al soporte"),
    (r"\ben el rack\b", "en el soporte"),
    (r"\ben un rack\b", "en un soporte"),
    (r"\bun rack\b", "un soporte"),
    (r"\bel rack\b", "el soporte"),
    (r"\bfarmer's walk\b", "paseo del granjero"),
    (r"\bfront squat\b", "sentadilla frontal"),
    (r"\bgood morning\b", "buenos días"),
    (r"\bGood Morning\b", "Buenos días"),
    (r"\bim[bB]éciles\b", "envión"),
    (r"tres a cuatro pulgadas", "8 a 10 cm"),
    (r"tres o cuatro pulgadas", "8 o 10 cm"),
    (r"unas cuatro pulgadas", "unos 10 cm"),
    (r"aproximadamente cuatro pulgadas", "unos 10 cm"),
    (r"alrededor de cuatro pulgadas", "unos 10 cm"),
    (r"aproximadamente una pulgada", "unos 2,5 cm"),
    (r"a una pulgada", "a 2,5 cm"),
    (r"3 y medio pulgadas", "9 cm"),
    (r"seis a ocho pulgadas", "15 a 20 cm"),
    (r"base de un estante", "base de un soporte"),
    (r"barra del estante", "barra del soporte"),
    (r"caja en un estante", "caja en un soporte"),
    (r"parte superior de un estante", "parte superior de un soporte"),
    (r"creando un estante", "creando un apoyo"),
    (r"crear un estante", "crear un apoyo"),
    (r"\bhaciendo filas sentado\b", "haciendo un remo sentado"),
    (r"\bbanco de prensa militar\b", "banco de press militar"),
    (r"\bmáquina de prensa de pecho\b", "máquina de press de pecho"),
    (r"\bLas prensas de clavija eliminan\b", "El press desde soportes elimina"),
    (r"\bprensas de clavija\b", "press desde soportes"),
    (r"\bvarios pies\b", "alrededor de un metro"),
    (r"\bAl polea\b", "A la polea"),
    (r"\bal polea\b", "a la polea"),
    (r"\bDel polea\b", "De la polea"),
    (r"\bdel polea\b", "de la polea"),
    (r"\bUn polea\b", "Una polea"),
    (r"\bun polea\b", "una polea"),
    (r"\bEl polea\b", "La polea"),
    (r"\bel polea\b", "la polea"),
    (r"\bsus hombros\b", "tus hombros"),
    (r"\bSus hombros\b", "Tus hombros"),
    (r"\bsus brazos\b", "tus brazos"),
    (r"\bSus brazos\b", "Tus brazos"),
    (r"\bsus manos\b", "tus manos"),
    (r"\bSus manos\b", "Tus manos"),
    (r"\bsus pies\b", "tus pies"),
    (r"\bSus pies\b", "Tus pies"),
    (r"\bsus muslos\b", "tus muslos"),
    (r"\bsus piernas\b", "tus piernas"),
    (r"\bSus piernas\b", "Tus piernas"),
    (r"\bsus rodillas\b", "tus rodillas"),
    (r"\bsus dedos\b", "tus dedos"),
    (r"\bsus bíceps\b", "tus bíceps"),
    (r"\bsus omóplatos\b", "tus omóplatos"),
    (r"\bsus glúteos\b", "tus glúteos"),
    (r"\bsus caderas\b", "tus caderas"),
    (r"\bsus trapecios\b", "tus trapecios"),
    (r"\bsus codos\b", "tus codos"),
    (r"\bTablón\b", "Plancha"),
    (r"\btablón\b", "plancha"),
    (r"\bConsejo:", "Consejo:"),
    (r"\bTip:", "Consejo:"),
]


def _format_cm(inches: float) -> str:
    cm = inches * 2.54
    if cm >= 10:
        return str(int(round(cm)))
    text = f"{cm:.1f}".rstrip("0").rstrip(".")
    return text


def _format_kg(pounds: float) -> str:
    return str(int(round(pounds * 0.45359237)))


def _convert_span(span: str, formatter) -> str:
    parts = re.split(r"\s*-\s*", span.strip())
    return "-".join(formatter(float(part)) for part in parts)


def convert_units(text: str) -> str:
    def inches(match: re.Match[str]) -> str:
        return _convert_span(match.group(1), _format_cm) + " cm"

    def pounds(match: re.Match[str]) -> str:
        return _convert_span(match.group(1), _format_kg) + " kg"

    text = re.sub(
        r"(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*pulgadas?",
        inches,
        text,
        flags=re.I,
    )
    text = re.sub(r"\bun par de pulgadas\b", "unos centímetros", text, flags=re.I)
    text = re.sub(r"\b(?:unas )?pocas pulgadas\b", "unos centímetros", text, flags=re.I)
    text = re.sub(
        r"(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*libras\b",
        pounds,
        text,
        flags=re.I,
    )
    return text


def apply_pairs(text: str, pairs: list[tuple[str, str]]) -> str:
    for pattern, replacement in pairs:
        text = re.sub(pattern, replacement, text)
    return text


def polish_step(spanish: str, english: str) -> str | None:
    """Corrige un paso. Devuelve None si el original inglés está vacío."""
    if not english or not english.strip():
        return None
    if "Sure, I can help" in spanish or "need to be translated" in spanish:
        return None

    text = spanish.strip()
    text = apply_pairs(text, TU_FIXES)
    text = apply_pairs(text, CLEAN_FIXES)
    text = apply_pairs(text, TERM_FIXES)
    text = convert_units(text)

    english_lower = english.lower()
    mentions_clean = re.search(r"\bclean\b", english_lower) is not None
    mentions_snatch = re.search(r"\bsnatch\b", english_lower) is not None
    mentions_jerk = re.search(r"\bjerk\b", english_lower) is not None
    if mentions_clean and not mentions_snatch:
        text = text.replace("movimiento de arranque", "movimiento de cargada")
        text = text.replace("para el arranque", "para la cargada")
        text = text.replace("del arranque", "de la cargada")
    if mentions_jerk and not mentions_snatch:
        text = text.replace("durante el arranque", "durante el envión")
        text = re.sub(r"\bjerk\b", "envión", text, flags=re.I)
    if re.search(r"\btwo feet\b", english_lower):
        text = re.sub(r"\bdos pies\b", "unos 60 cm", text)
    if re.search(r"\bone foot\b", english_lower):
        text = re.sub(r"\bun pie\b", "unos 30 cm", text)

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" +([,.;:])", r"\1", text)
    return text.strip()


def catalog_entries(mapping: dict) -> list[dict[str, str]]:
    entries = []
    seen: set[str] = set()
    for value in mapping.values():
        if value is None or value[0] in seen:
            continue
        seen.add(value[0])
        entries.append({"id": value[0], "nombre": value[1]})
    return entries


def build_catalogs() -> dict:
    return {
        "musculos": catalog_entries(MUSCLES),
        "equipo": catalog_entries(EQUIPMENT),
        "categorias": catalog_entries(CATEGORIES),
        "niveles": catalog_entries(LEVELS),
        "fuerza": catalog_entries(FORCES),
        "mecanica": catalog_entries(MECHANICS),
    }


def ensure_upstream(cache: Path) -> Path:
    if (cache / "dist" / "exercises.json").is_file() and (cache / "exercises").is_dir():
        return cache
    cache.parent.mkdir(parents=True, exist_ok=True)
    if not cache.exists():
        subprocess.run(
            ["git", "clone", "--depth", "1", UPSTREAM_REPO, str(cache)],
            check=True,
        )
    return cache


def ensure_spanish(path: Path) -> list[dict]:
    if not path.is_file():
        path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(ES_URL, path)
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("El JSON de instrucciones en español no es una lista")
    return data


def convert_image(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=80, method=4)


def write_license(upstream: Path) -> None:
    license_text = (upstream / "LICENSE.md").read_text(encoding="utf-8")
    if "unlicense.org" not in license_text:
        raise SystemExit("El LICENSE upstream no es el texto de la Unlicense")
    (OUT_DIR / "LICENSE").write_text(license_text, encoding="utf-8")


def write_credits() -> None:
    text = """# Créditos

Poder Fitness incluye una copia local de la base de ejercicios para poder usarla sin red.

## Datos e imágenes

- **Free Exercise DB**, de [yuhonas](https://github.com/yuhonas/free-exercise-db), commit `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`.
- La base reorganiza el conjunto de dominio público **exercises.json**, de [Ollie Jennings](https://github.com/OllieJennings) y [wrkout/exercises.json](https://github.com/wrkout/exercises.json).
- Licencia: **The Unlicense** (dominio público). El texto está en `LICENSE`, en esta misma carpeta. Se puede copiar, modificar y redistribuir, también con fines comerciales, sin pedir permiso.

## Español

- Nombres, músculos, equipo, categorías y niveles: glosario de gimnasio de Poder Fitness (`scripts/name_es.py` y `scripts/build_exercise_db.py`).
- Instrucciones: traducción de dominio público de [0x10-z/free-exercise-db-es](https://github.com/0x10-z/free-exercise-db-es), commit `8615dab5028eca3ff069b1848f40b8c0a27fb393`, revisada para términos de gimnasio (press de banca, peso muerto, sentadilla, dominadas, mancuernas, polea, curl femoral, cargada, arrancada, envión).

## Qué no entra

Tres fichas del upstream no tienen fotos (`Kettlebell Halo`, `Kettlebell Halo with Overhead Extension`, `Kettlebell Overhead Triceps Extension`). No se publican aquí.

## Instrucciones escritas aquí

`Push Press`, `Side Bridge`, `Side Jackknife`, `One-Arm Kettlebell Swings` e `Iron Cross` traen foto y cero pasos en el upstream. Los pasos en español y en inglés de esas cinco fichas están escritos en este paquete.
"""
    (OUT_DIR / "CREDITS.md").write_text(text, encoding="utf-8")


def write_readme(exercise_count: int, image_count: int, step_count: int) -> None:
    text = f"""# Base de ejercicios

Catálogo local para la PWA. No hace falta red ni volver a ejecutar el script para usarlo.

## Conteos

| | |
| --- | --- |
| Ejercicios | {exercise_count} |
| Imágenes | {image_count} |
| Pasos de instrucción | {step_count} |
| Idiomas en cada ficha | español (nombre e instrucciones) e inglés (original) |

Tres ejercicios del upstream se omiten porque no traen imágenes. Otros cinco (`Push Press`, `Side Bridge`, `Side Jackknife`, `One-Arm Kettlebell Swings`, `Iron Cross`) sí tienen foto, pero el upstream deja las instrucciones vacías: los pasos en español y en inglés los escribe este paquete.

## Archivos

- `exercises.json`: lista de ejercicios. Es el archivo que consume la app.
- `catalogs.json`: valores cerrados para filtros.
- `images/<id>/<n>.webp`: fotos. La ruta guardada en cada ficha es relativa a esta carpeta (`images/...`).
- `LICENSE`: texto de la Unlicense, copiado del upstream.
- `CREDITS.md`: atribución para la pantalla Acerca de.
- `scripts/build-exercise-db.mjs`: cómo se regeneró.

## Esquema de cada ejercicio

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | string | Identificador estable del upstream (`Alternate_Incline_Dumbbell_Curl`). |
| `nombre` | string | Nombre en español. |
| `nombreOriginal` | string | Nombre en inglés. |
| `instrucciones` | string[] | Pasos en español, en orden. |
| `instruccionesOriginal` | string[] | Los mismos pasos en inglés. |
| `musculosPrimarios` | string[] | Ids de `catalogs.json` → `musculos`. |
| `musculosSecundarios` | string[] | Ids de `musculos`. Puede ir vacío. |
| `equipo` | string | Id de `equipo`. `sin-especificar` si el upstream no lo traía. |
| `categoria` | string | Id de `categorias`. |
| `nivel` | string | Id de `niveles`. `expert` del upstream se muestra como Avanzado. |
| `fuerza` | string o null | Id de `fuerza`: empuje, tracción o estático. |
| `mecanica` | string o null | Id de `mecanica`: compuesto o aislamiento. |
| `imagenes` | string[] | Al menos una ruta relativa, por ejemplo `images/Plank/0.webp`. |

Los textos visibles (nombre del catálogo, con tildes) están en `catalogs.json`. El ejercicio guarda el `id` para que un retoque del rótulo no cambie los filtros.

`powerlifting` y `strongman` se dejan con el nombre del deporte. La halterofilia olímpica sí se llama Halterofilia.

## Cómo se generó

1. Clonar [free-exercise-db](https://github.com/yuhonas/free-exercise-db) en el commit `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`. La licencia del archivo `LICENSE.md` de ese repo es la Unlicense.
2. Tomar las instrucciones en español de [free-exercise-db-es](https://github.com/0x10-z/free-exercise-db-es) en `8615dab5028eca3ff069b1848f40b8c0a27fb393` (`dist/exercises_es.json`), también Unlicense.
3. Traducir nombres con `scripts/name_es.py` y músculos, equipo, categoría y nivel con el mapa de `scripts/build_exercise_db.py`.
4. Corregir las instrucciones: tú en vez de usted, cargada/arrancada/envión, curl femoral, mancuernas, polea, pulgadas a centímetros y libras a kilogramos.
5. Convertir cada JPG a WebP (calidad 80, lado mayor como máximo 1200 px) en `images/`.

```bash
node data/exercises/scripts/build-exercise-db.mjs
```

Opciones: `--skip-images` solo regenera el JSON. `--upstream` y `--spanish` apuntan a copias locales si no quieres descargar.

No usa Git LFS. Las fotos pesan menos que el límite de archivo de Git.
"""
    (OUT_DIR / "README.md").write_text(text, encoding="utf-8")


# El upstream deja el array de instrucciones vacío en estas cinco fichas.
# Los pasos están escritos para este paquete, en los dos idiomas, para no
# publicar una ficha muda. No vienen del fork en español. Se documentan
# en README.md.
AUTHORED_STEPS: dict[str, tuple[list[str], list[str]]] = {
    "Push_Press": (
        [
            "Stand with the bar racked on the front of your shoulders, feet about hip-width apart and elbows slightly in front of the bar.",
            "Dip a short way by bending the knees, keeping the torso upright and the heels down.",
            "Drive through the legs and press the bar overhead in the same motion until the arms are locked out.",
            "Lower the bar to the shoulders under control and repeat.",
        ],
        [
            "Ponte de pie con la barra apoyada delante de los hombros, los pies más o menos al ancho de las caderas y los codos ligeramente por delante de la barra.",
            "Haz una flexión corta de rodillas, con el torso erguido y los talones en el suelo.",
            "Empuja con las piernas y, en el mismo gesto, lleva la barra por encima de la cabeza hasta bloquear los brazos.",
            "Baja la barra hasta los hombros con control y repite.",
        ],
    ),
    "Side_Bridge": (
        [
            "Lie on your side with the elbow under the shoulder and the feet stacked or staggered.",
            "Lift the hips until the body forms a straight line from head to feet. Brace the core.",
            "Hold without letting the hips drop, then switch sides.",
        ],
        [
            "Túmbate de lado con el codo debajo del hombro y los pies juntos o uno delante del otro.",
            "Eleva las caderas hasta que el cuerpo forme una línea recta de la cabeza a los pies. Aprieta el abdomen.",
            "Mantén la posición sin dejar caer la cadera y cambia de lado.",
        ],
    ),
    "Side_Jackknife": (
        [
            "Lie on your side with the legs extended and the lower arm supporting you or reaching overhead.",
            "Lift the top leg and crunch the torso toward it, shortening the side of the waist.",
            "Lower with control and repeat, then switch sides.",
        ],
        [
            "Túmbate de lado con las piernas extendidas y el brazo de abajo apoyándote o estirado por encima de la cabeza.",
            "Sube la pierna de arriba y acerca el torso hacia ella, acortando el costado de la cintura.",
            "Baja con control, repite y cambia de lado.",
        ],
    ),
    "One-Arm_Kettlebell_Swings": (
        [
            "Stand with the feet wider than shoulder width and a kettlebell in one hand between the feet.",
            "Hinge at the hips and hike the kettlebell back between the legs, keeping the arm relaxed and the back flat.",
            "Snap the hips forward and let the kettlebell swing to about chest height.",
            "Let it fall back between the legs and repeat. Switch arms.",
        ],
        [
            "Ponte de pie con los pies más abiertos que el ancho de los hombros y una pesa rusa en una mano, entre los pies.",
            "Flexiona las caderas y lleva la pesa rusa hacia atrás, entre las piernas, con el brazo relajado y la espalda recta.",
            "Extiende las caderas de golpe y deja que la pesa rusa suba hasta más o menos la altura del pecho.",
            "Deja que vuelva a caer entre las piernas y repite. Cambia de brazo.",
        ],
    ),
    "Iron_Cross": (
        [
            "Stand holding an implement in each hand at your sides.",
            "Raise both arms out to the sides until they are about parallel to the floor, with the elbows locked or softly straight.",
            "Hold for the required time, keeping the shoulders down and the torso upright.",
        ],
        [
            "Ponte de pie con un implemento en cada mano, a los lados del cuerpo.",
            "Sube los dos brazos hacia los lados hasta que queden más o menos paralelos al suelo, con los codos bloqueados o casi rectos.",
            "Mantén el tiempo que marque la prueba, con los hombros bajos y el torso erguido.",
        ],
    ),
}


def build_exercises(english: list[dict], spanish_by_id: dict[str, dict], image_root: Path, skip_images: bool) -> tuple[list[dict], int]:
    exercises = []
    image_count = 0
    omitted = []
    for source in english:
        images = source.get("images") or []
        if not images:
            omitted.append(source["id"])
            continue
        if source["id"] in AUTHORED_STEPS and not any(step.strip() for step in source["instructions"]):
            steps_en, steps_es = AUTHORED_STEPS[source["id"]]
        else:
            spanish = spanish_by_id.get(source["id"])
            if spanish is None:
                raise SystemExit(f"Sin instrucciones en español para {source['id']}")
            if len(spanish["instructions"]) != len(source["instructions"]):
                raise SystemExit(f"Pasos desalineados en {source['id']}")

            steps_es = []
            steps_en = []
            for english_step, spanish_step in zip(source["instructions"], spanish["instructions"]):
                polished = polish_step(spanish_step, english_step)
                if polished is None:
                    continue
                steps_es.append(polished)
                steps_en.append(english_step.strip())
            if not steps_es:
                raise SystemExit(f"{source['id']} se quedó sin instrucciones")

        local_images = []
        for index, relative in enumerate(images):
            source_path = image_root / relative
            if not source_path.is_file():
                raise SystemExit(f"Falta la imagen {source_path}")
            filename = f"{index}.webp"
            target = IMAGE_DIR / source["id"] / filename
            if not skip_images:
                convert_image(source_path, target)
            local_images.append(f"images/{source['id']}/{filename}")
            image_count += 1

        equipment = EQUIPMENT[source.get("equipment")]
        force = FORCES[source.get("force")]
        mechanic = MECHANICS[source.get("mechanic")]
        exercises.append(
            {
                "id": source["id"],
                "nombre": translate_name(source["name"]),
                "nombreOriginal": source["name"],
                "instrucciones": steps_es,
                "instruccionesOriginal": steps_en,
                "musculosPrimarios": [MUSCLES[muscle][0] for muscle in source["primaryMuscles"]],
                "musculosSecundarios": [MUSCLES[muscle][0] for muscle in source["secondaryMuscles"]],
                "equipo": equipment[0],
                "categoria": CATEGORIES[source["category"]][0],
                "nivel": LEVELS[source["level"]][0],
                "fuerza": None if force is None else force[0],
                "mecanica": None if mechanic is None else mechanic[0],
                "imagenes": local_images,
            }
        )

    exercises.sort(key=lambda item: item["id"])
    if omitted != [
        "Kettlebell_Halo",
        "Kettlebell_Halo_With_Overhead_Extension",
        "Kettlebell_Overhead_Triceps_Extension",
    ]:
        raise SystemExit(f"La lista de ejercicios sin foto cambió: {omitted}")
    return exercises, image_count


PLACEHOLDER = re.compile(
    r"\b(FIXME|lorem|ipsum)\b|Sure, I can help|need to be translated",
    re.I,
)
PLACEHOLDER_TODO = re.compile(r"\bTODO\b")
ENGLISH_LEFTOVER = re.compile(
    r"\b(the|your|this will be your starting|dumbbell|barbell|kettlebell|pull-up|deadlift)\b",
    re.I,
)
CLEAN_LEFTOVER = re.compile(r"\blimpi\w*", re.I)


def validate(exercises: list[dict], catalogs: dict) -> None:
    muscle_ids = {item["id"] for item in catalogs["musculos"]}
    equipment_ids = {item["id"] for item in catalogs["equipo"]}
    category_ids = {item["id"] for item in catalogs["categorias"]}
    level_ids = {item["id"] for item in catalogs["niveles"]}
    force_ids = {item["id"] for item in catalogs["fuerza"]}
    mechanic_ids = {item["id"] for item in catalogs["mecanica"]}
    ids = [item["id"] for item in exercises]
    if len(ids) != len(set(ids)):
        raise SystemExit("Hay ids de ejercicio repetidos")
    names = [item["nombre"] for item in exercises]
    if len(names) != len(set(names)):
        repeated = sorted({name for name in names if names.count(name) > 1})
        raise SystemExit(f"Nombres en español repetidos: {repeated}")

    for exercise in exercises:
        blob = json.dumps(exercise, ensure_ascii=False)
        if PLACEHOLDER.search(blob) or PLACEHOLDER_TODO.search(blob):
            raise SystemExit(f"Placeholder en {exercise['id']}")
        if not exercise["instrucciones"]:
            raise SystemExit(f"Sin instrucciones: {exercise['id']}")
        if exercise["nombre"].strip().lower() == exercise["nombreOriginal"].strip().lower():
            # Loanwords that are the whole name are fine (Superman, Crunches).
            allowed_same = {"Superman", "Crunches", "Otis-up"}
            if exercise["nombre"] not in allowed_same:
                raise SystemExit(f"Nombre sin traducir: {exercise['id']} {exercise['nombre']}")
        for step, original in zip(exercise["instrucciones"], exercise["instruccionesOriginal"]):
            if step.strip() == original.strip():
                raise SystemExit(f"Paso sin traducir en {exercise['id']}: {step[:80]}")
            if ENGLISH_LEFTOVER.search(step):
                raise SystemExit(f"Inglés residual en {exercise['id']}: {step[:160]}")
            if CLEAN_LEFTOVER.search(step):
                raise SystemExit(f"«limpi*» residual en {exercise['id']}: {step[:160]}")
        for muscle in exercise["musculosPrimarios"] + exercise["musculosSecundarios"]:
            if muscle not in muscle_ids:
                raise SystemExit(f"Músculo fuera de catálogo: {muscle}")
        if exercise["equipo"] not in equipment_ids:
            raise SystemExit(f"Equipo fuera de catálogo: {exercise['equipo']}")
        if exercise["categoria"] not in category_ids:
            raise SystemExit(f"Categoría fuera de catálogo: {exercise['categoria']}")
        if exercise["nivel"] not in level_ids:
            raise SystemExit(f"Nivel fuera de catálogo: {exercise['nivel']}")
        if exercise["fuerza"] is not None and exercise["fuerza"] not in force_ids:
            raise SystemExit(f"Fuerza fuera de catálogo: {exercise['fuerza']}")
        if exercise["mecanica"] is not None and exercise["mecanica"] not in mechanic_ids:
            raise SystemExit(f"Mecánica fuera de catálogo: {exercise['mecanica']}")
        if not exercise["imagenes"]:
            raise SystemExit(f"Sin imágenes: {exercise['id']}")
        for relative in exercise["imagenes"]:
            path = OUT_DIR / relative
            if not path.is_file():
                raise SystemExit(f"No existe {path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Regenera la base offline de ejercicios")
    parser.add_argument("--upstream", type=Path, default=Path("/tmp/free-exercise-db"))
    parser.add_argument("--spanish", type=Path, default=Path("/tmp/exercises_es.json"))
    parser.add_argument("--skip-images", action="store_true")
    args = parser.parse_args()

    upstream = ensure_upstream(args.upstream)
    english = json.loads((upstream / "dist" / "exercises.json").read_text(encoding="utf-8"))
    spanish_rows = ensure_spanish(args.spanish)
    spanish_by_id = {row["id"]: row for row in spanish_rows}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    exercises, image_count = build_exercises(
        english,
        spanish_by_id,
        upstream / "exercises",
        args.skip_images,
    )
    catalogs = build_catalogs()
    if not args.skip_images:
        validate(exercises, catalogs)

    (OUT_DIR / "exercises.json").write_text(
        json.dumps(exercises, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUT_DIR / "catalogs.json").write_text(
        json.dumps(catalogs, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_license(upstream)
    write_credits()
    step_count = sum(len(item["instrucciones"]) for item in exercises)
    write_readme(len(exercises), image_count, step_count)
    print(f"ejercicios={len(exercises)} imagenes={image_count} pasos={step_count}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit(0)
