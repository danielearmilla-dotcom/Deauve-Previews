document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".song-card");
  const DB_ID = "deauve_music_likes_v1";
  const API_URL = `https://api.counterapi.dev/v1/${DB_ID}`;

  const stickyPlayer = document.getElementById("sticky-player");
  const stickyTitle = document.getElementById("sticky-title");
  const stickyArtist = document.getElementById("sticky-artist");
  const stickyPlayBtn = document.getElementById("sticky-play-btn");

  const wavesurfers = [];
  let currentActiveObj = null;

  // inicializar wavesurfer mini para el sticky
  const stickySurfer = WaveSurfer.create({
    container: "#sticky-waveform",
    waveColor: "#3f3f46",
    progressColor: "#ff2a85",
    cursorColor: "transparent",
    barWidth: 2,
    barRadius: 2,
    barGap: 2,
    height: 28,
    interact: false
  });

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function stopAllPlayers() {
    wavesurfers.forEach(({ surfer, card, btn, currentText }) => {
      surfer.pause();
      card.classList.remove("playing");
      if (btn) btn.textContent = "▶";
      if (currentText) currentText.textContent = "0:00";
    });
    currentActiveObj = null;
    stickyPlayer.classList.remove("visible");
  }

  // funcion para recalcular porcentajes de popularidad
  function updatePopularityPercentages(likeCountsMap) {
    let totalLikes = 0;
    Object.values(likeCountsMap).forEach((val) => {
      totalLikes += val;
    });

    cards.forEach((card) => {
      const trackId = card.getAttribute("data-id");
      const cardLikes = likeCountsMap[trackId] || 0;
      const fillBar = card.querySelector(".popularity-bar-fill");
      const textBar = card.querySelector(".popularity-text");

      let percent = 0;
      if (totalLikes > 0) {
        percent = Math.round((cardLikes / totalLikes) * 100);
      }

      fillBar.style.width = `${percent}%`;
      textBar.textContent = `${percent}% popularidad`;
    });
  }

  const likeCountsMap = {};

  cards.forEach((card) => {
    const btn = card.querySelector(".play-btn");
    const currentText = card.querySelector(".current");
    const likeBtn = card.querySelector(".like-btn");
    const countDisplay = card.querySelector(".like-count");
    const waveformContainer = card.querySelector(".waveform");

    const trackId = card.getAttribute("data-id");
    const audioSrc = card.getAttribute("data-audio");
    const trackTitle = card.querySelector(".track-meta h3").textContent;
    const trackArtist = card.querySelector(".track-meta p").textContent;

    const surfer = WaveSurfer.create({
      container: waveformContainer,
      waveColor: "#27272a",
      progressColor: "#ff2a85",
      cursorColor: "transparent",
      barWidth: 2,
      barRadius: 2,
      barGap: 3,
      height: 36,
      url: audioSrc,
    });

    const trackObj = { surfer, card, btn, currentText, trackTitle, trackArtist, audioSrc, trackId };
    wavesurfers.push(trackObj);

    surfer.on("audioprocess", () => {
      if (currentText) currentText.textContent = formatTime(surfer.getCurrentTime());
      if (currentActiveObj === trackObj && surfer.getDuration()) {
        stickySurfer.seekTo(surfer.getCurrentTime() / surfer.getDuration());
      }
    });

    surfer.on("finish", () => {
      stopAllPlayers();
    });

    btn.addEventListener("click", () => {
      if (surfer.isPlaying()) {
        surfer.pause();
        btn.textContent = "▶";
        stickyPlayBtn.textContent = "▶";
        card.classList.remove("playing");
        currentActiveObj = null;
        stickyPlayer.classList.remove("visible");
      } else {
        stopAllPlayers();
        surfer.play();
        btn.textContent = "❚❚";
        stickyPlayBtn.textContent = "❚❚";
        card.classList.add("playing");
        currentActiveObj = trackObj;

        stickyTitle.textContent = trackTitle;
        stickyArtist.textContent = trackArtist;
        stickySurfer.load(audioSrc);
        stickyPlayer.classList.add("visible");
      }
    });

    // consulta de me gustas globales
    fetch(`${API_URL}/${trackId}`)
      .then((res) => res.json())
      .then((data) => {
        const count = (data && data.count !== undefined) ? data.count : 0;
        countDisplay.textContent = count;
        likeCountsMap[trackId] = count;
        updatePopularityPercentages(likeCountsMap);
      })
      .catch(() => {
        countDisplay.textContent = "0";
        likeCountsMap[trackId] = 0;
        updatePopularityPercentages(likeCountsMap);
      });

    if (localStorage.getItem(`voted_${trackId}`) === "true") {
      likeBtn.classList.add("liked");
      likeBtn.disabled = true;
    }

    if (likeBtn) {
      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (localStorage.getItem(`voted_${trackId}`) === "true") return;

        likeBtn.classList.add("liked");
        likeBtn.disabled = true;
        localStorage.setItem(`voted_${trackId}`, "true");

        fetch(`${API_URL}/${trackId}/up`)
          .then((res) => res.json())
          .then((data) => {
            const count = (data && data.count !== undefined) ? data.count : (likeCountsMap[trackId] || 0) + 1;
            countDisplay.textContent = count;
            likeCountsMap[trackId] = count;
            updatePopularityPercentages(likeCountsMap);
          })
          .catch((err) => {
            console.error("error me gusta global:", err);
          });
      });
    }
  });

  // control del boton sticky abajo
  stickyPlayBtn.addEventListener("click", () => {
    if (currentActiveObj) {
      if (currentActiveObj.surfer.isPlaying()) {
        currentActiveObj.surfer.pause();
        currentActiveObj.btn.textContent = "▶";
        stickyPlayBtn.textContent = "▶";
        currentActiveObj.card.classList.remove("playing");
      } else {
        currentActiveObj.surfer.play();
        currentActiveObj.btn.textContent = "❚❚";
        stickyPlayBtn.textContent = "❚❚";
        currentActiveObj.card.classList.add("playing");
      }
    }
  });

  // atajo barra espaciadora
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && currentActiveObj) {
      e.preventDefault();
      stickyPlayBtn.click();
    }
  });
});
