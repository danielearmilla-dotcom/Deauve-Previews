document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.song-card');
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyArtist = document.getElementById('sticky-artist');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');
  const stickyProgressBar = document.getElementById('sticky-progress-bar');

  let activeCard = null;
  let activeAudio = null;

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

  cards.forEach(card => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeDisplay = card.querySelector('.current');
    const durationDisplay = card.querySelector('.duration');
    const progressBar = card.querySelector('.progress-bar');
    const trackName = card.querySelector('.track-name') ? card.querySelector('.track-name').textContent : 'Pista';
    const trackArtist = card.querySelector('.track-artist') ? card.querySelector('.track-artist').textContent : 'Deauve';

    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      if (durationDisplay) {
        durationDisplay.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(audio.currentTime);
      }
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.value = percent;
        if (activeAudio === audio) stickyProgressBar.value = percent;
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (progressBar) progressBar.value = 0;
      stickyProgressBar.value = 0;
      activeCard = null;
      activeAudio = null;
    });

    // adelantar / retroceder desde la tarjeta
    if (progressBar) {
      progressBar.addEventListener('input', () => {
        if (audio.duration) {
          const seekTime = (progressBar.value / 100) * audio.duration;
          audio.currentTime = seekTime;
        }
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

          if (durationDisplay && audio.duration) {
            durationDisplay.textContent = formatTime(audio.duration);
          }

          if (navigator.vibrate) {
            navigator.vibrate(15);
          }
        }).catch(err => {
          console.error("error al reproducir el archivo de audio:", err);
        });
      }
    });
  });

  // adelantar / retroceder desde el reproductor flotante
  stickyProgressBar.addEventListener('input', () => {
    if (activeAudio && activeAudio.duration) {
      const seekTime = (stickyProgressBar.value / 100) * activeAudio.duration;
      activeAudio.currentTime = seekTime;
    }
  });

  stickyPlayBtn.addEventListener('click', () => {
    if (activeCard) {
      const playBtn = activeCard.querySelector('.play-btn');
      if (playBtn) playBtn.click();
    }
  });
});
