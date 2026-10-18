// Modulación y mediciones del piloto Névola (pareada tipo) con el sistema de Mahón (proyecto 182)
// Coordenadas: x desde la fachada lateral exterior de planta primera; y desde la fachada delantera de planta primera.
// Juntas alineadas con tabiques: 3,20 y 5,50 m desde la fachada lateral de planta baja (x = 3,80 y 6,10 en coordenadas de planta primera)
const J1 = 3.80, J2 = 6.10;
const mods = [
  { id: 'M1', planta: 'PB', x0: 0.60, x1: J1, y0: 0.60, y1: 10.10, uso: 'Dormitorio 1, cocina, salón' },
  { id: 'M2', planta: 'PB', x0: J1, x1: J2, y0: 0.60, y1: 10.10, uso: 'Vestíbulo, escalera, salón' },
  { id: 'M3', planta: 'PB', x0: J2, x1: 8.45, y0: 0.60, y1: 10.10, uso: 'Baño 1, lavadero, escalera, salón (medianera)' },
  { id: 'M4', planta: 'P1', x0: 0.60, x1: J1, y0: 0.00, y1: 8.47, uso: 'Dormitorio 3, baño 2, dormitorio principal · vuelo frontal 0,60' },
  { id: 'M5', planta: 'P1', x0: J1, x1: J2, y0: 0.00, y1: 8.47, uso: 'Dormitorio 2, distribuidor, escalera, dormitorio principal' },
  { id: 'M6', planta: 'P1', x0: J2, x1: 8.45, y0: 0.00, y1: 10.10, uso: 'Dormitorio 2, escalera, vestidor, baño principal (medianera)' },
];
for (const m of mods) { m.ancho = +(m.x1 - m.x0).toFixed(3); m.largo = +(m.y1 - m.y0).toFixed(3); m.area = +(m.ancho * m.largo).toFixed(2); m.alto = m.planta === 'PB' ? 3.05 : 3.05; }
// --- ACERO (tipología Mahón: marco de suelo y de techo en IPE 200, pilares IPE 160, correas HEA 100 + SHS 60.40.3 + L 80.8)
const kgm = { IPE200: 22.96, IPE160: 16.20, IPE220: 26.86, HEA100: 16.70, SHS: 4.42 };
const acero = [];
for (const m of mods) {
  const per = 2 * (m.ancho + m.largo);
  // vigas: marco inferior + superior; en planta primera el borde frontal (vuelo 0,60) pasa a IPE 220
  if (m.planta === 'P1') { acero.push([m.id, 'Vigas de marco IPE 200 (suelo y techo)', 2 * per - 2 * m.ancho, kgm.IPE200]); acero.push([m.id, 'Viga de borde frontal en vuelo IPE 220', 2 * m.ancho, kgm.IPE220]); }
  else acero.push([m.id, 'Vigas de marco IPE 200 (suelo y techo)', 2 * per, kgm.IPE200]);
  const npil = m.largo > 9.8 ? 8 : 6; // pilares en esquinas + intermedios por cada lado largo
  acero.push([m.id, `Pilares IPE 160 (${npil} ud × ${(m.alto - 0.40).toFixed(2)} m)`, npil * (m.alto - 0.40), kgm.IPE160]);
  acero.push([m.id, 'Correas de suelo HEA 100 (0,64 m/m², como Mahón)', 0.64 * m.area, kgm.HEA100]);
  acero.push([m.id, 'Correas de techo SHS 60.40.3 (1,94 m/m², como Mahón)', 1.94 * m.area, kgm.SHS]);
  acero.push([m.id, 'Angular L 80.8 de apoyo de panel (2,34 kg/m², como Mahón)', m.area, 2.34]);
}
acero.push(['Vuelo', 'Voladizo lateral 0,60 × 8,47: bordes IPE 220', 2 * 8.47, kgm.IPE220]);
acero.push(['Vuelo', 'Voladizo lateral: ménsulas IPE 160 cada 1,5 m (7 ud × 2 × 0,60)', 14 * 0.60, kgm.IPE160]);
acero.push(['General', 'Escalera metálica (zancas HEA 140 y peldaño)', 1, 450]);
acero.push(['General', 'Refuerzos, remates y pletinas de arriostramiento (5,6 kg/m², como Mahón)', mods.reduce((a, m) => a + m.area, 0), 5.59]);
const kgTot = acero.reduce((a, r) => a + r[2] * r[3], 0);
const area = mods.reduce((a, m) => a + m.area, 0);
// --- ENVOLVENTE (alturas de panel: PB 3,15; P1 3,05 + peto 0,75)
const hPB = 3.15, hP1 = 3.80;
const env = {
  pb_ext: (7.85 + 9.50 + 7.85) * hPB,           // delantera, lateral, trasera
  pb_med: 9.50 * hPB,
  p1_ext: (8.45 + 8.47 + (8.45 - 2.34) + 2 * 1.63 + 2.34) * hP1, // delantera, lateral, trasera, laterales y fondo del baño
  p1_med: 10.10 * hP1,
  huecos: 22.0,                                  // proyecto, justificación DB HE1
  sofito: 8.45 * 0.60 + 9.50 * 0.60,             // panel inferior de los vuelos
  cubierta: mods.filter(m => m.planta === 'P1').reduce((a, m) => a + m.area, 0) + 0.60 * 8.47, // + voladizo lateral
  terraza: (6.11 - 0.60) * 1.63,
  suelo_pb: 7.85 * 9.50,
  suelo_p1: mods.filter(m => m.planta === 'P1').reduce((a, m) => a + m.area, 0) + 0.60 * 8.47,
  juntas_ml: 2 * 9.50 + 2 * 8.47 + (2 * (8.45 + 10.10)),
};
env.fach_opaca = env.pb_ext + env.p1_ext - env.huecos;
env.medianera = env.pb_med + env.p1_med;
module.exports = { mods, acero, kgTot, area, env, kgm };
if (require.main === module) {
  console.table(mods.map(m => ({ id: m.id, planta: m.planta, ancho: m.ancho, largo: m.largo, area: m.area })));
  const byEl = {}; for (const r of acero) { const k = r[1].replace(/ \(.*$/, ''); byEl[k] = (byEl[k] || 0) + r[2] * r[3]; }
  console.log(Object.entries(byEl).map(([k, v]) => k + ': ' + v.toFixed(0) + ' kg').join('\n'));
  console.log('ACERO TOTAL', kgTot.toFixed(0), 'kg ·', (kgTot / 148.3).toFixed(1), 'kg/m² construido ·', (kgTot / area).toFixed(1), 'kg/m² de módulo · área módulos', area.toFixed(2));
  console.log(Object.fromEntries(Object.entries(env).map(([k, v]) => [k, +v.toFixed(2)])));
}
