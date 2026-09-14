# A6-073/080 — svetla i pokazivači pravca

Datum: 2026-09-14. Verzija: v205. Dva potpuna pregleda 24 pitanja, 75 opcija, sedam originalnih JPEG i dve cele kartice oba pisma. Deset EX ispravki, 30 prvih i dve naknadne kartične dopune, lokalni ARIA za 16 SVG. Trinaest konačnih source operacija uključuje cele dve kartice; naknadne operacije ne primenjuju se ponovo. Ključevi, pitanja, slike, veze i sav drugi sadržaj sačuvani. Nema novih needs-expert.

## Sadržaj

- Svetla: devet pitanja, 15 postojećih SVG, četiri tabele, šest ručnih odeljaka. Precizirani izuzetak glavnih farova iz77(4), sva četiri stava78 i parkirana vozila80. Tabela za maglu sada izričito poredi **prednja** svetla uz poziciona; „samo kratka” ne znači gašenje drugih obaveznih svetala.
- Pokazivači: 15 pitanja, jedan SVG, pet tabela, pet ručnih odeljaka i sedam situacija; prag grupisanja600. Puni uslovi bezbednosti i trajanja signala32, opšta bezbednosna namena sirene59 i svih šest slučajeva61 sa izuzecima. Nema atlas stavki.
- 10031: taksi je levo, signal desno. Fotografija ne dokazuje skrivene ljude ni kretanje; objašnjenje ne izmišlja te činjenice. 10049: znak radova na500m ne naređuje sam po sebi zaustavljanje; uz sačuvani odgovor navedeni su uslov kolone i izuzetak61(4). 10048 razlikuje smanjenu vidljivost, poslednje zaustavljeno vozilo i sopstveni ulazak/izlazak putnika.
- Root je u ponovnom čitanju uočio pogrešno tumačenje „naizmenično” kroz levi pa desni far. Nezavisni080 potvrdio ZOBS60 i MGSI47; uklonjen je taj donji red crteža. Sačuvan gornji primer uzastopnog uključivanja i puni zakonski tekst. Nije dodato drugo izmišljeno tumačenje.
- Menjani EX:10029,10031,10036,10039,10040,10042,10048,10049,10211,10217. Preostalih14 ostaje. Odbijen je predlog da se32(3–4) proširi na peti stav: puni tekst ne podržava tu numeraciju.

Primarni izvori: [ZOBS kroz19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), [SIGNAL76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), [MGSI tehnički uslovi kroz54/2026](https://www.mgsi.gov.rs/sites/default/files/pravilnik_o_podeli_motornih_i_prikljucnih_vozila_i_tehnickim_uslovima_za_vozila_u_saobracaju_na_putevima.pdf). Sveži HTTP200 i identični SHA potvrđeni14Sep; puni relevantni članovi i originali pregledani u073/080. Root posebno čitao10 novih EX oba pisma, sporna pitanja10031/48/49 i pravne izuzetke; ne predstavlja taj fokusirani treći pregled kao još jedno potpuno čitanje svih75 opcija.

## Čitljivost i dokazi

Postojeći crteži dobili su čitljivije natpise i obode. Nezavisno provereno128 prvih SVG varijanti i završna skraćena ilustracija oba pisma/teme. Najmanji SVG font13,719px, tekst5,712:1, bitna grafika3,190:1, obični tekst4,759:1. Ovo su izmereni delovi; nije tvrdnja o punoj WCAG sertifikaciji.

Jedina CSS izmena je overflow-wrap:anywhere za pasuse objašnjenja. Dugačak token pitanja10044 prelazio je raspoloživ prostor na telefonu pri200%; oba pregleda pokazala338→320→338 pre/posle/vraćanje. Nezavisni pregled obuhvatio je i12 drugih pitanja sa dugim rečima, kosom crtom, slikom i više odgovora:48 uporednih merenja i96 dodatnih tokova.

080:32 prazna konteksta,64 pre/kandidat prikaza kartica,288 stvarnih odgovaranja (192 ciljna+96 šira),1000 opcija,288 dostupnih završetaka i64 SVG zoom/pan/fit; završne dve dopune još32 konteksta,24 stvarna odgovora i8 zoom provera. Poslednje kolone tabela dostupne. Sintetički upisi ostaju u odbačenim testnim kontekstima.

Root integrisani v205:32/32 kartična konteksta i192/192 preview tokova,320/1280, oba pisma/teme, stvarni font15→30 i16→32. Tačni Q/opcije/EX/veze, dostupni i nezaklonjeni završeci, nula grešaka, prelivanja i upisa. Root ne tvrdi dodatnu proveru horizontalnog kraja svake tabele; to je izričito izmerio080.

Pre integracije read-only potvrđeno277 zamrznutih073 i121 zamrznut080 fajl. Puni stari generator jednak v204 runtime-u; konačni menja samo10 EX i dve kartice. Originalni atlas SUB objekat, četiri NUL, tačna reverzija; zbir prvih i naknadnih predloga jednak konačnim13 operacija. Source SHA38809a41aba4e314db49d1dc9816ae3b1fde40ab68d87457f14d49445cd3f888, CSS SHA b5d9aedba054ac8142b4c39032b04f128ea6c8a89f56249edf806de38cdd243b. Aplikativna logika, banka i originalne slike nisu menjani.

Dokazi:073/root-approved.json,root-integration-proof.json,root-source-operations.json,root-integrated-browser-result.json,root-verify-v205.log;080/report.md,individual-records.json,final-cards.json,final-source-operations.json. Dokazi ostaju ignored; ovaj trajni zapis i pojedinačni ledger prate Git verziju. Root19171/peer19173 koriste prazne kontekste; korisnički Chrome/progres/18980/8137 netaknuti. Nije kopirana cela banka.
