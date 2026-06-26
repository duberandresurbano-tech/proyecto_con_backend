/* ============================================================
   PLANCLUB VIP — perfil.js
   Manejo de estados, modales y persistencia en LocalStorage
   ============================================================ */

// Variable global para guardar la foto seleccionada en el modal antes de confirmar
let fotoTemporalSeleccionada = "";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar la información inicial desde el LocalStorage (Texto y Foto)
    cargarDatosPerfil();

    // 2. Asignar el evento al botón de guardar cambios
    const btnGuardar = document.getElementById('btnGuardarPerfil');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarCambiosPerfil);
    }
});

// ── CARGAR DATOS EN LOS INPUTS Y AVATAR ─────────────────────
function cargarDatosPerfil() {
    // Recuperamos los datos del inicio de sesión o registros previos
    const nombre = localStorage.getItem('pc_user'); 
    const correo = localStorage.getItem('pc_correo');
    const telefono = localStorage.getItem('pc_telefono');
    const apellidoGuardado = localStorage.getItem('pc_apellido');
    const fotoGuardada = localStorage.getItem('pc_foto_perfil');

    // Control de seguridad básica
    if (!nombre) {
        window.location.href = "/";
        return;
    }

    // Si hay una foto guardada en el navegador, la pintamos de inmediato
    if (fotoGuardada) {
        establecerFotoAvatar(fotoGuardada);
    }

    // Insertar valores de texto formateados en el DOM si los elementos existen
    if (document.getElementById('perfilNombre')) {
        document.getElementById('perfilNombre').value = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    }
    if (document.getElementById('perfilCorreo')) {
        document.getElementById('perfilCorreo').value = correo || '';
    }
    if (document.getElementById('perfilTelefono')) {
        document.getElementById('perfilTelefono').value = telefono || '';
    }
    if (document.getElementById('perfilApellido') && apellidoGuardado) {
        document.getElementById('perfilApellido').value = apellidoGuardado;
    }
}

// ── GUARDAR CAMBIOS (APELLIDO) ──────────────────────────────
function guardarCambiosPerfil(e) {
    e.preventDefault(); // Evita recargas inesperadas de la página o envíos nativos

    const apellidoInput = document.getElementById('perfilApellido').value.trim();
    const msg = document.getElementById('perfilMsg');

    if (apellidoInput === "") {
        if (msg) {
            msg.style.color = "#ff4455"; // Var red de PlanClub
            msg.innerText = "Por favor, ingresa un apellido válido.";
        }
        return;
    }

    // 💾 Persistencia del apellido en el navegador
    localStorage.setItem('pc_apellido', apellidoInput);

    // Feedback visual con estética premium
    if (msg) {
        msg.style.color = "#4dff88"; 
        msg.innerText = "¡Perfil actualizado correctamente! ✦";
        
        setTimeout(() => {
            msg.innerText = "";
        }, 3000);
    }
}

// ── MODAL DE FOTO DE PERFIL ─────────────────────────────────
function openPhotoModal() {
    const modal = document.getElementById('photoEditModal');
    if (modal) {
        modal.style.display = 'flex';
        // Limpiamos selecciones previas visualmente
        document.querySelectorAll('.profile-option').forEach(opt => opt.classList.remove('selected'));
        fotoTemporalSeleccionada = "";
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photoEditModal');
    if (modal) modal.style.display = 'none';
}

function selectPhoto(elemento) {
    document.querySelectorAll('.profile-option').forEach(opt => opt.classList.remove('selected'));
    elemento.classList.add('selected');
    fotoTemporalSeleccionada = elemento.getAttribute('data-photo-src');
}

function applyPhotoChange() {
    if (!fotoTemporalSeleccionada) {
        alert("⚠️ Por favor, selecciona una foto antes de aceptar.");
        return;
    }
    
    // 💾 Persistencia de la ruta de la foto elegida
    localStorage.setItem('pc_foto_perfil', fotoTemporalSeleccionada);
    
    // Refrescamos el contenedor visual
    establecerFotoAvatar(fotoTemporalSeleccionada);
    closePhotoModal();
}

// Función auxiliar reutilizable para renderizar el fondo del avatar
function establecerFotoAvatar(rutaFoto) {
    const contenedorFoto = document.getElementById('mainProfilePic');
    if (contenedorFoto) {
        contenedorFoto.innerHTML = ""; // Eliminamos el icono de la cámara interno
        contenedorFoto.style.backgroundImage = `url('${rutaFoto}')`;
        contenedorFoto.style.backgroundSize = 'cover';
        contenedorFoto.style.backgroundPosition = 'center';
    }
}

// ── MODAL DE NOTIFICACIONES ─────────────────────────────────
function openNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'flex';
}

function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'none';
}

// ── FUNCIONES PARA SUBIR DESDE LA GALERÍA NATIVA ───────────

// Abre el selector de archivos del sistema/móvil al presionar el cuadro del "+"
function triggerGallerUpload() {
    document.getElementById('galleryInput').click();
}

// Procesa el archivo seleccionado por el usuario
function handleGalleryFile(input) {
    const file = input.files[0];
    if (file) {
        // Validación rápida para asegurarse de que sea una imagen
        if (!file.type.startsWith('image/')) {
            alert("⚠️ Por favor, selecciona un archivo de imagen válido.");
            return;
        }

        const reader = new FileReader();
        
        // Convertimos la imagen a una cadena Base64
        reader.onload = function(e) {
            const base64URL = e.target.result;
            
            // Buscamos la opción de subida para marcarla visualmente como seleccionada
            const uploadOption = document.querySelector('.upload-option');
            
            document.querySelectorAll('.profile-option').forEach(opt => opt.classList.remove('selected'));
            uploadOption.classList.add('selected');
            
            // Guardamos el resultado Base64 en la variable global temporal
            fotoTemporalSeleccionada = base64URL;
        };
        
        reader.readAsDataURL(file);
    }
}