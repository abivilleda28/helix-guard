# Marco de ciberseguridad

Este documento responde al criterio 11 de la convocatoria: cómo se protege la solución.

## 1. Qué estamos protegiendo

Los activos, ordenados por lo que costaría perderlos:

| Activo | Por qué es crítico | Dónde vive |
|---|---|---|
| Genotipos de la persona | Identifica a la persona **y a su familia**. No caduca, no se puede revocar, no se puede cambiar como una contraseña | Sólo en el dispositivo |
| Frase de paso de la bóveda | Única vía de acceso al archivo cifrado | Sólo en la memoria de la sesión |
| Actualizaciones de modelo | Pueden filtrar información sobre la cohorte de origen si no llevan ruido | En tránsito, con DP y cifrado |
| Clave privada del consorcio | Abre los resultados agregados | Gobernanza compartida, custodia con umbral |
| Registro de consentimiento | Prueba de qué autorizó cada persona y cuándo | Local, exportable |

La particularidad del dato genómico obliga a un cambio de mentalidad: **la confidencialidad tiene que ser permanente**. Una contraseña filtrada se rota. Un genoma filtrado sigue siendo válido dentro de cincuenta años, y sigue delatando a descendientes que aún no nacen.

---

## 2. Modelo de amenazas (STRIDE)

| Amenaza | Escenario concreto | Control |
|---|---|---|
| **S**poofing | Un nodo falso se hace pasar por hospital y envía actualizaciones envenenadas | Autenticación mutua TLS con certificados por nodo; alta manual en el consorcio; detección de actualizaciones anómalas por norma |
| **T**ampering | Alguien altera el archivo de genotipos o la bóveda | AES-GCM es cifrado autenticado: el descifrado falla si el texto cifrado cambió un solo bit. Huella SHA-256 visible para la persona |
| **R**epudiation | Un nodo niega haber contribuido, o alguien discute qué consintió una persona | Registro de custodia con marca temporal, exportable en JSON; en producción, anclaje criptográfico de eventos de consentimiento |
| **I**nformation disclosure | El operador de la plataforma lee la aportación de un hospital; o se reconstruye un genotipo desde el modelo | Cifrado homomórfico para lo primero; recorte por ejemplo más ruido gaussiano con ε publicado para lo segundo |
| **D**enial of service | Se satura el agregador para bloquear el entrenamiento | Degradación elegante: el PRS local sigue funcionando sin conexión. El servicio a la persona no depende del servidor |
| **E**levation of privilege | Un nodo comprometido intenta descifrar el agregado | La clave privada no está en los nodos. Custodia con umbral: hacen falta k de n partes para abrir un resultado |

### Amenazas específicas del aprendizaje federado

Tres ataques bien documentados en la literatura, con la respuesta de esta arquitectura:

**Inversión de gradientes.** Reconstruir ejemplos de entrenamiento a partir de las actualizaciones. Mitigado por el recorte por ejemplo más el ruido gaussiano, y agravadamente dificultado porque el agregador recibe la actualización cifrada, no en claro.

**Inferencia de pertenencia.** Determinar si una persona concreta estuvo en el conjunto de entrenamiento. Es exactamente lo que la privacidad diferencial acota: con ε = 3.5 y δ = 1e-5 la ventaja del atacante está formalmente limitada, y el número se publica en la interfaz en lugar de esconderse.

**Envenenamiento del modelo.** Un nodo malicioso empuja los pesos hacia un objetivo. Mitigado parcialmente por el recorte de norma, que limita cuánto puede mover un solo nodo. En producción se añadiría agregación robusta por mediana coordenada a coordenada o recorte por trimmed mean.

---

## 3. Controles implementados en el prototipo

Los que ya se pueden verificar ejecutando el código:

| Control | Implementación | Verificable en |
|---|---|---|
| Cifrado en reposo | AES-256-GCM, clave PBKDF2 con 600 000 iteraciones | `src/vault.js`, pruebas 22–26 |
| Minimización de datos | Sólo salen 7 flotantes por nodo y ronda | Tabla de transmisiones en la app |
| Privacidad diferencial | Recorte por ejemplo + ruido gaussiano + contabilidad | `src/federated.js`, panel de presupuesto |
| Confidencialidad frente al agregador | Paillier aditivo | `src/paillier.js`, prueba E(41)·E(1)=42 |
| Integridad | SHA-256 del archivo cargado | Metadatos de la bóveda |
| Trazabilidad | Línea de custodia con marca temporal, exportable | Botón de descarga en el paso 5 |
| Superficie de suministro nula | Cero dependencias, cero recursos remotos | `grep -c "https\?://" app/index.html` → 0 |
| Detección de exfiltración | Interceptor de `fetch`, `XHR`, `sendBeacon`, `WebSocket` con contador visible | Cabecera de la app |

El interceptor de red merece un comentario: no es un control de seguridad en sentido estricto, porque código malicioso podría evitarlo. Es un **instrumento de auditoría en vivo** que permite a cualquiera comprobar la afirmación central en el momento, sin leer el código. En un producto real se complementaría con una Content Security Policy restrictiva (`connect-src 'none'`) y con firma reproducible del artefacto.

---

## 4. Mapeo a NIST CSF 2.0

| Función | Qué hacemos |
|---|---|
| **Govern** | Consentimiento granular y revocable como control de primera clase, no como aviso legal. Gobernanza del consorcio con custodia de clave por umbral |
| **Identify** | Inventario de activos priorizado por irrevocabilidad del dato. Modelo de amenazas STRIDE más amenazas específicas de FL |
| **Protect** | Cifrado en reposo y en tránsito, minimización por diseño, privacidad diferencial, cifrado homomórfico, cero dependencias de terceros |
| **Detect** | Interceptor de red con registro; detección de actualizaciones anómalas por norma; CSP restrictiva en producción |
| **Respond** | El servicio a la persona degrada de forma elegante: el cálculo local funciona sin agregador. Un nodo comprometido se expulsa sin afectar a los demás |
| **Recover** | No hay base central de genomas que restaurar. Ese es el punto: la recuperación ante desastre es trivial porque el activo crítico nunca se centralizó |

## 5. Normas y marcos de referencia

- **ISO/IEC 27001** — sistema de gestión de seguridad de la información, marco general del consorcio.
- **ISO/IEC 27701** — extensión de privacidad; alinea el sistema con roles de responsable y encargado.
- **ISO 27799** — gestión de seguridad de la información en salud, específica del sector.
- **NIST SP 800-38D** — modo GCM para AES.
- **OWASP ASVS y guía de almacenamiento de contraseñas** — parámetros de PBKDF2 y controles de aplicación.
- **GA4GH Data Security Toolkit y Framework for Responsible Sharing of Genomic and Health-Related Data** — estándares específicos del ámbito genómico.
- **LFPDPPP (México, 2025)** — la información genética es dato personal sensible, artículo 2 fracción VI; autoridad: Secretaría Anticorrupción y Buen Gobierno.
- **GDPR artículo 9** — los datos genéticos son categoría especial; el tratamiento requiere base jurídica reforzada.

## 6. Lo que este prototipo todavía no protege

Decirlo es parte del marco:

- **No hay atestación del cliente.** Un navegador comprometido puede leer la memoria de la pestaña. Mitigación futura: aplicación nativa con enclave seguro.
- **No hay agregación segura con umbral.** La clave privada de Paillier está completa en una sola parte durante la demo. Producción requiere reparto de secreto.
- **No hay defensa robusta contra envenenamiento.** Sólo el recorte de norma. Falta agregación por mediana.
- **La contabilidad de privacidad es la cota pesimista.** Correcta, pero mejorable con accountant de momentos.
- **Los parámetros criptográficos son de demostración.** n = 512 bits en Paillier. Producción: n ≥ 3072 o migración a CKKS.
