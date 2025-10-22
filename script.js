document.addEventListener('DOMContentLoaded', function() {
    // 1. URL de la Aplicación Web (Implementación de Apps Script)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz91xkJ_0RSALKU2X9pTo4qFIbXscebZs7RIusgmnvsyUlMdOXStSPu9MhTA9WBVLLN/exec'; 
    
    // 2. Obtén las referencias al formulario y elementos
    const form = document.getElementById('registroForm');
    const btnEnviar = document.getElementById('btnEnviar');
    const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
    
    // Opcional: Elimina el atributo 'action' del HTML, ya no es necesario
    form.removeAttribute('action'); 
    
    // 3. Event Listener para interceptar el envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Detiene el envío HTTP predeterminado
        
        // Muestra estado de carga y deshabilita el botón
        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
        mensajeConfirmacion.classList.add('oculto'); 
        
        const formData = new FormData(form);

        // 4. Envía la petición POST a Google Apps Script (tu "backend")
        fetch(scriptURL, {
            method: 'POST',
            body: formData 
        })
        .then(response => {
            if (!response.ok) {
                // Maneja errores de respuesta HTTP
                throw new Error('Error de red o el servidor no respondió correctamente (' + response.status + ')');
            }
            return response.json();
        })
        .then(data => {
            // 5. Procesa la respuesta de éxito del Apps Script
            if (data && data.result === 'success') {
                console.log('Datos enviados correctamente:', data);
                
                // Muestra mensaje de confirmación y limpia el formulario
                mensajeConfirmacion.textContent = '✅ Gracias por unirte. Tu registro fue enviado exitosamente.';
                mensajeConfirmacion.classList.remove('oculto');
                
                form.reset(); 
                
            } else {
                // Maneja errores lógicos reportados por el Apps Script
                throw new Error('Error en el script de Google: ' + (data.message || 'Respuesta inesperada.'));
            }
        })
        .catch(error => {
            // Manejo de cualquier error ocurrido
            console.error('Error al enviar los datos:', error);
            mensajeConfirmacion.textContent = '❌ Ocurrió un error al enviar el formulario: ' + error.message;
            mensajeConfirmacion.classList.remove('oculto');
        })
        .finally(() => {
            // Restaura el estado original del botón
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar';
        });
    });
});