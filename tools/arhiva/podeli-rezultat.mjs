import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// tekstovi
rep(`    naIspitu: { l: 'na ispitu: #', c: 'на испиту: #' },`,
`    naIspitu: { l: 'na ispitu: #', c: 'на испиту: #' },
    shareBtn: { l: '📷 Sačuvaj sliku rezultata', c: '📷 Сачувај слику резултата' },
    shareTitle: { l: 'Simulacija ispita — A kategorija', c: 'Симулација испита — А категорија' },
    shareSaved: { l: 'Slika je preuzeta', c: 'Слика је преузета' },
    shareFail: { l: 'Slika nije mogla da se napravi', c: 'Слика није могла да се направи' },
    freeNote: { l: 'besplatna vežbaonica', c: 'бесплатна вежбаоница' },`, 'str');

// crtanje slike rezultata + deljenje ili preuzimanje
rep(`  // ---------- Prijava greške/predloga ----------`,
`  // ---------- Slika rezultata simulacije (za deljenje) ----------
  // Crta se u samom pregledaču; nema ni imena ni ijednog ličnog podatka — samo rezultat i datum.
  function nacrtajRezultat(rec) {
    const W = 1080, H = 1080;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const polozio = !!rec.passed;

    g.fillStyle = polozio ? '#12603a' : '#7a2620';
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.08)';
    g.beginPath(); g.moveTo(0, H * 0.72); g.lineTo(W, H * 0.6); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)';
    g.lineWidth = 10; g.setLineDash([54, 40]);
    g.beginPath(); g.moveTo(0, H * 0.88); g.lineTo(W, H * 0.76); g.stroke();
    g.setLineDash([]);

    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.font = '600 40px "Segoe UI", Arial, sans-serif';
    g.fillText(L('shareTitle'), W / 2, 150);

    g.font = '700 210px "Segoe UI", Arial, sans-serif';
    g.fillText(rec.score + ' / ' + rec.total, W / 2, 400);
    g.font = '500 46px "Segoe UI", Arial, sans-serif';
    g.fillText(L('points'), W / 2, 462);

    g.font = '700 74px "Segoe UI", Arial, sans-serif';
    g.fillText(polozio ? L('passed') : L('failed'), W / 2, 590);

    const d = new Date(rec.d || Date.now());
    const ds = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear() + '.';
    g.font = '400 38px "Segoe UI", Arial, sans-serif';
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText(ds + '  ·  ' + Q.length + ' ' + L('answered').toLowerCase(), W / 2, 660);

    g.font = '600 34px "Segoe UI", Arial, sans-serif';
    g.fillStyle = 'rgba(255,255,255,.95)';
    g.fillText('milanmilojevic.github.io/vozacki-a', W / 2, H - 90);
    g.font = '400 28px "Segoe UI", Arial, sans-serif';
    g.fillStyle = 'rgba(255,255,255,.75)';
    g.fillText(L('shareTitle').split('—')[0].trim() + ' · ' + L('freeNote'), W / 2, H - 46);
    return c;
  }

  async function podeliRezultat(rec) {
    try {
      const c = nacrtajRezultat(rec);
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
      if (!blob) throw new Error('nema slike');
      const fajl = new File([blob], 'vozacki-a-rezultat.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [fajl] })) {
        await navigator.share({ files: [fajl], title: L('shareTitle') });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vozacki-a-rezultat.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      alert(L('shareFail'));
    }
  }

  // ---------- Prijava greške/predloga ----------`, 'crtanje');

// dugme na ekranu rezultata
rep(`        \${fresh ? \`<button class="primary" id="btnSimAgain">\${L('newSim')}</button>\` : ''}
        <button class="linklike" data-nav="home">\${L('backHome')}</button>`,
`        \${fresh ? \`<button class="primary" id="btnSimAgain">\${L('newSim')}</button>\` : ''}
        <button class="secondary" id="btnShareRes">\${L('shareBtn')}</button>
        <button class="linklike" data-nav="home">\${L('backHome')}</button>`, 'dugme');

rep(`    const ba = rc.querySelector('#btnSimAgain');
    if (ba) ba.addEventListener('click', startSim);`,
`    const ba = rc.querySelector('#btnSimAgain');
    if (ba) ba.addEventListener('click', startSim);
    const bs = rc.querySelector('#btnShareRes');
    if (bs) bs.addEventListener('click', () => podeliRezultat(rec));`, 'veza');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
console.log('deljenje rezultata ugrađeno');
