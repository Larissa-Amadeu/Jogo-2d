const assets = {
    background: './img/bg.png',
    clouds: './img/clouds.png',
    dino: './img/crash.gif',
    cactus: './img/obstaculo.png'
};

const screen = {
    width: 1127,
    height: 606
};

const gap = 200;
const generationInterval = 800;

let lastFrame = 0;
let lastGeneration = 0;

let canvasElement = document.querySelector('canvas');
canvasElement.width = screen.width;
canvasElement.height = screen.height;
adjustScreen();
let context = canvasElement.getContext('2d');

const bgMusic = document.getElementById('ambientSound');
bgMusic.volume = 0.9;
const failSound = document.getElementById('failSound');
failSound.volume = 0.9;

class Background {
    constructor() {
        this.image = new Image();
        this.image.src = assets.background;
        this.image.onload = () => {
            this.draw(0);
        };
    }
    draw(delta) {
        context.drawImage(this.image, 0, 0);
    }
}

class Clouds {
    constructor() {
        this.elapsed = 0;
        this.speed = 50;
        this.image = new Image();
        this.repeat = 1;
        this.image.src = assets.clouds;
        this.image.onload = () => {
            this.repeat = Math.ceil(canvasElement.width / this.image.width);
            this.draw(0);
        };
    }
    draw(delta) {
        this.elapsed += delta;
        let offset = this.elapsed * this.speed % this.image.width;
        context.save();
        context.translate(-offset, 0);
        for (let i = 0; i < this.repeat; i++) {
            context.drawImage(this.image, i * this.image.width, 0);
        }
        context.restore();
    }
}

class Ground {
    constructor() {
        this.y = canvasElement.height - 50;
        this.height = 50;
    }
    draw() {
        context.fillStyle = '#f0aceb';
        context.fillRect(0, this.y, canvasElement.width, this.height);
    }
}

class Dino {
    constructor() {
        this.x = 50;
        this.y = canvasElement.height - 90;
        this.width = 100;
        this.height = 100;
        this.dy = 0;
        this.jumpStrength = 19;
        this.gravity = 1.0;
        this.isGrounded = false;
        this.image = new Image();
        this.image.src = assets.dino;
        this.collisionMargin = 15;
    }
    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    update() {
        if (this.isGrounded && this.dy === 0 && isJumping) {
            this.dy = -this.jumpStrength;
            this.isGrounded = false;
        }
        this.dy += this.gravity;
        this.y += this.dy;
        if (this.y + this.height > canvasElement.height - ground.height) {
            this.y = canvasElement.height - ground.height - this.height;
            this.dy = 0;
            this.isGrounded = true;
        }
    }
}

class Cactus {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = assets.cactus;
        this.collisionMargin = 20;
    }
    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    update() {
        this.x -= gameSpeed;
    }
}

let dino = new Dino();
let obstacles = [];
let gameSpeed = 20;
let score = 0;
let isJumping = false;

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.update();
    });

    let currentTime = Date.now();
    if (currentTime - lastGeneration > generationInterval) {
        let obstacleWidth = 140;
        let obstacleHeight = 140;
        let obstacleX = canvasElement.width;
        let obstacleY = canvasElement.height - ground.height - obstacleHeight;
        let obstacle = new Cactus(obstacleX, obstacleY, obstacleWidth, obstacleHeight);
        obstacles.push(obstacle);
        lastGeneration = currentTime;
    }

    if (obstacles.length > 0 && obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
        score++;
    }
}

function detectCollision() {
    obstacles.forEach(obstacle => {
        if (
            dino.x + dino.collisionMargin < obstacle.x + obstacle.width - obstacle.collisionMargin &&
            dino.x + dino.width - dino.collisionMargin > obstacle.x + obstacle.collisionMargin &&
            dino.y + dino.collisionMargin < obstacle.y + obstacle.height - obstacle.collisionMargin &&
            dino.y + dino.height - dino.collisionMargin > obstacle.y + obstacle.collisionMargin
        ) {
            bgMusic.pause();
            failSound.play();
            isGameOver = true;
            cancelAnimationFrame(updateFrameId);
            console.log('Game Over! Score: ' + score);
            document.getElementById('game-over-container').style.display = 'flex';
        }
    });
}

let isGameOver = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        isJumping = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isJumping = false;
    }
});

document.getElementById('play-button').addEventListener('click', () => {
    document.getElementById('main-menu').style.display = 'none';
    canvasElement.style.display = 'block';
    startGame();
});

document.getElementById('retry-button').addEventListener('click', () => {
    document.getElementById('game-over-container').style.display = 'none';
    isGameOver = false;
    score = 0;
    obstacles = [];
    dino = new Dino();
    bgMusic.currentTime = 0;
    bgMusic.play();
    startGame();
});

function update() {
    updateFrameId = requestAnimationFrame(update);
    let now = Date.now();
    let delta = (now - lastFrame) / 1000;
    lastFrame = now;

    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    bg.draw(delta);
    clouds.draw(delta);
    ground.draw();

    dino.update();
    dino.draw();

    updateObstacles();
    obstacles.forEach(obstacle => obstacle.draw());

    if (!isGameOver) {
        detectCollision();
    }

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    context.strokeText('Score: ' + score, 10, 30);
    context.fillText('Score: ' + score, 10, 30);
}

let bg = new Background();
let clouds = new Clouds();
let ground = new Ground();

function adjustScreen() {
    let aspectRatio = screen.width / screen.height;
    let windowRatio = window.innerWidth / window.innerHeight;

    if (aspectRatio < windowRatio) {
        canvasElement.style.width = "auto";
        canvasElement.style.height = window.innerHeight + 'px';
    } else {
        canvasElement.style.height = "auto";
        canvasElement.style.width = window.innerWidth + 'px';
    }
}

function startGame() {
    lastFrame = Date.now();
    updateFrameId = requestAnimationFrame(update);
}

window.addEventListener("resize", adjustScreen);
