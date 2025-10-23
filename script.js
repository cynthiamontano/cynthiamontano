document.addEventListener('DOMContentLoaded', function() {
    // 1. URL de la Aplicación Web (Apps Script)
    const scriptURL = 'https://script.google.com/macros/s/AKfycby_C0UJrpxBQf15gkAxDnmB56Lbi62TVP3o4fEdX7_838jsEyY4Yhm4v12jYAurIIuX/exec';

    // 2. Referencias al formulario y elementos
    const form = document.getElementById('registroForm');
    const btnEnviar = document.getElementById('btnEnviar');
    const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');

    // Campos nuevos / usados
    const inputPais = document.getElementById('pais');               // input de país (texto)
    const inputIndicativo = document.getElementById('indicativo'); // prefijo (readonly)
    const inputNumeroDoc = document.getElementById('numeroDocumento'); // número documento

    // ------------- MAPEADO DE PREFIJOS -------------
    const prefijos = {
        "colombia": "+57",
        "méxico": "+52",
        "mexico": "+52",
        "argentina": "+54",
        "chile": "+56",
        "perú": "+51",
        "peru": "+51",
        "venezuela": "+58",
        "ecuador": "+593",
        "bolivia": "+591",
        "uruguay": "+598",
        "paraguay": "+595",
        "costa rica": "+506",
        "costarica": "+506",
        "panamá": "+507",
        "panama": "+507",
        "honduras": "+504",
        "guatemala": "+502",
        "el salvador": "+503",
        "elsalvador": "+503",
        "nicaragua": "+505",
        "república dominicana": "+1",
        "republica dominicana": "+1",
        "dominican republic": "+1",
        "puerto rico": "+1",
        "cuba": "+53",
        "brasil": "+55",
        "brazil": "+55",
        "méjico": "+52" // por si alguien escribe con variante antigua
    };

    // Normaliza texto: elimina acentos y espacios extra, y pasa a minúsculas
    function normalizarPais(text) {
        if (!text) return '';
        // quitar acentos
        const withOutAccents = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return withOutAccents.trim().toLowerCase();
    }

    // Detecta país (por coincidencia completa o por inicio)
    function detectarPrefijoPorPais(text) {
        const t = normalizarPais(text);
        if (!t) return null;

        // coincidir exacto
        if (prefijos[t]) return prefijos[t];

        // intentar coincidencia por inicio/contains (ej: "col" -> colombia)
        for (const key of Object.keys(prefijos)) {
            if (t.includes(key) || key.includes(t) || t.startsWith(key) || key.startsWith(t)) {
                return prefijos[key];
            }
        }
        return null;
    }

    // ------------- EVENTOS: cuando el usuario escribe el país -------------
    if (inputPais && inputIndicativo) {
        // cuando escriba (input) o cuando pierda foco (blur) intentamos detectar
        const asignarPrefijo = () => {
            const valorPais = inputPais.value;
            const pref = detectarPrefijoPorPais(valorPais);
            if (pref) {
                inputIndicativo.value = pref;
            } else {
                // si no lo reconoce no sobreescribimos si ya hay algo; opcional:
                // inputIndicativo.value = '+XXX';
            }
        };

        inputPais.addEventListener('input', function() {
            asignarPrefijo();
        });

        inputPais.addEventListener('blur', function() {
            asignarPrefijo();
        });

        // si quieres, también rellenar automáticamente el indicativo al cargar la página
        // asignarPrefijo();
    }

    // ------------- Ajustes para el número de documento (teclado numérico en móviles) -------------
    if (inputNumeroDoc) {
        // Forzar inputmode y patrón (mejor compatibilidad en móviles)
        inputNumeroDoc.setAttribute('inputmode', 'numeric');
        inputNumeroDoc.setAttribute('pattern', '[0-9]*');
        // Opcional: evitar que se peguen letras
        inputNumeroDoc.addEventListener('input', function(e) {
            // eliminar todo lo que no sea dígito
            const clean = this.value.replace(/\D+/g, '');
            if (this.value !== clean) this.value = clean;
        });
    }

    // Opcional: proteger el campo indicativo para que sólo tenga + y números
    if (inputIndicativo) {
        inputIndicativo.addEventListener('input', function() {
            this.value = this.value.replace(/[^+\d]/g, '');
        });
    }

    // ------------------ ENVÍO (mantenemos tu lógica de fetch) ------------------
    // Opcional: elimina atributo 'action' si existe
    if (form) form.removeAttribute('action');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
        if (mensajeConfirmacion) mensajeConfirmacion.classList.add('oculto');

        const formData = new FormData(form);

        fetch(scriptURL, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error de red o el servidor no respondió correctamente (' + response.status + ')');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.result === 'success') {
                if (mensajeConfirmacion) {
                    mensajeConfirmacion.textContent = '✅ Gracias por unirte. Tu registro fue enviado exitosamente.';
                    mensajeConfirmacion.classList.remove('oculto');
                }
                form.reset();
                // opcional: reset indicativo a +XXX
                if (inputIndicativo) inputIndicativo.value = '+XXX';
            } else {
                throw new Error('Error en el script de Google: ' + (data.message || 'Respuesta inesperada.'));
            }
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);
            if (mensajeConfirmacion) {
                mensajeConfirmacion.textContent = '❌ Ocurrió un error al enviar el formulario: ' + error.message;
                mensajeConfirmacion.classList.remove('oculto');
            }
        })
        .finally(() => {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar';
        });
    });
});

