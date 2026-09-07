# HELIX GUARD

**Firma genética de riesgo de cáncer de mama que se calcula sin que el genoma salga del dispositivo.**

Proyecto final del concurso de innovación en Inteligencia Artificial y Ciberseguridad, cohortes WomenCISO 4 y MenCISO Gen 1 · Fundación WomenCISO & MenCISO IAP.

Autora: **Abby Villeda** ([@abivilleda28](https://github.com/abivilleda28)) — bióloga especializada en bioinformática, con trabajo en splicing alternativo.

---

## Objetivo

Permitir que una persona obtenga una estimación explicable de su riesgo genético de cáncer de mama **sin ceder la custodia de su genoma a nadie**, y que los hospitales puedan mejorar el modelo entre todos sin intercambiar datos de pacientes.

El problema tiene dos caras y las dos son medibles:

**La salud.** En 2022 hubo 2 296 840 casos nuevos de cáncer de mama y 666 103 muertes en el mundo. En México, el consenso nacional reporta que el 55.9 % se diagnostica en etapas localmente avanzadas (IIb–III) y el 10.5 % ya metastásico. La meta de la Iniciativa Mundial de la OMS es que al menos el 60 % se detecte en estadio I o II.

**La custodia.** En marzo de 2025, 23andMe entró en Capítulo 11 tras una filtración que afectó a 6.9 millones de clientes; una subasta judicial terminó vendiendo la empresa —con los datos genéticos de más de 15 millones de personas— por 305 millones de dólares. Alrededor de 1.9 millones de consumidores borraron sus datos durante el proceso. Y borrar llega tarde por diseño: Gymrek y colaboradores demostraron en *Science* (2013) que se pueden recuperar apellidos de genomas "anonimizados" usando el cromosoma Y y bases de genealogía públicas y gratuitas.

Un genoma no es un dato personal más. Identifica a la persona, identifica a su familia, y no caduca.

---

## Qué hace este repositorio

Un prototipo funcional, ejecutable, con cuatro piezas que se pueden auditar línea por línea:

| Pieza | Qué resuelve | Dónde |
|---|---|---|
| Motor de puntaje poligénico | Calcula el PRS en el dispositivo a partir de un archivo del PGS Catalog y los genotipos de la persona | `src/prs.js` |
| Aprendizaje federado con privacidad diferencial | Entrena un clasificador multigénico entre hospitales; sólo viajan pesos, recortados y con ruido | `src/federated.js` |
| Cifrado homomórfico aditivo (Paillier) | El agregador suma aportaciones de varios nodos sin poder leer ninguna | `src/paillier.js` |
| Bóveda local | Cifra el archivo genómico en reposo con AES-256-GCM y PBKDF2 | `src/vault.js` |

No es una maqueta. Las operaciones criptográficas ocurren de verdad: la suite de pruebas verifica, entre otras cosas, que `E(41) · E(1)` descifra a `42` sin descifrar los operandos.

---

## Aplicación en vivo

Publicada con GitHub Pages en **https://abivilleda28.github.io/helix-guard/**. Ver `DESPLIEGUE.md` para los pasos de publicación y entrega.

## Cómo ejecutarlo

Requiere Node 18 o superior sólo para las pruebas y la compilación. La aplicación en sí no necesita nada.

```bash
git clone <este-repositorio>
cd helix-guard

node tests/test.mjs          # 34 pruebas, sin dependencias externas
node scripts/build-data.mjs  # regenera el panel y los genomas sintéticos
node scripts/build-app.mjs   # empaqueta app/index.html
```

Después, **abre `app/index.html` con doble clic**. No hace falta servidor.

### Verificación de la afirmación central

La app declara que nada sale del dispositivo. Se puede comprobar en treinta segundos:

1. Abre las herramientas de desarrollo del navegador, pestaña **Red**.
2. Recarga `app/index.html`. Verás un solo documento: el HTML. Sin tipografías, sin CDN, sin analítica.
3. Recorre la app entera. La lista sigue igual.
4. El contador de la cabecera envuelve `fetch`, `XMLHttpRequest`, `sendBeacon` y `WebSocket`. Si algo intentara salir, subiría y quedaría registrado en rojo en la línea de custodia.

`grep -c "https\?://" app/index.html` devuelve `0`.

---

## Resultados obtenidos

Medidos con la suite de pruebas y con el recorrido automatizado del prototipo:

- **Cálculo del PRS:** 15 variantes del panel demostrativo, ~1 ms en el dispositivo. Percentil 97 y riesgo relativo 2.48× para el perfil sintético alto; percentil 0.4 para el bajo.
- **Federado contra centralizado:** AUC 0.912 federado frente a 0.940 centralizado, con cinco nodos y doce rondas. Consistente con Sheller *et al.*, *Scientific Reports* 2020, donde el modelo federado sobre diez instituciones alcanzó el 99 % del desempeño del centralizado.
- **Presupuesto de privacidad:** ε = 3.5 acumulado con δ = 1e-5, a nivel de registro, con recorte por ejemplo de 1.0 y σ = 0.7. Contabilidad por composición secuencial, que es la cota pesimista.
- **Volumen transmitido:** 56 bytes por nodo y ronda. Siete números en coma flotante. Cero genotipos.
- **Agregación homomórfica:** 5 cifrados + 5 sumas + 1 descifrado en 12 ms con n de 512 bits. Error de 5.55e-17 por redondeo de punto fijo.
- **Bóveda:** sellado y apertura verificados; AES-GCM rechaza tanto la frase incorrecta como el archivo alterado.

---

## Herramientas usadas

Ninguna dependencia de terceros en tiempo de ejecución. Es una decisión de diseño, no una limitación: cada biblioteca externa sería una superficie de ataque y un recurso que habría que descargar de la red.

- **JavaScript ES2022** con `BigInt` para la aritmética modular de Paillier.
- **WebCrypto API** para AES-256-GCM, PBKDF2 y SHA-256.
- **Node 18+** para las pruebas y los scripts de compilación.
- **Playwright** en desarrollo, sólo para el control de calidad visual y la verificación de que no hay peticiones de red.
- **pptxgenjs** para el deck del pitch.

Referencias de datos: **PGS Catalog** (`PGS000004`, PRS313 de Mavaddat *et al.*) como archivo de puntuación de referencia, y **SCAN-B** (`GSE81538` / `GSE96058`) como cohorte de referencia para los clasificadores multigénicos.

---

## Estructura

```
helix-guard/
├── app/
│   ├── index.html          aplicación empaquetada, un solo archivo
│   ├── template.html       plantilla y estilos
│   └── ui.js               lógica de interfaz e interceptor de red
├── src/
│   ├── prs.js              puntaje poligénico
│   ├── federated.js        FedAvg + privacidad diferencial
│   ├── paillier.js         cifrado homomórfico aditivo
│   └── vault.js            bóveda AES-256-GCM
├── data/
│   ├── panel-demo.txt      panel de 15 variantes, formato PGS Catalog
│   └── genoma-demo-*.txt   tres perfiles sintéticos
├── docs/
│   ├── 01-problema-y-mercado.md
│   ├── 02-arquitectura-tecnica.md
│   ├── 03-marco-ciberseguridad.md
│   ├── 04-bioetica-y-soberania.md
│   ├── 05-modelo-de-negocio.md
│   ├── 06-guion-video-pitch.md
│   └── 07-referencias.md
├── .github/workflows/      compila, prueba y publica en Pages
├── scripts/                generación de datos y empaquetado
└── tests/test.mjs          34 pruebas
```

---

## Límites, dichos en voz alta

Un proyecto de salud que oculta sus límites no merece confianza, así que aquí están:

- **No es un dispositivo médico y no diagnostica.** Un percentil alto significa que conviene hablar con un profesional sobre tamizaje más frecuente. Nada más.
- **No calcula riesgo absoluto a lo largo de la vida.** Para eso hace falta un modelo clínico como Tyrer-Cuzick o BOADICEA con historia familiar y factores hormonales.
- **El panel demostrativo son 15 variantes**, con odds ratios tomados de las publicaciones de descubrimiento citadas línea por línea en `data/panel-demo.txt`. No es un puntaje validado. La app acepta el archivo oficial `PGS000004` para uso científico.
- **Los datos de la demo son sintéticos**, generados localmente por muestreo de Hardy-Weinberg. No provienen de ninguna persona ni de ninguna cohorte.
- **La calibración en poblaciones latinoamericanas es peor que en europeas.** El PGS313 alcanza un AUC de 0.70 en ascendencia europea frente a 0.61 en africana y 0.64 en asiática oriental. Esa brecha es el problema que la arquitectura federada busca cerrar, no uno que ya haya resuelto.
- **Los parámetros criptográficos de la demo no son de producción.** El módulo de Paillier de 512 bits está elegido para que la demostración corra rápido; un despliegue real necesita n ≥ 3072 bits, o un esquema de red como CKKS sobre OpenFHE o Microsoft SEAL.

---

## Licencia

MIT. Ver `LICENSE`.
