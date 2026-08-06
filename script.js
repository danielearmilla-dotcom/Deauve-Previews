Document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.song-card'));

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
      activeCard.classList.remove('playing');
    }
  }

  function playTrack(index) {
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');

    if (!audio) return;

    if (activeAudio === audio) {
      if (!audio.paused) {
        pauseCurrent();
      } else {
        audio.play().catch(err => console.log('error al reproducir:', err));
        card.classList.add('playing');
      }
      return;
    }

    pauseCurrent();

    activeCard = card;
    activeAudio = audio;

    audio.play().then(() => {
      card.classList.add('playing');
    }).catch(err => {
      console.log('error al reproducir audio:', err);
    });
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

    if (!audio) return;

    if (audio.duration && timeText) {
      timeText.textContent = formatTime(audio.duration);
    }

    audio.addEventListener('loadedmetadata', () => {
      if (timeText) timeText.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (activeAudio === audio) {
        if (timeText && audio.duration) {
          const remaining = audio.duration - audio.currentTime;
          timeText.textContent = formatTime(remaining);
        }

        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        if (progressBar) {
          progressBar.style.width = `${pct}%`;
        }
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeText) timeText.textContent = formatTime(audio.duration);
      if (progressBar) progressBar.style.width = '0%';

      if (index + 1 < cards.length) {
        playTrack(index + 1);
      } else {
        activeCard = null;
        activeAudio = null;
      }
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

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playTrack(index);
      });
    }
  });
});