# A6-038 — uređaji i oprema vozila

Datum: 2026-09-11. Verzija: v184. Cela kartica i 54 povezana pitanja, svih 170 opcija i tri izvorne slike pregledani su na oba pisma.

## Šta je ispravljeno

Promenjeno je 36 objašnjenja, 18 dobrih je sačuvano. Otklonjeni su pogrešni razlozi o kočenju samo jednim točkom, osloncu motocikla, jačini svetla i meri dužine koju navodno daje oznaka vozila. Precizirani su širina prikolice, izuzeci kod svetala, podvrste katadioptera i granica istrošenosti pneumatika. R/N/T, oznake vrsta i SI mm ostaju izvorni i u ćirilici.

Kartica zadržava sva četiri SVG-a i svoju strukturu. Zajednička skala svetala sada jasno prikazuje četiri izabrana raspona, a tabela i poseban 10–30 m. Tm ima zasebno objašnjen odnos čl. 47 i 49. Povećan je sitan tekst crteža i razmak između redova; minimalni stvarni font u root matrici je 13.45 px. Tri oznake vozila zadržavaju boje i geometriju, uz jasna imena oba pisma. Dva neprecizna naslova su skraćena.

Tri neslaganja sačuvanog pitanja/ključa ostaju otvorena:

- **8752:** stari prag 1,3 m, a važeći čl. 64 za L2/L5/L6/L7 koristi 1 m.
- **8784:** odgovor izostavlja uslov motora do 50 cm³ iz izuzetka za laki četvorocikl.
- **8830:** sačuvano „veća od” nije ista granica kao zakonsko „ne sme biti manja”. Stroži odgovor nije proglašen nebezbednim.

Za 8682, 8724 i 8753 početna sumnja je otklonjena konkretnim odredbama: 1 m širine iz ZOBS 92, opšte pravilo 40–80 m i dopuštena konfiguracija dva katadioptera na L4. Ključevi svih 54 pitanja, svi ponuđeni odgovori, bodovi, redosled, slike i veze ostaju nepromenjeni. Ne tvrdi se da aktuelni ispitni portal koristi istu sačuvanu banku.

## Izvori i provera

- [MGSI Pravilnik kroz 54/2026](https://www.mgsi.gov.rs/sites/default/files/pravilnik_o_podeli_motornih_i_prikljucnih_vozila_i_tehnickim_uslovima_za_vozila_u_saobracaju_na_putevima.pdf): Celi relevantni čl. 2, 6, 17, 19, 29–31, 36–39, 42–70, 76–79, 86, 92 i 108: dimenzije, kočenje, svetla, oznake, pneumatici i oprema.
- [PIS ZOBS kroz 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Čl. 7, 92 i 246: vrste vozila, širina priključnog vozila i okvir uslova za vozila.

Prvi pregled 031 /root/a0_sanitize, nezavisni puni pregled 035 i objedinjeni kandidat 038 /root/a1_safe_harness, završni nezavisni pregled 039 /root/learning_visual_second_review. Root je pročitao sva konačna izmenjena objašnjenja i celu karticu oba pisma, proverio odlučujuće pune primarne odredbe i neposredno pogledao sve tri originalne slike i svih osam završnih mobilnih SVG snimaka.

Root Chromium: **16/16 kartica** (320/1280, oba pisma/teme, 100/200% osnovnog fonta) i **216/216 pitanja** (54 × oba pisma × obe širine). Provereni su tačni tekstovi, tabele, četiri SVG/ARIA, tri slikovna odgovora, veze i učitane slike. Nema horizontalnog prelivanja stranice, grešaka niti upisa u sintetički napredak. Tabele ostaju lokalno pomerljive: najveća izmerena razlika scrollWidth/clientWidth je 247 px. Kandidatska provera 038 zasebno je proverila uvećanje/Escape i preklapanja teksta u osam prikaza.

46 tačnih generatorskih operacija, četiri NUL bajta i svi ostali EX podaci očuvani. Ćirilične korekcije koriste kratke lokalne kontekste sa proverenim brojem zamena; cela kartica nije duplirana u generatoru. Tehnička provera: `node tools/verify.mjs`, 249/249. Ovo nije proba pravog telefona ili čitača ekrana.

Zatvara se kartica i 51 pitanje. Tri pitanja ostaju needs-expert. Ukupno: 462 reviewed, 5 in-progress, 65 needs-expert, 795 unreviewed; kartice 12 reviewed, 1 in-progress, 26 unreviewed.

Dokazi: ignored output/revizija-20260911/031, 035, 038 i 039; root-integration-proof.json, root-approved.json, root-browser-result.json, root-svg-*.png.

## Pojedinačna mapa

| ID | Stanje | Osnov i nalaz |
|---:|---|---|
| 8678 | Očuvano | ZOBS:246; PRAVILNIK:scope: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8681 | Ispravljeno | PRAVILNIK:17: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje sva vozila vrste L naziva „dvotočkašima”, iako pitanje izričito obuhvata i tricikle i četvorocikle. |
| 8682 | Ispravljeno | ZOBS:92: ZOBS92 neposredno potvrđuje1m; stari razlog o širini vučnog vozila ukloniti. Pravilo je izričito u ZOBS92; odbaciti source-gap i uklanjanje reda kartice. |
| 8688 | Očuvano | PRAVILNIK:19: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8695 | Ispravljeno | PRAVILNIK:29,31: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Pravilnik 31: izuzeci od pomoćnog/parkirnog kočenja; oslonac nije naveden kao razlog. |
| 8707 | Ispravljeno | PRAVILNIK:36: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Zadržano objašnjenje treba ispraviti zbog odvojenih komandi37; L4 ima poseban režim39. Odvojena komanda jednog točka nije sama po sebi neispravnost. |
| 8709 | Ispravljeno | PRAVILNIK:36: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Zadržano objašnjenje treba ispraviti zbog odvojenih komandi37; L4 ima poseban režim39. Odvojena komanda jednog točka nije sama po sebi neispravnost. |
| 8710 | Ispravljeno | ZOBS:246: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Primeri sa folijama i „bez homologacije” nisu deo pitanja ni citirane odredbe i mogu obuhvatiti zakonite slučajeve; dovoljan je tačan zakonski uslov o nepropisanoj boji. |
| 8711 | Ispravljeno | PRAVILNIK:43: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Završetak „bela i žuta napred dozvoljene” preširoko govori o svim uređajima; dopuštena boja zavisi od konkretnog uređaja. |
| 8712 | Ispravljeno | PRAVILNIK:43: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Apsolut „nikad” i samo dva izuzetka izostavljaju pokretni reflektor, belu reflektujuću registarsku tablicu i konturne oznake iz čl. 43. |
| 8713 | Očuvano | PRAVILNIK:43–44: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8719 | Ispravljeno | PRAVILNIK:47: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje izostavlja izričit izuzetak za vozila proizvedena ili prvi put registrovana pre 1. oktobra 1994, čiji glavni farovi mogu biti žuti. |
| 8720 | Ispravljeno | PRAVILNIK:47,79: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Dodatak „standard u svim vozilima” je preširok: čl. 79 izuzima motocikl i laki četvorocikl sa motorom do 50 cm³ od obavezne plave lampe. |
| 8721 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8724 | Ispravljeno | PRAVILNIK:49: 40–80m opšti raspon; posebne izuzetke kratko objasniti, ne needs-expert. Opšti odgovor nije ekspert-slučaj. Posebna novija odredba47 za Tm ne sme biti prećutana. |
| 8726 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8728 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8729 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8730 | Ispravljeno | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Pravilnik 49(4): domet 10–50 m, ne tvrdnja o manjem svetlosnom intenzitetu. |
| 8732 | Ispravljeno | PRAVILNIK:43,50: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Svetlo za vožnju unazad nije jedini dopušteni beli izvor pozadi; čl. 43 navodi više izuzetaka. |
| 8735 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8737 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8745 | Očuvano | PRAVILNIK:42–62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Za dvotočkaše je odgovor tačan; tekst kartice mora razdvojiti L4 (dva ili tri poziciona svetla, čl.58). Objašnjenje očuvano. |
| 8752 | Stručna provera ključa | PRAVILNIK:64: Stari1,3m naspram važećeg1m; L5 širine1,1m zahteva2. Pravi nesklad praga, npr. L5 širine1,1m obuhvaćen pitanjem zahteva dva. |
| 8753 | Ispravljeno | PRAVILNIK:64; ZOBS:7(1)(36); PRAVILNIK:6: L4 je poznata vrsta; dva su dozvoljena, zakon dopušta i tri. Vrsta nije nepoznata L2/L5; definisana je ZOBS7/36 i Pravilnikom6. Ne označavati izabrana dva kao pogrešna. |
| 8754 | Očuvano | PRAVILNIK:64: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8760 | Ispravljeno | PRAVILNIK:66: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Prikazana oznaka potvrđuje teško vozilo, ne određuje konkretnu dužinu zaustavljanja; ukloniti neodmerenu tvrdnju o mnogo dužem putu. Sa slike/oznake ne izvodi se konkretan mnogo duži put zaustavljanja. Sačuvano razlikovanje sve tri oznake. |
| 8761 | Ispravljeno | PRAVILNIK:66: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Pravilnik 66 + original img/8761.jpg: oznaka dugog vozila bez konkretnog iznosa dužine/prostora. |
| 8762 | Očuvano | PRAVILNIK:66: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8770 | Očuvano | PRAVILNIK:69: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8772 | Ispravljeno | PRAVILNIK:70: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. „Uvek i svuda” izostavlja izričit izuzetak za vozila od istorijskog značaja, gde pokazivač može biti crven. |
| 8773 | Očuvano | PRAVILNIK:70: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8781 | Ispravljeno | PRAVILNIK:76–77: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Tvrdnja da „vazdušna truba” nije dopuštena ne sledi iz pitanja ni čl. 76–77; pravilo određuje osobine zvuka i granice jačine. |
| 8783 | Očuvano | PRAVILNIK:79: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8784 | Stručna provera ključa | PRAVILNIK:79: Izuzetak kontrolne lampe do50cm³ nije svaki L6; ostaje otvoreno poreklo/tačan obuhvat ključa. Važeći čl. 79 izuzima samo laki četvorocikl sa motorom radne zapremine do 50 cm³; pitanje i označeni odgovor izuzetak proširuju na sve lake četvorocikle. |
| 8791 | Očuvano | PRAVILNIK:92: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8809 | Očuvano | PRAVILNIK:108: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8814 | Očuvano | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje očuvano. |
| 8815 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8816 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8817 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8818 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8819 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8820 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8821 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8822 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8823 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8824 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Potrebna uska korekcija C kodova R/N/T; za sedam istih objašnjenja i dimenzija195/65+16. Stvarne oznake R/N/T ostaju latinicom. Kod sedam zajedničkih objašnjenja ne izostaviti65 iz dimenzija. |
| 8827 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje koristi strože „dublje od”, dok važeći čl. 86 kaže da dubina ne sme biti manja od TWI granice. |
| 8828 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Objašnjenje koristi strože „dublje od”, dok važeći čl. 86 kaže da dubina ne sme biti manja od TWI granice. |
| 8829 | Ispravljeno | PRAVILNIK:86: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Zajedničko objašnjenje pogrešno traži dubinu veću od TWI; pravilo je „ne sme biti manja”, dok odgovor 1,6 mm bez TWI ostaje tačan. |
| 8830 | Stručna provera ključa | PRAVILNIK:86: Ključ stroži >, propis ≥. Stroži odgovor nije nebezbedan; pravna granica je ipak različita. Označeni odgovor kaže „veća od” TWI, a važeći čl. 86 kaže „ne sme biti manja od”; jednakost na fabrički dozvoljenoj granici nije isključena. |
| 10653 | Ispravljeno | PRAVILNIK:43,62: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Osvetljenje tablice nije „drugi” od samo dva bela izvora pozadi; čl. 43 navodi više izuzetaka, a čl. 62 određuje njegovu boju i izuzetke ugradnje. |
| 10657 | Ispravljeno | PRAVILNIK:69: Označeni odgovor saglasan pročitanom opštem pravilu; sva ponuđena L/C polja pregledana. Zaključak da pri 25 km/h kočenje nije naglo nema osnov u čl. 69 i nije potreban za odgovor. |
