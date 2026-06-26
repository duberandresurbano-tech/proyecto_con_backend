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

// --- REGISTRO EN BASE DE DATOS ---
function guardarRegistro() {
    const nombre   = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const pass     = document.getElementById('regPass').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const correo   = document.getElementById('regCorreo').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value;
    const msg      = document.getElementById('regMsg');

    // 1. Campos obligatorios
    if (!nombre || !apellido || !pass || !telefono || !correo || !fechaNac) {
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

    // 5. Seguridad de contraseña
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
        msg.style.color = "#ff4d4d";
        msg.innerText   = "La contraseña no cumple los requisitos de seguridad.";
        return;
    }

    // 6. Enviar datos a la base de datos
    const datos = {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        celular: telefono,
        fecha_nacimiento: fechaNac,
        contrasena: pass
    };

    msg.style.color = "#ffcc00";
    msg.innerText = "Procesando registro...";

    fetch('/api/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensaje) {
            msg.style.color = "#4dff88";
            msg.style.fontSize = "";
            msg.style.lineHeight = "";
            msg.innerText = data.mensaje;
            
            // Guardar sesión en localStorage para las otras funciones
            localStorage.setItem('userName', nombre);
            localStorage.setItem('pc_correo', correo);
            
            setTimeout(hidePanels, 1500);
        } else {
            msg.style.color = "#ff4d4d";
            msg.innerText = data.error || "Error en el registro";
        }
    })
    .catch(error => {
        msg.style.color = "#ff4d4d";
        msg.innerText = "Error de conexión con el servidor";
        console.error('Error:', error);
    });
}

// --- LOGIN EN BASE DE DATOS ---
function validarLogin() {
    const userIn = document.getElementById('loginUser').value.trim();
    const passIn = document.getElementById('loginPass').value.trim();
    const msg = document.getElementById('loginMsg');

    if (!userIn || !passIn) {
        msg.style.color = "#ffcc00"; 
        msg.innerText = "Digita tus datos";
        return;
    }

    msg.style.color = "#ffcc00";
    msg.innerText = "Verificando credenciales...";

    const datos = {
        correo: userIn,
        contrasena: passIn
    };

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensaje) {
            msg.style.color = "#4dff88"; 
            msg.innerText = data.mensaje;
            
            // Guardar sesión en localStorage para las otras funciones
            localStorage.setItem('userName', data.usuario);
            localStorage.setItem('pc_correo', userIn);
            localStorage.setItem('userId', data.id_usuario);
            
            // Redirigir al inicio
            setTimeout(() => { window.location.href = "/inicio"; }, 1500);
        } else {
            msg.style.color = "#ff4d4d"; 
            msg.innerText = data.error || "Error en el login";
        }
    })
    .catch(error => {
        msg.style.color = "#ff4d4d";
        msg.innerText = "Error de conexión con el servidor";
        console.error('Error:', error);
    });
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


// --- seccion chat (keni) ---

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
function borrarTodo() {

    if (!confirm("¿Seguro que deseas borrar todos los datos almacenados?")) {
        return;
    }

    localStorage.removeItem('pc_user');
    localStorage.removeItem('pc_pass');
    localStorage.removeItem('pc_telefono');
    localStorage.removeItem('pc_correo');
    localStorage.removeItem('pc_fecha_nac');
    localStorage.removeItem('userName');

    const display = document.getElementById('currentUserDisplay');

    if (display) {
        display.innerText = "Ninguno";
    }

    alert("Memoria borrada correctamente");
}
function abrirAdmin() {

    const usuario = localStorage.getItem('pc_user');

    document.getElementById('currentUserDisplay').innerText =
        usuario || "Ninguno";

    showPanel('adminPanel');
}
// ¡Tu archivo login.js debe terminar aquí! No agregues los listeners del chat en este punto.put