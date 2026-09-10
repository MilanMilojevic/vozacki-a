// Preuzima slike HasImage pitanja; privatni practice GUID nikada ne ide u izlaz/log.
// Putanje bez argumenata pripadaju ovom projektu, nezavisno od radnog direktorijuma.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BASE = 'https://servisi.euprava.gov.rs/autoskole';
const HERE = fileURLToPath(new URL('./', import.meta.url));
const USAGE = 'Upotreba: node tools/download-images.mjs --guid GUID [--source base.json] [--out img] [--refresh]';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function argumentsFor(args) {
  const options = { source: path.join(HERE, 'base-A.json'), out: path.join(HERE, '../img'), refresh: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--guid', '--source', '--out', '--refresh'].includes(key) || seen.has(key)) throw Error(USAGE);
    seen.add(key);
    if (key === '--refresh') { options.refresh = true; continue; }
    const value = args[++i];
    if (!value || value.startsWith('--')) throw Error(USAGE);
    options[key.slice(2)] = value;
  }
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(options.guid || '')) throw Error(USAGE);
  options.source = path.resolve(options.source);
  options.out = path.resolve(options.out);
  return options;
}

function imageIds(data) {
  if (!data || !Array.isArray(data.questions) || !data.questions.length) throw Error('Izvor nema pitanja.');
  const seen = new Set(), ids = [];
  for (const q of data.questions) {
    if (!q || !Number.isSafeInteger(q.qId) || q.qId <= 0 || seen.has(q.qId) || ![true, false, 0, 1].includes(q.HasImage)) {
      throw Error('Izvor ima neispravne ili ponovljene ID-jeve / oznake slika.');
    }
    seen.add(q.qId);
    if (q.HasImage) ids.push(q.qId);
  }
  return ids;
}

// Provera JPEG početka/kraja odbija HTML i prekinut prenos; nije zamena za dekodiranje slike.
function jpeg(buf) {
  return buf.length > 1000 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
    && buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9;
}

export async function downloadImages(options) {
  let raw, data;
  try { raw = await fs.readFile(options.source, 'utf8'); } catch { throw Error('Izvorna datoteka nije dostupna.'); }
  try { data = JSON.parse(raw); } catch { throw Error('Izvor nije ispravan JSON.'); }
  const ids = imageIds(data); // Ceo izvor proveravamo pre prvog upisa ili zahteva.
  try { await fs.mkdir(options.out, { recursive: true }); } catch { throw Error('Izlazni direktorijum nije dostupan.'); }
  const failed = [];
  let downloaded = 0, skipped = 0;
  for (const id of ids) {
    const dest = path.join(options.out, `${id}.jpg`);
    const existing = await fs.readFile(dest).catch(() => null);
    if (!options.refresh && existing && jpeg(existing)) { skipped++; continue; }
    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      if (attempt) await sleep(1500);
      let temporary;
      try {
        const url = new URL(BASE + '/Question/QuestionsPracticeImage');
        url.searchParams.set('id', id);
        url.searchParams.set('guid', options.guid);
        const response = await fetch(url.href, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) continue;
        const buf = Buffer.from(await response.arrayBuffer());
        if (!jpeg(buf)) continue;
        // Isti direktorijum omogućava zamenu tek posle potpuno završenog upisa.
        temporary = path.join(options.out, `.${id}.${randomUUID()}.tmp`);
        await fs.writeFile(temporary, buf, { flag: 'wx' });
        await fs.rename(temporary, dest);
        done = true;
        downloaded++;
      } catch {
        // Fetch greška može sadržati privatni URL. Prijavljujemo samo neuspešni qId.
      } finally {
        if (temporary) await fs.rm(temporary, { force: true }).catch(() => {});
      }
    }
    if (!done) failed.push(id);
    await sleep(200);
  }
  return { downloaded, skipped, failed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = argumentsFor(process.argv.slice(2));
    const result = await downloadImages(options);
    console.log(`GOTOVO: ok=${result.downloaded} preskoceno=${result.skipped} neuspesno=${result.failed.length}`);
    if (result.failed.length) {
      console.error('Neuspešni ID-jevi: ' + result.failed.join(' '));
      process.exitCode = 1;
    }
    if (options.refresh && result.downloaded) console.log('Pre objave osveženih slika promenite IMG ključ u sw.js i broj izdanja; stari ključ zadržava stare slike.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
