// Campo de upload do vídeo principal
const videoInput = document.getElementById("videoInput");
// Campo de upload do áudio (ainda não utilizado)
const audioInput = document.getElementById("audioInput");
// Canvas onde será exibido o preview
const canvas = document.getElementById("previewCanvas");
// Contexto 2D do canvas para desenhar imagens e vídeos
const ctx = canvas.getContext("2d");
// Define resolução interna do canvas
canvas.width = 1280;
canvas.height = 720;
// Armazena os arquivos selecionados
let videoFile = null;
let audioFile = null;

// =======================================
// VÍDEO PRINCIPAL
// =======================================
// Cria um elemento de vídeo invisível
const video = document.createElement("video");
// Remove áudio do preview
video.muted = true;
// Faz o vídeo repetir infinitamente
video.loop = true;

// =======================================
// OVERLAY (SE INSCREVA)
// =======================================
// Cria um vídeo invisível para o overlay
const overlayVideo = document.createElement("video");
// Caminho do overlay
overlayVideo.src = "assets/se-inscreva-youtube.mp4";
// Sem áudio
overlayVideo.muted = true;
// Repetir continuamente
overlayVideo.loop = true;
// Necessário para autoplay em alguns navegadores
overlayVideo.playsInline = true;

// =======================================
// UPLOAD DO VÍDEO PRINCIPAL
// =======================================
videoInput.addEventListener("change", (event) => {
    // Pega o arquivo selecionado
    videoFile = event.target.files[0];
    // Se não existir arquivo, interrompe
    if (!videoFile) return;
    // Cria URL temporária para reprodução
    video.src = URL.createObjectURL(videoFile);
    // Inicia vídeo principal
    video.play();
    // Inicia overlay
    overlayVideo.play();
});

// =======================================
// LOOP DE RENDERIZAÇÃO
// =======================================
function render() {
    // Executa a função continuamente
    requestAnimationFrame(render);
    // Limpa todo o canvas
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // ===================================
    // DESENHA O VÍDEO PRINCIPAL
    // ===================================
    if (video.readyState >= 2) {
        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    // ===================================
    // DESENHA O OVERLAY
    // ===================================
    if (overlayVideo.readyState >= 2) {
        // Tamanho do overlay
        const width = 250;
        const height = 140;
        // Centraliza horizontalmente
        const x = (canvas.width - width) / 2;
        // Centraliza verticalmente
        const y = (canvas.height - height) / 2;
        ctx.drawImage(
            overlayVideo,
            x,
            y,
            width,
            height
        );
    }
}

// Inicia o loop
render();