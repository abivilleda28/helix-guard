/**
 * HELIX GUARD — bóveda local del genoma
 * ------------------------------------------------------------------
 * Cifrado en reposo del archivo genómico dentro del dispositivo, con
 * WebCrypto (AES-256-GCM). La clave se deriva de una frase de paso con
 * PBKDF2-HMAC-SHA-256; nunca se almacena ni se transmite.
 *
 * Elección de parámetros
 *   · AES-GCM 256 bits: cifrado autenticado, recomendado por NIST
 *     SP 800-38D. Detecta manipulación además de proteger el contenido.
 *   · PBKDF2 con 600 000 iteraciones: mínimo vigente en la guía de
 *     almacenamiento de contraseñas de OWASP para PBKDF2-HMAC-SHA-256.
 *   · IV de 96 bits aleatorio por operación, nunca reutilizado.
 */

const subtle = () => (globalThis.crypto ?? require('node:crypto').webcrypto).subtle;
const getRandomValues = (arr) => (globalThis.crypto ?? require('node:crypto').webcrypto).getRandomValues(arr);

export const PBKDF2_ITERATIONS = 600_000;

export function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Huella del archivo, para que la persona pueda verificar integridad. */
export async function fingerprint(text) {
  const digest = await subtle().digest('SHA-256', new TextEncoder().encode(text));
  return toHex(digest);
}

export async function deriveKey(passphrase, salt, iterations = PBKDF2_ITERATIONS) {
  const base = await subtle().importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return subtle().deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function sealVault(plaintext, passphrase) {
  const salt = getRandomValues(new Uint8Array(16));
  const iv = getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await subtle().encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return {
    algorithm: 'AES-256-GCM',
    kdf: `PBKDF2-HMAC-SHA-256 (${PBKDF2_ITERATIONS} iteraciones)`,
    salt: toHex(salt),
    iv: toHex(iv),
    ciphertext: new Uint8Array(ciphertext),
    bytes: ciphertext.byteLength,
  };
}

export async function openVault(vault, passphrase) {
  const salt = Uint8Array.from(vault.salt.match(/../g).map((h) => parseInt(h, 16)));
  const iv = Uint8Array.from(vault.iv.match(/../g).map((h) => parseInt(h, 16)));
  const key = await deriveKey(passphrase, salt);
  const plain = await subtle().decrypt({ name: 'AES-GCM', iv }, key, vault.ciphertext);
  return new TextDecoder().decode(plain);
}
