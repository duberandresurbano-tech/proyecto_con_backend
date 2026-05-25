let carrito = {};

function agregar(nombre, precio) {
    if (!carrito[nombre]) {
        carrito[nombre] = { precio: precio, cantidad: 0 };
    }
    carrito[nombre].cantidad++;
    actualizarContador();
}

function actualizarContador() {
    let totalItems = 0;
    for (let item in carrito) {
        totalItems += carrito[item].cantidad;
    }
    
    // Validamos que el elemento exista en el DOM antes de cambiar el texto
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
        cartCountEl.innerText = totalItems;
    }
}

function verPedido() {
    // Protección por si intentan ver un pedido vacío
    if (Object.keys(carrito).length === 0) {
        alert("El carrito está vacío. Agrega algunas bebidas primero.");
        return;
    }
    
    // Ajuste dinámico de pantallas
    if (document.getElementById("catalogo-screen")) document.getElementById("catalogo-screen").style.style.display = "none";
    if (document.getElementById("main-nav")) document.getElementById("main-nav").style.display = "none";
    
    const pantallaPedido = document.getElementById("pedido");
    if (pantallaPedido) pantallaPedido.style.display = "block";
    
    const btnBack = document.getElementById("btnBack");
    if (btnBack) btnBack.style.display = "flex";
    
    renderPedido();
}

function regresar() {
    const pantallaPedido = document.getElementById("pedido");
    const pantallaCatalogo = document.getElementById("catalogo-screen");
    const overlay = document.getElementById("overlay");

    // 1. Si el modal de confirmación está abierto, solo lo cerramos
    if (overlay && overlay.style.display === "flex") {
        overlay.style.display = "none";
    } 
    // 2. Si estás en la pantalla de revisión de pedido, volvemos al catálogo
    else if (pantallaPedido && pantallaPedido.style.display === "block") {
        pantallaPedido.style.display = "none";
        if (pantallaCatalogo) pantallaCatalogo.style.display = "block";
        if (document.getElementById("main-nav")) document.getElementById("main-nav").style.display = "block";
    } 
    // 3. Si ya estás en el catálogo base: Te manda al menú de inicio
    else {
        window.location.href = "inicio.html"; 
    }
}

function renderPedido() {
    let lista = document.getElementById("listaPedido");
    if (!lista) return;
    
    lista.innerHTML = "";
    let total = 0;
    
    // Si borraste el último elemento con el botón "-", regresamos al catálogo automáticamente
    if (Object.keys(carrito).length === 0) {
        lista.innerHTML = `<p style="text-align:center; color:#888;">No hay productos en el pedido.</p>`;
        document.getElementById("total").innerText = "0";
        setTimeout(() => { regresar(); }, 1000);
        return;
    }

    for (let item in carrito) {
        let data = carrito[item];
        total += data.precio * data.cantidad;
        lista.innerHTML += `
        <div class="pedido-item">
            <div>
                <strong>${item}</strong><br>
                <span class="price">$${data.precio.toLocaleString()}</span>
            </div>
            <div class="qty">
                <button onclick="cambiar('${item}', -1)">-</button>
                <span style="margin:0 10px; font-weight:bold;">${data.cantidad}</span>
                <button onclick="cambiar('${item}', 1)">+</button>
            </div>
        </div>`;
    }
    
    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.innerText = total.toLocaleString();
}

function cambiar(nombre, valor) {
    if (!carrito[nombre]) return;
    
    carrito[nombre].cantidad += valor;
    
    // Si baja de 1, se elimina del objeto carrito
    if (carrito[nombre].cantidad <= 0) {
        delete carrito[nombre];
    }
    
    actualizarContador();
    renderPedido();
}

function vaciarCarrito() {
    if (confirm("¿Deseas vaciar por completo tu pedido actual?")) { 
        carrito = {}; 
        actualizarContador(); 
        regresar(); 
    }
}

function abrirConfirmacion() {
    if (Object.keys(carrito).length === 0) return alert("El carrito está vacío");
    
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.style.display = "flex";
        // Ajustamos dinámicamente el contenido de tu HTML real para no requerir IDs extras inexistentes
        const titleModal = overlay.querySelector("h2");
        if (titleModal) titleModal.innerText = "¿Confirmar pedido enviado a la mesa?";
    }
}

function procesarPedido() {
    const overlay = document.getElementById("overlay");
    if (overlay) {
        const titleModal = overlay.querySelector("h2");
        if (titleModal) titleModal.innerText = "¡Pedido Procesado! Su bebida va en camino 🥂";
        
        // Escondemos los botones de control para que solo lea el mensaje de éxito por un instante
        const botones = overlay.querySelectorAll(".modal-btn");
        botones.forEach(btn => btn.style.display = "none");
        
        // Limpiamos estados
        carrito = {};
        actualizarContador();
        
        // Recargamos o regresamos al home de forma fluida tras 2.5 segundos
        setTimeout(() => {
            overlay.style.display = "none";
            // Restauramos botones del modal para futuras compras
            botones.forEach(btn => btn.style.display = "inline-block");
            if (titleModal) titleModal.innerText = "";
            window.location.href = "inicio.html";
        }, 2500);
    }
}

function reiniciarApp() {
    location.reload();
}