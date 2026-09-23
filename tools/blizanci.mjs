// BLIZANCI — pitanja skoro istog teksta, a DRUGOG tačnog odgovora.
//
// Mereno na Milanovom napretku (15.09.2026): od 59 pitanja na kojima je pogrešio dvaput ili
// više, 46 ima ovakvog blizanca, a kod tekstualnih pitanja sa blizancem ponovljena greška je
// DVAPUT češća nego bez njega (12,4% naspram 6,4%). Blizanac „sme / ne sme", „crveno / crveno
// i žuto", „60 / 82" u oznaci pneumatika — tačan odgovor jednog uči pogrešan odgovor drugog.
//
// Pravilo je mehaničko i uvek istinito (nijedna rečenica se ne piše rukom):
//  - oba pitanja su TEKSTUALNA (kod slika razliku nosi slika — to pokrivaju atlas i situacije);
//  - Žakarova sličnost reči (duže od 2 slova, latinica) je bar PRAG;
//  - skup tačnih odgovora se razlikuje;
//  - najviše NAJVISE blizanaca po pitanju, najsličniji prvi.
// Izlaz su SAMO brojevi pitanja: tekst i tačan odgovor aplikacija uzima iz data.js.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const PRAG = 0.6;
export const NAJVISE = 2;

const reci = (s) => new Set(String(s).toLowerCase().replace(/[^a-zčćžšđ0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2));
const tacno = (q) => q.ch.filter((c) => c.ok).map((c) => c.t.l.trim().toLowerCase()).sort().join('|');

export function napraviBlizance(pitanja) {
  const tekst = pitanja.filter((q) => !q.img);
  const R = new Map(tekst.map((q) => [q.id, reci(q.t.l)]));
  const T = new Map(tekst.map((q) => [q.id, tacno(q)]));
  const kandidati = new Map(tekst.map((q) => [q.id, []]));
  for (let i = 0; i < tekst.length; i++) {
    const a = tekst[i], ra = R.get(a.id);
    for (let j = i + 1; j < tekst.length; j++) {
      const b = tekst[j], rb = R.get(b.id);
      let pres = 0; for (const x of ra) if (rb.has(x)) pres++;
      const s = pres / ((ra.size + rb.size - pres) || 1);
      if (s < PRAG || T.get(a.id) === T.get(b.id)) continue;
      kandidati.get(a.id).push([s, b.id]);
      kandidati.get(b.id).push([s, a.id]);
    }
  }
  const out = {};
  for (const [id, l] of kandidati) {
    if (!l.length) continue;
    l.sort((x, y) => y[0] - x[0] || x[1] - y[1]);
    out[id] = l.slice(0, NAJVISE).map((x) => x[1]);
  }
  return out;
}

// Za bild: čita data.js pored alata (isti izvor koji koristi i aplikacija).
export function blizanciIzBaze() {
  const win = {};
  new Function('window', fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data.js'), 'utf8'))(win);
  return napraviBlizance(win.QUIZ.questions);
}

// samostalno: cd tools && node blizanci.mjs  → brojke za proveru
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const win = {};
  new Function('window', fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data.js'), 'utf8'))(win);
  const b = napraviBlizance(win.QUIZ.questions);
  const n = Object.keys(b).length;
  const veza = Object.values(b).reduce((a, l) => a + l.length, 0);
  console.log(`blizanci: ${n} pitanja ima blizanca (${veza} veza, prag ${PRAG}, najviše ${NAJVISE} po pitanju)`);
}
