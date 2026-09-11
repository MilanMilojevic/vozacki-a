# A6-032 — znakovi izričitih naredbi

Datum: 2026-09-11. Verzija: v183. Pregledana 72 stvarno povezana pitanja, svih 214 opcija i 69 originalnih slika, na oba pisma. Cela kartica ima šest tabela, 58 slika atlasa i 11 situacija; nema SVG-a. Podoblast 158 i dalje ima 65 pitanja / 62 slike, pa je njen postojeći uvodni broj očuvan.

## Ispravke

Promenjeno je 20 objašnjenja: 16 sadržajnih ispravki latiničnog izvora i četiri samo za očuvanje izvornih oznaka u ćirilici. Ispravljeni su izmišljena cisterna/rezervoar i dodatne osovine na slikama, pogrešni susedni znakovi, izuzetak za vozilo koje se pretiče i preširoke tvrdnje o boji znaka. Rimske oznake I/II, slovo U koje opisuje oblik strelice i jedinice m/t ostaju izvorne u oba pisma.

Kod 9023 odgovor o zabrani za bicikle ostaje tačan među ponuđenim odgovorima. Objašnjenje i kartica dodaju da važeći znak obuhvata i laka električna vozila. Nije promenjen ključ zbog toga što je sačuvani odgovor uži od pune sadašnje definicije. Ispitna pitanja, svi odgovori, njihov redosled, bodovanje i slike ostaju isti.

Cela kartica precizira postavljanje i ponavljanje naredbe, izuzetke, najveću dozvoljenu masu naspram ukupne mase, simbole, lance i prikazane dopunske table. Posle nezavisnog pregleda još dve tvrdnje „uvek” ublažene su u „često”. Sva dobra zadržana objašnjenja i struktura kartice ostaju.

Zajedničke poruke atlasa, situacija i poređenja netačnih opcija sa drugim znakovima sada tačno kažu da prikazuju sačuvanu banku. Više ne garantuju iste slike na budućem ispitu ili potpuno aktuelno „zvanično značenje” svakog starog odgovora. Usklađena su i tri komentara uz taj kod; algoritam prikaza nije promenjen.

## Izvori i pregled

- [Pravilnik o saobraćajnoj signalizaciji, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), zaključno sa 76/2026: Celi čl. 24–33 i 35, uz poređenja čl. 18/22: znakovi izričitih naredbi, simboli, izuzeci i postavljanje.
- [ZOBS, PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), zaključno sa 19/2025: Definicije i čl. 20, 32, 50, 55: primena znaka i radnja u prikazanoj situaciji.

Samostalni prvi pregled /root/a1_safe_harness (032); nezavisni pregled /root/a0_sanitize (034): svi tekstovi, opcije i originalne slike, cela kandidatska kartica. Root je pročitao sve završne zamene i celu generisanu karticu na oba pisma, neposredno proverio ključne pune odredbe 24–33 i odlučujuće slike 9034/9038/9045/10848/10856/11068. Slikovni par prikolica proveravan je i prema izvornim ilustracijama Pravilnika, bez nagađanja broja osovina.

## Provere i granice

- Chromium 16/16: oba pisma/teme, 320/1280, običan i dvostruk osnovni font. Šest tačnih tabela; 58+11 stavki u istom redosledu, sa tačnim odgovorima i pristupačnim nazivima; nove poruke obe vrste galerije. Bez prelivanja stranice ili grešaka.
- Svih 72 pitanja na oba pisma i obe širine: 288/288. Tačno pitanje, opcije/ključ, vidljivo objašnjenje i stvarne veze; slike se učitavaju. Bez upisa u sintetičko skladište.
- Root je pogledao šest završnih mobilnih snimaka: primer atlasa, tabela masa i rimske oznake na oba pisma. Pojedine tabele i dalje imaju lokalno horizontalno pomeranje; najveća razlika scrollWidth/clientWidth u ovoj matrici je 361 px. To nije prelivanje cele stranice niti tvrdnja da je kompletna mobilna revizija završena.
- Poslednja usklađena poruka uz netačne opcije zasebno proverena na 9034/10856, na oba pisma: 4/4. Iste slike i veze, bez prelivanja ili upisa napretka.
- 34 tačne izvorne operacije, četiri NUL bajta očuvana; tačno 20 byQ i jedna kartica promenjeni, svi ostali EX podaci isti. App promena svodi se na tri poruke i tri komentara. Konačna tehnička provera: `node tools/verify.mjs`, 249/249.

Proceduralna napomena: tokom nezavisne provere slučajno je ponovo generisan jedan ignored dokaz iz 032. Ostalih 14 zamrznutih hashova i sadržajni predlozi ostali su isti; izvorna nepoznata međuverzija nije izmišljana. Root koristi proverene preimages i sopstveni konačni rezultat. Detalji su u ignored 034/peer-review.md.

Zatvara se kartica i 71 pitanje. Pitanje 9677 još čeka i celu karticu skretanja. Pitanja 9762/9813 zadržavaju objašnjenja iz v182 i sada imaju obe kartice pregledane. Ukupno: 411 reviewed, 5 in-progress, 62 needs-expert, 849 unreviewed; kartice 11 reviewed, 1 in-progress, 27 unreviewed. Nema utvrđenog sukoba ključa u ovoj grupi; nije preuzet aktuelni portal niti obavljena proba sa stvarnim čitačem ekrana.

Dokazi: ignored output/revizija-20260911/032 i 034; root-integration-proof.json, root-final-source-operations.json, root-browser-result.json i root-*.png.

## Pojedinačna mapa

| ID | Objašnjenje | Primarni osnov i nalaz |
|---:|---|---|
| 9007 | Očuvano | 32 st. 1,4: Ponuđeni odgovor odgovara opštem pravilu člana 32 o ponavljanju znaka posle raskrsnice sa drugim putem. Ne uvoditi stručnu neizvesnost zbog posebnih položaja STOP/prvenstva u članu 33; tabela kartice označena je kao opšte pravilo. |
| 9010 | Očuvano | 25 t. 30; 32 st. 2: Ograničenje 40 uz prikazanu tablu 200 m bez strelica označava udaljenost do početka naredbe. To nije opšta formula za svaku dopunsku tablu sa bilo kojim brojem. |
| 9011 | Očuvano | 25 t. 30; 32 st. 3: Prikazana tabla 200 m sa strelicama označava dužinu važenja od znaka. Ključ i objašnjenja su saglasni. |
| 9017 | Ispravljeno | 25 tač. 7,9; 29: Uklonjeno pogrešno opšte pravilo da svaki zahtev ima plavu boju i opis opasnog tereta kao cisterne; zadržana razlika stvarnih simbola. |
| 9018 | Očuvano | 25 t. 12–14: Simbol motocikla obuhvata motocikle, teške tricikle i teške četvorocikle. Pamtilica teška/laka odnosi se na ove vrste, ne na sve vrste teških vozila. |
| 9019 | Ispravljeno | 25 tač. 12–14: Moped nije definisan kao bicikl sa motorom; poređenje sa znakom bicikla sada uključuje laka električna vozila. |
| 9022 | Očuvano | 25 t. 19: Saglasno: sva motorna i zaprežna, ne sva vozila niti dozvola samo nacrtanim vrstama. |
| 9023 | Ispravljeno | 25 tač. 14; 26 tač. 40: Ključ ostaje tačan za bicikle, ali opis nije potpuno današnje značenje znaka: odredba uključuje i laka električna vozila. |
| 9024 | Očuvano | 25 t. 5,18: Saglasno: II-18 obuhvata sva motorna. Poređenje s izuzecima II-5 odgovara definiciji. |
| 9025 | Očuvano | 25 t. 20; 27: Kote levo/desno i broj 2 m označavaju širinu. Nisu ni ukupna dužina ni visina. |
| 9027 | Očuvano | 25 t. 21; 27: Kote gore/dole i broj 4 m označavaju ukupnu visinu, uključujući teret. Ključ i poređenje sa širinom su saglasni. |
| 9033 | Ispravljeno | 25 tač. 8,9; 29: Prikaz opasnog tereta nije cisterna; čuva se stvarno poređenje sa praskom i linijama vode. |
| 9034 | Ispravljeno | 25 tač. 7,9; 29: Stvarna slika i propisana konstrukcija simbola ne podržavaju prethodni opis cisterne sa naglašenim rezervoarom. |
| 9037 | Ispravljeno | 25 tač. 11,18; 26: Uklonjen izmišljeni plavi znak za obavezno kretanje traktora i netačna tvrdnja da crvena boja nikada ne naređuje obavezu. |
| 9038 | Ispravljeno | 25 tač. 15,19: Uklonjena izmišljena posebna zabrana za domaće životinje; poređenje čuva sva tri stvarna simbola na slici 9022. |
| 9040 | Očuvano | 25 t. 17; 26 t. 41: Saglasno. Slika je zabrana pešacima; plavi pešak označava pešačku stazu, trougao upozorenje. |
| 9042 | Očuvano | 25 t.24;27: Saglasno; ukupna dužina vozila ili skupa, ne samo kamiona. |
| 9044 | Očuvano | 25 t.23;27: Saglasno; osovinsko opterećenje, ne ukupna masa. |
| 9045 | Očuvano | 25 t.22;27: Broj 7 t označava ukupnu masu vozila ili skupa. Ključ i byQ su saglasni; opis u tabeli kartice mora ukloniti nepostojeću siluetu vozila. |
| 9053 | Ispravljeno | 26 tač. 43,44; 35 tač. 2,18: Ispravno poređenje se ograničava na jednosmerni put; postoje kružni znakovi obaveštenja o prestanku staza. |
| 9058 | Očuvano | 26 t.43;33 t.4: Saglasno: obavezan smer desno, ne krivina niti jednosmerni put. |
| 9061 | Očuvano | 25 t.34–35: Saglasno: strana puta, obe zabrane. |
| 9062 | Očuvano | 25 t.35; 7 definicije zaustavljanja/parkiranja: Ovaj znak zabranjuje parkiranje. Napomena da samo kratko zaustavljanje nije njime zabranjeno ne ukida ostale zakonske zabrane zaustavljanja; to nije razlog za needs-expert. |
| 9066 | Očuvano | 26 t.43: Saglasno: pravo je obavezni smer; ne jednosmerni put. |
| 9068 | Ispravljeno | 26 tač. 45; 32 st. 2: Uklonjena univerzalna tvrdnja o mestu dejstva; član 32 dopušta i prethodno postavljanje sa tablom udaljenosti. |
| 9070 | Očuvano | 26 t.43: Saglasno: obavezan smer levo. |
| 9071 | Očuvano | 26 t.44–45: Saglasno: dozvoljeni smerovi pravo i levo; ne obilaženje sa obe strane. |
| 9072 | Očuvano | 26 t.43: Saglasno: obavezan smer levo, ne informacija o jednosmernom putu. |
| 9073 | Očuvano | 26 t.44–45: Saglasno: dozvoljeno pravo/desno. |
| 9675 | Očuvano | 26 t.44; 20,32,50: Naredba na slici ne dozvoljava levi/polukružni smer. Propuštanje drugih vozila i uslovna zelena strelica ne pretvaraju ga u dozvoljen smer. nocard: 1 ne gasi izričiti card link. |
| 9677 | Očuvano | 26 t.44; 20,32,50: Za prikazani primer ključ i objašnjenje su saglasni. Opšte obaveze bezbednog manevra i posebne zabrane polukružnog okretanja ostaju po ZOBS 32/50; ne dodaje se stručni status zbog nepostojećih dodatnih činjenica. Dodatna kartica skretanje nije cela ponovo pregledana u 032. |
| 9679 | Očuvano | 26 t.43; 20,32,50: Znak dozvoljava samo pravo; zeleno svetlo ne menja naredbu o smeru. Direktna veza ka kartici postoji uprkos nocard: 1. |
| 9762 | Ispravljeno u v182 | 25 t.28;32: Ključ zabrane preticanja je saglasan; prethodni byQ nepotpuno opisuje izuzetke i opseg već započetog preticanja. Ispravka pripada 029 i nezavisno je pregledana u 030; ovde nije duplirana. Dodatna cela kartica preticanje nije zatvorena pregledom 032. |
| 9813 | Ispravljeno u v182 | 25 t.28; 55: Ključ je saglasan: teretno vozilo nije izuzeto vozilo koje sme da se pretiče po II-28. Stari byQ treba da navede motocikl sa dva točka bez prikolice i moped. Ispravka je u 029/030, bez dupliranja u 032. |
| 9862 | Očuvano | 26 t.45;33: Saglasno: obilaženje desno. |
| 9865 | Očuvano | 26 t.45;33 t.5–6: Saglasno: oba prolaza pokazana različitim znakovima i čunjevima. |
| 10612 | Očuvano | 32 st.1–2: Saglasno opšte pravilo uz već navedenu najavu dopunskom tablom. |
| 10841 | Ispravljeno | 32 st. 1,2: Prethodna apsolutna zabrana prethodnog postavljanja direktno je suprotna članu 32 stav 2. |
| 10842 | Očuvano | 25 t.2;28: Saglasno: stvarno zaustavljanje pa ustupanje prvenstva, ne samo usporavanje. |
| 10843 | Očuvano | 25 t.3: Saglasno: zabrana svim vozilima oba smera. |
| 10844 | Očuvano | 25 t.1;28: Ustupanje prvenstva, uz zaustavljanje kada je potrebno, nije uvek obavezno zaustavljanje. Ključ i oba objašnjenja su saglasni. |
| 10845 | Očuvano | 25 t.4: Zabrana važi iz smera prema kome je okrenuto lice znaka. Objašnjenje se čita kao opis dejstva tog znaka, ne kao potvrda da u suprotnom smeru nema drugih zabrana; ključ ostaje saglasan. |
| 10846 | Očuvano | 25 t.5: Saglasno uz propisane izuzetke; oba mamca pogrešno izuzimaju automobil. |
| 10847 | Očuvano | 25 t.6: Saglasno: zabrana autobusima, ne oznaka stajališta. |
| 10848 | Ispravljeno | 25 tač. 28,29; 29: Razjašnjeno na koga se odnosi izuzetak i ispravljen stvarni izgled susednog znaka zabrane preticanja za teretna vozila. |
| 10849 | Ispravljeno | 25 tač. 26,27: Opis oblika slova U mora sačuvati latinično U; ćirilično У nema oblik nacrtane polukružne strelice. |
| 10850 | Očuvano | 25 t.27,33: Saglasno: polukružna strelica, ne levi ugao niti suženi prolaz. |
| 10851 | Ispravljeno | 25 tač. 26,27: Opis oblika slova U mora sačuvati latinično U; ćirilično У nema oblik nacrtane polukružne strelice. |
| 10852 | Očuvano | 25 t.30;26 t.38;35 t.70: Saglasno: gornja granica 40, ne minimum niti preporuka. |
| 10853 | Očuvano | 25 t.32;35 t.68: Saglasno: zaustavljanje zbog policije, ne blizina stanice. |
| 10854 | Očuvano | 25 t.33;29 st.3 t.5;35 t.1: Saglasno: propustiti suprotan smer na suženju. |
| 10855 | Očuvano | 25 t.8;29 st.3 t.2: Simbol sa dve plave linije označava zabranu za vozila koja prevoze određenu količinu materija koje mogu zagaditi vodu. Izričiti količinski uslov postoji u ključu i izvoru; dopunjen je u predlogu kartice. |
| 10856 | Ispravljeno | 25 tač. 10; slika II-10/II-10.1: Na slici nisu pouzdano prikazane dve osovine prikolice; pravni izuzeci ostaju oba. Zvanična slika para II-10/II-10.1 neposredno je pregledana. |
| 10857 | Ispravljeno | 25 tač. 16,17; 26: Neutralan tačan opis stvarne slike; uklonjen izmišljeni plavi znak za ručna kolica i pravilo da crvena nikada ne nalaže obavezu. |
| 10858 | Ispravljeno | 25 tač. 36,37: Rimske oznake I i II sa znaka ne menjaju se u ćirilična slova И/ИИ. |
| 10859 | Očuvano | 25 t.25;27; 7 razmak: Dva vozila i 100 m označavaju najmanje uzdužno odstojanje vozila u kretanju, a ne bočno rastojanje ili najveće odstojanje. |
| 10860 | Očuvano | 25 t.32;35 t.107–108: Saglasno: zaustavljanje zbog putarine, ne najava niti elektronska traka. |
| 10861 | Ispravljeno | 25 tač. 28,29: Potpun izuzetak pri poređenju sa znakom za sva motorna vozila mora sadržati uslov bez prikolice. |
| 10862 | Očuvano | 25 t.31;35 t.16: Zabrana zvučnih znakova ima izuzetak neposredne opasnosti. Postoji znak III-16 za prestanak ove zabrane po članu 35 tačka 16; poređenje u byQ nije izmišljeno. |
| 10863 | Ispravljeno | 25 tač. 36,37: Rimske oznake I i II sa znaka ne menjaju se u ćirilična slova И/ИИ. |
| 10867 | Očuvano | 26 t.39: Saglasno: navedeni izuzeci i uslov snega; zimske gume nisu ponuđena zamena za ovu naredbu. |
| 10869 | Očuvano | 26 t.42;18 znaciopasnosti životinje: Saglasno: jahači i vodiči životinja za jahanje; ne opasnost divljači/domaćih životinja. |
| 10871 | Očuvano | 26 t.41;35 t.7: Saglasno: posebno izgrađena pešačka staza, ne prelaz/najava. |
| 10872 | Očuvano | 26 t.45: Saglasno: obavezno obilaženje levo, ne jednosmerni put/podzemni prolaz. |
| 10873 | Ispravljeno | 26 tač. 45; 35 tač. 2,9: Ne prenosi se znak za pešački podzemni/nadzemni prolaz na nepostojeće značenje podzemnog prolaza za vozila. |
| 10874 | Očuvano | 25 t.1–2;28;18: Na zajedničkoj slici broj 2 je STOP, odnosno obavezno zaustavljanje. Ostali prikazani znakovi nisu taj zahtev. |
| 10875 | Očuvano | 25 t.1–2;28;18: Na zajedničkoj slici broj 1 je ustupanje prvenstva; ono ne znači obavezno zaustavljanje u svakoj prilici. |
| 10876 | Očuvano | 26 t.38;25 t.30;35 t.70: Saglasno: minimalna 40, ne maksimum/preporuka. |
| 10877 | Očuvano | 26 t.45: Saglasno: obilaženje sa obe strane; postoji izbor. |
| 10878 | Očuvano | 26 t.46: Saglasno: obavezno polukružno, ne zabrana niti najava krivine. |
| 10879 | Očuvano | 26 t.47;28 st.2 t.3;29 st.3 t.8: Saglasno: obavezan smer za opasan teret; jedini pravougaoni oblik u ovoj porodici. |
| 11068 | Ispravljeno | 25 tač. 10; slika II-10/II-10.1: Potpuni izuzeci susednog znaka II-10; važeći ključ za prikazani II-10.1 nema izuzetak. |
