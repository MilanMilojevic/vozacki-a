import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// Red istorije: iste kolone za svaki pokušaj (datum · rezultat · ishod · greške · strelica).
// Ranije se broj grešaka prikazivao SAMO kod starih zapisa (bez detaljnog pregleda),
// pa su redovi izgledali nedosledno.
a = rep(a, `          const wrongN = s.qs ? '' : \` <span class="mut">(\${(s.wrong || []).length} ✗)</span>\`;
          return \`<button class="histRow histBtn" data-sim="\${S.sims.length - 1 - ri}"><span class="mut">\${ds}</span><b>\${s.score}/\${s.total}</b>
            <span class="pill \${s.passed ? 'pass' : 'fail'}">\${s.passed ? L('passed') : L('failed')}</span>\${wrongN}<span class="mut" style="margin-left:auto">›</span></button>\`;`,
`          const brGresaka = (s.wrong || []).length;
          return \`<button class="histRow histBtn" data-sim="\${S.sims.length - 1 - ri}">
            <span class="histDate mut">\${ds}</span>
            <b class="histScore">\${s.score}/\${s.total}</b>
            <span class="histPill"><span class="pill \${s.passed ? 'pass' : 'fail'}">\${s.passed ? L('passed') : L('failed')}</span></span>
            <span class="histWrong mut">\${brGresaka ? brGresaka + ' ✗' : ''}</span>
            <span class="histArrow mut">›</span></button>\`;`, 'hist-row');

// Kolone: sve stavke u istoj mreži, brojevi desno poravnati
c = rep(c, `.histRow { display: flex; gap: 12px; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--line); font-size: .92rem; flex-wrap: wrap; }`,
`.histRow { display: grid; grid-template-columns: 7.5em 4.5em 1fr 3.5em 1em; gap: 10px; align-items: center;
  padding: 6px 0; border-bottom: 1px solid var(--line); font-size: .92rem; }
.histScore { text-align: right; font-variant-numeric: tabular-nums; }
.histPill { justify-self: start; }
.histWrong { text-align: right; font-variant-numeric: tabular-nums; }
.histArrow { text-align: right; }
@media (max-width: 460px) {
  .histRow { grid-template-columns: 1fr auto auto; row-gap: 2px; }
  .histDate { grid-column: 1 / -1; }
}`, 'hist-css');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('istorija simulacija poravnata');
