# A6-015 — kategorije vozila

11. septembar 2026. Celokupan sadržaj kartice pregledao je Codex A0, integraciju, zakonske pragove, oba generisana pisma i browser proveru root. Četiri SVG neposredno pregledana; ova kartica nema atlas, situacije niti raster slike. Nema potvrde instruktora.

Osnov je [PIS ZOBS kroz 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), član 7 tačke 34–39. Izvor i otisak su u registru `zobs-cl7-vozila-mase-isprave-pis-19-2025`.

## Ispravke

- Broj točkova sam ne određuje vrstu vozila. Uvod i četiri opisa crteža upućuju i na pragove, bez netačnog pravila da svako prekoračenje proizvodi „teško” vozilo.
- Uklonjena je duplirana `.vgrid` matrica. Jedina preostala tabela razlikuje benzin, drugi motor sa unutrašnjim sagorevanjem i električni pogon, efektivnu/trajnu nominalnu snagu i ograničenja mase. Završni tekst ne primenjuje pravilo za tricikle na teški četvorocikl.
- Naziv vozila i broj/raspored točkova spojeni su u prvu kolonu, dok druga zadržava sve uslove. Na 320 px ćirilična tabela pala je sa 1.751 na 961 px visine, uz nepromenjen tekst uslova i bez horizontalnog prelivanja. To je lokalna popravka ove tabele; drugi prikazi i simulator nisu menjani.
- Četiri SVG zadržavaju geometriju i boje. Njihovi ćirilični pristupačni opisi su prevedeni postojećim lokalnim mehanizmom; šest opisa kartice brzine ostaje identično.
- Uklonjena direktna veza iz 7990 (bicikl) i 8667–8669 (prevoz dece). Kod 7990 ostaje korisni `slicni-pojmovi`. Kod ostala tri postojeći `nocard` sada sprečava neodgovarajući podrazumevani pojam; prethodno nije poništavao direktnu vezu. Nema dodavanja novih pravila navigacije.

## Završeni i otvoreni zapisi

Zajedno sa pojedinačnim pregledom u [014](014-vozila-mase-i-isprave.md) završeno je 14 pitanja: **7996, 7997, 7998, 8005, 8006, 8007, 8008, 8009, 8010, 8011, 8013, 8015, 8016, 10406**. Za svako je provereno da mu je ovo jedina zavisna kartica i da su ostali slojevi već završeni. Kartica dobija `reviewed` posle pregleda novog generisanog sadržaja.

7990 ostaje u pregledu druge kartice, a 8667–8669 nisu proglašena sadržajno pregledanim samo zbog uklanjanja veze. Originalna pitanja, opcije, redosled, ključevi, bodovi, slike i sva individualna objašnjenja ostaju identični osnovi v168.

## Dokaz

Root browser nad v169: **24/24** kombinacije oba pisma, obe teme, 320/390/1280 px i osnovnog/povećanog fonta; **6/6** stvarnih tokova otvaranja povezanih pojmova. Tabela odgovara generisanim ćelijama, prisutna su četiri crteža sa odgovarajućim opisima, nema prelivanja stranice ni upisa sintetičkog napretka. Novi desktop i mobile snimci neposredno pregledani. Izvorne zamene imaju tačnu inverziju; ostalih 38 kartica i svi byQ tekstovi ostaju identični. Lokalni detalji: `output/revizija-20260911/015/`.
