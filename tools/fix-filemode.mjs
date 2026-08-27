import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// 1) detekcija: otvoren direktno kao fajl (file://) — tu je origin "null" i svaka promena
//    adrese je blokirana ("unique security origin"), pa adresu uopšte ne diramo.
rep(`function setHash(h) {
    curHash = h;
    if (location.hash !== h) location.hash = h;
  }`,
`const FILE_MODE = location.protocol === 'file:';
  function setHash(h) {
    curHash = h;
    if (FILE_MODE) return;                   // file:// — adresa se ne dira (origin je "null")
    if (location.hash !== h) location.hash = h;
  }`, 'setHash');

// 2) povratak na početnu bez navigacije kad smo na file://
rep(`function goHomeReplace() { location.replace('#/'); }`,
`function goHomeReplace() {
    if (FILE_MODE) { renderHome(); return; }
    location.replace('#/');
  }`, 'goHome');

// 3) boot: na file:// uvek kreni od početne (Chrome ume da vrati staru adresu sa #/sek/...)
rep(`  curHash = location.hash || '#/';
  try { routeTo(curHash); } catch (err) { try { goHomeReplace(); renderHome(); } catch (e2) { /* errStrip će prikazati */ } }`,
`  curHash = FILE_MODE ? '#/' : (location.hash || '#/');
  try { routeTo(curHash); } catch (err) { try { renderHome(); } catch (e2) { /* errStrip će prikazati */ } }`, 'boot');

// 4) provera nove verzije: na file:// se preskače (učitavanje sa oznakom vremena je tamo blokirano)
rep(`  function checkVersion() {
    if (!BOOT_V || document.getElementById('updBar')) return;`,
`  function checkVersion() {
    if (!BOOT_V || FILE_MODE || document.getElementById('updBar')) return;`, 'checkVersion');

// 5) i odbijena obećanja idu u crvenu traku
rep(`  window.addEventListener('error', (e) => {`,
`  window.addEventListener('unhandledrejection', (e) => {
    window.dispatchEvent(new ErrorEvent('error', { message: 'Neuhvaćena greška: ' + (e.reason && e.reason.message || e.reason) }));
  });
  window.addEventListener('error', (e) => {`, 'rejection');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
console.log('file:// režim ugrađen');
