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
  let activeIndex = -1;
  let activeCard = null; 
  let activeAudio = null;

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
  }

  function playTrack(index) { 
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');

    if (!audio || !audio.src) return;

    if (activeAudio === audio) {
      if (!audio.paused) {
        audio.pause();
        card.classList.remove('playing');
      } else {
        audio.play().then(() => {
          card.classList.add('playing');
          applySongTheme(card);
        }).catch(err => console.log('error reproduccion:', err));
      }
      return;
    }

    pauseCurrent();

    activeIndex = index;
    activeCard = card;
    activeAudio = audio;

    applySongTheme(card);

    audio.play().then(() => {
      card.classList.add('playing');
    }).catch(err => console.log('error audio:', err));
  }

  cards.forEach((card, index) => { 
    const playBtn = card.querySelector('.play-btn'); 
    const audio = card.querySelector('audio'); 
    const timeText = card.querySelector('.time-text'); 
    const waveformContainer = card.querySelector('.waveform');
    const trackId = card.getAttribute('data-id');

    let progressBar = null;
    if (waveformContainer) {
      waveformContainer.innerHTML = '';
      progressBar = document.createElement('div');
      progressBar.className = 'waveform-progress';
      progressBar.style.cssText = 'width: 0%; height: 100%; background: var(--pink, #ff2a85); position: absolute; top: 0; left: 0; pointer-events: none; transition: width 0.1s linear;';
      waveformContainer.style.position = 'relative';
      waveformContainer.appendChild(progressBar);
    }

    if (!audio) return;

    // Definir límites de duración exactos (Bofetá a 33s, TEMA3 a 29s)
    function getMaxDuration() {
      if (trackId === 'bofeta') return 33;
      if (trackId === 'pecado') return 29;
      return audio.duration;
    }

    audio.addEventListener('loadedmetadata', () => {
      if (timeText && audio.duration) {
        let displayDuration = getMaxDuration();
        timeText.textContent = `0:00 / ${formatTime(displayDuration)}`;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (activeAudio === audio && audio.duration) {
        let current = audio.currentTime;
        let maxSeconds = getMaxDuration();

        if (current >= maxSeconds) {
          audio.pause();
          audio.currentTime = 0;
          pauseCurrent();
          if (progressBar) progressBar.style.width = '0%';
          if (timeText) timeText.textContent = `0:00 / ${formatTime(maxSeconds)}`;
          return;
        }

        const pct = (current / maxSeconds) * 100;

        if (progressBar) {
          progressBar.style.width = `${pct}%`;
        }
        if (timeText) {
          timeText.textContent = `${formatTime(current)} / ${formatTime(maxSeconds)}`;
        }
      }
    });

    audio.addEventListener('pause', () => {
      if (activeAudio === audio) {
        card.classList.remove('playing');
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      let displayDuration = getMaxDuration();
      
      if (timeText) timeText.textContent = `0:00 / ${formatTime(displayDuration)}`;
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
        let pct = Math.max(0, Math.min(1, offsetX / rect.width));
        
        let maxDuration = getMaxDuration();
        audio.currentTime = pct * maxDuration;

        if (activeAudio !== audio) {
          playTrack(index);
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

  // Glitch para el título principal
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
