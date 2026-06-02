const videoInput = document.getElementById("videoInput");
const audioInput = document.getElementById("audioInput");
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;
let videoFile = null;
let audioFile= null;
const video = document.createElement("video");
video.muted = true;
video.loop = true;
videoInput.addEventListener(
    "change",
    (event) =>{
        videoFile = event.target.files[0];
        if(!videoFile)
            return;
        video.src = URL.createObjectURL(videoFile);
        video.play();
    });

function render(){
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.heigth);
    if(video.readyState >= 2){
        ctx.drawImage(video, 0, 0, canvas.width, canvas.heigth);
    }
}

if(overlay.complete){
    const width = 250;
    const heigth = 100;
    const x = (canvas.width - width)/2;
    const y = (canvas.heigth - heigth)/2;
    ctx.drawImage(overlay, x, y, width, heigth);
}

render();