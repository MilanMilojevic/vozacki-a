import fs from 'node:fs';
let h = fs.readFileSync('../index.html', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// 1) index.html: leva i desna grupa u zasebne omotače (dve NEZAVISNE grid stavke)
h = rep(h, `    <div class="menuGrid">`, `    <div class="hCol hColL">
    <div class="menuGrid">`, 'wrap-open-L');
h = rep(h, `    <div class="card">
      <h3 id="hCats"></h3>
      <div id="catBars"></div>
    </div>
    <div class="card" id="simHistory"></div>`,
`    <div class="card" id="simHistory"></div>
    <div class="card small" id="dataTools"></div>
    </div>
    <div class="hCol hColR">
    <div class="card">
      <h3 id="hCats"></h3>
      <div id="catBars"></div>
    </div>
    </div>`, 'wrap-move');
h = rep(h, `    <div class="card" id="faqCard"></div>
    <div class="card small" id="dataTools"></div>
  </section>`, `    <div class="card" id="faqCard"></div>
  </section>`, 'wrap-close');

// 2) CSS: stari grid-areas raspored zameni omotačima
const oldGrid = `  #view-home { display: grid; grid-template-columns: 1fr 1fr; column-gap: 18px; align-items: start;
    grid-template-areas: 'sum sum' 'menu cats' 'hist cats' 'tools cats' 'poj poj' 'faq faq'; }
  #view-home > #homeSummary { grid-area: sum; }
  #view-home > .menuGrid { grid-area: menu; }
  #view-home > .card:has(#catBars) { grid-area: cats; }
  #view-home > #simHistory { grid-area: hist; }
  #view-home > #dataTools { grid-area: tools; }
  #view-home > #pojmovnikCard { grid-area: poj; }
  #view-home > #faqCard { grid-area: faq; }`;
const newGrid = `  #view-home { display: grid; grid-template-columns: 1fr 1fr; column-gap: 18px; align-items: start; }
  #view-home > #homeSummary, #view-home > #pojmovnikCard, #view-home > #faqCard { grid-column: 1 / -1; }
  .hColL { grid-column: 1; } .hColR { grid-column: 2; }`;
c = rep(c, oldGrid, newGrid, 'css-grid');

// 3) na uskim ekranima omotači nestaju, a redosled ostaje kao ranije
c += `
/* Uski ekrani: omotači se "rastvaraju" — redosled kao pre uvođenja kolona */
@media (max-width: 1199px) {
  #view-home { display: flex; flex-direction: column; }
  .hCol { display: contents; }
  #view-home > #homeSummary { order: 1; }
  .hColL > .menuGrid { order: 2; }
  .hColR > .card { order: 3; }
  .hColL > #simHistory { order: 4; }
  #view-home > #pojmovnikCard { order: 5; }
  #view-home > #faqCard { order: 6; }
  .hColL > #dataTools { order: 7; }
}
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../index.html', h);
fs.writeFileSync('../style.css', c);
console.log('layout razdvojen u nezavisne kolone');
