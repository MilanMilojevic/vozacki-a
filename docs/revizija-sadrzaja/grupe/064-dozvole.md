# A6-064 — dozvole, kazneni poeni i obuka

Datum: 2026-09-14. Verzija: v199. Dva potpuna pregleda **22 pitanja / 73 opcije**, cele kartice L/C, pet tabela, šest ručnih odeljaka i tri postojeća SVG. Nema JPEG, atlasa ili situacija;22 implicitne veze preko172/173. Zvanični podaci, ključevi, redosled i veze ostaju isti.

## Ispravke i ekspertska ograda

Osam EX korekcija precizira obim zabrane upravljanja, korišćenje dve dozvole i prijavljenog nestalog obrasca, zastoj roka za brisanje poena, alternativni dokument sa fotografijom za mladog kandidata i izvedena prava A→A1/A2/AM. Laki i teški četvorocikl jasno su razdvojeni. Sedamnaest kartičnih fragmenata čuva iste uslove, niža ograničenja i posebni izuzetak iz182(11); rok24meseca nije prikazan kao bezuslovno neprekidan.

**8476 ostaje needs-expert:** ključ27083 navodi jednu smrtonosnu osudu, a netačno označena27084 navodi najmanje dve u pet godina, koje takođe obuhvataju zakonski uslov. Pitanje ne traži najmanji prag. EX i kartica vidljivo navode preklapanje; req1 i ključ ostaju.8477/8478 nisu isti problem: dve osude u pet godina ne garantuju dve u tri godine.

Ćirilična verzija čuva B1/F u kartici i8496. Nezavisni068 otkrio je da predloženi generator bez dodatnog unosa ne reprodukuje već ispravno napisani kandidat8496; dopunjena je postojeća strogo čuvana lokalna lista sa dva unosa, bez izmene opšteg prevodioca. Tri SVG imaju prevedene ARIA opise i čitljive natpise/boje u obe teme. Nema novih dijagrama ili funkcionalnosti.

## Dokazi i granice

- [Primarni ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), čl.178–179,182–184,186–187,195–198,201–202,206,212,216–217,228. HTTP20014.9.2026 09:48UTC i SHA8796f6a1718bea08ea4fe1dedb3c9a71001b1c6c5245a93526f365a61e668d5d; korišćen je već sačuvani ceo izvor, bez ponovljenih velikih kopija.
- Prvi064 i nezavisni068 pročitali su sva22 pitanja/73 opcije, sve stare i nove EXL/C, cele stare/kandidat kartice i primarne odredbe. Root je dodatno pročitao svih8 konačnih EXL/C, ceo tekst karticeL/C, celu8476 sa opcijama, relevantne pune178/182/183/195–198 i228(2), i pojedinačno otvorio sva3 SVG na latinici/svetlo i ćirilici/tamno.
- Stvarni generator nema PO_TEMAMA prag za dozvole: capCells→stripComments→toCyr i postojeća lokalna ARIA lista. Cela stara semantika upoređena je sa runtime-om, a kandidat sa tačno jednom karticom/osam EX. Ukupno11 source operacija,17 kartičnih fragmenata,3ARIA i lokalni8496; obrtanje vraća identične početne bajtove sa4NUL. Sve ostale kartice/EX/atlas/situacije/zamke nepromenjeni.
- Root integrisana v199:16/16 kartičnih konteksta (320/1280,L/C,obe teme,100/200% rootfonta),88/88 prikaza pitanja,5tabela/6odeljaka/3SVG; bez grešaka/prelivanja/sintetičkih upisa. Minimum SVG fonta13.450px. Nezavisni068:88 stvarnih touch tokova na200%,292 prikaza opcija i osam celih kartica. Svako pitanje potvrđuje15→30px; ti stvarni odgovori upisuju samo sintetički rezultat u disposable kontekstu. Ne predstavljaju se kao provera bez upisa. SVG zadržava geometriju i ima postojeće uvećavanje; nije lažno označen kao tekst koji se udvostručuje zajedno sa stranicom.
- Peer je pojedinačno otvorio12 kandidatskih SVG snimaka (3×L/C×teme), izmerio min13,4509px i kontrast5,0156:1. Fontni bbox može dodirivati susedni bez dodira stvarnog otiska slova; zabeleženo u dokazima. Prvi nevažeći test fs=2 i greške selektora/skale jasno su dokumentovani u064/068; konačni200% test koristi stvarno izmeren font. To su greške harnessa, ne dodatne aplikacijske ispravke.
- Read-only pre integracije:06469 frozen fajlova i06867 frozen fajlova potvrđeno. Dokazi:064/root-approved.json,root-source-operations.json,root-integration-proof.json,root-browser-result.json,root-verify-v199.log;068/full-generator-proof.json i peer.md. Ovo nije potvrda instruktora, fizičkog uređaja ili WCAG sertifikat.

| ID | Konkretan nezavisni nalaz | Primarni član |
|---:|---|---|
|8464|Prihvaćeno: zabrana u svom obimu i trajanju; ne generalizovati preko svih kategorija.|178(4),201(1)|
|8466|Prihvaćeno: nije zabranjeno samo posedovanje, a izbor srpske dozvole u Srbiji u navedenom uslovu nije slobodan.|183(2)|
|8467|Prihvaćeno: zabrana korišćenja prijavljenog obrasca bez tvrdnje o automatskoj novoj dozvoli.|183(3)|
|8468|Bez korekcije:30dana i razlog upisa odgovaraju zakonu.|183(5)|
|8469|Bez korekcije: dozvola kod sebe; međunarodna izdata u Srbiji nije zamena u Srbiji.|184(1),186|
|8471|Bez korekcije: razlikuje domaću međunarodnu od domaće vozačke.|186|
|8472|Bez korekcije: obaveza davanja dozvole na uvid.|184(1)|
|8473|Bez korekcije: upisana pomagala koriste se tokom upravljanja.|184(2)|
|8474|Bez korekcije:18za redovnu,9za probnu.|197(3)(1),197(4)|
|8475|Bez korekcije: razlikuje sudsku prekršajnu odluku od evidencije/MUP oduzimanja.|197(2),198(1-2)|
|8476|Prihvaćena vidljiva ograda. Needs-expert ostaje; dovoljan uslov27084 takođe obuhvata27083. Ključ se ne menja.|197(3)(2-3)|
|8477|Bez korekcije: teške povrede više od jednom u5godina; nije isto kao nespecificirane povrede u5.|197(3)(3-4)|
|8478|Bez korekcije: razlikovati garantovani uslov od moguće slučajne blizine osuda.|197(3)(4)|
|8479|Prihvaćeno: rok se meri od pravnosnažnosti i zastaje za taksativne slučajeve zatvora/zabrane.|198(3,5)|
|8480|Bez korekcije: osposobljavanje uključuje obuku i ispit; mera sprečava početak i nastavak.|206,212(2)|
|8481|Prihvaćeno: drugi fotografski dokument ako kandidat zbog starosti ne ispunjava uslov za ličnu kartu; tri sačuvana odgovora ne menjaju se.|228(2)|
|8496|Prihvaćeno: A→A1/A2/AM uključuje laki četvorocikl, ali ne teški/F. Dopuna generatora068 reprodukuje B1/F uC bez promene kandidata.|195(1,7-9),196|
|8501|Bez korekcije: svi teški tricikli pokriveni su A direktno ili prekoA1; B-starosni uslov21iz195(5) ne preslikava se na posednikaA.|195(1)(2,4),195(9)|
|10691|Bez nove EX korekcije: traženi opšti maksimum110; puna kartica čuva niža ograničenja i službeni izuzetak.|182(5)(1),182(11)|
|10692|Bez nove EX korekcije:90motoput,110autoput,ostalo90%; službeni izuzetak u kartici.|182(5)(1),182(11)|
|10693|Bez nove EX korekcije: opšte90% pravilo nije ograničeno uzrastom18ili noćnim periodom; kandidat kartice uklanja apsolutno Bez ograda i navodi službeni izuzetak.|182(5)(1,3),182(11)|
|10718|Prihvaćeno: pravo može biti izvedeno iz druge kategorije; stručna obuka/ispit178(6) nije samostalna redovna vožnja sa samim uverenjem.|178(1,6),195(8-9)|
