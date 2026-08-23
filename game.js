// ================================
// ZOMBIE SURVIVAL GAME
// ================================


// ================================
// GET HTML ELEMENTS
// ================================

const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");

const healthDisplay = document.getElementById("health");
const scoreDisplay = document.getElementById("score");
const zombiesDisplay = document.getElementById("zombies");

const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const restartButton = document.getElementById("restart-btn");

// Pause elements
const pauseButton = document.getElementById("pause-btn");
const pauseScreen = document.getElementById("pause-screen");
const resumeButton = document.getElementById("resume-btn");


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

// NEW: Pause variable
let isPaused = false;

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

    // NEW: Make sure game starts unpaused
    isPaused = false;

    healthDisplay.textContent = health;
    scoreDisplay.textContent = score;

    gameOverScreen.classList.add("hidden");

    // Hide pause screen
    if (pauseScreen) {
        pauseScreen.classList.add("hidden");
    }

    // Reset pause button
    if (pauseButton) {
        pauseButton.textContent = "⏸️ Pause Game";
    }


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
// PAUSE GAME
// ================================

function pauseGame() {

    // Don't pause if game is already over
    if (!gameRunning) return;

    // Don't pause twice
    if (isPaused) return;

    isPaused = true;

    // Show pause screen
    if (pauseScreen) {
        pauseScreen.classList.remove("hidden");
    }

    // Change button text
    if (pauseButton) {
        pauseButton.textContent = "▶️ Resume Game";
    }

}


// ================================
// RESUME GAME
// ================================

function resumeGame() {

    // Don't resume if game is over
    if (!gameRunning) return;

    if (!isPaused) return;

    isPaused = false;

    // Hide pause screen
    if (pauseScreen) {
        pauseScreen.classList.add("hidden");
    }

    // Change button text
    if (pauseButton) {
        pauseButton.textContent = "⏸️ Pause Game";
    }

}


// ================================
// PAUSE BUTTON
// ================================

if (pauseButton) {

    pauseButton.addEventListener("click", function() {

        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }

    });

}


// ================================
// RESUME BUTTON
// ================================

if (resumeButton) {

    resumeButton.addEventListener("click", function() {

        resumeGame();

    });

}


// ================================
// KEYBOARD CONTROLS
// ================================

document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    // Press P to pause/resume
    if (key === "p") {

        if (gameRunning) {

            if (isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }

        }

        return;
    }


    // Don't add movement keys while paused
    if (isPaused) return;

    keys[key] = true;

});


document.addEventListener("keyup", function(event) {

    keys[event.key.toLowerCase()] = false;

});


// ================================
// PLAYER MOVEMENT
// ================================

function movePlayer() {

    // NEW: Stop movement when paused
    if (!gameRunning || isPaused) return;


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

    // NEW: Don't create zombies while paused
    if (!gameRunning || isPaused) return;


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

    // NEW: Stop zombies while paused
    if (!gameRunning || isPaused) return;


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

            healthDisplay.textContent =
                Math.max(0, Math.floor(health));


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

    // NEW: Can't shoot while paused
    if (!gameRunning || isPaused) return;


    const rect = gameArea.getBoundingClientRect();

    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;


    const playerCenterX =
        playerX + player.offsetWidth / 2;

    const playerCenterY =
        playerY + player.offsetHeight / 2;


    const dx = targetX - playerCenterX;
    const dy = targetY - playerCenterY;


    const distance =
        Math.sqrt(dx * dx + dy * dy);


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

    // NEW: Stop bullets while paused
    if (!gameRunning || isPaused) return;


    bullets.forEach((bullet, bulletIndex) => {

        bullet.x += bullet.dx * 10;
        bullet.y += bullet.dy * 10;


        bullet.element.style.left =
            bullet.x + "px";

        bullet.element.style.top =
            bullet.y + "px";


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

                Math.pow(
                    bullet.x - zombie.x - 22,
                    2
                ) +

                Math.pow(
                    bullet.y - zombie.y - 22,
                    2
                )

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

    zombiesDisplay.textContent =
        zombies.length;

}


// ================================
// GAME OVER
// ================================

function endGame() {

    gameRunning = false;

    // NEW: Remove pause state
    isPaused = false;

    // Hide pause screen
    if (pauseScreen) {
        pauseScreen.classList.add("hidden");
    }


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

    // Zombies will NOT spawn while paused
    if (gameRunning && !isPaused) {

        createZombie();

    }

}, 1500);


// ================================
// START GAME
// ================================

startGame();

gameLoop();


// ================================
// MOBILE TOUCH CONTROLS
// ================================

const mobileControls = {

    up: document.getElementById("up-btn"),
    down: document.getElementById("down-btn"),
    left: document.getElementById("left-btn"),
    right: document.getElementById("right-btn"),
    fire: document.getElementById("fire-btn")

};


// ================================
// MOBILE MOVEMENT
// ================================

function setupMobileButton(button, key) {

    if (!button) return;


    // Touch start
    button.addEventListener("touchstart", function(event) {

        event.preventDefault();
        event.stopPropagation();

        // Don't move while paused
        if (isPaused || !gameRunning) return;

        keys[key] = true;

    }, { passive: false });


    // Touch end
    button.addEventListener("touchend", function(event) {

        event.preventDefault();
        event.stopPropagation();

        keys[key] = false;

    }, { passive: false });


    // Touch cancelled
    button.addEventListener("touchcancel", function(event) {

        keys[key] = false;

    });


    // Also support mouse
    button.addEventListener("mousedown", function(event) {

        event.preventDefault();

        // Don't move while paused
        if (isPaused || !gameRunning) return;

        keys[key] = true;

    });


    button.addEventListener("mouseup", function() {

        keys[key] = false;

    });


    button.addEventListener("mouseleave", function() {

        keys[key] = false;

    });

}


// Setup movement buttons

setupMobileButton(
    mobileControls.up,
    "arrowup"
);

setupMobileButton(
    mobileControls.down,
    "arrowdown"
);

setupMobileButton(
    mobileControls.left,
    "arrowleft"
);

setupMobileButton(
    mobileControls.right,
    "arrowright"
);


// ================================
// MOBILE FIRE BUTTON
// ================================

function mobileShoot() {

    // NEW: Can't shoot while paused
    if (!gameRunning || isPaused) return;


    // If there are no zombies, do nothing
    if (zombies.length === 0) return;


    const playerCenterX =
        playerX + player.offsetWidth / 2;

    const playerCenterY =
        playerY + player.offsetHeight / 2;


    // Find nearest zombie

    let nearestZombie = null;
    let nearestDistance = Infinity;


    zombies.forEach(function(zombie) {

        const dx =
            zombie.x - playerCenterX;

        const dy =
            zombie.y - playerCenterY;


        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance < nearestDistance) {

            nearestDistance = distance;
            nearestZombie = zombie;

        }

    });


    if (!nearestZombie) return;


    // Direction toward zombie

    const dx =
        nearestZombie.x - playerCenterX;

    const dy =
        nearestZombie.y - playerCenterY;


    const distance =
        Math.sqrt(dx * dx + dy * dy);


    if (distance === 0) return;


    // Create bullet

    const bullet =
        document.createElement("div");

    bullet.classList.add("bullet");

    bullet.style.left =
        playerCenterX + "px";

    bullet.style.top =
        playerCenterY + "px";


    gameArea.appendChild(bullet);


    bullets.push({

        element: bullet,

        x: playerCenterX,

        y: playerCenterY,

        dx: dx / distance,

        dy: dy / distance

    });

}


// ================================
// MOBILE FIRE BUTTON
// ================================

if (mobileControls.fire) {

    mobileControls.fire.addEventListener(
        "touchstart",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            if (!isPaused) {
                mobileShoot();
            }

        },
        { passive: false }
    );


    mobileControls.fire.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            if (!isPaused) {
                mobileShoot();
            }

        }
    );

}
