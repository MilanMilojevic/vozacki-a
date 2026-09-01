import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const put = SCRATCH + '/tura56-nacrti.json';
const nacrti = JSON.parse(fs.readFileSync(put, 'utf8'));
let fails = 0;
function fix(key, o, n, label) {
  const k = nacrti.find((x) => x.key === key);
  if (!k) { console.log('FAIL [' + label + '] nema nacrta'); fails++; return; }
  const cnt = k.html.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  k.html = k.html.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// 1) put-pojmovi: semafor JESTE saobraćajna signalizacija (ZOBS čl. 133, doslovno provereno) —
//    mnemonik "znak, a ne semafor" učio bi pogrešan pojam.
fix('put-pojmovi', '<td>znak — a ne semafor</td>',
    '<td>znak koji to nalaže; crveno svetlo na semaforu nije nalog za gašenje</td>', 'signalizacija');

// 2) put-pojmovi: primer u uvodu je slučajno spajao pitanje o zoni „30" sa definicijom zone usporenog
//    saobraćaja (baš ono što baza nudi kao mamac). Zamenjen pravim obrnutim parom (8124 ↔ 8125).
fix('put-pojmovi', 'Pitanja idu u OBA smera: jednom „Zona 30 je...", drugi put „Deo puta u kome kolovoz koriste pešaci i vozila je...". Zato uči par NAZIV ↔ DEFINICIJA, ne samo brzinu.',
    'Pitanja idu u OBA smera: jednom „Zona 30 je…", drugi put „Deo puta u kojoj je brzina ograničena do 30 km/h je…" — i tu se traži naziv. Zato uči par NAZIV ↔ DEFINICIJA, ne samo brzinu.', 'obrnuti-par');

// 3) razno-pravila: na slici uz drugo pitanje NEMA kolone ni preticanja — put je fizički razdvojen,
//    a prekršaj je vožnja u suprotnom smeru. (Proverio sam sliku.)
fix('razno-pravila', 'Dva slikovna pitanja gađaju istu radnju iz dva ugla — preticanje kolone uz prelazak preko neisprekidane linije. U jednom sa mopeda vidiš vozilo koje ti <b>dolazi u susret tvojom saobraćajnom trakom</b> jer pretiče kolonu; u drugom <b>ti</b> si taj koji je izašao u suprotnu traku. U oba slučaja tačan',
    'Dva slikovna pitanja gađaju isti ishod iz dva različita ugla. U prvom sa mopeda vidiš vozilo koje ti <b>dolazi u susret tvojom saobraćajnom trakom</b> jer pretiče kolonu preko neisprekidane linije. U drugom nema ni kolone ni preticanja: put je <b>fizički razdvojen ostrvom</b>, na ostrvu stoji znak obaveznog smera okrenut ka tebi, a ti se krećeš <b>suprotnim smerom</b>. U oba slučaja tačan', 'slika-10027');

// 4) razno-pravila: redosled ponuđenih odgovora se meša na svakom prikazu, pa „srednji odgovor" ne postoji;
//    i doslovan tekst zamke razlikuje se između ta dva pitanja.
fix('razno-pravila', 'Zamka je srednji odgovor: „nepropisno postupanje, <b>koje nije</b> u gruboj suprotnosti sa pravilima saobraćaja, s obzirom da preticanje ',
    'Zamka glasi: „nepropisno postupanje, <b>koje nije</b> u gruboj suprotnosti sa pravilima saobraćaja" (kod pitanja o preticanju kolone nastavlja se i sa „s obzirom da preticanje ', 'zamka-srednji');

// 5) pokazivaci: pogrešna referenca — poslednji red tabele je zaustavljena kolona, gde se zvučni znak
//    uopšte ne nudi; rečenica cilja na dva reda sa strpljivim čekanjem.
fix('pokazivaci', 'U poslednja dva slučaja nije tačan ni zvučni, ni svetlosni, ni „oba" — požurivanje nije razlog za znak upozorenja.',
    'U dva slučaja sa strpljivim čekanjem (vozilo auto-škole i kolona na semaforu) nije tačan ni zvučni, ni svetlosni, ni „oba" — požurivanje nije razlog za znak upozorenja.', 'referenca');

// 6) pokazivaci: reč „sirena" je u kartici korišćena i za trubu i za dvotonsku sirenu vozila pod pratnjom.
fix('pokazivaci', '<b>sirena je za OPASNOST, nikad za nervozu.</b>',
    '<b>truba je za OPASNOST, nikad za nervozu.</b>', 'sirena-truba');

// 7) slicni-pojmovi: klasa trotočkaša sa sandukom ne može se odrediti sa slike (zavisi od brzine i motora).
fix('slicni-pojmovi', 'poluprikolica i prikolica (nemaju motor); trotočkaš sa sandukom je teški tricikl',
    'poluprikolica i prikolica (nemaju motor); trotočkaš sa sandukom nema četiri točka, pa nije teretno vozilo — po rasporedu točkova je tricikl, laki ili teški zavisno od brzine i motora (vidi karticu o kategorijama)', 'tricikl');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync(put, JSON.stringify(nacrti));
console.log('svih sedam blokirajućih ispravljeno');
