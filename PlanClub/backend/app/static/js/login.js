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

// --- VALIDACIÓN DE MAYORÍA DE EDAD ---
function esMayorDeEdad(fechaNacStr) {
    if (!fechaNacStr) return null; // No ingresó fecha
    const hoy      = new Date();
    const fechaNac = new Date(fechaNacStr);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesAun  = hoy.getMonth()  < fechaNac.getMonth();
    const diaAun  = hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate();
    if (mesAun || diaAun) edad--; // Todavía no ha cumplido años este año
    return edad >= 18;
}

// --- REGISTRO TEMPORAL (LOCAL STORAGE) ---
function guardarRegistro() {
    const user     = document.getElementById('regUser').value.trim();
    const pass     = document.getElementById('regPass').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const correo   = document.getElementById('regCorreo').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value;
    const msg      = document.getElementById('regMsg');

    // 1. Campos obligatorios
    if (!user || !pass || !telefono || !correo || !fechaNac) {
        msg.style.color = "#ff4d4d";
        msg.innerText   = "Por favor, completa todos los campos.";
        return;
    }

    // 2. Formato de correo básico
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
        msg.style.color = "#ff4d4d";
        msg.innerText   = "Ingresa un correo electrónico válido.";
        return;
    }

    // 3. Teléfono: solo números, mínimo 7 dígitos
    const telRegex = /^\d{7,15}$/;
    if (!telRegex.test(telefono)) {
        msg.style.color = "#ff4d4d";
        msg.innerText   = "Ingresa un número de teléfono válido (solo dígitos).";
        return;
    }

    // 4. Validación de mayoría de edad
    const mayor = esMayorDeEdad(fechaNac);
    if (mayor === null) {
        msg.style.color = "#ff4d4d";
        msg.innerText   = "Ingresa una fecha de nacimiento válida.";
        return;
    }
    if (!mayor) {
        msg.style.color   = "#ffcc00";
        msg.style.fontSize = "0.85rem";
        msg.style.lineHeight = "1.5";
        msg.innerHTML = `
            <strong>Acceso restringido por edad</strong><br>
            Debes ser mayor de 18 años para registrarte en PlanClub.<br>
            Podrás crear tu cuenta una vez que alcances la mayoría de edad.
        `;
        return;
    }

    // 5. Usuario ya existente
    const savedUser = localStorage.getItem('pc_user');
    if (savedUser && user.toLowerCase() === savedUser) {
        msg.style.color = "#ffcc00";
        msg.innerText   = "Este usuario ya está registrado.";
        return;
    }

    // 6. Seguridad de contraseña
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
        msg.style.color = "#ff4d4d";
        msg.innerText   = "La contraseña no cumple los requisitos de seguridad.";
        return;
    }

    // 7. Todo correcto → guardar
    localStorage.setItem('pc_user',      user.toLowerCase());
    localStorage.setItem('pc_pass',      pass);
    localStorage.setItem('pc_telefono',  telefono);
    localStorage.setItem('pc_correo',    correo);
    localStorage.setItem('pc_fecha_nac', fechaNac);

    msg.style.color    = "#4dff88";
    msg.style.fontSize = "";
    msg.style.lineHeight = "";
    msg.innerText = "¡Registro exitoso! Bienvenido a PlanClub.";
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