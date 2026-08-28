import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const c = s.split(o).length - 1;
  if (c !== 1) { console.log('FAIL [' + label + '] count=' + c); fails++; return; }
  s = s.split(o).join(n); console.log('ok  [' + label + ']');
}
rep('|cm³|\\bAM\\b', '|cm³|\\bkg\\b|\\bAM\\b', 'kg-guard');
rep('<td>granice kao laki tricikl + masa praznog vozila do 350 kg</td>', '<td>granice kao laki tricikl + masa praznog vozila do 350 kg (bez baterija)</td>', 'laki-row');
rep('<td>ostali četvorocikli: masa do 400 kg (teretni 550 kg), snaga do 15 kW</td>', '<td>ostali četvorocikli: masa praznog vozila do 400 kg (teretni 550 kg; bez baterija), snaga do 15 kW</td>', 'teski-row');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('primenjeno');
