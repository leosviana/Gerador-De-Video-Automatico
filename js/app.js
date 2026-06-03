const videoInput = document.getElementById("videoInput"); // Campo de upload do video principal
const audioInput = document.getElementById("audioInput"); // Campo de upload do audio 
const canvas = document.getElementById("previewCanvas"); // Canvas onde sera exibido o preview
const ctx = canvas.getContext("2d"); // Contexto 2D do canvas para desenhar imagens e videos
// Define resolucao interna do canvas:
canvas.width = 1280;
canvas.height = 720;
// Armazena os arquivos selecionados:
let videoFile = null;
let audioFile = null;

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
    video.play(); // Inicia video principal    
    overlayVideo.play(); // Inicia overlay
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
    // DESENHA O OVERLAY
    // ===================================
    if (overlayVideo.readyState >= 2) {        
        const width = 250; // Tamanho do overlay horizontalmente
        const height = 140; // Tamanho do overlay verticalmente
        const x = (canvas.width - width) / 2; // Centraliza horizontalmente        
        const y = (canvas.height - height) / 2; // Centraliza verticalmente
        ctx.drawImage(overlayVideo, x, y, width, height);
    }
}

// Inicia o loop
render();