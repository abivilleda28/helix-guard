# Bioética y soberanía genómica

## 1. Por qué el genoma no es un dato personal más

Casi toda la regulación de privacidad se diseñó pensando en datos que se pueden cambiar, corregir o dejar atrás. El genoma no cumple ninguna de esas condiciones y eso rompe los supuestos de fondo.

**Es permanente.** Una tarjeta filtrada se cancela. Una contraseña se rota. Una dirección se cambia. Un genoma filtrado en 2026 sigue siendo válido en 2076.

**No es individual.** Comparte aproximadamente el 50 % de su información con madre, padre, hijas e hijos, y el 25 % con abuelas y tías. Cuando una persona entrega su genoma, consiente por gente que nunca preguntó, incluida gente que todavía no nace. El consentimiento informado individual, tal como se practica, es estructuralmente insuficiente aquí.

**No se puede anonimizar de verdad.** Gymrek y colaboradores lo demostraron en *Science* en 2013: recuperaron apellidos de participantes de proyectos públicos perfilando repeticiones cortas en tándem del cromosoma Y y consultando bases de genealogía recreativa gratuitas. Combinando apellido, edad y estado, triangularon identidades. Todo con recursos públicos y gratuitos de internet. Retirar identificadores directos no basta: el genoma **es** el identificador.

**Es predictivo, no sólo descriptivo.** Habla de enfermedades que la persona todavía no tiene y puede que nunca desarrolle. Esa asimetría —saber algo probable sobre alguien antes que la propia persona— es lo que hace del dato genómico un instrumento de discriminación tan eficaz.

---

## 2. Los daños concretos, no hipotéticos

### Discriminación asegurada por el hueco legal

En Estados Unidos, GINA prohíbe usar información genética en seguro de salud y en decisiones de empleo. Pero **no cubre seguros de vida, de discapacidad ni de cuidados de largo plazo**. Es decir: exactamente los tres productos donde un riesgo elevado de cáncer de mama tiene más impacto económico. La ley permite explícitamente ajustar la prima o negar cobertura con base en resultados de pruebas genéticas en esas líneas.

### El dato como activo concursable

El caso 23andMe dejó de ser hipótesis en 2025. Los genomas de más de quince millones de personas entraron a una subasta judicial. Más de dos docenas de estados demandaron argumentando que la información genética es un tipo de propiedad fundamentalmente distinto al que suele cambiar de manos en una quiebra. El tribunal aprobó la venta de todas formas, y cinco estados se mantuvieron opuestos hasta el final. La lección no es que la compradora fuera buena o mala: es que **la persona no tuvo voz en el proceso**.

### El uso forense sin consentimiento

Las bases de genealogía recreativa se han usado para identificar sospechosos a través de familiares que nunca fueron investigados. Sea cual sea la opinión de cada quien sobre esos casos, el hecho técnico es claro: subir un genoma expone a la parentela a un uso que ninguno de ellos autorizó.

### El riesgo de la síntesis dirigida

Es el argumento menos discutido y conviene enunciarlo con precisión, sin alarmismo. Conocer la secuencia completa de una persona abre, en principio, posibilidades de agentes o terapias diseñadas contra vulnerabilidades individuales, y de usos reproductivos no consentidos a partir de material genético. Hoy son escenarios lejanos y técnicamente difíciles. Pero el genoma no caduca, y el horizonte de riesgo de un dato permanente se mide en décadas, no en años. La respuesta responsable no es el pánico: es no crear el repositorio centralizado en primer lugar.

---

## 3. Los principios que guiaron el diseño

### Autonomía: consentimiento granular, revocable y con efecto real

La app separa cuatro usos en casillas independientes: cálculo local, aportación al modelo federado, estadística agregada cifrada, e investigación académica publicada. Cada una se apaga por separado y en cualquier momento.

La diferencia con el consentimiento habitual no está en la interfaz, sino en si la revocación **puede cumplirse**. Cuando una empresa tiene copia de tu genoma, revocar es pedirle que borre y confiar. Cuando el genoma nunca salió, revocar es un hecho: no hay copia que reclamar, y la aportación de la persona simplemente deja de existir a partir de la siguiente ronda.

### No maleficencia: el daño de saber

Un percentil alto puede generar ansiedad, decisiones desproporcionadas, o cirugía profiláctica no indicada. Por eso el prototipo:

- **No emite riesgo absoluto a lo largo de la vida.** Reporta posición poblacional y riesgo relativo, y dice explícitamente que el riesgo absoluto requiere un modelo clínico con historia familiar.
- **No diagnostica**, y lo declara en la propia pantalla de resultados, no en un pie de página.
- **Muestra la incertidumbre.** El aviso sobre calibración por ascendencia aparece junto al resultado, no escondido.
- **Deriva a un profesional.** Un percentil alto significa "habla con alguien sobre tamizaje", no "vas a enfermar".

### Justicia: la equidad como propiedad de la arquitectura

El 79 % de los participantes en estudios genómicos son de ascendencia europea, frente a un 16 % de la población mundial. Los puntajes poligénicos funcionan peor en todo el resto, con caídas de precisión de hasta 4.5 veces.

Se puede escribir un compromiso con la equidad en una diapositiva. O se puede construir un sistema donde la única forma de mejorar la calibración para poblaciones latinoamericanas sea incorporar cohortes latinoamericanas **sin exigirles que exporten sus genomas**. Lo segundo es lo que hace el aprendizaje federado, y es la razón de fondo por la que este proyecto es federado y no centralizado.

### Explicabilidad: el resultado tiene que ser discutible

La app muestra qué variantes pesaron, con qué genotipo, cuánto aportó cada una y en qué publicación se describió. Una persona puede llevar esa tabla a su consulta y discutirla. Un número solo, sin desglose, no es información: es una sentencia.

---

## 4. Marcos de referencia

- **Declaración Universal sobre el Genoma Humano y los Derechos Humanos** (UNESCO, 1997): el genoma humano como patrimonio de la humanidad en sentido simbólico, y la prohibición de discriminación por características genéticas.
- **Declaración Internacional sobre los Datos Genéticos Humanos** (UNESCO, 2003): consentimiento, confidencialidad y derecho a no ser informado.
- **Declaración de Helsinki** (AMM): principios para investigación con seres humanos.
- **GA4GH Framework for Responsible Sharing of Genomic and Health-Related Data**: estándar del ámbito para compartir sin ceder control.
- **Ley Federal de Protección de Datos Personales en Posesión de los Particulares** (México, vigente desde marzo de 2025): la información genética es dato personal sensible, artículo 2 fracción VI.
- **GDPR, artículo 9**: los datos genéticos son categoría especial de datos.

---

## 5. Compromisos explícitos del proyecto

1. **No se comercializan datos genómicos.** Ni identificados, ni seudonimizados, ni agregados. El modelo de negocio no depende de ello y está diseñado así a propósito.
2. **La persona no paga por acceder a sus propios datos.**
3. **Ningún resultado se comparte con aseguradoras o empleadores** sin acto expreso y separado de la persona.
4. **Los límites se publican junto al resultado**, no en un anexo.
5. **Si el proyecto quiebra, no hay nada que subastar.** Es la respuesta directa al caso 23andMe: la arquitectura hace imposible el escenario que motivó este proyecto.
