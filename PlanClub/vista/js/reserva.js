// --- VARIABLES GLOBALES ---
let mesasSeleccionadas = [];
let tempUser = {};
let dbReservas = JSON.parse(localStorage.getItem('planclub_db')) || [];

// --- CONFIGURACIÓN DE MESAS (Tu mapa original alineado al CSS) ---
const configMesas = [
    {id: 1, c: 'm-r', g: 'grid-row:8;grid-column:1;'}, {id: 2, c: 'm-r', g: 'grid-row:7;grid-column:1;'},
    {id: 3, c: 'm-r', g: 'grid-row:6;grid-column:1;'}, {id: 4, c: 'm-y', g: 'grid-row:5;grid-column:1;'},
    {id: 5, c: 'm-y', g: 'grid-row:4;grid-column:1;'}, {id: 6, c: 'm-y', g: 'grid-row:3;grid-column:1;'},
    {id: 7, c: 'm-y', g: 'grid-row:2;grid-column:1;'}, {id: 8, c: 'm-y', g: 'grid-row:2;grid-column:2;'},
    {id: 9, c: 'm-y', g: 'grid-row:2;grid-column:3;'}, {id: 10, c: 'm-y', g: 'grid-row:2;grid-column:4;'},
    {id: 11, c: 'm-y', g: 'grid-row:2;grid-column:5;'}, {id: 12, c: 'm-y', g: 'grid-row:2;grid-column:6;'},
    {id: 13, c: 'm-y', g: 'grid-row:3;grid-column:6;'}, {id: 14, c: 'm-y', g: 'grid-row:4;grid-column:6;'},
    {id: 15, c: 'm-r', g: 'grid-row:5;grid-column:6;'}, {id: 16, c: 'm-r', g: 'grid-row:6;grid-column:6;'},
    {id: 17, c: 'm-r', g: 'grid-row:7;grid-column:6;'}, {id: 18, c: 'm-o', g: 'grid-row:4;grid-column:2;'},
    {id: 19, c: 'm-o', g: 'grid-row:4;grid-column:5;'}, {id: 20, c: 'm-b', g: 'grid-row:5;grid-column:3;'},
    {id: 30, c: 'm-b', g: 'grid-row:5;grid-column:4;'}, {id: 100, c: 'm-t', g: 'grid-row:6;grid-column:3;'},
    {id: 101, c: 'm-t', g: 'grid-row:6;grid-column:4;'}
];

// --- NAVEGACIÓN ---
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + id);
    if (target) target.classList.add('active');
    
    if (id === 'map') renderMapa();
    if (id === 'list') renderList();
    if (id === 'pago') {
        const resumen = document.getElementById('resumen-pago');
        if (resumen) {
            resumen.innerHTML = `
                <b>Cliente:</b> ${tempUser.nombre}<br>
                <b>Fecha Evento:</b> ${tempUser.fecha}<br>
                <b>Mesas apartadas:</b> ${mesasSeleccionadas.join(', ')}<br>
                <b>Total Reserva:</b> $${(mesasSeleccionadas.length * 40000).toLocaleString()} COP
            `;
        }
    }
}

// --- VALIDACIONES DE INICIO ---
function confirmarDatos() {
    const n = document.getElementById('nombre').value.trim();
    const f = document.getElementById('fecha').value; // Formato YYYY-MM-DD
    const p = parseInt(document.getElementById('personas').value);

    if (!n || !f || !p) return alert("Por favor, completa todos los campos.");
    if (p > 10) return alert("Máximo 10 personas por reserva.");

    // SOLUCIÓN AL BUG DE FECHAS: Dividimos la cadena para evitar desfaces de zona horaria (UTC)
    const [year, month, day] = f.split('-').map(Number);
    const fechaElegida = new Date(year, month - 1, day);

    const hoy = new Date();
    hoy.setHours(0,0,0,0); // Resetear horas locales para comparar limpiamente

    const limiteFuturo = new Date();
    limiteFuturo.setMonth(limiteFuturo.getMonth() + 3);

    if (fechaElegida < hoy) return alert("No puedes reservar en fechas pasadas.");
    if (fechaElegida > limiteFuturo) return alert("Solo permitimos reservas hasta con 3 meses de anticipación.");

    tempUser = { nombre: n, fecha: f, personas: p }; 
    mesasSeleccionadas = []; // Limpiamos selecciones viejas por seguridad
    showView('map'); 
}

// --- RENDERIZADO DEL MAPA INTERACTIVO ---
function renderMapa() {
    const grid = document.getElementById('mapa-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="dj-set">DJ SET</div>';
    
    // CORRECCIÓN DEL VACÍO LEGAL: Filtrar ocupadas ÚNICAMENTE para la fecha que el usuario eligió
    const ocupadas = dbReservas
        .filter(r => r.fecha === tempUser.fecha)
        .flatMap(r => r.mesas);

    configMesas.forEach(m => {
        const div = document.createElement('div');
        const estaOcupada = ocupadas.includes(m.id);
        const estaSeleccionada = mesasSeleccionadas.includes(m.id);

        div.className = `mesa ${m.c}`;
        if (estaOcupada) div.classList.add('ocupada');
        if (estaSeleccionada) div.classList.add('selected');

        div.style = m.g; 
        div.innerText = m.id;

        // Gestión de Clics
        if (!estaOcupada) {
            div.onclick = () => {
                if (mesasSeleccionadas.includes(m.id)) {
                    mesasSeleccionadas = mesasSeleccionadas.filter(i => i !== m.id);
                } else {
                    mesasSeleccionadas.push(m.id);
                }
                renderMapa(); // Re-renderizado reactivo del mapa
            };
        } else {
            div.innerText = "X";
            div.setAttribute("title", "Mesa no disponible para esta fecha");
        }
        grid.appendChild(div);
    });
    
    // Actualización del panel inferior de información de compra
    const info = document.getElementById('map-info');
    if (info) {
        if (mesasSeleccionadas.length > 0) {
            info.style.display = "block";
            document.getElementById('txt-mesas').innerText = "Mesas: " + mesasSeleccionadas.join(', ');
            document.getElementById('txt-total').innerText = "$" + (mesasSeleccionadas.length * 40000).toLocaleString() + " COP";
        } else {
            info.style.display = "none";
        }
    }
}

// --- FINALIZAR Y GUARDAR EN LOCALSTORAGE ---
function finalizarPago() {
    if (mesasSeleccionadas.length === 0) return alert("Selecciona al menos una mesa para continuar.");
    
    // Guardamos la estructura limpia en el array global
    dbReservas.push({ 
        id: Date.now(), 
        ...tempUser, 
        mesas: [...mesasSeleccionadas], 
        total: mesasSeleccionadas.length * 40000 
    });
    
    localStorage.setItem('planclub_db', JSON.stringify(dbReservas));
    alert("¡Reserva confirmada con éxito en PlanClub! 🥂 Tu mesa ya está separada.");
    
    // Limpiamos el estado local de la sesión de reserva
    mesasSeleccionadas = [];
    tempUser = {};
    
    // Redirección fluida
    showView('home');
}

// --- HISTORIAL DE RESERVAS ---
function renderList() {
    const container = document.getElementById('reserva-container');
    if (!container) return;

    if (dbReservas.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#666; margin-top:20px;">No registras ninguna reserva previa.</p>`;
        return;
    }

    container.innerHTML = dbReservas.map(r => `
        <div class="card" style="border-left:5px solid var(--neon-cyan); margin-bottom: 12px;">
            <h4 style="margin:0 0 5px 0; color:var(--neon-cyan);">Mesas Apartadas: ${r.mesas.join(', ')}</h4>
            <p style="margin:2px 0; font-size:0.9rem;"><b>Titular:</b> ${r.nombre}</p>
            <p style="margin:2px 0; font-size:0.85rem; color:#aaa;">Fecha: ${r.fecha} • Total Pago: $${r.total.toLocaleString()} COP</p>
        </div>
    `).join('');
}

// --- MENÚ DE CONFIGURACIÓN DE LA RUEDITA ---
function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (!menu) return;

    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'flex';
    }
}