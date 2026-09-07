# Subir a GitHub y publicar la app

Tres bloques: crear tu repositorio, activar Pages, y entregar el Pull Request al repositorio oficial del concurso.

---

## 1. Subir el proyecto a tu GitHub

En GitHub, crea un repositorio **público** llamado `helix-guard`. Sin README, sin .gitignore, sin licencia: este proyecto ya los trae.

Después, en tu terminal, dentro de la carpeta descomprimida:

```bash
cd helix-guard

git init
git add .
git commit -m "HELIX GUARD: firma genética de riesgo con soberanía del dato"
git branch -M main
git remote add origin https://github.com/abivilleda28/helix-guard.git
git push -u origin main
```

Si Git te pide contraseña, usa un **token personal** (Settings → Developer settings → Personal access tokens → Fine-grained tokens, con permiso de escritura sobre ese repositorio). GitHub ya no acepta contraseñas de cuenta por HTTPS.

---

## 2. Activar GitHub Pages

El repositorio incluye `.github/workflows/pages.yml`, que compila la app, corre las 34 pruebas y publica sólo si todo pasa.

1. En tu repositorio, ve a **Settings → Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Listo. El workflow ya se disparó con tu push.

Míralo correr en la pestaña **Actions**. Tarda alrededor de un minuto.

Tu app quedará en:

```
https://abivilleda28.github.io/helix-guard/
```

Si el workflow falla, casi siempre es esto: ve a **Settings → Actions → General → Workflow permissions** y activa **Read and write permissions**.

### Comprueba que el despliegue conserva la propiedad central

Abre la URL, abre las herramientas de desarrollo en la pestaña **Red** y recarga. Debes ver un solo documento: el HTML. Ninguna tipografía, ningún CDN, ninguna analítica. El contador de la cabecera se queda en cero.

Ese es el momento que vale oro en el pitch: la afirmación se audita en vivo, en la URL pública, delante de los jueces.

---

## 3. Entregar al repositorio del concurso

El repositorio oficial de WomenCISO 4:

```
https://github.com/lorenabravo-design/Final-AI-Cibersecurity-Projects-WomenCISO-Gen-4
```

1. Haz **fork** desde la interfaz de GitHub.
2. Clónalo y crea tu carpeta:

```bash
git clone https://github.com/abivilleda28/Final-AI-Cibersecurity-Projects-WomenCISO-Gen-4.git
cd Final-AI-Cibersecurity-Projects-WomenCISO-Gen-4
mkdir -p proyectos-finales/abby-villeda
```

3. Dentro de esa carpeta pon:
   - `README.md` — usa el que viene con el proyecto, o una versión corta que enlace a tu repositorio y a la URL de Pages.
   - `presentacion.pdf` — el deck exportado a PDF.
   - `video.md` — con el enlace a tu video, si no cabe el archivo.
   - Enlace a `https://github.com/abivilleda28/helix-guard` y a la URL de Pages.

4. Sube y abre el Pull Request:

```bash
git add .
git commit -m "Proyecto final: HELIX GUARD"
git push origin main
```

Después, desde tu fork en GitHub, botón **Contribute → Open pull request**.

Fecha límite de registro: **domingo 6 de septiembre**.

---

## Qué revisar antes de entregar

- [ ] La URL de Pages abre y la app funciona en el teléfono.
- [ ] El contador de red marca cero después de recorrer los cinco pasos.
- [ ] El README del repositorio enlaza a la URL de Pages en la primera pantalla.
- [ ] El video está subido y el enlace es público, no restringido.
- [ ] El Pull Request al repositorio del concurso está abierto.
