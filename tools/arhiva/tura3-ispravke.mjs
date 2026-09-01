import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const put = SCRATCH + '/tura3-nacrti.json';
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

// --- POLICAJAC, blokirajući 1: na slici 9464 je ŽUTA strelica PRAVO ka policajcu (proverio lično),
// strelice levo-desno postoje samo na studijskoj slici. Tekst je vezivao pogrešan obrazac.
fix('policajac-znaci',
  'ista podignuta podlaktica sa <b>kružnom</b> strelicom znači <b>ubrzaj</b>, a sa strelicom <b>levo-desno</b> (i bočno okrenutom šakom) znači <b>priđi bliže</b>. Ne pamti scenu — pamti šaku i strelicu.',
  'ista podignuta podlaktica sa <b>kružnom</b> strelicom znači <b>ubrzaj</b>. Za „priđi bliže" gledaj strelicu koja pokazuje <b>ka policajcu</b>: na gradskim fotografijama to je velika <b>žuta strelica pravo napred</b>, a na studijskim crtežima strelica <b>levo-desno</b> uz bočno okrenutu šaku. Ne pamti scenu — pamti šaku i smer strelice.',
  'policajac-strelica');

// --- POLICAJAC, blokirajući 2: na slici 9457 policajac je bočno/leđima, ruka uvis, a odgovor je „zaustavite se"
// (proverio lično). Tabela je tvrdila da važi samo za one kojima su okrenuti dlan i prsa.
fix('policajac-znaci',
  '<tr><td>Ruka ispružena <b>pravo uvis</b>, otvorena šaka</td><td>uzdignuta ruka</td><td><b>Obavezno zaustavljanje</b> za sve prema kojima su okrenuti <b>dlan i prsa</b></td></tr>',
  '<tr><td>Ruka ispružena <b>pravo uvis</b>, otvorena šaka</td><td>ruka podignuta uvis</td><td><b>Obavezno zaustavljanje za SVE</b> učesnike — bez obzira na to da li mu vidiš prsa ili leđa. <span class="mut">Položaj tela je merilo samo kad su ruke spuštene ili odručene.</span></td></tr>',
  'policajac-uvis');

// --- PRVENSTVO, blokirajući: kad se sretnu dva vozila sa prvenstvom, važe OPŠTE odredbe (cela piramida),
// ne samo desna strana. Dokaz iz baze: 10376 → 2 (desna strana), ali 10350 i 10352 → 1 (linija zaustavljanja / STOP + žuti romb).
fix('prvenstvo-prolaza',
  'njihovo međusobno prvenstvo vraća se na obična pravila — desnu stranu i levo skretanje.',
  'njihovo međusobno prvenstvo rešava se po <b>opštim odredbama o prvenstvu prolaza</b> — dakle celom lestvicom: prvo policajac i semafor, pa <b>znakovi i oznake na kolovozu</b> (STOP, žuti romb, linija zaustavljanja), i tek ako ničega od toga nema — desna strana i levo skretanje. <span class="mut">Baza to proverava parovima skoro istih slika: bez ijednog znaka odlučuje desna strana, a čim se pojavi linija zaustavljanja ili STOP pred jednim vozilom — prednost ima drugo.</span>',
  'prvenstvo-dva-ista');

// --- SKRETANJE, blokirajući: „desna strana važi SAMO gde prvenstvo nije regulisano" je netačno kao opšta tvrdnja;
// na regulisanim raskrsnicama ostaje za međusobno prvenstvo (dokaz: pitanje 10438 → „pravilima saobraćaja").
fix('skretanje',
  'Zašto ovde ne važi „pravilo desne strane"? Zato što ono važi <b>samo na raskrsnici na kojoj prvenstvo nije regulisano na drugi način</b> (čl. 47).',
  'Zašto ovde ne odlučuje „pravilo desne strane"? Zato što se ono primenjuje tek kad prvenstvo <b>nije regulisano na drugi način</b>. Pažnja: na raskrsnici koja jeste regulisana (znakom, semaforom ili policajcem) pravila desne strane i levog skretanja i dalje važe — ali samo za <b>međusobno</b> prvenstvo onih koji istovremeno dobiju pravo prolaza.',
  'skretanje-cl47');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync(put, JSON.stringify(nacrti));
console.log('blokirajući nalazi ispravljeni');
