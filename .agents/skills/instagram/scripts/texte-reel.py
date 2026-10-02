#!/usr/bin/env python3
"""Génère un reel « texte » 9:16 (format « texte du vendredi ») avec ffmpeg.

Une carte de texte par paragraphe du fichier d'entrée (paragraphes séparés par
une ligne vide). Une ligne « [4.5] » en tête de paragraphe fixe sa durée en
secondes ; sinon la durée dépend de la longueur du texte (2,5 s minimum).

Fond : vert Cavalons (#155b57) par défaut, ou une vidéo (--fond video.mp4),
assombrie et recadrée en 1080 x 1920, bouclée si elle est trop courte.

Sortie : MP4 H.264 1080 x 1920, 30 i/s, sans son, visé sous 15 Mo pour passer
par rehost_image. Le son (tendance) s'ajoute dans l'application Instagram.

Usage :
  python3 texte-reel.py texte.txt sortie.mp4 [--fond video.mp4]
                         [--police Gelasio] [--dossier-polices DIR]
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile

LARGEUR, HAUTEUR = 1080, 1920
VERT = "155b57"
TEXTE = "def0ee"


def cartes(chemin):
    with open(chemin, encoding="utf-8") as fh:
        blocs = [b.strip() for b in re.split(r"\n\s*\n", fh.read()) if b.strip()]
    out = []
    for bloc in blocs:
        duree = None
        m = re.match(r"\[(\d+(?:[.,]\d+)?)\]\s*", bloc)
        if m:
            duree = float(m.group(1).replace(",", "."))
            bloc = bloc[m.end():]
        texte = " ".join(bloc.split())
        if duree is None:
            # ~15 caractères par seconde de lecture, bornée.
            duree = min(max(2.5, len(texte) / 15), 7.0)
        out.append((texte, duree))
    if not out:
        sys.exit("Erreur : aucun texte dans le fichier.")
    return out


def horodatage(s):
    h, s = divmod(s, 3600)
    m, s = divmod(s, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def ass(cartes_, police):
    # Couleur ASS : &HBBGGRR
    r, g, b = TEXTE[0:2], TEXTE[2:4], TEXTE[4:6]
    couleur = f"&H00{b}{g}{r}".upper()
    lignes = [
        "[Script Info]",
        "ScriptType: v4.00+",
        f"PlayResX: {LARGEUR}",
        f"PlayResY: {HAUTEUR}",
        "WrapStyle: 0",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
        "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Carte,{police},84,{couleur},{couleur},&H00000000,&H64000000,0,0,0,0,"
        "100,100,0,0,1,0,2,5,140,140,0,1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    t = 0.0
    for texte, duree in cartes_:
        texte = texte.replace("{", "(").replace("}", ")")
        # Espace insécable avant : ; ! ? et à l'intérieur des guillemets.
        texte = re.sub(r" ([:;!?»])", r"\\h\1", texte).replace("« ", "«\\h")
        lignes.append(
            f"Dialogue: 0,{horodatage(t)},{horodatage(t + duree)},Carte,,0,0,0,,"
            f"{{\\fad(200,200)}}{texte}"
        )
        t += duree
    return "\n".join(lignes) + "\n", t


def main():
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("texte")
    p.add_argument("sortie")
    p.add_argument("--fond", help="vidéo de fond (sinon aplat vert Cavalons)")
    p.add_argument("--police", default="Gelasio")
    p.add_argument("--dossier-polices", help="dossier contenant le .ttf de la police")
    a = p.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("Erreur : ffmpeg introuvable.")

    police = a.police
    if not a.dossier_polices and shutil.which("fc-list"):
        installees = subprocess.run(["fc-list", ":", "family"], capture_output=True, text=True).stdout
        if police.lower() not in installees.lower():
            print(f"Police « {police} » absente : remplacée par Liberation Serif "
                  "(passez --dossier-polices pour la vraie).")
            police = "Liberation Serif"

    liste = cartes(a.texte)
    contenu, total = ass(liste, police)
    if total > 90:
        sys.exit(f"Erreur : {total:.1f} s, un reel ne dépasse pas 90 s.")

    with tempfile.TemporaryDirectory() as tmp:
        fichier_ass = os.path.join(tmp, "cartes.ass")
        with open(fichier_ass, "w", encoding="utf-8") as fh:
            fh.write(contenu)
        sous_titres = f"subtitles={fichier_ass}"
        if a.dossier_polices:
            sous_titres += f":fontsdir={a.dossier_polices}"

        cmd = ["ffmpeg", "-v", "error", "-y"]
        if a.fond:
            cmd += ["-stream_loop", "-1", "-i", a.fond]
            filtre = (
                f"[0:v]scale={LARGEUR}:{HAUTEUR}:force_original_aspect_ratio=increase,"
                f"crop={LARGEUR}:{HAUTEUR},setsar=1,fps=30,"
                f"eq=brightness=-0.18:saturation=0.85,{sous_titres}[v]"
            )
        else:
            cmd += ["-f", "lavfi", "-i", f"color=c=0x{VERT}:s={LARGEUR}x{HAUTEUR}:r=30"]
            filtre = f"[0:v]{sous_titres}[v]"
        cmd += [
            "-filter_complex", filtre, "-map", "[v]", "-t", f"{total:.2f}",
            "-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-maxrate", "4M", "-bufsize", "8M",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", a.sortie,
        ]
        subprocess.run(cmd, check=True)

    taille = os.path.getsize(a.sortie) / 1e6
    print(f"{a.sortie} : {len(liste)} cartes, {total:.1f} s, {taille:.1f} Mo")
    if taille > 15:
        print("Attention : plus de 15 Mo, rehost_image le refusera. Augmentez -crf.")


if __name__ == "__main__":
    main()
