const buttons = document.querySelectorAll(".play");
const audios = document.querySelectorAll("audio");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const target = document.getElementById(button.dataset.target);

        audios.forEach(audio => {
            if (audio !== target) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        buttons.forEach(b => b.textContent = "▶ PLAY");

        if (target.paused) {
            target.play();
            button.textContent = "❚❚ PAUSE";
        } else {
            target.pause();
            button.textContent = "▶ PLAY";
        }

        target.onended = () => {
            button.textContent = "▶ PLAY";
        };

    });

});