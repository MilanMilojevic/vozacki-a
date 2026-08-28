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

// naslovi grupa
a = rep(a, "guideOpen: { l: 'Prikaži', c: 'Прикажи' },",
`guideOpen: { l: 'Prikaži', c: 'Прикажи' },
    grp1: { l: '1 · Osnovni pojmovi — počni odavde', c: '1 · Основни појмови — почни одавде' },
    grp2: { l: '2 · Ko ide prvi — prvenstvo i signalizacija', c: '2 · Ко иде први — првенство и сигнализација' },
    grp3: { l: '3 · Radnje vozilom', c: '3 · Радње возилом' },
    grp4: { l: '4 · Posebne situacije', c: '4 · Посебне ситуације' },
    grp5: { l: '5 · Propisi, dozvole i posledice', c: '5 · Прописи, дозволе и последице' },`, 'str');

// redosled i grupisanje kartica u pojmovniku
a = rep(a, `      pk.innerHTML = \`<h3>📖 \${L('pojmovnik')}</h3><p class="mut" style="font-size:.82rem;margin-bottom:6px">\${L('pojmovnikSub')}</p>\`
        + cardKeys.map((k) => \`<div class="pojEntry"><button class="explCardBtn pojBtn">📖 \${escapeHtml(T(EX.cards[k].t))}</button><div class="explCard" style="display:none">\${T(EX.cards[k].h)}</div></div>\`).join('');`,
`      // Redosled kartica prati predloženi tok učenja iz vodiča (od pojmova ka posledicama)
      const GRUPE = [
        ['grp1', ['slicni-pojmovi', 'put-pojmovi', 'kategorije-vozila', 'brzine']],
        ['grp2', ['prvenstvo-prolaza', 'znakovi-porodice', 'semafori', 'oznake-kolovoz']],
        ['grp3', ['skretanje', 'preticanje', 'parkiranje', 'parking-table', 'pokazivaci', 'svetla']],
        ['grp4', ['pesaci-bicikli', 'pruga', 'autoput', 'nezgoda', 'razno-pravila']],
        ['grp5', ['dozvole', 'vozilo-tehnika', 'iskljucenje', 'kazne', 'kaznene-klase', 'zamke-odgovori']],
      ];
      const stavljene = new Set();
      let html = \`<h3>📖 \${L('pojmovnik')}</h3><p class="mut" style="font-size:.82rem;margin-bottom:6px">\${L('pojmovnikSub')}</p>\`;
      const entry = (k) => \`<div class="pojEntry"><button class="explCardBtn pojBtn">📖 \${escapeHtml(T(EX.cards[k].t))}</button><div class="explCard" style="display:none">\${T(EX.cards[k].h)}</div></div>\`;
      for (const [gk, keys] of GRUPE) {
        const imaju = keys.filter((k) => cardKeys.includes(k));
        if (!imaju.length) continue;
        html += \`<div class="pojGroup">\${escapeHtml(L(gk))}</div>\`;
        for (const k of imaju) { html += entry(k); stavljene.add(k); }
      }
      const ostatak = cardKeys.filter((k) => !stavljene.has(k));
      for (const k of ostatak) html += entry(k);
      pk.innerHTML = html;`, 'order');

c += `
/* Grupe u pojmovniku */
.pojGroup { margin: 14px 0 4px; font-size: .8rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--mut); border-bottom: 1px solid var(--line); padding-bottom: 4px; }
.pojGroup:first-of-type { margin-top: 6px; }
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('pojmovnik poređan po toku učenja');
