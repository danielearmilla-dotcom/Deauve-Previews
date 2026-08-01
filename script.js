document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.song-card');
  let activeAudio = null;
  let activeCard = null;

  // altura de las barritas de la onda idéntica a la imagen original de las 0:41
  const barHeights = [
    25, 40, 60, 35, 75, 90, 50, 30, 85, 100, 65, 45, 30, 70, 80, 40, 
    25, 55, 95, 60, 45, 75, 85, 35, 50, 90, 65, 40, 25, 50, 80, 100, 
    75, 55, 35, 65, 45, 25
  ];

  cards.forEach((card) => {
    const playBtn = card.querySelector('.play-btn');
    const audio = card.querySelector('audio');
    const timeDisplay = card.querySelector('.time-display');
    const waveformContainer = card.querySelector('.waveform-container');
    const waveformBars = card.querySelector('.waveform-bars');

    // renderizado de las barritas
    if (waveformBars) {
      waveformBars.innerHTML = '';
      barHeights.forEach(h => {
        const bar = document.createElement('div');
        bar.className = 'wb-bar';
        bar.style.height = `${h}%`;
        waveformBars.appendChild(bar);
      });
    }

    if (!audio) return;

    audio.addEventListener('timeupdate', () => {
      if (audio.duration && waveformBars) {
        const progress = audio.currentTime / audio.duration;
        const bars = waveformBars.querySelectorAll('.wb-bar');
        const playedCount = Math.floor(progress * bars.length);

        bars.forEach((bar, index) => {
          if (index <= playedCount) {
            bar.classList.add('played');
          } else {
            bar.classList.remove('played');
          }
        });
      }
    });

    audio.addEventListener('ended', () => {
      if (playBtn) playBtn.textContent = '▶';
      if (waveformBars) {
        waveformBars.querySelectorAll('.wb-bar').forEach(b => b.classList.remove('played'));
      }
      activeAudio = null;
      activeCard = null;
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
        audio.pause();
        playBtn.textContent = '▶';
        return;
      }

      if (activeAudio && activeAudio !== audio) {
        activeAudio.pause();
        if (activeCard) {
          const prevBtn = activeCard.querySelector('.play-btn');
          if (prevBtn) prevBtn.textContent = '▶';
        }
      }

      activeAudio = audio;
      activeCard = card;

      audio.play().then(() => {
        playBtn.textContent = '❚❚';
      }).catch(err => {
        console.error("error al reproducir:", err);
      });
    });
  });
});
