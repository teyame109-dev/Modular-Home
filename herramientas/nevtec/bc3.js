// Lector de BC3 (FIEBDC-3) -> árbol de capítulos y partidas con cantidades
const fs = require('fs');
const BS = String.fromCharCode(92);
const raw = fs.readFileSync(process.argv[2]).toString('latin1');
const recs = raw.split('~').map(r => r.replace(/[\r\n]+$/, ''));
const C = {}, D = {}, T = {};
const clean = s => s.trim().replace(/#+$/, '');
for (const r of recs) {
  const t = r[0]; const f = r.slice(2).split('|');
  if (t === 'C') {
    for (let c of f[0].split(BS)) { c = c.trim(); if (!c) continue; C[clean(c)] = { code: c, u: f[1], name: f[2], price: +f[3] || 0, type: f[5] }; }
  } else if (t === 'D') {
    const p = clean(f[0]); const parts = (f[1] || '').replace(/\r?\n/g, '').split(BS); const ch = [];
    for (let i = 0; i + 2 < parts.length; i += 3) { if (!parts[i].trim()) continue; ch.push({ c: clean(parts[i]), factor: parts[i + 1] === '' ? 1 : +parts[i + 1], q: parts[i + 2] === '' ? 1 : +parts[i + 2] }); }
    D[p] = ch;
  } else if (t === 'T') {
    T[clean(f[0])] = (f[1] || '').replace(/\r?\n/g, ' ');
  }
}
const root = Object.keys(C).find(k => C[k].code.endsWith('##'));
const out = [];
function walk(code, depth, path) {
  for (const k of (D[code] || [])) {
    const cc = C[k.c] || { code: k.c, name: '?', u: '', price: 0 };
    const isCap = (cc.code || '').endsWith('#');
    const qty = k.q * k.factor;
    if (isCap) { out.push({ lvl: depth, cap: true, code: k.c, name: cc.name, price: cc.price, path }); walk(k.c, depth + 1, path.concat(k.c)); }
    else out.push({ lvl: depth, cap: false, code: k.c, u: cc.u, name: cc.name, qty, price: cc.price, imp: qty * cc.price, path });
  }
}
walk(root, 0, []);
// descomposición de precios de las partidas (materiales, mano de obra, maquinaria)
const decomp = {};
for (const o of out) if (!o.cap && D[o.code]) decomp[o.code] = D[o.code].map(k => ({ c: k.c, q: k.q * k.factor, u: (C[k.c] || {}).u, name: (C[k.c] || {}).name, price: (C[k.c] || {}).price, type: (C[k.c] || {}).type }));
fs.writeFileSync('tree.json', JSON.stringify({ root: C[root], out, T, decomp }));
console.log('ROOT', C[root].name, C[root].price);
for (const o of out) if (o.cap && o.lvl <= 1) console.log('  '.repeat(o.lvl) + '[' + o.code + '] ' + o.name + ' = ' + o.price.toFixed(2));
const items = out.filter(o => !o.cap);
console.log('partidas', items.length, 'suma', items.reduce((a, b) => a + b.imp, 0).toFixed(2));
