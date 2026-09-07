# Problema, mercado y propuesta de valor

## 1. El problema, en dos capas que se refuerzan

### Capa clínica: se detecta tarde

En 2022 se estimaron **2 296 840 casos nuevos** de cáncer de mama y **666 103 muertes** en el mundo, lo que representa el 23.8 % de todos los cánceres en mujeres y el 15.4 % de las muertes por cáncer en mujeres. Las proyecciones sobre GLOBOCAN apuntan a 3.55 millones de casos y 1.14 millones de muertes hacia 2050 si las tendencias siguen igual.

La supervivencia depende brutalmente del estadio al diagnóstico, y ahí es donde el mapa se parte:

- En países de ingreso alto, la supervivencia a cinco años supera el 90 %.
- Cerca del **80 % de las muertes por cáncer de mama y cervical ocurre en países de ingreso bajo y medio**.
- En México, el Consenso Mexicano sobre diagnóstico y tratamiento del cáncer mamario reporta que el **55.9 % se diagnostica en etapas localmente avanzadas (IIb–III)** y el **10.5 % en etapa metastásica**. El Instituto Nacional de Cancerología señala que más del 60 % de los casos llega en etapas avanzadas.

La OMS fijó la meta con su Iniciativa Mundial contra el Cáncer de Mama: reducir la mortalidad **2.5 % anual** para evitar 2.5 millones de muertes entre 2020 y 2040, con tres pilares. El primero es que **al menos el 60 % de los cánceres invasivos se diagnostiquen en estadio I o II**.

Para llegar ahí hace falta estratificar riesgo: saber a quién tamizar más seguido y desde qué edad. La genómica ya puede hacerlo. El obstáculo no es técnico.

### Capa de confianza: quien entrega su genoma pierde el control

**23andMe se declaró en Capítulo 11 en marzo de 2025**, tras caer de una valuación pico de 6 000 millones de dólares y arrastrar una filtración que afectó a 6.9 millones de clientes. Una subasta en dos etapas terminó con la venta de la empresa —incluyendo los datos genéticos de más de 15 millones de personas— por **305 millones de dólares** a TTAM Research Institute, entidad fundada por la propia cofundadora, por encima de la oferta de 256 millones de Regeneron. Más de dos docenas de estados demandaron para frenar la operación argumentando que la información genética es un tipo de propiedad fundamentalmente distinto al que suele cambiar de manos en una quiebra; California, Kentucky, Tennessee, Texas y Utah se mantuvieron opuestos hasta el final. **Alrededor de 1.9 millones de consumidores borraron sus datos** durante el proceso.

Y borrar llega tarde por construcción. **Gymrek, McGuire, Golan, Halperin y Erlich demostraron en *Science* (2013)** que se pueden recuperar apellidos de genomas "anonimizados" perfilando repeticiones cortas en tándem del cromosoma Y y consultando bases de genealogía recreativa gratuitas y de acceso público. Combinando el apellido con edad y estado, re-identificaron a participantes de proyectos públicos de secuenciación. No hubo hackeo: sólo internet.

A esto se suma que **la ley no cubre el hueco**:

- En Estados Unidos, GINA protege frente a discriminación en seguro de salud y empleo, pero **no aplica a seguros de vida, de discapacidad ni de cuidados de largo plazo**, ni a empleadores de menos de 15 trabajadores.
- En México, la nueva **Ley Federal de Protección de Datos Personales en Posesión de los Particulares**, publicada el 20 de marzo de 2025 y vigente desde el 21, clasifica explícitamente la **información genética** como dato personal sensible en su artículo 2, fracción VI. La supervisión pasó del extinto INAI a la Secretaría Anticorrupción y Buen Gobierno.
- El sector salud es el más caro cuando falla: **7.42 millones de dólares por brecha en 2025**, el más alto de todas las industrias por decimocuarto año consecutivo, con 279 días promedio para identificar y contener.

**El resultado es un círculo cerrado.** La estratificación genética de riesgo podría adelantar diagnósticos y salvar vidas. Pero exige entregar el dato más íntimo e irrevocable que existe a una empresa que puede quebrar, ser vendida o ser filtrada. Quien tiene motivos para desconfiar, no participa. Y quien no participa es, de nuevo, la población que menos representación tiene en los datos.

### El sesgo que cierra el círculo

Alrededor del **79 % de los participantes en estudios de asociación genómica son de ascendencia europea**, pese a que ese grupo representa cerca del 16 % de la población mundial. Y la fracción de participantes no europeos se estancó o cayó desde finales de 2014.

Las consecuencias son medibles en el propio puntaje que este proyecto usa. El PRS313 de Mavaddat y colaboradores alcanza:

| Ascendencia | AUC | Odds ratio por desviación estándar |
|---|---|---|
| Europea | 0.70 | 1.61 |
| Latina / hispana | 0.68 | 1.51 |
| Asiática oriental | 0.64 | 1.46 |
| Africana | 0.61 | 1.31 |

Martin y colaboradores mostraron en *Nature Genetics* (2019) que la precisión de los puntajes poligénicos cae del orden de 4.5 veces en poblaciones de ascendencia africana, 2 veces en asiáticas orientales y 1.6 veces en hispanas o latinas, frente a las europeas. Y demostraron el lado positivo: al recalcular con BioBank Japan, la precisión para asiáticos orientales subió alrededor de un 50 %.

**La conclusión operativa:** el problema se arregla con cohortes locales. Pero pedirle a México, Colombia o Perú que exporten sus genomas para arreglarlo reproduce exactamente la pérdida de soberanía que genera la desconfianza. El aprendizaje federado rompe ese nudo.

---

## 2. Mercado y competencia

### Mapa del terreno

El espacio se divide en dos bloques y ninguno cubre el hueco.

**Bloque A — genómica de consumo y diagnóstico clínico.** Centralizan el genoma.

| Actor | Qué ofrece | Dónde queda el genoma |
|---|---|---|
| 23andMe / TTAM | Ancestría y rasgos de salud al consumidor | Servidores de la empresa. Fue vendido en quiebra |
| Myriad Genetics (MyRisk + RiskScore) | Panel de 48 genes hereditarios más PRS multiancestría combinado con Tyrer-Cuzick. Validado en más de 130 000 mujeres; duplica la capacidad predictiva de Tyrer-Cuzick solo | Laboratorio central |
| Color, Invitae, Ambry | Paneles hereditarios con consejería | Laboratorio central |

Myriad es el competidor clínico serio, y es honesto reconocerlo: su RiskScore multiancestría es mejor ciencia aplicada que cualquier panel demostrativo. Pero el modelo es el de siempre: la muestra viaja al laboratorio, el dato se queda ahí, y la persona recibe un PDF.

**Bloque B — plataformas federadas para instituciones.** Resuelven soberanía, pero no la de la paciente.

| Actor | Qué ofrece | De quién es la soberanía |
|---|---|---|
| Lifebit | Plataforma federada de datos genómicos; despliegues documentados con Genomics England, NIH y el Ministerio de Salud de Singapur; el cómputo va al dato | Del Estado o del programa nacional |
| Apheris | Cómputo federado para descubrimiento de fármacos; despliegue local para que la farmacéutica conserve soberanía sobre IP sensible | De la farmacéutica |
| Owkin, Rhino Health, NVIDIA FLARE, Flower | Infraestructura de aprendizaje federado en salud | Del hospital o del consorcio |

### El hueco

Nadie devuelve a la persona un resultado clínicamente interpretable manteniendo el genoma en su dispositivo.

```
                    soberanía institucional
                              │
        Lifebit ● Apheris ●   │   ● Owkin
                              │
   sin resultado ─────────────┼───────────── resultado clínico
   para la paciente           │              para la paciente
                              │   ● Myriad   ● 23andMe
                              │
                    soberanía de la persona
                              ▲
                         HELIX GUARD
```

El cuadrante inferior derecho está vacío. Ahí vamos.

### Tamaño

Es un mercado con dos motores independientes que crecen a la vez: el de pruebas genéticas hereditarias, empujado por la incidencia creciente y por la incorporación de PRS multiancestría, y el de aprendizaje federado en salud, empujado por regímenes de soberanía de datos cada vez más estrictos (GDPR, la nueva ley mexicana, leyes de localización en Asia). HELIX GUARD se sitúa en la intersección, que es donde ninguno de los dos bloques opera hoy.

---

## 3. Propuesta de valor

### Una frase

**El genoma se queda contigo; lo que viaja es matemática.**

### Cuatro afirmaciones, cada una verificable en el prototipo

**1. Cero transmisión del genoma, comprobable en treinta segundos.** La app no carga ni una tipografía externa. `grep -c "https\?://" app/index.html` devuelve cero, y un interceptor envuelve `fetch`, `XHR`, `sendBeacon` y `WebSocket` con un contador visible en la cabecera. No es una promesa de política de privacidad: es una propiedad que el jurado puede auditar en la pestaña de red.

**2. Federado sin sacrificar desempeño.** En el prototipo, AUC 0.912 federado contra 0.940 centralizado. Sheller y colaboradores reportaron en *Scientific Reports* (2020) que el modelo federado sobre diez instituciones alcanzó el 99 % del desempeño del entrenado con datos agrupados, superando a otros métodos colaborativos que preservan privacidad.

**3. Agregación que ni el operador puede leer.** Paillier real en el navegador: el agregador multiplica textos cifrados módulo n² y obtiene la suma sin descifrar ningún sumando. La viabilidad a escala genómica está demostrada: en la competencia iDASH 2018, las soluciones de Duality y UCSD completaron un GWAS completo para 1 000 individuos en aproximadamente cuatro y dos minutos respectivamente, y el cómputo seguro sobre 15 000 SNP se logró en menos de dos minutos.

**4. Equidad como consecuencia de la arquitectura, no como declaración.** Cada hospital latinoamericano que se suma mejora la calibración del modelo para su población sin exportar un solo expediente. Es la única vía que no obliga a elegir entre precisión y soberanía.

### Valor para cada parte

| Para quién | Qué gana |
|---|---|
| La persona | Un percentil explicable, con las variantes que pesaron y su fuente. Consentimiento granular y revocable. Derecho al olvido que no depende de la buena voluntad de nadie, porque no hay copia externa |
| El hospital | Participa en un modelo entrenado con muchas más pacientes de las que tiene, sin exponerse a la responsabilidad de transferir datos ni al costo de una brecha de 7.42 millones |
| El sistema de salud | Tamizaje dirigido por riesgo, alineado con el pilar 1 de la Iniciativa Mundial de la OMS |
| La ciencia | Calibración de puntajes poligénicos en poblaciones subrepresentadas, que es el cuello de botella reconocido del campo |
