import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const ids = [9475,9476,9477,9478,9479,9480,9481,10420,10422,10423,10424,10425,10426,10427,10428,10429,10431];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] već postoji'); process.exit(1); }
}
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const xBlock = `
// --- Znaci ovlašćenih lica (sub 166), 17 tekstualnih pitanja — pisano pojedinačno
// (Pravilnik o znacima koje daju policijski službenici, Sl. glasnik 56/2010, čl. 2-11; ZOBS čl. 107/109/110/166) ---
X[9475] = { x: 'Znake za SMANJENJE brzine, UBRZANJE i ZAUSTAVLJANJE policijski službenik može davati i iz vozila, odnosno sa motocikla — pod uslovom da službenik, odnosno vozilo, ima VIDNO OBELEŽJE policije (Pravilnik o znacima policijskih službenika čl. 2). Nije ograničeno na vozila sa prvenstvom prolaza — dovoljno je obeležje.' };
X[9476] = { x: 'Ista odredba kao za smanjenje brzine i zaustavljanje: ova tri znaka smeju se davati i iz vozila, odnosno sa motocikla, kada postoji vidno obeležje policije (Pravilnik o znacima policijskih službenika čl. 2). Uslov je obeležje, ne prvenstvo prolaza.' };
X[9477] = { x: 'I znaci za zaustavljanje vozila spadaju u tri znaka koja se smeju davati iz vozila, odnosno sa motocikla sa vidnim obeležjem policije (Pravilnik o znacima policijskih službenika čl. 2) — zajedno sa smanjenjem brzine i ubrzanjem kretanja.' };
X[9478] = { x: 'Pištaljka ide SAMO uz znake rukama i SAMO kad je policijski službenik VAN vozila (Pravilnik o znacima policijskih službenika čl. 6). Logika: zvižduk prati gestikulaciju pri regulisanju na raskrsnici — iz vozila ne bi imao smisla.' };
X[9479] = { x: 'Jedan DUŽI zvižduk = poziv da obratiš pažnju na policijskog službenika koji će dati odgovarajući znak (Pravilnik o znacima policijskih službenika čl. 6). Prekršaj označava VIŠE KRATKIH zvižduka, a obavezu zaustavljanja pištaljka sama po sebi ne izriče.' };
X[9480] = { x: 'VIŠE uzastopnih KRATKIH zvižduka = neko je postupio protivno datom znaku, pravilima saobraćaja ili znakovima (Pravilnik o znacima policijskih službenika čl. 6). Par za pamćenje: jedan dug = "pažnja", više kratkih = "prekršaj".' };
X[9481] = { x: 'Kad čuješ više kratkih zvižduka, dužnost je: OSMATRANJEM policijskog službenika utvrdi da li se znak odnosi na tebe (Pravilnik o znacima policijskih službenika čl. 6) — službenik istovremeno rukom pokazuje na koga se odnosi i šta treba da učini. Ne staješ automatski, a ubrzanje pogotovo nije odgovor.' };
X[10420] = { x: 'Znaci policijskog službenika daju se: RUKAMA i položajem tela, UREĐAJIMA za svetlosne i zvučne znakove i STOP TABLICOM (Pravilnik o znacima policijskih službenika čl. 1; ZOBS čl. 166). Zamke: usmeno se daju NAREDBE (ne znaci), zastavice koriste RADNICI na radovima na putu (ZOBS čl. 166), a znakovi sa izmenjivim sadržajem poruka su putna signalizacija.' };
X[10422] = { x: 'Crveno i plavo naizmenično = vozilo POD PRATNJOM: propusti ih i omogući mimoilaženje/preticanje/obilaženje, PO POTREBI zaustavi ili ukloni vozilo s kolovoza, strogo se pridržavaj naredbi lica iz pratnje, a nastavi tek kad SVA vozila pod pratnjom prođu (Pravilnik o znacima policijskih službenika čl. 9 t. 1; ZOBS čl. 107). Bezuslovno "zaustavi se" je mamac — zaustavljanje je samo PO POTREBI.' };
X[10423] = { x: 'DVA plava svetla na vozilu s prvenstvom prolaza koje se KREĆE = ono obezbeđuje prolaz vozilima iza sebe: obrati pažnju na njega I na vozila kojima obezbeđuje prolaz, propusti ih, po potrebi zaustavi ili ukloni svoje vozilo, pridržavaj se naredbi lica iz vozila (Pravilnik o znacima policijskih službenika čl. 9 t. 2; ZOBS čl. 109). "Smanji brzinu i nastavi" i bezuslovno zaustavljanje su mamci.' };
X[10424] = { x: 'JEDNO plavo svetlo na vozilu s prvenstvom prolaza u kretanju = obrati pažnju, ustupi mu prvenstvo odnosno propusti ga, i PO POTREBI zaustavi ili ukloni svoje vozilo dok prođe (Pravilnik o znacima policijskih službenika čl. 9 t. 3). Jedno svetlo = samo to vozilo; dva svetla znače da obezbeđuje prolaz i vozilima iza sebe.' };
X[10425] = { x: 'Plavo svetlo na vozilu s prvenstvom prolaza koje STOJI na kolovozu = smanji brzinu, PO POTREBI zaustavi i postupaj po naredbama policijskog službenika (Pravilnik o znacima policijskih službenika čl. 9, poslednji stav). Vozilo koje stoji ne traži propuštanje nego oprez — bezuslovno zaustavljanje je opet mamac.' };
X[10426] = { x: 'Isto pravilo kao za jedno svetlo: i DVA plava svetla na vozilu koje STOJI znače — smanji brzinu, po potrebi zaustavi, postupaj po naredbama službenika (Pravilnik o znacima policijskih službenika čl. 9, poslednji stav pokriva i t. 2 i t. 3 kad vozilo stoji). Razlika jedno/dva svetla ima značaj samo za vozilo U KRETANJU.' };
X[10427] = { x: 'Kompletna obaveza prema vozilima POD PRATNJOM u jednoj rečenici: propusti + omogući mimoilaženje/preticanje/obilaženje + po potrebi zaustavi ili ukloni s kolovoza + pridržavaj se naredbi pratnje + nastavi tek kad SVA prođu (Pravilnik o znacima policijskih službenika čl. 9 t. 1; ZOBS čl. 107). Ponuđene kraće verzije ispuštaju delove obaveze — tačan je pun opis.' };
X[10428] = { x: 'Poruka na displeju policijskog vozila (STOP POLICIJA, PRATITE NAS, SMANJITE BRZINU...) je OBAVEZA, ne preporuka — vozač neposredno IZA postupa po znaku ispisanom na displeju (Pravilnik o znacima policijskih službenika čl. 9 t. 4).' };
X[10429] = { x: 'Postojano crveno svetlo baterijske lampe kojim službenik maše upravno na osu puta = BEZBEDNO zaustavi vozilo na kolovozu, po mogućnosti van njega, NEPOSREDNO ISPRED službenika (Pravilnik o znacima policijskih službenika čl. 11). Smanjenje brzine je obaveza OSTALIH učesnika — za onoga na koga se znak odnosi, znak znači: stani.' };
X[10431] = { x: 'Kad vozilo pod pratnjom ili s prvenstvom prolaza uz rotaciju daje i SVETLOSNI ZNAK UPOZORENJA (uzastopno/naizmenično paljenje dugih svetala), vozač NEPOSREDNO ISPRED mora ODMAH bezbedno da stane uz DESNU ivicu kolovoza, po mogućnosti van njega (ZOBS čl. 110; Pravilnik o znacima policijskih službenika čl. 10). Znak je upućen lično tebi: skloni se s putanje — samo smanjenje brzine nije dovoljno.' };

`;
s = s.slice(0, ti) + xBlock + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch17 (ovlašćena lica, 17) inserted');
