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

  // --- 2. SELECTOR DE PALETA DINÁMICA & TILT HOLOGRÁFICO 3D ---
  const root = document.documentElement;
  function applySongTheme(card) {
    const accent = card.getAttribute('data-accent') || '#ff2a85';
    root.style.setProperty('--pink', accent);
    root.style.setProperty('--pink-glow', `${accent}66`);
    orbs[0].color = `${accent}22`; 
  }

  const cards = Array.from(document.querySelectorAll('.song-card'));
  const spotifyPlayer = document.getElementById('spotify-player');
  const spImg = document.getElementById('sp-img');
  const spTitle = document.getElementById('sp-title');
  const spArtist = document.getElementById('sp-artist');
  const spPlayBtn = document.getElementById('sp-play-btn');
  const spPrevBtn = document.getElementById('sp-prev-btn');
  const spNextBtn = document.getElementById('sp-next-btn');
  const spCurrentTime = document.getElementById('sp-current-time');
  const spTotalTime = document.getElementById('sp-total-time');
  const spProgressBar = document.getElementById('sp-progress-bar');
  const spProgressFill = document.getElementById('sp-progress-fill');
  const spProgressKnob = document.getElementById('sp-progress-knob');

  let activeIndex = -1;
  let activeCard = null; 
  let activeAudio = null;
  let isDraggingSp = false;

  // Aplicar efecto de profundidad 3D en las tarjetas
  cards.forEach(card => {
    const cover = card.querySelector('.card-cover');
    if (!cover) return;

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = -((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      cover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('pointerleave', () => {
      cover.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      cover.style.transition = 'transform 0.5s ease';
    });
    
    card.addEventListener('pointerenter', () => {
      cover.style.transition = 'none';
    });
  });

  // --- 3. WEB AUDIO API (Visualizador y Púlsares de Bajos en el Fondo) ---
  let audioCtx = null;
  let analyser = null;
  let audioSourceNodes = new Map();
  let dataArray = null;
  let animationFrameId = null;

  function initWebAudioAPI(audioElement) {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    if (!audioSourceNodes.has(audioElement)) {
      const source = audioCtx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      audioSourceNodes.set(audioElement, source);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function renderRealVisualizer() {
    if (!analyser || !activeCard) return;
    analyser.getByteFrequencyData(dataArray);

    // Púlsares de graves: el orbe late dinámicamente con el bajo
    const bass = dataArray[2] || 0;
    orbs[0].radius = 200 + (bass / 255) * 80;

    const bars = activeCard.querySelectorAll('.playing-bars span');
    bars.forEach((bar, index) => {
      const val = dataArray[index * 4] || 0;
      const heightPx = Math.max(3, (val / 255) * 14);
      bar.style.height = `${heightPx}px`;
    });

    animationFrameId = requestAnimationFrame(renderRealVisualizer);
  }

  function formatTime(seconds) { 
    if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return '0:00'; 
    const min = Math.floor(seconds / 60); 
    const sec = Math.floor(seconds % 60); 
    return `${min}:${sec < 10 ? '0' : ''}${sec}`; 
  }

  function pauseCurrent() { 
    if (activeAudio) { 
      activeAudio.pause(); 
    } 
    if (activeCard) { 
      activeCard.classList.remove('playing'); 
    } 
    if (spotifyPlayer) {
      spotifyPlayer.classList.remove('is-playing');
    }
    cancelAnimationFrame(animationFrameId);
  }

  function updateUI() {
    if (!activeAudio || isNaN(activeAudio.duration) || !activeAudio.duration) return;

    const current = activeAudio.currentTime;
    const duration = activeAudio.duration;
    const pct = (current / duration) * 100;

    if (spProgressFill) spProgressFill.style.width = `${pct}%`;
    if (spProgressKnob) spProgressKnob.style.left = `${pct}%`;

    if (spCurrentTime) spCurrentTime.textContent = formatTime(current);
    if (spTotalTime) spTotalTime.textContent = formatTime(duration);

    if (activeCard) {
      const timeText = activeCard.querySelector('.time-text');
      if (timeText) {
        timeText.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
      }
      const progressBar = activeCard.querySelector('.waveform-progress');
      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }
    }
  }

  function playTrack(index) { 
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');

    if (!audio || !audio.src) return;

    initWebAudioAPI(audio);

    if (activeAudio === audio) {
      if (!audio.paused) {
        pauseCurrent();
      } else {
        audio.play().then(() => {
          card.classList.add('playing');
          if (spotifyPlayer) spotifyPlayer.classList.add('is-playing');
          applySongTheme(card);
          renderRealVisualizer();
        }).catch(err => console.log('error reproduccion:', err));
      }
      return;
    }

    pauseCurrent();

    activeIndex = index;
    activeCard = card;
    activeAudio = audio;

    const coverImg = card.querySelector('.cover-img');
    const titleEl = card.querySelector('.track-meta h3');
    const artistEl = card.querySelector('.track-meta p');

    if (spImg && coverImg) spImg.src = coverImg.src;
    if (spTitle && titleEl) spTitle.textContent = titleEl.textContent;
    if (spArtist && artistEl) spArtist.textContent = artistEl.textContent;

    if (spotifyPlayer) spotifyPlayer.classList.add('active');

    applySongTheme(card);

    audio.play().then(() => {
      card.classList.add('playing');
      if (spotifyPlayer) spotifyPlayer.classList.add('is-playing');
      renderRealVisualizer();
    }).catch(err => console.log('error audio:', err));
  }

  cards.forEach((card, index) => { 
    const playBtn = card.querySelector('.play-btn'); 
    const audio = card.querySelector('audio'); 
    const timeText = card.querySelector('.time-text'); 
    const waveformContainer = card.querySelector('.waveform');

    let progressBar = null;
    if (waveformContainer) {
      waveformContainer.innerHTML = '';
      progressBar = document.createElement('div');
      progressBar.className = 'waveform-progress';
      waveformContainer.appendChild(progressBar);
    }

    if (timeText) {
      const defaultTime = timeText.textContent.trim() || '0:00';
      if (audio && audio.duration) {
        timeText.textContent = `0:00 / ${formatTime(audio.duration)}`;
      } else {
        timeText.textContent = `0:00 / ${defaultTime}`;
      }
    }

    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      if (timeText) {
        timeText.textContent = `0:00 / ${formatTime(audio.duration)}`;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (activeAudio === audio && !isDraggingSp) {
        updateUI();
      }
    });

    audio.addEventListener('pause', () => {
      if (activeAudio === audio) {
        card.classList.remove('playing');
        if (spotifyPlayer) spotifyPlayer.classList.remove('is-playing');
        cancelAnimationFrame(animationFrameId);
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeText) timeText.textContent = `0:00 / ${formatTime(audio.duration)}`;
      if (progressBar) progressBar.style.width = '0%';

      if (index + 1 < cards.length) {
        playTrack(index + 1);
      } else {
        activeIndex = -1;
        activeCard = null;
        activeAudio = null;
      }
    });

    if (waveformContainer) {
      let isDraggingWaveform = false;

      const seekCard = (e) => {
        if (!audio.duration) return;
        const rect = waveformContainer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, offsetX / rect.width));
        audio.currentTime = pct * audio.duration;

        if (activeAudio !== audio) {
          playTrack(index);
        } else {
          updateUI();
        }
      };

      waveformContainer.addEventListener('pointerdown', (e) => {
        isDraggingWaveform = true;
        waveformContainer.setPointerCapture(e.pointerId);
        seekCard(e);
      });

      waveformContainer.addEventListener('pointermove', (e) => {
        if (isDraggingWaveform) seekCard(e);
      });

      waveformContainer.addEventListener('pointerup', (e) => {
        if (isDraggingWaveform) {
          isDraggingWaveform = false;
          waveformContainer.releasePointerCapture(e.pointerId);
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playTrack(index);
      });
    }
  }); 

  if (spPlayBtn) {
    spPlayBtn.addEventListener('click', () => {
      if (activeIndex !== -1) {
        playTrack(activeIndex);
      } else if (cards.length > 0) {
        playTrack(0);
      }
    });
  }

  if (spPrevBtn) {
    spPrevBtn.addEventListener('click', () => {
      if (activeIndex > 0) playTrack(activeIndex - 1);
    });
  }

  if (spNextBtn) {
    spNextBtn.addEventListener('click', () => {
      if (activeIndex + 1 < cards.length) playTrack(activeIndex + 1);
    });
  }

  function seekSpotify(e) {
    if (!activeAudio || !activeAudio.duration || !spProgressBar) return;
    const rect = spProgressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, offsetX / rect.width));
    activeAudio.currentTime = pct * activeAudio.duration;
    updateUI();
  }

  if (spProgressBar) {
    spProgressBar.addEventListener('pointerdown', (e) => {
      isDraggingSp = true;
      spProgressBar.setPointerCapture(e.pointerId);
      seekSpotify(e);
    });

    spProgressBar.addEventListener('pointermove', (e) => {
      if (isDraggingSp) seekSpotify(e);
    });

    spProgressBar.addEventListener('pointerup', (e) => {
      if (isDraggingSp) {
        isDraggingSp = false;
        spProgressBar.releasePointerCapture(e.pointerId);
      }
    });
  }

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

  const heroTitle = document.querySelector('.hero-title.glitch');
  if (heroTitle) {
    function runGlitch() {
      heroTitle.classList.add('glitch-active');
      setTimeout(() => heroTitle.classList.remove('glitch-active'), 200);
      const randomInterval = Math.floor(Math.random() * 2000) + 4000;
      setTimeout(runGlitch, randomInterval);
    }
    setTimeout(runGlitch, 4000);
  }
});
