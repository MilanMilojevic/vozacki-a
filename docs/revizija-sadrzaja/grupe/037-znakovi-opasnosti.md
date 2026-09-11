# A6-037 — znakovi opasnosti

Datum: 2026-09-11. Verzija: v186. Pregledano svih **57 povezanih pitanja / 171 opcija**, oba pisma, **53 originalne slike**, pet tabela i cela kartica. Atlas ima istih 53 pitanja; nema dodatnih situacija ili SVG-a.

## Ispravke

Promenjeno je 10 objašnjenja, 47 dobrih je sačuvano. Ispravljeni su uslovi odstupanja od opšteg postavljanja 150–250 m, pogrešna bela boja table „naizmenično uključivanje vozila”, opis Andrejinog krsta i nepotrebne apsolutne tvrdnje. Znak kružnog toka ne podrazumeva ustupanje prvenstva; to određuju ostala signalizacija i pravila.

Važeći znak I-16 obuhvata bicikliste i vozače lakih električnih vozila. Sačuvani uži odgovor o biciklistima ostaje istinit i jedini tačan među ponuđenima, pa ključ nije promenjen. Kartica objašnjava puno značenje i zaseban znak za starije osobe. Osim toga precizirani su projektni uslovi postavljanja, a naslov dela o pruzi ostaje bez promenljivog broja znakova.

Zadržani su svi izvorni odgovori, njihov redosled, bodovi, slike, tabele i veze. Nema novog crteža, funkcije, biblioteke ili opšte izmene preslovljavanja.

## Izvori i nezavisni pregled

- [Pravilnik, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Celi čl. 17–23; relevantne odredbe čl. 35 za III-4, III-6, III-28, III-51 i III-70, uz zvanične ilustracije: značenja, oblik, boja i postavljanje znakova opasnosti.
- [ZOBS, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Član 47: pravila prvenstva prolaza, uz upozoravajuće znakove za raskrsnice.

Prvi pregled 037 /root/a0_sanitize i nezavisni puni pregled 042 /root/a1_safe_harness obuhvatili su svako pitanje/opciju/objašnjenje oba pisma, svih 53 originala i celu karticu. Drugi pregled je izdvojio još tri male korekcije u prvobitno zadržanim objašnjenjima: 8950, 10831 i 10840.

Root je pročitao svih deset konačnih parova i celu završnu L/C karticu, pune čl. 17–23 i odlučujuće opise, neposredno uporedio slike 10802/10805/10817/10824/10831/10840 i zvaničnu ilustraciju I-34/I-34.1. Pregledano je šest završnih mobilnih snimaka: postavljanje, Andrejin krst i red za I-16, oba pisma.

## Provere i granice

- Chromium **16/16 kartica**: 320/1280, oba pisma/teme, 100/200% osnovnog fonta. Tačan ceo sadržaj, pet tabela i 53 atlas stavke sa tačnim odgovorima/ARIA i istim redosledom.
- **228/228 pitanja**: svako na oba pisma i obe širine, tačni tekstovi/ključevi/objašnjenja, učitane slike i stvarne veze. Bez grešaka, horizontalnog prelivanja stranice i upisa sintetičkog napretka.
- Tabele imaju lokalno pomeranje; najveća izmerena razlika scrollWidth/clientWidth iznosi 308 px. Ovo nije potvrda konačne pogodnosti svih tabela na stvarnom telefonu.
- 17 tačnih generatorskih operacija: deset byQ i sedam fragmenata jedne kartice. Svi ostali EX podaci i četiri NUL bajta očuvani, izvor tačno rekonstruisan. `node tools/verify.mjs`: **249/249**.

Nema utvrđenog nesklada ključa u ovom skupu. Nije preuzet aktuelni privatni portal niti tvrđena puna WCAG/čitač-ekrana potvrda. Zatvaraju se kartica i 57 pitanja: ukupno 563 reviewed, 5 in-progress, 65 needs-expert, 694 unreviewed; kartice 14 reviewed, 1 in-progress, 24 unreviewed.

Dokazi: ignored output/revizija-20260911/037 i 042; root-approved.json, root-integration-proof.json, root-browser-result.json i root-*.png.

## Pojedinačna mapa

| ID | Objašnjenje | Osnov i nalaz |
|---:|---|---|
| 8950 | Ispravljeno | Pravilnik22–23: Opšte pravilo 150–250 m je tačno. Završno isključenje znakova opasnosti sa neposrednog mesta pobijaju izričita posebna postavljanja iz23. |
| 8952 | Očuvano | Pravilnik22–23: U naselju bliže od150 m nije obavezna tabla udaljenosti, a postojeće objašnjenje već navodi projekat. |
| 10781 | Ispravljeno | Pravilnik22–23: Oba odstupanja imaju projektni uslov, a van naselja i tablu; odobren after jasno odvaja posebna mesta iz23. |
| 10782 | Ispravljeno | Pravilnik22–23: Ključ table udaljenosti ostaje; odobren after dodaje drugi obavezni uslov projekta. |
| 10783 | Očuvano | Pravilnik18 tačka1: Krivina ulevo, crni simbol povijen ulevo. |
| 10784 | Očuvano | Pravilnik18 tačka1: Krivina udesno, crni simbol povijen udesno. |
| 10785 | Očuvano | Pravilnik18 tačka2: Dve uzastopne krivine; prva iz donjeg prilaza ulevo. |
| 10786 | Očuvano | Pravilnik18 tačka2: Dve uzastopne krivine; prva iz donjeg prilaza udesno. |
| 10787 | Očuvano | Pravilnik18 tačka3: Kosina pada sleva nadesno uz12%; nizbrdica. |
| 10788 | Očuvano | Pravilnik18 tačka3: Kosina raste sleva nadesno uz12%; uspon. |
| 10789 | Očuvano | Pravilnik18 tačka4: Obe ivice sužavaju kolovoz. |
| 10790 | Očuvano | Pravilnik18 tačka4: Leva ivica se povija, desna ostaje prava. |
| 10791 | Očuvano | Pravilnik18 tačka4: Desna ivica se povija, leva ostaje prava. |
| 10792 | Ispravljeno | Pravilnik18 tačka5: Podignuta ploča mosta iznad vode; odobren after uklanja neosnovano „jedina situacija”. |
| 10793 | Očuvano | Pravilnik18 tačka6: Vozilo prelazi ivicu u vodu; nema mostovske ploče. |
| 10794 | Očuvano | Pravilnik18 tačka7: Dve grbe i udubljenje između: izbočine i ulegnuća. |
| 10795 | Očuvano | Pravilnik18 tačka7: Jedno udubljenje u profilu. |
| 10796 | Očuvano | Pravilnik18 tačka7: Jedna grba u profilu. |
| 10797 | Očuvano | Pravilnik18 tačka8: Vozilo sa vijugavim tragovima, klizav kolovoz. |
| 10798 | Očuvano | Pravilnik18 tačka9: Točak rasipa kamenčiće; nije odron sa stene. |
| 10799 | Očuvano | Pravilnik18 tačka10: Stena levo i kamenje koje pada sa te strane. |
| 10800 | Očuvano | Pravilnik18 tačka11: Pešak na zebri u upozoravajućem trouglu. |
| 10801 | Očuvano | Pravilnik18 tačka12: Dvoje dece u trku, bez oznake početka zone škole. |
| 10802 | Ispravljeno | Pravilnik18 tačka13: Biciklista ostaje i na zvaničnom I-16. Današnje značenje uključuje i vozače LEV; odobren after čuva uži tačan ključ. |
| 10803 | Očuvano | Pravilnik18 tačka10: Stena desno i kamenje koje pada sa te strane. |
| 10804 | Očuvano | Pravilnik18 tačka15: Jelen u skoku, divljač. |
| 10805 | Ispravljeno | Pravilnik18 tačka16: Žuti trougao sa radnikom; jedina žuta osnova znakova opasnosti po20. Odobren after ispravlja III-70 na plavu tablu. |
| 10806 | Očuvano | Pravilnik18 tačka17: Tri kružna svetla vertikalno, najava semafora. |
| 10807 | Očuvano | Pravilnik18 tačka17: Tri kružna svetla horizontalno, isto značenje najave semafora. |
| 10808 | Očuvano | Pravilnik18 tačka18: Avion u trouglu: niski preleti blizu piste, ne lokacija aerodroma. |
| 10809 | Očuvano | Pravilnik18 tačka19: Vetrokaz na stubu ukazuje na jak bočni vetar. |
| 10810 | Očuvano | Pravilnik18 tačka20: Dve suprotne strelice: početak dvosmernog saobraćaja. |
| 10811 | Očuvano | Pravilnik18 tačka22: Uzvičnik: druga opasnost za koju nije predviđen poseban znak. |
| 10817 | Ispravljeno | Pravilnik18 tačka23: Jednako debeli ukršteni kraci; after popravlja „Kraći” i čuva uslov za opšta pravila prvenstva. |
| 10818 | Očuvano | Pravilnik18 tačka24: Tanja poprečna crta prolazi kroz deblji glavni pravac. |
| 10819 | Očuvano | Pravilnik18 tačka24: Tanja grana završava na glavnoj sa leve strane pod90°. |
| 10820 | Očuvano | Pravilnik18 tačka21: Zidani portal i otvor tunela. |
| 10821 | Očuvano | Pravilnik18 tačka24: Tanja grana sa desne strane pod90°. |
| 10822 | Očuvano | Pravilnik18 tačka24: Tanja grana sa desne strane sa donjeg dela, oštar ugao. |
| 10823 | Očuvano | Pravilnik18 tačka24: Tanja grana sa desne strane sa gornjeg dela, tup ugao. |
| 10824 | Ispravljeno | Pravilnik18 tačka25: Tri kružne strelice u trouglu. Odobren after ne izvodi obavezu propuštanja samo iz I-30. |
| 10825 | Očuvano | Pravilnik18 tačka27: Ograda: železnički prelaz sa branicima/polubranicima. |
| 10826 | Očuvano | Pravilnik18 tačka14: Krava: domaće životinje pod nadzorom. |
| 10827 | Očuvano | Pravilnik18 tačka24: Tanja grana sa leve strane sa donjeg dela, oštar ugao. |
| 10828 | Očuvano | Pravilnik18 tačka24: Tanja grana sa leve strane sa gornjeg dela, tup ugao. |
| 10829 | Očuvano | Pravilnik18 tačka26: Tramvaj sa pantografom i šinama. |
| 10830 | Očuvano | Pravilnik18 tačka28: Lokomotiva: železnički prelaz bez branika/polubranika. |
| 10831 | Ispravljeno | Pravilnik18 tačka29; Pravilnik19–20; zvanična ilustracija I-34/I-34.1: Jedan X sa dodatnim donjim krakovima označava dva ili više koloseka. Potrebna mala ispravka doslovnog opisa dva cela krsta. |
| 10832 | Očuvano | Pravilnik18 tačka30: Prikaz serije tri/dve/jedne kose crvene crte. Prazan trougao ne određuje opremu prelaza; ključ pita samo udaljenost. |
| 10833 | Očuvano | Pravilnik18 tačka30: Dve crvene kose crte:160 m. |
| 10834 | Očuvano | Pravilnik18 tačka30: Tri crte:240 m, iznad ograda za prelaz sa branicima/polubranicima. |
| 10835 | Očuvano | Pravilnik18 tačka30: Tri crte:240 m, iznad lokomotiva za prelaz bez branika/polubranika. |
| 10836 | Očuvano | Pravilnik18 tačka33: Tri vozila gledana otpozadi sa crvenim svetlima, opasnost stvaranja kolone. |
| 10837 | Očuvano | Pravilnik18 tačka32: Točak izvan osipajuće ivice, opasna bankina. |
| 10838 | Očuvano | Pravilnik18 tačka31: Pešak koji hoda bez zebre. I-36.1 je zaseban znak za starije, ne razlog promene ključa I-36. |
| 10839 | Očuvano | Pravilnik18 tačka30: Jedna crvena kosa crta:80 m. |
| 10840 | Ispravljeno | Pravilnik18 tačka29; Pravilnik19–20; zvanična ilustracija I-34/I-34.1: Jednostavan X: jedan kolosek. Potrebna mala ispravka poređenja sa znakom sa dodatnim donjim krakovima. |
