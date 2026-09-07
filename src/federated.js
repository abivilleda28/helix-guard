/**
 * HELIX GUARD — aprendizaje federado con privacidad diferencial
 * ------------------------------------------------------------------
 * Regresión logística entrenada con FedAvg (McMahan et al., AISTATS
 * 2017). Cada nodo (hospital, laboratorio, teléfono) entrena sobre sus
 * propios datos y envía únicamente el vector de pesos, recortado y con
 * ruido gaussiano. El genoma nunca se mueve.
 *
 * Evidencia de que el enfoque no sacrifica desempeño:
 *   · Sheller et al., Sci Rep 2020 — modelo federado sobre 10
 *     instituciones alcanza el 99 % del desempeño del modelo
 *     centralizado en segmentación de tumor cerebral.
 *   · Adnan et al., Sci Rep 2022 — FedAvg con privacidad diferencial
 *     sobre TCGA, desempeño comparable al centralizado.
 */

/** Generador congruencial lineal con semilla, para demos reproducibles. */
export function seededRandom(seed = 42) {
  let s = seed >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Muestra de una normal estándar por el método de Box-Muller. */
export function gaussian(rand) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

export function predict(weights, x) {
  let z = weights[0];
  for (let i = 0; i < x.length; i++) z += weights[i + 1] * x[i];
  return sigmoid(z);
}

/**
 * Entrenamiento local: descenso de gradiente por lotes completos sobre
 * la verosimilitud logística.
 */
/**
 * Entrenamiento local: descenso de gradiente por lotes completos sobre
 * la verosimilitud logística, con recorte del gradiente de cada ejemplo.
 *
 * El recorte por ejemplo es lo que hace que la garantía de privacidad
 * sea a nivel de registro y no sólo a nivel de nodo: si el gradiente de
 * una persona nunca puede tener norma mayor que `perExampleClip`, quitar
 * o cambiar a esa persona mueve la actualización final como mucho
 *      Δ = epochs · lr · perExampleClip / n
 * y esa cota es la que alimenta la contabilidad de privacidad.
 * Es la idea de Abadi et al., CCS 2016 (DP-SGD).
 */
export function trainLocal(weights, data, { epochs = 12, lr = 0.35, perExampleClip = Infinity } = {}) {
  const w = weights.slice();
  const n = data.length;
  if (n === 0) return w;

  for (let e = 0; e < epochs; e++) {
    const grad = new Array(w.length).fill(0);
    for (const { x, y } of data) {
      const err = predict(w, x) - y;
      const gi = [err, ...x.map((xi) => err * xi)];
      const norm = l2(gi);
      const factor = norm > perExampleClip ? perExampleClip / norm : 1;
      for (let i = 0; i < w.length; i++) grad[i] += gi[i] * factor;
    }
    for (let i = 0; i < w.length; i++) w[i] -= (lr * grad[i]) / n;
  }
  return w;
}

/** Sensibilidad de la actualización local ante el cambio de un registro. */
export function updateSensitivity({ epochs, lr, perExampleClip, n }) {
  return (epochs * lr * perExampleClip) / n;
}

/** Norma euclidiana de la actualización, para el recorte. */
export function l2(vector) {
  return Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0));
}

/**
 * Recorta la actualización a norma ≤ clip y le añade ruido gaussiano.
 * El recorte acota la sensibilidad; el ruido produce la garantía.
 */
export function privatize(update, { clip = 1.0, noiseMultiplier = 0.6, rand }) {
  const norm = l2(update);
  const scale = norm > clip ? clip / norm : 1;
  const sigma = noiseMultiplier * clip;
  return update.map((v) => v * scale + gaussian(rand) * sigma);
}

/**
 * Contabilidad de privacidad, versión básica y explícitamente
 * conservadora. Para el mecanismo gaussiano con sensibilidad Δ y
 * desviación σ, se cumple (ε, δ)-DP con
 *      ε = (Δ/σ)·√(2·ln(1.25/δ))     válido para ε ≤ 1
 * (Dwork & Roth, 2014, teorema A.1). Componemos secuencialmente sobre
 * las rondas, que es la cota más pesimista.
 *
 * `sensitivity` es Δ a nivel de registro: cuánto puede mover la
 * actualización el dato de una sola persona, acotado por el recorte por
 * ejemplo. `sigma` es la desviación absoluta del ruido añadido.
 *
 * En producción se sustituye por contabilidad de Rényi o por el
 * accountant de momentos (Abadi et al., CCS 2016), que da un ε bastante
 * menor para el mismo ruido. Se declara aquí para no sobrevender.
 */
export function privacyBudget({ rounds, sensitivity, sigma, delta = 1e-5 }) {
  const epsPerRound = (sensitivity / sigma) * Math.sqrt(2 * Math.log(1.25 / delta));
  const total = epsPerRound * rounds;
  return {
    epsilonPerRound: epsPerRound,
    epsilonTotal: total,
    delta,
    sensitivity,
    sigma,
    band: total <= 1 ? 'fuerte' : total <= 8 ? 'razonable' : 'débil',
    method: 'Mecanismo gaussiano a nivel de registro + composición secuencial (cota conservadora)',
  };
}

/**
 * Promediado federado ponderado por tamaño de muestra.
 * Sólo recibe vectores de pesos: nunca ejemplos.
 */
export function federatedAverage(updates) {
  const totalN = updates.reduce((acc, u) => acc + u.n, 0);
  const dim = updates[0].weights.length;
  const avg = new Array(dim).fill(0);
  for (const u of updates) {
    const share = u.n / totalN;
    for (let i = 0; i < dim; i++) avg[i] += u.weights[i] * share;
  }
  return avg;
}

/** Exactitud y AUC sobre un conjunto de prueba. */
export function evaluate(weights, data) {
  let correct = 0;
  const scores = [];
  for (const { x, y } of data) {
    const p = predict(weights, x);
    if ((p >= 0.5 ? 1 : 0) === y) correct++;
    scores.push({ p, y });
  }

  scores.sort((a, b) => a.p - b.p);
  const pos = scores.filter((s) => s.y === 1).length;
  const neg = scores.length - pos;
  let rankSum = 0;
  scores.forEach((s, i) => {
    if (s.y === 1) rankSum += i + 1;
  });
  const auc = pos && neg ? (rankSum - (pos * (pos + 1)) / 2) / (pos * neg) : 0.5;

  return { accuracy: correct / data.length, auc };
}

/**
 * Ejecuta una ronda completa de entrenamiento federado.
 * Devuelve el modelo global y la traza de lo que cada nodo transmitió,
 * que es lo que la interfaz muestra en el registro de custodia.
 */
export function federatedRound(globalWeights, nodes, options) {
  const updates = [];
  const transmissions = [];
  const sigma = options.noiseMultiplier * options.clip;

  for (const node of nodes) {
    const local = trainLocal(globalWeights, node.data, options);
    const delta = local.map((v, i) => v - globalWeights[i]);
    const noisy = privatize(delta, options);
    const shared = noisy.map((v, i) => globalWeights[i] + v);

    updates.push({ weights: shared, n: node.data.length });
    transmissions.push({
      node: node.name,
      samples: node.data.length,
      bytes: shared.length * 8,
      norm: l2(delta),
      clipped: l2(delta) > options.clip,
      sensitivity: updateSensitivity({
        epochs: options.epochs,
        lr: options.lr,
        perExampleClip: options.perExampleClip,
        n: node.data.length,
      }),
    });
  }

  const worstSensitivity = Math.max(...transmissions.map((t) => t.sensitivity));
  return { weights: federatedAverage(updates), transmissions, sigma, sensitivity: worstSensitivity };
}

/**
 * Cohorte sintética generada localmente con semilla fija.
 * Reproduce la estructura de un clasificador multigénico de estado de
 * receptor de estrógeno a partir de expresión génica, siguiendo la
 * lógica de los predictores de muestra única validados en SCAN-B
 * (Staaf et al., npj Breast Cancer 2022; Brueffer et al., JCO PO 2018).
 * Los datos NO son de SCAN-B: son simulados, y así se etiqueta en la
 * interfaz. Sirven para demostrar el protocolo, no la biología.
 */
export const FEATURES = ['ESR1', 'PGR', 'ERBB2', 'MKI67', 'FOXA1', 'GATA3'];

export function syntheticCohort({ n = 240, seed = 7, shift = 0 }) {
  const rand = seededRandom(seed);
  const data = [];
  // Coeficientes latentes: ESR1, PGR, FOXA1 y GATA3 empujan hacia RE+;
  // MKI67 y ERBB2 hacia RE-. Es la dirección biológica conocida.
  const truth = [0.15, 1.9, 1.15, -0.7, -0.95, 1.0, 0.85];

  for (let i = 0; i < n; i++) {
    const x = FEATURES.map(() => gaussian(rand) + shift);
    const p = predict(truth, x);
    const y = rand() < p ? 1 : 0;
    data.push({ x, y });
  }
  return data;
}
