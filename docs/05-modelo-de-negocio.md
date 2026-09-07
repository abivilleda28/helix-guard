# Modelo de negocio

## 1. La regla de la que sale todo lo demás

**No se cobra a la persona por sus propios datos, y no se venden datos genómicos.** Ni identificados, ni seudonimizados, ni agregados.

Esto no es una postura: es una restricción de diseño que determina el modelo. El activo comercial de HELIX GUARD no es el dato, es **la red**. Y la red vale porque el dato no se mueve.

---

## 2. Tres fuentes de ingreso

### A. Licencia por nodo institucional — el ingreso recurrente

Cada hospital, laboratorio o red de salud paga una suscripción anual por operar un nodo federado.

| Nivel | Perfil | Precio anual orientativo |
|---|---|---|
| Nodo comunitario | Clínicas y redes pequeñas, menos de 500 pacientes al año | 15 000 USD |
| Nodo hospitalario | Hospital general o centro oncológico | 25 000 USD |
| Nodo institucional | Instituto nacional o red multisede | 40 000 USD |

**Qué compra el hospital:** acceso a un modelo entrenado con muchas más pacientes de las que tiene, sin transferir un solo expediente, sin la responsabilidad legal de una transferencia internacional de datos sensibles, y sin la exposición a una brecha que en el sector salud cuesta en promedio 7.42 millones de dólares.

El argumento de venta más fuerte no es la ciencia: es que **participar no crea responsabilidad nueva**. Bajo la ley mexicana vigente desde marzo de 2025, la información genética es dato personal sensible; un director de hospital que hoy no puede firmar una transferencia de genomas sí puede firmar el envío de vectores de pesos con ruido.

### B. Acceso a la red de investigación

Farmacéuticas, grupos académicos y consorcios pagan por entrenar y validar modelos sobre la red federada, con consentimiento expreso y revocable de cada persona, sin ver los datos.

Es el mercado que Lifebit atiende con Genomics England, los NIH y el Ministerio de Salud de Singapur. La diferencia de HELIX GUARD es doble: la unidad de consentimiento es la persona, no la institución, y la persona participa del reparto.

Modelo: cuota de acceso más pago por proyecto según cohorte alcanzada. Con retorno explícito hacia los nodos aportantes.

### C. Reporte clínico

Entre 40 y 80 USD por reporte, **vendido a través del sistema de salud y de aseguradoras de gastos médicos, no directo al consumidor**. Es una decisión deliberada: la venta directa al consumidor es exactamente el canal que produjo el caso 23andMe, y desplaza la interpretación fuera de la consulta médica.

---

## 3. Estructura de costos

La economía es inusualmente favorable por una razón concreta: **el cómputo pesado ocurre en el dispositivo de la persona**.

| Concepto | Comportamiento |
|---|---|
| Cálculo del PRS | Costo marginal cero. Corre en el navegador de la persona, ~1 ms |
| Almacenamiento de genomas | **Cero.** No existe. Es el mayor ahorro y el mayor diferenciador de riesgo |
| Agregador federado | Servidor modesto. Sólo recibe vectores de pesos: 56 bytes por nodo y ronda |
| Cumplimiento normativo | Muy inferior al de un custodio de genomas, porque no hay custodia |
| Seguro de responsabilidad | Menor por la misma razón: no se puede filtrar lo que no se tiene |
| Costo real | Ingeniería, validación clínica y desarrollo del consorcio |

El costo marginal por análisis adicional tiende a cero, mientras que el de un laboratorio centralizado crece con cada genoma almacenado, cada auditoría y cada requisito de residencia de datos.

---

## 4. Foso competitivo

**No es el código.** Está publicado y usa criptografía conocida desde 1999.

**Es la red y su calibración.** Cada hospital latinoamericano que entra mejora el ajuste del modelo para poblaciones subrepresentadas. Esa calibración no se puede copiar: hay que construirla nodo a nodo, con confianza institucional que toma años. Un competidor con más capital puede replicar la tecnología en meses; no puede replicar veinte convenios hospitalarios ni el historial de no haber filtrado nunca nada.

Y hay una barrera que juega a favor: **cuanto más estricta se vuelve la regulación de soberanía de datos, más difícil es para un competidor centralizado operar en varios países a la vez.** Nosotros no tenemos ese problema porque nunca cruzamos la frontera con el dato.

---

## 5. Ruta de adopción

**Fase 1 — validación (0–12 meses).** Cargar `PGS000004` y validar calibración en una cohorte mexicana. Convenio con dos o tres instituciones. Publicación revisada por pares del estudio de calibración. Sin ingresos: es la fase que da legitimidad científica.

**Fase 2 — primeros nodos (12–24 meses).** Cinco a ocho nodos en México. Comienza la licencia por nodo. Migración de la criptografía a parámetros de producción: CKKS sobre OpenFHE, n ≥ 3072 bits, agregación segura con umbral.

**Fase 3 — red regional (24–48 meses).** Expansión a Colombia, Chile y Perú. Arranca el acceso a la red de investigación, que es donde el modelo se vuelve rentable. El reporte clínico entra vía aseguradoras.

**Fase 4 — extensión.** La arquitectura no es específica de cáncer de mama. Cualquier condición con un puntaje poligénico validado se conecta cargando otro archivo del PGS Catalog. Cáncer colorrectal, enfermedad coronaria, diabetes tipo 2.

---

## 6. Factibilidad

### Técnica

Ya demostrada en el prototipo, con números medidos: PRS local en 1 ms; federado a 0.912 de AUC contra 0.940 centralizado; agregación homomórfica en 12 ms; 56 bytes transmitidos por nodo y ronda. La viabilidad a escala genómica está publicada: iDASH 2018 completó un GWAS entero para 1 000 individuos en dos a cuatro minutos bajo cifrado homomórfico.

### Financiera

El capital de la fase 1 es principalmente científico, no de infraestructura: no hay que construir un laboratorio ni un centro de datos. La fase 2 se sostiene con licencias de nodo. Existen además fuentes no dilutivas alineadas con el proyecto: fondos de investigación en salud, cooperación internacional para equidad genómica, y programas de la Iniciativa Mundial contra el Cáncer de Mama de la OMS.

### Regulatoria

El prototipo no es un dispositivo médico y no lo pretende. La ruta de reporte clínico exigiría registro sanitario, y esa es la razón de que la fase 1 sea validación y no ventas. Reconocerlo con calendario es parte de la propuesta.

---

## 7. Riesgos y cómo se afrontan

| Riesgo | Respuesta |
|---|---|
| La validación en cohorte mexicana muestra calibración insuficiente | Es un resultado publicable de todos modos, y define exactamente cuántas cohortes hacen falta. Es el propósito de la fase 1 |
| Adopción hospitalaria lenta | El argumento de venta es la reducción de responsabilidad legal, no la innovación. Se le habla al área jurídica, no sólo a la médica |
| Un competidor grande copia la arquitectura | Bienvenido: valida la tesis. El foso es la red y la confianza, no el algoritmo |
| Pocos nodos debilitan la garantía de privacidad | Es cierto y está medido en la app. Por eso la fase 2 prioriza número de nodos sobre número de pacientes por nodo |
| Cambio regulatorio | Casi todo movimiento regulatorio reciente va hacia más soberanía de datos, lo que favorece este diseño |
