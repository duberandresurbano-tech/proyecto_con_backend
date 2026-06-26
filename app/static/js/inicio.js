document.addEventListener("DOMContentLoaded", () => {
    console.log("Menú de Inicio de PlanClub cargado correctamente. 🚀");

    const botones = document.querySelectorAll(".btn");

    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const textoBoton = boton.textContent.toLowerCase();

            // 🌟 Si es administración o cerrar sesión, dejamos que Flask actúe normalmente con su href
            if (textoBoton.includes("administración") || textoBoton.includes("admin") || textoBoton.includes("cerrar")) {
                return; // No ejecutamos el preventDefault(), dejamos que viaje a la URL del href
            }

            e.preventDefault(); // Solo frena los demás para procesar las redirecciones manuales

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
        });
    });
});