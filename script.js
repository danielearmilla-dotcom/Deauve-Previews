document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".song-card");

  const stickyPlayer = document.getElementById("sticky-player");
  const stickyTitle = document.getElementById("sticky-title");
  const stickyArtist = document.getElementById("sticky-artist");
  const stickyPlayBtn = document.getElementById("sticky-play-btn");

  const wavesurfers = [];
  let currentActiveObj = null;

  // wavesurfer mini para el sticky
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

  cards.forEach((card) => {
    const btn = card.querySelector(".play-btn");
    const currentText = card.querySelector(".current");
    const waveformContainer = card.querySelector(".waveform");

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

    const trackObj = { surfer, card, btn, currentText, trackTitle, trackArtist, audioSrc };
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
  });

  // control del boton sticky
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
