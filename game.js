/* =========================================================
   ZOMBIE SURVIVAL GAME
   Main Menu + Levels + Pause + Game Over
========================================================= */


/* =========================================================
   GAME ELEMENTS
========================================================= */

const mainMenu = document.getElementById("main-menu");
const levelMenu = document.getElementById("level-menu");
const instructionsMenu = document.getElementById("instructions-menu");

const gameContainer = document.getElementById("game-container");

const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");

const healthDisplay = document.getElementById("health");
const scoreDisplay = document.getElementById("score");
const zombiesDisplay = document.getElementById("zombies");
const levelDisplay = document.getElementById("current-level");

const pauseBtn = document.getElementById("pause-btn");
const pauseScreen = document.getElementById("pause-screen");
const resumeBtn = document.getElementById("resume-btn");

const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");

const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");

const startGameBtn = document.getElementById("start-game-btn");
const levelsBtn = document.getElementById("levels-btn");
const howToPlayBtn = document.getElementById("how-to-play-btn");

const backMenuBtn = document.getElementById("back-menu-btn");
const backInstructionsBtn =
    document.getElementById("back-instructions-btn");

const levelButtons =
    document.querySelectorAll(".level-btn");


/* =========================================================
   GAME VARIABLES
========================================================= */

let health = 100;
let score = 0;

let currentLevel = 1;

let gameRunning = false;
let gamePaused = false;
let gameOver = false;

let zombies = [];
let bullets = [];

let keys = {};

let playerX = 0;
let playerY = 0;

let gameLoopId = null;

let zombieSpawnTimer = null;


/* =========================================================
   LEVEL SETTINGS
========================================================= */

const levelSettings = {

    1: {
        zombieSpeed: 0.7,
        spawnTime: 1800,
        maxZombies: 5,
        zombiesToNext: 10
    },

    2: {
        zombieSpeed: 1.0,
        spawnTime: 1500,
        maxZombies: 7,
        zombiesToNext: 15
    },

    3: {
        zombieSpeed: 1.3,
        spawnTime: 1200,
        maxZombies: 9,
        zombiesToNext: 20
    },

    4: {
        zombieSpeed: 1.6,
        spawnTime: 950,
        maxZombies: 12,
        zombiesToNext: 25
    },

    5: {
        zombieSpeed: 2.0,
        spawnTime: 750,
        maxZombies: 15,
        zombiesToNext: 999999
    }

};


/* =========================================================
   MAIN MENU
========================================================= */

function showMainMenu() {

    stopGame();

    mainMenu.classList.remove("hidden");

    levelMenu.classList.add("hidden");

    instructionsMenu.classList.add("hidden");

    gameContainer.classList.add("hidden");

}


/* =========================================================
   LEVEL MENU
========================================================= */

function showLevelMenu() {

    mainMenu.classList.add("hidden");

    levelMenu.classList.remove("hidden");

    instructionsMenu.classList.add("hidden");

    gameContainer.classList.add("hidden");

}


/* =========================================================
   HOW TO PLAY MENU
========================================================= */

function showInstructions() {

    mainMenu.classList.add("hidden");

    levelMenu.classList.add("hidden");

    instructionsMenu.classList.remove("hidden");

    gameContainer.classList.add("hidden");

}


/* =========================================================
   START GAME
========================================================= */

function startGame(level = 1) {

    currentLevel = level;

    health = 100;

    score = 0;

    gameOver = false;

    gamePaused = false;

    gameRunning = true;

    clearZombies();

    clearBullets();

    mainMenu.classList.add("hidden");

    levelMenu.classList.add("hidden");

    instructionsMenu.classList.add("hidden");

    gameContainer.classList.remove("hidden");

    pauseScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    updateDisplays();

    resetPlayerPosition();

    startZombieSpawner();

    startGameLoop();

}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

    startGame(currentLevel);

}


/* =========================================================
   STOP GAME
========================================================= */

function stopGame() {

    gameRunning = false;

    gamePaused = false;

    clearInterval(zombieSpawnTimer);

    cancelAnimationFrame(gameLoopId);

    clearZombies();

    clearBullets();

}


/* =========================================================
   RESET PLAYER
========================================================= */

function resetPlayerPosition() {

    playerX =
        (gameArea.clientWidth - player.offsetWidth) / 2;

    playerY =
        (gameArea.clientHeight - player.offsetHeight) / 2;

    updatePlayerPosition();

}


/* =========================================================
   UPDATE PLAYER POSITION
========================================================= */

function updatePlayerPosition() {

    player.style.left = playerX + "px";

    player.style.top = playerY + "px";

}


/* =========================================================
   KEYBOARD INPUT
========================================================= */

document.addEventListener("keydown", function(event) {

    keys[event.key.toLowerCase()] = true;


    /* Pause with P */

    if (
        event.key.toLowerCase() === "p" &&
        gameRunning &&
        !gameOver
    ) {

        togglePause();

    }


    /* Escape also pauses */

    if (
        event.key === "Escape" &&
        gameRunning &&
        !gameOver
    ) {

        togglePause();

    }

});


document.addEventListener("keyup", function(event) {

    keys[event.key.toLowerCase()] = false;

});


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function movePlayer() {

    if (!gameRunning || gamePaused || gameOver) {
        return;
    }


    const speed = 5;


    /* W / Arrow Up */

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        playerY -= speed;

    }


    /* S / Arrow Down */

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        playerY += speed;

    }


    /* A / Arrow Left */

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        playerX -= speed;

    }


    /* D / Arrow Right */

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        playerX += speed;

    }


    /* Keep player inside game */

    const maxX =
        gameArea.clientWidth - player.offsetWidth;

    const maxY =
        gameArea.clientHeight - player.offsetHeight;


    if (playerX < 0) {
        playerX = 0;
    }


    if (playerY < 0) {
        playerY = 0;
    }


    if (playerX > maxX) {
        playerX = maxX;
    }


    if (playerY > maxY) {
        playerY = maxY;
    }


    updatePlayerPosition();

}


/* =========================================================
   GAME LOOP
========================================================= */

function startGameLoop() {

    cancelAnimationFrame(gameLoopId);


    function loop() {

        if (gameRunning && !gamePaused && !gameOver) {

            movePlayer();

            moveZombies();

            moveBullets();

            checkZombieCollisions();

            checkBulletCollisions();

        }


        gameLoopId =
            requestAnimationFrame(loop);

    }


    loop();

}


/* =========================================================
   ZOMBIE SPAWNER
========================================================= */

function startZombieSpawner() {

    clearInterval(zombieSpawnTimer);


    const settings =
        levelSettings[currentLevel];


    zombieSpawnTimer = setInterval(function() {

        if (
            !gameRunning ||
            gamePaused ||
            gameOver
        ) {

            return;

        }


        if (
            zombies.length <
            settings.maxZombies
        ) {

            spawnZombie();

        }

    }, settings.spawnTime);

}


/* =========================================================
   SPAWN ZOMBIE
========================================================= */

function spawnZombie() {

    const zombie =
        document.createElement("div");


    zombie.classList.add("zombie");

    zombie.textContent = "🧟";


    const size = 45;


    let x;
    let y;


    /* Spawn randomly around edges */

    const side =
        Math.floor(Math.random() * 4);


    if (side === 0) {

        x = Math.random() *
            (gameArea.clientWidth - size);

        y = 0;

    }

    else if (side === 1) {

        x = gameArea.clientWidth - size;

        y = Math.random() *
            (gameArea.clientHeight - size);

    }

    else if (side === 2) {

        x = Math.random() *
            (gameArea.clientWidth - size);

        y = gameArea.clientHeight - size;

    }

    else {

        x = 0;

        y = Math.random() *
            (gameArea.clientHeight - size);

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


/* =========================================================
   MOVE ZOMBIES
========================================================= */

function moveZombies() {

    const settings =
        levelSettings[currentLevel];


    zombies.forEach(function(zombie) {

        const dx =
            playerX - zombie.x;

        const dy =
            playerY - zombie.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > 0) {

            zombie.x +=
                (dx / distance) *
                settings.zombieSpeed;

            zombie.y +=
                (dy / distance) *
                settings.zombieSpeed;

        }


        zombie.element.style.left =
            zombie.x + "px";

        zombie.element.style.top =
            zombie.y + "px";


        /* Zombie touches player */

        if (
            isColliding(
                player,
                zombie.element
            )
        ) {

            damagePlayer(zombie);

        }

    });

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(zombie) {

    health -= 1;


    if (health < 0) {
        health = 0;
    }


    healthDisplay.textContent =
        health;


    /* Push zombie away */

    const dx =
        zombie.x - playerX;

    const dy =
        zombie.y - playerY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        ) || 1;


    zombie.x +=
        (dx / distance) * 20;

    zombie.y +=
        (dy / distance) * 20;


    if (health <= 0) {

        endGame();

    }

}


/* =========================================================
   SHOOTING
========================================================= */

gameArea.addEventListener(
    "click",
    function(event) {

        if (
            !gameRunning ||
            gamePaused ||
            gameOver
        ) {

            return;

        }


        shoot(event);

    }
);


/* =========================================================
   CREATE BULLET
========================================================= */

function shoot(event) {

    const rect =
        gameArea.getBoundingClientRect();


    const targetX =
        event.clientX - rect.left;


    const targetY =
        event.clientY - rect.top;


    const playerCenterX =
        playerX + player.offsetWidth / 2;


    const playerCenterY =
        playerY + player.offsetHeight / 2;


    const dx =
        targetX - playerCenterX;

    const dy =
        targetY - playerCenterY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) {
        return;
    }


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


/* =========================================================
   MOVE BULLETS
========================================================= */

function moveBullets() {

    const bulletSpeed = 10;


    bullets.forEach(function(bullet) {

        bullet.x +=
            bullet.dx * bulletSpeed;

        bullet.y +=
            bullet.dy * bulletSpeed;


        bullet.element.style.left =
            bullet.x + "px";

        bullet.element.style.top =
            bullet.y + "px";

    });


    /* Remove bullets outside game */

    bullets =
        bullets.filter(function(bullet) {

            if (
                bullet.x < -20 ||
                bullet.x > gameArea.clientWidth + 20 ||
                bullet.y < -20 ||
                bullet.y > gameArea.clientHeight + 20
            ) {

                bullet.element.remove();

                return false;

            }


            return true;

        });

}


/* =========================================================
   BULLET / ZOMBIE COLLISION
========================================================= */

function checkBulletCollisions() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        for (
            let j = zombies.length - 1;
            j >= 0;
            j--
        ) {

            const zombie =
                zombies[j];


            if (
                isColliding(
                    bullet.element,
                    zombie.element
                )
            ) {

                /* Remove bullet */

                bullet.element.remove();

                bullets.splice(i, 1);


                /* Remove zombie */

                zombie.element.remove();

                zombies.splice(j, 1);


                /* Increase score */

                score += 10;

                scoreDisplay.textContent =
                    score;


                updateZombieCount();


                checkLevelProgress();


                break;

            }

        }

    }

}


/* =========================================================
   ZOMBIE COLLISIONS
========================================================= */

function checkZombieCollisions() {

    /* Collision is handled while zombies move */

}


/* =========================================================
   COLLISION FUNCTION
========================================================= */

function isColliding(
    element1,
    element2
) {

    const rect1 =
        element1.getBoundingClientRect();

    const rect2 =
        element2.getBoundingClientRect();


    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );

}


/* =========================================================
   LEVEL PROGRESS
========================================================= */

function checkLevelProgress() {

    const settings =
        levelSettings[currentLevel];


    const requiredScore =
        settings.zombiesToNext * 10;


    if (
        currentLevel < 5 &&
        score >= requiredScore
    ) {

        nextLevel();

    }

}


/* =========================================================
   NEXT LEVEL
========================================================= */

function nextLevel() {

    currentLevel++;


    health = Math.min(
        health + 20,
        100
    );


    clearZombies();


    updateDisplays();


    levelDisplay.textContent =
        currentLevel;


    /* Restart zombie spawning */

    startZombieSpawner();


    alert(
        "🎉 Level " +
        currentLevel +
        " Started!"
    );

}


/* =========================================================
   PAUSE / RESUME
========================================================= */

function togglePause() {

    if (
        !gameRunning ||
        gameOver
    ) {

        return;

    }


    if (gamePaused) {

        resumeGame();

    }

    else {

        pauseGame();

    }

}


/* =========================================================
   PAUSE GAME
========================================================= */

function pauseGame() {

    gamePaused = true;

    pauseScreen.classList.remove("hidden");

    pauseBtn.textContent =
        "▶️ Resume Game";

}


/* =========================================================
   RESUME GAME
========================================================= */

function resumeGame() {

    gamePaused = false;

    pauseScreen.classList.add("hidden");

    pauseBtn.textContent =
        "⏸️ Pause Game";

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameOver = true;

    gameRunning = false;

    gamePaused = false;


    clearInterval(zombieSpawnTimer);

    cancelAnimationFrame(gameLoopId);


    finalScoreDisplay.textContent =
        score;


    gameOverScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLEAR ZOMBIES
========================================================= */

function clearZombies() {

    zombies.forEach(function(zombie) {

        zombie.element.remove();

    });


    zombies = [];


    updateZombieCount();

}


/* =========================================================
   CLEAR BULLETS
========================================================= */

function clearBullets() {

    bullets.forEach(function(bullet) {

        bullet.element.remove();

    });


    bullets = [];

}


/* =========================================================
   UPDATE DISPLAYS
========================================================= */

function updateDisplays() {

    healthDisplay.textContent =
        health;

    scoreDisplay.textContent =
        score;

    levelDisplay.textContent =
        currentLevel;

    updateZombieCount();

}


/* =========================================================
   UPDATE ZOMBIE COUNT
========================================================= */

function updateZombieCount() {

    zombiesDisplay.textContent =
        zombies.length;

}


/* =========================================================
   BUTTON EVENTS
========================================================= */


/* Start Game */

startGameBtn.addEventListener(
    "click",
    function() {

        startGame(1);

    }
);


/* Open Level Menu */

levelsBtn.addEventListener(
    "click",
    function() {

        showLevelMenu();

    }
);


/* Open How To Play */

howToPlayBtn.addEventListener(
    "click",
    function() {

        showInstructions();

    }
);


/* Back from Level Menu */

backMenuBtn.addEventListener(
    "click",
    function() {

        showMainMenu();

    }
);


/* Back from Instructions */

backInstructionsBtn.addEventListener(
    "click",
    function() {

        showMainMenu();

    }
);


/* Level buttons */

levelButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const level =
                    Number(
                        button.dataset.level
                    );


                startGame(level);

            }
        );

    }
);


/* Pause */

pauseBtn.addEventListener(
    "click",
    function() {

        togglePause();

    }
);


/* Resume */

resumeBtn.addEventListener(
    "click",
    function() {

        resumeGame();

    }
);


/* Restart */

restartBtn.addEventListener(
    "click",
    function() {

        restartGame();

    }
);


/* Main Menu */

menuBtn.addEventListener(
    "click",
    function() {

        showMainMenu();

    }
);


/* =========================================================
   INITIAL GAME STATE
========================================================= */

showMainMenu();
