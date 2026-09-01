// Pravi QR kod za adresu vežbaonice i upisuje ga kao SVG u plakat.html.
// Bez ijedne spoljne biblioteke — mali generator (verzija 4, nivo ispravke M, bajt režim).
// Pokretanje:  node napravi-qr.mjs
import fs from 'node:fs';

const TEKST = 'https://milanmilojevic.github.io/vozacki-a/';

// --- Galoaovo polje GF(256) za Rid-Solomonove kodove ---
const EXP = new Array(512), LOG = new Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}
const mul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

function rsGenerator(stepen) {
  let poly = [1];
  for (let i = 0; i < stepen; i++) {
    const novi = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      novi[j] ^= mul(poly[j], 1);
      novi[j + 1] ^= mul(poly[j], EXP[i]);
    }
    poly = novi;
  }
  return poly;
}
function rsCodes(podaci, brojEC) {
  const gen = rsGenerator(brojEC);
  const rez = new Array(brojEC).fill(0);
  for (const b of podaci) {
    const faktor = b ^ rez[0];
    rez.shift(); rez.push(0);
    for (let i = 0; i < brojEC; i++) rez[i] ^= mul(gen[i + 1], faktor);
  }
  return rez;
}

// --- Parametri: verzija 4 (33×33), nivo M: 64 bajta podataka, 18 EC, jedan blok ---
const VER = 4, VEL = 17 + VER * 4, KAP = 64, EC = 18;

const bajtovi = new TextEncoder().encode(TEKST);
if (bajtovi.length + 2 > KAP) { console.error('Tekst je predugačak za verziju 4'); process.exit(1); }

// bitovi: režim 0100 + dužina (8 bita) + podaci + terminator + popuna
const bits = [];
const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
push(0b0100, 4);
push(bajtovi.length, 8);
for (const b of bajtovi) push(b, 8);
for (let i = 0; i < 4 && bits.length < KAP * 8; i++) bits.push(0);
while (bits.length % 8) bits.push(0);
const podaci = [];
for (let i = 0; i < bits.length; i += 8) podaci.push(parseInt(bits.slice(i, i + 8).join(''), 2));
const popuna = [0xec, 0x11];
let pi = 0;
while (podaci.length < KAP) podaci.push(popuna[pi++ % 2]);
const ecKodovi = rsCodes(podaci, EC);
const sve = podaci.concat(ecKodovi);

// --- Matrica ---
const m = Array.from({ length: VEL }, () => new Array(VEL).fill(null));
const stavi = (r, c, v) => { if (r >= 0 && r < VEL && c >= 0 && c < VEL) m[r][c] = v; };

function nalazac(r, c) {
  for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
    const rr = r + dr, cc = c + dc;
    if (rr < 0 || rr >= VEL || cc < 0 || cc >= VEL) continue;
    const ivica = dr === -1 || dr === 7 || dc === -1 || dc === 7;
    const unutra = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    const okvir = (dr === 0 || dr === 6 || dc === 0 || dc === 6) && !ivica;
    m[rr][cc] = ivica ? 0 : (okvir || unutra ? 1 : 0);
  }
}
nalazac(0, 0); nalazac(0, VEL - 7); nalazac(VEL - 7, 0);

// tajmeri
for (let i = 8; i < VEL - 8; i++) { m[6][i] = i % 2 === 0 ? 1 : 0; m[i][6] = i % 2 === 0 ? 1 : 0; }
// poravnavajući uzorak (verzija 4: centar 26,26)
for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
  const ivica = Math.abs(dr) === 2 || Math.abs(dc) === 2;
  m[26 + dr][26 + dc] = ivica || (dr === 0 && dc === 0) ? 1 : 0;
}
// tamni modul
m[VEL - 8][8] = 1;
// rezervisano za format
const formatPolja = [];
for (let i = 0; i <= 5; i++) formatPolja.push([8, i], [i, 8]);
formatPolja.push([8, 7], [8, 8], [7, 8]);
for (let i = 0; i <= 7; i++) formatPolja.push([8, VEL - 1 - i]);   // 8 polja: (8,VEL-8)…(8,VEL-1)
for (let i = 0; i <= 6; i++) formatPolja.push([VEL - 1 - i, 8]);
for (const [r, c] of formatPolja) if (m[r][c] === null) m[r][c] = 0;

// --- Upis podataka cik-cak, sa maskom 0 ---
let bitIdx = 0;
const sviBitovi = [];
for (const b of sve) for (let i = 7; i >= 0; i--) sviBitovi.push((b >> i) & 1);
let nagore = true;
for (let c = VEL - 1; c > 0; c -= 2) {
  if (c === 6) c--;
  for (let k = 0; k < VEL; k++) {
    const r = nagore ? VEL - 1 - k : k;
    for (const cc of [c, c - 1]) {
      if (m[r][cc] !== null) continue;
      let bit = bitIdx < sviBitovi.length ? sviBitovi[bitIdx++] : 0;
      if ((r + cc) % 2 === 0) bit ^= 1;   // maska 0
      m[r][cc] = bit;
    }
  }
  nagore = !nagore;
}

// --- Format (nivo M = 00, maska 0) ---
{
  let format = 0b00 << 3 | 0;
  let ostatak = format << 10;
  const gen = 0b10100110111;
  for (let i = 4; i >= 0; i--) if ((ostatak >> (10 + i)) & 1) ostatak ^= gen << i;
  let biti = ((format << 10) | ostatak) ^ 0b101010000010010;
  const uzmi = (i) => (biti >> (14 - i)) & 1;
  for (let i = 0; i <= 5; i++) m[8][i] = uzmi(i);
  m[8][7] = uzmi(6); m[8][8] = uzmi(7); m[7][8] = uzmi(8);
  for (let i = 9; i <= 14; i++) m[14 - i][8] = uzmi(i);
  for (let i = 0; i <= 7; i++) m[VEL - 1 - i][8] = uzmi(i);
  for (let i = 7; i <= 14; i++) m[8][VEL - 15 + i] = uzmi(i);   // bitovi 7–14 idu od (8,VEL-8)
  m[VEL - 8][8] = 1;
}

// --- SVG ---
const put = [];
for (let r = 0; r < VEL; r++) for (let c = 0; c < VEL; c++) if (m[r][c]) put.push('M' + c + ' ' + r + 'h1v1h-1z');
const svg = '<svg viewBox="-2 -2 ' + (VEL + 4) + ' ' + (VEL + 4) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR код за вежбаоницу">' +
  '<rect x="-2" y="-2" width="' + (VEL + 4) + '" height="' + (VEL + 4) + '" fill="#fff"/>' +
  '<path d="' + put.join('') + '" fill="#111"/></svg>';

fs.writeFileSync('qr.svg', svg);
console.log('qr.svg napravljen (' + VEL + 'x' + VEL + ' modula, ' + TEKST + ')');
