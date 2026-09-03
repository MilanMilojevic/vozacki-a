// Dopuna: pamćenje prikaza važi SAMO za ponovni prikaz istog ekrana (promena pisma), ne i za
// vraćanje strelicom na isto mesto u prolazu — tamo pitanje mora ponovo da se nudi (tako radi
// ispravka odgovora, i tako su pisani testovi).
import fs from 'node:fs';
const P = new URL('../../app.js', import.meta.url);
let a = fs.readFileSync(P, 'utf8');
let pao = 0;
const rep = (o, n, ime) => { const c = a.split(o).length - 1; if (c !== 1) { console.log('FAIL [' + ime + '] ' + c); pao++; return; } a = a.split(o).join(n); console.log('ok [' + ime + ']'); };

rep(`  const prikazPitanja = new Map();
  function renderQuestion(opts) {`,
`  const prikazPitanja = new Map();
  let ponovniPrikaz = false;   // true samo dok traje current.redraw() zbog promene pisma
  function renderQuestion(opts) {`, 'zastavica');
rep(`    const zapamceno = opts.recordKey ? prikazPitanja.get(opts.recordKey) : null;`,
`    const zapamceno = ponovniPrikaz && opts.recordKey ? prikazPitanja.get(opts.recordKey) : null;`, 'zapamceno samo pri ponovnom prikazu');
rep(`    current.redraw();          // ostani na istom ekranu, samo drugo pismo`,
`    ponovniPrikaz = true;      // pitanje na ekranu zadržava redosled ponuda, izbor i dat odgovor
    try { current.redraw(); } finally { ponovniPrikaz = false; }   // ostani na istom ekranu, samo drugo pismo`, 'redraw zastavica');

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(P, a);
console.log('--- upisano: app.js ---');
