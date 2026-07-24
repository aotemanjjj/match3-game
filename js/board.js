class Board {
  constructor(rows = 8, cols = 8, colors = 4) {
    this.rows = rows;
    this.cols = cols;
    this.colors = colors;
    this.grid = [];
    this.selectedGroup = [];
  }

  generate() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(this.randomColor());
      }
      this.grid.push(row);
    }

    while (!this.hasValidMoves()) {
      this.shuffle();
    }
  }

  randomColor() {
    return Math.floor(Math.random() * this.colors);
  }

  getColor(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return -1;
    return this.grid[r][c];
  }

  setColor(r, c, color) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.grid[r][c] = color;
    }
  }

  findConnectedGroup(startR, startC) {
    const color = this.getColor(startR, startC);
    if (color < 0) return [];

    const visited = new Set();
    const group = [];
    const stack = [[startR, startC]];
    const key = (r, c) => `${r},${c}`;

    while (stack.length > 0) {
      const [r, c] = stack.pop();
      const k = key(r, c);

      if (visited.has(k)) continue;
      if (this.getColor(r, c) !== color) continue;

      visited.add(k);
      group.push({ r, c });

      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (!visited.has(key(nr, nc))) {
            stack.push([nr, nc]);
          }
        }
      }
    }

    return group;
  }

  eliminateGroup(group) {
    for (const { r, c } of group) {
      this.grid[r][c] = -1;
    }
    return group.length;
  }

  applyGravity() {
    const fallingBlocks = [];

    for (let c = 0; c < this.cols; c++) {
      let writePos = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] !== -1) {
          if (r !== writePos) {
            this.grid[writePos][c] = this.grid[r][c];
            this.grid[r][c] = -1;
            fallingBlocks.push({ fromR: r, toR: writePos, c, color: this.grid[writePos][c] });
          }
          writePos--;
        }
      }
    }

    return fallingBlocks;
  }

  fillEmpty() {
    const newBlocks = [];

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[r][c] === -1) {
          const color = this.randomColor();
          this.grid[r][c] = color;
          newBlocks.push({ r, c, color });
        }
      }
    }

    return newBlocks;
  }

  hasValidMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === -1) continue;
        const group = this.findConnectedGroup(r, c);
        if (group.length >= 2) return true;
      }
    }
    return false;
  }

  shuffle() {
    const colors = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== -1) {
          colors.push(this.grid[r][c]);
        }
      }
    }

    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colors[i], colors[j]] = [colors[j], colors[i]];
    }

    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== -1) {
          this.grid[r][c] = colors[idx++];
        }
      }
    }
  }

  bombEffect(r, c) {
    const eliminated = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (this.grid[nr][nc] !== -1) {
            eliminated.push({ r: nr, c: nc });
            this.grid[nr][nc] = -1;
          }
        }
      }
    }
    return eliminated;
  }

  rainbowEffect(color) {
    const eliminated = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === color) {
          eliminated.push({ r, c });
          this.grid[r][c] = -1;
        }
      }
    }
    return eliminated;
  }

  static calculateScore(count) {
    const base = count * 10;
    let bonus = 0;
    if (count >= 20) bonus = base * 2;
    else if (count >= 10) bonus = base * 1;
    else if (count >= 5) bonus = base * 0.5;
    return Math.floor(base + bonus);
  }

  static getLevelConfig(level) {
    let colors = 4;
    let rows = 8;
    let cols = 8;
    let targetScore = 1000;

    if (level >= 10) colors = 5;
    if (level >= 25) colors = 6;
    if (level >= 50) { rows = 9; cols = 9; }
    if (level >= 100) { rows = 10; cols = 10; }

    targetScore = Math.floor(1000 * Math.pow(1.15, level - 1));

    return { colors, rows, cols, targetScore };
  }
}