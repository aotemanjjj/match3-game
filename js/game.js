const Game = (() => {
  let board = null;
  let currentLevel = 1;
  let score = 0;
  let targetScore = 0;
  let isAnimating = false;
  let activeItem = null;
  let comboCount = 0;
  let comboTimer = null;
  let items = { bomb: 0, rainbow: 0, shuffle: 0 };
  let gameState = 'playing';

  function init() {
    currentLevel = Storage.getCurrentLevel();
    items = Storage.getItems();
    loadLevel(currentLevel);
  }

  function loadLevel(level) {
    currentLevel = level;
    const config = Board.getLevelConfig(level);
    board = new Board(config.rows, config.cols, config.colors);
    board.generate();
    score = 0;
    targetScore = config.targetScore;
    activeItem = null;
    comboCount = 0;
    gameState = 'playing';
    Storage.setCurrentLevel(level);
  }

  function getBoard() {
    return board;
  }

  function getScore() {
    return score;
  }

  function getTargetScore() {
    return targetScore;
  }

  function getLevel() {
    return currentLevel;
  }

  function getItems() {
    return { ...items };
  }

  function getState() {
    return gameState;
  }

  function isAnimatingState() {
    return isAnimating;
  }

  function setAnimating(val) {
    isAnimating = val;
  }

  function handleBlockClick(r, c) {
    if (isAnimating || gameState !== 'playing') return null;

    if (activeItem === 'bomb') {
      return useBomb(r, c);
    }

    if (activeItem === 'rainbow') {
      return useRainbow(r, c);
    }

    const group = board.findConnectedGroup(r, c);
    if (group.length < 2) {
      return { type: 'invalid', group };
    }

    return eliminateBlocks(group);
  }

  function eliminateBlocks(group) {
    const count = group.length;
    const points = Board.calculateScore(count);
    const wasCombo = comboCount > 0;

    comboCount++;
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(() => { comboCount = 0; }, 1500);

    let totalPoints = points;
    if (comboCount >= 2) {
      totalPoints = Math.floor(points * (1 + (comboCount - 1) * 0.2));
    }

    score += totalPoints;
    board.eliminateGroup(group);

    const result = {
      type: 'eliminate',
      group,
      count,
      points: totalPoints,
      basePoints: points,
      combo: comboCount,
      score
    };

    isAnimating = true;
    return result;
  }

  function afterEliminate() {
    const falling = board.applyGravity();
    const newBlocks = board.fillEmpty();

    if (score >= targetScore) {
      gameState = 'levelComplete';
      Storage.setHighScore(currentLevel, score);
      const rewards = calculateRewards();
      Storage.addItems(rewards);
      items = Storage.getItems();
      return { falling, newBlocks, levelComplete: true, rewards };
    }

    if (!board.hasValidMoves()) {
      gameState = 'gameOver';
      Storage.setHighScore(currentLevel, score);
      return { falling, newBlocks, gameOver: true };
    }

    return { falling, newBlocks, levelComplete: false, gameOver: false };
  }

  function calculateRewards() {
    const rewards = {};
    if (currentLevel % 5 === 0) {
      rewards.bomb = 1;
    }
    if (currentLevel % 10 === 0) {
      rewards.rainbow = 1;
    }
    rewards.shuffle = 1;
    return rewards;
  }

  function selectItem(itemType) {
    if (items[itemType] <= 0) return false;
    if (gameState !== 'playing') return false;

    if (activeItem === itemType) {
      activeItem = null;
      return { selected: false, item: itemType };
    }

    activeItem = itemType;
    return { selected: true, item: itemType };
  }

  function getActiveItem() {
    return activeItem;
  }

  function useBomb(r, c) {
    if (items.bomb <= 0) return null;
    items.bomb--;
    Storage.useItem('bomb');
    activeItem = null;

    const eliminated = board.bombEffect(r, c);
    const points = eliminated.length * 15;
    score += points;
    isAnimating = true;

    return {
      type: 'bomb',
      eliminated,
      points,
      score
    };
  }

  function useRainbow(r, c) {
    const color = board.getColor(r, c);
    if (color < 0 || items.rainbow <= 0) return null;
    items.rainbow--;
    Storage.useItem('rainbow');
    activeItem = null;

    const eliminated = board.rainbowEffect(color);
    const points = eliminated.length * 12;
    score += points;
    isAnimating = true;

    return {
      type: 'rainbow',
      eliminated,
      color,
      points,
      score
    };
  }

  function useShuffle() {
    if (items.shuffle <= 0) return false;
    if (gameState !== 'playing') return false;
    items.shuffle--;
    Storage.useItem('shuffle');

    let attempts = 0;
    do {
      board.shuffle();
      attempts++;
    } while (!board.hasValidMoves() && attempts < 100);

    return true;
  }

  function nextLevel() {
    loadLevel(currentLevel + 1);
    return currentLevel;
  }

  function restartLevel() {
    loadLevel(currentLevel);
  }

  function goToLevel(level) {
    if (level < 1) level = 1;
    loadLevel(level);
  }

  return {
    init,
    loadLevel,
    getBoard,
    getScore,
    getTargetScore,
    getLevel,
    getItems,
    getState,
    isAnimatingState,
    setAnimating,
    handleBlockClick,
    afterEliminate,
    selectItem,
    getActiveItem,
    useShuffle,
    nextLevel,
    restartLevel,
    goToLevel
  };
})();