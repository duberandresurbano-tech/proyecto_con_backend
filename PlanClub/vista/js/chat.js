let peer;
let conn;
let myRole = localStorage.getItem('macarena_role') || 'cliente';

// 1. Generar o recuperar mi ID (6 números)
if (!localStorage.getItem('macarena_my_id')) {
    localStorage.setItem('macarena_my_id', Math.floor(100000 + Math.random() * 900000));
}
const mySavedId = localStorage.getItem('macarena_my_id');

// 2. Inicializar PeerJS
peer = new Peer(mySavedId);

peer.on('open', (id) => {
    document.getElementById('display-my-id').innerText = id;
    
    // RECONEXIÓN AUTOMÁTICA
    const lastPartner = localStorage.getItem('last_partner_id');
    if (lastPartner) {
        console.log("Intentando reconectar con:", lastPartner);
        connectToPeer(lastPartner);
    }
});

// Escuchar conexiones entrantes
peer.on('connection', (incomingConn) => {
    conn = incomingConn;
    conn.on('open', () => {
        // Guardar al partner que se conectó a nosotros para poder reconectar
        localStorage.setItem('last_partner_id', conn.peer);
        setupChat();
    });
});

peer.on('error', (err) => {
    console.error("Error de Peer:", err);
    if (err.type === 'peer-disconnected' || err.type === 'network') {
        // Silencioso para no molestar en reconexiones
    } else {
        alert("Asegúrate de que el ID sea correcto y tu compañero esté conectado.");
    }
});

function selectRole(role) {
    myRole = role;
    localStorage.setItem('macarena_role', role);
    document.getElementById('role-client').classList.toggle('active', role === 'cliente');
    document.getElementById('role-vendor').classList.toggle('active', role === 'vendedor');
}

function connectToPeer(savedId = null) {
    const otherId = savedId || document.getElementById('other-id').value.trim();

    if (!otherId) return; // No alertar si es reconexión automática fallida

    localStorage.setItem('last_partner_id', otherId);
    
    conn = peer.connect(otherId);
    
    conn.on('open', () => setupChat());
    
    conn.on('error', (err) => {
        console.error("Error en conexión:", err);
    });
}

function setupChat() {
    document.getElementById('access-screen').style.display = 'none';
    const wrap = document.getElementById('chat-wrap');
    wrap.classList.add('visible');
    
    document.getElementById('chat-title').innerText = myRole === 'cliente' ? "VENDEDOR MACARENA" : "CLIENTE MACARENA";

    // Cargar historial
    loadHistory();

    conn.on('data', (data) => {
        // Verificar si es un mensaje de control para cerrar el chat
        if (data.type === 'CONTROL_EXIT') {
            alert("Tu compañero ha finalizado la sesión.");
            forceLocalExit();
            return;
        }

        // Si no es un mensaje de control, es un mensaje normal
        saveMessage(data, 'recv'); 
        renderMsg(data, 'recv', true);
        document.getElementById('notif-sound').play().catch(() => {}); 
    });

function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();

    if (text && conn && conn.open) {
        const msgData = {
            text: text,
            role: myRole,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        conn.send(msgData);
        saveMessage(msgData, 'sent');
        renderMsg(msgData, 'sent', true);
        input.value = '';
    }
}

function saveMessage(data, type) {
    let history = JSON.parse(localStorage.getItem('macarena_history') || '[]');
    history.push({ data, type });
    localStorage.setItem('macarena_history', JSON.stringify(history));
}

function renderMsg(data, type, alreadySaved = false) {
    const container = document.getElementById('messages');
    const row = document.createElement('div');
    row.className = `msg-row ${type}`;

    row.innerHTML = `
        <div style="font-size:0.65rem; color:${type==='sent'?'var(--neon-purple)':'var(--neon-cyan)'}; margin-bottom:4px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">
          ${type === 'sent' ? 'Tú' : data.role}
        </div>
        <div class="msg-bubble">${data.text}</div>
        <div style="font-size:0.55rem; color:#555; margin-top:4px; text-align:${type==='sent'?'right':'left'}">${data.time}</div>
    `;

    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
}

function loadHistory() {
    const container = document.getElementById('messages');
    container.innerHTML = ''; 
    let history = JSON.parse(localStorage.getItem('macarena_history') || '[]');
    history.forEach(item => {
        renderMsg(item.data, item.type, true);
    });
}

// Botones de control
function clearChat() {
    if(confirm("¿Borrar todos los mensajes?")) {
        // Eliminamos solo la lista de mensajes de la memoria
        localStorage.removeItem('macarena_history');
        // Limpiamos la pantalla
        document.getElementById('messages').innerHTML = '';
    }
}

function exitChat() {
    if(confirm("¿Deseas cerrar la sesión? Ambos saldrán del chat.")) {
        // 1. Avisar al compañero que nos vamos
        if (conn && conn.open) {
            conn.send({ type: 'CONTROL_EXIT' });
        }
        
        // 2. Ejecutar la limpieza local
        forceLocalExit();
    }
}

// Función auxiliar para limpiar y recargar
function forceLocalExit() {
    localStorage.removeItem('last_partner_id');
    localStorage.removeItem('macarena_history'); // Opcional: borrar historial al salir definitivamente
    location.reload();
}