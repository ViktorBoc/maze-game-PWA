const canvas = document.getElementById("canvas_hra");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const solutionBtn = document.getElementById("solution");
const difficultySelect = document.getElementById("difficulty");
const timerDisplay = document.getElementById("timer");
const colorBall = document.getElementById("color-ball");
const completionModal = new bootstrap.Modal(document.getElementById("completionModal"));
const gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));
const completionTime = document.getElementById("completion-time");

let mazes = {};
let currentMaze = null;
let ball = { x: 0, y: 0, color: "orange" };
let gameRunning = false;
let completedMazes = JSON.parse(localStorage.getItem("completedMazes")) || { easy: [], hard: [] };
let solutionPath = [];
let animationFrameId;
let cellSize = 20;
let timer = 0;
let timerInterval;

// Load mazes
fetch("src/json/mazes.json")
    .then(response => response.json())
    .then(data => {
        mazes = {
            easy: data.mazesEasy,
            hard: data.mazesHard
        };
        initGame();
    });

// Initialize game
function initGame() {
    selectRandomMaze();
    resetBall();
    draw();
    startBtn.disabled = false;
}

// Select random maze
function selectRandomMaze() {
    const difficulty = difficultySelect.value;
    const availableMazes = mazes[difficulty].filter(maze => !completedMazes[difficulty].includes(maze.id));
    if (availableMazes.length === 0) {
        completedMazes[difficulty] = [];
        localStorage.setItem("completedMazes", JSON.stringify(completedMazes));
        return selectRandomMaze();
    }
    currentMaze = availableMazes[Math.floor(Math.random() * availableMazes.length)];
    const width = currentMaze.map[0].length;
    const height = currentMaze.map.length;
    cellSize = difficulty === "easy" ? 40 : 30;
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    solutionPath = findPath(currentMaze);
}

// Find start position
function findStartPosition(map) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 2) {
                return { x, y };
            }
        }
    }
    return { x: 0, y: 0 };
}

// Reset ball position
function resetBall() {
    const start = findStartPosition(currentMaze.map);
    ball.x = start.x * cellSize + cellSize / 2;
    ball.y = start.y * cellSize + cellSize / 2;
    colorBall.style.backgroundColor = ball.color;
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < currentMaze.map.length; y++) {
        for (let x = 0; x < currentMaze.map[y].length; x++) {
            if (currentMaze.map[y][x] === 1) {
                ctx.fillStyle = "#495057";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else if (currentMaze.map[y][x] === 3) {
                ctx.fillStyle = "red";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    // Draw solution path if active
    if (solutionBtn.classList.contains("active")) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < solutionPath.length; i++) {
            ctx[i === 0 ? "moveTo" : "lineTo"](solutionPath[i].x * cellSize + cellSize / 2, solutionPath[i].y * cellSize + cellSize / 2);
        }
        ctx.stroke();
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, cellSize / 4, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();

    if (gameRunning) {
        animationFrameId = requestAnimationFrame(draw);
    }
}

// Find shortest path using BFS
function findPath(maze) {
    const start = findStartPosition(maze.map);
    const queue = [{ x: start.x, y: start.y, path: [{ x: start.x, y: start.y }] }];
    const visited = new Set();
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    while (queue.length > 0) {
        const { x, y, path } = queue.shift();
        if (maze.map[y][x] === 3) {
            return path;
        }
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (
                nx >= 0 && nx < maze.map[0].length &&
                ny >= 0 && ny < maze.map.length &&
                maze.map[ny][nx] !== 1 &&
                !visited.has(`${nx},${ny}`)
            ) {
                visited.add(`${nx},${ny}`);
                queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
            }
        }
    }
    return [];
}

// Check collision
function checkCollision(nx, ny) {
    const cellX = Math.floor(nx / cellSize);
    const cellY = Math.floor(ny / cellSize);
    if (
        cellX < 0 || cellX >= currentMaze.map[0].length ||
        cellY < 0 || cellY >= currentMaze.map.length ||
        currentMaze.map[cellY][cellX] === 1
    ) {
        return true;
    }
    return false;
}

// Start countdown timer
function startTimer() {
    timer = difficultySelect.value === "easy" ? 15 : 20;
    timerDisplay.textContent = `Time: ${timer}s`;
    timerInterval = setInterval(() => {
        if (gameRunning) {
            timer--;
            timerDisplay.textContent = `Time: ${timer}s`;
            if (timer <= 0) {
                gameRunning = false;
                cancelAnimationFrame(animationFrameId);
                stopTimer();
                gameOverModal.show();
                pauseBtn.disabled = true;
                solutionBtn.disabled = true;
                startBtn.disabled = false;
            }
        }
    }, 1000);
}

// Stop timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Keyboard controls
document.addEventListener("keydown", e => {
    if (!gameRunning) return;
    let nx = ball.x;
    let ny = ball.y;
    const step = cellSize;
    if (e.key === "w") ny -= step;
    if (e.key === "s") ny += step;
    if (e.key === "a") nx -= step;
    if (e.key === "d") nx += step;
    if (!checkCollision(nx, ny)) {
        ball.x = nx;
        ball.y = ny;
        checkWin();
    }
});

// Mobile controls
let lastBeta = 0;
let lastGamma = 0;
function phoneGame() {
    window.addEventListener("deviceorientation", e => {
        if (!gameRunning) return;
        const beta = e.beta;
        const gamma = e.gamma;
        if (Math.abs(beta - lastBeta) > 0.5 || Math.abs(gamma - lastGamma) > 0.5) {
            let nx = ball.x + gamma / 10;
            let ny = ball.y + beta / 10;
            if (!checkCollision(nx, ny)) {
                ball.x = nx;
                ball.y = ny;
                checkWin();
            }
            lastBeta = beta;
            lastGamma = gamma;
        }
    });
}

// Request device orientation permission
if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
            if (permissionState === "granted") {
                phoneGame();
            }
        })
        .catch(console.error);
} else {
    phoneGame();
}

// Check win condition
function checkWin() {
    const cellX = Math.floor(ball.x / cellSize);
    const cellY = Math.floor(ball.y / cellSize);
    if (currentMaze.map[cellY][cellX] === 3) {
        gameRunning = false;
        cancelAnimationFrame(animationFrameId);
        stopTimer();
        completedMazes[difficultySelect.value].push(currentMaze.id);
        localStorage.setItem("completedMazes", JSON.stringify(completedMazes));
        completionTime.textContent = `${timer}s`;
        completionModal.show();
        pauseBtn.disabled = true;
        solutionBtn.disabled = true;
        startBtn.disabled = false;
    }
}

// Drag and drop
function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    if (gameRunning) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData("text", "color-ball");
}

function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    if (data === "color-ball" && e.target.classList.contains("dropzone")) {
        ball.color = e.target.dataset.color;
        colorBall.style.backgroundColor = ball.color;
        draw();
    }
}

// Button events
startBtn.addEventListener("click", () => {
    selectRandomMaze();
    resetBall();
    gameRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    solutionBtn.disabled = false;
    solutionBtn.classList.remove("active");
    startTimer();
    draw();
});

pauseBtn.addEventListener("click", () => {
    gameRunning = !gameRunning;
    pauseBtn.textContent = gameRunning ? "Pause" : "Resume";
    if (gameRunning) {
        startTimer();
        draw();
    } else {
        stopTimer();
        cancelAnimationFrame(animationFrameId);
    }
});

solutionBtn.addEventListener("click", () => {
    solutionBtn.classList.toggle("active");
    draw();
});

difficultySelect.addEventListener("change", () => {
    selectRandomMaze();
    resetBall();
    gameRunning = false;
    stopTimer();
    timerDisplay.textContent = `Time: ${difficultySelect.value === "easy" ? 15 : 20}s`;
    pauseBtn.disabled = true;
    solutionBtn.disabled = true;
    startBtn.disabled = false;
    solutionBtn.classList.remove("active");
    draw();
});