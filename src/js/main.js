const EMPTY = 0
const FISH = 2
const FINISH = 3
const TRAP = 4
const BEAR = 5

class Maze {
    constructor(grid, initialTime, level) {
        this.grid = grid;
        this.fishCounter = 0;
        this.level = level;
        this.timeRemaining = initialTime;
        this.initialTime = initialTime
        this.startX = 1;
        this.startY = 1;
        this.penguin = new Penguin(this.startX, this.startY)
        this.isGameActive = false;

        document.getElementById("level_info").textContent = parseInt(level) + 1;
    }

    displayMaze() {
        const container = document.getElementById("maze");
        this.grid.forEach((row, i) => {
            row.forEach((element, j) => {
                const divelement = document.createElement("div");
                if (element === EMPTY || element === FISH || element === FINISH || element === TRAP || element === BEAR) {
                    divelement.setAttribute("class", "o");
                    if (element === FISH) {
                        const fish = this.createDomObject(`fish${i}_${j}`, "fish", "fish", "fish.png");
                        divelement.appendChild(fish);
                    } else if (element === FINISH) {
                        divelement.classList.add("finish")
                    } else if (element === TRAP) {
                        const iceTrap = this.createDomObject(`iceTrap${i}_${j}`, "iceTrap", "ice hole", "ice_trap.png");
                        iceTrap.classList.add("hidden");
                        divelement.appendChild(iceTrap);
                    } else if (element === BEAR) {
                        const bear = this.createDomObject(`bear${i}_${j}`, "bear", "bear", "bear.png");
                        bear.classList.add("hidden");
                        divelement.appendChild(bear);
                    }
                } else {
                    divelement.setAttribute("class", "x");
                }
                container.appendChild(divelement);
            })
        })
    }

    createDomObject(id, className, alt, fileName) {
        const img = document.createElement("img");
        img.setAttribute("class", className);
        img.setAttribute("src", `assets/images/${fileName}`);
        img.setAttribute("alt", alt);
        img.setAttribute("id", id);
        return img;
    }

    isFree(row, col) {
        return this.grid[row][col] === EMPTY || this.grid[row][col] === FISH || this.grid[row][col] === FINISH || this.grid[row][col] === TRAP || this.grid[row][col] === BEAR;
    }

    calculateFinalScore() {
        const fishPoints = 50;
        const timeBonus = 5;

        const fishFinalAmount = this.fishCounter * fishPoints;
        const timeLeftAmount = this.timeRemaining * timeBonus;

        return fishFinalAmount + timeLeftAmount;
    }

    resetGame() {
        this.timeRemaining = this.initialTime;
        this.fishCounter = 0;
        document.getElementById("point_info").textContent = this.fishCounter;
        this.penguin.setPosition(this.startX, this.startY);
        document.getElementById("message").style.display = "none";
        document.getElementById("messageContainer").classList.add("hidden");
        document.getElementById("restartButton").style.display = "none";
        document.getElementById("nextLevelBtn").style.display = "none";
        document.querySelectorAll(".iceTrap, .bear").forEach(el => {
            el.classList.add("hidden");
        });
        document.querySelectorAll(".fish").forEach(fish => {
            fish.classList.remove("hidden");
        });
        this.isGameActive = true;
        timer = setInterval(timerHandler, 1000);
        play("bgSound");
        document.getElementById("overlay").style.display = "none";
    }

    finishGame(message) {
        showMessage(message);
        clearInterval(timer);
        this.isGameActive = false;
        stopPlay("bgSound");
        const restartBtn = document.getElementById("restartButton");
        restartBtn.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        restartBtn.onclick = () => {
            restartBtn.classList.add("pressed");
            setTimeout(() => {
                restartBtn.classList.remove("pressed");
                this.resetGame();
            }, 150);
        };
    }

    checkCurrentPosition(row, col) {
        if (this.grid[row][col] === FISH) {
            const fish = document.getElementById(`fish${row}_${col}`);
            if (!fish.classList.contains("hidden")) {
                fish.classList.add("hidden");
                this.fishCounter++;
                const fishScore = document.getElementById("point_info");
                fishScore.textContent = this.fishCounter;
                play("fishEatSound");
                play("yummy");
            }
        }
        if (this.grid[row][col] === TRAP) {
            const iceTrap = document.getElementById(`iceTrap${row}_${col}`);
            iceTrap.classList.remove("hidden");
            showMessage("Oops — you fell into an ice hole! But game continues, hurry up! ❄️🐧")
            setTimeout(() => {
                document.getElementById("message").style.display = "none";
                document.getElementById("messageContainer").classList.add("hidden");
            }, 2000);
            play("iceTrapSound");
            play("oops");
            this.penguin.setPosition(this.startX, this.startY);
        }
        if (this.grid[row][col] === BEAR) {
            const bear = document.getElementById(`bear${row}_${col}`);
            bear.classList.remove("hidden");
            this.finishGame("A polar bear caught you! 🐻💥 Game Over.")
            play("bearSound");
            play("ohNo");
        }
        if (this.grid[row][col] === FINISH && this.timeRemaining > 0) {
            const score = this.calculateFinalScore();
            let msg = "";
            if (score >= 1000) {
                msg = `Waddle on, champ! 🐧 Your final score is ${score}. You're the Emperor of the Ice! 🏆❄️`;
            } else if (score >= 700) {
                msg = `Solid flippers! 🐧 You scored ${score}. A true Arctic Adventurer! 🌨️✨`;
            } else {
                msg = `Your final score is ${score}. Don't slip up — brave hatchlings grow into legends! 🐣❄️ Try again!`;
            }
            this.finishGame(`🎉 Congratulations! 🎉 \n ${msg}`);
            play("congrat");

            const nextBtn = document.getElementById("nextLevelBtn");
            nextBtn.style.display = "block";
            nextBtn.onclick = () => {
                nextBtn.classList.add("pressed");
                setTimeout(() => {
                    nextBtn.classList.remove("pressed");
                    localStorage.setItem("myLevel", parseInt(this.level) + 1);
                    window.location.reload();
                }, 150);
            };
        }
    }
}

class Penguin {
    constructor(row, col) {
        this.width = 25;
        this.height = 25;
        this.row = row;
        this.col = col;
        this.updatedUI();
    }

    updatedUI() {
        const penguinElm = document.getElementById("penguin");
        const positionX = this.col * this.width;
        const positionY = 20 * this.height - this.row * this.height;

        penguinElm.style.left = positionX + "px";
        penguinElm.style.bottom = positionY + "px";
    }

    setPosition(row, col) {
        this.row = row;
        this.col = col;
        this.updatedUI();
    }
    moveLeft() {
        this.col -= 1;
        this.updatedUI();
    }

    moveRight() {
        this.col += 1;
        this.updatedUI();
    }

    moveUp() {
        this.row -= 1;
        this.updatedUI();
    }

    moveDown() {
        this.row += 1;
        this.updatedUI();
    }
}


let level = localStorage.getItem("myLevel");

if (!level) {
    localStorage.setItem("myLevel", 0);
    level = "0";
}

if (parseInt(level) >= games.length) {
    level = games.length - 1;
}

const game = games[parseInt(level)]
const maze = new Maze(game.grid, game.timeRemaining, level);

maze.displayMaze()

let timer;
function timerHandler() {
    maze.timeRemaining--;
    if (maze.timeRemaining > 0) {
        const minutes = Math.floor(maze.timeRemaining / 60).toString().padStart(2, "0");
        const seconds = (maze.timeRemaining % 60).toString().padStart(2, "0");
        const timeRemainingContainer = document.getElementById("time_info");
        timeRemainingContainer.innerText = `${minutes}:${seconds}`;
    } else {
        maze.finishGame("Time’s up! You lost!");
        play("gameOver");
    }
}

function startTimer() {
    if (timer === undefined) {
        timer = setInterval(timerHandler, 1000);
        maze.isGameActive = true;
        play("bgSound");
        document.getElementById("bgSound").volume = 0.2;
    }
}

function showMessage(message) {
    const messageContainer = document.getElementById("message");
    messageContainer.innerText = message;
    messageContainer.style.display = "block";
    const container = document.getElementById("messageContainer");
    container.classList.remove("hidden");
}

function hideMessage() {
    const messageContainer = document.getElementById("message");
    messageContainer.style.display = "none";
    const container = document.getElementById("messageContainer");
    container.classList.add("hidden");
}

function play(selector) {
    const sound = document.getElementById(selector);
    sound.currentTime = 0;
    sound.play();
}

function stopPlay(selector) {
    const sound = document.getElementById(selector);
    sound.pause();
    sound.currentTime = 0;
}

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") {
        startTimer();
        if (maze.isGameActive === false) {
            return;
        }
        if (maze.isFree(maze.penguin.row, maze.penguin.col - 1)) {
            maze.penguin.moveLeft();
            maze.checkCurrentPosition(maze.penguin.row, maze.penguin.col);
        }
    } else if (e.code === "ArrowRight") {
        startTimer();
        if (maze.isGameActive === false) {
            return;
        }
        if (maze.isFree(maze.penguin.row, maze.penguin.col + 1)) {
            maze.penguin.moveRight();
            maze.checkCurrentPosition(maze.penguin.row, maze.penguin.col);
        }
    } else if (e.code === "ArrowUp") {
        startTimer();
        if (maze.isGameActive === false) {
            return;
        }
        if (maze.isFree(maze.penguin.row - 1, maze.penguin.col)) {
            maze.penguin.moveUp();
            maze.checkCurrentPosition(maze.penguin.row, maze.penguin.col);
        }
    } else if (e.code === "ArrowDown") {
        startTimer();
        if (maze.isGameActive === false) {
            return;
        }
        if (maze.isFree(maze.penguin.row + 1, maze.penguin.col)) {
            maze.penguin.moveDown();
            maze.checkCurrentPosition(maze.penguin.row, maze.penguin.col);
        }
    }
})



