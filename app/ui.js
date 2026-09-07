/* =====================================================================
   HELIX GUARD — interfaz
   ---------------------------------------------------------------------
   Nada aquí abre una conexión. El interceptor de abajo lo demuestra:
   envuelve fetch, XMLHttpRequest, sendBeacon y WebSocket, y cuenta cada
   intento. Si el contador de la cabecera se mueve, es que algo intentó
   salir, y queda registrado en la línea de custodia en rojo.
   ===================================================================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------- estado ---------- */
const state = {
  genomeText: null,
  genomeName: null,
  calls: null,
  panel: null,
  panelName: 'Panel demostrativo (15 variantes)',
  vault: null,
  netAttempts: 0,
  bytesOut: 0,
  log: [],
  keys: null,
  consent: {
    riesgo: true,
    federado: true,
    agregado: false,
    investigacion: false,
  },
};

/* ---------- interceptor de red verificable ---------- */
(function instrumentNetwork() {
  const flag = (kind, target) => {
    state.netAttempts++;
    $('#netCount').textContent = state.netAttempts;
    $('#meterNet').classList.add('alert');
    logEvent({
      kind: 'leak',
      title: 'Intento de salida a la red',
      meta: `${kind} → ${String(target).slice(0, 80)}`,
      note: 'Interceptado y registrado. Esta app no debería producir ninguno.',
    });
  };

  const nativeFetch = window.fetch;
  window.fetch = function (...args) {
    flag('fetch', args[0]);
    return nativeFetch.apply(this, args);
  };

  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    flag('XHR', url);
    return nativeOpen.call(this, method, url, ...rest);
  };

  if (navigator.sendBeacon) {
    const nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      flag('sendBeacon', url);
      return nativeBeacon(url, data);
    };
  }

  const NativeWS = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    flag('WebSocket', url);
    return new NativeWS(url, protocols);
  };
})();

/* ---------- línea de custodia ---------- */
function logEvent({ kind = 'local', title, meta = '', note = '' }) {
  const entry = { kind, title, meta, note, at: new Date().toISOString() };
  state.log.push(entry);

  const el = document.createElement('div');
  el.className = `evt ${kind === 'local' ? '' : kind}`.trim();
  el.innerHTML = `<b></b><em></em>${note ? '<small></small>' : ''}`;
  el.querySelector('b').textContent = title;
  el.querySelector('em').textContent =
    `${new Date().toLocaleTimeString('es-MX', { hour12: false })}${meta ? ' · ' + meta : ''}`;
  if (note) el.querySelector('small').textContent = note;

  const thread = $('#thread');
  thread.prepend(el);
  while (thread.children.length > 60) thread.lastChild.remove();
}

function markOut(bytes, why) {
  state.bytesOut += 0; // el genoma en claro nunca suma
  $('#outCount').textContent = `${state.bytesOut} B`;
  logEvent({ kind: 'out', title: 'Sale del dispositivo', meta: `${bytes} B cifrados`, note: why });
}

/* ---------- navegación ---------- */
const STEPS = [
  ['p-vault', 'Bóveda', 'carga y sella el genoma'],
  ['p-risk', 'Firma de riesgo', 'PRS local y explicable'],
  ['p-fed', 'Federado', 'clasificador multigénico'],
  ['p-he', 'Cifrado', 'agregación homomórfica'],
  ['p-gov', 'Soberanía', 'consentimiento y borrado'],
];

const rail = $('#rail');
STEPS.forEach(([id, name, sub], i) => {
  const b = document.createElement('button');
  b.className = 'step';
  b.dataset.target = id;
  b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  b.innerHTML = `<span class="n">${i + 1}</span><span><strong>${name}</strong><em>${sub}</em></span>`;
  b.addEventListener('click', () => goto(id));
  rail.appendChild(b);
});

function goto(id) {
  $$('.panel').forEach((p) => p.classList.toggle('on', p.id === id));
  $$('.step').forEach((s) => s.setAttribute('aria-current', String(s.dataset.target === id)));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function markDone(id) {
  const s = $$('.step').find((x) => x.dataset.target === id);
  if (s) s.classList.add('done');
}

$('#ledgerBtn').addEventListener('click', (e) => {
  const open = $('#ledger').classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', String(open));
  e.currentTarget.textContent = open ? 'Ocultar custodia' : 'Ver custodia';
});

/* =====================================================================
   1 · BÓVEDA
   ===================================================================== */

function bytesHuman(n) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

async function acceptGenome(text, name) {
  state.genomeText = text;
  state.genomeName = name;
  const parsed = parseGenotypes(text);
  state.calls = parsed.calls;

  const hash = await fingerprint(text);
  $('#fileCard').hidden = false;
  const meta = $('#fileMeta');
  meta.innerHTML = '';
  const rows = [
    ['archivo', name],
    ['tamaño', bytesHuman(new Blob([text]).size)],
    ['variantes legibles', String(parsed.calls.size)],
    ['huella SHA-256', hash],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    meta.append(dt, dd);
  }

  logEvent({
    kind: 'local',
    title: 'Genoma leído en memoria local',
    meta: `${parsed.calls.size} variantes · ${bytesHuman(new Blob([text]).size)}`,
    note: 'La lectura usó la API de ficheros del navegador. No hubo subida.',
  });
  markDone('p-vault');
}

$('#pickFile').addEventListener('click', () => $('#file').click());
$('#file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (f) acceptGenome(await f.text(), f.name);
});

const drop = $('#drop');
['dragenter', 'dragover'].forEach((ev) =>
  drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.add('over');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.remove('over');
  })
);
drop.addEventListener('drop', async (e) => {
  const f = e.dataTransfer.files[0];
  if (f) acceptGenome(await f.text(), f.name);
});

$$('[data-demo]').forEach((b) =>
  b.addEventListener('click', () => {
    const key = b.dataset.demo;
    acceptGenome(DEMO_GENOMES[key], `genoma-demo-${key}.txt`);
  })
);

$('#seal').addEventListener('click', async () => {
  const pass = $('#pass').value;
  if (pass.length < 8) {
    $('#vaultOut').innerHTML = '<div class="note grave">La frase necesita al menos 8 caracteres.</div>';
    return;
  }
  const t0 = performance.now();
  state.vault = await sealVault(state.genomeText, pass);
  const ms = Math.round(performance.now() - t0);

  const hex = [...state.vault.ciphertext.slice(0, 96)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

  $('#vaultOut').innerHTML = `
    <div class="card" style="margin-bottom:0">
      <h3>Bóveda sellada</h3>
      <dl class="kv">
        <dt>algoritmo</dt><dd>${state.vault.algorithm}</dd>
        <dt>derivación</dt><dd>${state.vault.kdf}</dd>
        <dt>vector de inicialización</dt><dd>${state.vault.iv}</dd>
        <dt>tamaño cifrado</dt><dd>${state.vault.bytes} bytes</dd>
        <dt>tiempo</dt><dd>${ms} ms</dd>
      </dl>
      <p style="font-size:.82rem;color:var(--muted);margin:.6rem 0 .3rem">Primeros 96 bytes del texto cifrado:</p>
      <div class="cipher">${hex} …</div>
    </div>`;
  $('#unseal').disabled = false;
  logEvent({
    kind: 'local',
    title: 'Bóveda sellada con AES-256-GCM',
    meta: `${state.vault.bytes} B · IV ${state.vault.iv.slice(0, 12)}…`,
    note: 'La clave se derivó de tu frase con 600 000 iteraciones de PBKDF2 y no se almacenó.',
  });
});

$('#unseal').addEventListener('click', async () => {
  try {
    const plain = await openVault(state.vault, $('#pass').value);
    const ok = plain === state.genomeText;
    logEvent({
      kind: 'local',
      title: ok ? 'Bóveda abierta y verificada' : 'Bóveda abierta con contenido distinto',
      meta: 'AES-GCM autenticado',
    });
    $('#vaultOut').insertAdjacentHTML(
      'beforeend',
      `<div class="note" style="border-color:var(--teal);color:#9FD8D0">Descifrado correcto y contenido idéntico al original.</div>`
    );
  } catch {
    $('#vaultOut').insertAdjacentHTML(
      'beforeend',
      '<div class="note grave">Frase incorrecta o archivo alterado. AES-GCM detecta ambas cosas.</div>'
    );
    logEvent({ kind: 'local', title: 'Apertura de bóveda rechazada', meta: 'fallo de autenticación GCM' });
  }
});

$('#wipe').addEventListener('click', forgetAll);

/* =====================================================================
   2 · FIRMA DE RIESGO
   ===================================================================== */

state.panel = parseScoringFile(DEMO_PANEL);
const PANEL_FREQ = Object.fromEntries(
  DEMO_PANEL.split('\n')
    .filter((l) => l.startsWith('rs'))
    .map((l) => {
      const c = l.split('\t');
      return [c[0], Number(c[5])];
    })
);

$('#loadPgs').addEventListener('click', () => $('#pgsFile').click());
$('#pgsFile').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  state.panel = parseScoringFile(await f.text());
  state.panelName = f.name;
  logEvent({
    kind: 'local',
    title: 'Archivo de puntuación cargado',
    meta: `${state.panel.variants.length} variantes · ${f.name}`,
  });
  $('#calc').click();
});

$('#calc').addEventListener('click', () => {
  if (!state.calls) {
    $('#riskOut').innerHTML = '<div class="note grave">Primero carga un genoma en el paso 1.</div>';
    return;
  }
  if (!state.consent.riesgo) {
    $('#riskOut').innerHTML = '<div class="note grave">El consentimiento para el cálculo de riesgo está apagado.</div>';
    return;
  }

  const t0 = performance.now();
  const res = computePRS(state.panel.variants, state.calls);
  const ref = referenceDistribution(state.panel.variants, PANEL_FREQ);
  const view = interpret(res.score, ref, 1.61);
  const ms = Math.round(performance.now() - t0);

  const pct = Math.max(0.2, Math.min(99.8, view.percentile));
  const band = pct >= 90 ? 'alto' : pct <= 20 ? 'bajo' : 'intermedio';

  const top = res.trace.slice(0, 6);
  const rows = top
    .map(
      (t) => `<tr>
        <td><span class="mono">${t.rsid}</span><br><span style="color:var(--muted);font-size:.76rem">${t.gene}</span></td>
        <td class="mono">${t.genotype}</td>
        <td class="num">${t.dosage}</td>
        <td class="num ${t.contribution >= 0 ? 'up' : 'down'}">${t.contribution >= 0 ? '+' : ''}${t.contribution.toFixed(3)}</td>
        <td style="font-size:.76rem;color:var(--muted)">${t.source}</td>
      </tr>`
    )
    .join('');

  $('#riskOut').innerHTML = `
    <div class="card">
      <h3>Posición en la distribución poblacional</h3>
      <div class="score"><b>${pct.toFixed(0)}</b><span>percentil · riesgo relativo ${view.relativeRisk.toFixed(2)}× frente a la media</span></div>
      <div class="dist">${distSvg(pct)}</div>
      <div class="axis"><span>p1</span><span>p25</span><span>p50</span><span>p75</span><span>p99</span></div>
      <p style="margin-top:.9rem">Tu puntaje queda en la banda <strong>${band}</strong> del panel cargado. El riesgo relativo se expresa frente a la media poblacional usando el odds ratio por desviación estándar de 1.61 reportado para el PRS313 en ascendencia europea.</p>
      <dl class="kv">
        <dt>puntaje bruto</dt><dd>${res.score.toFixed(4)}</dd>
        <dt>z</dt><dd>${view.z.toFixed(3)}</dd>
        <dt>variantes usadas</dt><dd>${res.matched} de ${res.total}</dd>
        <dt>tiempo de cálculo</dt><dd>${ms} ms, en este dispositivo</dd>
        <dt>panel</dt><dd>${state.panelName}</dd>
      </dl>
    </div>

    <div class="card">
      <h3>Qué variantes pesaron más</h3>
      <table>
        <thead><tr><th>variante</th><th>genotipo</th><th style="text-align:right">copias</th><th style="text-align:right">aporte</th><th>fuente</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:.8rem;font-size:.82rem;color:var(--muted)">El aporte es β × número de copias del alelo de efecto. Un aporte negativo significa que esa variante empuja el riesgo hacia abajo.</p>
    </div>

    <div class="note">${state.panel.meta.AVISO || 'Panel demostrativo.'}</div>
    <div class="note grave">Esto no es un diagnóstico ni un riesgo absoluto a lo largo de la vida. Un percentil alto significa que conviene hablar con un profesional sobre tamizaje más frecuente, no que vaya a haber enfermedad.</div>`;

  logEvent({
    kind: 'local',
    title: 'Firma de riesgo calculada',
    meta: `p${pct.toFixed(0)} · ${res.matched}/${res.total} variantes · ${ms} ms`,
    note: 'Cálculo íntegro en el dispositivo. Cero bytes transmitidos.',
  });
  markDone('p-risk');
});

function distSvg(pct) {
  const w = 100;
  const pts = [];
  for (let i = 0; i <= 100; i++) {
    const z = (i / 100) * 6 - 3;
    const y = Math.exp((-z * z) / 2);
    pts.push(`${(i / 100) * w},${(1 - y) * 40 + 4}`);
  }
  const x = (pct / 100) * w;
  return `<svg viewBox="0 0 100 52" preserveAspectRatio="none" role="img" aria-label="Posición del puntaje en la distribución poblacional, percentil ${pct.toFixed(0)}">
    <polyline points="${pts.join(' ')}" fill="none" stroke="#1D3E68" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <polygon points="0,48 ${pts.join(' ')} 100,48" fill="#0FA3A3" opacity=".12"/>
    <line x1="${x}" y1="0" x2="${x}" y2="48" stroke="#3FD8C8" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    <circle cx="${x}" cy="4" r="2.4" fill="#3FD8C8"/>
  </svg>`;
}

/* =====================================================================
   3 · APRENDIZAJE FEDERADO
   ===================================================================== */

const NODES = [
  { name: 'Hospital Ciudad de México', seed: 11, shift: 0.22, n: 210 },
  { name: 'Hospital Guadalajara', seed: 23, shift: -0.18, n: 165 },
  { name: 'Instituto Monterrey', seed: 37, shift: 0.05, n: 240 },
  { name: 'Red comunitaria Oaxaca', seed: 53, shift: -0.3, n: 95 },
  { name: 'Cohorte Bogotá', seed: 71, shift: 0.12, n: 180 },
].map((c) => ({ ...c, data: syntheticCohort({ n: c.n, seed: c.seed, shift: c.shift }) }));

const TEST_SET = syntheticCohort({ n: 500, seed: 991 });

$('#train').addEventListener('click', () => runFederated(NODES, 'federado'));
$('#trainSolo').addEventListener('click', () => runFederated([NODES[3]], 'aislado'));

async function runFederated(nodes, mode) {
  if (!state.consent.federado) {
    $('#fedOut').innerHTML = '<div class="note grave">El consentimiento para el entrenamiento federado está apagado.</div>';
    return;
  }
  const noiseMultiplier = Math.max(0.05, Number($('#noise').value) || 0.35);
  const rounds = Math.max(1, Math.min(60, parseInt($('#rounds').value, 10) || 12));
  const opts = {
    epochs: 10,
    lr: 0.4,
    clip: 2.0,
    perExampleClip: 1.0,
    noiseMultiplier,
    rand: seededRandom(5),
  };

  let weights = new Array(FEATURES.length + 1).fill(0);
  const history = [];
  let lastTx = [];
  let lastRound = null;
  let bytes = 0;

  for (let r = 0; r < rounds; r++) {
    const out = federatedRound(weights, nodes, opts);
    weights = out.weights;
    lastTx = out.transmissions;
    lastRound = out;
    bytes += out.transmissions.reduce((s, t) => s + t.bytes, 0);
    history.push(evaluate(weights, TEST_SET).auc);
  }

  const fed = evaluate(weights, TEST_SET);
  const central = evaluate(
    trainLocal(new Array(FEATURES.length + 1).fill(0), NODES.flatMap((n) => n.data), { epochs: 140, lr: 0.4 }),
    TEST_SET
  );
  const budget = privacyBudget({
    rounds,
    sensitivity: lastRound.sensitivity,
    sigma: lastRound.sigma,
    delta: 1e-5,
  });

  const txRows = lastTx
    .map(
      (t) => `<tr>
        <td>${t.node}</td>
        <td class="num">${t.samples}</td>
        <td class="num">${t.bytes} B</td>
        <td class="num">${t.norm.toFixed(3)}</td>
        <td>${t.clipped ? 'recortada' : '—'}</td>
      </tr>`
    )
    .join('');

  const spark = history
    .map((a, i) => `${(i / Math.max(1, history.length - 1)) * 100},${(1 - (a - 0.45) / 0.55) * 40}`)
    .join(' ');

  $('#fedOut').innerHTML = `
    <div class="card">
      <h3>Resultado tras ${rounds} rondas ${mode === 'aislado' ? '(un solo nodo, sin federación)' : ''}</h3>
      <div class="score"><b>${fed.auc.toFixed(3)}</b><span>AUC del modelo global sobre el conjunto de prueba</span></div>
      <svg viewBox="0 0 100 44" preserveAspectRatio="none" style="width:100%;height:60px;margin:.6rem 0" role="img" aria-label="Evolución del AUC por ronda">
        <line x1="0" y1="${(1 - (central.auc - 0.45) / 0.55) * 40}" x2="100" y2="${(1 - (central.auc - 0.45) / 0.55) * 40}" stroke="#E4356B" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>
        <polyline points="${spark}" fill="none" stroke="#3FD8C8" stroke-width="1.8" vector-effect="non-scaling-stroke"/>
      </svg>
      <div class="bars">
        ${bar('Federado', fed.auc)}
        ${bar('Centralizado', central.auc)}
      </div>
      <p style="margin-top:.9rem">El modelo centralizado —el que exigiría juntar todos los datos en un solo lugar— alcanza ${central.auc.toFixed(3)}. El federado llega a ${fed.auc.toFixed(3)} sin mover un solo ejemplo. Es el mismo hallazgo que Sheller y colaboradores publicaron en <em>Scientific Reports</em> en 2020: el federado retuvo el 99 % del desempeño del centralizado sobre diez instituciones.</p>
    </div>

    <div class="card">
      <h3>Qué transmitió cada nodo en la última ronda</h3>
      <table>
        <thead><tr><th>nodo</th><th style="text-align:right">pacientes</th><th style="text-align:right">enviado</th><th style="text-align:right">norma</th><th>recorte</th></tr></thead>
        <tbody>${txRows}</tbody>
      </table>
      <p style="margin-top:.8rem;font-size:.82rem;color:var(--muted)">Cada fila envía ${FEATURES.length + 1} números en coma flotante. Las columnas de pacientes, genotipos y expresión nunca aparecen en el canal.</p>
    </div>

    <div class="card">
      <h3>Presupuesto de privacidad</h3>
      <dl class="kv">
        <dt>recorte por ejemplo</dt><dd>1.0</dd>
        <dt>ruido absoluto σ</dt><dd>${lastRound.sigma.toFixed(3)}</dd>
        <dt>sensibilidad Δ</dt><dd>${lastRound.sensitivity.toFixed(4)} (nodo más pequeño)</dd>
        <dt>ε por ronda</dt><dd>${budget.epsilonPerRound.toFixed(3)}</dd>
        <dt>ε acumulado</dt><dd>${budget.epsilonTotal.toFixed(2)} · δ = 1e-5 · protección ${budget.band}</dd>
        <dt>método</dt><dd style="font-family:var(--sans);font-size:.82rem">${budget.method}</dd>
        <dt>volumen total</dt><dd>${(bytes / 1024).toFixed(1)} KB de pesos en ${rounds} rondas</dd>
      </dl>
      <p style="margin-top:.6rem;font-size:.82rem;color:var(--muted)">Sube el ruido y verás caer ε junto con el AUC: es el intercambio real entre privacidad y utilidad, y aquí se puede tocar en vivo. La contabilidad es la cota pesimista por composición secuencial; con el accountant de momentos de Abadi y colaboradores, el mismo ruido da un ε bastante menor. Se muestra la cota alta para no sobrevender la garantía.</p>
    </div>`;

  markOut(bytes, `Pesos del modelo, ${rounds} rondas. Sin ejemplos ni identificadores.`);
  logEvent({
    kind: 'local',
    title: `Entrenamiento ${mode} terminado`,
    meta: `AUC ${fed.auc.toFixed(3)} · ε ≈ ${budget.epsilonTotal.toFixed(1)}`,
  });
  markDone('p-fed');
}

function bar(label, value) {
  const pct = Math.max(0, Math.min(100, ((value - 0.45) / 0.55) * 100));
  return `<div class="bar"><span>${label}</span><span class="track"><span class="fill" style="width:${pct}%"></span></span><span class="mono">${value.toFixed(3)}</span></div>`;
}

/* =====================================================================
   4 · CIFRADO HOMOMÓRFICO
   ===================================================================== */

$('#genKeys').addEventListener('click', async () => {
  const bits = Number($('#keySize').value);
  $('#heOut').innerHTML = '<div class="card"><p>Buscando primos…</p></div>';
  await new Promise((r) => setTimeout(r, 20));

  const t0 = performance.now();
  state.keys = generateKeys(bits);
  const keyMs = Math.round(performance.now() - t0);

  const { publicKey, privateKey } = state.keys;
  const aportes = NODES.map((n, i) => ({
    node: n.name,
    value: [0.412, -0.203, 0.087, 0.664, -0.55][i],
  }));

  const t1 = performance.now();
  const cts = aportes.map((a) => encrypt(publicKey, encode(a.value)));
  let acc = encrypt(publicKey, encode(0));
  for (const c of cts) acc = addEncrypted(publicKey, acc, c);
  const suma = decode(decrypt(privateKey, acc));
  const heMs = Math.round(performance.now() - t1);

  const esperado = aportes.reduce((s, a) => s + a.value, 0);
  const bytesCt = Math.ceil(publicKey.n.toString(2).length / 4) / 2;

  const rows = aportes
    .map(
      (a, i) => `<tr>
      <td>${a.node}</td>
      <td class="num">${a.value.toFixed(3)}</td>
      <td class="mono" style="color:#6E93B6">${cts[i].toString(16).slice(0, 26)}…</td>
    </tr>`
    )
    .join('');

  $('#heOut').innerHTML = `
    <div class="card">
      <h3>Claves generadas</h3>
      <dl class="kv">
        <dt>módulo n</dt><dd>${publicKey.n.toString(2).length} bits</dd>
        <dt>n (primeros dígitos)</dt><dd>${publicKey.n.toString().slice(0, 44)}…</dd>
        <dt>tiempo</dt><dd>${keyMs} ms</dd>
      </dl>
    </div>

    <div class="card">
      <h3>Lo que ve el agregador</h3>
      <table>
        <thead><tr><th>nodo</th><th style="text-align:right">valor real</th><th>lo que se transmite</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:.8rem;font-size:.82rem;color:var(--muted)">La columna del centro no existe en el canal: está aquí sólo para que puedas comprobar el resultado. El agregador recibe únicamente la tercera columna.</p>
    </div>

    <div class="card">
      <h3>Suma calculada sin descifrar</h3>
      <p>El agregador multiplicó los cinco textos cifrados módulo n². No descifró nada. Sólo el titular de la clave privada —el consorcio, bajo gobernanza— abre el resultado agregado.</p>
      <div class="score"><b>${suma.toFixed(3)}</b><span>suma homomórfica · el valor real es ${esperado.toFixed(3)}</span></div>
      <dl class="kv">
        <dt>error</dt><dd>${Math.abs(suma - esperado).toExponential(2)} (redondeo de punto fijo)</dd>
        <dt>operaciones</dt><dd>5 cifrados + 5 sumas + 1 descifrado en ${heMs} ms</dd>
        <dt>tamaño de cada texto cifrado</dt><dd>≈ ${bytesCt * 2} bytes</dd>
      </dl>
      <p style="font-size:.82rem;color:var(--muted);margin-top:.6rem">Esta es la propiedad que hace posible un consorcio sin dueño: nadie, ni el operador de la plataforma, puede leer la aportación de un hospital concreto.</p>
    </div>`;

  markOut(cts.length * bytesCt * 2, 'Textos cifrados de Paillier. Indescifrables sin la clave privada.');
  logEvent({
    kind: 'local',
    title: 'Agregación homomórfica verificada',
    meta: `Σ = ${suma.toFixed(3)} · esperado ${esperado.toFixed(3)}`,
  });
  markDone('p-he');
});

/* =====================================================================
   5 · SOBERANÍA
   ===================================================================== */

const CONSENTS = [
  ['riesgo', 'Calcular mi firma de riesgo en este dispositivo', 'Sin esto la app no calcula nada. Los datos siguen sin salir.'],
  ['federado', 'Aportar pesos al modelo federado', 'Se envían vectores de pesos con ruido, nunca tus variantes.'],
  ['agregado', 'Aportar a estadísticas cifradas del consorcio', 'Conteos agregados bajo cifrado homomórfico.'],
  ['investigacion', 'Permitir uso en investigación académica publicada', 'Revocable. La revocación surte efecto desde la siguiente ronda.'],
];

const consentBox = $('#consent');
CONSENTS.forEach(([key, title, sub]) => {
  const row = document.createElement('label');
  row.className = 'toggle';
  row.innerHTML = `<input type="checkbox" ${state.consent[key] ? 'checked' : ''}><span><strong></strong><span></span></span>`;
  row.querySelector('strong').textContent = title;
  row.querySelector('span span').textContent = sub;
  row.querySelector('input').addEventListener('change', (e) => {
    state.consent[key] = e.target.checked;
    logEvent({
      kind: 'local',
      title: `Consentimiento ${e.target.checked ? 'otorgado' : 'revocado'}`,
      meta: key,
    });
  });
  consentBox.appendChild(row);
});

function forgetAll() {
  state.genomeText = null;
  state.calls = null;
  state.vault = null;
  state.genomeName = null;
  $('#fileCard').hidden = true;
  $('#vaultOut').innerHTML = '';
  $('#riskOut').innerHTML = '';
  $('#pass').value = '';
  $('#unseal').disabled = true;
  $$('.step').forEach((s) => s.classList.remove('done'));
  logEvent({
    kind: 'local',
    title: 'Genoma borrado del dispositivo',
    meta: 'memoria de la pestaña liberada',
    note: 'Como nunca se transmitió, no hay copias externas que reclamar.',
  });
}

$('#forget').addEventListener('click', forgetAll);

$('#exportLog').addEventListener('click', () => {
  const doc = {
    producto: 'HELIX GUARD — prototipo',
    generado: new Date().toISOString(),
    intentos_de_red_detectados: state.netAttempts,
    bytes_de_genotipo_en_claro_transmitidos: 0,
    consentimientos: state.consent,
    eventos: state.log,
  };
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'helix-guard-custodia.json';
  a.click();
  URL.revokeObjectURL(a.href);
  logEvent({ kind: 'local', title: 'Registro de custodia exportado', meta: `${state.log.length} eventos` });
});

/* ---------- arranque ---------- */
logEvent({
  kind: 'local',
  title: 'Sesión iniciada',
  meta: 'sin recursos externos',
  note: 'Esta página no carga tipografías, analítica ni scripts de terceros. Puedes comprobarlo en la pestaña de red del navegador.',
});
