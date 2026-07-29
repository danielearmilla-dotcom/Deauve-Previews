const audios = document.querySelectorAll("audio");

audios.forEach(audio => {

    audio.addEventListener("play", () => {

        audios.forEach(other => {
            if (other !== audio) {
                other.pause();
                other.currentTime = 0;
                other.parentElement.classList.remove("playing");
            }
        });

        audio.parentElement.classList.add("playing");

    });

    audio.addEventListener("pause", () => {
        audio.parentElement.classList.remove("playing");
    });

    audio.addEventListener("ended", () => {
        audio.parentElement.classList.remove("playing");
    });

});