import fs from 'node:fs';
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = s.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  s = s.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// Nalazi DRUGE (nezavisne) kontrole, svaki lično proveren u bazi i na slikama.

// 1) Široki CRVENI okvir je oznaka DUGIH vozila (img/8761), a teška imaju tanak žuti obod (img/8760).
//    Kartica je tvrdila da obe pravougaone table imaju isti crveni okvir — to je vodilo na pogrešan odgovor.
rep('<b>DUGA vozila</b><span>isti pravougaonik i isti okvir, ali je polje čisto žuto, bez pruga</span>',
    '<b>DUGA vozila</b><span>isti pravougaonik, ali čisto <b>žuto polje bez pruga</b>, uokvireno <b>širokom crvenom trakom</b></span>', 'duga-okvir');

rep('Razlikuj ih po polju, ne po obliku: dve pravougaone table imaju isti crveni okvir, pa je <b>pruge = teško, bez pruga = dugo</b>; jedina tabla u obliku trougla je ona za <b>spora</b> vozila.',
    'Razlikuj ih po polju i obodu: <b>kose crveno-žute pruge preko celog polja = TEŠKA</b> vozila (obod je tanak i žut), a <b>čisto žuto polje u širokom crvenom okviru = DUGA</b> vozila; jedina tabla u obliku trougla je ona za <b>spora</b> vozila.', 'razlika-tabli');

// 2) TWI: pravilo „tačan odgovor uvek prvo pominje TWI" pada na pitanju 8829, gde je tačan odgovor GOLA cifra 1,6 mm.
rep('<span class="mut">Pazi: goli odgovor „najmanje 1,6 mm" ponuđen je kao mamac — tačan odgovor uvek prvo pominje TWI, a tek onda cifru. Kad TWI oznake nema, granica je 1,6 mm, ne 2,0 ni 4,0.</span>',
    '<span class="mut">Pazi na formulaciju pitanja. Ako pitanje ne pominje TWI („dubina gazećeg sloja… mora biti"), tačan odgovor prvo pominje TWI pa tek onda cifru — goli „najmanje 1,6 mm" je tu mamac. Ali ako pitanje samo kaže „kada ne postoji TWI oznaka", tačan odgovor je upravo gola cifra <b>1,6 mm</b>, a mamci su 2,0 i 4,0 mm.</span>', 'twi');

// 3) Katadiopteri: širina nije jedini razlikovni podatak — pitanje 8753 („motocikl sa tri točka") uopšte ne navodi širinu,
//    a odgovor je „dva"; i pogrešne ponude znaju da kažu „dva" (8754), pa broj sam po sebi ne odlučuje.
rep('Pre nego što izabereš broj, pročitaj širinu u pitanju — ona je jedini razlikovni podatak. Odgovor „ne moraju biti ugrađeni" nije tačan ni u jednom od ta tri pitanja.',
    'Prvo pogledaj <b>vrstu vozila</b>, pa tek onda širinu: „motocikl sa tri točka" ide na <b>dva</b> i kad širina uopšte nije navedena. Broj nije dovoljan — i pogrešne ponude znaju da kažu „dva", pa uvek proveri i da su katadiopteri <b>crveni</b> i da <b>nisu trouglasti</b>. Odgovor „ne moraju biti ugrađeni" nije tačan ni u jednom od ta tri pitanja.', 'katadiopteri');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
console.log('nalazi druge kontrole ispravljeni');
