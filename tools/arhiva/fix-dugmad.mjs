import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label, expect = 1) {
  const cnt = src.split(o).length - 1;
  if (cnt !== expect) { console.log('FAIL [' + label + '] count=' + cnt + ' (očekivano ' + expect + ')'); fails++; return src; }
  console.log('ok  [' + label + '] ×' + cnt);
  return src.split(o).join(n);
}

// PRAVILO 1: povratak na početnu je UVEK link-stil (nikad glavno/sivo dugme)
a = rep(a, `class="\${origin || extraHtml ? 'linklike' : 'primary'}" data-nav="home"`,
  `class="linklike" data-nav="home"`, 'kraj-ucenja', 1);
a = rep(a, `<button class="secondary" data-nav="home">\${L('backHome')}</button>`,
  `<button class="linklike" data-nav="home">\${L('backHome')}</button>`, 'sim-rezultat', 1);
a = rep(a, `<div class="qActions"><button class="primary" data-nav="home">\${L('backHome')}</button></div>`,
  `<div class="qActions"><button class="linklike" data-nav="home">\${L('backHome')}</button></div>`, 'prazan-spisak', 1);

// PRAVILO 2: destruktivna radnja je prepoznatljivo crvena
a = rep(a, `<button class="linklike" id="btnReset">\${L('reset')}</button>`,
  `<button class="linklike danger" id="btnReset">\${L('reset')}</button>`, 'reset-crveno', 1);

// CSS: link-stil ujednačen + crveni link za destruktivno
c = rep(c, '.explCardBtn { scroll-margin-top: 74px; }',
`.explCardBtn { scroll-margin-top: 74px; }
.linklike.danger { color: #c0392b; }
.linklike.danger:hover { color: #96281b; }
body.dark .linklike.danger { color: #ff8a80; }`, 'css-danger');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('dugmad ujednačena');
