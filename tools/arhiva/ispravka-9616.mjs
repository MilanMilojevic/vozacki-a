// Milan: „jel objašnjenje na drugoj slici tačno? meni se čini kontradiktorno mom odgovoru".
// Provereno u tekstu zakona: ZOBS čl. 36 st. 2 glasi doslovno „Na putu za saobraćaj vozila u oba
// smera na kome postoje tri saobraćajne trake, vozač ne sme vozilom da se kreće saobraćajnom trakom
// koja se nalazi uz levu ivicu puta u pravcu kretanja vozila." — bez ijednog izuzetka.
// Objašnjenje JESTE bilo tačno, ali je imalo dve slabosti: (1) nije imenovalo zamku, pa čovek koji
// je izabrao „smem radi preticanja" ne vidi zašto je pogrešio; (2) tvrdnja da srednja traka služi
// za preticanje „po pravilima" zvuči kao citat, a u čl. 36 je nema — to je zaključak, i tako mora
// da bude napisano. Ispravlja se i starija kopija istog teksta (dva mesta u izvoru).
import fs from 'node:fs';
const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');
let pao = 0;
const rep = (o, n, ime) => { const c = t.split(o).length - 1; if (c !== 1) { console.log('FAIL [' + ime + '] ' + c); pao++; return; } t = t.split(o).join(n); console.log('ok [' + ime + ']'); };

const NOVO = 'Zabrana je bezuslovna: na dvosmernom putu sa TRI trake ne smeš u traku uz LEVU ivicu puta u svom smeru (ZOBS cl. 36 st. 2). Zakon tu ne daje nijedan izuzetak — ni za preticanje, ni za obilazenje, ni zbog zastoja, jer je ta traka namenjena vozilima iz suprotnog smera; zato su sve tri ponude koje pocinju sa „sme" netacne. Odatle sledi i gde se pretice: srednjom trakom, po opstim pravilima preticanja.';

rep("X[9616] = { x: 'Dvosmerni put sa TRI trake: traka uz LEVU ivicu je zabranjena za tebe (srednja služi za preticanje po pravilima) — ZOBS čl. 34.' };",
  "X[9616] = { x: '" + NOVO + "' };", 'stari zapis (cl. 34)');
rep('X[9616] = { ...(X[9616] || {}), x: "Dvosmerni put sa TRI trake: traka uz LEVU ivicu je zabranjena za tebe (srednja služi za preticanje po pravilima) — ZOBS čl. 36 st. 2." };',
  'X[9616] = { ...(X[9616] || {}), x: "' + NOVO + '" };', 'novija kopija (cl. 36)');

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(P, t);
console.log('--- upisano ---');
