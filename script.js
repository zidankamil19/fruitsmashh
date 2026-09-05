// ========================================
// FRUIT SMASH GAME
// ========================================


// MASUKKAN URL GOOGLE APPS SCRIPT DISINI

const API_URL = "MASUKKAN_URL_GOOGLE_APPS_SCRIPT_DISINI";


// ========================================
// ELEMENT
// ========================================

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


// ========================================
// GAME VARIABLES
// ========================================

const fruits = [
    "🍎",
    "🍊",
    "🍉",
    "🍓",
    "🍇",
    "🍍",
    "🍑",
    "🍒",
    "🥝",
    "🍌"
];


let score = 0;
let combo = 0;
let timeLeft = 60;

let gameRunning = false;

let playerName = "";
let playerPhone = "";

let spawnInterval;
let timerInterval;

let soundEnabled = true;
let audioContext = null;


// ========================================
// SHOW SCREEN
// ========================================

function showScreen(screen) {

    screens.forEach(item => {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


// ========================================
// START GAME BUTTON
// ========================================

startBtn.addEventListener("click", startGame);


// ========================================
// START GAME
// ========================================

function startGame() {

    playerName =
        usernameInput.value.trim();

    playerPhone =
        phoneInput.value.trim();


    if (playerName.length < 2) {

        alert("Username minimal 2 karakter!");

        return;
    }


    if (playerPhone.length < 8) {

        alert("Masukkan nomor WhatsApp yang benar!");

        return;
    }


    initAudio();

    showScreen(gameScreen);

    resetGame();

    startGameLoop();
}


// ========================================
// RESET GAME
// ========================================

function resetGame() {

    score = 0;
    combo = 0;
    timeLeft = 60;

    gameRunning = true;


    updateUI();


    gameArea
        .querySelectorAll(
            ".fruit, .bomb, .particle, .explosion, .score-popup"
        )
        .forEach(item => item.remove());
}


// ========================================
// GAME LOOP
// ========================================

function startGameLoop() {

    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    // SPAWN OBJECT

    spawnInterval = setInterval(() => {

        if (!gameRunning) return;

        spawnObject();

    }, 700);


    // SPAWN PERTAMA

    spawnObject();


    // TIMER

    timerInterval = setInterval(() => {

        if (!gameRunning) return;

        timeLeft--;

        updateUI();


        if (timeLeft <= 0) {

            endGame();

        }

    }, 1000);
}


// ========================================
// SPAWN OBJECT
// ========================================

function spawnObject() {

    if (!gameRunning) return;


    const random = Math.random();


    // 80% BUAH
    // 20% BOM

    if (random < 0.80) {

        createFruit();

    } else {

        createBomb();

    }
}


// ========================================
// RANDOM POSITION
// ========================================

function randomPosition() {

    const width =
        gameArea.clientWidth;

    const height =
        gameArea.clientHeight;


    const x =
        Math.random() *
        (width - 90);

    const y =
        70 +
        Math.random() *
        (height - 180);


    return { x, y };
}


// ========================================
// CREATE FRUIT
// ========================================

function createFruit() {

    if (!gameRunning) return;


    const fruit =
        document.createElement("div");


    fruit.className = "fruit";


    const emoji =
        fruits[
            Math.floor(
                Math.random() *
                fruits.length
            )
        ];


    fruit.textContent = emoji;


    const position =
        randomPosition();


    fruit.style.left =
        position.x + "px";

    fruit.style.top =
        position.y + "px";


    gameArea.appendChild(fruit);


    fruit.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            sliceFruit(
                fruit,
                emoji
            );

        }
    );


    // HILANG OTOMATIS

    setTimeout(() => {

        if (
            fruit.parentElement &&
            gameRunning
        ) {

            fruit.remove();

            combo = 0;

            updateUI();

        }

    }, 2000);
}


// ========================================
// SLICE FRUIT
// ========================================

function sliceFruit(
    fruit,
    emoji
) {

    if (!gameRunning) return;

    if (!fruit.parentElement) return;


    combo++;


    let points = 10;


    // BONUS COMBO

    if (combo >= 5) {

        points += combo * 2;

    }


    score += points;


    updateUI();


    playSliceSound();


    const x =
        fruit.offsetLeft;

    const y =
        fruit.offsetTop;


    fruit.classList.add("sliced");


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


// ========================================
// CREATE BOMB
// ========================================

function createBomb() {

    if (!gameRunning) return;


    const bomb =
        document.createElement("div");


    bomb.className = "bomb";

    bomb.textContent = "💣";


    const position =
        randomPosition();


    bomb.style.left =
        position.x + "px";

    bomb.style.top =
        position.y + "px";


    gameArea.appendChild(bomb);


    bomb.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            explodeBomb(bomb);

        }
    );


    setTimeout(() => {

        if (bomb.parentElement) {

            bomb.remove();

        }

    }, 2200);
}


// ========================================
// EXPLODE BOMB
// ========================================

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


    gameArea.classList.add("shake");


    setTimeout(() => {

        gameArea.classList.remove("shake");

    }, 400);


    const explosion =
        document.createElement("div");


    explosion.className =
        "explosion";

    explosion.textContent = "💥";


    explosion.style.left =
        (x - 10) + "px";

    explosion.style.top =
        (y - 10) + "px";


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


// ========================================
// PARTICLES
// ========================================

function createParticles(
    x,
    y,
    emoji
) {

    for (let i = 0; i < 8; i++) {

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
            (Math.random() - 0.5) * 180;

        const moveY =
            (Math.random() - 0.5) * 180;


        particle.style.setProperty(
            "--x",
            moveX + "px"
        );

        particle.style.setProperty(
            "--y",
            moveY + "px"
        );


        gameArea.appendChild(particle);


        setTimeout(() => {

            particle.remove();

        }, 700);
    }
}


// ========================================
// SCORE POPUP
// ========================================

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
        popup.classList.add("negative");
    }


    popup.textContent = text;


    popup.style.left =
        x + "px";

    popup.style.top =
        y + "px";


    gameArea.appendChild(popup);


    setTimeout(() => {

        popup.remove();

    }, 800);
}


// ========================================
// UPDATE UI
// ========================================

function updateUI() {

    scoreDisplay.textContent =
        score;

    timeDisplay.textContent =
        timeLeft;

    comboDisplay.textContent =
        "x" + combo;
}


// ========================================
// END GAME
// ========================================

async function endGame() {

    if (!gameRunning) return;


    gameRunning = false;


    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    playGameOverSound();


    finalScore.textContent =
        score;

    resultUsername.textContent =
        playerName;


    if (score >= 700) {

        scoreMessage.textContent =
            "👑 LEGENDARY! Kamu Master Fruit Smash!";

    }

    else if (score >= 400) {

        scoreMessage.textContent =
            "🔥 LUAR BIASA! Kamu sangat cepat!";

    }

    else if (score >= 200) {

        scoreMessage.textContent =
            "⭐ Bagus! Terus tingkatkan kemampuanmu!";

    }

    else {

        scoreMessage.textContent =
            "💪 Jangan menyerah, coba lagi!";
    }


    showScreen(gameOverScreen);


    // SIMPAN KE GOOGLE SHEETS

    saveScoreToGoogleSheets();
}


// ========================================
// SAVE GOOGLE SHEETS
// ========================================

async function saveScoreToGoogleSheets() {

    // Jika API belum diisi

    if (
        API_URL.includes(
            "MASUKKAN_URL"
        )
    ) {

        console.log(
            "API belum dikonfigurasi"
        );

        saveLocalScore();

        return;
    }


    try {

        await fetch(API_URL, {

            method: "POST",

            mode: "no-cors",

            body: JSON.stringify({

                username:
                    playerName,

                phone:
                    playerPhone,

                score:
                    score

            })

        });


        console.log(
            "Score berhasil dikirim"
        );

    }

    catch (error) {

        console.error(
            "Gagal menyimpan:",
            error
        );


        saveLocalScore();
    }
}


// ========================================
// LOCAL STORAGE BACKUP
// ========================================

function saveLocalScore() {

    let data =
        JSON.parse(
            localStorage.getItem(
                "fruitSmashScores"
            )
        ) || [];


    data.push({

        username:
            playerName,

        score:
            score

    });


    data.sort(
        (a, b) =>
            b.score - a.score
    );


    data = data.slice(0, 10);


    localStorage.setItem(
        "fruitSmashScores",
        JSON.stringify(data)
    );
}


// ========================================
// SHOW LEADERBOARD
// ========================================

leaderboardBtn.addEventListener(
    "click",
    showLeaderboard
);

leaderboardBtn2.addEventListener(
    "click",
    showLeaderboard
);


async function showLeaderboard() {

    showScreen(
        leaderboardScreen
    );


    leaderboardList.innerHTML = `
        <p class="loading">
            ⏳ Memuat leaderboard...
        </p>
    `;


    // Jika API belum diisi
    // gunakan LocalStorage

    if (
        API_URL.includes(
            "MASUKKAN_URL"
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


        const result =
            await response.json();


        console.log(
            "Leaderboard:",
            result
        );


        if (result.success) {

            renderLeaderboard(
                result.data
            );

        }

        else {

            loadLocalLeaderboard();

        }

    }

    catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );


        loadLocalLeaderboard();
    }
}


// ========================================
// LOCAL LEADERBOARD
// ========================================

function loadLocalLeaderboard() {

    const data =
        JSON.parse(
            localStorage.getItem(
                "fruitSmashScores"
            )
        ) || [];


    renderLeaderboard(data);
}


// ========================================
// RENDER LEADERBOARD
// ========================================

function renderLeaderboard(data) {

    leaderboardList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        leaderboardList.innerHTML = `
            <p class="loading">
                🎮 Belum ada pemain!<br>
                Jadilah pemain pertama!
            </p>
        `;

        return;
    }


    data.forEach(
        (player, index) => {

            let medal = "🏅";


            if (index === 0) {
                medal = "🥇";
            }

            else if (index === 1) {
                medal = "🥈";
            }

            else if (index === 2) {
                medal = "🥉";
            }


            const row =
                document.createElement("div");


            row.className =
                "leaderboard-row";


            row.innerHTML = `
                <span>
                    ${medal} #${index + 1}
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


            leaderboardList.appendChild(row);
        }
    );
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "Player";

    return div.innerHTML;
}


// ========================================
// PLAY AGAIN
// ========================================

playAgainBtn.addEventListener(
    "click",
    function() {

        showScreen(gameScreen);

        resetGame();

        startGameLoop();
    }
);


// ========================================
// HOME
// ========================================

homeBtn.addEventListener(
    "click",
    function() {

        showScreen(loginScreen);

    }
);


backLeaderboardBtn.addEventListener(
    "click",
    function() {

        showScreen(loginScreen);

    }
);


// ========================================
// AUDIO
// ========================================

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


// ========================================
// SOUND BUTTON
// ========================================

soundBtn.addEventListener(
    "click",
    function() {

        soundEnabled =
            !soundEnabled;


        soundBtn.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }
);


// ========================================
// PLAY TONE
// ========================================

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


    oscillator.type =
        type;

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


// ========================================
// FRUIT SOUND
// ========================================

function playSliceSound() {

    playTone(
        600,
        0.08,
        "square",
        0.08
    );


    setTimeout(() => {

        playTone(
            1000,
            0.1,
            "sine",
            0.07
        );

    }, 50);
}


// ========================================
// BOMB SOUND
// ========================================

function playExplosionSound() {

    playTone(
        90,
        0.4,
        "sawtooth",
        0.15
    );


    setTimeout(() => {

        playTone(
            50,
            0.4,
            "square",
            0.1
        );

    }, 50);
}


// ========================================
// GAME OVER SOUND
// ========================================

function playGameOverSound() {

    const notes = [
        500,
        400,
        300
    ];


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
