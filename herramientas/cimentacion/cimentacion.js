// Planos de cimentación estimados para la vivienda piloto de Névola (pareada tipo)
// Criterio tomado de Pino (Menorca, 2024): muros corridos bajo los lados largos de cada módulo, zapata corrida,
// cámara sanitaria ventilada y placa de anclaje en cada pilar. Medidas de la modulación vigente.
const fs = require('fs');
const f2 = n => n.toFixed(2).replace('.', ',');
const fmt = n => Math.round(n).toLocaleString('es-ES');

// ---------- geometría (m). x: desde la fachada lateral de planta primera; y: desde la fachada principal de planta primera
const X = { A: 0.60, B: 3.80, C: 6.10, D: 8.45 }, Y = { 1: 0.60, 2: 6.10, 3: 10.10 };
const MUROS = [ // [id, x0, x1, ancho zapata, centro zapata, tipo]
  ['M-1', 0.60, 0.85, 0.80, 0.725, 'Muro perimetral 25 cm'],
  ['M-2', 3.65, 3.95, 1.00, 3.80, 'Muro interior 30 cm (apoyan dos módulos)'],
  ['M-2', 5.95, 6.25, 1.00, 6.10, 'Muro interior 30 cm (apoyan dos módulos)'],
  ['M-3', 8.20, 8.45, 1.20, 8.45, 'Muro de medianera 25 cm (uno por vivienda, zapata común)'],
];
const CIERRE = [['M-4', 0.60, 0.80], ['M-4', 9.90, 10.10]]; // muretes de cierre de cámara, fachada principal y trasera
const PLACAS = [];
for (const y of [0.72, 6.10, 9.98]) { PLACAS.push([0.725, y]); PLACAS.push([3.72, y], [3.88, y]); PLACAS.push([6.02, y], [6.18, y]); PLACAS.push([8.325, y]); }

// ---------- mediciones
const L = 9.50, Lz = L + 0.60;
const zap = { 'ZC-1 (80 × 50)': 0.80 * 0.50 * Lz, 'ZC-2 (100 × 50) × 2': 2 * 1.00 * 0.50 * Lz, 'ZC-3 común de medianera (120 × 50), media por vivienda': 0.5 * 1.20 * 0.50 * Lz, 'ZC-4 (60 × 40) de muretes de cierre': 2 * 0.60 * 0.40 * (7.85 - 0.95) };
const hm = 0.65; // altura de muro: de la zapata (-0,70) a la coronación (-0,05)
const mur = { 'M-1 (25 cm)': 0.25 * hm * L, 'M-2 (30 cm) × 2': 2 * 0.30 * hm * L, 'M-3 de medianera (25 cm)': 0.25 * hm * L, 'M-4 muretes de cierre (20 cm)': 2 * 0.20 * hm * (7.85 - 0.95) };
const vZ = Object.values(zap).reduce((a, b) => a + b, 0), vM = Object.values(mur).reduce((a, b) => a + b, 0);
const limpieza = 0.10 * (0.80 + 2 * 1.00 + 0.60) * Lz + 0.10 * 2 * 0.60 * 6.9;
const acero = vZ * 50 + vM * 75; // kg, cuantías de referencia
const exc = (0.80 + 2 * 1.00 + 0.60 + 0.30) * Lz * 1.30 + 2 * 0.80 * 6.9 * 1.20; // zanjas con sobreancho
const camara = 7.85 * 9.50;

// ---------- planta de cimentación
const s = 56, ox = 92, oy = 92;
const PX = x => +(ox + x * s).toFixed(1), PY = y => +(oy + y * s).toFixed(1);
let pl = '';
// huella de planta primera (voladizos sin cimentación)
pl += `<path d="M${PX(0)} ${PY(0)} H${PX(8.45)} V${PY(10.10)} H${PX(6.10)} V${PY(8.47)} H${PX(0)} Z" fill="none" style="stroke:var(--soft)" stroke-width="1.2" stroke-dasharray="7 5"/>`;
pl += `<rect x="${PX(0)}" y="${PY(0)}" width="${0.60 * s}" height="${8.47 * s}" fill="url(#vuelo)" opacity=".7"/><rect x="${PX(0.60)}" y="${PY(0)}" width="${7.85 * s}" height="${0.60 * s}" fill="url(#vuelo)" opacity=".7"/>`;
// cámara sanitaria
pl += `<rect x="${PX(0.60)}" y="${PY(0.60)}" width="${7.85 * s}" height="${9.50 * s}" style="fill:var(--camara)"/>`;
// zapatas (discontinuo)
for (const [, , , az, cz] of MUROS) pl += `<rect x="${PX(cz - az / 2)}" y="${PY(0.30)}" width="${(az * s).toFixed(1)}" height="${(Lz * s).toFixed(1)}" fill="none" style="stroke:var(--ink)" stroke-width="1.2" stroke-dasharray="5 4"/>`;
for (const [, y0, y1] of CIERRE) { const cy = (y0 + y1) / 2; pl += `<rect x="${PX(0.85)}" y="${PY(cy - 0.30)}" width="${((8.20 - 0.85) * s).toFixed(1)}" height="${(0.60 * s).toFixed(1)}" fill="none" style="stroke:var(--ink)" stroke-width="1" stroke-dasharray="5 4"/>`; }
// muros (macizo)
for (const [, x0, x1] of MUROS) pl += `<rect x="${PX(x0)}" y="${PY(0.60)}" width="${((x1 - x0) * s).toFixed(1)}" height="${(9.50 * s).toFixed(1)}" style="fill:var(--ink)"/>`;
for (const [, y0, y1] of CIERRE) for (const [a, b] of [[0.85, 3.65], [3.95, 5.95], [6.25, 8.20]]) pl += `<rect x="${PX(a)}" y="${PY(y0)}" width="${((b - a) * s).toFixed(1)}" height="${((y1 - y0) * s).toFixed(1)}" style="fill:var(--ink)" opacity=".75"/>`;
// rejillas de ventilación en los muretes de cierre
for (const [, y0, y1] of CIERRE) for (const xr of [2.20, 4.95, 7.20]) pl += `<rect x="${PX(xr - 0.25)}" y="${PY(y0) - 3}" width="${0.5 * s}" height="${(y1 - y0) * s + 6}" style="fill:var(--paper);stroke:var(--accent)" stroke-width="1.5"/>`;
// muro del vecino (pareada, simétrica)
pl += `<rect x="${PX(8.45)}" y="${PY(0.60)}" width="${0.25 * s}" height="${9.50 * s}" style="fill:var(--soft)" opacity=".45"/>`;
// placas de anclaje
for (const [x, y] of PLACAS) pl += `<rect x="${(PX(x) - 5).toFixed(1)}" y="${(PY(y) - 5).toFixed(1)}" width="10" height="10" style="fill:var(--accent)"/>`;
// ejes
const ejeX = [['A', X.A], ['B', X.B], ['C', X.C], ['D', X.D]], ejeY = [['1', Y[1]], ['2', Y[2]], ['3', Y[3]]];
for (const [n, x] of ejeX) pl += `<line x1="${PX(x)}" y1="${PY(-0.55)}" x2="${PX(x)}" y2="${PY(10.55)}" style="stroke:var(--accent)" stroke-width=".8" stroke-dasharray="14 4 2 4"/><circle cx="${PX(x)}" cy="${PY(-0.85)}" r="12" style="fill:var(--paper);stroke:var(--accent)" stroke-width="1.2"/><text x="${PX(x)}" y="${PY(-0.85) + 4.5}" text-anchor="middle" class="ax">${n}</text>`;
for (const [n, y] of ejeY) pl += `<line x1="${PX(-0.55)}" y1="${PY(y)}" x2="${PX(9.15)}" y2="${PY(y)}" style="stroke:var(--accent)" stroke-width=".8" stroke-dasharray="14 4 2 4"/><circle cx="${PX(-0.85)}" cy="${PY(y)}" r="12" style="fill:var(--paper);stroke:var(--accent)" stroke-width="1.2"/><text x="${PX(-0.85)}" y="${PY(y) + 4.5}" text-anchor="middle" class="ax">${n}</text>`;
// cotas
const cotaH = (xa, xb, y, t) => `<line x1="${PX(xa)}" y1="${PY(y)}" x2="${PX(xb)}" y2="${PY(y)}" style="stroke:var(--ink)" stroke-width=".8"/>${[xa, xb].map(x => `<line x1="${PX(x) - 4}" y1="${PY(y) + 4}" x2="${PX(x) + 4}" y2="${PY(y) - 4}" style="stroke:var(--ink)" stroke-width="1.4"/>`).join('')}<text x="${(PX(xa) + PX(xb)) / 2}" y="${PY(y) - 5}" text-anchor="middle" class="ct">${t}</text>`;
const cotaV = (ya, yb, x, t) => `<line x1="${PX(x)}" y1="${PY(ya)}" x2="${PX(x)}" y2="${PY(yb)}" style="stroke:var(--ink)" stroke-width=".8"/>${[ya, yb].map(y => `<line x1="${PX(x) - 4}" y1="${PY(y) + 4}" x2="${PX(x) + 4}" y2="${PY(y) - 4}" style="stroke:var(--ink)" stroke-width="1.4"/>`).join('')}<text transform="translate(${PX(x) - 6} ${(PY(ya) + PY(yb)) / 2}) rotate(-90)" text-anchor="middle" class="ct">${t}</text>`;
pl += cotaH(X.A, X.B, 10.95, '3,20') + cotaH(X.B, X.C, 10.95, '2,30') + cotaH(X.C, X.D, 10.95, '2,35') + cotaH(X.A, X.D, 11.45, '7,85 · ejes de muro');
pl += cotaV(Y[1], Y[2], 9.35, '5,50') + cotaV(Y[2], Y[3], 9.35, '4,00') + cotaV(Y[1], Y[3], 9.85, '9,50');
// rótulos
pl += `<text x="${PX(2.20)}" y="${PY(3.4)}" text-anchor="middle" class="lb">M1</text><text x="${PX(4.95)}" y="${PY(3.4)}" text-anchor="middle" class="lb">M2</text><text x="${PX(7.27)}" y="${PY(3.4)}" text-anchor="middle" class="lb">M3</text>`;
pl += `<text x="${PX(2.20)}" y="${PY(4.0)}" text-anchor="middle" class="sm">cámara sanitaria</text><text x="${PX(4.95)}" y="${PY(4.0)}" text-anchor="middle" class="sm">ventilada</text>`;
pl += `<text x="${PX(0.30)}" y="${PY(4.6)}" text-anchor="middle" class="sm" transform="rotate(-90 ${PX(0.30)} ${PY(4.6)})">vuelo M4 · sin cimentación</text>`;
pl += `<text x="${PX(10.35)}" y="${PY(3.2)}" class="sm" transform="rotate(90 ${PX(10.35)} ${PY(3.2)})">vivienda pareada colindante →</text>`;
const plantaSVG = `<svg viewBox="0 0 ${Math.round(PX(10.75))} ${Math.round(PY(11.85))}" role="img" aria-label="Planta de cimentación: cuatro muros corridos bajo los lados largos de los módulos, dos muretes de cierre y placas de anclaje en cada pilar">
<defs><pattern id="vuelo" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" style="stroke:var(--soft)" stroke-width="1"/></pattern></defs>${pl}</svg>`;

// ---------- sección transversal A-A (por y = 3,00)
const k = 52, sx = 300, z0 = 430; // z0: px de la cota ±0,00
const SX = x => +(sx + x * k).toFixed(1), SZ = z => +(z0 - z * k).toFixed(1);
let se = '';
// terreno
se += `<rect x="${SX(-1.2)}" y="${SZ(-0.20)}" width="${10.9 * k}" height="${1.6 * k}" style="fill:var(--terreno)"/>`;
se += `<line x1="${SX(-1.2)}" y1="${SZ(-0.20)}" x2="${SX(9.7)}" y2="${SZ(-0.20)}" style="stroke:var(--ink)" stroke-width="1.6"/>`;
se += `<line x1="${SX(-1.2)}" y1="${SZ(0)}" x2="${SX(9.7)}" y2="${SZ(0)}" style="stroke:var(--soft)" stroke-width="1" stroke-dasharray="6 5"/>`;
// cámara: se excava y se rellena con grava
se += `<rect x="${SX(0.85)}" y="${SZ(-0.20)}" width="${(8.20 - 0.85) * k}" height="${0.25 * k}" style="fill:var(--camara)"/><rect x="${SX(0.85)}" y="${SZ(-0.45)}" width="${(8.20 - 0.85) * k}" height="${0.10 * k}" style="fill:var(--grava)"/>`;
// zapatas, limpieza y muros
for (const [, x0, x1, az, cz] of MUROS) {
  se += `<rect x="${SX(cz - az / 2)}" y="${SZ(-1.20)}" width="${az * k}" height="${0.10 * k}" style="fill:var(--soft)" opacity=".5"/>`;
  se += `<rect x="${SX(cz - az / 2)}" y="${SZ(-0.70)}" width="${az * k}" height="${0.50 * k}" style="fill:var(--horm);stroke:var(--ink)" stroke-width="1"/>`;
  se += `<rect x="${SX(x0)}" y="${SZ(-0.05)}" width="${(x1 - x0) * k}" height="${0.65 * k}" style="fill:var(--horm);stroke:var(--ink)" stroke-width="1"/>`;
  se += `<rect x="${SX(x0)}" y="${SZ(-0.05) - 3}" width="${(x1 - x0) * k}" height="3" style="fill:var(--accent)"/>`;
}
se += `<rect x="${SX(8.45)}" y="${SZ(-0.05)}" width="${0.25 * k}" height="${0.65 * k}" style="fill:var(--soft)" opacity=".4"/>`;
// módulos
const mod = (x0, x1, za, zb, t, op) => `<rect x="${SX(x0)}" y="${SZ(zb)}" width="${(x1 - x0) * k}" height="${(zb - za) * k}" style="fill:var(--modulo);stroke:var(--ink)" stroke-width="1.4" ${op ? 'opacity=".55"' : ''}/><rect x="${SX(x0)}" y="${SZ(za + 0.20)}" width="${(x1 - x0) * k}" height="${0.20 * k}" style="fill:none;stroke:var(--ink)" stroke-width=".8"/><text x="${(SX(x0) + SX(x1)) / 2}" y="${(SZ(za) + SZ(zb)) / 2 + 6}" text-anchor="middle" class="lb">${t}</text>`;
se += mod(0.60, 3.80, -0.05, 3.10, 'M1') + mod(3.80, 6.10, -0.05, 3.10, 'M2') + mod(6.10, 8.45, -0.05, 3.10, 'M3');
se += mod(0.00, 3.80, 3.10, 6.15, 'M4') + mod(3.80, 6.10, 3.10, 6.15, 'M5') + mod(6.10, 8.45, 3.10, 6.15, 'M6');
// niveles
const niv = (z, t, side = 'R', dy = 0) => { const x = side === 'R' ? 9.45 : -0.55; const tx = side === 'R' ? SX(10.05) : SX(-0.95); return `<line x1="${SX(x - 0.2)}" y1="${SZ(z)}" x2="${SX(x + 0.5)}" y2="${SZ(z)}" style="stroke:var(--accent)" stroke-width="1"/><path d="M${SX(x)} ${SZ(z)} l-6 -9 h12 Z" style="fill:var(--accent)"/><text x="${tx}" y="${SZ(z) + 4 + dy}" class="ct" text-anchor="${side === 'R' ? 'start' : 'end'}">${t}</text>`; };
se += niv(6.40, '+6,40 cubierta') + niv(3.35, '+3,35 suelo P1') + niv(0.20, '+0,20 suelo PB', 'R', -5) + niv(0, '±0,00 rasante del proyecto', 'R', 9) + niv(-0.05, '−0,05 coronación de muro', 'L', -6) + niv(-0.20, '−0,20 terreno junto a fachada', 'L', 12) + niv(-0.70, '−0,70 cara superior de zapata') + niv(-1.20, '−1,20 fondo de zapata (a confirmar)');
se += `<text x="${SX(-0.15)}" y="${SZ(4.6)}" class="sm" text-anchor="end">vuelo lateral 0,60 →</text>`;
const seccionSVG = `<svg viewBox="0 0 ${Math.round(SX(15.1))} ${Math.round(SZ(-1.85))}" role="img" aria-label="Sección transversal: los seis módulos apoyados en los cuatro muros sobre zapata corrida, con cámara sanitaria y niveles">${se}</svg>`;

// ---------- detalle de apoyo (muro interior M-2)
const d = 300, dx = 60, dz = 140; // 1 m = 300 px
const DX = x => +(dx + x * d).toFixed(1), DZ = z => +(dz - z * d).toFixed(1);
let de = '';
de += `<rect x="${DX(0)}" y="${DZ(-0.20)}" width="${1.6 * d}" height="${1.05 * d}" style="fill:var(--terreno)"/>`;
de += `<rect x="${DX(0.30)}" y="${DZ(-1.20)}" width="${1.00 * d}" height="${0.10 * d}" style="fill:var(--soft)" opacity=".5"/>`;
de += `<rect x="${DX(0.30)}" y="${DZ(-0.70)}" width="${1.00 * d}" height="${0.50 * d}" style="fill:var(--horm);stroke:var(--ink)" stroke-width="1.5"/>`;
de += `<rect x="${DX(0.65)}" y="${DZ(-0.05)}" width="${0.30 * d}" height="${0.65 * d}" style="fill:var(--horm);stroke:var(--ink)" stroke-width="1.5"/>`;
// armaduras esquemáticas
de += `<line x1="${DX(0.36)}" y1="${DZ(-1.12)}" x2="${DX(1.24)}" y2="${DZ(-1.12)}" style="stroke:var(--accent)" stroke-width="2"/><line x1="${DX(0.72)}" y1="${DZ(-1.12)}" x2="${DX(0.72)}" y2="${DZ(-0.10)}" style="stroke:var(--accent)" stroke-width="2"/><line x1="${DX(0.88)}" y1="${DZ(-1.12)}" x2="${DX(0.88)}" y2="${DZ(-0.10)}" style="stroke:var(--accent)" stroke-width="2"/>`;
// placas y pernos
for (const xc of [0.72, 0.88]) {
  de += `<rect x="${DX(xc - 0.07)}" y="${DZ(-0.05)}" width="${0.14 * d}" height="${0.015 * d}" style="fill:var(--ink)"/>`;
  for (const xp of [xc - 0.045, xc + 0.045]) de += `<line x1="${DX(xp)}" y1="${DZ(-0.05)}" x2="${DX(xp)}" y2="${DZ(-0.45)}" style="stroke:var(--ink)" stroke-width="2.5"/>`;
}
// marcos de suelo de los dos módulos (IPE 200) y panel
for (const [x0, x1] of [[0.10, 0.795], [0.805, 1.50]]) {
  de += `<rect x="${DX(x0)}" y="${DZ(0.15)}" width="${(x1 - x0) * d}" height="${0.20 * d}" style="fill:none;stroke:var(--ink)" stroke-width="1.5"/>`;
  de += `<rect x="${DX(x0)}" y="${DZ(0.20)}" width="${(x1 - x0) * d}" height="${0.05 * d}" style="fill:var(--modulo);stroke:var(--ink)" stroke-width="1"/>`;
}
de += `<line x1="${DX(0.80)}" y1="${DZ(0.20)}" x2="${DX(0.80)}" y2="${DZ(-0.05)}" style="stroke:var(--accent)" stroke-width="2" stroke-dasharray="4 3"/>`;
de += `<rect x="${DX(0.10)}" y="${DZ(-0.45)}" width="${0.55 * d}" height="${0.10 * d}" style="fill:var(--grava)"/><rect x="${DX(0.95)}" y="${DZ(-0.45)}" width="${0.55 * d}" height="${0.10 * d}" style="fill:var(--grava)"/>`;
const call = (x, z, tx, tz, t) => `<line x1="${DX(x)}" y1="${DZ(z)}" x2="${DX(tx)}" y2="${DZ(tz)}" style="stroke:var(--soft)" stroke-width=".8"/><text x="${DX(tx) + 4}" y="${DZ(tz) + 4}" class="sm">${t}</text>`;
de += call(1.30, 0.10, 1.62, 0.32, 'Marco de suelo IPE 200 de cada módulo') + call(0.80, 0.08, 1.62, 0.12, 'Junta entre módulos, sellada y oculta');
de += call(0.88, -0.05, 1.62, -0.02, 'Placa de anclaje 250 × 250 × 15 por pilar, 4 pernos') + call(0.80, -0.30, 1.62, -0.24, 'Muro M-2 de 30 cm · HA-25');
de += call(1.30, -0.40, 1.62, -0.44, 'Grava y lámina en la cámara sanitaria') + call(1.20, -0.55, 1.62, -0.66, 'Zapata ZC-2 100 × 50 · emparrillado inferior') + call(1.10, -1.15, 1.62, -1.10, 'Hormigón de limpieza 10 cm');
const detalleSVG = `<svg viewBox="0 0 ${Math.round(DX(3.05))} ${Math.round(DZ(-1.30))}" role="img" aria-label="Detalle del apoyo de dos módulos sobre el muro interior: placas de anclaje, muro de 30 centímetros y zapata corrida">${de}</svg>`;

// ---------- página
const rowsZ = Object.entries(zap).map(([t, v]) => `<tr><td>${t}</td><td class="n">${f2(v)} m³</td></tr>`).join('');
const rowsM = Object.entries(mur).map(([t, v]) => `<tr><td>${t}</td><td class="n">${f2(v)} m³</td></tr>`).join('');
const html = `<title>Cimentación Névola</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400..900&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: juego de láminas técnicas apiladas, cada una con su cajetín; notas y mediciones en columna de lectura */
:root{ --bg:#E7E8E3; --paper:#EFF0EB; --ink:#141414; --soft:#5E6064; --rule:#C3C5BF; --accent:#C8381F; --camara:#DCDDD7; --terreno:#D9CFC0; --grava:#B9B3A6; --horm:#C9CBC5; --modulo:#F2D3C8;
  --display:'Archivo', Arial, sans-serif; --mono:'IBM Plex Mono', 'Courier New', monospace; color-scheme:light }
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){ --bg:#141414; --paper:#1C1E20; --ink:#ECEDE8; --soft:#A9ABA6; --rule:#34363A; --accent:#EE6A4E; --camara:#24272A; --terreno:#3A3329; --grava:#4A463E; --horm:#4A4D51; --modulo:#40241D; color-scheme:dark }}
:root[data-theme="dark"]{ --bg:#141414; --paper:#1C1E20; --ink:#ECEDE8; --soft:#A9ABA6; --rule:#34363A; --accent:#EE6A4E; --camara:#24272A; --terreno:#3A3329; --grava:#4A463E; --horm:#4A4D51; --modulo:#40241D; color-scheme:dark }
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--display);font-size:15.5px;line-height:1.55;padding-inline:16px;padding-block:28px 48px}
.wrap{max-width:1080px;margin-inline:auto;display:flex;flex-direction:column;gap:40px}
h1{font-weight:800;font-size:clamp(30px,5vw,48px);line-height:1;letter-spacing:-.035em;margin:0;text-wrap:balance} h2{font-weight:800;font-size:22px;letter-spacing:-.02em;margin:0}
p{margin:0;max-width:72ch} .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)} .lede{color:var(--soft)}
header{display:flex;flex-direction:column;gap:14px;border-bottom:2px solid var(--ink);padding-bottom:22px}
.sheet{background:var(--paper);border:2px solid var(--ink);display:flex;flex-direction:column;min-width:0}
.sheet .draw{padding:16px;overflow-x:auto} .sheet svg{display:block;width:100%;height:auto;min-width:560px}
.caj{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border-top:2px solid var(--ink)} .caj div{padding:8px 12px;border-left:1px solid var(--ink);display:flex;flex-direction:column;gap:2px} .caj div:first-child{border-left:0}
.caj span{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)} .caj b{font-family:var(--mono);font-weight:500;font-size:13px}
svg text{font-family:var(--mono);fill:var(--ink)} .ax{font-size:13px;font-weight:500;fill:var(--accent)} .ct{font-size:12px} .lb{font-family:var(--display);font-size:20px;font-weight:800} .sm{font-size:11px;fill:var(--soft)}
.legend{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:var(--soft);padding:0 16px 14px} .legend i{display:inline-block;width:16px;height:12px;vertical-align:-1px;margin-right:6px;border:1px solid var(--ink)}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:18px}
table{border-collapse:collapse;width:100%;font-size:14.5px;font-variant-numeric:tabular-nums} th,td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--rule)} th{font-family:var(--mono);font-weight:500;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--soft);border-bottom:2px solid var(--ink)} td.n{text-align:right;font-family:var(--mono);white-space:nowrap} tr.tot td{font-weight:800;border-top:2px solid var(--ink)}
.notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:2px;background:var(--ink);border:2px solid var(--ink)} .notes div{background:var(--paper);padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-width:0} .notes b{font-weight:800} .notes span{font-size:14px;color:var(--soft)} .notes .warn b{color:var(--accent)}
.fotos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.fotos figure{margin:0;background:var(--paper);border:2px solid var(--ink);display:flex;flex-direction:column;min-width:0}.fotos .f-ancha{grid-column:1 / -1}.fotos img{display:block;width:100%;height:auto;max-width:100%}.fotos .f-ancha img{aspect-ratio:4/3;object-fit:cover}.fotos figure:not(.f-ancha) img{aspect-ratio:3/4;object-fit:cover}.fotos figcaption{font-size:13.5px;color:var(--soft);padding:10px 14px;border-top:2px solid var(--ink)}@media (max-width:640px){.fotos{grid-template-columns:minmax(0,1fr)}}
footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:2px solid var(--ink);padding-top:12px;font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}
</style>
<div class="wrap">
<header>
  <p class="eyebrow">Névola · Vivienda piloto pareada · Estimación</p>
  <h1>Cimentación para los seis módulos</h1>
  <p class="lede">Cuatro muros corridos bajo los lados largos de los módulos, como en Pino (Menorca, 2024), adaptados a la modulación de Névola (3,20 · 2,30 · 2,35 m × 9,50 m) y a dos plantas. Es una estimación para entender la solución y medirla: el dimensionado final lo fija el cálculo de estructura con el estudio geotécnico de la parcela.</p>
</header>

<section class="sheet">
  <div class="draw">${plantaSVG}</div>
  <div class="legend"><span><i style="background:var(--ink)"></i>Muro de hormigón</span><span><i style="border-style:dashed;background:transparent"></i>Zapata corrida</span><span><i style="background:var(--accent);border-color:var(--accent)"></i>Placa de anclaje (una por pilar)</span><span><i style="background:var(--paper);border-color:var(--accent)"></i>Rejilla de ventilación</span><span><i style="background:var(--camara)"></i>Cámara sanitaria</span><span><i style="background:transparent;border-style:dashed;border-color:var(--soft)"></i>Huella de planta primera</span></div>
  <div class="caj"><div><span>Lámina</span><b>C01 · Planta de cimentación</b></div><div><span>Escala</span><b>Gráfica</b></div><div><span>Cotas</span><b>m, a ejes</b></div><div><span>Rev.</span><b>A · estimación</b></div></div>
</section>

<section class="sheet">
  <div class="draw">${seccionSVG}</div>
  <div class="caj"><div><span>Lámina</span><b>C02 · Sección transversal A-A</b></div><div><span>Escala</span><b>Gráfica</b></div><div><span>Niveles</span><b>m, desde rasante</b></div><div><span>Rev.</span><b>A · estimación</b></div></div>
</section>

<section class="sheet">
  <div class="draw">${detalleSVG}</div>
  <div class="caj"><div><span>Lámina</span><b>C03 · Apoyo de dos módulos en muro interior</b></div><div><span>Escala</span><b>Gráfica</b></div><div><span>Referencia</span><b>Pino, E03-E04</b></div><div><span>Rev.</span><b>A · estimación</b></div></div>
</section>

<section class="obra" style="display:flex;flex-direction:column;gap:14px">
  <h2>Así queda en obra</h2>
  <p class="lede">Fotografías de una obra en Menorca con este mismo sistema: muros corridos de hormigón sobre zapata, sobre los que se colocan después los módulos.</p>
  <div class="fotos">
    <figure class="f-ancha"><img src="img/obra-muros-terminados.jpg" alt="Muros corridos de hormigón ya desencofrados, con la cámara sanitaria entre ellos y el terreno compactado" loading="lazy" width="1600" height="1200"><figcaption>Muros terminados y desencofrados. Entre ellos queda la cámara sanitaria; sobre su coronación apoyan los marcos de los módulos.</figcaption></figure>
    <figure><img src="img/obra-encofrado-armado.jpg" alt="Zanjas encofradas con paneles amarillos y armaduras de zapata y arranque de muro colocadas" loading="lazy" width="1203" height="1600"><figcaption>Encofrado y armado de zapatas corridas y arranques de muro, antes de hormigonar.</figcaption></figure>
    <figure><img src="img/obra-muros-y-losa.jpg" alt="Muros de cimentación terminados junto a una losa de hormigón con esperas de armadura" loading="lazy" width="1504" height="2000"><figcaption>Muros ya hormigonados junto a una losa con esperas para el resto de la obra.</figcaption></figure>
  </div>
</section>

<section class="obra montaje" style="display:flex;flex-direction:column;gap:14px">
  <h2>Y después: los módulos sobre los muros</h2>
  <p class="lede">La misma obra, ya con los módulos colocados. Así se ve en real cómo apoya el sistema en la cimentación y cómo se monta en parcela.</p>
  <div class="fotos">
    <figure class="f-ancha"><img src="img/montaje-1-modulos-sobre-muros.jpg" alt="Módulos de planta baja apoyados sobre los muros de hormigón, con un remate de chapa entre el muro y la fachada" loading="lazy" width="1500" height="1125"><figcaption>1 · Módulos de planta baja apoyados en los muros. El muro queda visto como zócalo y un remate de chapa cierra el encuentro con la fachada.</figcaption></figure>
    <figure><img src="img/montaje-2-grua-planta-primera.jpg" alt="Una grúa coloca un módulo de planta primera sobre los módulos de planta baja ya instalados" loading="lazy" width="1125" height="1500"><figcaption>2 · La grúa coloca un módulo de planta primera sobre los de abajo.</figcaption></figure>
    <figure><img src="img/montaje-3-planta-baja-colocada.jpg" alt="Planta baja modular colocada, con el panel de cubierta aún sin terminar, junto a muros de hormigón y la piscina en obra" loading="lazy" width="1125" height="1500"><figcaption>3 · Planta baja colocada sobre su cimentación, con la cubierta todavía por rematar.</figcaption></figure>
    <figure><img src="img/montaje-4-encuentro-plantas.jpg" alt="Esquina de la vivienda con dos plantas de módulos apiladas sobre el zócalo de hormigón" loading="lazy" width="1125" height="1500"><figcaption>4 · Dos plantas apiladas sobre el zócalo: la junta entre módulos queda en la línea de la fachada.</figcaption></figure>
    <figure><img src="img/montaje-5-vivienda-montada.jpg" alt="Vivienda modular de dos plantas ya montada, con la estructura de la pérgola y la terraza en obra" loading="lazy" width="1125" height="1500"><figcaption>5 · Vivienda montada, con la pérgola y la terraza pendientes de terminar.</figcaption></figure>
  </div>
</section>

<section style="display:flex;flex-direction:column;gap:14px">
  <h2>Cómo funciona</h2>
  <div class="notes">
    <div><b>Un muro por cada lado largo</b><span>Los marcos de suelo de los módulos apoyan en continuo sobre cuatro muros en los ejes A, B, C y D. En B y C apoyan dos módulos a la vez, por eso esos muros son de 30 cm y su zapata más ancha.</span></div>
    <div><b>Los de arriba cargan por los pilares</b><span>Los módulos de planta primera bajan su carga por los pilares a los mismos ejes. Cada pilar lleva su placa de anclaje en la coronación del muro: 18 placas en total: los 6 pilares de cada módulo de planta baja, en los ejes 1, 2 y 3.</span></div>
    <div><b>Voladizos sin cimentación</b><span>El vuelo lateral del M4 y el vuelo frontal de planta primera (0,60 m) no llegan al suelo: no necesitan muro.</span></div>
    <div><b>Cámara sanitaria ventilada</b><span>Sustituye a la solera Cáviti del proyecto. Se cierra delante y detrás con muretes de 20 cm y rejillas, y por ella pasan los colectores suspendidos del saneamiento.</span></div>
    <div><b>Medianera de la pareada</b><span>Cada vivienda tiene su muro (M-3) y comparten una zapata común en el eje de medianera, con junta entre los dos muros.</span></div>
    <div class="warn"><b>A resolver con la arquitecta: el nivel</b><span>Con el suelo a +0,20 y el módulo de 25 cm de canto, el marco queda en −0,05, por debajo de la rasante ±0,00. Para dejar 15 cm entre terreno y fachada hay que bajar el terreno junto a fachada a −0,20 (acera o drenaje perimetral) o subir el suelo de planta baja.</span></div>
  </div>
</section>

<section class="two">
  <div style="display:flex;flex-direction:column;gap:10px"><h2>Mediciones por vivienda</h2>
    <table><thead><tr><th>Hormigón HA-25 en zapatas</th><th class="n">Volumen</th></tr></thead><tbody>${rowsZ}<tr class="tot"><td>Zapatas</td><td class="n">${f2(vZ)} m³</td></tr></tbody></table>
    <table><thead><tr><th>Hormigón HA-25 en muros (0,65 m de alto)</th><th class="n">Volumen</th></tr></thead><tbody>${rowsM}<tr class="tot"><td>Muros</td><td class="n">${f2(vM)} m³</td></tr></tbody></table>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px"><h2>Resumen</h2>
    <table><thead><tr><th>Partida</th><th class="n">Cantidad</th></tr></thead><tbody>
      <tr><td>Excavación en zanja</td><td class="n">≈ ${fmt(exc)} m³</td></tr>
      <tr><td>Hormigón de limpieza HL-150, 10 cm</td><td class="n">≈ ${f2(limpieza)} m³</td></tr>
      <tr><td>Hormigón HA-25/F/20/XC2, zapatas y muros</td><td class="n">≈ ${f2(vZ + vM)} m³</td></tr>
      <tr><td>Acero B 500 S (50 kg/m³ en zapatas, 75 en muros)</td><td class="n">≈ ${fmt(acero)} kg</td></tr>
      <tr><td>Placas de anclaje 250 × 250 × 15 con 4 pernos</td><td class="n">18 ud</td></tr>
      <tr><td>Cámara sanitaria: grava y lámina</td><td class="n">≈ ${f2(camara)} m²</td></tr>
      <tr><td>Rejillas de ventilación</td><td class="n">6 ud</td></tr>
    </tbody></table>
    <p class="lede" style="font-size:13.5px">Materiales como en Pino: HA-25/F/20/XC2, B 500 S, recubrimiento de 70 mm contra el terreno. La cimentación la ejecuta el promotor; RG21 entrega la posición de placas y pernos.</p>
  </div>
</section>

<section style="display:flex;flex-direction:column;gap:10px">
  <h2>Qué falta para darlo por bueno</h2>
  <p>1. Estudio geotécnico de la parcela de Guadalix: tensión admisible y cota de apoyo (aquí se supone fondo a −1,20). 2. Cálculo de estructura: cargas de los pilares de planta primera sobre los muros y anchos definitivos de zapata. 3. Decisión sobre el nivel del terreno junto a fachada. 4. Replanteo de placas y pernos con el proyecto de fabricación de los módulos. El plano de Mahón (DWG de AutoCAD 2018) no se ha podido abrir; la referencia es Pino.</p>
</section>
<footer><span>Névola · Cimentación del piloto · Estimación A</span><span>Octubre 2026</span></footer>
</div>`;
fs.writeFileSync(__dirname + '/cimentacion_nevola.html', html);
console.log('ok', { zapatas: f2(vZ), muros: f2(vM), total: f2(vZ + vM), acero: fmt(acero), exc: fmt(exc), placas: PLACAS.length });
