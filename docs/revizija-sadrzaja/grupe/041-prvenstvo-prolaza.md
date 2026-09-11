# A6-041 — prvenstvo prolaza i posebna vozila

Datum: 2026-09-11. Verzija: v191. Dva potpuna pregleda **107 pitanja /319 opcija /66 originalnih JPEG**, sva objašnjenja oba pisma, cela L/C kartica sa9 postojećih SVG i66 situacija. Prvi pregled041 i nezavisni završni046 čuvaju precizne predloge i dokaze.

## Ispravke

Primena38 byQ ispravki zadržava ključeve, opcije/redosled, bodove i originalne slike. Precizirani su odnos znakova i oznaka, preostala pravila među istovremeno propuštenim vozilima, uslovi tramvajskog prvenstva i posebnih vozila, status pokazivača pravca i tačan obuhvat izuzetaka. Dve ranije zajedničke rečenice o ugradnji razdvojene su po pitanjima10571/10586, jer nisu isti zakonski krug vozila. Uklonjen je netačan bezuslovni zaključak ugradnja→isključenje; nije dodata nova procedura u objašnjenje koje je ne pita.

Kartica zadržava strukturu i svih9 dijagrama, uz14 preciznih sadržinskih fragmenata,8 nedostajućih pristupačnih imena i8 lokalnih vizuelnih dorada. Putanje i položaji vozila ostaju isti; jedan potez ima podvučenu istovetnu konturu radi kontrasta na dve podloge. Nazivi su prevedeni kroz postojeću ARIA petlju, uz mali lokalni guard za ćirilični naslov Б. Nema duplirane cele C kartice, novih crteža, biblioteka, globalnog CSS-a ili promene app.js/simulacije.

Pitanja9531 i9539 dobijaju nocard samo za nerelevantnu implicitnu karticu prvenstva; njihove eksplicitne veze ostaju.9531 je sada zatvoreno posle v190;9539 čeka potpun pregled kartice o pešacima/biciklima.

## Dve nerazrešene nedoumice

**9984:** motocikl i tramvaj nalaze se na istom putu sa prvenstvom, a tramvaj skreće ulevo. Sačuvani ključ31806 traži propuštanje tramvaja, naspram doslovnog pravila47(6). Objašnjenje ovo izričito odvaja i ne uči da tramvaj uvek ima prvenstvo. Sporni tabelarni primer uklonjen je iz pravila kartice; galerija zadržava već postojeću jasnu poruku da prikazuje odgovore iz sačuvane baze. Ključ nije samovoljno promenjen.

**10586:** izraz samo vozila nadležnih državnih organa u označenoj opciji ne opisuje precizno krug108(1),(2),(5), koji uključuje hitnu medicinsku pomoć i vatrogasnu službu. Ovo je terminološka nedoumica, ne zaključak da je neka druga ponuđena opcija potpuno tačna. Nova EX poruka jasno navodi granicu.

Četiri prvobitno otvorena nalaza10345/10371/10582/10584 razrešena su drugim čitanjem celih odredaba i konkretnih pitanja. Zabrana preticanja preko neisprekidane linije u suprotnu traku jeste zabrana55(3)(15), obuhvaćena izuzetkom106/108(7) uz bezbednost; to ne ukida sve oznake ili pravila. Opšte pitanje o svetlu i sireni i delimično tačna ponuđena izjava nisu automatski pogrešni zbog posebnog izuzetka. Stvarni konačni EX10569 već pravilno odvaja uslove106/108 i ostaje nepromenjen, iako ranija nadjačana konstanta u generatoru ima stariji tekst.

## Provere i izvori

- [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311): Celi čl.20,21,23,47,48,55,106–111; relevantni32 i289(8): hijerarhija, posebna vozila i izuzeci. [Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1): Čl.25(1–2),26(43–45),35(3),63,66: znakovi i oznake koje uređuju konkretne prikazane odnose. Sveži javni odgovori11.09.2026 imaju navedene identične hashove u evidenciji izvora.
- Prvi i drugi recenzent pojedinačno pročitali svih107 pitanja/319 opcija L/C i otvorili svih66 originalnih JPEG. Root pročitao svih38 konačnih parova EX, celu L/C karticu, pregledao9 L kandidatskih i9 integrisanih C crteža; zasebno ponovljeni puni47/106–108, original9984 i pune opcije9984/10571/10586. Ranije pročitane odlučujuće55/20 ostaju osnov.
- Integrisani Chromium16/16 kartica,320/1280,oba pisma/teme,100/200% osnovnog fonta;428/428 prikaza pitanja. Svih66 galerijskih odgovora/ARIA/redosleda i9SVG naziva odgovara odobrenom izlazu. Bez prelivanja stranice, pageerrors ili upisa sintetičkog napretka. Tabele mogu zadržati lokalno horizontalno pomeranje uz veoma uvećan tekst.
- Nezavisni kandidat:8 konteksta/72SVG, min stvarni tekst13,780px, tekstualni kontrast≥4,759:1, proverene bitne grafičke granice≥3,146:1. Root integracija potvrđuje isti minimum fonta i granice natpisa. Ovo su ograničena merenja, ne potpuna WCAG potvrda ili test fizičkog telefona.
- Peer proverio10 stvarnih tokova odgovaranja i dve otvorene galerijske poruke porekla. Root potvrdio generator kroz41 tačnu operaciju, četiri NUL bajta, sve ostale EX podatke nepromenjene i potpuno poklapanje konačne kartice sa pregledanim kandidatom. Očuvani su ostali generator override-i.
- node tools/verify.mjs ima zaseban rezultat u ignored046/root-verify-v191.log; ne predstavlja pravnu reviziju ni pokretanje posebne scoring skripte.

## Pojedinačni nalazi

| ID | Ishod | Osnov i nalaz |
|---:|---|---|
|9502|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/6–8: Preširoka završna rečenica pogrešno tvrdi da se pravila ne primenjuju čim postoji semafor ili znak; čl. 47 st. 6–8 zadržava desnu stranu i levo skretanje među istovremeno propuštenim učesnicima.|
|9504|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/6–8: Isti apsolut o prestanku pravila uz semafor; zaključak konkretnog pitanja ostaje crveno svetlo.|
|9505|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; SIGNALIZACIJA:66: Oznaka uređuje traženo postupanje, ali objašnjenje nepotrebno tvrdi da pravila dolaze tek kada nema nijedne oznake.|
|9509|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9510|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; SIGNALIZACIJA:26/44: Na originalu su dva dozvoljena smera, ne znak obaveznog smera.|
|9511|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: „Uvek gledaj znak” van neposrednog sukoba znak–oznaka zanemaruje semafor i ovlašćeno lice.|
|9512|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/6; SIGNALIZACIJA:25: „Pravilo desne strane pada čim se pojavi znak” je netačno kao opšti iskaz; znak uređuje ovaj odnos, a čl. 47 st. 6 čuva pravila unutar iste grupe puteva.|
|9513|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9514|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9517|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9518|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/7: Završna rečenica pogrešno predstavlja sva pravila kao ugašena na semaforu.|
|9519|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9521|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: Oznake nisu poslednje u hijerarhiji: ispod njih su pravila.|
|9523|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9524|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/8: Policajac je najviši nalog, ali pravila ne nestaju: čl. 47 st. 8 ih izričito zadržava među učesnicima kojima je prolaz istovremeno dozvoljen.|
|9526|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/8: „Isključivo” i „tek kada niko i ništa ne reguliše” zanemaruju čl. 47 st. 8.|
|9528|Uska EX ispravka|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66; ZOBS:47/8: Opšte pravilo nije ograničeno samo na potpuno neregulisanu raskrsnicu; konkretan zaključak o policajcu i liniji ostaje isti.|
|9530|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|9531|Očuvano|ZOBS:21: null Suvišna implicitna veza uklonjena; zamke-odgovori već pregledana.|
|9539|Čeka drugu karticu|ZOBS:23: null Suvišna implicitna veza uklonjena; cela pesaci-bicikli ostaje otvorena.|
|9955|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9959|Uska EX ispravka|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/3–4: Izbrisati nepreciznu opštu rang-listu; leva putanja ne gubi prvenstvo prema svakom drugom vozilu. Tačno pravilo iz prve rečenice ostaje.|
|9965|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9967|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9971|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9973|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: Spelling/spacing only; preserve choice ID, correctness, order and every other data value. Apply paired to the sanitized source and generated runtime without rebuilding unrelated choice order.|
|9974|Uska EX ispravka|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/5–8: Mnemotehnika o teškom zaustavljanju šinskog vozila nije pravni razlog, a objašnjenje mora ograničiti pravilo na raskrsnicu bez drugačije regulacije i navesti biciklistički izuzetak.|
|9984|needs-expert|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/5–6: Slika: motocikl i tramvaj na istom putu sa prvenstvom; tramvaj skreće ulevo. Ključ31806 traži propuštanje tramvaja, naspram doslovnog čl.47(6). Nema promene ključa bez razrešenja izvornog pitanja.|
|9987|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9991|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9995|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9996|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|9998|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10000|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10004|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10005|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10341|Očuvano|ZOBS:106–111: null|
|10343|Očuvano|ZOBS:106–111: null|
|10344|Očuvano|ZOBS:106–111: null|
|10345|Uska EX ispravka|ZOBS:106–111; SIGNALIZACIJA:63; ZOBS:55/3/15; ZOBS:106/7: Valid key: overtaking prohibition55(3)(15) falls within106(7); all-signal/all-rule exemption removed from EX. Izuzeće zahvata konkretnu zabranu preticanja, ne sva pravila ili sve oznake.|
|10346|Uska EX ispravka|ZOBS:106–111; ZOBS:106/7: Član 106(7) izuzima propuštanje, ne sva pravila o prelazima. Ostatak već čuva bezbednost pešaka.|
|10347|Uska EX ispravka|ZOBS:106–111; ZOBS:106/1–3; ZOBS:23: Objašnjenje pogrešno predstavlja istovremeno davanje svetla i sirene kao jedini put do posebnog statusa, iako čl. 106 st. 3 dopušta samo svetla; na slici su sva svetla ugašena, pa ključ ostaje isti.|
|10350|Očuvano|ZOBS:106–111; SIGNALIZACIJA:25,35,66: null|
|10352|Očuvano|ZOBS:106–111; SIGNALIZACIJA:25,35,66: null|
|10353|Očuvano|ZOBS:106–111: null|
|10354|Uska EX ispravka|ZOBS:106–111; ZOBS:108/1–4: Fotografija ne može dokazati zvučni znak, a čl. 108 st. 4 dopušta samo plavo svetlo pod propisanim uslovima.|
|10363|Očuvano|ZOBS:106–111; ZOBS:20: null|
|10365|Uska EX ispravka|ZOBS:106–111; ZOBS:20; ZOBS:108/7; ZOBS:109/5: Ne oslobađati ga svih propisa o prvenstvu; crveno/policajac i međusobni odnos posebnih vozila ostaju uređeni.|
|10366|Očuvano|ZOBS:106–111; ZOBS:20: null|
|10369|Očuvano|ZOBS:106–111: null|
|10370|Uska EX ispravka|ZOBS:106–111; ZOBS:108/1–4: Tvrdnja da izuzeće nastaje samo uz istovremene svetlosne i zvučne znake previđa čl. 108 st. 4; ugašeno plavo svetlo ipak dovoljno rešava konkretnu sliku.|
|10371|Uska EX ispravka|ZOBS:106–111; SIGNALIZACIJA:63; ZOBS:55/3/15; ZOBS:108/7: Valid key: overtaking prohibition55(3)(15) falls within108(7); all-marking exemption removed from EX. Izuzeće konkretne zabrane ne znači izuzeće od svih oznaka na kolovozu.|
|10372|Uska EX ispravka|ZOBS:106–111; SIGNALIZACIJA:63; ZOBS:108/1–4: Ista preširoka tvrdnja o obaveznom paru svetlo+sirena; za zaključak je dovoljno da plavo svetlo nije uključeno.|
|10373|Očuvano|ZOBS:106–111: null|
|10374|Očuvano|ZOBS:106–111: null|
|10375|Očuvano|ZOBS:106–111: null|
|10376|Očuvano|ZOBS:106–111: null|
|10378|Očuvano|ZOBS:106–111; SIGNALIZACIJA:25,35,66: null|
|10379|Očuvano|ZOBS:106–111: null|
|10380|Očuvano|ZOBS:106–111: null|
|10381|Očuvano|ZOBS:106–111: null|
|10382|Očuvano|ZOBS:106–111: null|
|10383|Očuvano|ZOBS:106–111: null|
|10384|Očuvano|ZOBS:106–111: null|
|10385|Očuvano|ZOBS:106–111: null|
|10434|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|10435|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|10436|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|10437|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|10438|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|10439|Očuvano|ZOBS:20; ZOBS:47; SIGNALIZACIJA:25,35,66: null|
|10459|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10497|Uska EX ispravka|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/2: Zakon i tačna opcija govore o svim vozilima koja se kreću stazom/trakom, ne samo o biciklima.|
|10498|Uska EX ispravka|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/2: Zakon i tačna opcija govore o svim vozilima koja se kreću stazom/trakom, ne samo o biciklima.|
|10566|Uska EX ispravka|ZOBS:106–111; ZOBS:106/1–3; ZOBS:108/1–4: Izbeći univerzalni zahtev sirene i tvrdnju o svim praćenim vozilima; konkretna slika rešava se ugašenim svetlima.|
|10567|Uska EX ispravka|ZOBS:106–111; ZOBS:106/1–4: Opšti ključ je valjan; potrebno ograničiti apsolut u EX i objasniti konkretne netačne opcije.|
|10568|Očuvano|ZOBS:106–111: null|
|10569|Očuvano|ZOBS:106–111: null|
|10571|Uska EX ispravka|ZOBS:106–111; ZOBS:106/1/5; ZOBS:289/8: Ukloniti pogrešan bezuslovni zaključak o isključenju, potvrđen i u045; fokus je na dozvoljenoj ugradnji.|
|10572|Očuvano|ZOBS:106–111: null|
|10573|Uska EX ispravka|ZOBS:106–111; ZOBS:20; ZOBS:106/7: Poslednja tvrdnja o obavezi prema pešacima direktno protivreči izuzeću u čl. 106 st. 7.|
|10574|Uska EX ispravka|ZOBS:106–111; ZOBS:20; ZOBS:106/7: Konkretno crveno, a ne samo postojanje semafora, aktivira izuzetak iz 106(7).|
|10575|Očuvano|ZOBS:106–111; ZOBS:20: null|
|10576|Uska EX ispravka|ZOBS:106–111; ZOBS:20; ZOBS:106/7: Posebno prvenstvo ne oslobađa od svih znakova. Sačuvati odnos prikazanog STOP-a i romba bez univerzalne tvrdnje.|
|10577|Očuvano|ZOBS:106–111; ZOBS:20: null|
|10578|Očuvano|ZOBS:106–111: null|
|10579|Očuvano|ZOBS:106–111: null|
|10580|Očuvano|ZOBS:106–111: null|
|10581|Uska EX ispravka|ZOBS:106–111; ZOBS:106/1–3; ZOBS:108/1–4: Završna rečenica zahteva i svetlo i sirenu bez izuzetka, iako čl. 106/108 dopuštaju samo svetlosne znake pod propisanim uslovima.|
|10582|Uska EX ispravka|ZOBS:106–111; ZOBS:108/1–4: General rule versus incorrect headlight-flashing alternatives; exception108(4) does not invalidate the general question. Opšti režim je ispitivan naspram pogrešnog blicanja; bez needs-expert samo zbog posebno propisanog izuzetka.|
|10583|Uska EX ispravka|ZOBS:106–111; ZOBS:106/2; ZOBS:108/3; ZOBS:111: Opis žutih svetala nepotrebno ih ograničava samo na radove ili pomoć na putu; čl. 111 obuhvata i druge propisane slučajeve.|
|10584|Očuvano|ZOBS:106–111: Selected option is a partial accurate statement versus always-siren/sound-only alternatives. Existing explanation supplies the omitted service-task condition; keep EX unchanged.|
|10585|Očuvano|ZOBS:106–111: null|
|10586|needs-expert|ZOBS:106–111; ZOBS:108/1/2/5; ZOBS:289/8: Terminološki osnov: isključivo vozila državnih organa u opciji33631 nije doslovan krug108(1),(2),(5), koji uključuje HMP/vatrogasnu službu. Ne nudi se druga potpuno tačna opcija. Potrebno razjašnjenje formulacije; ne dokazivati hipotetičnim privatnim servisom.|
|10587|Uska EX ispravka|ZOBS:106–111; ZOBS:108/6: Hitnost je izričit uslov upotrebe, već prisutan u tačnoj opciji.|
|10588|Uska EX ispravka|ZOBS:106–111; ZOBS:20; ZOBS:108/7: Završetak briše zakonski uslov „kada im je tim znakom zabranjen prolaz” i zato je širi od čl. 108 st. 7.|
|10589|Očuvano|ZOBS:106–111; ZOBS:20: null|
|10590|Očuvano|ZOBS:106–111: null|
|10591|Očuvano|ZOBS:106–111: null|
|10616|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10618|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10620|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10622|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10624|Uska EX ispravka|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/5: Ograničiti tvrdnju na prikazanu neregulisanu raskrsnicu; ostali razlozi ostaju.|
|10626|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10628|Očuvano|ZOBS:47; SIGNALIZACIJA:25,35: null|
|10630|Uska EX ispravka|ZOBS:47; SIGNALIZACIJA:25,35; ZOBS:47/5: Ograničiti opštu tvrdnju na prikazan slučaj; sačuvati valjan ključ.|
