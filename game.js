const canvas = document.getElementById('gameCanvas');
canvas.width = 1000; // Aumenta a largura da tela do jogo
canvas.height = 300; // Aumenta a altura da tela do jogo
const ctx = canvas.getContext('2d');
const ambientSound = document.getElementById('ambientSound');
const failSound = document.getElementById('failSound');

// Carrega as imagens
const dinoImg = new Image();
const cactusImg = new Image();
const groundImg = new Image();

dinoImg.src = 'coelho.png';
cactusImg.src = 'mato.png';
groundImg.src = 'ground.png';

// Adiciona logs para verificar o carregamento das imagens
dinoImg.onload = () => console.log('Dino image loaded');
cactusImg.onload = () => console.log('Cactus image loaded');
groundImg.onload = () => console.log('Ground image loaded');
dinoImg.onerror = () => console.error('Failed to load dino image');
cactusImg.onerror = () => console.error('Failed to load cactus image');
groundImg.onerror = () => console.error('Failed to load ground image');

// Variáveis do jogo
let dino = {
    x: 50,
    y: canvas.height - 60, // Ajusta a posição inicial do dinossauro
    width: 40, // Ajusta a largura da imagem do dinossauro
    height: 40, // Ajusta a altura da imagem do dinossauro
    dy: 0,
    jumpStrength: 13, // Ajusta a força do salto
    gravity: 0.9, // Ajusta a gravidade
    grounded: false
};

let obstacles = [];
let gameSpeed = 10; // Aumenta a velocidade do jogo
let score = 0;

// Função para desenhar o dinossauro
function drawDino() {
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
}

// Função para desenhar obstáculos
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(cactusImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Função para desenhar o chão
function drawGround() {
    ctx.drawImage(groundImg, 0, canvas.height - 10, canvas.width, 10);
}

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Função para atualizar obstáculos
function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) { // Aumenta a distância entre os cactos
        let obstacle = {
            x: canvas.width,
            y: canvas.height - 50, // Ajusta a posição dos obstáculos
            width: randomIntFromRange(20, 40),
            height: randomIntFromRange(20, 40)
        };
        obstacles.push(obstacle);
    }

    if (obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
        score++;
    }
}

// Função para detectar colisão
function detectCollision() {
    obstacles.forEach(obstacle => {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            // Colisão detectada
            ambientSound.pause();
            failSound.play();
            alert('Game Over! Score: ' + score);
            document.location.reload();
        }
    });
}

// Função para atualizar o dinossauro
function updateDino() {
    if (dino.grounded && dino.dy === 0 && isJumping) {
        dino.dy = -dino.jumpStrength;
        dino.grounded = false;
    }

    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y + dino.height > canvas.height - 10) {
        dino.y = canvas.height - 10 - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    }
}

// Variável para detectar se o jogador está tentando pular
let isJumping = false;
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isJumping = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isJumping = false;
    }
});

// Função para desenhar o jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawDino();
    drawObstacles();
    drawScore(); // Chama a função para desenhar o score
}

// Função para desenhar a pontuação
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30); // Exibe a pontuação no canto superior esquerdo
}

// Função para atualizar o jogo
function update() {
    updateDino();
    updateObstacles();
    detectCollision();
}

// Função principal do jogo
function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

// Iniciar o loop do jogo somente quando todas as imagens forem carregadas
Promise.all([
    new Promise(resolve => { dinoImg.onload = resolve; }),
    new Promise(resolve => { cactusImg.onload = resolve; }),
    new Promise(resolve => { groundImg.onload = resolve; })
]).then(() => {
    console.log('All images loaded, starting game loop');
    gameLoop();
}).catch(error => {
    console.error('Error loading images:', error);
});
