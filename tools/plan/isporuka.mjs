// Omot za merni alat: meri TAČNO ono što aplikacija učitava (../../plan.js), ne kopiju.
// plan.js čita procenu iz self.VozackiProcena — ovde je to isti procena.js (../procena/isporuka.mjs).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { proceni } from '../procena/isporuka.mjs';
const kod = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'plan.js'), 'utf8');
const okvir = { VozackiProcena: { proceni } };
new Function('self', kod)(okvir);
export const planDanas = okvir.VozackiPlan.planDanas;
export const uCir = okvir.VozackiPlan.uCir;
