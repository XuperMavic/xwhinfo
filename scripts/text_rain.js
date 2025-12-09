// 中文文字雨主题效果
// 固定在当前页面的可视区域上方绘制中文字符下落动画
(function() {
  const CHAR_SET = '永学知信义礼智德诗书仁礼乐春福喜乐光影风雨山海星辰未来科技探索创造梦华夏文明传承创新青年理想';
  let running = false;
  let canvas = null;
  let ctx = null;
  let columns = [];
  let fontSize = 18; // 文字大小（像素）
  let animationId = null;

  function createCanvas() {
    if (canvas && canvas.parentElement) return canvas;
    canvas = document.createElement('canvas');
    canvas.className = 'text-rain-layer';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0'; // 在内容之下
    canvas.style.pointerEvents = 'none';
    return canvas;
  }

  function getActivePage() {
    const page = document.querySelector('.page.active');
    if (!page) return null;
    // 文字雨不在首页显示
    if (page.id === 'home') return null;
    return page;
  }

  function ensureCanvasMounted() {
    const page = getActivePage();
    if (!page) return false;
    // 确保页面具备相对定位与独立堆叠上下文（CSS里也已为theme-rain设置）
    if (page.style.position !== 'relative') {
      page.style.position = 'relative';
      page.style.isolation = 'isolate';
    }
    const layer = createCanvas();
    if (!layer.parentElement) {
      page.insertBefore(layer, page.firstChild);
    }
    ctx = layer.getContext('2d');
    resize();
    return true;
  }

  function resize() {
    if (!canvas) return;
    const page = getActivePage();
    if (!page) return;
    const rect = page.getBoundingClientRect();
    canvas.width = Math.max(rect.width, window.innerWidth);
    canvas.height = Math.max(rect.height, window.innerHeight);

    fontSize = Math.max(14, Math.min(26, Math.round((window.innerWidth + window.innerHeight) / 150)));
    columns = [];
    const columnCount = Math.floor(canvas.width / fontSize);
    for (let i = 0; i < columnCount; i++) {
      columns[i] = {
        y: Math.random() * -canvas.height, // 从视图上方随机开始
        speed: fontSize * (0.4 + Math.random() * 0.8),
      };
    }
    if (ctx) {
      ctx.font = `${fontSize}px "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`;
    }
  }

  function randomChar() {
    const idx = Math.floor(Math.random() * CHAR_SET.length);
    return CHAR_SET[idx];
  }

  function drawFrame() {
    if (!running || !ctx || !canvas) return;
    // 半透明覆盖，产生拖影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制每列字符
    for (let i = 0; i < columns.length; i++) {
      const x = i * fontSize;
      const col = columns[i];
      ctx.fillStyle = 'rgba(0, 255, 170, 0.85)'; // 绿色主字符
      ctx.fillText(randomChar(), x, col.y);
      // 轻微发光效果（叠加一次更浅色）
      ctx.fillStyle = 'rgba(0, 255, 170, 0.25)';
      ctx.fillText(randomChar(), x, col.y - fontSize * 1.2);

      col.y += col.speed * 0.03; // 速度缩放适应帧率（减速）
      if (col.y > canvas.height + fontSize * 2) {
        col.y = -Math.random() * canvas.height;
        col.speed = fontSize * (0.4 + Math.random() * 0.8);
      }
    }

    animationId = window.requestAnimationFrame(drawFrame);
  }

  function start() {
    if (running) return;
    running = true;
    if (!ensureCanvasMounted()) return;
    if (!ctx) return;
    // 清空初始背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animationId = window.requestAnimationFrame(drawFrame);
  }

  function stop() {
    running = false;
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvas && canvas.parentElement) {
      try { canvas.parentElement.removeChild(canvas); } catch (e) {}
    }
    canvas = null;
    ctx = null;
    columns = [];
  }

  // 监听窗口大小与哈希变化，保持覆盖正确的页
  window.addEventListener('resize', () => { if (running) resize(); }, { passive: true });
  window.addEventListener('hashchange', () => {
    const page = getActivePage();
    const isRain = document.body.classList.contains('theme-rain');
    // 无活动页（或首页）时停止效果
    if (!page) { stop(); return; }
    // 若当前主题为 rain 且效果未运行，则在新页启动
    if (!running && isRain) { start(); return; }
    // 若未运行且非 rain 主题，直接返回
    if (!running) return;
    // 将图层移到新的 active 页面并适配尺寸
    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    ensureCanvasMounted();
    resize();
  });

  // 响应主题切换
  window.addEventListener('themechange', (e) => {
    const theme = e.detail;
    if (theme === 'rain') {
      const page = getActivePage();
      if (page) {
        start();
      } else {
        stop();
      }
    } else {
      stop();
    }
  });

  // 初始载入时，根据当前主题决定是否启动
  document.addEventListener('DOMContentLoaded', () => {
    const saved = (localStorage.getItem('theme') || 'rain');
    const normalized = (saved === 'cyber' || saved === 'spot' || saved === 'yellow') ? 'sun' : saved;
    if (normalized === 'rain') {
      const page = getActivePage();
      if (page) start();
    }
  });
})();