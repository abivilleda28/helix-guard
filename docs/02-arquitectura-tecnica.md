# Arquitectura técnica

## Principio de diseño

**El dato sensible no se mueve; se mueve el cómputo.** Todo lo demás se deriva de ahí.

Cuando un dato no puede viajar, tampoco puede filtrarse en tránsito, ni quedar en un bucket mal configurado, ni ser vendido en una quiebra. Buena parte de la superficie de ataque desaparece por construcción en lugar de por control.

---

## Flujo completo

```
   DISPOSITIVO DE LA PERSONA                    NODO INSTITUCIONAL              AGREGADOR
   ─────────────────────────                    ──────────────────              ─────────

   archivo de genotipos
          │
          ▼
   [ bóveda AES-256-GCM ]  ◄── clave derivada con PBKDF2, nunca almacenada
          │
          ├──► PRS local ──► percentil + variantes explicadas
          │                  (nada sale)
          │
          └──► entrenamiento local
                    │
                    │  recorte por ejemplo (C = 1.0)
                    │  ruido gaussiano (σ = 0.7)
                    ▼
              vector de pesos ─────────────────────────► cifrado Paillier ──► Σ homomórfica
                 56 bytes                                                          │
                                                                                   ▼
                                                          modelo global  ◄── descifra sólo la suma
                                                                 │
          ◄──────────────────────────────────────────────────────┘
          modelo global de vuelta al dispositivo
```

Lo que **nunca** cruza la frontera del dispositivo: genotipos, identificadores, fechas, expedientes, resultados individuales.

Lo que sí cruza: siete números en coma flotante por ronda, con ruido, y opcionalmente cifrados.

---

## Componente 1 — puntaje poligénico local (`src/prs.js`)

### Cálculo

Suma ponderada estándar de dosis alélicas, que es la definición usada por Mavaddat y colaboradores para el PRS313:

```
PRS = Σ βᵢ · dosisᵢ        dosisᵢ ∈ {0, 1, 2}
```

### Detalles que importan

**Corrección de hebra.** Un genotipo `TT` frente a una variante declarada `A/G` no es un error: es la hebra complementaria. El motor intenta el emparejamiento directo, y si falla, prueba con el complemento antes de descartar la variante. Sin esto, un archivo de un proveedor distinto perdería la mitad del panel en silencio.

**Distribución de referencia sin cohorte externa.** Para situar el puntaje en un percentil hace falta conocer la distribución poblacional. En lugar de consultar una base remota —que implicaría transmitir algo— se calcula analíticamente bajo equilibrio de Hardy-Weinberg e independencia entre loci:

```
E[PRS]   = Σ 2·βᵢ·fᵢ
Var[PRS] = Σ 2·βᵢ²·fᵢ·(1−fᵢ)
```

Es una aproximación: ignora el desequilibrio de ligamiento residual entre variantes. A cambio, permite calcular el percentil sin ninguna llamada de red. En producción, la media y la desviación de la cohorte de referencia se distribuirían con el archivo del modelo, no se consultarían.

**Interpretación.** El riesgo relativo se expresa como `OR_por_SD ^ z`, frente a la media poblacional. **No** se reporta riesgo absoluto a lo largo de la vida: eso exige un modelo clínico con historia familiar y factores hormonales, y decirlo es parte del diseño.

### Formato de entrada

Compatible con archivos de puntuación del **PGS Catalog** y con datos crudos de consumo. El panel demostrativo incluido tiene 15 variantes con su cita línea por línea. Para uso científico se carga `PGS000004`.

---

## Componente 2 — aprendizaje federado (`src/federated.js`)

### Protocolo

FedAvg (McMahan *et al.*, 2017) con promediado ponderado por tamaño de cohorte:

```
w_global ← Σ (nₖ / N) · wₖ
```

### Privacidad diferencial

Dos mecanismos encadenados:

1. **Recorte por ejemplo.** El gradiente de cada paciente se recorta a norma ≤ C antes de acumularse. Esto es lo que hace que la garantía sea a nivel de registro y no sólo de nodo: si el gradiente de una persona nunca supera C, quitarla mueve la actualización final como mucho

   ```
   Δ = epochs · lr · C / n
   ```

   Con epochs = 10, lr = 0.4, C = 1.0 y el nodo más pequeño (n = 95): Δ ≈ 0.042.

2. **Ruido gaussiano** de desviación σ sobre la actualización, con σ = noiseMultiplier × clip.

### Contabilidad

Mecanismo gaussiano, teorema A.1 de Dwork y Roth (2014):

```
ε = (Δ/σ) · √(2·ln(1.25/δ))
```

compuesto secuencialmente sobre las rondas. Con los valores por defecto: **ε ≈ 3.5 acumulado, δ = 1e-5**.

**Esta cota se presenta a propósito.** Es la más pesimista. Con contabilidad de Rényi o el accountant de momentos de Abadi *et al.* (CCS 2016) el mismo ruido daría un ε bastante menor. Preferimos mostrar el número feo y explicarlo antes que publicar uno bonito que no medimos. La interfaz permite subir el ruido y ver caer ε junto con el AUC: ese intercambio es real y no se puede esconder.

### Resultado medido

| Configuración | AUC | ε acumulado |
|---|---|---|
| Centralizado (referencia) | 0.940 | — |
| Federado, σ = 0.7 | 0.912 | 3.50 |
| Federado, σ = 1.0 | 0.883 | 2.45 |
| Federado, σ = 2.0 | 0.774 | 1.22 |
| Federado, σ = 4.0 | 0.647 | 0.61 |

---

## Componente 3 — agregación homomórfica (`src/paillier.js`)

### Por qué hace falta si ya hay ruido

La privacidad diferencial protege a la paciente frente al modelo. El cifrado homomórfico protege al **hospital** frente al operador de la plataforma. Son amenazas distintas: sin él, quien opera el agregador ve la aportación de cada institución en claro, y de ahí se infieren características de su cohorte.

### La propiedad

```
D( E(m₁) · E(m₂)  mod n² ) = m₁ + m₂  mod n
```

El agregador multiplica textos cifrados y obtiene el cifrado de la suma. Nunca descifra un sumando. Sólo el titular de la clave privada —el consorcio, bajo gobernanza compartida— abre el resultado agregado.

### Implementación

Paillier (EUROCRYPT 1999) con la variante `g = n + 1`, `λ = lcm(p−1, q−1)`, `μ = λ⁻¹ mod n`. Aritmética con `BigInt`, primos por Miller-Rabin con cribado por primos pequeños. Los reales se codifican en punto fijo con escala 10⁶; el error residual medido es de 5.55e-17.

### Parámetros

El módulo de 512 bits está elegido para que la demostración corra en 12 ms en el navegador. **No es seguro en producción.** Un despliegue real usaría n ≥ 3072 bits, o mejor, CKKS sobre OpenFHE o Microsoft SEAL, que soporta operaciones vectorizadas sobre reales.

### Viabilidad a escala real

No es especulación. En la competencia iDASH 2018, las soluciones ganadoras completaron un GWAS entero para 1 000 individuos en aproximadamente cuatro y dos minutos; el cómputo seguro sobre 15 000 SNP se resolvió en menos de dos minutos, rompiendo el récord anterior de unos diez minutos por SNP.

---

## Componente 4 — bóveda local (`src/vault.js`)

| Decisión | Valor | Justificación |
|---|---|---|
| Cifrado | AES-256-GCM | Cifrado autenticado: detecta manipulación además de proteger el contenido (NIST SP 800-38D) |
| Derivación de clave | PBKDF2-HMAC-SHA-256, 600 000 iteraciones | Mínimo vigente de la guía de almacenamiento de contraseñas de OWASP |
| IV | 96 bits aleatorio por operación | Nunca reutilizado |
| Integridad | SHA-256 del archivo, mostrada a la persona | Permite verificar que el archivo es el que se cargó |

La clave no se almacena en ningún sitio. Si la persona olvida la frase, el archivo es ruido: es el costo de que nadie más pueda abrirlo.

---

## Decisión transversal: cero dependencias externas

La app no carga tipografías, ni analítica, ni bibliotecas de CDN. Cada una de esas cosas sería:

1. una petición de red que contradice la afirmación central,
2. una superficie de ataque en la cadena de suministro,
3. un tercero que ve la dirección IP de una persona consultando una app de riesgo oncológico.

Ese último punto es el menos obvio y el más grave. El metadato ya es sensible.

Por eso `app/index.html` es un solo archivo de 70 KB, generado por `scripts/build-app.mjs` a partir de los módulos de `src/`. Se abre con doble clic, funciona sin conexión, y la afirmación se audita en la pestaña de red.

---

## Camino a producción

Lo que este prototipo demuestra y lo que faltaría:

| Demostrado | Pendiente |
|---|---|
| Cálculo de PRS local y explicable | Validación de calibración en cohorte mexicana |
| FedAvg con DP y contabilidad publicada | Accountant de momentos; muestreo por subconjunto |
| Agregación homomórfica funcional | CKKS sobre OpenFHE; n ≥ 3072 bits |
| Bóveda cifrada en el dispositivo | Atestación de integridad del cliente |
| Cero transmisión, auditable | Agregación segura con umbral y rotación de claves |
| Consentimiento granular en interfaz | Registro de consentimiento anclado criptográficamente |
