let currentUser = null;
let streamActual = null;
let usarPerfil = false;

// Abrir y cerrar modales
function openModal(id) { document.getElementById(id).classList.add("active"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }

// Registro
document.getElementById("registro-form").addEventListener("submit", e => {
  e.preventDefault();
  const datos = new FormData(e.target);
  if (datos.get("password") !== datos.get("confirm-password")) {
    alert("Las contraseñas no coinciden");
    return;
  }
  const user = {
    nombre: datos.get("nombre"),
    apellido: datos.get("apellido"),
    dni: datos.get("dni"),
    celular: datos.get("celular"),
    email: datos.get("email"),
    municipio: datos.get("municipio"),
    seccion: datos.get("seccion"),
    password: datos.get("password"),
    fotoUrl: null
  };
  let registros = JSON.parse(localStorage.getItem("registros") || "[]");
  registros.push(user);
  localStorage.setItem("registros", JSON.stringify(registros));
  alert("✅ Registro exitoso");
  closeModal("registro-modal");
  e.target.reset();
});

// Login rápido
function quickLogin() {
  const dni = document.getElementById("login-dni").value;
  const pass = document.getElementById("login-password").value;
  let registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const user = registros.find(u => u.dni === dni && u.password === pass);
  if (user) {
    currentUser = user;
    document.getElementById("user-name").textContent = `${user.nombre} ${user.apellido}`;
    document.getElementById("user-location").textContent = `${user.seccion} - ${user.municipio}`;
    document.getElementById("user-profile-img").src = user.fotoUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    document.getElementById("user-panel").classList.remove("hidden");
    document.getElementById("quick-login").classList.add("hidden");
  } else {
    alert("❌ Usuario o contraseña incorrectos");
  }
}

function logout() {
  currentUser = null;
  document.getElementById("user-panel").classList.add("hidden");
  document.getElementById("quick-login").classList.remove("hidden");
}

// Cámara
function abrirCamara(perfil = false) {
  usarPerfil = perfil;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: perfil ? "user" : "environment" } })
    .then(stream => {
      streamActual = stream;
      document.getElementById("camara-modal").classList.add("active");
      document.getElementById("camera-video").srcObject = stream;
    })
    .catch(err => alert("Error al acceder a la cámara: " + err));
}

function capturarFoto() {
  const video = document.getElementById("camera-video");
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const foto = canvas.toDataURL("image/png");
  if (currentUser) {
    currentUser.fotoUrl = foto;
    document.getElementById("user-profile-img").src = foto;
    let registros = JSON.parse(localStorage.getItem("registros") || "[]");
    const i = registros.findIndex(u => u.dni === currentUser.dni);
    registros[i] = currentUser;
    localStorage.setItem("registros", JSON.stringify(registros));
  }
  cerrarCamara();
}

function cerrarCamara() {
  document.getElementById("camara-modal").classList.remove("active");
  if (streamActual) {
    streamActual.getTracks().forEach(t => t.stop());
  }
}

// Mensajes
function enviarMensajeAdmin() {
  const texto = document.getElementById("mensaje-texto").value.trim();
  if (!texto || !currentUser) return;
  let mensajes = JSON.parse(localStorage.getItem("mensajes") || "[]");
  mensajes.push({
    de: currentUser.dni,
    nombre: currentUser.nombre,
    apellido: currentUser.apellido,
    texto,
    fecha: new Date().toLocaleString()
  });
  localStorage.setItem("mensajes", JSON.stringify(mensajes));
  alert("✅ Mensaje enviado");
  document.getElementById("mensaje-texto").value = "";
  closeModal("mensaje-modal");
}
