# Kontrola postojećih crteža — v215

14. septembar 2026, razvojna grana `codex/stabilizacija`.

Svih 28 postojećih animiranih SVG sada počinje mirno. Jedno lokalno dugme uz crtež pokreće ili pauzira njegove elemente. Pauza čuva kadar; novi render počinje mirno. Navigacija, sklapanje odeljka/kartice i otvaranje postojećeg uvećanja zaustavljaju pozadinski pokret. Statični SVG i fotografije ne dobijaju novu kontrolu. Nisu dodati crteži ili animacije.

Sistemsko smanjeno kretanje ima prednost, uključujući promenu dok je stranica otvorena. Dugme je tada onemogućeno uz kratak lokalni razlog. Povratak na normalnu postavku ne pokreće crtež sam. Dugme menja naziv akcije „Pokreni prikaz” / „Pauziraj prikaz” i nema `aria-pressed`, prema razlikovanju action/toggle dugmeta u [W3C APG Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Zoom ostaje statična slika, sa prethodnim Escape/fokus ponašanjem.

## Obim koda

Sedam uskih operacija menja `app.js` i `style.css`: tri lokalizovana teksta, lokalna DOM kontrola sa WeakMap vezom, četiri mesta pauziranja i CSS. App je veći za 2.549 bajtova, CSS za 938. Jedan media listener ostaje za ceo dokument; postojeća oznaka obrađenog SVG sprečava dupliranje kontrola. Liste 20 animacionih klasa u JS/CSS održavaju se zajedno.

Nema novog trajnog stanja, migracije, zavisnosti, banke pitanja, bodovanja, EX sadržaja ili izvorne geometrije SVG. Sadržajni otisci i statusi zato ostaju isti. Dopunjena je postojeća `tools/tests/keyboard.browser.js` sa četiri smislene provere životnog ciklusa, bez slabljenja prethodnih deset provera.

## Nezavisne provere 098 i 103

- Inventar: 195 SVG po pismu; 28 animiranih u pet kartica. Tih pet sadrži 77 SVG, pa je kontrola razlikovana i od njihovih 49 statičnih crteža.
- Stari i kandidat prikaz: po 160 redova kroz 320/1280, oba pisma/teme, osnovni/dvostruki tekst i normal/reduced. Svaka od 896 instanci kontrole stvarno je pokrenuta i pauzirana. Nezavisno su ponovo izračunata 2.464 poređenja SVG dimenzija: najveća razlika 0,00049 px, bez novog prelivanja. Najmanji izmereni kontrast teksta dugmeta je 7,83:1, visina najmanje 44 px.
- Svih 20 klasa posmatrano je preko 6,1 s: namerno pokretanje pomera kadar, pauza ga zatim zadržava. Odvojeno su provereni ulaz uz odgovor, početni accordion, statistika i aktivna simulacija sa odvojenim pregledom.
- Konačni kandidat ima 40 dodatnih prikaza / 224 kontrole, 14/14 keyboard provera, dva prava viewport snimka i foto-zoom. Stvarna promena pisma stvara miran novi prikaz; zatvaranje fotografije ne nastavlja prethodni crtež.
- Root je pročitao sve operacije, finalni test, izveštaje i oba viewporta; read-only verifier 098 prolazi 14/14, a zasebna provera 103 potvrđuje zamrznute hashove i rekonstrukciju bez blokatora.

Velika matrica vezana je za raniji kandidat. Konačni app razlikuje se samo po uklonjenoj `aria-pressed` dodeli i kraćem opisu smanjenog kretanja; tačna reverzija potvrđuje vezu bajtova, a male završne provere imaju konačni response hash. Ulazni tokovi nemaju sopstveni response hash: veza sa fazom rada potkrepljena je kodom, nije predstavljena kao zasebno izmereni hash. RED zapis je v213; jedna rečenica u zamrznutom 098 reportu pogrešno navodi v212.

## Root provera integrisane v215

- Izvršen je upravo dopunjeni trajni keyboard test: **14/14**. Jedna poznata init greška localStorage na `about:blank`, pre učitavanja aplikacije, sačuvana je odvojeno; nije prikazana kao greška učitane aplikacije.
- **10 stvarnih prikaza svih pet kartica**, ukupno 56 animiranih instanci: L/svetla/320 i C/tamna/1280, sa stvarnim root fontom 30/32 px. Broj i veze kontrola, početna pauza, namerno pokretanje, zabrana automatskog nastavka, dostupnost kontrola i tačni S/SIM bajtovi prolaze. Nema horizontalnog prelivanja ni JavaScript grešaka u tom krugu. Root je neposredno otvorio dva integrisana viewport snimka.
- Prva root priprema pogrešno je ponovo udvostručavala font pri hash navigaciji, pa je druga kartica dobila 60 px. Dijagnostika to čuva; završni test izričito postavlja očekivanih 30/32 px. Aplikacija nije menjana zbog greške mernog postupka.
- `node tools/verify.mjs`: **249/249**, uz resurse/sintaksu/aktuelnu evidenciju. Ovo nije fizički telefon, glasovni čitač ekrana ili potvrda svih WCAG kriterijuma.

Lokalni dokazi: `output/revizija-20260911/098/`, `103/` i `098-root/`. Veliki DOM zapisi 098 lossless su sažeti sa oko 45 MB na 2,06 MB; provera potvrđuje i originalne raspakovane bajtove. Nema novih kopija runtime-a/slika. Korisnikov Chrome, originalni projekat i stare probe nisu otvarani ili menjani ovim testovima.
