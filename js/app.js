const videoInput = document.getElementById("videoInput"); // Campo de upload do video principal
const audioInput = document.getElementById("audioInput"); // Campo de upload do audio
let videoFile = null; //Armazena o arquivo de video
let audioFile = null; //Armazena o arquivo de audio
//CANVA DE VIDEO PRINCIPAL:
const canvas = document.getElementById("previewCanvas"); // Canvas onde sera exibido o preview
const ctx = canvas.getContext("2d"); // Contexto 2D do canvas para desenhar imagens e videos
canvas.width = 1280; //Define resolucao de largura do canvas
canvas.height = 720; //Define resolucao de altura do canvas
//CHROMAKEY - CANVA DE VIDEO OVERLAY(INSCREVA-SE):
const chromaCanvas = document.createElement("canvas"); //Canva invisivel para processar o overlay
const chromaCtx = chromaCanvas.getContext("2d"); // Contexto 2D do canvas para desenhar imagens e videos do overlay
chromaCanvas.width = 500; //Define resolucao de largura do canvas
chromaCanvas.height = 500; //Define resolucao de altura do canvas
let audioFile = null;
const chromaStrength = 80; //Configuracao da intensidade da remocao da cor verde

// =======================================
// VIDEO PRINCIPAL
// =======================================
const video = document.createElement("video"); // Cria um elemento de video invisivel
video.muted = true; // Remove audio do preview
video.loop = true; // Faz o video repetir infinitamente

// =======================================
// OVERLAY (SE INSCREVA)
// =======================================
const overlayVideo = document.createElement("video"); // Cria um video invisivel para o overlay
video.preload = "auto";
overlayVideo.preload = "auto";
overlayVideo.src = "assets/se-inscreva-youtube.mp4"; // Caminho do overlay
overlayVideo.muted = true; // Sem audio
overlayVideo.loop = true; // Repetir continuamente
overlayVideo.playsInline = true; // Necessario para autoplay em alguns navegadores

// =======================================
// UPLOAD DO VIDEO PRINCIPAL
// =======================================
videoInput.addEventListener("change", (event) => {    
    videoFile = event.target.files[0]; // Pega o arquivo selecionado    
    if (!videoFile) return; // Se nao existir arquivo, interrompe    
    video.src = URL.createObjectURL(videoFile); // Cria URL temporaria para reproducao

    //Aguarda o navegador carregar os metadados do video
    video.onloadedmetadata = () => {
        console.log(video.videoWidth, video.videoHeight); //Exibe no console as dimensoes reais do video
        document.querySelector(".preview-container") //Ajusta automaticamente a proporcao do preview
            .style.aspectRatio = `${video.videoWidth}/${video.videoHeight}`;
    video.play(); // Inicia video principal
    overlayVideo.play(); // Inicia overlay
    }
});

// =======================================
// LOOP DE RENDERIZACAO
// =======================================
function render() {    
    requestAnimationFrame(render); // Executa a funcao continuamente    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa todo o canvas

    // ===================================
    // DESENHA O VIDEO PRINCIPAL
    // ===================================
    if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    // ===================================
    // DESENHA O OVERLAY COM CHROMA KEY
    // ===================================
    if(overlayVideo.readyState >= 2) {
        chromaCtx.drawImage(0, 0, chromaCanvas.width, chromaCanvas.height); //Desenha o frame atual do overlay no canva auxiliar
        const frame = chromaCtx.getImageData(0, 0, chromaCanvas.width, chromaCanvas.height); //Captura todos os pixels do frame
        const pixels = frame.data; //Array contendo RGBA
        const greenLimit = 100 + chromaStrength; //Calcula o nivel de remocao de verde
        //Percorre todos os pixels do video overlay
        for(let i = 0; i < pixels.length; i += 4){
            const r = pixels[i]; //Canal vermelho
            const g = pixels[i + 1]; //Canal verde
            const b = pixels[i + 2]; //Canal azul
            //Torna o pixel transparente;
            if(g > greenLimit && r < 120 && b < 120){
                pixels[i + 3] + 0; 
            }
        }        
        chromaCtx.putImagemData(frame, 0, 0); //Atualiza a imagem processada
        const width = 250; //Define tamanho de largura do overlay
        const height = 140; //Define tamanho de altura do overlay
        const x = (canvas.width - width) / 2; //Centraliza horizontalmente
        const y = (canvas.height - height) / 2; //Centraliza verticalmente
        ctx.drawImage(chromaCanvas, x, y, width, height); //Desenha o resultado final sem a cor verde

    }
    
}

// Inicia o loop
render();