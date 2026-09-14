# A6-071 — nezgoda

Datum:2026-09-14. Verzija:v202. Dva nezavisna potpuna pregleda **20 pitanja/67 opcija**, starih i novih EX oba pisma i cele karticeL/C sa7 postojećih SVG,2 tabele i5 ručnih sekcija. Sva pitanja nasleđuju istu karticu; nema JPEG, atlasa ili situacija. Četrnaest EX korekcija,25 prvih kartičnih fragmenata i jedna dodatna dorada natpisa; podaci/ključevi/veze nepromenjeni.

## Šta je ispravljeno

- **8543 ostaje needs-expert.** Važeći174 različito uređuje nezgodu sa poginulima i nezgodu bez poginulih. Uzorak krvi/krvi i urina kod samo povređenih nije bezuslovno obavezan: postoje uslovi pozitivnog rezultata ili nemogućnosti ispitivanja. Stem spaja te grane, a označeni27312 kaže da je uzorak obavezan. Nijedna druga ponuđena opcija nije univerzalno tačna. EX i tabela jasno navode razliku i potrebu stručne provere; ključ je sačuvan.
-168: dva medicinska izuzetka od ostanka i povratak čim moguće; odlazak radi obaveštavanja policije nije dodatni izuzetak. Čuvanje tragova ne sme ugroziti bezbednost i ne poništava dužnosti pomoći/zaštite. Uklonjena prečica „ništa se ne pomera”.
-171/172: ostanak ostalih vezan je za zahtev neposredno nakon nezgode; saglasnost svih nije uslov. Evropski izveštaj kod manje štete popunjava se kada se ne vrši uviđaj.8551 čuva najbolji ponuđeni obrazac uz taj vidljivi uslov. Cedulja i poziv osiguranju ne zamenjuju propisano obaveštavanje; nisu predstavljeni kao zabranjeni.
-175/177: neispravnost ili znatno oštećenje jesu alternativni osnovi; trošak prinudnog uklanjanja snosi vlasnik, koji ne mora biti vozač. Šest dovoljno preciznih EX ostaje neizmenjeno.

Primarni izvor je [ZOBS/PIS kroz19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), sveži14Sep10:06UTC HTTP200,958955bajtova i provereni SHA iz registra. Dva autora pročitala puna2/167–177. Root je dodatno pročitao pune167–177, svih14 konačnih EXL/C, celu karticuL/C i oba pitanja8543/8551 sa svim opcijama. Ne tvrdi treći potpuni pregled svih67 opcija.

## Telefon, crteži i integracija

Postojeći SVG font12/12,5→14, čitljivi natpisi/kontrast i lokalniARIA7; geometrija puteva/vozila/ljudi/znakova sačuvana. Samo naslov dokaza o tehničkoj ispravnosti dobija lokalno prelamanje: C200 dokument324→320→324 pri vraćanju. Drugi pregled pomera postojeći „tragovi” x26→28; ćirilični bbox−0,152→1,848 jedinica, bez pomeranja drugih elemenata. To je mali rubni nalaz, ne izgubljena reč. Root direktno otvorio završni SVG3 oba pisma.

Nezavisni074:56 pojedinačno pregledanih pre/posleSVG snimaka +četiri završna SVG3;16 konteksta320/1280×L/C×teme×125/200. Stvarni rootfont15→30 na320 i16→32 na1280. MinSVG13,4498px, tekst12,283:1, bitna grafika3,966:1;0overflow/bboxgrešaka.80 stvarnih tokova sa268 opcija i80 vidljivih završetaka EX,28zoom/pan/fit i dostupne poslednje kolone tabela. Sintetički napredak samo u odbačenim kontekstima. Prvi071 zasebno160EX tokova,28zoom+28pan/fit. Ovo nije fizički telefon ili potpuna WCAG potvrda.

Root integrisani v202:16/16 kartičnih konteksta320/1280×L/C×teme×100/200 i80/80 pitanja. Tačni podaci/EX/veze,7SVG/2tabele/5sekcija;0grešaka/prelivanja/sintetičkih upisa. Puni stari generator==runtimev201, konačni==samo14EX/jedna kartica.16 spojenih reverzibilnih source operacija,4NUL, originalni atlas SUB objekat; sve druge kartice/EX/atlas/situacije/zamke jednake. NemaPOgrupisanja za ovu karticu, globalnaARIA lista očuvana uskim fragmentom. CSS/app/data nepromenjeni.

Pre integracije074 read-only potvrđeno211 sopstvenih i100 upstream071 frozen fajlova. Početni neuspeli bbox/kontrastni probe nisu predstavljeni kao završni uspeh. Tuđi066 mismatch zasebno je dokumentovan: root je posle freeze upisao integrisani v198 rezultat pod istim imenom; novi integracioni dokazi imaju zasebno ime. Nije promenjen frozen manifest.

Dokazi:071/root-approved.json,root-source-operations.json,root-integration-proof.json,root-integrated-browser-result.json,root-verify-v202.log;074/peer.md,individual-records.json,qa-final-result.json,flow-final-result.json,full-generator-proof.json i zoom-bounds-result.json. Originalni Chrome/napredak/preview18980/8137 netaknuti; root19171 i peer19173 koriste prazne odvojene kontekste.
