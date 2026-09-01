// PROVERA QR KODA — čita qr.svg nazad u tekst, nezavisno od generatora.
// Radi ono što radi i čitač na telefonu: rekonstruiše matricu, pročita format,
// skine masku, pročita režim/dužinu/bajtove. Pokretanje: node proveri-qr.mjs
import fs from 'node:fs';

const OCEKIVANO = 'https://milanmilojevic.github.io/vozacki-a/';
const svg = fs.readFileSync('qr.svg', 'utf8');

// --- rekonstrukcija matrice iz putanje ---
const vb = svg.match(/viewBox="(-?\d+) (-?\d+) (\d+) (\d+)"/);
const VEL = Number(vb[3]) - 4;
const m = Array.from({ length: VEL }, () => new Array(VEL).fill(0));
for (const mm of svg.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
  const c = Number(mm[1]), r = Number(mm[2]);
  m[r][c] = 1;
}
console.log('matrica:', VEL + 'x' + VEL + ', tamnih modula:', m.flat().filter(Boolean).length);

// --- polja koja NISU podaci (isti raspored kao pri crtanju) ---
const rezervisano = Array.from({ length: VEL }, () => new Array(VEL).fill(false));
const oznaci = (r, c, h, w) => { for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) if (r + i >= 0 && r + i < VEL && c + j >= 0 && c + j < VEL) rezervisano[r + i][c + j] = true; };
oznaci(-1, -1, 9, 9); oznaci(-1, VEL - 8, 9, 9); oznaci(VEL - 8, -1, 9, 9);
for (let i = 0; i < VEL; i++) { rezervisano[6][i] = true; rezervisano[i][6] = true; }
oznaci(24, 24, 5, 5);                       // poravnavajući uzorak, verzija 4
for (let i = 0; i <= 8; i++) { rezervisano[8][i] = true; rezervisano[i][8] = true; }
for (let i = 0; i < 8; i++) { rezervisano[8][VEL - 1 - i] = true; rezervisano[VEL - 1 - i][8] = true; }

// --- čitanje formata (maska i nivo) ---
let formatBiti = '';
for (let i = 0; i <= 5; i++) formatBiti += m[8][i];
formatBiti += m[8][7]; formatBiti += m[8][8]; formatBiti += m[7][8];
for (let i = 9; i <= 14; i++) formatBiti += m[14 - i][8];
const format = parseInt(formatBiti, 2) ^ 0b101010000010010;
const nivo = (format >> 13) & 0b11, maska = (format >> 10) & 0b111;
const nivoIme = { 1: 'L', 0: 'M', 3: 'Q', 2: 'H' }[nivo];
console.log('format: nivo ispravke =', nivoIme, '| maska =', maska);

// --- čitanje podataka cik-cak, uz skidanje maske ---
const maskaF = (r, c) => (maska === 0 ? (r + c) % 2 === 0 : null);
if (maska !== 0) { console.log('PAŽNJA: provera podržava samo masku 0'); process.exit(1); }
let biti = '';
let nagore = true;
for (let c = VEL - 1; c > 0; c -= 2) {
  if (c === 6) c--;
  for (let k = 0; k < VEL; k++) {
    const r = nagore ? VEL - 1 - k : k;
    for (const cc of [c, c - 1]) {
      if (rezervisano[r][cc]) continue;
      biti += (m[r][cc] ^ (maskaF(r, cc) ? 1 : 0));
    }
  }
  nagore = !nagore;
}

// --- dekodiranje: režim + dužina + bajtovi ---
const rezim = parseInt(biti.slice(0, 4), 2);
const duzina = parseInt(biti.slice(4, 12), 2);
console.log('režim:', rezim === 4 ? 'bajt (4)' : rezim, '| dužina:', duzina, 'bajtova');
if (rezim !== 4) { console.log('NEOČEKIVAN REŽIM'); process.exit(1); }
const bajtovi = [];
for (let i = 0; i < duzina; i++) bajtovi.push(parseInt(biti.slice(12 + i * 8, 20 + i * 8), 2));
const tekst = new TextDecoder().decode(new Uint8Array(bajtovi));
console.log('pročitano:', JSON.stringify(tekst));
console.log(tekst === OCEKIVANO ? '✓ QR JE ISPRAVAN — vodi na tačnu adresu' : '✗ NE POKLAPA SE sa očekivanim');
process.exit(tekst === OCEKIVANO ? 0 : 1);
