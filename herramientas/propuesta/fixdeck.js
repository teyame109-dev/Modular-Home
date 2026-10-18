// Restaura los metadatos del índice, renumera pies de página y comprueba los límites de los SVG
const fs = require('fs');
const prev = JSON.parse(fs.readFileSync('deck_prev.json', 'utf8'));
const d = JSON.parse(fs.readFileSync('project/deck.json', 'utf8'));
fs.writeFileSync('project/deck.json', JSON.stringify({ v: 4, createdOnFiles: prev.createdOnFiles, lists: prev.lists, ...d, createdOnFiles: prev.createdOnFiles }, null, 2));
d.order.forEach((id, i) => { const f = 'project/slides/' + id + '.html'; const s = fs.readFileSync(f, 'utf8'); fs.writeFileSync(f, s.replace(/(text-align:right; font-size:24px; color:#[0-9A-F]{6}">)\d\d(<\/p>)/, '$1' + String(i + 1).padStart(2, '0') + '$2')); });
console.log(d.order.length + ' diapositivas: ' + d.order.join(','));
for (const id of d.order) {
  const s = fs.readFileSync('project/slides/' + id + '.html', 'utf8');
  for (const svg of (s.match(/<svg[\s\S]*?<\/svg>/g) || [])) {
    const [w, h] = svg.match(/width="(\d+)" height="(\d+)"/).slice(1).map(Number);
    const xs = [...svg.matchAll(/ (?:x1|x2|x)="(-?[\d.]+)"/g)].map(m => +m[1]); const ys = [...svg.matchAll(/ (?:y1|y2|y)="(-?[\d.]+)"/g)].map(m => +m[1]);
    const bad = Math.min(...xs) < 0 || Math.max(...xs) > w || Math.min(...ys) < 0 || Math.max(...ys) > h;
    if (bad || /mod_|alz|tab|plantas|volumen/.test(id)) console.log(id.padEnd(9), w + 'x' + h, bad ? 'FUERA' : 'ok', Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys));
  }
}
const files = fs.readdirSync('project/slides').map(f => f.replace('.html', '')); console.log('sobran:', files.filter(f => !d.order.includes(f)).join(',') || 'ninguno');
