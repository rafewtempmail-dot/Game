const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// গেম ভেরিয়েবল
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpPower: 10
};

let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let gameRunning = true;
let pipeGap = 120;
let pipeWidth = 60;
let pipeFrequency = 90;
let frameCount = 0;

// প্রথম সেরা স্কোর দেখান
document.getElementById('bestScore').textContent = bestScore;

// পাইপ তৈরি করা
function createPipe() {
    let topPipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    
    pipes.push({
        x: canvas.width,
        topHeight: topPipeHeight,
        bottomY: topPipeHeight + pipeGap,
        passed: false
    });
}

// বার্ড আপডেট করা
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // মাটিতে পড়লে গেম শেষ
    if (bird.y + bird.height >= canvas.height) {
        endGame();
    }
    
    // উপরে উঠলে গেম শেষ
    if (bird.y <= 0) {
        endGame();
    }
}

// পাইপ আপডেট করা
function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 4;
        
        // পাইপ পার হওয়া চেক করা
        if (pipes[i].x + pipeWidth < bird.x && !pipes[i].passed) {
            pipes[i].passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }
        
        // পুরনো পাইপ সরানো
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// সংঘর্ষ চেক করা
function checkCollision() {
    for (let pipe of pipes) {
        // বার্ড পাইপের মধ্য দিয়ে যাচ্ছে কিনা চেক করা
        if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x) {
            // উপরের পাইপের সাথে সংঘর্ষ
            if (bird.y < pipe.topHeight) {
                endGame();
                return;
            }
            // নিচের পাইপের সাথে সংঘর্ষ
            if (bird.y + bird.height > pipe.bottomY) {
                endGame();
                return;
            }
        }
    }
}

// বার্ড আঁকা
function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // চোখ
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

// পাইপ আঁকা
function drawPipes() {
    ctx.fillStyle = '#4CAF50';
    
    for (let pipe of pipes) {
        // উপরের পাইপ
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // নিচের পাইপ
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        
        // পাইপের সীমানা
        ctx.strokeStyle = '#45a049';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    }
}

// পটভূমি আঁকা
function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// গেম লুপ
function gameLoop() {
    if (!gameRunning) return;
    
    drawBackground();
    updateBird();
    updatePipes();
    checkCollision();
    drawBird();
    drawPipes();
    
    frameCount++;
    if (frameCount % pipeFrequency === 0) {
        createPipe();
    }
    
    requestAnimationFrame(gameLoop);
}

// গেম শেষ
function endGame() {
    gameRunning = false;
    
    // সেরা স্কোর আপডেট করা
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('bestScore').textContent = bestScore;
    }
    
    // গেম ওভার স্ক্রিন দেখানো
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// গেম পুনরায় শুরু করা
function restartGame() {
    bird = {
        x: 50,
        y: canvas.height / 2,
        width: 30,
        height: 30,
        velocity: 0,
        gravity: 0.5,
        jumpPower: 10
    };
    
    pipes = [];
    score = 0;
    gameRunning = true;
    frameCount = 0;
    
    document.getElementById('score').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'none';
    
    gameLoop();
}

// জাম্প কন্ট্রোল
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && gameRunning) {
        event.preventDefault();
        bird.velocity = -bird.jumpPower;
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning) {
        bird.velocity = -bird.jumpPower;
    }
});

// গেম শুরু করা
gameLoop();
