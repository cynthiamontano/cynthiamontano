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
        "méjico": "+52"
    };

    // Normaliza texto: elimina acentos y espacios extra, y pasa a minúsculas
    function normalizarPais(text) {
        if (!text) return '';
        const withOutAccents = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return withOutAccents.trim().toLowerCase();
    }

    // Detecta país por coincidencia
    function detectarPrefijoPorPais(text) {
        const t = normalizarPais(text);
        if (!t) return null;
        if (prefijos[t]) return prefijos[t];

        for (const key of Object.keys(prefijos)) {
            if (t.includes(key) || key.includes(t) || t.startsWith(key) || key.startsWith(t)) {
                return prefijos[key];
            }
        }
        return null;
    }

    // ------------- EVENTOS DEL PAÍS -------------
    if (inputPais && inputIndicativo) {
        const asignarPrefijo = () => {
            const valorPais = inputPais.value;
            const pref = detectarPrefijoPorPais(valorPais);
            if (pref) inputIndicativo.value = pref;
        };

        inputPais.addEventListener('input', asignarPrefijo);
        inputPais.addEventListener('blur', asignarPrefijo);
    }

    // ------------- Número de documento solo números -------------
    if (inputNumeroDoc) {
        inputNumeroDoc.setAttribute('inputmode', 'numeric');
        inputNumeroDoc.setAttribute('pattern', '[0-9]*');
        inputNumeroDoc.addEventListener('input', function() {
            const clean = this.value.replace(/\D+/g, '');
            if (this.value !== clean) this.value = clean;
        });
    }

    // ------------- Prefijo solo + y números -------------
    if (inputIndicativo) {
        inputIndicativo.addEventListener('input', function() {
            this.value = this.value.replace(/[^+\d]/g, '');
        });
    }

    // ------------------ ENVÍO DEL FORMULARIO ------------------
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
        mensajeConfirmacion.classList.add('oculto');

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
                mensajeConfirmacion.textContent = '✅ Gracias por unirte. Tu registro fue enviado exitosamente.';
                mensajeConfirmacion.classList.remove('oculto');
                form.reset();
                if (inputIndicativo) inputIndicativo.value = '+XXX';
            } else {
                throw new Error('Error en el script de Google: ' + (data.message || 'Respuesta inesperada.'));
            }
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);
            mensajeConfirmacion.textContent = '❌ Ocurrió un error al enviar el formulario: ' + error.message;
            mensajeConfirmacion.classList.remove('oculto');
        })
        .finally(() => {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar';
        });
    });
});


