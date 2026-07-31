document.addEventListener("DOMContentLoaded", () => {
  const songs = document.querySelectorAll(".song");
  const audios = document.querySelectorAll("audio");
  const container = document.querySelector(".container");
  const logo = document.querySelector(".logo");
  const themes = ["theme-blue", "theme-purple", "theme-green", "theme-red"];

  let currentPlayingAudio = null;

  // crear elemento 'now playing' si no existe
  let nowPlaying = document.querySelector(".now-playing");
  if (!nowPlaying) {
    nowPlaying = document.createElement("div");
    nowPlaying.className = "now-playing";
    nowPlaying.innerHTML = `
      <span>♪ NOW PLAYING</span>
      <h2>Nothing Playing</h2>
    `;
    container.insertBefore(nowPlaying, logo);
  }

  // formatear segundos a min:seg
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function resetInterface() {
    audios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    songs.forEach((song) => {
      song.classList.remove("playing", "dimmed");
      const bar = song.querySelector(".progress-bar");
      const btn = song.querySelector(".play");
      const currentText = song.querySelector(".current");

      if (bar) bar.style.width = "0%";
      if (btn) btn.textContent = "▶";
      if (currentText) currentText.textContent = "0:00";
    });

    document.body.classList.remove(...themes);
    nowPlaying.classList.remove("active");
    currentPlayingAudio = null;
  }

  // configurar cada tarjeta
  songs.forEach((card, index) => {
    const btn = card.querySelector(".play");
    const audio = card.querySelector("audio");
    const progressBarContainer = card.querySelector(".progress");
    const progressBar = card.querySelector(".progress-bar");
    const currentText = card.querySelector(".current");
    const durationText = card.querySelector(".duration");
    const trackTitle = card.querySelector("h2")?.textContent || "pista";

    if (!audio) return;

    // cargar duracion cuando la metadata este lista
    const setDuration = () => {
      if (durationText && audio.duration) {
        durationText.textContent = formatTime(audio.duration);
      }
    };

    if (audio.readyState >= 1) {
      setDuration();
    } else {
      audio.addEventListener("loadedmetadata", setDuration);
    }

    // click en reproducir / pausar
    btn.addEventListener("click", () => {
      const isPaused = audio.paused;

      if (isPaused) {
        resetInterface();

        audio.play().catch((err) => console.error("error al reproducir:", err));
        currentPlayingAudio = audio;

        btn.textContent = "❚❚";
        card.classList.add("playing");

        songs.forEach((s) => {
          if (s !== card) s.classList.add("dimmed");
        });

        if (themes[index]) document.body.classList.add(themes[index]);

        const titleDisplay = nowPlaying.querySelector("h2");
        if (titleDisplay) titleDisplay.textContent = trackTitle;
        nowPlaying.classList.add("active");
      } else {
        audio.pause();
        btn.textContent = "▶";
        card.classList.remove("playing");
        songs.forEach((s) => s.classList.remove("dimmed"));
      }
    });

    // actualizar tiempo y barra durante reproduccion
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (currentText) currentText.textContent = formatTime(audio.currentTime);
    });

    // saltar en el audio al hacer click en la barra
    if (progressBarContainer) {
      progressBarContainer.addEventListener("click", (e) => {
        const rect = progressBarContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;

        if (audio.duration) {
          audio.currentTime = percentage * audio.duration;
        }
      });
    }

    audio.addEventListener("ended", () => {
      resetInterface();
    });
  });

  // pausar / reproducir con la barra espaciadora
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && currentPlayingAudio) {
      e.preventDefault();
      const parentCard = currentPlayingAudio.closest(".song");
      const btn = parentCard?.querySelector(".play");

      if (currentPlayingAudio.paused) {
        currentPlayingAudio.play();
        if (btn) btn.textContent = "❚❚";
        parentCard?.classList.add("playing");
      } else {
        currentPlayingAudio.pause();
        if (btn) btn.textContent = "▶";
        parentCard?.classList.remove("playing");
      }
    }
  });
});
