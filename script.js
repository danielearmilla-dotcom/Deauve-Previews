document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.song-card'));
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyArtist = document.getElementById('sticky-artist');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');
  const stickyPrevBtn = document.getElementById('sticky-prev-btn');
  const stickyNextBtn = document.getElementById('sticky-next-btn');
  const stickyProgressContainer = document.getElementById('sticky-progress-container');
  const stickyProgressBar = document.getElementById('sticky-progress-bar');

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
    if (activeAudio) activeAudio.pause();
    if (activeCard) {
      activeCard.classList.remove('playing');
      const btn = activeCard.querySelector('.play-btn');
      if (btn) btn.textContent = '▶';
    }
    if (stickyPlayBtn) stickyPlayBtn.textContent = '▶';
  }

  function playTrackAtIndex(index) {
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');
    const playBtn = card.querySelector('.play-btn');
    const trackName = card.querySelector('.track-meta h3') 
      ? card.querySelector('.track-meta h3').childNodes[0].textContent.trim() 
      : 'Pista';
    const trackArtist = card.querySelector('.track-meta p') 
      ? card.querySelector('.track-meta p').textContent.trim() 
      : 'Deauve';

    if (activeAudio === audio) {
      if (!audio.paused) {
        pauseCurrent();
      } else {
        audio.play().then(() => {
          card.classList.add('playing');
          if (playBtn) playBtn.textContent = '❚❚';
          if (stickyPlayBtn) stickyPlayBtn.textContent = '❚❚';
          if (stickyPlayer) stickyPlayer.classList.add('visible');
        }).catch(err => console.error(err));
      }
      return;
    }

    pauseCurrent();

    currentIndex = index;
    activeCard = card;
    activeAudio = audio;

    if (!audio) return;

    audio.play().then(() => {
      card.classList.add('playing');
      if (playBtn) playBtn.textContent = '❚❚';
      if (stickyTitle) stickyTitle.textContent = trackName;
      if (stickyArtist) stickyArtist.textContent = trackArtist;
      if (stickyPlayBtn) stickyPlayBtn.textContent = '❚❚';
      if (stickyPlayer) stickyPlayer.classList.add('visible');
    }).catch(err => console.error(err));
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

        if (stickyProgressBar) {
          stickyProgressBar.style.width = `${pct}%`;
        }
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeText) timeText.textContent = formatTime(audio.duration);
      if (progressBar) progressBar.style.width = '0%';
      if (stickyProgressBar) stickyProgressBar.style.width = '0%';
      
      if (index + 1 < cards.length) {
        playTrackAtIndex(index + 1);
      } else {
        activeCard = null;
        activeAudio = null;
        currentIndex = -1;
        if (stickyPlayer) stickyPlayer.classList.remove('visible');
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

  if (stickyPlayBtn) {
    stickyPlayBtn.addEventListener('click', () => {
      if (currentIndex !== -1) {
        playTrackAtIndex(currentIndex);
      } else if (cards.length > 0) {
        playTrackAtIndex(0);
      }
    });
  }

  if (stickyPrevBtn) {
    stickyPrevBtn.addEventListener('click', () => {
      if (activeAudio && activeAudio.currentTime > 3) {
        activeAudio.currentTime = 0;
      } else if (currentIndex > 0) {
        playTrackAtIndex(currentIndex - 1);
      } else if (currentIndex === 0 && activeAudio) {
        activeAudio.currentTime = 0;
      }
    });
  }

  if (stickyNextBtn) {
    stickyNextBtn.addEventListener('click', () => {
      if (currentIndex !== -1 && currentIndex + 1 < cards.length) {
        playTrackAtIndex(currentIndex + 1);
      }
    });
  }

  if (stickyProgressContainer) {
    stickyProgressContainer.addEventListener('click', (e) => {
      if (!activeAudio || !activeAudio.duration) return;
      const rect = stickyProgressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      activeAudio.currentTime = pct * activeAudio.duration;
    });
  }
});
