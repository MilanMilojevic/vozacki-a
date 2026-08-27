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

// 1) pomoćnik: kratko ime podoblasti (deo pre zagrade, bez završnog ";")
a = rep(a, 'function secInfo(key) {',
`function subShortName(sid) {
    let n = T({ l: D.subs[sid].l, c: D.subs[sid].c });
    const cut = n.indexOf(' (');
    if (cut > 0) n = n.slice(0, cut);
    return n.replace(/[;\\s]+$/, '');
  }
  function secInfo(key) {`, 'helper');

// 2) početna: addSub dobija title; podoblast koristi kratko ime + pun naziv u tooltip
a = rep(a, `const addSub = (labelHtml, key, sSeen, sTot, sGood) => {
          const sr = document.createElement('button'); sr.type = 'button'; sr.className = 'catRow catSubRow';`,
`const addSub = (labelHtml, key, sSeen, sTot, sGood, title) => {
          const sr = document.createElement('button'); sr.type = 'button'; sr.className = 'catRow catSubRow';
          if (title) sr.title = title;`, 'addsub-title');
a = rep(a, `addSub(escapeHtml(T({ l: D.subs[sid].l, c: D.subs[sid].c })), 's' + sid, sSeen, sq.length, sGood);`,
`addSub(escapeHtml(subShortName(sid)), 's' + sid, sSeen, sq.length, sGood, T({ l: D.subs[sid].l, c: D.subs[sid].c }));`, 'home-shortname');

// 3) statistika: isto kratko ime + tooltip na sub-redovima
a = rep(a, `          const row = document.createElement('tr');
          row.className = 'statSubRow';
          row.innerHTML = \`<td class="statSubName">\${escapeHtml(T({ l: D.subs[sid].l, c: D.subs[sid].c }))}</td>`,
`          const row = document.createElement('tr');
          row.className = 'statSubRow';
          row.title = T({ l: D.subs[sid].l, c: D.subs[sid].c });
          row.innerHTML = \`<td class="statSubName">\${escapeHtml(subShortName(sid))}</td>`, 'stats-shortname');

// 4) CSS: red podoblasti se NE pomera (kolone ostaju poravnate) — uvlači se samo tekst imena; imena max 2 reda
c = rep(c, `.catSubRow { margin: 3px 0 3px 10px; padding-left: 12px; border-left: 3px solid var(--line); }
.catSubRow .catName { font-size: .84rem; color: var(--mut); }`,
`.catSubRow { margin: 3px 0; }
.catSubRow .catName { font-size: .84rem; color: var(--mut); padding-left: 24px; box-sizing: border-box;
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`, 'css-subrow');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('poliranje primenjeno');
