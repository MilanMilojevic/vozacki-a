import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function repX(id, newText) {
  const anchor = 'X[' + id + '] = ';
  const i = s.indexOf(anchor);
  if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL [X' + id + '] anchor'); fails++; return; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; return; }
  s = s.slice(0, i) + 'X[' + id + '] = { x: ' + JSON.stringify(newText) + ' }' + s.slice(end);
  console.log('ok  [X' + id + ']');
}
repX(8274, 'Vožnja sa dozvolom kojoj je rok istekao PRE VIŠE OD ŠEST MESECI u ispitnoj bazi je u SREDNJOJ klasi (novčani raspon + poeni). Šest meseci je i po važećem zakonu prekretnica — do šest meseci blaži prekršaj (čl. 333), preko toga teži (čl. 332a) — s tim što su danas obe kazne fiksni iznosi bez poena. Rok važenja postoji da vozač periodično prođe proveru uslova za upravljanje: što duže voziš sa isteklom dozvolom, duže si bez te provere.');
repX(8275, 'Korišćenje DVE vozačke dozvole izdate od dve države istovremeno = SREDNJA klasa (novčani raspon, bez poena). Ne smeju se u isto vreme KORISTITI dve dozvole dve države (ZOBS čl. 183) — ko ima i srpsku i stranu, u Srbiji koristi srpsku. Dupla upotreba otvara prostor za izigravanje evidencije kazni i poena.');
repX(8278, 'Sadržina od 1,80 mg/ml je "veoma teška alkoholisanost" (kategorije iz ZOBS čl. 187). U ispitnoj bazi ovo je SREDNJA klasa sa mnogo poena; po važećem zakonu opseg više od 1,20 do 2,00 mg/ml spada u NAJTEŽU klasu (čl. 330), a preko 2,00 je nasilnička vožnja — još strože. U svakom slučaju: skoro vrh lestvice.');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('19b ispravke primenjene');
