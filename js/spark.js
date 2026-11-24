/* Spark — hidden game inside the Omun mark.
   Loaded only after the mark is clicked (see setupSpark in site.js).
   No network, no tracker. The best score is the only localStorage key. */
(function (global) {
  "use strict";

  var BEST_KEY = "omun-spark-best";
  var COLS = 19;
  var ROWS = 13;
  var CELL = 14;
  var HUD = 36;
  var W = COLS * CELL;
  var H = HUD + ROWS * CELL;
  var LEVEL2_AT = 15;
  var BG = "#0B0710";
  var CREAM = "#F3EEE6";
  var BLOOD = "#C41E28";
  var MUTED = "#D7D0C6";
  var DIM = "#8c867c";

  /* 3×5 glyphs, each row is 3 bits. */
  var FONT = {
    " ": [0, 0, 0, 0, 0],
    "0": [7, 5, 5, 5, 7],
    "1": [2, 6, 2, 2, 7],
    "2": [7, 1, 7, 4, 7],
    "3": [7, 1, 7, 1, 7],
    "4": [5, 5, 7, 1, 1],
    "5": [7, 4, 7, 1, 7],
    "6": [7, 4, 7, 5, 7],
    "7": [7, 1, 2, 2, 2],
    "8": [7, 5, 7, 5, 7],
    "9": [7, 5, 7, 1, 7],
    A: [7, 5, 7, 5, 5],
    B: [6, 5, 6, 5, 6],
    C: [7, 4, 4, 4, 7],
    D: [6, 5, 5, 5, 6],
    E: [7, 4, 6, 4, 7],
    F: [7, 4, 6, 4, 4],
    G: [7, 4, 5, 5, 7],
    H: [5, 5, 7, 5, 5],
    I: [7, 2, 2, 2, 7],
    J: [1, 1, 1, 5, 7],
    K: [5, 5, 6, 5, 5],
    L: [4, 4, 4, 4, 7],
    M: [5, 7, 5, 5, 5],
    N: [5, 7, 7, 5, 5],
    O: [7, 5, 5, 5, 7],
    P: [7, 5, 7, 4, 4],
    Q: [7, 5, 5, 7, 1],
    R: [7, 5, 7, 6, 5],
    S: [7, 4, 7, 1, 7],
    T: [7, 2, 2, 2, 2],
    U: [5, 5, 5, 5, 7],
    V: [5, 5, 5, 5, 2],
    W: [5, 5, 5, 7, 5],
    X: [5, 5, 2, 5, 5],
    Y: [5, 5, 7, 2, 2],
    Z: [7, 1, 2, 4, 7]
  };

  var DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  var OPP = { up: "down", down: "up", left: "right", right: "left" };
  var KEYS = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    W: "up",
    A: "left",
    S: "down",
    D: "right"
  };

  /* Level 2 walls. Row 1–3, columns 1–9 are the open den the snake
     coils in; row 4 is a long lane so the first move has room. */
  var MAZE = [
    "###################",
    "#.........#.......#",
    "#.........#.......#",
    "#.........#.#####.#",
    "#...........####..#",
    "#.....#.##........#",
    "#.#####...#.#######",
    "#.....#...#.......#",
    "##.#..#.###...###.#",
    "#####.#.....#####.#",
    "#.###.#.####..#...#",
    "#.............#...#",
    "###################"
  ];

  var ICON_CLOSE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>';
  var ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 9.5h3.2L11 6.2v11.6l-3.8-3.3H4v-5zM15 9.5l5 5M20 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></path></svg>';
  var ICON_SOUND_ON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 9.5h3.2L11 6.2v11.6l-3.8-3.3H4v-5zM15 9.2a3.2 3.2 0 0 1 0 5.6M17.4 7a6 6 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></path></svg>';
  var ICON_ARROW = {
    up: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 6.5v11M7.5 11 12 6.5 16.5 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    down: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 17.5v-11M7.5 13 12 17.5 16.5 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    left: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6.5 12h11M11 7.5 6.5 12 11 16.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    right: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M17.5 12h-11M13 7.5 17.5 12 13 16.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
  };

  var active = false;
  var reduce = false;
  var mark = null;
  var frame = null;
  var root = null;
  var canvas = null;
  var ctx = null;
  var live = null;
  var helpEl = null;
  var overEl = null;
  var restartBtn = null;
  var muteBtn = null;
  var closeBtn = null;
  var scratch = null;
  var markSprite = null;
  var stillSprite = null;
  var wordSprite = null;
  var audio = null;
  var soundOn = false;

  var mode = "intro";
  var level = 1;
  var score = 0;
  var best = 0;
  var eats = 0;
  var spelled = "";
  var wordClearAt = 0;
  var win = false;
  var snake = [];
  var dir = "right";
  var queue = [];
  var food = null;
  var tickMs = 188;
  var acc = 0;
  var last = 0;
  var introStart = 0;
  var armed = false;
  var levelUntil = 0;
  var raf = 0;
  var parts = [];
  var padStamp = 0;
  var touch = null;

  function t(key) {
    var cfg = global.OMUN || {};
    var lang = document.documentElement.lang || "en";
    var pack = (cfg.copy && (cfg.copy[lang] || cfg.copy.en)) || {};
    var value = pack[key];
    return value == null ? "" : String(value);
  }

  function loadBest() {
    try {
      var n = parseInt(localStorage.getItem(BEST_KEY), 10);
      if (!n || n < 0 || n > 999999) return 0;
      return n;
    } catch (err) {
      return 0;
    }
  }

  function saveBest(n) {
    try {
      localStorage.setItem(BEST_KEY, String(n));
    } catch (err) {}
  }

  function textWidth(text, scale) {
    if (!text) return 0;
    return text.length * 4 * scale - scale;
  }

  function drawText(g, text, x, y, scale, color) {
    g.fillStyle = color;
    var cx = x;
    for (var i = 0; i < text.length; i++) {
      var glyph = FONT[text.charAt(i)] || FONT[" "];
      for (var r = 0; r < 5; r++) {
        var bits = glyph[r];
        for (var c = 0; c < 3; c++) {
          if (bits & (1 << (2 - c))) {
            g.fillRect(cx + c * scale, y + r * scale, scale, scale);
          }
        }
      }
      cx += 4 * scale;
    }
  }

  function centerText(g, text, y, scale, color) {
    var x = Math.round((W - textWidth(text, scale)) / 2);
    drawText(g, text, x, y, scale, color);
  }

  function cropOpaque(img) {
    var c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    if (!c.width || !c.height) return null;
    var g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    var data;
    try {
      data = g.getImageData(0, 0, c.width, c.height);
    } catch (err) {
      return c;
    }
    var p = data.data;
    var minX = c.width;
    var minY = c.height;
    var maxX = 0;
    var maxY = 0;
    var y;
    var x;
    for (y = 0; y < c.height; y++) {
      for (x = 0; x < c.width; x++) {
        if (p[(y * c.width + x) * 4 + 3] > 32) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX) return c;
    var out = document.createElement("canvas");
    out.width = maxX - minX + 1;
    out.height = maxY - minY + 1;
    out.getContext("2d").drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }

  /* Max-alpha blocks keep the mark's thin lines when it is reduced
     to a sprite. A plain downsample drops them. */
  function pixelate(source, tw, th) {
    if (!source) return null;
    var sw = source.width;
    var sh = source.height;
    if (!sw || !sh) return null;
    var factor = 4;
    var big = document.createElement("canvas");
    big.width = tw * factor;
    big.height = th * factor;
    var bg = big.getContext("2d");
    bg.imageSmoothingEnabled = true;
    var fit = Math.min(big.width / sw, big.height / sh);
    var dw = sw * fit;
    var dh = sh * fit;
    bg.drawImage(source, (big.width - dw) / 2, (big.height - dh) / 2, dw, dh);
    var data;
    try {
      data = bg.getImageData(0, 0, big.width, big.height);
    } catch (err) {
      return null;
    }
    var src = data.data;
    var out = document.createElement("canvas");
    out.width = tw;
    out.height = th;
    var og = out.getContext("2d");
    var od = og.createImageData(tw, th);
    var dst = od.data;
    var y;
    var x;
    var fy;
    var fx;
    for (y = 0; y < th; y++) {
      for (x = 0; x < tw; x++) {
        var maxA = 0;
        for (fy = 0; fy < factor; fy++) {
          for (fx = 0; fx < factor; fx++) {
            var a = src[((y * factor + fy) * big.width + (x * factor + fx)) * 4 + 3];
            if (a > maxA) maxA = a;
          }
        }
        if (maxA > 36) {
          var i = (y * tw + x) * 4;
          dst[i] = 243;
          dst[i + 1] = 238;
          dst[i + 2] = 230;
          dst[i + 3] = 255;
        }
      }
    }
    og.putImageData(od, 0, 0);
    return out;
  }

  function buildSprites() {
    var still = mark.querySelector(".logo-still");
    var word = frame.parentElement ? frame.parentElement.querySelector(".wordmark") : null;
    if (still && still.naturalWidth) {
      var cropped = cropOpaque(still);
      stillSprite = cropped;
      markSprite = pixelate(cropped, 48, 36);
    } else if (still) {
      still.addEventListener("load", buildSprites, { once: true });
    }
    if (word && word.naturalWidth) {
      var croppedWord = cropOpaque(word);
      if (croppedWord) {
        var th = 22;
        var tw = Math.max(8, Math.round(croppedWord.width * (th / croppedWord.height)));
        wordSprite = pixelate(croppedWord, tw, th);
      }
    } else if (word) {
      word.addEventListener("load", buildSprites, { once: true });
    }
  }

  function isWall(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) return true;
    return level === 2 && MAZE[y].charAt(x) === "#";
  }

  function mazeSnake() {
    return [
      { x: 2, y: 4 },
      { x: 1, y: 4 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 8, y: 2 },
      { x: 7, y: 2 },
      { x: 6, y: 2 },
      { x: 5, y: 2 },
      { x: 4, y: 2 }
    ];
  }

  function occupyMap() {
    var on = {};
    for (var i = 0; i < snake.length; i++) on[snake[i].x + "," + snake[i].y] = 1;
    return on;
  }

  function spawnFood() {
    var on = occupyMap();
    var open = [];
    for (var y = 1; y < ROWS - 1; y++) {
      for (var x = 1; x < COLS - 1; x++) {
        if (isWall(x, y) || on[x + "," + y]) continue;
        open.push({ x: x, y: y });
      }
    }
    if (!open.length) {
      score += 200;
      if (score > best) {
        best = score;
        saveBest(best);
      }
      win = true;
      mode = "over";
      showOver();
      chimeWord();
      announce();
      return;
    }
    var cell = open[Math.floor(Math.random() * open.length)];
    var letter = (eats + 1) % 3 === 0;
    var ch = "OMUN".charAt(spelled.length) || "O";
    food = { x: cell.x, y: cell.y, kind: letter ? "letter" : "spark", ch: ch };
  }

  function retune() {
    tickMs = 188 - Math.floor(eats / 3) * 8;
    if (tickMs < 88) tickMs = 88;
    if (level === 2 && tickMs < 112) tickMs = 112;
  }

  function reset(first) {
    level = 1;
    score = 0;
    eats = 0;
    spelled = "";
    wordClearAt = 0;
    win = false;
    dir = "right";
    queue = [];
    parts = [];
    tickMs = 188;
    armed = false;
    snake = [
      { x: 4, y: 6 },
      { x: 3, y: 6 },
      { x: 2, y: 6 }
    ];
    spawnFood();
    if (overEl) overEl.hidden = true;
    if (first && !reduce) {
      mode = "intro";
      introStart = performance.now();
    } else {
      mode = "play";
      acc = 0;
      last = performance.now();
    }
    announce();
  }

  function enterLevel2() {
    level = 2;
    mode = "level";
    levelUntil = performance.now() + (reduce ? 1100 : 1850);
    dir = "right";
    queue = [];
    armed = true;
    tickMs = 190;
    snake = mazeSnake();
    if (spelled === "OMUN") wordClearAt = levelUntil;
    spawnFood();
    chimeLevel();
    announce();
  }

  function showOver() {
    mode = "over";
    if (overEl) overEl.hidden = false;
    if (restartBtn) {
      try {
        restartBtn.focus({ preventScroll: true });
      } catch (err) {
        restartBtn.focus();
      }
    }
  }

  function die() {
    if (score > best) {
      best = score;
      saveBest(best);
    }
    win = false;
    chimeDie();
    showOver();
    announce();
  }

  function step() {
    if (queue.length) {
      var next = queue.shift();
      if (next !== OPP[dir]) dir = next;
    }
    var d = DIRS[dir];
    var head = snake[0];
    var nx = head.x + d.x;
    var ny = head.y + d.y;
    if (isWall(nx, ny)) return die();
    var eating = food && food.x === nx && food.y === ny;
    var limit = eating ? snake.length : snake.length - 1;
    var i;
    for (i = 0; i < limit; i++) {
      if (snake[i].x === nx && snake[i].y === ny) return die();
    }
    snake.unshift({ x: nx, y: ny });
    if (!eating) {
      snake.pop();
      return;
    }
    var letter = food.kind === "letter";
    score += letter ? 50 : 10;
    if (letter) {
      spelled += food.ch;
      if (spelled === "OMUN") {
        score += 100;
        wordClearAt = performance.now() + 1100;
        chimeWord();
      } else {
        chimeLetter();
      }
    } else {
      chimeEat();
    }
    eats += 1;
    if (score > best) {
      best = score;
      saveBest(best);
    }
    burst(nx, ny, letter);
    retune();
    if (level === 1 && snake.length >= LEVEL2_AT) {
      enterLevel2();
      return;
    }
    spawnFood();
    announce();
  }

  function burst(x, y, letter) {
    if (reduce) return;
    for (var i = 0; i < 6; i++) {
      var ang = (Math.PI * 2 * i) / 6;
      parts.push({
        x: x * CELL + CELL / 2,
        y: HUD + y * CELL + CELL / 2,
        vx: Math.cos(ang) * 0.045,
        vy: Math.sin(ang) * 0.045,
        life: 260,
        letter: letter
      });
    }
  }

  function announce() {
    if (!live) return;
    var msg = t("spark.score") + " " + score + ". " + t("spark.best") + " " + best + ".";
    if (mode === "level") msg = t("spark.level") + ". " + msg;
    if (mode === "over") msg = (win ? t("spark.clear") : t("spark.over")) + ". " + msg;
    if (spelled) msg += " " + t("spark.letters") + " " + spelled + ".";
    live.setAttribute("aria-live", mode === "over" || mode === "level" ? "assertive" : "polite");
    live.textContent = msg;
  }

  function setDir(name) {
    if (!name || mode === "over" || mode === "level") return;
    armed = true;
    var lastDir = queue.length ? queue[queue.length - 1] : dir;
    if (name === lastDir || name === OPP[lastDir]) return;
    if (queue.length >= 2) queue.shift();
    queue.push(name);
  }

  function drawBoard() {
    var y;
    var x;
    ctx.fillStyle = BG;
    ctx.fillRect(0, HUD, W, ROWS * CELL);
    for (y = 0; y < ROWS; y++) {
      for (x = 0; x < COLS; x++) {
        if (!isWall(x, y)) {
          if ((x + y) % 2 === 0) {
            ctx.fillStyle = "#120e18";
            ctx.fillRect(x * CELL, HUD + y * CELL, CELL, CELL);
          }
          continue;
        }
        var px = x * CELL;
        var py = HUD + y * CELL;
        ctx.fillStyle = CREAM;
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = BG;
        ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        ctx.fillStyle = (x + y) % 2 === 0 ? BLOOD : CREAM;
        ctx.fillRect(px + 4, py + 4, 2, 2);
        ctx.fillRect(px + 8, py + 8, 2, 2);
      }
    }
  }

  function drawFood(now) {
    if (!food) return;
    var px = food.x * CELL;
    var py = HUD + food.y * CELL;
    var pulse = Math.floor(now / 170) % 2 === 0;
    if (food.kind === "letter") {
      ctx.fillStyle = pulse ? BLOOD : "#6E0B14";
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      drawText(ctx, food.ch, px + 4, py + 2, 2, CREAM);
      return;
    }
    var cx = px + 7;
    var cy = py + 7;
    var arm = pulse ? 5 : 3;
    ctx.fillStyle = BLOOD;
    ctx.fillRect(cx - 1, cy - arm, 2, arm * 2);
    ctx.fillRect(cx - arm, cy - 1, arm * 2, 2);
    ctx.fillStyle = CREAM;
    ctx.fillRect(cx - 1, cy - 1, 2, 2);
  }

  function drawSnake() {
    var i;
    for (i = snake.length - 1; i >= 1; i--) {
      var seg = snake[i];
      var inset = i > snake.length * 0.7 ? 3 : 2;
      ctx.fillStyle = i % 5 === 0 ? BLOOD : CREAM;
      ctx.fillRect(seg.x * CELL + inset, HUD + seg.y * CELL + inset, CELL - inset * 2, CELL - inset * 2);
    }
    var head = snake[0];
    var cx = head.x * CELL + CELL / 2;
    var cy = HUD + head.y * CELL + CELL / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, HUD, W, ROWS * CELL);
    ctx.clip();
    if (markSprite) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(markSprite, Math.round(cx - markSprite.width / 2), Math.round(cy - markSprite.height / 2));
    } else {
      ctx.fillStyle = CREAM;
      ctx.fillRect(cx - 6, cy - 6, 12, 12);
    }
    ctx.restore();
  }

  function drawParts(dt) {
    var i;
    for (i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, p.life / 260);
      ctx.fillStyle = p.letter ? BLOOD : CREAM;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      ctx.globalAlpha = 1;
    }
  }

  function drawHud() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, HUD);
    ctx.fillStyle = BLOOD;
    ctx.fillRect(0, HUD - 2, W, 2);
    drawText(ctx, String(score), 8, 4, 3, CREAM);
    var letters = "OMUN";
    var lx = 8;
    var i;
    for (i = 0; i < 4; i++) {
      var next = i === spelled.length;
      var col = i <= spelled.length ? CREAM : DIM;
      drawText(ctx, letters.charAt(i), lx, 22, 2, col);
      if (next) {
        ctx.fillStyle = BLOOD;
        ctx.fillRect(lx, 32, 6, 2);
      }
      lx += 9;
    }
    if (wordSprite) {
      var wy = Math.round((HUD - 4 - wordSprite.height) / 2);
      var leftPad = 72;
      var rightPad = 84;
      var wx = leftPad + Math.round((W - leftPad - rightPad - wordSprite.width) / 2);
      if (wx < leftPad) wx = leftPad;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(wordSprite, wx, wy);
    }
  }

  function drawPixelated(src, dx, dy, dw, dh, block) {
    if (!src || !scratch) return;
    var sw = Math.max(1, Math.round(dw / block));
    var sh = Math.max(1, Math.round(dh / block));
    if (scratch.width !== sw || scratch.height !== sh) {
      scratch.width = sw;
      scratch.height = sh;
    }
    var sg = scratch.getContext("2d");
    sg.imageSmoothingEnabled = true;
    sg.clearRect(0, 0, sw, sh);
    sg.drawImage(src, 0, 0, sw, sh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratch, dx, dy, dw, dh);
  }

  function drawIntro(now) {
    var dur = reduce ? 1 : 860;
    var t = Math.max(0, Math.min(1, (now - introStart) / dur));
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    if (t > 0.42) {
      ctx.save();
      ctx.globalAlpha = (t - 0.42) / 0.58;
      drawBoard();
      drawFood(now);
      drawSnake();
      drawHud();
      ctx.restore();
    }
    var block = 1 + Math.round(t * 9);
    var head = snake[0];
    var hx = head.x * CELL + CELL / 2;
    var hy = HUD + head.y * CELL + CELL / 2;
    var src = stillSprite || markSprite;
    var ratio = src && src.width ? src.height / src.width : 0.78;
    var startW = Math.round(W * 0.8);
    var startH = Math.round(startW * ratio);
    var endW = markSprite ? markSprite.width : 36;
    var endH = markSprite ? markSprite.height : 28;
    var u = t < 0.32 ? 0 : (t - 0.32) / 0.68;
    u = u * u * (3 - 2 * u);
    var dw = Math.round(startW + (endW - startW) * u);
    var dh = Math.round(startH + (endH - startH) * u);
    var dx = Math.round((W - startW) / 2 + (hx - endW / 2 - (W - startW) / 2) * u);
    var dy = Math.round((H - startH) / 2 + (hy - endH / 2 - (H - startH) / 2) * u);
    if (src) drawPixelated(src, dx, dy, dw, dh, block);
    if (t >= 1) {
      mode = "play";
      last = now;
      acc = 0;
    }
  }

  function drawLevelCard() {
    ctx.fillStyle = "rgba(11, 7, 16, 0.78)";
    ctx.fillRect(0, HUD, W, H - HUD);
    if (markSprite) {
      var dw = 76;
      var dh = Math.round(dw * markSprite.height / markSprite.width);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(markSprite, Math.round((W - dw) / 2), HUD + 14, dw, dh);
    }
    centerText(ctx, "LEVEL 2", HUD + 96, 3, CREAM);
    if (wordSprite) {
      var ww = Math.min(110, wordSprite.width);
      var wh = Math.round(ww * wordSprite.height / wordSprite.width);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(wordSprite, Math.round((W - ww) / 2), HUD + 120, ww, wh);
    }
  }

  function drawGameOver() {
    ctx.fillStyle = "rgba(11, 7, 16, 0.8)";
    ctx.fillRect(0, HUD, W, H - HUD);
    if (markSprite) {
      var dw = 62;
      var dh = Math.round(dw * markSprite.height / markSprite.width);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(markSprite, Math.round((W - dw) / 2), HUD + 6, dw, dh);
    }
    centerText(ctx, win ? "CLEAR" : "GAME OVER", HUD + 70, 3, CREAM);
    centerText(ctx, String(score), HUD + 92, 3, BLOOD);
    centerText(ctx, "BEST " + best, HUD + 114, 2, MUTED);
  }

  function frameTick(now) {
    if (!active) return;
    if (document.hidden) {
      last = now;
      raf = requestAnimationFrame(frameTick);
      return;
    }
    var dt = last ? Math.min(48, now - last) : 16;
    last = now;
    if (wordClearAt && spelled === "OMUN" && now >= wordClearAt && mode === "play") {
      spelled = "";
      wordClearAt = 0;
    }
    ctx.imageSmoothingEnabled = false;
    if (mode === "intro") {
      drawIntro(now);
    } else if (mode === "level") {
      if (now >= levelUntil) {
        mode = "play";
        acc = 0;
        if (spelled === "OMUN") {
          spelled = "";
          wordClearAt = 0;
        }
      }
      drawBoard();
      drawFood(now);
      drawSnake();
      drawHud();
      drawLevelCard();
    } else if (mode === "play") {
      if (armed) acc += dt;
      var guard = 0;
      while (mode === "play" && armed && acc >= tickMs && guard < 3) {
        acc -= tickMs;
        step();
        guard += 1;
      }
      drawBoard();
      drawFood(now);
      drawSnake();
      drawParts(dt);
      drawHud();
      if (mode === "over") drawGameOver();
      if (mode === "level") drawLevelCard();
    } else if (mode === "over") {
      drawBoard();
      drawSnake();
      drawHud();
      drawGameOver();
    }
    raf = requestAnimationFrame(frameTick);
  }

  function ensureAudio() {
    if (audio) return audio;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try {
      audio = new AC();
    } catch (err) {
      audio = null;
    }
    return audio;
  }

  function tone(freq, t0, dur) {
    if (!soundOn || !audio) return;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.04, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function chimeEat() {
    if (!soundOn || !audio) return;
    tone(620, audio.currentTime, 0.06);
  }

  function chimeLetter() {
    if (!soundOn || !audio) return;
    var t0 = audio.currentTime;
    tone(523, t0, 0.07);
    tone(784, t0 + 0.08, 0.09);
  }

  function chimeWord() {
    if (!soundOn || !audio) return;
    var t0 = audio.currentTime;
    tone(523, t0, 0.08);
    tone(659, t0 + 0.09, 0.08);
    tone(880, t0 + 0.18, 0.12);
  }

  function chimeLevel() {
    if (!soundOn || !audio) return;
    var t0 = audio.currentTime;
    tone(392, t0, 0.09);
    tone(523, t0 + 0.1, 0.09);
    tone(784, t0 + 0.2, 0.14);
  }

  function chimeDie() {
    if (!soundOn || !audio) return;
    var t0 = audio.currentTime;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(240, t0);
    osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.28);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.045, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + 0.32);
  }

  function syncMute() {
    if (!muteBtn) return;
    muteBtn.setAttribute("aria-pressed", soundOn ? "false" : "true");
    muteBtn.setAttribute("aria-label", soundOn ? t("spark.soundOff") : t("spark.soundOn"));
    muteBtn.innerHTML = soundOn ? ICON_SOUND_ON : ICON_SOUND_OFF;
  }

  function toggleSound() {
    soundOn = !soundOn;
    syncMute();
    if (!soundOn) return;
    var ac = ensureAudio();
    if (ac && ac.state === "suspended" && ac.resume) ac.resume();
    chimeEat();
  }

  function onKey(e) {
    if (!active) return;
    var typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable);
    if (e.key === "Escape") {
      if (typing) return;
      e.preventDefault();
      e.stopPropagation();
      exit();
      return;
    }
    if (typing) return;
    var name = KEYS[e.key];
    if (!name) return;
    e.preventDefault();
    e.stopPropagation();
    setDir(name);
  }

  function onTouchMove(e) {
    if (!active || !e.cancelable) return;
    e.preventDefault();
  }

  function onTouchStart(e) {
    if (!active || e.touches.length !== 1) return;
    if (e.target && e.target.closest && e.target.closest("button")) return;
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e) {
    if (!touch || !e.changedTouches.length) {
      touch = null;
      return;
    }
    var point = e.changedTouches[0];
    var dx = point.clientX - touch.x;
    var dy = point.clientY - touch.y;
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
    else setDir(dy > 0 ? "down" : "up");
  }

  function padDir(name) {
    var now = performance.now();
    if (now - padStamp < 50) return;
    padStamp = now;
    setDir(name);
  }

  function makeButton(className, label, html) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = html;
    return btn;
  }

  function mount() {
    root = document.createElement("div");
    root.className = "spark";
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", t("spark.region"));
    root.tabIndex = -1;

    var bar = document.createElement("div");
    bar.className = "spark-bar";
    muteBtn = makeButton("spark-icon", t("spark.soundOn"), ICON_SOUND_OFF);
    muteBtn.setAttribute("aria-pressed", "true");
    closeBtn = makeButton("spark-icon", t("spark.close"), ICON_CLOSE);
    muteBtn.addEventListener("click", toggleSound);
    closeBtn.addEventListener("click", exit);
    bar.appendChild(muteBtn);
    bar.appendChild(closeBtn);

    live = document.createElement("p");
    live.className = "spark-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");

    helpEl = document.createElement("p");
    helpEl.className = "spark-help";
    helpEl.textContent = t("spark.help");

    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d");
    scratch = document.createElement("canvas");

    overEl = document.createElement("div");
    overEl.className = "spark-over";
    overEl.hidden = true;
    restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.className = "spark-restart";
    restartBtn.textContent = t("spark.restart");
    restartBtn.addEventListener("click", function () {
      reset(false);
      try {
        root.focus({ preventScroll: true });
      } catch (err) {
        root.focus();
      }
    });
    overEl.appendChild(restartBtn);

    var pad = document.createElement("div");
    pad.className = "spark-pad";
    pad.setAttribute("role", "group");
    pad.setAttribute("aria-label", t("spark.help"));
    ["up", "left", "down", "right"].forEach(function (name) {
      var btn = makeButton("", t("spark." + name), ICON_ARROW[name]);
      btn.setAttribute("data-dir", name);
      btn.addEventListener("click", function () { padDir(name); });
      pad.appendChild(btn);
    });

    root.appendChild(bar);
    root.appendChild(live);
    root.appendChild(canvas);
    root.appendChild(overEl);
    root.appendChild(pad);
    frame.appendChild(root);
    var title = frame.parentElement && frame.parentElement.querySelector(".wordmark-title");
    if (title) title.parentElement.insertBefore(helpEl, title);
    else root.appendChild(helpEl);

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
  }

  function focusEl(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (err) {
      el.focus();
    }
  }

  function start(target) {
    if (active || !target) return;
    mark = target;
    frame = mark.parentElement || mark;
    reduce = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
    best = loadBest();
    soundOn = false;
    buildSprites();
    mount();
    if (!ctx) {
      if (helpEl && helpEl.parentNode) helpEl.parentNode.removeChild(helpEl);
      if (root && root.parentNode) root.parentNode.removeChild(root);
      return;
    }
    active = true;
    mark.classList.add("is-quiet");
    mark.setAttribute("aria-hidden", "true");
    mark.tabIndex = -1;
    document.documentElement.classList.add("spark-lock");
    var video = mark.querySelector(".logo-motion");
    if (video && !video.paused) {
      video.pause();
    }
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    reset(true);
    last = performance.now();
    raf = requestAnimationFrame(frameTick);
    focusEl(root);
  }

  function exit() {
    if (!active) return;
    active = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("touchmove", onTouchMove);
    document.documentElement.classList.remove("spark-lock");
    if (helpEl && helpEl.parentNode) helpEl.parentNode.removeChild(helpEl);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    if (mark) {
      mark.classList.remove("is-quiet");
      mark.removeAttribute("aria-hidden");
      mark.removeAttribute("tabindex");
      var video = mark.querySelector(".logo-motion");
      if (video && mark.classList.contains("is-playing")) {
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      }
      focusEl(mark);
    }
    root = null;
    canvas = null;
    ctx = null;
  }

  global.OMUN_SPARK = {
    start: start,
    exit: exit
  };
})(window);
