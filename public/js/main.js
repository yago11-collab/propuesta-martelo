/* ==========================================================================
   Talleres Mecánicos Martelo · JS mínimo (sin dependencias)
   ========================================================================== */

/* ---------- CONFIGURACIÓN ---------- */
// Endpoint de Formspree (p. ej. 'https://formspree.io/f/abcdwxyz').
// Si se deja vacío, el formulario abre el programa de correo (mailto:).
const FORM_ENDPOINT = '';
const FALLBACK_EMAIL = '[CONFIRMAR EMAIL]';
const TELEFONO = '981 23 65 98';
const ZONA_HORARIA = 'Europe/Madrid';

// Horario en minutos desde medianoche. 1 = lunes … 7 = domingo.
// [CONFIRMAR: festivos y vacaciones] — no se contemplan.
const TRAMOS_LABORABLES = [[9 * 60 + 30, 13 * 60 + 30], [15 * 60 + 30, 19 * 60 + 30]];
const HORARIO = { 1: TRAMOS_LABORABLES, 2: TRAMOS_LABORABLES, 3: TRAMOS_LABORABLES, 4: TRAMOS_LABORABLES, 5: TRAMOS_LABORABLES, 6: [], 7: [] };
const NOMBRE_DIA = { 1: 'el lunes', 2: 'el martes', 3: 'el miércoles', 4: 'el jueves', 5: 'el viernes', 6: 'el sábado', 7: 'el domingo' };

const MAPA_EMBED = 'https://maps.google.com/maps?q=Talleres%20Mec%C3%A1nicos%20Martelo%2C%20R%C3%BAa%20San%20Rosendo%2027%2C%2015007%20A%20Coru%C3%B1a&z=17&output=embed';

document.documentElement.classList.add('js');

/* ---------- ABIERTO / CERRADO (hora de Europe/Madrid) ---------- */
const formatoHora = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

function horaEnMadrid(fecha) {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_HORARIA, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dia = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[valor('weekday')];
  return { dia, minutos: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

function estadoHorario(fecha = new Date()) {
  const { dia, minutos } = horaEnMadrid(fecha);
  const tramoActual = HORARIO[dia].find(([ini, fin]) => minutos >= ini && minutos < fin);
  if (tramoActual) {
    return { abierto: true, dia, texto: `Abierto ahora · cierra a las ${formatoHora(tramoActual[1])}` };
  }
  const siguienteHoy = HORARIO[dia].find(([ini]) => ini > minutos);
  if (siguienteHoy) {
    return { abierto: false, dia, texto: `Cerrado · abre hoy a las ${formatoHora(siguienteHoy[0])}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = ((dia - 1 + i) % 7) + 1;
    if (HORARIO[d].length) {
      const cuando = i === 1 ? 'mañana' : NOMBRE_DIA[d];
      return { abierto: false, dia, texto: `Cerrado · abre ${cuando} a las ${formatoHora(HORARIO[d][0][0])}` };
    }
  }
  return { abierto: false, dia, texto: 'Cerrado' };
}

function pintarEstado() {
  const estado = estadoHorario();
  document.querySelectorAll('[data-status]').forEach((el) => {
    el.textContent = estado.texto;
    el.dataset.state = estado.abierto ? 'open' : 'closed';
  });
  document.querySelectorAll('.horario tr[data-day]').forEach((fila) => {
    fila.classList.toggle('hoy', Number(fila.dataset.day) === estado.dia);
  });
}

// Expuesto para pruebas: window.martelo.estadoHorario(new Date('2026-10-14T08:30:00Z'))
window.martelo = { estadoHorario };

/* ---------- FORMULARIO DE CITA ---------- */
const VALIDADORES = {
  nombre: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
  telefono: (v) => (/^(\+34|0034)?[6789]\d{8}$/.test(v.replace(/[\s.\-()]/g, '')) ? '' : 'Escribe un teléfono válido de 9 cifras (por ejemplo, 600 123 456).'),
  vehiculo: (v) => (v.trim().length >= 2 ? '' : 'Indica la matrícula o el modelo del coche.'),
  averia: (v) => (v.trim().length >= 5 ? '' : 'Cuéntanos brevemente qué le pasa al coche.'),
  franja: (v) => (v ? '' : 'Elige una franja horaria.'),
  privacidad: (_v, campo) => (campo.checked ? '' : 'Debes aceptar la política de privacidad.'),
};

function validarCampo(campo) {
  const mensaje = VALIDADORES[campo.name](campo.value, campo);
  const error = document.getElementById(`${campo.id}-error`);
  campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  error.hidden = !mensaje;
  error.textContent = mensaje;
  return !mensaje;
}

function iniciarFormulario() {
  const form = document.getElementById('form-cita');
  if (!form) return;
  const resumen = document.getElementById('form-resumen');
  const ok = document.getElementById('form-ok');
  const okTexto = document.getElementById('form-ok-texto');
  const campos = Object.keys(VALIDADORES).map((n) => form.elements[n]);

  // Revalida en vivo solo los campos que ya se marcaron como erróneos
  campos.forEach((campo) => {
    const evento = campo.type === 'checkbox' || campo.tagName === 'SELECT' ? 'change' : 'input';
    campo.addEventListener(evento, () => {
      if (campo.getAttribute('aria-invalid') === 'true') validarCampo(campo);
    });
    campo.addEventListener('blur', () => {
      if (campo.value && campo.type !== 'checkbox') validarCampo(campo);
    });
  });

  const mostrarExito = (texto) => {
    okTexto.textContent = texto;
    form.classList.add('hidden');
    ok.classList.remove('hidden');
    ok.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalidos = campos.filter((c) => !validarCampo(c));
    if (invalidos.length) {
      resumen.textContent = invalidos.length === 1
        ? 'Revisa el campo marcado para poder enviar la solicitud.'
        : `Revisa los ${invalidos.length} campos marcados para poder enviar la solicitud.`;
      resumen.classList.remove('hidden');
      invalidos[0].focus();
      return;
    }
    resumen.classList.add('hidden');
    const datos = new FormData(form);
    if (datos.get('_gotcha')) return; // spam

    const boton = form.querySelector('button[type="submit"]');

    if (FORM_ENDPOINT) {
      boton.disabled = true;
      boton.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: datos, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        mostrarExito('Hemos recibido tu solicitud. Te contactaremos para confirmar día y hora.');
      } catch {
        resumen.textContent = `No se ha podido enviar la solicitud. Inténtalo de nuevo o llámanos al ${TELEFONO}.`;
        resumen.classList.remove('hidden');
        resumen.focus();
      } finally {
        boton.disabled = false;
        boton.removeAttribute('aria-busy');
      }
      return;
    }

    // Sin endpoint: se prepara un correo con los datos (mailto)
    const asunto = `Solicitud de cita · ${datos.get('vehiculo')}`;
    const cuerpo = [
      `Nombre: ${datos.get('nombre')}`,
      `Teléfono: ${datos.get('telefono')}`,
      `Matrícula o modelo: ${datos.get('vehiculo')}`,
      `Franja preferida: ${datos.get('franja')}`,
      '',
      'Qué le pasa al coche:',
      datos.get('averia'),
    ].join('\n');
    window.location.href = `mailto:${encodeURI(FALLBACK_EMAIL)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    mostrarExito(`Se ha abierto tu programa de correo con la solicitud preparada: solo tienes que enviarla. Si no se abre, llámanos al ${TELEFONO}.`);
  });

  document.getElementById('form-otra').addEventListener('click', () => {
    form.reset();
    campos.forEach((c) => c.setAttribute('aria-invalid', 'false'));
    ok.classList.add('hidden');
    form.classList.remove('hidden');
    form.elements.nombre.focus();
  });
}

/* ---------- MAPA BAJO DEMANDA ---------- */
function iniciarMapa() {
  const boton = document.getElementById('cargar-mapa');
  if (!boton) return;
  boton.addEventListener('click', () => {
    const contenedor = document.getElementById('mapa');
    const iframe = document.createElement('iframe');
    iframe.src = MAPA_EMBED;
    iframe.title = 'Mapa: Talleres Mecánicos Martelo, Rúa San Rosendo 27, A Coruña';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.className = 'absolute inset-0 h-full w-full border-0';
    contenedor.replaceChildren(iframe);
  }, { once: true });
}

/* ---------- MICROANIMACIONES ---------- */
function iniciarReveal() {
  const elementos = document.querySelectorAll('.reveal');
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sinMovimiento || !('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('is-visible');
        obs.unobserve(entrada.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  elementos.forEach((el) => obs.observe(el));
}

/* ---------- ARRANQUE ---------- */
pintarEstado();
setInterval(pintarEstado, 60 * 1000);
iniciarFormulario();
iniciarMapa();
iniciarReveal();
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
