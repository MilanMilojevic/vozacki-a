import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const anchor = "// FAQ";
const i = s.indexOf(anchor);
if (i < 0) { console.log('anchor missing'); process.exit(1); }
const block = `CARDS['brzine'] = {
  title: 'Pojmovnik: ograničenja brzine (50-80-100-130)',
  html: \`
<svg viewBox="0 0 460 120" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <g><circle cx="65" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="65" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">50</text><text x="65" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">NASELJE</text></g>
  <g><circle cx="175" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="175" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">80</text><text x="175" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">VAN NASELJA</text></g>
  <g><circle cx="285" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="285" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">100</text><text x="285" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">MOTOPUT</text></g>
  <g><circle cx="395" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="395" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">130</text><text x="395" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">AUTOPUT</text></g>
</svg>
<p><b>Opšta ograničenja</b> (kad znak ne kaže drugačije): naselje 50 (čl. 43), van naselja 80, motoput 100, autoput 130 (čl. 44). Pamti merdevine: <b>50 → 80 → 100 → 130</b> — što bolji put, to više.</p>
<p><b>Znak uvek pobija opšte pravilo</b> — i naniže i naviše: znakom se u naselju može dozvoliti i do 80 (čl. 43 st. 2).</p>
<p><b>Čemu se brzina prilagođava (čl. 42):</b> osobinama i stanju PUTA, VIDLJIVOSTI, preglednosti, ATMOSFERSKIM prilikama, stanju VOZILA i tereta, GUSTINI saobraćaja — tako da možeš da staneš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš.</p>
<p><b>Zamka u odgovorima:</b> varijante sa "raspoloživim vremenom", "udobnošću" ili "da što pre stigneš" su UVEK netačne — vreme dolaska nikad nije zakonski faktor.</p>\`,
};

const prilagodi = 'Brzina se prilagođava USLOVIMA (ZOBS čl. 42): osobinama i stanju puta, vidljivosti, preglednosti, atmosferskim prilikama, stanju vozila i tereta, gustini saobraćaja — tako da vozilo možeš blagovremeno da zaustaviš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš, bez ugrožavanja drugih. Odgovori sa "raspoloživim vremenom", "udobnošću" ili "što pre stigneš" su uvek netačni.';
X[9868] = { x: prilagodi, card: 'brzine' };
X[10488] = { x: prilagodi, card: 'brzine' };
X[10489] = { x: prilagodi, card: 'brzine' };
X[9870] = { x: prilagodi, card: 'brzine' };
X[9873] = { x: prilagodi, card: 'brzine' };
const znakJaci = 'Važi broj sa POSTAVLJENOG ZNAKA — konkretan znak je jači od opšteg ograničenja (ZOBS čl. 43 i 44: opšta pravila važe samo tamo gde znak ne kaže drugačije).';
X[9878] = { x: znakJaci, card: 'brzine' };
X[9908] = { x: znakJaci, card: 'brzine' };
X[9948] = { x: znakJaci, card: 'brzine' };
X[9946] = { x: 'Znak ograničenja (40) postavljen je uz sam ulazak u naselje — važi ZNAK, a ne opšte pravilo "u naselju 50" (čl. 43: opšte ograničenje važi samo gde znak ne kaže drugačije). Za mopede i motocikle nema posebne opšte granice u ovoj situaciji — čitaj znak.', card: 'brzine' };
X[9947] = { x: 'U naselju je opšte ograničenje 50, ali saobraćajnim znakom može da se DOZVOLI kretanje i do 80 km/h kada put to omogućava (ZOBS čl. 43 st. 2) — zato ovde važi 80 sa znaka, iako ulaziš u naselje. Ovo je omiljena zamka: znak može i da POVEĆA ograničenje u naselju.', card: 'brzine' };
X[9949] = { x: 'Na putu za motorna vozila / motoputu opšte ograničenje je 100 km/h (čl. 44), ali postavljeni znak (60) je jači — važi 60. Znak uvek pobija opšte pravilo.', card: 'brzine' };
X[9891] = { x: 'Motoput van naselja: najviše 100 km/h (ZOBS čl. 44). Merdevine opštih ograničenja: naselje 50 → van naselja 80 → motoput 100 → autoput 130.', card: 'brzine' };
X[9903] = { x: 'Put van naselja koji nije ni autoput ni motoput: najviše 80 km/h (ZOBS čl. 44). Merdevine: 50 (naselje) → 80 (van naselja) → 100 (motoput) → 130 (autoput).', card: 'brzine' };
X[10491] = { x: 'U naselju, bez znaka koji kaže drugačije: najviše 50 km/h (ZOBS čl. 43). Znakom može da se dozvoli i do 80 kada put to omogućava.', card: 'brzine' };
X[10641] = { x: 'Autoput van naselja: najviše 130 km/h (ZOBS čl. 44). Merdevine: 50 → 80 → 100 → 130.', card: 'brzine' };

// kartica "brzine" uz sva pitanja podoblasti Brzina
BYSUB[135] = 'brzine';

`;
s = s.slice(0, i) + block + s.slice(i);
fs.writeFileSync('build-explanations.mjs', s);
console.log('inserted');
