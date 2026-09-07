/**
 * Genera data/panel-demo.txt (archivo de puntuación en formato PGS
 * Catalog) y los genomas sintéticos de data/. Reproducible con semilla.
 *
 * Los odds ratios por alelo son los reportados en las publicaciones de
 * descubrimiento citadas en cada línea, redondeados a dos decimales.
 * Las frecuencias alélicas son aproximadas en población europea y sólo
 * se usan para situar el puntaje dentro de una distribución de
 * referencia; no forman parte del puntaje.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', 'data');
mkdirSync(dataDir, { recursive: true });

// rsid, gen/locus, alelo de efecto, otro alelo, OR por alelo, frecuencia
// aproximada del alelo de efecto, cita de la publicación de descubrimiento.
const PANEL = [
  ['rs2981582', 'FGFR2 (10q26)', 'A', 'G', 1.26, 0.38, 'Easton et al., Nature 2007'],
  ['rs3803662', 'TOX3/TNRC9 (16q12)', 'A', 'G', 1.2, 0.26, 'Easton et al., Nature 2007'],
  ['rs889312', 'MAP3K1 (5q11)', 'C', 'A', 1.13, 0.28, 'Easton et al., Nature 2007'],
  ['rs13281615', '8q24', 'G', 'A', 1.08, 0.4, 'Easton et al., Nature 2007'],
  ['rs3817198', 'LSP1 (11p15)', 'C', 'T', 1.07, 0.3, 'Easton et al., Nature 2007'],
  ['rs13387042', '2q35', 'A', 'G', 1.2, 0.5, 'Stacey et al., Nat Genet 2007'],
  ['rs1045485', 'CASP8 D302H (2q33)', 'G', 'C', 0.88, 0.87, 'Cox et al., Nat Genet 2007'],
  ['rs10941679', '5p12', 'G', 'A', 1.19, 0.25, 'Stacey et al., Nat Genet 2008'],
  ['rs4973768', 'SLC4A7/NEK10 (3p24)', 'T', 'C', 1.11, 0.47, 'Ahmed et al., Nat Genet 2009'],
  ['rs2046210', 'ESR1 (6q25.1)', 'A', 'G', 1.29, 0.35, 'Zheng et al., Nat Genet 2009'],
  ['rs11249433', '1p11.2', 'G', 'A', 1.16, 0.39, 'Thomas et al., Nat Genet 2009'],
  ['rs614367', '11q13', 'T', 'C', 1.15, 0.15, 'Turnbull et al., Nat Genet 2010'],
  ['rs704010', 'ZMIZ1 (10q22)', 'T', 'C', 1.07, 0.38, 'Turnbull et al., Nat Genet 2010'],
  ['rs1011970', 'CDKN2A/B (9p21)', 'T', 'G', 1.09, 0.17, 'Turnbull et al., Nat Genet 2010'],
  ['rs10995190', 'ZNF365 (10q21)', 'G', 'A', 0.86, 0.85, 'Turnbull et al., Nat Genet 2010'],
];

const header = `#pgs_name=HELIX_GUARD_PANEL_DEMO_15
#trait_reported=Cancer de mama (panel demostrativo)
#genome_build=GRCh37
#variants_number=${PANEL.length}
#weight_type=beta (logaritmo natural del odds ratio por alelo)
#AVISO=Panel DEMOSTRATIVO. Los odds ratios son los reportados en las publicaciones de descubrimiento citadas en cada linea, redondeados a dos decimales. NO constituye un puntaje clinico validado. Para uso cientifico cargue el archivo oficial PGS000004 (PRS313, Mavaddat et al., Am J Hum Genet 2019) desde el PGS Catalog.
#frecuencias=Aproximadas en poblacion de ascendencia europea. Se usan solo para situar el puntaje en una distribucion de referencia, no forman parte del calculo.
rsID\teffect_allele\tother_allele\teffect_weight\todds_ratio\tallele_frequency\tgene\tsource`;

const lines = PANEL.map(([rsid, gene, ea, oa, or, freq, src]) => {
  const beta = Math.log(or).toFixed(6);
  return `${rsid}\t${ea}\t${oa}\t${beta}\t${or}\t${freq}\t${gene}\t${src}`;
});

writeFileSync(resolve(dataDir, 'panel-demo.txt'), [header, ...lines].join('\n') + '\n');

// ---------------------------------------------------------------------
// Genomas sintéticos. Se muestrea cada genotipo bajo equilibrio de
// Hardy-Weinberg con la frecuencia declarada, más un desplazamiento que
// permite fabricar tres perfiles didácticos (bajo, medio, alto).
// ---------------------------------------------------------------------
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function makeGenome({ seed, tilt, name }) {
  const rand = lcg(seed);
  const rows = [
    '# HELIX GUARD - genotipos SINTETICOS generados localmente',
    `# perfil: ${name}`,
    '# Estos datos NO provienen de ninguna persona real ni de ninguna cohorte.',
    '# Formato compatible con datos crudos de consumo: rsid, cromosoma, posicion, genotipo',
    'rsid\tchromosome\tposition\tgenotype',
  ];

  for (const [rsid, , ea, oa, , freq] of PANEL) {
    const p = Math.min(0.98, Math.max(0.02, freq + tilt));
    let copies = 0;
    if (rand() < p) copies++;
    if (rand() < p) copies++;
    const gt = ea.repeat(copies) + oa.repeat(2 - copies);
    rows.push(`${rsid}\t0\t0\t${gt.split('').sort().join('')}`);
  }
  return rows.join('\n') + '\n';
}

writeFileSync(
  resolve(dataDir, 'genoma-demo-alto.txt'),
  makeGenome({ seed: 2024, tilt: 0.3, name: 'percentil alto' })
);
writeFileSync(
  resolve(dataDir, 'genoma-demo-medio.txt'),
  makeGenome({ seed: 77, tilt: 0.0, name: 'percentil medio' })
);
writeFileSync(
  resolve(dataDir, 'genoma-demo-bajo.txt'),
  makeGenome({ seed: 501, tilt: -0.28, name: 'percentil bajo' })
);

console.log('Panel y genomas sintéticos generados en data/');
