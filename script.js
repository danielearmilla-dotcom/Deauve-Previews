document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".song-card");
  const audios = document.querySelectorAll("audio");
  const NAMESPACE = "deauve_previews_music"; // identificador unico de tu web

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
    const likeBtn = card.querySelector(".like-btn");
    const countDisplay = card.querySelector(".like-count");
    const trackId = card.getAttribute("data-id");

    // obtener el numero global de likes al cargar la pagina
    fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${trackId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.value !== undefined) {
          countDisplay.textContent = data.value;
        }
      })
      .catch(() => {
        countDisplay.textContent = "0";
      });

    // comprobar si este telefono ya ha votado
    if (localStorage.getItem(`voted_${trackId}`) === "true") {
      likeBtn.classList.add("liked");
      likeBtn.disabled = true;
    }

    // funcion al hacer click en like (suma +1 globalmente)
    if (likeBtn) {
      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (localStorage.getItem(`voted_${trackId}`) === "true") return;

        // sumar 1 en la base de datos publica
        fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${trackId}`)
          .then((res) => res.json())
          .then((data) => {
            countDisplay.textContent = data.value;
            likeBtn.classList.add("liked");
            likeBtn.disabled = true;
            localStorage.setItem(`voted_${trackId}`, "true");
          })
          .catch((err) => console.error("Error al registrar el me gusta:", err));
      });
    }

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
