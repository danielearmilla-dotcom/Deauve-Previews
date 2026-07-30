const buttons = document.querySelectorAll(".play");
const audios = document.querySelectorAll("audio");
const bars = document.querySelectorAll(".progress-bar");
const songs = document.querySelectorAll(".song");

let nowPlaying = document.querySelector(".now-playing");

if (!nowPlaying) {
    nowPlaying = document.createElement("div");
    nowPlaying.className = "now-playing";
    nowPlaying.innerHTML = `
        <span>NOW PLAYING</span>
        <h2>Nothing Playing</h2>
    `;
    document.body.insertBefore(nowPlaying, document.body.firstChild);
}

function resetInterface() {

    songs.forEach(song=>{
        song.classList.remove("playing");
        song.style.opacity="1";
        song.style.transform="scale(1)";
    });

    buttons.forEach(btn=>{
        btn.textContent="▶";
    });

    bars.forEach(bar=>{
        bar.style.width="0%";
    });

    document.body.classList.remove(
        "theme-blue",
        "theme-red",
        "theme-purple",
        "theme-green"
    );

    nowPlaying.querySelector("h2").textContent="Nothing Playing";
}

buttons.forEach((button,index)=>{

    const audio=document.getElementById(button.dataset.target);
    const card=button.closest(".song");
    const bar=bars[index];

    button.addEventListener("click",()=>{

        if(audio.paused){

            audios.forEach((a,i)=>{

                if(a!==audio){

                    a.pause();
                    a.currentTime=0;

                }

            });

            resetInterface();

            audio.play();

            button.textContent="❚❚";

            card.classList.add("playing");
            card.style.transform="scale(1.02)";

            songs.forEach(song=>{

                if(song!==card){
                    song.style.opacity=".45";
                }

            });

            const title=card.querySelector("h2").textContent;

            nowPlaying.querySelector("h2").textContent=title;

            switch(index){

                case 0:
                    document.body.classList.add("theme-blue");
                break;

                case 1:
                    document.body.classList.add("theme-purple");
                break;

                case 2:
                    document.body.classList.add("theme-green");
                break;

                case 3:
                    document.body.classList.add("theme-red");
                break;

            }

        }else{

            audio.pause();

            resetInterface();

        }

    });

    audio.addEventListener("timeupdate",()=>{

        const progress=(audio.currentTime/audio.duration)*100||0;

        bar.style.width=progress+"%";

    });

    audio.addEventListener("ended",()=>{

        resetInterface();

    });

});