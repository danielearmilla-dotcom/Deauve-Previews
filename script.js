const buttons = document.querySelectorAll(".play");
const audios = document.querySelectorAll("audio");
const bars = document.querySelectorAll(".progress-bar");

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
                    buttons[i].textContent="▶";
                    bars[i].style.width="0%";
                    a.closest(".song").classList.remove("playing");
                }

            });

            audio.play();

            button.textContent="❚❚";

            card.classList.add("playing");

        }else{

            audio.pause();

            button.textContent="▶";

            card.classList.remove("playing");

        }

    });

    audio.addEventListener("timeupdate",()=>{

        const progress=(audio.currentTime/audio.duration)*100||0;

        bar.style.width=progress+"%";

    });

    audio.addEventListener("ended",()=>{

        button.textContent="▶";

        bar.style.width="0%";

        card.classList.remove("playing");

    });

});