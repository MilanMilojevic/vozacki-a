import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;

// nova kartica: dopunske table uz znak "Parkiralište" — princip mesto × položaj
if (s.includes("CARDS['parking-table']")) { console.log('FAIL: kartica postoji'); process.exit(1); }
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('FAIL anchor'); process.exit(1); }

// mala tabla: gornja polovina = trotoar, donja = kolovoz, linija = ivičnjak
const tab = (pos, place) => {
  // pos: 'par' | 'upr' | 'ugao'; place: 'kolovoz' | 'trotoar' | 'oba'
  const yBase = place === 'trotoar' ? 26 : place === 'oba' ? 44 : 62;
  const rot = pos === 'par' ? 90 : pos === 'ugao' ? 55 : 0;
  return `<svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 ${yBase}) rotate(${rot}) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg>`;
};
const cell = (pos, place, label, sub) => `<div class="signCell">${tab(pos, place)}<b>${label}</b><span>${sub}</span></div>`;

const block = `
// --- Kartica: dopunske table uz znak "Parkiralište" (princip mesto × položaj) ---
CARDS['parking-table'] = {
  title: 'Dopunske table uz znak "Parkiralište"',
  html: \`
<p>Tabla ti kaže dve stvari odjednom: <b>GDE</b> se parkira (u odnosu na crtu ivičnjaka) i <b>KAKO</b> vozilo stoji.</p>
<p class="mut">Crta na tabli je ivičnjak: <b>iznad crte = trotoar</b>, <b>ispod crte = kolovoz</b>, <b>preko crte = i trotoar i kolovoz</b>.</p>
<div class="signRow lineRow">
  ${cell('par', 'kolovoz', 'NA KOLOVOZU · paralelno', 'vozilo uz podužnu osu kolovoza, celo ispod crte')}
  ${cell('upr', 'kolovoz', 'NA KOLOVOZU · upravno', 'vozilo pod pravim uglom na osu kolovoza')}
  ${cell('ugao', 'kolovoz', 'NA KOLOVOZU · pod uglom', 'vozilo koso u odnosu na osu kolovoza')}
</div>
<div class="signRow lineRow">
  ${cell('par', 'trotoar', 'NA TROTOARU · paralelno', 'celo vozilo iznad crte')}
  ${cell('upr', 'trotoar', 'NA TROTOARU · upravno', 'celo vozilo iznad crte, pod pravim uglom')}
  ${cell('ugao', 'trotoar', 'NA TROTOARU · pod uglom', 'celo vozilo iznad crte, koso')}
</div>
<div class="signRow lineRow">
  ${cell('par', 'oba', 'TROTOAR I KOLOVOZ · paralelno', 'vozilo preseca crtu — pola gore, pola dole')}
  ${cell('upr', 'oba', 'TROTOAR I KOLOVOZ · upravno', 'preseca crtu, pod pravim uglom')}
  ${cell('ugao', 'oba', 'TROTOAR I KOLOVOZ · pod uglom', 'preseca crtu, koso')}
</div>
<p class="mut">Na trotoaru se parkira samo tamo gde je to signalizacijom dozvoljeno, i mora ostati slobodan prolaz za pešake najmanje 1,60 m (ZOBS čl. 66).</p>\`,
};
`;
const links = [9214, 9215, 9226, 9227, 9228, 9229, 9230, 9234, 9235, 10614]
  .map((id) => `X[${id}] = { ...(X[${id}]||{}), card: 'parking-table' };`).join('\n') + '\n\n';

s = s.slice(0, ti) + block + links + s.slice(ti);
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('kartica parking-table + 10 veza');
