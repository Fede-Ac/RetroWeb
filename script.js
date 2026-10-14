// Web Audio API para sintetizador de sonidos retro
let audioCtx = null;
let soundEnabled = true; // 👈 CAMBIO 1: Sonido activo por defecto

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(frequency = 440, duration = 0.08) {
    if (!soundEnabled || !audioCtx) return;
    
    try {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Los navegadores modernos bloquean la reproducción automática de sonido sin un clic previo
    }
}

// Inicializar el contexto de audio en la primera interacción del usuario con la página
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

// Control de Sonido ON/OFF
const soundToggleBtn = document.getElementById('soundToggle');
soundToggleBtn.textContent = "🔊 Sonido: ON"; // 👈 Estado visual inicial

soundToggleBtn.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊 Sonido: ON" : "🔇 Sonido: OFF";
    playBeep(600, 0.1);
});

// Control de Efecto Tubo CRT ON/OFF
const crtToggleBtn = document.getElementById('crtToggle');
const crtOverlay = document.getElementById('crtOverlay');
let crtActive = true; // 👈 CAMBIO 2: CRT activo por defecto

// Aplicar estilos iniciales al botón CRT para reflejar que está ON
crtToggleBtn.textContent = "📺 Tubo CRT: ON";
crtToggleBtn.style.borderColor = "var(--neon-green)";
crtToggleBtn.style.color = "var(--neon-green)";

crtToggleBtn.addEventListener('click', () => {
    crtActive = !crtActive;
    if (crtActive) {
        crtOverlay.classList.remove('off');
        crtToggleBtn.textContent = "📺 Tubo CRT: ON";
        crtToggleBtn.style.borderColor = "var(--neon-green)";
        crtToggleBtn.style.color = "var(--neon-green)";
    } else {
        crtOverlay.classList.add('off');
        crtToggleBtn.textContent = "📺 Tubo CRT: OFF";
        crtToggleBtn.style.borderColor = "var(--neon-blue)";
        crtToggleBtn.style.color = "var(--neon-blue)";
    }
    playBeep(500, 0.08);
});

// Interactividad de las tarjetas de consola: Mostrar/Ocultar juegos al hacer clic
document.querySelectorAll('.console-card').forEach(card => {
    card.addEventListener('click', (e) => {
        card.classList.toggle('active');
        playBeep(750, 0.06);
    });
});

// Efectos de sonido al pasar el cursor por elementos interactivos
document.querySelectorAll('a, button, .console-card').forEach(elem => {
    elem.addEventListener('mouseenter', () => {
        playBeep(280, 0.04);
    });
});