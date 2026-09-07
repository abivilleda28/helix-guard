# Guion del video pitch — HELIX GUARD

**Duración total: 4:00** · Estructura pedida por la convocatoria: 15 s de introducción, 1 min de pitch, 2 min de demo, 45 s de modelo de negocio.

Cada bloque trae el texto para leer y, a la derecha, qué debe verse en pantalla. El texto está escrito para leerse en voz alta a ritmo normal (unas 150 palabras por minuto). Está medido: si lo lees tal cual, cabe.

---

## 0:00 – 0:15 · Introducción

> Soy Abby, bióloga especializada en bioinformática. Mi trabajo es el splicing alternativo: cómo una misma secuencia de ADN produce proteínas distintas según cómo se corte y se pegue. Llevo años leyendo genomas ajenos. Este proyecto nace de una pregunta incómoda que me hice trabajando con ellos: ¿de quién son esos datos cuando salen del laboratorio?

**En pantalla:** tu cara, plano medio. Al decir "splicing alternativo", un corte de dos segundos a un esquema de exones e intrones. Sin música todavía.

*Por qué funciona:* te posiciona como alguien que conoce el dato genómico por dentro, no como alguien que llegó a la genómica desde la tecnología. Es tu ventaja frente a cualquier otro equipo del concurso, y la pregunta final abre el problema sin anunciarlo.

---

## 0:15 – 1:15 · Pitch: problema, solución, valor agregado

### El problema (0:15 – 0:40)

> En marzo de 2025, 23andMe se declaró en quiebra. Los genomas de más de quince millones de personas entraron a una subasta judicial y se vendieron por trescientos cinco millones de dólares. Un millón novecientas mil personas corrieron a borrar sus datos. Llegaron tarde: un genoma no se puede anonimizar. En 2013, un equipo del MIT recuperó los apellidos de participantes de un proyecto público usando sólo el cromosoma Y y bases de datos de genealogía gratuitas. Y tu genoma no es sólo tuyo: delata a tu madre, a tus hermanas, a hijas que todavía no existen.
>
> Mientras tanto, en México más de la mitad de los cánceres de mama se diagnostican ya localmente avanzados. La detección temprana existe. La confianza para usarla, no.

**En pantalla:** titulares reales de la quiebra de 23andMe. Después, la cifra 55.9 % sobre fondo oscuro. Nada de gráficos de barras: una cifra a la vez.

### La solución (0:40 – 1:00)

> HELIX GUARD calcula tu firma genética de riesgo de cáncer de mama sin que tu genoma salga nunca de tu dispositivo.
>
> Tres piezas. Un puntaje poligénico que se calcula en tu teléfono. Un clasificador multigénico que se entrena entre hospitales por aprendizaje federado: viaja el modelo, no las pacientes. Y una capa de cifrado homomórfico que permite sumar aportaciones de varias instituciones sin que nadie pueda leer ninguna.

**En pantalla:** el diagrama de tres capas del deck, apareciendo una por una al ritmo de la frase.

### El valor agregado (1:00 – 1:15)

> Lo que nos hace distintos no es la criptografía: eso ya existe. Es a quién se la aplicamos. Lifebit u Owkin dan soberanía a los gobiernos y a las farmacéuticas. Nosotros se la damos a la paciente. Y hay un segundo motivo, científico: el setenta y nueve por ciento de los participantes en estudios genómicos son de ascendencia europea. Por eso estos puntajes funcionan peor en nosotras. La única forma de arreglarlo sin exigir que México exporte sus genomas es entrenar sin moverlos.

**En pantalla:** dos barras, AUC 0.70 en ascendencia europea contra 0.61 en africana. Es el dato que justifica todo el proyecto.

---

## 1:15 – 3:15 · Demo

Graba la pantalla con la app abierta a pantalla completa y la pestaña de red del navegador visible en una esquina. Es el detalle que convence a un jurado de ciberseguridad.

### 1:15 – 1:35 · Abre con la prueba, no con la promesa

> Antes de enseñar nada: esto es la pestaña de red del navegador. Cero peticiones. La app no carga tipografías, ni analítica, ni scripts de terceros. Y aquí arriba hay un contador que envuelve fetch, XHR y WebSocket: si algo intentara salir, subiría. Va a quedarse en cero durante toda la demo.

**En pantalla:** devtools abierto en Network, lista vacía. Zoom al contador de la cabecera.

### 1:35 – 2:00 · Bóveda y firma de riesgo

> Cargo un genoma. Se lee con la API de ficheros del navegador y se queda en la memoria de esta pestaña. Lo sello con AES-256-GCM: la clave se deriva de mi frase con seiscientas mil iteraciones de PBKDF2 y no se guarda en ningún lado.
>
> Calculo la firma. Percentil noventa y siete, riesgo relativo dos punto cinco veces la media. Un milisegundo, en este dispositivo. Y es explicable: aquí están las seis variantes que más pesaron, con su genotipo, su aporte y el paper donde se descubrió cada una.

**En pantalla:** cargar perfil sintético alto → sellar → paso 2 → calcular. Detente dos segundos en la tabla de variantes, señalando la columna "fuente".

### 2:00 – 2:35 · Federado

> Cinco nodos: hospitales de Ciudad de México, Guadalajara, Monterrey, una red comunitaria en Oaxaca y una cohorte en Bogotá. Entrenan juntos un clasificador de receptor de estrógeno.
>
> El modelo centralizado, el que exigiría juntar todos los datos en un solo servidor, llega a 0.940 de AUC. El federado llega a 0.912 sin mover un solo expediente. Sheller y su equipo publicaron exactamente este resultado en Scientific Reports: el federado retuvo el noventa y nueve por ciento del desempeño centralizado sobre diez instituciones.
>
> Y aquí está lo que cada nodo transmitió: cincuenta y seis bytes. Siete números. Ni un genotipo, ni un identificador.

**En pantalla:** clic en Entrenar. Deja que corra. Señala la comparación de barras y luego la tabla de transmisiones.

### 2:35 – 3:00 · Presupuesto de privacidad

> El ruido no es decorativo. Recortamos el gradiente de cada paciente, añadimos ruido gaussiano y contabilizamos: épsilon acumulado de 3.5 con delta de diez a la menos cinco. Si subo el ruido, épsilon baja y el AUC baja con él. Ese intercambio es real y aquí se puede tocar en vivo. Presentamos la cota pesimista a propósito: con contabilidad de momentos el número sería mejor, pero preferimos no vender una garantía que no medimos.

**En pantalla:** sube el ruido a 2.0, vuelve a entrenar, muestra cómo caen ambos números.

### 3:00 – 3:15 · Cifrado homomórfico

> Última pieza. El agregador recibe esto —texto cifrado— y calcula la suma sin descifrar nada, multiplicando cifrados módulo n cuadrado. Es Paillier real corriendo en el navegador: doce milisegundos. Nadie, ni el operador de la plataforma, puede leer la aportación de un hospital concreto.

**En pantalla:** generar claves, señalar la columna de texto cifrado, luego el resultado de la suma.

---

## 3:15 – 4:00 · Modelo de negocio

> Cobramos a tres bandas y nunca a la paciente por sus propios datos.
>
> Uno: licencia por institución. Cada hospital paga una suscripción anual por nodo federado, entre quince y cuarenta mil dólares según volumen. Es el ingreso recurrente y predecible.
>
> Dos: acceso a la red de investigación. Farmacéuticas y grupos académicos pagan por entrenar modelos sobre la red sin ver los datos, con consentimiento explícito y revocable de cada persona. Es el mismo mercado que Lifebit atiende con Genomics England, pero con la paciente en el reparto.
>
> Tres: el reporte clínico, entre cuarenta y ochenta dólares, vendido a través del sistema de salud y de aseguradoras, no directo al consumidor.
>
> El costo marginal por análisis tiende a cero porque el cómputo pesado ocurre en el dispositivo de la persona. Y el foso competitivo no es el código: es la red. Cada hospital que entra mejora la calibración para poblaciones latinoamericanas, y esa calibración es exactamente lo que nadie más tiene.
>
> Nuestro ADN no debería ser un activo concursable. HELIX GUARD lo devuelve a su dueña.

**En pantalla:** los tres flujos de ingreso como tres líneas de texto, apareciendo una por una. Cierre con el logo y la frase final sobre negro.

---

## Notas de producción

**Ritmo.** El bloque de demo es el que se desborda. Ensáyalo con cronómetro y corta la parte del presupuesto de privacidad a la mitad si vas justa: es la más técnica y la que menos se pierde.

**Grabación.** Graba la demo aparte, sin voz, y locuta encima. Intentar hablar mientras haces clics siempre sale mal.

**Lo que no debe faltar aunque haya que cortar algo:** el contador de red en cero, la comparación federado contra centralizado, y la frase de cierre.

**Preguntas que casi seguro te van a hacer, con respuesta corta:**

- *¿Cómo saben que el modelo global no filtra información de un paciente?* Recorte por ejemplo más ruido gaussiano, con épsilon medido y publicado en la interfaz. Y agregación bajo cifrado, para que el servidor no vea aportaciones individuales.
- *¿Esto está validado clínicamente?* No. Es un prototipo de investigación con panel demostrativo y datos sintéticos. El camino a validación es cargar PGS000004 del PGS Catalog y correr un estudio de calibración en cohorte mexicana. Está escrito en la app, en la sección de lo que el prototipo no hace.
- *¿Y si la persona pierde el teléfono?* La bóveda está cifrada con AES-GCM y la clave se deriva de su frase de paso, que no se almacena. Sin la frase, el archivo es ruido.
- *¿Por qué Paillier y no CKKS?* Paillier es aditivo y basta para agregar pesos y conteos, y se implementa sin dependencias en el navegador. Producción usaría CKKS sobre OpenFHE o SEAL, y así está anotado en la app.
