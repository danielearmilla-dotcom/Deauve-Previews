document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.song-card');
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyArtist = document.getElementById('sticky-artist');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');

  let activeCard = null;
  let activeAudio = null;

  // patrones fijos para que la onda tenga forma realista
  const barHeights = [20, 35, 60, 40, 75, 90, 45, 30, 85, 100, 70, 50, 30, 65, 80, 40, 25, 50, 95, 60, 40, 70, 85, 30, 50, 90, 65, 35, 20, 45, 75, 100, 80, 50, 30, 60, 40, 20];

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function pauseCurrent() {
    if (activeAudio) {
      activeAudio.pause();
    }
    if (activeCard) {
      activeCard.classList.remove('is-playing');
      const btn = activeCard.querySelector('.play-btn');
      if (btn) btn.textContent = '▶';
    }
    stickyPlayer.classList.remove('is-playing');
    stickyPlayBtn.textContent = '▶';
  }

  cards.forEach((card) => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeDisplay = card.querySelector('.time-display');
    const waveformContainer = card.querySelector('.waveform-container');
    const waveformBars = card.querySelector('.waveform-bars');
    const trackName = card.querySelector('.track-name') ? card.querySelector('.track-name').textContent : 'Pista';
    const trackArtist = card.querySelector('.track-artist') ? card.querySelector('.track-artist').textContent : 'Deauve';

    // generar barritas de la onda
    if (waveformBars) {
      waveformBars.innerHTML = '';
      barHeights.forEach(h => {
        const bar = document.createElement('div');
        bar.className = 'wb-bar';
        bar.style.height = `${h}%`;
        waveformBars.appendChild(bar);
      });
    }

    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (timeDisplay && audio.duration) {
        const remaining = audio.duration - audio.currentTime;
        timeDisplay.textContent = formatTime(remaining);
      }

      // actualizar progreso visual en barras
      if (audio.duration && waveformBars) {
        const progress = audio.currentTime / audio.duration;
        const bars = waveformBars.querySelectorAll('.wb-bar');
        const playedCount = Math.floor(progress * bars.length);

        bars.forEach((bar, index) => {
          if (index <= playedCount) {
            bar.classList.add('played');
          } else {
            bar.classList.remove('played');
          }
        });
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeDisplay) timeDisplay.textContent = formatTime(audio.duration);
      if (waveformBars) {
        waveformBars.querySelectorAll('.wb-bar').forEach(b => b.classList.remove('played'));
      }
      activeCard = null;
      activeAudio = null;
    });

    // click en la onda para adelantar / retroceder
    if (waveformContainer) {
      waveformContainer.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = waveformContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;
        audio.currentTime = pct * audio.duration;
      });
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (activeAudio === audio && !audio.paused) {
        pauseCurrent();
        return;
      }

      if (activeAudio && activeAudio !== audio) {
        pauseCurrent();
      }

      activeAudio = audio;
      activeCard = card;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          card.classList.add('is-playing');
          playBtn.textContent = '❚❚';

          stickyTitle.textContent = trackName;
          stickyArtist.textContent = trackArtist;
          stickyPlayBtn.textContent = '❚❚';
          stickyPlayer.classList.add('visible', 'is-playing');

          if (navigator.vibrate) {
            navigator.vibrate(15);
          }
        }).catch(err => {
          console.error("error al reproducir:", err);
        });
      }
    });
  });

  stickyPlayBtn.addEventListener('click', () => {
    if (activeCard) {
      const playBtn = activeCard.querySelector('.play-btn');
      if (playBtn) playBtn.click();
    }
  });
});
