# A6-024 — kaznena pitanja: sačuvana baza i važeći propis

Pregledano je svih 111 pitanja podoblasti 182: svi ponuđeni odgovori na oba pisma, 23 originalne JPEG slike i sva pojedinačna objašnjenja. Prvi pregled je radio `/root/a1_safe_harness`, nezavisni drugi `/root/learning_visual_second_review` (A6-028); root je pročitao sva konačna L/C objašnjenja, nezavisno proverio ključne pragove i izvore i integrisao 73 potrebne zamene. Ostalih 38 objašnjenja ostaje isto.

## Nalaz i granica potvrde

Sa važećim osnovnim zakonskim režimom postoje **57 neposrednih neslaganja, 50 saglasnih ključeva, tri različita činjenična osnova i jedan tačan ali nepotpun prikaz sankcije**. To nije tvrdnja da današnji zvanični portal daje 57 pogrešnih odgovora: njegovi tekući ključevi nisu preuzeti. Svih 1.327 mapa ID/ok u ovom projektu odgovara oba sačuvana sanitizovana izvora. Izvorni datum kopije sam ne dokazuje da su njene kazne usklađene sa današnjim zakonom.

**Pitanja, odgovori, ključevi, bodovi i redosled nisu promenjeni.** Objašnjenje izričito kaže šta očekuje ova sačuvana baza, a šta propisuje sadašnji zakon. Za 57 neslaganja i tri različita osnova `questionAnswers` ostaje `needs-expert`: potrebna je provera sa aktuelnim zvaničnim izvorom ili ovlašćenim stručnjakom pre promene ispitnog ključa. Kartica `kaznene-klase` je zaseban paket i još nije završena. Zato ni ostalih 51 pitanje još nema konačan status `reviewed`.

Primeri: tačno +30 km/h u naselju danas nosi 10.000 dinara, dok prag za četiri poena i obaveznu zabranu počinje tek preko +30; prekoračenje +15 van naselja nosi 5.000, a sačuvani odgovor navodi 3.000. Preticanje zaustavnom trakom ima drugi kazneni osnov od nedozvoljenog kretanja njome; mere se ne sabiraju proizvoljno. Odsustvo obavezne mere nije isto što i isključena sudska mogućnost.

## Izvori i korekcije revizije

Osnov je [ZOBS, PIS, zaključno sa 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), čl.329–338 i konkretne osnovne radnje navedene uz svaki ID u tabeli. Izvori i hashovi registrovani su u `izvori.json`. Znak zabrane skretanja desno potvrđen je u [Pravilniku o saobraćajnoj signalizaciji, čl.25 t.26, PIS 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1).

Nezavisni pregled ispravio je i greške prvobitne revizije: 8348 ima neposredni osnov34/333(11); 8420 pripada101/338(25), ne tramvajskim signalima i ne meri od četiri meseca; 8355 pita za novčanu kaznu; pogrešno dodat kodII-27 uklonjen je iz predloga8375. Devet generičkih predloga dopunjeno je odlučujućim slikovnim podatkom ili računicom. Tri dodatne uske popravke8383/8409/8274 uklanjaju netačnu vezu kazne sa opasnošću i izmišljeni univerzalni razlog isteka dozvole.

## Provere

73 izvorna JS stringa zamenjena su na postojećim mestima, bez dodatnog sloja prepisivanja ili novih funkcija. Tačna inverzija vraća prethodni izvor, četiri NUL ostaju, generisani L/C parovi tačno odgovaraju odobrenom tekstu, svi drugi EX podaci su identični.

Chromium: **444/444** — svih111 pitanja na oba pisma i širinama320/1280, svetla/tamna tema prema pismu. Provereni stvarni prikazi, učitane slike kada postoje, ceo objekat pitanja/ključeva, objašnjenja i otvaranje povezane kartice; bez grešaka, horizontalnog prelivanja ili upisa u sintetičko skladište. Ovo ne potvrđuje još sadržaj same kartice. Četiri završna mobilna snimka neposredno su pregledana.

Dokazi su u ignorisanim direktorijumima `output/revizija-20260911/024` i `028`: `records-revised.json`, `verdict.json`, `root-approved-73.json`, `root-byq-integration-proof.json`, `root-browser-result.json`, `first-five-source-parity.json`. Istorijski `records.json` i prvobitni predlozi nisu konačna evidencija.

`node tools/verify.mjs`: **249/249**; `git diff --check` bez grešaka. Tehnička provera ne rešava označena neslaganja ključeva sa sadašnjim propisom.

## Pojedinačni trag

| ID | Odnos prema osnovnom zakonu | Konkretan osnov |
| --- | --- | --- |
| 8224 | delimično | 329 st. 1,3,4; 41 st. 1 |
| 8225 | saglasno | Zakon o prekršajima 58 st. 3 |
| 8227 | neslaganje | 25 st. 3; 332 st. 1 t. 2; 335 st. 1 t. 1 |
| 8228 | uslovno | 178 st. 1; 330 st. 1 t. 1; 331 st. 1 t. 90a; 323 st. 1 |
| 8229 | neslaganje | 41 st. 2 t. 4; 329 st. 1,3,4 |
| 8230 | saglasno | 330 st. 1 t. 5,st. 3,5; 280 st. 3,4 |
| 8231 | saglasno | 330 st. 1 t. 6,st. 3,5 |
| 8232 | saglasno | 330 st. 1 t. 7,st. 3,5 |
| 8233 | saglasno | 330 st. 1 t. 8,st. 3,5 |
| 8235 | saglasno | 43 st. 1; 330 st. 1 t. 9; 41 st. 2 t. 3 |
| 8237 | saglasno | 44 st. 1 t. 3; 330 st. 1 t. 10; 41 st. 2 t. 3 |
| 8239 | saglasno | 161 st. 2; 330 st. 1 t. 11 |
| 8240 | saglasno | 163 st. 2; 330 st. 1 t. 12 |
| 8241 | saglasno | 330 st. 1 t. 13 |
| 8242 | saglasno | 330 st. 1 t. 14 |
| 8244 | saglasno | 168 st. 1 t. 1,3; 330 st. 1 t. 16 |
| 8246 | neslaganje | 55 st. 3 t. 6; 331 st. 1 t. 10; 335 st. 1 t. 20; 104 st. 2; 331 st. 1 t. 24a |
| 8247 | neslaganje | 104 st. 2; 331 st. 1 t. 24a; 335 st. 1 t. 46a; 338 st. 1 t. 27 |
| 8251 | neslaganje | 55 st. 3 t. 15; 331 st. 1 t. 10; 335 st. 1 t. 20 |
| 8252 | neslaganje | 55 st. 3 t. 10; 330 st. 1 t. 19,st. 5 |
| 8254 | neslaganje | 43 st. 1; 331 st. 1 t. 6; 335 st. 1 t. 10 |
| 8256 | neslaganje | 44 st. 1 t. 3; 331 st. 1 t. 7; 335 st. 1 t. 12 |
| 8260 | neslaganje | 78 st. 2; 331 st. 1 t. 14; 335 st. 1 t. 31 |
| 8261 | neslaganje | 77 st. 2; 331 st. 1 t. 13; 335 st. 1 t. 30 |
| 8264 | neslaganje | 103 st. 1; 331 st. 1 t. 24; 335 st. 1 t. 46 |
| 8265 | neslaganje | 109 st. 1; 331 st. 1 t. 30; 335 st. 1 t. 51 |
| 8266 | neslaganje | 110 st. 1; 331 st. 1 t. 31; 335 st. 1 t. 52 |
| 8271 | neslaganje | 142 st. 2; 331 st. 1 t. 39; 335 st. 1 t. 62; 41 st. 2 t. 1 |
| 8272 | neslaganje | 163 st. 2; 331 st. 1 t. 46; 335 st. 1 t. 73 |
| 8273 | neslaganje | 171 st. 2; 331 st. 1 t. 48; 335 st. 1 t. 75 |
| 8274 | neslaganje | 178 st. 1; 332a st. 1 t. 13; 335; 338 |
| 8275 | neslaganje | 183 st. 2; 331 st. 1 t. 52 |
| 8276 | neslaganje | 183 st. 3; 331 st. 1 t. 52; 335 st. 1 t. 82 |
| 8277 | neslaganje | 187 st. 2,8; 331 st. 1 t. 54; 335 st. 1 t. 84 |
| 8278 | neslaganje | 187; 330 st. 1 t. 4, st. 5,7 |
| 8281 | neslaganje | 247 st. 1,3,4; 330 st. 1 t. 23,st. 4,6 |
| 8282 | neslaganje | 268 st. 1; 331 st. 1 t. 80; 335 st. 1 t. 94; 338 st. 1 t. 59 |
| 8283 | neslaganje | 287 st. 3; 331 st. 1 t. 86; 335 st. 1 t. 99 |
| 8295 | neslaganje | 26 st. 1; 332 st. 1 t. 3; 335 st. 1 t. 2 |
| 8296 | neslaganje | 32 st. 3,4; 333 st. 1 t. 9 |
| 8298 | neslaganje | 43 st. 1; 332a st. 1 t. 4; 335 st. 1 t. 9; 338 st. 1 t. 5 |
| 8301 | neslaganje | 44 st. 1 t. 3; 332 st. 1 t. 9; 335 st. 1 t. 11 |
| 8302 | neslaganje | 50; 332 st. 1 t. 12; 335 st. 1 t. 16 |
| 8303 | neslaganje | 55 st. 3 t. 1; 332 st. 1 t. 16; 335 st. 1 t. 21; 41 st. 1,st. 2 t. 2 |
| 8305 | neslaganje | 57 st. 1,2; 332 st. 1 t. 18; 335 st. 1 t. 22 |
| 8306 | neslaganje | 79 st. 1; 332 st. 1 t. 27; 335 st. 1 t. 32 |
| 8310 | neslaganje | 99 st. 2; 332 st. 1 t. 43; 335 st. 1 t. 38 |
| 8314 | neslaganje | 105 st. 1,3; 332 st. 1 t. 48 |
| 8318 | neslaganje | 116 st. 1; 332 st. 1 t. 57; 335 st. 1 t. 55 |
| 8320 | neslaganje | 143 st. 2; 332 st. 1 t. 62; 335 st. 1 t. 63 |
| 8321 | neslaganje | 143 st. 2; 332 st. 1 t. 62; 335 st. 1 t. 63 |
| 8322 | neslaganje | 160 st. 1,3; 332 st. 1 t. 64; 335 st. 1 t. 67 |
| 8323 | neslaganje | 163 st. 2; 332 st. 1 t. 67; 335 st. 1 t. 72 |
| 8324 | neslaganje | 167; 332 st. 1 t. 68 |
| 8326 | neslaganje | 178 st. 1; 333 st. 1 t. 102; 335; 338 |
| 8328 | neslaganje | 183 st. 5; 332a st. 1 t. 16 |
| 8329 | neslaganje | 187; 332 st. 1 t. 77; 335 st. 1 t. 85 |
| 8330 | neslaganje | 187 st. 4 t. 6; 332 st. 1 t. 77; 335 st. 1 t. 85; 323 st. 1 |
| 8333 | neslaganje | 246 st. 1; 332 st. 1 t. 91,92; 5 |
| 8334 | neslaganje | 246 st. 1; 332 st. 1 t. 92; 5 |
| 8335 | neslaganje | 249 st. 2; 332 st. 1 t. 95 |
| 8337 | neslaganje | 268 st. 1; 333 st. 1 t. 105; 332a st. 1 t. 21; 335 |
| 8338 | neslaganje | 274 st. 1,4; 332 st. 1 t. 102 |
| 8339 | neslaganje | 274 st. 2; 332 st. 1 t. 102 |
| 8340 | uslovno | 247 st. 1,3,4; 320 važeći |
| 8341 | uslovno | 247 st. 1,3,4; 330 st. 1 t. 23,st. 4,6; 320 važeći |
| 8343 | saglasno | 27; 333 st. 1 t. 5 |
| 8344 | neslaganje | 28 st. 1; 332a st. 1 t. 2 |
| 8348 | saglasno | 34 st. 1; 333 st. 1 t. 11 |
| 8349 | saglasno | 43 st. 1; 333 st. 1 t. 15 |
| 8351 | neslaganje | 44 st. 1 t. 3; 332a st. 1 t. 5 |
| 8353 | saglasno | 55 st. 3 t. 11; 333 st. 1 t. 23 |
| 8354 | saglasno | 64 st. 2; 333 st. 1 t. 28 |
| 8355 | saglasno | 66 st. 1 t. 1; 333 st. 1 t. 29; 338 st. 2 |
| 8356 | saglasno | 66 st. 1 t. 3; 333 st. 1 t. 29 |
| 8366 | saglasno | 77 st. 3 t. 3; 333 st. 1 t. 38 |
| 8367 | saglasno | 79 st. 1; 333 st. 1 t. 39 |
| 8368 | neslaganje | 91 st. 1; 332a st. 1 t. 9; 279 |
| 8369 | saglasno | 99 st. 4; 333 st. 1 t. 56 |
| 8370 | saglasno | 104 st. 1; 333 st. 1 t. 60 |
| 8375 | saglasno | 132 st. 3; 333 st. 1 t. 78; Pravilnik o saobraćajnoj signalizaciji, čl. 25 t. 26: II-26.1 je zabrana skretanja desno; susedna t. 27 / II-27 je zabrana polukružnog okretanja. |
| 8376 | neslaganje | 187 st. 4 t. 4; 332a st. 1 t. 18 |
| 8378 | saglasno | 228 st. 2; 333 st. 1 t. 94 |
| 8379 | saglasno | 246 st. 1; 333 st. 1 t. 95 |
| 8383 | saglasno | 43 st. 1; 334 st. 1 t. 8 |
| 8385 | neslaganje | 44 st. 1 t. 3; 333 st. 1 t. 16 |
| 8386 | saglasno | 54 st. 1; 334 st. 1 t. 13 |
| 8389 | saglasno | 77 st. 1; 334 st. 1 t. 20 |
| 8390 | saglasno | 90 st. 1 t. 7; 334 st. 1 t. 28 |
| 8393 | saglasno | 164 st. 3 t. 4; 334 st. 1 t. 43 |
| 8395 | saglasno | 184 st. 1; 334 st. 1 t. 45 |
| 8397 | neslaganje | 43 st. 1; 338 st. 1 t. 5; 332a st. 1 t. 4; 335 st. 1 t. 9 |
| 8399 | saglasno | 43 st. 1; 334 st. 1 t. 8; 338 st. 1 t. 5,st. 2 |
| 8401 | saglasno | 44 st. 1 t. 3; 338 st. 1 t. 7; 335 st. 1 t. 11 |
| 8403 | saglasno | 44 st. 1 t. 3; 332a st. 1 t. 5; 338 |
| 8404 | saglasno | 187; 338 st. 1 t. 55,55a |
| 8405 | saglasno | 187; 332a st. 1 t. 17; 338 st. 1,2 |
| 8406 | saglasno | 55 st. 3 t. 3; 333 st. 1 t. 23; 338 st. 1 t. 13,14,st. 2 |
| 8407 | saglasno | 55 st. 3 t. 15,st. 7; 338 st. 1 t. 13 |
| 8408 | saglasno | 142 st. 2; 338 st. 1 t. 37 |
| 8409 | saglasno | 132 st. 3; 333 st. 1 t. 78; 338 st. 1,2; Pravilnik o saobraćajnoj signalizaciji, čl. 25 t. 26: II-26.1 je zabrana skretanja desno; susedna t. 27 / II-27 je zabrana polukružnog okretanja. |
| 8410 | saglasno | 143 st. 2; 338 st. 1 t. 38 |
| 8411 | saglasno | 66 st. 1 t. 1; 333 st. 1 t. 29; 338 st. 1,2 |
| 8412 | saglasno | 268 st. 1; 338 st. 1 t. 59 |
| 8413 | neslaganje | 178 st. 1; 332a st. 1 t. 13; 338 st. 1,2 |
| 8414 | saglasno | 330 st. 1 t. 7,st. 3 |
| 8417 | saglasno | 330 st. 1 t. 13,st. 3 |
| 8418 | saglasno | 330 st. 1 t. 18,st. 3; 31; 331 st. 1 t. 3 |
| 8420 | saglasno | 101 st. 1; 338 st. 1 t. 25 |
| 8421 | saglasno | 268 st. 1; 333 st. 1 t. 105; 332a st. 1 t. 21; 338 st. 1,2 |
| 8422 | saglasno | 178 st. 1; 333 st. 1 t. 102; 338 st. 1,2 |
