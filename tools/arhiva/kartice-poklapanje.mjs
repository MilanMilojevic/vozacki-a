// Revizija poklapanja kartica (04.09.2026) — jednokratna izmena tools/build-explanations.mjs.
//
// Povod: Milan je na pitanju o autobusu iz kog izlaze deca dobio karticu „Prvenstvo prolaza,
// rotacije i hijerarhija znakova" — ogromnu i bez ijedne reči o autobusu. Uzrok je isti kao kod
// podoblasti 132 ranije: zvanične podoblasti su SPOJEVI tema, a kartica se kačila po podoblasti.
// Podoblast 131 („Opšte odredbe o ponašanju učesnika u saobraćaju") meša hijerarhiju
// signalizacije, odstojanje, prepreke, pešake, autobus i tramvaj na stajalištu, telefon i pojaseve.
//
// Merenje: 29 kartica × 1323 pitanja prošlo je kroz nezavisnu presudu pa kroz kontrolu koja je
// osporavala odluke u OBA smera (27 ispravki, 26 „skini" i 1 „drži"). Merilo je Milanovo:
// „ako nema nečeg korisnog za vezano pitanje, bolje da nema vezanog pojmovnika" — kartica je
// bonus, objašnjenje uz pitanje ostaje uvek.
//
// Ishod: 253 pitanja gube karticu podoblasti (nocard), dve podoblasti je gube u celini.
// Pokretanje:  node tools/arhiva/kartice-poklapanje.mjs
// Datoteka ima NUL bajtove, pa se seče po sidru (indexOf), nikad regeksom preko celog teksta.
import fs from 'node:fs';

const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');

const NOCARD = [
  7921, 7922, 7923, 7925, 7927, 7928, 7929, 7996, 7997, 7998, 8005, 8006,
  8007, 8008, 8009, 8010, 8011, 8013, 8015, 8016, 8083, 8084, 8085, 8086,
  8087, 8088, 8089, 8096, 8097, 8099, 8100, 8101, 8102, 8103, 8105, 8106,
  8107, 8108, 8109, 8111, 8113, 8114, 8281, 8328, 8338, 8339, 8340, 8397,
  8399, 8401, 8403, 8404, 8405, 8406, 8410, 8411, 8412, 8413, 8418, 8420,
  8421, 8422, 8423, 8424, 8427, 8433, 8434, 8435, 8436, 8437, 8438, 8439,
  8441, 8442, 8443, 8444, 8449, 8451, 8464, 8465, 8476, 8477, 8478, 8480,
  8481, 8535, 8548, 8550, 8559, 8560, 8561, 8562, 8563, 8564, 8565, 8566,
  8567, 8568, 8569, 8570, 8571, 8572, 8575, 8576, 8577, 8578, 8579, 8584,
  8588, 8590, 8592, 8593, 8594, 8597, 8598, 8599, 8600, 8601, 8603, 8606,
  8609, 8611, 8937, 8938, 8939, 8941, 9214, 9215, 9220, 9221, 9226, 9227,
  9228, 9229, 9230, 9234, 9235, 9236, 9247, 9286, 9287, 9296, 9305, 9308,
  9309, 9310, 9312, 9313, 9338, 9339, 9340, 9377, 9389, 9391, 9405, 9531,
  9533, 9534, 9535, 9536, 9538, 9539, 9540, 9542, 9543, 9545, 9546, 9554,
  9555, 9557, 9559, 9561, 9592, 9615, 9618, 9644, 9645, 9646, 9675, 9677,
  9679, 9685, 9689, 9690, 9691, 9693, 9698, 9699, 9702, 9703, 9706, 9715,
  9717, 9813, 9853, 9858, 9862, 9865, 10060, 10061, 10244, 10245, 10248, 10270,
  10271, 10273, 10406, 10443, 10454, 10474, 10485, 10486, 10487, 10499, 10528, 10550,
  10558, 10559, 10565, 10614, 10631, 10632, 10634, 10636, 10701, 10714, 10715, 10716,
  10717, 10718, 10719, 10780, 10988, 10989, 10992, 11014, 11016, 11017, 11019, 11021,
  11022, 11024, 11027, 11028, 11029, 11030, 11031, 11032, 11033, 11035, 11036, 11037,
  11038,
];

// 1) izlaz mora da prenese polje nocard (do sada su prolazili samo x i card)
{
  const sidro = "    ...(e.card ? { card: e.card } : {}),";
  if (t.indexOf(sidro) === -1 || t.indexOf(sidro) !== t.lastIndexOf(sidro)) { console.log('FAIL: sidro za izlaz byQ nije jedinstveno'); process.exit(1); }
  t = t.replace(sidro, sidro + "\n    ...(e.nocard ? { nocard: 1 } : {}),");
}

// 2) dve podoblasti gube karticu u celini — veza se briše, uz razlog
const gase = [
  ["BYSUB[168] = 'vozilo-tehnika';         // teret na vozilu",
   "// BYSUB[168] — UKINUTO 04.09.2026: podoblast je o teretu i njegovom obeležavanju, a kartica\n" +
   "// „Vozilo, registracija i tehnički pregled\" o teretu nema nijednu reč (oba pitanja su bez nje)."],
  ["BYSUB[144] = 'pesaci-bicikli';",
   "// BYSUB[144] — UKINUTO 04.09.2026: podoblast je o kretanju pešaka po putu (gde i kojom stranom),\n" +
   "// a kartica govori vozaču kako da propusti pešaka — drugoj strani istog susreta."],
];
for (const [staro, novo] of gase) {
  if (t.indexOf(staro) === -1 || t.indexOf(staro) !== t.lastIndexOf(staro)) { console.log('FAIL: sidro nije jedinstveno -> ' + staro.slice(0, 24)); process.exit(1); }
  t = t.replace(staro, novo);
}

// 3) Spisak pitanja koja ne dobijaju karticu podoblasti — na KRAJU, pre sastavljanja izlaza.
// Mora posle SVIH X[...] dodela: 741 dodela stoji ispod BYSUB i one dodeljuju NOV objekat
// (X[id] = { ... }), pa bi prepisale nocard da je blok stajao iznad njih.
{
  const SIDRO = 'const out = {';
  const i = t.indexOf(SIDRO);
  if (i === -1 || t.indexOf(SIDRO, i + 1) !== -1) { console.log('FAIL: sidro out nije jedinstveno'); process.exit(1); }
  const redovi = [];
  for (let k = 0; k < NOCARD.length; k += 12) redovi.push('  ' + NOCARD.slice(k, k + 12).join(', ') + ',');
  const blok =
    '// --- Pitanja koja NE dobijaju karticu svoje podoblasti (revizija 04.09.2026) ---\n' +
    '// Zvanične podoblasti su spojevi tema; kartica koja odgovara podoblasti često ne odgovara\n' +
    '// pojedinačnom pitanju. Merilo: pomaže li otvaranje BAŠ te kartice BAŠ tom pitanju.\n' +
    '// Bolje nijedna nego pogrešna — objašnjenje uz pitanje ostaje u svakom slučaju.\n' +
    'for (const id of [\n' + redovi.join('\n') + '\n]) X[id] = { ...(X[id] || {}), nocard: 1 };\n\n';
  t = t.slice(0, i) + blok + t.slice(i);
}

fs.writeFileSync(P, t);
console.log('upisano: nocard za ' + NOCARD.length + ' pitanja, ukinute veze BYSUB[168] i BYSUB[144]');
console.log('sledi: cd tools && node build-explanations.mjs');
