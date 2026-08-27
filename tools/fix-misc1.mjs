import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const c = s.split(o).length - 1;
  if (c !== 1) { console.log('FAIL [' + label + '] count=' + c); fails++; return; }
  s = s.split(o).join(n); console.log('ok  [' + label + ']');
}
function repX(id, newText) {
  const anchor = 'X[' + id + '] = ';
  const i = s.indexOf(anchor);
  if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL [X' + id + '] anchor'); fails++; return; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; return; }
  s = s.slice(0, i) + 'X[' + id + '] = { x: ' + JSON.stringify(newText) + ' }' + s.slice(end);
  console.log('ok  [X' + id + ']');
}

// 1) 8275 — ograda "u ispitnoj bazi" (važeći čl. 331 t. 52 je stroži)
repX(8275, 'Korišćenje DVE vozačke dozvole izdate od dve države istovremeno u ispitnoj bazi je SREDNJA klasa (novčani raspon, bez poena); po važećem zakonu prekršaj je oštriji (čl. 331 — uz mogućnost i zatvora). Ne smeju se u isto vreme KORISTITI dve dozvole dve države (ZOBS čl. 183) — ko ima i srpsku i stranu, u Srbiji koristi srpsku. Dupla upotreba otvara prostor za izigravanje evidencije kazni i poena.');

// 2) 8451 — pokriti i nalepnicu i "broj motora" mamac (Milanov zahtev)
repX(8451, 'Vozilo JEDNOZNAČNO određuje samo IDENTIFIKACIONA OZNAKA (broj šasije) koju određuje PROIZVOĐAČ — prati vozilo od fabrike do otpada. Registraciona nalepnica ne može: menja se pri svakoj registraciji i vezana je za rok, ne za vozilo. Mamac "i brojem motora" dodaje višak: motor je zamenljiv deo, pa njegov broj ne određuje vozilo — merodavna je samo oznaka proizvođača.');

// 3) SVG traka: natpisi ispod kolovoza, kraći, veći viewBox — ništa se ne prosipa
rep(`<svg viewBox="0 0 460 120" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <rect x="100" y="0" width="260" height="120" fill="#9aa7b4"/>`,
`<svg viewBox="0 0 460 140" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <rect x="100" y="0" width="260" height="120" fill="#9aa7b4"/>`, 'svg-viewbox');
rep(`  <text x="143" y="118" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">LEVO: krajnja leva</text>
  <text x="316" y="118" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">DESNO: krajnja desna</text>`,
`  <text x="143" y="134" text-anchor="middle" font-size="11" fill="#333" font-weight="bold">levo: krajnja leva</text>
  <text x="316" y="134" text-anchor="middle" font-size="11" fill="#333" font-weight="bold">desno: krajnja desna</text>`, 'svg-labels');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('misc1 primenjeno');
