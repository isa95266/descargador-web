// ===== CONFIGURACIÓN =====
// CAMBIAR ESTO cuando subas a Render:
// Local: "http://localhost:3000"
// Producción: "https://nombre-de-tu-app.onrender.com"
const API_URL = "https://descargador-backend-52s4.onrender.com"; 

// ===== ELEMENTOS DEL DOM =====
const videoUrl = document.getElementById("video-url");
const btnMp4 = document.getElementById("btn-mp4");
const btnMp3 = document.getElementById("btn-mp3");
const mp4Options = document.getElementById("mp4-options");
const mp3Options = document.getElementById("mp3-options");
const loader = document.getElementById("loader"); // Ahora sí se usa

// Usamos los elementos YA EXISTENTES en el HTML, no creamos nuevos
const progressBox = document.getElementById("progress-box");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");

// ===== LOGICA TABS =====
btnMp4.onclick = () => {
  btnMp4.classList.add("active");
  btnMp3.classList.remove("active");
  mp4Options.classList.remove("hidden");
  mp3Options.classList.add("hidden");
};

btnMp3.onclick = () => {
  btnMp3.classList.add("active");
  btnMp4.classList.remove("active");
  mp3Options.classList.remove("hidden");
  mp4Options.classList.add("hidden");
};

// ===== PROGRESO (SSE) =====
// Conectamos al stream de eventos del backend
const evtSource = new EventSource(`${API_URL}/progress-stream`);

evtSource.onmessage = e => {
  // Limpiamos el valor para evitar errores si llega texto sucio
  const cleanData = e.data.trim();
  progressBar.style.width = `${cleanData}%`;
  progressPercent.textContent = `${cleanData}%`;
};

// ===== FUNCIÓN DE DESCARGA =====
async function handleDownload(format, quality) {
  const url = videoUrl.value.trim();
  if (!url) {
    alert("Por favor, pega un enlace válido.");
    return;
  }

  // 1. Resetear UI
  progressBox.classList.remove("hidden");
  loader.classList.remove("hidden"); // Mostrar "Analizando..."
  progressBar.style.width = "0%";
  progressPercent.textContent = "0%";
  
  try {
    // 2. Solicitar descarga al Backend
    const response = await fetch(
      `${API_URL}/download/${format}?url=${encodeURIComponent(url)}&quality=${quality}`
    );

    const data = await response.json();

    if (response.ok) {
      // 3. Descarga exitosa: Forzar descarga en el navegador
      const downloadLink = document.createElement('a');
      downloadLink.href = `${API_URL}/file/${data.file}`;
      downloadLink.setAttribute('download', data.file); // Sugerencia de nombre
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      
      loader.classList.add("hidden"); // Ocultar loader
    } else {
      throw new Error(data.error || "Error desconocido");
    }

  } catch (err) {
    alert("Ocurrió un error: " + err.message);
    loader.classList.add("hidden");
    progressBox.classList.add("hidden");
    console.error(err);
  }
}

// ===== ASIGNAR EVENTOS A BOTONES =====
document.querySelectorAll(".option button").forEach(btn => {
  btn.onclick = () => {
    // Evitamos que el formulario recargue la página (por si acaso)
    const format = btn.dataset.format;
    const quality = btn.dataset.quality;
    handleDownload(format, quality);
  };
});
