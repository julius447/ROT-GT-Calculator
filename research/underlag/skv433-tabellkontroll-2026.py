"""
Oberoende återimplementation av Skatteverkets SKV 433 (2026, utgåva 36) för månadstabell kolumn 1 och 2.
Skriven UTAN att titta på engine.js-logiken – endast SKV 433-texten. Används för att (a) bevisa att
återimplementationen träffar Skatteverkets publicerade tabell 34 rad för rad, (b) korskontrollera motorn.
"""
import math, sys, json
PBB=59200; IBB=83400
def floor100(x): return int(math.floor(x/100.0)*100)
def ceil100(x): return int(math.ceil(x/100.0)*100)
def trunc(x): return int(math.floor(x+1e-9))

def ga_ord(fi):
    if fi<=0.99*PBB: g=0.423*PBB
    elif fi<=2.72*PBB: g=0.423*PBB+0.20*(fi-0.99*PBB)
    elif fi<=3.11*PBB: g=0.77*PBB
    elif fi<=7.88*PBB: g=0.77*PBB-0.10*(fi-3.11*PBB)
    else: g=0.293*PBB
    return g
def ga_forhojt_del(fi):
    if fi<=0.91*PBB: return 0.687*PBB
    if fi<=1.11*PBB: return 0.885*PBB-0.20*fi
    if fi<=1.965*PBB: return 0.600*PBB+0.057*fi
    if fi<=2.72*PBB: return 0.333*PBB+0.1949*fi
    if fi<=3.11*PBB: return 0.3949*fi-0.212*PBB
    if fi<=3.24*PBB: return 0.4949*fi-0.523*PBB
    if fi<=5.00*PBB: return 0.356*fi-0.073*PBB
    if fi<=7.88*PBB: return 0.017*PBB+0.338*fi
    if fi<=8.08*PBB: return 0.703*PBB+0.251*fi
    if fi<=11.16*PBB: return 2.732*PBB
    if fi<=12.84*PBB: return 9.651*PBB-0.62*fi
    return 1.691*PBB
def grundavdrag(fi, a66):
    g=ga_ord(fi)+(ga_forhojt_del(fi) if a66 else 0)
    g=min(g,fi)
    return ceil100(g)

def pensionsavgift(ai):
    # Lag 1994:1744 3-4 §§ + SKV 433 7.4
    if ai < 0.423*PBB: return 0
    u=min(floor100(ai), 8.07*IBB)
    a=0.07*u
    r=a % 100
    if r<50 or abs(r-50)<1e-9: a=a-r
    else: a=a-r+100
    return int(round(min(a,47100)))

def jsa(ai, ga, ki, a66):
    ai=floor100(ai)
    if ai<=0: return 0
    if not a66:
        if ai<=0.91*PBB: u=ai-ga
        elif ai<=3.24*PBB: u=0.91*PBB+0.3874*(ai-0.91*PBB)-ga
        elif ai<=8.08*PBB: u=1.813*PBB+0.251*(ai-3.24*PBB)-ga
        else: u=3.027*PBB-ga
        return max(0,trunc(u*ki))
    if ai<=1.75*PBB: return trunc(0.22*ai)
    if ai<=5.24*PBB: return trunc(0.2635*PBB+0.07*ai)
    return trunc(0.6293*PBB)

def forv(bfi):
    if bfi<=40000: return 0
    if bfi<=240000: return trunc(0.0075*(bfi-40000))
    return 1500

def public_service(bfi):
    return trunc(0.01*min(bfi, 1.42*IBB))

def arsskatt_tabell(arsink, tabell, kol):
    """SKV 433 kap 8: kolumn 1 (lön <66) resp. kolumn 2 (pension 66+). Returnerar dict."""
    ki=(tabell-1.16)/100.0
    a66 = (kol==2)
    fi=floor100(arsink)
    ga=grundavdrag(fi,a66)
    bfi=max(0,fi-ga)
    kommunal=trunc(bfi*ki)
    statlig=trunc(0.20*max(0,bfi-643000)) if (bfi-643000)>=200 else 0
    begr=trunc(bfi*0.0116)
    ps=public_service(bfi)
    if kol==1:
        pa=pensionsavgift(fi)
        red_pa=min(pa, kommunal+statlig)
        red_jsa=min(jsa(fi,ga,ki,False), max(0,kommunal-red_pa))   # SKV 433 ex. 2: "9 592 kr men kan endast nyttja 6 019"
        red_forv=min(forv(bfi), max(0,kommunal-red_pa-red_jsa))
        tot=statlig+kommunal-red_pa-red_jsa-red_forv+begr+pa+ps
    else:
        pa=0; red_pa=0; red_jsa=0
        red_forv=min(forv(bfi), kommunal)
        tot=statlig+kommunal-red_forv+begr+ps
    return dict(fi=fi,ga=ga,bfi=bfi,kommunal=kommunal,statlig=statlig,pa=pa,red_pa=red_pa,red_jsa=red_jsa,red_forv=red_forv,begr=begr,ps=ps,arsskatt=tot,
                utrymme=max(0,kommunal+statlig-red_pa-red_jsa-red_forv))

def lastabell(path, tabell):
    rows={}
    for line in open(path,encoding='utf-8-sig'):
        line=line.rstrip('\n')
        if not line.startswith('30B%d'%tabell): continue
        fr=int(line[5:12]); to=int(line[12:19]); rest=line[19:]
        kol=[]
        for i in range(6):
            s=rest[i*5:(i+1)*5].strip()
            kol.append(int(s) if s else None)
        rows[to]=kol
    return rows

if __name__=='__main__':
    path=sys.argv[1]; tabell=int(sys.argv[2]) if len(sys.argv)>2 else 34
    rows=lastabell(path,tabell)
    # (a) validera återimplementationen mot hela tabellen (kol 1 och kol 2), månadslön <= 80 000
    for kol in (1,2):
        n=0; miss=[]; 
        for to,k in sorted(rows.items()):
            if to>80000 or k[kol-1] is None: continue
            r=arsskatt_tabell(to*12, tabell, kol)
            for rule in ('floor','round'):
                pass
            m_floor=int(math.floor(r['arsskatt']/12.0+1e-9)); m_round=int(math.floor(r['arsskatt']/12.0+0.5))
            n+=1
            if k[kol-1]!=m_floor and k[kol-1]!=m_round:
                miss.append((to,k[kol-1],m_floor,m_round))
            elif k[kol-1]==m_floor and k[kol-1]!=m_round: rows.setdefault('_f',[0,0])[0]+=1
            elif k[kol-1]==m_round and k[kol-1]!=m_floor: rows.setdefault('_f',[0,0])[1]+=1
        print(f"tabell {tabell} kolumn {kol}: {n} rader, {len(miss)} rader där varken floor(års/12) eller round(års/12) träffar; floor-only/round-only = {rows.get('_f')}")
        for x in miss[:15]: print('   miss', x)
        rows.pop('_f',None)
