# A6-075 — stajališta, prevoz dece i osnovne dužnosti

Datum:2026-09-14. Verzija:v203. Prvi075 i root nezavisno pročitali svih **17 pitanja/52 opcije**, sve stare EX oba pisma i14 predloženih EXL/C. Devet originalnih JPEG referenci ima sedam različitih sadržaja; četiri panela9555 dodatno pregledana uvećano. Sva pitanja imaju nocard:1 i nemaju efektivne kartice, atlas, situacije, SVG ili tabele. Potisnuta implicitna veza sa prvenstvom prolaza ostaje potisnuta.

## Ispravke

-9533/9534: bezbedno uklanjanje prepreke i obaveštavanje bez odlaganja; dodatna obaveza prijave događaja/pojave iz22(4) nije isključena mogućnošću uklanjanja. Dopušten nastavak vožnje nije naredba.
-9540/9542/9543: opšta pažnja pri obilaženju autobusa i obavezno zaustavljanje kada putnici pri ulasku/izlasku moraju preko konkretne trake. Ostrvo samo po sebi nije zakonski kriterijum. Kod prevoza dece važe uslovi26: organizovan prevoz, ulazak/izlazak i po jedna traka po smeru; staju oba smera. To je precizirano i u10631/10632/10634/10636, bez izmišljenih uzroka ili apsoluta o običnim putnicima.
-9554/9555: narandžasta oznaka vozila, trougaoni I-15 i znakovi obaveštenja III-11/III-28 razlikuju se. Paneli3/4 prikazuju raniji plavi izgled; današnji primarni prikazi imaju žuto/belo polje. Stara slika i odgovor1 sačuvani; raniji znakovi nisu proglašeni odmah nevažećim zbog prelaznog49 izmena76/2026.
-9557: prijava prepreke nije izuzetak za držanje telefona. Sačuvani uslovi čujnosti i pažnje; uklonjena nepotrebna kategorička tvrdnja o svakom stanju „na semaforu”.9559/10443: autobus se u naselju propisno uključuje, a obaveza nije sužena samo na javni prevoz. Ispravljeno pogrešno „isključuje”.

Ukupno14 EX ispravki kroz14 jedinstvenih izvornih operacija.9545/9546/9561 ostaju neizmenjeni. Nema novog needs-expert niti promena pitanja, opcija, ključeva, slika, kartica ili veza.

## Izvori i granice

Primarni [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311) kroz19/2025, [signalizacija/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1) kroz76/2026 i [MGSI pravilo za oznaku prevoza dece](https://www.mgsi.gov.rs/sites/default/files/Pravilnik%20o%20izgledu%20i%20nacinu%20postavljanja%20znaka%20za%20obelezavanje%20vozila%20kojim%20se%20vrsi%20organizovan%20prevoz%20dece.pdf)3/2011. Aktuelni ZOBS/SIGNAL bajtovi imaju isti14Sep HTTP200 dokaz; ministarski PDF ima sopstveni HTTP200/hash i nalazi se na aktuelnoj listi. Prvi autor pročitao potpune navedene članke; root dodatno cele22–32/42, relevantne268 i završni49/50, ceo tekst MGSI1–9 i obe njegove ilustracije, te primarne pojedinačne I-15/III-11/III-28. Čl.2 posebnog pravilnika dopušta oznaku na vozilu samo dok se prevoze deca.

Za9561 prvi autor je dodatno pročitao ceo26 MUP/PIS pravilnika o registraciji. Njegov dostupni PDF je kroz51/2022, ne „kroz2024”:2024 je samo prelazni rok. Ta granica je izričita u075/legal-notes.md. Aktuelni primarni ZOBS29/268(6) podržava zabranu ometanja/propisno postavljanje tablica; pomoćni26(3) zahteva čitljive/nezaklonjene tablice. Nije izmišljen izuzetak po posebnoj dozvoli. Root ne tvrdi da je sam pribavio noviju konsolidaciju tog pomoćnog pravilnika.

Root otvorio svih devet originalnih referenci, sa dva SHA-identična para10631/10632 i10634/10636; svaki različiti sadržaj neposredno pregledan.9555 svačetiri panela posebno i primarni crteži otvoreni; ne zavisi samo od naziva slike ili tačnog ključa.

## Provere

Pre integracije075 read-only PASS za63 frozen fajla, pune ciljne preimages i stvarni ceo generator nadv202. Root zasebno potvrđuje puni stari izlaz==runtimev202, novi==samo14x. Originalni atlas SUB objekat,14 reverzibilnih operacija,4NUL; sve druge kartice/EX/metadata/atlas/situacije/zamke jednake. CSS/app/data nepromenjeni.

Root stvarno integrisani v203:136/136 preview tokova (17×L/C×320/1280×obe teme), stvarni rootfont15→30/16→32. Provereni puna pitanja/sve opcije/ključevi, tačni i potpuno vidljivi EX, odsustvo kartičnih veza, slike i svih136 dostupnih/nezaklonjenih završetaka pri pravoj navigaciji.0prelivanja/JSgrešaka/storageupisa. Prvi075 nezavisno136/136 istih dimenzija sa72JPEG učitavanja. Njegov početni font-harness je greškom umnožavao veličinu posle hash-rute; završni prolaz pamti početnu veličinu i nije prikazan kao neuspeh sadržaja. Fizički uređaji i stručno odobrenje nisu simulirani ovim dokazom.

Dokazi:075/individual-records.json,legal-notes.md,generator-proof.json,browser-result.json; root-approved.json,root-source-operations.json,root-integration-proof.json,root-integrated-browser-result.json,root-verify-v203.log. Sopstveni19174 i root19171, prazni nonpersistent konteksti; korisnički Chrome, napredak,18980/8137 netaknuti. Nijedna kopija cele banke nije napravljena.
