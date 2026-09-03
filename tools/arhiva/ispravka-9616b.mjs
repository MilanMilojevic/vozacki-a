// Ispravka moje ispravke: prethodni tekst je pisan bez dijakritika (smes, netacne, opstim),
// pa je i preslovljena ćirilica ispala pogrešna („смес", „нетацне"). Ovde ide pravopisno tačan
// tekst. Bez ASCII navodnika u rečenici — oni su prošli put prekinuli string.
import fs from 'node:fs';
const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');

const NOVO = 'Zabrana je bezuslovna: na dvosmernom putu sa TRI trake ne smeš u traku uz LEVU ivicu puta u svom smeru (ZOBS čl. 36 st. 2). Zakon tu ne daje nijedan izuzetak, pa su obe ponude koje tu traku dozvoljavaju netačne — ni preticanje ni zastoj je ne otključavaju, jer je namenjena vozilima iz suprotnog smera. Odatle sledi i gde se pretiče: srednjom trakom, po opštim pravilima preticanja.';

const zapisi = [...t.matchAll(/X\[9616\] = \{[^\n]*\n/g)].map((m) => m[0]);
if (zapisi.length !== 2) { console.log('FAIL: očekivana 2 zapisa, nađeno ' + zapisi.length); process.exit(1); }
t = t.replace(zapisi[0], "X[9616] = { x: '" + NOVO + "' };\n");
t = t.replace(zapisi[1], "X[9616] = { ...(X[9616] || {}), x: '" + NOVO + "' };\n");
fs.writeFileSync(P, t);
console.log('ok — oba zapisa zamenjena pravopisno tačnim tekstom');
