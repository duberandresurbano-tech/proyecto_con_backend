
        function showPanel(id) {
            document.getElementById(id).classList.add('active');
            document.getElementById('loginMsg').innerText = ""; 
            document.getElementById('regMsg').innerText = "";   
        }

        function hidePanels() {
            const panels = document.querySelectorAll('.panel');
            panels.forEach(p => p.classList.remove('active'));
        }

        // --- FUNCIONES DE ADMIN ---
        function abrirAdmin() {
            const user = localStorage.getItem('pc_user') || "No hay registros";
            document.getElementById('currentUserDisplay').innerText = user.toUpperCase();
            showPanel('adminPanel');
        }

        function borrarTodo() {
            if(confirm("¿Estás seguro de eliminar al usuario de la memoria?")) {
                localStorage.clear();
                alert("Memoria limpiada. Ya puedes registrar uno nuevo.");
                location.reload(); // Recarga para limpiar campos
            }
        }

        // --- REGISTRO ---
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

            const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passRegex.test(pass)) {
                msg.style.color = "#ff4d4d";
                msg.innerText = "La contraseña no cumple los requisitos de seguridad";
                return;
            }

            localStorage.setItem('pc_user', user.toLowerCase());
            localStorage.setItem('pc_pass', pass); 
            
            msg.style.color = "#4dff88"; 
            msg.innerText = "¡Usuario registrado con éxito!";
            setTimeout(hidePanels, 1500);
        }

        // --- LOGIN ---
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
                setTimeout(() => { window.location.href = urlDestino = "./vista/html/inicio.html"; }, 1500);
            } else {
                msg.style.color = "#ff4d4d"; 
                msg.innerText = "Usuario/contraseña incorrectos";
            }
        }

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

    setTimeout(() => {
        hidePanels();
    }, 1500);
} else {
    msg.style.color = "#ffcc00";
    msg.innerText = "Cambio cancelado";
}

    msg.style.color = "#4dff88";
    msg.innerText = "Contraseña actualizada correctamente";

    setTimeout(() => {
        hidePanels();
    }, 1500);
}

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