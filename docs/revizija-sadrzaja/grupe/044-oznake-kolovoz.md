# A6-044 — oznake na kolovozu

Datum: 2026-09-11. Verzija: v189. Potpuni pregled **59 pitanja /185 opcija /43 originalne JPEG slike**, oba pisma, cele kartice sa12 postojećih SVG-a. Obuhvat:48 direktno povezanih pitanja i11 dodatnih iz atlasa; kartica prikazuje21 atlas i22 situacije.

## Ispravke

Sedamnaest objašnjenja ispravlja pogrešno prepoznate linije na fotografijama9315/11065, netačne apsolutne zabrane i nedovoljno precizne opise. Sačuvani su ključevi, opcije i njihov redosled, bodovi, originalne fotografije i veze; ostala42 objašnjenja ostaju ista. Bela boja sama ne dozvoljava parkiranje, isprekidana linija sama ne dozvoljava svako polukružno okretanje, a posebni izuzeci iz ZOBS55 ne dopuštaju prikazana preticanja običnog automobila.

U kartici je popravljena strana kretanja vozila i položaj pune/isprekidane polovine, traka sa izmenljivim smerom sada je između dva para isprekidanih linija, a upozoravajuća linija je pre pune u smeru vozila. Kosnik i graničnik prate službene oblike; vozila su uklonjena sa linije vodilje i iz polja za usmeravanje. Pojasnjena su ograničenja obaveze zaustavljanja i konkretna bankina na crtežu. U ćirilici se svih12 ARIA opisa prevodi kroz postojeći prolaz; nije dupliran ceo HTML kartice.

Tabela na uskom telefonu dobila je ograničene proporcije kolona da duga prva ćelija ne svede drugu na jedno slovo. Crteži imaju bolji kontrast prema stvarnoj putnoj podlozi. Nema novih crteža, biblioteka, promene globalnog CSS-a, app.js ili simulacije ispita.

## Status koji ostaje otvoren

**9288 — needs-expert:** Fotografija prikazuje usku strelicu V-12, a označeni odgovor tačno opisuje najavu pune linije. Međutim, čl.67 važećeg Pravilnika naziva je skretanje saobraćaja – uska strelica, što se preklapa sa ponuđenim netačnim odgovorom29634. Beleži se terminološka nedoumica za potvrdu ispitnog konteksta, ne dokazana pogrešnost označenog užeg odgovora. Ključ nije promenjen. Novo objašnjenje jasno razdvaja užu funkciju iz pitanja i današnji naziv. Ovaj status nije automatsko menjanje odgovora. **10061** je zatvoren: parkiranje na polju za usmeravanje potvrđeno je originalnom fotografijom i čl.67, a druga zavisnost parkiranje prethodno je pregledana.

## Provera i izvori

- [Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Čl.45 i58–68: boje, uzdužne/poprečne/ostale oznake, V-12; službeni oblici V-2,V-2.1,V-3.
- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Čl.20,32–35,46,48,50,55–56,62,66,132–145: radnje, izuzeci preticanja/obilaženja, zaustavljanje i odnos signalizacije. Identitet javnih izvora potvrđen svežim odgovorima11.09.2026; dve službene ilustracije za V-2/V-2.1/V-3 sačuvane su u dokazima uz hashove.
- Prvi pregled /root/a1_safe_harness i nezavisni /root/a0_sanitize: svih59 pitanja/185 opcija/EX oba pisma, svih43 originalnih JPEG, cela L/C kartica,12 SVG i24 pristupačna opisa. Peer049 dodao je dva uska pojašnjenja primenjena u konačnom izdanju.
- Root pročitao svih17 završnih parova objašnjenja i celu L/C karticu, pregledao svih12 L kandidatskih SVG-a i šest integrisanih C snimaka, neposredno proverio original9288 i njegove opcije. Zasebno pročitane odlučujuće odredbe ZOBS55 i Pravilnika63–67, uključujući cele64–66 i V-12 u67.
- Integrisani Chromium **16/16 kartica**,320/1280,oba pisma/teme,100/200% osnovnog fonta; **236/236 prikaza pitanja**. Sva43 galerijska odgovora/naziva/redosleda su tačna. Svih12 SVG-a ima očekivane opise i natpise u granicama; jedini natpis STOP najmanje25px. Nema grešaka, page overflow-a ili upisa sintetičkog napretka.
- U prvom vizuelnom pregledu kolone na320 imaju najmanje91,06px. Nezavisno potvrđen kontrast prema putu: bela8,148:1, plava3,425, crvena3,540, zelena4,696. To je provera konkretnih parova, ne potpuna tvrdnja o WCAG usaglašenosti ili test stvarnog telefona.
- Rekonstrukcija generatora iz19 tačnih operacija /36 kartičnih fragmenata, četiri NUL bajta, potpuno isti ostali EX podaci. Konačni HTML odgovara nezavisno pregledanom predlogu i dvema tačnim peer dopunama. Dokazi: ignored044/049, root-approved.json, root-integration-proof.json, root-browser-result.json, frozen-hashes.json i root-verify-v189.log.

## Mapa pitanja

Završno `node tools/verify.mjs`: sve lokalne provere prošle, **249/249 automatizovanih testova**. Semantička tačnost ima zaseban dokaz iz pregleda iznad.

| ID | Ishod | Osnov i nalaz |
|---:|---|---|
| 9244 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Razdelna deli kolovozne/saobraćajne trake; ivična i upozoravajuća nisu traženi opšti naziv. |
| 9251 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Slika: 2 je kratka vodilja unutar raskrsnice; 1 prilazna isprekidana, 3 puna, 4 razdelna na drugom kraku. |
| 9255 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63; ZOBS145: Slika: središnja traka2 između udvojenih isprekidanih granica; zeleno iznad2/1, crveno iznad3. Ključ2 odgovara promenljivoj traci. |
| 9256 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Slika: 4 najavljuje punu liniju kod krivine; 1/2 ivične, 3 obična razdelna. |
| 9258 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63–64: Slika: 3 udvojena puna, 4 obe razdelne isprekidane;1/2 ivice. |
| 9262 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63; ZOBS145: Dva tačna odgovora: promenljiv smer i semafori iznad trake; nije posebna traka za preticanje. |
| 9288 | Terminološka nedoumica | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.1; Pravilnik76/2026: Pravilnik 67, odeljak 2.3.1, V-12: Fotografija prikazuje usku strelicu V-12, a označeni odgovor tačno opisuje najavu pune linije. Međutim, čl.67 važećeg Pravilnika naziva je skretanje saobraćaja – uska strelica, što se preklapa sa ponuđenim netačnim odgovorom29634. Beleži se terminološka nedoumica za potvrdu ispitnog konteksta, ne dokazana pogrešnost označenog užeg odgovora. Ključ nije promenjen. |
| 9290 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.2: Široko šrafirano polje između tokova: nema vožnje, zaustavljanja ni parkiranja. |
| 9291 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.2; ZOBS35: Polje levo od posmatrača odvaja suprotan smer; vozilo ostaje desno. |
| 9292 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.2: Broj1 pokazuje belo klinasto polje ispred ostrva; ne premeštati na susednu saobraćajnu traku. |
| 9293 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.2: Beli klin između glavnog pravca i izlaza; sve tri radnje zabranjene. |
| 9294 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59;67,2.3.4: Žuti BUS sa uzdužnim oznakama: javni prevoz putnika, ne samo autobusi/niti samo taksi. Taksi upotreba trake zavisi od lokalnog režima; ključ ostaje tačna opšta namena. |
| 9296 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.5;25t30;26t38;35t70: Crveni prsten40 ponavlja ograničenje najveće brzine; nije plava preporučena ili najmanja. |
| 9305 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.6; Pravilnik76/2026: Pravilnik 67, 2.3.6: Žuta zabrana uz parking T oznake nalazi se na kolovozu; nema BUS natpisa. |
| 9308 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59;67,2.3.8; Pravilnik76/2026: Pravilnik 59; 67, 2.3.2 i 2.3.8: Originalni beli T završeci odvajaju podužna parking mesta; namena se ne zaključuje samo iz bele boje. |
| 9309 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.8: Bela T ograničenja mesta uz ivicu, podužno parkiranje; ne upravno/po želji. |
| 9310 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59;67,2.3.8: Prazno jasno belo pravougaono parking mesto između dva vozila; nema BUS oznake. |
| 9312 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59;67,2.3.8; Pravilnik76/2026: Pravilnik 59; 67, 2.3.8: Niz belih pravougaonih mesta sa parkiranim vozilima; oblik i raspored su odlučujući. |
| 9313 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.8: Linije mesta su upravne na ivičnjak, ne podužne/kose. |
| 9315 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63–64; Pravilnik76/2026: Pravilnik 63–64: Broj1/2 ivice;3 isprekidana razdelna;4 njen PUNI nastavak na prilazu. Stari EX pogrešno zove4 vodiljom. |
| 9338 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63;ZOBS32,48st2; ZOBS: ZOBS 32 st.3–4; 48 st.2; Pravilnik 63: Putanja1 prati obeleženi nastavak trake, putanja2 prelazi u susednu. Ne izvoditi zabranu svih promena trake u svim raskrsnicama. |
| 9615 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63;ZOBS55st3t15,st5,st7; ZOBS: ZOBS 55 st.3 t.15, st.5 i 7: Stvarni automobil i putanja preko udvojene pune; nepropisno preticanje, pokazivač ne daje pravo. Izuzeci nisu primenljivi na prikazano preticanje automobila. |
| 9618 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63;ZOBS55st3t15,st5,st7; ZOBS: ZOBS 55 st.3 t.15, st.5 i 7: Stvarni automobil, puna linija bliža posmatraču. Nepropisno preticanje; stari EX ne sme poricati zakonit izuzetak obilaženja. |
| 9685 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63;ZOBS32,50; ZOBS: ZOBS 32 st.3; 50; Pravilnik 63: U-okret preko pune linije u slici zabranjen; sama isprekidana na drugom mestu nije garancija dovoljne preglednosti/širine. |
| 10061 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.2;ZOBS66: Dva auta na belom šrafiranom polju stoje nepropisno. Raniji sadržajni pregled008/011 sačuvan; ovde završena zavisnost oznake-kolovoz. |
| 10994 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59;67,2.3.6: Posebne namene opisane u pitanju su žute. |
| 10995 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59: Opšte pravilo bela; nema promene ključa zbog posebnih žutih/plavih izuzetaka. |
| 10996 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59t2: Oznake javnog prevoza su žute. |
| 10997 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59t1;45st1–2; Pravilnik76/2026: Pravilnik 59; 45 st.1–2: Zona radova: žute oznake; tvrdnja o svim žutim osnovama znakova traži propisane izuzetke. |
| 10998 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 59t3: Elektronska naplata: žuta, bela je opšte pravilo. |
| 11000 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63;ZOBS55; Pravilnik76/2026: Pravilnik 63; ZOBS 55 st.5 i 7: Definicija pune razdelne linije tačna; dodatak BEZUSLOVNO nije. |
| 11001 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Kratka isprekidana vodilja kroz raskrsnicu, ne puna/kombinovana. |
| 11002 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63–64: Ista fotografija kao9258, neposredno viđena:3 udvojena puna. |
| 11004 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Puna bliže desnoj ivici odgovarajuće kolovozne trake nosi zabranu; isprekidana je druga strana. |
| 11005 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Slika: putanja2 kreće od isprekidane strane;1 od pune. |
| 11006 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Mogućnost prelaska sa isprekidane strane; nije opšta dozvola oba smera. |
| 11008 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63;ZOBS55; Pravilnik76/2026: Pravilnik 63; ZOBS 55 st.5 i 7: Broj3 dve pune,4 isprekidane istog smera,1/2 ivice. Definicija bez dodatnog poricanja izuzetaka. |
| 11010 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63–64: Broj3 puna kroz krivinu,4 isprekidana prilazna,2 leva ivica,1 desni prekid pri prilazu. |
| 11011 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 64: Ivična označava ivicu površine kolovoza. |
| 11012 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1: Nema znaka u crtežu; puna poprečna ima značenje obaveznog zaustavljanja na prilazu. Crveno vozilo staje ispred nje. |
| 11025 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.2: Original V-2: desna traka se zatvara; broj trakâ se smanjuje. |
| 11026 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.3: Označen beli klin na ulivanju prilaza, graničnik V-3; nije parking/kosnik. |
| 11029 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.5;18t12: Deca u crvenom trouglu ponavljaju upozorenje; nisu zona škole ili plava pešačka staza. |
| 11031 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1;67,2.3.5; Pravilnik76/2026: Pravilnik 25 t.3; 67, 2.3.5: Beli obrnuti trougao i trouglići pred zebrom: ustupi prvenstvo, ne obavezno stajanje. |
| 11032 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1;67,2.3.5; Pravilnik76/2026: Pravilnik 25 t.3; 67, 2.3.5: Crveni STOP osmougao na asfaltu i stubu: potpuno zaustavljanje i propuštanje. |
| 11033 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1;67,2.3.4: Beli STOP i puna poprečna linija pred zebrom ponavljaju stvarni STOP na stubu. |
| 11035 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.5;26t40: Beli bicikl na fizički odvojenoj dvosmernoj stazi, plavi bicikl pored; ključ ne kaže isključivo bicikli. Važeća dozvoljena upotreba LEV se time ne poriče. |
| 11036 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.5;ZOBS66t20: Žute oznake kolica unutar parking mesta i odgovarajući znak: rezervisano mesto, ne kretanje kolica/prelaz. |
| 11037 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.6;ZOBS66st4; Pravilnik76/2026: Pravilnik 67, 2.3.6; ZOBS 66 st.1 t.9 i st.4: Žuti BUS i cik-cak kod nadstrešnice: stajalište. EX mora sačuvati taksi izuzetak za ulazak/izlazak. |
| 11038 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 67,2.3.6;ZOBS66t21: Žuti TAXI i isprekidana granica prostora: rezervisano taksi mesto, ne opšte zaustavljanje drugih. |
| 11040 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63: Linija upozorenja najavljuje punu liniju; ne ivična/obična razdelna. |
| 11041 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 58,62,65–67: Svih šest navedenih vrsta pripada poprečnim oznakama. Ne dodavati LEV promenom naziva kategorije oznake. |
| 11042 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1;ZOBS142: Pred semaforom obavezno stajanje kada zabranjuje prolaz; dodatni STOP nije neophodan. |
| 11046 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1;ZOBS142; Pravilnik76/2026: Pravilnik 66, 2.2.1; ZOBS 142: Dva stvarna crvena svetla i puna poprečna linija pred zebrom: stajanje ispred linije. |
| 11050 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1: STOP znak i puna poprečna pred zebrom; prvo obavezno stajanje na označenom mestu, ne slobodan izbor. |
| 11051 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1: Carina/policija/putarina: puna linija i zabrana prolaska bez zaustavljanja; nije potrebna dodatna rampa/naredba. |
| 11053 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.1: Policijski STOP, puna poprečna i rampa dalje napred: linija određuje mesto stajanja. |
| 11054 | Očuvano | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 66,2.2.2: Original V-2.1: desno nova traka, kosnik otvaranja; ne parking. |
| 11065 | Objašnjenje ispravljeno | Pravilnik76/2026; ZOBS tamo gde je izričito navedeno: 63–64; Pravilnik76/2026: Pravilnik 63–64: 1/2 spoljne ivice;3 puna u kombinaciji;4 ISPREKIDANA na strani posmatrača, ne suprotnoj. |
