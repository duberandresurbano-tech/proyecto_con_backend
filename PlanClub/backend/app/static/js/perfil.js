// Variable global para guardar la foto seleccionada en el modal antes de aceptar
let fotoTemporalSeleccionada = "";

// --- MODAL DE NOTIFICACIONES ---
function openNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'flex';
}

function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'none';
}

// --- MODAL DE FOTO DE PERFIL ---
function openPhotoModal() {
    const modal = document.getElementById('photoEditModal');
    if (modal) {
        modal.style.display = 'flex';
        document.querySelectorAll('.profile-option').forEach(opt => opt.classList.remove('selected'));
        fotoTemporalSeleccionada = "";
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photoEditModal');
    if (modal) modal.style.display = 'none';
}

// Al hacer clic en una de las fotos del grid
function selectPhoto(elemento) {
    document.querySelectorAll('.profile-option').forEach(opt => opt.classList.remove('selected'));
    elemento.classList.add('selected');
    fotoTemporalSeleccionada = elemento.getAttribute('data-photo-src');
}

// Al darle al botón "ACEPTAR" dentro del modal de fotos
function applyPhotoChange() {
    if (!fotoTemporalSeleccionada) {
        alert("⚠️ Por favor, selecciona una foto antes de aceptar.");
        return;
    }
    
    const contenedorFoto = document.getElementById('mainProfilePic');
    if (contenedorFoto) {
        contenedorFoto.innerHTML = "";
        contenedorFoto.style.backgroundImage = `url('${fotoTemporalSeleccionada}')`;
        contenedorFoto.style.backgroundSize = 'cover';
        contenedorFoto.style.backgroundPosition = 'center';
    }
    
    closePhotoModal();
}

// --- GUARDAR DATOS DEL FORMULARIO ---
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre   = document.querySelector('input[placeholder="Escribe tu nombre"]').value.trim();
    const apellido = document.querySelector('input[placeholder="Escribe tu apellido"]').value.trim();
    const correo   = document.querySelector('input[placeholder="ejemplo@correo.com"]').value.trim();
    const telefono = document.querySelector('input[placeholder="Tu número"]').value.trim();
    
    console.log("Datos listos para enviar a la BD:", { nombre, apellido, correo, telefono });
    alert("¡Cambios guardados correctamente en tu perfil!");
});
