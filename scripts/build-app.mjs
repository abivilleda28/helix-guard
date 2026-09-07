/**
 * Empaqueta app/index.html a partir de app/template.html, los módulos de
 * src/ y los datos de data/. El resultado es un único archivo que se abre
 * con doble clic, sin servidor, sin instalación y sin recursos externos.
 *
 * Que no haya un solo enlace a un CDN es parte de la propuesta: la
 * afirmación "nada sale de tu dispositivo" tiene que ser verificable
 * abriendo la pestaña de red del navegador.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

/** Quita import/export para poder concatenar los módulos en un ámbito. */
function flatten(source) {
  return source
    .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+(const|let|var|function|class|async)/gm, '$1')
    .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, '');
}

const core = [
  '/* ---- src/prs.js ---- */',
  flatten(read('src/prs.js')),
  '/* ---- src/paillier.js ---- */',
  flatten(read('src/paillier.js')),
  '/* ---- src/federated.js ---- */',
  flatten(read('src/federated.js')),
  '/* ---- src/vault.js ---- */',
  flatten(read('src/vault.js')),
  '/* ---- datos de demostración ---- */',
  `const DEMO_PANEL = ${JSON.stringify(read('data/panel-demo.txt'))};`,
  `const DEMO_GENOMES = ${JSON.stringify({
    bajo: read('data/genoma-demo-bajo.txt'),
    medio: read('data/genoma-demo-medio.txt'),
    alto: read('data/genoma-demo-alto.txt'),
  })};`,
].join('\n\n');

// El reemplazo va como función: si fuera una cadena, `$$` y `$&` dentro
// del código inyectado se interpretarían como patrones de sustitución.
const html = read('app/template.html')
  .replace('/* @inject:core */', () => core)
  .replace('/* @inject:ui */', () => read('app/ui.js'));

writeFileSync(resolve(root, 'app/index.html'), html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`app/index.html generado — ${kb} KB, cero dependencias externas`);
