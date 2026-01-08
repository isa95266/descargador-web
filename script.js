// ===== CONFIGURACIÓN =====
// Reemplaza esta URL con la que te dio Render (ej: https://mi-api.onrender.com)
const API_URL = "https://descargador-backend-52s4.onrender.com"; 

// ===== ELEMENTOS DEL DOM =====
const videoUrl = document.getElementById("video-url");
const btnMp4 = document.getElementById("btn-mp4");
const btnMp3 = document.getElementById("btn-mp3");
const mp4Options = document.getElementById("mp4-options");
const mp3Options = document.getElementById("mp3-options");
const loader = document.getElementById("loader");
const progressBox = document.getElementById("progress-box");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");

// Nuevos elementos para la validación visual
const platformTags = document.querySelectorAll(".platform-tag");

// ===== DETECCIÓN VISUAL DE PLATAFORMAS =====
// Resalta la etiqueta de la red social mientras el usuario escribe
videoUrl.addEventListener("input", (e) => {
  const url = e.target.value.toLowerCase();
  
  platformTags.forEach(tag => {
    const domain = tag.dataset.domain;
    if (url !== "" && url.includes(domain)) {
      tag.classList.add("matched");
    } else {
      tag.classList.remove("matched");
    }
  });
});

// ===== LÓGICA DE TABS (MP4/MP3) =====
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

// ===== PROGRESO EN TIEMPO REAL (SSE) =====
const evtSource = new EventSource(`${API_URL}/progress-stream`);

evtSource.onmessage = e => {
  const cleanData = e.data.trim();
  if (!isNaN(cleanData)) {
    progressBar.style.width = `${cleanData}%`;
    progressPercent.textContent = `${cleanData}%`;
  }
};

evtSource.onerror = () => {
  console.log("Conectando con el servidor de progreso...");
};

// ===== FUNCIÓN PRINCIPAL DE DESCARGA =====
async function handleDownload(format, quality) {
  const url = videoUrl.value.trim();
  
  // 1. Validación de Dominios Soportados
  const supported = ["tiktok.com", "instagram.com", "soundcloud.com", "twitter.com", "x.com", "vimeo.com", "youtube.com", "youtu.be"];
  const isSupported = supported.some(domain => url.toLowerCase().includes(domain));

  if (!url) {
    alert("Por favor, pega un enlace.");
    return;
  }

  if (!isSupported) {
    alert("Esta plataforma no está soportada o el enlace es incorrecto.");
    return;
  }

  // 2. Preparar UI para la descarga
  progressBox.classList.remove("hidden");
  loader.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressPercent.textContent = "0%";
  
  try {
    // 3. Petición al Backend
    const response = await fetch(
      `${API_URL}/download/${format}?url=${encodeURIComponent(url)}&quality=${quality}`
    );

    const data = await response.json();

    if (response.ok) {
      // 4. Crear link de descarga invisible y activarlo
      const downloadLink = document.createElement('a');
      downloadLink.href = `${API_URL}/file/${data.file}`;
      downloadLink.setAttribute('download', data.file);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      
      loader.classList.add("hidden");
    } else {
      throw new Error(data.error || "Error en el servidor");
    }

  } catch (err) {
    alert("Error: " + err.message);
    loader.classList.add("hidden");
    progressBox.classList.add("hidden");
  }
}

// ===== ASIGNAR EVENTOS A TODOS LOS BOTONES DE DESCARGA =====
document.querySelectorAll(".option button").forEach(btn => {
  btn.onclick = () => {
    const format = btn.dataset.format;
    const quality = btn.dataset.quality;
    handleDownload(format, quality);
  };
});
