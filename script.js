document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.song-card');
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyArtist = document.getElementById('sticky-artist');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');

  const globalAudio = new Audio();
  let currentCard = null;

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  cards.forEach(card => {
    const playBtn = card.querySelector('.play-btn');
    const trackName = card.querySelector('.track-name') ? card.querySelector('.track-name').textContent : 'Track';
    const trackArtist = card.querySelector('.track-artist') ? card.querySelector('.track-artist').textContent : 'Deauve';
    const audioSrc = card.getAttribute('data-audio');

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (currentCard === card && !globalAudio.paused) {
        globalAudio.pause();
        card.classList.remove('is-playing');
        stickyPlayer.classList.remove('is-playing');
        playBtn.textContent = '▶';
        stickyPlayBtn.textContent = '▶';
        return;
      }

      if (currentCard !== card) {
        if (currentCard) {
          currentCard.classList.remove('is-playing');
          currentCard.querySelector('.play-btn').textContent = '▶';
        }
        
        currentCard = card;
        globalAudio.src = audioSrc;
      }

      globalAudio.play().then(() => {
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
    });
  });

  globalAudio.addEventListener('timeupdate', () => {
    if (currentCard) {
      const timeDisplay = currentCard.querySelector('.current');
      if (timeDisplay) {
        timeDisplay.textContent = formatTime(globalAudio.currentTime);
      }
    }
  });

  globalAudio.addEventListener('ended', () => {
    if (currentCard) {
      currentCard.classList.remove('is-playing');
      currentCard.querySelector('.play-btn').textContent = '▶';
    }
    stickyPlayer.classList.remove('is-playing');
    stickyPlayBtn.textContent = '▶';
  });

  stickyPlayBtn.addEventListener('click', () => {
    if (currentCard) {
      const playBtn = currentCard.querySelector('.play-btn');
      playBtn.click();
    }
  });
});
