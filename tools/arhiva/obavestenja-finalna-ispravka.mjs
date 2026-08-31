import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const put = SCRATCH + '/obavestenja-final.json';
let html = JSON.parse(fs.readFileSync(put, 'utf8')).html;
let fails = 0;
function rep(o, n, label) {
  const cnt = html.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  html = html.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// BLOKIRAJUĆI nalaz kontrole (provereno na slici 9132: izlaz sa autoputa je PLAVI kvadrat sa belom
// kosom strelicom — zelena važi za sam znak autoputa i za znakove TRAKA, ne i za izlaze).
rep('<td>autoput — i znak autoputa i znakovi traka i izlaza na autoputu (čl. 43)</td>',
    '<td>autoput — znak autoputa i znakovi <b>traka</b> na autoputu (čl. 43). <b>Pažnja:</b> znak „mesto izlaska sa autoputa" je <b>PLAVI</b> kvadrat sa belom kosom strelicom</td>', 'zelena-izlazi');

// SITNI nalaz 1 (provereno: na okruglom znaku 10854 strelice su iste dužine — razlika je u SMERU i boji)
rep('Na okruglom znaku je <b>crvena strelica kraća i okrenuta nagore</b>', 'Na okruglom znaku su obe strelice <b>iste dužine</b>: crvena je okrenuta nagore', 'suzenje-strelice');

// SITNI nalaz 2 (tabla sa oznakom evropskog puta je ZELENA, ne bela)
rep('table „ZONA", naselje, naziv ulice, brojevi puta', 'table „ZONA", naselje, naziv ulice, brojevi domaćih puteva (oznaka <b>evropskog</b> puta, npr. „E 75", je na <b>zelenoj</b> podlozi)', 'bela-brojevi');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync(put, JSON.stringify({ html }));
console.log('finalne ispravke primenjene; dužina ' + html.length);
