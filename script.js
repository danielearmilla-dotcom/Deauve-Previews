const audios = document.querySelectorAll("audio");

audios.forEach(audio => {

    audio.addEventListener("play", () => {

        audios.forEach(other => {

            if (other !== audio) {
                other.pause();
                other.currentTime = 0;
            }

        });

        document.querySelectorAll(".song").forEach(card=>{
            card.classList.remove("playing");
        });

        audio.closest(".song").classList.add("playing");

    });

    audio.addEventListener("pause", () => {

        audio.closest(".song").classList.remove("playing");

    });

    audio.addEventListener("ended", () => {

        audio.closest(".song").classList.remove("playing");

    });

});