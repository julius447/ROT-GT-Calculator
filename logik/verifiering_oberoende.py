"""
verifiering_oberoende.py - oberoende omimplementering ("clean room") av utrymmet för rot-/rutavdrag 2026.

Skriven 2026-09-16 direkt ur lagtext och Skatteverkets "Belopp och procent inkomstår 2026", UTAN att kopiera
logik/engine.js eller logik/skatteutrymme_2026.py. Syftet är att vara en tredje, fristående räknare bredvid
Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" och motorn, så att avvikelser kan förklaras.

Källor (alla [FACT]):
  K1  Inkomstskattelagen (1999:1229), konsoliderad text från data.riksdagen.se/dokument/sfs-1999-1229 (hämtad 2026-09-16):
      1 kap. 5 §   fastställd förvärvsinkomst avrundas NEDÅT till helt hundratal; BFI = FI - grundavdrag
      63 kap. 2 §  grundavdraget avrundas UPPÅT till helt hundratal
      63 kap. 3 §  grundavdrag: 0,423 pbb | +20 % över 0,99 pbb | 0,77 pbb | -10 % över 3,11 pbb | 0,293 pbb  (Lag 2011:1256)
      63 kap. 3 a § särskilt belopp för den som fyllt 66 vid årets ingång, 12 intervall (Lag 2025:1376, gäller 2026)
      65 kap. 3 §  kommunal inkomstskatt = (kommun + region) x BFI
      65 kap. 5 §  statlig inkomstskatt 20 % av BFI över skiktgränsen
      65 kap. 7 §  statlig skatt på kapitalinkomster 30 %  (utanför motorn; med här bara för att spegla e-tjänsten)
      67 kap. 1 §  "Skattereduktion ska anges i hela krontal så att öretal faller bort." (Lag 2025:1370)
      67 kap. 2 §  ordningen: sjöinkomst, allmän pensionsavgift, jobbskatteavdrag, sjuk-/aktivitetsersättning,
                   förvärvsinkomst, regional, underskott av kapital, hushållsarbete, grön teknik, gåva, a-kassa.
                   Avräkning mot kommunal + statlig inkomstskatt, fastighetsskatt och fastighetsavgift; men
                   5-9 d, 34, 35 och 46-48 §§ (jobbskatteavdrag, sjukers., regional, förvärvsinkomst) BARA mot kommunal.
      67 kap. 4 §  skattereduktion för allmän pensionsavgift (100 % av avgiften, "Belopp och procent 2026")
      67 kap. 6 §  arbetsinkomsterna avrundas NEDÅT till helt hundratal
      67 kap. 7 §  jobbskatteavdrag under 66: 4 intervall (0,91 / 3,24 / 8,08 pbb; 38,74 %, 25,1 %, 1,813, 3,027) (Lag 2025:1376)
      67 kap. 8 §  jobbskatteavdrag 66+: 22 % | 0,2635 pbb + 7 % | 0,6293 pbb över 5,24 pbb (Lag 2024:1131; ingen avtrappning)
      67 kap. 10 § underskott av kapital: 30 % upp till 100 000, 21 % därutöver
      67 kap. 34 § regional skattereduktion 1 675 kr för folkbokförda i kommun i bilaga 67 (Lag 2020:864)
      67 kap. 46-47 §§ förvärvsinkomst: 1 500 kr; 0,75 % x (BFI - 40 000) när BFI ligger mellan 40 000 och 240 000
  K2  Lag (1994:1744) om allmän pensionsavgift 2-4 §§: 7 % av inkomst av anställning avrundad till närmast LÄGRE hundratal;
      bortse från inkomst över 8,07 inkomstbasbelopp; "Avgiften avrundas till närmast hela hundratal kronor. Avgift som
      slutar på 50 kronor avrundas till närmast lägre hundratal kronor."; ingen avgift om inkomsten < 42,3 % av pbb.
  K3  Skatteförfarandeförordningen (2011:1261) 22 kap. 1 §: "Belopp som avser skatt eller avgift ... ska anges i hela
      krontal så att öretal faller bort."  (=> kommunal/statlig skatt och fastighetsavgift kapas till hela kronor)
  K4  Skatteverket "Belopp och procent inkomstår 2026": prisbasbelopp 59 200; inkomstbasbelopp 83 400; skiktgräns 643 000;
      allmän pensionsavgift 7 % högst 47 100; fastighetsavgift småhus 0,75 % högst 10 425; snittkommunalskatt 32,38 %.
  K5  E-tjänstens hjälptext (2026-09-16): "För inkomståret 2026 är underlaget för takbeloppet 1 390 000 kronor."

Allt som räknas ut här är [BERÄKNAT]. Skriptet läser logik/verifiering-skv-2026.json, räknar varje körning och skriver
tillbaka fältet "oberoende" per körning + skriver ut en jämförelse (Skatteverket | motorn | oberoende).
Kör: python3 logik/verifiering_oberoende.py [--json logik/verifiering-skv-2026.json] [--skriv]
"""
from __future__ import annotations

import argparse
import json
import sys
from decimal import Decimal, ROUND_FLOOR, ROUND_CEILING, ROUND_HALF_DOWN
from pathlib import Path

D = Decimal

# --- 2026-parametrar (K4) ------------------------------------------------------------------------------------------
PBB = D(59_200)                 # prisbasbelopp
IBB = D(83_400)                 # inkomstbasbelopp (tak för pensionsavgiftsunderlaget: 8,07 x IBB, K2 3 §)
SKIKTGRANS = D(643_000)         # 65 kap. 5 §, fastställd av regeringen (K4)
STATLIG_SATS = D("0.20")
KAPITAL_SATS = D("0.30")        # 65 kap. 7 §
PA_SATS = D("0.07")             # K2 2 §
PA_UNDRE_GRANS = D("0.423") * PBB   # K2 4 §: ingen avgift under 42,3 % av pbb (25 041,60)
FA_SATS = D("0.0075")           # fastighetsavgift småhus (K4)
FA_UNDERLAG_TAK = D(1_390_000)  # K5 (ger 10 425 kr)
FA_MAX = D(10_425)              # K4
REGIONAL_KR = D(1_675)          # 67 kap. 34 §
FORV_FAST = D(1_500)            # 67 kap. 47 §
ROT_TAK = 50_000                # 67 kap. 19 §, "Belopp och procent" (rotavdraget får högst vara 50 000 per person)

# bilaga 67 till IL (Lag 2020:864) - kommuner med regional skattereduktion, ur den konsoliderade lagtexten (K1)
BILAGA_67 = {
    # Dalarnas län
    "Avesta", "Gagnef", "Hedemora", "Leksand", "Ludvika", "Malung-Sälen", "Mora", "Orsa", "Rättvik", "Smedjebacken",
    "Säter", "Vansbro", "Älvdalen",
    # Gävleborgs län
    "Bollnäs", "Hudiksvall", "Ljusdal", "Nordanstig", "Ockelbo", "Ovanåker", "Söderhamn",
    # Jämtlands län
    "Berg", "Bräcke", "Härjedalen", "Krokom", "Ragunda", "Strömsund", "Åre", "Östersund",
    # Norrbottens län
    "Arjeplog", "Arvidsjaur", "Boden", "Gällivare", "Haparanda", "Jokkmokk", "Kalix", "Kiruna", "Pajala", "Piteå",
    "Älvsbyn", "Överkalix", "Övertorneå",
    # Värmlands län
    "Arvika", "Eda", "Filipstad", "Hagfors", "Munkfors", "Storfors", "Sunne", "Säffle", "Torsby", "Årjäng",
    # Västerbottens län
    "Bjurholm", "Dorotea", "Lycksele", "Malå", "Nordmaling", "Norsjö", "Robertsfors", "Skellefteå", "Sorsele",
    "Storuman", "Vilhelmina", "Vindeln", "Vännäs", "Åsele",
    # Västernorrlands län
    "Härnösand", "Kramfors", "Sollefteå", "Timrå", "Ånge", "Örnsköldsvik",
    # Västra Götalands län
    "Bengtsfors", "Dals-Ed", "Färgelanda", "Mellerud", "Åmål",
}


# --- avrundningar, var och en med sin paragraf ----------------------------------------------------------------------
def ned_100(x: Decimal) -> Decimal:
    """avrundas nedåt till helt hundratal (1 kap. 5 §, 67 kap. 6 §, K2 3 §)."""
    return (x / 100).to_integral_value(rounding=ROUND_FLOOR) * 100


def upp_100(x: Decimal) -> Decimal:
    """avrundas uppåt till helt hundratal (63 kap. 2 §)."""
    return (x / 100).to_integral_value(rounding=ROUND_CEILING) * 100


def hela_kronor(x: Decimal) -> Decimal:
    """öretal faller bort (SFF 22 kap. 1 §, IL 67 kap. 1 §): kapning, aldrig avrundning."""
    return x.to_integral_value(rounding=ROUND_FLOOR)


def narmast_100_50_ned(x: Decimal) -> Decimal:
    """K2 3 §: 'avrundas till närmast hela hundratal kronor. Avgift som slutar på 50 kronor avrundas till närmast lägre'."""
    return (x / 100).to_integral_value(rounding=ROUND_HALF_DOWN) * 100


# --- byggstenar ------------------------------------------------------------------------------------------------------
def grundavdrag_63_3(fi: Decimal) -> Decimal:
    """63 kap. 3 § (utan avrundning; avrundningen görs i grundavdrag())."""
    if fi <= D("0.99") * PBB:
        return D("0.423") * PBB
    if fi <= D("2.72") * PBB:
        return D("0.423") * PBB + D("0.20") * (fi - D("0.99") * PBB)
    if fi <= D("3.11") * PBB:
        return D("0.77") * PBB
    if fi <= D("7.88") * PBB:
        return D("0.77") * PBB - D("0.10") * (fi - D("3.11") * PBB)
    return D("0.293") * PBB


def sarskilt_belopp_63_3a(fi: Decimal) -> Decimal:
    """63 kap. 3 a § i lydelsen enligt Lag (2025:1376), för den som fyllt 66 vid beskattningsårets ingång."""
    p = PBB
    if fi <= D("0.91") * p:
        return D("0.687") * p
    if fi <= D("1.11") * p:
        return D("0.885") * p - D("0.20") * fi
    if fi <= D("1.965") * p:
        return D("0.600") * p + D("0.057") * fi
    if fi <= D("2.72") * p:
        return D("0.333") * p + D("0.1949") * fi
    if fi <= D("3.11") * p:
        return D("0.3949") * fi - D("0.212") * p
    if fi <= D("3.24") * p:
        return D("0.4949") * fi - D("0.523") * p
    if fi <= D("5.00") * p:
        return D("0.356") * fi - D("0.073") * p
    if fi <= D("7.88") * p:
        return D("0.017") * p + D("0.338") * fi
    if fi <= D("8.08") * p:
        return D("0.703") * p + D("0.251") * fi
    if fi <= D("11.16") * p:
        return D("2.732") * p
    if fi <= D("12.84") * p:
        return D("9.651") * p - D("0.62") * fi
    return D("1.691") * p


def grundavdrag(fi: Decimal, fyllt_66: bool) -> Decimal:
    """63 kap. 2-3 a §§. Avdraget kan inte bli större än inkomsten (BFI kan inte bli negativ, 1 kap. 5 §) [TOLKNING,
    påverkar aldrig ett utrymme > 0]. Avrundas uppåt till helt hundratal."""
    ga = grundavdrag_63_3(fi)
    if fyllt_66:
        ga += sarskilt_belopp_63_3a(fi)
    ga = min(ga, fi)
    return upp_100(ga)


def allman_pensionsavgift(lon: Decimal) -> Decimal:
    """Lag (1994:1744) 2-4 §§. Underlag = inkomst av anställning avrundad till närmast lägre hundratal, högst 8,07 IBB.
    Ingen avgift om inkomsten understiger 42,3 % av pbb. Avgiften avrundas till närmast hela hundratal (50 -> nedåt)."""
    if lon < PA_UNDRE_GRANS:
        return D(0)
    underlag = ned_100(min(lon, D("8.07") * IBB))
    return narmast_100_50_ned(PA_SATS * underlag)


def jobbskatteavdrag(arbetsinkomst: Decimal, ga: Decimal, ks: Decimal, fyllt_66: bool) -> Decimal:
    """67 kap. 6-8 §§. Arbetsinkomsten avrundas nedåt till helt hundratal (6 §). Öretal faller bort (1 §)."""
    ai = ned_100(arbetsinkomst)
    p = PBB
    if ai <= 0:
        return D(0)
    if fyllt_66:                                                    # 8 § (Lag 2024:1131)
        if ai <= D("1.75") * p:
            red = D("0.22") * ai
        elif ai <= D("5.24") * p:
            red = D("0.2635") * p + D("0.07") * ai
        else:
            red = D("0.6293") * p
        return hela_kronor(red)
    # 7 § (Lag 2025:1376)
    if ai <= D("0.91") * p:
        skillnad = ai - ga
    elif ai <= D("3.24") * p:
        skillnad = D("0.91") * p + D("0.3874") * (ai - D("0.91") * p) - ga
    elif ai <= D("8.08") * p:
        skillnad = D("1.813") * p + D("0.251") * (ai - D("3.24") * p) - ga
    else:
        skillnad = D("3.027") * p - ga
    return hela_kronor(max(D(0), skillnad * ks))


def red_forvarvsinkomst(bfi: Decimal) -> Decimal:
    """67 kap. 46-47 §§. Öretal faller bort (1 §)."""
    if bfi <= D(40_000):
        return D(0)
    if bfi <= D(240_000):
        return hela_kronor(D("0.0075") * (bfi - D(40_000)))
    return FORV_FAST


def red_underskott_kapital(underskott: Decimal) -> Decimal:
    """67 kap. 10 § första stycket. Öretal faller bort (1 §)."""
    if underskott <= 0:
        return D(0)
    return hela_kronor(D("0.30") * min(underskott, D(100_000)) + D("0.21") * max(D(0), underskott - D(100_000)))


def fastighetsavgift(underlag: Decimal) -> Decimal:
    """Kommunal fastighetsavgift småhus: 0,75 % av underlaget, högst 10 425 (K4/K5). Öretal faller bort (K3)."""
    if underlag <= 0:
        return D(0)
    return min(hela_kronor(FA_SATS * min(underlag, FA_UNDERLAG_TAK)), FA_MAX)


# --- hela kedjan ------------------------------------------------------------------------------------------------------
def utrymme_rot_rut(*, lon=0, pension=0, fodelsear=1985, kommunalskatt_pct=32.38, fastighetsavgift_underlag=0,
                    ranteutgifter=0, ranteinkomster=0, kommun: str | None = None, inkomstar=2026) -> dict:
    """Utrymmet som återstår för hushållsarbete (rot/rut) enligt ordningen i 67 kap. 2 §, inkomstår 2026.

    Avräkning: pensionsavgiftsreduktionen får räknas av mot alla skatter i poolen och läggs därför först mot de skatter
    som de kommunal-bundna reduktionerna INTE får röra (statlig skatt, fastighetsavgift, kapitalskatt); resten mot
    kommunalskatten. Jobbskatteavdrag, förvärvsinkomst- och regional reduktion får sedan bara ta det som är kvar av
    kommunalskatten (67 kap. 2 § andra stycket). Underskott av kapital tar sedan av hela återstoden.
    """
    lon, pension = D(int(lon)), D(int(pension))
    ks = D(str(kommunalskatt_pct)) / 100
    # "vid beskattningsårets ingång har fyllt 66 år": född 1959 fyllde 66 under 2025 och har fyllt 66 den 1 jan 2026;
    # född 1960 fyller 66 först under 2026. Alltså född <= inkomstår - 67.
    fyllt_66 = int(fodelsear) <= inkomstar - 67

    fi = ned_100(lon + pension)                                     # 1 kap. 5 §
    ga = grundavdrag(fi, fyllt_66)                                  # 63 kap.
    bfi = max(D(0), fi - ga)                                        # 1 kap. 5 §
    kommunal = hela_kronor(bfi * ks)                                # 65 kap. 3 § + SFF 22:1
    statlig = hela_kronor(STATLIG_SATS * max(D(0), bfi - SKIKTGRANS))   # 65 kap. 5 §
    kapital_skatt = hela_kronor(KAPITAL_SATS * D(int(ranteinkomster)))  # 65 kap. 7 § (överskott av kapital)
    fa = fastighetsavgift(D(int(fastighetsavgift_underlag)))
    ovriga = statlig + fa + kapital_skatt                           # skatter som JSA m.fl. inte får räknas av mot

    # 67 kap. 2 §, i nämnd ordning
    pa_avgift = allman_pensionsavgift(lon)                          # K2
    red_pa = min(pa_avgift, kommunal + ovriga)                      # 67 kap. 4 §: 100 % av avgiften, mot hela poolen
    pa_mot_kommunal = max(D(0), red_pa - ovriga)
    kommunal_kvar = kommunal - pa_mot_kommunal
    ovriga_kvar = ovriga - min(red_pa, ovriga)

    jsa = min(jobbskatteavdrag(lon, ga, ks, fyllt_66), kommunal_kvar)   # 67 kap. 7/8 §§, bara mot kommunal
    kommunal_kvar -= jsa
    forv = min(red_forvarvsinkomst(bfi), kommunal_kvar)             # 67 kap. 46-47 §§, bara mot kommunal
    kommunal_kvar -= forv
    regional = D(0)
    if kommun and kommun in BILAGA_67:
        regional = min(REGIONAL_KR, kommunal_kvar)                  # 67 kap. 34 §, bara mot kommunal
        kommunal_kvar -= regional
    kvar = kommunal_kvar + ovriga_kvar
    kap = min(red_underskott_kapital(D(int(ranteutgifter))), kvar)  # 67 kap. 10 §, mot hela återstoden
    kvar -= kap
    utrymme = max(D(0), kvar)
    return {
        "fyllt_66_vid_arets_ingang": fyllt_66,
        "fastställd_förvärvsinkomst": int(fi),
        "grundavdrag": int(ga),
        "beskattningsbar_förvärvsinkomst": int(bfi),
        "kommunal_inkomstskatt": int(kommunal),
        "statlig_inkomstskatt": int(statlig),
        "statlig_skatt_kapital": int(kapital_skatt),
        "fastighetsavgift": int(fa),
        "allmän_pensionsavgift": int(pa_avgift),
        "red_allmän_pensionsavgift": int(red_pa),
        "red_jobbskatteavdrag": int(jsa),
        "red_förvärvsinkomst": int(forv),
        "red_regional": int(regional),
        "red_underskott_kapital": int(kap),
        "utrymme_rot_rut": int(utrymme),
        "rotavdrag_hogst": int(min(utrymme, ROT_TAK)),
    }


# --- körning över JSON-filen -------------------------------------------------------------------------------------------
def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", default=str(Path(__file__).with_name("verifiering-skv-2026.json")))
    ap.add_argument("--skriv", action="store_true", help="skriv tillbaka fältet 'oberoende' i JSON-filen")
    a = ap.parse_args(argv)
    p = Path(a.json)
    d = json.loads(p.read_text(encoding="utf-8"))
    rader = []
    max_abs = 0
    for k in d["korningar"]:
        if k.get("status") != "OK":
            continue
        i = k["indata"]
        ks = k["skatteverket"]["kommunalskatt_pct"]
        r = utrymme_rot_rut(lon=i["lon_ar"], pension=i["pension_ar"], fodelsear=i["fodelsear"], kommunalskatt_pct=ks,
                            fastighetsavgift_underlag=i["fastighetsavgift_underlag"], ranteutgifter=i["ranteutgifter"],
                            ranteinkomster=i.get("ranteinkomster", 0), kommun=i["kommun"])
        skv = k["skatteverket"]["utrymme_kr"]
        motor = k["motorn"]["utrymme_rot_rut_gt"]
        ob = r["utrymme_rot_rut"]
        k["oberoende"] = {"funktion": "logik/verifiering_oberoende.py utrymme_rot_rut()", "utrymme_rot_rut": ob,
                          "mellanled": r, "diff_skv_minus_oberoende_kr": skv - ob, "diff_motorn_minus_oberoende_kr": motor - ob}
        max_abs = max(max_abs, abs(skv - ob))
        rader.append((k["id"], i, ks, skv, motor, ob))
    print(f"{'id':7} {'född':5} {'kommun':10} {'lön':>9} {'pension':>8} {'ränta':>7} {'fa-underlag':>11} {'ks':>6} | "
          f"{'SKV':>7} {'motorn':>7} {'oberoende':>9} | {'SKV-ob':>6} {'mot-ob':>6}")
    for id_, i, ks, skv, motor, ob in rader:
        print(f"{id_:7} {i['fodelsear']:5} {i['kommun']:10} {i['lon_ar']:>9} {i['pension_ar']:>8} {i['ranteutgifter']:>7} "
              f"{i['fastighetsavgift_underlag']:>11} {ks:>6} | {skv:>7} {motor:>7} {ob:>9} | {skv - ob:>6} {motor - ob:>6}")
    print(f"\n{len(rader)} körningar; största |Skatteverket - oberoende| = {max_abs} kr")
    if a.skriv:
        d["_meta"]["oberoende"] = {"skript": "logik/verifiering_oberoende.py", "max_abs_diff_skv_minus_oberoende_kr": max_abs}
        p.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"skrev {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
