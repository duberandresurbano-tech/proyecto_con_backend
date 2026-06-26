const bdProductos = [
    { id: 1, nombre: 'Bacardi', precio: 70000, cat: 'bebidas', img: 'https://cdn.mos.cms.futurecdn.net/v2/t:0,l:218,cw:563,ch:563,q:80,w:563/wn2NRMm5iJBXeZPBrefnhK.jpg' },
    { id: 2, nombre: 'Coronita', precio: 5000, cat: 'bebidas', img: 'https://i.pinimg.com/474x/82/d8/48/82d84883fb32e2e4c31c7760830ee0f1.jpg' },
    { id: 3, nombre: 'Néctar', precio: 50000, cat: 'bebidas', img: 'https://pbs.twimg.com/profile_images/472153934015254529/XOrYqyI2_400x400.jpeg' },
    { id: 4, nombre: 'Poker', precio: 3500, cat: 'bebidas', img: 'https://images.seeklogo.com/logo-png/18/1/cerveza-poker-logo-png_seeklogo-184736.png' },
    { id: 5, nombre: 'Águila', precio: 3500, cat: 'bebidas', img: 'https://imgproxy.domestika.org/unsafe/rs:fill/plain/src://content-items/002/864/382/Aguila_logo-original.png?1552905177' },
    { id: 6, nombre: 'Powerade', precio: 5000, cat: 'bebidas', img: 'https://logowik.com/content/uploads/images/powerade374.logowik.com.webp' },
    { id: 7, nombre: 'Aguardiente Amarillo', precio: 50000, cat: 'bebidas', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0ro27SpW_X4XaTzLFQB2BWwNb80we3Kj9Ng&s' },
    { id: 8, nombre: 'Ron Viejo de Caldas', precio: 62000, cat: 'bebidas', img: 'https://licoresdelgolfo.com/wp-content/uploads/2025/08/ronviejo.png' },
    { id: 14, nombre: 'Club Colombia', precio: 5500, cat: 'bebidas', img: 'https://rutadelacerveza.weebly.com/uploads/1/6/0/6/16066944/club-colombia_orig.png' },
    { id: 15, nombre: 'Vodka Absolut', precio: 85000, cat: 'bebidas', img: 'https://w7.pngwing.com/pngs/72/288/png-transparent-absolut-vodka-hd-logo.png' },
    
    { id: 9, nombre: '2x1 Aguardiente Amarillo', precio: 75000, cat: 'promociones', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0ro27SpW_X4XaTzLFQB2BWwNb80we3Kj9Ng&s' },
    { id: 10, nombre: 'Ron Caldas + 15% Descuento', precio: 52700, cat: 'promociones', img: 'https://licoresdelgolfo.com/wp-content/uploads/2025/08/ronviejo.png' },
    { id: 11, nombre: 'Balde de Poker (6 Unidades)', precio: 18000, cat: 'promociones', img: 'https://images.seeklogo.com/logo-png/18/1/cerveza-poker-logo-png_seeklogo-184736.png' },
    
    { id: 12, nombre: 'Combo Amigos (Media Amarillo + 4 Pokers)', precio: 60000, cat: 'combos', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=60' },
    { id: 13, nombre: 'Combo Botella Bacardi + 4 Powerade', precio: 82000, cat: 'combos', img: 'https://cdn.mos.cms.futurecdn.net/v2/t:0,l:218,cw:563,ch:563,q:80,w:563/wn2NRMm5iJBXeZPBrefnhK.jpg' }
];

let carrito = [];
let pantallaActual = 'catalogo';
let filtroActivo = 'bebidas';

// Renderizado inicial al cargar el script
renderizarCatalogo();

function renderizarCatalogo() {
    const contenedor = document.getElementById('contenedor-productos-dinamicos');
    contenedor.innerHTML = '';

    const productosFiltrados = bdProductos.filter(p => p.cat === filtroActivo);
    if (productosFiltrados.length === 0) return;

    const tituloSec = document.createElement('div');
    tituloSec.className = 'section-title';
    tituloSec.innerText = filtroActivo === 'bebidas' ? 'Nuestras Bebidas' : filtroActivo.toUpperCase();
    contenedor.appendChild(tituloSec);

    const grid = document.createElement('div');
    grid.className = 'products-grid';

    productosFiltrados.forEach((prod, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.setAttribute('onclick', `agregar('${prod.nombre}', ${prod.precio})`);
        card.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}">
            <div style="width:100%;">
                <p class="title">${prod.nombre}</p>
                <p class="price">$${prod.precio.toLocaleString('es-CO')}</p>
                <button class="add-btn">+</button>
            </div>
        `;
        grid.appendChild(card);
    });
    contenedor.appendChild(grid);
}

function filtrarCategoria(categoria) {
    filtroActivo = categoria;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${categoria}`).classList.add('active');
    
    const contenedor = document.getElementById('catalogo-screen');
    contenedor.style.opacity = '0.4';
    setTimeout(() => {
        renderizarCatalogo();
        contenedor.style.opacity = '1';
    }, 600);
}

function manejadorBotonSuperior() {
    if (pantallaActual === 'pedido') {
        regresar();
    } else {
        // 🛠️ CORREGIDO: Ya no busca el archivo HTML en el disco sino la ruta limpia de Flask
        window.location.href = "/inicio"; 
    }
}

function agregar(nombre, precio) {
    const itemExistente = carrito.find(prod => prod.nombre === nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
    }
    actualizarContadores();
    lanzarToast(`¡${nombre} añadido! 🥂`);
}

function actualizarContadores() {
    const totalItems = carrito.reduce((acumulado, item) => acumulado + item.cantidad, 0);
    document.getElementById('cart-count').innerText = totalItems;
}

function lanzarToast(mensaje) {
    const toast = document.getElementById('toast-notificacion');
    toast.innerText = mensaje;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 1800);
}

function verPedido() {
    pantallaActual = 'pedido';
    const scrCatalogo = document.getElementById('catalogo-screen');
    const scrPedido = document.getElementById('pedido');
    
    scrCatalogo.style.display = 'none';
    scrPedido.style.display = 'block';
    setTimeout(() => {
        scrPedido.style.opacity = '1';
        scrPedido.style.transform = 'scale(1)';
    }, 10);

    document.getElementById('main-nav').style.display = 'none'; 
    document.getElementById('header-title').innerText = "Mi Pedido";
    document.getElementById('logoSuperior').style.display = 'none';
    document.getElementById('casaSuperior').style.display = 'none'; 
    document.getElementById('flechaSuperior').style.display = 'block';
    renderizarListaPedido();
}

function renderizarListaPedido() {
    const contenedor = document.getElementById('listaPedido');
    const txtTotal = document.getElementById('total');
    contenedor.innerHTML = '';

    if(carrito.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding: 40px 0; color:#8e8e93; animation: superDespliegue 0.4s ease forwards;">
                <p style="font-size:48px; margin-bottom:10px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));">🛒</p>
                <p>Tu orden está vacía.</p>
            </div>
        `;
        txtTotal.innerText = '0';
        return;
    }

    let totalAcumulado = 0;
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalAcumulado += subtotal;
        const div = document.createElement('div');
        div.className = 'item-carrito';
        div.style.animation = `superDespliegue 0.3s ease forwards`;
        div.style.animationDelay = `${index * 0.04}s`;
        div.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.nombre}</span>
                <span class="item-qty">x${item.cantidad}</span>
            </div>
            <div class="item-actions">
                <span class="item-subtotal">$${subtotal.toLocaleString('es-CO')}</span>
                <button class="delete-btn" onclick="eliminarProducto(${index})">✕</button>
            </div>
        `;
        contenedor.appendChild(div);
    });
    txtTotal.innerText = totalAcumulado.toLocaleString('es-CO');
}