"""
Skatteutrymme för ROT/RUT/grön teknik, inkomstår 2026.

Reproducerar Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (www7.skatteverket.se/portal/rot-rut)
utifrån lagtext + Skatteverkets publicerade 2026-parametrar. Validerad 2026-09-11 mot fyra körningar i
e-tjänsten (se rot-testfall.json, id SKV-KAL-01..04) och 2026-09-16 mot 75 körningar (research/09): med kapning av
öretal och pensionsavgift till närmaste hundratal träffar modellen tjänsten på kronan utom regional reduktion (1 675 kr
i 76 kommuner, frågas inte).

Källor (alla [FACT]):
- IL 63 kap. 3 § och 3 a § (grundavdrag, förhöjt grundavdrag 66+), IL 67 kap. 2 § (avräkningsordning),
  67 kap. 7 § och 8 § (jobbskatteavdrag, lydelse Lag 2025:1376), 67 kap. 10 § (underskott av kapital),
  67 kap. 46-47 §§ (skattereduktion för förvärvsinkomst)
  https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/
- Skatteverket "Belopp och procent inkomstår 2026":
  https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html
  prisbasbelopp 59 200; genomsnittlig kommunal skattesats 32,38 %; skiktgräns 643 000; statlig skatt 20 %;
  allmän pensionsavgift 7 % max 47 100; fastighetsavgift småhus 0,75 % max 10 425.

Allt som räknas fram här är [BERÄKNAT] med ovanstående inputs.
"""

import math

PBB = 59_200            # prisbasbelopp 2026 [FACT]
KS_SNITT = 0.3238       # genomsnittlig kommunal skattesats 2026 [FACT]
SKIKTGRANS = 643_000    # statlig inkomstskatt 20 % över denna beskattningsbara förvärvsinkomst [FACT]
STATLIG = 0.20
PENSIONSAVGIFT = 0.07
PENSIONSAVGIFT_MAX = 47_100   # [FACT] Skatteverket 2026
FASTIGHETSAVGIFT_MAX = 10_425 # småhus 2026 [FACT]
ROT_TAK = 50_000
ROT_RUT_TAK = 75_000
GT_TAK = 50_000


def rund_upp_100(x):
    return int(math.ceil(x / 100.0) * 100)


def rund_ned_100(x):
    return int(math.floor(x / 100.0) * 100)


def kapa(x):
    """Öretal faller bort (SFF 22 kap. 1 §, IL 67 kap. 1 § 2 st): hela kronor, kapade. Verifierat mot e-tjänsten
    2026-09-16 (research/09, SKV-61)."""
    return max(0, int(math.floor(x)))


def pensionsavgift_kr(lon_ar):
    """Lag (1994:1744) 3 §: närmaste hela hundratal, 50 kr nedåt. Heltalsräkning i hundradels kronor."""
    enheter = lon_ar * 7
    bas = (enheter // 10_000) * 10_000
    rest = enheter - bas
    return (bas + 10_000 if rest > 5_000 else bas) // 100


def grundavdrag(fi, ar_66_plus):
    """IL 63 kap. 3 § (+ 3 a § för den som fyllt 66 vid årets ingång). fi = fastställd förvärvsinkomst."""
    p = PBB
    if fi <= 0.99 * p:
        ga = 0.423 * p
    elif fi <= 2.72 * p:
        ga = 0.423 * p + 0.20 * (fi - 0.99 * p)
    elif fi <= 3.11 * p:
        ga = 0.77 * p
    elif fi <= 7.88 * p:
        ga = 0.77 * p - 0.10 * (fi - 3.11 * p)
    else:
        ga = 0.293 * p
    if ar_66_plus:
        # särskilt belopp, 63 kap. 3 a § i lydelse Lag (2025:1376), gäller 2026
        if fi <= 0.91 * p:
            s = 0.687 * p
        elif fi <= 1.11 * p:
            s = 0.885 * p - 0.20 * fi
        elif fi <= 1.965 * p:
            s = 0.600 * p + 0.057 * fi
        elif fi <= 2.72 * p:
            s = 0.333 * p + 0.1949 * fi
        elif fi <= 3.11 * p:
            s = 0.3949 * fi - 0.212 * p
        elif fi <= 3.24 * p:
            s = 0.4949 * fi - 0.523 * p
        elif fi <= 5.00 * p:
            s = 0.356 * fi - 0.073 * p
        elif fi <= 7.88 * p:
            s = 0.017 * p + 0.338 * fi
        elif fi <= 8.08 * p:
            s = 0.703 * p + 0.251 * fi
        elif fi <= 11.16 * p:
            s = 2.732 * p
        elif fi <= 12.84 * p:
            s = 9.651 * p - 0.62 * fi
        else:
            s = 1.691 * p
        ga += s
    ga = min(ga, fi)               # grundavdraget kan inte överstiga inkomsten
    return rund_upp_100(ga)        # 63 kap. 2 §: avrundas uppåt till helt hundratal


def jobbskatteavdrag(arbetsinkomst, ga, ks, ar_66_plus):
    """IL 67 kap. 7 § (under 66, lydelse Lag 2025:1376) resp. 8 § (66+). Räknas av endast mot kommunal skatt."""
    ai = rund_ned_100(arbetsinkomst)
    p = PBB
    if ai <= 0:
        return 0
    if not ar_66_plus:
        if ai <= 0.91 * p:
            u = ai - ga
        elif ai <= 3.24 * p:
            u = 0.91 * p + 0.3874 * (ai - 0.91 * p) - ga
        elif ai <= 8.08 * p:
            u = 1.813 * p + 0.251 * (ai - 3.24 * p) - ga
        else:
            u = 3.027 * p - ga
        return kapa(u * ks)
    else:
        if ai <= 1.75 * p:
            return kapa(0.22 * ai)
        elif ai <= 5.24 * p:
            return kapa(0.2635 * p + 0.07 * ai)
        else:
            return kapa(0.6293 * p)


def red_forvarvsinkomst(bfi):
    """IL 67 kap. 46-47 §§: 1 500 kr, eller 0,75 % av (BFI - 40 000) i intervallet 40 000-240 000."""
    if bfi <= 40_000:
        return 0
    if bfi <= 240_000:
        return kapa(0.0075 * (bfi - 40_000))
    return 1_500


def red_underskott_kapital(underskott):
    """IL 67 kap. 10 §: 30 % upp till 100 000, 21 % därutöver."""
    if underskott <= 0:
        return 0
    return kapa(0.30 * min(underskott, 100_000) + 0.21 * max(0, underskott - 100_000))


def skatteutrymme(lon_ar=0, pension_ar=0, ar_66_plus=False, ks=KS_SNITT,
                  taxeringsvarde=0, ranteutgifter=0, ovrigt_underskott=0):
    """
    Returnerar dict med hela kedjan. Utrymmet = det som återstår att räkna ROT/RUT (och därefter grön teknik)
    mot, efter de reduktioner som enligt IL 67 kap. 2 § ligger före hushållsarbete.
    Förenklingar (markerade i 01-rot-regelverk.md §E): ingen sjöinkomst, ingen sjuk-/aktivitetsersättning,
    ingen regional skattereduktion, inga kapitalinkomster, pensionärers 4 %-spärr på fastighetsavgift ej modellerad.
    """
    fi = rund_ned_100(lon_ar + pension_ar)          # fastställd förvärvsinkomst (avrundad nedåt, förenkling)
    ga = grundavdrag(fi, ar_66_plus)
    bfi = max(0, fi - ga)                            # beskattningsbar förvärvsinkomst
    kommunal = kapa(bfi * ks)
    statlig = kapa(STATLIG * max(0, bfi - SKIKTGRANS))
    fastighetsavgift = kapa(min(FASTIGHETSAVGIFT_MAX, 0.0075 * taxeringsvarde)) if taxeringsvarde > 0 else 0
    pool = kommunal + statlig + fastighetsavgift     # de skatter reduktionerna får räknas av mot (67:2 2 st)

    pensionsavgift = min(PENSIONSAVGIFT_MAX, pensionsavgift_kr(lon_ar)) if lon_ar >= 0.423 * PBB else 0   # golv SFB 59:13
    # OBS: avgiften avrundas till helt hundratal i Skatteverkets beräkning (25 200 på 360 000)
    pensionsavgift = min(pensionsavgift, pool)
    jsa = min(jobbskatteavdrag(lon_ar, ga, ks, ar_66_plus), max(0, kommunal - 0))  # endast mot kommunal
    forv = red_forvarvsinkomst(bfi)
    forv = min(forv, max(0, kommunal - jsa))
    kap = red_underskott_kapital(ranteutgifter + ovrigt_underskott)

    kvar = pool - pensionsavgift - jsa - forv - kap
    utrymme = max(0, kvar)
    return {
        "fastställd_förvärvsinkomst": fi,
        "grundavdrag": ga,
        "beskattningsbar_förvärvsinkomst": bfi,
        "kommunal_inkomstskatt": kommunal,
        "statlig_inkomstskatt": statlig,
        "fastighetsavgift": fastighetsavgift,
        "red_allmän_pensionsavgift": pensionsavgift,
        "red_jobbskatteavdrag": jsa,
        "red_förvärvsinkomst": forv,
        "red_underskott_kapital": kap,
        "utrymme_rot_rut_gt": utrymme,
        "räcker_rot_50k": utrymme >= ROT_TAK,
        "räcker_rot_rut_75k": utrymme >= ROT_RUT_TAK,
        "räcker_rot_50k_plus_gt_50k": utrymme >= ROT_TAK + GT_TAK,
    }


def validering():
    """De fyra körningarna i Skatteverkets e-tjänst 2026-09-11 (Stockholm 30,55 %, Göteborg 32,60 % bakräknade)."""
    fall = [
        ("SKV-KAL-01 löntagare 360 000, Stockholm", dict(lon_ar=360_000, ks=0.3055), 37_594),
        ("SKV-KAL-02 pensionär 240 000, Stockholm", dict(pension_ar=240_000, ar_66_plus=True, ks=0.3055), 35_702),
        ("SKV-KAL-03 löntagare 720 000 + ränta 60 000 + fastighetsavgift 30 000, Stockholm",
         dict(lon_ar=720_000, ks=0.3055, ranteutgifter=60_000, taxeringsvarde=1_390_000), 140_535 - 30_000 + 10_425),
        ("SKV-KAL-04 löntagare 180 000, Göteborg", dict(lon_ar=180_000, ks=0.3260), 11_881),
    ]
    for namn, inp, vantat in fall:
        r = skatteutrymme(**inp)
        print(f"{namn}: modell {r['utrymme_rot_rut_gt']:>8} | SKV {vantat:>8} | diff {r['utrymme_rot_rut_gt']-vantat:+d}")


def tabell():
    print("\nUppslagstabell 2026, snittkommunalskatt 32,38 %, inga ränteutgifter. [BERÄKNAT]")
    print("Månadsbrutto | Löntagare <66 (utan villa / med villa 10 425) | Pensionär 66+ (utan / med villa)")
    for man in range(15_000, 80_001, 5_000):
        ar = man * 12
        a = skatteutrymme(lon_ar=ar)["utrymme_rot_rut_gt"]
        b = skatteutrymme(lon_ar=ar, taxeringsvarde=1_390_000)["utrymme_rot_rut_gt"]
        c = skatteutrymme(pension_ar=ar, ar_66_plus=True)["utrymme_rot_rut_gt"]
        d = skatteutrymme(pension_ar=ar, ar_66_plus=True, taxeringsvarde=1_390_000)["utrymme_rot_rut_gt"]
        print(f"{man:>8} | {a:>8} / {b:>8} | {c:>8} / {d:>8}")


if __name__ == "__main__":
    validering()
    tabell()
