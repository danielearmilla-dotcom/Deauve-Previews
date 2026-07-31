document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".song-card");
  const audios = document.querySelectorAll("audio");

  let currentPlayingAudio = null;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function resetAll() {
    audios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    cards.forEach((card) => {
      card.classList.remove("playing");
      const btn = card.querySelector(".play-btn");
      const bar = card.querySelector(".progress-bar");
      const current = card.querySelector(".current");

      if (btn) btn.textContent = "▶";
      if (bar) bar.style.width = "0%";
      if (current) current.textContent = "0:00";
    });

    currentPlayingAudio = null;
  }

  cards.forEach((card) => {
    const btn = card.querySelector(".play-btn");
    const audio = card.querySelector("audio");
    const progressBar = card.querySelector(".progress-bar");
    const progressContainer = card.querySelector(".progress");
    const currentText = card.querySelector(".current");

    if (!audio) return;

    btn.addEventListener("click", () => {
      const isPaused = audio.paused;

      if (isPaused) {
        resetAll();

        audio.play().catch((err) => console.error("error al reproducir:", err));
        currentPlayingAudio = audio;

        btn.textContent = "❚❚";
        card.classList.add("playing");
      } else {
        audio.pause();
        btn.textContent = "▶";
        card.classList.remove("playing");
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (currentText) currentText.textContent = formatTime(audio.currentTime);
    });

    if (progressContainer) {
      progressContainer.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const pct = clickX / width;

        if (audio.duration) {
          audio.currentTime = pct * audio.duration;
        }
      });
    }

    audio.addEventListener("ended", () => {
      resetAll();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && currentPlayingAudio) {
      e.preventDefault();
      const card = currentPlayingAudio.closest(".song-card");
      const btn = card?.querySelector(".play-btn");

      if (currentPlayingAudio.paused) {
        currentPlayingAudio.play();
        if (btn) btn.textContent = "❚❚";
        card?.classList.add("playing");
      } else {
        currentPlayingAudio.pause();
        if (btn) btn.textContent = "▶";
        card?.classList.remove("playing");
      }
    }
  });
});
