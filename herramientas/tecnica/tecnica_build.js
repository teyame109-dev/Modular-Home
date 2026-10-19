// Versión solo técnica de la propuesta, para los operarios: sin importes ni condiciones comerciales
const fs = require('fs'), path = require('path');
const SRC = 'propuesta/project/slides', DST = 'tecnica/project/slides';
const order = ['cover', 'resumen', 'adaptacion', 'plantas', 'volumen', 'mod_m1', 'mod_m2', 'mod_m3', 'mod_m4', 'mod_m5', 'mod_m6', 'alz_pb', 'alz_p1', 'tab_pb', 'tab_p1', 'fabricacion', 'parcela', 'sistema', 'calidades', 'alcance', 'cierre'];
const rep = (h, a, b, id) => { if (!h.includes(a)) throw new Error(id + ' no: ' + a.slice(0, 60)); return h.split(a).join(b); };
order.forEach((id, i) => {
  let h = fs.readFileSync(path.join(SRC, id + '.html'), 'utf8');
  if (h.includes('PROPUESTA TÉCNICA Y ECONÓMICA')) h = h.split('RG21 CAPITAL · PROPUESTA TÉCNICA Y ECONÓMICA').join('RG21 CAPITAL · DOCUMENTACIÓN TÉCNICA DE TALLER');
  if (id === 'cover') {
    h = rep(h, 'Propuesta técnica y económica', 'Documentación técnica de taller', id);
    h = rep(h, 'Para Nido Capital · Magnus 5 Real Estate', 'Promotor: Nido Capital · Fábrica: Seseña', id);
  }
  if (id === 'resumen') {
    h = rep(h, '>CUÁNTO<', '>DÓNDE<', id);
    h = h.replace(/Piloto: [0-9.]+ €/, 'Seseña → Guadalix');
    h = h.replace(/Con la memoria de calidades del proyecto\.[^<]*Sin IVA\./, 'Se fabrica en la nave de Seseña y se monta en la parcela de Guadalix de la Sierra (Madrid), sobre la cimentación del promotor.');
  }
  // numeración de página según el nuevo orden
  h = h.replace(/(text-align:right; font-size:24px; color:#[0-9A-F]{6}">)\d\d(<\/p>)/, '$1' + String(i + 1).padStart(2, '0') + '$2');
  if (/€|IVA|precio|Precio|margen|Margen|coste|Coste/.test(h)) throw new Error('queda algo económico en ' + id + ': ' + (h.match(/.{40}(€|IVA|precio|Precio|margen|Margen|coste|Coste).{40}/) || [''])[0]);
  fs.writeFileSync(path.join(DST, id + '.html'), h);
});
const d = JSON.parse(fs.readFileSync('propuesta/project/deck.json', 'utf8'));
const deck = { v: 4, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') }, lists: 'css', title: 'Névola · Documentación técnica de taller', cover: 'cover', order,
  sections: { s1: { description: 'Qué se construye y cómo se pasa el proyecto a módulos', start: 'cover' }, s2: { description: 'Los seis módulos: fichas, alzados y plantas con tabiques', start: 'mod_m1' }, s3: { description: 'Fabricación, montaje, sistema constructivo y calidades', start: 'fabricacion' } },
  faces: d.faces, designSystems: [] };
fs.writeFileSync('tecnica/project/deck.json', JSON.stringify(deck, null, 2));
console.log('ok', order.length, 'diapositivas');
