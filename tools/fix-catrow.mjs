import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// STR: opis dva različita klika
a = rep(a, "catExpand: { l: 'Klikni za podoblasti', c: 'Кликни за подобласти' },",
`catExpand: { l: 'Prikaži podoblasti', c: 'Прикажи подобласти' },
    catOpen: { l: 'Otvori oblast (spisak pitanja i vežbanje)', c: 'Отвори област (списак питања и вежбање)' },`, 'str');

// red oblasti: strelica = pregled podoblasti, ostatak reda = otvaranje oblasti
a = rep(a, `      const row = document.createElement('button'); row.type = 'button'; row.className = 'catRow';
      row.title = L('catExpand');
      row.innerHTML = \`<span class="catName"><span class="catChev">▸</span>\${escapeHtml(T(c))}</span>
        <span class="catBar"><span class="seen" style="width:\${100 * seen / qq.length}%"></span><span class="good" style="width:\${100 * good / qq.length}%"></span></span>
        <span class="catCnt">\${seen}/\${qq.length}</span>\`;
      row.addEventListener('click', () => {
        const open = row.classList.toggle('open');
        row.querySelector('.catChev').textContent = open ? '▾' : '▸';`,
`      const row = document.createElement('div'); row.className = 'catRow';
      row.innerHTML = \`<button type="button" class="catChevBtn" aria-expanded="false" title="\${escapeHtml(L('catExpand'))}" aria-label="\${escapeHtml(L('catExpand'))}">▸</button>
        <button type="button" class="catMain" title="\${escapeHtml(L('catOpen'))}"><span class="catName">\${escapeHtml(T(c))}</span>
        <span class="catBar"><span class="seen" style="width:\${100 * seen / qq.length}%"></span><span class="good" style="width:\${100 * good / qq.length}%"></span></span>
        <span class="catCnt">\${seen}/\${qq.length}</span></button>\`;
      row.querySelector('.catMain').addEventListener('click', () => browse('c' + c.id));
      row.querySelector('.catChevBtn').addEventListener('click', () => {
        const open = row.classList.toggle('open');
        const chev = row.querySelector('.catChevBtn');
        chev.textContent = open ? '▾' : '▸';
        chev.setAttribute('aria-expanded', open ? 'true' : 'false');`, 'row-split');

// ukloni stari red "Sva pitanja oblasti ›" — sada je to klik na sam red
a = rep(a, `        addSub(\`<b>\${escapeHtml(L('wholeCat'))} ›</b>\`, 'c' + c.id, 0, null, 0);\n`, '', 'drop-allrow');

// (stari klik na ceo red zamenjen je već u koraku row-split)

// CSS: red je sada kontejner sa dva dugmeta
c = rep(c, '.catRow { display: flex; align-items: center; gap: 10px; margin: 7px 0; cursor: pointer; }\n.catRow:hover .catName { color: var(--blue); }',
`.catRow { display: flex; align-items: center; gap: 6px; margin: 7px 0; }
.catMain { display: flex; align-items: center; gap: 10px; flex: 1; background: none; border: none; padding: 2px 0; font: inherit; color: inherit; text-align: left; cursor: pointer; }
.catMain:hover .catName { color: var(--blue); }
.catChevBtn { background: none; border: none; color: var(--mut); font-size: .8rem; padding: 4px 6px; border-radius: 6px; cursor: pointer; line-height: 1; }
.catChevBtn:hover { background: var(--optHover); color: var(--blue); }`, 'css-row');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('red oblasti: strelica ↔ pregled, red ↔ otvaranje');
