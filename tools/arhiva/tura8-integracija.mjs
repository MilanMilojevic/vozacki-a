// Tura 8: četiri crteža tamo gde tabela/tekst slabo rade. Svaki fragment je prošao
// adversarijalnu kontrolu (baza + slike); dve blokirajuće greške pisaca (prvenstvo: „obojica
// ulaze u istu traku" i „znak odlučuje umesto pravila" — protivrečile 9959 i 9965/9967)
// kontrola je ispravila, a ja sam obe lično proverio u bazi pre integracije.
import fs from 'node:fs';
const S = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
let t = fs.readFileSync('../build-explanations.mjs', 'utf8');   // NUL bajtovi ostaju netaknuti
let pao = 0;
const frag = (ime) => {
  let f = fs.readFileSync(S + '/t8-' + ime + '.html', 'utf8').trim();
  if (f.includes('`') || f.includes('${')) { console.log('FAIL [' + ime + '] beketik/dolar-vitičasta'); pao++; }
  // kućno pravilo: veličine slova su tokeni, ne inline vrednosti
  f = f.replace(/font-size:\s*\.85rem;?/g, '');
  return f;
};
const nadji = (sidro, ime) => { const i = t.indexOf(sidro); if (i === -1 || t.indexOf(sidro, i + 1) !== -1) { console.log('FAIL [' + ime + '] sidro nije jedinstveno: ' + i); pao++; } return i; };

// 1) prvenstvo-prolaza — dopuna posle tabele pet pravila, pre „Kako to izgleda na slici"
{
  const i = nadji('<p><b>Kako to izgleda na slici.</b> Skoro sva pitanja ove grupe', 'prvenstvo');
  if (i > -1) { t = t.slice(0, i) + frag('prvenstvo-prolaza') + '\n' + t.slice(i); console.log('ok [prvenstvo-prolaza] dopuna'); }
}
// 2) preticanje — dopuna odmah posle prvog pasusa
{
  const i = nadji('<p><b>Osnovno (čl. 53):</b> pretiče se SA LEVE strane.', 'preticanje');
  if (i > -1) { const kraj = t.indexOf('</p>', i) + 4; t = t.slice(0, kraj) + '\n' + frag('preticanje') + t.slice(kraj); console.log('ok [preticanje] dopuna'); }
}
// 3) kategorije-vozila — zamena otvaranja mreže i reda zaglavlja (crtež + nova zaglavlja), redovi ostaju
{
  const od = nadji('<div class="vgrid">\n  <div class="vg vgHead"></div><div class="vg vgHead">⚫⚫ 2 točka</div>', 'kategorije od');
  const kZ = '⚫⚫⚫⚫ 4 točka</div>';
  const doK = od > -1 ? t.indexOf(kZ, od) + kZ.length : -1;
  if (od > -1 && doK > od && doK - od < 400) { t = t.slice(0, od) + frag('kategorije-vozila') + t.slice(doK); console.log('ok [kategorije-vozila] zamena zaglavlja'); }
  else { console.log('FAIL [kategorije] granice ' + od + '..' + doK); pao++; }
}
// 4) uredjaji-oprema — zamena pasusa „Logika iza brojki" skalom dometa
{
  const od = nadji('<p class="mut">Logika iza brojki: kratko svetlo ima <i>obe</i> granice', 'uredjaji od');
  const kZ = 'Moped je jedini sa sopstvenim, znatno kraćim rasponom.</p>';
  const doK = od > -1 ? t.indexOf(kZ, od) + kZ.length : -1;
  if (od > -1 && doK > od && doK - od < 600) { t = t.slice(0, od) + frag('uredjaji-oprema') + t.slice(doK); console.log('ok [uredjaji-oprema] zamena pasusa'); }
  else { console.log('FAIL [uredjaji] granice ' + od + '..' + doK); pao++; }
}

if (pao) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', t);
console.log('--- upisano; sledi build ---');
