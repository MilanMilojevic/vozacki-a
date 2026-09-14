# A6-079/088 — ostala obaveštenja

Datum: 2026-09-14. Verzija: v208. Dva potpuna pregleda 26 pitanja, 80 opcija, starih i novih objašnjenja oba pisma i 26 originalnih slika. Pregledana cela kartica zn-ob-ostalo: 22 atlas i četiri situacione slike, četiri tabele, bez SVG. Prihvaćeno 18 EX promena i osam fragmenata kartice; ukupno 20 izvornih operacija sa celom karticom i zaštitom skraćenice SRB pri transliteraciji. Nema promene banke, ključeva, slika, veza ili simulacije. 25 pitanja reviewed; 10916 needs-expert.

## Sadržinske odluke

- 10916: na horizontalnoj tabli III-84 pravilnik dopušta i II-45.2 (kružni tok), što odgovara panelu 2 originalne slike. Banka zahteva dva odgovora i prihvata samo panele 1 i 4. Objašnjenje izričito razdvaja sačuvani ključ od važećeg pravila; ključ nije prepravljen. Potrebna je stručna potvrda. Za 10917 drugačija tabla III-84.1 i panel 3 odgovaraju pravilu; nema dodatnog spornog statusa.
- 10984: slika elektronske i ručne naplate i dalje odgovara značenju odgovora, ali je III-93 izbrisan iz novog pravilnika. Objašnjenje navodi istorijski znak i ograničenu prelaznu odredbu za postojeću signalizaciju; ne predstavlja ga kao novi standard.
- Ostale korekcije: zelena podloga nije isključiva za međunarodne puteve; stacionaža počinje od prve deonice; nadmorska visina nije uspon; table krivine mogu biti na početku i unutar krivine; dužina 744 m pripada konkretnom tunelu; ENP ne garantuje prolaz bez zaustavljanja; snimanje ne dokazuje stalni rad uređaja. Za osam neizmenjenih objašnjenja evidentiran je pojedinačni pregled.

Pročitani relevantni puni članovi [SIGNAL 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), [ZOBS 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), [pravilnika o stacionaži 65/2019 i 42/2024](https://www.putevi-srbije.rs/images/pdf/regulativa/Pravilnik-o-nacinu-oznacavanju-i-evidenciji-javnih-puteva-40-24.pdf) i [uputstva Puteva Srbije za ENP](https://www.putevi-srbije.rs/index.php/sr/ure%C4%91aj-za-enp-uputstvo-za-kori%C5%A1%C4%87enje). Tačni članovi i SHA su u registru izvora. Ne predstavlja stručnu pravnu potvrdu.

## Provera i granice

Nezavisni 088 potvrdio je 208 stvarnih odgovaranja, 640 opcija i 20 zoom/pan/fit tokova. Konačni zasebni pregled kartice ima 32 stara/nova stanja, 128 tabela, 1.472 granice ćelija i 832 učitavanja slika. Početno pogrešno označeno cardRows polje zbog navigacije na isti hash nije korišćeno kao dokaz. Dopunski link tokovi za 10984 slučajno imaju 400% font i izričito se ne računaju kao preciznih 200%; glavni tokovi imaju stvarnih 200%. Dijagnostika mernih skripti ostaje sačuvana.

Root je dodatno pregledao sporna 10916/10917/10984, originale i primarne odredbe, pa na stvarnom v208 bez injekcije kandidata proverio 16 celih kartica i 208 stvarnih odgovaranja pri 200% (320/1280, oba pisma i teme), svih 640 opcija i 20 zoom/pan/fit tokova. Tačni tekstovi i ključ, dostupan nezaklonjen kraj, bez prelivanja dokumenta ili browser greške. Tabele se mogu pomeriti do poslednje kolone; 736 granica teksta ćelija i 416 slika u root kartičnim kontekstima. Ovo je izolovani Chromium, ne fizički telefon ili WCAG sertifikat.

Pre integracije potvrđena 341 zamrznuta dokazna datoteka. Cela stara generacija jednaka v207 runtime-u; konačna menja samo odobrenu karticu i 18 EX, uz originalni SUB objekat, četiri NUL bajta i tačnu obrnutu primenu operacija. Source SHA d4eae003c1524f74b4f905c0656dea7f386ebd3b6c533efb9290ddfc20caccfc. Korisnikov Chrome, napredak i origin-i 8137/18980 nisu dirani; root koristi 19171 sa odbačenim praznim kontekstima.

Dokazi: output/revizija-20260911/079/{report.md,root-approved.json,root-integration-proof.json,root-integrated-browser-result.json,root-verify-v208.log}; 088/{report.md,individual-records.json,verification.json,cards-final-browser.json,sources.json}. Rezultat celog projektnog verifikatora beleži IZVRSAVANJE-PLANA.md.
