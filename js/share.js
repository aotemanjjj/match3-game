const Share = (() => {
  function drawShareCard(canvas, level, score, isNewRecord = false) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * w,
        Math.random() * h,
        30 + Math.random() * 80,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    roundRect(ctx, 30, 60, w - 60, h - 120, 20);
    ctx.fill();

    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 消消乐', w / 2, 120);

    ctx.fillStyle = '#333';
    ctx.font = '20px sans-serif';
    ctx.fillText(`第 ${level} 关`, w / 2, 170);

    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(score.toLocaleString(), w / 2, 260);

    ctx.fillStyle = '#999';
    ctx.font = '18px sans-serif';
    ctx.fillText('得分', w / 2, 295);

    if (isNewRecord) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🏆 新纪录！', w / 2, 350);
    }

    const blockColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'];
    const blockSize = 36;
    const startX = (w - blockColors.length * (blockSize + 8)) / 2;
    for (let i = 0; i < blockColors.length; i++) {
      ctx.fillStyle = blockColors[i];
      const cx = startX + i * (blockSize + 8) + blockSize / 2;
      const cy = 390 + blockSize / 2;

      if (i === 0 || i === 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, blockSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (i === 1 || i === 4) {
        roundRect(ctx, cx - blockSize / 2, cy - blockSize / 2, blockSize, blockSize, 8);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(cx, cy, blockSize / 2, blockSize / 2 * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 3, 4, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#666';
    ctx.font = '16px sans-serif';
    ctx.fillText('快来挑战吧！', w / 2, 470);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.fillText('消消乐 - 休闲益智小游戏', w / 2, h - 80);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function downloadImage(canvas, filename = 'score.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function generateShareText(level, score) {
    const templates = [
      `我在消消乐第${level}关获得了${score}分！快来挑战我吧~`,
      `消消乐第${level}关，${score}分！有本事来超过我！`,
      `🎮 消消乐 | 第${level}关 | ${score}分\n快一起来玩吧！`,
      `今天在消消乐第${level}关拿了${score}分，开心！`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  return {
    drawShareCard,
    downloadImage,
    generateShareText,
    copyText
  };
})();