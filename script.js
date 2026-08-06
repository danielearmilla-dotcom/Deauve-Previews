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

  function pauseCurrent() {
    if (activeAudio) activeAudio.pause();
    if (activeCard) activeCard.classList.remove('playing');
    if (spotifyPlayer) spotifyPlayer.classList.remove('is-playing');
  }

  function updateUI() {
    if (!activeAudio || !activeAudio.duration || isNaN(activeAudio.duration)) return;

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

  function playTrack(index) {
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    const audio = card.querySelector('audio');
    if (!audio) return;

    if (activeIndex === index && activeAudio) {
      if (!activeAudio.paused) {
        pauseCurrent();
      } else {
        activeAudio.play().then(() => {
          activeCard.classList.add('playing');
          spotifyPlayer.classList.add('is-playing');
        }).catch(err => console.log('error al reproducir:', err));
      }
      return;
    }

    pauseCurrent();

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
    }).catch(err => console.log('error al reproducir:', err));
  }

  cards.forEach((card, index) => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeText = card.querySelector('.duration-text');
    const waveformContainer = card.querySelector('.waveform');

    if (waveformContainer && !card.querySelector('.waveform-progress')) {
      waveformContainer.innerHTML = '';
      const progressBar = document.createElement('div');
      progressBar.className = 'waveform-progress';
      waveformContainer.appendChild(progressBar);
    }

    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      if (timeText) timeText.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (activeIndex === index && !isDragging) {
        updateUI();
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (index + 1 < cards.length) {
        playTrack(index + 1);
      } else {
        activeIndex = -1;
        activeCard = null;
        activeAudio = null;
      }
    });

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playTrack(index);
      });
    }

    if (waveformContainer) {
      waveformContainer.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = waveformContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
      });
    }
  });

  if (spPlayBtn) {
    spPlayBtn.addEventListener('click', () => {
      if (activeIndex !== -1) {
        playTrack(activeIndex);
      } else if (cards.length > 0) {
        playTrack(0);
      }
    });
  }

  if (spPrevBtn) {
    spPrevBtn.addEventListener('click', () => {
      if (activeIndex > 0) playTrack(activeIndex - 1);
    });
  }

  if (spNextBtn) {
    spNextBtn.addEventListener('click', () => {
      if (activeIndex + 1 < cards.length) playTrack(activeIndex + 1);
    });
  }

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
