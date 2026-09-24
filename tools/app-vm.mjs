// APP-VM: izvlači PRAVE funkcije iz app.js (bez prekucavanja logike) i pokreće ih u node vm sa
// lažnim satom. Koriste ga tools/plan-proba.mjs i revizije (v148). Nova funkcija koju plan koristi
// mora da se doda u PARCES ispod, inače vm javi „is not defined".
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

// Po uvlačenju: deklaracije u IIFE stoje na 2 razmaka; kraj je prvi red "  }" / "  };" / "  ];".
const LINES = APP.split('\n');
function grab(re) {
  const m = APP.match(re);
  if (!m) throw new Error('nema: ' + re);
  const start = APP.slice(0, m.index).split('\n').length - 1;
  const first = LINES[start];
  const bez = first.replace(/\s\/\/.*$/, '');
  const bal = (t) => [...t].reduce((d, c) => d + ('{(['.includes(c) ? 1 : ')}]'.includes(c) ? -1 : 0), 0);
  if (/[;}]\s*$/.test(bez) && bal(bez) === 0) return first;
  for (let k = start + 1; k < LINES.length; k++) if (/^  [}\]]\)?;?\s*$/.test(LINES[k])) return LINES.slice(start, k + 1).join('\n');
  throw new Error('nezavršeno: ' + re);
}

const PARCES = [
  /const DAY = [^;]+;/, /const one = [^;]+;/, /const few = [^;]+;/, /const novihPitanja = /, /const uzBroj = /, /const localDay = /, /const pocetakDanaZa = /,
  /const STR = \{/, /const KEY = [^;]+;/, /const FS_MIN = [^;]+;/, /const PRAG_UDEO = [^;]+;/, /const prag = /, /function fmtDatum\(/,
  /function nInt\(/, /function nNum\(/, /function maxTs\(/, /function normalizeState\(/,
  /function qs\(id\)/, /const L = \(k\)/, /const T = \(obj\)/, /const nQ = /, /function record\(/, /function danUArhivi\(/, /function upisiNiz\(/, /const inQueue = /, /const dueOf = /, /function queueSplit\(/,
  /const OSVEZI_POSLE = [^;]+;/, /function zaOsvezavanje\(/, /const SIM_SLOTS = \[/,
  /let _tezine = null;[^;]*;?/, /function tezinaPodoblasti\(/, /function simulirajPlan\(/, /const pocetakDana = /, /function ponDnevno\(/, /function predlogTempa\(/, /function danaDoIspita\(/, /let _pojava = null;/, /function verovatnocaPojave\(/,
  /const neodgovorenih = /, /function zapocniDan\(/, /function osveziDan\(/, /function ponistiAutoKvotu\(/, /function planStanje\(/,
  /const planPrazan = /, /function planIds\(/, /function tacnostDanas\(/, /function planBlok\(/, /function homeExtras\(/,
];

let src = '';
for (const re of PARCES) {
  const s = re.source.includes('[^;]+;') ? APP.match(re)[0] : (/_tezine/.test(re.source) ? 'let _tezine = null;' : /_pojava/.test(re.source) ? 'let _pojava = null;' : grab(re));
  src += s + '\n';
}


export function napravi({ state, now }) {
  const D = {};
  const dataSrc = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const RealDate = Date;
  let T0 = typeof now === 'number' ? now : new RealDate(now).getTime();
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(T0); else super(...a); }
    static now() { return T0; }
  }
  const ctx = { window: {}, console, Math, JSON, Object, Array, Number, String, Map, Set, isNaN, Date: FakeDate, Infinity };
  vm.createContext(ctx);
  vm.runInContext(dataSrc, ctx);
  vm.runInContext(`
    const D = window.QUIZ; const Q = D.questions; const byId = new Map(Q.map((q) => [q.id, q]));
    let S = { script: 'l', q: {} };
    let saves = 0; function save() { saves++; }
    function readiness() { return { exp: null, answered: 0 }; }
    const SIM_PREDLOG_OD = 80;
    ${src}
    S = normalizeState(__STATE__);
    globalThis.api = { get S() { return S; }, set S(v) { S = v; }, Q, byId, record, inQueue, dueOf, queueSplit, zaOsvezavanje, tezinaPodoblasti, simulirajPlan, ponDnevno, predlogTempa, danaDoIspita, neodgovorenih, zapocniDan, osveziDan, ponistiAutoKvotu, planStanje, planIds, tacnostDanas, planBlok, homeExtras, normalizeState, SIM_SLOTS, localDay, get saves() { return saves; } };
  `.replace('__STATE__', JSON.stringify(state)), ctx);
  const api = ctx.api;
  api.setNow = (t) => { T0 = typeof t === 'number' ? t : new RealDate(t).getTime(); };
  api.getNow = () => T0;
  return api;
}
export const strip = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
