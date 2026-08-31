import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// Podaci iz PET zvaničnih izvlačenja simulacije (draw-2..6): 25 podoblasti ima FIKSAN broj
// pitanja na svakom testu; 12 se smenjuje za preostale slotove (0–1); ostale se nisu pojavile.
rep(`  // Redosled podoblasti prati redosled pitanja u bazi; vraća sledeću podoblast (ili prvu iz sledeće oblasti).`,
`  // Koliko pitanja podoblast nosi na PRAVOM ispitu — izmereno iz pet zvaničnih izvlačenja
  // (fiksne vrednosti su bile identične u svih pet; "0–1" se smenjuju za slobodne slotove).
  const NA_ISPITU = {
    103: '1', 118: '1', 131: '1', 132: '1', 133: '1', 134: '5', 135: '3', 136: '1', 137: '1',
    140: '1', 144: '1', 145: '1', 146: '1', 148: '1', 157: '2', 158: '2', 159: '1', 160: '1',
    161: '2', 162: '2', 166: '2', 170: '1', 172: '1', 175: '1', 178: '1',
    91: '0–1', 94: '0–1', 109: '0–1', 115: '0–1', 126: '0–1', 127: '0–1', 139: '0–1',
    142: '0–1', 147: '0–1', 155: '0–1', 156: '0–1', 165: '0–1',
  };

  // Redosled podoblasti prati redosled pitanja u bazi; vraća sledeću podoblast (ili prvu iz sledeće oblasti).`, 'podaci');

rep(`    naIspituTip: `, `    naIspituTip: `, 'proba-nema');   // namerno FAIL ako slučajno postoji

if (fails !== 1) { console.log('NEOČEKIVANO — prekid'); process.exit(1); }
fails = 0;   // proba-nema je očekivani promašaj

rep(`    endSimBtn: { l: '🏁 Simulacija ispita', c: '🏁 Симулација испита' },`,
`    endSimBtn: { l: '🏁 Simulacija ispita', c: '🏁 Симулација испита' },
    naIspitu: { l: 'na ispitu: #', c: 'на испиту: #' },
    naIspituTip: { l: 'Koliko pitanja iz ove podoblasti nosi svaki pravi ispit — izmereno iz pet zvaničnih izvlačenja simulacije.', c: 'Колико питања из ове подобласти носи сваки прави испит — измерено из пет званичних извлачења симулације.' },`, 'str');

// bedž u redu podoblasti na strani oblasti
rep(`        b.innerHTML = \`<span class="subName">\${escapeHtml(subShortName(sid))}</span>
          <span class="subCnt">\${sSeen}/\${sq.length}</span>
          <span class="subAcc">\${sAcc !== null ? sAcc + '%' : ''}</span>\`;`,
`        const naIsp = NA_ISPITU[sid];
        b.innerHTML = \`<span class="subName">\${escapeHtml(subShortName(sid))}\${naIsp ? \` <span class="subExam" title="\${escapeHtml(L('naIspituTip'))}">\${L('naIspitu').replace('#', naIsp)}</span>\` : ''}</span>
          <span class="subCnt">\${sSeen}/\${sq.length}</span>
          <span class="subAcc">\${sAcc !== null ? sAcc + '%' : ''}</span>\`;`, 'bedz');

c += `
/* "Na ispitu: N" — koliko pitanja podoblast nosi na pravom ispitu */
.subExam { display: inline-block; font-size: .72rem; font-weight: 600; color: var(--blue-d);
  background: var(--chipBg, rgba(44, 106, 160, .12)); border-radius: 999px; padding: 1px 8px;
  margin-left: 6px; white-space: nowrap; vertical-align: 1px; cursor: help; }
body.dark .subExam { background: rgba(95, 151, 201, .22); color: #9cc3e5; }
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('bedž na ispitu ugrađen');
