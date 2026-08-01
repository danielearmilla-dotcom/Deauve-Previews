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
    const trackName = card.querySelector('.track-name') ? card.querySelector('.track-name').textContent : 'Pista';
    const trackArtist = card.querySelector('.track-artist') ? card.querySelector('.track-artist').textContent : 'Deauve';

    if (!audio) return;

    audio.addEventListener('timeupdate', () => {
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      activeCard = null;
      activeAudio = null;
    });

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      // si es la misma canción que está sonando -> pausar
      if (activeAudio === audio && !audio.paused) {
        pauseCurrent();
        return;
      }

      // si había otra sonando -> pausarla primero
      if (activeAudio && activeAudio !== audio) {
        pauseCurrent();
      }

      // reproducir canción seleccionada
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
          console.error("error al reproducir el archivo de audio:", err);
        });
      }
    });
  });

  // botón del sticky player
  stickyPlayBtn.addEventListener('click', () => {
    if (activeCard) {
      const playBtn = activeCard.querySelector('.play-btn');
      if (playBtn) playBtn.click();
    }
  });
});
