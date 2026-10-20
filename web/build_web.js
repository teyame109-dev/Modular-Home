// Construye la web completa de la propuesta Névola a partir de la web base (portada con desmontaje)
// y de los dibujos de las diapositivas de la propuesta (../propuesta/project/slides).
// Uso: node build_web.js  ->  escribe nevola_web.html y site/index.html (para Vercel)
const fs = require('fs'), path = require('path');
const SL = path.join(__dirname, '..', 'herramientas', 'propuesta', 'project', 'slides');
const base = fs.readFileSync(path.join(__dirname, 'nevola_web_base.html'), 'utf8');
const read = id => fs.readFileSync(path.join(SL, id + '.html'), 'utf8');

// SVG de una diapositiva: ids únicos, sin tamaño fijo (lo controla el CSS)
function svgs(id) {
  return (read(id).match(/<svg[\s\S]*?<\/svg>/g) || []).map((s, i) => {
    const suf = '_' + id + i;
    return s.replace(/ id="([^"]+)"/g, (m, a) => ' id="' + a + suf + '"').replace(/url\(#([^)]+)\)/g, (m, a) => 'url(#' + a + suf + ')')
      .replace(/<svg width="\d+" height="\d+"/, '<svg role="img"');
  });
}
const sheet = (s, cap) => '<figure class="sheet">' + s + (cap ? '<figcaption class="mono">' + cap + '</figcaption>' : '') + '</figure>';

// fichas de módulo
const modIds = ['mod_m1', 'mod_m2', 'mod_m3', 'mod_m4', 'mod_m5', 'mod_m6'];
const fichas = modIds.map(id => {
  const h = read(id);
  const title = (h.match(/<h2[^>]*>([^<]+)<\/h2>/) || [])[1];
  const where = ((h.match(/Névola · Módulo · ([^<]+)</) || [])[1] || '').replace(/^./, c => c.toUpperCase());
  const rows = [...h.matchAll(/<p style="font-size:24px; line-height:1.35; color:#45474A">([^<]+)<b style="color:#141414">([^<]+)<\/b><\/p>/g)].map(m => [m[1].replace(/ · $/, '').trim(), m[2]]);
  const total = (h.match(/Total por módulo: ([^<]+)</) || [])[1];
  const desc = ((h.replace(/<svg[\s\S]*?<\/svg>/g, '').match(/<p[^>]*>([^<]*(?:Junta|vuelo|tabique|Dormitorio|Vestíbulo|Baño|Escalera)[^<]*)<\/p>/) || [])[1] || '');
  const [iso, bast] = svgs(id);
  return { id: id.slice(4).toUpperCase(), title, where, rows, total, desc, iso, bast };
});
if (fichas.some(f => !f.title || !f.rows.length || !f.total)) throw new Error('ficha incompleta: ' + JSON.stringify(fichas.map(f => [f.id, !!f.title, f.rows.length, f.total])));

const tabs = (name, items) => '<div class="tabs" data-tabs>'
  + '<div role="tablist" aria-label="' + name + '">' + items.map((it, i) => '<button role="tab" type="button" id="t-' + it.key + '" aria-controls="p-' + it.key + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + it.label + '</button>').join('') + '</div>'
  + items.map((it, i) => '<div role="tabpanel" id="p-' + it.key + '" aria-labelledby="t-' + it.key + '"' + (i ? ' hidden' : '') + '>' + it.html + '</div>').join('') + '</div>';

const fichasHTML = tabs('Fichas de módulo', fichas.map(f => ({ key: f.id.toLowerCase(), label: f.id, html:
  '<div class="ficha"><div class="ficha-head"><p class="mono">' + f.where + '</p><h3>' + f.title + '</h3><p>' + f.desc + '</p></div>'
  + '<div class="ficha-draw">' + sheet(f.iso, 'Esqueleto: marcos, pilares y correas') + sheet(f.bast, 'Bastidor de suelo · cotas en m') + '</div>'
  + '<div class="tscroll"><table class="steel"><thead><tr><th>Elemento de acero</th><th class="n">Peso</th></tr></thead><tbody>'
  + f.rows.map(r => '<tr><td>' + r[0] + '</td><td class="n">' + r[1] + '</td></tr>').join('')
  + '<tr class="tot"><td>Total del módulo</td><td class="n">' + f.total + '</td></tr></tbody></table></div></div>' })));

const [plPB, plP1] = svgs('plantas');
const [vol1, vol2] = svgs('volumen');
const alzPB = svgs('alz_pb'), alzP1 = svgs('alz_p1');
const [tabPB] = svgs('tab_pb'), [tabP1] = svgs('tab_p1');
const notes = arr => '<div class="ruled g' + arr.length + ' notes">' + arr.map(([h, p]) => '<div><h3>' + h + '</h3><p>' + p + '</p></div>').join('') + '</div>';

const alzHTML = tabs('Alzados', [
  { key: 'alz-pb', label: 'Planta baja', html: '<div class="stack">' + alzPB.map((s, i) => sheet(s, 'M' + (i + 1) + ' · cara larga y testero')).join('') + '</div>' },
  { key: 'alz-p1', label: 'Planta primera', html: '<div class="stack">' + alzP1.map((s, i) => sheet(s, 'M' + (i + 4) + ' · cara larga y testero')).join('') + '</div>' }]);
const tabHTML = tabs('Plantas de módulo con tabiques', [
  { key: 'tab-pb', label: 'Planta baja', html: '<div class="split">' + sheet(tabPB, 'M1, M2 y M3 con la tabiquería del proyecto') + notes([['Junta a 3,20 m', 'Cruza el dormitorio 1 a 0,30 m de su tabique y se oculta en suelo y techo, como en el salón. El dormitorio queda como en el proyecto: 3,10 m de ancho y 9,55 m².'], ['Junta a 5,50 m', 'Sobre los tabiques del baño 1 y del lavadero, sin cambios en el proyecto.'], ['Salón', 'Los 7,43 m libres del salón quedan repartidos entre los tres módulos; ahí las juntas se ocultan con el suelo y el falso techo.']]).replace('g3 notes', 'g1 notes') + '</div>' },
  { key: 'tab-p1', label: 'Planta primera', html: '<div class="split">' + sheet(tabP1, 'M4, M5 y M6 con la tabiquería del proyecto') + notes([['Junta a 3,80 m', 'Sobre el tabique entre los dormitorios 2 y 3, sin cambios en el proyecto.'], ['Junta a 6,10 m', 'Sobre el tabique del baño principal, que queda entero en el M6.'], ['Vuelo lateral', 'Va dentro del M4, que mide 3,80 m: un módulo entero, sin pieza que atornillar en parcela.'], ['Sin alinear', 'La junta a 3,80 cruza el dormitorio principal en su parte trasera.']]).replace('g4 notes', 'g1 notes') + '</div>' }]);

const bars = [['Envolvente: fachadas, cubierta, suelos', 66500, 29], ['Instalaciones y climatización', 42100, 19], ['Estructura de acero', 37800, 17], ['Fabricación, transporte y montaje', 33800, 15], ['Tabiquería, techos, solados y pintura', 27300, 12], ['Carpinterías exterior e interior', 17900, 8]];
const fmt = n => n.toLocaleString('es-ES').replace(/\s/g, '.');

// ---------- secciones nuevas ----------
const S = {};
S.propuesta = `<section class="block" id="propuesta">
    <div class="wrap">
      <div class="head"><p class="mono">La propuesta</p><h2>El proyecto de ejecución de Névola, fabricado en taller y montado en parcela</h2></div>
      <div class="ruled g3">
        <div><span class="k">Qué</span><h3>Piloto + serie de 16</h3><p>La pareada tipo como vivienda piloto y, después, las 14 pareadas y 2 aisladas del proyecto. Vivienda terminada, con transporte y montaje.</p></div>
        <div><span class="k">Cómo</span><h3>Seis módulos de acero</h3><p>Misma distribución, mismas cotas y 148,30 m² construidos. Envolvente de panel sándwich con U = 0,20, como exige el proyecto.</p></div>
        <div class="dark"><span class="k">Cuánto</span><h3>Piloto: 225.400 €</h3><p>Con la memoria de calidades del proyecto. Con las optimizaciones propuestas, 209.800 €. En serie, desde 193.500 € por vivienda. Sin IVA.</p></div>
      </div>
      <h3 class="sub">Por qué industrializar</h3>
      <div class="ruled g2">
        <div><h3>Calidad controlada</h3><p>Cada módulo se fabrica y se revisa a cubierto, con un equipo fijo por oficio.</p></div>
        <div><h3>Fábrica y parcela a la vez</h3><p>Mientras el promotor ejecuta la cimentación, las viviendas avanzan en taller.</p></div>
        <div><h3>Precio cerrado por vivienda</h3><p>Presupuesto por partidas sobre las mediciones del propio proyecto de ejecución.</p></div>
        <div><h3>Eficiencia energética</h3><p>Envolvente continua con U = 0,20, aerotermia y suelo radiante: la calificación A+ del proyecto.</p></div>
      </div>
    </div>
  </section>`;
S.proyecto = `<section class="block" id="proyecto">
    <div class="wrap">
      <div class="head"><p class="mono">Del proyecto al módulo</p><h2>Mismo proyecto, otro sistema constructivo</h2></div>
      <div class="tscroll"><table>
        <thead><tr><th>Elemento</th><th>Proyecto de ejecución</th><th>Propuesta RG21</th></tr></thead>
        <tbody>
          <tr><td><b>Estructura</b></td><td>Pilares, forjados unidireccionales y losa de escalera de hormigón</td><td>Seis módulos de acero S275JR: marcos IPE 200, pilares IPE 160, correas HEA 100 y SHS</td></tr>
          <tr><td><b>Fachada</b></td><td>Ladrillo, XPS 100 mm, trasdosado W625, monocapa y aplacado</td><td>Panel sándwich 66 mm + PET 40 mm + trasdosado W625 + acabado exterior. U = 0,20</td></tr>
          <tr><td><b>Cubierta</b></td><td>Forjado y cubierta plana de grava con terraza solada</td><td>Panel 81 mm con el mismo sistema de pendientes, impermeabilización, grava y gres</td></tr>
          <tr><td><b>Suelos</b></td><td>Solera ventilada Cáviti y forjado de planta primera</td><td>Panel 136 mm en planta baja y panel 81 mm en planta primera</td></tr>
          <tr><td><b>Interiores</b></td><td>Instalaciones, carpinterías y acabados del proyecto</td><td>Los mismos, con sus mediciones, montados en fábrica</td></tr>
          <tr><td><b>Cimentación</b></td><td>Zapatas y vigas de atado</td><td>La ejecuta el promotor, con placas de anclaje en tres ejes</td></tr>
        </tbody></table></div>
      <h3 class="sub">Tres módulos por planta, sin tocar la distribución</h3>
      <div class="pair">${sheet(plPB, 'Planta baja · M1 M2 M3')}${sheet(plP1, 'Planta primera · M4 M5 M6')}</div>
      <p class="note">Planta baja: 7,85 × 9,50 m en módulos de 3,20, 2,30 y 2,35 m de ancho, con la junta de 3,20 m oculta dentro del dormitorio 1 y la de 5,50 m sobre tabiques. Planta primera: las mismas juntas que abajo, vuelo frontal de 0,60 m en los tres módulos y el vuelo lateral dentro del M4, de 3,80 m. Terraza de 9 m² sobre la cubierta de planta baja. Cuadrados negros: pilares IPE 160. Línea roja: medianera.</p>
      <h3 class="sub">Seis módulos apilados sobre la cimentación</h3>
      <div class="pair">${sheet(vol1, 'La vivienda montada')}${sheet(vol2, 'Despiece de los seis módulos')}</div>
      <p class="note">Cotas del proyecto: suelo de planta baja +0,20, de planta primera +3,35, cubierta +6,40. Los módulos de arriba apoyan sobre los marcos de abajo en los ejes 0,60 · 6,10 · 10,10 m, donde el promotor deja zapatas y placas de anclaje.</p>
    </div>
  </section>`;
S.fichas = `<h3 class="sub" id="fichas">Ficha de cada módulo</h3>
      ${fichasHTML}
      <h3 class="sub">Alzados con cotas</h3>
      <p class="note" style="margin-bottom:16px">Negro: marcos IPE 200 (canto 0,20). Gris: pilares IPE 160, 2,65 m libres. Discontinuo: arriostramiento en testeros. Los módulos de cada planta comparten largo, altura y ejes de pilares; solo cambia el ancho.</p>
      ${alzHTML}
      <h3 class="sub">Plantas de módulo con tabiques</h3>
      ${tabHTML}`;
S.optim = `<h3 class="sub" id="optimizaciones">Optimizaciones propuestas: hasta 15.600 € menos por vivienda</h3>
      <div class="ruled g3">
        <div class="dark"><span class="k">Sistema modular</span><b class="amt">5.700 €</b><h3>Sin cambios para el comprador</h3><p>Falso techo atornillado al módulo, vuelos y aplacado sin duplicar, toma de tierra por la estructura, recercados de taller.</p></div>
        <div><span class="k">Marca equivalente</span><b class="amt">6.600 €</b><h3>Misma gama, «o similar»</h3><p>Aerotermia de 8 kW (Panasonic o LG), suelo radiante estándar, laminado AC5 nacional, pintura profesional, PVC Veka o Rehau.</p></div>
        <div><span class="k">Alcance</span><b class="amt">1.900 €</b><h3>Según la memoria comercial</h3><p>Placa sencilla en tabiques entre estancias y preinstalación de recarga en lugar del punto completo.</p></div>
      </div>
      <p class="note">Ahorro de coste por vivienda: 14.200 €; en precio, 15.600 €. Cada optimización se aplica solo con la conformidad del promotor y de la dirección facultativa.</p>`;
S.desglose = `<h3 class="sub">En qué se invierte la vivienda piloto</h3>
      <div class="bars">${bars.map(([l, v, p], i) => `<div class="bar"><span class="bl">${l}</span><span class="bt"><i style="width:${(v / bars[0][1] * 100).toFixed(1)}%"${i === 3 ? ' class="hi"' : ''}></i></span><span class="bv">${fmt(v)} € · ${p} %</span></div>`).join('')}
        <div class="bar total"><span class="bl">Total vivienda piloto</span><span></span><span class="bv">225.400 € · 1.520 €/m²</span></div></div>`;
S.cond = `<h3 class="sub">Condiciones de la oferta</h3>
      <div class="ruled g3 cond">
        <div><span class="k">1 · Base</span><p>Proyecto de ejecución de julio de 2026: mediciones, planos y memoria de calidades.</p></div>
        <div><span class="k">2 · Precio definitivo</span><p>Se cierra con el cálculo de la estructura modular y las ofertas de proveedor de la vivienda piloto.</p></div>
        <div><span class="k">3 · Piloto y serie</span><p>El precio del piloto se aplica con la adjudicación de la serie. Como unidad independiente, 273.600 €.</p></div>
        <div><span class="k">4 · Validación técnica</span><p>Conformidad de la dirección facultativa, el OCT y la aseguradora del decenal. RG21 aporta la documentación del sistema.</p></div>
        <div><span class="k">5 · Forma de pago</span><p class="tbd">Por definir</p></div>
        <div><span class="k">6 · Validez</span><p class="tbd">Por definir. Importes sin IVA.</p></div>
      </div>
      <h3 class="sub">Cómo empezamos</h3>
      <div class="ruled g4">
        <div class="step"><span class="n">01</span><h3>Revisión técnica</h3><p>Dirección facultativa, OCT y aseguradora validan el sistema modular.</p></div>
        <div class="step"><span class="n">02</span><h3>Proyecto de fabricación</h3><p>Cálculo de los módulos, optimizaciones elegidas y precio cerrado del piloto.</p></div>
        <div class="step"><span class="n">03</span><h3>Vivienda piloto</h3><p>Fabricación en taller y montaje sobre la cimentación del promotor.</p></div>
        <div class="step"><span class="n">04</span><h3>Serie de 16</h3><p>Producción en cadena del resto de la promoción, a precio de serie.</p></div>
      </div>`;

const CSS = `
/* ---------- piezas añadidas para la propuesta completa ---------- */
.g1 { grid-template-columns: minmax(0, 1fr) } .g3 { grid-template-columns: repeat(3, minmax(0, 1fr)) }
@media (max-width: 860px) { .g3 { grid-template-columns: minmax(0, 1fr) } }
.ruled .k { font-family: var(--mono); font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--minio) }
.ruled .dark { background: var(--ink); color: var(--paper) } .ruled .dark p { color: color-mix(in srgb, var(--paper) 72%, var(--ink)) }
.ruled .amt { font-family: var(--figure); font-size: 52px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums }
.sub { font-size: clamp(22px, 2.4vw, 30px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin: 56px 0 18px; scroll-margin-top: 90px }
.note { color: var(--soft); font-size: 15.5px; max-width: 80ch; margin-top: 14px }
.offer .note, .offer .sub { color: inherit } .offer .note { color: color-mix(in srgb, var(--paper) 70%, var(--ink)) }
.sheet { margin: 0; background: #E7E8E3; border: 2px solid var(--ink); padding: 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0 }
.sheet svg { display: block; width: 100%; height: auto }
.sheet figcaption { color: #4F5256; font-size: 11.5px }
.pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px }
.stack { display: flex; flex-direction: column; gap: 16px }
@media (max-width: 760px) { .pair { grid-template-columns: minmax(0, 1fr) } }
.tabs [role="tablist"] { display: flex; flex-wrap: wrap; border: 2px solid var(--ink); width: fit-content; max-width: 100%; margin-bottom: 18px }
.tabs [role="tab"] { font-family: var(--mono); font-size: 13px; letter-spacing: .06em; text-transform: uppercase; background: transparent; color: var(--ink); border: 0; border-right: 1px solid var(--rule); padding: 11px 18px; cursor: pointer; user-select: none; transition: background-color 150ms ease, color 150ms ease, transform 160ms var(--ease-out) }
.tabs [role="tab"]:last-child { border-right: 0 }
.tabs [role="tab"][aria-selected="true"] { background: var(--ink); color: var(--paper) }
.tabs [role="tab"]:active { transform: scale(0.97) }
@media (hover: hover) and (pointer: fine) { .tabs [role="tab"]:not([aria-selected="true"]):hover { background: var(--panel) } }
.ficha { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; align-items: start }
.ficha-head { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 6px }
.ficha-head .mono { color: var(--minio) }
.ficha-head h3 { font-family: var(--figure); font-size: clamp(30px, 3.6vw, 44px); font-weight: 700; line-height: 1 }
.ficha-head p:last-child { color: var(--soft) }
.ficha-draw { display: flex; flex-direction: column; gap: 16px }
table.steel { min-width: 0 }
tr.tot td { font-weight: 800; border-top: 2px solid var(--ink) } tr.tot td.n { color: var(--minio) }
@media (max-width: 860px) { .ficha { grid-template-columns: minmax(0, 1fr) } }
.bars { display: flex; flex-direction: column; border: 2px solid color-mix(in srgb, var(--paper) 40%, var(--ink)) }
.bar { display: grid; grid-template-columns: minmax(0, 15rem) minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 12px 16px; border-bottom: 1px solid color-mix(in srgb, var(--paper) 22%, var(--ink)) }
.bar .bl { font-size: 15px } .bar .bt { height: 14px; position: relative } .bar .bt i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--paper) } .bar .bt i.hi { background: var(--minio) }
.bar .bv { font-family: var(--mono); font-size: 14px; white-space: nowrap; font-variant-numeric: tabular-nums }
.bar.total { border-bottom: 0; border-top: 2px solid var(--paper); font-weight: 800 } .bar.total .bl, .bar.total .bv { font-weight: 700 }
@media (max-width: 640px) { .bar { grid-template-columns: minmax(0, 1fr) auto; } .bar .bt { grid-column: 1 / -1; grid-row: 2 } }
@media (max-width: 560px) { .tabs [role="tab"] { padding: 10px 11px; font-size: 12px } }
.cond .tbd { color: var(--minio); font-weight: 700 }
.offer .ruled { background: var(--paper); border-color: var(--paper) } .offer .ruled > div { background: var(--ink) } .offer .ruled p { color: color-mix(in srgb, var(--paper) 72%, var(--ink)) } .offer .step .n { color: var(--minio) }
`;

let h = base;
const rep = (a, b) => { if (!h.includes(a)) throw new Error('falta marca: ' + a.slice(0, 60)); h = h.replace(a, b); };
rep('</style>', CSS + '</style>');
// menú: siete entradas
const LINKS = [['propuesta', 'Propuesta'], ['proyecto', 'Proyecto'], ['modulos', 'Módulos'], ['fabricacion', 'Fabricación'], ['sistema', 'Sistema'], ['calidades', 'Calidades'], ['oferta', 'Oferta']];
h = h.replace(/<ul class="links">[\s\S]*?<\/ul>/, '<ul class="links">' + LINKS.slice(0, 6).map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('') + '<li><a href="/cimentacion/">Cimentación</a></li></ul>');
h = h.replace(/<div class="panel" id="menuPanel" hidden>[\s\S]*?<\/div>/, '<div class="panel" id="menuPanel" hidden>' + LINKS.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('') + '<a href="/cimentacion/">Cimentación</a></div>');
h = h.replace("['piloto', 'porque', 'modulos', 'fabricacion', 'sistema', 'calidades', 'oferta']", "['piloto', 'propuesta', 'proyecto', 'modulos', 'fabricacion', 'sistema', 'calidades', 'oferta']");
// la sección «porque» de la base pasa a ser «propuesta» + proyecto
h = h.replace(/<section class="block" id="porque">[\s\S]*?<\/section>/, S.propuesta + '\n\n  ' + S.proyecto);
// módulos: tabla resumen + fichas, alzados y tabiques
rep('</table>\n      </div>\n    </div>\n  </section>\n\n  <section class="block" id="fabricacion">', '</table>\n      </div>\n      ' + S.fichas + '\n    </div>\n  </section>\n\n  <section class="block" id="fabricacion">');
// calidades: optimizaciones
rep('</ul>\n    </div>\n  </section>\n\n  <section class="block offer" id="oferta">', '</ul>\n      ' + S.optim + '\n    </div>\n  </section>\n\n  <section class="block offer" id="oferta">');
// oferta: desglose tras los precios, condiciones y pasos al final
rep('<div class="serie">', S.desglose + '\n      <div class="serie">');
h = h.replace(/(<div class="split incl">[\s\S]*?<\/div>\n      <\/div>)\n    <\/div>\n  <\/section>/, '$1\n      ' + S.cond + '\n    </div>\n  </section>');
// pestañas: teclado y ratón; el cambio de pestaña es instantáneo (se usa a menudo)
rep('  render(0);\n})();', `  render(0);

  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function sel(t) { tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) { var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return; e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; sel(n); n.focus(); });
    });
  });
})();`);
if (h.includes('id="porque"')) throw new Error('queda porque');
fs.writeFileSync(path.join(__dirname, 'nevola_web.html'), h);
// versión para Vercel: documento completo
fs.mkdirSync(path.join(__dirname, 'site'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'site', 'index.html'), '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n' + h.replace(/<\/style>/, '</style>\n</head>\n<body>') + '\n</body>\n</html>\n');
console.log('ok', (h.length / 1024).toFixed(0) + ' KB', fichas.map(f => f.id + ':' + f.rows.length + ' filas ' + f.total).join(' | '));
