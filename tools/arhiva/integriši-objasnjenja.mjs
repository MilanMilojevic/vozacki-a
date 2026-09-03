// Integrator objašnjenja za slikovna pitanja: uzima JSON sa {id, x} i upisuje X[id] = { x: '...' }
// u tools/build-explanations.mjs, neposredno pre sidra 'const BYSUB = {'.
// Datoteka ima NUL bajtove, pa se seče po sidru (indexOf), nikad regeksom preko celog teksta.
// Pokretanje:  node tools/arhiva/integriši-objasnjenja.mjs <putanja-do-json>
// JSON: niz objekata { id: <qId>, x: '<tekst latinicom>' }.
import fs from 'node:fs';

const put = process.argv[2];
if (!put) { console.log('FAIL: nema putanje do JSON-a'); process.exit(1); }
const stavke = JSON.parse(fs.readFileSync(put, 'utf8'));
if (!Array.isArray(stavke) || !stavke.length) { console.log('FAIL: JSON nije neprazan niz'); process.exit(1); }

const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');
const SIDRO = 'const BYSUB = {';
const i = t.indexOf(SIDRO);
if (i === -1 || t.indexOf(SIDRO, i + 1) !== -1) { console.log('FAIL: sidro BYSUB nije jedinstveno'); process.exit(1); }

// provere pre upisa — ništa se ne upisuje ako ijedna padne
let pao = 0;
const vidjeni = new Set();
for (const s of stavke) {
  const ime = '#' + s.id;
  if (!Number.isInteger(s.id)) { console.log('FAIL ' + ime + ': id nije ceo broj'); pao++; continue; }
  if (vidjeni.has(s.id)) { console.log('FAIL ' + ime + ': duplikat u ulazu'); pao++; continue; }
  vidjeni.add(s.id);
  if (t.includes('X[' + s.id + ']')) { console.log('FAIL ' + ime + ': X[' + s.id + '] VEĆ postoji u izvoru'); pao++; continue; }
  const x = String(s.x || '');
  if (x.length < 150 || x.length > 700) { console.log('FAIL ' + ime + ': dužina ' + x.length + ' (dozvoljeno 150-700)'); pao++; }
  if (x.includes('`') || x.includes('${')) { console.log('FAIL ' + ime + ': beketik ili dolar-vitičasta'); pao++; }
  if (/[Ѐ-ӿ]/.test(x)) { console.log('FAIL ' + ime + ': ćirilica u izvoru (piše se latinica, build presloviti)'); pao++; }
  if (/\b\d{3,5}\s*(din|дин|RSD)\b/i.test(x)) { console.log('FAIL ' + ime + ': dinarski iznos'); pao++; }
  if (/kandidat/i.test(x)) { console.log('NAPOMENA ' + ime + ': koristi reč kandidat, a ton projekta je obraćanje sa ti'); }
}
if (pao) { console.log('\n*** NE PIŠEM — ' + pao + ' problema ***'); process.exit(1); }

// jednostruki apostrof u tekstu → escape, jer se upisuje unutar '...'
const red = (s) => "X[" + s.id + "] = { x: '" + String(s.x).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "' };";
const blok = '// --- objašnjenja za slikovna pitanja (talas ' + (process.env.TALAS || '1') + ') ---\n'
  + stavke.map(red).join('\n') + '\n\n';
t = t.slice(0, i) + blok + t.slice(i);
fs.writeFileSync(P, t);
console.log('upisano objašnjenja: ' + stavke.length + ' (pre sidra BYSUB)');
console.log('sledi: cd tools && node build-explanations.mjs');
