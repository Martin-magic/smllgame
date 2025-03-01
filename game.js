const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: canvas.width/2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 5,
  color: '#00ff00',
  lives: 3,
  score: 0,
  level: 1
};

const bullets = [];
const enemies = [];
let gameOver = false;

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function updateHUD() {
  document.getElementById('score').textContent = player.score;
  document.getElementById('lives').textContent = player.lives;
  document.getElementById('level').textContent = player.level;
}

function spawnEnemy() {
  const size = 30 + Math.random() * 20;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 1 + player.level * 0.5,
    color: '#ff0000'
  });
}

function updateEnemies() {
  for(let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;
    
    // Check collision with player
    if(enemy.y + enemy.height > player.y &&
       enemy.x < player.x + player.width &&
       enemy.x + enemy.width > player.x) {
      player.lives--;
      enemies.splice(i, 1);
      if(player.lives <= 0) {
        gameOver = true;
      }
      continue;
    }
    
    // Remove off-screen enemies
    if(enemy.y > canvas.height) {
      enemies.splice(i, 1);
      player.score++;
    }
  }
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function shoot() {
  bullets.push({
    x: player.x + player.width/2 - 2.5,
    y: player.y,
    width: 5,
    height: 10,
    speed: 8,
    color: '#ffff00'
  });
}

function updateBullets() {
  for(let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed;
    
    // Check collision with enemies
    for(let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if(bullet.y < enemy.y + enemy.height &&
         bullet.x > enemy.x &&
         bullet.x < enemy.x + enemy.width) {
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        player.score += 10;
        break;
      }
    }
    
    // Remove off-screen bullets
    if(bullet.y + bullet.height < 0) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function gameLoop() {
  if(gameOver) {
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText('按R键重新开始', canvas.width/2, canvas.height/2 + 50);
    return;
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update game state
  updateEnemies();
  updateBullets();
  
  // Draw game objects
  drawPlayer();
  drawEnemies();
  drawBullets();
  
  // Update HUD
  updateHUD();
  
  // Level progression
  if(player.score >= player.level * 100) {
    player.level++;
  }
  
  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (e) => {
  if(e.code === 'ArrowLeft' && player.x > 0) {
    player.x -= player.speed;
  }
  if(e.code === 'ArrowRight' && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }
  if(e.code === 'Space') {
    shoot();
  }
  if(e.code === 'KeyR' && gameOver) {
    resetGame();
  }
});

function resetGame() {
  player.x = canvas.width/2 - 25;
  player.y = canvas.height - 60;
  player.lives = 3;
  player.score = 0;
  player.level = 1;
  bullets.length = 0;
  enemies.length = 0;
  gameOver = false;
  gameLoop();
}

// Start game
setInterval(spawnEnemy, 1000 - player.level * 100);
gameLoop();
