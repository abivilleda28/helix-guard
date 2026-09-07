/**
 * HELIX GUARD — motor de puntaje poligénico (PRS)
 * ------------------------------------------------------------------
 * Todo el cálculo ocurre en el dispositivo de la persona. Este módulo
 * no realiza ninguna petición de red: recibe texto y devuelve números.
 *
 * Formatos de entrada soportados
 *   1. Archivo de puntuación en formato PGS Catalog (columnas con
 *      encabezado: rsID / effect_allele / other_allele / effect_weight).
 *      Referencia: Lambert et al., Nat Genet 2021 (PGS Catalog).
 *   2. Genotipos "raw data" estilo consumo (rsid, chromosome, position,
 *      genotype) y VCF simplificado.
 *
 * El puntaje es la suma ponderada estándar de dosis alélicas:
 *      PRS = Σ  β_i · dosis_i
 * donde dosis_i ∈ {0,1,2} cuenta copias del alelo de efecto.
 * Es la definición usada por Mavaddat et al., Am J Hum Genet 2019 (PRS313).
 */

const COMPLEMENT = { A: 'T', T: 'A', C: 'G', G: 'C' };

/** Invierte la hebra de un alelo (A<->T, C<->G). */
export function flipStrand(allele) {
  return allele
    .split('')
    .map((b) => COMPLEMENT[b] || b)
    .join('');
}

/** Parte una fila eligiendo el delimitador presente, en este orden. */
export function splitRow(line) {
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  if (line.includes(',')) return line.split(',').map((c) => c.trim());
  return line.split(/\s+/).filter(Boolean);
}

/**
 * Lee un archivo de puntuación en formato PGS Catalog.
 * Las líneas que empiezan con '#' son metadatos y se conservan.
 */
export function parseScoringFile(text) {
  const meta = {};
  const rows = [];
  let header = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#')) {
      const m = line.slice(1).match(/^\s*([\w.]+)\s*=\s*(.+)$/);
      if (m) meta[m[1]] = m[2].trim();
      continue;
    }

    // El delimitador se decide por línea: si hay tabuladores, sólo se
    // parte por tabulador. Si no, por coma. Así un campo como
    // "Easton et al., Nature 2007" no se rompe por su coma interna.
    const cells = splitRow(line);
    if (!header) {
      header = cells.map((c) => c.toLowerCase());
      continue;
    }

    const rec = {};
    header.forEach((key, i) => (rec[key] = cells[i]));

    const rsid = rec.rsid || rec.rsids || rec.variant_id || rec.id;
    const weight = Number(rec.effect_weight ?? rec.beta ?? rec.weight);
    if (!rsid || !Number.isFinite(weight)) continue;

    rows.push({
      rsid: rsid.toLowerCase(),
      effect: (rec.effect_allele || rec.ea || '').toUpperCase(),
      other: (rec.other_allele || rec.oa || rec.reference_allele || '').toUpperCase(),
      weight,
      gene: rec.gene || rec.locus_name || '',
      source: rec.source || rec.citation || '',
    });
  }

  return { meta, variants: rows };
}

/**
 * Lee genotipos. Acepta el formato tabular de datos crudos de consumo
 * (rsid  chr  pos  genotipo) y un VCF simplificado con columna GT.
 */
export function parseGenotypes(text) {
  const calls = new Map();
  let skipped = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('rsid')) continue;

    const cells = line.split(/\t|,|\s+/).filter(Boolean);
    if (cells.length < 2) continue;

    const rsid = cells[0].toLowerCase();
    if (!rsid.startsWith('rs')) {
      skipped++;
      continue;
    }

    // El genotipo es la última columna con dos letras de A/C/G/T (o '--').
    let gt = null;
    for (let i = cells.length - 1; i >= 1; i--) {
      const c = cells[i].toUpperCase().replace(/[|/]/g, '');
      if (/^[ACGT]{2}$/.test(c)) {
        gt = c;
        break;
      }
    }
    if (!gt) {
      skipped++;
      continue;
    }
    calls.set(rsid, gt);
  }

  return { calls, skipped };
}

/**
 * Calcula la dosis del alelo de efecto para un genotipo dado.
 * Devuelve null si el genotipo no es compatible con el par de alelos
 * declarado, ni siquiera tras invertir la hebra.
 */
export function dosage(genotype, effect, other) {
  const gt = genotype.toUpperCase();
  const direct = (gt.match(new RegExp(effect, 'g')) || []).length;
  const alleles = new Set(gt.split(''));
  const declared = new Set([effect, other].filter(Boolean));

  const compatible = [...alleles].every((a) => declared.has(a));
  if (compatible) return direct;

  // Intento de corrección de hebra.
  const fEffect = flipStrand(effect);
  const fOther = flipStrand(other || '');
  const flipped = new Set([fEffect, fOther].filter(Boolean));
  if ([...alleles].every((a) => flipped.has(a))) {
    return (gt.match(new RegExp(fEffect, 'g')) || []).length;
  }

  return null;
}

/**
 * Suma ponderada de dosis. Devuelve el puntaje bruto y la traza por
 * variante, que alimenta la explicación mostrada a la persona.
 */
export function computePRS(variants, calls) {
  let score = 0;
  let matched = 0;
  const trace = [];
  const missing = [];

  for (const v of variants) {
    const gt = calls.get(v.rsid);
    if (!gt) {
      missing.push(v.rsid);
      continue;
    }
    const d = dosage(gt, v.effect, v.other);
    if (d === null) {
      missing.push(v.rsid);
      continue;
    }
    const contribution = v.weight * d;
    score += contribution;
    matched++;
    trace.push({ ...v, genotype: gt, dosage: d, contribution });
  }

  trace.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  return { score, matched, total: variants.length, missing, trace };
}

/**
 * Media y desviación estándar teóricas del puntaje en una población con
 * frecuencias alélicas conocidas, asumiendo equilibrio de Hardy-Weinberg
 * e independencia entre loci:
 *      E[PRS]   = Σ 2·β_i·f_i
 *      Var[PRS] = Σ 2·β_i²·f_i·(1-f_i)
 * Sirve para situar el puntaje individual dentro de la distribución
 * poblacional sin necesidad de una cohorte de referencia centralizada.
 */
export function referenceDistribution(variants, frequencies) {
  let mean = 0;
  let variance = 0;
  for (const v of variants) {
    const f = frequencies?.[v.rsid] ?? v.freq;
    if (!Number.isFinite(f)) continue;
    mean += 2 * v.weight * f;
    variance += 2 * v.weight * v.weight * f * (1 - f);
  }
  return { mean, sd: Math.sqrt(variance) };
}

/** Función de distribución normal acumulada (Abramowitz & Stegun 26.2.17). */
export function normalCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/**
 * Traduce el puntaje bruto a una posición poblacional.
 * `orPerSd` es el odds ratio por desviación estándar reportado para el
 * puntaje que se esté usando (1.61 para PRS313 en ascendencia europea,
 * Mavaddat et al. 2019). El riesgo relativo se expresa frente a la media
 * poblacional, no frente a un valor absoluto: HELIX GUARD no emite
 * riesgos absolutos a lo largo de la vida sin un modelo clínico
 * (Tyrer-Cuzick, BOADICEA) y datos de historia familiar.
 */
export function interpret(score, ref, orPerSd) {
  const z = ref.sd > 0 ? (score - ref.mean) / ref.sd : 0;
  const percentile = normalCdf(z) * 100;
  const relativeRisk = Math.pow(orPerSd, z);
  return { z, percentile, relativeRisk };
}
