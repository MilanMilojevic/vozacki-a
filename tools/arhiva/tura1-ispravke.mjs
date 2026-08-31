import fs from 'node:fs';
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = s.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  s = s.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// 1) DUBINA ŠARE — baza (8829, 8830): najmanje 1,6 mm bez TWI; sa TWI dublja od oznake. Bilo pogrešno "1 mm".
rep('propisana dubina šare (motocikl: minimum 1 mm)',
    'dubina šare: dublja od TWI oznake, a bez TWI oznake NAJMANJE 1,6 mm (moped/motocikl)', 'sara-1.6');

// 2) ZAMKE kartica — "potvrda pravca" NIJE večiti mamac: kod znakova OBAVEŠTENJA takav znak postoji (#9176).
rep('"potvrdu pravca kretanja posle prolaska raskrsnice" (11× — žmigavac se isključuje kad završiš radnju, ne služi za "potvrdu pravca")',
    '"potvrdu pravca kretanja posle prolaska raskrsnice" — mamac SAMO kod pitanja o POKAZIVAČIMA PRAVCA (11×: žmigavac se isključuje kad završiš radnju). Pažnja: znak obaveštenja „Potvrda pravca" POSTOJI — kod pitanja #9176 to je tačan odgovor', 'zamke-potvrda');

// 3) X radnja — ista ograda u objašnjenju uz pitanja o žmigavcu
rep('Zato je "potvrda pravca posle raskrsnice" večiti netačan odgovor.',
    'Zato je kod pitanja o pokazivačima "potvrda pravca posle raskrsnice" netačan odgovor — žmigavac tome ne služi (znak obaveštenja s tim imenom postoji, ali to je druga priča).', 'radnja-ograda');

// 4) KOSNIK — označava i zatvaranje (11025) i otvaranje (11054) trake; nauči razliku sa slike.
rep('<b>KOSNIK</b><span>traka se zatvara — pređi u susednu</span>',
    '<b>KOSNIK</b><span>zatvaranje ILI otvaranje trake: ako se broj traka ispred SMANJUJE — tvoja se uliva u susednu (pređi); ako se POVEĆAVA — nastaje nova (npr. izlazna)</span>', 'kosnik');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
console.log('tura 1 primenjena');
