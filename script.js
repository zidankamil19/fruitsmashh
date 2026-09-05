// ==========================================
// FRUIT SMASH - GAME CONFIG
// ==========================================

// GANTI DENGAN URL GOOGLE APPS SCRIPT KAMU
const API_URL = "PASTE_GOOGLE_APPS_SCRIPT_URL_DI_SINI";


// ==========================================
// ELEMENT
// ==========================================

const screens = document.querySelectorAll(".screen");

const loginScreen =
    document.getElementById("loginScreen");

const gameScreen =
    document.getElementById("gameScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const leaderboardScreen =
    document.getElementById("leaderboardScreen");


const usernameInput =
    document.getElementById("username");

const phoneInput =
    document.getElementById("phone");


const startBtn =
    document.getElementById("startBtn");

const leaderboardBtn =
    document.getElementById("leaderboardBtn");

const leaderboardBtn2 =
    document.getElementById("leaderboardBtn2");

const playAgainBtn =
    document.getElementById("playAgainBtn");

const homeBtn =
    document.getElementById("homeBtn");

const backLeaderboardBtn =
    document.getElementById("backLeaderboardBtn");

const soundBtn =
    document.getElementById("soundBtn");


const gameArea =
    document.getElementById("gameArea");

const effectLayer =
    document.getElementById("effectLayer");


const scoreDisplay =
    document.getElementById("score");

const timeDisplay =
    document.getElementById("time");

const comboDisplay =
    document.getElementById("combo");


const finalScore =
    document.getElementById("finalScore");

const resultUsername =
    document.getElementById("resultUsername");

const scoreMessage =
    document.getElementById("scoreMessage");

const leaderboardList =
    document.getElementById("leaderboardList");


// ==========================================
// GAME DATA
// ==========================================

const fruits = [
    "🍎",
    "🍊",
    "🍉",
    "🍓",
    "🍇",
    "🍍",
    "🥝",
    "🍑",
    "🍒",
    "🍌"
];


let score = 0;

let combo = 0;

let timeLeft = 60;

let gameRunning = false;

let playerName = "";

let playerPhone = "";

let spawnInterval = null;

let timerInterval = null;

let soundEnabled = true;

let audioContext = null;


// ==========================================
// SCREEN FUNCTION
// ==========================================

function showScreen(screen) {

    screens.forEach(item => {

        item.classList.remove("active");

    });

    screen.classList.add("active");

}


// ==========================================
// START BUTTON
// ==========================================

startBtn.addEventListener(
    "click",
    startGame
);


// ==========================================
// START GAME
// ==========================================

function startGame() {

    playerName =
        usernameInput.value.trim();

    playerPhone =
        phoneInput.value.trim();


    if (playerName.length < 2) {

        alert(
            "Username minimal 2 karakter!"
        );

        return;

    }


    if (playerPhone.length < 8) {

        alert(
            "Masukkan nomor WhatsApp yang benar!"
        );

        return;

    }


    initAudio();


    showScreen(gameScreen);

    resetGame();

    startGameLoop();

}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    score = 0;

    combo = 0;

    timeLeft = 60;

    gameRunning = true;


    updateUI();


    gameArea
        .querySelectorAll(
            ".fruit, .bomb, .explosion"
        )
        .forEach(element => element.remove());

}


// ==========================================
// START LOOP
// ==========================================

function startGameLoop() {

    clearInterval(spawnInterval);

    clearInterval(timerInterval);


    // Spawn object
    spawnInterval =
        setInterval(() => {

            if (!gameRunning) return;

            spawnObject();

        }, 650);


    // Spawn pertama
    spawnObject();


    // Timer
    timerInterval =
        setInterval(() => {

            if (!gameRunning) return;

            timeLeft--;

            updateUI();


            if (timeLeft <= 0) {

                endGame();

            }

        }, 1000);

}


// ==========================================
// SPAWN OBJECT
// ==========================================

function spawnObject() {

    const random = Math.random();


    // 82% BUAH
    // 18% BOM

    if (random < 0.82) {

        createFruit();

    } else {

        createBomb();

    }

}


// ==========================================
// RANDOM POSITION
// ==========================================

function getRandomPosition(
    size = 100
) {

    const areaWidth =
        gameArea.clientWidth;

    const areaHeight =
        gameArea.clientHeight;


    const maxX =
        areaWidth - size;

    const maxY =
        areaHeight - size - 70;


    return {

        x:
            Math.max(
                10,
                Math.random() * maxX
            ),

        y:
            Math.max(
                50,
                Math.random() * maxY
            )

    };

}


// ==========================================
// CREATE FRUIT
// ==========================================

function createFruit() {

    if (!gameRunning) return;


    const fruit =
        document.createElement("div");


    fruit.className = "fruit";


    const fruitEmoji =
        fruits[
            Math.floor(
                Math.random()
                * fruits.length
            )
        ];


    fruit.textContent =
        fruitEmoji;


    const position =
        getRandomPosition();


    fruit.style.left =
        position.x + "px";

    fruit.style.top =
        position.y + "px";


    gameArea.appendChild(fruit);


    fruit.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            sliceFruit(
                fruit,
                fruitEmoji
            );

        }
    );


    // Hilang otomatis

    setTimeout(() => {

        if (
            fruit.parentElement &&
            gameRunning
        ) {

            fruit.remove();

            combo = 0;

            updateUI();

        }

    }, 1800);

}


// ==========================================
// SLICE FRUIT
// ==========================================

function sliceFruit(
    fruit,
    emoji
) {

    if (!gameRunning) return;

    if (!fruit.parentElement) return;


    combo++;


    let points = 10;


    // COMBO BONUS

    if (combo >= 5) {

        points += combo * 3;

    }


    score += points;


    updateUI();


    playSliceSound();


    fruit.classList.add("sliced");


    const x =
        fruit.offsetLeft;

    const y =
        fruit.offsetTop;


    createParticles(
        x + 40,
        y + 40,
        emoji
    );


    showScorePopup(
        x,
        y,
        "+" + points,
        false
    );


    setTimeout(() => {

        fruit.remove();

    }, 400);

}


// ==========================================
// CREATE BOMB
// ==========================================

function createBomb() {

    if (!gameRunning) return;


    const bomb =
        document.createElement("div");


    bomb.className = "bomb";

    bomb.textContent = "💣";


    const position =
        getRandomPosition();


    bomb.style.left =
        position.x + "px";

    bomb.style.top =
        position.y + "px";


    gameArea.appendChild(bomb);


    bomb.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            explodeBomb(bomb);

        }
    );


    setTimeout(() => {

        if (bomb.parentElement) {

            bomb.remove();

        }

    }, 2000);

}


// ==========================================
// BOMB EXPLOSION
// ==========================================

function explodeBomb(bomb) {

    if (!gameRunning) return;

    if (!bomb.parentElement) return;


    const x =
        bomb.offsetLeft;

    const y =
        bomb.offsetTop;


    bomb.remove();


    score -= 30;


    if (score < 0) {

        score = 0;

    }


    combo = 0;


    updateUI();


    playExplosionSound();


    // SHAKE SCREEN

    gameArea.classList.add("shake");


    setTimeout(() => {

        gameArea.classList.remove("shake");

    }, 400);


    // EXPLOSION

    const explosion =
        document.createElement("div");


    explosion.className =
        "explosion";

    explosion.textContent =
        "💥";


    explosion.style.left =
        (x - 20) + "px";

    explosion.style.top =
        (y - 20) + "px";


    gameArea.appendChild(explosion);


    showScorePopup(
        x,
        y,
        "-30",
        true
    );


    setTimeout(() => {

        explosion.remove();

    }, 600);

}


// ==========================================
// PARTICLES
// ==========================================

function createParticles(
    x,
    y,
    emoji
) {

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const particle =
            document.createElement("div");


        particle.className =
            "particle";


        particle.textContent =
            emoji;


        particle.style.left =
            x + "px";

        particle.style.top =
            y + "px";


        const moveX =
            (Math.random() - 0.5)
            * 160;

        const moveY =
            (Math.random() - 0.5)
            * 160;


        particle.style.setProperty(
            "--x",
            moveX + "px"
        );

        particle.style.setProperty(
            "--y",
            moveY + "px"
        );


        gameArea.appendChild(
            particle
        );


        setTimeout(() => {

            particle.remove();

        }, 700);

    }

}


// ==========================================
// SCORE POPUP
// ==========================================

function showScorePopup(
    x,
    y,
    text,
    negative
) {

    const popup =
        document.createElement("div");


    popup.className =
        "score-popup";


    if (negative) {

        popup.classList.add(
            "negative-score"
        );

    }


    popup.textContent =
        text;


    popup.style.left =
        x + "px";

    popup.style.top =
        y + "px";


    gameArea.appendChild(popup);


    setTimeout(() => {

        popup.remove();

    }, 800);

}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    scoreDisplay.textContent =
        score;

    timeDisplay.textContent =
        timeLeft;

    comboDisplay.textContent =
        "x" + combo;

}


// ==========================================
// END GAME
// ==========================================

async function endGame() {

    if (!gameRunning) return;


    gameRunning = false;


    clearInterval(
        spawnInterval
    );

    clearInterval(
        timerInterval
    );


    playGameOverSound();


    finalScore.textContent =
        score;

    resultUsername.textContent =
        playerName;


    if (score >= 800) {

        scoreMessage.textContent =
            "👑 LEGENDARY! Kamu Master Fruit Smash!";

    }

    else if (score >= 500) {

        scoreMessage.textContent =
            "🔥 LUAR BIASA! Refleks kamu cepat!";

    }

    else if (score >= 250) {

        scoreMessage.textContent =
            "⭐ Bagus sekali! Terus berlatih!";

    }

    else {

        scoreMessage.textContent =
            "💪 Jangan menyerah, coba lagi!";
    }


    showScreen(
        gameOverScreen
    );


    // SIMPAN KE GOOGLE SHEETS

    saveScoreToGoogleSheets();

}


// ==========================================
// GOOGLE SHEETS SAVE
// ==========================================

async function saveScoreToGoogleSheets() {

    // Jika URL belum diisi

    if (
        API_URL.includes(
            "PASTE_GOOGLE"
        )
    ) {

        console.log(
            "Google Sheets belum dikonfigurasi"
        );

        saveLocalScore();

        return;

    }


    try {

        await fetch(
            API_URL,
            {

                method: "POST",

                mode: "no-cors",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        action:
                            "save",

                        username:
                            playerName,

                        phone:
                            playerPhone,

                        score:
                            score

                    })

            }
        );


        console.log(
            "Score dikirim!"
        );

    }

    catch (error) {

        console.error(
            "Gagal mengirim score:",
            error
        );

        saveLocalScore();

    }

}


// ==========================================
// LOCAL BACKUP
// ==========================================

function saveLocalScore() {

    let scores =
        JSON.parse(
            localStorage.getItem(
                "fruitSmashScores"
            )
        ) || [];


    scores.push({

        username:
            playerName,

        score:
            score

    });


    scores.sort(
        (a, b) =>
            b.score - a.score
    );


    scores =
        scores.slice(0, 10);


    localStorage.setItem(
        "fruitSmashScores",
        JSON.stringify(scores)
    );

}


// ==========================================
// LEADERBOARD BUTTON
// ==========================================

leaderboardBtn.addEventListener(
    "click",
    showLeaderboard
);

leaderboardBtn2.addEventListener(
    "click",
    showLeaderboard
);


// ==========================================
// SHOW LEADERBOARD
// ==========================================

async function showLeaderboard() {

    showScreen(
        leaderboardScreen
    );


    leaderboardList.innerHTML =
        `
        <p class="loading">
            ⏳ Memuat pemain terbaik...
        </p>
        `;


    // Jika belum ada API
    // gunakan local storage

    if (
        API_URL.includes(
            "PASTE_GOOGLE"
        )
    ) {

        loadLocalLeaderboard();

        return;

    }


    try {

        const response =
            await fetch(
                API_URL +
                "?action=leaderboard"
            );


        const data =
            await response.json();


        renderLeaderboard(
            data
        );

    }

    catch (error) {

        console.error(error);

        loadLocalLeaderboard();

    }

}


// ==========================================
// LOCAL LEADERBOARD
// ==========================================

function loadLocalLeaderboard() {

    const data =
        JSON.parse(
            localStorage.getItem(
                "fruitSmashScores"
            )
        ) || [];


    renderLeaderboard(data);

}


// ==========================================
// RENDER LEADERBOARD
// ==========================================

function renderLeaderboard(data) {

    leaderboardList.innerHTML = "";


    if (!data || data.length === 0) {

        leaderboardList.innerHTML =
            `
            <p class="loading">
                Belum ada pemain!<br>
                Jadilah yang pertama! 🎮
            </p>
            `;

        return;

    }


    data.forEach(
        (player, index) => {

            let medal = "🏅";


            if (index === 0)
                medal = "🥇";

            else if (index === 1)
                medal = "🥈";

            else if (index === 2)
                medal = "🥉";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "leaderboard-row";


            row.innerHTML =
                `
                <span>
                    ${medal}
                    #${index + 1}
                </span>

                <span>
                    ${escapeHTML(
                        player.username
                    )}
                </span>

                <span>
                    ⭐ ${player.score}
                </span>
                `;


            leaderboardList.appendChild(
                row
            );

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==========================================
// PLAY AGAIN
// ==========================================

playAgainBtn.addEventListener(
    "click",
    () => {

        showScreen(gameScreen);

        resetGame();

        startGameLoop();

    }
);


// ==========================================
// HOME
// ==========================================

homeBtn.addEventListener(
    "click",
    () => {

        showScreen(loginScreen);

    }
);


backLeaderboardBtn.addEventListener(
    "click",
    () => {

        showScreen(loginScreen);

    }
);


// ==========================================
// SOUND SYSTEM
// WEB AUDIO API
// ==========================================

function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }

}


// ==========================================
// SOUND TOGGLE
// ==========================================

soundBtn.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;


        soundBtn.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }
);


// ==========================================
// GENERATE SOUND
// ==========================================

function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.1
) {

    if (!soundEnabled) return;

    if (!audioContext) return;


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type = type;

    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        duration
    );


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration
    );

}


// ==========================================
// SLICE SOUND
// ==========================================

function playSliceSound() {

    playTone(
        700,
        0.08,
        "square",
        0.08
    );


    setTimeout(() => {

        playTone(
            1000,
            0.1,
            "sine",
            0.06
        );

    }, 50);

}


// ==========================================
// EXPLOSION SOUND
// ==========================================

function playExplosionSound() {

    playTone(
        100,
        0.4,
        "sawtooth",
        0.15
    );


    playTone(
        60,
        0.5,
        "square",
        0.08
    );

}


// ==========================================
// GAME OVER SOUND
// ==========================================

function playGameOverSound() {

    const notes =
        [500, 400, 300];


    notes.forEach(
        (note, index) => {

            setTimeout(() => {

                playTone(
                    note,
                    0.2,
                    "sine",
                    0.1
                );

            }, index * 180);

        }
    );

          }
