const videoInput = document.getElementById("videoInput"); //Campo de upload do video principal
const audioInput = document.getElementById("audioInput"); //Campo de upload do audio
let videoFile = null; //Armazena o arquivo de video
let audioFile = null; //Armazena o arquivo de audio
//CANVA DE VIDEO PRINCIPAL:
const canvas = document.getElementById("previewCanvas"); //Canvas onde sera exibido o preview
const ctx = canvas.getContext("2d"); // Contexto 2D do canvas para desenhar imagens e videos
canvas.width = 1280; //Define resolucao de largura do canvas
canvas.height = 720; //Define resolucao de altura do canvas
const loopMode = document.getElementById("loopMode"); //Seleciona o modo de repeticao
let playingReverse = false; //Indica se o video esta voltando
let reverseFPS = 30; //Velocidade de retorno
//CHROMAKEY - CANVA DE VIDEO OVERLAY(INSCREVA-SE):
const chromaCanvas = document.createElement("canvas"); //Canva invisivel para processar o overlay
const chromaCtx = chromaCanvas.getContext("2d", {willReadFrequently: true}); // Contexto 2D do canvas para desenhar imagens e videos do overlay
chromaCanvas.width = 240; //Define resolucao de largura do canvas
chromaCanvas.height = 140; //Define resolucao de altura do canvas
const chromaStrength = 30; //Configuracao da intensidade da remocao da cor verde
const overlayInput = document.getElementById("overlayScale"); //Escala inicial do overlay
//BOTAO EXPORTAR
const btExportar = document.getElementById("btExportar");

// =======================================
// CARREGA FFMPEG APENAS UMA VEZ
// =======================================
const {FFmpeg} = FFmpegWASM; //Biblioteca FFmpeg carregada no CDN
//const {fetchFile} = FFmpegUtil; //Obtem funcao utilitaria para converter arquivos
const ffmpeg = new FFmpeg(); //Instancia principal do FFmpeg
let ffmpegLoaded = false; //Controle para saber se já carregou
async function loadFFmpeg(){
    if (ffmpegLoaded) return; //Se já carregou anteriormente...
    console.log("Carregando FFmpeg...");
    await ffmpeg.load({ //Faz download dos arquivos internos: https://app.unpkg.com/@ffmpeg/core@0.12.6
        coreURL: "./ffmpeg/ffmpeg-core.js",
        wasmURL: "./ffmpeg/ffmpeg-core.wasm",
        workerURL: "./ffmpeg/ffmpeg-core.worker.js"
    }); 
    
    ffmpegLoaded = true;
    console.log("FFmpeg carregado.");
}

// =======================================
// AUDIO PRINCIPAL
// =======================================
const audio = document.createElement("audio"); //Cria o elemento de audio invisivel
document.createElement("audio");
document.body.appendChild(audio);
audio.loop = false; //Remove o loop

// =======================================
// VIDEO PRINCIPAL
// =======================================
const video = document.createElement("video"); //Cria um elemento de video invisivel
video.muted = true; //Remove audio do preview
video.loop = true; //Faz o video repetir infinitamente

// =======================================
// OVERLAY (SE INSCREVA)
// =======================================
const overlayVideo = document.createElement("video"); //Cria um video invisivel para o overlay
video.preload = "auto";
overlayVideo.preload = "auto";
overlayVideo.src = "assets/se-inscreva-youtube.mp4"; //Caminho do overlay
overlayVideo.muted = false; //Sem audio
overlayVideo.loop = false; //Repetir continuamente
overlayVideo.playsInline = true; //Necessario para autoplay em alguns navegadores
let firstOverlayPlayed = false; //Controle para saber se o primeiro overlay foi executado
let lastOverlayPlayed = false; //Controle para saber se o segundo overlay foi executado

// =======================================
// FUNÇÃO PARA EXECUTAR OVERLAY
// =======================================
function playOverlay(){
    overlayVideo.pause(); //Garante que o video pare antes de reiniciar
    overlayVideo.currentTime = 0; //Volta para o primeiro frame
    overlayVideo.play()
        .catch(error => {
            console.log("Erro ao reproduzir overlay: ", error);
        });
}

// =======================================
// UPLOAD DO VIDEO PRINCIPAL
// =======================================
videoInput.addEventListener("change", (event) => {    
    videoFile = event.target.files[0]; //Pega o arquivo selecionado    
    if (!videoFile) return; //Se nao existir arquivo, interrompe    
    video.src = URL.createObjectURL(videoFile); //Cria URL temporaria para reproducao

    //Aguarda o navegador carregar os metadados do video
    video.onloadedmetadata = () => {
        console.log(video.videoWidth, video.videoHeight); //Exibe no console as dimensoes reais do video
        document.querySelector(".preview-container") //Ajusta automaticamente a proporcao do preview
            .style.aspectRatio = `${video.videoWidth}/${video.videoHeight}`;
    video.play(); //Inicia video principal
    playOverlay(); //Executa overlay
    firstOverlayPlayed = true; //Primeiro overlay
    }
});

// =======================================
// UPLOAD DO AUDIO PRINCIPAL
// =======================================
audioInput.addEventListener("change", (event) =>{
    audioFile = event.target.files[0]; //Arquivo selecionado
    if(!audioFile) return; //Se nao existir arquivo de audio
    audio.src = URL.createObjectURL(audioFile); //Cria uma URL temporaria
    audio.onloadedmetadata = () => { //Aguardar carregar audio
        console.log("Audio carregado.");
        console.log("Duracao: ", audio.duration);
    };
});

// =======================================
// LOOP DE RENDERIZACAO (RENDER)
// =======================================
function render() {    
    requestAnimationFrame(render); //Executa a funcao continuamente    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa todo o canvas

    // ===================================
    // DESENHA O VIDEO PRINCIPAL
    // ===================================
    if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        //LOOP NORMAL
        if(loopMode.value === "loop"){
            video.loop = true;
        }
        //LOOP REVERSO
        else{
            video.loop = false;            
            if(video.currentTime >= video.duration - 0.05 && !playingReverse){ //Chegou ao final
                playingReverse = true;
            }
            if(playingReverse){
                video.pause();
                video.currentTime -= 1 / reverseFPS;
                if(video.currentTime <= 0){ //Voltou ao inicio
                    playingReverse = false;
                    video.currentTime = 0;
                    video.play();
                }
            }
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    // ===================================
    // DESENHA O OVERLAY COM CHROMA KEY
    // ===================================
    //Definindo tempo de duracao do audio para inserir o overlay
    if(audio.duration){ 
        const currentTime = audio.currentTime; //Tempo atual do audio
        const duration = audio.duration; //Tempo total do audio
        const triggerTime = duration - 20; //Momento em que o overlay deve aparecer
        //Se o tempo atual for maior ou igual ao tempo do overlay aparecer, e caso ele nao tenha sido executado
        if(currentTime >= triggerTime && !lastOverlayPlayed){
            playOverlay(); //Executa overlay
            lastOverlayPlayed = true; //Ultimo overlay
        }
    }
    //Se overlay estiver sido iniciado e diferente de pausado e diferente de finalizado...
    if(overlayVideo.readyState >= 2 && !overlayVideo.paused && !overlayVideo.ended){
        chromaCtx.drawImage(overlayVideo, 0, 0, chromaCanvas.width, chromaCanvas.height); //Desenha o frame atual do overlay no canva auxiliar
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
                pixels[i + 3] = 0; //0 = totalmente transparente
            }
        }        
        chromaCtx.putImageData(frame, 0, 0); //Atualiza a imagem processada
        const width = chromaCanvas.width * parseFloat(overlayInput.value); //Escala de altura do overlay
        const height = chromaCanvas.height * parseFloat(overlayInput.value); //Escala de largura do overlay
        const x = (canvas.width - width) / 2; //Centraliza horizontalmente
        const y = (canvas.height - height) / 2; //Centraliza verticalmente
        ctx.drawImage(chromaCanvas, x, y, width, height); //Desenha o resultado final sem a cor verde
    }   
}
// Inicia o loop
render();

// =======================================
// EXPORTAR ARQUIVO COMPLETO (MP3 + VIDEO PRINCIPAL + INSCREVA-SE)
// =======================================
btExportar.addEventListener("click", exportVideo); //Clique no botao de exportar

async function exportVideo(){
    //Validando se os arquivos existem
    if(!audioFile){
        alert("Selecione um arquivo de audio mp3!");
        return;
    }
    if (!videoFile){
        alert("Selecione um arquivo de vídeo mp4!");
        return;
    }

    console.log("Iniciando exportação...");
    await loadFFmpeg(); //Garante que o FFmpeg seja carregado
    //ARQUIVO MP4 - Envia o MP4 para a memória do FFmpeg
    await ffmpeg.writeFile(
        "video.mp4",
        await fetchFile(videoFile)
    );    
    //ARQUIVO MP3 - Envia o MP3 para a memória do FFmpeg
    await ffmpeg.writeFile(
        "audio.mp3",
        await fetchFile(videoFile)
    );
    console.log("Arquivos enviados para o FFmpeg.");

    //FFMPEG - COMANDOS PARA PROCESSAR OS ARQUIVOS
    //i         --> Identifica os arquivos
    //-c:v copy --> Não processa video
    //-c:a aac  --> Converte audio em AAC
    //shortest  --> Termina quando o menor arquivo acabar
    await ffmpeg.exec([
        "-i", "video.mp4",
        "-i", "audio.mp3",
        "-c:v", "copy",
        "-c:v", "aac",
        "-shortest",
        "saida.mp4"
    ]);
    console.log("MP4 gerado pelo FFMPEG.");

    const data = await ffmpeg.readFile("saida.mp4"); //Lê arquivo final gerado
    const blob = new Blob( //Criar blob para download em formato MP4
        [data.buffer],{type: "video/mp4"}
    );
    const url = URL.createObjectURL(blob); //Gera o link temporário
    const a = document.createElement("a"); //Cria elemento de link invisível na página
    a.href = url; //Define que o elemento recebe o objeto criado pelo blob
    a.download = "video-final.mp4"; //Cria opção para realiza o download do link
    a.click(); //Clicando no link para iniciar o download
    URL.revokeObjectURL(url); //Limpa a memória
    console.log("Download iniciado.");


}
