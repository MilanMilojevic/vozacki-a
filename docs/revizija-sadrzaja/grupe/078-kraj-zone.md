# A6-078/087 — početak i kraj zona

Datum: 2026-09-14. Verzija: v206. Dva potpuna pregleda 29 pitanja, svih87 opcija,29 pojedinačnih originalnih JPEG, starih/novih EX i cele kartice zn-ob-kraj-zone oba pisma. Svih29 veza je eksplicitno; atlas obuhvata istih29 pitanja, nema situacija. Kartica ima0 SVG,4 tabele,3 ručna odeljka i jedan odeljak atlasa; prag grupisanja600.

Prihvaćeno11 EX ispravki i10 lokalnih kartičnih fragmenata. Integracija spaja kartične fragmente u jednu zamenu bloka: ukupno12 source operacija. Nisu menjani ključevi, ponuđeni odgovori, slike, veze, simulacija ni CSS. Nema novih needs-expert.

## Proverene ispravke

- Original11070 i primarni III-72.1 pokazuju završetak desne dodatne trake; broj30 pripada susednoj traci koja se nastavlja. Kartica je grešila; postojeći EX11070 je tačan i ostaje.
- III-17 ukida prethodno postavljene znakove zabrana, ograničenja i obaveza, uz preostala opšta pravila. Uklonjena je strategija biranja odgovora po reči „svi”. Crvena dijagonala objašnjava samo navedene parove, ne svaki znak.
- Razlikuju se najava promene i mesto promene, naselje i teritorija naseljenog mesta, plavi krug i kvadrat. Sam naziv mesta nije dovoljan opšti kriterijum.
- Zeleni autoput i plavi motoput odgovaraju aktuelnim primarnim prikazima. Prelazna odredba49 iz76/2026 dopušta tri godine za usklađivanje zatečene signalizacije: od29.08.2026 do29.08.2029. Stare originalne fotografije nisu prebojane niti automatski proglašene pogrešnim.
- Precizirani su prestanak obaveze lanaca, odvojene opšte obaveze zimske opreme, strana puta za zabranu parkiranja/zaustavljanja i najveća dozvoljena masa teretnog vozila. Parking simbol P ostaje latinični i u ćiriličnom objašnjenju.

Menjani EX:9082,9155,9162,10885,10886,10888,10889,10946,10950,10951,10953. Preostalih18 ostaje. Root je proverio i odbacio sopstvenu pretpostavku da primarni III-24 izričito dopušta naziv mesta: tekst i originalni primarni prikaz to ne podržavaju;10884 zato nije proizvoljno menjan.

Primarni [SIGNAL76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): relevantne odredbe25–26,32–35,50,52 i završni amending49/50. Primarni [ZOBS19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311):7(30),42–45,55,59,160–163,246. Oba pregleda pročitala sadržinski relevantne pune odredbe i izuzetke; detaljnije tehničke dimenzije i turističke table pregledao prvi autor. Root dodatno otvorio svih pet primarnih prikaza III-23/24/68/69/72.1. Sveži HTTP20014Sep potvrđuju iste primarne bajtove, bez novih celih kopija propisa.

## Provere i granice

Prvi browser:16 celih kartičnih konteksta i232 preview pitanja/696 opcija;464 atlas slike,64 provere krajeva tabela i128 granica ćelija. Početni dokument na320/200% bio je L420px/C331px. Sadržinske izmene rešavaju dokument, ali ostaju prekoračenja unutar ćelija. Poslednji lokalni fragment koristi postojeću klasu wrapRow. Dokaz pre/posle/vraćanje: L420→342→320→320→420; C331→320→320→320→331; četiri izlaska iz ćelija nestaju tek sa poslednjim fragmentom.

Root stvarno integrisani v206:16 kartičnih konteksta,232 stvarna odgovaranja/696 opcija,16 zoom/pan/fit provera,320/1280 oba pisma/teme i stvarni font15→30/16→32. Cele tabele proverene do poslednje kolone,128 granica ćelija i svih464 kartičnih slika učitano; tačni tekstovi, opcije, EX, veze, dostupni nezaklonjeni završeci i sintetički sačuvani odgovori. Odgovori postoje samo u odbačenim praznim kontekstima. Obični tekst najmanje12,75px pri100%, kontrast4,759:1; SVG merenje nije primenjivo. Ovo nije potpuna WCAG sertifikacija.

Root početni harness pogrešno je zahtevao identičan spisak svih pasusa, iako aplikacija dodaje svoju napomenu uz atlas. Dijagnostika je sačuvana; konačna provera zahteva svaki izvorni pasus i identične tabelarne tekstove, uz posebno proverenu postojeću atlas napomenu. To nije bilo odstupanje sadržaja aplikacije.

Pre integracije read-only potvrđeno240 zamrznutih078 fajlova. Ceo stari generator jednak v205 runtime-u, konačni menja samo11 EX/jednu karticu. Originalni importovani atlas SUB objekat, četiri NUL, tačna reverzija i svi ostali podaci jednaki. Source SHA0ed594f6376236afe379b9cdf692f53528368c20ccbcc6f78b5cee797a2e63b4.

Dokazi:078/report.md,records.json,candidate-browser.json,flow-final.json,verification.json;087/read-notes.md,root-approved.json,root-source-operations.json,root-integration-proof.json,root-integrated-browser-result.json,root-verify-v206.log. Root19171 koristi nove prazne kontekste. Originalni checkout, Chrome/progres i korisnički portovi nisu dirani. Nema nove cele kopije aplikacije/banke.
