import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const c = s.split(o).length - 1;
  if (c !== 1) { console.log('FAIL [' + label + '] count=' + c); fails++; return; }
  s = s.split(o).join(n); console.log('ok  [' + label + ']');
}
// 8296: čl. 35 → čl. 32 (uključivanje: uveri se st. 3 + obavesti st. 4)
rep('Dužnost je dvostruka: uveri se + najavi (ZOBS čl. 35) — oba dela moraju.',
    'Dužnost je dvostruka: uveri se + najavi (ZOBS čl. 32) — oba dela moraju.', '8296-cl32');
// 8305: čl. 55 → čl. 57 (preticanje ispred raskrsnice; izuzeci samo na putu SA prvenstvom)
rep('Preticanje NEPOSREDNO ISPRED RASKRSNICE na putu koji nije sa prvenstvom prolaza = srednja klasa sa malo poena (zabrana iz ZOBS čl. 55). Ispred raskrsnice pažnja mora biti na prvenstvu i pešacima, ne na manevru preticanja.',
    'Preticanje NEPOSREDNO ISPRED RASKRSNICE na putu koji nije sa prvenstvom prolaza = srednja klasa sa malo poena (zabrana iz ZOBS čl. 57 — izuzeci postoje samo na putu SA prvenstvom prolaza). Ispred raskrsnice pažnja mora biti na prvenstvu i pešacima, ne na manevru preticanja.', '8305-cl57');
// 8323: "blaža klasa" → imenovana klasa
rep('pa je 85 km/h manje prekoračenje — zato blaža klasa sa poenima.',
    'pa je 85 km/h manje prekoračenje — zato srednja klasa sa poenima, blaže nego što bi ista brzina prošla u naselju.', '8323-klasa');
// 8341: old-law napomena kao kod 8340
rep('Odgovornost je za propust nadzora nad sopstvenim vozilom.\' };',
    'Odgovornost je za propust nadzora nad sopstvenim vozilom. Napomena: ovo je pravilo ranijeg zakona — danas vlasnik odgovara ako policiji ne otkrije identitet vozača (čl. 247), i to znatno strože.\' };', '8341-napomena');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('19c ispravke primenjene');
