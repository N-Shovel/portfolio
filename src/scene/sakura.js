// A sakura tree beside the sea, drawn on two stacked canvases:
// `base` holds the still scene (sky, sea, shore, tree) and is redrawn only on resize or theme change;
// `fx` is animated every frame: falling petals, ripples, glints on the water, and stars at night.

const TAU = Math.PI * 2;

const THEMES = {
  light: {
    sky: [[0, '#c4daf1'], [0.45, '#e4e0f3'], [0.8, '#f8e0e9'], [1, '#fde6db']],
    orbCore: '#fffaf0', orbGlow: '255, 212, 186', orbGlowAlpha: 0.65, moon: false,
    cloud: '255, 255, 255', cloudAlpha: 0.55,
    far: '#cdbfdf', near: '#b9abd2', snow: 'rgba(255, 255, 255, 0.8)',
    sea: [[0, '#c4daee'], [0.3, '#a2c2df'], [1, '#6893bd']],
    path: '255, 241, 228', pathGlow: 0.55, wave: '255, 255, 255',
    horizonLine: 'rgba(255, 255, 255, 0.7)',
    land: ['#7f9f88', '#56735f'], grass: '#678f73', foam: 0.55,
    trunk: '#4a3436', bark: '#7d5c5e',
    blossoms: ['#fff1f5', '#fcd8e3', '#f7bfd0', '#f0a3bb', '#e486a5'],
    glow: '248, 188, 207', glowAlpha: 0.3, flowerCenter: '#d9668c',
    petals: [['#fde4ec', '#f2a3bb'], ['#fff2f6', '#f6b9cb'], ['#fbd1de', '#e88aa9']],
    glint: '255, 255, 255', stars: 0,
  },
  dark: {
    sky: [[0, '#04071a'], [0.5, '#0c1335'], [0.82, '#1c1b47'], [1, '#30285a']],
    orbCore: '#f6f1e4', orbGlow: '214, 208, 255', orbGlowAlpha: 0.35, moon: true,
    cloud: '150, 130, 210', cloudAlpha: 0.13,
    far: '#1f2350', near: '#171a3f', snow: 'rgba(215, 218, 250, 0.32)',
    sea: [[0, '#222558'], [0.3, '#131942'], [1, '#03050f']],
    path: '228, 224, 255', pathGlow: 0.32, wave: '160, 170, 255',
    horizonLine: 'rgba(200, 200, 255, 0.2)',
    land: ['#11152c', '#060814'], grass: '#1b2140', foam: 0.22,
    trunk: '#130d1a', bark: '#2e233b',
    blossoms: ['#efcddb', '#dca5bd', '#c487a3', '#a66b8d', '#7e4d6f'],
    glow: '196, 128, 166', glowAlpha: 0.2, flowerCenter: '#8f4f74',
    petals: [['#f3d0dd', '#c37b9c'], ['#f9dfe8', '#d593ae'], ['#e9b7ca', '#ad6a8c']],
    glint: '226, 226, 255', stars: 160,
  },
};

// Small seeded random generator, so the tree looks the same on every redraw.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function quad(a, c, b, t) {
  const u = 1 - t;
  return u * u * a + 2 * u * t * c + t * t * b;
}

// `clear` is the intro text in page coordinates ({ top, bottom, skyTop }). The sun or moon and the far peak
// stay clear of it, so on short screens the horizon moves down with them.
function makeLayout(W, H, clear) {
  const mobile = W < 768;
  const ground = Math.round(H * (mobile ? 0.9 : 0.86));
  const S = mobile ? Math.min(W * 0.78, H * 0.38) : Math.min(W * 0.42, H * 0.8);
  const baseX = mobile ? W * 0.8 : W - Math.min(W * 0.09, 130);
  const rise = S * 0.3;
  const shoreX = baseX - S * 0.55;
  // y of the grassy bank at x, or Infinity over open water
  const landTop = (x) => {
    if (x < shoreX) return Infinity;
    if (x < shoreX + rise) {
      const t = (x - shoreX) / rise;
      return H - (H - ground) * t * t * (3 - 2 * t);
    }
    return ground - (x - shoreX - rise) * 0.04;
  };
  let r = mobile ? 20 : 30;
  // how high the sun or moon sits above the horizon
  const lift = mobile ? r + 16 : H * 0.075;
  let horizon = Math.round(H * (mobile ? 0.7 : 0.64));
  let orbY = horizon - lift;
  let peakH = mobile ? 0 : H * 0.1;
  if (clear) {
    const below = Math.max(orbY, clear.bottom + r + 20);
    const maxHorizon = H * (mobile ? 0.8 : 0.76);
    // when space is tight the orb may sit lower, down to 10px above the horizon
    const gap = Math.min(lift, Math.max(r + 10, maxHorizon - below));
    if (below + gap <= maxHorizon) {
      orbY = below;
      horizon = Math.max(horizon, Math.round(below + gap));
    } else {
      // the text runs past the horizon (e.g. a landscape phone): use the strip of sky above it instead
      r = Math.max(14, Math.min(r, (clear.top - clear.skyTop) / 2 - 8));
      orbY = (clear.skyTop + clear.top) / 2;
    }
    // the peak is lowered to stay under the text, and left out if too little of it is left
    peakH = Math.min(peakH, horizon - clear.bottom - 12);
    if (peakH < H * 0.04) peakH = 0;
  }
  const orb = { x: W * (mobile ? 0.16 : 0.41), y: orbY, r };
  return { W, H, mobile, horizon, ground, S, baseX, rise, shoreX, landTop, orb, peakH, clear };
}

function buildTree(L) {
  const rand = rng(1234);
  const maxDepth = L.mobile ? 5 : 6;
  const segs = [];
  const clusters = [];
  const grow = (x, y, angle, len, width, depth) => {
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const bend = (rand() - 0.5) * len * 0.45;
    const cx = (x + ex) / 2 - Math.sin(angle) * bend;
    const cy = (y + ey) / 2 + Math.cos(angle) * bend;
    const w1 = width * 0.72;
    segs.push({ x0: x, y0: y, cx, cy, x1: ex, y1: ey, w0: width, w1, depth });
    if (depth >= 3 && rand() < 0.7) {
      const n = depth >= maxDepth - 1 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const t = 0.3 + rand() * 0.65;
        clusters.push({ x: quad(x, cx, ex, t), y: quad(y, cy, ey, t), r: L.S * (0.026 + rand() * 0.022) });
      }
    }
    if (depth === maxDepth) {
      clusters.push({ x: ex, y: ey, r: L.S * (0.04 + rand() * 0.03) });
      return;
    }
    const kids = depth === 0 ? 2 : rand() < 0.3 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      let a = angle + (i - (kids - 1) / 2) * (0.75 + rand() * 0.35) + (rand() - 0.5) * 0.3;
      // sakura limbs spread wide: pull outer branches toward the horizontal
      const toward = a < -Math.PI / 2 ? -Math.PI * 0.95 : -Math.PI * 0.05;
      a += (toward - a) * 0.14 * (depth / maxDepth);
      // never grow much below the horizontal
      a = Math.max(-Math.PI * 1.05, Math.min(Math.PI * 0.05, a));
      grow(ex, ey, a, len * (0.72 + rand() * 0.12), w1 * (0.74 + rand() * 0.1), depth + 1);
    }
  };
  // the trunk leans toward the sea before it splits
  grow(L.baseX, L.landTop(L.baseX) + 3, -Math.PI / 2 - 0.12, L.S * 0.28, L.S * 0.06, 0);
  return { segs, clusters };
}

function drawSky(ctx, T, L) {
  const { W, H, horizon, orb, mobile } = L;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  for (const [o, c] of T.sky) sky.addColorStop(o, c);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon + 1);

  const glow = ctx.createRadialGradient(orb.x, orb.y, orb.r * 0.6, orb.x, orb.y, orb.r * 8);
  glow.addColorStop(0, `rgba(${T.orbGlow}, ${T.orbGlowAlpha})`);
  glow.addColorStop(1, `rgba(${T.orbGlow}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, horizon);

  // soft, stretched clouds
  const rand = rng(3);
  for (let i = 0; i < 5; i++) {
    const rx = W * (0.12 + rand() * 0.18);
    ctx.save();
    ctx.translate(rand() * W, horizon * (0.15 + rand() * 0.7));
    ctx.scale(1, 0.16);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(${T.cloud}, ${T.cloudAlpha})`);
    g.addColorStop(1, `rgba(${T.cloud}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // the sun by day, the moon by night
  ctx.fillStyle = T.orbCore;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.r, 0, TAU);
  ctx.fill();
  if (T.moon) {
    ctx.fillStyle = 'rgba(170, 165, 200, 0.2)';
    for (const [dx, dy, r] of [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.16], [0.05, 0.42, 0.1]]) {
      ctx.beginPath();
      ctx.arc(orb.x + dx * orb.r, orb.y + dy * orb.r, r * orb.r, 0, TAU);
      ctx.fill();
    }
  }

  // a low, far range of hills on the horizon
  const end = W * (mobile ? 0.6 : 0.36);
  const p1 = rand() * TAU;
  const p2 = rand() * TAU;
  ctx.fillStyle = T.far;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= end; x += 6) {
    const k = x / end;
    const h = (Math.sin(x * 0.012 + p1) * 0.5 + Math.sin(x * 0.031 + p2) * 0.3 + 0.9) * H * 0.022 * (1 - k * k);
    ctx.lineTo(x, horizon - h);
  }
  ctx.lineTo(end, horizon);
  ctx.closePath();
  ctx.fill();

  // a lone snow-capped peak in the distance (not on phones)
  if (!L.peakH) return;
  const fx = W * 0.17;
  const bw = W * 0.2;
  const h = L.peakH;
  ctx.fillStyle = T.near;
  ctx.beginPath();
  ctx.moveTo(fx - bw / 2, horizon);
  ctx.quadraticCurveTo(fx - bw * 0.16, horizon - h * 0.72, fx - bw * 0.07, horizon - h);
  ctx.lineTo(fx + bw * 0.07, horizon - h);
  ctx.quadraticCurveTo(fx + bw * 0.16, horizon - h * 0.72, fx + bw / 2, horizon);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = T.snow;
  ctx.beginPath();
  ctx.moveTo(fx - bw * 0.07, horizon - h);
  ctx.lineTo(fx + bw * 0.07, horizon - h);
  for (const [dx, dy] of [[0.12, 0.8], [0.09, 0.74], [0.05, 0.82], [0, 0.73], [-0.05, 0.83], [-0.09, 0.75], [-0.12, 0.8]]) {
    ctx.lineTo(fx + bw * dx, horizon - h * dy);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSea(ctx, T, L) {
  const { W, H, horizon, orb } = L;
  const sea = ctx.createLinearGradient(0, horizon, 0, H);
  for (const [o, c] of T.sea) sea.addColorStop(o, c);
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, W, H - horizon);

  // soft glow on the water below the sun or moon
  ctx.save();
  ctx.translate(orb.x, horizon);
  ctx.scale(1, 2.4);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, orb.r * 5);
  glow.addColorStop(0, `rgba(${T.path}, ${T.pathGlow})`);
  glow.addColorStop(1, `rgba(${T.path}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, orb.r * 5, 0, Math.PI);
  ctx.fill();
  ctx.restore();

  // broken path of light across the water
  const rand = rng(13);
  for (let y = horizon + 2; y < H; y += 2.5 + (y - horizon) * 0.03) {
    const depth = (y - horizon) / (H - horizon);
    const half = orb.r * (0.7 + depth * 3.5);
    const alpha = 0.55 * Math.pow(1 - depth, 1.2) + 0.04;
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const w = half * (0.25 + rand() * 0.8);
      const x = orb.x + (rand() - 0.5) * half * 1.6;
      ctx.fillStyle = `rgba(${T.path}, ${alpha * (0.35 + rand() * 0.65)})`;
      ctx.fillRect(x - w / 2, y, w, 1 + depth * 1.6);
    }
  }

  // faint wave lines, denser toward the horizon
  ctx.fillStyle = `rgb(${T.wave})`;
  for (let i = 0; i < 140; i++) {
    const depth = Math.pow(rand(), 1.8);
    ctx.globalAlpha = 0.05 + rand() * 0.08;
    ctx.fillRect(rand() * W, horizon + 4 + depth * (H - horizon), 10 + depth * 70 + rand() * 30, 1);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = T.horizonLine;
  ctx.fillRect(0, horizon, W, 1);
}

function drawLand(ctx, T, L) {
  const { W, H, shoreX, rise, landTop } = L;
  const rand = rng(41);
  ctx.beginPath();
  ctx.moveTo(shoreX, H + 2);
  for (let x = shoreX; x <= W + 3; x += 3) ctx.lineTo(x, landTop(x));
  ctx.lineTo(W + 3, H + 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, L.ground - 20, 0, H);
  g.addColorStop(0, T.land[0]);
  g.addColorStop(1, T.land[1]);
  ctx.fillStyle = g;
  ctx.fill();

  // foam where the water meets the bank
  ctx.strokeStyle = `rgba(${T.glint}, ${T.foam})`;
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    ctx.lineWidth = k ? 1 : 1.6;
    ctx.globalAlpha = k ? 0.5 : 1;
    ctx.beginPath();
    for (let x = shoreX; x <= shoreX + rise * 0.9; x += 3) ctx.lineTo(x - 3 - k * 7, landTop(x) + 1 + k * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // grass tufts and fallen petals along the top of the bank
  ctx.strokeStyle = T.grass;
  ctx.lineWidth = 1;
  for (let x = shoreX + rise * 0.4; x < W; x += 2 + rand() * 4) {
    const y = landTop(x);
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x + (rand() - 0.5) * 4, y - 2 - rand() * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 70; i++) {
    const x = shoreX + rise * 0.5 + rand() * (W - shoreX - rise * 0.5);
    const top = landTop(x);
    ctx.fillStyle = T.blossoms[1 + Math.floor(rand() * 3)];
    ctx.beginPath();
    ctx.ellipse(x, top + 2 + rand() * Math.min(26, H - top), 2 + rand() * 2, 1.2 + rand(), rand() * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Strokes one branch as two halves so it tapers; `shift` offsets it toward the lit (left) side.
function strokeSeg(ctx, s, scale = 1, shift = 0) {
  let px = -(s.y1 - s.y0);
  let py = s.x1 - s.x0;
  const len = Math.hypot(px, py) || 1;
  px /= len;
  py /= len;
  if (px > 0) {
    px = -px;
    py = -py;
  }
  const d = ((s.w0 + s.w1) / 2) * shift;
  const ox = px * d;
  const oy = py * d;
  const q0x = (s.x0 + s.cx) / 2;
  const q0y = (s.y0 + s.cy) / 2;
  const q1x = (s.cx + s.x1) / 2;
  const q1y = (s.cy + s.y1) / 2;
  const mx = (q0x + q1x) / 2;
  const my = (q0y + q1y) / 2;
  ctx.lineWidth = Math.max(0.7, (s.w0 * 0.75 + s.w1 * 0.25) * scale);
  ctx.beginPath();
  ctx.moveTo(s.x0 + ox, s.y0 + oy);
  ctx.quadraticCurveTo(q0x + ox, q0y + oy, mx + ox, my + oy);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.7, (s.w0 * 0.25 + s.w1 * 0.75) * scale);
  ctx.beginPath();
  ctx.moveTo(mx + ox, my + oy);
  ctx.quadraticCurveTo(q1x + ox, q1y + oy, s.x1 + ox, s.y1 + oy);
  ctx.stroke();
}

function drawCluster(ctx, T, c, rand, alpha, shade) {
  const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 1.5);
  glow.addColorStop(0, `rgba(${T.glow}, ${T.glowAlpha * alpha})`);
  glow.addColorStop(1, `rgba(${T.glow}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r * 1.5, 0, TAU);
  ctx.fill();
  const n = Math.round(10 + c.r * 0.5);
  for (let i = 0; i < n; i++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * c.r;
    // lit from the upper left, so puffs on that side are paler
    const lit = ((-Math.cos(a) - Math.sin(a)) / Math.SQRT2) * (d / c.r);
    const idx = Math.max(0, Math.min(4, Math.round(2 - lit * 1.6 + shade + (rand() - 0.5) * 1.4)));
    ctx.fillStyle = T.blossoms[idx];
    ctx.globalAlpha = (0.5 + rand() * 0.4) * alpha;
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.85, c.r * (0.1 + rand() * 0.17), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFlower(ctx, T, x, y, r, rot) {
  ctx.fillStyle = T.blossoms[0];
  for (let k = 0; k < 5; k++) {
    const a = rot + (k / 5) * TAU;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.52, r * 0.38, a, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = T.flowerCenter;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.2, 0, TAU);
  ctx.fill();
}

function drawTree(ctx, T, tree) {
  const rand = rng(31);
  const { segs, clusters } = tree;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // flared base where the trunk meets the ground
  const t0 = segs[0];
  const w = t0.w0;
  const dl = Math.hypot(t0.cx - t0.x0, t0.cy - t0.y0) || 1;
  const dx = (t0.cx - t0.x0) / dl;
  const dy = (t0.cy - t0.y0) / dl;
  const topX = t0.x0 + dx * w * 1.1;
  const topY = t0.y0 + dy * w * 1.1;
  ctx.fillStyle = T.trunk;
  ctx.beginPath();
  ctx.moveTo(t0.x0 - w * 1.3, t0.y0 + 6);
  ctx.quadraticCurveTo(t0.x0 - w * 0.5, t0.y0 - w * 0.15, topX + dy * w * 0.45, topY - dx * w * 0.45);
  ctx.lineTo(topX - dy * w * 0.45, topY + dx * w * 0.45);
  ctx.quadraticCurveTo(t0.x0 + w * 0.5, t0.y0 - w * 0.15, t0.x0 + w * 1.2, t0.y0 + 6);
  ctx.closePath();
  ctx.fill();

  const thick = segs.filter((s) => s.depth <= 2);
  const thin = segs.filter((s) => s.depth > 2);
  ctx.strokeStyle = T.trunk;
  thick.forEach((s) => strokeSeg(ctx, s));
  ctx.strokeStyle = T.bark;
  ctx.globalAlpha = 0.5;
  thick.forEach((s) => strokeSeg(ctx, s, 0.18, 0.3));
  ctx.globalAlpha = 1;

  // blossoms behind the twigs, the twigs, then blossoms in front
  const back = [];
  const front = [];
  for (const c of clusters) (rand() < 0.45 ? back : front).push(c);
  back.forEach((c) => drawCluster(ctx, T, c, rand, 0.8, 1));
  ctx.strokeStyle = T.trunk;
  thin.forEach((s) => strokeSeg(ctx, s));
  front.forEach((c) => drawCluster(ctx, T, c, rand, 1, 0));

  // a scattering of crisp single flowers on top
  for (const c of front) {
    if (rand() > 0.5) continue;
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * TAU;
      const d = c.r * (0.4 + rand() * 0.7);
      drawFlower(ctx, T, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.85, c.r * (0.12 + rand() * 0.06), rand() * TAU);
    }
  }
}

// One petal drawn once to an offscreen canvas, pale at the notched tip and deeper at the base.
function makeSprite([light, deep]) {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, s * 0.95, 0, s * 0.05);
  grad.addColorStop(0, deep);
  grad.addColorStop(0.55, light);
  grad.addColorStop(1, light);
  g.fillStyle = grad;
  g.translate(s / 2, s / 2);
  const r = s * 0.46;
  g.beginPath();
  g.moveTo(0, r);
  g.bezierCurveTo(r * 0.95, r * 0.45, r * 0.85, -r * 0.6, r * 0.22, -r);
  g.lineTo(0, -r * 0.74);
  g.lineTo(-r * 0.22, -r);
  g.bezierCurveTo(-r * 0.85, -r * 0.6, -r * 0.95, r * 0.45, 0, r);
  g.fill();
  return c;
}

function makeStars(L, count) {
  const rand = rng(5);
  const stars = [];
  while (stars.length < count) {
    const x = rand() * L.W;
    const y = Math.pow(rand(), 1.4) * (L.horizon - 20);
    if (Math.hypot(x - L.orb.x, y - L.orb.y) < L.orb.r * 3) continue;
    stars.push({ x, y, r: rand() < 0.1 ? 1.6 : 0.6 + rand() * 0.8, a: 0.35 + rand() * 0.6, sp: 0.02 + rand() * 0.05, ph: rand() * TAU });
  }
  return stars;
}

function makeGlints(L) {
  const rand = rng(9);
  const count = L.mobile ? 60 : 110;
  const glints = [];
  for (let tries = 0; glints.length < count && tries < count * 4; tries++) {
    const depth = Math.pow(rand(), 1.6);
    const y = L.horizon + 3 + depth * (L.H - L.horizon - 6);
    const inPath = rand() < 0.65;
    const half = L.orb.r * (0.8 + depth * 4);
    const x = inPath ? L.orb.x + (rand() - 0.5) * half * 2 : rand() * L.W;
    if (L.landTop(x) <= y) continue;
    glints.push({ x, y, w: 3 + depth * 14 + rand() * 6, h: depth > 0.5 ? 1.5 : 1, a: (inPath ? 0.75 : 0.35) * (0.5 + rand() * 0.5), sp: 0.03 + rand() * 0.06, ph: rand() * TAU });
  }
  return glints;
}

function canopyBounds(clusters, L) {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const c of clusters) {
    if (c.x < 0 || c.x > L.W) continue;
    x0 = Math.min(x0, c.x);
    x1 = Math.max(x1, c.x);
    y0 = Math.min(y0, c.y);
    y1 = Math.max(y1, c.y);
  }
  return { x0, x1, y0: Math.max(0, y0), y1 };
}

// `clearOf` returns the box the sun, moon and peak must avoid (see makeLayout), or null.
export function createSakuraScene(base, fx, { clearOf } = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const baseCtx = base.getContext('2d');
  const fxCtx = fx.getContext('2d');
  let L = null;
  let T = null;
  let themeName = '';
  let canopy = null;
  let stars = [];
  let glints = [];
  let sprites = [];
  let petals = [];
  let ripples = [];
  let meteor = null;
  let nextMeteor = 600;
  let t = 0;
  let last = 0;
  let raf = 0;
  let resizeTimer = 0;
  let alive = true;
  const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, active: 0 };

  const currentTheme = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  function fit(canvas, ctx, dpr) {
    canvas.width = Math.round(L.W * dpr);
    canvas.height = Math.round(L.H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnPetal(anywhere) {
    const depth = Math.random();
    // nearer petals are bigger, faster, and land lower on the water
    const landY = L.horizon + 4 + (L.H - L.horizon) * (0.05 + depth * 0.9);
    let x;
    let y;
    if (anywhere) {
      x = Math.random() * L.W;
      y = Math.random() * (landY - 20);
    } else if (Math.random() < 0.8) {
      x = canopy.x0 + Math.random() * (canopy.x1 - canopy.x0);
      y = canopy.y0 + Math.random() * (canopy.y1 - canopy.y0) * 0.75;
    } else {
      x = L.W * (0.3 + Math.random() * 0.8);
      y = -20;
    }
    return {
      x, y, depth, landY,
      size: (7 + depth * 9) * (L.mobile ? 0.8 : 1),
      vx: -(0.2 + Math.random() * 0.4) * (0.6 + depth * 0.8),
      vy: 0.35 + Math.random() * 0.3 + depth * 0.45,
      rot: Math.random() * TAU,
      vr: (Math.random() - 0.5) * 0.05,
      flip: Math.random() * TAU,
      vflip: 0.03 + Math.random() * 0.05,
      sway: Math.random() * TAU,
      swayAmp: 0.25 + Math.random() * 0.5,
      sprite: Math.floor(Math.random() * 3),
      alpha: 0.6 + depth * 0.4,
      rest: 0,
      water: false,
      pushX: 0,
      pushY: 0,
    };
  }

  function render(resetPetals) {
    const W = base.clientWidth || window.innerWidth;
    const H = base.clientHeight || window.innerHeight;
    L = makeLayout(W, H, clearOf?.());
    themeName = currentTheme();
    T = THEMES[themeName];
    // keep the backing store under ~9 megapixels on large or high-density screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(9e6 / (W * H)));
    fit(base, baseCtx, dpr);
    const tree = buildTree(L);
    drawSky(baseCtx, T, L);
    drawSea(baseCtx, T, L);
    drawLand(baseCtx, T, L);
    drawTree(baseCtx, T, tree);
    fit(fx, fxCtx, Math.min(dpr, 1.5));
    canopy = canopyBounds(tree.clusters, L);
    sprites = T.petals.map(makeSprite);
    stars = makeStars(L, T.stars);
    glints = makeGlints(L);
    if (resetPetals || !petals.length) {
      petals = Array.from({ length: L.mobile ? 32 : 64 }, () => spawnPetal(true));
      ripples = [];
    }
    if (reduceMotion) drawFx();
  }

  function step(dt) {
    t += dt;
    const wind = 0.3 * Math.sin(t * 0.0045) + 0.18 * Math.sin(t * 0.013 + 1.3);
    mouse.active = Math.max(0, mouse.active - 0.02 * dt);
    for (const p of petals) {
      if (p.rest > 0) {
        p.rest -= 0.004 * dt;
        if (p.water) p.x -= 0.12 * dt;
        if (p.rest <= 0) Object.assign(p, spawnPetal(false));
        continue;
      }
      if (mouse.active > 0) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          const f = (1 - Math.sqrt(d2) / 150) * 0.06 * mouse.active;
          p.pushX += mouse.vx * f;
          p.pushY += mouse.vy * f;
        }
      }
      p.pushX *= 0.96;
      p.pushY *= 0.96;
      p.sway += 0.03 * dt;
      p.x += (p.vx + wind * (0.4 + p.depth) + Math.sin(p.sway) * p.swayAmp + p.pushX) * dt;
      p.y += (p.vy + Math.cos(p.sway * 0.8) * 0.12 + p.pushY) * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      const groundY = L.landTop(p.x);
      if (p.y >= groundY) {
        p.rest = 1;
        p.water = false;
        p.y = groundY + 2 + p.depth * 10;
      } else if (p.y >= p.landY && p.pushY < 1) {
        p.rest = 1;
        p.water = true;
        ripples.push({ x: p.x, y: p.y, r: 1, life: 1, s: 0.5 + p.depth });
      } else if (p.x < -40 || p.x > L.W + 40 || p.y > L.H + 40) {
        Object.assign(p, spawnPetal(false));
      }
    }
    for (const r of ripples) {
      r.r += 0.35 * r.s * dt;
      r.life -= 0.012 * dt;
    }
    ripples = ripples.filter((r) => r.life > 0);

    if (T.stars) {
      nextMeteor -= dt;
      if (!meteor && nextMeteor <= 0) {
        meteor = { x: L.W * (0.2 + Math.random() * 0.7), y: L.horizon * (0.05 + Math.random() * 0.3), vx: -(6 + Math.random() * 4), vy: 2.2 + Math.random() * 1.5, life: 1 };
        nextMeteor = 600 + Math.random() * 900;
      }
      if (meteor) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life -= 0.02 * dt;
        if (meteor.life <= 0 || meteor.y > L.horizon) meteor = null;
      }
    } else {
      meteor = null;
    }
  }

  function drawFx() {
    const c = fxCtx;
    c.clearRect(0, 0, L.W, L.H);
    c.fillStyle = '#fff';
    for (const s of stars) {
      c.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
      c.fillRect(s.x, s.y, s.r, s.r);
    }
    if (meteor) {
      const tx = meteor.x - meteor.vx * 14;
      const ty = meteor.y - meteor.vy * 14;
      const tail = c.createLinearGradient(meteor.x, meteor.y, tx, ty);
      tail.addColorStop(0, `rgba(255, 255, 255, ${0.9 * meteor.life})`);
      tail.addColorStop(1, 'rgba(255, 255, 255, 0)');
      c.globalAlpha = 1;
      c.strokeStyle = tail;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(meteor.x, meteor.y);
      c.lineTo(tx, ty);
      c.stroke();
    }
    c.fillStyle = `rgb(${T.glint})`;
    for (const g of glints) {
      const s = Math.sin(t * g.sp + g.ph);
      if (s <= 0.2) continue;
      c.globalAlpha = s * s * s * g.a;
      c.fillRect(g.x - g.w / 2, g.y, g.w, g.h);
    }
    c.strokeStyle = `rgb(${T.glint})`;
    c.lineWidth = 1;
    for (const r of ripples) {
      c.globalAlpha = r.life * 0.45;
      c.beginPath();
      c.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, TAU);
      c.stroke();
    }
    for (const p of petals) {
      c.globalAlpha = p.alpha * (p.rest > 0 ? Math.min(1, p.rest * 2.5) : 1);
      // squash the petal vertically as it tumbles; lying petals stay flat
      const flip = p.rest > 0 ? 0.4 : Math.cos(p.flip);
      const sy = Math.abs(flip) < 0.15 ? (flip < 0 ? -0.15 : 0.15) : flip;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.scale(1, sy);
      c.drawImage(sprites[p.sprite], -p.size / 2, -p.size / 2, p.size, p.size);
      c.restore();
    }
    c.globalAlpha = 1;
  }

  function frame(now) {
    const dt = last ? Math.min(3, (now - last) / 16.667) : 1;
    last = now;
    step(dt);
    drawFx();
    raf = requestAnimationFrame(frame);
  }

  // moving the mouse through the petals blows them around
  const onPointer = (e) => {
    if (e.pointerType !== 'mouse') return;
    if (mouse.x > -1e3) {
      mouse.vx = mouse.vx * 0.5 + (e.clientX - mouse.x) * 0.5;
      mouse.vy = mouse.vy * 0.5 + (e.clientY - mouse.y) * 0.5;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = 1;
  };

  // the text to keep clear of moved, e.g. it rewrapped or the fonts loaded
  const moved = () => {
    const c = clearOf?.();
    return !!c && (!L.clear || c.top !== L.clear.top || c.bottom !== L.clear.bottom);
  };

  // mobile browser bars change the height constantly, so on touch screens only big changes trigger a redraw
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const W = base.clientWidth;
      const H = base.clientHeight;
      if (W !== L.W || Math.abs(H - L.H) > (coarse ? L.H * 0.15 : 0)) render(true);
      else if (moved()) render(false);
    }, 150);
  };

  const observer = new MutationObserver(() => {
    if (currentTheme() !== themeName) render(false);
  });

  render(true);
  document.fonts?.ready.then(() => alive && moved() && render(false));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', onResize);
  if (!reduceMotion) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    raf = requestAnimationFrame(frame);
  }

  return {
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
    },
  };
}
