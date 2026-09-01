import fs from 'node:fs';
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = s.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  s = s.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// Nalaz druge kontrole, potvrđen na pitanju 8065: postoji mamac koji ne UBLAŽAVA nego SUŽAVA
// („ne sme samo u saobraćaju na javnom putu") — zabrana važi na svakom putu, ne samo javnom.
rep('<td>„na kratkom delu puta", „ako time ne ometa, odnosno ne ugrožava druge"</td>',
    '<td>„na kratkom delu puta", „ako time ne ometa, odnosno ne ugrožava druge", „ne sme <b>samo</b> na javnom putu"</td>', 'tabela-mamac');

rep('<p><b>1. Nula alkohola (ZOBS čl. 187).</b>',
    '<p class="mut"><b>Mamac koji ne ublažava nego sužava:</b> uz pitanje o vožnji pod dejstvom alkohola ponuđeno je i „ne sme da upravlja vozilom <b>samo</b> u saobraćaju na javnom putu". I to je netačno — zabrana važi na <b>svakom putu</b>, a javni put je samo jedna vrsta puta. Tačan odgovor glasi jednostavno: „ne sme da upravlja vozilom u saobraćaju na putu".</p>\n\n<p><b>1. Nula alkohola (ZOBS čl. 187).</b>', 'objasnjenje-javni-put');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
console.log('mamac javni put dodat');
