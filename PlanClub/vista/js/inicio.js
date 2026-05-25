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

            // Lógica de redirección fluida según tu lista de HTMLs mapeados
            if (textoBoton.includes("catálogo") || textoBoton.includes("bebidas") || textoBoton.includes("pedir")) {
                window.location.href = "catalogo.html";
            } 
            else if (textoBoton.includes("reserva") || textoBoton.includes("mesas")) {
                window.location.href = "reserva.html";
            } 
            else if (textoBoton.includes("chat") || textoBoton.includes("vip")) {
                window.location.href = "chat.html";
            } 
            else if (textoBoton.includes("perfil") || textoBoton.includes("mi cuenta")) {
                window.location.href = "perfil.html";
            }
            else if (textoBoton.includes("salir") || textoBoton.includes("cerrar")) {
                // Si tienes botón de salir al login
                window.location.href = "login.html";
            }
            else {
                // Por si acaso hay un enlace con href directo configurado en el HTML
                const hrefDirecto = boton.getAttribute("href");
                if (hrefDirecto && hrefDirecto !== "#") {
                    window.location.href = hrefDirecto;
                }
            }
        });
    });
});