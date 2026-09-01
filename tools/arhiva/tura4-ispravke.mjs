import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const put = SCRATCH + '/tura4-nacrti.json';
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

// Nalaz kontrole, potvrđen ličnim gledanjem img/8760.jpg: tabla za teška vozila NEMA crveni okvir —
// pruge idu do ivice, a obod je tanak i žut. Ispravljam i crtež i opis.
fix('uredjaji-oprema',
  '<rect x="5" y="5" width="140" height="34" fill="none" stroke="#d81f26" stroke-width="6"/>\n  </svg><b>TEŠKA vozila</b><span>žuto polje sa kosim crveno-žutim prugama, u crvenom okviru</span>',
  '<rect x="4" y="4" width="142" height="36" fill="none" stroke="#e8b400" stroke-width="4"/>\n  </svg><b>TEŠKA vozila</b><span>pravougaonik: naizmenične kose <b>crvene i žute</b> pruge preko celog polja, uz tanak žuti obod</span>',
  'teska-okvir');

// Sitan, ali koristan nalaz: doslovna formulacija iz baze je „u krvi", ne „u organizmu".
fix('vozac-zdravlje-alkohol',
  '<b>1. Vozač A kategorije ne sme da ima alkohola u organizmu</b> — nula',
  '<b>1. Vozač A kategorije ne sme da ima alkohola u krvi</b> — nula <span class="mut">(zakon govori i o alkoholu u organizmu, ali odgovori u bazi glase „u krvi")</span>',
  'alkohol-krv');

// Nalaz: ZOBS kažnjava vozača — formulacija „i njegov prekršaj" je bila preširoka.
fix('vozac-zdravlje-alkohol',
  'Putnikovo stanje je i tvoj prekršaj, ne samo njegov.',
  'Za to odgovara <b>vozač</b> — putnikovo stanje postaje tvoja obaveza.',
  'putnik-prekrsaj');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync(put, JSON.stringify(nacrti));
console.log('ispravke primenjene');
