const buttons = document.querySelectorAll(".play");
const audios = document.querySelectorAll("audio");

buttons.forEach(button => {

    const audio = document.getElementById(button.dataset.target);
    const card = button.closest(".song");

    button.addEventListener("click", () => {

        if (audio.paused) {

            audios.forEach(a => {
                if (a !== audio) {
                    a.pause();
                    a.currentTime = 0;
                    a.closest(".song").classList.remove("playing");
                }
            });

            buttons.forEach(b => b.textContent = "▶");

            audio.play();
            button.textContent = "❚❚";
            card.classList.add("playing");

        } else {

            audio.pause();
            button.textContent = "▶";
            card.classList.remove("playing");

        }

    });

    audio.addEventListener("ended", () => {
        button.textContent = "▶";
        card.classList.remove("playing");
    });

});