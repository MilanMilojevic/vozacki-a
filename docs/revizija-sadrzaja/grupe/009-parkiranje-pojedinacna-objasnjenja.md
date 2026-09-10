# Grupa 009 — 17 preciznijih objašnjenja parkiranja

Datum: 2026-09-10. Predlog: Codex /root/learning_visual_second_review; dorada i integracija: /root. Konačne tekstove na oba pisma nezavisno proverio /root/a0_sanitize. Osnova je v160/89e92d4; paket pripada v161. Nema instruktorske potvrde ni novog poređenja sa sirovim MUP portalom.

Menja se samo `byQ.x` uz **17 pitanja**. Svih 39 kartica, uključujući upravo pregledanu karticu parkiranja, drugih 1.310 objašnjenja, veze, zvanična pitanja/opcije/tačni ključevi/bodovi i slike ostaju nepromenjeni. Uklonjena je neupotrebljena zajednička konstanta `park5`: pitanja sada imaju objašnjenje baš svoje površine i primenljivog izuzetka.

## Granice i razlozi izmena

Ispravljena su netačna uopštavanja i razlozi: znak potreban za sredinu kolovoza, jednosmerni izuzeci za pojedine prelaze/raskrsnice, taksi, trotoar naspram staze, stvarno značenje II-3/II-41.1, upozoravanje pri kvaru na šinama i sprečavanje samopokretanja. Dodatna provera pre završetka uklonila je i apsolutnu tvrdnju iz 10507, istog tipa kao prethodno uklonjena tvrdnja u kartici. Sama glavna tačnost odgovora nije menjana.

Kod 10101 taksi izuzetak je vezan za ulazak/izlazak putnika. Kod 10111 uslov 1,60 m vezan je za parkirano vozilo. Kod 10118 službeni naziv/definicija znaka uključuje laka električna vozila, a razlog zabrane odnosi se konkretno na automobil. Opšte korisno objašnjenje ne zamenjuje uslove iz konkretnog pitanja.

Primarni izvori su dve uske [PIS reference grupe 008](008-zaustavljanje-i-parkiranje-kartica.md): ZOBS čl. 7 i 62–68 kroz 19/2025, signalizacija čl. 25/26/67 kroz 76/2026. Pregledana su sva 27 pitanja i odgovori na oba pisma, kao i svih šest originalnih slika. Deset preostalih objašnjenja je ponovo pročitano i zadržano. Pitanje 10061 dodatno zahteva celokupan pregled kartice `oznake-kolovoz`.

## Konačni novi tekstovi

### 10060

Tačni ID-jevi: 32020; req=1, 2 boda.

**Latinica:** Na sredini kolovoza smeš da staneš ili parkiraš samo na mestu koje je saobraćajnim znakom obeleženo za parkiranje. Sam slobodan prostor nije dovoljan (ZOBS čl. 64 st. 4).

**Ćirilica:** На средини коловоза смеш да станеш или паркираш само на месту које је саобраћајним знаком обележено за паркирање. Сам слободан простор није довољан (ЗОБС чл. 64 ст. 4).

### 10065

Tačni ID-jevi: 32034; req=1, 2 boda.

**Latinica:** Zabranjeno je zaustavljanje i parkiranje na pešačkom prelazu i na manje od 5 m od njega. U jednosmernoj ulici izuzetak dopušta i manje od 5 m posle prelaza, gledano u dozvoljenom smeru (ZOBS čl. 66 st. 1 t. 1 i st. 2).

**Ćirilica:** Забрањено је заустављање и паркирање на пешачком прелазу и на мање од 5 m од њега. У једносмерној улици изузетак допушта и мање од 5 m после прелаза, гледано у дозвољеном смеру (ЗОБС чл. 66 ст. 1 т. 1 и ст. 2).

### 10066

Tačni ID-jevi: 32038; req=1, 2 boda.

**Latinica:** Zabranjeno je zaustavljanje i parkiranje na prelazu biciklističke staze preko kolovoza i na manje od 5 m od njega. U jednosmernoj ulici izuzetak dopušta i manje od 5 m posle prelaza, gledano u dozvoljenom smeru (ZOBS čl. 66 st. 1 t. 1 i st. 2).

**Ćirilica:** Забрањено је заустављање и паркирање на прелазу бициклистичке стазе преко коловоза и на мање од 5 m од њега. У једносмерној улици изузетак допушта и мање од 5 m после прелаза, гледано у дозвољеном смеру (ЗОБС чл. 66 ст. 1 т. 1 и ст. 2).

### 10068

Tačni ID-jevi: 32043; req=1, 2 boda.

**Latinica:** Zabranjeno je zaustavljanje i parkiranje na prelazu puta preko železničke pruge i na manje od 5 m od prelaza (ZOBS čl. 66 st. 1 t. 2).

**Ćirilica:** Забрањено је заустављање и паркирање на прелазу пута преко железничке пруге и на мање од 5 m од прелаза (ЗОБС чл. 66 ст. 1 т. 2).

### 10071

Tačni ID-jevi: 32054; req=1, 2 boda.

**Latinica:** Zabranjeno je zaustavljanje i parkiranje na raskrsnici i na manje od 5 m od najbliže ivice poprečnog kolovoza. U jednosmernoj ulici izuzetak dopušta i manje od 5 m posle raskrsnice, gledano u dozvoljenom smeru (ZOBS čl. 66 st. 1 t. 3 i st. 2).

**Ćirilica:** Забрањено је заустављање и паркирање на раскрсници и на мање од 5 m од најближе ивице попречног коловоза. У једносмерној улици изузетак допушта и мање од 5 m после раскрснице, гледано у дозвољеном смеру (ЗОБС чл. 66 ст. 1 т. 3 и ст. 2).

### 10073

Tačni ID-jevi: 32061, 32058; req=2, 2 boda.

**Latinica:** Od ponuđenih mesta zabrana važi za tunel i podvožnjak (ZOBS čl. 66 st. 1 t. 4). Uspon ili put van naselja sami po sebi nisu razlog za zabranu; i tu važi obaveza da vozilo ne ugrožava ili ometa druge (čl. 62).

**Ćirilica:** Од понуђених места забрана важи за тунел и подвожњак (ЗОБС чл. 66 ст. 1 т. 4). Успон или пут ван насеља сами по себи нису разлог за забрану; и ту важи обавеза да возило не угрожава или омета друге (чл. 62).

### 10091

Tačni ID-jevi: 32111; req=1, 2 boda.

**Latinica:** Vozilo bi stalo na biciklističkoj traci, desno od pune bele linije. Na njoj je zabranjeno zaustavljanje; izuzetak za auto-taksi ne obuhvata biciklističku traku (ZOBS čl. 66 st. 1 t. 8 i st. 4).

**Ćirilica:** Возило би стало на бициклистичкој траци, десно од пуне беле линије. На њој је забрањено заустављање; изузетак за ауто-такси не обухвата бициклистичку траку (ЗОБС чл. 66 ст. 1 т. 8 и ст. 4).

### 10092

Tačni ID-jevi: 32114; req=1, 2 boda.

**Latinica:** Parkiranje na biciklističkoj traci prikazanoj na slici nije dozvoljeno, ni auto-taksi vozilima (ZOBS čl. 66 st. 1 t. 8 i st. 4).

**Ćirilica:** Паркирање на бициклистичкој траци приказаној на слици није дозвољено, ни ауто-такси возилима (ЗОБС чл. 66 ст. 1 т. 8 и ст. 4).

### 10101

Tačni ID-jevi: 32139; req=1, 2 boda.

**Latinica:** Na putu sa fizički odvojenim kolovoznim trakama zaustavljanje i parkiranje su zabranjeni, osim ako je to dozvoljeno saobraćajnim znakom. Auto-taksi može da stane radi ulaska ili izlaska putnika (ZOBS čl. 66 st. 1 t. 10 i st. 4).

**Ćirilica:** На путу са физички одвојеним коловозним тракама заустављање и паркирање су забрањени, осим ако је то дозвољено саобраћајним знаком. Ауто-такси може да стане ради уласка или изласка путника (ЗОБС чл. 66 ст. 1 т. 10 и ст. 4).

### 10111

Tačni ID-jevi: 32170; req=1, 2 boda.

**Latinica:** Na trotoaru zaustavljanje i parkiranje nisu dozvoljeni, osim ako ih dopušta saobraćajna signalizacija. Kada je vozilo parkirano, mora ostati slobodan prolaz za pešake najmanje 1,60 m, koji nije uz ivicu kolovoza (ZOBS čl. 66 st. 1 t. 13).

**Ćirilica:** На тротоару заустављање и паркирање нису дозвољени, осим ако их допушта саобраћајна сигнализација. Када је возило паркирано, мора остати слободан пролаз за пешаке најмање 1,60 m, који није уз ивицу коловоза (ЗОБС чл. 66 ст. 1 т. 13).

### 10117

Tačni ID-jevi: 32188; req=1, 2 boda.

**Latinica:** Na pešačkoj stazi zabranjeni su zaustavljanje i parkiranje (ZOBS čl. 66 st. 1 t. 14). Uslov o prolazu od 1,60 m pripada izuzetku za trotoar i ne dopušta stajanje na pešačkoj stazi.

**Ćirilica:** На пешачкој стази забрањени су заустављање и паркирање (ЗОБС чл. 66 ст. 1 т. 14). Услов о пролазу од 1,60 m припада изузетку за тротоар и не допушта стајање на пешачкој стази.

### 10118

Tačni ID-jevi: 32190; req=1, 2 boda.

**Latinica:** Plavi znak „staza rezervisana za bicikliste i pešake” označava odvojene delove za kretanje pešaka, biciklista i vozača lakih električnih vozila. Srebrni automobil stoji na toj stazi, gde zaustavljanje nije dozvoljeno. Prolaz od 1,60 m odnosi se na izuzetak za parkiranje na trotoaru i ne dopušta zaustavljanje automobila na stazi.

**Ćirilica:** Плави знак „стаза резервисана за бициклисте и пешаке” означава одвојене делове за кретање пешака, бициклиста и возача лаких електричних возила. Сребрни аутомобил стоји на тој стази, где заустављање није дозвољено. Пролаз од 1,60 m односи се на изузетак за паркирање на тротоару и не допушта заустављање аутомобила на стази.

### 10120

Tačni ID-jevi: 32197; req=1, 2 boda.

**Latinica:** Na delu trotoara namenjenom kretanju lica sa posebnim potrebama zabranjeni su zaustavljanje i parkiranje (ZOBS čl. 66 st. 1 t. 14). Ostavljanje prolaza od 1,60 m ne dopušta zauzimanje tog dela trotoara.

**Ćirilica:** На делу тротоара намењеном кретању лица са посебним потребама забрањени су заустављање и паркирање (ЗОБС чл. 66 ст. 1 т. 14). Остављање пролаза од 1,60 m не допушта заузимање тог дела тротоара.

### 10142

Tačni ID-jevi: 32262; req=1, 2 boda.

**Latinica:** Na slici je znak zabrane saobraćaja za vozila u oba smera. Na tako označenoj površini zabranjeni su i zaustavljanje i parkiranje (ZOBS čl. 66 st. 1 t. 22).

**Ćirilica:** На слици је знак забране саобраћаја за возила у оба смера. На тако означеној површини забрањени су и заустављање и паркирање (ЗОБС чл. 66 ст. 1 т. 22).

### 10500

Tačni ID-jevi: 33360, 33358; req=2, 2 boda.

**Latinica:** Od ponuđenih odgovora zabrana se odnosi na blizinu vrha prevoja i nepreglednu krivinu (ZOBS čl. 66 st. 1 t. 5). Sam položaj na nizbrdici ili van naselja nije takva zabrana.

**Ćirilica:** Од понуђених одговора забрана се односи на близину врха превоја и непрегледну кривину (ЗОБС чл. 66 ст. 1 т. 5). Сам положај на низбрдици или ван насеља није таква забрана.

### 10507

Tačni ID-jevi: 33379; req=1, 2 boda.

**Latinica:** Trg, pešačka zona i protivpožarni put: nisu dozvoljeni ni zaustavljanje ni parkiranje (ZOBS čl. 66 st. 1 t. 15).

**Ćirilica:** Трг, пешачка зона и противпожарни пут: нису дозвољени ни заустављање ни паркирање (ЗОБС чл. 66 ст. 1 т. 15).

### 10528

Tačni ID-jevi: 33436; req=1, 2 boda.

**Latinica:** Pre napuštanja parkiranog vozila moraš preduzeti sve potrebne mere da se ono ne pokrene samo (ZOBS čl. 68).

**Ćirilica:** Пре напуштања паркираног возила мораш предузети све потребне мере да се оно не покрене само (ЗОБС чл. 68).

## Provera i preostali obuhvat

Generator SHA-256 `0d350d1422bd31d404686609bd101131b96df41cdef5abd5000d6516af59c1fb`; generisani izlaz `f7a70021601cb5c362a8b07352072170ee8bbb69cf7f78f5f4544d445aa57d68`. Tačna inverzija 17 zamena i vraćanje uklonjene konstante vraćaju ceo generatorski izvor v160. Četiri NUL bajta su očuvana; ponovljeno generisanje daje identičan izlaz. Parsiranje potvrđuje tačno 17 promenjenih `byQ.x` i potpuno očuvanje svih drugih javnih delova objašnjenja.

Root je ponovo izvršio browser matricu na konačnom izlazu: **16 prikaza kartice, 304 SVG provere, 216 tokova pitanja** (svih 27 × oba pisma × 320/1280 × obe teme). Provereni su celi prikazani tekstovi/opcije, nezavisni ključevi i metadata, slike, tačna potvrda i novo objašnjenje. `verify.mjs`: **246/246 Node + audit**. Testovi proveravaju regresije/prikaz; pravni i jezički pregled su zaseban ručni rad navedenih recenzenata.

Svih 27 pitanja ostaje **in-progress**: pitanje/opcije, originalna slika kada postoji, objašnjenje, relevantni izvori i pisma su pregledani, ali `cardLinks` čeka kompletan povezani sadržaj. Kartica parkiranja zadržava otvoren `image`: **kontrast je paket 010, veličina/prelom natpisa paket 011**. Pitanje 10061 čeka i `oznake-kolovoz`. Zbir: pitanja 15 reviewed / 29 in-progress / 1283 unreviewed; kartice 2 reviewed / 2 in-progress / 35 unreviewed.
