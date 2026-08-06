document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.song-card'));

  let currentIndex = -1;
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

  function playTrackAtIndex(index) {
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');

    if (activeAudio === audio) {
      if (!audio.paused) {
        pauseCurrent();
      } else {
        audio.play();
        card.classList.add('playing');
      }
      return;
    }

    pauseCurrent();

    currentIndex = index;
    activeCard = card;
    activeAudio = audio;

    if (!audio) return;

    audio.play();
    card.classList.add('playing');
  }

  window.playTrack = playTrackAtIndex;

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
        playTrackAtIndex(index + 1);
      } else {
        activeCard = null;
        activeAudio = null;
        currentIndex = -1;
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
        e.stopPropagation();
        playTrackAtIndex(index);
      });
    }
  });
});
