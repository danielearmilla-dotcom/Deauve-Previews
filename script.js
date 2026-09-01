document.addEventListener('DOMContentLoaded', () => { 

  // --- 1. MODO AMBIENTE REACTIVO (Canvas de orbes flotantes) ---
  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;opacity:0.7;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const orbs = [
    { x: width * 0.2, y: height * 0.2, radius: 200, color: 'rgba(255, 42, 133, 0.12)', vx: 0.3, vy: 0.2 },
    { x: width * 0.8, y: height * 0.7, radius: 250, color: 'rgba(29, 185, 84, 0.06)', vx: -0.2, vy: -0.25 }
  ];

  function animateAmbient() {
    ctx.clearRect(0, 0, width, height);
    orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < 0 || orb.x > width) orb.vx *= -1;
      if (orb.y < 0 || orb.y > height) orb.vy *= -1;

      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      gradient.addColorStop(0, orb.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animateAmbient);
  }
  animateAmbient();

  // --- 2. CONTROL DE AUDIO INDEPENDIENTE POR TARJETA ---
  const root = document.documentElement;
  function applySongTheme(card) {
    const accent = '#ff2a85';
    root.style.setProperty('--pink', accent);
    root.style.setProperty('--pink-glow', `${accent}66`);
    orbs[0].color = `${accent}22`; 
  }

  const cards = Array.from(document.querySelectorAll('.song-card'));
  let activeAudio = null;
  let activeCard = null;

  // Efecto 3D en las tarjetas
  cards.forEach(card => {
    const cover = card.querySelector('.card-cover');
    if (!cover) return;

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -((y - centerY) / centerY) * 6;
      const rotateY = ((x - centerX) / centerX) * 6;
      cover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('pointerleave', () => {
      cover.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      cover.style.transition = 'transform 0.5s ease';
    });
    
    card.addEventListener('pointerenter', () => {
      cover.style.transition = 'none';
    });
  });

  function formatTime(seconds) { 
    if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return '0:00'; 
    const min = Math.floor(seconds / 60); 
    const sec = Math.floor(seconds % 60); 
    return `${min}:${sec < 10 ? '0' : ''}${sec}`; 
  }

  function pauseAllTracks() {
    cards.forEach(c => {
      const aud = c.querySelector('audio');
      if (aud) aud.pause();
      c.classList.remove('playing');
      
      // Sincronizar botones internos de control
      const pauseIcon = c.querySelector('.play-pause-track-btn .icon-pause');
      const playIcon = c.querySelector('.play-pause-track-btn .icon-play');
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (playIcon) playIcon.style.display = 'block';
    });
    activeAudio = null;
    activeCard = null;
  }

  cards.forEach((card, index) => {
    const playBtn = card.querySelector('.play-btn');
    const miniPlayBtn = card.querySelector('.play-pause-track-btn');
    const prevBtn = card.querySelector('.prev-track-btn');
    const nextBtn = card.querySelector('.next-track-btn');
    
    const audio = card.querySelector('audio');
    const timeText = card.querySelector('.time-text');
    const waveformContainer = card.querySelector('.waveform');

    if (!audio) return;

    let progressBar = null;
    if (waveformContainer) {
      waveformContainer.innerHTML = '';
      progressBar = document.createElement('div');
      progressBar.className = 'waveform-progress';
      waveformContainer.appendChild(progressBar);
    }

    audio.addEventListener('loadedmetadata', () => {
      if (timeText && !audio.currentTime) {
        timeText.textContent = `${formatTime(audio.duration)}`;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (activeAudio === audio && audio.duration) {
        const current = audio.currentTime;
        const duration = audio.duration;
        const pct = (current / duration) * 100;

        if (timeText) {
          timeText.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        }
        if (progressBar) {
          progressBar.style.width = `${pct}`;
        }
      }
    });

    audio.addEventListener('ended', () => {
      card.classList.remove('playing');
      if (progressBar) progressBar.style.width = '0%';
      if (timeText) timeText.textContent = formatTime(audio.duration);
      
      // Pasar a la siguiente pista automáticamente
      if (index + 1 < cards.length) {
        playTrack(cards[index + 1]);
      } else {
        pauseAllTracks();
      }
    });

    function playTrack(targetCard) {
      pauseAllTracks();
      const targetAudio = targetCard.querySelector('audio');
      if (!targetAudio) return;

      activeCard = targetCard;
      activeAudio = targetAudio;
      applySongTheme(targetCard);
      targetCard.classList.add('playing');

      const pIcon = targetCard.querySelector('.play-pause-track-btn .icon-play');
      const sIcon = targetCard.querySelector('.play-pause-track-btn .icon-pause');
      if (pIcon) pIcon.style.display = 'none';
      if (sIcon) sIcon.style.display = 'block';

      targetAudio.play().catch(err => console.log('Error de reproducción:', err));
    }

    function togglePlay() {
      if (activeAudio === audio) {
        if (!audio.paused) {
          audio.pause();
          card.classList.remove('playing');
          const pIcon = card.querySelector('.play-pause-track-btn .icon-play');
          const sIcon = card.querySelector('.play-pause-track-btn .icon-pause');
          if (pIcon) pIcon.style.display = 'block';
          if (sIcon) sIcon.style.display = 'none';
          activeAudio = null;
          activeCard = null;
        } else {
          playTrack(card);
        }
      } else {
        playTrack(card);
      }
    }

    if (playBtn) playBtn.addEventListener('click', (e) => { e.preventDefault(); togglePlay(); });
    if (miniPlayBtn) miniPlayBtn.addEventListener('click', (e) => { e.preventDefault(); togglePlay(); });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const prevIndex = (index - 1 + cards.length) % cards.length;
        playTrack(cards[prevIndex]);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nextIndex = (index + 1) % cards.length;
        playTrack(cards[nextIndex]);
      });
    }

    // Funcionalidad de click/touch en la barra de onda para buscar posición
    if (waveformContainer) {
      let isDragging = false;
      const seek = (e) => {
        if (!audio.duration) return;
        const rect = waveformContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const offsetX = clientX - rect.left;
        const pct = Math.max(0, Math.min(1, offsetX / rect.width));
        audio.currentTime = pct * audio.duration;

        if (activeAudio !== audio) {
          playTrack(card);
        }
      };

      waveformContainer.addEventListener('pointerdown', (e) => {
        isDragging = true;
        waveformContainer.setPointerCapture(e.pointerId);
        seek(e);
      });
      waveformContainer.addEventListener('pointermove', (e) => {
        if (isDragging) seek(e);
      });
      waveformContainer.addEventListener('pointerup', (e) => {
        if (isDragging) {
          isDragging = false;
          waveformContainer.releasePointerCapture(e.pointerId);
        }
      });
    }
  });

  // --- 3. CONTADORES REGRESIVOS ---
  function iniciarContador(elementId, targetDateString) {
    const badge = document.getElementById(elementId);
    if (!badge) return;
    const targetDate = new Date(targetDateString).getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        badge.textContent = '¡DISPONIBLE AHORA!';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      badge.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  iniciarContador('bofeta-countdown', '2026-09-08T00:00:00');
  iniciarContador('bareta-countdown', '2026-09-06T01:00:00');

  // --- 4. EFECTO GLITCH ---
  const heroTitle = document.querySelector('.hero-title.glitch');
  if (heroTitle) {
    function runGlitch() {
      heroTitle.classList.add('glitch-active');
      setTimeout(() => heroTitle.classList.remove('glitch-active'), 200);
      setTimeout(runGlitch, Math.floor(Math.random() * 2000) + 4000);
    }
    setTimeout(runGlitch, 4000);
  }
});
