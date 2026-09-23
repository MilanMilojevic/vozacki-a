// Omot za merni alat: meri TAČNO ono što aplikacija učitava (../../procena.js), ne kopiju.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const kod = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'procena.js'), 'utf8');
const okvir = {};
new Function('self', kod)(okvir);
export const proceni = okvir.VozackiProcena.proceni;
