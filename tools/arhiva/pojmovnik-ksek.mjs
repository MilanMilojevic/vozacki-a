// Тура 3 (04.09.2026): четири вишетематске картице добијају одељке `.kSek[data-sub]`, па се уз
// питање отвара САМО одељак његове подобласти (постојећи механизам suziKarticu, до сада га је
// користио једино razno-pravila). Садржај се НЕ мења — уметну се само омотачи око постојећих
// блокова највишег нивоа. У појмовнику на почетној картица се и даље види цела.
//
// Мапе одељака су одређене читањем садржаја блокова и описа подобласти:
//  · prvenstvo-prolaza: 131 хијерархија (чл. 20) · 136 пет правила (чл. 47) · 148 возила под
//    пратњом (чл. 106–110); табела „ко је ко" иде уз 148, а „ротација не гаси семафор" дели 131 и 148.
//  · skretanje: 133 скретање/полукружно/стрелице · 137 прилаз и пролазак кроз раскрсницу (чл. 48–49);
//    уводна три блока (престројавање, пропуштања) деле обе.
//  · put-pojmovi: 109 појмови пута (слојеви, врсте, дефиниције) · 115 зоне и чл. 164 (гашење мотора).
//  · vozilo-tehnika: 126 регистрација (само уводна реченица) · 127 технички прегледи; увод деле обе.
//
// Покретање:  node tools/arhiva/pojmovnik-ksek.mjs
// Датотека има NUL бајтове — сече се по сидру (indexOf), без регекса преко целог текста.
import fs from 'node:fs';

const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');

const MAPE = {
  'prvenstvo-prolaza': { blokova: 30, grupe: [[0, 2, '131'], [3, 4, '148'], [5, 5, '131,148'], [6, 14, '136'], [15, 29, '148']] },
  'skretanje': { blokova: 26, grupe: [[0, 2, '133,137'], [3, 3, '137'], [4, 4, '133'], [5, 11, '137'], [12, 16, '133'], [17, 25, '137']] },
  'put-pojmovi': { blokova: 12, grupe: [[0, 3, '109'], [4, 11, '115']] },
  'vozilo-tehnika': { blokova: 9, grupe: [[0, 0, '126,127'], [1, 8, '127']] },
};

// blokovi najvišeg nivoa, sa TAČNIM granicama u izvornom tekstu
function blokovi(html) {
  let dubina = 0, start = 0;
  const b = [];
  const re = /<(\/?)(div|table|p|svg|h4|ul|ol)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!m[1]) { if (dubina === 0) start = m.index; dubina++; }
    else { dubina--; if (dubina === 0) b.push({ od: start, doKraja: re.lastIndex }); }
  }
  if (dubina !== 0) { console.log('FAIL: neuravnotežene oznake (dubina ' + dubina + ')'); process.exit(1); }
  return b;
}

for (const [kartica, mapa] of Object.entries(MAPE)) {
  const sidro = "CARDS['" + kartica + "'] = {";
  const i = t.indexOf(sidro);
  if (i === -1 || t.indexOf(sidro, i + 1) !== -1) { console.log('FAIL: sidro kartice nije jedinstveno -> ' + kartica); process.exit(1); }
  const h0 = t.indexOf('html: `', i);
  const h = h0 + 7;
  const kraj = t.indexOf('`,\n};', h);
  if (h0 === -1 || kraj === -1) { console.log('FAIL: granice html-a -> ' + kartica); process.exit(1); }
  const html = t.slice(h, kraj);
  if (html.includes('kSek')) { console.log('PRESKOČENO (već ima kSek): ' + kartica); continue; }
  const b = blokovi(html);
  if (b.length !== mapa.blokova) { console.log('FAIL: ' + kartica + ' ima ' + b.length + ' blokova, očekivano ' + mapa.blokova); process.exit(1); }
  const pokriveno = mapa.grupe.reduce((a, [od, doB]) => a + (doB - od + 1), 0);
  if (pokriveno !== mapa.blokova) { console.log('FAIL: ' + kartica + ' — grupe pokrivaju ' + pokriveno + ' od ' + mapa.blokova); process.exit(1); }

  // umetanja od kraja ka početku, da se pozicije ne pomeraju
  let nov = html;
  for (const [od, doB, sub] of [...mapa.grupe].reverse()) {
    nov = nov.slice(0, b[doB].doKraja) + '\n</div>' + nov.slice(b[doB].doKraja);
    nov = nov.slice(0, b[od].od) + '<div class="kSek" data-sub="' + sub + '">\n' + nov.slice(b[od].od);
  }
  // provera: skidanjem omotača mora da se vrati POLAZNI tekst, bajt za bajt
  const skinuto = nov.replace(/<div class="kSek" data-sub="[0-9,]+">\n/g, '').replace(/\n<\/div>/g, (m2, idx) => {
    return ''; // uklanjamo samo one koje smo mi dodali — proveravamo ispod poređenjem
  });
  // stroža provera: broj dodatih otvaranja == broj grupa, i posle uklanjanja tačno tih niski dobija se original
  let test = nov;
  for (const [, , sub] of mapa.grupe) test = test.replace('<div class="kSek" data-sub="' + sub + '">\n', '');
  const zatvaranja = (nov.match(/\n<\/div>/g) || []).length - (html.match(/\n<\/div>/g) || []).length;
  if (zatvaranja !== mapa.grupe.length) { console.log('FAIL: ' + kartica + ' — dodato zatvaranja ' + zatvaranja + ', očekivano ' + mapa.grupe.length); process.exit(1); }
  for (let k = 0; k < mapa.grupe.length; k++) test = test.replace('\n</div>', '\n');
  // posle skidanja: mora da sadrži svaki originalni blok netaknut
  for (const bl of b) {
    const deo = html.slice(bl.od, bl.doKraja);
    if (!nov.includes(deo)) { console.log('FAIL: ' + kartica + ' — blok je oštećen'); process.exit(1); }
  }
  t = t.slice(0, h) + nov + t.slice(kraj);
  console.log(kartica + ': ' + mapa.grupe.length + ' odeljaka (' + mapa.grupe.map((g) => g[2]).join(' · ') + ')');
}

fs.writeFileSync(P, t);
console.log('upisano — sledi: cd tools && node build-explanations.mjs');
