document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.song-card');
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyArtist = document.getElementById('sticky-artist');
  const stickyPlayBtn = document.getElementById('sticky-play-btn');

  let activeCard = null;
  let activeAudio = null;

  const barHeights = [
    25, 40, 60, 35, 75, 90, 50, 30, 85, 100, 65, 45, 30, 70, 80, 40, 
    25, 55, 95, 60, 45, 75, 85, 35, 50, 90, 65, 40, 25, 50, 80, 100, 
    75, 55, 35, 65, 45, 25
  ];

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
    stickyPlayer.classList.remove('visible');
    stickyPlayBtn.textContent = '▶';
  }

  cards.forEach((card) => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeText = card.querySelector('.time-text');
    const waveformContainer = card.querySelector('.waveform');
    const trackName = card.querySelector('.track-meta h3') ? card.querySelector('.track-meta h3').childNodes[0].textContent.trim() : 'Pista';
    const trackArtist = card.querySelector('.track-meta p') ? card.querySelector('.track-meta p').textContent.trim() : 'Deauve';

    if (waveformContainer) {
      waveformContainer.innerHTML = '';
      const barsWrapper = document.createElement('div');
      barsWrapper.style.display = 'flex';
      barsWrapper.style.alignItems = 'center';
      barsWrapper.style.gap = '3px';
      barsWrapper.style.height = '100%';
      barsWrapper.style.width = '100%';

      barHeights.forEach(h => {
        const bar = document.createElement('div');
        bar.style.flex = '1';
        bar.style.height = `${h}%`;
        bar.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        bar.style.borderRadius = '99px';
        bar.style.transition = 'background-color 0.15s ease';
        bar.className = 'wf-bar';
        barsWrapper.appendChild(bar);
      });
      waveformContainer.appendChild(barsWrapper);
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

      if (audio.duration && waveformContainer) {
        const progress = audio.currentTime / audio.duration;
        const bars = waveformContainer.querySelectorAll('.wf-bar');
        const playedCount = Math.floor(progress * bars.length);

        bars.forEach((bar, index) => {
          if (index <= playedCount) {
            bar.style.backgroundColor = '#ff2a85';
          } else {
            bar.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          }
        });
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeText) timeText.textContent = formatTime(audio.duration);
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
        stickyTitle.textContent = trackName;
        stickyArtist.textContent = trackArtist;
        stickyPlayBtn.textContent = '❚❚';
        stickyPlayer.classList.add('visible');
      }).catch(err => console.error(err));
    });
  });

  stickyPlayBtn.addEventListener('click', () => {
    if (activeCard) {
      const playBtn = activeCard.querySelector('.play-btn');
      if (playBtn) playBtn.click();
    }
  });
});
