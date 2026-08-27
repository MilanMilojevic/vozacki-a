import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let h = fs.readFileSync('../index.html', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// version.js — izvor istine o verziji
fs.writeFileSync('../version.js', 'window.APP_V = 17;\n');
console.log('ok  [version.js]');

// index.html: učitaj version.js pre svega
h = rep(h, '<script src="data.js?v=17"></script>',
'<script src="version.js?v=17"></script>\n<script src="data.js?v=17"></script>', 'html-version');

// STR
a = rep(a, "tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },",
`tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },
    updNote: { l: 'Stigla je nova verzija aplikacije.', c: 'Стигла је нова верзија апликације.' },
    updBtn: { l: 'Osveži', c: 'Освежи' },`, 'str-upd');

// provera verzije za dugoživeće tabove (radi i na file:// — preko <script> umetanja)
a = rep(a, `  applyScript();
  applyTheme();
  applyFont();`,
`  // Dugoživeći tab: na povratak u tab (i na ~5 min) proveri da li postoji nova verzija fajlova.
  const BOOT_V = window.APP_V || 0;
  function checkVersion() {
    if (!BOOT_V || document.getElementById('updBar')) return;
    const sc = document.createElement('script');
    sc.src = 'version.js?ts=' + Date.now();
    sc.onload = () => {
      sc.remove();
      if (window.APP_V !== BOOT_V && !document.getElementById('updBar')) {
        const b = document.createElement('div');
        b.id = 'updBar';
        b.innerHTML = \`<span>\${escapeHtml(L('updNote'))}</span><button class="primary" id="updBtn">\${escapeHtml(L('updBtn'))}</button>\`;
        document.body.appendChild(b);
        b.querySelector('#updBtn').addEventListener('click', () => location.reload());
      }
    };
    sc.onerror = () => sc.remove();
    document.head.appendChild(sc);
  }
  setInterval(checkVersion, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

  applyScript();
  applyTheme();
  applyFont();`, 'upd-check');

// CSS za traku
c = rep(c, '.tourSpot { position: relative; z-index: 1000;',
`#updBar { position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%); background: var(--card); color: var(--ink);
  border: 1px solid var(--blue); border-radius: 12px; padding: 10px 16px; display: flex; gap: 12px; align-items: center;
  z-index: 1200; box-shadow: 0 6px 24px rgba(0,0,0,.25); }
.tourSpot { position: relative; z-index: 1000;`, 'css-upd');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
fs.writeFileSync('../index.html', h);
console.log('provera verzije ugrađena');
