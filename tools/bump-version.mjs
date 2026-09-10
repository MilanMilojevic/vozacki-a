// Podigni verziju aplikacije: version.js + ?v= markice u index.html (pozvati posle svake izmene fajlova)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const versionPath = fileURLToPath(new URL('../version.js', import.meta.url));
const indexPath = fileURLToPath(new URL('../index.html', import.meta.url));
const temporary = [];

try {
  // Pročitaj i proveri OBA fajla pre prvog upisa, nezavisno od radne fascikle.
  const vjs = fs.readFileSync(versionPath, 'utf8');
  const html = fs.readFileSync(indexPath, 'utf8');
  const match = vjs.match(/^\s*self\.APP_V\s*=\s*(0|[1-9]\d*)\s*;\s*$/);
  if (!match) throw new Error('version.js mora sadržati jednu dodelu self.APP_V = ceo broj;');
  const oldV = Number(match[1]);
  const newV = oldV + 1;
  if (!Number.isSafeInteger(oldV) || !Number.isSafeInteger(newV)) {
    throw new Error('broj verzije je izvan bezbednog celobrojnog opsega');
  }

  // Uzmi CELU vrednost: ?v=1260 ili ?v=126abc nije oznaka verzije 126.
  const marker = /\?v=([^"'\s<>?&#]*)/g;
  const markers = [...html.matchAll(marker)];
  if (markers.length !== 5 || markers.some((m) => m[1] !== String(oldV))) {
    throw new Error(`index.html mora imati tačno 5 oznaka ?v=${oldV}, bez drugih verzija`);
  }
  const outputs = [
    [versionPath, `self.APP_V = ${newV};\n`],
    [indexPath, html.replace(marker, `?v=${newV}`)],
  ];

  // Ne prekidaj postojeći fajl delimičnim upisom: pripremi oba u istim fasciklama.
  for (const [target, content] of outputs) {
    const temp = `${target}.${randomUUID()}.tmp`;
    temporary.push(temp);
    fs.writeFileSync(temp, content, { encoding: 'utf8', flag: 'wx' });
  }
  // Svaka zamena je zasebna. Ovo NIJE transakcija nad dva fajla:
  // prekid između zamena zahteva vraćanje para iz Gita pre ponovnog pokretanja.
  for (let i = 0; i < outputs.length; i++) fs.renameSync(temporary[i], outputs[i][0]);
  console.log('verzija ' + oldV + ' → ' + newV);
} catch (error) {
  console.error('FAIL: ' + error.message);
  process.exitCode = 1;
} finally {
  for (const temp of temporary) {
    try { fs.unlinkSync(temp); }
    catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('FAIL: privremeni fajl nije uklonjen: ' + temp);
        process.exitCode = 1;
      }
    }
  }
}
