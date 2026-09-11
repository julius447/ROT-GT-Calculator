"""
Referensimplementation av ROT-kalkylatorns beslutsmodell (se rot-spec.md) + generator för rot-testfall.json.
Kör:  python3 rot_logik_ref.py            -> skriver rot-testfall.json bredvid sig
Ingen UI. Ingen nätverksåtkomst. Alla regler pekar på 01-rot-regelverk.md (A-H) för källa.
"""
import json
from skatteutrymme_2026 import skatteutrymme, ROT_TAK, ROT_RUT_TAK, GT_TAK, KS_SNITT

# ---------- verdict-precedens ----------
PRECEDENS = ["nej", "troligen_ej", "osaker", "ja_med_villkor", "ja"]


def bedom(inp):
    """Returnerar (verdict, flaggor). inp = dict enligt frågesetet i rot-spec.md §2."""
    f = []            # flaggor (maskinläsbara koder, texter i rot-spec.md §5)
    klasser = set()

    bostad = inp.get("bostadstyp")            # smahus | bostadsratt | agarlagenhet | hyresratt | vet_inte
    ager = inp.get("ager")                    # ja | nej | vet_inte
    bor = inp.get("bor")                      # jag | foraldrar | fritid | nyköpt_flyttar_in | uthyrd | barn | sarbo | nej
    vardear = inp.get("vardear")              # t2011 | 2012_2020 | 2021_2025 | 2026_ej_fardig | vet_inte  (bara småhus / brf-småhus)
    arbetstyp = inp.get("arbetstyp")          # reparation | ombyggnad | vet_inte
    plats = inp.get("plats")                  # inne | utanfor | vet_inte  (bara bostadsrätt/ägarlägenhet)
    myndig = inp.get("myndig_vid_arsskiftet", True)
    skatt_sverige = inp.get("skattskyldig_sverige", True)
    stod = inp.get("bidrag_forsakring_gt", "nej")   # nej | ja | vet_inte
    dodsbo = inp.get("dodsbo", "nej")               # nej | fore_dodsfall | efter_dodsfall

    # --- hårda nej (A, B, C, G) ---
    if bostad == "hyresratt":
        klasser.add("nej"); f.append("hyresratt")
    if ager == "nej":
        klasser.add("nej"); f.append("ager_inte")
    if bor in ("uthyrd", "barn", "sarbo", "nej"):
        klasser.add("nej"); f.append({"uthyrd": "uthyrd_bostad", "barn": "barnets_bostad",
                                      "sarbo": "sarbos_bostad", "nej": "bor_inte_dar"}[bor])
    if not myndig:
        klasser.add("nej"); f.append("under_18")
    if not skatt_sverige:
        klasser.add("nej"); f.append("ej_skattskyldig_sverige")
    if stod == "ja":
        klasser.add("nej"); f.append("bidrag_forsakring_eller_gt_samma_arbete")
    if dodsbo == "efter_dodsfall":
        klasser.add("nej"); f.append("dodsbo_efter_dodsfall")
    if bostad in ("smahus", "bostadsratt_smahus") and vardear == "2026_ej_fardig":
        klasser.add("nej"); f.append("ej_fardigstallt_nybygge")
    if bostad in ("bostadsratt", "bostadsratt_smahus", "agarlagenhet") and plats == "utanfor":
        klasser.add("nej"); f.append("utanfor_lagenheten")

    # --- femårsregeln (B) ---
    if bostad in ("smahus", "bostadsratt_smahus") and vardear == "2021_2025":
        if arbetstyp == "ombyggnad":
            klasser.add("troligen_ej"); f.append("femarsregeln_ombyggnad")
        elif arbetstyp == "reparation":
            klasser.add("ja_med_villkor"); f.append("femarsregeln_endast_reparation")
        else:
            klasser.add("osaker"); f.append("femarsregeln_arbetstyp_okand")

    # --- osäkert (vet inte på avgörande fråga) ---
    if ager == "vet_inte":
        klasser.add("osaker"); f.append("agande_okant")
    if bostad in ("smahus", "bostadsratt_smahus") and vardear == "vet_inte" and arbetstyp != "reparation":
        klasser.add("osaker"); f.append("vardear_okant")
    if bostad in ("bostadsratt", "bostadsratt_smahus", "agarlagenhet") and plats == "vet_inte":
        klasser.add("osaker"); f.append("plats_okand")
    if bostad == "vet_inte":
        klasser.add("osaker"); f.append("bostadstyp_okand")
    if stod == "vet_inte":
        klasser.add("osaker"); f.append("stod_okant")

    # --- villkorade ja ---
    if bostad in ("bostadsratt", "bostadsratt_smahus") and plats == "inne":
        klasser.add("ja_med_villkor"); f.append("brf_stadgar_inre_underhall")
    if bor == "foraldrar":
        klasser.add("ja_med_villkor"); f.append("foraldrars_bostad_delagande_och_utgift")
    if bor == "nykopt_flyttar_in":
        klasser.add("ja_med_villkor"); f.append("nykopt_flytta_in_direkt")
    if bor == "fritid":
        f.append("fritidshus_ingen_annan_permanent")
    if dodsbo == "fore_dodsfall":
        klasser.add("ja_med_villkor"); f.append("dodsbo_fore_dodsfall")
    if bostad in ("smahus",) and vardear == "2012_2020":
        f.append("fastighetsavgift_befriad")   # påverkar bara skatteutrymmet, inte rätten

    for k in PRECEDENS:
        if k in klasser:
            return k, f
    return "ja", f


def rakna(inp):
    """Belopp + skattekapacitet. Returnerar dict."""
    verdict, flaggor = bedom(inp)
    arb = int(inp.get("arbetskostnad_inkl_moms", 0))
    mat = int(inp.get("material_inkl_moms", 0))
    ovr = int(inp.get("ovriga_kostnader_inkl_moms", 0))
    total = arb + mat + ovr
    agare = inp.get("agare", [])
    if not agare:
        agare = [{}]

    # 1) 30 % av arbetskostnaden (endast arbete)
    brutto = int(round(arb * 0.30))
    if mat + ovr > 0:
        flaggor.append("bara_arbetskostnad_ger_avdrag")

    # 2) pott kvar per ägare (ROT-tak 50 000, ROT+RUT 75 000)
    potter = []
    for a in agare:
        rot_anv = int(a.get("rot_anvant_i_ar", 0)); rut_anv = int(a.get("rut_anvant_i_ar", 0))
        kvar = max(0, min(ROT_TAK - rot_anv, ROT_RUT_TAK - rot_anv - rut_anv))
        potter.append(kvar)
        if kvar < ROT_TAK:
            flaggor.append("pott_delvis_forbrukad")
    if sum(potter) == 0:
        flaggor.append("pott_slut_i_ar"); flaggor.append("betala_efter_arsskiftet_ny_pott")
    if verdict == "nej":
        avdrag = 0
    else:
        avdrag = min(brutto, sum(potter))
    if avdrag < brutto and verdict != "nej":
        flaggor.append("taket_begransar")
    if len(agare) > 1:
        flaggor.append("flera_agare_delar")

    # 3) fördelning: fyll den med störst pott först (fakturan får fördela fritt mellan ägare som uppfyller villkoren)
    fordelning = []
    rest = avdrag
    ordning = sorted(range(len(agare)), key=lambda i: -potter[i])
    tilldelat = [0] * len(agare)
    for i in ordning:
        t = min(potter[i], rest); tilldelat[i] = t; rest -= t

    # 4) skattekapacitet per ägare (redan använt ROT/RUT i år + nytt avdrag + planerad grön teknik måste rymmas)
    skatt = []
    total_brist = 0
    gt_brist = 0
    for i, a in enumerate(agare):
        if "manadsinkomst" not in a:
            skatt.append({"status": "ej_bedomd"}); continue
        ar = int(a["manadsinkomst"]) * 12
        typ = a.get("inkomsttyp", "lon")
        p66 = bool(a.get("fyllt_66_vid_arets_ingang", False))
        lon = ar if typ in ("lon", "bada") else 0
        pen = ar if typ == "pension" else 0
        if typ == "bada":
            lon = int(a.get("lon_manad", 0)) * 12; pen = int(a.get("pension_manad", 0)) * 12
        tax = int(a.get("taxeringsvarde", 0))
        r = skatteutrymme(lon_ar=lon, pension_ar=pen, ar_66_plus=p66, ks=float(a.get("kommunalskatt", KS_SNITT)),
                          taxeringsvarde=tax, ranteutgifter=int(a.get("ranteutgifter_ar", 0)))
        utr = r["utrymme_rot_rut_gt"]
        redan = int(a.get("rot_anvant_i_ar", 0)) + int(a.get("rut_anvant_i_ar", 0))
        gt = int(a.get("gron_teknik_planerad_i_ar", 0))
        behov_rot = redan + tilldelat[i]
        ryms_rot = min(behov_rot, utr)
        brist = behov_rot - ryms_rot
        # grön teknik räknas av EFTER rot/rut (IL 67:2) -> GT förlorar först
        gt_ryms = max(0, min(gt, utr - behov_rot))
        gtb = gt - gt_ryms
        status = "ryms" if brist == 0 else ("ryms_delvis" if ryms_rot > 0 else "ryms_inte")
        skatt.append({"utrymme_kr": utr, "behov_rot_rut_kr": behov_rot, "status": status,
                      "aterbetalningsrisk_kr": brist, "gt_planerad_kr": gt, "gt_ryms_kr": gt_ryms, "gt_aterbetalningsrisk_kr": gtb})
        total_brist += brist; gt_brist += gtb
    if verdict == "nej":
        skatt_racker = "ej_relevant"
    elif any(s.get("status") == "ej_bedomd" for s in skatt):
        skatt_racker = "ej_bedomd"
    elif total_brist == 0:
        skatt_racker = "ryms"
    elif any(s.get("status") == "ryms_delvis" for s in skatt) or any(s.get("status") == "ryms" for s in skatt):
        skatt_racker = "ryms_delvis"
    else:
        skatt_racker = "ryms_inte"
    if total_brist > 0 and len(agare) > 1:
        flaggor.append("omfordela_mellan_agare")
    if gt_brist > 0:
        flaggor.append("gt_efter_rot_racker_inte")
    if any(int(a.get("ranteutgifter_ar", 0)) > 0 for a in agare):
        flaggor.append("ranteavdrag_minskar_utrymmet")

    att_betala = total - avdrag
    # dedupe flaggor, behåll ordning
    seen = set(); fl = [x for x in flaggor if not (x in seen or seen.add(x))]
    return {"verdict": verdict, "avdrag_brutto_kr": brutto, "avdrag_kr": avdrag, "att_betala_kr": att_betala,
            "fordelning_kr": tilldelat, "skatt_racker": skatt_racker, "skatt": skatt,
            "aterbetalningsrisk_kr": total_brist, "flaggor": fl}


# ---------- testfall ----------
def T(id_, beskrivning, inp):
    return {"id": id_, "beskrivning": beskrivning, "input": inp}


VILLA = dict(bostadstyp="smahus", ager="ja", bor="jag", vardear="t2011", arbetstyp="reparation")
CASES = [
    T("V01-villa-standard", "Villa, äger och bor, värdeår 2011 eller tidigare, byte av elcentral 40 000 kr arbete + 15 000 kr material, lön 45 000",
      {**VILLA, "arbetskostnad_inkl_moms": 40000, "material_inkl_moms": 15000,
       "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon", "taxeringsvarde": 3000000}]}),
    T("V02-tva-agare-over-taket", "Två ägare, stor elrenovering 400 000 kr arbete: 30 % = 120 000 men taket 2 x 50 000",
      {**VILLA, "arbetskostnad_inkl_moms": 400000, "material_inkl_moms": 60000,
       "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon", "taxeringsvarde": 3000000},
                 {"manadsinkomst": 40000, "inkomsttyp": "lon", "taxeringsvarde": 3000000}]}),
    T("B03-brf-inne-elcentral", "Bostadsrätt, elcentral inne i lägenheten, 20 000 kr arbete, lön 35 000",
      {"bostadstyp": "bostadsratt", "ager": "ja", "bor": "jag", "plats": "inne", "arbetskostnad_inkl_moms": 20000,
       "material_inkl_moms": 6000, "agare": [{"manadsinkomst": 35000, "inkomsttyp": "lon"}]}),
    T("B04-brf-laddbox-foreningens-pplats", "Bostadsrätt, laddbox på föreningens p-plats (utanför lägenheten)",
      {"bostadstyp": "bostadsratt", "ager": "ja", "bor": "jag", "plats": "utanfor", "arbetskostnad_inkl_moms": 8000,
       "material_inkl_moms": 15000, "agare": [{"manadsinkomst": 35000, "inkomsttyp": "lon"}]}),
    T("H05-hyresratt", "Hyresrätt: aldrig ROT, hänvisa till hyresvärden",
      {"bostadstyp": "hyresratt", "ager": "nej", "bor": "jag", "arbetskostnad_inkl_moms": 10000,
       "agare": [{"manadsinkomst": 30000, "inkomsttyp": "lon"}]}),
    T("N06-nybyggt-vardear-2022-ombyggnad", "Villa värdeår 2022 (4 år), utöka elcentralen/ny installation = ombyggnad -> femårsregeln",
      {**VILLA, "vardear": "2021_2025", "arbetstyp": "ombyggnad", "arbetskostnad_inkl_moms": 30000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("N07-nybyggt-vardear-2022-reparation", "Villa värdeår 2022, byte av trasig komponent till likvärdig = reparation -> ok med villkor",
      {**VILLA, "vardear": "2021_2025", "arbetstyp": "reparation", "arbetskostnad_inkl_moms": 30000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("N08-nybyggt-vardear-2021-ombyggnad", "Villa värdeår 2021 (5 år): fortfarande spärrat 2026, öppnar 2027",
      {**VILLA, "vardear": "2021_2025", "arbetstyp": "ombyggnad", "arbetskostnad_inkl_moms": 30000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("N09-vardear-2020-ombyggnad", "Villa värdeår 2020 (6 år): ombyggnad ok 2026, men ingen fastighetsavgift ännu (befriad 15 år) -> lägre utrymme",
      {**VILLA, "vardear": "2012_2020", "arbetstyp": "ombyggnad", "arbetskostnad_inkl_moms": 120000,
       "agare": [{"manadsinkomst": 30000, "inkomsttyp": "lon", "taxeringsvarde": 0}]}),
    T("F10-fritidshus", "Fritidshus som ägaren själv använder, äldre hus",
      {**VILLA, "bor": "fritid", "arbetskostnad_inkl_moms": 25000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon", "taxeringsvarde": 1500000}]}),
    T("P11-pensionar-lag-pension-brf", "Pensionär 66+, 15 000 kr/mån pension, bostadsrätt, arbete 100 000 kr -> 30 000 ryms inte helt",
      {"bostadstyp": "bostadsratt", "ager": "ja", "bor": "jag", "plats": "inne", "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 15000, "inkomsttyp": "pension", "fyllt_66_vid_arets_ingang": True}]}),
    T("P12-pensionar-villa-20k", "Pensionär 66+, 20 000 kr/mån, villa med fastighetsavgift, arbete 100 000 kr",
      {**VILLA, "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 20000, "inkomsttyp": "pension", "fyllt_66_vid_arets_ingang": True, "taxeringsvarde": 2000000}]}),
    T("L13-lon-20k-brf", "Löntagare 20 000 kr/mån, bostadsrätt, arbete 100 000 kr -> avdrag 30 000, utrymme ca 21 000",
      {"bostadstyp": "bostadsratt", "ager": "ja", "bor": "jag", "plats": "inne", "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 20000, "inkomsttyp": "lon"}]}),
    T("L14-lon-45k-villa", "Löntagare 45 000 kr/mån, villa, arbete 170 000 kr -> avdrag 50 000 (tak), ryms",
      {**VILLA, "arbetskostnad_inkl_moms": 170000,
       "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon", "taxeringsvarde": 3000000}]}),
    T("K15-redan-anvant-40k-rot", "Redan använt 40 000 kr ROT i år, nytt jobb 100 000 kr arbete -> bara 10 000 kvar",
      {**VILLA, "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon", "taxeringsvarde": 3000000, "rot_anvant_i_ar": 40000}]}),
    T("K16-rut-30k-plus-rot-50k-potten-slut", "RUT 30 000 + ROT 50 000 redan använt = 75 000 -> 0 kr kvar",
      {**VILLA, "arbetskostnad_inkl_moms": 60000,
       "agare": [{"manadsinkomst": 50000, "inkomsttyp": "lon", "taxeringsvarde": 3000000, "rot_anvant_i_ar": 50000, "rut_anvant_i_ar": 30000}]}),
    T("K17-rut-30k-anvant-rot-vill-50k", "RUT 30 000 använt, ROT 0: arbete 200 000 kr ger 60 000 brutto men max 45 000 (75 000-taket)",
      {**VILLA, "arbetskostnad_inkl_moms": 200000,
       "agare": [{"manadsinkomst": 50000, "inkomsttyp": "lon", "taxeringsvarde": 3000000, "rut_anvant_i_ar": 30000}]}),
    T("A18-under-18", "Köparen fyller inte 18 under året",
      {**VILLA, "myndig_vid_arsskiftet": False, "arbetskostnad_inkl_moms": 20000, "agare": [{}]}),
    T("M19-materialtungt-jobb", "Arbete 8 000 kr, material 32 000 kr: bara arbetet ger avdrag",
      {**VILLA, "arbetskostnad_inkl_moms": 8000, "material_inkl_moms": 32000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon", "taxeringsvarde": 3000000}]}),
    T("G20-rot-och-gron-teknik-samma-ar", "ROT 50 000 + planerad grön teknik 50 000 samma år, lön 40 000, villa: ROT räknas av först, GT förlorar",
      {**VILLA, "arbetskostnad_inkl_moms": 170000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon", "taxeringsvarde": 3000000, "gron_teknik_planerad_i_ar": 50000}]}),
    T("U21-vet-inte-agande", "Svarar vet inte på ägande",
      {**VILLA, "ager": "vet_inte", "arbetskostnad_inkl_moms": 30000, "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("U22-vet-inte-vardear-ombyggnad", "Villa, värdeår okänt, ny installation",
      {**VILLA, "vardear": "vet_inte", "arbetstyp": "ombyggnad", "arbetskostnad_inkl_moms": 30000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("U23-vet-inte-vardear-reparation", "Villa, värdeår okänt men ren reparation -> reparation ger ROT oavsett ålder",
      {**VILLA, "vardear": "vet_inte", "arbetstyp": "reparation", "arbetskostnad_inkl_moms": 30000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon", "taxeringsvarde": 3000000}]}),
    T("O24-foraldrars-bostad", "Köparen äger del av föräldrarnas villa och betalar jobbet",
      {**VILLA, "bor": "foraldrar", "arbetskostnad_inkl_moms": 30000,
       "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon"}]}),
    T("O25-uthyrd-bostad", "Villa som ägaren hyr ut",
      {**VILLA, "bor": "uthyrd", "arbetskostnad_inkl_moms": 30000, "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon"}]}),
    T("O26-forsakringsersattning", "Jobbet betalas av försäkringen",
      {**VILLA, "bidrag_forsakring_gt": "ja", "arbetskostnad_inkl_moms": 30000, "agare": [{"manadsinkomst": 45000, "inkomsttyp": "lon"}]}),
    T("B27-brf-radhus-fasad", "Bostadsrättsradhus, utebelysning på fasaden",
      {"bostadstyp": "bostadsratt_smahus", "ager": "ja", "bor": "jag", "vardear": "t2011", "plats": "utanfor",
       "arbetskostnad_inkl_moms": 6000, "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("D28-dodsbo-efter-dodsfall", "Dödsbo, arbete efter dödsfallet",
      {**VILLA, "dodsbo": "efter_dodsfall", "arbetskostnad_inkl_moms": 30000, "agare": [{}]}),
    T("S29-ej-skattskyldig-sverige", "Bor utomlands, betalar inte skatt i Sverige",
      {**VILLA, "skattskyldig_sverige": False, "arbetskostnad_inkl_moms": 30000, "agare": [{}]}),
    T("E30-agarlagenhet-inne", "Ägarlägenhet, arbete i lägenheten",
      {"bostadstyp": "agarlagenhet", "ager": "ja", "bor": "jag", "plats": "inne", "arbetskostnad_inkl_moms": 20000,
       "agare": [{"manadsinkomst": 40000, "inkomsttyp": "lon"}]}),
    T("V31-tva-agare-en-lag-inkomst", "Två ägare, 300 000 kr arbete (90 000 brutto), en heltid 50 000 och en deltid 15 000: omfördela",
      {**VILLA, "arbetskostnad_inkl_moms": 300000,
       "agare": [{"manadsinkomst": 50000, "inkomsttyp": "lon", "taxeringsvarde": 3000000},
                 {"manadsinkomst": 15000, "inkomsttyp": "lon"}]}),
    T("L32-hoginkomst-80k", "Löntagare 80 000 kr/mån, villa, allt ryms",
      {**VILLA, "arbetskostnad_inkl_moms": 170000,
       "agare": [{"manadsinkomst": 80000, "inkomsttyp": "lon", "taxeringsvarde": 4000000, "gron_teknik_planerad_i_ar": 50000}]}),
    T("L33-lon-30k-stort-bolan", "Löntagare 30 000 kr/mån, villa, ränteutgifter 100 000 kr/år -> utrymmet krymper med 30 000",
      {**VILLA, "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 30000, "inkomsttyp": "lon", "taxeringsvarde": 3000000, "ranteutgifter_ar": 100000}]}),
    T("P34-66plus-jobbar-och-pension", "66+, lön 20 000 + pension 15 000 per månad, villa",
      {**VILLA, "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 35000, "inkomsttyp": "bada", "lon_manad": 20000, "pension_manad": 15000,
                  "fyllt_66_vid_arets_ingang": True, "taxeringsvarde": 2000000}]}),
    T("N35-nybygge-ej-fardigt", "Hus under uppförande, inte taxerat som färdigt",
      {**VILLA, "vardear": "2026_ej_fardig", "arbetstyp": "ombyggnad", "arbetskostnad_inkl_moms": 30000, "agare": [{}]}),
    T("V36-agare-utan-inkomst", "Ägare utan egen inkomst (0 kr/mån): inget skatteutrymme alls, hela avdraget kan bli kvarskatt",
      {**VILLA, "arbetskostnad_inkl_moms": 60000,
       "agare": [{"manadsinkomst": 0, "inkomsttyp": "lon", "taxeringsvarde": 0}]}),
    T("P37-pensionar-10k", "Pensionär 66+, 10 000 kr/mån, bostadsrätt: utrymme ca 12 800 kr mot 30 000 kr avdrag",
      {"bostadstyp": "bostadsratt", "ager": "ja", "bor": "jag", "plats": "inne", "arbetskostnad_inkl_moms": 100000,
       "agare": [{"manadsinkomst": 10000, "inkomsttyp": "pension", "fyllt_66_vid_arets_ingang": True}]}),
    # Kalibrering mot Skatteverkets e-tjänst 2026-09-11 (kommunalskatt bakräknad ur tjänstens egen tabell)
    T("SKV-KAL-01", "Skatteverkets e-tjänst: född 1985, Stockholm, lön 360 000 -> 'Rotavdraget får högst vara 37 594 kronor'",
      {**VILLA, "arbetskostnad_inkl_moms": 0, "agare": [{"manadsinkomst": 30000, "inkomsttyp": "lon", "kommunalskatt": 0.3055}]}),
    T("SKV-KAL-02", "Skatteverkets e-tjänst: född 1955, Stockholm, pension 240 000 -> 35 702 kronor",
      {**VILLA, "arbetskostnad_inkl_moms": 0, "agare": [{"manadsinkomst": 20000, "inkomsttyp": "pension", "fyllt_66_vid_arets_ingang": True, "kommunalskatt": 0.3055}]}),
    T("SKV-KAL-03", "Skatteverkets e-tjänst: född 1985, Stockholm, lön 720 000, ränteutgifter 60 000, fastighetsavgift 10 425 -> utrymme 120 960 (tjänsten gav 140 535 med okapad avgift 30 000)",
      {**VILLA, "arbetskostnad_inkl_moms": 0, "agare": [{"manadsinkomst": 60000, "inkomsttyp": "lon", "kommunalskatt": 0.3055, "ranteutgifter_ar": 60000, "taxeringsvarde": 1390000}]}),
    T("SKV-KAL-04", "Skatteverkets e-tjänst: född 1990, Göteborg, lön 180 000 -> 11 881 kronor",
      {**VILLA, "arbetskostnad_inkl_moms": 0, "agare": [{"manadsinkomst": 15000, "inkomsttyp": "lon", "kommunalskatt": 0.3260}]}),
]


def generera():
    out = []
    for c in CASES:
        r = rakna(c["input"])
        exp = {"verdict": r["verdict"], "avdrag_kr": r["avdrag_kr"], "att_betala_kr": r["att_betala_kr"],
               "skatt_racker": r["skatt_racker"], "flaggor": r["flaggor"]}
        # extra fält som bygget kan verifiera mot
        exp["avdrag_brutto_kr"] = r["avdrag_brutto_kr"]
        exp["fordelning_kr"] = r["fordelning_kr"]
        exp["aterbetalningsrisk_kr"] = r["aterbetalningsrisk_kr"]
        exp["skatt_per_agare"] = r["skatt"]
        out.append({"id": c["id"], "beskrivning": c["beskrivning"], "input": c["input"], "expected": exp})
    doc = {
        "_meta": {
            "genererad": "2026-09-11",
            "av": "rot_logik_ref.py (referensimplementation) + skatteutrymme_2026.py",
            "regelkalla": "research/01-rot-regelverk.md (A-H) och logik/rot-spec.md",
            "parametrar_2026": {"rot_sats": 0.30, "rot_tak_kr": 50000, "rot_rut_tak_kr": 75000, "gt_tak_kr": 50000,
                                 "prisbasbelopp": 59200, "snitt_kommunalskatt": 0.3238, "skiktgrans": 643000,
                                 "fastighetsavgift_max": 10425, "pensionsavgift_max": 47100},
            "hedge": "Alla belopp är preliminära. Skatteverket avgör i slutskattebeskedet. Verktyget säger 'kan', aldrig 'får'.",
            "verdict_precedens": PRECEDENS,
            "skatt_racker_varden": ["ryms", "ryms_delvis", "ryms_inte", "ej_bedomd", "ej_relevant"],
        },
        "testfall": out,
    }
    with open("rot-testfall.json", "w", encoding="utf-8") as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=2)
    return doc


if __name__ == "__main__":
    d = generera()
    for t in d["testfall"]:
        e = t["expected"]
        print(f"{t['id']:<40} {e['verdict']:<15} avdrag {e['avdrag_kr']:>7} betala {e['att_betala_kr']:>8} skatt {e['skatt_racker']:<12} {e['flaggor']}")
