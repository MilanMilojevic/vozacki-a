# A6-050 — znakovi policijskog službenika

Datum: 2026-09-11. Verzija: v193. Obuhvat: **43 pitanja /142 opcije /26 originalnih JPEG**, cela L/C kartica i svih6 postojećih SVG. Atlas8 i situacije18 pripadaju ovim pitanjima.

## Primena

Dvanaest objašnjenja precizira položaj ruke/dlana, propisane izuzetke, značenje pištaljke i posebnih signala. Kartica dobija iste uske ispravke i čitljivije postojeće crteže: fontovi, lokalni kontrast i položaj natpisa; bez novih scena. Predlog9460 dodatno je sužen posle nezavisnog pregleda: drugi znak za mesto pomeranja/zaustavljanja vezan je u kartici baš za vertikalnu desnu ruku sa dlanom napred, Pravilnik2(1)(2).

Sačuvani ključ bira tri načina iz Pravilnika1(1), a usmeno odbija. Pravilnik1(2) izričito kaže da se znaci i naredbe mogu davati i usmeno; ZOBS166 posebno vezuje naredbe za usmeno davanje. Generička formulacija pitanja traži stručno razjašnjenje odnosa tih odredaba. Ključ/req ostaju nepromenjeni; EX i kartica ne uče usmeno kao pouzdano netačno.

Pitanje10550 ostaje in-progress dok cela druga zavisna kartica pesaci-bicikli ne bude pregledana i integrisana. Provera ove grupe nije proglašena dokazom da je druga kartica gotova.

Nema promene pitanja, svih opcija/ključeva/redosleda, poena, slika, veza, app.js, globalnog CSS-a ili simulacije. Izvor je izmenjen kroz14 tačnih operacija, od kojih kartična sadrži30 lokalnih fragmenata. Svih6ARIA prevodi postojeća ograničena petlja. Očuvana su4NUL bajta, originalni poTemama prag900, capCells i svi ostali EX delovi.

## Dokazi i granice

- [Posebni Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/21fba347-6f9f-430e-8bc5-40af04ecd3d8?lawActId=423487); [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311). Prvi050 i nezavisni054 pročitali su sva43 pitanja/142 opcije/EX oba pisma, pojedinačno26 originalnih JPEG i celu staru/novu karticu/6SVG. Oba pregleda koriste ceo posebni Pravilnik1–13 i službene crteže.
- Root zasebno pročitao ceo posebni Pravilnik, ZOBS166 i ranije107–110; proverio sve12 završnih L/C objašnjenja, celu finalnu L/C karticu, tri službene strane gestova i četiri odlučujuća originala9447/9448/9457/9460. Pregledao6 kandidatskih L i6 integrisanih C SVG.
- Stari L/C izlaz i zamrznuti kandidat nezavisno su rekonstruisani kroz stvarni pipeline. Konačni generator je poređen sa odobrenim root kandidatom; svi ostali byQ/cards/maps ostaju isti. Izvor je tačno rekonstruisan iz evidentiranih operacija.
- Integrisani Chromium:16/16 kartičnih konteksta320/1280,L/C,obe teme,100/200% osnovnog fonta;172/172 prikaza pitanja. Tačni tekstovi/EX/ključevi/veze,26 galerijskih odgovora/ARIA/redosleda,6SVG; bez grešaka, horizontalnog preliva ili sintetičkih storage upisa.
- Prvi vizuelni kandidat8/8 i nezavisni4/4: najmanji stvarni SVG tekst12,8625px na320pri125% fonta, minimum tekstualnog kontrasta5,374:1. STAJE prema stvarnoj kompozitnoj podlozi sada5,925dark/11,132light, relevantna strelica najmanje3,173:1. To nije opšta WCAG sertifikacija ili proba fizičkog telefona.
- Završna automatska provera: node tools/verify.mjs —249/249, rezultat u ignored050/root-verify-v193.log. Zamrznuti dokazi050/054 ostaju neizmenjeni; konačne odluke su u root-approved.json, root-source-operations.json, root-integration-proof.json i root-browser-result.json.

| ID | Nalaz i osnov |
|---:|---|
|9447|police:2 st. 1 tač. 2 i st. 2. Vertikalna desna ruka, dlan napred: staju vozači prema kojima su dlan i prsa. Razdvojiti oba stvarna znaka; ključ30124 ostaje.|
|9448|police:2 st. 1 tač. 3. Predručena desna ruka, dlan levo: zabrana za smer koji seče smer ruke. Pravilnik2(1)3 i službena slika3.|
|9450|police:2 st. 1 tač. 2. Dlan i prsa okrenuti posmatraču: zaustavljanje. Ne širiti konkretan znak na sve učesnike.|
|9452|police:2 st. 1 tač. 3; ZOBS20; zobs:20. Ne sme se preseći smer predručene ruke; policijski znak ima prvenstvo nad STOP/zelenim. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9454|police:2 st. 1 tač. 4. Dlan nadole, mahanje gore-dole: smanjenje brzine. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9455|police:2 st. 1 tač. 4. Dlan nadole, mahanje gore-dole: smanjenje brzine. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9457|police:2 st. 1 tač. 1 i st. 2. Na raskrsnici vertikalna ruka sa dlanom levo zabranjuje prolaz uz propisani izuzetak; pitanje ne navodi nemogućnost zaustavljanja. Položaj na raskrsnici i stvarni izuzetak; bez tvrdnje da nema izuzetka.|
|9459|police:2 st. 1 tač. 5. Kružna podlaktica i šaka: ubrzanje. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9460|police:2 st. 1 tač. 6. Otvoren dlan prema određenom vozilu: zaustavljanje tog vozila. Prikazani otvoreni dlan nalaže zaustavljanje; izostavljena je preširoka dopuna o drugom, vertikalnom znaku, koji je precizno objašnjen u kartici.|
|9462|police:2 st. 1 tač. 6. Dlan prema određenom vozilu: zaustavljanje. Ne poricati moguće dodatne znake.|
|9464|police:2 st. 1 tač. 7. Mahanje savijanjem u laktu: primicanje raskrsnici/policajcu. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9466|police:2 st. 1 tač. 8. Leđa/prsa: zaustavljanje, bokovi: prolaz. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9467|police:2 st. 1 tač. 8. Leđa/prsa: zaustavljanje, bokovi: prolaz. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9469|police:2 st. 1 tač. 8. Dolazak prema prsima: zaustavljanje. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9470|police:2 st. 1 tač. 7. Horizontalno odručena ruka, dlan nagore, mahanje u laktu: priđi bliže. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9471|police:2 st. 1 tač. 8. Stojeći položaj sa spuštenim rukama: prema prsima/leđima staje se. Pravilnik2(1)1 i8.|
|9472|police:2 st. 1 tač. 5. Kružno kretanje podlaktice: ubrzanje. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9474|police:2 st. 1 tač. 3. Putanja koja ne seče predručenu ruku može pravo. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9475|police:2 st. 4. Smanjenje brzine može se narediti i iz vozila/motocikla uz vidno obeležje policije. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9476|police:2 st. 4. Ubrzanje može se narediti i iz vozila/motocikla uz vidno obeležje policije. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9477|police:2 st. 4. Zaustavljanje može se narediti i iz vozila/motocikla uz vidno obeležje policije. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9478|police:6 st. 1. Pištaljka samo van vozila i u kombinaciji sa rukama. Ukloniti izmišljeni razlog; ostaje precizno propisano pravilo.|
|9479|police:6 st. 2 tač. 1 i st. 3. Jedan dug zvižduk poziva na pažnju, a sam ne nalaže zaustavljanje. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9480|police:6 st. 2 tač. 2. Više kratkih znači postupanje protivno znaku/pravilima/signalizaciji. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9481|police:6 st. 4. Osmatranjem utvrditi da li se više kratkih zvižduka odnosi na vozača. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9490|police:9 st. 3. Zaustavljeno vozilo sa plavim: uspori, po potrebi stani, postupaj po naredbama. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9493|police:11 st. 1–2. Adresat crvene lampe: bezbedno zaustavljanje neposredno ispred službenika, po mogućnosti van kolovoza. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9495|police:11 st. 1. Ostali učesnici smanjuju brzinu/kreću se oprezno. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9497|police:9 st. 1 tač. 4. USPORITE: obaveza postupanja po poruci. Nije potvrđena sadržajna greška ovog objašnjenja.|
|9499|police:9 st. 1 tač. 4. PRATITE NAS: vožnja za policijskim vozilom dok se znak daje. Pravilnik9(1)4: adresat umesto univerzalne bezuslovnosti.|
|10420|police:1 st. 1–2; ZOBS166 st. 2; zobs:166 st. 2. Sačuvani ključ bira tri načina iz Pravilnika1(1), a usmeno odbija. Pravilnik1(2) izričito kaže da se znaci i naredbe mogu davati i usmeno; ZOBS166 posebno vezuje naredbe za usmeno davanje. Generička formulacija pitanja traži stručno razjašnjenje odnosa tih odredaba. Ključ/req ostaju nepromenjeni; EX i kartica ne uče usmeno kao pouzdano netačno.|
|10422|police:9 st. 1 tač. 1; ZOBS107; zobs:107. Crveno/plavo: propustiti pratnju, po potrebi stati/ukloniti vozilo, slediti naredbe, sačekati sva vozila. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10423|police:9 st. 1 tač. 2; ZOBS109 st. 2; zobs:109 st. 2. Dva plava na vozilu koje obezbeđuje prolaz: propustiti i vozila iza, po potrebi stati i poštovati naredbe. Čl.9(1)2 uključuje uslov obezbeđivanja prolaza.|
|10424|police:9 st. 1 tač. 3; ZOBS109; zobs:109. Jedno plavo: ustupiti prvenstvo, po potrebi stati/ukloniti vozilo. ZOBS109(2) nije vezan samo za broj svetala.|
|10425|police:9 st. 3. Zaustavljeno vozilo/jedno plavo: usporiti, po potrebi stati, naredbe. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10426|police:9 st. 3. Zaustavljeno vozilo/dva plava: isto kao jedno plavo. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10427|police:9 st. 1 tač. 1; ZOBS107; zobs:107. Potpun ponuđeni opis obaveza prema pratnji; bezuslovno stajanje nije pravilo. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10428|police:9 st. 1 tač. 4. Displej policijskog vozila obavezuje neposrednog pratioca. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10429|police:11 st. 1. Crvena lampa adresatu znači bezbedno zaustavljanje neposredno ispred službenika. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10431|police:10; ZOBS60/110; zobs:60/110. Policijsko vozilo iza sa posebnim znacima i dugim svetlima: odmah bezbedno stati desno, po mogućnosti van. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10432|police:9 st. 1 tač. 4; ZOBS110 st. 2; zobs:110 st. 2. STOP znači zaustavljanje iza vozila, uz postupanje po naredbi. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10433|police:9 st. 1 tač. 4. STANITE ISPRED je konkretna naredba mesta zaustavljanja. Nije potvrđena sadržajna greška ovog objašnjenja.|
|10550|police:2 st. 1 tač. 8; ZOBS20; zobs:20. Frontalni položaj zabranjuje prolaz: stati ispred linije, ne samo propustiti pešaka. Nije potvrđena sadržajna greška ovog objašnjenja.|
