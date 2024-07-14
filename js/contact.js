document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Previene el envío del formulario
    
        // Obtener los valores de los campos
        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var message = document.getElementById('message').value.trim();
    
        // Validaciones
        var isValid = true;
    
        // Validar nombre alfanumérico
        if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
            Swal.fire({
                title: 'Nombre inválido',
                text: 'El nombre debe ser alfanumérico y no debe contener caracteres especiales.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            isValid = false;
        }
    
        // Validar email
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            Swal.fire({
                title: 'Correo electrónico inválido',
                text: 'Por favor ingresa un correo electrónico válido.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            isValid = false;
        }
    
        // Validar mensaje con más de 5 caracteres
        if (message.length <= 5) {
            Swal.fire({
                title: 'Mensaje muy corto',
                text: 'El mensaje debe tener más de 5 caracteres.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            isValid = false;
        }
    
        if (isValid) {
            // Crear el mailto link y abrir el cliente de correo predeterminado
            var mailtoLink = `mailto:destinatario@example.com?subject=Contacto%20de%20${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0ADe:%20${encodeURIComponent(email)}`;
            window.location.href = mailtoLink;

            // Limpiar los campos
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('message').value = '';

            setTimeout(function() {
                // Mostrar mensaje de éxito
                Swal.fire({
                    title: 'Mensaje enviado',
                    text: 'Tu mensaje ha sido enviado con éxito. Te responderemos lo antes posible.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(function() {
                    // Redirigir a index.html después de aceptar el mensaje modal
                    window.location.href = 'index.html';
                });
            }, 5000);
        }
    });
});