document.addEventListener("DOMContentLoaded", () => {
    // 1. CARGAR DATOS AL INICIAR LA PANTALLA
    if (localStorage.getItem('user_nombre')) {
        const inputNombre = document.getElementById('input-nombre');
        if (inputNombre) inputNombre.value = localStorage.getItem('user_nombre');
    }
    if (localStorage.getItem('user_apellido')) {
        const inputApellido = document.getElementById('input-apellido');
        if (inputApellido) inputApellido.value = localStorage.getItem('user_apellido');
    }
    if (localStorage.getItem('user_correo')) {
        const inputCorreo = document.getElementById('input-correo');
        if (inputCorreo) inputCorreo.value = localStorage.getItem('user_correo');
    }
    if (localStorage.getItem('user_telefono')) {
        const inputTelefono = document.getElementById('input-telefono');
        if (inputTelefono) inputTelefono.value = localStorage.getItem('user_telefono');
    }
    
    // Cargar foto guardada de forma segura sin pisar el lápiz o los iconos
    if (localStorage.getItem('user_photo')) {
        const previewEl = document.querySelector('.profile-img-preview');
        if (previewEl) {
            // Si es un contenedor con una etiqueta <i> adentro, la reemplazamos por una <img>
            previewEl.innerHTML = `<img src="${localStorage.getItem('user_photo')}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        }
    }

    // 2. ESCUCHADOR DE CLICS GLOBAL (Evita pisar funciones entre archivos)
    window.addEventListener("click", (event) => {
        const notifModal = document.getElementById("notificationModal");
        const photoModal = document.getElementById("photoEditModal"); // Asegúrate de que el overlay tenga este ID en tu HTML
        
        if (event.target === notifModal) {
            closeNotificationModal();
        }
        if (event.target === photoModal) {
            closePhotoModal();
        }
    });
});

// --- MENÚ DE NOTIFICACIONES ---
function openNotificationModal() {
    const modal = document.getElementById("notificationModal");
    if (modal) modal.style.display = "flex";
}

function closeNotificationModal() {
    const modal = document.getElementById("notificationModal");
    if (modal) modal.style.display = "none";
}

// --- MENÚ DESPLEGABLE DE CONFIGURACIÓN ---
function toggleMenu() {
    // Buscamos tanto por ID como por la clase de tu CSS por si acaso
    const menu = document.getElementById("configMenu") || document.querySelector(".config-menu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

// --- GUARDAR EN MEMORIA LOCAL ---
function saveAllData() {
    const nom = document.getElementById('input-nombre')?.value || "";
    const ape = document.getElementById('input-apellido')?.value || "";
    const cor = document.getElementById('input-correo')?.value || "";
    const tel = document.getElementById('input-telefono')?.value || "";

    localStorage.setItem('user_nombre', nom);
    localStorage.setItem('user_apellido', ape);
    localStorage.setItem('user_correo', cor);
    localStorage.setItem('user_telefono', tel);

    // En lugar de un alert plano, abrimos tu modal de notificación premium
    openNotificationModal();
}

// --- SELECCIÓN Y CAMBIO DE AVATAR / FOTO ---
let selectedPhotoSrc = "";

function openPhotoModal() { 
    // Buscamos el overlay del modal por ID o por su clase del CSS
    const modal = document.getElementById("photoEditModal") || document.querySelector(".modal-overlay");
    if (modal) modal.classList.add("show"); 
}

function closePhotoModal() { 
    const modal = document.getElementById("photoEditModal") || document.querySelector(".modal-overlay");
    if (modal) modal.classList.remove("show"); 
}

function selectPhoto(el) {
    document.querySelectorAll(".profile-option").forEach(opt => opt.classList.remove("selected"));
    el.classList.add("selected");
    selectedPhotoSrc = el.getAttribute("data-photo-src") || el.querySelector("img")?.getAttribute("src") || "";
}

function applyPhotoChange() {
    if (selectedPhotoSrc) {
        const previewEl = document.querySelector('.profile-img-preview');
        if (previewEl) {
            previewEl.innerHTML = `<img src="${selectedPhotoSrc}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        }
        localStorage.setItem('user_photo', selectedPhotoSrc);
    }
    closePhotoModal();
}