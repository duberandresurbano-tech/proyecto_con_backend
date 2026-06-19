// --- CONTROL DE VISTAS DE LOS PANELES (GLASSMORPHISM) ---
function showPanel(id) {
    document.getElementById(id).classList.add('active');
    document.getElementById('loginMsg').innerText = ""; 
    document.getElementById('regMsg').innerText = "";   
}

function hidePanels() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(p => p.classList.remove('active'));
}

// --- REGISTRO TEMPORAL (LOCAL STORAGE) ---
function guardarRegistro() {
    const user = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const msg = document.getElementById('regMsg');

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

    // Regla de seguridad de la contraseña
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
        msg.style.color = "#ff4d4d";
        msg.innerText = "La contraseña no cumple los requisitos de seguridad";
        return;
    }

    // Guardado local sin tocar Flask por ahora
    localStorage.setItem('pc_user', user.toLowerCase());
    localStorage.setItem('pc_pass', pass); 
    
    msg.style.color = "#4dff88"; 
    msg.innerText = "¡Usuario registrado con éxito!";
    setTimeout(hidePanels, 1500);
}

// --- LOGIN TEMPORAL (LOCAL STORAGE + RUTA FLASK) ---
function validarLogin() {
    const userIn = document.getElementById('loginUser').value.trim().toLowerCase();
    const passIn = document.getElementById('loginPass').value.trim();
    const msg = document.getElementById('loginMsg');
    
    const savedUser = localStorage.getItem('pc_user');
    const savedPass = localStorage.getItem('pc_pass');

    if (!userIn || !passIn) {
        msg.style.color = "#ffcc00"; 
        msg.innerText = "Digita tus datos";
        return;
    }

    if (savedUser === null || userIn !== savedUser) {
        msg.style.color = "#ff4d4d";
        msg.innerText = "Este usuario no está registrado";
        return;
    }

    if (passIn === savedPass) {
        msg.style.color = "#4dff88"; 
        msg.innerText = "Usuario correcto ingresando.";
        
        // 🛠️ RUTA CORREGIDA: Apunta al endpoint lógico de Flask para ir al Inicio
        setTimeout(() => { window.location.href = "/inicio"; }, 1500);
    } else {
        msg.style.color = "#ff4d4d"; 
        msg.innerText = "Usuario/contraseña incorrectos";
    }
}

// --- RECUPERAR CONTRASEÑA TEMPORAL ---
function recuperarPass() {
    const userIn = document.getElementById('recoverUser').value.trim().toLowerCase();
    const newPass = document.getElementById('newPass').value.trim();
    const msg = document.getElementById('recoverMsg');

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
        setTimeout(hidePanels, 1500);
    } else {
        msg.style.color = "#ffcc00";
        msg.innerText = "Cambio cancelado";
    }
}

// --- MOSTRAR/OCULTAR CONTRASEÑA ---
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "🐵";
    } else {
        input.type = "password";
        icon.textContent = "🙈";
    }
}