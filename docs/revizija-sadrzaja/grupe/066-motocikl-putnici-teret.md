# A6-066 — motocikl, putnici i teret

Datum: 2026-09-14. Verzija: v198. Dva potpuna pregleda **16 pitanja / 56 opcija / 2 originalna JPEG sa sedam ponuđenih prikaza**. Ova pitanja nemaju efektivne veze ka karticama; nacrti, tabele i galerije nisu dodavani. Originalna pitanja, opcije, ključevi, slike, redosled i svi ostali EX ostaju isti.

## Minimalne ispravke

Deset EX ispravki kroz sedam postojećih izvornih literala.8652 razlikuje gornju granicu broja putnika od obaveznog broja i posebnih slučajeva.10234/10236/10243 vraćaju izuzetke za oslanjanje pri mirovanju i namensku prikolicu, kao i zabranu da upravljano vozilo bude vučeno.10235 dosledno čuva izuzetak prikolice.10240/10241 objašnjavaju zakonsku zabranu alkoholisanog putnika i na triciklu, umesto pogrešnog pozivanja samo na ravnotežu dvotočkaša.10546/10547 preciziraju homologovanu kacigu.

**10237 ostaje za stručnu proveru:** ključ baze bira prikaz2; nije pouzdano vidljiv razlog odbacivanja prikaza4 sa kutijom. Svetlo i tablica vide se ispod kutije, a fotografija ne dokazuje mere, vezivanje ili zaklonjen pogled. EX to izričito kaže; ne tvrdi da je4 ispravan i ne menja sačuvani ključ32545. Prikaz1 ne drži upravljač, a prikaz3 drži alat koji može ometati upravljanje.

## Dokazi i granice

- [Važeći ZOBS u PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), celi čl.90/91/92/112/113/116/118. Svež HTTP20014.9.2026 10:06UTC potvrdio je958955 bajtova i isti SHA8796f6a1718bea08ea4fe1dedb3c9a71001b1c6c5245a93526f365a61e668d5d. Veliki izvorni dokument nije kopiran po testovima.
- Root i nezavisni067 pročitali su sva pitanja/opcije/stare i nove EX L/C, pojedinačno oba originala i svih sedam ponuđenih prikaza.067 je dodatno uvećao svaki panel u izolovanom browseru; originalni JPEG nije menjan. Posebne veze nocard8667–8669 ostaju.
- Root kandidat128/128, nezavisni stvarni mobilni tokovi64/64 i root integrisana v198128/128: oba pisma, obe teme,320/1280, tačni Q/EX/ključevi, bez kartičnih linkova, grešaka/prelivanja/sintetičkih storage upisa. Root066 ima i proveru stvarnog skrolovanja do kraja dugih EX10237/10243. Za snimak celog teksta fiksni slojevi sakriveni su tek posle provere normalnog skrolovanja; to nije dokaz da je prikaz bez navigacije stvarni UI.
- Cela stara generator semantika upoređena je sa runtime-om, zatim cela kandidat semantika sa očekivanih10 EX. Tačno sedam literalnih operacija može se obrnuti do identičnih početnih bajtova; sva četiri NUL bajta očuvana su. Kartice, atlas, situacije, zamke, veze, CSS, app.js i data.js nepromenjeni.
- Prvi root dry-run otkrio je grešku svog VM harnessa: kopirani SUB_KARTICA_SVE nije delio stanje sa importovanom funkcijom atlas, pa su izostale implicitne situacije. Ispravljeno je vezivanje istog objekta i ponovljeno poređenje celog izlaza sa runtime-om **pre ikakve tracked izmene**. Nezavisni067 takođe beleži ispravljen testni faktor fonta; njegov konačni64-prolaz je125%, nije predstavljen kao200%.
- Zamrznuti prvi06630 fajlova i nezavisni06723 fajla provereni su read-only pre integracije. Konačni dokazi:066/root-source-operations.json,root-integration-proof.json,root-browser-result.json i root-verify-v198.log. Ovo nije potvrda instruktora niti pregled fizičkog telefona.

| ID | Konkretan nalaz | Primarni član |
|---:|---|---|
|8624|Ključ27583. Izuzetak posebne dozvole odnosi se na112(1)(2-3), ne ukida stabilnost/upravljanje iz112(3)(2); sva tri odgovora pročitana.|ZOBS:112(1-3)|
|8638|Pojedinačno otvoren JPEG:1kvadrat/kose crveno-bele pruge;2narandžasti trougao/crvena ivica;3narandžasti pravougaonik/crna ivica.27623 je tabla za istureni teret prema113(3).|ZOBS:113(3)|
|8652|27664 je opšti zahtev dozvole i predviđenih mesta. Sama sedišta ili popunjenost uz masu nisu dovoljni;116 ima posebne slučajeve.|ZOBS:116(1-4)|
|8667|27709 je mlađe12 za tricikl;13/14 ne odgovaraju118(2).|ZOBS:118(2)|
|8668|27712 je mlađe12 za motocikl;13/14 ne odgovaraju118(2).|ZOBS:118(2)|
|8669|27715 je mlađe12 za četvorocikl;13/14 ne odgovaraju118(2).|ZOBS:118(2)|
|10234|32534+32532 su propisane zabrane; kratko ispuštanje nije izuzetak. Svi predmeti nisu zabranjeni;90(6) je vezan za moguće ometanje.|ZOBS:90(1-7)|
|10235|32536+32537 zabranjuju potiskivanje/vučenje. Nepokretnost zbog kvara i veliki nagib nisu ponuđeni izuzeci;90(5).|ZOBS:90(4-5)|
|10236|32542+32540: zabrana oba uva i predmeta koji mogu ometati, a ne bilo kakvih slušalica/predmeta;90(6-7).|ZOBS:90(6-7)|
|10237|Sve četiri fotografije pojedinačno očitane na originalnom panelu.1skrštene ruke,2ruke na upravljaču/sedenje/kaciga,3alat preko ramena,4kutija iza sedišta. Ključ2 očuvan; dokaz protiv4 ostaje needs-expert.|ZOBS:90(1,6);91(1);112(3)|
|10240|32557 zabrana putnika pod alkoholom; ponuda neometanja nije izuzetak91(2).|ZOBS:91(2)|
|10241|32560 zabrana psihoaktivnih supstanci; neometanje nije izuzetak91(2).|ZOBS:91(2)|
|10242|32563 je dva točka i teret; četiri točka/prevoz lica nisu dopušteni92. Postojeći kratkiEX ne izmišlja bezuslovnost drugih uslova.|ZOBS:90(4);92|
|10243|32566+32567: nepridržavanje i zabrana vuče drugog mopeda/motocikla. Vuča bicikla nije dopušten izuzetak; svi predmeti nisu zabranjeni90(3-4,6).|ZOBS:90(3-4,6)|
|10546|33501+33499: četvorocikl/moped/motocikl. Traktor i radna mašina nisu obuhvat91(1); kabinski izuzetak već uEX.|ZOBS:91(1)|
|10547|33506+33505+33503: četvorocikl/moped/motocikl. Ni traktor bez kabine/rama ni radna mašina nisu lista91(1).|ZOBS:91(1)|
