function showPanel(id) {
    const panel = document.getElementById(id);
    if (panel) {
        panel.classList.add('active');
    }
    
    // Limpieza segura de mensajes previos si los elementos existen
    const loginMsg = document.getElementById('loginMsg');
    const regMsg = document.getElementById('regMsg');
    const recoverMsg = document.getElementById('recoverMsg');
    
    if (loginMsg) loginMsg.innerText = ""; 
    if (regMsg) regMsg.innerText = "";   
    if (recoverMsg) recoverMsg.innerText = "";   
}

function hidePanels() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(p => p.classList.remove('active'));
}

// --- FUNCIONES DE ADMIN ---
function abrirAdmin() {
    const user = localStorage.getItem('pc_user') || "No hay registros";
    const displayEl = document.getElementById('currentUserDisplay');
    if (displayEl) {
        displayEl.innerText = user.toUpperCase();
    }
    showPanel('adminPanel');
}

function borrarTodo() {
    if (confirm("¿Estás seguro de eliminar al usuario de la memoria?")) {
        localStorage.clear();
        alert("Memoria limpiada. Ya puedes registrar uno nuevo.");
        location.reload(); 
    }
}

// --- REGISTRO ---
function guardarRegistro() {
    const user = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const msg = document.getElementById('regMsg');

    if (!msg) return;

    if (!user || !pass) {
        msg.style.color = "#ff4d4d"; 
        msg.innerText = "Por favor, completa los campos";
        return;
    }

    const savedUser = localStorage.getItem('pc_user');
    if (savedUser && user.toLowerCase() === savedUser) {
        msg.style.color = "#ffcc00";
        msg.innerText = "Usuario ya registrado";
        return;
    }

    // Validación de seguridad: Mínimo 8 caracteres, 1 Mayúscula y 1 Número
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
        msg.style.color = "#ff4d4d";
        msg.innerText = "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número";
        return;
    }

    // Guardamos credenciales + el rol base
    localStorage.setItem('pc_user', user.toLowerCase());
    localStorage.setItem('pc_pass', pass); 
    localStorage.setItem('pc_role', 'cliente'); 
    
    msg.style.color = "#4dff88"; 
    msg.innerText = "¡Usuario registrado con éxito!";
    setTimeout(hidePanels, 1500);
}

// --- LOGIN ---
function validarLogin() {
    const userIn = document.getElementById('loginUser').value.trim().toLowerCase();
    const passIn = document.getElementById('loginPass').value.trim();
    const msg = document.getElementById('loginMsg');
    
    if (!msg) return;
    
    if (!userIn || !passIn) {
        msg.style.color = "#ffcc00"; 
        msg.innerText = "Digita tus datos";
        return;
    }

    // Cuentas fijas para simular al Administrador y al Vendedor
    const staffHub = {
        "admin_plan": { pass: "Admin123", role: "admin" },
        "vendedor_macarena": { pass: "Vende123", role: "vendedor" }
    };

    let finalRole = "";

    // 1. Validamos si es una cuenta del Staff
    if (staffHub[userIn] && staffHub[userIn].pass === passIn) {
        finalRole = staffHub[userIn].role;
    } 
    // 2. Si no, revisamos el localStorage para ver si es el cliente registrado
    else {
        const savedUser = localStorage.getItem('pc_user');
        const savedPass = localStorage.getItem('pc_pass');
        const savedRole = localStorage.getItem('pc_role') || 'cliente';

        if (savedUser && userIn === savedUser && passIn === savedPass) {
            finalRole = savedRole;
        }
    }

    if (finalRole === "") {
        msg.style.color = "#ff4d4d"; 
        msg.innerText = "Usuario/contraseña incorrectos o no registrados";
        return;
    }

    // Guardamos el rol en sesión para que los guardianes lo lean
    localStorage.setItem('macarena_role', finalRole);

    msg.style.color = "#4dff88"; 
    msg.innerText = `¡Ingresando como ${finalRole.toUpperCase()}...!`;
    
    // REDIRECCIÓN DEFINITIVA: Entrando desde la raíz hacia adentro de las carpetas
    setTimeout(() => { 
        if (finalRole === 'admin') {
            window.location.href = "vista/html/reserva.html"; 
        } else if (finalRole === 'vendedor') {
            window.location.href = "vista/html/chat.html"; 
        } else {
            window.location.href = "vista/html/inicio.html"; 
        }
    }, 1500);
}

// --- RECUPERAR CONTRASEÑA ---
function recuperarPass() {
    const userIn = document.getElementById('recoverUser').value.trim().toLowerCase();
    const newPass = document.getElementById('newPass').value.trim();
    const msg = document.getElementById('recoverMsg');

    if (!msg) return;

    const savedUser = localStorage.getItem('pc_user');

    if (!userIn || !newPass) {
        msg.style.color = "#ffcc00";
        msg.innerText = "Completa los campos";
        return;
    }

    if (savedUser === null || userIn !== savedUser) {
        msg.style.color = "#ff4d4d";
        msg.innerText = "Usuario no encontrado";
        return;
    }

    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(newPass)) {
        msg.style.color = "#ff4d4d";
        msg.innerText = "La nueva contraseña no cumple los requisitos";
        return;
    }

    if (confirm("¿Seguro que quieres cambiar la contraseña?")) {
        localStorage.setItem('pc_pass', newPass);

        msg.style.color = "#4dff88";
        msg.innerText = "Contraseña actualizada correctamente";

        setTimeout(() => {
            hidePanels();
        }, 1500);
    } else {
        msg.style.color = "#ffcc00";
        msg.innerText = "Cambio cancelado";
    }
}

// --- OCULTAR / MOSTRAR CONTRASEÑA ---
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "🐵";
    } else {
        input.type = "password";
        icon.textContent = "🙈";
    }
}