/**
 * HELIX GUARD — cifrado homomórfico aditivo (Paillier, 1999)
 * ------------------------------------------------------------------
 * Implementación real, no simulada. La propiedad que explotamos es:
 *
 *      D( E(m1) · E(m2)  mod n² ) = m1 + m2  mod n
 *
 * Es decir: el servidor agregador puede SUMAR aportaciones de muchos
 * nodos sin poder leer ninguna. Se usa aquí para agregar los pesos del
 * modelo federado y los conteos epidemiológicos.
 *
 * Referencia: P. Paillier, "Public-Key Cryptosystems Based on Composite
 * Degree Residuosity Classes", EUROCRYPT 1999.
 *
 * AVISO DE PARÁMETROS
 * El tamaño de clave por defecto (n de 512 bits) está elegido para que
 * la demostración corra en menos de un segundo en un navegador. NO es
 * seguro en producción: un despliegue real necesita n ≥ 3072 bits, o
 * bien un esquema de red ideal (CKKS/BFV) sobre una biblioteca auditada
 * como Microsoft SEAL u OpenFHE.
 */

const SMALL_PRIMES = [
  3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101,
  103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199,
];

function randomBigInt(bits) {
  const bytes = new Uint8Array(Math.ceil(bits / 8));
  const g = globalThis.crypto ?? require('node:crypto').webcrypto;
  g.getRandomValues(bytes);
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  // Fija el bit más alto (tamaño garantizado) y el más bajo (impar).
  n |= 1n << BigInt(bits - 1);
  n |= 1n;
  return n;
}

export function modPow(base, exp, mod) {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

function egcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
}

export function modInverse(a, m) {
  const [g, x] = egcd(((a % m) + m) % m, m);
  if (g !== 1n) throw new Error('No existe inverso modular');
  return ((x % m) + m) % m;
}

/** Prueba de primalidad Miller-Rabin. */
export function isProbablePrime(n, rounds = 24) {
  if (n < 2n) return false;
  for (const p of SMALL_PRIMES) {
    const bp = BigInt(p);
    if (n === bp) return true;
    if (n % bp === 0n) return false;
  }

  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }

  for (let i = 0; i < rounds; i++) {
    const a = 2n + (randomBigInt(32) % (n - 4n));
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let j = 1n; j < r; j++) {
      x = (x * x) % n;
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

export function randomPrime(bits) {
  for (;;) {
    const candidate = randomBigInt(bits);
    if (isProbablePrime(candidate)) return candidate;
  }
}

/**
 * Genera un par de claves. Usamos la variante con g = n + 1, para la
 * cual λ = lcm(p-1, q-1) y μ = λ⁻¹ mod n.
 */
export function generateKeys(bitsPerPrime = 256) {
  let p = randomPrime(bitsPerPrime);
  let q = randomPrime(bitsPerPrime);
  while (q === p) q = randomPrime(bitsPerPrime);

  const n = p * q;
  const nSquared = n * n;
  const lambda = ((p - 1n) * (q - 1n)) / gcd(p - 1n, q - 1n);
  const g = n + 1n;
  const mu = modInverse(lambda, n);

  return {
    publicKey: { n, nSquared, g, bits: bitsPerPrime * 2 },
    privateKey: { lambda, mu, n, nSquared },
  };
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

export function encrypt(publicKey, message) {
  const { n, nSquared, g } = publicKey;
  const m = ((BigInt(message) % n) + n) % n;
  let r;
  do {
    r = randomBigInt(publicKey.bits - 1) % n;
  } while (r <= 1n || gcd(r, n) !== 1n);
  return (modPow(g, m, nSquared) * modPow(r, n, nSquared)) % nSquared;
}

export function decrypt(privateKey, ciphertext) {
  const { lambda, mu, n, nSquared } = privateKey;
  const x = modPow(ciphertext, lambda, nSquared);
  const l = (x - 1n) / n;
  let m = (l * mu) % n;
  // Interpreta la mitad superior del anillo como negativos.
  if (m > n / 2n) m -= n;
  return m;
}

/** Suma homomórfica: producto de textos cifrados módulo n². */
export function addEncrypted(publicKey, a, b) {
  return (a * b) % publicKey.nSquared;
}

/** Multiplicación homomórfica por un escalar en claro. */
export function multiplyByScalar(publicKey, ciphertext, scalar) {
  const k = BigInt(scalar);
  if (k < 0n) {
    return modPow(modInverse(ciphertext, publicKey.nSquared), -k, publicKey.nSquared);
  }
  return modPow(ciphertext, k, publicKey.nSquared);
}

/**
 * Codifica un número real como entero de punto fijo, porque Paillier
 * opera sobre enteros. `scale` fija los decimales conservados.
 */
export const FIXED_POINT_SCALE = 1_000_000n;

export function encode(value, scale = FIXED_POINT_SCALE) {
  return BigInt(Math.round(value * Number(scale)));
}

export function decode(value, scale = FIXED_POINT_SCALE) {
  return Number(value) / Number(scale);
}
