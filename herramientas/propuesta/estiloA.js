// Aplica la dirección A (Plano de taller) al generador de la propuesta
const fs = require('fs'); let s = fs.readFileSync('gen.js', 'utf8');
const cut = (a, b, repl) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marca ' + a.slice(0, 40)); s = s.slice(0, i) + repl + s.slice(j); };
const r = (a, b) => { if (!s.includes(a)) throw new Error('no: ' + a.slice(0, 60)); s = s.split(a).join(b); };

// ---------- marco de diapositiva ----------
cut("const FONT = ", "const card = ", String.raw`const FONT = "font-family:'Archivo', Arial, sans-serif";
const MONO = "font-family:'IBM Plex Mono', 'Courier New', monospace";
let page = 0;
// logo reducido: escuadra con placa de anclaje + rg21
const LOGO = col => '<div style="position:absolute; left:128px; top:60px; width:220px; height:48px; display:flex; flex-direction:row; gap:14px; align-items:flex-start">'
  + '<div style="width:30px; height:30px; border-top:7px solid ' + col + '; border-left:7px solid ' + col + '"><div style="width:7px; height:7px; background:#C8381F"></div></div>'
  + '<p style="font-size:40px; font-weight:900; line-height:0.9; letter-spacing:-2px; color:' + col + '">rg21</p></div>';
// logo completo: escuadra, rg21 y capital
const LOGOFULL = (sz, col) => '<div style="display:flex; flex-direction:row; gap:' + Math.round(sz * 0.2) + 'px; align-items:flex-start">'
  + '<div style="width:' + Math.round(sz * 0.62) + 'px; height:' + Math.round(sz * 0.62) + 'px; border-top:' + Math.round(sz * 0.13) + 'px solid ' + col + '; border-left:' + Math.round(sz * 0.13) + 'px solid ' + col + '"><div style="width:' + Math.round(sz * 0.13) + 'px; height:' + Math.round(sz * 0.13) + 'px; background:#C8381F"></div></div>'
  + '<div style="display:flex; flex-direction:column; gap:' + Math.round(sz * 0.14) + 'px">'
  + '<p style="font-size:' + sz + 'px; font-weight:900; line-height:0.85; letter-spacing:' + -Math.round(sz * 0.05) + 'px; color:' + col + '">rg21</p>'
  + '<p style="' + MONO + '; font-size:' + Math.max(24, Math.round(sz * 0.2)) + 'px; font-weight:500; line-height:1; letter-spacing:' + Math.round(sz * 0.08) + 'px; text-transform:uppercase; color:' + col + '">capital</p></div></div>';
const frame = (id, eyebrow, title, body, gap, bg, fg, sub, acc) => { page++; return '<section id="' + id + '" data-transition="fade" style="background:' + bg + '; color:' + fg + '; ' + FONT + '; padding:176px 128px 160px; display:flex; flex-direction:column; gap:' + gap + 'px">\n'
  + LOGO(fg) + '\n'
  + '<p style="position:absolute; right:128px; top:66px; width:760px; ' + MONO + '; font-size:24px; letter-spacing:2px; text-transform:uppercase; text-align:right; color:' + sub + '">Névola · ' + eyebrow + '</p>\n'
  + '<div style="position:absolute; left:128px; right:128px; bottom:114px; height:2px; background:' + fg + '"></div>\n'
  + '<p style="position:absolute; left:128px; bottom:64px; width:900px; ' + MONO + '; font-size:24px; letter-spacing:2px; color:' + sub + '">RG21 CAPITAL · PROPUESTA TÉCNICA Y ECONÓMICA</p>\n'
  + '<p style="position:absolute; right:128px; bottom:64px; width:200px; ' + MONO + '; text-align:right; font-size:24px; color:' + sub + '">' + String(page).padStart(2, '0') + '</p>\n'
  + '<h2 style="font-size:64px; font-weight:700; line-height:1.06; letter-spacing:-2px; color:' + fg + '">' + title + '</h2>\n'
  + body + '\n</section>'; };
const light = (id, word, eyebrow, title, body, gap = 44) => frame(id, eyebrow, title, body, gap, '#E7E8E3', '#141414', '#5E6064', '#C8381F');
const dark = (id, word, eyebrow, title, body) => frame(id, eyebrow, title, body, 48, '#141414', '#ECEDE8', '#A9ABA6', '#EE6A4E');
`);

// ---------- portada ----------
const iA = s.indexOf('S.cover = `'), iB = s.indexOf('</section>`;', iA) + '</section>`;'.length;
const grid = [960, 1299, 1543, 1792];
const cover = 'S.cover = `<section id="cover" data-transition="fade" style="background:#E7E8E3; color:#141414; ${FONT}; padding:128px; display:flex; flex-direction:column; justify-content:space-between">\n'
  + grid.map(x => `<div style="position:absolute; left:${x - 1}px; top:0px; width:2px; height:1080px; background:#C9CBC5"></div>`).join('\n') + '\n'
  + '<div style="position:absolute; left:0px; top:842px; width:1920px; height:2px; background:#C9CBC5"></div>\n'
  + grid.map(x => `<div style="position:absolute; left:${x - 8}px; top:835px; width:16px; height:16px; background:#C8381F"></div>`).join('\n') + '\n'
  + [['3,20', 960, 1299], ['2,30', 1299, 1543], ['2,35', 1543, 1792]].map(([t, a, b]) => `<p style="position:absolute; left:${a}px; top:790px; width:${b - a}px; \${MONO}; font-size:24px; text-align:center; color:#5E6064">${t}</p>`).join('\n') + '\n'
  + '<div style="display:flex; flex-direction:row; justify-content:space-between; align-items:flex-start">${LOGOFULL(72, \'#141414\')}'
  + '<p style="width:640px; ${MONO}; font-size:24px; line-height:1.6; letter-spacing:2px; text-transform:uppercase; text-align:right; color:#45474A">Propuesta técnica y económica<br>Octubre 2026</p></div>\n'
  + '<div style="display:flex; flex-direction:column; gap:28px">\n'
  + '<h1 style="font-size:210px; font-weight:900; line-height:0.86; letter-spacing:-9px; color:#141414">NÉVOLA</h1>\n'
  + '<p style="width:880px; font-size:44px; font-weight:500; line-height:1.2; letter-spacing:-0.5px; color:#141414">Vivienda piloto y serie de 16 viviendas en construcción industrializada</p>\n'
  + '<p style="width:880px; ${MONO}; font-size:24px; line-height:1.5; color:#45474A">Para Nido Capital · Magnus 5 Real Estate<br>Sobre el proyecto de ejecución de julio de 2026</p>\n'
  + '</div>\n</section>`;';
s = s.slice(0, iA) + cover + s.slice(iB);

// ---------- cierre: solo el logo ----------
const jA = s.indexOf('S.cierre = `'), jB = s.indexOf('</section>`;', jA) + '</section>`;'.length;
s = s.slice(0, jA) + 'S.cierre = `<section id="cierre" data-transition="fade" style="background:#141414; color:#ECEDE8; ${FONT}; padding:128px; display:flex; flex-direction:column; align-items:center; justify-content:center">\n${LOGOFULL(200, \'#ECEDE8\')}\n</section>`;' + s.slice(jB);

// ---------- paleta antigua → Plano de taller, etiquetas en mono, cifras en Archivo Narrow ----------
r("for (const id of order) { if (!S[id]) throw new Error('falta ' + id); fs.writeFileSync(path.join(OUT, 'slides', id + '.html'), S[id] + '\\n'); }",
  String.raw`const PAL = { '#161616': '#141414', '#F5F3EF': '#ECEDE8', '#9A8F80': '#7C7F82', '#7A6347': '#C8381F', '#E9E4DA': '#D5D7D1', '#E9D9BC': '#F2D3C8', '#CDB894': '#E8B9AA', '#C8B394': '#EE6A4E', '#B4322C': '#C8381F', '#5E5850': '#4D5054', '#2F5D8A': '#3E4146', '#E2D3B8': '#EFD0C5', '#D9D3C7': '#C6C8C2', '#D6CFC2': '#CBCDC7', '#9FB7CC': '#A7AAAD', '#8E8679': '#7C7F82', '#57534D': '#45474A', '#3A3835': '#34363A', '#FBFAF7': '#EEEFEA', '#F7F4EE': '#EDEEE9', '#F1EDE5': '#E3E5DF', '#EFEBE3': '#E1E3DD', '#EFE6D6': '#EDD8D0', '#ECE8E1': '#E1E3DD', '#E6E0D6': '#DADCD6', '#E3DDD2': '#D8DAD4', '#E2DDD4': '#C9CBC5', '#DCD5C8': '#CFD1CB', '#D2C3A6': '#D9A898', '#C98A4B': '#C8381F', '#B9B4AC': '#A9ABA6', '#B59E79': '#C2705C', '#8A7457': '#9C2E18', '#6F6A63': '#5E6064', '#1F1E1D': '#232528' };
const estilo = h => h
  .replace(/#[0-9A-Fa-f]{6}/g, m => PAL[m.toUpperCase()] || m)
  .replace(/font-weight:600; letter-spacing:[4-8]px;/g, MONO + '; font-weight:500; letter-spacing:2px; text-transform:uppercase;')
  .replace(/font-size:(\d{2,3})px; font-weight:700/g, (m, n) => +n >= 64 ? "font-family:'Archivo Narrow', Arial, sans-serif; font-size:" + Math.round(n * 1.08) + 'px; font-weight:700; letter-spacing:-1px' : m);
for (const id of order) { if (!S[id]) throw new Error('falta ' + id); fs.writeFileSync(path.join(OUT, 'slides', id + '.html'), estilo(S[id]) + '\n'); }`);
r("faces: { montserrat: { family: 'Montserrat', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300..800&display=swap' } }",
  "faces: { archivo: { family: 'Archivo', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400..900&display=swap' }, 'archivo-narrow': { family: 'Archivo Narrow', href: 'https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@500..700&display=swap' }, 'ibm-plex-mono': { family: 'IBM Plex Mono', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap' } }");
fs.writeFileSync('gen.js', s); console.log('ok');
