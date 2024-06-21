const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

const menu = document.getElementById('menu');
let playerTeam = '';
let difficulty = 'medium';

document.getElementById('chooseInter').addEventListener('click', () => {
    playerTeam = 'Inter';
});
document.getElementById('chooseGremio').addEventListener('click', () => {
    playerTeam = 'Gremio';
});
document.getElementById('easy').addEventListener('click', () => {
    difficulty = 'easy';
});
document.getElementById('medium').addEventListener('click', () => {
    difficulty = 'medium';
});
document.getElementById('hard').addEventListener('click', () => {
    difficulty = 'hard';
});
document.getElementById('startGame').addEventListener('click', () => {
    if (playerTeam) {
        startGame();
    } else {
        alert('Por favor, escolha um time antes de iniciar o jogo.');
    }
});

function startGame() {
    menu.style.display = 'none';
    canvas.style.display = 'block';

    const paddleWidth = 10;
    const paddleHeight = 100;
    const player = {
        x: 0,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: playerTeam === 'Inter' ? 'RED' : 'BLUE',
        dy: 6,
        score: 0,
        name: playerTeam
    };

    const ai = {
        x: canvas.width - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: playerTeam === 'Inter' ? 'BLUE' : 'RED',
        dy: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9,
        score: 0,
        name: playerTeam === 'Inter' ? 'Grêmio' : 'Inter'
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speed: 7,
        velocityX: 7 * (Math.random() > 0.5 ? 1 : -1),
        velocityY: 7 * (Math.random() * 2 - 1),
        color: 'WHITE',
        hitCount: 0
    };

    const separatorBar = {
        x: 0,
        y: 60,
        width: canvas.width,
        height: 2,
        color: 'WHITE'
    };

    const centerLine = {
        x: canvas.width / 2,
        startY: separatorBar.y + separatorBar.height,
        endY: canvas.height,
        color: 'WHITE'
    };

    let timer = 120;
    let gameOver = false;

    function drawRect(x, y, w, h, color) {
        context.fillStyle = color;
        context.fillRect(x, y, w, h);
    }

    function drawCircle(x, y, r, color) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
    }

    function drawText(text, x, y, color) {
        context.fillStyle = color;
        context.font = '45px Arial';
        context.fillText(text, x, y);
    }

    function drawScore(player) {
        drawText(player.name + ": " + player.score, canvas.width / 4 * (player === ai ? 3 : 1) - 45, 50, 'WHITE');
    }

    function drawTimer() {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        const timeText = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        drawText(timeText, canvas.width / 2 - 40, 50, 'WHITE');
    }

    document.addEventListener('keydown', movePaddle);
    document.addEventListener('keyup', stopPaddle);

    let upArrowPressed = false;
    let downArrowPressed = false;

    function movePaddle(event) {
        switch (event.keyCode) {
            case 38:
                upArrowPressed = true;
                break;
            case 40:
                downArrowPressed = true;
                break;
        }
    }

    function stopPaddle(event) {
        switch (event.keyCode) {
            case 38:
                upArrowPressed = false;
                break;
            case 40:
                downArrowPressed = false;
                break;
        }
    }

    function update() {
        if (gameOver) return;

        if (upArrowPressed && player.y > separatorBar.y + separatorBar.height) {
            player.y -= player.dy;
        } else if (downArrowPressed && player.y < canvas.height - player.height) {
            player.y += player.dy;
        }

        if (ball.y < ai.y + ai.height / 2) {
            ai.y -= ai.dy;
        } else {
            ai.y += ai.dy;
        }

        if (ai.y < separatorBar.y + separatorBar.height) {
            ai.y = separatorBar.y + separatorBar.height;
        } else if (ai.y > canvas.height - ai.height) {
            ai.y = canvas.height - ai.height;
        }

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < separatorBar.y + separatorBar.height) {
            ball.velocityY = -ball.velocityY;
        }

        let playerPaddle = (ball.x < canvas.width / 2) ? player : ai;

        if (ball.x + ball.radius > playerPaddle.x && ball.x - ball.radius < playerPaddle.x + playerPaddle.width && ball.y + ball.radius > playerPaddle.y && ball.y - ball.radius < playerPaddle.y + playerPaddle.height) {
            ball.velocityX = -ball.velocityX;
            ball.hitCount++;
            if (ball.hitCount % 4 === 0) {
                ball.velocityX += (ball.velocityX > 0) ? 1 : -1;
                ball.velocityY += (ball.velocityY > 0) ? 1 : -1;
            }
        }

        if (ball.x + ball.radius > canvas.width) {
            player.score++;
            resetBall();
        } else if (ball.x - ball.radius < 0) {
            ai.score++;
            resetBall();
        }

        if (timer === 0) {
            gameOver = true;
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = 7 * (Math.random() > 0.5 ? 1 : -1);
        ball.velocityY = 7 * (Math.random() * 2 - 1);
        ball.hitCount = 0;

        if (ball.velocityX === 0) {
            ball.velocityX = (Math.random() > 0.5 ? 1 : -1);
        }
        if (ball.velocityY === 0) {
            ball.velocityY = (Math.random() * 2 - 1);
        }
    }

    function render() {
        drawRect(0, 0, canvas.width, canvas.height, '#008000');

        drawRect(separatorBar.x, separatorBar.y, separatorBar.width, separatorBar.height, separatorBar.color);

        drawRect(centerLine.x - 1, centerLine.startY, 2, centerLine.endY - centerLine.startY, centerLine.color);

        drawRect(player.x, player.y, player.width, player.height, player.color);
        drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

        drawCircle(ball.x, ball.y, ball.radius, ball.color);

        drawScore(player);
        drawScore(ai);

        drawTimer();

        if (gameOver) {
            if (player.score === ai.score) {
                drawText("EMPATE!", canvas.width / 2 - 100, canvas.height / 2, 'BLACK');
            } else {
                const winner = player.score > ai.score ? player.name : ai.name;
                drawText(winner + " Wins!", canvas.width / 2 - 100, canvas.height / 2, 'Yellow');
            }
        }
    }

    function gameLoop() {
        update();
        render();

        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    function countdown() {
        if (timer > 0) {
            timer--;
        } else {
            gameOver = true;
        }

        setTimeout(countdown, 1000);
    }

    countdown();
    gameLoop();
}
