const players = document.querySelectorAll("audio");

players.forEach(player => {

    player.addEventListener("play", () => {

        players.forEach(audio => {

            if(audio !== player){
                audio.pause();
                audio.currentTime = 0;
            }

        });

    });

});