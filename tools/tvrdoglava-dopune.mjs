// DOPUNE uz pitanja na kojima se greška PONAVLJA (v145, 23.09.2026).
//
// Izvor: Milanov napredak od 15.09. — 59 pitanja pogrešenih dvaput ili više. Za svako je
// agent-dijagnostičar našao zamku i blizance, a NEZAVISAN agent-proverivač (podrazumevano
// „oboreno", otvarao slike, tražio kontraprimere po celoj bazi) potvrdio ili ispravio svaku
// tvrdnju: 59 od 59 stoji, u 49 je proverivač nešto ispravio. Pre upisa ponovo mereno:
// nijedan tekst nema ćirilicu ni iznose u dinarima, nijedan broj člana nije nov, svi
// blizanci postoje, svaka brojka iz „tema" zatvara se sa bazom.
//
// k  = ključ (≤ 2 rečenice) — stoji NA VRHU objašnjenja
// x  = zamena objašnjenja (samo gde staro nije činilo tačan odgovor sigurnim)
// bl = blizanci sa proverenom rečenicom razlike (tekst i tačan odgovor blizanca aplikacija
//      uzima iz data.js — ovde su samo broj i razlika)
//
// #10470 i #8305 su POSTOJEĆA objašnjenja koja su učila pogrešno ("ista lista kao za
// preticanje", "izuzeci samo na putu sa prvenstvom") — ispravljena posle provere nad bazom
// (#9673, #9795, #10480) i slikom #9850.
export const DOPUNE = {
 "7960": {
  "k": "Parkirana vozila nikad nisu kolona, ma koliko ih bilo u nizu. Vozila zaustavljena u saobraćaju (npr. na crvenom) jesu kolona ako su najmanje tri jedno iza drugog u istoj saobraćajnoj traci.",
  "bl": [
   {
    "id": 7961,
    "r": "U 7961 vozila su ZAUSTAVLJENA na crvenom i čekaju jedno na drugo, pa jesu kolona; ovde su PARKIRANA."
   }
  ]
 },
 "8005": {
  "k": "Motocikl ima dva ili tri ASIMETRIČNO raspoređena točka i najveću konstruktivnu brzinu koja PRELAZI 45 km/h (kod električnog pogona umesto brzine: trajnu snagu koja PRELAZI 4 kW). U pitanju o definiciji motocikla svaka ponuda sa „ne prelazi“ ili „najmanje dva točka“ je netačna.",
  "x": "Motocikl je vozilo sa dva ili tri točka ASIMETRIČNO raspoređena, čija najveća konstruktivna brzina PRELAZI 45 km/h. To su dva tačna uslova, a isti odgovor važi i kad pogon nije na benzin (8006). Ponude sa „ne prelazi“ (4 kW, 50 cm³) nisu uslovi za motocikl: vozilo od 45 cm³ ili 4 kW i dalje je motocikl čim mu brzina prelazi 45 km/h (8008, 8009). „Ima najmanje dva točka“ je uslov iz definicije bicikla (7990) i za motocikl je preširok. Kod električnog pogona umesto brzine stoji snaga koja PRELAZI 4 kW (8007, 8010), a tri SIMETRIČNA točka prave teški tricikl (8011).",
  "bl": [
   {
    "id": 8011,
    "r": "Tri točka SIMETRIČNO raspoređena prave teški tricikl, a dva ili tri ASIMETRIČNA prave motocikl."
   },
   {
    "id": 8007,
    "r": "Kod električnog pogona umesto brzine preko 45 km/h traži se trajna nominalna snaga PREKO 4 kW."
   }
  ]
 },
 "8063": {
  "k": "Ko se u roku ne podvrgne kontrolnom zdravstvenom pregledu na koji je upućen ostaje bez vozačke dozvole, jer mu je nadležni organ oduzima. Ni privremena zabrana ni prekršajni postupak nisu odgovor."
 },
 "8074": {
  "k": "Vozač kategorije A ne sme da ima nimalo alkohola; isto važi za svakog vozača motocikla i mopeda i za kandidata na praktičnoj obuci (8082, 8075). Brojevi 0,30 i 0,50 mg/ml u bazi nikad nisu dozvoljena granica za motociklistu."
 },
 "8077": {
  "k": "Da li je vozač toliko umoran, bolestan ili u takvom psihofizičkom stanju da ne može bezbedno da vozi utvrđuje se stručnim pregledom. Odgovarajuća sredstva (alkometar, droga test) služe za alkohol i psihoaktivne supstance.",
  "bl": [
   {
    "id": 8559,
    "r": "Kad se proverava ALKOHOL, vozač mora da omogući ispitivanje odgovarajućim sredstvima (alkometar); umor i bolest utvrđuje stručni pregled."
   }
  ]
 },
 "8088": {
  "k": "Po definiciji motoput mora da ispuni samo dva uslova: državni put isključivo za motocikle, putnička i teretna vozila i autobuse, obeležen propisanim znakom. Fizički odvojeni smerovi, dve trake plus zaustavna po smeru, potpuna kontrola pristupa i ukrštanja van nivoa su obavezni za autoput, a za motoput nisu (iako ih motoput može imati, npr. zaustavnu traku u 8246).",
  "bl": [
   {
    "id": 8085,
    "r": "Za AUTOPUT su tačne ponude o dve trake plus zaustavnoj i o fizički odvojenim smerovima, koje su za motoput netačne."
   },
   {
    "id": 8087,
    "r": "Autoput ima ista dva uslova kao motoput („isključivo za…“ i „obeležen znakom“), ali dodaje potpunu kontrolu pristupa."
   }
  ]
 },
 "8091": {
  "k": "Kolovoz je cela površina za saobraćaj vozila (na ovoj slici oba smera zajedno), a kolovozna traka je deo kolovoza za JEDAN smer, do razdelne linije. Saobraćajna traka je uži pojas unutar tog smera, između linija na kolovozu.",
  "bl": [
   {
    "id": 8090,
    "r": "Ista slika, ali pita KOLOVOZ (oba smera zajedno), pa je tačno 2, a ne 1."
   }
  ]
 },
 "8305": {
  "x": "Preticanje NEPOSREDNO ISPRED RASKRSNICE na putu koji nije put sa prvenstvom prolaza = srednja klasa sa malo poena (zabrana iz ZOBS čl. 57). Zabrana nema samo jedan izuzetak: preticanje je dozvoljeno na raskrsnici kad se krećeš putem SA prvenstvom prolaza (#9795), ali i na raskrsnici na kojoj saobraćaj reguliše semafor (#9850). Ispred raskrsnice pažnja mora biti na prvenstvu i pešacima, ne na manevru preticanja."
 },
 "8427": {
  "k": "Tablice za privremeno označavanje važe najduže 15 dana, isto koliko i rok za odjavu uništenog vozila i za prijavu promene podatka iz saobraćajne. „7 dana“ nije tačno ni u jednom pitanju u bazi.",
  "x": "Tablice za privremeno označavanje i potvrda o njihovom korišćenju važe najduže 15 dana. Pamti ih uz još dva roka od 15 dana: odjavu uništenog ili otpisanog vozila i prijavu promene podatka iz saobraćajne dozvole. Pazi na nalepnicu: ona važi godinu dana, a kad istekne, vozilo ne sme u saobraćaj. Izuzetak je odlazak na tehnički pregled, opravku ili ispitivanje, i to samo sa ovim privremenim tablicama i potvrdom o njihovom korišćenju.",
  "bl": [
   {
    "id": 8428,
    "r": "Pita za registracionu NALEPNICU, a ne za privremene tablice, pa je tačno „jedne godine“, a „15 dana“ je mamac."
   },
   {
    "id": 8425,
    "r": "Pita šta posle ISTEKA nalepnice, pa je tačno „ne sme da učestvuje“, a „najduže 15 dana“ je mamac."
   }
  ]
 },
 "8441": {
  "k": "Uništeno ili otpisano vozilo se odjavljuje u roku od 15 dana, isto kao prijava promene podatka iz saobraćajne i važenje privremenih tablica. Izuzetak: gubitak ili nestanak tablice odnosno nalepnice prijavljuje se ODMAH, bez roka.",
  "x": "Uništeno ili otpisano vozilo odjavljuje se u roku od 15 dana. Isti rok važi za prijavu promene bilo kog podatka iz saobraćajne dozvole, a 15 dana važe i tablice za privremeno označavanje. Ali 15 ne važi za sve: izgubljenu ili nestalu tablicu odnosno nalepnicu prijavljuješ ODMAH, a registraciona nalepnica važi godinu dana. „7 dana“ nije tačno ni u jednom od ovih pitanja.",
  "bl": [
   {
    "id": 8444,
    "r": "Tamo se radi o GUBITKU tablice ili nalepnice, pa je tačno „odmah“, a ponude sa rokom u danima su mamci."
   }
  ]
 },
 "8444": {
  "k": "Za gubitak ili nestanak tablice odnosno nalepnice nema roka u danima: prijavljuje se ODMAH, najbližoj jedinici MUP-a. Svaka ponuda sa „7 dana“ je mamac.",
  "bl": [
   {
    "id": 8441,
    "r": "Tamo se ODJAVLJUJE uništeno vozilo, pa postoji rok (15 dana), dok za gubitak tablice roka nema, već se prijavljuje odmah."
   }
  ]
 },
 "8446": {
  "k": "Na KONTROLNI pregled upućuje se samo vozilo u voznom stanju, po nalogu policajca ili inspektora. Vozilo kojem su u nezgodi oštećeni sklopovi bitni za bezbednost ne ide na kontrolni, nego pre povratka u saobraćaj na VANREDNI pregled.",
  "x": "Na kontrolni tehnički pregled može se uputiti samo vozilo koje je u voznom stanju, po nalogu policajca ili inspektora za drumski saobraćaj, na primer kad policajac posumnja u njegovu ispravnost. Vozilo koje nije u voznom stanju, ili kojem su u nezgodi znatno oštećeni sklopovi bitni za bezbednost, isključuje se iz saobraćaja i oduzimaju mu se tablice. Pre povratka u saobraćaj ono ide na VANREDNI pregled, a i vanredni se, kao i redovni, radi samo na vozilu koje je u voznom stanju. Zato je „oštećeni u saobraćajnoj nezgodi“ tačan odgovor kod vanrednog pregleda, a mamac kod kontrolnog.",
  "bl": [
   {
    "id": 8461,
    "r": "Pita za VANREDNI, a ne za kontrolni pregled, pa je „oštećeni u saobraćajnoj nezgodi“ tamo tačan odgovor."
   },
   {
    "id": 8575,
    "r": "Pita KADA se vozilo upućuje na kontrolni, pa je tačno „kad policijski službenik posumnja“, a nezgoda je i tamo mamac."
   }
  ]
 },
 "8461": {
  "k": "VANREDNI pregled se radi pre povratka u saobraćaj vozila kojem su u nezgodi ili na drugi način oštećeni vitalni sklopovi, ili koje je isključeno zbog neispravnosti nađene na kontrolnom. Pregled po nalogu MUP-a ili inspektora je KONTROLNI, a šestomesečni je REDOVNI.",
  "bl": [
   {
    "id": 8462,
    "r": "Pita za KONTROLNI, a ne za vanredni pregled, pa je „po nalogu ovlašćenog lica MUP-a“ tamo tačan odgovor."
   },
   {
    "id": 8446,
    "r": "Pita za KONTROLNI pregled, pa je vozilo oštećeno u nezgodi tamo mamac, a tačno je „u voznom stanju“."
   }
  ]
 },
 "8474": {
  "k": "Granica „ne upravlja savesno“ je ukupno najmanje 18 kaznenih poena, i tada se oduzima vozačka dozvola (#8475). 14 poena može doneti već jedan težak prekršaj (#8231), pa to nije granica.",
  "bl": [
   {
    "id": 8231,
    "r": "Tamo 14 kaznenih poena stoji uz kaznu za jedan prekršaj (vožnja za vreme isključenja), a ovde se pita za UKUPAN zbir poena posle kog vozač ne upravlja savesno, i to je 18."
   },
   {
    "id": 8476,
    "r": "Isti početak „ne upravlja savesno i na propisan način“, ali se tamo pita za presude (smrt lica – dovoljna jedna), a ovde za poene."
   }
  ]
 },
 "8476": {
  "k": "Za smrt lica dovoljna je JEDNA pravnosnažna presuda, za teške telesne povrede treba više od jedne u 5 godina, a za telesne povrede ili imovinsku štetu više od jedne u 3 godine. Što je posledica teža, dovoljno je manje presuda ili se one broje u dužem roku.",
  "bl": [
   {
    "id": 8477,
    "r": "Tamo je posledica TEŠKA telesna povreda, pa jedna presuda nije dovoljna: tačno je „više od jednom u roku od 5 godina“."
   },
   {
    "id": 8478,
    "r": "Tamo su posledica telesne povrede ili imovinska šteta, pa je tačno „više od jednom u roku od 3 godine“."
   }
  ]
 },
 "8478": {
  "k": "Za telesne povrede ili imovinsku štetu uslov je više od jedne pravnosnažne presude u roku od 3 godine. Rok od 5 godina važi samo za TEŠKE telesne povrede, a za smrt je dovoljna jedna presuda.",
  "bl": [
   {
    "id": 8477,
    "r": "Tamo je posledica TEŠKA telesna povreda, pa je tačan rok 5 godina, a ne 3."
   },
   {
    "id": 8476,
    "r": "Tamo je posledica smrt lica, pa je dovoljna jedna presuda i ne broji se rok."
   }
  ]
 },
 "8481": {
  "k": "Na praktičnoj obuci kod sebe nosiš tri stvari: ličnu kartu, dokaz o zdravstvenoj sposobnosti za vozača i potvrdu o POLOŽENOM teorijskom ispitu. Traži se dokaz da si položio, ne da si pohađao; ugovor i knjižica obuke nisu na spisku."
 },
 "8553": {
  "k": "Kod privremenog isključenja VOZAČA tačan je i sopstveni zahtev za analizu krvi, odnosno urina, isto kao i vožnja pod dejstvom alkohola ili psihoaktivnih supstanci. Prekoračenje brzine ponuđeno u ovim pitanjima (51–70 km/h u naselju, preko 70 km/h van naselja, preko 50 km/h u zoni škole) nikad nije tačno.",
  "x": "Ovde su tačna dva razloga sa liste za privremeno isključenje vozača (ZOBS čl. 279): vožnja pod dejstvom psihoaktivnih supstanci i SOPSTVENI zahtev za analizu krvi, odnosno urina. Iako zvuči kao tvoje pravo, i taj zahtev je razlog da te privremeno isključe iz saobraćaja. Zamke: obično prekoračenje brzine nije na listi, pa ni „više od 70 km/h preko dozvoljene van naselja“; prag za nasilničku vožnju van naselja je tek više od 100 km/h (#10712). Nije na listi ni vožnja noću bez uključenih dugih svetala. Cela lista: umor/bolest/povreda, alkohol, psihoaktivne supstance, ODBIJANJE ispitivanja ili stručnog pregleda, sopstveni zahtev za analizu krvi, nepoštovanje ograničenja koja su vozaču lično naložena, nasilnička vožnja, vožnja bez dozvole za tu kategoriju ili sa isteklom dozvolom, nečitljiva strana dozvola, vožnja za vreme zaštitne mere ili za vreme trajanja isključenja, i vožnja bez zakopčane kacige. Isti početak pitanja dolazi sa različitim ponudama, pa nauči celu listu.",
  "bl": [
   {
    "id": 8552,
    "r": "Isti tekst pitanja, ali su tamo tačni odbijanje ispitivanja i alkohol, a „neispravan uređaj za upravljanje ili zaustavljanje“ je zamka, jer se pita za VOZAČA, a ne za vozilo."
   },
   {
    "id": 8555,
    "r": "Isti tekst pitanja, ali su tamo tačni vožnja bez dozvole za tu kategoriju i vožnja za vreme zaštitne mere, a prolazak na crveno je zamka."
   },
   {
    "id": 8556,
    "r": "Isti tekst pitanja, ali su tamo tačni vožnja za vreme trajanja isključenja i vožnja sa isteklom dozvolom, a brzina u zoni škole i dnevni odmor su zamke."
   }
  ]
 },
 "8556": {
  "k": "Vozača isključuju i kad ga zateknu da vozi dok mu isključenje još traje, kao i kad vozi sa isteklom vozačkom, odnosno probnom dozvolom. Propušten dnevni odmor i ponuđena prekoračenja brzine nisu razlog za isključenje vozača.",
  "bl": [
   {
    "id": 8553,
    "r": "Isti tekst pitanja, ali su tamo tačni psihoaktivne supstance i sopstveni zahtev za analizu krvi, odnosno urina."
   },
   {
    "id": 8552,
    "r": "Isti tekst pitanja, ali su tamo tačni odbijanje ispitivanja i alkohol."
   },
   {
    "id": 8555,
    "r": "Isti tekst pitanja, ali su tamo tačni vožnja bez dozvole za tu kategoriju i vožnja za vreme zaštitne mere."
   },
   {
    "id": 8592,
    "r": "Tamo vozilo koje učestvuje u saobraćaju dok traje njegovo isključenje dovodi do isključenja VOZILA, a ovde vozač koji vozi dok traje njegovo isključenje dovodi do isključenja VOZAČA."
   }
  ]
 },
 "8584": {
  "k": "Vozilo se isključuje zbog neispravnosti samo kad je neispravan uređaj za upravljanje ili zaustavljanje, ili kad je neispravnost tolika da može ugroziti bezbednost saobraćaja i životnu sredinu. Nije dovoljna svaka ocena „neispravno“ sa pregleda, bez obzira na stepen, a nije ni nepokriven rasuti teret.",
  "x": "Vozilo se isključuje iz saobraćaja (ZOBS čl. 289) kad ima neispravan uređaj za upravljanje ili uređaj za zaustavljanje, odnosno kad su uređaji i oprema neispravni TOLIKO da mogu ugroziti bezbednost saobraćaja i životnu sredinu. Ovde su tačne baš te dve ponude. Zamke: „proglašeno neispravnim na kontrolnom tehničkom pregledu, BEZ OBZIRA na utvrđeni stepen neispravnosti“ nije tačno, jer se gleda koliko je neispravnost ozbiljna, a ne svaka ocena sa pregleda. Nepokriven teret u rasutom stanju takođe nije razlog. Pazi na obrnutu zamku: isti neispravan uređaj za upravljanje ili zaustavljanje NIJE razlog da se isključi VOZAČ (#8552), jer ova mera pogađa vozilo. Ostali razlozi za isključenje vozila: nije upisano u jedinstveni registar ili mu je istekla registraciona nalepnica, označeno je nepropisnim tablicama, ima nedozvoljeno ugrađene uređaje za davanje posebnih svetlosnih i zvučnih znakova koje vozač ne ukloni u roku iz naredbe (žuto rotaciono svetlo se ne računa, #8588), pojedinačno je proizvedeno ili prepravljeno bez ispitivanja, ili učestvuje u saobraćaju za vreme trajanja isključenja.",
  "bl": [
   {
    "id": 8552,
    "r": "Tamo se pita za isključenje VOZAČA, pa je isti neispravan uređaj za upravljanje ili zaustavljanje NETAČAN."
   },
   {
    "id": 8588,
    "r": "Isti tekst pitanja, ali su tamo tačni nepropisne tablice i nedozvoljeno ugrađeni uređaji za posebne svetlosne i zvučne znakove, koje vozač ne ukloni u roku."
   },
   {
    "id": 8590,
    "r": "Isti tekst pitanja, ali su tamo tačni vozilo koje nije upisano u jedinstveni registar i istekla registraciona nalepnica."
   },
   {
    "id": 8592,
    "r": "Isti tekst pitanja, ali su tamo tačni prepravljeno vozilo bez ispitivanja i vozilo koje učestvuje u saobraćaju za vreme trajanja isključenja."
   }
  ]
 },
 "8588": {
  "k": "Isključenje sledi kad je vozilo umesto registarskih označeno nepropisnim tablicama, a ne kad su propisne tablice samo loše postavljene. Kod ugrađenih svetala razlog su nedozvoljeni uređaji za posebne svetlosne i zvučne znakove koje vozač ne ukloni u roku iz naredbe, a ne žuto rotaciono ili trepćuće svetlo.",
  "bl": [
   {
    "id": 8590,
    "r": "Isti obrazac: tamo je tačna ISTEKLA registraciona nalepnica, a nalepnica koja „nije postavljena na propisan način“ je zamka."
   },
   {
    "id": 8584,
    "r": "Isti tekst pitanja, ali su tamo tačni neispravan uređaj za upravljanje ili zaustavljanje i neispravnost koja ugrožava bezbednost."
   },
   {
    "id": 8592,
    "r": "Isti tekst pitanja, ali su tamo tačni prepravljeno vozilo bez ispitivanja i vožnja za vreme trajanja isključenja."
   }
  ]
 },
 "8667": {
  "k": "Na triciklu, motociklu i četvorociklu ne sme se prevoziti dete mlađe od 12 godina, i u bazi je tačan odgovor uvek 12. Isti broj, 12 godina, pojavljuje se i u pitanju o detetu u krilu vozača (8418)."
 },
 "8678": {
  "k": "Dimenzije, uređaje i opremu vozila propisuje Pravilnik o podeli motornih i priključnih vozila i tehničkim uslovima za vozila u saobraćaju na putevima. Tačan naziv ponavlja reči iz samog pitanja: „tehnički uslovi“ i „vozila u saobraćaju na putu“.",
  "x": "Bliže uslove za vozila (dimenzije, uređaje, sklopove i opremu) propisuje Pravilnik o podeli motornih i priključnih vozila i tehničkim uslovima za vozila u saobraćaju na putevima. Zakon o bezbednosti saobraćaja daje samo okvir, a pravilnik daje cifre. Trik: tačan naziv ponavlja reči iz pitanja („tehnički uslovi“, „vozila u saobraćaju na putu“), a „Pravilnik o tehničkom pregledu vozila“ ih nema."
 },
 "8688": {
  "k": "Za moped, motocikl, tricikl i četvorocikl visina je najviše 2,50 m, a dužina najviše 4,00 m. Veći broj (4,00) ide uz dužinu, manji (2,50) uz visinu.",
  "x": "Najveća dozvoljena visina mopeda, motocikla, tricikla i četvorocikla je 2,50 m. Ne mešaj ovo sa pitanjem o DUŽINI istih vozila, gde je tačno 4,00 m. Za pamćenje: veći broj (4,00) je dužina, manji (2,50) je visina.",
  "bl": [
   {
    "id": 8681,
    "r": "Pita za DUŽINU umesto visine, pa je tačno 4,00 m; brojevi dva pitanja se ne preklapaju, zato pamti par „dužina 4,00, visina 2,50“."
   }
  ]
 },
 "8726": {
  "k": "Dugo svetlo mora da osvetli najmanje 100 m; tačna ponuda ima samo donju granicu. Brojevi 40 i 80 pripadaju kratkom svetlu (najmanje 40, najviše 80 m).",
  "bl": [
   {
    "id": 8724,
    "r": "Tamo piše „kratkog“ umesto „dugog“ svetla, pa je tačno „najmanje 40 m, a najviše 80 m“, a „najmanje 100 m“ je mamac."
   }
  ]
 },
 "8730": {
  "k": "Kad pitanje o dometu kratkog svetla pominje MOPED, tačno je najmanje 10 m, a najviše 50 m. Za motorna vozila osim traktora, bez reči moped, tačno je 40–80 m.",
  "x": "Kratko svetlo MOPEDA mora da osvetli najmanje 10 m, a najviše 50 m puta. Ponuda „najmanje 40 m“ je pozajmljena iz pitanja o kratkom svetlu ostalih motornih vozila (tamo je 40–80 m). Ponuda „20–60 m“ nije tačna ni u jednom pitanju. Kad u pitanju piše moped, traži najmanje brojeve: 10 i 50.",
  "bl": [
   {
    "id": 8724,
    "r": "Tamo piše „motornih vozila, osim traktora“ umesto „mopeda“, pa je tačno 40–80 m, a ne 10–50 m."
   }
  ]
 },
 "8760": {
  "k": "Kose crveno-žute pruge znače teško vozilo, žuto polje sa crvenim okvirom bez pruga znači dugo vozilo, a trougaona tabla znači sporo vozilo. Tekst pitanja je isti u sva tri pitanja, pa odlučuje samo slika.",
  "bl": [
   {
    "id": 8761,
    "r": "Na slici je puno žuto polje sa crvenim okvirom, bez pruga, pa je tačno „dugih vozila“."
   },
   {
    "id": 8762,
    "r": "Na slici je narandžasti trougao sa crvenim rubom, pa je tačno „sporih vozila“."
   }
  ]
 },
 "8761": {
  "k": "Žuto polje sa crvenim okvirom, BEZ pruga, znači dugo vozilo, a kose crveno-žute pruge znače teško vozilo. Trougaona tabla znači sporo vozilo.",
  "bl": [
   {
    "id": 8760,
    "r": "Na slici su table sa crveno-žutim KOSIM PRUGAMA, pa je tačno „teških vozila“."
   },
   {
    "id": 8762,
    "r": "Na slici je narandžasti trougao sa crvenim rubom, pa je tačno „sporih vozila“."
   }
  ]
 },
 "8949": {
  "k": "Dopunska tabla nikad nije samostalan znak: sastavni je deo znaka uz koji stoji i samo bliže određuje njegovo značenje, pa se obeležavaju OBA ta odgovora. Zabranu, ograničenje ili obavezu uvek nosi znak iznad nje, ne tabla."
 },
 "9068": {
  "k": "Tri strelice u krugu u trouglu sa crvenim rubom najavljuju raskrsnicu sa kružnim tokom (10824). Iste strelice na plavom krugu su naredba: kolovoz kojim moraš da se krećeš dok obilaziš ostrvo za usmeravanje saobraćaja.",
  "x": "Iste tri strelice u krugu postoje na dva znaka, pa odlučuje oblik. U trouglu sa crvenim rubom one najavljuju raskrsnicu sa kružnim tokom (pitanje 10824). Na plavom krugu, kao ovde, to je naredba: kolovoz, odnosno deo kolovoza kojim moraš da se krećeš dok obilaziš ostrvo za usmeravanje saobraćaja, u smeru strelica. Oba mamca počinju sa „blizinu raskrsnice“, a najavu daju znakovi opasnosti i obaveštenja, ne plavi krug: on propisuje kretanje na samom mestu gde stoji.",
  "bl": [
   {
    "id": 10824,
    "r": "Iste tri strelice u krugu, ali u trouglu sa crvenim rubom, pa je odgovor „nailazak na raskrsnicu sa kružnim tokom“."
   }
  ]
 },
 "9133": {
  "k": "Bela tabla sa crnim strelastim oznakama, bilo da je jedna ili tri, uvek znači „mesto gde se nailazi na oštru krivinu“. „Opasna krivina“ i „više uzastopnih krivina“ su uvek trouglovi sa crvenim rubom (10784, 10786).",
  "bl": [
   {
    "id": 10786,
    "r": "Trougao sa crvenim rubom i izlomljenom strelicom, pa je odgovor „više uzastopnih krivina, prva nadesno“."
   },
   {
    "id": 10784,
    "r": "Trougao sa crvenim rubom i jednom povijenom strelicom nadesno, pa je odgovor „opasna krivina nadesno“."
   }
  ]
 },
 "9262": {
  "k": "Udvojena ISPREKIDANA razdelna linija obeležava traku sa izmenljivim smerom kojom upravljaju semafori iznad nje, pa se obeležavaju oba ta odgovora. Udvojena PUNA linija je nešto sasvim drugo: zabrana prelaska i kretanja po njoj (11002).",
  "bl": [
   {
    "id": 11002,
    "r": "Udvojena NEISPREKIDANA (puna) linija znači zabranu prelaska i kretanja po toj liniji, a ne traku sa izmenljivim smerom."
   }
  ]
 },
 "9600": {
  "k": "Vozilo koje u naselju levom trakom sprečava tvoje brže kretanje dužno je da te propusti promenom trake, i kad vozi najvećom dozvoljenom brzinom. To što bi ti mogao da prođeš pored njega desnom trakom (u naselju to nije ni preticanje, 9734) ne skida mu tu obavezu.",
  "x": "Vozilo ispred tebe vozi levom trakom i sprečava tvoje brže kretanje, pa je dužno da se skloni u drugu traku i propusti te. Obaveza važi i kad ono vozi najvećom dozvoljenom brzinom, jer se vezuje za to što te zadržava, a ne za brzinomer. Tačno je da se u naselju tvoj prolazak desnom trakom pored njega i ne smatra preticanjem, ali ta tvoja mogućnost ne oslobađa njega obaveze da se pomeri. Zato su obe ponude sa „nije dužan” netačne.",
  "bl": [
   {
    "id": 9734,
    "r": "Pita se KAKO se zove tvoj prolazak desnom trakom (nije preticanje), a u 9600 šta je DUŽAN vozač ispred (da te propusti)."
   }
  ]
 },
 "9616": {
  "k": "Na dvosmernom putu sa tri trake traku koja je u tvom smeru uz levu ivicu puta ne smeš da koristiš nikada: ni za preticanje, ni za obilaženje, ni u zastoju. Pretiče se srednjom trakom (9781).",
  "bl": [
   {
    "id": 9781,
    "r": "Pita se da li je preticanje na putu sa tri trake dozvoljeno (jeste, srednjom trakom), a ne da li smeš u traku uz levu ivicu."
   }
  ]
 },
 "9628": {
  "k": "Obavezu da propustiš vozilo koje ulazi u tvoju traku, i to samo JEDNO, imaš kad se susedna traka završava ili je u njoj saobraćaj onemogućen (9626, 9630); u naselju moraš da omogućiš uključivanje i autobusu koji kreće sa stajališta (10443, 9559). Sam upaljen pokazivač drugih vozila ne stvara tu obavezu, pa ih propuštaš iz opreza (9628, 9586).",
  "bl": [
   {
    "id": 9630,
    "r": "Krajnja desna traka je zatvorena radnom mašinom, pa si dužan da propustiš jedno vozilo; u 9628 nijedna traka nije zatvorena."
   },
   {
    "id": 9626,
    "r": "Leva traka se završava (žuti znak za preusmeravanje traka), pa si dužan da propustiš jedno vozilo."
   }
  ]
 },
 "9673": {
  "k": "Polukružno okretanje zabranjeno je u tunelu, na mostu, vijaduktu, podvožnjaku i nadvožnjaku, pri smanjenoj vidljivosti ili nedovoljnoj preglednosti, gde put nije dovoljno širok, i na autoputu i motoputu; raskrsnica i naselje sami po sebi nisu zabrana. Ovu listu ne prenosi na preticanje: preticanje na mostu, vijaduktu, nadvožnjaku i u podvožnjaku NIJE zabranjeno (10480, 9795).",
  "bl": [
   {
    "id": 9795,
    "r": "Pitanje je o PRETICANJU, gde je „u podvožnjaku i na nadvožnjaku” tačno kao DOZVOLJENO mesto."
   },
   {
    "id": 10480,
    "r": "Za PRETICANJE je „na mostu, vijaduktu, nadvožnjaku i u podvožnjaku” netačna zabrana, a za polukružno okretanje ista stavka je tačna zabrana."
   }
  ]
 },
 "9702": {
  "k": "Na delu puta označenom kao opasan uspon ili nizbrdica po pravilu staje vozilo koje ide NIZ nagib. Vozilo koje ide UZ nagib staje kad ispred sebe ima pogodno mesto za zaustavljanje koje omogućava bezbedno mimoilaženje (9703) ili kad je vozilo iz suprotnog smera već ušlo u suženi deo kolovoza (9706).",
  "x": "Ovde postoje dve skoro iste ponude: „staje vozilo koje ide NIZ nagib” i „staje vozilo koje ide UZ nagib”. Po pravilu staje onaj koji ide niz nagib, na pogodnom mestu, kad vidi da mu neko ide u susret uzbrdo, jer je vozilu koje ide uzbrdo teže da ponovo krene. Vozilo koje ide uz nagib staje izuzetno: kad ispred sebe ima pogodno mesto za zaustavljanje koje omogućava bezbedno mimoilaženje, ili kad je vozilo iz suprotnog smera već ušlo u suženi deo kolovoza. Ponuda u kojoj vozač uz nagib staje samo zato što je video vozilo koje silazi opisuje običan susret, a ne izuzetak, pa je netačna. Ponuda sa bankinom ili trotoarom nije tačna ni ovde ni u sličnom pitanju.",
  "bl": [
   {
    "id": 9703,
    "r": "Ponuda za vozilo UZ nagib ima uslov „ako ispred sebe ima pogodno mesto za zaustavljanje”, a to je izuzetak, pa je tamo tačna; u 9702 uslov je samo „ako primeti vozilo koje silazi”."
   },
   {
    "id": 9706,
    "r": "Na slici je prepreka (gomila na kolovozu) na TVOJOJ strani, a taksi je već ušao u suženje, pa staješ ti iako ideš uzbrdo."
   }
  ]
 },
 "9801": {
  "k": "Kolonu vozila pod pratnjom (prepoznaješ je po crvenom i plavom trepćućem svetlu koja se naizmenično pale) ne smeš ni da pretičeš ni da obilaziš, i to ne menjaju ni pokazivač ni svetlosni znak upozorenja (9794, 9795). Kad ti takva kolona dolazi u susret ili te sustigne, propuštaš je i po potrebi staneš (10579, 10580).",
  "bl": [
   {
    "id": 10581,
    "r": "Na krovnoj rampi policijskog vozila ne gori nijedno svetlo, pa ono nije vozilo pod pratnjom; u 9801 crveno i plavo svetlo gore."
   },
   {
    "id": 10566,
    "r": "Rampa na krovu policijskog vozila ne svetli, pa ono nije ni pratnja ni vozilo sa prvenstvom; u 9801 crveno i plavo svetlo gore."
   }
  ]
 },
 "9850": {
  "k": "Neposredno ispred raskrsnice na putu bez prvenstva prolaza ne pretičeš (9842), osim kad raskrsnicu reguliše semafor (9850); na putu sa prvenstvom i na samom kružnom toku je dozvoljeno (9845, 9844), a neposredno ispred kružnog toka nije (9843). Kad je preticanje dozvoljeno, pretičeš sleva, a zdesna samo vozilo koje skreće ulevo ili tramvaj na sredini kolovoza (9847, 10475).",
  "bl": [
   {
    "id": 9842,
    "r": "Put nije sa prvenstvom i nema semafora, pa neposredno ispred raskrsnice preticanje nije dozvoljeno; u 9850 raskrsnicu reguliše semafor."
   },
   {
    "id": 9843,
    "r": "Pita se za mesto neposredno ispred kružnog toka, gde se ne pretiče; u 9850 raskrsnicu reguliše semafor."
   },
   {
    "id": 9847,
    "r": "Vozilo ispred skreće ulevo, pa se pretiče zdesna; u 9850 oba vozila idu pravo, pa ostaje leva strana."
   }
  ]
 },
 "9853": {
  "k": "Kad motociklista u svojoj traci prolazi levo pored vozila, to je i dalje preticanje, pa je propisno samo ako ga tu ne zabranjuje saobraćajni znak; to što ne ulazi u suprotnu traku ne čini ga dozvoljenim. Provlačenje zdesna između vozila, po žutoj liniji (9852), nije propisno.",
  "bl": [
   {
    "id": 9852,
    "r": "Motociklista prolazi ZDESNA pored automobila, između vozila i po žutoj liniji, pa je nepropisno; u 9853 prolazi sleva."
   },
   {
    "id": 9855,
    "r": "„Koji SE pretiče”: ovde motociklistu pretiču, pa je pitanje o njegovoj obavezi da ne ubrzava, a ne o načinu preticanja."
   }
  ]
 },
 "9873": {
  "k": "Kad te pitanje sa slike pita kojom brzinom si dužan da se krećeš, a znaka ograničenja nema, tačno je „da možeš blagovremeno da zaustaviš vozilo pred svakom preprekom“ i, ako je ponuđeno, „da ne ugrožavaš sebe i druge“. U tim pitanjima je broj km/h tačan samo kad piše „nakon saobraćajnog znaka“, a „20% manje“ nije tačno nijednom.",
  "x": "Na slici je put sa više traka. Žute elipse obeležavaju uzdužne tragove i neravnine na kolovozu u tvojoj traci, a znaka za ograničenje brzine nema. Brzinu tada biraš prema uslovima: osobinama i stanju puta, vidljivosti i preglednosti, vremenskim prilikama, stanju vozila i tereta i gustini saobraćaja. Mora biti takva da vozilo možeš blagovremeno da zaustaviš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš i da ne ugrožavaš sebe i druge. Ovde se traže OBA ta odgovora. Ponude sa 80 km/h i sa brzinom 20% manjom su mamci, jer je u ovakvim pitanjima broj tačan samo kad piše „nakon saobraćajnog znaka“ (9878, 9908). Odgovori „prema raspoloživom vremenu“, „da vožnja bude najudobnija“ ili „da što pre stigneš“ nikad nisu tačni (9868, 10488, 10489). Pazi: isto pitanje sa maglom (9870) traži samo jedan odgovor, jer tamo nema ponude „da ne ugrožavate sebe i druge“.",
  "bl": [
   {
    "id": 9870,
    "r": "Isto pitanje sa maglom na slici nema ponudu „da ne ugrožavate sebe i druge“, pa se traži samo jedan odgovor, a u 9873 dva."
   }
  ]
 },
 "10113": {
  "k": "U ovoj bazi ponuda „dozvoljeno je ako ostane prolaz za pešake od 1,60 m“ nije tačna nijednom. Na trotoaru ili pešačkoj stazi bez znaka koji to izričito dozvoljava zaustavljanje i parkiranje nisu dozvoljeni."
 },
 "10365": {
  "k": "Vozilo sa plavim (ili crveno-plavim) trepćućim svetlom ima prvenstvo i pored znakova STOP i romba i ispred pravila desne strane. Ako na raskrsnici radi semafor ili saobraćaj reguliše policajac, prvenstvo određuju oni, a ne rotacija.",
  "x": "Policijsko vozilo daje plavo trepćuće svetlo, pa je vozilo sa pravom prvenstva prolaza. Ostali su dužni da ga propuste: ne zaustavlja ga znak obavezno zaustavljanje (STOP) na njegovom prilazu, a prednost nema ni žuto vozilo, iako nailazi putem sa prvenstvom obeleženim žutim rombom. Zato o prvenstvu ovde ne odlučuju postavljeni znakovi. Pazi na slike koje izgledaju isto: kad na raskrsnici radi semafor, prvenstvo je regulisano semaforom (10363), a kad saobraćaj reguliše policajac, odlučuju njegovi znaci (10589). Plavo svetlo, dakle, nadjačava znakove i pravilo desne strane, ali ne i semafor i policajca.",
  "bl": [
   {
    "id": 10363,
    "r": "Isti crtež, ali na raskrsnici je semafor (crveno za policijsko vozilo, zeleno za žuto), pa je tačno „prvenstvo je regulisano semaforom“."
   },
   {
    "id": 10589,
    "r": "Na raskrsnici stoji policajac koji reguliše saobraćaj, pa prvenstvo određuju njegovi znaci, iako policijsko vozilo ima plavo svetlo."
   }
  ]
 },
 "10383": {
  "k": "Ako vozilo sa plavim svetlom iza tebe uz to blica dugim svetlima (uzastopno ili naizmenično), moraš odmah bezbedno da staneš uz desnu ivicu kolovoza, po mogućnosti i van kolovoza. Tu nije dovoljno da se samo pomeriš udesno, usporiš ili omogućiš preticanje.",
  "x": "Kad policijsko vozilo sa plavim svetlom uz to blica dugim svetlima (uzastopno ili naizmenično) prema vozilu koje je neposredno ispred njega, to je znak baš tom vozaču: mora odmah bezbedno da zaustavi vozilo uz desnu ivicu kolovoza, a po mogućnosti i van kolovoza. Dakle, tebe zaustavljaju. Zato nije dovoljno da se samo pomeriš udesno ili usporiš i omogućiš preticanje. Da te vozilo sa plavim svetlom samo sustiže, bez blicanja, bilo bi dovoljno da ga propustiš i staneš po potrebi (10424), ali blicanje to pretvara u obavezno zaustavljanje. Kad se, obrnuto, voziš IZA policijskog vozila iz kog ti službenik daje znake, pratiš ga do pogodnog mesta i staješ iza njega (10384).",
  "bl": [
   {
    "id": 10384,
    "r": "Ti se krećeš IZA policijskog vozila iz kog službenik daje znake, pa ga pratiš do pogodnog mesta i staješ iza njega, a ne odmah."
   },
   {
    "id": 10424,
    "r": "Vozilo ima samo plavo svetlo, bez blicanja dugim svetlima, pa ga propuštaš i staješ ili se sklanjaš samo po potrebi."
   }
  ]
 },
 "10425": {
  "k": "Kad je jedini znak plavo svetlo (jedno ili dva), staješ samo „po potrebi“, a bezuslovno „zaustavite se“ je mamac. Ako vozilo sa plavim svetlom STOJI na kolovozu: smanji brzinu, stani po potrebi i postupaj po naredbama policijskog službenika.",
  "bl": [
   {
    "id": 10424,
    "r": "Vozilo sa plavim svetlom se KREĆE, pa ga propuštaš i staješ ili se sklanjaš po potrebi, a „smanji brzinu i nastavi“ tamo nije tačno."
   }
  ]
 },
 "10470": {
  "x": "Polukružno okretanje je zabranjeno (ZOBS čl. 50) u tunelu, na mostu i vijaduktu, u podvožnjaku i na nadvožnjaku, pri smanjenoj vidljivosti, na nepreglednom mestu i na delu puta koji nema dovoljnu širinu. Pazi: to NIJE ista lista kao za preticanje. Most, vijadukt, nadvožnjak i podvožnjak zabranjuju polukružno okretanje, a preticanje na njima jeste dozvoljeno (#9795, #10480); tunel zabranjuje oba. „U raskrsnici“ i „na putu van naselja“ nisu na listi."
 },
 "10486": {
  "k": "Ostrvo, objekat ili površinu na sredini kolovoza na kom se saobraćaj odvija u oba smera obilaziš samo sa desne strane. Sa obe strane smeš samo na putu sa jednosmernim saobraćajem, ako znakom nije drugačije određeno (10487).",
  "x": "Kolovoz je dvosmeran, pa ostrvo ili objekat na sredini obilaziš sa desne strane. Ponuda „sa obe strane” je tačan odgovor na drugo, skoro isto pitanje: kad je put JEDNOSMERAN, objekat na sredini sme da se obiđe sa obe strane, ako saobraćajnim znakom nije drugačije određeno. Pre odgovora potraži tu jednu reč: oba smera znači samo desno, jedan smer znači obe strane. Leva strana nije tačna ni u jednom od ta dva pitanja.",
  "bl": [
   {
    "id": 10487,
    "r": "Put je JEDNOSMERAN, pa se objekat na sredini sme obići sa obe strane, ako znak ne kaže drugačije."
   }
  ]
 },
 "10550": {
  "k": "Kad policajac stoji raširenih ili spuštenih ruku, gledaj kako ti je okrenut: ako su ti okrenuta njegova prsa ili leđa, staješ ispred linije zaustavljanja. Ako ti je okrenut bokom, prolaz ti je slobodan, ali pešake na prelazu i dalje propuštaš.",
  "bl": [
   {
    "id": 10255,
    "r": "Policajac ti je okrenut bokom, ruku spuštenih niz telo, pa imaš slobodan prolaz i samo propuštaš pešake na prelazu."
   }
  ]
 },
 "10604": {
  "k": "„Kolovoz koriste pešaci I vozila“ je zona usporenog saobraćaja; „prvenstveno namenjen saobraćaju pešaka“ je pešačka zona; „brzina ograničena do 30 km/h“ je zona „30“.",
  "x": "Ključne reči su „kolovoz koriste pešaci I vozila“: pešaci i vozila su na istom kolovozu, i to je zona usporenog saobraćaja. U njoj vozač ne sme da ometa pešake i bicikliste i vozi brzinom kretanja pešaka, a najviše 10 km/h (pitanje 10605). Pešačka zona je deo PRVENSTVENO namenjen saobraćaju pešaka (10702), a vozila se u njoj kreću samo kad je to dozvoljeno određenim vozilima (10603). Zona „30“ govori samo o brzini do 30 km/h i ništa ne kaže o pešacima na kolovozu (8125).",
  "bl": [
   {
    "id": 10702,
    "r": "„Prvenstveno namenjen saobraćaju pešaka“ je pešačka zona, a „kolovoz koriste pešaci i vozila“ je zona usporenog saobraćaja."
   },
   {
    "id": 8125,
    "r": "Isti početak („deo puta, ulice ili naselja…“), ali „brzina ograničena do 30 km/h“ daje zonu „30“."
   }
  ]
 },
 "10607": {
  "k": "Zona škole spušta opšte ograničenje brzine: u naselju sa 50 na 30 km/h, a van naselja sa 80 na 50 km/h, od 7 do 21 čas, osim ako znak drugačije odredi VREME zabrane. Ponuda „radnim danima“ nije tačna ni u jednom od ta dva pitanja.",
  "x": "Zona škole spušta ograničenje koje inače važi na tom putu. U naselju je opšte ograničenje 50 km/h (pitanje 10491), a u zoni škole 30. Na putu van naselja koji nije autoput ni motoput opšte je 80 km/h (9903), a u zoni škole 50. Ovo pitanje kaže VAN naselja, pa je tačno 50 km/h, od 7 do 21 čas, osim ako saobraćajni znak drugačije odredi vreme zabrane. Ponuda sa 30 je odgovor za zonu škole U naselju (10606), a „radnim danima“ ne stoji ni u jednom tačnom odgovoru.",
  "bl": [
   {
    "id": 10606,
    "r": "U NASELJU je zona škole 30 km/h, a VAN naselja 50 km/h; sve ostalo (7 do 21 čas, osim ako znak drugačije odredi vreme) je isto."
   }
  ]
 },
 "10634": {
  "k": "Kad autobus sa narandžastom tablom za decu stoji i deca ulaze ili izlaze, moraš da staneš (i kad dolaziš iza njega i kad dolaziš iz suprotnog smera) i ne smeš da ga obiđeš. Kod autobusa na stajalištu „prilagodi brzinu da možeš bezbedno da staneš“ je tačno samo kad je autobus običan, bez te table.",
  "bl": [
   {
    "id": 9542,
    "r": "Običan gradski autobus na stajalištu, bez narandžaste table za decu, pa je dovoljno da prilagodiš brzinu tako da možeš bezbedno da staneš."
   },
   {
    "id": 9559,
    "r": "Autobus bez table za decu uključuje levi pokazivač da krene sa stajališta, pa smanjuješ brzinu i staješ samo po potrebi."
   }
  ]
 },
 "10686": {
  "k": "Najveću dozvoljenu masu deklariše proizvođač vozila; nju ne određuje organizacija posle ispitivanja i ona nije razlika dve mase. Obrnuto ne važi: i masu praznog vozila deklariše proizvođač (10683), pa „deklariše proizvođač“ sam po sebi ne znači najveću dozvoljenu masu.",
  "x": "Najveću dozvoljenu masu deklariše PROIZVOĐAČ vozila. To je gornja granica koju on određuje za svoje vozilo. Reč „dozvoljena“ ne znači da je daje ovlašćena organizacija: ispitivanje prepravljenog vozila služi da se utvrdi da li vozilo ispunjava propisane uslove (pitanje 8449). Nije ni razlika dve mase, jer je to račun, a ne masa koju neko deklariše. Ne mešaj je sa ukupnom masom, koja je stvarna masa vozila zajedno sa licima i teretom u tom trenutku (7977).",
  "bl": [
   {
    "id": 10683,
    "r": "I masu praznog vozila deklariše proizvođač, ali je u pitanju opisana kao neopterećeno vozilo sa gorivom i opremom."
   },
   {
    "id": 7977,
    "r": "Masa vozila zajedno sa licima i teretom je UKUPNA masa, stvarno stanje u tom trenutku, a ne najveća dozvoljena."
   }
  ]
 },
 "10701": {
  "k": "Vozača motocikla, mopeda, tricikla ili četvorocikla bez kabine isključuju ako on ili putnik koga prevozi nema na glavi zakopčanu homologovanu kacigu. Prsluk nije razlog, ni za vozača ni za putnika."
 },
 "10711": {
  "k": "Nasilnička vožnja zbog brzine je vožnja za više od 90 km/h preko dozvoljene u naselju, a za više od 100 km/h preko dozvoljene van naselja. Pamti par 90/100: manji broj ide uz naselje.",
  "bl": [
   {
    "id": 10712,
    "r": "Umesto „u naselju“ piše „van naselja“, pa je granica 100 km/h preko dozvoljene, a ne 90."
   }
  ]
 },
 "10716": {
  "k": "Prvi korak je naredba da bez odlaganja, najkraćim putem napustiš put na kome tvom vozilu kretanje nije dozvoljeno (#8594). Tek ako ne postupiš po toj naredbi, iz saobraćaja se isključuje VOZILO, ne vozač.",
  "x": "Ovde postoje dva koraka. Kad se vozilo kreće putem na kome kretanje tog vozila nije dozvoljeno, vozaču se prvo NAREĐUJE da bez odlaganja, najkraćim putem napusti taj put (#8594); u tom trenutku vozilo još nije isključeno. Tek ako vozač NE POSTUPI po toj naredbi, iz saobraćaja se isključuje VOZILO, a ne vozač. Mera pogađa vozilo jer je vozilo to koje ne sme na taj put. Ni „vozač će biti isključen“ ni „priveden prekršajnom sudu“ nisu tačni odgovori na ovo pitanje.",
  "bl": [
   {
    "id": 8594,
    "r": "Tamo naredba tek treba da se izda, pa je tačno „naređeno da napusti put“, a „vozilo će biti isključeno“ je zamka; ovde naredba NIJE poslušana, pa se vozilo isključuje."
   },
   {
    "id": 10717,
    "r": "Tamo je tačno privođenje prekršajnom sudu jer vozač već isključenog vozila ne preda tablice, a ovde je jedini tačan odgovor isključenje vozila."
   }
  ]
 },
 "10780": {
  "k": "Znak se postavlja sa desne strane puta, a levo se samo DODAJE, radi bolje uočljivosti ili dodatnog upozorenja. Tačne su obe ponude koje počinju sa „desne strane puta“, a nijedna koja počinje sa „leve“ ili „desne ili leve“."
 },
 "10781": {
  "k": "Znak opasnosti upozorava unapred, pa se po pravilu postavlja 150–250 m ispred opasnog mesta. Neposredno ispred mesta stoji znak izričite naredbe (10841), a „100 m“ je mamac u oba pitanja.",
  "x": "Znak opasnosti te upozorava UNAPRED, pa se po pravilu postavlja 150 m do 250 m ispred opasnog mesta, dovoljno rano da stigneš da usporiš. „Neposredno ispred“ važi za znak izričite naredbe (pitanje 10841), jer naredba važi od mesta na kome znak stoji. „100 m“ je mamac i ovde i tamo. Izuzeci postoje: van naselja znak opasnosti postavljen bliže od 150 m ili dalje od 250 m mora imati dopunsku tablu sa udaljenošću do opasnog mesta, a u naselju znak postavljen bliže od 150 m ne mora imati dopunsku tablu.",
  "bl": [
   {
    "id": 10841,
    "r": "Pita za znak izričite NAREDBE, koji važi od mesta gde stoji, pa je među istim ponudama tačno „neposredno ispred“."
   }
  ]
 },
 "10800": {
  "k": "Pešak na zebri u trouglu sa crvenim rubom je NAILAZAK na obeležen pešački prelaz (najava). Isti crtež u plavom kvadratu je MESTO gde se prelaz nalazi (10881).",
  "bl": [
   {
    "id": 10881,
    "r": "Isti pešak na zebri, ali u belom trouglu na plavom kvadratu, pa je odgovor „mesto na kome se nalazi pešački prelaz“."
   },
   {
    "id": 10838,
    "r": "Isti trougao, ali pešak NEMA zebru pod nogama, pa je odgovor „deo puta kojim se pešaci često kreću“."
   },
   {
    "id": 10871,
    "r": "Plavi krug sa odraslim i detetom je „posebno izgrađena staza za pešake“, a ne prelaz."
   }
  ]
 },
 "10840": {
  "k": "Jedan krst X znači prugu sa jednim kolosekom, a X sa još jednim krakom u obliku ^ ispod znači dva ili više koloseka (10831). Da li prelaz ima branike ne kazuje krst nego trougao: ograda znači sa branicima (10825), lokomotiva bez njih (10830).",
  "x": "Andrejin krst nije trougao nego bela pravougaona tabla sa crveno oivičenim kracima. Ovde je nacrtan samo jedan krst X, a to znači prugu sa jednim kolosekom. Kad je ispod krsta dodat još jedan krak u obliku ^ (pitanje 10831), to je pruga sa dva ili više koloseka. Da li prelaz ima branike ne kazuje krst nego trougao: ograda u trouglu znači prelaz sa branicima ili polubranicima (pitanje 10825), a lokomotiva prelaz bez njih (pitanje 10830).",
  "bl": [
   {
    "id": 10831,
    "r": "Ispod krsta X stoji još jedan krak u obliku ^, pa je odgovor „dva ili više koloseka“."
   },
   {
    "id": 10830,
    "r": "Trougao sa crvenim rubom i lokomotivom, a ne krst, pa je odgovor „prelaz koji nije obezbeđen branicima ili polubranicima“."
   }
  ]
 },
 "10856": {
  "k": "U crvenom krugu sama prikolica znači zabranu vuče BILO KOG priključnog vozila (11068). Vozilo i prikolica spojeni rudom znače istu zabranu, ali OSIM poluprikolice ili prikolice sa jednom osovinom.",
  "x": "Crveni krug je zabrana. Ovde su nacrtana DVA vozila spojena rudom, vozilo koje vuče i prikolica iza njega, a taj znak zabranjuje vuču priključnog vozila uz izuzetak: osim poluprikolice ili prikolice sa jednom osovinom. Kad je u krugu nacrtana SAMO prikolica, bez vozila ispred nje (pitanje 11068), zabrana važi za vuču bilo kog priključnog vozila, bez izuzetka. Pamti: dva vozila na slici, duža ponuda sa izuzetkom. Zabrana za teretna vozila je treći znak, na kome je samo kamion sa kabinom, bez prikolice.",
  "bl": [
   {
    "id": 11068,
    "r": "Nacrtana je SAMO prikolica (jedan točak, rudo napred), bez vozila ispred, pa zabrana nema izuzetak."
   },
   {
    "id": 9017,
    "r": "Nacrtan je samo kamion sa kabinom i prozorima, bez prikolice, pa je odgovor „zabranjen saobraćaj za teretna vozila“."
   }
  ]
 },
 "11056": {
  "k": "Ako u nazivu piše „objekat“ ili „prepreka“ (indikator putnog objekta, table stalnih prepreka), to je oznaka PUTNIH OBJEKATA (11057). Sve ostalo iz ove liste (smerokazi, katadiopteri, štap za zimske uslove) obeležava IVICU KOLOVOZA.",
  "bl": [
   {
    "id": 11057,
    "r": "Pita za PUTNE OBJEKTE, pa su tačne baš dve ponude koje su ovde netačne (indikator putnog objekta i table stalnih prepreka)."
   }
  ]
 }
};
