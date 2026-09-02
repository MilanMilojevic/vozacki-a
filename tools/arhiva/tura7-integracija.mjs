// Tura 7: dopune četiri kartice. Fragmenti su prošli adversarijalnu kontrolu
// (kontrolori otvarali bazu i slike); dve ispravke kontrole potvrđene i lično:
// #10542 (kratka umesto dugih VAŽI i za zaustavljeno vozilo) i premeštanje
// zamke „preticanje ispred prelaza" na karticu 'preticanje' (pitanja 9793/9860
// su podoblast 134 → BYSUB[134]='preticanje', ne 'pesaci-bicikli').
// Umeće se na KRAJ html šablona kartice, pre zatvarajućeg beketika.
import fs from 'node:fs';

const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
let t = fs.readFileSync('../build-explanations.mjs', 'utf8');   // NUL bajtovi ostaju netaknuti

const PLAN = [
  ['vozilo-tehnika', 't7-vozilo-tehnika.html'],
  ['autoput', 't7-autoput.html'],
  ['svetla', 't7-svetla.html'],
  ['preticanje', 't7-pesaci-bicikli.html'],   // premešteno po nalazu kontrole
];

let pao = 0;
for (const [kljuc, dat] of PLAN) {
  const frag = fs.readFileSync(SCRATCH + '/' + dat, 'utf8').trim();
  if (frag.length < 500) { console.log(`FAIL [${kljuc}] fragment sumnjivo kratak: ${frag.length}`); pao++; continue; }
  if (frag.includes('`') || frag.includes('${')) { console.log(`FAIL [${kljuc}] fragment sadrži beketik ili \${`); pao++; continue; }
  const start = t.indexOf(`CARDS['${kljuc}'] = {`);
  if (start === -1) { console.log(`FAIL [${kljuc}] nema deklaracije`); pao++; continue; }
  const hStart = t.indexOf('html: `', start);
  if (hStart === -1 || hStart - start > 300) { console.log(`FAIL [${kljuc}] nema html polja blizu deklaracije`); pao++; continue; }
  const kraj = t.indexOf('`', hStart + 7);
  const sledeca = t.indexOf("CARDS['", start + 10);
  if (kraj === -1 || (sledeca !== -1 && kraj > sledeca)) { console.log(`FAIL [${kljuc}] zatvarajući beketik nije pre sledeće kartice`); pao++; continue; }
  t = t.slice(0, kraj) + '\n' + frag + '\n' + t.slice(kraj);
  console.log(`ok [${kljuc}] +${frag.length} znakova`);
}

if (pao) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', t);
console.log('--- upisano; sledi build ---');
