# A6-029 — preticanje i obilaženje

Datum: 2026-09-11. Verzija: v182. Pregledano 95 pitanja: 88 stvarno povezanih sa karticom i još sedam samostalnih pitanja iste podoblasti. Dva preostala pitanja podoblasti, 9862 i 9865, pripadaju paketu znakova naredbi 032.

## Rezultat

Ispravljeno je 29 objašnjenja; preostalih 66 očuvano. Cela kartica je pregledana i precizirana: uslovi preticanja zdesna, razlika prolaska kolona i pojedinačnog vozila, izuzeci od zabrana, dužnosti preticanog vozača i zaštita pešaka. Uklonjena je neproverena garancija pet pitanja na svakom budućem ispitu. Ne menjaju se pitanja, opcije, ključevi, bodovanje ili simulacija.

Opšte tačan odgovor nije proglašen spornim samo zbog posebnog izuzetka. Posebno je ponovo provereno 10484: ključ prenosi opštu zabranu pune linije; izuzeci su kratko objašnjeni. Kod 9815 izuzetak za traktor ne dopušta prikazanu radnju koja uključuje i automobil. U 9730 razlog je prolazak zdesna u naselju sa dve trake, bez izmišljanja kolone na slici. U 9820 uklonjena je tvrdnja da se levo vidi ivica puta umesto suprotnog smera. Fotografije nisu menjane.

Sačuvana su sva tri crteža i 60 situacija. Putanje, železničke šine, bele oznake i konture vozila sada imaju bolji kontrast; boje vozila i geometrija manevara su očuvane. Treći crtež dobio je konkretan pristupačni opis, a sva tri opisa prate izabrano pismo. Nema novih runtime slika ili funkcija.

## Izvori i nezavisni pregled

- [ZOBS, PIS, zaključno sa 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Čl. 7 tač. 74–77, 32, 36, 50, 53–58, 106–107: preticanje, obilaženje i opšti uslovi radnje.
- [Pravilnik o saobraćajnoj signalizaciji, PIS, zaključno sa 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Čl. 25 tač. 28 (II-28), 32 i 35 tač. 3, 7, 13, 21–22: zabrana preticanja i znakovi na prikazanim putevima.

Prvi sadržajni pregled 88 pitanja: /root/a0_sanitize (029); nezavisni pregled svih opcija oba pisma, svih 62 originalnih fotografija i cele kartice: /root/learning_visual_second_review (030). Root je pročitao sve završne zamene, novu celu karticu na oba pisma i relevantne pune odredbe, dodatno pregledao odlučujuće fotografije i svih šest završnih snimaka crteža. Sedam samostalnih pitanja sa četiri dodatne fotografije neposredno je pregledao root. Svako od tih pitanja ostaje bez generičke kartice jer postojeće samostalno objašnjenje pokriva razlog.

## Provere i granice

- Chromium: 16/16 prikaza kartice, širine 320/1280, oba pisma i teme, običan/dvostruk osnovni font. Cela očekivana kartica, vidljivi pasusi, četiri odeljka, tri crteža i njihovi opisi; bez horizontalnog prelivanja ili grešaka.
- Svih 95 pitanja na oba pisma i obe širine: 380/380. Tačni tekstovi, ponuđeni odgovori/ključevi i objašnjenja, učitane slike i sve stvarne veze; otvaranje povezane kartice. Sintetičko skladište bez upisa.
- Iz neprozirnih boja konačnih SVG-a: bela oznaka/kolovoz 3,435:1, zelena putanja 3,513:1, crvena 3,540:1, kontura vozila 5,210:1. Direktno pregledani svi završni crteži. Ovo je konkretna provera informativnih granica, ne celovita WCAG potvrda ili test fizičkog telefona.
- Tačna rekonstrukcija generatora kroz 42 operacije, četiri NUL bajta očuvana; jedine EX promene su 29 objašnjenja i kartica preticanja. Potpuna tehnička provera: `node tools/verify.mjs`, 249/249.

Ukupno se zatvaraju 93 pitanja i kartica. Pitanja 9762/9813 imaju i karticu znakova naredbi, pa ostaju in-progress do njenog završetka. Ukupno: 340 reviewed, 6 in-progress, 62 needs-expert, 919 unreviewed; kartice 10 reviewed, 1 in-progress, 28 unreviewed. Nijedan ključ ove grupe nije u utvrđenom sukobu sa pregledanim propisom; aktuelni portal nije ovim paketom ponovo preuzet.

Dokazi: ignorisani output/revizija-20260911/029 i 030; root-final-approved.json, root-final-operations.json, root-integration-proof.json, root-browser-result.json i root-svg-*.png.

## Pojedinačna mapa

| ID | Objašnjenje | Provereni osnov i nalaz |
|---:|---|---|
| 9718 | Očuvano | 53(1): Preticanje sleva; na slikama nema propisanog razloga za preticanje zdesna. |
| 9721 | Očuvano | 53(1): Preticanje sleva; na slikama nema propisanog razloga za preticanje zdesna. |
| 9722 | Očuvano | 53(2): Položaj i levi signal zajedno određuju desnu stranu; 9723 nije zabrana svake radnje. |
| 9723 | Ispravljeno | 53(2): Položaj i levi signal zajedno određuju desnu stranu; 9723 nije zabrana svake radnje. Objašnjenje pogrešno pretvara levi pokazivač vozila koje skreće ulevo u zabranu svakog preticanja; čl. 53 st. 2 upravo nalaže prolazak zdesna. |
| 9725 | Očuvano | 53(2): Položaj i levi signal zajedno određuju desnu stranu; 9723 nije zabrana svake radnje. |
| 9728 | Očuvano | 53(3): Tramvaj na sredini: samo zdesna kada tamo postoji traka. |
| 9729 | Ispravljeno | 53(4): Dve trake istog smera i kolone; brže kretanje jedne kolone nije preticanje. Izostavljen je zakonski uslov da su na putu kolone vozila, pa objašnjenje sada netačno generalizuje pravilo na svaki put sa dve trake. |
| 9730 | Ispravljeno | 53(5): Naselje i najmanje dve trake; kolona nije uslov. Na9730 znak naselja jeste vidljiv. Slika ne dokazuje desnu kolonu; neposredan osnov je posebno pravilo za prolazak zdesna u naselju iz čl. 53 st. 5. |
| 9731 | Očuvano | 53(4): Dve trake istog smera i kolone; brže kretanje jedne kolone nije preticanje. |
| 9734 | Očuvano | 53(5): Naselje i najmanje dve trake; kolona nije uslov. Na9730 znak naselja jeste vidljiv. |
| 9736 | Očuvano | 54(1): Dat znak za preticanje: obaveza pomeranja ka desnoj ivici. |
| 9738 | Očuvano | 54(1–2): Bez ubrzavanja; usporavanje nije obavezno. Pomeranje udesno ima poseban uslov. |
| 9739 | Ispravljeno | 54(1–2): Bez ubrzavanja; usporavanje nije obavezno. Pomeranje udesno ima poseban uslov. Pomeranje udesno je obaveza samo vozača kome je dat znak za preticanje; pitanje i slika taj uslov ne navode. |
| 9741 | Ispravljeno | 54(1–2): Bez ubrzavanja; usporavanje nije obavezno. Pomeranje udesno ima poseban uslov. Isto neosnovano proširenje obaveze pomeranja udesno bez datog znaka za preticanje. |
| 9743 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 9745 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 9747 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 9748 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 9750 | Ispravljeno | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Desni pokazivač teretnog vozila ne zamenjuje neposrednu proveru vozača koji pretiče. Izvorna fotografija zaklanja pogled ispred kamiona. Ključ31068 odgovara32 st.3–4 i55 st.1–2; obe druge opcije nezakonito prenose procenu na vozača ispred. Ispravljena su samo slikovna preciznost i slaganje znaka sa glagolom. |
| 9752 | Ispravljeno | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Ista obaveza neposredne provere iz32 st.3–4 i55 st.1–2; desni pokazivač na kamionu nije dozvola za preticanje. Na fotografiji je pristupna površina desno. Odgovor31073 je jedini pravilan. Uvod objašnjenja više ne zavisi od prethodnog pitanja; izbegnuta tvrdnja o isključivoj odgovornosti jednog učesnika. |
| 9754 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 9755 | Ispravljeno | 7(77);55(3)(1–2): Kolona nije isto što i skup vozila; niz na slikama ne ostavlja bezbedan povratak između vozila. „Skup vozila sme da se pretiče” je preširoko: skup nije kolona, ali sva druga ograničenja i dalje važe. |
| 9757 | Očuvano | 7(77);55(3)(1–2): Kolona nije isto što i skup vozila; niz na slikama ne ostavlja bezbedan povratak između vozila. |
| 9759 | Očuvano | 55(3)(2): Vozač iza već je započeo radnju; vozilo ispred ne sme započeti svoje preticanje. |
| 9760 | Očuvano | 55(3)(2): Vozač iza već je započeo radnju; vozilo ispred ne sme započeti svoje preticanje. |
| 9761 | Očuvano | 55(3)(2): Vozač iza već je započeo radnju; vozilo ispred ne sme započeti svoje preticanje. |
| 9762 | Ispravljeno | Pravilnik25(28),32;55(3)(14): II-28 i stvarni automobil/kamion ispred; uska definicija izuzetog preticanog motocikla i mopeda. Opis znaka II-28 izostavlja moped i ograničenje na motocikl sa dva točka bez prikolice. |
| 9763 | Očuvano | 55(3)(3–4): Ispred na istoj traci dat znak za preticanje/obilaženje ili rizik/opstrukcija; desni signal nije isti uslov. |
| 9764 | Očuvano | 55(3)(2): Vozač iza već je započeo radnju; vozilo ispred ne sme započeti svoje preticanje. |
| 9765 | Očuvano | 55(3)(2): Vozač iza već je započeo radnju; vozilo ispred ne sme započeti svoje preticanje. |
| 9766 | Ispravljeno | 55(3)(5–6): Nemoguć bezbedan povratak i zaustavna traka; zone škole/30 nisu samostalne zabrane. Duga zbirna lista sadrži više preširokih pravila koja nisu potrebna za odgovor, uključujući punu liniju i raskrsnice. |
| 9768 | Očuvano | 55(6);56: Potreban razmak i bezbedan povratak, bez izmišljene fiksne formule ili naglog presecanja. |
| 9769 | Očuvano | 55(6);56: Potreban razmak i bezbedan povratak, bez izmišljene fiksne formule ili naglog presecanja. |
| 9770 | Ispravljeno | 53(1,4–5);55(3)(6): Žuta putanja vodi desno/izvan saobraćajne trake; nije prikazan zakonski slučaj bržih kolona. Tvrdnja da naselje „nema veze” previđa posebno pravilo čl. 53 st. 5; treba objasniti da se taj prolazak pravno ne zove preticanje. |
| 9772 | Ispravljeno | 53(1,4–5);55(3)(6): Žuta putanja vodi desno/izvan saobraćajne trake; nije prikazan zakonski slučaj bržih kolona. Isti problem: naselje jeste relevantno za pravnu kvalifikaciju prolaska zdesna, iako ponuđeni odgovor ostaje netačan. |
| 9774 | Ispravljeno | 53(1,4–5);55(3)(6): Žuta putanja vodi desno/izvan saobraćajne trake; nije prikazan zakonski slučaj bržih kolona. Apsolut „na svakom putu jednako” zanemaruje čl. 53 st. 4–5; konkretna slika ipak jasno zabranjuje prikazanu putanju. |
| 9776 | Očuvano | 53(1): Preticanje sleva; na slikama nema propisanog razloga za preticanje zdesna. |
| 9781 | Očuvano | 36(2);55(1–2): Tri trake i klizav put: pažnja i opšti uslovi; sneg sam nije zabrana. |
| 9783 | Očuvano | 55(3)(7): Jedna traka našeg smera, nepregledna krivina ili početak prevoja; slike potvrđuju relevantnu geometriju. |
| 9785 | Očuvano | 55(3)(7): Jedna traka našeg smera, nepregledna krivina ili početak prevoja; slike potvrđuju relevantnu geometriju. |
| 9787 | Očuvano | 55(3)(7): Dve trake našeg smera i odvojen suprotni smer; izuzetak nije ograničen na putnička vozila. |
| 9789 | Ispravljeno | 55(3)(7): Dve trake našeg smera i odvojen suprotni smer; izuzetak nije ograničen na putnička vozila. Završna tvrdnja da podela na putnička i ostala vozila ne postoji ni u jednom propisu nepotrebno je apsolutna; dovoljno je objasniti da izuzetak iz ovog pitanja nije tako ograničen. |
| 9793 | Ispravljeno | 55(3)(9–10): Prilazak/prelazak zebre i vozilo koje propušta pešaka;9793 pešak je vidljiv pa zaklanjanje je rizik, ne već dokazana nevidljivost. Pešak je na originalnoj slici vidljiv; bezbednosni razlog je da ga vozilo može zakloniti, ne da ga vozač uopšte ne vidi. |
| 9794 | Očuvano | 55(3)(8,11–12);57(2): Pruga/pratnja naspram podvožnjaka i puta s prvenstvom; tunelski izuzetak ne sme nestati u poređenju. |
| 9795 | Ispravljeno | 55(3)(8,11–12);57(2): Pruga/pratnja naspram podvožnjaka i puta s prvenstvom; tunelski izuzetak ne sme nestati u poređenju. Apsolutna završna rečenica o tunelu izostavlja zakonski izuzetak kada postoje najmanje dve trake za isti smer. |
| 9796 | Očuvano | 55(3)(11): Prikazana radnja zahvata sam železnički prelaz; ne dodaje se samostalna zabrana neposredno pre. |
| 9797 | Ispravljeno | 55(3)(11): Prikazana radnja zahvata sam železnički prelaz; ne dodaje se samostalna zabrana neposredno pre. Zakon zabranjuje radnju na prelazu, ali ne propisuje zasebnu zabranu „neposredno pre”; slika je i dalje tačno rešena jer bi radnja zahvatila šine. |
| 9799 | Ispravljeno | 55(3)(11): Prikazana radnja zahvata sam železnički prelaz; ne dodaje se samostalna zabrana neposredno pre. Isto netačno proširenje zabrane na svako mesto neposredno pre prelaza. |
| 9801 | Očuvano | 55(3)(12);106: Pitanje izričito navodi kolonu pod pratnjom, slika pokazuje crveno/plavo; svetlosno upozorenje ne dopušta preticanje. |
| 9804 | Očuvano | 53(1);55(3)(13): Vozilo levo, posmatrač u desnoj traci za spora vozila koja se završava; nema desnog preticanja. |
| 9807 | Očuvano | 55(3)(15): Puna linija s naše strane pri upotrebi suprotnog smera; isprekidana strana drugog smera ne dopušta prelazak. |
| 9809 | Očuvano | 55(3)(15): Puna linija s naše strane pri upotrebi suprotnog smera; isprekidana strana drugog smera ne dopušta prelazak. |
| 9811 | Ispravljeno | Pravilnik25(28),32;55(3)(14): II-28 i stvarni automobil/kamion ispred; uska definicija izuzetog preticanog motocikla i mopeda. Opis znaka II-28 pogrešno navodi samo jedan izuzetak i izostavlja moped. |
| 9813 | Ispravljeno | Pravilnik25(28),32;55(3)(14): II-28 i stvarni automobil/kamion ispred; uska definicija izuzetog preticanog motocikla i mopeda. Isti nepotpun opis izuzetaka znaka II-28. |
| 9815 | Ispravljeno | 55(3)(15),(7): Crni automobil je između posmatrača i traktora; izuzetak za sam traktor ne obuhvata automobil. Stari tekst prećutkuje važeći izuzetak za traktor. On ipak ne menja ključ jer bi vozač iz tačke posmatranja preko pune linije preticao i crni putnički automobil, koji nije izuzet. |
| 9819 | Očuvano | 55(3)(15): Puna linija s naše strane pri upotrebi suprotnog smera; isprekidana strana drugog smera ne dopušta prelazak. |
| 9820 | Ispravljeno | 53(1);55(1): Dve naše trake; levo preko dvostruke linije postoji suprotan smer, ali plavi ga ne koristi. Originalna slika prikazuje suprotni smer levo od dvostruke središnje linije, a ne ivicu kolovoza sa ogradom; plavo vozilo ipak ostaje u traci istog smera. |
| 9821 | Ispravljeno | 53(1,4–5): Pojedinačno vozilo, van naselja: desno preticanje nije slučaj53(5), a paralelne kolone nisu prikazane. „Olakšica važi samo u naselju” preširoko zanemaruje odvojeno pravilo o bržem kretanju kolona koje važi i van naselja. |
| 9823 | Očuvano | 53(1): Preticanje sleva; na slikama nema propisanog razloga za preticanje zdesna. |
| 9826 | Očuvano | 55(1–2): Dozvoljavajuće oznake i pregledan deo puta; opšti uslovi ostaju.9826 ima kombinovanu liniju, bliža je isprekidana. |
| 9829 | Očuvano | 55(1–2): Dozvoljavajuće oznake i pregledan deo puta; opšti uslovi ostaju.9826 ima kombinovanu liniju, bliža je isprekidana. |
| 9832 | Očuvano | 55(1–2): Sam sneg ne uvodi zabranu; opcija granice60 nema osnov. |
| 9834 | Očuvano | 55(4): Zaustavljena kolona: nemoguć bezbedan povratak u svoju traku; slika9854 pokazuje uzan procep između kolona. |
| 9836 | Očuvano | 7(77);55(3)(1–2): Kolona nije isto što i skup vozila; niz na slikama ne ostavlja bezbedan povratak između vozila. |
| 9839 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 9840 | Očuvano | 55(6);56: Potreban razmak i bezbedan povratak, bez izmišljene fiksne formule ili naglog presecanja. |
| 9841 | Očuvano | 55(6);56: Potreban razmak i bezbedan povratak, bez izmišljene fiksne formule ili naglog presecanja. |
| 9842 | Očuvano | 57(1–2): Razlikovanje ispred/na kružnoj raskrsnici i puta sa/bez prvenstva, kao opštih pravila. |
| 9843 | Očuvano | 57(1–2): Razlikovanje ispred/na kružnoj raskrsnici i puta sa/bez prvenstva, kao opštih pravila. |
| 9844 | Očuvano | 57(1–2): Razlikovanje ispred/na kružnoj raskrsnici i puta sa/bez prvenstva, kao opštih pravila. |
| 9845 | Očuvano | 57(1–2): Razlikovanje ispred/na kružnoj raskrsnici i puta sa/bez prvenstva, kao opštih pravila. |
| 9846 | Očuvano | 57(2)(1);53(2): Na putu s prvenstvom vozilo skreće ulevo; preticanje zdesna. |
| 9847 | Očuvano | 57(2)(1);53(2): Na putu s prvenstvom vozilo skreće ulevo; preticanje zdesna. |
| 9848 | Očuvano | 57(2)(2): Desno skretanje na putu s prvenstvom, prolazak ostaje na delu za isti smer. |
| 9849 | Očuvano | 57(2)(3);53(1): Oba idu pravo na putu s prvenstvom; preticanje sleva. |
| 9850 | Očuvano | 57(2)(4);53(1): Zeleno svetlo i oba vozila pravo; preticanje sleva. |
| 9851 | Očuvano | 53(1–3);55(1–2): Provlačenje uz liniju/između vozila nije prikazana bezbedna radnja;9852 se ne tvrdi mirovanje iz fotografije. |
| 9852 | Ispravljeno | 53(1–3);55(1–2): Provlačenje uz liniju/između vozila nije prikazana bezbedna radnja;9852 se ne tvrdi mirovanje iz fotografije. Pitanje govori o preticanju, a originalna slika ne dokazuje da vozila stoje; taj nepotreban detalj se uklanja. |
| 9853 | Očuvano | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Motociklista prikazan sleva pored automobila, sa svoje strane razdelne linije. Ostajanje u istom smeru samo po sebi ne ukida zabranu preticanja znakom. Uslovni ključ31359 i celo postojeće objašnjenje saglasni su32/53/55; oba druga odgovora pročitana. |
| 9854 | Ispravljeno | 55(4): Zaustavljena kolona: nemoguć bezbedan povratak u svoju traku; slika9854 pokazuje uzan procep između kolona. Objašnjenje daje apsolutnu zabranu obilaženja zaustavljene kolone, iako čl. 55 st. 4 zabranu vezuje za nemogućnost bezbednog uključivanja nazad. |
| 9855 | Ispravljeno | 54(1–2): Bez ubrzavanja; usporavanje nije obavezno. Pomeranje udesno ima poseban uslov. Pomeranje udesno je ponovo predstavljeno kao bezuslovna dužnost, iako zavisi od datog znaka za preticanje. |
| 9858 | Očuvano | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Stvarno podignuto ostrvo iza iscrtanog polja na sredini dvosmernog kolovoza. Obilaženje zdesna prema58 st.1; 31373 tačan, obe druge strane netačne. Postojeće objašnjenje precizno. |
| 9860 | Očuvano | 55(3)(9–10): Prilazak/prelazak zebre i vozilo koje propušta pešaka;9793 pešak je vidljiv pa zaklanjanje je rizik, ne već dokazana nevidljivost. |
| 9863 | Očuvano | 55(1–2): Dovoljno prostora, preglednost i bez ometanja suprotnog smera; tuđa procena ili prethodno započinjanje ne ukida uslove. |
| 10475 | Očuvano | 53(3): Tramvaj na sredini: samo zdesna kada tamo postoji traka. |
| 10476 | Očuvano | 53(5): Naselje i najmanje dve trake; kolona nije uslov. Na9730 znak naselja jeste vidljiv. |
| 10479 | Ispravljeno | 7(77);55(1–3): Uslov bez ometanja ući između svih vozila isključuje zakonsku kolonu; nema fiksnog maksimuma2/3. Bez definicije kolone objašnjenje zvuči kao da se uvek sme preteći proizvoljan broj vozila; pitanje izričito daje uslov koji tu grupu odvaja od zabranjene kolone. |
| 10480 | Očuvano | 50;55(3)(7–8): Precizan izuzetak dve trake za isti smer; most/podvožnjak/uspon nisu isti spisak kao polukružno okretanje. |
| 10481 | Očuvano | 50;55(3)(7–8): Precizan izuzetak dve trake za isti smer; most/podvožnjak/uspon nisu isti spisak kao polukružno okretanje. |
| 10483 | Ispravljeno | 55(3)(9–10): Prilazak/prelazak zebre i vozilo koje propušta pešaka;9793 pešak je vidljiv pa zaklanjanje je rizik, ne već dokazana nevidljivost. Objašnjenje nepotpuno prenosi tačan odgovor: zabrana obuhvata i vozilo koje prelazi pešački prelaz. |
| 10484 | Ispravljeno | 55(3)(13,15),(5),(7): Opcija doslovno prenosi opšte pravilo bez tvrdnje da izuzetaka nema; nema needs-expert.76/2023 čl8 dodao je samo LEV u postojeći55(7). Ključ doslovno prati opšte zabrane iz čl. 55 st. 3 tač. 13 i 15, ali objašnjenje ih prepričava bez propisanih izuzetaka za obilaženje i za vozila iz završnog stava. |
| 10485 | Očuvano | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Opšti uslov obilaženja preko neisprekidane linije uz suprotan smer odgovara55 st.5 u vezi sa st.1. Ne ograničava se na policajca ili motocikle/mopede u naselju. Ključ33308 i postojeće sažeto objašnjenje očuvani. |
| 10486 | Očuvano | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Član58 st.1: površina/objekat/uređaj na sredini dvosmernog kolovoza obilazi se zdesna.33312 tačan, druge dve opcije pogrešne. Oba pisma i postojeće objašnjenje očuvani. |
| 10487 | Očuvano | ZOBS 32 st.3–4,53–55,58; full provisions read against current PIS19/2025: Član58 st.2: jednosmerni put dopušta obe strane ako znakom nije drugačije određeno.33314 uključuje izričiti uslov; oba isključiva odgovora pogrešna. Objašnjenje oba pisma precizno. |
| 10637 | Očuvano | 55(3)(7): Jedna traka našeg smera, nepregledna krivina ili početak prevoja; slike potvrđuju relevantnu geometriju. |
