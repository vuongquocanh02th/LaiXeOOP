const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');

// Tải hình ảnh
const birdImg = new Image();
const pipeImg = new Image();
const enemyImg = new Image();
const bulletImg = new Image();
const enemyBulletImg = new Image();
const backgroundImg = new Image();

// Đường dẫn hình ảnh
birdImg.src = 'img/helicopter.png';
pipeImg.src = 'img/pipe.png';
enemyImg.src = 'img/vc2.png';
bulletImg.src = 'img/bullet.png';
enemyBulletImg.src = 'img/enemybullet.png';
backgroundImg.src = 'img/war.png';

// Các biến game
const bird = { x: 100, y: 300, width: 100, height: 100, bullets: [] };
const pipes = [];
const enemies = [];
let score = 0;
let isGameRunning = false;
let fixedY = bird.y; // Tầm bay cố định

// Tạo ống và kẻ thù
function createPipe() {
    const pipeHeight = Math.random() * (canvas.height - 300) + 50;
    pipes.push({ x: canvas.width, y: canvas.height - pipeHeight, width: 80, height: pipeHeight });
    enemies.push({ x: canvas.width -20 , y: canvas.height - pipeHeight - 80, width: 100, height: 100, bullets: [] });
}

// Cập nhật trạng thái game
function update() {
    if (!isGameRunning) return;

    // Cập nhật vị trí chim (tầm bay cố định)
    bird.y = fixedY;

    // Cập nhật ống và kẻ thù
    pipes.forEach(pipe => pipe.x -= 3);
    enemies.forEach(enemy => {
        enemy.x -= 3;
        if (Math.random() < 0.02) { // Kẻ thù có khả năng bắn
            enemy.bullets.push({ x: enemy.x, y: enemy.y + 1 });
        }
    });

    // Xóa ống và kẻ thù khi ra khỏi màn hình
    if (pipes.length && pipes[0].x < -pipes[0].width) {
        pipes.shift();
        score++; // Tăng điểm khi ống và kẻ thù ra khỏi màn hình
    }

    // Cập nhật đạn
    updateBullets();
    checkCollisions();
}

// Kiểm tra va chạm
function checkCollisions() {
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x && bird.y + bird.height > canvas.height - pipe.height) {
            endGame(); // Va chạm với ống
        }
    });

    enemies.forEach((enemy, enemyIndex) => {
        if (bird.x < enemy.x + enemy.width && bird.x + bird.width > enemy.x && bird.y < enemy.y + enemy.height && bird.y + bird.height > enemy.y) {
            endGame(); // Va chạm với kẻ thù
        }

        // Kiểm tra va chạm giữa đạn và kẻ thù
        enemy.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < bird.x + bird.width && bullet.x + 10 > bird.x && bullet.y < bird.y + bird.height && bullet.y + 5 > bird.y) {
                endGame(); // Va chạm với đạn kẻ thù
            }
        });
    });
}

// Kết thúc game
function endGame() {
    isGameRunning = false;
    alert('Game Over! Điểm: ' + score);
    document.location.reload();
}

// Vẽ game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height); // Vẽ nền
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.height, pipe.width, pipe.height);
    });

    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.bullets.forEach(bullet => {
            ctx.drawImage(enemyBulletImg, bullet.x, bullet.y, 60, 50);
        });
    });

    bird.bullets.forEach(bullet => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, 60, 50);
    });

    ctx.fillStyle = 'black';
    ctx.fillText('Điểm: ' + score, 10, 20);
}

// Bắn đạn
function shoot() {
    bird.bullets.push({ x: bird.x + bird.width, y: bird.y + bird.height / 2 });
}

// Xử lý phím bấm
document.addEventListener('keydown', (event) => {
    if (!isGameRunning) return;

    switch (event.code) {
        case 'ArrowRight':
            bird.x += 5; // Bay thẳng
            break;
        case 'ArrowLeft':
            bird.x -= 5; // Lùi lại
            break;
        case 'ArrowUp':
            fixedY = Math.max(0, fixedY - 20); // Nâng tầm bay
            break;
        case 'ArrowDown':
            fixedY = Math.min(canvas.height - bird.height, fixedY + 20); // Hạ tầm bay
            break;
        case 'Space':
            shoot(); // Bắn đạn
            break;
    }
});

// Cập nhật đạn
function updateBullets() {
    bird.bullets.forEach((bullet, index) => {
        bullet.x += 5; // Di chuyển đạn

        // Xóa đạn khi ra khỏi màn hình
        if (bullet.x > canvas.width) {
            bird.bullets.splice(index, 1);
        }

        // Kiểm tra va chạm giữa đạn và kẻ thù
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + 20 > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + 10 > enemy.y) {
                enemies.splice(enemyIndex, 1); // Xóa kẻ thù
                bird.bullets.splice(index, 1); // Xóa đạn
                score += 10; // Tăng điểm khi bắn trúng kẻ thù
            }
        });
    });

    // Cập nhật đạn của kẻ thù
    enemies.forEach(enemy => {
        enemy.bullets.forEach((bullet, index) => {
            bullet.x -= 10; // Di chuyển đạn
            if (bullet.x < 0) {
                enemy.bullets.splice(index, 1); // Xóa đạn khi ra khỏi màn hình
            }
        });
    });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Bắt đầu game
playButton.addEventListener('click', () => {
    isGameRunning = true;
    playButton.style.display = 'none';
    canvas.style.display = 'block';
    setInterval(createPipe, 2000); // Tạo ống và kẻ thù mới
    gameLoop();
});
