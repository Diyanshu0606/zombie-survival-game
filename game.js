// ================================
// ZOMBIE SURVIVAL GAME
// ================================

// Get HTML elements
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");

const healthDisplay = document.getElementById("health");
const scoreDisplay = document.getElementById("score");
const zombiesDisplay = document.getElementById("zombies");

const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const restartButton = document.getElementById("restart-btn");


// ================================
// GAME VARIABLES
// ================================

let playerX = 0;
let playerY = 0;

let health = 100;
let score = 0;

let zombies = [];
let bullets = [];

let keys = {};

let gameRunning = true;

let playerSpeed = 5;
let zombieSpeed = 1;


// ================================
// PLAYER POSITION
// ================================

function setPlayerPosition() {
    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}


// ================================
// START GAME
// ================================

function startGame() {

    playerX = gameArea.clientWidth / 2 - 22;
    playerY = gameArea.clientHeight / 2 - 22;

    health = 100;
    score = 0;

    zombies = [];
    bullets = [];

    gameRunning = true;

    healthDisplay.textContent = health;
    scoreDisplay.textContent = score;

    gameOverScreen.classList.add("hidden");

    // Remove old zombies
    document.querySelectorAll(".zombie").forEach(zombie => {
        zombie.remove();
    });

    // Remove old bullets
    document.querySelectorAll(".bullet").forEach(bullet => {
        bullet.remove();
    });

    setPlayerPosition();

    updateZombieCount();
}


// ================================
// KEYBOARD CONTROLS
// ================================

document.addEventListener("keydown", function(event) {

    keys[event.key.toLowerCase()] = true;

});


document.addEventListener("keyup", function(event) {

    keys[event.key.toLowerCase()] = false;

});


// ================================
// PLAYER MOVEMENT
// ================================

function movePlayer() {

    if (!gameRunning) return;

    // W or Arrow Up
    if (keys["w"] || keys["arrowup"]) {
        playerY -= playerSpeed;
    }

    // S or Arrow Down
    if (keys["s"] || keys["arrowdown"]) {
        playerY += playerSpeed;
    }

    // A or Arrow Left
    if (keys["a"] || keys["arrowleft"]) {
        playerX -= playerSpeed;
    }

    // D or Arrow Right
    if (keys["d"] || keys["arrowright"]) {
        playerX += playerSpeed;
    }


    // Keep player inside game area

    const maxX = gameArea.clientWidth - player.offsetWidth;
    const maxY = gameArea.clientHeight - player.offsetHeight;

    playerX = Math.max(0, Math.min(playerX, maxX));
    playerY = Math.max(0, Math.min(playerY, maxY));

    setPlayerPosition();
}


// ================================
// CREATE ZOMBIE
// ================================

function createZombie() {

    if (!gameRunning) return;

    const zombie = document.createElement("div");

    zombie.classList.add("zombie");

    zombie.textContent = "🧟";

    // Choose random side
    const side = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (side === 0) {
        // Top
        x = Math.random() * gameArea.clientWidth;
        y = 0;
    }

    else if (side === 1) {
        // Right
        x = gameArea.clientWidth - 45;
        y = Math.random() * gameArea.clientHeight;
    }

    else if (side === 2) {
        // Bottom
        x = Math.random() * gameArea.clientWidth;
        y = gameArea.clientHeight - 45;
    }

    else {
        // Left
        x = 0;
        y = Math.random() * gameArea.clientHeight;
    }


    zombie.style.left = x + "px";
    zombie.style.top = y + "px";

    gameArea.appendChild(zombie);

    zombies.push({
        element: zombie,
        x: x,
        y: y
    });

    updateZombieCount();
}


// ================================
// MOVE ZOMBIES
// ================================

function moveZombies() {

    if (!gameRunning) return;

    zombies.forEach((zombie, index) => {

        const dx = playerX - zombie.x;
        const dy = playerY - zombie.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {

            zombie.x += (dx / distance) * zombieSpeed;
            zombie.y += (dy / distance) * zombieSpeed;

        }

        zombie.element.style.left = zombie.x + "px";
        zombie.element.style.top = zombie.y + "px";


        // Zombie touches player
        if (distance < 40) {

            health -= 0.5;

            healthDisplay.textContent = Math.max(0, Math.floor(health));

            if (health <= 0) {
                endGame();
            }

        }

    });

}


// ================================
// SHOOT BULLET
// ================================

gameArea.addEventListener("click", function(event) {

    if (!gameRunning) return;

    const rect = gameArea.getBoundingClientRect();

    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;

    const playerCenterX = playerX + player.offsetWidth / 2;
    const playerCenterY = playerY + player.offsetHeight / 2;

    const dx = targetX - playerCenterX;
    const dy = targetY - playerCenterY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const bullet = document.createElement("div");

    bullet.classList.add("bullet");

    bullet.style.left = playerCenterX + "px";
    bullet.style.top = playerCenterY + "px";

    gameArea.appendChild(bullet);

    bullets.push({
        element: bullet,
        x: playerCenterX,
        y: playerCenterY,
        dx: dx / distance,
        dy: dy / distance
    });

});


// ================================
// MOVE BULLETS
// ================================

function moveBullets() {

    if (!gameRunning) return;

    bullets.forEach((bullet, bulletIndex) => {

        bullet.x += bullet.dx * 10;
        bullet.y += bullet.dy * 10;

        bullet.element.style.left = bullet.x + "px";
        bullet.element.style.top = bullet.y + "px";


        // Remove bullet outside game
        if (
            bullet.x < 0 ||
            bullet.x > gameArea.clientWidth ||
            bullet.y < 0 ||
            bullet.y > gameArea.clientHeight
        ) {

            bullet.element.remove();

            bullets.splice(bulletIndex, 1);

            return;
        }


        // Check collision with zombies
        zombies.forEach((zombie, zombieIndex) => {

            const distance = Math.sqrt(
                Math.pow(bullet.x - zombie.x - 22, 2) +
                Math.pow(bullet.y - zombie.y - 22, 2)
            );


            if (distance < 30) {

                // Remove zombie
                zombie.element.remove();

                zombies.splice(zombieIndex, 1);

                // Remove bullet
                bullet.element.remove();

                bullets.splice(bulletIndex, 1);

                // Increase score
                score += 10;

                scoreDisplay.textContent = score;

                updateZombieCount();

            }

        });

    });

}


// ================================
// UPDATE ZOMBIE COUNT
// ================================

function updateZombieCount() {

    zombiesDisplay.textContent = zombies.length;

}


// ================================
// GAME OVER
// ================================

function endGame() {

    gameRunning = false;

    finalScoreDisplay.textContent = score;

    gameOverScreen.classList.remove("hidden");

}


// ================================
// RESTART GAME
// ================================

restartButton.addEventListener("click", function() {

    startGame();

});


// ================================
// GAME LOOP
// ================================

function gameLoop() {

    movePlayer();

    moveZombies();

    moveBullets();

    requestAnimationFrame(gameLoop);

}


// ================================
// CREATE ZOMBIES AUTOMATICALLY
// ================================

setInterval(function() {

    if (gameRunning) {
        createZombie();
    }

}, 1500);


// ================================
// START GAME
// ================================

startGame();

gameLoop();
