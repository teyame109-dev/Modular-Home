// Genera las diapositivas de la propuesta integral RG21 · Piloto Névola
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'project'); fs.mkdirSync(path.join(OUT, 'slides'), { recursive: true });
const C = { bg: '#F5F3EF', ink: '#161616', card: '#FBFAF7', line: '#E2DDD4', body: '#57534D', foot: '#6F6A63', acc: '#7A6347', accD: '#C8B394', dsub: '#B9B4AC', wm: '#ECE8E1', wmD: '#1F1E1D', pb: '#E9E4DA', p1: '#CDB894', p1s: '#8A7457' };
const FONT = "font-family:'Archivo', Arial, sans-serif";
const MONO = "font-family:'IBM Plex Mono', 'Courier New', monospace";
let page = 0;
// logo reducido: escuadra con placa de anclaje + rg21
const LOGO = col => '<div style="position:absolute; left:128px; top:60px; width:220px; height:48px; display:flex; flex-direction:row; gap:5px; align-items:flex-start">'
  + '<div style="width:21px; height:21px; border-top:5px solid ' + col + '; border-left:5px solid ' + col + '"><div style="width:5px; height:5px; background:#C8381F"></div></div>'
  + '<p style="font-size:40px; font-weight:900; line-height:0.9; letter-spacing:-2px; color:' + col + '">rg21</p></div>';
// logo completo: escuadra, rg21 y capital
const LOGOFULL = (sz, col) => '<div style="display:flex; flex-direction:row; gap:' + Math.round(sz * 0.07) + 'px; align-items:flex-start">'
  + '<div style="width:' + Math.round(sz * 0.5) + 'px; height:' + Math.round(sz * 0.5) + 'px; border-top:' + Math.round(sz * 0.12) + 'px solid ' + col + '; border-left:' + Math.round(sz * 0.12) + 'px solid ' + col + '"><div style="width:' + Math.round(sz * 0.12) + 'px; height:' + Math.round(sz * 0.12) + 'px; background:#C8381F"></div></div>'
  + '<div style="display:flex; flex-direction:column; gap:' + Math.round(sz * 0.14) + 'px">'
  + '<p style="font-size:' + sz + 'px; font-weight:900; line-height:0.85; letter-spacing:' + -Math.round(sz * 0.05) + 'px; color:' + col + '">rg21</p>'
  + '<p style="' + MONO + '; font-size:' + Math.max(24, Math.round(sz * 0.2)) + 'px; font-weight:500; line-height:1; letter-spacing:' + Math.round(sz * 0.08) + 'px; text-transform:uppercase; color:' + col + '">capital</p></div></div>';
const frame = (id, eyebrow, title, body, gap, bg, fg, sub, acc) => { page++; return '<section id="' + id + '" data-transition="fade" style="background:' + bg + '; color:' + fg + '; ' + FONT + '; padding:176px 128px 160px; display:flex; flex-direction:column; gap:' + gap + 'px">\n'
  + LOGO(fg) + '\n'
  + '<p style="position:absolute; right:128px; top:66px; width:760px; ' + MONO + '; font-size:24px; letter-spacing:2px; text-transform:uppercase; text-align:right; color:' + sub + '">Névola · ' + eyebrow + '</p>\n'
  + '<div style="position:absolute; left:128px; right:128px; bottom:114px; height:2px; background:' + fg + '"></div>\n'
  + '<p style="position:absolute; left:128px; bottom:64px; width:900px; ' + MONO + '; font-size:24px; letter-spacing:2px; color:' + sub + '">RG21 CAPITAL · PROPUESTA TÉCNICA Y ECONÓMICA</p>\n'
  + '<p style="position:absolute; right:128px; bottom:64px; width:200px; ' + MONO + '; text-align:right; font-size:24px; color:' + sub + '">' + String(page).padStart(2, '0') + '</p>\n'
  + '<h2 style="font-size:64px; font-weight:800; line-height:1.06; letter-spacing:-2px; color:' + fg + '">' + title + '</h2>\n'
  + body + '\n</section>'; };
const light = (id, word, eyebrow, title, body, gap = 44) => frame(id, eyebrow, title, body, gap, '#E7E8E3', '#141414', '#5E6064', '#C8381F');
const dark = (id, word, eyebrow, title, body) => frame(id, eyebrow, title, body, 48, '#141414', '#ECEDE8', '#A9ABA6', '#EE6A4E');
const card = (label, h, p, darkCard = false) => `<div style="flex:1; display:flex; flex-direction:column; gap:16px; background:${darkCard ? C.ink : C.card}; border:1px solid ${darkCard ? C.ink : C.line}; padding:44px">
<p style="font-size:24px; font-weight:600; letter-spacing:5px; color:${darkCard ? C.accD : C.acc}">${label}</p>
<h3 style="font-size:40px; font-weight:600; line-height:1.15; color:${darkCard ? '#F5F3EF' : C.ink}">${h}</h3>
<p style="font-size:27px; line-height:1.45; color:${darkCard ? C.dsub : C.body}">${p}</p></div>`;
const f = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- geometría ----------
const J1 = 3.80, J2 = 6.10; // juntas a 3,20 y 5,50 m desde la fachada lateral de planta baja (la de 3,20 cruza el dormitorio 1, oculta)
const PB = [['M1', 0.60, J1, 0.60, 10.10], ['M2', J1, J2, 0.60, 10.10], ['M3', J2, 8.45, 0.60, 10.10]];
const P1 = [['M4', 0.60, J1, 0, 8.47], ['M5', J1, J2, 0, 8.47], ['M6', J2, 8.45, 0, 10.10]];
const VUELO = [0, 0.60, 0, 8.47];
const r2 = v => Math.round(v * 10) / 10;
// planta en SVG (1 m = s px)
function planta(mods, fill, stroke, opts = {}) {
  const s = 46, ox = 34, oy = 30, w = Math.round(9.2 * s + ox), h = Math.round(11.3 * s + oy);
  const X = x => r2(ox + x * s), Y = y => r2(oy + y * s);
  let g = '';
  if (opts.ghost) g += `<rect x="${X(0.60)}" y="${Y(0.60)}" width="${r2(7.85 * s)}" height="${r2(9.50 * s)}" fill="none" stroke="#2F5D8A" stroke-width="2" stroke-dasharray="8 6"/>`;
  if (opts.vuelo) g += `<rect x="${X(0)}" y="${Y(0)}" width="${r2(0.60 * s)}" height="${r2(8.47 * s)}" fill="#E9D9BC" stroke="#161616" stroke-width="2" stroke-dasharray="6 4"/>`;
  if (opts.terraza) g += `<rect x="${X(0.60)}" y="${Y(8.47)}" width="${r2(5.50 * s)}" height="${r2(1.63 * s)}" fill="#D9D3C7" stroke="#9A8F80" stroke-width="1.5"/>`;
  for (const [id, x0, x1, y0, y1] of mods) g += `<rect x="${X(x0)}" y="${Y(y0)}" width="${r2((x1 - x0) * s)}" height="${r2((y1 - y0) * s)}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
  // pilares
  const ys = opts.ys;
  for (const [id, x0, x1, y0, y1] of mods) for (const y of ys.filter(v => v >= y0 - 0.01 && v <= y1 + 0.01).concat(id === 'M6' ? [10.10] : [])) for (const x of [x0, x1]) {
    const px = x === x0 ? X(x) : X(x) - 8, py = Math.min(Y(y), Y(y1) - 8); g += `<rect x="${r2(px)}" y="${r2(py)}" width="8" height="8" fill="#161616"/>`; }
  g += `<line x1="${X(8.45)}" y1="${Y(-0.2)}" x2="${X(8.45)}" y2="${Y(10.4)}" stroke="#B4322C" stroke-width="3" stroke-dasharray="14 6"/>`;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="${opts.label}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
// isométrica
const ISO = (ox, oy, s) => (x, y, z) => [r2(ox + (x - y) * 0.866 * s), r2(oy + (x + y) * 0.5 * s - z * s)];
function caja(P, x0, x1, y0, y1, z0, z1, cTop, cR, cF, st = '#161616', sw = 2) {
  const pts = a => a.map(p => P(...p).join(',')).join(' ');
  return `<polygon points="${pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])}" fill="${cTop}" stroke="${st}" stroke-width="${sw}"/>` +
    `<polygon points="${pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${cR}" stroke="${st}" stroke-width="${sw}"/>` +
    `<polygon points="${pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${cF}" stroke="${st}" stroke-width="${sw}"/>`;
}
function explosionada() {
  const w = 760, h = 640, P = ISO(330, 292, 34);
  let g = '';
  const pb = PB.slice().sort((a, b) => (a[1] + a[3]) - (b[1] + b[3]));
  for (const [id, x0, x1, y0, y1] of pb) g += caja(P, x0, x1, y0, y1, 0, 3.05, '#F1EDE5', '#D6CFC2', '#E3DDD2');
  const p1 = P1.slice().sort((a, b) => (a[1] + a[3]) - (b[1] + b[3]));
  g += caja(P, VUELO[0], VUELO[1], VUELO[2], VUELO[3], 5.0, 8.05, '#EFE6D6', '#D2C3A6', '#E2D3B8');
  for (const [id, x0, x1, y0, y1] of p1) g += caja(P, x0, x1, y0, y1, 5.0, 8.05, '#E2D3B8', '#B59E79', '#CDB894');
  // flechas de colocación
  for (const [id, x0, x1, y0, y1] of P1) { const [ax, ay] = P((x0 + x1) / 2, y1, 4.95), [bx, by] = P((x0 + x1) / 2, y1, 3.25); g += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#7A6347" stroke-width="3" stroke-dasharray="8 6"/>`; }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Axonometría explosionada: tres módulos de planta baja y tres de planta primera" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
// módulo en 4 fases de fabricación
function modulo(fase) {
  const w = 300, h = 220, L = 9.5, A = 2.617, H = 3.05, P = ISO(200, 75, 21);
  const ln = (a, b, c = '#161616', sw = 3) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}"/>`; };
  let g = '';
  const pts = a => a.map(p => P(...p).join(',')).join(' ');
  // suelo
  if (fase >= 2) g += `<polygon points="${pts([[0, 0, 0], [A, 0, 0], [A, L, 0], [0, L, 0]])}" fill="#D6CFC2" stroke="#161616" stroke-width="1.5"/>`;
  // estructura: aristas + pilares intermedios
  const ys = [0, 5.5, L];
  const edges = [[[0, 0, 0], [A, 0, 0]], [[A, 0, 0], [A, L, 0]], [[A, L, 0], [0, L, 0]], [[0, L, 0], [0, 0, 0]], [[0, 0, H], [A, 0, H]], [[A, 0, H], [A, L, H]], [[A, L, H], [0, L, H]], [[0, L, H], [0, 0, H]]];
  for (const y of ys) for (const x of [0, A]) edges.push([[x, y, 0], [x, y, H]]);
  if (fase >= 3) { // instalaciones
    g += ln([0.25, 0.3, 0.05], [0.25, 8.9, 0.05], '#2F5D8A', 4) + ln([0.25, 8.9, 0.05], [2.3, 8.9, 0.05], '#2F5D8A', 4) + ln([2.35, 0.3, 2.9], [2.35, 9.2, 2.9], '#B4322C', 3) + ln([2.35, 4.0, 2.9], [2.35, 4.0, 1.1], '#B4322C', 3);
    for (let y = 1; y < 9; y += 0.9) g += ln([0.4, y, 0.06], [2.2, y, 0.06], '#C98A4B', 2);
  }
  if (fase >= 2 && fase < 4) { // muro trasero y lateral derecho con panel
    g += `<polygon points="${pts([[A, 0, 0], [A, L, 0], [A, L, H], [A, 0, H]])}" fill="#E9E4DA" fill-opacity="0.85" stroke="#161616" stroke-width="1.5"/>`;
  }
  for (const [a, b] of edges) g += ln(a, b, '#161616', fase === 1 ? 4 : 3);
  if (fase === 4) { // módulo cerrado y protegido
    g = '';
    g += `<polygon points="${pts([[0, 0, H], [A, 0, H], [A, L, H], [0, L, H]])}" fill="#EFEBE3" stroke="#161616" stroke-width="2"/>`;
    g += `<polygon points="${pts([[A, 0, 0], [A, L, 0], [A, L, H], [A, 0, H]])}" fill="#DCD5C8" stroke="#161616" stroke-width="2"/>`;
    g += `<polygon points="${pts([[0, L, 0], [A, L, 0], [A, L, H], [0, L, H]])}" fill="#E6E0D6" stroke="#161616" stroke-width="2"/>`;
    g += `<polygon points="${pts([[A, 1.2, 0.9], [A, 2.7, 0.9], [A, 2.7, 2.4], [A, 1.2, 2.4]])}" fill="#9FB7CC" stroke="#161616" stroke-width="1.5"/>`;
    g += `<polygon points="${pts([[A, 5.0, 0.2], [A, 7.8, 0.2], [A, 7.8, 2.6], [A, 5.0, 2.6]])}" fill="#9FB7CC" stroke="#161616" stroke-width="1.5"/>`;
    for (const y of [0.4, 9.1]) for (const x of [0.3, 2.3]) { const [tx, ty] = P(x, y, H); g += `<polygon points="${tx},${r2(ty - 16)} ${r2(tx - 6)},${ty} ${r2(tx + 6)},${ty}" fill="#7A6347"/>`; }
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Módulo en fase ${fase} de fabricación" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
// sección
function seccion() {
  const s = 52, ox = 60, oy = 20, w = 760, h = 470, X = y => r2(ox + y * s), Z = z => r2(oy + (7.4 - z) * s);
  let g = `<line x1="10" y1="${Z(0)}" x2="${w - 10}" y2="${Z(0)}" stroke="#161616" stroke-width="2"/>`;
  for (const y of [0.6, 6.1, 10.1]) g += `<rect x="${X(y) - 20}" y="${Z(-0.05)}" width="40" height="${r2(0.75 * s)}" fill="#D9D3C7" stroke="#9A8F80" stroke-width="1.5"/>`;
  g += `<rect x="${X(0.6)}" y="${Z(3.35)}" width="${r2(9.5 * s)}" height="${r2(3.15 * s)}" fill="#E9E4DA" stroke="#161616" stroke-width="3"/>`;
  g += `<rect x="${X(0.6)}" y="${Z(0.34)}" width="${r2(9.5 * s)}" height="8" fill="#161616" opacity="0.55"/>`;
  g += `<rect x="${X(0)}" y="${Z(7.15)}" width="${r2(8.47 * s)}" height="${r2(3.80 * s)}" fill="#CDB894" stroke="#161616" stroke-width="3"/>`;
  g += `<rect x="${X(0)}" y="${Z(3.49)}" width="${r2(8.47 * s)}" height="8" fill="#161616" opacity="0.55"/>`;
  g += `<rect x="${X(0)}" y="${Z(6.55)}" width="${r2(8.47 * s)}" height="10" fill="#161616" opacity="0.4"/>`;
  g += `<rect x="${X(8.47)}" y="${Z(3.55)}" width="${r2(1.63 * s)}" height="${r2(0.2 * s)}" fill="#9A8F80"/>`;
  for (const y of [0.68, 6.1, 10.02]) g += `<line x1="${X(y)}" y1="${Z(3.2)}" x2="${X(y)}" y2="${Z(0.35)}" stroke="#161616" stroke-width="3"/>`;
  for (const y of [0.08, 5.69, 8.39]) g += `<line x1="${X(y)}" y1="${Z(6.5)}" x2="${X(y)}" y2="${Z(3.5)}" stroke="#161616" stroke-width="3"/>`;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Sección longitudinal: módulo de planta baja de 9,50 m y de planta primera de 8,47 m con vuelo, sobre zapatas del promotor" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}

// ================= DIAPOSITIVAS =================
const S = {};
S.cover = `<section id="cover" data-transition="fade" style="background:#E7E8E3; color:#141414; ${FONT}; padding:128px; display:flex; flex-direction:column; justify-content:space-between">
<div style="position:absolute; left:959px; top:0px; width:2px; height:1080px; background:#C9CBC5"></div>
<div style="position:absolute; left:1298px; top:0px; width:2px; height:1080px; background:#C9CBC5"></div>
<div style="position:absolute; left:1542px; top:0px; width:2px; height:1080px; background:#C9CBC5"></div>
<div style="position:absolute; left:1791px; top:0px; width:2px; height:1080px; background:#C9CBC5"></div>
<div style="position:absolute; left:0px; top:842px; width:1920px; height:2px; background:#C9CBC5"></div>
<div style="position:absolute; left:952px; top:835px; width:16px; height:16px; background:#C8381F"></div>
<div style="position:absolute; left:1291px; top:835px; width:16px; height:16px; background:#C8381F"></div>
<div style="position:absolute; left:1535px; top:835px; width:16px; height:16px; background:#C8381F"></div>
<div style="position:absolute; left:1784px; top:835px; width:16px; height:16px; background:#C8381F"></div>
<p style="position:absolute; left:960px; top:790px; width:339px; ${MONO}; font-size:24px; text-align:center; color:#5E6064">3,20</p>
<p style="position:absolute; left:1299px; top:790px; width:244px; ${MONO}; font-size:24px; text-align:center; color:#5E6064">2,30</p>
<p style="position:absolute; left:1543px; top:790px; width:249px; ${MONO}; font-size:24px; text-align:center; color:#5E6064">2,35</p>
<div style="display:flex; flex-direction:row; justify-content:space-between; align-items:flex-start">${LOGOFULL(72, '#141414')}<p style="width:640px; ${MONO}; font-size:24px; line-height:1.6; letter-spacing:2px; text-transform:uppercase; text-align:right; color:#45474A">Propuesta técnica y económica<br>Octubre 2026</p></div>
<div style="display:flex; flex-direction:column; gap:28px">
<h1 style="font-size:210px; font-weight:900; line-height:0.86; letter-spacing:-9px; color:#141414">NÉVOLA</h1>
<p style="width:880px; font-size:44px; font-weight:500; line-height:1.2; letter-spacing:-0.5px; color:#141414">Vivienda piloto y serie de 16 viviendas en construcción industrializada</p>
<p style="width:880px; ${MONO}; font-size:24px; line-height:1.5; color:#45474A">Para Nido Capital · Magnus 5 Real Estate<br>Sobre el proyecto de ejecución de julio de 2026</p>
</div>
</section>`; page++;

S.resumen = light('resumen', 'PROPUESTA', 'La propuesta en una página', 'El proyecto de ejecución de Névola,<br>fabricado en taller y montado en parcela',
  `<div style="display:flex; flex-direction:row; gap:28px">${card('QUÉ', 'Piloto + serie de 16', 'La pareada tipo como vivienda piloto y, después, las 14 pareadas y 2 aisladas del proyecto. Vivienda terminada, con transporte y montaje.')}${card('CÓMO', 'Seis módulos de acero', 'Misma distribución, mismas cotas y 148,30 m² construidos. Envolvente de panel sándwich con U = 0,20, como exige el proyecto.')}${card('CUÁNTO', 'Piloto: 225.400 €', 'Con la memoria de calidades del proyecto. Con las optimizaciones propuestas: 209.800 €. En serie, desde 193.500 € por vivienda. Sin IVA.', true)}</div>`);

S.porque = light('porque', 'INDUSTRIA', 'Por qué industrializar', 'Menos obra en la parcela, más control en fábrica',
  `<div style="display:grid; grid-template-columns:1fr 1fr; gap:28px">${[['CheckCircle', 'Calidad controlada', 'Cada módulo se fabrica y se revisa a cubierto, con un equipo fijo por oficio.'], ['Clock', 'Fábrica y parcela a la vez', 'Mientras el promotor ejecuta la cimentación, las viviendas avanzan en taller.'], ['Trust', 'Precio cerrado por vivienda', 'Presupuesto por partidas sobre las mediciones del propio proyecto de ejecución.'], ['Lightning', 'Eficiencia energética', 'Envolvente continua con U = 0,20, aerotermia y suelo radiante: la calificación A+ del proyecto.']].map(([i, h, p]) => `<div style="display:flex; flex-direction:row; gap:28px; align-items:flex-start; background:${C.card}; border:1px solid ${C.line}; padding:36px"><x-icon name="${i}" style="color:${C.ink}; width:52px; height:52px"></x-icon><div style="flex:1; display:flex; flex-direction:column; gap:10px"><h3 style="font-size:34px; font-weight:600; line-height:1.2">${h}</h3><p style="font-size:27px; line-height:1.45; color:${C.body}">${p}</p></div></div>`).join('')}</div>`);

S.adaptacion = light('adaptacion', 'SISTEMA', 'Del proyecto al módulo', 'Mismo proyecto, otro sistema constructivo',
  `<table style="${FONT}; font-size:25px; color:${C.ink}; padding:16px 20px; background:${C.card}; border:1px solid ${C.line}">
<tr style="background:${C.ink}"><th style="width:16%; color:#F5F3EF">Elemento</th><th style="width:36%; color:#F5F3EF">Proyecto de ejecución</th><th style="width:48%; color:#F5F3EF">Propuesta RG21</th></tr>
<tr><td><b>Estructura</b></td><td style="color:${C.body}">Pilares, forjados unidireccionales y losa de escalera de hormigón</td><td>Seis módulos de acero S275JR: marcos IPE 200, pilares IPE 160, correas HEA 100 y SHS</td></tr>
<tr><td><b>Fachada</b></td><td style="color:${C.body}">Ladrillo, XPS 100 mm, trasdosado W625, monocapa y aplacado</td><td>Panel sándwich 66 mm + PET 40 mm + trasdosado W625 + acabado exterior. U = 0,20</td></tr>
<tr><td><b>Cubierta</b></td><td style="color:${C.body}">Forjado + cubierta plana de grava y terraza solada</td><td>Panel 81 mm + mismo sistema de pendientes, impermeabilización, grava y gres</td></tr>
<tr><td><b>Suelos</b></td><td style="color:${C.body}">Solera ventilada Cáviti y forjado de planta primera</td><td>Panel 136 mm en planta baja y panel 81 mm en planta primera</td></tr>
<tr><td><b>Interiores</b></td><td style="color:${C.body}">Instalaciones, carpinterías y acabados del proyecto</td><td>Los mismos, con sus mediciones, montados en fábrica</td></tr>
<tr><td><b>Cimentación</b></td><td style="color:${C.body}">Zapatas y vigas de atado</td><td>La ejecuta el promotor, con placas de anclaje en tres ejes</td></tr>
</table>`);

S.plantas = light('plantas', 'MÓDULOS', 'Modulación de la vivienda pareada', 'Tres módulos por planta, sin tocar la distribución',
  `<div style="display:flex; flex-direction:row; gap:56px; align-items:flex-start">
<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start"><p style="font-size:24px; font-weight:600; letter-spacing:4px; color:${C.acc}">PLANTA BAJA · M1 M2 M3</p>${planta(PB, C.pb, C.ink, { ys: [0.60, 6.10, 10.10], label: 'Planta baja: módulos de 3,20, 2,30 y 2,35 por 9,50 metros' })}</div>
<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start"><p style="font-size:24px; font-weight:600; letter-spacing:4px; color:${C.acc}">PLANTA PRIMERA · M4 M5 M6</p>${planta(P1, C.p1, C.ink, { ghost: true, terraza: true, vuelo: true, ys: [0, 5.69, 8.47], label: 'Planta primera: módulos de 3,20, 2,30 y 2,35 metros de ancho, con pieza de vuelo lateral de 0,60' })}</div>
<div style="flex:1; display:flex; flex-direction:column; gap:20px">
<p style="font-size:26px; line-height:1.45; color:${C.body}"><b style="color:${C.ink}">Planta baja:</b> 7,85 × 9,50 m en módulos de 3,20, 2,30 y 2,35 m de ancho. Junta a 3,20 m oculta dentro del dormitorio 1 y junta a 5,50 m sobre tabiques.</p>
<p style="font-size:26px; line-height:1.45; color:${C.body}"><b style="color:${C.ink}">Planta primera:</b> los mismos anchos sobre los de abajo. Vuelo frontal de 0,60 m en los módulos y vuelo lateral como pieza aparte (beige).</p>
<p style="font-size:26px; line-height:1.45; color:${C.body}"><b style="color:${C.ink}">Terraza</b> de 9 m² sobre la cubierta de planta baja (gris).</p>
<p style="font-size:24px; line-height:1.4; color:${C.foot}">Cuadrados negros: pilares IPE 160. Línea roja: medianera. Discontinuo azul: huella de planta baja.</p>
</div></div>`, 36);

S.volumen = light('volumen', 'VOLUMEN', 'Cómo se monta la vivienda', 'Seis módulos apilados sobre la cimentación',
  `<div style="display:flex; flex-direction:row; gap:48px; align-items:flex-start">
${explosionada()}
<div style="flex:1; display:flex; flex-direction:column; gap:22px">
${seccion()}
<p style="font-size:25px; line-height:1.45; color:${C.body}">Cotas del proyecto: suelo de planta baja +0,20, de planta primera +3,35, cubierta +6,40. Los módulos de arriba apoyan sobre los marcos de abajo en los ejes 0,60 · 6,10 · 10,10 m, donde el promotor deja zapatas y placas de anclaje.</p>
</div></div>`, 36);

const fases = [[1, 'Estructura', 'Corte y soldadura del marco: vigas IPE 200 de suelo y techo, pilares IPE 160 y correas.'], [2, 'Suelo y cerramientos', 'Panel sándwich de suelo y fachada, aislamiento y huecos de carpintería.'], [3, 'Instalaciones', 'Fontanería, saneamiento, electricidad, suelo radiante y conductos de ventilación.'], [4, 'Acabados y protección', 'Pladur, carpinterías, solados y pintura. Se cierra, se protege y se prueba.']];
S.fabricacion = light('fabricacion', 'TALLER', 'Cómo se prefabrica un módulo', 'Del perfil de acero al módulo terminado',
  `<div style="display:flex; flex-direction:row; gap:20px">${fases.map(([n, h, p]) => `<div style="flex:1; display:flex; flex-direction:column; gap:14px; background:${C.card}; border:1px solid ${C.line}; border-top:6px solid ${C.ink}; padding:28px">
<p style="font-size:56px; font-weight:700; line-height:1; color:${C.acc}">0${n}</p>${modulo(n)}<h3 style="font-size:32px; font-weight:600; line-height:1.2">${h}</h3><p style="font-size:25px; line-height:1.45; color:${C.body}">${p}</p></div>`).join('')}</div>`, 32);

S.parcela = light('parcela', 'PARCELA', 'Del taller a la parcela', 'Transporte, grúa y montaje',
  `<div style="display:flex; flex-direction:row; gap:24px">${[['Transporte', 'Seis módulos por vivienda en góndola rebajada, de 2,30 a 3,20 m de ancho y menos de 4,00 m de altura total. El vuelo lateral viaja aparte.'], ['Colocación', 'Una jornada de grúa: primero los tres módulos de planta baja sobre las placas de anclaje, después los tres de planta primera y la pieza de vuelo lateral.'], ['Uniones', 'Atornillado entre módulos, conexión de instalaciones en los puntos previstos en fábrica, sellado de juntas y remate de fachada y cubierta.'], ['Entrega', 'Pruebas de servicio de fontanería y electricidad, estanqueidad de cubierta, limpieza final y entrega al promotor.']].map(([h, p], i) => `<div style="flex:1; display:flex; flex-direction:column; gap:16px; border-top:2px solid ${C.ink}; padding:30px 8px 0px 0px"><p style="font-size:64px; font-weight:700; line-height:1; color:${C.acc}">0${i + 1}</p><h3 style="font-size:32px; font-weight:600">${h}</h3><p style="font-size:25px; line-height:1.45; color:${C.body}">${p}</p></div>`).join('')}</div>`);

S.sistema = light('sistema', 'CAPAS', 'Sistema constructivo', 'Fachada con U = 0,20 y estructura medida',
  `<div style="display:flex; flex-direction:row; gap:40px">
<table style="flex:1; ${FONT}; font-size:24px; color:${C.ink}; padding:12px 18px; background:${C.card}; border:1px solid ${C.line}">
<tr style="background:${C.ink}"><th style="width:64%; color:#F5F3EF">Fachada, de exterior a interior</th><th style="width:16%; color:#F5F3EF">mm</th><th style="width:20%; color:#F5F3EF">R</th></tr>
<tr><td>Acabado: placa de cemento + monocapa</td><td>15</td><td>0,03</td></tr>
<tr><td>Panel Tabihaus 8+50+8, núcleo PIR</td><td>66</td><td>2,27</td></tr>
<tr><td>PET reciclado</td><td>40</td><td>1,14</td></tr>
<tr><td>Trasdosado W625 con lana mineral</td><td>48</td><td>1,37</td></tr>
<tr><td>Placa de yeso laminado</td><td>15</td><td>0,06</td></tr>
<tr><td>Resistencias superficiales</td><td>–</td><td>0,17</td></tr>
<tr style="background:#E9E4DA"><td><b>Total · U = 1 / R</b></td><td><b>184</b></td><td><b>U = 0,20</b></td></tr>
</table>
<div style="flex:1; display:flex; flex-direction:column; gap:18px">
<div style="display:flex; flex-direction:row; gap:18px">${[['13.216 kg', 'de acero por vivienda'], ['89,1 kg/m²', 'construido']].map(([a, b]) => `<div style="flex:1; display:flex; flex-direction:column; gap:6px; background:${C.ink}; padding:28px"><p style="font-size:44px; font-weight:700; color:#F5F3EF">${a}</p><p style="font-size:24px; color:${C.dsub}">${b}</p></div>`).join('')}</div>
<p style="font-size:25px; line-height:1.45; color:${C.body}">Marcos de suelo y techo en IPE 200, 38 pilares IPE 160, correas HEA 100 y SHS 60.40.3, bordes en vuelo y voladizo lateral en IPE 220. Acero S275JR granallado, imprimado y con protección C2-C3.</p>
<p style="font-size:25px; line-height:1.45; color:${C.body}">Muro de 184 mm frente a unos 330 mm de la solución de ladrillo, con la misma transmitancia.</p>
</div></div>`);

S.calidades = light('calidades', 'CALIDADES', 'Memoria de calidades', 'Las calidades del proyecto de ejecución',
  `<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px 56px">${[['Climatización', 'Aerotermia Vaillant aroTHERM plus 10 kW, suelo radiante y refrescante Polytherm, termostato por estancia.'], ['Ventilación', 'Mecánica de simple flujo autorregulable con extracción en baños y cocina.'], ['Carpintería exterior', 'PVC Kömmerling Eurofutur 70, foliado RAL 7016, vidrio bajo emisivo y persiana. Puerta de entrada de seguridad.'], ['Carpintería interior', 'Puertas lacadas en blanco de 725 mm, armario empotrado y vestidor.'], ['Pavimentos', 'Laminado AC5 Terhürne en zonas secas; porcelánico en baños, cocina, lavadero y escalera.'], ['Tabiquería y techos', 'Knauf W112 con aislamiento, placa hidrófuga en zonas húmedas y falso techo continuo.'], ['Baños', 'Sanitarios Gala gama media, platos de resina, bañera en el baño 2 y mampara.'], ['Electricidad', 'Electrificación elevada, TV y datos en estancias, videoportero y punto de recarga.']].map(([h, p]) => `<div style="display:flex; flex-direction:row; gap:18px; align-items:flex-start"><x-icon name="Check" style="color:${C.acc}; width:34px; height:34px"></x-icon><p style="flex:1; font-size:25px; line-height:1.4; color:${C.body}"><b style="color:${C.ink}">${h}.</b> ${p}</p></div>`).join('')}</div>`);

S.optimizacion = light('optimizacion', 'AHORRO', 'Optimizaciones propuestas · opcionales', 'Hasta 15.600 € menos por vivienda',
  `<div style="display:flex; flex-direction:row; gap:24px">${[['SISTEMA MODULAR', '5.700 €', 'Sin cambios para el comprador', 'Falso techo atornillado al módulo, vuelos y aplacado sin duplicar, toma de tierra por la estructura, recercados de taller.'], ['MARCA EQUIVALENTE', '6.600 €', 'Misma gama, «o similar»', 'Aerotermia de 8 kW (Panasonic o LG), suelo radiante estándar, laminado AC5 nacional, pintura profesional, PVC Veka o Rehau.'], ['ALCANCE', '1.900 €', 'Según la memoria comercial', 'Placa sencilla en tabiques entre estancias y preinstalación de recarga en lugar del punto completo.']].map(([l, n, s, p], i) => `<div style="flex:1; display:flex; flex-direction:column; gap:14px; background:${i === 0 ? C.ink : C.card}; border:1px solid ${i === 0 ? C.ink : C.line}; padding:40px"><p style="font-size:24px; font-weight:600; letter-spacing:4px; color:${i === 0 ? C.accD : C.acc}">${l}</p><p style="font-size:64px; font-weight:700; line-height:1.05; color:${i === 0 ? '#F5F3EF' : C.ink}">${n}</p><p style="font-size:26px; font-weight:600; color:${i === 0 ? '#F5F3EF' : C.ink}">${s}</p><p style="font-size:25px; line-height:1.45; color:${i === 0 ? C.dsub : C.body}">${p}</p></div>`).join('')}</div>
<p style="font-size:25px; line-height:1.4; color:${C.body}">Ahorro de coste por vivienda: 14.200 €; en precio, 15.600 €. Cada optimización se aplica solo con la conformidad del promotor y de la dirección facultativa.</p>`, 36);

S.alcance = light('alcance', 'ALCANCE', 'Alcance de la oferta', 'Qué incluye la oferta y qué no',
  `<div style="display:flex; flex-direction:row; gap:32px">
<div style="flex:1; display:flex; flex-direction:column; gap:18px; background:${C.ink}; padding:44px"><p style="font-size:24px; font-weight:600; letter-spacing:6px; color:${C.accD}">INCLUIDO</p><ul style="font-size:27px; line-height:1.5; color:#F5F3EF"><li>Ingeniería del módulo y proyecto de fabricación</li><li>Vivienda terminada según el proyecto de ejecución</li><li>Transporte, grúa, colocación y montaje</li><li>Uniones, remates y conexión de instalaciones interiores</li><li>Pruebas de servicio, limpieza y entrega</li></ul></div>
<div style="flex:1; display:flex; flex-direction:column; gap:18px; background:${C.card}; border:1px solid ${C.line}; padding:44px"><p style="font-size:24px; font-weight:600; letter-spacing:6px; color:${C.acc}">NO INCLUIDO</p><ul style="font-size:27px; line-height:1.5; color:${C.body}"><li>Movimiento de tierras, cimentación y placas de anclaje</li><li>Saneamiento enterrado, acometidas y urbanización</li><li>Terraza y jardín de planta baja, vallados, piscina y zonas comunes</li><li>Muebles de cocina y electrodomésticos</li><li>Dirección facultativa, OCT, seguro decenal, licencias y tasas</li></ul></div></div>`);

S.precio = dark('precio', 'OFERTA', 'Oferta económica · vivienda piloto', 'Precio de la vivienda piloto pareada',
  `<div style="display:flex; flex-direction:row; gap:32px">
<div style="flex:1; display:flex; flex-direction:column; gap:18px; border:2px solid #3A3835; padding:52px"><p style="font-size:24px; font-weight:600; letter-spacing:5px; color:${C.accD}">CON LA MEMORIA DEL PROYECTO</p><p style="font-size:100px; font-weight:700; line-height:1.05">225.400 €</p><p style="font-size:30px">1.520 €/m² construido</p></div>
<div style="flex:1; display:flex; flex-direction:column; gap:18px; border:2px solid ${C.accD}; padding:52px"><p style="font-size:24px; font-weight:600; letter-spacing:5px; color:${C.accD}">CON LAS OPTIMIZACIONES</p><p style="font-size:100px; font-weight:700; line-height:1.05">209.800 €</p><p style="font-size:30px">1.415 €/m² construido</p></div></div>
<p style="font-size:26px; line-height:1.4; color:${C.dsub}">Vivienda pareada de 148,30 m² construidos. Fabricación, transporte, grúa y montaje incluidos. IVA no incluido.</p>`);

const bars = [['Envolvente: fachadas, cubierta, suelos', 760, '66.500 € · 29 %', C.ink], ['Instalaciones y climatización', 481, '42.100 € · 19 %', C.ink], ['Estructura de acero', 432, '37.800 € · 17 %', C.ink], ['Fabricación, transporte y montaje', 386, '33.800 € · 15 %', C.acc], ['Tabiquería, techos, solados y pintura', 312, '27.300 € · 12 %', C.ink], ['Carpinterías exterior e interior', 205, '17.900 € · 8 %', C.ink]];
S.desglose = light('desglose', 'DESGLOSE', 'Vivienda piloto · memoria del proyecto', 'En qué se invierte la vivienda',
  `<div style="display:flex; flex-direction:column; gap:22px; background:${C.card}; border:1px solid ${C.line}; padding:40px 48px">
${bars.map(([l, w, v, c]) => `<div style="display:flex; flex-direction:row; align-items:center; gap:24px"><p style="width:560px; font-size:28px; line-height:1.3">${l}</p><div style="width:${w}px; height:40px; background:${c}"></div><div style="flex:1"></div><p style="font-size:28px; font-weight:600; white-space:nowrap">${v}</p></div>`).join('\n')}
<hr style="border-top:2px solid ${C.ink}">
<div style="display:flex; flex-direction:row; align-items:center; gap:24px"><p style="width:560px; font-size:30px; font-weight:700">Total vivienda piloto</p><div style="flex:1"></div><p style="font-size:30px; font-weight:700; white-space:nowrap">225.400 € · 1.520 €/m²</p></div></div>`);

S.serie = light('serie', 'SERIE', 'Promoción completa', 'La serie de 16 viviendas',
  `<div style="display:flex; flex-direction:row; gap:28px">
${[['MEMORIA DEL PROYECTO', '209.100 €', '214.100 €', '3.355.600 €', '1.411 €/m²', false], ['CON LAS OPTIMIZACIONES', '193.500 €', '198.500 €', '3.106.000 €', '1.306 €/m²', true]].map(([l, p, a, t, m, d]) => `<div style="flex:1; display:flex; flex-direction:column; gap:16px; background:${d ? C.ink : C.card}; border:1px solid ${d ? C.ink : C.line}; padding:44px">
<p style="font-size:24px; font-weight:600; letter-spacing:5px; color:${d ? C.accD : C.acc}">${l}</p>
<div style="display:flex; flex-direction:row; justify-content:space-between"><p style="font-size:28px; color:${d ? C.dsub : C.body}">14 pareadas, cada una</p><p style="font-size:28px; font-weight:600; color:${d ? '#F5F3EF' : C.ink}">${p}</p></div>
<div style="display:flex; flex-direction:row; justify-content:space-between"><p style="font-size:28px; color:${d ? C.dsub : C.body}">2 aisladas, cada una</p><p style="font-size:28px; font-weight:600; color:${d ? '#F5F3EF' : C.ink}">${a}</p></div>
<hr style="border-top:1px solid ${d ? '#3A3835' : C.line}">
<p style="font-size:64px; font-weight:700; line-height:1.1; color:${d ? '#F5F3EF' : C.ink}">${t}</p><p style="font-size:26px; color:${d ? C.dsub : C.body}">16 viviendas · ${m} de media</p></div>`).join('')}</div>
<p style="font-size:25px; line-height:1.4; color:${C.body}">Precio por vivienda en producción en serie. IVA no incluido.</p>`, 36);

S.condiciones = light('condiciones', 'CONDICIONES', 'Condiciones', 'Condiciones de la oferta',
  `<div style="display:grid; grid-template-columns:1fr 1fr; gap:22px">${[['Base de la oferta', 'Proyecto de ejecución de julio de 2026: mediciones, planos y memoria de calidades.', C.ink], ['Precio definitivo', 'Se cierra con el cálculo de la estructura modular y las ofertas de proveedor de la vivienda piloto.', C.ink], ['Piloto y serie', 'El precio del piloto se aplica con la adjudicación de la serie. Como unidad independiente: 273.600 €.', C.ink], ['Validación técnica', 'Conformidad de la dirección facultativa, el OCT y la aseguradora del decenal. RG21 aporta la documentación del sistema.', C.ink], ['Forma de pago', '[A definir]', C.acc], ['Validez', '[__] días desde la fecha de esta propuesta. Importes sin IVA.', C.acc]].map(([h, p, c]) => `<div style="display:flex; flex-direction:column; gap:10px; border-left:6px solid ${c}; background:${C.card}; padding:26px 34px"><h3 style="font-size:30px; font-weight:600">${h}</h3><p style="font-size:25px; line-height:1.45; color:${C.body}">${p}</p></div>`).join('')}</div>`, 36);

S.pasos = light('pasos', 'SIGUIENTE', 'Próximos pasos', 'Cómo empezamos',
  `<div style="display:flex; flex-direction:row; gap:24px">${[['Revisión técnica', 'Dirección facultativa, OCT y aseguradora validan el sistema modular.'], ['Proyecto de fabricación', 'Cálculo de los módulos, optimizaciones elegidas y precio cerrado del piloto.'], ['Vivienda piloto', 'Fabricación en taller y montaje sobre la cimentación del promotor.'], ['Serie de 16', 'Producción en cadena del resto de la promoción, a precio de serie.']].map(([h, p], i) => `<div style="flex:1; display:flex; flex-direction:column; gap:16px; border-top:2px solid ${C.ink}; padding:32px 8px 0px 0px"><p style="font-size:72px; font-weight:700; line-height:1; color:${C.acc}">0${i + 1}</p><h3 style="font-size:34px; font-weight:600; line-height:1.2">${h}</h3><p style="font-size:26px; line-height:1.45; color:${C.body}">${p}</p></div>`).join('')}</div>`, 64);

S.cierre = `<section id="cierre" data-transition="fade" style="background:#141414; color:#ECEDE8; ${FONT}; padding:128px; display:flex; flex-direction:column; align-items:center; justify-content:center">
${LOGOFULL(200, '#ECEDE8')}
</section>`;

// ---------- esqueletos de módulo ----------
const dec = (n, d = 2) => n.toFixed(d).replace('.', ',');
function esqueletoIso(L, A, H, ys, vuelo) {
  const w = 540, h = 430, P = ISO(390, 145, 42);
  const ln = (a, b, c, sw, da) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}"${da ? ` stroke-dasharray="${da}"` : ''} stroke-linecap="square"/>`; };
  const pts = a => a.map(p => P(...p).join(',')).join(' ');
  let g = '';
  if (vuelo.lat) g += `<polygon points="${pts([[0, 0, 0], [vuelo.lat, 0, 0], [vuelo.lat, L, 0], [0, L, 0]])}" fill="#E9D9BC" opacity="0.8"/>`;
  if (vuelo.fr) g += `<polygon points="${pts([[0, 0, 0], [A, 0, 0], [A, vuelo.fr, 0], [0, vuelo.fr, 0]])}" fill="#E9D9BC" opacity="0.8"/>`;
  const nf = Math.ceil(L / 1.40), nc = Math.ceil(L / 0.60);
  for (let i = 1; i < nf; i++) { const y = L * i / nf; g += ln([0, y, 0], [A, y, 0], '#7A6347', 4); }
  g += ln([0, 0, 0], [A, 0, 0], '#161616', 7) + ln([A, 0, 0], [A, L, 0], '#161616', 7) + ln([A, L, 0], [0, L, 0], '#161616', 7) + ln([0, L, 0], [0, 0, 0], '#161616', 7);
  // arriostramiento en los testeros
  g += ln([0, 0, 0], [A, 0, H], '#9A8F80', 2, '7 5') + ln([A, 0, 0], [0, 0, H], '#9A8F80', 2, '7 5') + ln([0, L, 0], [A, L, H], '#9A8F80', 2, '7 5') + ln([A, L, 0], [0, L, H], '#9A8F80', 2, '7 5');
  for (const y of ys) for (const x of [0, A]) g += ln([x, y, 0], [x, y, H], '#161616', 6);
  for (let i = 1; i < nc; i++) { const y = L * i / nc; g += ln([0, y, H], [A, y, H], '#8E8679', 2); }
  g += ln([0, 0, H], [A, 0, H], '#161616', 7) + ln([A, 0, H], [A, L, H], '#161616', 7) + ln([A, L, H], [0, L, H], '#161616', 7) + ln([0, L, H], [0, 0, H], '#161616', 7);
  const [lx, ly] = P(A + 0.45, L / 2, 0), [ax, ay] = P(A / 2, L + 0.55, 0), [hx, hy] = P(A + 0.25, L + 0.15, H / 2);
  g += `<text x="${lx}" y="${ly + 26}" font-family="Arial" font-size="24" font-weight="700" fill="#161616">L = ${dec(L)} m</text>`;
  g += `<text x="${Math.max(ax, 95)}" y="${ay + 34}" font-family="Arial" font-size="24" font-weight="700" text-anchor="middle" fill="#161616">A = ${dec(A, 3)} m</text>`;
  g += `<text x="${hx + 14}" y="${hy}" font-family="Arial" font-size="24" font-weight="700" fill="#161616">H = 3,05 m</text>`;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Esqueleto del módulo de ${dec(L)} por ${dec(A, 3)} metros: marcos, pilares, correas y arriostramientos" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
function bastidor(L, A, ys, vuelo) {
  const k = 70, ox = 46, oy = 56, w = Math.round(ox + L * k + 50), h = Math.round(oy + A * k + 74);
  const X = y => r2(ox + y * k), Y = x => r2(oy + x * k);
  let g = `<defs><pattern id="hv" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#C8B394" stroke-width="3"/></pattern></defs>`;
  if (vuelo.lat) g += `<rect x="${X(0)}" y="${Y(0)}" width="${r2(L * k)}" height="${r2(vuelo.lat * k)}" fill="url(#hv)"/>`;
  if (vuelo.fr) g += `<rect x="${X(0)}" y="${Y(0)}" width="${r2(vuelo.fr * k)}" height="${r2(A * k)}" fill="url(#hv)"/>`;
  const nf = Math.ceil(L / 1.40), sp = L / nf;
  for (let i = 1; i < nf; i++) g += `<line x1="${X(sp * i)}" y1="${Y(0)}" x2="${X(sp * i)}" y2="${Y(A)}" stroke="#7A6347" stroke-width="4"/>`;
  g += `<rect x="${X(0)}" y="${Y(0)}" width="${r2(L * k)}" height="${r2(A * k)}" fill="none" stroke="#161616" stroke-width="7"/>`;
  for (const y of ys) for (const x of [0, A]) g += `<rect x="${r2(X(y) - 8)}" y="${r2(Y(x) - 8)}" width="16" height="16" fill="#161616"/>`;
  // cotas
  const yd = Y(A) + 34; g += `<line x1="${X(0)}" y1="${yd}" x2="${X(L)}" y2="${yd}" stroke="#161616" stroke-width="1.5"/>`;
  const marks = [0, ...ys.filter(v => v > 0 && v < L), L];
  for (let i = 0; i < marks.length; i++) { g += `<line x1="${X(marks[i])}" y1="${yd - 9}" x2="${X(marks[i])}" y2="${yd + 9}" stroke="#161616" stroke-width="2"/>`; if (i) g += `<text x="${r2((X(marks[i - 1]) + X(marks[i])) / 2)}" y="${yd - 8}" font-family="Arial" font-size="22" text-anchor="middle" fill="#161616">${dec(marks[i] - marks[i - 1])}</text>`; }
  g += `<text x="${r2((X(0) + X(L)) / 2)}" y="${yd + 32}" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#161616">${dec(L)} m</text>`;
  const xd = X(0) - 24; g += `<line x1="${xd}" y1="${Y(0)}" x2="${xd}" y2="${Y(A)}" stroke="#161616" stroke-width="1.5"/><line x1="${xd - 8}" y1="${Y(0)}" x2="${xd + 8}" y2="${Y(0)}" stroke="#161616" stroke-width="2"/><line x1="${xd - 8}" y1="${Y(A)}" x2="${xd + 8}" y2="${Y(A)}" stroke="#161616" stroke-width="2"/>`;
  g += `<text transform="translate(${xd - 8},${r2((Y(0) + Y(A)) / 2)}) rotate(-90)" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#161616">${dec(A, 3)}</text>`;
  g += `<text x="${X(0)}" y="${Y(0) - 14}" font-family="Arial" font-size="22" fill="#7A6347">HEA 100: ${nf - 1} correas cada ${dec(sp)} m · techo SHS 60.40.3 cada ${dec(L / Math.ceil(L / 0.60))} m</text>`;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Planta del bastidor de suelo de ${dec(L)} por ${dec(A, 3)} metros con correas y pilares acotados" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const spec = rows => `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px 40px; background:${C.card}; border:1px solid ${C.line}; padding:16px 28px">${rows.map(([a, b, c], i) => `<p style="font-size:24px; line-height:1.35; color:${i === rows.length - 1 ? C.ink : C.body}">${i === rows.length - 1 ? '<b>' + a + ': ' + c + '</b>' : a + ' · ' + b + ' · <b style="color:' + C.ink + '">' + c + '</b>'}</p>`).join('')}</div>`;
const modSlide = (id, eyebrow, title, L, A, ys, vuelo, rows, nota) => light(id, 'ESQUELETO', eyebrow, title,
  `<div style="display:flex; flex-direction:row; gap:40px; align-items:flex-start">
${esqueletoIso(L, A, 3.05, ys, vuelo)}
<div style="flex:1; display:flex; flex-direction:column; gap:16px">
<p style="font-size:24px; font-weight:600; letter-spacing:4px; color:${C.acc}">BASTIDOR DE SUELO · COTAS EN m</p>
${bastidor(L, A, ys, vuelo)}
<p style="font-size:24px; line-height:1.35; color:${C.foot}">${nota}</p>
</div></div>
${spec(rows)}`, 24);
const calc = require('../nevtec/piloto_calc');
const kgDe = (id, re) => calc.acero.filter(r => r[0] === id && re.test(r[1])).reduce((a, r) => a + r[2] * r[3], 0);
const fk = n => f(n) + ' kg';
const fichas = [
  ['mod_m1', 'M1', 'Módulo · planta baja · fachada lateral', 9.50, 3.20, [0, 5.50, 9.50], {}, 'Dormitorio 1, cocina y salón. La junta con el M2 cruza el dormitorio y se oculta en suelo y techo.'],
  ['mod_m2', 'M2', 'Módulo · planta baja · centro', 9.50, 2.30, [0, 5.50, 9.50], {}, 'Vestíbulo, arranque de escalera y salón. Juntas a 3,20 y 5,50 m.'],
  ['mod_m3', 'M3', 'Módulo · planta baja · medianera', 9.50, 2.35, [0, 5.50, 9.50], {}, 'Baño 1, lavadero y salón. Junta sobre el tabique del baño.'],
  ['mod_m4', 'M4', 'Módulo · planta primera · fachada lateral', 8.47, 3.20, [0, 5.69, 8.47], { fr: 0.60 }, 'Dormitorio 3 y baño 2. El vuelo lateral se monta aparte.'],
  ['mod_m5', 'M5', 'Módulo · planta primera · centro', 8.47, 2.30, [0, 5.69, 8.47], { fr: 0.60 }, 'Dormitorio 2, distribuidor y escalera. Vuelo frontal de 0,60.'],
  ['mod_m6', 'M6', 'Módulo · planta primera · medianera', 10.10, 2.35, [0, 5.69, 8.47, 10.10], { fr: 0.60 }, 'Escalera, vestidor y baño principal, que sale sobre la terraza.'],
];
for (const [sid, id, eb, L, A, ys, vu, nota] of fichas) {
  const nf = Math.ceil(L / 1.40) - 1, nc = Math.ceil(L / 0.60) - 1, np = ys.length * 2;
  const vig = kgDe(id, /IPE 200/), vb = kgDe(id, /IPE 220/), pil = kgDe(id, /Pilares/), cs = kgDe(id, /HEA 100/), ct = kgDe(id, /SHS/), ang = kgDe(id, /L 80/);
  const rows = [['Marcos de suelo y techo', 'IPE 200', fk(vig)]];
  if (vb) rows.push(['Borde frontal en vuelo', 'IPE 220', fk(vb)]);
  rows.push(['Pilares (' + np + ' ud × 2,65 m)', 'IPE 160', fk(pil)], ['Correas de suelo (' + nf + ' ud)', 'HEA 100', fk(cs)], ['Correas de techo (' + nc + ' ud)', 'SHS 60.40.3', fk(ct)]);
  if (!vb) rows.push(['Apoyo de panel', 'L 80.8', fk(ang)]);
  rows.push(['Total por módulo', '', fk(vig + vb + pil + cs + ct + ang)]);
  S[sid] = modSlide(sid, eb, id + ': ' + dec(L) + ' × ' + dec(A) + ' × 3,05 m', L, A, ys, vu, rows, nota);
}

// ---------- alzados de módulo ----------
function alzado(L, A, ys, vuelo, label) {
  const k = 52, H = 3.05, ox = 16, oy = 40, gapT = 64, w = 790, h = 262;
  const X = y => r2(ox + y * k), Z = z => r2(oy + (H - z) * k);
  let g = `<defs><pattern id="hz${label}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#C8B394" stroke-width="3"/></pattern></defs>`;
  g += `<text x="${ox}" y="24" font-family="Arial" font-size="24" font-weight="700" fill="#161616">${label}</text>`;
  if (vuelo) g += `<rect x="${X(0)}" y="${Z(H)}" width="${r2(vuelo * k)}" height="${r2(H * k)}" fill="url(#hz${label})"/>`;
  // cara larga: marcos y pilares
  g += `<rect x="${X(0)}" y="${Z(0.20)}" width="${r2(L * k)}" height="${r2(0.20 * k)}" fill="#161616"/>`;
  g += `<rect x="${X(0)}" y="${Z(H)}" width="${r2(L * k)}" height="${r2(0.20 * k)}" fill="#161616"/>`;
  for (const y of ys) { const x0 = y === 0 ? 0 : y >= L ? L - 0.16 : y - 0.08; g += `<rect x="${X(x0)}" y="${Z(H - 0.20)}" width="${r2(0.16 * k)}" height="${r2((H - 0.40) * k)}" fill="#5E5850"/>`; }
  // cotas horizontales
  const yd = Z(0) + 26; const marks = [0, ...ys.filter(v => v > 0 && v < L), L];
  g += `<line x1="${X(0)}" y1="${yd}" x2="${X(L)}" y2="${yd}" stroke="#161616" stroke-width="1.5"/>`;
  marks.forEach((m, i) => { g += `<line x1="${X(m)}" y1="${yd - 7}" x2="${X(m)}" y2="${yd + 7}" stroke="#161616" stroke-width="2"/>`; if (i) g += `<text x="${r2((X(marks[i - 1]) + X(m)) / 2)}" y="${yd - 6}" font-family="Arial" font-size="20" text-anchor="middle" fill="#161616">${dec(m - marks[i - 1])}</text>`; });
  g += `<text x="${r2((X(0) + X(L)) / 2)}" y="${yd + 28}" font-family="Arial" font-size="20" font-weight="700" text-anchor="middle" fill="#161616">L = ${dec(L)}</text>`;
  if (vuelo) g += `<text x="${r2(X(vuelo / 2))}" y="${r2(Z(H / 2))}" font-family="Arial" font-size="18" text-anchor="middle" fill="#7A6347" transform="rotate(-90 ${r2(X(vuelo / 2))} ${r2(Z(H / 2))})">vuelo 0,60</text>`;
  // cotas verticales
  const xv = X(L) + 18;
  g += `<line x1="${xv}" y1="${Z(H)}" x2="${xv}" y2="${Z(0)}" stroke="#161616" stroke-width="1.5"/>`;
  for (const z of [0, 0.20, H - 0.20, H]) g += `<line x1="${xv - 6}" y1="${Z(z)}" x2="${xv + 6}" y2="${Z(z)}" stroke="#161616" stroke-width="2"/>`;
  g += `<text x="${xv + 8}" y="${r2(Z(H / 2) + 7)}" font-family="Arial" font-size="20" fill="#161616">2,65</text>`;
  g += `<text x="${xv + 8}" y="${r2(Z(0.1) + 7)}" font-family="Arial" font-size="18" fill="#161616">0,20</text>`;
  g += `<text x="${xv + 8}" y="${r2(Z(H - 0.1) + 7)}" font-family="Arial" font-size="18" fill="#161616">0,20</text>`;
  // testero
  const tx = X(L) + gapT + 30, TX = x => r2(tx + x * k);
  g += `<rect x="${TX(0)}" y="${Z(0.20)}" width="${r2(A * k)}" height="${r2(0.20 * k)}" fill="#161616"/><rect x="${TX(0)}" y="${Z(H)}" width="${r2(A * k)}" height="${r2(0.20 * k)}" fill="#161616"/>`;
  g += `<rect x="${TX(0)}" y="${Z(H - 0.20)}" width="${r2(0.16 * k)}" height="${r2((H - 0.40) * k)}" fill="#5E5850"/><rect x="${TX(A - 0.16)}" y="${Z(H - 0.20)}" width="${r2(0.16 * k)}" height="${r2((H - 0.40) * k)}" fill="#5E5850"/>`;
  g += `<line x1="${TX(0.16)}" y1="${Z(0.20)}" x2="${TX(A - 0.16)}" y2="${Z(H - 0.20)}" stroke="#9A8F80" stroke-width="2.5" stroke-dasharray="7 5"/><line x1="${TX(A - 0.16)}" y1="${Z(0.20)}" x2="${TX(0.16)}" y2="${Z(H - 0.20)}" stroke="#9A8F80" stroke-width="2.5" stroke-dasharray="7 5"/>`;
  g += `<line x1="${TX(0)}" y1="${yd}" x2="${TX(A)}" y2="${yd}" stroke="#161616" stroke-width="1.5"/><line x1="${TX(0)}" y1="${yd - 7}" x2="${TX(0)}" y2="${yd + 7}" stroke="#161616" stroke-width="2"/><line x1="${TX(A)}" y1="${yd - 7}" x2="${TX(A)}" y2="${yd + 7}" stroke="#161616" stroke-width="2"/>`;
  g += `<text x="${r2(TX(A / 2))}" y="${yd + 28}" font-family="Arial" font-size="20" font-weight="700" text-anchor="middle" fill="#161616">A = ${dec(A, 3)}</text>`;
  g += `<text x="${r2(TX(A / 2))}" y="24" font-family="Arial" font-size="20" text-anchor="middle" fill="#7A6347">testero</text>`;
  g += `<text x="${r2(TX(A) + 8)}" y="${r2(Z(H / 2) + 7)}" font-family="Arial" font-size="20" font-weight="700" fill="#161616">3,05</text>`;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Alzado lateral y testero del módulo ${label}: ${dec(L)} por ${dec(A, 3)} por 3,05 metros" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const alzSlide = (id, eb, list, nota) => light(id, 'ALZADOS', eb, 'Cara larga y testero de cada módulo',
  '<div style="display:grid; grid-template-columns:1fr 1fr; gap:14px 40px">\n' + list.map(a => alzado(...a)).join('\n') +
  '\n<div style="display:flex; flex-direction:column; gap:12px; justify-content:center; background:' + C.card + '; border:1px solid ' + C.line + '; padding:24px 30px">' +
  '<p style="font-size:24px; line-height:1.4; color:' + C.body + '"><b style="color:' + C.ink + '">Negro:</b> marcos IPE 200 (canto 0,20)</p>' +
  '<p style="font-size:24px; line-height:1.4; color:' + C.body + '"><b style="color:' + C.ink + '">Gris:</b> pilares IPE 160, 2,65 m libres</p>' +
  '<p style="font-size:24px; line-height:1.4; color:' + C.body + '"><b style="color:' + C.ink + '">Discontinuo:</b> arriostramiento en testeros</p>' +
  '<p style="font-size:24px; line-height:1.4; color:' + C.body + '">' + nota + '</p></div></div>', 24);
S.alz_pb = alzSlide('alz_pb', 'Alzados · planta baja · cotas en m', [[9.50, 3.20, [0, 5.50, 9.50], 0, 'M1'], [9.50, 2.30, [0, 5.50, 9.50], 0, 'M2'], [9.50, 2.35, [0, 5.50, 9.50], 0, 'M3']], 'Los tres comparten largo, altura y ejes de pilares; solo cambia el ancho.');
S.alz_p1 = alzSlide('alz_p1', 'Alzados · planta primera · cotas en m', [[8.47, 3.20, [0, 5.69, 8.47], 0.60, 'M4'], [8.47, 2.30, [0, 5.69, 8.47], 0.60, 'M5'], [10.10, 2.35, [0, 5.69, 8.47, 10.10], 0.60, 'M6']], '<b style="color:#161616">Rayado:</b> vuelo frontal de 0,60 sin módulo debajo.');

// ---------- plantas de módulo con tabiques ----------
// Coordenadas de cada planta: x desde la fachada lateral exterior, y desde la fachada principal. Muros [x0,x1,y0,y1].
const T = 0.18, t = 0.10;
const PBW = { W: 7.85, L: 9.50, mods: [['M1', 0, 3.20, 0, 9.50], ['M2', 3.20, 5.50, 0, 9.50], ['M3', 5.50, 7.85, 0, 9.50]],
  walls: [[0, 7.85, 0, T], [0, 7.85, 9.50 - T, 9.50], [0, T, 0, 9.50], [7.85 - T, 7.85, 0, 9.50],
    [3.45, 3.55, T, 2.35], [3.45, 3.55, 3.15, 3.50], [T, 3.45, 3.40, 3.50],
    [5.45, 5.55, T, 1.05], [5.45, 5.55, 1.75, 1.90], [5.55, 7.85, 1.90, 2.00],
    [4.55, 7.85, 3.25, 3.35], [5.45, 5.55, 3.35, 3.60], [5.45, 5.55, 4.30, 4.75], [5.45, 7.85, 4.65, 4.75]],
  stair: [4.55, 7.67, 2.00, 3.25],
  rooms: [['Dormitorio 1', '9,55 m²', 1.70, 1.70], ['Vestíbulo', '4,75 m²', 4.50, 1.10], ['Baño 1', '3,75 m²', 6.65, 0.95], ['Escalera', '2,50 m²', 6.10, 2.62], ['Lavadero', '4,00 m²', 6.65, 4.02], ['Cocina', '', 1.30, 4.15], ['Salón · comedor', '37,60 m²', 3.90, 7.10]] };
const P1W = { W: 8.45, L: 10.10, mods: [['V', 0, 0.60, 0, 8.47], ['M4', 0.60, 3.80, 0, 8.47], ['M5', 3.80, 6.10, 0, 8.47], ['M6', 6.10, 8.45, 0, 10.10]],
  walls: [[0, 8.45, 0, T], [0, 6.11, 8.47 - T, 8.47], [0, T, 0, 8.47], [8.45 - T, 8.45, 0, 10.10], [6.11, 6.11 + T, 8.47, 10.10], [6.11, 8.45, 10.10 - T, 10.10],
    [3.75, 3.85, T, 4.06], [T, 2.55, 3.96, 4.06], [3.35, 4.20, 3.96, 4.06], [4.95, 5.35, 3.96, 4.06], [5.25, 8.45 - T, 2.85, 2.95],
    [5.25, 5.35, 2.95, 5.15], [2.95, 3.05, 4.06, 4.30], [2.95, 3.05, 5.00, 5.70],
    [T, 3.40, 5.60, 5.70], [4.20, 8.45 - T, 5.60, 5.70], [5.40, 5.50, 5.70, 6.00], [5.40, 5.50, 6.80, 8.29], [6.01, 6.11, 5.70, 7.60], [6.01, 6.11, 8.20, 8.47]],
  stair: [5.35, 8.27, 2.95, 5.15],
  rooms: [['Dormitorio 3', '12,00 m²', 2.20, 1.90], ['Dormitorio 2', '12,10 m²', 4.95, 1.40], ['Escalera', '4,65 m²', 6.80, 4.05], ['Baño 2', '3,85 m²', 1.80, 4.90], ['Distribuidor', '3,95 m²', 4.15, 4.80], ['Dormitorio principal', '17,50 m²', 2.40, 7.00], ['Vestidor', '', 5.75, 7.05], ['Baño principal', '7,10 m²', 7.25, 8.70]] };
function plantaMods(F, s, gap) {
  const ox = 54, oy = 58; let xoff = 0; const off = {};
  for (const [id, x0, x1] of F.mods) { off[id] = ox + xoff - x0 * s; xoff += (x1 - x0) * s + gap; }
  const w = Math.round(ox + xoff - gap + 20), h = Math.round(oy + F.L * s + 64);
  let g = '';
  for (const [id, x0, x1, y0, y1] of F.mods) {
    const o = off[id], X = x => r2(o + x * s), Y = y => r2(oy + y * s);
    g += `<rect x="${X(x0)}" y="${Y(y0)}" width="${r2((x1 - x0) * s)}" height="${r2((y1 - y0) * s)}" fill="#F7F4EE" stroke="#8E8679" stroke-width="2" stroke-dasharray="9 6"/>`;
    // escalera
    const [sx0, sx1, sy0, sy1] = F.stair; const cx0 = Math.max(sx0, x0), cx1 = Math.min(sx1, x1);
    if (cx1 > cx0) { g += `<rect x="${X(cx0)}" y="${Y(sy0)}" width="${r2((cx1 - cx0) * s)}" height="${r2((sy1 - sy0) * s)}" fill="#E9E4DA"/>`; for (let q = sx0 + 0.28; q < sx1; q += 0.28) if (q > cx0 && q < cx1) g += `<line x1="${X(q)}" y1="${Y(sy0)}" x2="${X(q)}" y2="${Y(sy1)}" stroke="#9A8F80" stroke-width="1.5"/>`; }
    // muros recortados al módulo
    for (const [a, b, c, d] of F.walls) { const p = Math.max(a, x0), q = Math.min(b, x1), u = Math.max(c, y0), v = Math.min(d, y1); if (q - p > 0.01 && v - u > 0.01) g += `<rect x="${X(p)}" y="${Y(u)}" width="${r2((q - p) * s)}" height="${r2((v - u) * s)}" fill="#161616"/>`; }
    g += `<text x="${r2((X(x0) + X(x1)) / 2)}" y="${oy - 18}" font-family="Arial" font-size="24" font-weight="700" text-anchor="middle" fill="#161616">${id}</text>`;
    g += `<text x="${r2((X(x0) + X(x1)) / 2)}" y="${r2(Y(y1) + 30)}" font-family="Arial" font-size="20" text-anchor="middle" fill="#161616">${dec(x1 - x0, 3)}</text>`;
    g += `<text transform="translate(${r2(X(x0) - 10)},${r2((Y(y0) + Y(y1)) / 2)}) rotate(-90)" font-family="Arial" font-size="20" text-anchor="middle" fill="#161616">${dec(y1 - y0)}</text>`;
    for (const [n, m2, rx, ry] of F.rooms) if (rx >= x0 && rx < x1 && ry <= y1) {
      const words = n.split(' '); const lines = words.length > 1 && n.length > 10 ? [words[0], words.slice(1).join(' ')] : [n];
      lines.forEach((l, i) => { g += `<text x="${X(rx)}" y="${r2(Y(ry) + i * 22)}" font-family="Arial" font-size="19" font-weight="700" text-anchor="middle" fill="#161616">${l}</text>`; });
      if (m2) g += `<text x="${X(rx)}" y="${r2(Y(ry) + lines.length * 22)}" font-family="Arial" font-size="18" text-anchor="middle" fill="#57534D">${m2}</text>`; }
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Plantas de los módulos con la tabiquería del proyecto recortada en cada módulo" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const notaTab = items => `<div style="flex:1; display:flex; flex-direction:column; gap:18px">${items.map(([h, p]) => `<div style="display:flex; flex-direction:column; gap:6px; border-left:6px solid ${C.ink}; background:${C.card}; padding:18px 24px"><h3 style="font-size:28px; font-weight:600">${h}</h3><p style="font-size:24px; line-height:1.4; color:${C.body}">${p}</p></div>`).join('')}</div>`;
S.tab_pb = light('tab_pb', 'TABIQUES', 'Plantas de módulo · planta baja', 'M1, M2 y M3 con la tabiquería del proyecto',
  `<div style="display:flex; flex-direction:row; gap:48px; align-items:flex-start">${plantaMods(PBW, 46, 44)}${notaTab([
    ['Junta a 3,20 m', 'Cruza el dormitorio 1 a 0,30 m de su tabique y se oculta en suelo y techo, como en el salón. El dormitorio queda como en el proyecto: 3,10 m de ancho y 9,55 m².'],
    ['Junta a 5,50 m', 'Sobre los tabiques del baño 1 y del lavadero, sin cambios en el proyecto.'],
    
    ['Salón', 'Los 7,43 m libres del salón quedan repartidos entre los tres módulos; ahí las juntas se ocultan con el suelo y el falso techo.']])}</div>`, 28);
S.tab_p1 = light('tab_p1', 'TABIQUES', 'Plantas de módulo · planta primera', 'M4, M5 y M6 con la tabiquería del proyecto',
  `<div style="display:flex; flex-direction:row; gap:48px; align-items:flex-start">${plantaMods(P1W, 46, 44)}${notaTab([
    ['Junta a 3,80 m', 'Sobre el tabique entre los dormitorios 2 y 3, sin cambios en el proyecto.'],
    ['Junta a 6,10 m', 'Sobre el tabique del baño principal, que queda entero en el M6.'],
    ['V · vuelo lateral', 'Pieza de 0,60 × 8,47 m que se atornilla al M4 en parcela: ningún módulo pasa de 3,20 m de ancho.'],
    ['Sin alinear', 'La junta a 3,80 cruza el dormitorio principal en su parte trasera.']])}</div>`, 28);

const order = ['cover', 'resumen', 'porque', 'adaptacion', 'plantas', 'volumen', 'mod_m1', 'mod_m2', 'mod_m3', 'mod_m4', 'mod_m5', 'mod_m6', 'alz_pb', 'alz_p1', 'tab_pb', 'tab_p1', 'fabricacion', 'parcela', 'sistema', 'calidades', 'optimizacion', 'alcance', 'precio', 'desglose', 'serie', 'condiciones', 'pasos', 'cierre'];
const PAL = { '#161616': '#141414', '#F5F3EF': '#ECEDE8', '#9A8F80': '#7C7F82', '#7A6347': '#C8381F', '#E9E4DA': '#D5D7D1', '#E9D9BC': '#F2D3C8', '#CDB894': '#E8B9AA', '#C8B394': '#EE6A4E', '#B4322C': '#C8381F', '#5E5850': '#4D5054', '#2F5D8A': '#3E4146', '#E2D3B8': '#EFD0C5', '#D9D3C7': '#C6C8C2', '#D6CFC2': '#CBCDC7', '#9FB7CC': '#A7AAAD', '#8E8679': '#7C7F82', '#57534D': '#45474A', '#3A3835': '#34363A', '#FBFAF7': '#EEEFEA', '#F7F4EE': '#EDEEE9', '#F1EDE5': '#E3E5DF', '#EFEBE3': '#E1E3DD', '#EFE6D6': '#EDD8D0', '#ECE8E1': '#E1E3DD', '#E6E0D6': '#DADCD6', '#E3DDD2': '#D8DAD4', '#E2DDD4': '#C9CBC5', '#DCD5C8': '#CFD1CB', '#D2C3A6': '#D9A898', '#C98A4B': '#C8381F', '#B9B4AC': '#A9ABA6', '#B59E79': '#C2705C', '#8A7457': '#9C2E18', '#6F6A63': '#5E6064', '#1F1E1D': '#232528' };
const estilo = h => h
  .replace(/#[0-9A-Fa-f]{6}/g, m => PAL[m.toUpperCase()] || m)
  .replace(/font-weight:600; letter-spacing:[4-8]px;/g, MONO + '; font-weight:500; letter-spacing:2px; text-transform:uppercase;')
  .replace(/font-size:(\d{2,3})px; font-weight:700/g, (m, n) => +n >= 64 ? "font-family:'Archivo Narrow', Arial, sans-serif; font-size:" + Math.round(n * 1.08) + 'px; font-weight:700; letter-spacing:-1px' : m);
for (const id of order) { if (!S[id]) throw new Error('falta ' + id); fs.writeFileSync(path.join(OUT, 'slides', id + '.html'), estilo(S[id]) + '\n'); }
fs.writeFileSync(path.join(OUT, 'deck.json'), JSON.stringify({ v: 4, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') }, title: 'Propuesta RG21 · Piloto Névola', cover: 'cover', order,
  sections: { s1: { description: 'La propuesta y por qué industrializar', start: 'cover' }, s2: { description: 'El proyecto de Névola en módulos: modulación, fabricación, montaje y sistema', start: 'adaptacion' }, s3: { description: 'Calidades y optimizaciones', start: 'calidades' }, s4: { description: 'Oferta económica, condiciones y próximos pasos', start: 'precio' } },
  faces: { archivo: { family: 'Archivo', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400..900&display=swap' }, 'archivo-narrow': { family: 'Archivo Narrow', href: 'https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@500..700&display=swap' }, 'ibm-plex-mono': { family: 'IBM Plex Mono', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap' } }, designSystems: [] }, null, 2));
for (const id of order) { const s = fs.readFileSync(path.join(OUT, 'slides', id + '.html'), 'utf8'); const svgs = s.match(/<svg[\s\S]*?<\/svg>/g) || []; console.log(id.padEnd(13), (s.length / 1024).toFixed(1) + ' KB', 'elementos≈' + (s.match(/<[a-z]/g) || []).length, svgs.map(v => (v.length / 1024).toFixed(1) + 'KB').join(' ')); }
