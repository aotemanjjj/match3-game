const UI = (() => {
  const els = {};
  let currentTab = 'local';
  let blockMap = new Map();
  let cellSize = 0;
  let cellGap = 4;
  let blockIdCounter = 0;

  function init() {
    cacheElements();
    bindEvents();
    Game.init();
    AudioManager.init();
    calcCellSize();
    renderBoard();
    updateUI();

    window.addEventListener('resize', () => {
      calcCellSize();
      updateAllBlockPositions();
    });

    document.addEventListener('click', () => {
      AudioManager.resume();
      if (AudioManager.isMusicEnabled()) {
        AudioManager.startBGM();
      }
    }, { once: true });
  }

  function calcCellSize() {
    const board = Game.getBoard();
    const boardRect = els.board.getBoundingClientRect();
    const boardSize = Math.min(boardRect.width, boardRect.height);
    cellSize = (boardSize - cellGap * (board.cols - 1)) / board.cols;
  }

  function getBlockKey(r, c) {
    return `${r},${c}`;
  }

  function getBlockPosition(r, c) {
    return {
      x: c * (cellSize + cellGap),
      y: r * (cellSize + cellGap)
    };
  }

  function setBlockPosition(el, r, c) {
    const { x, y } = getBlockPosition(r, c);
    el.style.width = `${cellSize}px`;
    el.style.height = `${cellSize}px`;
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
    el.style.setProperty('--pos', `translate(${x}px, ${y}px)`);
    el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function setBlockPositionInstant(el, r, c) {
    const { x, y } = getBlockPosition(r, c);
    el.style.width = `${cellSize}px`;
    el.style.height = `${cellSize}px`;
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
    el.style.setProperty('--pos', `translate(${x}px, ${y}px)`);
    const prevTransition = el.style.transition;
    el.style.transition = 'none';
    el.style.transform = `translate(${x}px, ${y}px)`;
    void el.offsetWidth;
    el.style.transition = prevTransition;
  }

  function cacheElements() {
    els.board = document.getElementById('gameBoard');
    els.currentLevel = document.getElementById('currentLevel');
    els.currentScore = document.getElementById('currentScore');
    els.targetScore = document.getElementById('targetScore');
    els.bombCount = document.getElementById('bombCount');
    els.rainbowCount = document.getElementById('rainbowCount');
    els.shuffleCount = document.getElementById('shuffleCount');
    els.bombBtn = document.getElementById('bombBtn');
    els.rainbowBtn = document.getElementById('rainbowBtn');
    els.shuffleBtn = document.getElementById('shuffleBtn');
    els.settingsBtn = document.getElementById('settingsBtn');
    els.settingsModal = document.getElementById('settingsModal');
    els.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    els.musicToggle = document.getElementById('musicToggle');
    els.soundToggle = document.getElementById('soundToggle');
    els.restartBtn = document.getElementById('restartBtn');
    els.rankingBtn = document.getElementById('rankingBtn');
    els.levelCompleteModal = document.getElementById('levelCompleteModal');
    els.finalScore = document.getElementById('finalScore');
    els.completedLevel = document.getElementById('completedLevel');
    els.rewardItems = document.getElementById('rewardItems');
    els.nextLevelBtn = document.getElementById('nextLevelBtn');
    els.shareBtn = document.getElementById('shareBtn');
    els.gameOverModal = document.getElementById('gameOverModal');
    els.overScore = document.getElementById('overScore');
    els.retryBtn = document.getElementById('retryBtn');
    els.backBtn = document.getElementById('backBtn');
    els.rankingModal = document.getElementById('rankingModal');
    els.rankingList = document.getElementById('rankingList');
    els.closeRankingBtn = document.getElementById('closeRankingBtn');
    els.addFriendSection = document.getElementById('addFriendSection');
    els.friendName = document.getElementById('friendName');
    els.friendScore = document.getElementById('friendScore');
    els.addFriendBtn = document.getElementById('addFriendBtn');
    els.shareModal = document.getElementById('shareModal');
    els.shareCanvas = document.getElementById('shareCanvas');
    els.downloadImgBtn = document.getElementById('downloadImgBtn');
    els.copyTextBtn = document.getElementById('copyTextBtn');
    els.closeShareBtn = document.getElementById('closeShareBtn');
    els.comboDisplay = document.getElementById('comboDisplay');
    els.floatingScores = document.getElementById('floatingScores');
  }

  function bindEvents() {
    els.settingsBtn.addEventListener('click', () => {
      AudioManager.playButton();
      openModal(els.settingsModal);
      els.musicToggle.checked = AudioManager.isMusicEnabled();
      els.soundToggle.checked = AudioManager.isSoundEnabled();
    });

    els.closeSettingsBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.settingsModal);
    });

    els.musicToggle.addEventListener('change', (e) => {
      AudioManager.setMusicEnabled(e.target.checked);
    });

    els.soundToggle.addEventListener('change', (e) => {
      AudioManager.setSoundEnabled(e.target.checked);
    });

    els.restartBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.settingsModal);
      Game.restartLevel();
      renderBoard();
      updateUI();
    });

    els.rankingBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.settingsModal);
      openRanking();
    });

    els.bombBtn.addEventListener('click', () => onItemClick('bomb'));
    els.rainbowBtn.addEventListener('click', () => onItemClick('rainbow'));
    els.shuffleBtn.addEventListener('click', () => onShuffleClick());

    els.nextLevelBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.levelCompleteModal);
      Game.nextLevel();
      renderBoard();
      updateUI();
    });

    els.shareBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.levelCompleteModal);
      openShare();
    });

    els.retryBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.gameOverModal);
      Game.restartLevel();
      renderBoard();
      updateUI();
    });

    els.backBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.gameOverModal);
    });

    els.closeRankingBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.rankingModal);
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioManager.playButton();
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        els.addFriendSection.style.display = currentTab === 'friends' ? 'flex' : 'none';
        renderRanking();
      });
    });

    els.addFriendBtn.addEventListener('click', () => {
      AudioManager.playButton();
      const name = els.friendName.value.trim();
      const score = parseInt(els.friendScore.value);
      if (name && !isNaN(score) && score > 0) {
        Storage.addFriend(name, { [Game.getLevel()]: score });
        els.friendName.value = '';
        els.friendScore.value = '';
        renderRanking();
      }
    });

    els.downloadImgBtn.addEventListener('click', () => {
      AudioManager.playButton();
      Share.downloadImage(els.shareCanvas, `消消乐_第${Game.getLevel()}关_${Game.getScore()}.png`);
    });

    els.copyTextBtn.addEventListener('click', () => {
      AudioManager.playButton();
      const text = Share.generateShareText(Game.getLevel(), Game.getScore());
      Share.copyText(text).then(() => {
        els.copyTextBtn.textContent = '已复制！';
        setTimeout(() => { els.copyTextBtn.textContent = '复制文案'; }, 1500);
      });
    });

    els.closeShareBtn.addEventListener('click', () => {
      AudioManager.playButton();
      closeModal(els.shareModal);
    });

    [els.settingsModal, els.levelCompleteModal, els.gameOverModal, els.rankingModal, els.shareModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
  }

  function getSpriteHTML(color) {
    if (color === 0 || color === 3) {
      return `<div class="sprite sprite-circle c-${color}">
        <div class="cheek left"></div>
        <div class="cheek right"></div>
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="mouth"></div>
      </div>`;
    }
    if (color === 1 || color === 4) {
      return `<div class="sprite sprite-square c-${color}">
        <div class="horn left"></div>
        <div class="horn right"></div>
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="mouth"><div class="tooth"></div></div>
      </div>`;
    }
    return `<div class="sprite sprite-drop c-${color}">
      <div class="shine"></div>
      <div class="eye left"></div>
      <div class="eye right"></div>
      <div class="mouth"></div>
      </div>`;
  }

  function createBlockElement(r, c, color) {
    const block = document.createElement('div');
    const id = ++blockIdCounter;
    block.className = `block color-${color}`;
    block.dataset.r = r;
    block.dataset.c = c;
    block.dataset.id = id;
    block.innerHTML = getSpriteHTML(color);
    block.addEventListener('click', (e) => {
      const el = e.currentTarget;
      onBlockClick(parseInt(el.dataset.r), parseInt(el.dataset.c));
    });
    return block;
  }

  function renderBoard() {
    const board = Game.getBoard();
    els.board.innerHTML = '';
    blockMap.clear();
    blockIdCounter = 0;

    calcCellSize();

    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const color = board.getColor(r, c);
        const block = createBlockElement(r, c, color);
        setBlockPositionInstant(block, r, c);
        els.board.appendChild(block);
        blockMap.set(getBlockKey(r, c), block);
      }
    }
  }

  function updateAllBlockPositions() {
    const board = Game.getBoard();
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const el = blockMap.get(getBlockKey(r, c));
        if (el) {
          setBlockPositionInstant(el, r, c);
        }
      }
    }
  }

  function onBlockClick(r, c) {
    if (Game.isAnimatingState()) return;
    AudioManager.playClick();

    const result = Game.handleBlockClick(r, c);
    if (!result) return;

    if (result.type === 'invalid') {
      const blockEl = blockMap.get(getBlockKey(r, c));
      if (blockEl) {
        blockEl.classList.add('shake');
        setTimeout(() => { blockEl.classList.remove('shake'); }, 300);
      }
      return;
    }

    if (result.type === 'eliminate') {
      handleEliminate(result);
    } else if (result.type === 'bomb' || result.type === 'rainbow') {
      handleItemEffect(result);
    }
  }

  function handleEliminate(result) {
    const { group, points, combo } = result;

    AudioManager.playEliminate(group.length);
    if (combo >= 2) {
      AudioManager.playCombo(combo);
      showCombo(combo);
    }

    const centerBlock = group[Math.floor(group.length / 2)];
    showFloatingScore(points, centerBlock.r, centerBlock.c);

    group.forEach(({ r, c }) => {
      const el = blockMap.get(getBlockKey(r, c));
      if (el) el.classList.add('removing');
    });

    updateItemButtons();

    setTimeout(() => {
      runGravityAndFill();
    }, 80);
  }

  function handleItemEffect(result) {
    AudioManager.playItemUse();

    const { eliminated, points } = result;

    eliminated.forEach(({ r, c }) => {
      const el = blockMap.get(getBlockKey(r, c));
      if (el) el.classList.add('removing');
    });

    if (eliminated.length > 0) {
      const center = eliminated[Math.floor(eliminated.length / 2)];
      showFloatingScore(points, center.r, center.c);
    }

    setTimeout(() => {
      runGravityAndFill();
    }, 80);
  }

  function runGravityAndFill() {
    const board = Game.getBoard();
    const afterResult = Game.afterEliminate();
    const { falling, newBlocks } = afterResult;

    const removedKeys = new Set();
    els.board.querySelectorAll('.block.removing').forEach(el => {
      const r = parseInt(el.dataset.r);
      const c = parseInt(el.dataset.c);
      removedKeys.add(getBlockKey(r, c));
      blockMap.delete(getBlockKey(r, c));
      setTimeout(() => el.remove(), 350);
    });

    const moveMap = new Map();
    falling.forEach(({ fromR, toR, c }) => {
      const fromKey = getBlockKey(fromR, c);
      const toKey = getBlockKey(toR, c);
      const el = blockMap.get(fromKey);
      if (el) {
        moveMap.set(fromKey, { el, toR, toC: c });
      }
    });

    moveMap.forEach(({ el, toR, toC }, fromKey) => {
      const fromR = parseInt(el.dataset.r);
      const fromC = parseInt(el.dataset.c);
      blockMap.delete(fromKey);
      el.dataset.r = toR;
      el.dataset.c = toC;
      setBlockPosition(el, toR, toC);
      blockMap.set(getBlockKey(toR, toC), el);
    });

    newBlocks.forEach(({ r, c, color }) => {
      const block = createBlockElement(r, c, color);
      block.classList.add('new-enter');
      const startR = r - board.rows - 2;
      setBlockPositionInstant(block, startR, c);
      els.board.appendChild(block);
      blockMap.set(getBlockKey(r, c), block);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBlockPosition(block, r, c);
        });
      });

      setTimeout(() => {
        block.classList.remove('new-enter');
      }, 500);
    });

    setTimeout(() => {
      Game.setAnimating(false);
      updateUI();

      if (afterResult.levelComplete) {
        showLevelComplete(afterResult.rewards);
      } else if (afterResult.gameOver) {
        showGameOver();
      }
    }, 550);
  }

  function getBlockElement(r, c) {
    return blockMap.get(getBlockKey(r, c));
  }

  function showFloatingScore(points, r, c) {
    const boardRect = els.board.getBoundingClientRect();
    const blockEl = getBlockElement(r, c);
    if (!blockEl) return;
    const blockRect = blockEl.getBoundingClientRect();

    const el = document.createElement('div');
    el.className = 'floating-score';
    el.textContent = `+${points}`;
    el.style.left = `${blockRect.left + blockRect.width / 2}px`;
    el.style.top = `${blockRect.top + blockRect.height / 2}px`;
    el.style.transform = 'translate(-50%, -50%)';
    els.floatingScores.appendChild(el);

    setTimeout(() => el.remove(), 1000);
  }

  function showCombo(combo) {
    const texts = ['', '', '牛马加油！', '牛马起飞！', '牛马无敌！', '牛马封神！', '牛马传说！'];
    const text = texts[Math.min(combo, texts.length - 1)] || `${combo} 连击！`;
    els.comboDisplay.textContent = `${combo} ${text}`;
    els.comboDisplay.classList.remove('show');
    void els.comboDisplay.offsetWidth;
    els.comboDisplay.classList.add('show');
  }

  function onItemClick(itemType) {
    if (Game.isAnimatingState()) return;
    AudioManager.playButton();

    const result = Game.selectItem(itemType);
    updateItemButtons();
  }

  function onShuffleClick() {
    if (Game.isAnimatingState()) return;
    AudioManager.playButton();

    if (Game.useShuffle()) {
      Game.setAnimating(true);
      updateItemButtons();
      AudioManager.playShuffle();
      animateShuffle();
    }
  }

  function animateShuffle() {
    const board = Game.getBoard();
    const blocks = Array.from(els.board.querySelectorAll('.block'));
    const flyDistance = cellSize * 2.5;

    const shuffleData = blocks.map((block, i) => {
      const r = parseInt(block.dataset.r);
      const c = parseInt(block.dataset.c);
      const angle = Math.random() * Math.PI * 2;
      const dist = flyDistance * (0.6 + Math.random() * 0.6);
      const flyX = Math.cos(angle) * dist;
      const flyY = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 540;
      const delay = Math.random() * 0.12;
      const { x, y } = getBlockPosition(r, c);
      return { block, r, c, flyX, flyY, rot, delay, x, y };
    });

    shuffleData.forEach(({ block, flyX, flyY, rot, delay, x, y }) => {
      const sprite = block.querySelector('.sprite');
      if (!sprite) return;
      sprite.style.setProperty('--shuffle-rot', `${rot}deg`);
      sprite.style.animationDelay = `${delay}s`;
      block.classList.add('shuffle-out');
      block.style.transition = `transform 0.4s cubic-bezier(0.5, 0, 0.75, 0) ${delay}s`;
      block.style.transform = `translate(${x + flyX}px, ${y + flyY}px)`;
    });

    setTimeout(() => {
      board.shuffle();
      let attempts = 0;
      while (!board.hasValidMoves() && attempts < 100) {
        board.shuffle();
        attempts++;
      }

      blockMap.clear();

      shuffleData.forEach((data, i) => {
        const newR = Math.floor(i / board.cols);
        const newC = i % board.cols;
        const newColor = board.getColor(newR, newC);
        const block = data.block;
        const sprite = block.querySelector('.sprite');

        block.className = `block color-${newColor} shuffle-in`;
        block.dataset.r = newR;
        block.dataset.c = newC;

        if (sprite) {
          const tmp = document.createElement('div');
          tmp.innerHTML = getSpriteHTML(newColor);
          const newSpriteEl = tmp.firstElementChild;
          block.insertBefore(newSpriteEl, sprite);
          sprite.remove();
        }

        const { x: targetX, y: targetY } = getBlockPosition(newR, newC);
        const newSprite = block.querySelector('.sprite');

        const inAngle = Math.random() * Math.PI * 2;
        const inDist = flyDistance * (0.7 + Math.random() * 0.5);
        const inX = Math.cos(inAngle) * inDist;
        const inY = Math.sin(inAngle) * inDist;
        const inRot = (Math.random() - 0.5) * 540;
        const inDelay = Math.random() * 0.15;

        if (newSprite) {
          newSprite.style.setProperty('--shuffle-rot', `${inRot}deg`);
          newSprite.style.animationDelay = `${inDelay}s`;
        }

        block.style.transition = 'none';
        block.style.transform = `translate(${targetX + inX}px, ${targetY + inY}px)`;

        blockMap.set(getBlockKey(newR, newC), block);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            block.style.transition = `transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) ${inDelay}s`;
            block.style.transform = `translate(${targetX}px, ${targetY}px)`;
          });
        });

        setTimeout(() => {
          block.classList.remove('shuffle-in');
          if (newSprite) {
            newSprite.style.animationDelay = '';
            newSprite.style.setProperty('--shuffle-rot', '');
          }
          block.style.transition = '';
          block.style.transform = `translate(${targetX}px, ${targetY}px)`;
        }, 500 + inDelay * 1000);
      });

      setTimeout(() => {
        Game.setAnimating(false);
        updateUI();
      }, 600);
    }, 400);
  }

  function updateItemButtons() {
    const items = Game.getItems();
    const activeItem = Game.getActiveItem();

    els.bombCount.textContent = items.bomb;
    els.rainbowCount.textContent = items.rainbow;
    els.shuffleCount.textContent = items.shuffle;

    els.bombBtn.classList.toggle('active', activeItem === 'bomb');
    els.rainbowBtn.classList.toggle('active', activeItem === 'rainbow');

    els.bombBtn.disabled = items.bomb <= 0;
    els.rainbowBtn.disabled = items.rainbow <= 0;
    els.shuffleBtn.disabled = items.shuffle <= 0;
  }

  function updateUI() {
    els.currentLevel.textContent = Game.getLevel();
    els.currentScore.textContent = Game.getScore().toLocaleString();
    els.targetScore.textContent = Game.getTargetScore().toLocaleString();
    updateItemButtons();

    const bgColors = getLevelGradient(Game.getLevel());
    document.getElementById('app').style.background = `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 100%)`;
  }

  function getLevelGradient(level) {
    const gradients = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#a18cd1', '#fbc2eb'],
      ['#ffecd2', '#fcb69f'],
      ['#a1c4fd', '#c2e9fb'],
    ];
    return gradients[(level - 1) % gradients.length];
  }

  function openModal(modal) {
    modal.classList.add('show');
  }

  function closeModal(modal) {
    modal.classList.remove('show');
  }

  function showLevelComplete(rewards) {
    AudioManager.playLevelComplete();
    els.finalScore.textContent = Game.getScore().toLocaleString();
    els.completedLevel.textContent = Game.getLevel();

    els.rewardItems.innerHTML = '';
    const rewardIcons = { bomb: '💣', rainbow: '🌈', shuffle: '🔀' };
    const rewardNames = { bomb: '炸弹', rainbow: '彩虹球', shuffle: '重排' };
    for (const [type, count] of Object.entries(rewards)) {
      const div = document.createElement('div');
      div.className = 'reward-item';
      div.innerHTML = `
        <span class="icon">${rewardIcons[type]}</span>
        <span class="count">+${count}</span>
      `;
      div.title = rewardNames[type];
      els.rewardItems.appendChild(div);
    }

    openModal(els.levelCompleteModal);
  }

  function showGameOver() {
    AudioManager.playGameOver();
    els.overScore.textContent = Game.getScore().toLocaleString();
    openModal(els.gameOverModal);
  }

  function openRanking() {
    currentTab = 'local';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="local"]').classList.add('active');
    els.addFriendSection.style.display = 'none';
    renderRanking();
    openModal(els.rankingModal);
  }

  function renderRanking() {
    const level = Game.getLevel();
    const highScore = Storage.getHighScore(level);

    if (currentTab === 'local') {
      const allScores = [];
      const data = Storage.load();
      for (const [lvl, info] of Object.entries(data.highScores)) {
        allScores.push({ level: parseInt(lvl), score: info.score, date: info.date });
      }
      allScores.sort((a, b) => a.level - b.level);

      els.rankingList.innerHTML = '';
      if (allScores.length === 0) {
        els.rankingList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无记录</p>';
      } else {
        allScores.slice(0, 20).forEach((item, i) => {
          const div = document.createElement('div');
          div.className = 'ranking-item';
          let rankClass = '';
          if (i === 0) rankClass = 'gold';
          else if (i === 1) rankClass = 'silver';
          else if (i === 2) rankClass = 'bronze';
          div.innerHTML = `
            <span class="rank ${rankClass}">${item.level}</span>
            <span class="name">第 ${item.level} 关</span>
            <span class="score">${item.score.toLocaleString()}</span>
          `;
          els.rankingList.appendChild(div);
        });
      }
    } else {
      const ranking = Storage.getLevelRanking(level);
      els.rankingList.innerHTML = '';
      if (ranking.length === 0) {
        els.rankingList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无排行数据</p>';
      } else {
        ranking.forEach((item, i) => {
          const div = document.createElement('div');
          div.className = 'ranking-item';
          let rankClass = '';
          if (i === 0) rankClass = 'gold';
          else if (i === 1) rankClass = 'silver';
          else if (i === 2) rankClass = 'bronze';
          div.innerHTML = `
            <span class="rank ${rankClass}">${i + 1}</span>
            <span class="name">${item.name}${item.isMe ? '<span class="me">我</span>' : ''}</span>
            <span class="score">${item.score.toLocaleString()}</span>
          `;
          els.rankingList.appendChild(div);
        });
      }
    }
  }

  function openShare() {
    const highScore = Storage.getHighScore(Game.getLevel());
    const isNewRecord = Game.getScore() >= highScore.score && Game.getScore() > 0;
    Share.drawShareCard(els.shareCanvas, Game.getLevel(), Game.getScore(), isNewRecord);
    openModal(els.shareModal);
  }

  return {
    init
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});