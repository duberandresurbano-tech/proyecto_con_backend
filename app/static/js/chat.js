// ═══════════════════════════════════════════════════════════
//  PLANCLUB VIP CHAT — chat.js
//  Firebase Firestore en tiempo real · sesión persistente
// ═══════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── CONFIG FIREBASE ──────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDX6EWo3Y4M0a4bg0zmEF6DVU-ewd6aadE",
  authDomain: "chatplanclub.firebaseapp.com",
  projectId: "chatplanclub",
  storageBucket: "chatplanclub.firebasestorage.app",
  messagingSenderId: "495297083014",
  appId: "1:495297083014:web:0e0d1b3e17e583840b0307"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── ESTADO GLOBAL ────────────────────────────────────────
let roomId, roomCode, myId, myName, myRole;
let isConnecting       = false;
let unsubscribeRoom    = null;   // Oyente de estado de sala
let unsubscribeMensajes = null;  // Oyente de mensajes en tiempo real

const $ = (id) => document.getElementById(id);
const digitInputs = document.querySelectorAll(".code-digit");

// ══════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════
function toast(msg, esError = false) {
  const container = $("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast" + (esError ? " err" : "");
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// ══════════════════════════════════════════════════════════
//  GESTIÓN DE PANTALLAS
// ══════════════════════════════════════════════════════════
function mostrarPantalla(id) {
  ["screen-access", "screen-espera", "screen-chat"].forEach(s => {
    const el = $(s);
    if (el) {
      el.classList.remove("active");
      el.style.display = "none";
    }
  });
  const target = $(id);
  if (target) {
    target.style.display = "flex";
    requestAnimationFrame(() => target.classList.add("active"));
  }
}

// ══════════════════════════════════════════════════════════
//  RECUPERAR SESIÓN AL RECARGAR
// ══════════════════════════════════════════════════════════
async function intentarRecuperarSesion() {
  myId   = localStorage.getItem("planclub_id");
  myName = localStorage.getItem("planclub_name");
  myRole = localStorage.getItem("planclub_role");
  roomId = localStorage.getItem("planclub_room");

  if (!myId || !myName || !myRole || !roomId) return false;

  try {
    const snap = await getDoc(doc(db, "salas", roomId));
    if (!snap.exists()) {
      limpiarSesion();
      return false;
    }

    const sala = snap.data();

    if (sala.estado === "terminado") {
      limpiarSesion();
      toast("La sala anterior fue cerrada.", true);
      return false;
    }

    if (sala.estado === "esperando" && myRole === "host") {
      roomCode = roomId.replace("sala_", "");
      mostrarPantalla("screen-espera");
      $("espera-code").textContent = roomCode;
      escucharEstadoSala();
      return true;
    }

    if (sala.estado === "conectado") {
      roomCode = roomId.replace("sala_", "");
      const nombrePar = myRole === "host" ? sala.guestNombre : sala.hostNombre;
      abrirChat(nombrePar, true);
      return true;
    }
  } catch (e) {
    console.error("Error recuperando sesión:", e);
    limpiarSesion();
  }
  return false;
}

function limpiarSesion() {
  localStorage.removeItem("planclub_id");
  localStorage.removeItem("planclub_name");
  localStorage.removeItem("planclub_role");
  localStorage.removeItem("planclub_room");
  myId = myName = myRole = roomId = roomCode = null;
}

// ══════════════════════════════════════════════════════════
//  CREAR SALA (HOST)
// ══════════════════════════════════════════════════════════
async function crearSala(name) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  roomId   = "sala_" + code;
  roomCode = code;
  myId     = "usr_" + crypto.randomUUID().split("-")[0];
  myName   = name;
  myRole   = "host";

  guardarSesion();

  const btn = $("btn-crear");
  if (btn) {
    btn.disabled = true;
    btn.querySelector("span").textContent = "Creando sala...";
  }

  try {
    await setDoc(doc(db, "salas", roomId), {
      hostId:      myId,
      hostNombre:  myName,
      guestId:     "",
      guestNombre: "",
      estado:      "esperando",
      creadoEn:    serverTimestamp()
    });

    mostrarPantalla("screen-espera");
    $("espera-code").textContent = roomCode;
    toast("¡Sala creada! Comparte el código.");
    escucharEstadoSala();

  } catch(err) {
    console.error("Error creando sala:", err);
    toast("Error al crear la sala.", true);
    limpiarSesion();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.querySelector("span").textContent = "GENERAR CÓDIGO";
    }
  }
}

function escucharEstadoSala() {
  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = onSnapshot(doc(db, "salas", roomId), (snap) => {
    if (!snap.exists()) return;
    const sala = snap.data();

    if (sala.estado === "conectado" && sala.guestId) {
      if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
      abrirChat(sala.guestNombre, false);
    }

    if (sala.estado === "terminado") {
      if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
      limpiarSesion();
      mostrarPantalla("screen-access");
      toast("La sala fue cerrada.", true);
    }
  });
}

// ══════════════════════════════════════════════════════════
//  UNIRSE A SALA (GUEST)
// ══════════════════════════════════════════════════════════
async function unirseASala(name, code) {
  if (isConnecting) return;
  isConnecting = true;

  roomCode = code;
  roomId   = "sala_" + code;
  myId     = "usr_" + crypto.randomUUID().split("-")[0];
  myName   = name;
  myRole   = "guest";

  const btn = $("btn-unirse");
  if (btn) {
    btn.disabled = true;
    btn.querySelector("span").textContent = "Conectando...";
  }

  try {
    const salaSnap = await getDoc(doc(db, "salas", roomId));

    if (!salaSnap.exists()) {
      toast("Código incorrecto — sala no encontrada.", true);
      digitInputs.forEach(d => { d.style.borderColor = "#ff4455"; });
      setTimeout(() => digitInputs.forEach(d => { d.style.borderColor = ""; }), 1500);
      return;
    }

    const sala = salaSnap.data();

    if (sala.estado !== "esperando") {
      toast("Esta sala ya está en uso o fue cerrada.", true);
      return;
    }

    guardarSesion();

    await updateDoc(doc(db, "salas", roomId), {
      guestId:     myId,
      guestNombre: myName,
      estado:      "conectado"
    });

    abrirChat(sala.hostNombre, false);

  } catch(err) {
    console.error("Error al unirse:", err);
    toast("Error de conexión.", true);
    limpiarSesion();
  } finally {
    isConnecting = false;
    if (btn) {
      btn.disabled = false;
      btn.querySelector("span").textContent = "UNIRME AL CHAT";
    }
  }
}

// ══════════════════════════════════════════════════════════
//  ABRIR CHAT Y CONFIGURACIÓN DE CABECERA AUTOMÁTICA
// ══════════════════════════════════════════════════════════
function abrirChat(nombreOtro, esRecuperacion = false) {
  mostrarPantalla("screen-chat");
  
  // Setea el identificador visual de la sala en la cabecera
  $("chat-room-code").textContent = "# " + roomCode;

  // Pintamos los datos reales del otro usuario conectados en tiempo real
  $("chat-peer-name").innerText = nombreOtro;
  $("chat-peer-avatar").innerText = nombreOtro.charAt(0).toUpperCase();
  
  const dot = $("chat-status-dot");
  dot.classList.remove("waiting");
  dot.classList.add("online");
  $("chat-status-txt").innerText = "en línea";
  
  $("input-bar").classList.remove("locked");

  if (!esRecuperacion) toast("¡Chat conectado!");
  if (!esRecuperacion) {
    agregarMensajeSistema("Chat iniciado — los mensajes son privados ✦");
  }

  escucharTerminacion();
  escucharMensajes();
}

function escucharTerminacion() {
  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = onSnapshot(doc(db, "salas", roomId), (snap) => {
    if (!snap.exists() || snap.data().estado === "terminado") {
      if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
      if (unsubscribeMensajes) { unsubscribeMensajes(); unsubscribeMensajes = null; }
      limpiarSesion();
      agregarMensajeSistema("El otro participante salió del chat.");
      $("input-bar").classList.add("locked");
      $("chat-status-dot").classList.remove("online");
      $("chat-status-dot").classList.add("waiting");
      $("chat-status-txt").textContent = "desconectado";

      setTimeout(() => {
        mostrarPantalla("screen-access");
        resetearAcceso();
      }, 2500);
    }
  });
}

// ══════════════════════════════════════════════════════════
//  MENSAJES EN TIEMPO REAL
// ══════════════════════════════════════════════════════════
function escucharMensajes() {
  if (unsubscribeMensajes) unsubscribeMensajes();

  const mensajesRef = collection(db, "salas", roomId, "mensajes");
  const q = query(mensajesRef, orderBy("enviadoEn", "asc"));

  unsubscribeMensajes = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const msg = change.doc.data();
        if (msg.autorId !== myId) {
          renderMensaje(msg.autor, msg.texto, "recv", msg.hora);
        }
      }
    });
  });
}

async function enviarMensaje() {
  const input = $("msg-input");
  const texto = input.value.trim();
  if (!texto) return;

  input.value = "";
  const hora = horaActual();
  renderMensaje("Tú", texto, "sent", hora);

  try {
    await addDoc(collection(db, "salas", roomId, "mensajes"), {
      autorId:   myId,
      autor:     myName,
      texto:     texto,
      hora:      hora,
      enviadoEn: serverTimestamp()
    });
  } catch(err) {
    console.error("Error enviando mensaje:", err);
    toast("Error al enviar el mensaje.", true);
  }
}

// ══════════════════════════════════════════════════════════
//  RENDERIZADO DE MENSAJES
// ══════════════════════════════════════════════════════════
function renderMensaje(autor, texto, tipo, hora) {
  const area = $("chat-messages");
  const row = document.createElement("div");
  row.className = "msg-row " + tipo;

  if (tipo === "recv") {
    const sender = document.createElement("span");
    sender.className = "msg-sender";
    sender.textContent = autor;
    row.appendChild(sender);
  }

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = texto;
  row.appendChild(bubble);

  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = hora;
  row.appendChild(time);

  area.appendChild(row);
  area.scrollTop = area.scrollHeight;
}

function agregarMensajeSistema(texto) {
  const area = $("chat-messages");
  const el = document.createElement("div");
  el.className = "sys-msg";
  el.textContent = texto;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

function horaActual() {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

// ══════════════════════════════════════════════════════════
//  SALIR DEL CHAT
// ══════════════════════════════════════════════════════════
function mostrarModalSalir() { $("modal-salir").style.display = "flex"; }
function ocultarModalSalir() { $("modal-salir").style.display = "none"; }

async function confirmarSalir() {
  ocultarModalSalir();
  try {
    await updateDoc(doc(db, "salas", roomId), { estado: "terminado" });
  } catch(e) { console.error("Error al cerrar sala:", e); }

  if (unsubscribeRoom)     { unsubscribeRoom();     unsubscribeRoom = null; }
  if (unsubscribeMensajes) { unsubscribeMensajes(); unsubscribeMensajes = null; }

  limpiarSesion();
  mostrarPantalla("screen-access");
  resetearAcceso();
  toast("Has salido del chat.");
}

async function cancelarEspera() {
  if (unsubscribeRoom) { unsubscribeRoom(); unsubscribeRoom = null; }
  try {
    await updateDoc(doc(db, "salas", roomId), { estado: "terminado" });
  } catch(e) {}
  limpiarSesion();
  mostrarPantalla("screen-access");
  resetearAcceso();
}

// ══════════════════════════════════════════════════════════
//  UTILIDADES Y CONTROLADORES DE EVENTOS ACTIVO
// ══════════════════════════════════════════════════════════
function guardarSesion() {
  localStorage.setItem("planclub_id",   myId);
  localStorage.setItem("planclub_name", myName);
  localStorage.setItem("planclub_role", myRole);
  localStorage.setItem("planclub_room", roomId);
}

function resetearAcceso() {
  digitInputs.forEach(d => { d.value = ""; d.classList.remove("filled"); });
  $("chat-messages").innerHTML = "";
  const dot = $("chat-status-dot");
  dot.classList.remove("online");
  dot.classList.add("waiting");
  $("chat-status-txt").textContent = "conectando";
  $("input-bar").classList.add("locked");

  $("tab-crear").classList.add("active");
  $("tab-unirse").classList.remove("active");
  $("panel-crear").style.display = "flex";
  $("panel-unirse").style.display = "none";
}

// --- ASIGNACIÓN DE CLICK: CREAR SALA AUTOMÁTICO ---
const btnCrear = $("btn-crear");
if (btnCrear) {
  btnCrear.addEventListener('click', (e) => {
    e.preventDefault();
    // Lee directamente de la sesión guardada por el login principal.
    const miNombre = localStorage.getItem('userName') || "Usuario VIP";
    crearSala(miNombre); // 🚀 Llama de verdad a la función de Firebase
  });
}

// --- ASIGNACIÓN DE CLICK: UNIRSE A SALA AUTOMÁTICO ---
const btnUnirse = $("btn-unirse");
if (btnUnirse) {
  btnUnirse.addEventListener('click', (e) => {
    e.preventDefault();
    const miNombre = localStorage.getItem('userName') || "Usuario VIP";
    
    // Captura los 6 números
    const codigoInput = Array.from(digitInputs).map(i => i.value).join('');
    
    if (codigoInput.length === 6) {
      unirseASala(miNombre, codigoInput); // 🚀 Conecta de verdad con Firebase
    } else {
      toast("Ingresa el código completo de 6 dígitos.", true);
    }
  });
}

// --- EVENTOS DEL ENTORNO ---
$("btn-cancelar-espera").addEventListener("click", cancelarEspera);
$("btn-send").addEventListener("click", enviarMensaje);
$("msg-input").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }
});

$("btn-regresar-chat").addEventListener("click", () => {
  window.location.href = "/inicio"; // Regresar a inicio
});
$("btn-salir-chat").addEventListener("click", mostrarModalSalir);
$("btn-confirmar-salir").addEventListener("click", confirmarSalir);
$("btn-cancelar-salir").addEventListener("click", ocultarModalSalir);

// --- CAMBIO ENTRE PANELES ---
$("tab-crear").addEventListener("click", () => {
  $("tab-crear").classList.add("active");
  $("tab-unirse").classList.remove("active");
  $("panel-crear").style.display = "flex";
  $("panel-unirse").style.display = "none";
});
$("tab-unirse").addEventListener("click", () => {
  $("tab-unirse").classList.add("active");
  $("tab-crear").classList.remove("active");
  $("panel-unirse").style.display = "flex";
  $("panel-crear").style.display = "none";
});

// --- ENTRADA DE INPUTS DE CÓDIGO ---
digitInputs.forEach((inp, idx) => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/\D/g, "").slice(-1);
    inp.classList.toggle("filled", !!inp.value);
    if (inp.value && idx < digitInputs.length - 1) digitInputs[idx + 1].focus();
  });
  inp.addEventListener("keydown", e => {
    if (e.key === "Backspace" && !inp.value && idx > 0) {
      digitInputs[idx - 1].focus();
      digitInputs[idx - 1].value = "";
      digitInputs[idx - 1].classList.remove("filled");
    }
    if (e.key === "Enter") $("btn-unirse").click();
  });
  inp.addEventListener("paste", e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
    [...text].forEach((ch, i) => {
      if (digitInputs[i]) { digitInputs[i].value = ch; digitInputs[i].classList.add("filled"); }
    });
    const lastFilled = Math.min(text.length, digitInputs.length - 1);
    digitInputs[lastFilled].focus();
  });
});

// ── REDIRECCIÓN DE SEGURIDAD (Si entra directo sin pasar por el Login) ──
document.addEventListener('DOMContentLoaded', () => {
  const loginActivo = localStorage.getItem('userName');
  if (!loginActivo) {
    window.location.href = "/"; // Devuelve al login de PlanClub
  } else {
    intentarRecuperarSesion();
  }
});