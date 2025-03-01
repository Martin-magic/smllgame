const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// 游戏状态
let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;

// 玩家飞机
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 5,
  bullets: [],
  draw() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// 敌人
const enemies = [];
const enemySpeed = 2 + level * 0.8;
let enemySpawnRate = Math.max(200, 1000 - level * 150);
let lastEnemySpawn = 0;

// 触摸控制
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

// 初始化触摸事件
function initTouchControls() {
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    touchEndX = e.touches[0].clientX;
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    handleSwipe();
  }, { passive: false });
}

// 处理滑动
function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX;
  
  if (swipeDistance > swipeThreshold) {
    moveRight();
  } else if (swipeDistance < -swipeThreshold) {
    moveLeft();
  }
}

// 震动反馈
function vibrate(duration = 100) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

// 生成敌人
function spawnEnemy() {
  const size = 30 + Math.random() * 20;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: enemySpeed
  });
}

// 控制
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

// 初始化事件监听
function initEventListeners() {
  // 键盘事件
  document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
      keys[e.code] = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code in keys) {
      keys[e.code] = false;
    }
  });

  // 按钮控制
  document.getElementById('leftBtn').addEventListener('click', () => {
    moveLeft();
    vibrate(50);
  });

  document.getElementById('rightBtn').addEventListener('click', () => {
    moveRight();
    vibrate(50);
  });

  document.getElementById('shootBtn').addEventListener('click', () => {
    shoot();
    vibrate(30);
  });

  // 初始化触摸控制
  initTouchControls();
}

// 移动控制
function moveLeft() {
  player.x = Math.max(0, player.x - player.speed);
}

function moveRight() {
  player.x = Math.min(canvas.width - player.width, player.x + player.speed);
}

function shoot() {
  player.bullets.push({
    x: player.x + player.width / 2 - 2.5,
    y: player.y,
    width: 5,
    height: 10,
    speed: 8
  });
}

// 游戏循环
function gameLoop() {
  if (gameOver) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制玩家
  player.draw();
  
  // 绘制敌人
  enemies.forEach(enemy => {
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
  
  // 生成敌人
  if (Date.now() - lastEnemySpawn > enemySpawnRate) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }

  // 处理移动
  handleMovement();
  
  // 更新游戏状态
  update();
  
  // 请求下一帧
  requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
  // 更新子弹
  player.bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    // 移除超出屏幕的子弹
    if (bullet.y + bullet.height < 0) {
      player.bullets.splice(index, 1);
    }
  });
  
  // 更新敌人
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // 碰撞检测
    player.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {
        // 击中敌人
        enemies.splice(index, 1);
        player.bullets.splice(bulletIndex, 1);
        score += 10;
        vibrate(100);
        checkLevelUp();
      }
    });
    
    // 敌人到达底部
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      checkCollision(enemy);
    }
  });

  // 更新HUD
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = level;
}

// 检查关卡升级
function checkLevelUp() {
  if (score >= level * 500) {
    level++;
    enemySpawnRate = Math.max(200, 1000 - level * 150);
    enemySpeed += 0.8;
    
    if (level % 3 === 0) {
      lives++;
      document.getElementById('lives').textContent = lives;
    }
    
    document.getElementById('level').textContent = level;
    showLevelUpMessage();
  }
}

// 显示关卡升级信息
function showLevelUpMessage() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('关卡 ' + level, canvas.width/2, canvas.height/2);
  
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 1500);
}

// 初始化游戏
function initGame() {
  canvas.width = window.innerWidth > 600 ? 800 : window.innerWidth - 40;
  canvas.height = window.innerHeight > 800 ? 600 : window.innerHeight * 0.8;
  
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 100;
  
  initEventListeners();
  gameLoop();
}

// 启动游戏
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('leftBtn').disabled = false;
  document.getElementById('rightBtn').disabled = false;
  document.getElementById('shootBtn').disabled = false;
  initGame();
});
