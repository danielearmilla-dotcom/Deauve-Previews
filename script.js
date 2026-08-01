document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.song-card');
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyArtist = document.getElementById('sticky-artist');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');

  let activeCard = null;
  let activeAudio = null;

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function pauseCurrent() {
    if (activeAudio) activeAudio.pause();
    if (activeCard) {
      activeCard.classList.remove('playing');
      const btn = activeCard.querySelector('.play-btn');
      if (btn) btn.textContent = '▶';
    }
    if (stickyPlayer) stickyPlayer.classList.remove('visible');
    if (stickyPlayBtn) stickyPlayBtn.textContent = '▶';
  }

  cards.forEach((card) => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeText = card.querySelector('.time-text');
    const waveformContainer = card.querySelector('.waveform');
    const trackName = card.querySelector('.track-meta h3') ? card.querySelector('.track-meta h3').childNodes[0].textContent.trim() : 'Pista';
    const trackArtist = card.querySelector('.track-meta p') ? card.querySelector('.track-meta p').textContent.trim() : 'Deauve';

    // Generar la barra interna de progreso
    let progressBar = null;
    if (waveformContainer) {
      waveformContainer.innerHTML = '';
      progressBar = document.createElement('div');
      progressBar.className = 'waveform-progress';
      waveformContainer.appendChild(progressBar);
    }

    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      if (timeText) timeText.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (timeText && audio.duration) {
        const remaining = audio.duration - audio.currentTime;
        timeText.textContent = formatTime(remaining);
      }

      if (audio.duration && progressBar) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${pct}%`;
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeText) timeText.textContent = formatTime(audio.duration);
      if (progressBar) progressBar.style.width = '0%';
      activeCard = null;
      activeAudio = null;
    });

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

      audio.play().then(() => {
        card.classList.add('playing');
        playBtn.textContent = '❚❚';
        if (stickyTitle) stickyTitle.textContent = trackName;
        if (stickyArtist) stickyArtist.textContent = trackArtist;
        if (stickyPlayBtn) stickyPlayBtn.textContent = '❚❚';
        if (stickyPlayer) stickyPlayer.classList.add('visible');
      }).catch(err => console.error(err));
    });
  });

  if (stickyPlayBtn) {
    stickyPlayBtn.addEventListener('click', () => {
      if (activeCard) {
        const playBtn = activeCard.querySelector('.play-btn');
        if (playBtn) playBtn.click();
      }
    });
  }
});
