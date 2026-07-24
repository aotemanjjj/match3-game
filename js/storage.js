const Storage = (() => {
  const KEY = 'match3_game_data';

  const defaultData = {
    highScores: {},
    friends: [],
    currentLevel: 1,
    items: {
      bomb: 3,
      rainbow: 2,
      shuffle: 5
    },
    settings: {
      music: true,
      sound: true
    }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaultData };
      const data = JSON.parse(raw);
      return { ...defaultData, ...data };
    } catch (e) {
      return { ...defaultData };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game data:', e);
    }
  }

  function getHighScore(level) {
    const data = load();
    return data.highScores[level] || { score: 0, date: null };
  }

  function setHighScore(level, score) {
    const data = load();
    if (!data.highScores[level] || score > data.highScores[level].score) {
      data.highScores[level] = {
        score,
        date: new Date().toISOString().split('T')[0]
      };
      save(data);
      return true;
    }
    return false;
  }

  function getCurrentLevel() {
    return load().currentLevel || 1;
  }

  function setCurrentLevel(level) {
    const data = load();
    data.currentLevel = level;
    save(data);
  }

  function getItems() {
    return { ...load().items };
  }

  function setItems(items) {
    const data = load();
    data.items = { ...items };
    save(data);
  }

  function useItem(itemType) {
    const data = load();
    if (data.items[itemType] > 0) {
      data.items[itemType]--;
      save(data);
      return true;
    }
    return false;
  }

  function addItems(items) {
    const data = load();
    for (const [type, count] of Object.entries(items)) {
      data.items[type] = (data.items[type] || 0) + count;
    }
    save(data);
  }

  function getSettings() {
    return { ...load().settings };
  }

  function setSettings(settings) {
    const data = load();
    data.settings = { ...data.settings, ...settings };
    save(data);
  }

  function getFriends() {
    return [...load().friends];
  }

  function addFriend(name, scores = {}) {
    const data = load();
    const id = Date.now();
    data.friends.push({ id, name, scores });
    save(data);
    return id;
  }

  function removeFriend(id) {
    const data = load();
    data.friends = data.friends.filter(f => f.id !== id);
    save(data);
  }

  function getLevelRanking(level) {
    const data = load();
    const ranking = [];

    const playerScore = data.highScores[level]?.score || 0;
    if (playerScore > 0) {
      ranking.push({ name: '我', score: playerScore, isMe: true });
    }

    for (const friend of data.friends) {
      if (friend.scores[level]) {
        ranking.push({ name: friend.name, score: friend.scores[level], isMe: false });
      }
    }

    ranking.sort((a, b) => b.score - a.score);
    return ranking;
  }

  function resetData() {
    localStorage.removeItem(KEY);
  }

  return {
    load,
    save,
    getHighScore,
    setHighScore,
    getCurrentLevel,
    setCurrentLevel,
    getItems,
    setItems,
    useItem,
    addItems,
    getSettings,
    setSettings,
    getFriends,
    addFriend,
    removeFriend,
    getLevelRanking,
    resetData
  };
})();