/**
 * Pruebas de HELIX GUARD. Ejecutar con:  node tests/test.mjs
 * Sin dependencias externas: sólo el runtime de Node ≥ 18.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseScoringFile,
  parseGenotypes,
  dosage,
  computePRS,
  referenceDistribution,
  interpret,
  normalCdf,
} from '../src/prs.js';
import {
  generateKeys,
  encrypt,
  decrypt,
  addEncrypted,
  multiplyByScalar,
  encode,
  decode,
} from '../src/paillier.js';
import { sealVault, openVault, fingerprint } from '../src/vault.js';
import {
  syntheticCohort,
  federatedRound,
  trainLocal,
  evaluate,
  privacyBudget,
  seededRandom,
} from '../src/federated.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ok   ${name}${detail ? '  — ' + detail : ''}`);
  } else {
    failed++;
    console.log(`  FALLA ${name}${detail ? '  — ' + detail : ''}`);
  }
}

const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;

console.log('\nPRS');
const panel = parseScoringFile(readFileSync(resolve(root, 'data/panel-demo.txt'), 'utf8'));
check('el panel carga 15 variantes', panel.variants.length === 15, `${panel.variants.length}`);
check('los metadatos conservan el aviso', Boolean(panel.meta.AVISO));

check('dosis homocigota del alelo de efecto = 2', dosage('AA', 'A', 'G') === 2);
check('dosis heterocigota = 1', dosage('AG', 'A', 'G') === 1);
check('dosis nula = 0', dosage('GG', 'A', 'G') === 0);
check('corrige la hebra invertida', dosage('TT', 'A', 'G') === 2, 'TT frente a A/G → complemento');
check('CC es la hebra complementaria de GG en una variante A/G', dosage('CC', 'A', 'G') === 0);
check('rechaza genotipos incompatibles con ambas hebras', dosage('AC', 'A', 'G') === null);

const geno = parseGenotypes(readFileSync(resolve(root, 'data/genoma-demo-medio.txt'), 'utf8'));
const prs = computePRS(panel.variants, geno.calls);
check('todas las variantes del panel encuentran genotipo', prs.matched === 15, `${prs.matched}/15`);

// Verificación independiente de la suma ponderada.
let manual = 0;
for (const v of panel.variants) manual += v.weight * dosage(geno.calls.get(v.rsid), v.effect, v.other);
check('la suma ponderada coincide con el cálculo manual', near(prs.score, manual));

const freqs = Object.fromEntries(
  readFileSync(resolve(root, 'data/panel-demo.txt'), 'utf8')
    .split('\n')
    .filter((l) => l.startsWith('rs'))
    .map((l) => {
      const c = l.split('\t');
      return [c[0], Number(c[5])];
    })
);
const ref = referenceDistribution(panel.variants, freqs);
check('la distribución de referencia tiene desviación positiva', ref.sd > 0, `sd=${ref.sd.toFixed(4)}`);

const alto = computePRS(panel.variants, parseGenotypes(readFileSync(resolve(root, 'data/genoma-demo-alto.txt'), 'utf8')).calls);
const bajo = computePRS(panel.variants, parseGenotypes(readFileSync(resolve(root, 'data/genoma-demo-bajo.txt'), 'utf8')).calls);
const pAlto = interpret(alto.score, ref, 1.61).percentile;
const pBajo = interpret(bajo.score, ref, 1.61).percentile;
check('el perfil alto queda por encima del bajo', pAlto > pBajo, `${pAlto.toFixed(1)} vs ${pBajo.toFixed(1)}`);
check('la normal acumulada en 0 vale 0.5', near(normalCdf(0), 0.5, 1e-6));
check('la normal acumulada en 1.96 vale 0.975', near(normalCdf(1.96), 0.975, 1e-3));

console.log('\nPaillier — cifrado homomórfico aditivo');
const { publicKey, privateKey } = generateKeys(256);
const bitsN = publicKey.n.toString(2).length;
check('n mide 511 o 512 bits', bitsN >= 511 && bitsN <= 512, `${bitsN}`);

const c7 = encrypt(publicKey, 7n);
check('descifrar deshace cifrar', decrypt(privateKey, c7) === 7n);
check('el texto cifrado no revela el claro', c7.toString().length > 100);

const suma = addEncrypted(publicKey, encrypt(publicKey, 41n), encrypt(publicKey, 1n));
check('E(41)·E(1) descifra a 42', decrypt(privateKey, suma) === 42n, 'suma sobre datos cifrados');

const escalado = multiplyByScalar(publicKey, encrypt(publicKey, 6n), 7);
check('E(6)^7 descifra a 42', decrypt(privateKey, escalado) === 42n);

const negativo = encrypt(publicKey, encode(-3.25));
check('admite números negativos en punto fijo', near(decode(decrypt(privateKey, negativo)), -3.25, 1e-6));

// Agregación federada de cinco nodos sobre texto cifrado.
const aportes = [0.412, -0.203, 0.087, 0.664, -0.55];
let acumulador = encrypt(publicKey, encode(0));
for (const a of aportes) acumulador = addEncrypted(publicKey, acumulador, encrypt(publicKey, encode(a)));
const esperado = aportes.reduce((s, v) => s + v, 0);
check(
  'agrega cinco aportaciones sin descifrarlas',
  near(decode(decrypt(privateKey, acumulador)), esperado, 1e-6),
  `Σ = ${esperado.toFixed(3)}`
);

console.log('\nBóveda local AES-256-GCM');
const secreto = readFileSync(resolve(root, 'data/genoma-demo-medio.txt'), 'utf8');
const vault = await sealVault(secreto, 'frase-de-paso-de-prueba');
check('el texto cifrado difiere del claro', !new TextDecoder().decode(vault.ciphertext).includes('rs2981582'));
check('abre con la frase correcta', (await openVault(vault, 'frase-de-paso-de-prueba')) === secreto);
let rechazada = false;
try {
  await openVault(vault, 'frase-incorrecta');
} catch {
  rechazada = true;
}
check('rechaza la frase incorrecta', rechazada);
const h1 = await fingerprint(secreto);
check('la huella SHA-256 es determinista', h1 === (await fingerprint(secreto)));
check('la huella cambia si cambia un byte', h1 !== (await fingerprint(secreto + ' ')));

console.log('\nAprendizaje federado');
const nodos = [
  { name: 'Nodo A', data: syntheticCohort({ n: 200, seed: 11, shift: 0.2 }) },
  { name: 'Nodo B', data: syntheticCohort({ n: 180, seed: 23, shift: -0.15 }) },
  { name: 'Nodo C', data: syntheticCohort({ n: 240, seed: 37, shift: 0.05 }) },
];
const prueba = syntheticCohort({ n: 400, seed: 99 });

let global = new Array(7).fill(0);
const inicial = evaluate(global, prueba);
const opciones = { epochs: 10, lr: 0.4, clip: 2.0, perExampleClip: 1.0, noiseMultiplier: 0.35, rand: seededRandom(5) };
let ultima = null;
for (let r = 0; r < 12; r++) {
  ultima = federatedRound(global, nodos, opciones);
  global = ultima.weights;
}
const federado = evaluate(global, prueba);
check('el modelo federado mejora sobre el punto de partida', federado.auc > inicial.auc + 0.1, `AUC ${inicial.auc.toFixed(3)} → ${federado.auc.toFixed(3)}`);

const centralizado = evaluate(
  trainLocal(new Array(7).fill(0), nodos.flatMap((n) => n.data), { epochs: 120, lr: 0.4 }),
  prueba
);
check(
  'el federado se acerca al centralizado pese al ruido',
  federado.auc >= centralizado.auc - 0.12,
  `federado ${federado.auc.toFixed(3)} vs centralizado ${centralizado.auc.toFixed(3)}`
);

const ronda = federatedRound(global, nodos, opciones);
check('cada nodo transmite sólo el vector de pesos', ronda.transmissions.every((t) => t.bytes === 7 * 8));
check('ningún nodo transmite ejemplos', ronda.transmissions.every((t) => !('data' in t)));

const presupuesto = privacyBudget({ rounds: 12, sensitivity: ultima.sensitivity, sigma: ultima.sigma, delta: 1e-5 });
check('el presupuesto de privacidad crece con las rondas', presupuesto.epsilonTotal > presupuesto.epsilonPerRound);
check('el epsilon a nivel de registro queda en rango razonable', presupuesto.epsilonTotal < 8, `ε = ${presupuesto.epsilonTotal.toFixed(2)}`);
check('el recorte por ejemplo acota la sensibilidad', ultima.sensitivity < 0.1, `Δ = ${ultima.sensitivity.toFixed(4)}`);
check('el presupuesto declara su método', presupuesto.method.includes('conservadora'));

console.log(`\n${passed} pruebas correctas, ${failed} fallidas\n`);
process.exit(failed === 0 ? 0 : 1);
