// Preuzima slike svih HasImage pitanja iz javnog eUprava practice servisa.
// Upotreba: node download-images.mjs <base.json> <outDir>
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://servisi.euprava.gov.rs/autoskole';
const GUID = process.argv[2];
if (!GUID) {
  console.error('Upotreba: node download-images.mjs <practice-GUID>');
  console.error('GUID se dobija na eUprava profilu kandidata, na linku za vežbanje pitanja.');
  process.exit(1);
} // A kategorija
const [, , srcFile = 'base-A.json', outDir = '../img'] = process.argv;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const data = JSON.parse(await fs.readFile(srcFile, 'utf8'));
const ids = data.questions.filter((q) => q.HasImage).map((q) => q.qId);
await fs.mkdir(outDir, { recursive: true });

let ok = 0, skipped = 0;
const failed = [];
for (const id of ids) {
  const dest = path.join(outDir, `${id}.jpg`);
  try {
    const st = await fs.stat(dest).catch(() => null);
    if (st && st.size > 1000) { skipped++; continue; }
    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      if (attempt) await sleep(1500);
      const res = await fetch(`${BASE}/Question/QuestionsPracticeImage?id=${id}&guid=${GUID}`);
      const buf = Buffer.from(await res.arrayBuffer());
      // JPEG magic: FF D8
      if (res.ok && buf.length > 1000 && buf[0] === 0xff && buf[1] === 0xd8) {
        await fs.writeFile(dest, buf);
        ok++; done = true;
      }
    }
    if (!done) failed.push(id);
  } catch (e) {
    failed.push(id);
  }
  await sleep(200);
  if ((ok + skipped + failed.length) % 100 === 0) console.log(`... ${ok + skipped + failed.length}/${ids.length}`);
}
console.log(`GOTOVO: ok=${ok} preskoceno=${skipped} neuspesno=${failed.length}`);
if (failed.length) console.log('FAILED IDS:', failed.join(' '));
