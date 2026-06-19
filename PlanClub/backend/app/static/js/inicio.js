document.addEventListener("DOMContentLoaded", () => {
    console.log("Menú de Inicio de PlanClub cargado correctamente. 🚀");

    // Seleccionamos todos tus botones glassmorphism del menú
    const botones = document.querySelectorAll(".btn");

    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            // Evitamos que recargue por defecto si es un enlace vacío
            e.preventDefault();

            // Obtenemos el texto del botón para saber a dónde va el usuario
            const textoBoton = boton.textContent.toLowerCase();

            // 🛠️ CORREGIDO: Redirecciones fluidas usando las rutas lógicas de Flask
            if (textoBoton.includes("catálogo") || textoBoton.includes("bebidas") || textoBoton.includes("pedir")) {
                window.location.href = "/catalogo";
            } 
            else if (textoBoton.includes("reserva") || textoBoton.includes("mesas")) {
                window.location.href = "/reserva";
            } 
            else if (textoBoton.includes("chat") || textoBoton.includes("vip")) {
                window.location.href = "/chat";
            } 
            else if (textoBoton.includes("perfil") || textoBoton.includes("mi cuenta")) {
                window.location.href = "/perfil";
            }
            // 🛠️ CORREGIDO: Para salir, apuntamos a la raíz (/) que renderiza tu panel de login
            else if (textoBoton.includes("salir") || textoBoton.includes("cerrar")) {
                window.location.href = "/"; 
            }
            else {
                // Por si acaso hay un enlace con un endpoint configurado en el HTML
                const hrefDirecto = boton.getAttribute("href");
                if (hrefDirecto && hrefDirecto !== "#") {
                    window.location.href = hrefDirecto;
                }
            }
        });
    });
});