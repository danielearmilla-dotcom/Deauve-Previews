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
  let activeCard = null; 
  let activeAudio = null;
  let isDragging = false;

  function formatTime(seconds) { 
    if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return '0:00'; 
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
    if (spotifyPlayer) {
      spotifyPlayer.classList.remove('is-playing');
    }
  }

  function updateUI() {
    if (!activeAudio || isNaN(activeAudio.duration) || !activeAudio.duration) return;

    const current = activeAudio.currentTime;
    const duration = activeAudio.duration;
    const pct = (current / duration) * 100;

    if (spProgressFill) spProgressFill.style.width = `${pct}%`;
    if (spProgressKnob) spProgressKnob.style.left = `${pct}%`;

    if (spCurrentTime) spCurrentTime.textContent = formatTime(current);
    if (spTotalTime) {
      spTotalTime.textContent = formatTime(duration);
    }

    if (activeCard) {
      const timeText = activeCard.querySelector('.time-text');
      if (timeText) {
        timeText.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
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

    if (!audio || !audio.src) return;

    if (activeAudio === audio) {
      if (!audio.paused) {
        pauseCurrent();
      } else {
        audio.play().then(() => {
          card.classList.add('playing');
          if (spotifyPlayer) spotifyPlayer.classList.add('is-playing');
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

    audio.play().then(() => {
      card.classList.add('playing');
      if (spotifyPlayer) spotifyPlayer.classList.add('is-playing');
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

    if (timeText) {
      const defaultTime = timeText.textContent.trim() || '0:00';
      if (audio && audio.duration) {
        timeText.textContent = `0:00 / ${formatTime(audio.duration)}`;
      } else {
        timeText.textContent = `0:00 / ${defaultTime}`;
      }
    }

    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      if (timeText) {
        timeText.textContent = `0:00 / ${formatTime(audio.duration)}`;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (activeAudio === audio && !isDragging) {
        updateUI();
      }
    });

    audio.addEventListener('ended', () => {
      pauseCurrent();
      if (timeText) timeText.textContent = `0:00 / ${formatTime(audio.duration)}`;
      if (progressBar) progressBar.style.width = '0%';

      if (index + 1 < cards.length) {
        playTrack(index + 1);
      } else {
        activeIndex = -1;
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
        if (activeAudio !== audio) {
          playTrack(index);
        }
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

  // controles del reproductor inferior estilo spotify
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

  // glitch intermitente exclusivo para el título principal
  const heroTitle = document.querySelector('.hero-title.glitch');

  if (heroTitle) {
    function runGlitch() {
      heroTitle.classList.add('glitch-active');

      setTimeout(() => {
        heroTitle.classList.remove('glitch-active');
      }, 200);

      const randomInterval = Math.floor(Math.random() * 2000) + 4000;
      setTimeout(runGlitch, randomInterval);
    }

    setTimeout(runGlitch, 4000);
  }
});
