// ===== CONFIGURACIÓN =====
const API_URL = "https://descargador-backend-52s4.onrender.com"; 

// ===== ELEMENTOS DEL DOM =====
const videoUrl = document.getElementById("video-url");
const loader = document.getElementById("loader");
const progressBox = document.getElementById("progress-box");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const platformTags = document.querySelectorAll(".platform-tag");

// Crear dinámicamente el botón de limpiar (opcional, pero recomendado)
const clearBtn = document.createElement("button");
clearBtn.innerHTML = "✕";
clearBtn.className = "clear-btn hidden";
videoUrl.parentNode.insertBefore(clearBtn, videoUrl.nextSibling);

// ===== VALIDACIÓN Y RESALTADO =====
videoUrl.addEventListener("input", (e) => {
  const url = e.target.value.toLowerCase();
  
  // Mostrar/Ocultar botón de limpiar
  if (url.length > 0) clearBtn.classList.remove("hidden");
  else clearBtn.classList.add("hidden");

  platformTags.forEach(tag => {
    const domain = tag.dataset.domain;
    if (url !== "" && url.includes(domain)) {
      tag.classList.add("matched");
    } else {
      tag.classList.remove("matched");
    }
  });
});

// Acción de limpiar
clearBtn.onclick = () => {
  videoUrl.value = "";
  clearBtn.classList.add("hidden");
  platformTags.forEach(tag => tag.classList.remove("matched"));
  videoUrl.focus();
};

// ===== PROGRESO EN TIEMPO REAL =====
const evtSource = new EventSource(`${API_URL}/progress-stream`);
evtSource.onmessage = e => {
  const cleanData = e.data.trim();
  if (!isNaN(cleanData)) {
    progressBar.style.width = `${cleanData}%`;
    progressPercent.textContent = `${cleanData}%`;
  }
};

// ===== FUNCIÓN DE DESCARGA =====
async function handleDownload(format, quality) {
  const url = videoUrl.value.trim();
  
  const supportedDomains = [
    "youtube.com", "youtu.be", "tiktok.com", "instagram.com", 
    "facebook.com", "fb.watch", "twitter.com", "x.com", 
    "soundcloud.com", "vimeo.com", "dailymotion.com", "dai.ly", 
    "twitch.tv", "pinterest.com", "pin.it", "reddit.com"
  ];

  const isSupported = supportedDomains.some(domain => url.toLowerCase().includes(domain));

  if (!url) {
    alert("Por favor, pega un enlace primero.");
    return;
  }

  if (!isSupported) {
    alert("Plataforma no reconocida. Intenta con un enlace de redes sociales conocidas.");
    return;
  }

  progressBox.classList.remove("hidden");
  loader.classList.remove("hidden");
  progressBar.style.width = "0%";
  
  try {
    const response = await fetch(
      `${API_URL}/download/${format}?url=${encodeURIComponent(url)}&quality=${quality}`
    );
    const data = await response.json();

    if (response.ok) {
      const a = document.createElement('a');
      a.href = `${API_URL}/file/${data.file}`;
      a.download = data.file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      loader.classList.add("hidden");
    } else {
      throw new Error(data.error || "Error al procesar el archivo");
    }
  } catch (err) {
    alert("Aviso: " + err.message);
    loader.classList.add("hidden");
    progressBox.classList.add("hidden");
  }
}

// Asignar eventos a botones de descarga
document.querySelectorAll(".option button").forEach(btn => {
  btn.onclick = () => handleDownload(btn.dataset.format, btn.dataset.quality);
});

// Lógica de pestañas (Tabs)
const setupTabs = (activeBtn, inactiveBtn, activeBox, inactiveBox) => {
  activeBtn.onclick = () => {
    activeBtn.classList.add("active");
    inactiveBtn.classList.remove("active");
    activeBox.classList.remove("hidden");
    inactiveBox.classList.add("hidden");
  };
};

setupTabs(
  document.getElementById("btn-mp4"), 
  document.getElementById("btn-mp3"), 
  document.getElementById("mp4-options"), 
  document.getElementById("mp3-options")
);

setupTabs(
  document.getElementById("btn-mp3"), 
  document.getElementById("btn-mp4"), 
  document.getElementById("mp3-options"), 
  document.getElementById("mp4-options")
);
