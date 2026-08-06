document.addEventListener('DOMContentLoaded', () => {
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
  let activeAudio = null;
  let activeCard = null;
  let isDragging = false;

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function pauseAll() {
    cards.forEach(card => {
      const audio = card.querySelector('audio');
      if (audio) audio.pause();
      card.classList.remove('playing');
    });
    if (spotifyPlayer) spotifyPlayer.classList.remove('is-playing');
  }

  function updateUI() {
    if (!activeAudio || isNaN(activeAudio.duration) || !activeAudio.duration) return;

    const current = activeAudio.currentTime;
    const duration = activeAudio.duration;
    const pct = (current / duration) * 100;

    if (spProgressFill) spProgressFill.style.width = `${pct}%`;
    if (spProgressKnob) spProgressKnob.style.left = `${pct}%`;

    if (spCurrentTime) spCurrentTime.textContent = formatTime(current);
    if (spTotalTime) {
      const remaining = duration - current;
      spTotalTime.textContent = `-${formatTime(remaining)}`;
    }

    if (activeCard) {
      const timeText = activeCard.querySelector('.duration-text');
      if (timeText) {
        const remaining = duration - current;
        timeText.textContent = formatTime(remaining);
      }
      const progressBar = activeCard.querySelector('.waveform-progress');
      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }
    }
  }

  function togglePlayTrack(index) {
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');
    if (!audio) return;

    // si se pulsa sobre la misma que ya está sonando
    if (activeIndex === index && activeAudio) {
      if (!activeAudio.paused) {
        activeAudio.pause();
        activeCard.classList.remove('playing');
        if (spotifyPlayer) spotifyPlayer.classList.remove('is-playing');
      } else {
        activeAudio.play().then(() => {
          activeCard.classList.add('playing');
          if (spotifyPlayer) spotifyPlayer.classList.add('is-playing');
        }).catch(err => console.error("error al reproducir:", err));
      }
      return;
    }

    // si es una canción nueva
    pauseAll();

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

    activeAudio.play().then(() => {
      activeCard.classList.add('playing');
      if (spotifyPlayer) spotifyPlayer.classList.add('is-playing');
    }).catch(err => console.error("error al reproducir:", err));
  }

  // inicializar tarjetas y eventos
  cards.forEach((card, index) => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeText = card.querySelector('.duration-text');
    const waveformContainer = card.querySelector('.waveform');

    if (waveformContainer && !card.querySelector('.waveform-progress')) {
      waveformContainer.innerHTML = '<div class="waveform-progress"></div>';
    }

    if (audio) {
      audio.addEventListener('loadedmetadata', () => {
        if (timeText) timeText.textContent = formatTime(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        if (activeIndex === index && !isDragging) {
          updateUI();
        }
      });

      audio.addEventListener('ended', () => {
        pauseAll();
        if (index + 1 < cards.length) {
          togglePlayTrack(index + 1);
        } else {
          activeIndex = -1;
          activeCard = null;
          activeAudio = null;
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlayTrack(index);
      });
    }

    if (waveformContainer && audio) {
      waveformContainer.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = waveformContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
        if (activeIndex !== index) {
          togglePlayTrack(index);
        }
      });
    }
  });

  // eventos del reproductor spotify inferior
  if (spPlayBtn) {
    spPlayBtn.addEventListener('click', () => {
      if (activeIndex !== -1) {
        togglePlayTrack(activeIndex);
      } else if (cards.length > 0) {
        togglePlayTrack(0);
      }
    });
  }

  if (spPrevBtn) {
    spPrevBtn.addEventListener('click', () => {
      if (activeIndex > 0) togglePlayTrack(activeIndex - 1);
    });
  }

  if (spNextBtn) {
    spNextBtn.addEventListener('click', () => {
      if (activeIndex + 1 < cards.length) togglePlayTrack(activeIndex + 1);
    });
  }

  // barra de progreso inferior
  function seek(e) {
    if (!activeAudio || !activeAudio.duration || !spProgressBar) return;
    const rect = spProgressBar.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, offsetX / rect.width));
    activeAudio.currentTime = pct * activeAudio.duration;
    updateUI();
  }

  if (spProgressBar) {
    spProgressBar.addEventListener('mousedown', (e) => {
      isDragging = true;
      seek(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) seek(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    spProgressBar.addEventListener('touchstart', (e) => {
      isDragging = true;
      seek(e);
    });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) seek(e);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
});
