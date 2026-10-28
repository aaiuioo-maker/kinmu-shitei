// =============================================================
// Claude Code のオレンジのキャラクター（ほんもの）
//   勤務指定表のタイトルの左で動いているキャラクターの 絵と動き（パソコンを打つ・夜はねる・300 とおりの動き）が ぜんぶ入っている
//   ほかのアプリでも このファイルを読みこむだけで 同じキャラクターになる：
//     <svg class="cc-anim" viewBox="0 -7 34 23" style="shape-rendering:crispEdges;overflow:visible" aria-hidden="true"></svg>
//     <script src="https://aaiuioo-maker.github.io/kinmu-shitei/cc-chara.js"></script>
//   キャラクターを直すときは このファイルを直す（勤務指定表も ほかのアプリも ここを読んでいる）
// =============================================================
// =============================================================
// Claude Code のキャラクターが マイクラのクリーパー・ゾンビ・村人・チキンジョッキーに変身する動き（10 とおりずつ）と、カズ（カズクラ）さん・まぐにぃさんの装備と動き 10 とおりずつ、
// いろいろなモブ（エンダーマン・スケルトン … シロクマの親子）への変身 120 とおり、オレンジのキャラクターが マイクラ風の すがたに変身する 20 とおり（3回）と 10 とおり
//   さらに オレンジのキャラクターが HUNTER×HUNTER の90人に変身する 90 とおり
//   下の CC_EXTRA_ALL の 151〜490 番になる（いまの CC_EXTRA では 51〜390 番）
//   window.CC_HENSHIN       … 見本ページ用：形・描画の道具・変身のパターン
//   window.CC_HENSHIN_MOVES … 案内役用：CC_EXTRA と同じ形（.seq が [コマの絵, 長さ(ミリ秒)] の並び）の 340 個
// =============================================================
(function ccHenshin() {
const G = 48, GROUND = 42, CS = 2; // 見本の画面の大きさ・地面の高さ・1マスの大きさ
const MOB = 0.6, MS = CS * MOB;  // ゾンビ・村人は キャラクターより小さく（1マスの大きさ）。チキンジョッキーは JS
const CMS = CS * 0.75;           // クリーパーの1マスの大きさ（キャラクターの0.75倍）
// 1マスの場所と大きさ。hs があるときは 上から hr 段（クリーパーの頭）だけ hs 倍に小さくして、体のまん中の上にのせる
function cellRect(sp, e, cx, by, cw, ch) {
  if (sp.hs && e.y < sp.hr) {
    const top = by - (sp.h - sp.hr) * ch;
    return [cx + (e.x - sp.w / 2) * cw * sp.hs, top - (sp.hr - e.y) * ch * sp.hs, cw * sp.hs, ch * sp.hs];
  }
  return [cx + (e.x - sp.w / 2) * cw, by - (sp.h - e.y) * ch, cw, ch];
}

// ---------- 2人の形（マス目） ----------
// Claude Code のキャラクター（index.html の案内役と同じ形）
const MASCOT = (() => {
  const c = '#d97757', cells = [];
  for (let y = 0; y < 6; y++) for (let x = 2; x < 10; x++) cells.push({ x, y, c });
  [[0, 2], [1, 2], [0, 3], [1, 3], [10, 2], [11, 2], [10, 3], [11, 3]].forEach(([x, y]) => cells.push({ x, y, c }));
  [2, 4, 7, 9].forEach(x => { cells.push({ x, y: 6, c }); cells.push({ x, y: 7, c }); });
  cells.forEach(e => { if ((e.x === 3 || e.x === 8) && e.y === 1) e.c = '#1a1612'; });
  return { w: 12, h: 8, cells };
})();
// マインクラフトのクリーパー（顔・体・足）
const CREEPER = (() => {
  const greens = ['#4fa83c', '#5fbf4a', '#3d8a2e', '#7ad35e', '#56b043', '#2f6f24'];
  let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const face = ['........', '.XX..XX.', '.XX..XX.', '...XX...', '..XXXX..', '..XXXX..', '..X..X..', '........'];
  const cells = [];
  const g = () => greens[(r() * greens.length) | 0];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) cells.push({ x, y, c: face[y][x] === 'X' ? '#141414' : g() });
  for (let y = 8; y < 14; y++) for (let x = 2; x < 6; x++) cells.push({ x, y, c: g() });
  for (let y = 14; y < 16; y++) for (const x of [0, 1, 2, 5, 6, 7]) cells.push({ x, y, c: g() });
  return { w: 8, h: 16, cells, cs: CMS, hs: 0.8, hr: 8 }; // 頭は 体より小さめ（0.8倍）
})();
const ZOMBIE = (() => {
  const rows = [
    '..HHHHHHHH..', '..HGGGGGGH..', '..GGGGGGGG..', '..GKKGGKKG..', '..GGGNNGGG..', '..GGGGGGGG..', '..GGMMMMGG..', '..GGGGGGGG..',
    '.CCCCCCCCCC.', '.CCCCCCCCCC.', '.GGCCCCCCGG.', '.GGCCCCCCGG.', '.GGCCCCCCGG.', '.GGPPPPPPGG.',
    '...PPPPPP...', '...PPdPPP...', '...PPdPPP...', '...PPdPPP...', '...SSSSSS...',
  ];
  const pal = {
    H: ['#2f5a24', '#38692b'], G: ['#5f9a45', '#4f8a3a', '#6aa84f', '#578f40'], K: ['#101010'], N: ['#3f7030'], M: ['#2b4a20'],
    C: ['#2aa8a8', '#239090', '#33b8b8'], P: ['#3a3fa0', '#2e3388', '#4248b0'], d: ['#22266a'], S: ['#6b6b6b', '#5a5a5a'],
  };
  let s = 21; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { const p = pal[ch]; cells.push({ x, y, c: p[(r() * p.length) | 0], k: ch }); } }));
  return { w: 12, h: rows.length, cells };
})();
const isArm = e => e.y >= 8 && (e.x <= 2 || e.x >= 9);
const isLeftLeg = e => e.y >= 14 && e.x <= 5;

// ---------- 描画の道具 ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => { k = clamp(k); return k * k * (3 - 2 * k); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
function mix(c1, c2, k) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const ch = s => Math.round(lerp((a >> s) & 255, (b >> s) & 255, clamp(k)));
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// 描く先（キャンバス・記録）に合わせて R / T / clip / shake を渡すと、円とキャラクターを描く道具がそろう
function makeG(base) {
  const g = {
    ...base,
    disc(cx, cy, r, c, a = 1) { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y) + .3); g.R(cx - w, cy + y, w * 2 + 1, 1, c, a); } },
    // 足もとの中心 (cx, by) を基準に、横 sx・縦 sy 倍で描く。col で色を差し替え、show でマスを選び、off でマスをずらす
    sprite(sp, cx, by, o = {}) {
      const sx = o.sx ?? 1, sy = o.sy ?? 1, a = o.a ?? 1, cs = sp === MASCOT ? CS : sp.cs || MS;
      for (const e of sp.cells) {
        if (o.show && !o.show(e)) continue;
        const c = o.col ? o.col(e) : e.c, [dx, dy] = o.off ? o.off(e) : [0, 0], [x, y, w, h] = cellRect(sp, e, cx, by, cs * sx, cs * sy);
        g.R(x + dx, y + dy, w + .01, h + .01, c, a);
      }
    },
  };
  return g;
}

// 待っている間の動き
const bob = t => (Math.floor(t * 4) % 2 ? -1 : 0);
function mascotIdle(g, t, o = {}) { g.sprite(MASCOT, 24, GROUND + bob(t), o); }
function creeperIdle(g, t, o = {}) {
  const sway = Math.floor(t * 2) % 2; // クリーパーは足をちょこちょこ
  g.sprite(CREEPER, 24, GROUND, { ...o, show: e => (o.show ? o.show(e) : true) && !(e.y >= 14 && sway && (e.x === 0 || e.x === 7)) });
}
function sparkle(g, x, y, k, c = '#fff') { if (k <= 0 || k >= 1) return; const r = Math.round(1 + k * 3); g.R(x - r, y, r * 2 + 1, 1, c, 1 - k); g.R(x, y - r, 1, r * 2 + 1, c, 1 - k); }
// ゾンビは うでを ゆらゆら、足を かわりばんこに
function zombieStep(t) {
  const f = Math.floor(t * 3) % 2;
  return e => isArm(e) && e.y >= 10 ? [0, f ? -1 : 0] : e.y >= 14 ? [0, (isLeftLeg(e) ? f : 1 - f) ? -1 : 0] : [0, 0];
}
function zombieAt(g, t, cx, o = {}) { g.sprite(ZOMBIE, cx, GROUND, { off: zombieStep(t), ...o }); }
function zombieIdle(g, t, o = {}) { zombieAt(g, t, 24, o); }
function walkFrame(t) { return Math.floor(t * 6) % 2 ? -1 : 0; }

// ---------- クリーパーへの 10 とおりの変身 ----------
const CREEPER_PATTERNS = [
  { name: '光につつまれて', how: 'ピカピカ光って まぶしい光の中から登場',
    draw(g, t) {
      if (t < 2.0) {
        const k = seg(t, 1.0, 2.0), on = k > 0 && Math.sin(t * (10 + k * 40)) > 0;
        mascotIdle(g, t, { col: e => on ? mix(e.c, '#ffffff', .4 + k * .6) : e.c });
      } else creeperIdle(g, t, { col: e => mix(e.c, '#ffffff', 1 - seg(t, 2.0, 2.8)) });
      const f = seg(t, 1.8, 2.6);
      if (f > 0 && f < 1) { g.disc(24, 30, Math.round(4 + f * 22), '#ffffff', (1 - f) * .9); }
      [[12, 18, 2.1], [36, 14, 2.3], [34, 32, 2.5], [10, 34, 2.7]].forEach(([x, y, s]) => sparkle(g, x, y, seg(t, s, s + .5)));
    } },
  { name: 'ドットが入れかわる', how: '1マスずつ ランダムに クリーパーのドットへ',
    draw(g, t) {
      const k = seg(t, 1.0, 2.8);
      const id = e => hash(e.x * 31 + e.y * 7);
      if (k < 1) mascotIdle(g, t, { show: e => id(e) >= k });
      if (k > 0) creeperIdle(g, t, { show: e => hash(e.x * 13 + e.y * 17 + 3) < k });
    } },
  { name: '下からスキャン', how: '緑の光の線が 足もとから頭へ',
    draw(g, t) {
      const k = ease(seg(t, 1.0, 2.8)), top = 10 - 2, line = lerp(GROUND, top, k);
      g.clip(0, 0, G, line, () => mascotIdle(g, t));
      g.clip(0, line, G, G, () => creeperIdle(g, t));
      if (k > 0 && k < 1) { g.R(6, line - 1, 36, 3, '#6fd35a', .35); g.R(4, line, 40, 1, '#b8ff9a'); }
    } },
  { name: 'ジャンプで くるっ', how: '高く跳んで くるくる回り 着地したら変身',
    draw(g, t) {
      const j = seg(t, 1.3, 2.5), crouch = t > 1.0 && t < 1.3 ? .8 : 1;
      const land = seg(t, 2.5, 2.8), squash = land > 0 && land < 1 ? 1 - .25 * Math.sin(land * Math.PI) : 1;
      const y = -Math.sin(j * Math.PI) * 18, spin = Math.cos(j * Math.PI * 4);
      const sx = j > 0 && j < 1 ? Math.max(.08, Math.abs(spin)) : 1;
      if (j < .5) g.sprite(MASCOT, 24, GROUND + y + (t < 1 ? bob(t) : 0), { sx: sx * (2 - crouch), sy: crouch });
      else if (land < 1) g.sprite(CREEPER, 24, GROUND + y, { sx: sx * (2 - squash), sy: squash, col: e => spin < 0 ? mix(e.c, '#000000', .3) : e.c });
      else creeperIdle(g, t);
      if (land > 0 && land < 1) { const d = land * 8; g.R(24 - 8 - d, GROUND - 2, 2, 2, '#c8b8a0', 1 - land); g.R(24 + 6 + d, GROUND - 2, 2, 2, '#c8b8a0', 1 - land); }
    } },
  { name: 'ブロックを つみあげ', how: '地面にもぐって 空からブロックが降ってくる',
    draw(g, t) {
      const sink = ease(seg(t, 0.9, 1.4));
      g.clip(0, 0, G, GROUND, () => g.sprite(MASCOT, 24, GROUND + sink * 18 + (t < .9 ? bob(t) : 0)));
      for (const e of CREEPER.cells) {
        const row = CREEPER.h - 1 - e.y, st = 1.5 + row * .1 + hash(e.x + e.y * 9) * .05, k = seg(t, st, st + .25);
        if (k <= 0) continue;
        const yy = lerp(-20, 0, k * k);
        const [x, y, w, h] = cellRect(CREEPER, e, 24, GROUND, CMS, CMS);
        g.R(x, y + yy, w, h, e.c);
      }
    } },
  { name: 'のびて みどりに', how: '色がだんだん緑になって 体がにゅーっと伸びる',
    draw(g, t) {
      const c = seg(t, 1.0, 1.8), st = ease(seg(t, 1.8, 2.6)), x = seg(t, 2.4, 2.9);
      const col = e => e.y === 1 && (e.x === 3 || e.x === 8) ? e.c : mix(e.c, '#5fbf4a', c);
      if (x < 1) g.sprite(MASCOT, 24, GROUND + (t < 1 ? bob(t) : 0), { col, sx: lerp(1, 8 / 12, st), sy: lerp(1, 2, st), a: 1 - x });
      if (x > 0) creeperIdle(g, t, { a: x });
    } },
  { name: 'けむりで ボン！', how: 'もくもく煙に かくれているうちに',
    draw(g, t) {
      if (t < 1.5) mascotIdle(g, t); else creeperIdle(g, t);
      const k = seg(t, 1.2, 2.6);
      if (k > 0 && k < 1) {
        [[24, 32, 0], [17, 36, 1], [31, 36, 2], [20, 26, 3], [29, 25, 4], [24, 20, 5], [14, 30, 6], [34, 30, 7]].forEach(([x, y, i]) => {
          const r = Math.round(3 + Math.sin(k * Math.PI) * (5 + hash(i) * 3));
          g.disc(x + (x - 24) * k * .4, y - k * 4, r, i % 2 ? '#cfcfd8' : '#9a98a8', 1 - k * k);
        });
        g.T('ボン!', 24, 10, 7, '#ffd84a', 1 - seg(t, 1.9, 2.3));
      }
    } },
  { name: 'かぶりもので へんしん', how: 'クリーパーの頭が降ってきて すっぽり',
    draw(g, t) {
      const fall = seg(t, 1.0, 1.6), wob = seg(t, 1.6, 2.1), grow = ease(seg(t, 2.1, 2.9));
      const head = { w: 8, h: 8, cs: CMS, hs: 0.8, hr: 8, cells: CREEPER.cells.filter(e => e.y < 8) };
      const body = { w: 8, h: 8, cs: CMS, cells: CREEPER.cells.filter(e => e.y >= 8).map(e => ({ ...e, y: e.y - 8 })) };
      if (grow < 1) g.sprite(MASCOT, 24, GROUND + (t < 1 ? bob(t) : 0), { a: 1 - grow, col: e => mix(e.c, '#5fbf4a', grow) });
      if (grow > 0) g.sprite(body, 24, GROUND, { a: grow, sy: grow });
      const restY = GROUND - 12, finalY = GROUND - 8 * CMS;
      const hy = fall < 1 ? lerp(-4, restY, fall * fall) : lerp(restY, finalY, grow);
      const tilt = wob > 0 && wob < 1 ? Math.round(Math.sin(wob * Math.PI * 4) * (1 - wob) * 2) : 0;
      if (t > 1.0) g.sprite(head, 24 + tilt, hy, {});
      if (fall >= 1 && wob < .3) g.T('すぽっ', 38, 18, 5, '#ffffff', 1 - wob * 3);
    } },
  { name: 'シューッ…ドカーン', how: 'クリーパーみたいに ふくらんで 爆発！',
    draw(g, t) {
      const h = seg(t, 0.9, 2.0), boom = seg(t, 2.0, 2.9);
      const sh = h > 0 && h < 1 ? (hash(Math.floor(t * 30)) - .5) * 2 * h : 0;
      g.shake(sh, 0, () => {
        if (h < 1) {
          const white = Math.sin(t * (8 + h * 30)) > 0 ? h : 0, sw = 1 + h * .25;
          mascotIdle(g, t, { sx: sw, sy: sw, col: e => mix(e.c, '#ffffff', white) });
        } else if (boom > .35) creeperIdle(g, t);
      });
      if (h > .1 && h < 1) g.T('シュー…', 24, 12, 6, '#b8ff9a');
      if (boom > 0 && boom < 1) {
        g.R(0, 0, G, G, '#ffffff', (1 - boom * 3));
        for (let i = 0; i < 16; i++) {
          const an = i / 16 * Math.PI * 2, d = boom * (14 + hash(i) * 10);
          g.R(24 + Math.cos(an) * d, 34 + Math.sin(an) * d * .8, 2, 2, i % 3 ? '#9a98a8' : '#ffb02e', 1 - boom);
        }
      }
    } },
  { name: 'バラバラ 合体', how: 'ドットが飛びちって 緑になって集まる',
    draw(g, t) {
      const out = ease(seg(t, 1.0, 1.7)), back = ease(seg(t, 1.9, 2.8));
      if (out < 1) {
        for (const e of MASCOT.cells) {
          const i = e.x * 9 + e.y, an = hash(i) * Math.PI * 2, d = out * (10 + hash(i + 3) * 12);
          const bx = 24 + (e.x - MASCOT.w / 2) * CS, by = GROUND - (MASCOT.h - e.y) * CS + (t < 1 ? bob(t) : 0);
          g.R(bx + Math.cos(an) * d, by + Math.sin(an) * d - out * 6, CS, CS, e.c);
        }
      } else if (back < 1) {
        for (const e of CREEPER.cells) {
          const i = e.x * 9 + e.y + 100, an = hash(i) * Math.PI * 2, d = (1 - back) * (12 + hash(i + 3) * 12);
          const [bx, by, w, h] = cellRect(CREEPER, e, 24, GROUND, CMS, CMS);
          g.R(bx + Math.cos(an) * d, by + Math.sin(an) * d * .8, w, h, mix('#d97757', e.c, back), back > 0 ? 1 : 0);
        }
      } else creeperIdle(g, t);
    } },
];

// ---------- ゾンビへの 10 とおりの変身 ----------
const ZOMBIE_PATTERNS = [
  { name: 'お墓から よみがえる', how: '地面にもぐると 墓の前から ゾンビがはい出てくる',
    draw(g, t) {
      // 石のお墓
      g.R(35, 30, 8, 12, '#7d7d86'); g.R(36, 29, 6, 1, '#7d7d86'); g.R(36, 31, 6, 1, '#9a9aa4'); g.R(38, 33, 2, 6, '#5a5a62'); g.R(36, 35, 6, 2, '#5a5a62');
      const sink = ease(seg(t, 0.9, 1.5));
      g.clip(0, 0, G, GROUND, () => g.sprite(MASCOT, 20, GROUND + sink * 18 + (t < .9 ? bob(t) : 0)));
      const hand = seg(t, 1.6, 2.0), rise = ease(seg(t, 2.0, 3.0));
      if (hand > 0 && rise <= 0) { const hh = Math.round(hand * 6); g.R(17, GROUND - hh, 3, hh, '#5f9a45'); g.R(16, GROUND - hh, 1, 2, '#5f9a45'); g.R(20, GROUND - hh, 1, 2, '#5f9a45'); }
      if (rise > 0) g.clip(0, 0, G, GROUND, () => g.sprite(ZOMBIE, 20, GROUND + (1 - rise) * 40, { off: zombieStep(t) }));
      const d = seg(t, 2.0, 2.8);
      if (d > 0 && d < 1) for (let i = 0; i < 8; i++) { const an = Math.PI * (1.1 + .8 * i / 7); g.R(20 + Math.cos(an) * d * 14, GROUND - 1 + Math.sin(an) * d * 10 + d * d * 8, 2, 2, '#7a5230', 1 - d); }
    } },
  { name: '満月の夜', how: '大きな月が のぼって 月の光をあびると',
    draw(g, t) {
      const up = ease(seg(t, 0.6, 1.6)), glow = seg(t, 1.6, 2.4), sw = seg(t, 2.2, 2.9);
      g.R(0, 0, G, GROUND, '#060418', up * .6);
      const my = lerp(48, 9, up);
      g.disc(10, my, 8, '#fff6c0', .25 + .15 * Math.sin(t * 6));
      g.disc(10, my, 6, '#efe9c9'); g.R(7, my - 2, 2, 2, '#d8d0aa'); g.R(12, my + 1, 2, 2, '#d8d0aa');
      if (glow > 0) g.R(14, 10, 20, GROUND - 10, '#fff6c0', Math.sin(glow * Math.PI) * .25);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: e => e.c === '#1a1612' ? e.c : mix(e.c, '#5f9a45', glow) });
      if (sw > 0) zombieIdle(g, t, { a: sw });
    } },
  { name: '緑のくすりを ばしゃっ', how: 'びんが落ちてきて 上から緑に そまっていく',
    draw(g, t) {
      const fall = seg(t, 1.0, 1.5), paint = seg(t, 1.5, 2.1), sw = ease(seg(t, 2.1, 2.8));
      if (fall > 0 && fall < 1) { const y = lerp(-6, 25, fall * fall); g.R(22, y, 4, 5, '#3fbf4a'); g.R(23, y - 2, 2, 2, '#b0e8ff'); g.R(23, y - 3, 2, 1, '#8a5a30'); g.R(22, y + 1, 1, 2, '#9ff0a0'); }
      if (paint > 0 && paint < 1) for (let i = 0; i < 12; i++) {
        const an = Math.PI * (1 + i / 11), d = paint * (8 + hash(i) * 8);
        g.R(24 + Math.cos(an) * d, 28 + Math.sin(an) * d + paint * paint * 14, 1, 2, '#6fe07a', 1 - paint);
      }
      const line = lerp(26, GROUND, paint);
      if (sw < 1) {
        const o = { a: 1 - sw };
        g.clip(0, line, G, G, () => mascotIdle(g, t, o));
        g.clip(0, 0, G, line, () => mascotIdle(g, t, { ...o, col: e => e.c === '#1a1612' ? e.c : '#4f8a3a' }));
      }
      if (sw > 0) zombieIdle(g, t, { a: sw, sy: lerp(.5, 1, sw) });
    } },
  { name: 'かみなり ドーン', how: '空がピカッと光って 雷が落ちる',
    draw(g, t) {
      const fl = t > 1.0 && t < 1.4 && Math.sin(t * 60) > .3;
      if (fl) g.R(0, 0, G, GROUND, '#3a3a70', .6);
      const hit = seg(t, 1.4, 1.75), sm = seg(t, 1.75, 3.0);
      const sh = hit > 0 && hit < 1 ? (hash(Math.floor(t * 40)) - .5) * 3 : 0;
      g.shake(sh, 0, () => { if (t < 1.55) mascotIdle(g, t); else zombieIdle(g, t); });
      if (hit > 0 && hit < 1) {
        let x = 26;
        for (let y = 0; y < 30; y += 3) { const nx = x + (Math.floor(y / 3) % 2 ? -3 : 3); g.R(Math.min(x, nx), y, Math.abs(nx - x) + 1, 1, '#fff9b0'); g.R(nx, y, 1, 3, '#fff9b0'); x = nx; }
        g.R(0, 0, G, G, '#ffffff', 1 - hit * 1.4);
      }
      if (sm > 0 && sm < 1) for (let i = 0; i < 5; i++) g.disc(20 + i * 2, 16 - sm * 10 - i, 2, '#8a8898', (1 - sm) * .7);
    } },
  { name: 'ふらふら 入れかわり', how: '右へ歩いていって 左から ゾンビが歩いてくる',
    draw(g, t) {
      const out = seg(t, 0.6, 1.8), inn = ease(seg(t, 2.0, 3.2));
      if (out < 1) g.sprite(MASCOT, lerp(24, 62, out), GROUND + (out > 0 ? walkFrame(t) : bob(t)));
      if (inn > 0) zombieAt(g, t, lerp(-14, 24, inn), { off: e => { const [dx, dy] = zombieStep(t)(e); return [dx + (inn < 1 && Math.floor(t * 3) % 2 ? 1 : 0), dy]; } });
      if (inn > .6) g.T('ウ〜', 40, 6, 5, '#9fe08a', seg(t, 2.6, 3.0) - seg(t, 3.8, 4.2));
    } },
  { name: 'ドアの向こうで', how: 'ドアに入って ガタガタ… 出てきたのは',
    draw(g, t) {
      const open1 = seg(t, 0.4, 0.7) - seg(t, 1.4, 1.6), open2 = seg(t, 2.3, 2.5);
      const open = Math.max(open1, open2);
      const rattle = t > 1.7 && t < 2.3 ? (Math.floor(t * 20) % 2 ? 1 : -1) : 0;
      const DX = 16, DW = 16, DT = 20; // ドアの左はし・幅・上はし（案内役の絵に入る大きさ）
      g.R(DX, DT, DW, GROUND - DT, '#1a1410'); // 入り口の暗がり
      if (t < 1.5) {
        const w = seg(t, 0.6, 1.3), fade = seg(t, 1.2, 1.5);
        g.sprite(MASCOT, lerp(4, 24, w), GROUND + (w > 0 && w < 1 ? walkFrame(t) : bob(t)), { a: 1 - fade * .9, col: e => mix(e.c, '#1a1410', fade) });
      }
      const zin = seg(t, 2.4, 2.8);
      if (zin > 0) zombieIdle(g, t, { col: e => mix('#1a1410', e.c, zin) });
      // ドア（開くと細くなる）
      const dw = Math.round(lerp(DW, 3, open));
      g.shake(rattle, 0, () => {
        g.R(DX, DT, dw, GROUND - DT, '#9a6a3c');
        if (dw > 8) { g.R(DX + 2, DT + 2, dw - 4, 6, '#5e3e22'); g.R(DX + 3, DT + 3, dw - 6, 4, '#3a5a7a'); g.R(DX + dw - 3, DT + 12, 1.5, 1.5, '#3a2a18'); }
        g.R(DX, DT, dw, 1, '#b8844c');
      });
      g.R(DX - 1, DT - 1, DW + 2, 1, '#5e3e22'); g.R(DX - 1, DT - 1, 1, GROUND - DT + 1, '#5e3e22'); g.R(DX + DW, DT - 1, 1, GROUND - DT + 1, '#5e3e22');
      if (rattle) g.T('ガタガタ', 24, 8, 5, '#ffd84a');
    } },
  { name: 'ねむって 目がさめたら', how: 'Zzz… 夜がふけて 起きたら ゾンビに',
    draw(g, t) {
      const z = seg(t, 0.8, 2.0), dark = seg(t, 1.6, 2.1) - seg(t, 2.3, 2.9);
      if (t < 2.2) g.sprite(MASCOT, 24, GROUND, { sy: lerp(1, .85, seg(t, .8, 1.2)), sx: lerp(1, 1.08, seg(t, .8, 1.2)), col: e => e.c === '#1a1612' && t > 1.0 ? '#d97757' : e.c });
      else zombieIdle(g, t);
      if (t < 2.2) for (let i = 0; i < 3; i++) { const k = (z * 3 - i); if (k > 0 && k < 1.6) g.T('Z', 32 + i * 4 + k * 2, 26 - i * 5 - k * 3, 4 + i, '#c8c0ff', 1 - k / 1.6); }
      g.R(0, 0, G, G, '#000000', dark * .9);
      if (t > 2.6) g.T('ウ〜…', 40, 6, 5, '#9fe08a', seg(t, 2.6, 3.0));
    } },
  { name: 'ポンポン 組み立て', how: '消えたあと 足・体・頭の じゅんに ポン！',
    draw(g, t) {
      const gone = seg(t, 1.0, 1.3);
      if (gone < 1) g.sprite(MASCOT, 24, GROUND + (t < 1 ? bob(t) : 0), { sx: 1 - gone, sy: 1 + gone * .3 });
      if (gone > 0 && gone < 1) for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; g.R(24 + Math.cos(an) * gone * 10, 34 + Math.sin(an) * gone * 8, 2, 2, '#ffffff', 1 - gone); }
      const parts = [[e => e.y >= 14, 1.4, 38], [e => e.y >= 8 && e.y < 14, 1.8, 26], [e => e.y < 8, 2.2, 12]];
      parts.forEach(([sel, st, ty]) => {
        const k = seg(t, st, st + .3); if (k <= 0) return;
        const sc = k < 1 ? Math.sin(k * Math.PI * .5) * (1 + .3 * Math.sin(k * Math.PI)) : 1;
        const cy = GROUND - { 38: 5, 26: 16, 12: 30 }[ty] * MOB;
        for (const e of ZOMBIE.cells) {
          if (!sel(e)) continue;
          const x = 24 + (e.x - ZOMBIE.w / 2) * MS, y = GROUND - (ZOMBIE.h - e.y) * MS;
          g.R(24 + (x - 24) * sc, cy + (y - cy) * sc, MS * sc + .01, MS * sc + .01, e.c);
        }
        if (k < 1) g.T('ポン', 40, ty, 5, '#ffffff', 1 - k);
      });
    } },
  { name: 'パネルが くるっ', how: '看板が くるりと回って うらがえると',
    draw(g, t) {
      const k = ease(seg(t, 1.1, 2.6)), cs = Math.cos(k * Math.PI * 3), w = Math.abs(cs);
      const showZ = cs < 0; // 3回半まわって うら面（ゾンビ）で止まる
      g.R(24 - 15 * w - .5, 0, 30 * w + 1, GROUND, showZ ? '#5e3e22' : '#7a5230');
      g.R(24 - 14 * w, 1, 28 * w, GROUND - 2, showZ ? '#2a2420' : '#1c1930');
      g.R(23, GROUND - 1, 2, 1, '#3a2a18');
      if (showZ) zombieIdle(g, t, { sx: w }); else g.sprite(MASCOT, 24, GROUND - 6 + (t < 1.1 ? bob(t) : 0), { sx: w });
    } },
  { name: 'のびる かげ', how: 'かげが のびて 立ち上がり 色がついていく',
    draw(g, t) {
      const grow = ease(seg(t, 0.8, 1.6)), stand = ease(seg(t, 1.6, 2.3)), fade = seg(t, 2.0, 2.4), move = ease(seg(t, 2.3, 2.8)), color = seg(t, 2.6, 3.2);
      if (stand <= 0) g.R(24 - 6, GROUND, 12 + grow * 20, 2, '#05040d', .8);
      if (fade < 1) mascotIdle(g, t, { a: 1 - fade });
      if (stand > 0) {
        const cx = lerp(34, 24, move);
        zombieAt(g, t, cx, { sy: Math.max(.08, stand), col: e => mix('#2a2440', e.c, color) });
      }
    } },
];

// ---------- マイクラの村人（大きな鼻・つながった眉・茶色のローブ・組んだうで） ----------
const VILLAGER = (() => {
  const rows = [
    '.SSSSSSSS.', '.SSSSSSSS.', '.SSSSSSSS.', '.SBBBBBBS.', '.SWESSEWS.', '.SSSNNSSS.', '.SSSNNSSS.', '.SSSNNSSS.', '.SSMNNMSS.', '.SSSSSSSS.',
    '..RRRRRR..', '.RRRRRRRR.', 'AAAAAAAAAA', 'AAAHHHHAAA', 'AAAAAAAAAA', '.RRRRRRRR.', '.RRRRRRRR.', '.RRRRRRRR.', '..LL..LL..', '..FF..FF..',
  ];
  const pal = {
    S: ['#c69477', '#bd8a6c', '#cf9d80'], B: ['#4a3020'], W: ['#f2f2f2'], E: ['#3a9a4a'], N: ['#a8705a', '#b07a5e'], M: ['#8a5a44'],
    R: ['#7a4e33', '#6b4329', '#835438'], A: ['#946240', '#8a5a3a'], H: ['#c69477'], L: ['#5a5a5a'], F: ['#3a3a3a'],
  };
  let s = 31; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { const p = pal[ch]; cells.push({ x, y, c: p[(r() * p.length) | 0], k: ch }); } }));
  return { w: 10, h: rows.length, cells };
})();
// 村人は ときどき首を左右にふって、足を かわりばんこに
function villagerStep(t) {
  const look = [0, 1, 0, -1][Math.floor(t * 1.5) % 4], f = Math.floor(t * 3) % 2;
  return e => e.y < 10 ? [look, 0] : e.y >= 18 ? [0, (e.x < 5 ? f : 1 - f) ? -1 : 0] : [0, 0];
}
function villagerAt(g, t, cx, by = GROUND, o = {}) { g.sprite(VILLAGER, cx, by, { off: villagerStep(t), ...o }); }
function villagerIdle(g, t, o = {}) { villagerAt(g, t, 24, GROUND, o); }
const emerald = (g, x, y) => { g.R(x + 1, y, 2, 1, '#7ff0a0'); g.R(x, y + 1, 4, 3, '#2fbf5a'); g.R(x + 1, y + 4, 2, 1, '#1f8f40'); g.R(x + 1, y + 1, 1, 1, '#bfffd0'); };
// 村人がよろこぶときの みどりのキラキラ
function happy(g, t, t0, n = 8) {
  for (let i = 0; i < n; i++) {
    const k = seg(t, t0 + i * .08, t0 + i * .08 + .6); if (k <= 0 || k >= 1) continue;
    const x = 12 + hash(i + 7) * 24, y = 38 - hash(i + 9) * 10 - k * 14;
    g.R(x, y - 1, 1, 3, '#5ff07a', 1 - k); g.R(x - 1, y, 3, 1, '#5ff07a', 1 - k);
  }
}
function crossfade(g, t, a, b) { const k = seg(t, a, b); if (k < 1) mascotIdle(g, t, { a: 1 - k }); if (k > 0) villagerIdle(g, t, { a: k }); }

// ---------- 村人への 10 とおりの変身 ----------
const VILLAGER_PATTERNS = [
  { name: 'エメラルドで 取り引き', how: 'エメラルドが落ちてきて うれしくなると',
    draw(g, t) {
      const fall = seg(t, 1.0, 1.5);
      if (fall > 0 && fall < 1) emerald(g, 22, lerp(-6, 22, fall * fall));
      if (t >= 1.5 && t < 2.0) mascotIdle(g, t, { off: () => [0, Math.floor(t * 8) % 2 ? -2 : 0] });
      else crossfade(g, t, 2.0, 2.6);
      if (t > 1.5 && t < 2.0) emerald(g, 22, 22 + (Math.floor(t * 8) % 2 ? -2 : 0));
      happy(g, t, 1.6, 10);
    } },
  { name: '作業台に タッチ', how: '作業台が出てきて 光がこぼれると',
    draw(g, t) {
      const pop = seg(t, 0.8, 1.1), sc = pop < 1 ? Math.sin(pop * Math.PI * .5) * (1 + .3 * Math.sin(pop * Math.PI)) : 1;
      if (pop > 0) {
        const w = 8 * sc, x = 39 - w / 2, y = GROUND - w;
        g.R(x, y, w, w, '#9a6a3c'); g.R(x, y, w, w * .25, '#b8874f'); g.R(x + w * .25, y + w * .45, w * .2, w * .4, '#5e3e22'); g.R(x + w * .6, y + w * .45, w * .2, w * .4, '#6b6b6b');
        const glow = seg(t, 1.3, 1.9); if (glow > 0 && glow < 1) g.R(x, y, w, w, '#ffffff', Math.sin(glow * Math.PI) * .5);
      }
      for (let i = 0; i < 6; i++) { const k = seg(t, 1.4 + i * .07, 1.9 + i * .07); if (k > 0 && k < 1) g.R(lerp(37, 26, k), lerp(34, 30, k) - Math.sin(k * Math.PI) * 6, 2, 2, '#5ff07a', 1 - k * .5); }
      const m = seg(t, 1.9, 2.5);
      if (m < 1) mascotIdle(g, t, { a: 1 - m, col: e => e.c === '#1a1612' ? e.c : mix(e.c, '#7a4e33', seg(t, 1.6, 2.0)) });
      if (m > 0) villagerAt(g, t, 22, GROUND, { a: m });
    } },
  { name: '家が たつ', how: 'まわりに家が たって 消えると中から',
    draw(g, t) {
      if (t < 2.0) mascotIdle(g, t); else villagerIdle(g, t);
      const wall = ease(seg(t, 0.9, 1.6)), roof = seg(t, 1.6, 1.9), gone = seg(t, 2.2, 2.8);
      if (wall <= 0) return;
      const a = 1 - gone, top = lerp(GROUND, 28, wall);
      g.R(12, top, 24, GROUND - top, '#b8874f', a);
      for (let y = GROUND - 4; y > top; y -= 4) g.R(12, y, 24, 1, '#8a6238', a);
      g.R(12, top, 2, GROUND - top, '#6b4329', a); g.R(34, top, 2, GROUND - top, '#6b4329', a);
      if (wall >= 1) { g.R(21, GROUND - 8, 6, 8, '#6b4329', a); g.R(15, 31, 4, 3, '#9fd3f0', a); g.R(29, 31, 4, 3, '#9fd3f0', a); }
      if (roof > 0) for (let i = 0; i < 4; i++) { const k = seg(roof, i * .2, i * .2 + .4); if (k > 0) g.R(10 + i * 3, 28 - (i + 1) * 2.2 * k, 28 - i * 6, 2.2, '#5e3e22', a); }
    } },
  { name: 'みどりの キラキラ', how: 'キラキラが ぐるぐる回って まん中に集まる',
    draw(g, t) {
      crossfade(g, t, 1.9, 2.3);
      const k = seg(t, 1.0, 2.3);
      if (k > 0 && k < 1) for (let i = 0; i < 10; i++) {
        const an = i / 10 * Math.PI * 2 + k * 9, r = (1 - k) * 18 + 2;
        const x = 24 + Math.cos(an) * r, y = 30 + Math.sin(an) * r * .6;
        g.R(x, y - 1, 1, 3, '#5ff07a'); g.R(x - 1, y, 3, 1, '#5ff07a');
      }
      const f = seg(t, 1.9, 2.3); if (f > 0 && f < 1) g.disc(24, 30, Math.round(3 + f * 14), '#d8ffe0', (1 - f) * .7);
    } },
  { name: '鼻が のびる', how: '鼻がにょきにょき のびてきて',
    draw(g, t) {
      const nose = seg(t, 1.0, 1.8), st = ease(seg(t, 1.9, 2.5)), x = seg(t, 2.3, 2.8);
      if (x < 1) {
        const by = GROUND + (t < 1 ? bob(t) : 0), sy = lerp(1, 1.6, st), sx = lerp(1, .7, st);
        g.sprite(MASCOT, 24, by, { sx, sy, a: 1 - x, col: e => e.c === '#1a1612' ? e.c : mix(e.c, '#c69477', st) });
        const nh = Math.round(nose * 7);
        if (nh > 0) { const top = by - 16 * sy + 5 * sy; g.R(23, top, 2, nh * (1 - st * .4), '#a8705a', 1 - x); }
      }
      if (x > 0) villagerIdle(g, t, { a: x });
      if (nose > 0 && nose < 1) g.T('ニョキ', 38, 18, 5, '#ffd84a');
    } },
  { name: 'ローブを はおる', how: '茶色のローブが ふってきて すっぽり',
    draw(g, t) {
      const fall = seg(t, 1.0, 1.5), out = ease(seg(t, 1.9, 2.5));
      if (t < 1.5) mascotIdle(g, t);
      if (out > 0) villagerIdle(g, t);
      if (fall > 0 && out < 1) {
        const y = lerp(-20, 24, fall * fall), h = 18, a = 1 - out;
        g.R(15, y, 18, h, '#7a4e33', a); g.R(15, y, 18, 2, '#946240', a); g.R(15, y + h - 1, 18, 1, '#5e3e22', a);
        if (fall >= 1 && t < 1.9) { const w = Math.floor(t * 10) % 2; g.R(15 + w, y, 18, 2, '#946240'); }
      }
    } },
  { name: 'ハァン？と 首ふり', how: '首をふるたびに だんだん村人に',
    draw(g, t) {
      const k = seg(t, 1.0, 2.4), sh = k > 0 && k < 1 ? (Math.floor(t * 8) % 2 ? 2 : -2) : 0;
      const isV = t >= 2.4 || (k > 0 && hash(Math.floor(t * 8)) < k);
      g.shake(sh, 0, () => { if (isV) villagerIdle(g, t); else mascotIdle(g, t); });
      if (t > 1.0 && t < 3.2) g.T('ハァン？', 38, 10, 5, '#f3ead6', 1 - seg(t, 2.8, 3.2));
    } },
  { name: '村の鐘 カーン', how: '金の鐘が鳴りひびくと',
    draw(g, t) {
      const ring = seg(t, 1.0, 2.0), sw = ring > 0 && ring < 1 ? Math.round(Math.sin(ring * Math.PI * 6) * 2 * (1 - ring)) : 0;
      // 鐘は 村人の頭の すこし上（BY が鐘のてっぺん）
      const BY = 6;
      g.R(23, BY - 3, 2, 3, '#5a5a62');
      g.shake(sw, 0, () => { g.R(20, BY, 8, 2, '#f2c14e'); g.R(19, BY + 2, 10, 5, '#e0a82e'); g.R(18, BY + 7, 12, 2, '#f2c14e'); g.R(21, BY + 2, 2, 4, '#fff0a0'); });
      for (let i = 0; i < 3; i++) { const k = seg(t, 1.1 + i * .3, 1.7 + i * .3); if (k > 0 && k < 1) { const r = 6 + k * 14, y = BY + 7; g.R(24 - r, y, 2, 1, '#fff0a0', 1 - k); g.R(24 + r - 2, y, 2, 1, '#fff0a0', 1 - k); g.R(24 - r * .7, y - r * .5, 2, 1, '#fff0a0', 1 - k); g.R(24 + r * .7 - 2, y - r * .5, 2, 1, '#fff0a0', 1 - k); } }
      if (ring > 0 && ring < 1) g.T('カーン', 38, 6, 5, '#ffd84a');
      crossfade(g, t, 1.7, 2.3);
    } },
  { name: '畑の 小麦から', how: '小麦が のびて かくれて 刈りとると',
    draw(g, t) {
      if (t < 1.7) mascotIdle(g, t); else villagerIdle(g, t);
      const grow = ease(seg(t, 0.8, 1.6)), cut = ease(seg(t, 1.9, 2.5));
      const h = Math.round(grow * 22 * (1 - cut));
      if (h > 0) for (let x = 9; x < 40; x += 3) {
        const hh = h - (x % 2), c = x % 6 ? '#c9b03a' : '#a8c03a';
        g.R(x, GROUND - hh, 1, hh, '#7a9a2a'); g.R(x - (x % 2), GROUND - hh, 2, 4, c);
      }
      if (cut > 0 && cut < 1) for (let i = 0; i < 8; i++) g.R(10 + i * 4 + cut * (i % 2 ? 6 : -6), GROUND - 10 - cut * 12 + i % 3, 2, 1, '#e0c84a', 1 - cut);
    } },
  { name: 'トロッコで 入れかわり', how: 'トロッコで出ていって 村人をのせて もどってくる',
    draw(g, t) {
      g.R(0, GROUND - 1, G, 1, '#8a8a8a'); for (let x = 1; x < G; x += 4) g.R(x, GROUND - 1, 2, 1, '#6b4329');
      const out = seg(t, 0.6, 1.4), back = ease(seg(t, 1.6, 2.4)), hop = seg(t, 2.5, 2.9), away = seg(t, 2.6, 3.2);
      let cx, who;
      if (t < 1.5) { cx = lerp(24, 66, out * out); who = 'm'; } else if (hop <= 0) { cx = lerp(-18, 24, back); who = 'v'; } else { cx = lerp(24, 70, away * away); who = ''; }
      const cart = x => { g.R(x - 9, GROUND - 8, 18, 6, '#7a7a7a'); g.R(x - 9, GROUND - 8, 18, 1, '#9a9a9a'); g.R(x - 7, GROUND - 2, 3, 2, '#3a3a3a'); g.R(x + 4, GROUND - 2, 3, 2, '#3a3a3a'); };
      if (who === 'm') g.sprite(MASCOT, cx, GROUND - 4);
      if (who === 'v') villagerAt(g, t, cx, GROUND - 4);
      cart(cx);
      if (hop > 0) villagerAt(g, t, lerp(24, 22, hop), lerp(GROUND - 4, GROUND, hop) - Math.sin(hop * Math.PI) * 8);
    } },
];

// ---------- マイクラの チキンジョッキー（子どもゾンビが ニワトリに乗っている。右向き） ----------
const JS = CS * 0.75; // チキンジョッキーの1マスの大きさ（キャラクターの0.75倍）
function cellsOf(rows, pal, seed) {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { const p = pal[ch]; cells.push({ x, y, c: p[(r() * p.length) | 0], k: ch }); } }));
  return { w: rows[0].length, h: rows.length, cells, cs: JS };
}
const CHICKEN = cellsOf(
  ['......WWW.', '......WKWB', '......WWWB', '......WRW.', 'WWWWWWWWW.', 'WWWWWWWWW.', 'WWWgggWWW.', 'WWWWWWWWW.', '.WWWWWWW..', '...Y..Y...', '...Y..Y...', '..YY.YY...'],
  { W: ['#f4f4f0', '#e8e8e2', '#ffffff'], g: ['#c8c8c0', '#d4d4cc'], K: ['#101010'], B: ['#f0a030'], R: ['#e0303a'], Y: ['#f0b030', '#e0a020'] }, 41);
const BABY = cellsOf(
  ['HHHHHH', 'GGGGGG', 'GKGGKG', 'GGNNGG', 'GMMMMG', 'GGGGGG', 'GCCCCG', 'GCCCCG', '.PPPP.', '.P..P.'],
  { H: ['#2f5a24', '#38692b'], G: ['#5f9a45', '#4f8a3a', '#6aa84f'], K: ['#101010'], N: ['#3f7030'], M: ['#2b4a20'], C: ['#2aa8a8', '#239090', '#33b8b8'], P: ['#3a3fa0', '#2e3388'] }, 43);
const mirror = sp => ({ ...sp, cells: sp.cells.map(e => ({ ...e, x: sp.w - 1 - e.x })) });
const CHICKEN_L = mirror(CHICKEN), BABY_L = mirror(BABY);
// 足もとの中心 (cx, by) に ジョッキーを描く。left で左向き、run で速く走る、flap で羽をパタパタ
function jockey(g, t, cx, by = GROUND, o = {}) {
  const sp = o.run ? 8 : 4, f = Math.floor(t * sp) % 2, peck = o.peck && Math.floor(t * 3) % 2;
  const ck = o.left ? CHICKEN_L : CHICKEN, bb = o.left ? BABY_L : BABY, dir = o.left ? -1 : 1;
  const off = e => e.y >= 9 ? [0, ((e.x < 5) !== !!o.left ? f : 1 - f) ? -JS : 0] : e.y < 4 ? [peck ? dir * JS : 0, peck ? JS * 2 : (f ? -JS * .5 : 0)] : [0, 0];
  const a = o.a ?? 1, sx = o.sx ?? 1, sy = o.sy ?? 1, col = o.col;
  g.sprite(ck, cx, by, { off, a, sx, sy, col });
  if (o.flap) { const up = Math.floor(t * 10) % 2; g.R(cx - 3 * JS * sx, by - (up ? 10 : 7) * JS * sy, 5 * JS * sx, JS * sy, '#e8e8e2', a); }
  // 子どもゾンビは ニワトリのせなかの うしろ寄りに すわって、足を横にたらす。うでを前に出して ゆらゆら
  const bob = f ? -JS * .5 : 0;
  g.sprite(bb, cx - dir * 1.5 * JS * sx, by - 4 * JS * sy + bob, { a, sx, sy, col, off: e => e.y >= 6 && (e.x === 0 || e.x === 5) ? [dir * JS * .5, 0] : [0, 0] });
}
// 白い羽が ふわふわ
function feathers(g, t, t0, n = 10, cx = 24, cy = 30) {
  for (let i = 0; i < n; i++) {
    const k = seg(t, t0 + i * .03, t0 + 1.2 + i * .03); if (k <= 0 || k >= 1) continue;
    const an = hash(i + 3) * Math.PI * 2, d = 6 + k * (8 + hash(i) * 8);
    g.R(cx + Math.cos(an) * d + Math.sin(k * 9 + i) * 2, cy + Math.sin(an) * d * .6 + k * 10, 2, 1, '#ffffff', 1 - k);
  }
}

// ---------- チキンジョッキーへの 10 とおりの変身 ----------
const JOCKEY_PATTERNS = [
  { name: 'タマゴから パカッ', how: '丸まって タマゴになり ゆれて われると',
    draw(g, t) {
      const curl = seg(t, 1.0, 1.4), wob = seg(t, 1.4, 2.1), crack = seg(t, 2.1, 2.4);
      if (curl < 1) mascotIdle(g, t, { sx: 1 - curl * .5, sy: 1 - curl * .5, a: 1 - curl });
      const tilt = wob > 0 && wob < 1 ? Math.round(Math.sin(wob * Math.PI * 6) * 1.5) : 0;
      if (curl > 0 && crack < 1) {
        const a = curl, top = GROUND - 14 * curl;
        g.shake(tilt, 0, () => { g.R(19, top + 2, 10, 14 * curl - 2, '#f4ecd8', a); g.R(20, top, 8, 2, '#f4ecd8', a); g.R(21, top + 3, 2, 3, '#ffffff', a); });
        if (wob > .6) { g.R(22, top + 5, 1, 2, '#8a7a5a'); g.R(23, top + 7, 2, 1, '#8a7a5a'); g.R(25, top + 6, 1, 2, '#8a7a5a'); }
      }
      if (crack > 0) {
        jockey(g, t, 24, GROUND, { sy: crack < 1 ? .6 + crack * .4 : 1 });
        if (crack < 1) for (let i = 0; i < 6; i++) g.R(24 + (i - 2.5) * 4 * (1 + crack), GROUND - 10 - crack * 8 + (i % 2) * 3 + crack * crack * 12, 3, 2, '#f4ecd8', 1 - crack);
      }
    } },
  { name: 'とびのり', how: 'ニワトリが走ってきて ジャンプで飛び乗る',
    draw(g, t) {
      const run = ease(seg(t, 0.8, 1.6)), jump = seg(t, 1.5, 2.2);
      const cx = lerp(-12, 24, run);
      if (jump <= 0) mascotIdle(g, t);
      if (run > 0) {
        if (jump < .5) jockey(g, t, cx, GROUND, { run: run < 1, a: 1 }); 
        else jockey(g, t, 24, GROUND, {});
      }
      if (jump > 0 && jump < .5) g.sprite(MASCOT, 24, GROUND - Math.sin(jump * Math.PI) * 18, { sx: 1 - jump, sy: 1 - jump });
      if (jump > .4 && jump < .8) g.disc(24, 22, Math.round(2 + (jump - .4) * 20), '#cfcfd8', 1 - (jump - .4) * 2.5);
    } },
  { name: '空から パタパタ', how: 'ポンと消えたあと 空から羽ばたいて おりてくる',
    draw(g, t) {
      const poof = seg(t, 1.0, 1.5), down = ease(seg(t, 1.5, 2.8));
      if (poof < .3) mascotIdle(g, t);
      if (poof > 0 && poof < 1) [[24, 34], [18, 37], [30, 37], [24, 28]].forEach(([x, y], i) => g.disc(x, y - poof * 3, Math.round(3 + Math.sin(poof * Math.PI) * 4), i % 2 ? '#cfcfd8' : '#9a98a8', 1 - poof));
      if (down > 0) jockey(g, t, 24 + Math.sin(t * 5) * 3 * (1 - down), lerp(-4, GROUND, down), { flap: down < 1 });
      if (down > 0 && down < 1) feathers(g, t, 1.6, 6, 24, lerp(-10, 30, down));
    } },
  { name: 'ちいさく なって のる', how: 'キャラが小さく みどりになって 下にニワトリが',
    draw(g, t) {
      const sh = ease(seg(t, 1.0, 1.7)), walk = ease(seg(t, 1.7, 2.4)), sw = seg(t, 2.4, 2.7);
      if (sw < 1) {
        const by = lerp(GROUND, GROUND - 6 * JS, walk);
        g.sprite(MASCOT, 24, by, { sx: 1 - sh * .55, sy: 1 - sh * .55, a: 1 - sw, col: e => e.c === '#1a1612' ? e.c : mix(e.c, '#5f9a45', sh) });
        if (walk > 0) g.sprite(CHICKEN, lerp(56, 24, walk), GROUND, { a: 1 - sw });
      }
      if (sw > 0) jockey(g, t, 24, GROUND, { a: sw });
    } },
  { name: 'ぴょんぴょん へんしん', how: 'はねるたびに すこしずつ かわっていく',
    draw(g, t) {
      const k = seg(t, 0.9, 2.5), n = Math.floor(k * 4), ph = (k * 4) % 1, up = k > 0 && k < 1 ? -Math.sin(ph * Math.PI) * 10 : 0;
      const v = (n + (ph > .5 ? 1 : 0)) / 4;
      g.shake(0, up, () => {
        if (v < .5) mascotIdle(g, t, { col: e => e.c === '#1a1612' ? e.c : mix(e.c, '#5f9a45', v * 1.6), sx: 1 - v * .5, sy: 1 - v * .3 });
        else jockey(g, t, 24, GROUND, { col: v < 1 ? e => mix(e.c, '#d97757', (1 - v) * 1.5) : undefined });
      });
      if (k > 0 && k < 1 && ph < .15) g.R(18, GROUND - 1, 12, 1, '#c8b8a0', .6);
    } },
  { name: '羽が ぶわっ', how: 'まっ白な羽が まいあがって その中から',
    draw(g, t) {
      if (t < 1.6) mascotIdle(g, t); else jockey(g, t, 24, GROUND);
      const k = seg(t, 1.1, 2.6);
      if (k > 0 && k < 1) {
        for (let i = 0; i < 26; i++) {
          const an = hash(i) * Math.PI * 2 + k * 3, d = 2 + Math.sin(k * Math.PI) * (10 + hash(i + 5) * 10);
          g.R(24 + Math.cos(an) * d, 30 + Math.sin(an) * d * .8 - k * 4, 2, 1, i % 3 ? '#ffffff' : '#e0e0d8', 1 - k * k);
        }
      }
    } },
  { name: '走りまわる', how: '左へ走っていって ジョッキーが 行ったり来たり',
    draw(g, t) {
      const out = seg(t, 0.8, 1.4);
      if (out < 1) g.sprite(MASCOT, lerp(24, -16, out * out), GROUND + (out > 0 ? walkFrame(t) : bob(t)));
      const a = seg(t, 1.4, 2.0), b = seg(t, 2.0, 2.6), c = seg(t, 2.6, 3.1);
      if (a > 0 && b <= 0) jockey(g, t, lerp(-12, 60, a), GROUND, { run: true });
      else if (b > 0 && c <= 0) jockey(g, t, lerp(60, -12, b), GROUND, { run: true, left: true });
      else if (c > 0) jockey(g, t, lerp(-12, 24, ease(c)), GROUND, { run: c < 1 });
    } },
  { name: 'コケッ！で びっくり', how: 'ニワトリの声に とびあがって おりてきたら',
    draw(g, t) {
      const jump = seg(t, 1.3, 2.1);
      if (t < 1.3) mascotIdle(g, t);
      else if (jump < .5) g.sprite(MASCOT, 24, GROUND - Math.sin(jump * Math.PI) * 22, { col: e => e.c === '#1a1612' ? e.c : mix(e.c, '#ffffff', .3) });
      else if (jump < 1) jockey(g, t, 24, GROUND - Math.sin(jump * Math.PI) * 22);
      else jockey(g, t, 24, GROUND);
      if (t > 0.9 && t < 1.6) g.T('コケッ!', 38, 14, 5, '#ffffff');
      if (jump > 0 && jump < .5) { g.R(32, 6, 1, 3, '#ffd84a'); g.R(32, 10, 1, 1, '#ffd84a'); }
    } },
  { name: 'えさまき', how: 'たねをまくと ニワトリが つつきにきて',
    draw(g, t) {
      const throwK = seg(t, 0.9, 1.4), come = ease(seg(t, 1.4, 2.0)), sw = seg(t, 2.2, 2.7);
      for (let i = 0; i < 7; i++) {
        const k = seg(throwK, i * .08, i * .08 + .6), x = lerp(28, 30 + i * 2.5, k), y = lerp(30, GROUND - 1, k) - Math.sin(k * Math.PI) * 6;
        if (k > 0 && !(come >= 1 && i < 4 && t > 2.0 + i * .1)) g.R(x, y, 1, 1, '#e0c84a');
      }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, off: e => throwK > 0 && throwK < 1 && e.x >= 10 ? [0, -2] : [0, 0] });
      if (come > 0 && sw <= 0) g.sprite(CHICKEN_L, lerp(60, 36, come), GROUND, { off: e => e.y < 4 && come >= 1 && Math.floor(t * 4) % 2 ? [-JS, JS * 2] : [0, 0] });
      if (sw > 0) { jockey(g, t, lerp(36, 28, sw), GROUND, { left: true, peck: true, a: sw }); }
      if (sw > 0 && sw < 1) g.disc(30, 30, Math.round(3 + sw * 8), '#d8ffd0', (1 - sw) * .6);
    } },
  { name: 'ぐるぐる まわって', how: 'ジョッキーが まわりを回って 重なると',
    draw(g, t) {
      const k = seg(t, 1.0, 2.6), m = seg(t, 2.2, 2.6);
      const an = k * Math.PI * 4, r = (1 - ease(k)) * 16, x = 24 + Math.sin(an) * r, back = Math.cos(an) < 0;
      const J = () => { if (k > 0) jockey(g, t, x, GROUND - (back ? 2 : 0), { run: k < 1, left: Math.cos(an) < 0, sx: back ? .9 : 1, sy: back ? .9 : 1 }); };
      if (back) J();
      if (m < 1) mascotIdle(g, t, { a: 1 - m });
      if (!back) J();
    } },
];

// ---------- カズ（カズクラ）のキャラクター（図案をもとに、ゾンビと同じ体のつり合い：頭8マス・体6段・足5段） ----------
const KS = CS * 0.6; // 1マスの大きさ（ゾンビと同じ）
const KAZU = cellsOf([
  '..HHHHHHHH..', '..HHHHHHHH..', '..HHSHSSSH..', '..HSSSSSSH..', '..SWKSSKWS..', '..SWWSSWWS..', '..SSSMMSSS..', '..SSSSSSSS..',
  '.SSWSSSSWSS.', '.SSWWSSWWSS.', '.SSWWWWWWSS.', '.SSWWWWWWSS.', '.SSWWWWWWSS.', '.SSRRRRRRSS.',
  '...PPPPPP...', '...PPPPPP...', '...SSSSSS...', '...SSSSSS...', '...EEEEEE...',
], { H: ['#0a0a0a', '#151515'], S: ['#e8bc8e', '#e3b487', '#eec496'], W: ['#f7f7f7', '#ffffff'], K: ['#0a0a0a'], M: ['#0a0a0a'], R: ['#963a3a', '#8a3434'],
     P: ['#6a6a6a', '#707070', '#646464'], D: ['#6e6e6e', '#767676'], E: ['#555555', '#5e5e5e'] }, 51);
KAZU.cs = KS;
const kArm = e => e.y >= 8 && e.y < 14 && (e.x < 3 || e.x >= 9);
// 腕のかっこう：down（ふつう）・up（上げる）・fwd（前に出す）。l は見て左の腕、r は見て右の腕
function kazuAt(g, t, cx = 24, by = GROUND, o = {}) {
  const f = o.still ? 0 : Math.floor(t * 4) % 2, l = o.l || 'down', r = o.r || 'down';
  const pose = e => (e.x < 3 ? l : r);
  g.sprite(o.sp || KAZU, cx, by, {
    a: o.a, col: o.col,
    show: e => !(kArm(e) && pose(e) === 'fwd' && e.y >= 11) && (!o.show || o.show(e)),
    off: e => {
      if (kArm(e)) { const p = pose(e); if (p === 'up') return [0, -7 * KS]; if (p === 'down' && !o.still) return [0, ((e.x < 3) === !!f ? -KS : 0)]; return [0, 0]; }
      return [0, 0];
    },
  });
}
// 手のまん中の場所（見て左 'l'・右 'r'）
function kHand(side, pose, cx = 24, by = GROUND) {
  const x = cx + (side === 'l' ? -4 : 4) * KS;
  return [x, pose === 'up' ? by - 17.5 * KS : pose === 'fwd' ? by - 8.5 * KS : by - 5.5 * KS];
}
// まずはキャラクターが ポン と カズさんに なる
function kazuIntro(g, t) {
  const k = seg(t, 0.9, 1.3);
  if (k < .4) mascotIdle(g, t);
  if (k > 0 && k < 1) [[24, 34], [17, 37], [31, 37], [24, 26]].forEach(([x, y], i) => g.disc(x, y - k * 3, Math.round(3 + Math.sin(k * Math.PI) * 4), i % 2 ? '#cfcfd8' : '#9a98a8', 1 - k));
  return k < .4;
}
// 道具の絵
const DIA = '#4fd1d9', DIA_L = '#a8f0f0', DIA_D = '#2a9aa8', WOODC = '#8b5a2b', STRING = '#e8e8e8';
function line(g, x, y, dx, dy, n, c, w = 1) { for (let i = 0; i < n; i++) g.R(x + dx * i, y + dy * i, w, w, c); }
function sword(g, x, y, ang) { // ang：0=上、1=ななめ、2=横
  const [dx, dy] = [[0, -1], [.7, -.7], [1, 0]][ang];
  line(g, x - dx, y - dy, dx, dy, 2, WOODC); g.R(x - 1 + dx * 1.5, y - 1 + dy * 1.5, 2, 2, '#3a2a18'); line(g, x + dx * 2, y + dy * 2, dx, dy, 7, DIA); line(g, x + dx * 3, y + dy * 3, dx, dy, 3, DIA_L);
}
function pickaxe(g, x, y, ang) {
  const [dx, dy] = [[0, -1], [.7, -.7], [1, 0]][ang];
  line(g, x, y, dx, dy, 7, WOODC);
  const hx = x + dx * 7, hy = y + dy * 7; // 先に つるはしの頭（ダイヤ）
  line(g, hx - dy * 3, hy + dx * 3, dy, -dx, 7, DIA); g.R(hx - dy * 3, hy + dx * 3 + 1, 1, 1, DIA_D); g.R(hx + dy * 3, hy - dx * 3 + 1, 1, 1, DIA_D);
}
function tnt(g, x, y, flash = 0) {
  g.R(x, y, 8, 8, '#d83a2a'); g.R(x, y + 3, 8, 2, '#f2f2f2'); g.R(x + 1, y + 3, 6, 2, '#1a1a1a');
  g.R(x + 2, y + 3, 1, 1, '#f2f2f2'); g.R(x + 5, y + 4, 1, 1, '#f2f2f2'); g.R(x, y, 8, 1, '#a82a1a');
  if (flash) g.R(x, y, 8, 8, '#ffffff', flash);
}
const noteK = (g, x, y, a = 1) => { g.R(x, y + 2, 2, 2, '#ffd84a', a); g.R(x + 1, y - 1, 1, 3, '#ffd84a', a); g.R(x + 2, y - 1, 1, 1, '#ffd84a', a); };
const heartK = (g, x, y, a = 1) => { g.R(x, y, 2, 1, '#e8687d', a); g.R(x + 3, y, 2, 1, '#e8687d', a); g.R(x, y + 1, 5, 1, '#e8687d', a); g.R(x + 1, y + 2, 3, 1, '#e8687d', a); g.R(x + 2, y + 3, 1, 1, '#e8687d', a); };

// ---------- カズさんの 10 とおりの装備と動き ----------
const KAZU_PATTERNS = [
  { name: 'ダイヤの剣で ズバッ', how: 'ダイヤの剣を ふりかぶって 3回きる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.3, 3.0), n = Math.floor(k * 6), up = k > 0 && k < 1 && n % 2 === 0;
      const r = up ? 'up' : 'fwd'; kazuAt(g, t, 24, GROUND, { r });
      const [hx, hy] = kHand('r', r); sword(g, hx, hy, up ? 0 : (k >= 1 ? 1 : 2));
      if (k > 0 && k < 1 && !up) for (let i = 0; i < 4; i++) g.R(hx + 3 + i * 2, hy - 6 + i * 2.5, 2, 1, '#ffffff', .8);
    } },
  { name: '弓矢で シュッ', how: '弓を引いて 矢がまっすぐ飛んでいく',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const pull = seg(t, 1.3, 2.0), fly = seg(t, 2.0, 2.6);
      kazuAt(g, t, 20, GROUND, { r: 'fwd', l: 'fwd', still: pull > 0 });
      const [bx, by] = kHand('r', 'fwd', 20);
      g.R(bx + 2, by - 5, 1, 2, WOODC); g.R(bx + 3, by - 3, 1, 6, WOODC); g.R(bx + 2, by + 3, 1, 2, WOODC);
      const sx = bx + 2 - pull * 3 * (fly > 0 ? 0 : 1);
      g.R(Math.min(sx, bx + 2), by - 4, 1, 8, STRING, .9);
      if (fly <= 0) { if (pull > 0) { g.R(sx, by, 7, 1, '#d8d8d8'); g.R(sx + 6, by - 1, 1, 3, '#c0c0c0'); } }
      else if (fly < 1) { const ax = lerp(bx + 4, 52, fly); g.R(ax, by, 7, 1, '#d8d8d8'); g.R(ax + 6, by - 1, 1, 3, '#c0c0c0'); g.R(ax - 1, by - 1, 1, 1, '#ffffff', .6); }
    } },
  { name: 'つるはしで ほる', how: '石をたたいて こわすと ダイヤが出てくる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.3, 2.6), n = Math.floor(k * 6), up = k > 0 && k < 1 && n % 2 === 0, broke = t >= 2.6;
      const r = up ? 'up' : 'fwd'; kazuAt(g, t, 19, GROUND, { r });
      if (!broke) { g.R(30, GROUND - 8, 8, 8, '#8a8a8a'); g.R(31, GROUND - 7, 2, 2, '#a0a0a0'); g.R(35, GROUND - 4, 2, 2, '#707070'); if (n >= 2) { g.R(33, GROUND - 7, 1, 3, '#3a3a3a'); g.R(34, GROUND - 4, 2, 1, '#3a3a3a'); } if (n >= 4) { g.R(31, GROUND - 3, 3, 1, '#3a3a3a'); g.R(36, GROUND - 7, 1, 2, '#3a3a3a'); } }
      if (!broke || t < 3.0) { const [hx, hy] = kHand('r', r, 19); pickaxe(g, hx, hy, up ? 0 : 2); }
      const b = seg(t, 2.6, 3.1);
      if (b > 0 && b < 1) for (let i = 0; i < 8; i++) g.R(34 + Math.cos(i) * b * 9, GROUND - 4 + Math.sin(i) * b * 6 + b * b * 6, 2, 2, '#8a8a8a', 1 - b);
      if (broke) { const y = GROUND - 4 - Math.sin(seg(t, 2.6, 3.2) * Math.PI) * 6; g.R(33, y, 3, 1, DIA_L); g.R(32, y + 1, 5, 2, DIA); g.R(33, y + 3, 3, 1, DIA_D); }
    } },
  { name: '盾で ガード', how: '飛んでくる矢を 盾で はじきかえす',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      kazuAt(g, t, 22, GROUND, { r: 'fwd', still: t > 1.4 });
      if (t > 1.4) { const [hx, hy] = kHand('r', 'fwd', 22); g.R(hx - 1, hy - 6, 6, 10, '#7a5a3a'); g.R(hx, hy - 5, 4, 8, '#8a8a8a'); g.R(hx + 1, hy - 3, 2, 4, '#5a5a5a'); }
      for (let i = 0; i < 3; i++) {
        const st = 1.6 + i * .5, a = seg(t, st, st + .3), b = seg(t, st + .3, st + .6), y = GROUND - 16 + i * 3;
        if (a > 0 && a < 1) g.R(lerp(50, 31, a), y, 6, 1, '#d8d8d8');
        if (b > 0 && b < 1) { g.R(31 + b * 8, y - b * 10, 1, 5, '#d8d8d8', 1 - b); g.R(30, y - 2, 1, 1, '#ffd84a', 1 - b); g.R(30, y + 2, 1, 1, '#ffd84a', 1 - b); }
      }
    } },
  { name: 'ダイヤのよろい', how: 'ぼうし・むね・ズボン・くつの じゅんに キラッ',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const parts = [[e => e.y < 3, 1.4], [e => e.y >= 8 && e.y < 13, 1.8], [e => e.y >= 13 && e.y < 18, 2.2], [e => e.y >= 18, 2.6]];
      const on = e => parts.some(([sel, st]) => sel(e) && t >= st);
      kazuAt(g, t, 24, GROUND, { col: e => on(e) && !(e.k === 'S' && kArm(e)) ? (e.k === 'H' || e.k === 'P' || e.k === 'E' ? DIA_D : e.k === 'R' ? DIA_D : DIA) : e.c });
      parts.forEach(([, st], i) => { const k = seg(t, st, st + .4); if (k > 0 && k < 1) { const y = [20, 31, 37, 41][i]; g.R(28 + k * 4, y - 2 - k * 2, 1, 3, '#ffffff', 1 - k); g.R(27 + k * 4, y - 1 - k * 2, 3, 1, '#ffffff', 1 - k); } });
    } },
  { name: 'エリトラで 飛ぶ', how: '羽を広げて 花火でビューンと 空をすべる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const up = ease(seg(t, 1.4, 2.0)), down = ease(seg(t, 2.7, 3.3)), fly = up * (1 - down);
      const x = 24 + Math.sin(seg(t, 1.4, 3.3) * Math.PI * 2) * 8 * fly, by = GROUND - fly * 16;
      if (t > 1.3) { const w = 4 + fly * 3, y = by - 11 * KS; g.R(x - 5 - w, y, w, 6, '#8a8aa8'); g.R(x + 5, y, w, 6, '#8a8aa8'); g.R(x - 5 - w, y, w, 1, '#b8b8d0'); g.R(x + 5, y, w, 1, '#b8b8d0'); }
      kazuAt(g, t, x, by, { l: fly > .2 ? 'up' : 'down', r: fly > .2 ? 'up' : 'down' });
      const fw = seg(t, 1.4, 1.9);
      if (fw > 0 && fw < 1) for (let i = 0; i < 6; i++) g.R(24 + (hash(i) - .5) * 6, GROUND - fw * 10 + i * 2, 1, 1, i % 2 ? '#ff7a5a' : '#ffd84a', 1 - fw);
    } },
  { name: 'つり', how: 'つりざおを投げて ウキがしずむと 魚がつれる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      g.R(31, GROUND, 17, 3, '#3a7ad0'); g.R(31, GROUND, 17, 1, '#7ab8f0');
      const cast = seg(t, 1.3, 1.7), bite = t > 2.3 && t < 2.6, pull = seg(t, 2.6, 3.2);
      kazuAt(g, t, 18, GROUND, { r: pull > 0 && pull < .5 ? 'up' : 'fwd', still: true });
      const [hx, hy] = kHand('r', 'fwd', 18), tipx = hx + 8, tipy = hy - 8;
      line(g, hx, hy, 1, -1, 8, WOODC);
      if (cast > 0 && pull <= 0) { const bx = lerp(tipx, 40, cast), byb = lerp(tipy, GROUND - 1 + (bite ? 1 : 0), cast); for (let i = 1; i < 6; i++) g.R(lerp(tipx, bx, i / 6), lerp(tipy, byb, i / 6) + Math.sin(i / 6 * Math.PI) * 2, 1, 1, STRING, .7); g.R(bx, byb - 1, 2, 2, '#e0303a'); }
      if (pull > 0) { const fx = lerp(40, 22, pull), fy = lerp(GROUND - 2, 8, Math.sin(pull * Math.PI * .5)) + pull * pull * 10; g.R(fx, fy, 5, 3, '#6fa8c8'); g.R(fx + 5, fy - 1, 2, 5, '#4f88a8'); g.R(fx + 1, fy + 1, 1, 1, '#101010'); }
      if (bite) g.R(39, GROUND - 4, 1, 2, '#ffffff');
    } },
  { name: 'ケーキを 食べる', how: 'ケーキを パクッ もぐもぐ ハート',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.4, 2.8), left = 4 - Math.floor(k * 4), eat = k > 0 && k < 1 && Math.floor(t * 4) % 2;
      kazuAt(g, t, 21, GROUND, { r: eat ? 'fwd' : 'down', still: true });
      if (left > 0) { const w = left * 2; g.R(28, GROUND - 6, w, 6, '#f2e0c0'); g.R(28, GROUND - 6, w, 2, '#ffffff'); g.R(28, GROUND - 3, w, 1, '#e8687d'); for (let i = 0; i < left; i++) g.R(28 + i * 2, GROUND - 7, 1, 1, '#e0303a'); }
      if (eat) g.R(21 - .5, GROUND - 13 * KS, 2, 1, '#ffffff');
      if (t > 2.8) heartK(g, 26, 14 - seg(t, 2.8, 3.4) * 4, 1 - seg(t, 3.2, 3.6));
    } },
  { name: 'ノリノリ ダンス', how: '両手を かわりばんこに上げて ステップ',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.3, 3.3), b = Math.floor(t * 5) % 2, on = k > 0 && k < 1;
      kazuAt(g, t, 24 + (on ? (b ? 1 : -1) : 0), GROUND - (on && b ? 1 : 0), { l: on ? (b ? 'up' : 'down') : 'down', r: on ? (b ? 'down' : 'up') : 'down', still: on });
      if (on) { noteK(g, b ? 12 : 34, 14 - (t * 6 % 4), .9); noteK(g, b ? 34 : 13, 20 - (t * 6 % 4), .7); }
    } },
  { name: 'TNTで ドカーン', how: 'TNTに火をつけて 走ってにげる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const boom = seg(t, 2.4, 3.0), run = seg(t, 1.6, 2.2), back = ease(seg(t, 3.0, 3.5));
      if (boom <= 0) tnt(g, 30, GROUND - 8, t > 1.6 && Math.floor(t * 8) % 2 ? .7 : 0);
      if (t > 1.4 && t < 1.6) g.R(34, GROUND - 10, 1, 2, '#ff7a2e');
      const x = back > 0 ? lerp(4, 24, back) : lerp(22, 4, run);
      kazuAt(g, t * (run > 0 && run < 1 ? 2 : 1), x, GROUND);
      if (boom > 0 && boom < 1) {
        g.disc(34, GROUND - 4, Math.round(3 + boom * 10), '#ffd84a', 1 - boom);
        for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2, d = boom * 16; g.R(34 + Math.cos(an) * d, GROUND - 4 + Math.sin(an) * d * .7, 2, 2, i % 3 ? '#8a8898' : '#ff7a2e', 1 - boom); }
      }
    } },
];

// ---------- まぐにぃさんのキャラクター（ゾンビ・カズさんと同じ体のつり合い） ----------
const MAGU = cellsOf([
  '..HHHHHHHH..', '..HHHHHHHH..', '..HHHSSSSH..', '..HSSSSSSS..', '..SWWSSWWS..', '..SWKSSKWS..', '..SSKKKKSS..', '..SSSKKSSS..',
  '.GGGGGGGGGG.', '.GGGGBBGGGG.', '.SSGBLLWGSS.', '.SSBLLLYGSS.', '.SSGGBBGGSS.', '.SSGGGGGGSS.',
  '...PPPPPP...', '...PPPPPP...', '...PPPPPP...', '...CXCXCX...', '...OOOOOO...',
], { H: ['#0a0a0a', '#161616'], S: ['#f0d6bc', '#ecd0b4', '#f4dcc4'], W: ['#ffffff'], K: ['#0a0a0a'], G: ['#2e9a2e', '#289028', '#34a434'],
     B: ['#2a7ad8', '#3a8ae0'], L: ['#6ac0f0', '#58b4ec'], Y: ['#9a9aa8'], P: ['#141414', '#1c1c1c'], C: ['#f2f2f2'], X: ['#1a1a1a'], O: ['#f0a830', '#e89c20'] }, 61);
MAGU.cs = KS;
const maguAt = (g, t, cx = 24, by = GROUND, o = {}) => kazuAt(g, t, cx, by, { ...o, sp: MAGU });
const BLOCK = (g, x, y, top, side) => { g.R(x, y, 6, 6, side); g.R(x, y, 6, 2, top); };

// ---------- まぐにぃさんの 10 とおりの装備と動き ----------
const MAGU_PATTERNS = [
  { name: 'トライデントを 投げる', how: 'ヤリを投げて くるっと手元に もどってくる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const th = seg(t, 1.6, 2.2), bk = seg(t, 2.3, 2.9), held = th <= 0 || bk >= 1;
      maguAt(g, t, 18, GROUND, { r: th <= 0 && t > 1.3 ? 'up' : 'fwd' });
      const tri = (x, y, dx) => { line(g, x, y, dx, 0, 9, '#3a8a8a'); g.R(x + dx * 9, y - 2, 1, 5, '#5ac8c8'); g.R(x + dx * 10, y - 2, 1, 1, '#5ac8c8'); g.R(x + dx * 10, y, 1, 1, '#5ac8c8'); g.R(x + dx * 10, y + 2, 1, 1, '#5ac8c8'); };
      if (held) { const [hx, hy] = kHand('r', th <= 0 && t > 1.3 ? 'up' : 'fwd', 18); tri(hx - 3, hy, 1); }
      else if (th < 1) tri(lerp(22, 46, th), GROUND - 18, 1);
      else { tri(lerp(46, 22, bk), GROUND - 18 + Math.sin(bk * Math.PI) * -6, -1); g.R(lerp(46, 22, bk) - 2, GROUND - 19, 1, 1, '#d8ffff', .8); }
    } },
  { name: 'ハチミツを 飲む', how: 'ハチミツのびんを ごくごく ハート',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.4, 2.8), drink = k > 0 && k < 1;
      maguAt(g, t, 24, GROUND, { r: drink ? 'up' : 'down', still: drink });
      const [hx, hy] = drink ? [27, GROUND - 15] : kHand('r', 'down');
      const lvl = drink ? 1 - k : t >= 2.8 ? 0 : 1;
      g.R(hx - 1, hy - 4, 3, 5, '#d8eef8', .8); g.R(hx - 1, hy - 4 + (1 - lvl) * 4, 3, 1 + lvl * 4, '#f0a020'); g.R(hx, hy - 5, 1, 1, '#c88a40');
      if (t > 2.8) heartK(g, 22, 12 - seg(t, 2.8, 3.4) * 4, 1 - seg(t, 3.2, 3.6));
    } },
  { name: 'ジャンプで ブロック積み', how: 'ジャンプして 足もとに土を置いて 高くのぼる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const n = Math.min(3, Math.floor(seg(t, 1.3, 2.5) * 4)), ph = (seg(t, 1.3, 2.5) * 4) % 1, jump = t > 1.3 && t < 2.5 ? -Math.sin(ph * Math.PI) * 7 : 0;
      const down = ease(seg(t, 2.8, 3.3)), top = GROUND - n * 6;
      for (let i = 0; i < n; i++) BLOCK(g, 21, GROUND - (i + 1) * 6, '#5aa83a', '#7a5230');
      maguAt(g, t, down > 0 ? lerp(24, 36, down) : 24, down > 0 ? lerp(top, GROUND, down) - Math.sin(down * Math.PI) * 6 : top + jump, { l: jump < -2 ? 'up' : 'down', r: jump < -2 ? 'up' : 'down' });
    } },
  { name: 'ボートで こぐ', how: '水の上を ボートで 行ったり来たり',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.3, 3.2), x = 24 + Math.sin(k * Math.PI * 2) * 10, show = seg(t, 1.2, 1.4);
      g.R(0, GROUND - 1, G, 2, '#3a7ad0', show); g.R(0, GROUND - 1, G, 1, '#7ab8f0', show);
      if (show > 0) {
        const row = Math.floor(t * 4) % 2;
        maguAt(g, t, x, GROUND - 3, { l: 'fwd', r: 'fwd', still: true });
        g.R(x - 10, GROUND - 6, 20, 4, '#9a6a3c'); g.R(x - 11, GROUND - 7, 22, 1, '#b8874f'); g.R(x - 9, GROUND - 2, 18, 1, '#6b4329');
        g.R(x - 13 + row * 2, GROUND - 6 + row * 2, 4, 1, '#c98a4a'); g.R(x + 9 - row * 2, GROUND - 6 + row * 2, 4, 1, '#c98a4a');
      }
    } },
  { name: 'オノで 木を切る', how: 'オノで コンコン 木が たおれる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const k = seg(t, 1.3, 2.5), n = Math.floor(k * 6), up = k > 0 && k < 1 && n % 2 === 0, fall = seg(t, 2.5, 3.1);
      if (fall < 1) { const fx = fall * 14, fy = fall * fall * 16; g.R(32, GROUND - 6, 6, 6, n >= 4 ? '#8a6a3c' : '#6b4a2c'); for (let i = 1; i < 4; i++) g.R(32 + fx * i / 3, GROUND - 6 * (i + 1) + fy * i / 3, 6, 6, '#6b4a2c', 1 - fall * fall); g.disc(Math.round(35 + fx * 1.3), Math.round(GROUND - 28 + fy * 1.3), 7, '#3f8a2e', 1 - fall * fall); }
      else { g.R(32, GROUND - 6, 6, 6, '#6b4a2c'); g.R(32, GROUND - 6, 6, 1, '#c8a46a'); }
      maguAt(g, t, 22, GROUND, { r: up ? 'up' : 'fwd' });
      if (fall < 1) { const [hx, hy] = kHand('r', up ? 'up' : 'fwd', 22); line(g, hx, hy, up ? 0 : 1, up ? -1 : 0, 6, WOODC); const ex = hx + (up ? 0 : 6), ey = hy - (up ? 6 : 0); g.R(ex - 1, ey - 2, 3, 3, '#c8c8d0'); }
      if (fall > 0 && fall < 1) for (let i = 0; i < 6; i++) g.R(30 + i * 3, GROUND - 4 - fall * 8 + fall * fall * 10, 1, 1, '#3f8a2e', 1 - fall);
    } },
  { name: '金リンゴで パワーアップ', how: '金のリンゴを食べて キラキラ光る',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const eat = seg(t, 1.4, 2.2), glow = seg(t, 2.2, 3.4);
      maguAt(g, t, 24, GROUND, { r: eat > 0 && eat < 1 ? 'up' : 'down', still: eat > 0 && eat < 1, col: glow > 0 ? e => mix(e.c, '#ffe080', .25 + .2 * Math.sin(t * 20)) : undefined });
      if (eat < 1) { const [hx, hy] = eat > 0 ? [26, GROUND - 15] : kHand('r', 'down'); const s = eat > .5 ? 2 : 3; g.R(hx - 1, hy - 3, s, 3, '#f2c14e'); g.R(hx, hy - 4, 1, 1, '#8b5a2b'); }
      if (glow > 0 && glow < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 3, r = 10; g.R(24 + Math.cos(a) * r, 31 + Math.sin(a) * r * .9, 1, 1, '#ffe080', 1 - glow * .5); }
    } },
  { name: 'カボチャを かぶる', how: 'くりぬいたカボチャを すぽっと かぶる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const fall = seg(t, 1.4, 1.9);
      maguAt(g, t, 24, GROUND, { show: fall >= 1 ? (e => e.y >= 8) : undefined, l: fall >= 1 && t < 2.4 ? 'up' : 'down', r: fall >= 1 && t < 2.4 ? 'up' : 'down' });
      if (fall > 0) {
        const y = lerp(-4, GROUND - 19 * KS, fall * fall), s = 8 * KS;
        g.R(24 - s / 2, y, s, s, '#e08a1a'); g.R(24 - s / 2 + 1, y, 1, s, '#c8781a'); g.R(24 + s / 2 - 2, y, 1, s, '#c8781a'); g.R(23.5, y - 1, 1, 1.5, '#4a7a2a');
        g.R(24 - 3, y + 3, 2, 2, '#3a2010'); g.R(24 + 1, y + 3, 2, 2, '#3a2010'); g.R(24 - 3, y + 6.5, 6, 1, '#3a2010');
      }
    } },
  { name: '水バケツ 着地', how: '高いところから落ちて 水を置いて セーフ！',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const up = seg(t, 1.3, 1.6), fall = seg(t, 1.8, 2.5), water = t > 2.35 && t < 3.0;
      const by = up < 1 ? lerp(GROUND, -10, ease(up)) : fall < 1 ? lerp(-10, GROUND, fall * fall) : GROUND;
      if (water) { g.R(14, GROUND - 3, 20, 3, '#3a7ad0', .9); g.R(14, GROUND - 3, 20, 1, '#9fd3f0'); }
      maguAt(g, t, 24, by, { r: fall > .4 && fall < 1 ? 'fwd' : 'down', l: fall > 0 && fall < 1 ? 'up' : 'down' });
      if (fall > .4 && fall < 1) { const [hx, hy] = kHand('r', 'fwd', 24, by); g.R(hx - 1, hy, 4, 3, '#a8a8b0'); g.R(hx, hy, 2, 1, '#3a7ad0'); }
      if (t > 2.5 && t < 3.0) { g.R(36, 16, 1, 3, '#ffd84a'); g.R(36, 20, 1, 1, '#ffd84a'); }
    } },
  { name: 'オオカミと あそぶ', how: 'ホネを投げると オオカミが とってくる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const th = seg(t, 1.4, 1.9), go = seg(t, 1.6, 2.3), back = seg(t, 2.4, 3.0);
      maguAt(g, t, 14, GROUND, { r: th > 0 && th < .5 ? 'up' : 'down' });
      if (th > 0 && th < 1) g.R(lerp(18, 42, th), GROUND - 16 + Math.sin(th * Math.PI) * -8 + th * 14, 3, 1, '#f2f2e8');
      const wx = back > 0 ? lerp(42, 24, back) : lerp(30, 42, go), left = back > 0, f = Math.floor(t * 8) % 2;
      const d = left ? -1 : 1;
      g.R(wx - 5, GROUND - 7, 10, 4, '#d8d8d0'); g.R(wx + d * 4 - (left ? 3 : 0), GROUND - 10, 4, 4, '#d8d8d0'); g.R(wx + d * 7 - (left ? 1 : 0), GROUND - 8, 2, 2, '#c8c8c0');
      g.R(wx + d * 5 - (left ? 1 : 0), GROUND - 9, 1, 1, '#101010'); g.R(wx + d * 3 - (left ? 1 : 0), GROUND - 7, 2, 1, '#e0303a');
      g.R(wx - d * 6 - (left ? 0 : 1), GROUND - 9 + f, 2, 3, '#d8d8d0');
      [-4, -2, 2, 4].forEach((x, i) => g.R(wx + x, GROUND - 3 - ((i + f) % 2), 1, 3, '#c8c8c0'));
      if (back > 0) g.R(wx + d * 7 - 1, GROUND - 7, 3, 1, '#f2f2e8');
      if (back >= 1) heartK(g, 22, 22 - seg(t, 3.0, 3.5) * 4, 1 - seg(t, 3.3, 3.6));
    } },
  { name: 'ネザーゲート', how: 'むらさきのゲートに 入って また出てくる',
    draw(g, t) {
      if (kazuIntro(g, t)) return;
      const op = seg(t, 1.3, 1.7), inn = seg(t, 1.9, 2.4), out = seg(t, 2.7, 3.2);
      if (op > 0) {
        g.R(26, GROUND - 26, 14, 26, '#2a104a', op); g.R(28, GROUND - 24, 10, 24, '#9a3cd0', op * (.6 + .3 * Math.sin(t * 10)));
        for (let i = 0; i < 5; i++) g.R(29 + hash(i + Math.floor(t * 6)) * 8, GROUND - 22 + hash(i + 9) * 20, 1, 1, '#e0a0ff', op);
      }
      const x = out > 0 ? lerp(33, 20, out) : lerp(18, 33, inn);
      const a = out > 0 ? out : 1 - seg(t, 2.2, 2.5);
      if (a > 0) maguAt(g, t, x, GROUND, { a, col: (inn > .7 && out <= 0) || (out > 0 && out < .4) ? e => mix(e.c, '#9a3cd0', .5) : undefined });
    } },
];

// ---------- いろいろなモブへの 120 とおりの変身（エンダーマン … ロバ、スティーブ … ウミガメ、グロウイカ … ゾンビ村人、ブリーズ … クリーキング、エンダードラゴン … 茶色のムーシュルーム、ラバ … シロクマの親子） ----------
//   案内役の絵に入るように、どのモブも 地面から 23 ドットまでの高さにおさめる（1マスの大きさ cs をモブごとに決める）
const NEWMOB_PATTERNS = (() => {
const EYE = '#1a1612';
const tint = (c, k) => e => e.c === EYE ? e.c : mix(e.c, c, k); // 目はそのままで 色を変える
function build(rows, pal, cs, seed = 7) {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { const p = [].concat(pal[ch]); cells.push({ x, y, c: p[(r() * p.length) | 0], k: ch }); } }));
  return { w: rows[0].length, h: rows.length, cells, cs };
}
// マス (x, y) の左上の場所（足もとの中心が (cx, by) のとき）
const cellAt = (sp, cx, by, x, y) => [cx + (x - sp.w / 2) * sp.cs, by - (sp.h - y) * sp.cs];
// 2本足のモブは 足を かわりばんこに
const legs = (from, mid, speed = 2) => t => { const f = Math.floor(t * speed) % 2; return e => e.y >= from ? [0, ((e.x < mid) === (f === 0)) ? -1 : 0] : [0, 0]; };
// 4本足のモブは 前足と後ろ足を かわりばんこに、しっぽを ふりふり
const paws = (from, front, tail = -1) => t => {
  const f = Math.floor(t * 3) % 2;
  return e => e.y >= from ? [0, ((e.x >= front) === (f === 0)) ? -1 : 0] : e.x <= tail ? [0, Math.floor(t * 5) % 2 ? -1 : 0] : [0, 0];
};
const M = {
  ender: { sp: build([
    '..KKKKKKKK..', '..KKKKKKKK..', '..KKKKKKKK..', '..KKKKKKKK..', '..PMPKKPMP..', '..KKKKKKKK..', '..KKKKKKKK..', '..KKKKKKKK..',
    '.K.KKKKKK.K.', '.K.KKKKKK.K.', '.K.KKKKKK.K.', '.K.KKKKKK.K.', '.K.KKKKKK.K.', '.K.KKKKKK.K.',
    '.K.KK..KK.K.', '.K.KK..KK.K.', '.K.KK..KK.K.', '.K.KK..KK.K.', '...KK..KK...', '...KK..KK...',
  ], { K: ['#161616', '#1e1e22', '#121214'], P: '#e079fa', M: '#cc00fa' }, 1.1), off: legs(14, 6, 1.5) },
  skel: { sp: build([
    '..WWWWWWWW..', '..WWWWWWWW..', '..WWWWWWWW..', '..WKKWWKKW..', '..WWWKKWWW..', '..WWWWWWWW..', '..WKKKKKKW..', '..WWWWWWWW..',
    '.W.WWWWWW.W.', '.W.WKWWKW.W.', '.W.WWWWWW.W.', '.W.KWKWKK.W.', '.W..WWWW..W.', '.W..WWWW..W.',
    '....W..W....', '....W..W....', '....W..W....', '....W..W....', '...WW..WW...',
  ], { W: ['#c8c8c8', '#b5b5b5', '#d6d6d6'], K: '#3a3a3a' }, MS), off: legs(14, 6) },
  blaze: { sp: build([
    'YYYYYYYY', 'YOYYYYOY', 'YYYYYYYY', 'YKKYYKKY', 'YYYYYYYY', 'YOKKKKOY', 'YYYYYYYY', 'OYYOOYYO',
  ], { Y: ['#f0c030', '#e8b020', '#f8d040'], O: '#e07010', K: '#3a1a00' }, 1.4), fly: 10,
    // まわりを くるくる回る 棒と けむり
    extra(g, t, cx, by, o) {
      const a = o.a ?? 1;
      for (let i = 0; i < 8; i++) {
        const ring = i < 4 ? 0 : 1, an = t * (ring ? -2.5 : 2) + (i % 4) / 4 * Math.PI * 2;
        if (Math.sin(an) < -.2) continue; // うしろ側は かくれる
        g.R(cx + Math.cos(an) * (ring ? 5 : 8) - .7, by - 2 + ring * 6 + Math.sin(an), 1.4, 4.5, i % 2 ? '#e8a020' : '#ffcf3a', a);
      }
      for (let i = 0; i < 4; i++) { const ph = (t * .8 + i / 4) % 1; g.R(cx - 5 + hash(i) * 10, by + 3 + ph * 7, 1.5, 1.5, '#5a5050', (1 - ph) * .7 * a); }
    } },
  sheep: { sp: build([
    '..........WWWW', '.WWWWWWWWWSSSS', 'WWWWWWWWWWSKSS', 'WWWWWWWWWWSSSS', 'WWWWWWWWWWSSPS', 'WWWWWWWWWW....', '.WWWWWWWWW....',
    '.SS....SS.....', '.SS....SS.....', '.SS....SS.....',
  ], { W: ['#ececec', '#dedede', '#f6f6f6'], S: '#e6c9a8', K: '#222222', P: '#e8a0a0' }, 1.5), off: paws(7, 5) },
  snow: { sp: build([
    '..OOOOOOOO..', '..OOOOOOOO..', '..OKKOOKKO..', '..OKKOOKKO..', '..OOOOOOOO..', '..OKKKKKKO..', '..OOKOOKOO..', '..OOOOOOOO..',
    'B..WWWWWW..B', '.B.WWWWWW.B.', '..BWWWWWWB..', '...WWWWWW...', '...WWWWWW...',
    '..WWWWWWWW..', '..WWWWWWWW..', '..WWWWWWWW..', '..WWWWWWWW..', '..WWWWWWWW..',
  ], { O: ['#e38a1d', '#d07a12', '#f09a2a'], K: '#5a2a00', B: '#6b4a2a', W: ['#f4f8fb', '#e6eef4', '#dde8f0'] }, 1.25),
    off: t => e => e.k === 'B' && Math.floor(t * 2) % 2 ? [0, -1] : [0, 0] },
  cow: { sp: build([
    '..........H..H', '.BBBWWBBBBBBBB', 'BBBWWWBBBWBKBB', 'BWWWBBBBWWBBBB', 'BBWBBBBWWWBPPP', 'BBBBBWWBBBBPPP', '.BBBBBBBBB....',
    '.BB....BB.....', '.BB....BB.....', '.KK....KK.....',
  ], { B: ['#4a3020', '#563a26'], W: ['#e8e8e8', '#d8d8d8'], K: '#222222', P: '#c9a08a', H: '#d8d0c0' }, 1.5), off: paws(7, 5) },
  cat: { sp: build([
    '........K..K', '........KKKK', 'K.......KGKG', '.KKKKKKKKKKP', '..KKKKKKKK..', '..KKKKKKKK..', '..K.K..K.K..', '..K.K..K.K..',
  ], { K: ['#1c1c22', '#24242c', '#2c2c34'], G: '#7cff4a', P: '#d07090' }, 1.3), off: paws(6, 6, 0) },
  ocelot: { sp: build([
    '........Y..Y', '........YYYY', 'Y.......YGYG', '.YYDYYDYYYYP', '..YYYDYYYY..', '..YDYYYDYY..', '..Y.Y..Y.Y..', '..Y.Y..Y.Y..',
  ], { Y: ['#e8b040', '#f0c050', '#dca838'], D: '#8a5a20', G: '#3ab03a', P: '#d07090' }, 1.3), off: paws(6, 6, 0) },
  bat: { sp: build([
    '.....B..B.....', 'WW...BBBB...WW', 'WWW..BEEB..WWW', '.WWWWBBBBWWWW.', '..WWWBBBBWWW..', '.....B..B.....',
  ], { B: '#4a3a2c', W: ['#2a2422', '#342c28'], E: '#111111' }, 1.3), fly: 9,
    off: t => e => e.k === 'W' ? [0, (Math.floor(t * 10) % 2 ? -1.5 : 1) * (Math.abs(e.x - 6.5) > 4 ? 1 : .5)] : [0, 0] },
  husk: { sp: build([
    '..HHHHHHHH..', '..HGGGGGGH..', '..GGGGGGGG..', '..GKKGGKKG..', '..GGGNNGGG..', '..GGGGGGGG..', '..GGMMMMGG..', '..GGGGGGGG..',
    '.CCCCCCCCCC.', '.CCCCCCCCCC.', '.GGCCCCCCGG.', '.GGCCCCCCGG.', '.GGCCCCCCGG.', '.GGPPPPPPGG.',
    '...PPPPPP...', '...PPdPPP...', '...PPdPPP...', '...PPdPPP...', '...SSSSSS...',
  ], { H: ['#7a6a48', '#857452'], G: ['#a89468', '#9a8660', '#b4a070'], K: '#2a2010', N: '#8a7650', M: '#5a4a30',
    C: ['#6a5a40', '#5e5038', '#76664a'], P: ['#4a3e2c', '#54462f'], d: '#3a2e1e', S: ['#6b6b6b', '#5a5a5a'] }, MS),
    off: zombieStep },  // ゾンビと同じく うでを前に出して ゆらゆら
  squid: { sp: build([
    '..NNNNNN..', '.NNNNNNNN.', '.NNNNNNNN.', '.NNNNNNNN.', '.NWKNNKWN.', '.NNNNNNNN.', '.NNNNNNNN.', '.NNMMMMNN.',
    '.N.N.N.N..', '.N.N.N.N..', '..N.N.N.N.', '..N.N.N.N.', '.N.N.N.N..', '.N...N....',
  ], { N: ['#2a4a6a', '#335577', '#244060'], M: '#1a2a3a', W: '#ffffff', K: '#000000' }, 1.3), fly: 3,
    off: t => e => [e.y >= 8 ? Math.round(Math.sin(t * 4 + e.x + e.y * .6) * (e.y - 7) * .3) : 0, Math.round(Math.sin(t * 2) * -1)] },
  rabbit: { sp: build([
    '.BB..BB.', '.BP..PB.', '.BP..PB.', '.BBBBBB.', 'BBBBBBBB', 'BKBBBBKB', 'BBBPPBBB', 'BBBWWBBB', '.BBBBBB.', 'BBBBBBBB', 'BB.BB.BB',
  ], { B: ['#a0784a', '#946c40', '#ac8454'], P: '#e0a0a0', K: '#222222', W: '#f0f0f0' }, 1.1),
    off: t => { const p = t % 1.4, y = p < .35 ? -Math.round(Math.sin(p / .35 * Math.PI) * 3) : 0; return () => [0, y]; } },
  pig: { sp: build([
    '..PPPPPPPP..', '..PPPPPPPP..', '..PPPPPGGG..', '..PKPPPKGG..', '..PPNNNNGG..', '..PPNKKNPP..', '..PPPPPPPP..', '..PPPPPPPP..',
    '.PPPPPPPPPP.', '.PPPGGPPPPP.', '.PPPGGPPPPP.', '.PPPPPPPPPP.', '.PPPPPPPPPP.', '.PPLLLLLLPP.',
    '...LLLLLL...', '...PP..GP...', '...PP..PP...', '...PG..PP...', '...PP..PP...',
  ], { P: ['#e89a9a', '#d88a8a', '#f0aaaa'], G: ['#5f9a45', '#4f8a3a'], K: '#222222', N: '#c87878', L: '#6a4a2a' }, MS), off: legs(15, 6),
    // 金の剣を 持っている
    extra(g, t, cx, by, o) {
      const a = o.a ?? 1, [x, y] = cellAt(this.sp, cx, by, 10, 13);
      g.R(x, y - 8, 1.2, 8, '#f0d040', a); g.R(x + .6, y - 8, .6, 8, '#fff2a0', a); g.R(x - 1.2, y, 3.6, .8, '#a07020', a); g.R(x, y + .8, 1.2, 1.2, '#6a4a2a', a);
    } },
  ghast: { sp: build([
    'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWKKKWWWWKKKWWW', 'WWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWW', 'WWWWWWKKKKWWWWWW', 'WWWWWWKKKKWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW',
    '..W..W..W..W..W.', '..W..W..W..W..W.', '..W.....W.....W.', '.....W.....W....',
  ], { W: ['#f0f0f0', '#e4e4e4', '#f8f8f8', '#dcdcdc'], K: '#3a3a3a' }, 1.25), fly: 1,
    off: t => e => e.y >= 12 ? [Math.round(Math.sin(t * 3 + e.x) * (e.y - 11) * .4), 0] : [0, 0] },
  golem: { sp: build([
    '....IIIIII....', '....IIIIII....', '....IRIIRI....', '....IIIIII....', '....IINNII....', '....IINNII....',
    '.IIIIIIIIIIII.', 'IIIIIIVIIIIIII', 'IIIIIIVVIIIIII', 'II.IIIIIVII.II', 'II..IIIIII..II', 'II..IIIIII..II',
    'II..IIIIII..II', 'II...IIII...II', 'II..IIIIII..II', '...III..III...', '...III..III...', '...III..III...', '...III..III...', '...III..III...',
  ], { I: ['#d8d0c8', '#c8c0b8', '#bab2aa'], R: '#8a2a1a', N: '#b0a89e', V: '#4f8a3a' }, 1.1), off: legs(15, 7, 1.5),
    // 赤い花を 持っている
    extra(g, t, cx, by, o) {
      const a = o.a ?? 1, [x, y] = cellAt(this.sp, cx, by, 0, 15);
      g.R(x + .5, y - 1, .8, 2.5, '#3a8a2a', a); g.R(x - .5, y - 3, 2.6, 2.4, '#d02020', a); g.R(x + .4, y - 2.2, .8, .8, '#ffcf3a', a);
    } },
  chicken: { sp: build([
    '......WWWW..', '......WWKWOO', '......WWWWOO', 'W.....WWWWR.', 'WWWWWWWWWWR.', 'WWWWWWWWWW..', '.WWWWWWWW...', '..WWWWWW....',
    '....O..O....', '...OO.OO....',
  ], { W: ['#f4f4f4', '#e8e8e8'], O: '#e8a020', R: '#d03030', K: '#222222' }, 1.2),
    off: t => { const f = Math.floor(t * 3) % 3; return e => e.y < 8 && e.x >= 6 && f === 1 ? [1, 1] : [0, 0]; } },
  wolf: { sp: build([
    '...........W..W.', '...........WWWW.', '...........WKWWG', 'W..........WWWWD', '.W.WWWWWWWRRRR..', '..WWWWWWWWWWWW..', '...WWWWWWWWWW...',
    '...W.W....W.W...', '...W.W....W.W...', '...W.W....W.W...',
  ], { W: ['#e0dcd8', '#d4d0cc', '#ece8e4'], K: '#222222', G: '#b8b0a8', D: '#222222', R: '#c8302a' }, 1.3), off: paws(7, 8, 1) },
  slime: { sp: build([
    'LLLLLLLL', 'LGGGGGGL', 'LKKGGKKL', 'LKKGGKKL', 'LGGGGGGL', 'LGGGKGGL', 'LGGGGGGL', 'LLLLLLLL',
  ], { L: ['#7ad35e', '#86dc6a'], G: ['#5fbf4a', '#56b043'], K: '#2f6f24' }, 1.8),
    // ぴょーんと はねて、着地で ぺちゃっ
    idle(g, t, cx, o = {}) {
      const ph = (t * .9) % 1, air = ph < .6 ? Math.sin(ph / .6 * Math.PI) : 0, land = ph >= .6 ? Math.sin((ph - .6) / .4 * Math.PI) : 0;
      g.sprite(this.sp, cx, GROUND - air * 7, { ...o, sx: (o.sx ?? 1) * (1 + land * .2), sy: (o.sy ?? 1) * (1 - land * .2) });
    } },
  magma: { sp: build([
    'MMMMMMMM', 'OMMMMOMM', 'MMMMMMMM', 'MYOMMOYM', 'MMMMMMMM', 'OMMOMMMO', 'MMMMMMMM', 'MOMMMOMM',
  ], { M: ['#3a1a10', '#4a2216', '#2e140c'], O: '#ff6a10', Y: '#ffcf3a' }, 1.8),
    // はねると だんだんに のびて すき間から マグマが見える
    idle(g, t, cx, o = {}) {
      const ph = (t * .8) % 1, air = ph < .6 ? Math.sin(ph / .6 * Math.PI) : 0, sp = this.sp;
      g.sprite(sp, cx, GROUND - air * 3, { ...o, off: e => [0, -(sp.h - 1 - e.y) * air * .8] });
    } },
  donkey: { sp: build([
    '...........E.E..', '...........E.E..', '...........DDDD.', '..........DDKDD.', '..........DDDDLL', '..........DDDDLL', '.DDDDDDDDDDDD...',
    'TDDDDDDDDDDDD...', 'TDDDDDDDDDDDD...', '.DDLLLLLLLLDD...', '.DD......DD.....', '.DD......DD.....', '.HH......HH.....',
  ], { D: ['#8a7a6a', '#7e6e5e', '#948474'], E: '#6a5a4a', K: '#111111', L: '#c8b8a8', T: '#5a4a3a', H: '#3a3028' }, 1.4), off: paws(10, 8, 0) },
};
// モブを 待っている間の動きで描く（cx は足もとの中心）
function mobAt(g, m, t, cx = 24, o = {}) {
  if (m.idle) return m.idle(g, t, cx, o);
  const by = GROUND - (m.fly ? m.fly + Math.round(Math.sin(t * 3) * 1.5) : 0);
  g.sprite(m.sp, cx, by, { off: m.off && m.off(t), ...o });
  if (m.extra) m.extra(g, t, cx, by, o);
}
function puff(g, cx, cy, k, n = 8) {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const an = i / n * Math.PI * 2 + hash(i) * .5, d = k * (5 + hash(i + 9) * 6);
    g.disc(Math.round(cx + Math.cos(an) * d), Math.round(cy + Math.sin(an) * d * .7 - k * 3), Math.round(2 + Math.sin(k * Math.PI) * 2), i % 2 ? '#cfcfd8' : '#9a98a8', 1 - k * k);
  }
}
function block(g, x, y, c1, c2) { g.R(x - 3, y, 6, 6, c1); g.R(x - 3, y + 5, 6, 1, c2); g.R(x + 2, y, 1, 6, c2); g.R(x - 2, y + 2, 1, 1, c2); g.R(x, y + 3, 1, 1, c2); }
function pumpkin(g, x, y) { g.R(x - 3, y, 6, 6, '#e38a1d'); g.R(x - 2, y + 1, 1, 2, '#5a2a00'); g.R(x + 1, y + 1, 1, 2, '#5a2a00'); g.R(x - 2, y + 4, 4, 1, '#5a2a00'); g.R(x - .5, y - 1, 1, 1, '#6a8a2a'); }
function bone(g, x, y) { const c = '#f0ece0'; g.R(x - 3, y, 6, 1, c); g.R(x - 4, y - 1, 2, 1, c); g.R(x - 4, y + 1, 2, 1, c); g.R(x + 2, y - 1, 2, 1, c); g.R(x + 2, y + 1, 2, 1, c); }
function carrot(g, x, y) { [[3, 0], [3, 1], [2, 2], [2, 3], [1, 4]].forEach(([w, r]) => g.R(x - w / 2, y + r, w, 1, r % 2 ? '#e87a20' : '#f08a2a')); g.R(x - 1.5, y - 2, 1, 2, '#4f9a3a'); g.R(x + .5, y - 2, 1, 2, '#6cc04a'); }
function egg(g, x, by, crack) {
  for (let y = 0; y < 12; y++) {
    const k = (y - 6.5) / 6.5, w = Math.round(5 * Math.sqrt(Math.max(0, 1 - k * k)) * (y < 6 ? .85 : 1));
    if (w > 0) g.R(x - w, by - 12 + y, w * 2, 1, y > 8 ? '#e8dcc0' : '#f4ecd8');
  }
  if (crack > 0) for (let i = 0; i < Math.round(crack * 5); i++) g.R(x - 5 + i * 2, by - 7 + (i % 2 ? -1 : 1), 2, 1, '#8a7a5a');
}

// ---------- 2回目の 20 体（スティーブ・アレックス・金のフィギュア … カメ） ----------
const recolor = (sp, f, cs = sp.cs) => ({ ...sp, cs, cells: sp.cells.map(e => ({ ...e, c: f(e) })) });
const GOLD3 = e => ['#f2c14e', '#e8b030', '#ffd860'][(e.x + e.y) % 3];
const STEVE_ROWS = [
  '..HHHHHHHH..', '..HHHHHHHH..', '..HSSSSSSH..', '..SSSSSSSS..', '..SWBSSBWS..', '..SSSNNSSS..', '..SSMMMMSS..', '..SSSSSSSS..',
  '.CCCCSSCCCC.', '.CCCCCCCCCC.', '.SSCCCCCCSS.', '.SSCCCCCCSS.', '.SSCCCCCCSS.', '.SSPPPPPPSS.',
  '...PPPPPP...', '...PPPPPP...', '...PPPPPP...', '...PPPPPP...', '...KKKKKK...',
];
const STEVE_PAL = { H: ['#4a3020', '#3e2818'], S: ['#c8946a', '#bc8a60'], W: '#ffffff', B: '#4a5ab0', N: '#a0704a', M: '#6a3e2a',
  C: ['#2aa8a8', '#239090'], P: ['#3a3fa0', '#2e3388'], K: ['#5a5a5a', '#4e4e4e'] };
const PIG_ROWS = ['.........PPPPP', '.PPPPPPPPPKPPP', 'PPPPPPPPPPPPNN', 'PPPPPPPPPPPPNN', 'PPPPPPPPPPPPP.', '.PPPPPPPPPPP..', '.PP.....PP....', '.PP.....PP....'];
function tnt(g, x, y, s = 1, c = '#d83a2a') { g.R(x - 3 * s, y, 6 * s, 6 * s, c); g.R(x - 3 * s, y + 2 * s, 6 * s, 2 * s, '#f0f0f0'); g.R(x - 2 * s, y + 2.5 * s, 4 * s, s, '#3a3a3a'); }
// つるはし（柄の下はしが (x, y)）。down のときは 横にふりおろした形
function pick(g, x, y, a = 1, down = false) {
  if (down) { g.R(x, y - 1, 6, 1, '#8a5a30', a); g.R(x + 5, y - 4, 1, 7, '#9a9aa8', a); }
  else { g.R(x, y - 6, 1, 6, '#8a5a30', a); g.R(x - 3, y - 7, 7, 1, '#9a9aa8', a); }
}
// 右手に持つ剣
function sword(g, sp, cx, by, blade, a = 1) { const [x, y] = cellAt(sp, cx, by, 10, 13); g.R(x, y - 8, 1.2, 8, blade, a); g.R(x - 1.2, y, 3.6, .8, '#6a4a2a', a); g.R(x, y + .8, 1.2, 1.2, '#4a3020', a); }
Object.assign(M, {
  steve: { sp: build(STEVE_ROWS, STEVE_PAL, MS, 71), off: legs(14, 6) },
  dia: { sp: build(STEVE_ROWS.map(r => r.replace(/[HCPK]/g, 'D')), { ...STEVE_PAL, D: ['#5ae0e0', '#4ad0d8', '#7af0f0'] }, MS, 73), off: legs(14, 6),
    extra(g, t, cx, by, o) { sword(g, this.sp, cx, by, '#7af0f0', o.a ?? 1); } },
  alex: { sp: build([
    '..OOOOOOOO..', '..OOOOOOOO..', '..OOSSSSOO..', '..OSSSSSSO..', '..OWESSEWO..', '..OSSSSSSO..', '..OSSMMSSO..', '..OSSSSSSO..',
    '.GGGGGGGGGG.', '.GGGGGGGGGG.', '.SSGGGGGGSS.', '.SSGGGGGGSS.', '.SSGGGGGGSS.', '.SSLLLLLLSS.',
    '...LLLLLL...', '...LLLLLL...', '...LLLLLL...', '...LLLLLL...', '...KKKKKK...',
  ], { O: ['#e0742a', '#d4682a'], S: ['#f0c8a0', '#e8bc94'], W: '#ffffff', E: '#3a8a3a', M: '#b06a5a', G: ['#5a9a3a', '#4e8e32'], L: ['#7a5a3a', '#6e5032'], K: '#4a3a2a' }, MS, 75),
    off: legs(14, 6), extra(g, t, cx, by, o) { const [x, y] = cellAt(this.sp, cx, by, 10, 14); pick(g, x + .5, y, o.a ?? 1); } },
  gskel: { sp: recolor(M.skel.sp, e => e.k === 'K' ? '#7a5410' : GOLD3(e), 1.05) },
  pig2: { sp: build(PIG_ROWS, { P: ['#f0a0a8', '#e894a0'], K: '#222222', N: '#e07888' }, 1.5, 77), off: paws(6, 5) },
  skhorse: { sp: build([
    '...........H.H..', '...........HHHH.', '..........HHKHH.', '..........HHHHHH', '..........HHHDHH', '.........HHHH...', '.HHDHDHDHHHH....',
    'THHHHHHHHHHH....', 'TDHDHDHDHHHH....', '.HHHHHHHHHH.....', '.HH......HH.....', '.HD......HD.....', '.HH......HH.....',
  ], { H: ['#d8d8cc', '#c8c8bc'], D: '#6a6a60', K: '#222222', T: '#b8b8ac' }, 1.4, 79), off: paws(10, 8, 0) },
  spider: { sp: build([
    '....BBBBBBBB....', 'LL.BBBBBBBBBB.LL', '..LBRRBBBBRRBL..', 'LL.BBBBBBBBBB.LL', '..LBBBBBBBBBBL..', '.L..L......L..L.', 'L..L........L..L',
  ], { B: ['#3a3430', '#2e2a26', '#443e38'], R: '#d02020', L: '#2a2420' }, 1.3, 81),
    off: t => e => e.k === 'L' ? [0, (Math.floor(t * 6) + e.x) % 2 ? -.6 : 0] : [0, 0] },
  pskel: { sp: recolor(M.skel.sp, e => e.y < 8 ? (e.k === 'K' ? '#ffcf3a' : ['#e38a1d', '#d07a12', '#f09a2a'][(e.x * 3 + e.y) % 3]) : e.c), off: legs(14, 6) },
  moosh: { sp: recolor(M.cow.sp, e => e.k === 'B' ? ['#b02a2a', '#a02424'][(e.x + e.y) % 2] : e.k === 'W' ? '#d8d0c8' : e.c), off: paws(7, 5),
    extra(g, t, cx, by, o) {
      const a = o.a ?? 1;
      [3, 7].forEach(cx0 => { const [x, y] = cellAt(this.sp, cx, by, cx0, 1); g.R(x + .3, y - 1.5, 1, 1.5, '#e8e0d0', a); g.R(x - 1, y - 3, 3.4, 1.6, '#d02020', a); g.R(x + .2, y - 2.8, .8, .6, '#ffffff', a); });
    } },
  wskel: { sp: recolor(M.skel.sp, e => e.k === 'K' ? '#6a6a6a' : ['#2a2a2a', '#333333', '#3a3a3a'][(e.x + e.y * 2) % 3]), off: legs(14, 6),
    extra(g, t, cx, by, o) { sword(g, this.sp, cx, by, '#9a9aa8', o.a ?? 1); } },
  witch: { sp: build([
    '.....HH.....', '....HHH.....', '...HHGHH....', '.HHHHHHHHHH.', '..SSSSSSSS..', '..SESSSSES..', '..SSSNNSSS..', '..SSSNNSSS..', '..SSSNWSSS..',
    '.RRRRRRRRRR.', '.RRAAAAAARR.', '.RRAAAAAARR.', '.RRRRRRRRRR.', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..FFFFFFFF..',
  ], { H: ['#3a2a4a', '#32243f'], G: '#5aa83a', S: ['#c0906a', '#b4845e'], E: '#3a9a3a', N: '#a8785a', W: '#5a9a3a', R: ['#4a2a5a', '#3e2250'], A: '#5a3a6a', F: '#2a2a2a' }, 1.15, 83),
    off: t => () => [0, bob(t * .5)] },
  fox: { sp: build([
    '............O..O', '............OOOO', '............OKOO', 'WOO.OOOOOOOOWWWK', 'WOOOOOOOOOOOWWW.', '.OO.OOOOOOOOO...', '....OOWWWWOO....',
    '....K.K..K.K....', '....K.K..K.K....',
  ], { O: ['#e07a2a', '#d06a20'], W: '#f0ece0', K: '#2a2420' }, 1.3, 85), off: paws(7, 8, 2) },
  panda: { sp: build([
    '.........K..K.', '.........WWWW.', '.WWWWWKKKWKKWW', 'WWWWWWKKKWKWWK', 'WWWWWWKKKWWWW.', 'WWWWWWKKKWWW..', '.WWWWWKKKWW...',
    '.KK...KKK.....', '.KK....KK.....', '.KK....KK.....',
  ], { W: ['#f4f4f0', '#e8e8e2'], K: ['#1c1c1c', '#262626'] }, 1.5, 87), off: paws(7, 5) },
  axo: { sp: build(['.........R.R..', 'P..PPPPPPPPPPR', 'PPPPPPPPPPKPPP', '.PPPPPPPPPPPMP', '...P.P..P.P...'],
    { P: ['#f0a0c0', '#e890b4'], R: '#d04070', K: '#222222', M: '#c06080' }, 1.5, 89),
    off: t => e => e.x <= 1 ? [0, Math.round(Math.sin(t * 8))] : e.y === 4 ? [0, Math.floor(t * 4) % 2 ? -.5 : 0] : [0, 0] },
  bee: { sp: build(['...WW.WW...', '...WW.WW...', '.YYKKYYKKYY', 'SYYKKYYKKYE', '.YYKKYYKKYY', '..K..K..K..'],
    { Y: ['#f0c030', '#e8b828'], K: '#3a2a10', W: '#d8f0ff', S: '#5a4a3a', E: '#111111' }, 1.6, 91), fly: 9,
    off: t => e => e.k === 'W' ? [0, Math.floor(t * 14) % 2 ? -1 : 0] : [0, 0] },
  polar: { sp: build([
    '...........W..W.', '...........WWWW.', '.WWWWWWWWWWWKWWW', 'WWWWWWWWWWWWWWWK', 'WWWWWWWWWWWWWWW.', 'WWWWWWWWWWWWW...', 'WWWWWWWWWWWWW...',
    '.WWWWWWWWWWW....', '.WWW.....WWW....', '.WWW.....WWW....', '.WWW.....WWW....',
  ], { W: ['#f4f4f0', '#e8e8e2', '#ffffff'], K: '#222222' }, 1.4, 93), off: paws(8, 8) },
  phantom: { sp: build(['.......BB.......', 'BB....BBBB....BB', '.BBB.BBGGBB.BBB.', '..BBBBBBBBBBBB..', '....BBBBBBBB....', '......BBBB......', '.......BB.......'],
    { B: ['#3a4a7a', '#44568a', '#2e3c66'], G: '#7cff7a' }, 1.4, 95), fly: 11,
    off: t => e => Math.abs(e.x - 7.5) > 4 ? [0, Math.floor(t * 5) % 2 ? -1.5 : 1] : [0, 0] },
  shulker: { sp: build(['PPPPPPPP', 'PLPPPPLP', 'PPPPPPPP', 'DDDDDDDD', 'DDDDDDDD', 'PPPPPPPP', 'PLPPPPLP', 'PPPPPPPP'],
    { P: ['#9a6aa8', '#8e5e9c', '#a676b4'], L: '#c8a0d8', D: '#6a3a7a' }, 1.8, 97),
    // からが パカッと ひらいて 中から顔が のぞく
    idle(g, t, cx, o = {}) { shulkerAt(g, this.sp, cx, Math.max(0, Math.sin(t * 1.6)) * 4, o); } },
  turtle: { sp: build(['.....GGGGGG.....', '...GGDGGGGDGG...', '..GGGGGDDGGGGGSS', '.GGDGGGGGGGDGGSK', 'SSGGGGGGGGGGGGSS', '..SS.......SS...'],
    { G: ['#3a7a3a', '#448a44'], D: '#2a5a2a', S: '#6ab06a', K: '#111111' }, 1.4, 99),
    off: t => e => e.y === 5 ? [0, Math.floor(t * 2) % 2 ? -.6 : 0] : [0, 0] },
});
M.gpig = { sp: recolor(M.pig2.sp, e => e.k === 'K' ? '#6a4a10' : e.k === 'N' ? '#c89020' : GOLD3(e)), off: paws(6, 5) };
function shulkerAt(g, sp, cx, open, o = {}) {
  const top = GROUND - 4 * sp.cs, a = o.a ?? 1;
  if (open > .2) { g.R(cx - 3, top - open, 6, open + .5, '#e0d878', a); g.R(cx - 2, top - open + .6, 1, 1, '#222222', a); g.R(cx + 1, top - open + .6, 1, 1, '#222222', a); }
  g.sprite(sp, cx, GROUND, { ...o, show: e => e.y >= 4 });
  g.sprite(sp, cx, GROUND, { ...o, show: e => e.y < 4, off: () => [0, -open] });
}
// ---------- 3回目の 20 体（グロウイカ・スイカ頭のスノーゴーレム … ゾンビ村人） ----------
const flipX = sp => ({ ...sp, cells: sp.cells.map(e => ({ ...e, x: sp.w - 1 - e.x })) }); // 左右を はんたいに
function note(g, x, y, c, a = 1) { g.R(x, y, 2, 1.5, c, a); g.R(x + 1.4, y - 3, .7, 3, c, a); }
// 水そう（cx がまん中。fill は 水の高さ 0〜1。fn で 中身を描く）
function tank(g, cx, a, fn, fill = 1) {
  g.R(cx - 11, GROUND - 20 * fill, 22, 20 * fill, '#4aa8e8', .35 * a);
  fn();
  g.R(cx - 11, GROUND - 20, 22, 1, '#d8f4ff', .8 * a); g.R(cx - 11, GROUND - 20, 1, 20, '#d8f4ff', .7 * a); g.R(cx + 10, GROUND - 20, 1, 20, '#d8f4ff', .7 * a);
  g.R(cx - 9, GROUND - 18, 1, 6, '#ffffff', .6 * a);
}
function mudpile(g, cx, a = 1) { g.R(cx - 12, GROUND - 3, 24, 3, '#6a4a2a', a); g.R(cx - 10, GROUND - 4, 6, 1, '#5a3a20', a); g.R(cx + 3, GROUND - 4, 7, 1, '#5a3a20', a); g.R(cx - 13, GROUND - 1, 26, 1, '#5a3a20', a); }
const FISH = build(['...YY...', '.YYYYY.Y', 'YKYBBYYY', '.YYYYY.Y', '...YY...'], { Y: ['#f0a020', '#e89018'], B: '#3a8ad0', K: '#111111' }, 1.2, 103);
const FISH_R = flipX(FISH);
Object.assign(M, {
  gsquid: { sp: recolor(M.squid.sp, e => e.k === 'N' ? ['#1a8a8a', '#22a0a0', '#2ab4a8'][(e.x + e.y) % 3] : e.k === 'M' ? '#0e5a5a' : e.c), fly: 3, off: M.squid.off,
    extra(g, t, cx, by, o) { for (let i = 0; i < 5; i++) { const ph = (t * .7 + i / 5) % 1; g.R(cx - 8 + hash(i) * 16, by - 4 - ph * 14, 1, 1, '#8affe0', (o.a ?? 1) * Math.sin(ph * Math.PI)); } } },
  melon: { sp: recolor(M.snow.sp, e => e.y < 8 ? (e.k === 'K' ? (e.y >= 5 ? '#e04a4a' : '#1a3a10') : ['#6ab03a', '#4a8a28', '#8ac850'][e.x % 3]) : e.c), off: M.snow.off },
  moobloom: { sp: recolor(M.cow.sp, e => e.k === 'B' ? ['#f0c830', '#e8bc20'][(e.x + e.y) % 2] : e.k === 'W' ? '#f8f0c8' : e.c), off: paws(7, 5),
    extra(g, t, cx, by, o) {
      const a = o.a ?? 1;
      [3, 7].forEach(x0 => { const [x, y] = cellAt(this.sp, cx, by, x0, 1); g.R(x + .3, y - 1.5, .8, 1.5, '#4f9a3a', a); g.R(x - 1, y - 3, 3, 1.6, '#ffe040', a); g.R(x, y - 2.6, 1, .8, '#f08a20', a); });
    } },
  parrot: { sp: build(['..RRRR..', '.RRRRRR.', '.RWKRRR.', '.RRYYRR.', '..RYYR..', '.RRRRRR.', 'BRRRRRRB', 'BRRRRRRB', '.BRRRRB.', '..RRRR..', '...RR...', '..G..G..'],
    { R: ['#e03a2a', '#d02a20'], W: '#ffffff', K: '#111111', Y: ['#f0c030', '#e0b020'], B: '#3a6ad0', G: '#6a6a6a' }, 1.4, 101),
    off: t => { const d = Math.round(Math.sin(t * 6)); return e => [e.y < 10 ? d : 0, e.k === 'B' && Math.floor(t * 6) % 2 ? -1 : 0]; } },
  // 水そうの中を 2ひきの魚が 行ったり来たり
  fish: { sp: FISH,
    idle(g, t, cx, o = {}) {
      tank(g, cx, o.a ?? 1, () => {
        const v1 = Math.cos(t * 1.2), v2 = Math.cos(t * 1.5 + 1);
        g.sprite(v1 > 0 ? FISH_R : FISH, cx + Math.sin(t * 1.2) * 5, GROUND - 7 + Math.sin(t * 3), o);
        g.sprite(v2 > 0 ? FISH_R : FISH, cx + Math.sin(t * 1.5 + 1) * 5, GROUND - 13, { ...o, col: e => e.k === 'Y' ? '#f0ece0' : e.k === 'B' ? '#e04a4a' : e.c });
      });
    } },
  // どろの中に すわって、頭に 赤い花
  mpig: { sp: recolor(M.pig2.sp, e => e.y >= 5 && hash(e.x * 5 + e.y) < .7 ? ['#6a4a2a', '#5a3a20'][e.x % 2] : e.c),
    idle(g, t, cx, o = {}) {
      const a = o.a ?? 1, by = GROUND + 2;
      g.sprite(this.sp, cx, by, { ...o, off: () => [0, Math.floor(t * 2) % 2 ? -.6 : 0] });
      mudpile(g, cx, a);
      const [x, y] = cellAt(this.sp, cx, by, 11, 0); g.R(x + .5, y - 3, .8, 3, '#3a8a2a', a); g.R(x - .6, y - 5, 3, 2.2, '#d02020', a);
    } },
  llama: { sp: build(['..........EE..', '..........LLL.', '..........LKLL', '..........LLLM', '..........LLL.', '..........LLL.', '.LLLLLLLLLLLL.', 'LCCCCCCCCCCL..', 'LCCCCCCCCCCL..', '.LLLLLLLLLL...', '.LL......LL...', '.LL......LL...', '.LL......LL...'],
    { L: ['#e8dcc0', '#dcd0b4'], E: '#c8bca0', K: '#222222', M: '#a89a80', C: ['#9a4ac8', '#b05ad8'] }, 1.4, 105), off: paws(10, 7) },
  goat: { sp: build(['...........H.H', '..........WWWW', '..........WKWW', '.WWWWWWWWWWWWW', 'WWWWWWWWWWWWB.', 'WWWWWWWWWWW.B.', 'WWWWWWWWWWW...', '.WWWWWWWWW....', '.WW.....WW....', '.WW.....WW....', '.KK.....KK....'],
    { W: ['#ece8e0', '#e0dcd4'], H: '#a89a80', K: '#3a3a3a', B: '#d8d0c4' }, 1.5, 107), off: paws(8, 5) },
  allay: { sp: build(['...CCCC...', '...CCCC...', '...KCCK...', '...CCCC...', 'W..BBBB..W', 'WW.BBBB.WW', '.WWBBBBWW.', '....BB....', '....B.....'],
    { C: '#4ad0f0', K: '#1a3a6a', B: ['#3ab0e8', '#2aa0d8'], W: '#d8f4ff' }, 1.5, 109), fly: 8,
    off: t => e => e.k === 'W' ? [0, Math.floor(t * 10) % 2 ? -1 : 0] : [0, 0],
    extra(g, t, cx, by, o) { for (let i = 0; i < 3; i++) { const ph = (t * .8 + i / 3) % 1; g.R(cx - 8 + hash(i) * 16, by - 12 + ph * 12, 1, 1, '#bff4ff', (o.a ?? 1) * (1 - ph)); } } },
  // むねの たましいが ドクン ドクンと 光る
  warden: { sp: build([
    '..DDDDDDDDDD..', '.H.DDDDDDDD.H.', 'HH.DDDDDDDD.HH', '...DDCCCCDD...', '...DDDDDDDD...', '...DDDDDDDD...', '.DDDDDDDDDDDD.',
    'DDDDDCCCCDDDDD', 'DDDDCCDDCCDDDD', 'DD.DDCCCCDD.DD', 'DD.DDDDDDDD.DD', 'DD.DDDDDDDD.DD', 'DD..DDDDDD..DD', 'DD..DDDDDD..DD',
    '...DDD..DDD...', '...DDD..DDD...', '...DDD..DDD...', '...DDD..DDD...', '...DDD..DDD...', '...DDD..DDD...',
  ], { D: ['#0e3a48', '#123f4e', '#0a3040'], H: '#3ad8d0', C: '#40e8e0' }, 1.15, 111),
    idle(g, t, cx, o = {}) {
      const p = .5 + .5 * Math.sin(t * 5);
      g.sprite(this.sp, cx, GROUND, { off: legs(14, 7, 1.2)(t), ...o, col: e => { const c = o.col ? o.col(e) : e.c; return e.k === 'C' || e.k === 'H' ? mix(c, '#a0fff8', p * .6) : c; } });
    } },
  sniffer: { sp: build([
    '..GGGGGGGGGG....', '.GRRRRRRRRRRG...', 'RRRRRRRRRRRRRR..', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRKRRYY', 'RRRRRRRRRRRRRRYY', 'RRRRRRRRRRRRRR..',
    '.RRRRRRRRRRRR...', '.RR.RR...RR.RR..', '.RR.RR...RR.RR..', '.KK.KK...KK.KK..',
  ], { R: ['#a83a2a', '#b8483a', '#983020'], G: ['#5a9a3a', '#4a8a30'], K: '#222222', Y: '#e0b030' }, 1.4, 113), off: paws(8, 8) },
  // ときどき ぴょんと はねて、ベロを ペロッ
  frog: { sp: build(['.EE....EE.', '.EK....KE.', 'OOOOOOOOOO', 'OOOOOOOOOO', 'OMMMMMMMMO', 'OOOOOOOOOO', 'OO.OOOO.OO'],
    { O: ['#d88a3a', '#c87a30'], E: '#f0e0c0', K: '#111111', M: '#8a4a20' }, 1.6, 115),
    idle(g, t, cx, o = {}) {
      const ph = t % 1.6, y = ph < .4 ? -Math.sin(ph / .4 * Math.PI) * 4 : 0;
      g.sprite(this.sp, cx, GROUND + y, o);
      const tg = seg(ph, .9, 1.3); if (tg > 0 && tg < 1) g.R(cx + 8, GROUND - 4.5, Math.sin(tg * Math.PI) * 8, 1, '#e86a8a', o.a ?? 1);
    } },
  camel: { sp: build([
    '.............HH.', '............HHHH', '............HKHH', '...BB.BB....HHH.', '..BBBBBBB...HH..', '.HHHHHHHHHHHH...', 'HHHHHHHHHHHH....',
    'HHHHHHHHHHHH....', '.HHHHHHHHHH.....', '.HH......HH.....', '.HH......HH.....', '.HH......HH.....', '.HH......HH.....', '.KK......KK.....',
  ], { H: ['#d8a868', '#c89858'], B: '#b88848', K: '#6a4a2a' }, 1.4, 117), off: paws(9, 6) },
  // 海に からだを半分しずめて ぷかぷか
  dolphin: { sp: build(['.......F........', '.....GGGG.......', 'T..GGGGGGGGG....', 'TTGGGGGGGGKGGGG.', 'T..WWWWWWWWWWW..', '......F.........'],
    { G: ['#6a8aa8', '#5a7a98'], W: '#c8d8e8', K: '#111111', F: '#5a7a98', T: '#5a7a98' }, 1.4, 119),
    idle(g, t, cx, o = {}) { g.clip(0, 0, G, GROUND - 3, () => g.sprite(this.sp, cx, GROUND + Math.round(Math.sin(t * 3)), o)); } },
  strider: { sp: build(['.H.H..H.H.', '.H.H..H.H.', 'RRRRRRRRRR', 'RRRRRRRRRR', 'RRKRRRRKRR', 'RRRRRRRRRR', 'RRMMMMMMRR', 'RRRRRRRRRR', 'RRRRRRRRRR',
    '..LL..LL..', '..LL..LL..', '..LL..LL..', '..LL..LL..', '..LL..LL..', '..LL..LL..', '..LL..LL..'],
    { R: ['#a83a3a', '#b84848'], H: '#7a2a2a', K: '#111111', M: '#5a1a1a', L: '#8a2a2a' }, 1.4, 121),
    off: t => { const f = Math.floor(t * 2) % 2; return e => e.y >= 9 ? [0, ((e.x < 5) === !!f) ? -1 : 0] : e.k === 'H' ? [Math.floor(t * 4) % 2 ? .5 : 0, 0] : [0, 0]; } },
  hoglin: { sp: build(['..HHHHHH........', '.PPPPPPPPPPPP...', 'PPPPPPPPPPPPPPP.', 'PPPPPPPPPPPPKPPP', 'PPPPPPPPPPPPPPNN', 'PPPPPPPPPPPPPWNN', '.PPPPPPPPPPPW...',
    '.PP.PP...PP.PP..', '.PP.PP...PP.PP..', '.KK.KK...KK.KK..'],
    { P: ['#c88a6a', '#b87a5a'], H: '#e8d090', K: '#3a2a1a', N: '#a86a4a', W: '#f0ece0' }, 1.4, 123), off: paws(7, 8) },
  piglin: { sp: build([
    '..PPPPPPPP..', 'E.PPPPPPPP.E', 'EEPPPPPPPPEE', '..PKPPPPKP..', '..PPNNNNPP..', '..PPNKKNPP..', '..WPPPPPPW..', '..PPPPPPPP..',
    '.LLLGLLGLLL.', '.LLLLLLLLLL.', '.PPLLLLLLPP.', '.PPLLLLLLPP.', '.PPLLLLLLPP.', '.PPBBBBBBPP.',
    '...BBBBBB...', '...BBBBBB...', '...BBBBBB...', '...BBBBBB...', '...KKKKKK...',
  ], { P: ['#e8a0a0', '#d89090'], E: '#c87878', K: '#222222', N: '#c87070', W: '#f0ece0', L: ['#6a4a2a', '#5e4024'], G: '#f2c14e', B: ['#5a3a20', '#4e321c'] }, MS, 125),
    off: legs(14, 6),
    extra(g, t, cx, by, o) { const [x, y] = cellAt(this.sp, cx, by, 1, 13); g.R(x - 1, y, 3, 1.5, '#f2c14e', o.a ?? 1); g.R(x - 1, y, 3, .5, '#fff2a0', o.a ?? 1); } },
  // とげが 出たり 引っこんだり、しっぽを ゆらゆら
  guardian: { sp: build(['.S..S..S..S.', 'SGGGGGGGGGGS', '.GGGGGGGGGG.', 'SGGGWWWWGGGS', '.GGGWKKWGGG.', 'SGGGWWWWGGGS', '.GGGGGGGGGG.', 'SGGGGGGGGGGS', '.S..S..S..S.'],
    { G: ['#5a9a8a', '#4a8a7a', '#6aaa9a'], S: '#e8a050', W: '#e8e0d0', K: '#d06a20' }, 1.6, 127), fly: 4,
    idle(g, t, cx, o = {}) {
      const by = GROUND - 4 + Math.round(Math.sin(t * 2)), spike = Math.sin(t * 2) > -.3, a = o.a ?? 1;
      for (let i = 0; i < 3; i++) g.R(cx + 9.6 + i * 2.5, by - 8 + Math.sin(t * 4 + i) * 1.5, 2.5, 2, i === 2 ? '#e8a050' : '#5a9a8a', a);
      g.sprite(this.sp, cx, by, { ...o, show: e => e.k !== 'S' || spike });
    } },
  vex: { sp: build(['..GGGG..', '..KGGK..', '..GGGG..', 'W.BBBB.W', 'WWBBBBWW', '.WBBBBW.', '...BB...', '...B....'],
    { G: '#c8c8d0', K: '#5a3aa0', B: ['#a8b0c0', '#98a0b0'], W: '#e0e8f0' }, 1.6, 129), fly: 9,
    off: t => e => e.k === 'W' ? [0, Math.floor(t * 12) % 2 ? -1 : 0] : [0, 0],
    extra(g, t, cx, by, o) { const [x, y] = cellAt(this.sp, cx, by, 7, 4); g.R(x, y - 6, 1, 6, '#c8c8d0', o.a ?? 1); g.R(x - 1, y, 3, .8, '#6a4a2a', o.a ?? 1); } },
  zvill: { sp: build([
    '..SSSSSSSS..', '..SSSSSSSS..', '..SSSSSSSS..', '..SBBBBBBS..', '..SWESSEWS..', '..SSSNNSSS..', '..SSSNNSSS..', '..SSSNNSSS..',
    '.RRRRNNRRRR.', '.RRAAAAAARR.', '.RRAHHHHARR.', '.RRRRRRRRRR.', '.RRRRRRRRRR.', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..KKKKKKKK..',
  ], { S: ['#6a9a4a', '#5a8a3a'], B: '#2a4a20', W: '#ffffff', E: '#c03030', N: '#4a7a30', R: ['#6a4a30', '#5e4028'], A: '#5a3c24', H: '#5a8a3a', K: '#3a2a1a' }, 1.15, 131),
    off: t => e => [e.y >= 9 && e.y <= 10 ? (Math.floor(t * 2) % 2 ? .6 : 0) : 0, bob(t * .5)] },
});
// ---------- 4回目の 20 体（ブリーズ・アルマジロ … クリーキング） ----------
const ILL_ROWS = [
  '..SSSSSSSS..', '..SSSSSSSS..', '..SSSSSSSS..', '..SBBBBBBS..', '..SWESSEWS..', '..SSSNNSSS..', '..SSSNNSSS..', '..SSSNNSSS..',
  '.CCCCNNCCCC.', '.CCCCCCCCCC.', '.AACCCCCCAA.', '.AACCCCCCAA.', '.AACCCCCCAA.', '.SSCCCCCCSS.',
  '...PPPPPP...', '...PPPPPP...', '...PPPPPP...', '...PPPPPP...', '...KKKKKK...',
];
const ILL_FACE = { S: ['#9aa0a0', '#8e9494'], B: '#2a2a2a', W: '#ffffff', E: '#2a6a4a', N: '#8a9090', K: '#1a1a1a' };
// 手に持つ道具（見て右手 (10,13)・見て左手 (1,12) のマス）
function axe(g, sp, cx, by, blade, a = 1) { const [x, y] = cellAt(sp, cx, by, 10, 13); g.R(x, y - 7, 1, 8, '#6a4a2a', a); g.R(x + 1, y - 7, 2.5, 3, blade, a); }
function crossbow(g, sp, cx, by, a = 1) { const [x, y] = cellAt(sp, cx, by, 1, 12); g.R(x - 3, y, 6, 1, '#6a4a2a', a); g.R(x - 3, y - 1.5, 1, 4, '#8a8a8a', a); }
function trident(g, sp, cx, by, a = 1) { const [x, y] = cellAt(sp, cx, by, 10, 13); g.R(x, y - 10, 1, 12, '#3a8a8a', a); [-1.5, 0, 1.5].forEach(d => g.R(x + d, y - 12, 1, d ? 2 : 3, '#5ac8c8', a)); }
function bow(g, sp, cx, by, a = 1) { const [x, y] = cellAt(sp, cx, by, 1, 12); g.R(x - 2, y - 4, 1, 9, '#8a5a30', a); g.R(x - 1, y - 5, 1, 1, '#8a5a30', a); g.R(x - 1, y + 5, 1, 1, '#8a5a30', a); g.R(x - 1.2, y - 4, .4, 9, '#e8e8e8', a); }
Object.assign(M, {
  breeze: { sp: build(['..BBBB..', '.BBBBBB.', '.BKBBKB.', '.BBBBBB.', '..BBBB..', '.W.WW.W.', 'W..WW..W', '...WW...', '..W..W..', '...WW...'],
    { B: ['#b8d8f0', '#a0c8e8'], K: '#2a3a6a', W: '#e0f0ff' }, 1.6, 141), fly: 4,
    off: t => e => e.k === 'W' ? [Math.round(Math.sin(t * 8 + e.y) * 1.5), 0] : [0, 0] },
  armad: { sp: build(['....SSSSSS....', '..SSSSSSSSSS..', '.SPSPSPSPSPSS.', 'SSSSSSSSSSSSHH', 'SSSSSSSSSSSSHK', '.SSSSSSSSSSHHE', '..LL....LL....'],
    { S: ['#c88a8a', '#b87a7a'], P: '#a86a6a', H: '#d8a0a0', K: '#111111', E: '#c08080', L: '#8a5a5a' }, 1.5, 143), off: paws(6, 7) },
  silver: { sp: build(['..GGGGGG....', '.GGDGGDGGG..', 'GGGGGGGGGGGK', '.G.G.G.G.G..'], { G: ['#9a9aa8', '#8a8a98'], D: '#6a6a78', K: '#222222' }, 1.6, 145),
    off: t => e => [Math.sin(t * 3) * 3, Math.round(Math.sin(t * 10 + e.x * .9) * .8)] },
  wither: { sp: build([
    '.HHH..HHHH..HHH.', '.HKH..HKKH..HKH.', '.HHH..HHHH..HHH.', '......HHHH......', '.BBBBBBBBBBBBBB.', '.......BB.......', '.....BBBBBB.....',
    '.......BB.......', '.....BBBBBB.....', '.......BB.......', '.....BBBBBB.....', '.......BB.......', '.......BB.......', '........B.......',
  ], { H: ['#2a2a2a', '#333333'], K: '#e8e8e8', B: ['#3a3a3a', '#2e2e2e'] }, 1.4, 147), fly: 2,
    off: t => e => e.y < 3 ? [0, Math.round(Math.sin(t * 3 + e.x * .4))] : [0, 0] },
  stray: { sp: recolor(M.skel.sp, e => e.k === 'K' ? '#3a4a5a' : e.y >= 9 && e.y <= 13 && e.x >= 3 && e.x <= 8 ? '#6a7a7a' : ['#b8c8c8', '#a8b8b8', '#c8d8d8'][(e.x + e.y) % 3]), off: legs(14, 6),
    extra(g, t, cx, by, o) { bow(g, this.sp, cx, by, o.a ?? 1); } },
  drowned: { sp: recolor(M.husk.sp, e => ({ H: '#2a5a5a', G: ['#4a8a8a', '#3e7e7e', '#56968e'][(e.x + e.y) % 3], K: '#7affe0', N: '#3a6a6a', M: '#2a4a4a',
    C: ['#6aaa8a', '#5a9a7a'][e.x % 2], P: ['#5a6a9a', '#4e5e8e'][e.x % 2], d: '#3a4a7a', S: '#3a5a5a' })[e.k] || e.c), off: zombieStep,
    extra(g, t, cx, by, o) { trident(g, this.sp, cx, by, o.a ?? 1); } },
  vind: { sp: build(ILL_ROWS, { ...ILL_FACE, C: ['#3a4a4a', '#344242'], A: ['#3a4a4a', '#2e3c3c'], P: '#2a2a3a' }, MS, 149), off: legs(14, 6),
    extra(g, t, cx, by, o) { axe(g, this.sp, cx, by, '#c8c8d0', o.a ?? 1); } },
  pill: { sp: build(ILL_ROWS, { ...ILL_FACE, C: ['#6a5a4a', '#5e4e40'], A: ['#6a5a4a', '#5e4e40'], P: '#3a3a4a' }, MS, 151), off: legs(14, 6),
    extra(g, t, cx, by, o) { crossbow(g, this.sp, cx, by, o.a ?? 1); } },
  // うでを上げて まほうを となえる
  evoker: { sp: recolor(build(ILL_ROWS, { ...ILL_FACE, C: ['#2a2a2a', '#242424'], A: '#2a2a2a', P: ['#2a2a2a', '#242424'] }, MS, 153), e => e.y === 9 && e.k === 'C' ? '#f2c14e' : e.c),
    off: t => { const up = Math.floor(t * 2) % 2; return e => e.k === 'A' && up ? [0, -3] : [0, 0]; } },
  ravager: { sp: build([
    '..........H..H..', '..........GGGG..', '.GGGGGGGGGGGGGGG', 'GGGGGGGGGGGKGGGG', 'GGGGGGGGGGGGGGMM', 'GGGGGGGGGGGGGGMM', 'GGGGGGGGGGGGGG..',
    '.GGGGGGGGGGGG...', '.GG.GG...GG.GG..', '.GG.GG...GG.GG..', '.GG.GG...GG.GG..', '.KK.KK...KK.KK..',
  ], { G: ['#6a6a6a', '#5e5e5e', '#767676'], H: '#e8e0d0', K: '#2a2a2a', M: '#4a4a4a' }, 1.4, 155), off: paws(8, 8) },
  cspider: { sp: recolor(M.spider.sp, e => e.k === 'B' ? ['#1a4a5a', '#164050', '#205464'][(e.x + e.y) % 3] : e.c, 1.0), off: M.spider.off },
  // ふくらんだり しぼんだり
  puffer: { sp: build(['.S.SS.S.', '.YYYYYY.', 'SYKYYKYS', '.YYYYYY.', 'SYYMMYYS', '.YYYYYY.', '.YGYYGY.', '.S.SS.S.'],
    { Y: ['#f0d030', '#e8c020'], S: '#f8f0c0', K: '#111111', M: '#d08030', G: '#6a9a3a' }, 1.8, 157),
    idle(g, t, cx, o = {}) { const s = .6 + .4 * clamp(Math.sin(t * 1.5) * 2 + .5); g.sprite(this.sp, cx, GROUND - 4 + Math.round(Math.sin(t * 2)), { ...o, sx: (o.sx ?? 1) * s, sy: (o.sy ?? 1) * s, show: e => e.k !== 'S' || s > .85 }); } },
  // 池の中を 3びきで すいすい
  tadpole: { sp: build(['.BBB..', 'BBKBTT', '.BBB..'], { B: '#5a4a3a', K: '#111111', T: '#7a6a5a' }, 1.4, 159),
    idle(g, t, cx, o = {}) {
      const a = o.a ?? 1; g.R(8, GROUND - 6, 32, 6, '#4a8ab0', .55 * a); g.R(8, GROUND - 6, 32, 1, '#9ad0f0', .8 * a);
      for (let i = 0; i < 3; i++) { const x = cx + Math.sin(t * (1 + i * .3) + i * 2) * 10; g.sprite(Math.cos(t * (1 + i * .3) + i * 2) > 0 ? this.sp : flipX(this.sp), x, GROUND - 1 - i * 1.5, { ...o, off: e => [0, e.k === 'T' && Math.floor(t * 8 + i) % 2 ? -.6 : 0] }); }
    } },
  endermite: { sp: build(['..PPPPP...', '.PPDPPDPP.', 'PPPPPPPPPK', '.P.P.P.P..'], { P: ['#3a2a4a', '#4a3a5a'], D: '#cc00fa', K: '#222222' }, 1.6, 161),
    off: t => e => [Math.round(Math.sin(t * 2) * 3), e.y === 3 ? (Math.floor(t * 8) + e.x) % 2 * -.6 : 0] },
  zoglin: { sp: recolor(M.hoglin.sp, e => e.k === 'P' ? (hash(e.x * 3 + e.y * 7) < .35 ? '#7aa060' : ['#d89a9a', '#c88a8a'][(e.x + e.y) % 2]) : e.k === 'K' && e.y === 3 ? '#e03030' : e.k === 'H' ? '#d8e0c0' : e.c), off: paws(7, 8) },
  brute: { sp: recolor(M.piglin.sp, e => ({ L: ['#2a2a2a', '#242424'][e.x % 2], G: '#f2c14e', B: ['#3a2a1a', '#33251a'][e.x % 2] })[e.k] || e.c), off: legs(14, 6),
    extra(g, t, cx, by, o) { axe(g, this.sp, cx, by, '#f2c14e', o.a ?? 1); } },
  trader: { sp: recolor(build(ILL_ROWS, { S: ['#c0906a', '#b4845e'], B: '#4a3020', W: '#ffffff', E: '#3a9a3a', N: '#a8785a', C: ['#2a5a9a', '#245090'], A: ['#2a5a9a', '#24508a'], P: ['#2a5a9a', '#245090'], K: '#3a2a1a' }, MS, 163),
    e => e.y < 8 && (e.y < 2 || e.x === 2 || e.x === 9) ? ['#2a5a9a', '#3a6aaa'][e.y % 2] : e.c), off: legs(14, 6) },
  horse: { sp: recolor(M.skhorse.sp, e => ({ H: ['#8a5a30', '#7a4e28'][(e.x + e.y) % 2], D: '#7a4e28', T: '#3a2a1a' })[e.k] || e.c), off: paws(10, 8, 0),
    extra(g, t, cx, by, o) { const [x, y] = cellAt(this.sp, cx, by, 4, 6); g.R(x, y - 1, 6, 2.2, '#5a2a10', o.a ?? 1); g.R(x + 2, y + 1, 1, 3, '#3a3a3a', o.a ?? 1); } },
  bogged: { sp: recolor(M.skel.sp, e => e.k === 'K' ? '#2a3a1a' : ['#8a9a6a', '#7a8a5a', '#96a676'][(e.x + e.y) % 3]), off: legs(14, 6),
    extra(g, t, cx, by, o) { const a = o.a ?? 1; [[3, '#8a5a30'], [7, '#c83a2a']].forEach(([x0, c]) => { const [x, y] = cellAt(this.sp, cx, by, x0, 0); g.R(x + .4, y - 1.2, .8, 1.2, '#e8e0d0', a); g.R(x - .6, y - 2.4, 2.8, 1.3, c, a); }); } },
  creaking: { sp: build([
    '...WWWWWW...', '..WWWWWWWW..', '..WOWWWWOW..', '..WWWWWWWW..', '..WWWLWWWW..', '...WWWWWW...', '....WWWW....',
    '.W.WWWWWW.W.', 'W..WWLWWW..W', 'W..WWWWWW..W', '...WWWWWW...', '....WWWW....', '....WWWW....',
    '....W..W....', '....W..W....', '....W..W....', '...WW..WW...', '...W....W...', '..WW....WW..',
  ], { W: ['#4a3a2a', '#3e3022', '#5a4632'], O: '#ff9a2a', L: '#2a2018' }, 1.15, 165), off: legs(13, 6, 1) },
});
// ---------- 5回目の 20 体（エンダードラゴン・エルダーガーディアン … 茶色のムーシュルーム） ----------
const SLIME_S = recolor(M.slime.sp, e => e.c, .9);
function bolt(g, x, top, a = 1) { let px = x; for (let y = top; y < GROUND - 2; y += 3) { const nx = px + ((y / 3) % 2 ? -2 : 2); g.R(Math.min(px, nx), y, Math.abs(nx - px) + 1, 1, '#fff9b0', a); g.R(nx, y, 1, 3, '#fff9b0', a); px = nx; } }
Object.assign(M, {
  dragon: { sp: build([
    '......WW..........', '.....WWWW.........', '....WWWWWW........', '...........HHH....', 'T.BBBBBBBBBBHPHH..', 'TTBBBBBBBBBBBHHHHH', '..BBBBBBBBBB.HHH..', '...LL....LL.......', '...L.....L........',
  ], { B: ['#1a1a1a', '#242424'], W: ['#2a2a2a', '#3a2a4a'], H: '#1e1e1e', P: '#e079fa', T: '#2a2a2a', L: '#1a1a1a' }, 1.2, 171), fly: 9,
    off: t => e => e.k === 'W' ? [0, Math.floor(t * 4) % 2 ? 3 : 0] : e.k === 'T' ? [0, Math.round(Math.sin(t * 4))] : [0, 0] },
  elder: { ...M.guardian, sp: recolor(M.guardian.sp, e => ({ G: ['#c8c8b8', '#b8b8a8', '#d8d8c8'][(e.x + e.y) % 3], S: '#8a6aa8' })[e.k] || e.c, 1.75) },
  illus: { sp: build(ILL_ROWS, { ...ILL_FACE, C: ['#2a4a8a', '#24427a'], A: ['#2a4a8a', '#203c70'], P: '#2a2a4a' }, MS, 173), off: legs(14, 6),
    extra(g, t, cx, by, o) { bow(g, this.sp, cx, by, o.a ?? 1); } },
  // 青い でんきを まとった クリーパー
  ccreeper: { sp: CREEPER,
    extra(g, t, cx, by, o) { const a = o.a ?? 1; for (let i = 0; i < 6; i++) { const k = Math.floor(t * 10 + i * 3); g.R(cx - 8 + hash(k) * 16, by - 22 + hash(k + 1) * 22, 1 + hash(k + 2) * 2, .7, i % 2 ? '#6ac8ff' : '#c8f0ff', a * .9); } } },
  // クモの せなかに スケルトンが のっている
  sjockey: { sp: recolor(M.spider.sp, e => e.c, 1.0), skel: recolor(M.skel.sp, e => e.c, .75),
    idle(g, t, cx, o = {}) {
      const f = Math.floor(t * 6) % 2, dy = f ? -.5 : 0;
      g.sprite(this.sp, cx, GROUND, { ...o, off: M.spider.off(t) });
      g.sprite(this.skel, cx, GROUND - 4.5 + dy, { ...o, show: e => e.y < 14 });
      bow(g, this.skel, cx, GROUND - 4.5 + dy, o.a ?? 1);
    } },
  zhorse: { sp: recolor(M.skhorse.sp, e => ({ H: ['#5a8a4a', '#4e7e40'][(e.x + e.y) % 2], D: '#3a6a3a', T: '#2a4a2a' })[e.k] || e.c), off: paws(10, 8, 0) },
  // 川の中を ぴょんぴょん はねながら のぼる
  salmon: { sp: build(['..GGGG....', '.GRRRRRR.T', 'RKRRRRRRTT', '.RRRRRRR.T'], { R: ['#c84a3a', '#d85a4a'], G: '#4a6a4a', K: '#111111', T: '#a83a2a' }, 1.4, 175),
    idle(g, t, cx, o = {}) {
      const a = o.a ?? 1; river(g, t, a);
      for (let i = 0; i < 2; i++) { const ph = (t * .6 + i * .5) % 1, x = lerp(38, 10, ph), y = GROUND - 2 - Math.max(0, Math.sin(ph * Math.PI * 2)) * 8; g.sprite(flipX(this.sp), x, y, o); }
    } },
  tabby: { sp: recolor(M.cat.sp, e => e.k === 'K' ? (e.x % 3 === 0 ? '#c86a28' : ['#e09040', '#d88838'][e.y % 2]) : e.c), off: paws(6, 6, 0) },
  // ハッピーガスト：白くて まるい顔、青い ハーネス
  hghast: { sp: build([
    'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWKKWWWWKKWWWW', 'WWWWKKWWWWKKWWWW', 'WWWPPWWWWWWPPWWW',
    'WWWWWWKWWKWWWWWW', 'WWWWWWWKKWWWWWWW', 'BBBBBBBBBBBBBBBB', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW',
    '..W..W..W..W..W.', '..W..W..W..W..W.', '.....W.....W....',
  ], { W: ['#f6f6f6', '#ececec', '#ffffff'], K: '#2a2a2a', P: '#f0a8b8', B: ['#3a6ad0', '#2a5ac0'] }, 1.25, 177), fly: 2,
    off: t => e => e.y >= 12 ? [Math.round(Math.sin(t * 3 + e.x) * (e.y - 11) * .4), 0] : [0, 0] },
  copper: { sp: build(['....A.....', '...AAA....', '.CCCCCCCC.', '.CCKCCKCC.', '.CCCCCCCC.', '.CCCNNCCC.', '..BBBBBB..', 'C.BBBBBB.C', 'C.BBBBBB.C', '..BBBBBB..', '..C....C..', '..C....C..', '.CC....CC.'],
    { C: ['#d8784a', '#c86a40', '#e8885a'], A: '#e8a060', K: '#2a1a10', N: '#a85a30', B: ['#c86a40', '#b85e38'] }, 1.5, 179), off: legs(10, 5) },
  psheep: { sp: recolor(M.sheep.sp, e => e.k === 'W' ? ['#f4a8c8', '#e898bc', '#fab8d4'][(e.x + e.y) % 3] : e.c), off: paws(7, 5) },
  baxo: { sp: recolor(M.axo.sp, e => ({ P: ['#5a7ae0', '#4a6ad0'][(e.x + e.y) % 2], R: '#2a4ab0', M: '#3a5ac0' })[e.k] || e.c), off: M.axo.off,
    extra(g, t, cx, by, o) { sparkle(g, cx - 10, by - 10, (t * .7) % 1, '#bfe0ff'); sparkle(g, cx + 10, by - 6, (t * .7 + .5) % 1, '#bfe0ff'); } },
  // ハチの巣と そのまわりを とぶ ハチ
  nest: { sp: build(['NNNNNNNN', 'NHNNNNHN', 'NNNNNNNN', 'NNKKKKNN', 'NNKKKKNN', 'NNNNNNNN', 'NHNNNNHN', 'NNNNNNNN'], { N: ['#e8b850', '#d8a840', '#f0c860'], H: '#f8e070', K: '#3a2a10' }, 1.6, 181),
    idle(g, t, cx, o = {}) {
      const a = o.a ?? 1; g.R(cx - .5, GROUND - 23, 1, 4, '#6a4a2a', a);
      g.sprite(this.sp, cx, GROUND - 6.2, o);
      g.R(cx - 1, GROUND - 6.2, 2, 2, '#f0c030', a * (.5 + .5 * Math.sin(t * 3)));
      for (let i = 0; i < 2; i++) { const an = t * 2.5 + i * Math.PI; g.sprite(Math.sin(an) > 0 ? M.bee.sp : flipX(M.bee.sp), cx + Math.cos(an) * 11, GROUND - 12 + Math.sin(an * 2) * 3, { ...o, sx: .6, sy: .6 }); }
    } },
  sfox: { sp: recolor(M.fox.sp, e => ({ O: ['#f0f0ec', '#e4e4e0'][(e.x + e.y) % 2], W: '#d8d8d4' })[e.k] || e.c), off: paws(7, 8, 2) },
  // 草ブロックを かかえた エンダーマン
  enderb: { ...M.ender, extra(g, t, cx, by, o) { const a = o.a ?? 1, [x, y] = cellAt(M.ender.sp, cx, by, 3, 10); g.R(x, y, 6, 6, '#7a5230', a); g.R(x, y, 6, 2, '#5fa84a', a); g.R(x + 1, y + 3, 1, 1, '#5e3e22', a); } },
  // 小さな スライムが 3びきで ぴょんぴょん
  slimes: { sp: SLIME_S,
    idle(g, t, cx, o = {}) { [[-9, 0], [0, .33], [9, .66]].forEach(([dx, d]) => { const ph = (t * .9 + d) % 1, air = ph < .6 ? Math.sin(ph / .6 * Math.PI) : 0; g.sprite(SLIME_S, cx + dx, GROUND - air * 6, o); }); } },
  bvill: { sp: recolor(VILLAGER, e => e.c, MS * .6), off: t => { const f = Math.floor(t * 6) % 2; return e => [0, f ? -1 : 0]; } },
  awolf: { sp: recolor(M.wolf.sp, e => e.y >= 4 && e.y <= 6 && e.x >= 3 && e.x <= 12 && e.k === 'W' ? ['#c8a878', '#a88858', '#d8b888'][(e.x + e.y) % 3] : e.c), off: paws(7, 8, 1) },
  snifflet: { sp: recolor(M.sniffer.sp, e => e.c, .8), off: t => e => [Math.round(Math.sin(t * 1.5) * 3), e.y >= 8 && Math.floor(t * 6 + e.x) % 2 ? -.5 : 0] },
  bmoosh: { sp: recolor(M.moosh.sp, e => e.k === 'B' ? ['#7a5230', '#6a4628'][(e.x + e.y) % 2] : e.c), off: paws(7, 5),
    extra(g, t, cx, by, o) { const a = o.a ?? 1; [3, 7].forEach(x0 => { const [x, y] = cellAt(this.sp, cx, by, x0, 1); g.R(x + .3, y - 1.5, 1, 1.5, '#e8e0d0', a); g.R(x - 1, y - 3, 3.4, 1.6, '#9a6a3a', a); }); } },
});
function river(g, t, a = 1) {
  g.R(7, GROUND - 5, 34, 5, '#3a8ad0', .6 * a);
  for (let i = 0; i < 6; i++) { const x = 7 + ((i * 6 - t * 10) % 34 + 34) % 34; g.R(x, GROUND - 5 + (i % 3), 3, .6, '#bfe6ff', .9 * a); }
}
// ---------- 6回目の 20 体（ラバ・トレーダーラマ … シロクマの親子） ----------
function sea(g, t, a = 1, top = GROUND - 7) { g.R(7, top, 34, GROUND - top, '#3a8ad0', .5 * a); for (let x = 7; x < 40; x += 4) g.R(x + (t * 5) % 4, top, 2, .8, '#bfe6ff', .9 * a); }
function heart(g, x, y, a = 1) { g.R(x, y, 1.5, 1.5, '#f05a7a', a); g.R(x + 2, y, 1.5, 1.5, '#f05a7a', a); g.R(x, y + 1, 3.5, 1.5, '#f05a7a', a); g.R(x + 1, y + 2.5, 1.5, 1, '#f05a7a', a); }
function bubble(g, x, y, w, a = 1) { g.R(x, y, w, 5, '#ffffff', a); g.R(x + 2, y + 5, 2, 1.5, '#ffffff', a); for (let i = 0; i < 3; i++) g.R(x + 2 + i * (w - 4) / 3, y + 2, 1.5, 1, '#3a3a3a', a); }
const COD = build(['..BBBB..', '.BBBBBBT', 'BKBBBBTT', '.WWWWW.T'], { B: ['#b8a080', '#a89070'], W: '#e8e0d0', K: '#111111', T: '#988060' }, 1.2, 201);
const CLOWN = recolor(FISH, e => ({ Y: ['#f08a20', '#e87a10'][e.x % 2], B: '#ffffff' })[e.k] || e.c, 1.4);
const NETH_ROWS = STEVE_ROWS.map(r => r.replace(/[HCPK]/g, 'D'));
Object.assign(M, {
  mule: { sp: recolor(M.donkey.sp, e => e.k === 'D' ? ['#5a3a20', '#4e3218'][(e.x + e.y) % 2] : e.c), off: paws(10, 8, 0),
    extra(g, t, cx, by, o) { const a = o.a ?? 1, [x, y] = cellAt(this.sp, cx, by, 3, 7); g.R(x, y, 5, 4, '#a0743a', a); g.R(x, y, 5, 1, '#c08a4a', a); g.R(x + 2, y + 1.5, 1, 1.2, '#3a3a3a', a); } },
  tllama: { sp: recolor(M.llama.sp, e => e.k === 'C' ? (e.x % 3 === 0 ? '#f0c030' : ['#2a5ac0', '#244eb0'][e.y % 2]) : e.c), off: paws(10, 7) },
  // タラの むれが 海の中を すいすい
  cods: { sp: COD,
    idle(g, t, cx, o = {}) { const a = o.a ?? 1; sea(g, t, a, GROUND - 14); [[0, 0], [1, .25], [2, .5], [3, .75]].forEach(([i, d]) => { const ph = (t * .25 + d) % 1; g.sprite(COD, 44 - ph * 40, GROUND - 3 - (i % 2) * 5 - Math.sin(t * 3 + i) * 1, o); }); } },
  // イソギンチャクの まわりを クマノミが くるくる
  clown: { sp: CLOWN,
    idle(g, t, cx, o = {}) {
      const a = o.a ?? 1; sea(g, t, a, GROUND - 16);
      for (let i = 0; i < 7; i++) { const x = cx - 7 + i * 2.3, h = 5 + (i % 3); g.R(x + Math.round(Math.sin(t * 3 + i) * .8), GROUND - h, 1.2, h, i % 2 ? '#f07ab0' : '#d85a98', a); }
      const an = t * 1.5; g.sprite(Math.cos(an) > 0 ? CLOWN : flipX(CLOWN), cx + Math.sin(an) * 9, GROUND - 9 + Math.cos(an * 2) * 2, o);
    } },
  // ときどき くしゅん！
  bpanda: { sp: recolor(M.panda.sp, e => e.c, .9),
    idle(g, t, cx, o = {}) {
      const ph = t % 2.4, sn = ph > 1.8 && ph < 2.1, y = ph > 1.8 && ph < 2.2 ? -Math.sin((ph - 1.8) / .4 * Math.PI) * 3 : 0;
      g.sprite(this.sp, cx, GROUND + y, { ...o, off: sn ? undefined : paws(7, 5)(t) });
      if (ph > 1.85 && ph < 2.3) { const k = (ph - 1.85) / .45; g.R(cx + 7 + k * 4, GROUND - 6 - k * 2, 1.5, 1, '#9ad06a', (o.a ?? 1) * (1 - k)); }
    } },
  gparrot: { sp: recolor(M.parrot.sp, e => ({ R: ['#3ab03a', '#2aa02a'][(e.x + e.y) % 2], B: '#f0d030' })[e.k] || e.c, 1.4), off: M.parrot.off },
  piglet: { sp: recolor(M.pig2.sp, e => e.c, .95), off: t => { const f = Math.floor(t * 5) % 2; return e => e.y >= 6 ? [0, ((e.x >= 5) === !!f) ? -.6 : 0] : [0, 0]; } },
  siam: { sp: recolor(M.cat.sp, e => e.k === 'G' ? '#4a8ad0' : e.k === 'K' ? (e.x >= 8 || e.y >= 6 || e.x <= 1 ? '#5a4030' : ['#e8dcc8', '#ddd0bc'][(e.x + e.y) % 2]) : e.c), off: paws(6, 6, 0) },
  wfrog: { ...M.frog, sp: recolor(M.frog.sp, e => ({ O: ['#e8e8e0', '#d8d8d0'][(e.x + e.y) % 2], M: '#a8a8a0' })[e.k] || e.c) },
  // 子どものゾンビは とても はやい
  bzombie: { sp: recolor(ZOMBIE, e => e.c, MS * .55), off: t => zombieStep(t * 2.5) },
  sstrider: { ...M.strider, extra(g, t, cx, by, o) { const a = o.a ?? 1, [x, y] = cellAt(M.strider.sp, cx, by, 2, 2); g.R(x, y - 1.5, 8.4, 2.5, '#2a1a10', a); g.R(x, y - 1.5, 8.4, .7, '#c8a060', a); g.R(x + 3.5, y + 1, 1, 3, '#c8c8c8', a); } },
  netheri: { sp: build(NETH_ROWS, { ...STEVE_PAL, D: ['#4a4448', '#3a3438', '#5a5458'] }, MS, 203), off: legs(14, 6),
    extra(g, t, cx, by, o) { sword(g, this.sp, cx, by, '#5a5458', o.a ?? 1); } },
  shsheep: { sp: recolor(M.sheep.sp, e => e.k === 'W' ? ['#e6dccc', '#dcd2c2'][(e.x + e.y) % 2] : e.c, 1.35), off: paws(7, 5) },
  bturtles: { sp: recolor(M.turtle.sp, e => e.c, .55),
    idle(g, t, cx, o = {}) { const a = o.a ?? 1; g.R(30, GROUND - 3, 11, 3, '#3a8ad0', .6 * a); g.R(30, GROUND - 3, 11, .8, '#bfe6ff', a); [0, 1, 2].forEach(i => { const x = 12 + ((t * 3 + i * 6) % 18); g.sprite(this.sp, x, GROUND, { ...o, off: e => [0, e.y === 5 && Math.floor(t * 6 + i) % 2 ? -.4 : 0] }); }); } },
  // 親グマと 子グマ
  polars: { sp: recolor(M.polar.sp, e => e.c, 1.1), cub: recolor(M.polar.sp, e => e.c, .7),
    idle(g, t, cx, o = {}) { g.sprite(this.sp, cx - 4, GROUND, { ...o, off: paws(8, 8)(t * .7) }); g.sprite(this.cub, cx + 11, GROUND, { ...o, off: paws(8, 8)(t * 1.4) }); } },
});
return [
  { mob: 'エンダーマン', name: 'ワープで しゅんっ', how: '紫のつぶに つつまれて あちこちワープ',
    draw(g, t) {
      const k = seg(t, 1.0, 2.0), k2 = seg(t, 2.0, 2.6);
      if (k < 1) {
        const jx = k > 0 ? [24, 14, 34, 18, 30][Math.floor(t * 5) % 5] : 24;
        if (!(k > 0 && Math.floor(t * 10) % 3 === 0)) g.sprite(MASCOT, jx, GROUND + (k > 0 ? 0 : bob(t)), { col: tint('#7a2aa0', k) });
      }
      if (k2 > 0) mobAt(g, M.ender, t, 24, { a: k2 });
      const a = seg(t, .8, 1.2) * (1 - seg(t, 3.2, 3.8));
      for (let i = 0; i < 16; i++) { const ph = (t * .8 + hash(i)) % 1; g.R(10 + hash(i + 1) * 28, 42 - ph * 24, 1, 1, i % 2 ? '#cc00fa' : '#e079fa', a * (1 - ph)); }
    } },
  { mob: 'スケルトン', name: 'ほねが カラカラ', how: 'ぺしゃんこになって 骨が降ってきて 組み上がる',
    draw(g, t) {
      const fall = ease(seg(t, 1.0, 1.4)), SK = M.skel.sp;
      if (fall < 1) mascotIdle(g, t, { sy: 1 - fall * .85, sx: 1 + fall * .3, col: tint('#d6d6d6', fall) });
      if (t >= 2.8) return mobAt(g, M.skel, t);
      for (const e of SK.cells) {
        const st = 1.4 + hash(e.x * 7 + e.y * 13) * 1.0, k = seg(t, st, st + .3); if (k <= 0) continue;
        const [fx, fy] = cellAt(SK, 24, GROUND, e.x, e.y);
        g.R(fx + (hash(e.x + e.y * 3) - .5) * 24 * (1 - k), lerp(10, fy, k * k), SK.cs, SK.cs, e.c);
      }
      g.T('カラカラ', 24, 6, 6, '#e8e8e8', seg(t, 1.5, 1.7) - seg(t, 2.4, 2.7));
    } },
  { mob: 'ブレイズ', name: 'ほのおに つつまれて', how: 'まわりから 火がもえあがって ふわっと浮かぶ',
    draw(g, t) {
      const heat = seg(t, 0.9, 2.0), sw = seg(t, 2.0, 2.5), cool = seg(t, 2.4, 3.2);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#ffcf3a', heat) });
      if (sw > 0) mobAt(g, M.blaze, t, 24, { a: sw });
      const n = Math.round(20 * heat * (1 - cool * .7));
      for (let i = 0; i < n; i++) { const ph = (t * 1.5 + hash(i)) % 1; g.R(12 + hash(i + 5) * 24, GROUND - 2 - ph * 20, 1.5, 2.5, ph < .3 ? '#fff2a0' : ph < .6 ? '#ffb02e' : '#d0401a', 1 - ph); }
    } },
  { mob: 'ヒツジ', name: 'もこもこ 羊毛', how: '白いもこもこが ポンポン ついていって',
    draw(g, t) {
      const cover = seg(t, 1.0, 2.0), rev = seg(t, 2.2, 2.9);
      if (t < 2.1) mascotIdle(g, t); else mobAt(g, M.sheep, t);
      const P = [[24, 34], [18, 36], [30, 36], [20, 30], [28, 30], [24, 28], [14, 35], [34, 35], [16, 31], [32, 31], [24, 38], [22, 32]];
      P.forEach(([x, y], i) => {
        const st = i / P.length; if (cover <= st) return;
        const pop = clamp((cover - st) * 8), r = Math.round((4 + hash(i) * 2) * (pop < 1 ? pop * 1.2 : 1) * (1 - rev));
        if (r > 0) g.disc(x, y, r, i % 2 ? '#f6f6f6' : '#e2e2e2');
      });
      g.T('メェ〜', 38, 10, 6, '#ffffff', seg(t, 2.4, 2.7) - seg(t, 3.8, 4.2));
    } },
  { mob: 'スノーゴーレム', name: '雪だるまを つくる', how: '雪で 白くなって 雪玉がつみあがり かぼちゃを すぽっ',
    draw(g, t) {
      for (let i = 0; i < 14; i++) { const ph = (t * .35 + hash(i)) % 1; g.R(8 + hash(i + 3) * 32 + Math.sin(t * 2 + i) * 2, 18 + ph * 24, 1, 1, '#ffffff', .8); }
      const wh = seg(t, 0.9, 1.6), gone = seg(t, 1.6, 1.9), body = seg(t, 1.8, 2.4), head = seg(t, 2.4, 2.8), SG = M.snow.sp;
      if (gone < 1) mascotIdle(g, t, { a: 1 - gone, col: tint('#f4f8fb', wh) });
      if (t >= 2.8) mobAt(g, M.snow, t);
      else {
        if (body > 0) g.clip(0, lerp(GROUND, GROUND - 10 * SG.cs, body), G, G, () => g.sprite(SG, 24, GROUND, { show: e => e.y >= 8 }));
        if (head > 0) g.sprite(SG, 24, GROUND, { show: e => e.y < 8, off: () => [0, -(1 - head * head) * 30] });
      }
      g.T('すぽっ', 38, 10, 5, '#ffffff', seg(t, 2.75, 2.85) - seg(t, 3.2, 3.5));
    } },
  { mob: 'ウシ', name: 'もようが ぽつぽつ', how: '白と茶色の もようが うかんで 横にのびる',
    draw(g, t) {
      const sp = seg(t, 1.0, 1.9), mo = ease(seg(t, 1.9, 2.6));
      if (mo < 1) mascotIdle(g, t, { a: 1 - mo, sx: lerp(1, 1.2, mo), col: e => {
        if (e.c === EYE) return e.c;
        const h = hash(e.x * 5 + e.y * 11); return h < sp ? (h < sp * .5 ? '#e8e8e8' : '#4a3020') : e.c;
      } });
      if (mo > 0) mobAt(g, M.cow, t, 24, { a: mo });
      g.T('モ〜', 38, 10, 6, '#ffffff', seg(t, 2.5, 2.8) - seg(t, 3.8, 4.2));
    } },
  { mob: '黒ネコ', name: 'まるまって ころころ', how: '小さく まるまって 転がったら ネコに',
    draw(g, t) {
      const sh = ease(seg(t, 1.0, 1.4)), roll = seg(t, 1.4, 2.3), pop = seg(t, 2.3, 2.6);
      if (sh < 1) mascotIdle(g, t, { sx: 1 - sh * .6, sy: 1 - sh * .6, col: e => mix(e.c, '#24242c', sh) });
      else if (pop <= 0) {
        const x = 24 + Math.sin(roll * Math.PI * 2) * 10, an = roll * Math.PI * 6;
        g.disc(x, GROUND - 5, 5, '#24242c'); g.R(x + Math.cos(an) * 3, GROUND - 5 + Math.sin(an) * 3, 1, 1, '#7cff4a');
      }
      if (pop > 0) mobAt(g, M.cat, t, 24, { sy: lerp(.3, 1, ease(pop)) });
      g.T('ニャー', 38, 16, 6, '#ffffff', seg(t, 2.5, 2.7) - seg(t, 3.6, 4.0));
    } },
  { mob: 'ヤマネコ', name: '草むらから とびだす', how: '草が のびて かくれたら ガサガサ… ぴょん！',
    draw(g, t) {
      const gr = ease(seg(t, 0.8, 1.4)), hide = seg(t, 1.3, 1.5), jump = seg(t, 2.0, 2.7), shrink = ease(seg(t, 2.6, 3.2));
      if (hide < 1) mascotIdle(g, t);
      if (jump > 0) mobAt(g, M.ocelot, t, lerp(20, 26, jump), jump < 1 ? { off: () => [0, -Math.sin(jump * Math.PI) * 10] } : {});
      const H = 17 * gr * (1 - shrink);
      if (H > 0) for (let x = 12; x < 37; x += 2) {
        const h = H * (.75 + hash(x) * .3), sw = t > 1.5 && t < 2.0 ? Math.round(Math.sin(t * 30 + x)) : 0;
        g.R(x + sw, GROUND - h, 1, h, x % 4 ? '#4f9a3a' : '#6cc04a'); g.R(x + 1, GROUND - h * .7, 1, h * .7, '#3d7a2c');
      }
      g.T('ガサガサ', 24, 10, 5, '#b8ff9a', t > 1.5 && t < 2.0 ? 1 : 0);
    } },
  { mob: 'コウモリ', name: 'くらやみの どうくつ', how: 'まっくらになって コウモリが とびまわると',
    draw(g, t) {
      const dk = seg(t, 0.9, 1.4) - seg(t, 2.4, 2.9);
      if (t < 1.6) mascotIdle(g, t); else mobAt(g, M.bat, t, 24 + Math.round(Math.sin(t * 2) * 4));
      g.R(0, 0, G, G, '#000000', dk * .85);
      if (dk > 0) for (let i = 0; i < 6; i++) {
        const x = 8 + (hash(i) * 32 + t * (14 + i * 4)) % 32, y = 22 + hash(i + 7) * 14 + Math.sin(t * 6 + i) * 2, f = Math.floor(t * 12 + i) % 2;
        g.R(x, y, 2, 1, '#5a4a3c', dk); g.R(x - 2, y - f, 2, 1, '#4a3a30', dk); g.R(x + 2, y - f, 2, 1, '#4a3a30', dk);
      }
      g.T('パタパタ', 24, 8, 5, '#c8c0ff', dk);
    } },
  { mob: 'ハスク', name: 'すなあらし', how: '砂がびゅうびゅう ふきつけて 砂色の ゾンビに',
    draw(g, t) {
      const st = seg(t, 0.9, 1.4) * (1 - seg(t, 2.4, 3.0)), sw = seg(t, 1.6, 2.2);
      g.R(0, 0, G, GROUND, '#c8a860', st * .35);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#b4a070', seg(t, 1.0, 1.8)) });
      if (sw > 0) mobAt(g, M.husk, t, 24, { a: sw });
      for (let i = 0; i < 24 * st; i++) { const ph = (t * 1.6 + hash(i)) % 1; g.R(6 + ph * 36, 20 + hash(i + 2) * 22, 1.5 + hash(i) * 2, 1, i % 3 ? '#e0c88a' : '#b89a5a', st * Math.sin(ph * Math.PI)); }
    } },
  { mob: 'イカ', name: '水の中へ', how: '水そうに 水が満ちてきて ぷかぷか',
    draw(g, t) {
      const wl = ease(seg(t, 0.9, 1.9)), sw = seg(t, 1.9, 2.5), wy = lerp(GROUND, 20, wl), gl = seg(t, .5, .9) * (1 - seg(t, 3.3, 3.7));
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#335577', sw) });
      if (sw > 0) mobAt(g, M.squid, t, 24, { a: sw });
      if (wl > 0) {
        g.R(9, wy, 30, GROUND - wy, '#2a6ac0', .45 * gl); g.R(9, wy, 30, 1, '#8ac8ff', .8 * gl);
        for (let i = 0; i < 6; i++) { const ph = (t * .6 + hash(i)) % 1, y = lerp(GROUND - 2, wy + 2, ph); if (y > wy) g.R(12 + hash(i + 4) * 24 + Math.sin(t * 4 + i), y, 1, 1, '#cfe8ff', .8 * gl); }
      }
      if (gl > 0) { g.R(8, 19, 1, GROUND - 19, '#bfe6ff', .6 * gl); g.R(39, 19, 1, GROUND - 19, '#bfe6ff', .6 * gl); } // 水そうの ガラス
    } },
  { mob: 'ウサギ', name: 'ぴょんぴょん', how: '3回はねるたびに 小さく 茶色に なっていく',
    draw(g, t) {
      const k = seg(t, 0.9, 2.7);
      if (k <= 0) return mascotIdle(g, t);
      if (k >= 1) return mobAt(g, M.rabbit, t);
      const y = -Math.abs(Math.sin(k * 3 * Math.PI)) * 6, x = 24 + Math.sin(k * Math.PI * 2) * 8;
      if (k < .84) g.sprite(MASCOT, x, GROUND + y, { sx: 1 - k * .4, sy: 1 - k * .4, col: tint('#a0784a', k) });
      else g.sprite(M.rabbit.sp, x, GROUND + y);
      g.T('ぴょん', x, GROUND + y - 20, 5, '#ffffff', Math.abs(Math.sin(k * 3 * Math.PI)));
    } },
  { mob: 'ゾンビピッグマン', name: 'ネザーゲート', how: '紫のゲートに 入ると 出てきたのは',
    draw(g, t) {
      const fr = seg(t, 0.3, 0.7), pr = seg(t, 0.7, 1.0) * (1 - seg(t, 3.0, 3.4)), walk = seg(t, 1.0, 1.7), out = ease(seg(t, 2.1, 2.9));
      if (pr > 0) for (let y = 21; y < GROUND; y += 1.5) g.R(15, y, 18, 1.5, mix('#7a2ad0', '#b060ff', .5 + .5 * Math.sin(t * 6 + y * .7)), pr * .85);
      if (walk < 1) g.sprite(MASCOT, lerp(6, 24, walk), GROUND + (walk > 0 ? walkFrame(t) : bob(t)), { a: 1 - seg(t, 1.4, 1.7), col: tint('#b060ff', seg(t, 1.3, 1.7)) });
      if (out > 0) mobAt(g, M.pig, t, 24, { col: e => mix('#b060ff', e.c, out), a: Math.min(1, out * 2) });
      const fa = fr * (1 - seg(t, 3.2, 3.6)); // 黒曜石のわく
      if (fa > 0) { g.R(13, 19, 22, 2, '#1a1028', fa); g.R(13, 19, 2, GROUND - 19, '#1a1028', fa); g.R(33, 19, 2, GROUND - 19, '#1a1028', fa); g.R(14, 26, 1, 1, '#4a3a78', fa); g.R(33, 34, 1, 1, '#4a3a78', fa); }
    } },
  { mob: 'ガスト', name: 'ふわっと うきあがる', how: '白くなって 浮かびあがり 大きくふくらむ',
    draw(g, t) {
      const up = ease(seg(t, 0.9, 1.8)), wh = seg(t, 1.0, 1.8), gr = ease(seg(t, 1.8, 2.5)), fire = seg(t, 3.0, 3.8);
      if (gr < .5) g.sprite(MASCOT, 24, GROUND - up * 4 + (t < .9 ? bob(t) : 0), { col: tint('#f0f0f0', wh), sx: 1 + gr * .6, sy: 1 + gr * .6 });
      else { const s = lerp(.65, 1, (gr - .5) * 2); mobAt(g, M.ghast, t, 24, { sx: s, sy: s }); }
      if (fire > 0 && fire < 1) { const x = lerp(26, 44, fire), y = lerp(32, 38, fire); g.disc(x, y, 2, '#ff6a10'); g.R(x - 1, y - 1, 2, 2, '#ffcf3a'); }
    } },
  { mob: 'アイアンゴーレム', name: '鉄ブロックで くみたて', how: 'けむりで 消えて 鉄ブロック4つに かぼちゃを のせると',
    draw(g, t) {
      const go = seg(t, 0.9, 1.3), fl = seg(t, 2.6, 2.9);
      if (go < 1) mascotIdle(g, t, { sx: 1 - go, sy: 1 + go * .3 });
      puff(g, 24, 36, seg(t, 1.0, 1.6));
      if (t < 2.7) {
        [[24, GROUND - 6, 1.4], [24, GROUND - 12, 1.7], [18, GROUND - 12, 2.0], [30, GROUND - 12, 2.0]].forEach(([x, y, st]) => {
          const k = seg(t, st, st + .25); if (k > 0) block(g, x, lerp(12, y, k * k), '#d8d0c8', '#aaa29a');
        });
        const pk = seg(t, 2.25, 2.5); if (pk > 0) pumpkin(g, 24, lerp(12, GROUND - 18, pk * pk));
      }
      if (fl > 0) mobAt(g, M.golem, t);
      if (fl > 0 && fl < 1) g.R(0, 0, G, G, '#ffffff', 1 - fl);
    } },
  { mob: 'ニワトリ', name: 'たまごから', how: 'たまごに なって ゆらゆら… パカッ',
    draw(g, t) {
      const sh = ease(seg(t, 0.9, 1.4)), wob = seg(t, 1.4, 2.2), crack = seg(t, 2.0, 2.3), hatch = seg(t, 2.3, 2.6), sp = seg(t, 2.3, 2.9);
      if (sh < 1) mascotIdle(g, t, { sx: 1 - sh * .6, sy: 1 - sh * .4, col: e => mix(e.c, '#f4ecd8', sh) });
      else if (hatch <= 0) egg(g, 24 + (wob < 1 ? Math.round(Math.sin(wob * Math.PI * 8)) : 0), GROUND, crack);
      if (hatch > 0) mobAt(g, M.chicken, t, 24, { sy: lerp(.4, 1, ease(hatch)) });
      if (sp > 0 && sp < 1) [-1, 1, -.5, .6].forEach(d => g.R(24 + d * sp * 14, GROUND - 8 - Math.sin(sp * Math.PI) * 8 + sp * 6, 3, 2, '#f4ecd8', 1 - sp));
      g.T('ピヨッ', 38, 14, 6, '#ffffff', seg(t, 2.5, 2.7) - seg(t, 3.6, 4.0));
    } },
  { mob: 'オオカミ', name: 'ほねを キャッチ', how: '飛んできた骨を ジャンプで くわえたら',
    draw(g, t) {
      const fly = seg(t, 0.8, 1.5), jump = seg(t, 1.3, 1.8), mo = ease(seg(t, 1.8, 2.5)), jy = -Math.sin(jump * Math.PI) * 4;
      if (fly > 0 && fly < 1) bone(g, lerp(4, 24, fly), lerp(34, 32, fly) - Math.sin(fly * Math.PI) * 10);
      if (mo < 1) g.sprite(MASCOT, 24, GROUND + jy + (t < 1.3 ? bob(t) : 0), { a: 1 - mo, col: tint('#d4d0cc', mo) });
      if (fly >= 1 && mo < 1) bone(g, 24, GROUND - 10 + jy);
      if (mo > 0) mobAt(g, M.wolf, t, 24, { a: mo });
      g.T('ワン!', 36, 14, 6, '#ffffff', seg(t, 2.4, 2.6) - seg(t, 3.6, 4.0));
    } },
  { mob: 'スライム', name: 'ぷるぷる ぷにょん', how: 'ぷるぷる ゆれて 緑になって ぺちゃっ → ぴょーん',
    draw(g, t) {
      const jig = seg(t, 0.9, 1.9), sq = ease(seg(t, 1.9, 2.2)), up = seg(t, 2.2, 2.7);
      if (sq < 1) { const w = Math.sin(t * 25) * .15 * jig; mascotIdle(g, t, { sx: (1 + w) * (1 + sq * .6), sy: (1 - w) * (1 - sq * .8), col: tint('#5fbf4a', jig) }); }
      else if (up < 1) g.sprite(M.slime.sp, 24, GROUND - Math.sin(up * Math.PI) * 7, { sx: lerp(1.4, 1, up), sy: lerp(.4, 1, up) });
      else mobAt(g, M.slime, t);
      g.T('ぷにょん', 24, 8, 5, '#b8ff9a', seg(t, 2.2, 2.4) - seg(t, 3.0, 3.4));
    } },
  { mob: 'マグマキューブ', name: 'マグマから ぴょーん', how: 'マグマに しずんで のびちぢみしながら とびだす',
    draw(g, t) {
      const pool = seg(t, 0.7, 1.1) * (1 - seg(t, 3.2, 3.8)), sink = ease(seg(t, 1.1, 1.8)), spring = seg(t, 2.1, 2.8), MC = M.magma.sp;
      if (sink < 1) g.clip(0, 0, G, GROUND, () => mascotIdle(g, t, { off: () => [0, sink * 18], col: tint('#ff6a10', sink) }));
      if (spring > 0 && spring < 1) {
        const rise = Math.min(spring / .3, 1), air = Math.sin(spring * Math.PI);
        g.clip(0, 0, G, GROUND, () => g.sprite(MC, 24, GROUND + (1 - rise) * 16 - air * 3, { off: e => [0, -(MC.h - 1 - e.y) * air * .5] }));
      }
      if (spring >= 1) mobAt(g, M.magma, t);
      if (pool > 0) {
        g.R(24 - 13 * pool, GROUND, 26 * pool, 3, '#ff6a10'); g.R(24 - 11 * pool, GROUND, 22 * pool, 1, '#ffcf3a');
        for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i / 3) % 1; g.R(16 + i * 7, GROUND - ph * 4, 1, 1, '#ffcf3a', pool * (1 - ph)); }
      }
    } },
  { mob: 'ロバ', name: 'ニンジンで ぱかぱか', how: 'ニンジンを もぐもぐ食べると 耳がのびて ロバに',
    draw(g, t) {
      const fall = seg(t, 0.8, 1.3), eat = seg(t, 1.3, 1.9), ear = ease(seg(t, 1.8, 2.2)), mo = ease(seg(t, 2.2, 2.8));
      if (fall > 0 && fall < 1) carrot(g, 31, lerp(16, GROUND - 13, fall * fall));
      if (eat > 0 && eat < 1) g.clip(28, 0, 6 * (1 - eat), G, () => carrot(g, 31, GROUND - 13));
      if (mo < 1) {
        const by = GROUND + (t < .8 ? bob(t) : 0);
        mascotIdle(g, t, { a: 1 - mo, sx: lerp(1, 1.3, mo), col: tint('#8a7a6a', ear) });
        if (ear > 0) { const h = ear * 6; g.R(18, by - 16 - h, 2, h, '#6a5a4a', 1 - mo); g.R(28, by - 16 - h, 2, h, '#6a5a4a', 1 - mo); }
      }
      if (mo > 0) mobAt(g, M.donkey, t, 24, { a: mo });
      g.T('もぐもぐ', 24, 10, 5, '#ffffff', eat > 0 && eat < 1 ? 1 : 0);
      g.T('ヒヒーン', 36, 12, 6, '#ffffff', seg(t, 2.6, 2.8) - seg(t, 3.8, 4.2));
    } },
  // ----- 2回目の 20 体 -----
  { mob: 'スティーブ', name: 'TNT で ドカーン', how: 'TNT が頭に のって シュー… ドカーン！ 出てきたのは',
    draw(g, t) {
      const fall = seg(t, 0.8, 1.2), fuse = seg(t, 1.2, 2.0), boom = seg(t, 2.0, 2.7);
      const white = fuse > 0 && Math.sin(t * (10 + fuse * 30)) > 0;
      if (boom < .3) mascotIdle(g, t);
      if (fall > 0 && boom <= 0) tnt(g, 24, lerp(14, GROUND - 22, fall * fall), 1, white ? '#ffffff' : '#d83a2a');
      if (boom > .3) mobAt(g, M.steve, t);
      if (boom > 0 && boom < 1) {
        for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2, d = boom * (10 + hash(i) * 8); g.R(24 + Math.cos(an) * d, 32 + Math.sin(an) * d * .7, 2, 2, i % 3 ? '#9a98a8' : '#ff7a2e', 1 - boom); }
        puff(g, 24, 34, boom);
      }
      g.T('シュー…', 24, 10, 6, '#ffffff', fuse > 0 && fuse < 1 ? 1 : 0);
      g.T('ドカーン', 24, 10, 7, '#ffd84a', boom > 0 && boom < .7 ? 1 : 0);
    } },
  { mob: 'アレックス', name: 'つるはしで ほりだす', how: '石に とじこめられて カンカン ほると',
    draw(g, t) {
      const enc = ease(seg(t, 0.9, 1.2)), mine = seg(t, 1.3, 2.4), brk = seg(t, 2.4, 2.9);
      if (enc < 1) mascotIdle(g, t);
      if (enc > 0 && brk <= 0) {
        const s = 20 * enc;
        g.R(24 - s / 2, GROUND - s, s, s, '#8a8a8a'); g.R(24 - s / 2, GROUND - s, s, 1, '#a8a8a8');
        [[18, 26], [27, 30], [21, 35], [29, 37], [17, 39]].forEach(([x, y], i) => { if (enc >= 1) g.R(x, y, 2, 1, '#6a6a6a'); });
        for (let i = 0; i < Math.floor(mine * 6); i++) g.R(18 + hash(i + 40) * 10, 24 + hash(i + 50) * 14, 4 + hash(i) * 3, 1, '#2a2a2a'); // ひび
        if (mine > 0 && mine < 1) pick(g, 36, GROUND - 10, 1, Math.floor(t * 6) % 2 === 1);
      }
      if (brk > 0) mobAt(g, M.alex, t);
      if (brk > 0 && brk < 1) for (let i = 0; i < 12; i++) { const an = Math.PI * (1 + i / 11), d = brk * (8 + hash(i) * 8); g.R(24 + Math.cos(an) * d, 32 + Math.sin(an) * d + brk * brk * 10, 2, 2, i % 2 ? '#8a8a8a' : '#6a6a6a', 1 - brk); }
      g.T('カン カン', 24, 10, 5, '#ffffff', mine > 0 && mine < 1 ? 1 : 0);
    } },
  { mob: 'ダイヤよろいの スティーブ', name: 'よろいを 1つずつ', how: 'スティーブに なって かぶと・むね・すね・くつ が 飛んでくる',
    draw(g, t) {
      const sw = seg(t, 0.9, 1.2), st = [1.5, 1.8, 2.1, 2.4], part = e => e.y < 8 ? 0 : e.y < 13 ? 1 : e.y < 18 ? 2 : 3;
      puff(g, 24, 34, seg(t, 0.9, 1.5));
      if (sw < .5) return mascotIdle(g, t);
      if (t >= 2.8) return mobAt(g, M.dia, t);
      const o0 = M.steve.off(t);
      g.sprite(M.steve.sp, 24, GROUND, { off: o0 });
      g.sprite(M.dia.sp, 24, GROUND, { show: e => e.k === 'D' && t > st[part(e)], off: e => { const [dx, dy] = o0(e), k = seg(t, st[part(e)], st[part(e)] + .25); return [dx, dy - (1 - k * k) * 16]; } });
      st.forEach((s, i) => sparkle(g, i % 2 ? 32 : 16, GROUND - 20 + i * 5, seg(t, s + .25, s + .7), '#a0ffff'));
      g.T('キラーン', 24, 8, 5, '#a0ffff', seg(t, 2.6, 2.8));
    } },
  { mob: '金のスケルトン', name: '金の フィギュア', how: '台に のって 上から 金色に ぬられていく',
    draw(g, t) {
      const rise = ease(seg(t, 0.8, 1.2)), paint = seg(t, 1.3, 2.2), sw = seg(t, 2.2, 2.4), by = GROUND - 3 * rise;
      g.R(14, GROUND - 3 * rise, 20, 3 * rise, '#c89020'); g.R(14, GROUND - 3 * rise, 20, Math.min(1, rise), '#ffd860');
      if (sw < 1) {
        const line = lerp(by - 18, by, paint);
        g.clip(0, line, G, G, () => g.sprite(MASCOT, 24, by + (t < .8 ? bob(t) : 0)));
        g.clip(0, 0, G, line, () => g.sprite(MASCOT, 24, by, { col: e => e.c === EYE ? '#7a5410' : GOLD3(e) }));
      }
      if (sw > 0) g.sprite(M.gskel.sp, 24, by, { a: sw });
      if (sw > 0 && sw < 1) g.R(0, 0, G, G, '#ffffff', 1 - sw);
      [[14, 20, 2.4], [34, 24, 2.7], [30, 34, 3.0], [16, 32, 3.3]].forEach(([x, y, s]) => sparkle(g, x, y, seg(t, s, s + .5), '#ffe890'));
    } },
  { mob: '金のブタ', name: 'コインが ザクザク', how: '金のコインが 降ってきて ピカピカの ブタに',
    draw(g, t) {
      const rain = seg(t, 0.8, 2.2), gold = seg(t, 1.2, 2.0), sw = ease(seg(t, 2.0, 2.5));
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? e.c : mix(e.c, GOLD3(e), gold) });
      if (sw > 0) mobAt(g, M.gpig, t, 24, { a: sw });
      if (rain > 0 && rain < 1) for (let i = 0; i < 10; i++) { const ph = (rain * 2.5 + hash(i)) % 1, x = 12 + hash(i + 3) * 24; if (ph * 22 + 18 < GROUND) { g.R(x, 18 + ph * 22, 2, 2, '#f2c14e'); g.R(x, 18 + ph * 22, 1, 1, '#fff2a0'); } }
      [[14, 24, 2.5], [34, 22, 2.8], [32, 34, 3.1]].forEach(([x, y, s]) => sparkle(g, x, y, seg(t, s, s + .5), '#ffe890'));
      g.T('チャリン', 24, 8, 5, '#ffd84a', rain > 0 && rain < 1 ? 1 : 0);
    } },
  { mob: 'スケルトンホース', name: 'パカラッと 入れかわり', how: '右へ かけていって 左から 骨の馬が かけてくる',
    draw(g, t) {
      const out = seg(t, 0.8, 1.6), inn = ease(seg(t, 1.9, 2.8));
      if (out < 1) g.sprite(MASCOT, lerp(24, 60, out * out), GROUND + (out > 0 ? walkFrame(t * 1.5) : bob(t)));
      if (inn > 0) mobAt(g, M.skhorse, inn < 1 ? t * 2.5 : t, lerp(-16, 24, inn));
      if (inn > 0 && inn < 1) for (let i = 0; i < 4; i++) { const ph = (t * 3 + i / 4) % 1; g.disc(lerp(-16, 24, inn) - 12 - ph * 6, GROUND - 1 - ph * 3, 1, '#c8b8a0', 1 - ph); }
      g.T('パカラッ', 24, 10, 5, '#ffffff', inn > 0 && inn < 1 ? 1 : 0);
    } },
  { mob: 'クモ', name: 'スポナーから', how: '鉄のおりが 降ってきて くるくる… 中から クモ',
    draw(g, t) {
      const drop = seg(t, 0.8, 1.2), spin = seg(t, 1.3, 2.2), brk = seg(t, 2.3, 2.8);
      if (spin < .5) mascotIdle(g, t, { col: e => mix(e.c, '#2e2a26', spin * 2), sx: 1 - spin * .6, sy: 1 - spin * .6 });
      else if (brk <= 0) { const an = t * 12; g.disc(24 + Math.cos(an) * 2, 34 + Math.sin(an), 3, '#2e2a26'); g.R(24 + Math.cos(an) * 2 - 1, 33 + Math.sin(an), 1, 1, '#d02020'); }
      if (brk > 0) mobAt(g, M.spider, t);
      if (drop > 0 && brk < 1) {
        const y = lerp(0, GROUND - 20, drop * drop), a = 1 - brk, sp = brk * 10;
        g.R(14 - sp, y, 20 + sp * 2, 1.5, '#5a5a62', a); g.R(14 - sp, y + 18.5, 20 + sp * 2, 1.5, '#5a5a62', a);
        for (let x = 14; x <= 32; x += 4.5) g.R(x + (x - 23) * brk, y, 1.2, 20, '#6a6a72', a);
        if (spin > 0 && brk <= 0) for (let i = 0; i < 4; i++) { const ph = (t * 2 + i / 4) % 1; g.R(17 + hash(i) * 14, y + 18 - ph * 16, 1, 1.5, '#ff9a3a', 1 - ph); }
      }
    } },
  { mob: 'かぼちゃ頭の スケルトン', name: 'ハロウィンの かぼちゃ', how: 'かぼちゃを かぶって 下から 骨に なっていく',
    draw(g, t) {
      const fall = seg(t, 0.8, 1.3), bones = seg(t, 1.5, 2.2), sw = seg(t, 2.2, 2.5);
      if (sw < 1) {
        const line = lerp(GROUND, GROUND - 12, bones);
        g.clip(0, 0, G, line, () => mascotIdle(g, t, { a: 1 - sw }));
        g.clip(0, line, G, G, () => mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? e.c : '#d6d6d6' }));
        if (fall > 0) pumpkin(g, 24, lerp(12, GROUND - 19, fall * fall) + (fall >= 1 ? bob(t) : 0));
      }
      if (sw > 0) mobAt(g, M.pskel, t, 24, { a: sw });
      puff(g, 24, 32, seg(t, 2.1, 2.7));
      g.T('すぽっ', 36, 12, 5, '#ffcf3a', seg(t, 1.25, 1.35) - seg(t, 1.8, 2.0));
    } },
  { mob: 'ムーシュルーム', name: 'キノコが にょきにょき', how: 'まわりに 赤いキノコが はえて 赤い牛に',
    draw(g, t) {
      const grow = seg(t, 0.9, 1.8), red = seg(t, 1.3, 2.1), mo = ease(seg(t, 2.1, 2.7)), hide = seg(t, 2.8, 3.3);
      if (mo < 1) mascotIdle(g, t, { a: 1 - mo, sx: lerp(1, 1.2, mo), col: tint('#b02a2a', red) });
      if (mo > 0) mobAt(g, M.moosh, t, 24, { a: mo });
      [[10, 0], [14, .2], [35, .1], [39, .3], [31, .5], [17, .6]].forEach(([x, d]) => {
        const k = ease(seg(grow, d, d + .4)) * (1 - hide); if (k <= 0) return;
        const h = 3 * k; g.R(x, GROUND - h, 1, h, '#e8e0d0'); g.R(x - 1.5, GROUND - h - 1.5 * k, 4 * k, 1.5 * k, '#d02020'); g.R(x - .5, GROUND - h - 1.2 * k, k, .6 * k, '#ffffff');
      });
      g.T('にょきにょき', 24, 10, 5, '#ffffff', grow > 0 && grow < 1 ? 1 : 0);
    } },
  { mob: 'ブタ', name: 'どろんこ あそび', how: 'どろの水たまりで ころんだら ピンクの ブタに',
    draw(g, t) {
      const pud = seg(t, 0.7, 1.1) * (1 - seg(t, 3.0, 3.5)), roll = seg(t, 1.2, 2.0), mud = seg(t, 1.2, 1.8), sw = ease(seg(t, 2.0, 2.5)), clean = seg(t, 2.5, 3.2);
      if (pud > 0) { g.R(24 - 14 * pud, GROUND - .5, 28 * pud, 2, '#5a3a20'); g.R(24 - 10 * pud, GROUND - .5, 12 * pud, 1, '#7a5230'); }
      if (sw < 1) g.sprite(MASCOT, 24 + Math.sin(roll * Math.PI * 2) * 5, GROUND + (roll > 0 && roll < 1 ? -Math.abs(Math.sin(roll * Math.PI * 3)) * 3 : bob(t)), { a: 1 - sw, col: tint('#5a3a20', mud) });
      if (sw > 0) mobAt(g, M.pig2, t, 24, { a: sw, col: e => hash(e.x * 3 + e.y * 7) < .4 * (1 - clean) ? '#5a3a20' : e.c });
      for (let i = 0; i < 6; i++) { const k = seg(roll, i / 6, i / 6 + .3); if (k > 0 && k < 1) g.R(24 + (hash(i) - .5) * 24, GROUND - 2 - Math.sin(k * Math.PI) * 6, 1.5, 1.5, '#5a3a20', 1 - k); }
      g.T('ブー', 38, 14, 6, '#ffffff', seg(t, 2.4, 2.6) - seg(t, 3.6, 4.0));
    } },
  { mob: 'ウィザースケルトン', name: '黒いけむり', how: '足もとから 黒いけむりが たちのぼって',
    draw(g, t) {
      const sm = seg(t, 0.8, 1.3) * (1 - seg(t, 2.6, 3.2)), dark = seg(t, 1.2, 2.0), sw = seg(t, 2.0, 2.5);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? '#6a6a6a' : mix(e.c, '#2a2a2a', dark) });
      if (sw > 0) mobAt(g, M.wskel, t, 24, { a: sw });
      for (let i = 0; i < 12; i++) { const ph = (t * .9 + hash(i)) % 1; g.disc(14 + hash(i + 2) * 20, GROUND - ph * 20, Math.round(1 + ph * 2), i % 3 ? '#2a2a2a' : '#4a4a5a', sm * (1 - ph) * .8); }
      for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i / 4) % 1; g.R(15 + i * 6, GROUND - 1 - ph * 4, 1, 2, '#4ad0e0', sm * (1 - ph)); } // たましいの 青い火
      g.T('カタカタ', 24, 10, 5, '#c0c0c0', sw > 0 && sw < 1 ? 1 : seg(t, 2.5, 2.6) - seg(t, 3.2, 3.5));
    } },
  { mob: 'ウィッチ', name: 'あやしい くすり', how: '大なべの くすりが 飛んできて むらさきに ばしゃっ',
    draw(g, t) {
      const pot = seg(t, 0.6, 1.0) * (1 - seg(t, 3.0, 3.4)), fly = seg(t, 1.3, 1.8), spl = seg(t, 1.8, 2.3), sw = seg(t, 2.1, 2.6);
      if (pot > 0) {
        g.R(4, GROUND - 7 * pot, 9, 7 * pot, '#3a3a3a', pot); g.R(3, GROUND - 7 * pot, 11, 1, '#4a4a4a', pot); g.R(5, GROUND - 6.5 * pot, 7, 1, '#9a4ac8', pot);
        for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; g.R(6 + i * 2, GROUND - 7 - ph * 6, 1, 1, '#c88aff', pot * (1 - ph)); }
      }
      if (fly > 0 && fly < 1) { const x = lerp(8, 24, fly), y = GROUND - 8 - Math.sin(fly * Math.PI) * 10; g.R(x - 1, y, 3, 3, '#9a4ac8'); g.R(x, y - 1.5, 1, 1.5, '#d8d8e8'); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#7a3aa8', spl) });
      if (sw > 0) mobAt(g, M.witch, t, 24, { a: sw });
      if (spl > 0 && spl < 1) for (let i = 0; i < 10; i++) { const an = Math.PI * (1 + i / 9), d = spl * (6 + hash(i) * 6); g.R(24 + Math.cos(an) * d, 28 + Math.sin(an) * d + spl * spl * 10, 1, 2, '#c88aff', 1 - spl); }
      g.T('ウッヒッヒ', 34, 12, 5, '#c88aff', seg(t, 2.5, 2.7) - seg(t, 3.6, 4.0));
    } },
  { mob: 'キツネ', name: '雪に ズボッ', how: '高く とびあがって 雪に 頭から ダイブ',
    draw(g, t) {
      const mound = seg(t, 0.6, 1.0) * (1 - seg(t, 2.6, 3.0)), jump = seg(t, 1.1, 1.8), dig = seg(t, 1.8, 2.3), out = seg(t, 2.3, 2.8);
      if (jump < 1) {
        const y = -Math.sin(jump * Math.PI) * 6 + jump * jump * 8;
        g.clip(0, 0, G, GROUND - 4 * mound + 1, () => g.sprite(MASCOT, 24, GROUND + (jump > 0 ? y : bob(t)), { sy: jump > .5 ? 1 - (jump - .5) : 1 }));
      }
      if (out > 0) mobAt(g, M.fox, t, 24, out < 1 ? { off: () => [0, -Math.sin(out * Math.PI) * 7] } : {});
      if (mound > 0) { const sh = dig > 0 && dig < 1 ? Math.round(Math.sin(t * 40)) : 0; g.disc(24 + sh, GROUND, Math.round(8 * mound), '#f4f8fb'); g.R(10, GROUND, 28, 3, '#7a5230'); g.R(10, GROUND, 28, 1, '#e6eef4', mound); }
      if (dig > 0 && dig < 1) for (let i = 0; i < 6; i++) { const k = (dig * 3 + i / 6) % 1; g.R(24 + (i % 2 ? 1 : -1) * k * 10, GROUND - 8 - Math.sin(k * Math.PI) * 6, 1, 1, '#ffffff', 1 - k); }
      g.T('ズボッ', 36, 12, 6, '#ffffff', seg(t, 1.75, 1.85) - seg(t, 2.3, 2.5));
    } },
  { mob: 'パンダ', name: '竹を もぐもぐ', how: 'うしろに 竹が のびて もぐもぐ 白と黒に',
    draw(g, t) {
      const bam = ease(seg(t, 0.7, 1.3)) * (1 - seg(t, 3.0, 3.5)), eat = seg(t, 1.3, 2.1), sw = ease(seg(t, 2.1, 2.6));
      [9, 13, 36, 40].forEach((x, i) => { const h = bam * (16 + hash(i) * 6); for (let y = 0; y < h; y += 4) g.R(x, GROUND - Math.min(h, y + 4), 2, Math.min(4, h - y) - .5, i % 2 ? '#5aa83a' : '#6cc04a'); });
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? e.c : hash(e.x * 7 + e.y * 3) < eat ? (e.x >= 4 && e.x <= 7 ? '#1c1c1c' : '#f4f4f0') : e.c });
      if (eat > 0 && eat < 1) g.R(33 - eat * 4, GROUND - 10, 4 * (1 - eat), 1.5, '#6cc04a');
      if (sw > 0) mobAt(g, M.panda, t, 24, { a: sw });
      g.T('もぐもぐ', 24, 10, 5, '#ffffff', eat > 0 && eat < 1 ? 1 : 0);
    } },
  { mob: 'ウーパールーパー', name: 'バケツの 水で', how: 'バケツの水を ざばーっと かぶって ピンクに',
    draw(g, t) {
      const bk = seg(t, 0.7, 1.1) * (1 - seg(t, 2.2, 2.6)), pour = seg(t, 1.2, 1.9), sw = ease(seg(t, 1.9, 2.5)), pud = seg(t, 1.4, 1.8) * (1 - seg(t, 3.0, 3.5));
      if (pud > 0) g.R(24 - 14 * pud, GROUND - .5, 28 * pud, 1.5, '#4a9ae0', .7);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 - sw * .3, sy: 1 - sw * .5, col: tint('#f0a0c0', pour) });
      if (sw > 0) mobAt(g, M.axo, t, 24, { a: sw });
      if (bk > 0) { const tilt = pour > 0 ? 1 : 0; g.R(28, 18 + tilt, 6, 5 - tilt, '#9a9aa8', bk); g.R(28 + tilt, 18, 5 - tilt, 1, '#4a9ae0', bk); }
      if (pour > 0 && pour < 1) for (let i = 0; i < 8; i++) { const ph = (t * 3 + i / 8) % 1; g.R(27 - ph * 2, 22 + ph * 18, 1.5, 2, i % 2 ? '#4a9ae0' : '#8ac8ff', .9); }
      g.T('ざばーっ', 24, 10, 5, '#8ac8ff', pour > 0 && pour < 1 ? 1 : 0);
    } },
  { mob: 'ミツバチ', name: 'お花ばたけ', how: 'お花が さいて しましまに なって ブーン',
    draw(g, t) {
      const fl = seg(t, 0.7, 1.4), stripe = seg(t, 1.2, 2.0), sw = ease(seg(t, 2.0, 2.5));
      [[10, '#e83a3a'], [15, '#f0d030'], [33, '#f0d030'], [38, '#c84ae0'], [20, '#e83a3a']].forEach(([x, c], i) => {
        const k = ease(seg(fl, i * .12, i * .12 + .4)); if (k <= 0) return;
        g.R(x, GROUND - 4 * k, 1, 4 * k, '#4f9a3a'); g.R(x - 1, GROUND - 5 * k, 3, 1.5, c); g.R(x, GROUND - 5 * k, 1, 1.5, '#ffe890');
      });
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? e.c : stripe > 0 && e.x % 3 === 1 && hash(e.x) < stripe * 1.5 ? '#3a2a10' : mix(e.c, '#f0c030', stripe) });
      if (sw > 0) mobAt(g, M.bee, t, 24 + Math.round(Math.sin(t * 2.5) * 3), { a: sw });
      g.T('ブーン', 36, 12, 5, '#ffe890', seg(t, 2.4, 2.6) - seg(t, 3.6, 4.0));
    } },
  { mob: 'シロクマ', name: 'こおりづけ', how: '氷に とじこめられて パリーン！',
    draw(g, t) {
      const ice = seg(t, 0.9, 1.6), crack = seg(t, 1.8, 2.3), brk = seg(t, 2.3, 2.8);
      if (brk < .2) mascotIdle(g, t, { col: tint('#bfe6ff', ice * .5) });
      if (brk >= .2) mobAt(g, M.polar, t);
      if (ice > 0 && brk <= 0) {
        const h = 20 * ice; g.R(13, GROUND - h, 22, h, '#9ad8ff', .5); g.R(13, GROUND - h, 22, 1, '#e0f6ff', .9); g.R(15, GROUND - h + 2, 1, h - 4, '#e0f6ff', .7);
        for (let i = 0; i < Math.floor(crack * 5); i++) g.R(16 + hash(i + 60) * 14, 24 + hash(i + 70) * 14, 1, 3, '#ffffff');
      }
      if (brk > 0 && brk < 1) for (let i = 0; i < 12; i++) { const an = Math.PI * (1 + i / 11), d = brk * (8 + hash(i) * 10); g.R(24 + Math.cos(an) * d, 30 + Math.sin(an) * d + brk * brk * 12, 2, 2, i % 2 ? '#9ad8ff' : '#e0f6ff', 1 - brk); }
      g.T('パリーン', 24, 10, 6, '#bfe6ff', brk > 0 && brk < .8 ? 1 : 0);
    } },
  { mob: 'ファントム', name: '夜空へ ばさっ', how: 'うでを パタパタ ふって 夜空へ まいあがる',
    draw(g, t) {
      const flap = seg(t, 0.9, 1.9), up = ease(seg(t, 1.3, 2.0)), sw = ease(seg(t, 1.9, 2.4));
      const f = flap > 0 && flap < 1 && Math.floor(t * 10) % 2;
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - up * 10 + (t < .9 ? bob(t) : 0), { a: 1 - sw, col: tint('#3a4a7a', flap), off: e => (e.x <= 1 || e.x >= 10) && e.y <= 3 ? [0, f ? -2 : 1] : [0, 0] });
      if (sw > 0) mobAt(g, M.phantom, t, 24 + Math.round(Math.sin(t * 1.8) * 6), { a: sw });
      g.T('バサッ', 36, 12, 5, '#c8d4ff', flap > 0 && flap < 1 ? 1 : 0);
    } },
  { mob: 'シュルカー', name: 'からに とじこもる', how: '上と下から むらさきの からが とじて パカッ',
    draw(g, t) {
      const close = ease(seg(t, 1.0, 1.7)), sp = M.shulker.sp, hide = seg(t, 1.6, 1.7);
      if (hide < 1) mascotIdle(g, t);
      if (t < 2.2) {
        if (close > 0) {
          g.clip(0, 0, G, GROUND, () => g.sprite(sp, 24, GROUND + (1 - close) * 8, { show: e => e.y >= 4 }));
          g.sprite(sp, 24, GROUND, { show: e => e.y < 4, off: () => [0, -(1 - close) * 22] });
        }
      } else shulkerAt(g, sp, 24, Math.max(0, Math.sin((t - 2.2) * 1.6)) * 4);
      for (let i = 0; i < 8; i++) { const ph = (t * .7 + hash(i)) % 1; g.R(12 + hash(i + 1) * 24, GROUND - ph * 20, 1, 1, i % 2 ? '#c8a0d8' : '#9a6aa8', seg(t, .6, 1.0) * (1 - ph)); }
      g.T('ガシャン', 24, 10, 5, '#ffffff', seg(t, 1.65, 1.75) - seg(t, 2.1, 2.3));
      g.T('パカッ', 36, 14, 5, '#ffffff', seg(t, 2.4, 2.6) - seg(t, 3.2, 3.5));
    } },
  { mob: 'ウミガメ', name: '波が ザブーン', how: '大きな波が 通りすぎると 砂はまに カメ',
    draw(g, t) {
      const sand = seg(t, 0.6, 1.0) * (1 - seg(t, 3.0, 3.5)), wave = seg(t, 1.2, 2.3);
      if (sand > 0) { g.R(8, GROUND, 32, 3, '#e8d8a0', sand); for (let x = 10; x < 38; x += 5) g.R(x, GROUND + 1, 1, 1, '#c8b880', sand); }
      if (wave < .5) mascotIdle(g, t); else mobAt(g, M.turtle, t);
      if (wave > 0 && wave < 1) {
        const x = lerp(-10, 50, wave);
        g.R(x - 14, GROUND - 16, 14, 16, '#3a8ad0', .75); g.R(x - 14, GROUND - 16, 14, 2, '#bfe6ff', .9); g.R(x - 2, GROUND - 14, 3, 14, '#bfe6ff', .6);
        for (let i = 0; i < 5; i++) g.R(x - 16 - hash(i) * 8, GROUND - 2 - hash(i + 9) * 4, 1, 1, '#ffffff', .8);
      }
      g.T('ザブーン', 24, 10, 5, '#bfe6ff', wave > 0 && wave < 1 ? 1 : 0);
    } },
  // ----- 3回目の 20 体 -----
  { mob: 'グロウイカ', name: 'ふかい海で ぼんやり', how: 'くらい海の中で 青みどりに ぼんやり光って',
    draw(g, t) {
      const dk = seg(t, .7, 1.2) * (1 - seg(t, 3.2, 3.7)), glow = seg(t, 1.2, 2.2), sw = ease(seg(t, 2.0, 2.6));
      if (dk > 0) { g.R(9, 19, 30, GROUND - 19, '#0a2a4a', .6 * dk); g.R(9, 19, 30, 1, '#3a7ab0', .7 * dk); }
      if (glow > 0 && sw < 1) g.disc(24, 34, Math.round(4 + glow * 6), '#40e8d0', (.25 + .15 * Math.sin(t * 8)) * (1 - sw));
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#2ab4a8', glow) });
      if (sw > 0) mobAt(g, M.gsquid, t, 24, { a: sw });
      for (let i = 0; i < 8; i++) { const ph = (t * .5 + hash(i)) % 1; g.R(11 + hash(i + 3) * 26, GROUND - 2 - ph * 18, 1, 1, '#8affe0', dk * Math.sin(ph * Math.PI)); }
      g.T('ぼんやり', 24, 10, 5, '#8affe0', glow > 0 && glow < 1 ? 1 : 0);
    } },
  { mob: 'スイカ頭の スノーゴーレム', name: 'スイカが ころころ', how: 'スイカが ころがってきて ゴツン！ 雪が まいあがって',
    draw(g, t) {
      const roll = seg(t, .8, 1.5), hop = seg(t, 1.45, 1.85), snow = seg(t, 1.8, 2.6), sw = seg(t, 2.3, 2.6);
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - Math.sin(hop * Math.PI) * 6 + (t < .8 ? bob(t) : 0), { a: 1 - sw, col: tint('#f4f8fb', snow) });
      if (roll > 0 && sw < 1) {
        const mx = lerp(2, 13, ease(roll)), a = 1 - sw;
        g.disc(mx, GROUND - 5, 5, '#5aa030', a);
        for (let k = 0; k < 3; k++) g.R(mx - 4 + ((k * 3 + roll * 24) % 8), GROUND - 8, 1, 6, '#3a7a20', a);
      }
      if (snow > 0 && snow < 1) for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 + snow * 8, r = 6 + snow * 8; g.R(24 + Math.cos(an) * r, 32 + Math.sin(an) * r * .6, 1, 1, '#ffffff', 1 - snow); }
      if (sw > 0) mobAt(g, M.melon, t, 24, { a: sw });
      g.T('ゴツン', 24, 10, 5, '#ffd84a', hop > 0 && hop < 1 ? 1 : 0);
    } },
  { mob: 'ムーブルーム', name: '花びらの 雨', how: 'ひまわりが さいて 黄色い花びらが ふってくる',
    draw(g, t) {
      const fl = ease(seg(t, .7, 1.3)) * (1 - seg(t, 3.0, 3.5)), rain = seg(t, 1.1, 2.2), sw = ease(seg(t, 2.1, 2.7));
      if (fl > 0) { const h = 18 * fl; g.R(38, GROUND - h, 1.5, h, '#4f9a3a'); g.disc(38, Math.round(GROUND - h), 3, '#ffd020'); g.R(37, GROUND - h - 1, 3, 2, '#8a5a20'); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#f0c830', rain) });
      if (sw > 0) mobAt(g, M.moobloom, t, 22, { a: sw });
      if (rain > 0 && rain < 1) for (let i = 0; i < 10; i++) { const ph = (rain * 2 + hash(i)) % 1; g.R(12 + hash(i + 5) * 24 + Math.sin(t * 3 + i) * 2, 19 + ph * 22, 1.2, 1, i % 2 ? '#ffe040' : '#fff6a0', 1 - ph * .5); }
      g.T('モ〜', 38, 12, 6, '#ffffff', seg(t, 2.6, 2.8) - seg(t, 3.8, 4.2));
    } },
  { mob: 'オウム', name: 'ジュークボックスで ダンス', how: '音楽が 鳴りだすと 赤くなって おどりだす',
    draw(g, t) {
      const jb = seg(t, .6, 1.0), dance = seg(t, 1.0, 2.3), sw = ease(seg(t, 2.2, 2.6));
      if (jb > 0) { const h = 8 * jb; g.R(32, GROUND - h, 8, h, '#7a5230'); g.R(32, GROUND - h, 8, 1, '#9a6a3c'); g.R(34, GROUND - h + 1, 4, 1.5, '#2a2a2a'); }
      const d = dance > 0 ? Math.round(Math.sin(t * 8) * 2) : 0;
      if (sw < 1) g.sprite(MASCOT, 19 + d, GROUND + (dance > 0 ? -Math.abs(Math.sin(t * 8)) : bob(t)), { a: 1 - sw, col: tint('#e03a2a', dance) });
      if (sw > 0) mobAt(g, M.parrot, t, 20, { a: sw });
      if (jb >= 1) for (let i = 0; i < 3; i++) { const ph = (t * .8 + i / 3) % 1; note(g, 35 + Math.sin(ph * 6 + i) * 2, GROUND - 10 - ph * 12, ['#ff6a8a', '#6ac8ff', '#ffd040'][i], 1 - ph); }
    } },
  { mob: '熱帯魚', name: '水そうで すいすい', how: 'まわりに 水そうが できて 小さくなって 魚に',
    draw(g, t) {
      const tk = ease(seg(t, .7, 1.4)), shrink = seg(t, 1.5, 2.2), sw = seg(t, 2.1, 2.3);
      if (sw < 1) {
        const me = () => mascotIdle(g, t, { sx: 1 - shrink * .7, sy: 1 - shrink * .7, col: tint('#f0a020', shrink) });
        if (tk > 0) tank(g, 24, Math.min(1, tk * 2), me, tk); else me();
        for (let i = 0; i < 5; i++) { const ph = (t * .8 + hash(i)) % 1; if (tk > ph) g.R(16 + hash(i + 2) * 16, GROUND - 2 - ph * 17, 1, 1, '#dff4ff', .9); }
      } else mobAt(g, M.fish, t);
      g.T('ぽちゃん', 24, 10, 5, '#8ac8ff', sw > 0 && t < 2.8 ? 1 : 0);
    } },
  { mob: 'どろんこブタ', name: '雨あがりの どろんこ', how: '雨で どろが できて しずんだら 頭に 花が ポン',
    draw(g, t) {
      const rain = seg(t, .7, 1.0) * (1 - seg(t, 1.9, 2.2)), mud = ease(seg(t, 1.2, 2.0)), sink = ease(seg(t, 1.8, 2.2)), sw = seg(t, 2.2, 2.35);
      for (let i = 0; i < 12; i++) { const ph = (t * 2 + hash(i)) % 1; g.R(8 + hash(i + 1) * 32, 19 + ph * 22, .6, 2, '#8ac8ff', rain * .8); }
      if (sw < 1) { g.clip(0, 0, G, GROUND - 2 * mud, () => mascotIdle(g, t, { off: () => [0, sink * 4], col: tint('#6a4a2a', mud * .6) })); if (mud > 0) mudpile(g, 24, mud); }
      else mobAt(g, M.mpig, t);
      g.T('ポンッ', 36, 12, 6, '#ff8a8a', seg(t, 2.3, 2.45) - seg(t, 3.0, 3.3));
    } },
  { mob: 'ラマ', name: 'カーペットで ペッ', how: '首が にゅーっと のびて カーペットが かかり つばを ペッ',
    draw(g, t) {
      const neck = ease(seg(t, .9, 1.5)), carpet = seg(t, 1.5, 1.9), sw = ease(seg(t, 1.9, 2.4)), spit = seg(t, 2.8, 3.3);
      if (sw < 1) { mascotIdle(g, t, { a: 1 - sw, col: tint('#e8dcc0', neck) }); if (neck > 0) g.R(30, GROUND - 16 - neck * 6, 4, neck * 6 + 1, '#e8dcc0', 1 - sw); }
      if (carpet > 0 && carpet < 1) g.R(14, lerp(19, GROUND - 12, carpet * carpet), 18, 2, '#9a4ac8');
      if (sw > 0) mobAt(g, M.llama, t, 22, { a: sw });
      if (spit > 0 && spit < 1) g.disc(lerp(33, 42, spit), Math.round(GROUND - 15 + spit * 4), 1, '#f0f0f0');
      g.T('ペッ', 36, 14, 6, '#ffffff', spit > 0 && spit < 1 ? 1 : 0);
    } },
  { mob: 'ヤギ', name: 'ブロックに ずつき', how: '石に ゴツンと 頭つき！ はねかえったら ツノが はえて',
    draw(g, t) {
      const run = seg(t, .8, 1.3), bonk = seg(t, 1.3, 1.7), back = seg(t, 1.5, 2.1), sw = ease(seg(t, 1.9, 2.4)), blk = 1 - seg(t, 2.8, 3.3);
      const sh = bonk > 0 && bonk < 1 ? Math.round(Math.sin(t * 60)) : 0;
      g.R(36 + sh, GROUND - 8, 6, 8, '#8a8a8a', blk); g.R(36 + sh, GROUND - 8, 6, 1, '#a8a8a8', blk); g.R(38 + sh, GROUND - 5, 2, 1, '#6a6a6a', blk);
      const x = back > 0 ? lerp(26, 22, ease(back)) : lerp(20, 26, run * run), y = back > 0 && back < 1 ? -Math.sin(back * Math.PI) * 4 : 0;
      if (sw < 1) {
        g.sprite(MASCOT, x, GROUND + y + (t < .8 ? bob(t) : 0), { a: 1 - sw, col: tint('#ece8e0', back) });
        if (back > 0) { g.R(x - 6, GROUND + y - 16 - back * 2, 2, back * 2, '#a89a80', 1 - sw); g.R(x + 4, GROUND + y - 16 - back * 2, 2, back * 2, '#a89a80', 1 - sw); }
      }
      if (sw > 0) mobAt(g, M.goat, t, 22, { a: sw });
      sparkle(g, 34, GROUND - 12, bonk, '#ffd84a'); sparkle(g, 38, GROUND - 16, seg(t, 1.4, 1.8), '#ffd84a');
      g.T('ゴツン', 30, 10, 6, '#ffd84a', bonk > 0 && bonk < 1 ? 1 : 0);
    } },
  { mob: 'アレイ', name: 'アメジストの キラキラ', how: 'むらさきの クリスタルが はえて ふわっと 浮かび 羽が はえる',
    draw(g, t) {
      const cr = ease(seg(t, .7, 1.3)) * (1 - seg(t, 3.0, 3.5)), fl = seg(t, 1.3, 2.0), sw = ease(seg(t, 1.9, 2.4));
      [12, 16, 33, 37].forEach((x, i) => { const h = (4 + hash(i) * 4) * cr; g.R(x, GROUND - h, 2, h, '#9a6ad8', cr); g.R(x, GROUND - h, 1, h, '#c8a0ff', cr); });
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - fl * 8 + (t < .7 ? bob(t) : 0), { a: 1 - sw, sx: 1 - fl * .3, sy: 1 - fl * .3, col: tint('#4ad0f0', fl) });
      if (sw > 0) mobAt(g, M.allay, t, 24 + Math.round(Math.sin(t * 2) * 3), { a: sw });
      for (let i = 0; i < 6; i++) { const ph = (t * .6 + hash(i)) % 1; g.R(12 + hash(i + 7) * 24, GROUND - 2 - ph * 18, 1, 1, i % 2 ? '#c8a0ff' : '#bff4ff', cr * (1 - ph)); }
      g.T('キラキラ', 24, 10, 5, '#c8a0ff', fl > 0 && fl < 1 ? 1 : 0);
    } },
  { mob: 'ウォーデン', name: 'スカルクが ひびく', how: '足もとに スカルクが ひろがって ゆれると 地面から',
    draw(g, t) {
      const sc = seg(t, .7, 1.5) * (1 - seg(t, 3.2, 3.6)), vib = seg(t, 1.3, 2.1), sink = ease(seg(t, 1.6, 2.0)), rise = ease(seg(t, 2.1, 2.9));
      for (let x = 24 - 16 * sc; x < 24 + 16 * sc; x += 2) { g.R(x, GROUND - 1, 2, 1.5, '#0e2a38'); if (Math.round(x) % 6 === 0) g.R(x, GROUND - 1, 1, 1, '#40e8e0'); }
      if (vib > 0 && vib < 1) for (let k = 0; k < 2; k++) { const r = (vib * 2 + k * .5) % 1; for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; g.R(24 + Math.cos(an) * r * 14, 32 + Math.sin(an) * r * 8, 1, 1, '#40e8e0', 1 - r); } }
      if (sink < 1) g.clip(0, 0, G, GROUND, () => mascotIdle(g, t, { off: () => [0, sink * 18], col: tint('#0e3a48', seg(t, 1.2, 1.8)) }));
      if (rise > 0) g.clip(0, 0, G, GROUND, () => mobAt(g, M.warden, t, 24, { off: () => [0, (1 - rise) * 24] }));
      g.T('ズズズ…', 24, 10, 5, '#40e8e0', vib > 0 && vib < 1 ? 1 : 0);
    } },
  { mob: 'スニッファー', name: 'ふるい たまご', how: 'あやしい砂を ハケで サッサッ… 出てきた たまごが パキッ',
    draw(g, t) {
      const sand = seg(t, .6, .9), brush = seg(t, 1.0, 1.8), egg = seg(t, 1.6, 1.9), crack = seg(t, 1.9, 2.3), sw = seg(t, 2.3, 2.5);
      if (sw < 1) g.sprite(MASCOT, 18, GROUND + (brush > 0 && brush < 1 ? walkFrame(t) : bob(t)), { a: 1 - sw });
      if (sand > 0 && egg < 1) { const h = 10 * sand * (1 - egg); g.R(31, GROUND - h, 10, h, '#e0cc88'); g.R(31, GROUND - h, 10, 1, '#f0e0a0'); g.R(33, GROUND - h + 3, 1, 1, '#b8a060'); g.R(38, GROUND - h + 6, 1, 1, '#b8a060'); }
      if (brush > 0 && brush < 1) { const bx = 30 + Math.sin(t * 20) * 1.5; g.R(bx, GROUND - 9, 1, 4, '#8a5a30'); g.R(bx - .5, GROUND - 10, 2, 1.5, '#e8d8b0'); }
      if (egg > 0 && sw < 1) {
        for (let y = 0; y < 9; y++) { const k = (y - 4.5) / 4.5, w = Math.round(3.5 * Math.sqrt(Math.max(0, 1 - k * k))); if (w > 0) g.R(36 - w, GROUND - 9 + y, w * 2, 1, y % 3 === 1 ? '#5a9a3a' : '#a83a2a', 1 - sw); }
        if (crack > 0) g.R(33, GROUND - 5, 6 * crack, 1, '#2a1a10', 1 - sw);
      }
      if (sw > 0) mobAt(g, M.sniffer, t, 24, { a: sw });
      g.T('サッサッ', 24, 10, 5, '#ffffff', brush > 0 && brush < 1 ? 1 : 0); g.T('パキッ', 36, 12, 6, '#ffd84a', crack > 0 && crack < 1 ? 1 : 0);
    } },
  { mob: 'カエル', name: 'ハスの葉で ペロッ', how: '池の ハスの葉に のって ハエを ペロッと たべたら',
    draw(g, t) {
      const pond = seg(t, .6, 1.0) * (1 - seg(t, 3.0, 3.5)), hop = seg(t, 1.0, 1.5), lick = seg(t, 1.8, 2.1), sw = ease(seg(t, 2.1, 2.5));
      if (pond > 0) { g.R(8, GROUND - 1, 32, 2, '#3a7ab0', pond); g.R(14, GROUND - 2, 20, 1.5, '#4a9a3a', pond); g.R(23, GROUND - 2, 2, 1, '#3a7ab0', pond); }
      if (t < 2.05) { const fx = 36 + Math.sin(t * 7) * 3, fy = GROUND - 12 + Math.cos(t * 9) * 2; g.R(fx, fy, 1, 1, '#1a1a1a'); g.R(fx - .5, fy - .8, 2, .6, '#d8e8ff', .8); }
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - 2 * pond - Math.sin(hop * Math.PI) * 5 + (t < 1 ? bob(t) : 0), { a: 1 - sw, col: tint('#d88a3a', lick) });
      if (lick > 0 && lick < 1) g.R(30, GROUND - 10, Math.sin(lick * Math.PI) * 8, 1, '#e86a8a');
      if (sw > 0) mobAt(g, M.frog, t, 24, { a: sw });
      g.T('ペロッ', 36, 14, 6, '#ff8aa8', lick > 0 && lick < 1 ? 1 : 0);
    } },
  { mob: 'ラクダ', name: 'さばくを のっしのっし', how: 'あつい さばくを 歩いていると コブが ふたつ',
    draw(g, t) {
      const dune = seg(t, .6, 1.0) * (1 - seg(t, 3.0, 3.5)), hump = ease(seg(t, 1.2, 2.0)), sw = ease(seg(t, 2.0, 2.6));
      if (dune > 0) { g.disc(36, 24, 3, '#ffd040', dune); g.disc(9, GROUND + 4, 6, '#e8d090', dune); g.disc(40, GROUND + 5, 7, '#e0c880', dune); for (let i = 0; i < 3; i++) g.R(12 + i * 9 + Math.sin(t * 4 + i) * 1.5, 22 + i * 2, 4, .6, '#f0e0b0', dune * .7); }
      const by = GROUND + (t > .9 && sw < 1 ? walkFrame(t * .5) : bob(t));
      if (sw < 1) { mascotIdle(g, t, { a: 1 - sw, col: tint('#d8a868', hump) }); if (hump > 0) { g.R(16, by - 16 - hump * 3, 5, hump * 3, '#c89858', 1 - sw); g.R(24, by - 16 - hump * 3, 5, hump * 3, '#c89858', 1 - sw); } }
      if (sw > 0) mobAt(g, M.camel, t, 24, { a: sw });
      g.T('のっし のっし', 24, 10, 5, '#ffffff', t > 1.0 && t < 2.0 ? 1 : 0);
    } },
  { mob: 'イルカ', name: '波から ジャンプ', how: '海に とびこむと イルカが 大きく ジャンプ！',
    draw(g, t) {
      const sea = seg(t, .6, 1.0), dive = seg(t, 1.0, 1.5), leap = seg(t, 1.8, 2.6);
      if (dive < 1) g.clip(0, 0, G, GROUND - 4, () => g.sprite(MASCOT, 24, GROUND - Math.sin(dive * Math.PI) * 6 + dive * dive * 16 + (t < 1 ? bob(t) : 0), { col: tint('#6a8aa8', dive) }));
      if (leap > 0 && leap < 1) g.sprite(M.dolphin.sp, lerp(12, 30, leap), GROUND - 2 - Math.sin(leap * Math.PI) * 14);
      if (leap >= 1) mobAt(g, M.dolphin, t, 26);
      if (sea > 0) { g.R(7, GROUND - 4, 34, 4, '#3a8ad0', .75 * sea); for (let x = 7; x < 40; x += 4) g.R(x + (t * 8) % 4, GROUND - 4, 2, 1, '#bfe6ff', sea); }
      [[24, seg(t, 1.35, 1.8)], [12, seg(t, 1.8, 2.2)], [30, seg(t, 2.5, 2.9)]].forEach(([x, k]) => { if (k > 0 && k < 1) for (let i = 0; i < 6; i++) g.R(x + (i - 2.5) * 2 * k, GROUND - 5 - Math.sin(k * Math.PI) * (4 + i % 3 * 2), 1, 1, '#dff4ff', 1 - k); });
      g.T('ザバーン', 24, 10, 5, '#bfe6ff', leap > 0 && leap < 1 ? 1 : 0);
    } },
  { mob: 'ストライダー', name: 'マグマの上を 歩く', how: 'あちちっ！ と はねていたら 足が のびて マグマを 平気で 歩く',
    draw(g, t) {
      const lava = seg(t, .6, 1.0), hot = seg(t, 1.0, 1.8), grow = ease(seg(t, 1.8, 2.4)), sw = ease(seg(t, 2.2, 2.6));
      if (lava > 0) { g.R(8, GROUND - 1, 32, 3, '#ff6a10', lava); g.R(10, GROUND - 1, 28, 1, '#ffcf3a', lava); for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i / 3) % 1; g.R(14 + i * 9, GROUND - 1 - ph * 4, 1, 1, '#ffcf3a', lava * (1 - ph)); } }
      const y = hot > 0 && hot < 1 ? -Math.abs(Math.sin(t * 10)) * 3 : 0;
      if (sw < 1) {
        g.sprite(MASCOT, 24, GROUND - grow * 6 + y + (t < 1 ? bob(t) : 0), { a: 1 - sw, col: tint('#a83a3a', hot) });
        if (grow > 0) { g.R(19, GROUND - grow * 6, 2, grow * 6, '#8a2a2a', 1 - sw); g.R(27, GROUND - grow * 6, 2, grow * 6, '#8a2a2a', 1 - sw); }
      }
      if (sw > 0) mobAt(g, M.strider, t, 24, { a: sw });
      g.T('あちちっ', 24, 10, 5, '#ffcf3a', hot > 0 && hot < 1 ? 1 : 0);
    } },
  { mob: 'ホグリン', name: 'ネザーの森で とっしん', how: '赤いキノコの森で うしろに さがって どどどっと とっしん',
    draw(g, t) {
      const fg = seg(t, .6, 1.1) * (1 - seg(t, 3.0, 3.5)), back = ease(seg(t, 1.0, 1.4)), charge = seg(t, 1.5, 2.0), sw = ease(seg(t, 1.9, 2.3));
      [[10, 14], [39, 11]].forEach(([x, h]) => { g.R(x, GROUND - h * fg, 1.5, h * fg, '#a83a3a', fg); g.disc(x + 1, Math.round(GROUND - h * fg), 3, '#c82a2a', fg); });
      for (let i = 0; i < 6; i++) { const ph = (t * .4 + hash(i)) % 1; g.R(10 + hash(i + 4) * 28, 20 + ph * 20, 1, 1, '#ff6a6a', fg * Math.sin(ph * Math.PI)); }
      const x = charge > 0 ? lerp(18, 28, charge * charge) : lerp(24, 18, back);
      if (sw < 1) g.sprite(MASCOT, x, GROUND + (charge > 0 ? walkFrame(t * 2) : bob(t)), { a: 1 - sw, col: tint('#c88a6a', charge) });
      if (charge > 0 && charge < 1) for (let i = 0; i < 4; i++) g.disc(x - 12 - i * 3, GROUND - 1 - i, 1, '#a8988a', (1 - charge) * (1 - i / 4));
      if (sw > 0) mobAt(g, M.hoglin, t, lerp(28, 24, sw), { a: sw });
      g.T('ブヒーッ', 24, 10, 6, '#ffffff', seg(t, 2.2, 2.4) - seg(t, 3.4, 3.8));
    } },
  { mob: 'ピグリン', name: '金の インゴット', how: '飛んできた 金を うけとって ふむふむ…',
    draw(g, t) {
      const fly = seg(t, .8, 1.4), look = seg(t, 1.4, 2.1), sw = ease(seg(t, 2.1, 2.5));
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#e8a0a0', look) });
      if (fly > 0 && fly < 1) { const x = lerp(42, 14, fly), y = GROUND - 12 - Math.sin(fly * Math.PI) * 8; g.R(x - 1.5, y, 3, 1.5, '#f2c14e'); g.R(x - 1.5, y, 3, .5, '#fff2a0'); }
      if (fly >= 1 && sw < 1) { g.R(12, GROUND - 10 + bob(t), 3, 1.5, '#f2c14e', 1 - sw); sparkle(g, 13, GROUND - 12, (t * 2) % 1, '#ffe890'); }
      if (sw > 0) mobAt(g, M.piglin, t, 24, { a: sw });
      g.T('ふむふむ', 30, 10, 5, '#ffffff', look > 0 && look < 1 ? 1 : 0);
    } },
  { mob: 'ガーディアン', name: '海の 神殿', how: '海の神殿の 中で 浮かびあがって ビーム！',
    draw(g, t) {
      const wat = seg(t, .6, 1.0), up = ease(seg(t, 1.2, 1.9)), sw = ease(seg(t, 1.9, 2.4)), laser = seg(t, 2.8, 3.5);
      g.R(7, 19, 34, GROUND - 19, '#2a6a8a', .3 * wat);
      block(g, 11, GROUND - 6, '#5aa898', '#3a8878'); block(g, 37, GROUND - 6, '#5aa898', '#3a8878');
      g.R(10, GROUND - 4, 2, 2, '#bff8ff', wat * (.6 + .4 * Math.sin(t * 6)));
      for (let i = 0; i < 5; i++) { const ph = (t * .6 + hash(i)) % 1; g.R(15 + hash(i + 8) * 18, GROUND - 2 - ph * 18, 1, 1, '#dff4ff', wat * .8); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, off: () => [0, -up * 4], col: tint('#5a9a8a', up) });
      if (sw > 0) mobAt(g, M.guardian, t, 24, { a: sw });
      if (laser > 0 && laser < 1) for (let i = 0; i < 8; i++) if ((i + Math.floor(t * 20)) % 2) g.R(20 - i * 1.6, GROUND - 13 + i * 1.2, 1.4, 1, '#c86aff');
    } },
  { mob: 'ヴェックス', name: 'まほうの じん', how: 'むらさきの まほうじんから 小さな いたずら者が ヒュン',
    draw(g, t) {
      const circ = seg(t, .6, 1.2) * (1 - seg(t, 2.6, 3.0)), lift = ease(seg(t, 1.3, 2.0)), sw = ease(seg(t, 1.9, 2.3));
      for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t * 2; g.R(24 + Math.cos(an) * 14, GROUND - 1 + Math.sin(an) * 2.5, 1, 1, i % 2 ? '#b06aff' : '#e0b0ff', circ); }
      if (circ > 0) for (let i = 0; i < 3; i++) { const k = seg(t, 1.0 + i * .2, 1.3 + i * .2) - seg(t, 1.5 + i * .2, 1.8 + i * .2); if (k > 0) { g.R(13 + i * 10, GROUND - 3 * k, 2, 3 * k, '#c8c0a8'); g.R(13 + i * 10, GROUND - 3 * k, 2, 1, '#e8e0d0'); } }
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - lift * 8 + (t < .6 ? bob(t) : 0), { a: 1 - sw, sx: 1 - lift * .4, sy: 1 - lift * .4, col: tint('#a8b0c0', lift) });
      if (sw > 0) mobAt(g, M.vex, t, 24 + Math.round(Math.sin(t * 3) * 6), { a: sw });
      g.T('ヒュン', 36, 12, 5, '#e0b0ff', seg(t, 2.2, 2.4) - seg(t, 3.0, 3.3));
    } },
  { mob: 'ゾンビ村人', name: '月夜に うつって', how: '月が のぼると 緑の もようが ひろがって ウ〜',
    draw(g, t) {
      const moon = ease(seg(t, .6, 1.3)), sp = seg(t, 1.2, 2.2), sw = ease(seg(t, 2.1, 2.6));
      if (moon > 0) { g.disc(37, Math.round(lerp(40, 23, moon)), 3, '#efe9c9'); g.R(36, lerp(40, 23, moon) - 1, 1, 1, '#d8d0aa'); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? (sp > .5 ? '#c03030' : e.c) : hash(e.x * 7 + e.y * 13) < sp ? (e.y % 2 ? '#6a9a4a' : '#5a8a3a') : e.c });
      if (sw > 0) mobAt(g, M.zvill, t, 24, { a: sw });
      g.T('ウ〜', 36, 12, 6, '#9fe08a', seg(t, 2.4, 2.6) - seg(t, 3.6, 4.0));
    } },
  // ----- 4回目の 20 体 -----
  { mob: 'ブリーズ', name: 'つむじ風', how: '風が うずをまいて くるくる回ると',
    draw(g, t) {
      const wind = seg(t, .7, 1.2) * (1 - seg(t, 3.0, 3.5)), spin = seg(t, 1.2, 2.0), sw = ease(seg(t, 1.9, 2.3));
      for (let i = 0; i < 14; i++) { const an = t * 6 + i * .45, r = 4 + (i % 7) * 1.6; g.R(24 + Math.cos(an) * r * 1.4, GROUND - 2 - (i / 14) * 20, 1.5, .8, '#c8e4ff', wind); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: spin > 0 && spin < 1 ? Math.max(.1, Math.abs(Math.cos(t * 14))) : 1, col: tint('#b8d8f0', spin) });
      if (sw > 0) mobAt(g, M.breeze, t, 24, { a: sw });
      g.T('ビュオォ', 24, 10, 5, '#c8e4ff', spin > 0 && spin < 1 ? 1 : 0);
    } },
  { mob: 'アルマジロ', name: 'くるっと まるまる', how: 'びっくり！ まるまって ころころ… そーっと 顔を出すと',
    draw(g, t) {
      const surpr = seg(t, .8, 1.1), ball = ease(seg(t, 1.1, 1.4)), roll = seg(t, 1.4, 2.3), open = seg(t, 2.3, 2.6);
      if (surpr > 0 && ball < 1) { g.R(33, 21, 1.5, 4, '#ffd84a'); g.R(33, 26, 1.5, 1.5, '#ffd84a'); }
      if (ball < 1) mascotIdle(g, t, { sx: 1 - ball * .5, sy: 1 - ball * .5, col: tint('#c88a8a', ball) });
      else if (open <= 0) { const x = 24 + Math.sin(roll * Math.PI * 2) * 8; g.disc(x, GROUND - 5, 5, '#c88a8a'); for (let k = 0; k < 4; k++) g.R(x - 4 + ((k * 2.5 + roll * 20) % 9), GROUND - 9, .8, 8, '#a86a6a'); }
      if (open > 0) mobAt(g, M.armad, t, 24, { sy: lerp(.5, 1, open) });
    } },
  { mob: 'シルバーフィッシュ', name: '石の中から', how: '石ブロックに とじこめられて ガタガタ… 中から',
    draw(g, t) {
      const blk = ease(seg(t, .8, 1.2)), shake = seg(t, 1.4, 2.2), brk = seg(t, 2.2, 2.6);
      if (blk < 1) mascotIdle(g, t);
      if (blk > 0 && brk < 1) {
        const s = 16 * blk, sh = shake > 0 && shake < 1 ? Math.round(Math.sin(t * 40)) : 0, a = 1 - brk;
        g.R(24 - s / 2 + sh, GROUND - s, s, s, '#8a8a8a', a); g.R(24 - s / 2 + sh, GROUND - s, s, 1, '#a8a8a8', a);
        if (blk >= 1) { g.R(19 + sh, 30, 2, 1, '#6a6a6a', a); g.R(26 + sh, 35, 2, 1, '#6a6a6a', a); if (shake > .5) { g.R(20 + sh, 33, 5, 1, '#2a2a2a', a); g.R(24 + sh, 29, 1, 5, '#2a2a2a', a); } }
      }
      if (brk > 0) mobAt(g, M.silver, t);
      if (brk > 0 && brk < 1) for (let i = 0; i < 10; i++) { const an = Math.PI * (1 + i / 9), d = brk * (6 + hash(i) * 8); g.R(24 + Math.cos(an) * d, 34 + Math.sin(an) * d + brk * brk * 8, 2, 2, i % 2 ? '#8a8a8a' : '#6a6a6a', 1 - brk); }
      g.T('ガタガタ', 24, 10, 5, '#ffffff', shake > 0 && shake < 1 ? 1 : 0);
    } },
  { mob: 'ウィザー', name: 'ソウルサンドと どくろ', how: 'T字の ソウルサンドに どくろを 3つ のせると ゴゴゴ…',
    draw(g, t) {
      const go = seg(t, .7, 1.0), fl = seg(t, 2.2, 2.6);
      if (go < 1) mascotIdle(g, t, { sx: 1 - go, sy: 1 + go * .3 });
      puff(g, 24, 36, seg(t, .75, 1.3));
      if (t < 2.4) {
        [[24, GROUND - 6, 1.0], [24, GROUND - 12, 1.2], [18, GROUND - 12, 1.35], [30, GROUND - 12, 1.35]].forEach(([x, y, st]) => {
          const k = seg(t, st, st + .2); if (k > 0) block(g, x, lerp(12, y, k * k), '#5a4030', '#3a2a1a');
        });
        [[18, 1.6], [24, 1.8], [30, 2.0]].forEach(([x, st]) => {
          const k = seg(t, st, st + .2); if (k <= 0) return; const y = lerp(12, GROUND - 17, k * k);
          g.R(x - 2.5, y, 5, 5, '#2a2a2a'); g.R(x - 1.5, y + 1.5, 1, 1, '#e8e8e8'); g.R(x + .5, y + 1.5, 1, 1, '#e8e8e8'); g.R(x - 1, y + 3.5, 2, .6, '#e8e8e8');
        });
      }
      if (fl > 0) mobAt(g, M.wither, t, 24, { col: e => mix('#6aa0ff', e.c, fl) });
      if (fl > 0 && fl < 1) g.R(0, 0, G, G, '#c8d8ff', 1 - fl);
      g.T('ゴゴゴ…', 24, 10, 5, '#a8b8ff', t > 2.05 && t < 2.4 ? 1 : 0);
    } },
  { mob: 'ストレイ', name: 'ふぶきの中で', how: 'ふぶきで こおりついて 弓を持った 骨に',
    draw(g, t) {
      const bz = seg(t, .7, 1.2) * (1 - seg(t, 2.6, 3.1)), fr = seg(t, 1.1, 2.0), sw = ease(seg(t, 2.0, 2.4));
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#b8c8c8', fr) });
      if (fr > .3 && sw < 1) [17, 21, 27, 31].forEach((x, i) => g.R(x, GROUND - 10, 1, 1 + fr * (1 + i % 2) * 2, '#e0f4ff', 1 - sw));
      if (sw > 0) mobAt(g, M.stray, t, 24, { a: sw });
      for (let i = 0; i < 18; i++) { const ph = (t * 1.4 + hash(i)) % 1; g.R(6 + ph * 36, 19 + hash(i + 3) * 22 + ph * 3, 1.5, .8, '#ffffff', bz); }
      g.T('ヒュオォ', 24, 10, 5, '#e0f4ff', bz > .5 ? 1 : 0);
    } },
  { mob: 'ドラウンド', name: '水の底から', how: '水の中に しずんでいくと 三つまたの ヤリを持って',
    draw(g, t) {
      const wat = seg(t, .6, 1.0), sink = ease(seg(t, 1.1, 1.7)), rise = ease(seg(t, 2.0, 2.8));
      if (sink < 1) g.clip(0, 0, G, GROUND, () => mascotIdle(g, t, { off: () => [0, sink * 18], col: tint('#4a8a8a', sink) }));
      if (rise > 0) g.clip(0, 0, G, GROUND, () => mobAt(g, M.drowned, t, 24, { off: () => [0, (1 - rise) * 26] }));
      if (wat > 0) { g.R(7, GROUND - 7, 34, 7, '#2a6aa0', .55 * wat); for (let x = 7; x < 40; x += 4) g.R(x + (t * 6) % 4, GROUND - 7, 2, 1, '#9ad0f0', wat); }
      for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i / 4) % 1; if (sink > 0 && rise < 1) g.R(20 + i * 3, GROUND - 1 - ph * 6, 1, 1, '#dff4ff', .9); }
      g.T('ブクブク', 24, 10, 5, '#9ad0f0', sink > 0 && rise < .5 ? 1 : 0);
    } },
  { mob: 'ヴィンディケーター', name: 'オノを ふりかざす', how: 'くるくる 飛んできた オノを つかんで ブンッ',
    draw(g, t) {
      const fly = seg(t, .8, 1.5), gray = seg(t, 1.5, 2.0), sw = ease(seg(t, 1.9, 2.3)), swing = seg(t, 2.6, 2.9);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#3a4a4a', gray) });
      if (fly > 0 && fly < 1) { const x = lerp(42, 30, fly), y = lerp(19, GROUND - 14, fly), an = t * 14; g.R(x + Math.cos(an) * 2, y + Math.sin(an) * 2, 3, 3, '#c8c8d0'); g.R(x - Math.cos(an) * 2, y - Math.sin(an) * 2, 1.5, 1.5, '#6a4a2a'); }
      if (fly >= 1 && sw < 1) { g.R(31, GROUND - 14, 1, 7, '#6a4a2a', 1 - sw); g.R(32, GROUND - 14, 2.5, 3, '#c8c8d0', 1 - sw); }
      if (sw > 0) mobAt(g, M.vind, t, 24, { a: sw, ...(swing > 0 && swing < 1 ? { off: () => [Math.round(Math.sin(swing * Math.PI) * 2), 0] } : {}) });
      g.T('ブンッ', 36, 12, 6, '#ffffff', swing > 0 && swing < 1 ? 1 : 0);
    } },
  { mob: 'ピリジャー', name: 'はたを かかげて', how: 'うしろに あやしい はたが たって クロスボウで バシュッ',
    draw(g, t) {
      const flag = ease(seg(t, .7, 1.4)) * (1 - seg(t, 3.2, 3.6)), br = seg(t, 1.2, 2.0), sw = ease(seg(t, 1.9, 2.3)), arrow = seg(t, 2.6, 3.0);
      if (flag > 0) { const h = 20 * flag; g.R(36, GROUND - h, 1, h, '#6a4a2a', flag); if (flag > .6) { g.R(37, GROUND - h, 5, 9, '#f0f0f0', flag); g.R(38, GROUND - h + 2, 3, 2, '#4a4a4a', flag); g.R(37, GROUND - h + 5, 5, 1, '#2a2a2a', flag); g.R(38.5, GROUND - h + 7, 2, 2, '#6a6a6a', flag); } }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#6a5a4a', br) });
      if (sw > 0) mobAt(g, M.pill, t, 22, { a: sw });
      if (arrow > 0 && arrow < 1) { const x = lerp(13, -2, arrow); g.R(x, GROUND - 9, 4, .6, '#8a5a30'); g.R(x - 1, GROUND - 9.2, 1, 1, '#c8c8d0'); }
      g.T('バシュッ', 12, 12, 5, '#ffffff', arrow > 0 && arrow < 1 ? 1 : 0);
    } },
  { mob: 'エヴォーカー', name: 'キバの まほう', how: '地面から キバが ガブガブ… うでを上げて まほうを となえる',
    draw(g, t) {
      const fang = seg(t, .8, 1.8), dark = seg(t, 1.3, 2.0), sw = ease(seg(t, 1.9, 2.3));
      for (let i = 0; i < 5; i++) { const k = seg(fang, i * .15, i * .15 + .35); if (k > 0 && k < 1) { const x = 9 + i * 7, h = Math.sin(k * Math.PI) * 5; g.R(x, GROUND - h, 3, h, '#c8c0a8'); g.R(x, GROUND - h, 1, 1, '#e8e0d0'); g.R(x + 2, GROUND - h, 1, 1, '#e8e0d0'); } }
      for (let i = 0; i < 6; i++) { const ph = (t * .8 + hash(i)) % 1; g.R(12 + hash(i + 2) * 24, GROUND - 2 - ph * 18, 1, 1, i % 2 ? '#b06aff' : '#e0b0ff', dark * (1 - ph) * (1 - seg(t, 3.0, 3.4))); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#2a2a2a', dark), off: e => dark > .4 && (e.x <= 1 || e.x >= 10) ? [0, -2] : [0, 0] });
      if (sw > 0) mobAt(g, M.evoker, t, 24, { a: sw });
      g.T('ガブガブ', 24, 10, 5, '#e0b0ff', fang > 0 && fang < 1 ? 1 : 0);
    } },
  { mob: 'ラヴェジャー', name: 'ドシン ドシン', how: '足ぶみするたびに 地面がゆれて 大きく 灰色に',
    draw(g, t) {
      const stomp = seg(t, .9, 2.0), sw = ease(seg(t, 1.9, 2.4)), roar = seg(t, 2.6, 3.2);
      const hit = stomp > 0 && stomp < 1 && (t * 3) % 1 < .2, sh = hit || (roar > 0 && roar < 1) ? Math.round(Math.sin(t * 50)) : 0;
      g.shake(sh, 0, () => {
        if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 + stomp * .15, sy: 1 + stomp * .15, col: tint('#6a6a6a', stomp) });
        if (sw > 0) mobAt(g, M.ravager, t, 24, { a: sw });
      });
      if (hit) for (let i = 0; i < 4; i++) g.R(10 + i * 9, GROUND - 2 - hash(i + Math.floor(t * 3)) * 3, 2, 1, '#a8988a');
      if (roar > 0 && roar < 1) for (let k = 0; k < 3; k++) g.R(36 + k * 1.5, GROUND - 13 - k * 2 + roar * 2, 1, 4 + k * 2, '#ffffff', 1 - roar);
      g.T('ドシン', 24, 10, 6, '#ffffff', hit ? 1 : 0); g.T('グオォ', 36, 12, 6, '#ffffff', roar > 0 && roar < 1 ? 1 : 0);
    } },
  { mob: 'ケイブスパイダー', name: 'クモの巣の 坑道', how: '坑道で クモの巣に からまって 青い 小さなクモに',
    draw(g, t) {
      const mine = seg(t, .6, 1.0) * (1 - seg(t, 3.2, 3.6)), web = seg(t, 1.1, 1.8), sw = ease(seg(t, 1.9, 2.3));
      if (mine > 0) { g.R(9, 20, 2, GROUND - 20, '#7a5230', mine); g.R(37, 20, 2, GROUND - 20, '#7a5230', mine); g.R(9, 20, 30, 2, '#8a6238', mine); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 - web * .3, sy: 1 - web * .3, col: tint('#1a4a5a', web) });
      if (web > 0) { const a = web * (1 - sw * .7); for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI; g.R(24 - Math.cos(an) * 10, 32 - Math.sin(an) * 8, Math.abs(Math.cos(an)) * 20 + .5, .5, '#f0f0f0', a); } g.R(24, 22, .5, 20, '#f0f0f0', a); g.R(14, 32, 20, .5, '#f0f0f0', a); }
      if (sw > 0) mobAt(g, M.cspider, t, 24, { a: sw });
    } },
  { mob: 'フグ', name: 'プクーッ', how: '黄色く 小さくなって… びっくりして プクーッと ふくらむ',
    draw(g, t) {
      const wat = seg(t, .6, 1.0), sh = ease(seg(t, 1.0, 1.6)), sw = seg(t, 1.6, 1.8), inf = ease(seg(t, 2.0, 2.3));
      if (wat > 0) g.R(7, 19, 34, GROUND - 19, '#4a9ae0', .25 * wat);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 - sh * .5, sy: 1 - sh * .5, col: tint('#f0d030', sh) });
      if (sw > 0) { if (t < 2.6) { const s = .55 + inf * .45; g.sprite(M.puffer.sp, 24, GROUND - 4, { sx: s, sy: s, show: e => e.k !== 'S' || inf > .7 }); } else mobAt(g, M.puffer, t - 2.6 + .6); }
      g.T('プクーッ', 24, 10, 6, '#ffe890', inf > 0 && inf < 1 ? 1 : seg(t, 2.3, 2.4) - seg(t, 2.8, 3.0));
    } },
  { mob: 'オタマジャクシ', name: 'カエルの たまご', how: '池の中で つぶつぶの たまごになって ぷるぷる… かえった！',
    draw(g, t) {
      const pond = seg(t, .6, 1.0), sh = ease(seg(t, 1.0, 1.6)), wig = seg(t, 1.6, 2.2), sw = seg(t, 2.2, 2.4);
      if (sw >= 1) return mobAt(g, M.tadpole, t);
      if (pond > 0) { g.R(8, GROUND - 6, 32, 6, '#4a8ab0', .55 * pond); g.R(8, GROUND - 6, 32, 1, '#9ad0f0', .8 * pond); }
      if (sh < 1) mascotIdle(g, t, { sx: 1 - sh * .7, sy: 1 - sh * .7, col: tint('#5a4a3a', sh) });
      else for (let i = 0; i < 7; i++) { const x = 20 + (i % 4) * 2.5 + (i > 3 ? 1.2 : 0), y = GROUND - 5 + (i > 3 ? -2.2 : 0), w = wig > 0 ? Math.round(Math.sin(t * 20 + i)) * .4 : 0; g.disc(x + w, y, 1, '#e0eef0', 1 - sw); g.R(x + w, y, 1, 1, '#2a2a2a', 1 - sw); }
    } },
  { mob: 'エンダーマイト', name: 'エンダーパールで ワープ', how: 'パールを 投げて 着いたところに ワープしたら 小さな虫に',
    draw(g, t) {
      const thr = seg(t, .9, 1.5), warp = seg(t, 1.5, 1.9), sw = seg(t, 1.9, 2.2);
      if (warp < .5) mascotIdle(g, t, { off: thr > 0 && thr < .3 ? () => [0, -1] : undefined });
      if (thr > 0 && thr < 1) { const x = lerp(30, 34, thr), y = GROUND - 14 - Math.sin(thr * Math.PI) * 8; g.disc(x, Math.round(y), 1, '#1a5a5a'); g.R(x, y, 1, 1, '#4ac8a8'); }
      for (let i = 0; i < 10; i++) { const k = seg(t, 1.4 + hash(i) * .3, 1.9 + hash(i) * .5); if (k > 0 && k < 1) g.R((i % 2 ? 24 : 34) + (hash(i + 4) - .5) * 12, GROUND - 2 - k * 16, 1, 1, i % 3 ? '#cc00fa' : '#e079fa', 1 - k); }
      if (sw > 0) mobAt(g, M.endermite, t, 32, { a: Math.min(1, sw * 2) });
      g.T('シュンッ', 30, 10, 5, '#e079fa', warp > 0 && warp < 1 ? 1 : 0);
    } },
  { mob: 'ゾグリン', name: 'こっちの世界で ブルブル', how: 'ネザーの ゲートの つぶつぶの中で ブルブル ふるえると 緑の もように',
    draw(g, t) {
      const pt = seg(t, .6, 1.0) * (1 - seg(t, 2.8, 3.3)), shiv = seg(t, 1.1, 2.0), sw = ease(seg(t, 2.0, 2.4));
      for (let i = 0; i < 10; i++) { const ph = (t * .7 + hash(i)) % 1; g.R(10 + hash(i + 1) * 28, GROUND - 2 - ph * 20, 1, 1, i % 2 ? '#b060ff' : '#7a2ad0', pt * Math.sin(ph * Math.PI)); }
      const sh = shiv > 0 && shiv < 1 ? Math.round(Math.sin(t * 50) * .8) : 0;
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, off: () => [sh, 0], col: e => e.c === EYE ? (shiv > .6 ? '#e03030' : e.c) : hash(e.x * 3 + e.y * 7) < shiv * .5 ? '#7aa060' : mix(e.c, '#c88a8a', shiv) });
      if (sw > 0) mobAt(g, M.zoglin, t, 24, { a: sw });
      g.T('ブルブル', 24, 10, 5, '#b8ff9a', shiv > 0 && shiv < 1 ? 1 : 0);
    } },
  { mob: 'ピグリンブルート', name: 'とりでの 金ブロック', how: '金ブロックが つみあがって 金のオノが ドスン',
    draw(g, t) {
      const gb = seg(t, .7, 1.5) * (1 - seg(t, 3.2, 3.6)), dark = seg(t, 1.3, 2.0), axeF = seg(t, 1.5, 1.9), sw = ease(seg(t, 2.0, 2.4));
      [[11, 0], [11, 1], [37, 0], [37, 1], [11, 2]].forEach(([x, r], i) => { const k = seg(gb, i * .15, i * .15 + .3); if (k > 0) block(g, x, lerp(14, GROUND - 6 - r * 6, k * k), '#f2c14e', '#c89020'); });
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#2a2a2a', dark) });
      if (axeF > 0 && sw < 1) { const y = lerp(14, GROUND - 12, axeF * axeF); g.R(31, y, 1, 8, '#6a4a2a', 1 - sw); g.R(32, y, 2.5, 3, '#f2c14e', 1 - sw); }
      if (sw > 0) mobAt(g, M.brute, t, 24, { a: sw });
      g.T('ドスン', 30, 12, 6, '#ffd84a', seg(t, 1.85, 1.95) - seg(t, 2.3, 2.5));
    } },
  { mob: '行商人', name: 'いらっしゃい', how: 'しきものに 品物が ならんで 青い フードを かぶったら',
    draw(g, t) {
      const rug = seg(t, .7, 1.1) * (1 - seg(t, 3.3, 3.7)), hood = seg(t, 1.2, 1.7), sw = ease(seg(t, 1.8, 2.2));
      if (sw < 1) { mascotIdle(g, t, { a: 1 - sw, col: tint('#2a5a9a', hood * .5) }); if (hood > 0) g.R(16, lerp(19, GROUND - 17, hood), 16, 3, '#2a5a9a', 1 - sw); }
      if (sw > 0) mobAt(g, M.trader, t, 24, { a: sw });
      if (rug > 0) {
        g.R(10, GROUND - 1.5, 28 * rug, 1.5, '#c8402a', rug); g.R(10, GROUND - 1.5, 28 * rug, .5, '#f0c050', rug);
        [[13, '#3ad06a'], [18, '#e8e0d0'], [30, '#6ac8ff'], [35, '#ff8a3a']].forEach(([x, c], i) => { const k = seg(t, 1.0 + i * .15, 1.2 + i * .15) * rug; if (k > 0) { g.R(x, GROUND - 3.5, 2, 2, c, k); sparkle(g, x + 1, GROUND - 5, (t * .8 + i * .25) % 1, '#ffffff'); } });
      }
      g.T('いらっしゃい', 24, 10, 5, '#ffffff', seg(t, 2.3, 2.5) - seg(t, 3.6, 4.0));
    } },
  { mob: 'ウマ', name: 'くらを のせて', how: 'くらが ポンと のって からだが のびて パカパカ',
    draw(g, t) {
      const sad = seg(t, .8, 1.3), grow = ease(seg(t, 1.4, 2.0)), sw = ease(seg(t, 1.9, 2.3)), gal = seg(t, 2.4, 3.2);
      if (sw < 1) { mascotIdle(g, t, { a: 1 - sw, sx: 1 + grow * .2, sy: 1 + grow * .15, col: tint('#8a5a30', grow) }); if (sad > 0) g.R(19, lerp(19, GROUND - 18, sad * sad), 10, 2.5, '#5a2a10', 1 - sw); }
      if (sw > 0) mobAt(g, M.horse, gal > 0 && gal < 1 ? t * 2.5 : t, 24, { a: sw, ...(gal > 0 && gal < 1 ? { off: () => [0, -Math.abs(Math.sin(gal * Math.PI * 4)) * 2] } : {}) });
      g.T('ヒヒーン', 36, 12, 6, '#ffffff', seg(t, 2.3, 2.5) - seg(t, 3.4, 3.8));
    } },
  { mob: 'ボグド', name: 'ぬまの きのこ', how: 'ぬまの きりの中で 頭に きのこが はえて みどりの 骨に',
    draw(g, t) {
      const sw0 = seg(t, .6, 1.0) * (1 - seg(t, 3.2, 3.6)), mush = seg(t, 1.1, 1.7), bone = seg(t, 1.5, 2.2), sw = ease(seg(t, 2.1, 2.5));
      if (sw0 > 0) { g.R(7, GROUND - 2, 34, 2, '#3a5a3a', .8 * sw0); g.R(10, GROUND - 2.5, 5, 1, '#4a8a3a', sw0); g.R(31, GROUND - 2.5, 4, 1, '#4a8a3a', sw0); }
      if (sw < 1) {
        const by = GROUND + bob(t); mascotIdle(g, t, { a: 1 - sw, col: tint('#8a9a6a', bone) });
        [[18, '#8a5a30', 0], [28, '#c83a2a', .3]].forEach(([x, c, d]) => { const k = ease(seg(mush, d, d + .6)); if (k > 0) { g.R(x, by - 16 - 1.5 * k, .8, 1.5 * k, '#e8e0d0', 1 - sw); g.R(x - 1.2, by - 16 - 2.8 * k, 3.2 * k, 1.4, c, 1 - sw); } });
      }
      if (sw > 0) mobAt(g, M.bogged, t, 24, { a: sw });
      for (let i = 0; i < 4; i++) g.R(((t * 4 + i * 12) % 44) - 2, 24 + i * 4, 10, 1.5, '#d8e8d0', .25 * sw0);
    } },
  { mob: 'クリーキング', name: 'ペールガーデンの 木', how: '白い 木の森で 足もとから 木の皮に なっていき オレンジの 目が 光る',
    draw(g, t) {
      const tr = ease(seg(t, .6, 1.2)) * (1 - seg(t, 3.2, 3.6)), bark = seg(t, 1.2, 2.0), eye = seg(t, 2.0, 2.3);
      [[9, 18], [38, 20]].forEach(([x, h]) => { g.R(x, GROUND - h * tr, 3, h * tr, '#d8d4cc', tr); g.R(x + 1, GROUND - h * tr + 3, 1, 2, '#a8a49c', tr); });
      if (tr > .8) { g.R(38.5, GROUND - 12, 2, 2, '#ff9a2a', .5 + .5 * Math.sin(t * 6)); }
      if (eye < 1) {
        const line = lerp(GROUND, GROUND - 17, bark);
        g.clip(0, 0, G, line, () => mascotIdle(g, t));
        g.clip(0, line, G, G, () => mascotIdle(g, t, { col: e => e.c === EYE ? e.c : ['#4a3a2a', '#5a4632'][(e.x + e.y) % 2] }));
      }
      if (eye > 0) mobAt(g, M.creaking, t, 24, { col: eye < 1 ? e => e.k === 'O' ? mix('#2a2018', '#ff9a2a', eye) : e.c : undefined });
      g.T('ギギッ', 34, 12, 5, '#ff9a2a', seg(t, 2.2, 2.4) - seg(t, 3.2, 3.5));
    } },
  // ----- 5回目の 20 体 -----
  { mob: 'エンダードラゴン', name: 'エンドの 空へ', how: '黒い 柱の上の クリスタルが 光って 大きな 羽で まいあがる',
    draw(g, t) {
      const pil = ease(seg(t, .6, 1.2)) * (1 - seg(t, 3.2, 3.6)), beam = seg(t, 1.2, 2.0), sw = ease(seg(t, 1.9, 2.4));
      [[10, 16], [38, 14]].forEach(([x, h]) => { g.R(x - 2, GROUND - h * pil, 4, h * pil, '#1a1428', pil); if (pil > .9) { g.R(x - 1.5, GROUND - h - 4, 3, 3, '#e8a0ff', .6 + .4 * Math.sin(t * 6)); if (beam > 0 && beam < 1) for (let k = 0; k < 6; k++) g.R(lerp(x, 24, k / 6), lerp(GROUND - h - 3, GROUND - 8, k / 6), 1, 1, '#f0c8ff', (1 - beam) * .9); } });
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#1a1a1a', beam), off: e => beam > .3 && (e.x <= 1 || e.x >= 10) ? [0, Math.floor(t * 8) % 2 ? -2 : 1] : [0, 0] });
      if (sw > 0) mobAt(g, M.dragon, t, 24 + Math.round(Math.sin(t * 1.5) * 3), { a: sw });
      for (let i = 0; i < 6; i++) { const ph = (t * .5 + hash(i)) % 1; g.R(8 + hash(i + 5) * 32, 20 + ph * 20, 1, 1, '#e079fa', pil * Math.sin(ph * Math.PI)); }
      g.T('グオォォ', 24, 10, 6, '#e079fa', seg(t, 2.4, 2.6) - seg(t, 3.4, 3.8));
    } },
  { mob: 'エルダーガーディアン', name: '神殿の ぬし', how: '海の神殿の おくで 白く 大きな ぬしに',
    draw(g, t) {
      const wat = seg(t, .6, 1.0), grow = ease(seg(t, 1.1, 1.9)), sw = ease(seg(t, 1.9, 2.4)), curse = seg(t, 2.7, 3.3);
      g.R(7, 19, 34, GROUND - 19, '#1a4a6a', .35 * wat);
      for (let i = 0; i < 5; i++) { const ph = (t * .5 + hash(i)) % 1; g.R(12 + hash(i + 8) * 24, GROUND - 2 - ph * 18, 1, 1, '#dff4ff', wat * .8); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 + grow * .2, sy: 1 + grow * .2, col: tint('#c8c8b8', grow) });
      if (sw > 0) mobAt(g, M.elder, t, 22, { a: sw });
      if (curse > 0 && curse < 1) { const s = 1 + Math.sin(curse * Math.PI) * 2; g.R(24 - 3 * s, 30 - 2 * s, 6 * s, 4 * s, '#5a9a8a', .5 * Math.sin(curse * Math.PI)); g.R(24 - 1 * s, 31 - s, 2 * s, 2 * s, '#e8e0d0', .7 * Math.sin(curse * Math.PI)); }
    } },
  { mob: 'イリュージョナー', name: 'ぶんしんの じゅつ', how: 'ぶんしんが あちこちに ふえて ひとりに もどると',
    draw(g, t) {
      const cl = seg(t, 1.0, 1.9), back = ease(seg(t, 1.8, 2.2)), sw = ease(seg(t, 2.0, 2.4));
      const d = Math.sin(cl * Math.PI) * 10 * (1 - back);
      if (sw < 1) {
        if (cl > 0) [[-d, .4], [d, .4]].forEach(([dx, a]) => g.sprite(MASCOT, 24 + dx, GROUND, { a: a * (1 - sw), col: tint('#2a4a8a', cl) }));
        mascotIdle(g, t, { a: 1 - sw, col: tint('#2a4a8a', cl) });
      }
      if (sw > 0) mobAt(g, M.illus, t, 24, { a: sw });
      for (let i = 0; i < 6; i++) { const ph = (t * .8 + hash(i)) % 1; g.R(12 + hash(i + 3) * 24, GROUND - 2 - ph * 18, 1, 1, '#8ab0ff', cl > 0 && t < 3 ? 1 - ph : 0); }
      g.T('ぶんしん!', 24, 10, 5, '#8ab0ff', cl > 0 && cl < 1 ? 1 : 0);
    } },
  { mob: '帯電クリーパー', name: 'かみなりで パワーアップ', how: 'クリーパーに なったところへ かみなりが 落ちて 青い でんきを まとう',
    draw(g, t) {
      const cr = seg(t, .9, 1.3), hit = seg(t, 1.8, 2.1);
      if (cr < .5) mascotIdle(g, t, { col: tint('#5fbf4a', cr * 2) }); else if (hit < .3) mobAt(g, { sp: CREEPER }, t); else mobAt(g, M.ccreeper, t);
      puff(g, 24, 34, seg(t, .9, 1.5));
      if (t > 1.6 && t < 1.8 && Math.sin(t * 60) > .3) g.R(0, 0, G, GROUND, '#3a3a70', .6);
      if (hit > 0 && hit < 1) { bolt(g, 26, 18, 1 - hit); g.R(0, 0, G, G, '#ffffff', 1 - hit * 1.4); }
      g.T('バチバチ', 24, 10, 5, '#6ac8ff', seg(t, 2.1, 2.3) - seg(t, 3.2, 3.5));
    } },
  { mob: 'クモジョッキー', name: 'クモに のって', how: 'クモが かけてきて せなかに ぴょんと のったら',
    draw(g, t) {
      const run = ease(seg(t, .8, 1.5)), jump = seg(t, 1.6, 2.1), sw = ease(seg(t, 2.0, 2.4));
      if (run > 0 && sw < 1) g.sprite(M.sjockey.sp, lerp(-10, 24, run), GROUND, { off: M.spider.off(t * (run < 1 ? 2 : 1)), a: 1 - sw });
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - Math.sin(jump * Math.PI) * 8 - jump * 6 + (t < .8 ? bob(t) : 0), { a: 1 - sw, col: tint('#d6d6d6', jump) });
      if (sw > 0) mobAt(g, M.sjockey, t, 24, { a: sw });
      g.T('ぴょん', 34, 12, 5, '#ffffff', jump > 0 && jump < 1 ? 1 : 0);
    } },
  { mob: 'ゾンビホース', name: 'くさった りんご？', how: 'へんな色の りんごを かじったら 緑の 馬に',
    draw(g, t) {
      const fall = seg(t, .8, 1.2), eat = seg(t, 1.2, 1.8), gr = seg(t, 1.6, 2.2), sw = ease(seg(t, 2.0, 2.5));
      if (fall > 0 && eat < 1) { const y = lerp(16, GROUND - 13, fall * fall); g.clip(31, 0, 4 * (1 - eat), G, () => { g.disc(32, Math.round(y), 2, '#7a9a3a'); g.R(32, y - 3, 1, 1.5, '#5a3a20'); }); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 + gr * .2, col: tint('#5a8a4a', gr) });
      if (sw > 0) mobAt(g, M.zhorse, t, 24, { a: sw });
      g.T('もぐもぐ', 24, 10, 5, '#ffffff', eat > 0 && eat < 1 ? 1 : 0); g.T('ウ〜ヒヒン', 32, 12, 5, '#9fe08a', seg(t, 2.4, 2.6) - seg(t, 3.6, 4.0));
    } },
  { mob: 'サケ', name: '川のぼり', how: '川に とびこんで ぴょんぴょん はねながら 川を のぼる',
    draw(g, t) {
      const riv = seg(t, .6, 1.0), dive = seg(t, 1.1, 1.6), sw = seg(t, 1.6, 1.8);
      if (sw >= 1) return mobAt(g, M.salmon, t - 1.6);
      if (riv > 0) river(g, t, riv);
      g.clip(0, 0, G, GROUND - 5 * riv + 2, () => mascotIdle(g, t, { off: () => [0, -Math.sin(dive * Math.PI) * 6 + dive * dive * 14], col: tint('#c84a3a', dive) }));
      g.T('ザブン', 24, 10, 5, '#bfe6ff', dive > .6 ? 1 : 0);
    } },
  { mob: '茶トラネコ', name: '毛糸玉で あそぶ', how: 'ころがってきた 毛糸玉に とびついて じゃれると',
    draw(g, t) {
      const roll = seg(t, .8, 1.4), play = seg(t, 1.4, 2.2), sw = ease(seg(t, 2.1, 2.5));
      const bx = roll < 1 ? lerp(44, 34, ease(roll)) : 34 + Math.sin(t * 8) * 2;
      if (roll > 0) { g.disc(Math.round(bx), GROUND - 3, 3, '#d83a6a'); g.R(bx - 2, GROUND - 4, 4, .6, '#f07a9a'); g.R(bx - 1, GROUND - 2, 3, .6, '#a82a50'); if (play > 0) g.R(bx - 6, GROUND - 1, 5, .5, '#d83a6a'); }
      if (sw < 1) g.sprite(MASCOT, 22 + (play > 0 && play < 1 ? Math.round(Math.sin(t * 10) * 2) : 0), GROUND + (play > 0 && play < 1 ? -Math.abs(Math.sin(t * 10)) * 2 : bob(t)), { a: 1 - sw, col: tint('#e09040', play) });
      if (sw > 0) mobAt(g, M.tabby, t, 22, { a: sw });
      g.T('ニャッ', 22, 12, 5, '#ffffff', play > 0 && play < 1 ? 1 : seg(t, 2.6, 2.8) - seg(t, 3.6, 4.0));
    } },
  { mob: 'ハッピーガスト', name: 'かわいた ガストに 水を', how: 'かわいた ガストの ブロックに 水を かけると むくむく ふくらんで',
    draw(g, t) {
      const go = seg(t, .7, 1.0), blk = ease(seg(t, .9, 1.2)), water = seg(t, 1.3, 1.9), grow = ease(seg(t, 1.9, 2.6));
      if (go < 1) mascotIdle(g, t, { sx: 1 - go, sy: 1 + go * .3 });
      puff(g, 24, 36, seg(t, .75, 1.3));
      if (blk > 0 && grow < .4) { const c = mix('#8a8a8a', '#e8e8e8', water); g.R(20, GROUND - 8 * blk, 8, 8 * blk, c); g.R(21.5, GROUND - 5.5, 1.5, 1, '#3a3a3a'); g.R(25, GROUND - 5.5, 1.5, 1, '#3a3a3a'); }
      if (water > 0 && water < 1) for (let i = 0; i < 6; i++) { const ph = (t * 3 + i / 6) % 1; g.R(24 + (i - 2.5) * 1.5, 22 + ph * 12, .8, 1.5, '#6ab8f0', .9); }
      if (grow > .3) { const s = lerp(.3, 1, (grow - .3) / .7); mobAt(g, M.hghast, t, 24, { sx: s, sy: s }); }
      g.T('むくむく', 24, 10, 5, '#ffffff', grow > 0 && grow < 1 ? 1 : 0);
    } },
  { mob: 'コッパーゴーレム', name: '銅ブロックと ひらいしん', how: '銅ブロックに ひらいしんを さすと ピカッと 光って 動きだす',
    draw(g, t) {
      const blk = ease(seg(t, .8, 1.2)), rod = seg(t, 1.3, 1.7), fl = seg(t, 1.9, 2.3), btn = seg(t, 2.8, 3.3);
      if (blk < 1) mascotIdle(g, t, { col: tint('#d8784a', blk) });
      if (blk > 0 && fl < .4) { g.R(20, GROUND - 8 * blk, 8, 8 * blk, '#d8784a'); g.R(20, GROUND - 8 * blk, 8, 1, '#e8985a'); g.R(22, GROUND - 4, 2, 1, '#b85e38'); if (rod > 0) g.R(23.5, lerp(16, GROUND - 13, rod * rod), 1, 5, '#e8a060'); }
      if (fl > 0 && fl < 1) { sparkle(g, 24, 30, fl, '#ffe0a0'); g.R(0, 0, G, G, '#fff0d0', (1 - fl) * .7); }
      if (fl > .4) mobAt(g, M.copper, t);
      if (fl >= 1) { g.R(35, GROUND - 4, 3, 2, '#8a6a4a'); g.R(35.5, GROUND - 5 + (btn > 0 && btn < .5 ? 1 : 0), 2, 1, '#a88a6a'); }
      g.T('カチッ', 36, 14, 5, '#ffffff', btn > 0 && btn < .6 ? 1 : 0);
    } },
  { mob: 'ピンクのヒツジ', name: 'ピンクに そめる', how: 'ピンクの 花から 染料を つくって ふりかけると もこもこ',
    draw(g, t) {
      const fl = seg(t, .7, 1.1) * (1 - seg(t, 1.7, 1.9)), dye = seg(t, 1.3, 2.0), puffK = seg(t, 1.8, 2.4), sw = ease(seg(t, 2.2, 2.6));
      if (fl > 0) { g.R(36, GROUND - 4, 1, 4, '#4f9a3a', fl); g.R(35, GROUND - 6, 3, 2, '#f0a0c8', fl); }
      if (dye > 0 && dye < 1) for (let i = 0; i < 12; i++) { const ph = (dye * 2 + hash(i)) % 1; g.R(14 + hash(i + 2) * 20, 20 + ph * 20, 1, 1, i % 2 ? '#f0a0c8' : '#fab8d4', 1 - ph); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, col: tint('#f4a8c8', dye) });
      [[18, 30], [24, 27], [30, 30], [20, 35], [28, 35]].forEach(([x, y], i) => { const k = seg(puffK, i * .12, i * .12 + .3) * (1 - sw); if (k > 0) g.disc(x, y, Math.round(4 * k), i % 2 ? '#fab8d4' : '#f4a8c8'); });
      if (sw > 0) mobAt(g, M.psheep, t, 24, { a: sw });
      g.T('メェ〜', 38, 12, 6, '#ffffff', seg(t, 2.5, 2.7) - seg(t, 3.6, 4.0));
    } },
  { mob: '青いウーパールーパー', name: 'めずらしい 色！', how: '色が つぎつぎ かわって… 止まったのは めずらしい 青！',
    draw(g, t) {
      const sh = ease(seg(t, .9, 1.4)), rou = seg(t, 1.4, 2.3), sw = seg(t, 2.3, 2.35);
      const cols = ['#f0a0c0', '#9a6a4a', '#f2c14e', '#6ad0e0', '#5a7ae0'], c = rou >= 1 ? '#5a7ae0' : cols[Math.floor(t * (12 - rou * 8)) % 5];
      if (sw < 1) mascotIdle(g, t, { sx: 1 - sh * .3, sy: 1 - sh * .5, col: e => e.c === EYE ? e.c : rou > 0 ? c : mix(e.c, '#f0a0c0', sh) });
      if (sw > 0) mobAt(g, M.baxo, t);
      if (sw > 0 && t < 3.2) { sparkle(g, 14, 26, seg(t, 2.35, 2.8), '#ffe890'); sparkle(g, 34, 24, seg(t, 2.5, 3.0), '#ffe890'); }
      g.T('レア!', 24, 10, 7, '#ffd84a', seg(t, 2.35, 2.5) - seg(t, 3.4, 3.8));
    } },
  { mob: 'ハチの巣', name: 'ハチミツ とろ〜り', how: 'ハチミツが 上から とろ〜り… かたまって ハチの巣に',
    draw(g, t) {
      const drip = seg(t, .9, 1.8), sw = ease(seg(t, 1.9, 2.4));
      if (sw < 1) { const line = lerp(GROUND - 17, GROUND, drip); g.clip(0, line, G, G, () => mascotIdle(g, t, { a: 1 - sw })); g.clip(0, 0, G, line, () => mascotIdle(g, t, { a: 1 - sw, col: e => e.c === EYE ? e.c : ['#e8b850', '#f0c860'][(e.x + e.y) % 2] })); }
      if (drip > 0 && drip < 1) for (let i = 0; i < 4; i++) g.R(16 + i * 5, GROUND - 17, 1.5, (drip * 17) * (.6 + hash(i) * .4), '#f0b830', .9);
      if (sw > 0) mobAt(g, M.nest, t, 24, { a: sw });
      g.T('とろ〜り', 24, 10, 5, '#f0c030', drip > 0 && drip < 1 ? 1 : 0);
    } },
  { mob: 'ゆきギツネ', name: '雪の中で おひるね', how: '雪が ふってきて まるまって ねむると 白い キツネに',
    draw(g, t) {
      const snow = seg(t, .6, 1.0), sleep = ease(seg(t, 1.0, 1.5)), wh = seg(t, 1.4, 2.2), sw = ease(seg(t, 2.1, 2.5));
      for (let i = 0; i < 12; i++) { const ph = (t * .35 + hash(i)) % 1; g.R(8 + hash(i + 3) * 32 + Math.sin(t * 2 + i) * 2, 18 + ph * 24, 1, 1, '#ffffff', snow * .9); }
      if (sw < 1) g.sprite(MASCOT, 24, GROUND, { a: 1 - sw, sy: 1 - sleep * .35, sx: 1 + sleep * .1, col: e => e.c === EYE && sleep > .5 ? '#f0f0ec' : e.c === EYE ? e.c : mix(e.c, '#f0f0ec', wh) });
      if (sleep > .5 && sw < 1) for (let i = 0; i < 2; i++) { const k = (t * .8 + i * .5) % 1; g.R(32 + i * 3 + k * 2, 30 - k * 6, 2, .6, '#c8c0ff', 1 - k); g.R(33 + i * 3 + k * 2, 30 - k * 6 + .6, .6, 1, '#c8c0ff', 1 - k); g.R(32 + i * 3 + k * 2, 30 - k * 6 + 1.6, 2, .6, '#c8c0ff', 1 - k); }
      if (sw > 0) mobAt(g, M.sfox, t, 24, { a: sw });
      g.R(8, GROUND - 1, 32, 1.5, '#ffffff', snow * .9);
    } },
  { mob: 'ブロックを はこぶ エンダーマン', name: '草ブロックを ひょいっ', how: '草ブロックを ひょいっと 持ちあげて ワープしたら',
    draw(g, t) {
      const lift = ease(seg(t, .9, 1.4)), warp = seg(t, 1.5, 2.0), sw = ease(seg(t, 2.0, 2.4));
      if (warp < .5) mascotIdle(g, t, { col: tint('#1e1e22', lift * .6) });
      if (lift > 0 && warp < .5) { const y = lerp(GROUND - 6, GROUND - 12, lift); g.R(21, y, 6, 6, '#7a5230'); g.R(21, y, 6, 2, '#5fa84a'); }
      if (lift <= 0) { g.R(21, GROUND - 6, 6, 6, '#7a5230'); g.R(21, GROUND - 6, 6, 2, '#5fa84a'); }
      for (let i = 0; i < 12; i++) { const k = seg(t, 1.4 + hash(i) * .3, 2.0 + hash(i) * .4); if (k > 0 && k < 1) g.R(14 + hash(i + 4) * 20, GROUND - 2 - k * 20, 1, 1, i % 2 ? '#cc00fa' : '#e079fa', 1 - k); }
      if (sw > 0) mobAt(g, M.enderb, t, 24, { a: sw });
      g.T('ひょいっ', 34, 12, 5, '#e079fa', lift > 0 && lift < 1 ? 1 : 0);
    } },
  { mob: 'スライムの ぶんれつ', name: 'ぷちっと ぶんれつ', how: '大きな スライムに なって ぷちっ ぷちっと 小さく わかれる',
    draw(g, t) {
      const gr = seg(t, .9, 1.5), sp1 = seg(t, 1.8, 2.1), sp2 = seg(t, 2.4, 2.7);
      if (gr < 1) mascotIdle(g, t, { col: tint('#5fbf4a', gr) });
      else if (sp1 <= 0) g.sprite(M.slime.sp, 24, GROUND, { sx: 1.1 + Math.sin(t * 12) * .05, sy: 1.1 - Math.sin(t * 12) * .05 });
      else if (sp2 <= 0) [-1, 1].forEach(d => g.sprite(M.slime.sp, 24 + d * lerp(0, 7, ease(sp1)), GROUND - Math.sin(sp1 * Math.PI) * 5, { sx: .7, sy: .7 }));
      else if (sp2 < 1) [[-1, 0], [1, 0], [0, 1]].forEach(([d, u]) => g.sprite(SLIME_S, 24 + d * lerp(7, 9, ease(sp2)), GROUND - Math.sin(sp2 * Math.PI) * (5 + u * 3), {}));
      else mobAt(g, M.slimes, t);
      g.T('ぷちっ', 24, 10, 6, '#b8ff9a', (sp1 > 0 && sp1 < .5) || (sp2 > 0 && sp2 < .5) ? 1 : 0);
    } },
  { mob: '村人の 子ども', name: 'おにごっこ', how: 'ちいさく なって 村の 子どもと おにごっこ',
    draw(g, t) {
      const sh = ease(seg(t, .9, 1.4)), sw = ease(seg(t, 1.4, 1.8)), run = seg(t, 1.8, 3.4);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 - sh * .4, sy: 1 - sh * .4 });
      puff(g, 24, 36, seg(t, 1.3, 1.9));
      if (sw > 0) { const x = run > 0 ? 24 + Math.sin(run * Math.PI * 2) * 12 : 24; g.sprite(M.bvill.sp, x, GROUND, { a: sw, off: M.bvill.off(run > 0 && run < 1 ? t * 2 : t * .4) }); if (run > 0 && run < 1) { const x2 = 24 + Math.sin(run * Math.PI * 2 - .9) * 12; g.sprite(M.bvill.sp, x2, GROUND, { off: M.bvill.off(t * 2 + .3), col: e => mix(e.c, '#4a7ad0', .4) }); } }
      g.T('まて〜', 24, 10, 5, '#ffffff', run > 0 && run < 1 ? 1 : 0);
    } },
  { mob: 'よろいの オオカミ', name: 'アルマジロの うろこ', how: 'アルマジロの うろこが 飛んできて よろいに なる',
    draw(g, t) {
      const mo = ease(seg(t, .9, 1.4)), sc = seg(t, 1.5, 2.4);
      if (mo < 1) mascotIdle(g, t, { a: 1 - mo, col: tint('#e0dcd8', mo) });
      if (mo > 0) mobAt(g, M.wolf, t, 24, { a: mo });
      if (sc > 0) mobAt(g, M.awolf, t, 24, { show: e => e.y >= 4 && e.y <= 6 && e.x >= 3 && e.x <= 12 && e.k === 'W' && hash(e.x * 5 + e.y) < sc * 1.2 });
      if (sc > 0 && sc < 1) for (let i = 0; i < 5; i++) { const k = seg(sc, i * .15, i * .15 + .35); if (k > 0 && k < 1) g.R(lerp(42, 18 + i * 3, k), lerp(20, GROUND - 9, k), 2, 1.5, '#c8a878'); }
      g.T('カチャッ', 36, 12, 5, '#ffffff', seg(t, 2.3, 2.5) - seg(t, 3.0, 3.3));
    } },
  { mob: 'スニッファーの 赤ちゃん', name: 'くんくん たねさがし', how: 'ちいさく なって 地面を くんくん… たねを 見つけたら 花が さく',
    draw(g, t) {
      const sh = ease(seg(t, .9, 1.4)), sniff = seg(t, 1.6, 2.4), flower = ease(seg(t, 2.4, 2.9));
      if (sh < 1) mascotIdle(g, t, { sx: 1 - sh * .3, sy: 1 - sh * .3, col: tint('#a83a2a', sh) });
      else mobAt(g, M.snifflet, sniff > 0 && sniff < 1 ? t * 2 : t);
      if (sniff > 0 && sniff < 1) for (let i = 0; i < 3; i++) { const k = (t * 2 + i / 3) % 1; g.R(34 + k * 3, GROUND - 1 - k * 3, 1, 1, '#8a6238', 1 - k); }
      if (flower > 0) { const h = 6 * flower; g.R(36, GROUND - h, 1, h, '#4f9a3a'); g.R(35, GROUND - h - 2, 3, 2, '#ff7a3a'); g.R(35.5, GROUND - h - 3, 2, 1, '#ffd040'); }
      g.T('くんくん', 24, 10, 5, '#ffffff', sniff > 0 && sniff < 1 ? 1 : 0);
    } },
  { mob: '茶色の ムーシュルーム', name: 'かみなりで 茶色に', how: '赤い ムーシュルームに かみなりが 落ちると 茶色に かわる',
    draw(g, t) {
      const red = seg(t, .9, 1.3), hit = seg(t, 1.9, 2.2);
      if (red < .5) mascotIdle(g, t, { col: tint('#b02a2a', red * 2) }); else mobAt(g, hit < .3 ? M.moosh : M.bmoosh, t);
      puff(g, 24, 34, seg(t, .9, 1.5));
      if (t > 1.7 && t < 1.9 && Math.sin(t * 60) > .3) g.R(0, 0, G, GROUND, '#3a3a70', .6);
      if (hit > 0 && hit < 1) { bolt(g, 22, 18, 1 - hit); g.R(0, 0, G, G, '#ffffff', 1 - hit * 1.4); }
      g.T('モ〜？', 36, 12, 6, '#ffffff', seg(t, 2.4, 2.6) - seg(t, 3.6, 4.0));
    } },
  // ----- 6回目の 20 体 -----
  { mob: 'ラバ', name: 'チェストを せおって', how: 'チェストが ドスンと のって にもつを はこぶ ラバに',
    draw(g, t) {
      const fall = seg(t, .8, 1.3), mo = ease(seg(t, 1.5, 2.1)), walk = seg(t, 2.3, 3.3);
      if (mo < 1) { mascotIdle(g, t, { a: 1 - mo, sx: 1 + mo * .3, col: tint('#5a3a20', mo) }); if (fall > 0) { const y = lerp(16, GROUND - 22, fall * fall); g.R(20, y, 8, 6, '#a0743a', 1 - mo); g.R(20, y, 8, 1.5, '#c08a4a', 1 - mo); g.R(23.5, y + 2.5, 1, 1.5, '#3a3a3a', 1 - mo); } }
      if (mo > 0) mobAt(g, M.mule, walk > 0 && walk < 1 ? t * 1.5 : t, 24, { a: mo });
      g.T('ドスン', 34, 12, 6, '#ffffff', seg(t, 1.25, 1.35) - seg(t, 1.8, 2.0));
    } },
  { mob: 'トレーダーラマ', name: '青い カーペット', how: '行商人の 青い カーペットが ふわっと かかって',
    draw(g, t) {
      const neck = ease(seg(t, .9, 1.4)), cp = seg(t, 1.4, 2.0), sw = ease(seg(t, 1.9, 2.3));
      if (sw < 1) { mascotIdle(g, t, { a: 1 - sw, col: tint('#e8dcc0', neck) }); if (neck > 0) g.R(30, GROUND - 16 - neck * 6, 4, neck * 6 + 1, '#e8dcc0', 1 - sw); }
      if (cp > 0 && cp < 1) { const y = lerp(19, GROUND - 12, ease(cp)), w = Math.round(Math.sin(t * 12)) * (1 - cp); for (let x = 0; x < 18; x += 3) g.R(14 + x + w, y + (x % 6 ? .5 : 0), 3, 2, x % 6 ? '#2a5ac0' : '#f0c030'); }
      if (sw > 0) mobAt(g, M.tllama, t, 22, { a: sw });
      g.T('ふわっ', 24, 10, 5, '#ffffff', cp > 0 && cp < 1 ? 1 : 0);
    } },
  { mob: 'タラ', name: 'むれで すいすい', how: '海に とびこむと なかまと いっしょに むれで およぐ',
    draw(g, t) {
      const s = seg(t, .6, 1.0), dive = seg(t, 1.0, 1.6), sw = seg(t, 1.6, 1.7);
      if (sw >= 1) return mobAt(g, M.cods, t - 1.6);
      if (s > 0) sea(g, t, s, GROUND - 14);
      g.clip(0, 0, G, GROUND, () => mascotIdle(g, t, { off: () => [0, -Math.sin(dive * Math.PI) * 6 + dive * dive * 10], sx: 1 - dive * .5, sy: 1 - dive * .5, col: tint('#b8a080', dive) }));
      g.T('ザブン', 24, 10, 5, '#bfe6ff', dive > .6 ? 1 : 0);
    } },
  { mob: 'クマノミ', name: 'イソギンチャクの おうち', how: '海の そこで イソギンチャクが ゆれて オレンジと 白の しまもように',
    draw(g, t) {
      const s = seg(t, .6, 1.0), an = seg(t, 1.0, 1.6), stripe = seg(t, 1.4, 2.1), sw = seg(t, 2.1, 2.2);
      if (sw >= 1) return mobAt(g, M.clown, t);
      if (s > 0) sea(g, t, s, GROUND - 16);
      for (let i = 0; i < 7; i++) { const h = (5 + (i % 3)) * an; if (h > 0) g.R(17 + i * 2.3 + Math.round(Math.sin(t * 3 + i) * .8), GROUND - h, 1.2, h, i % 2 ? '#f07ab0' : '#d85a98'); }
      mascotIdle(g, t, { sx: 1 - stripe * .5, sy: 1 - stripe * .5, off: () => [0, -stripe * 8], col: e => e.c === EYE ? e.c : stripe > 0 && e.x % 4 === 1 ? mix(e.c, '#ffffff', stripe) : mix(e.c, '#f08a20', stripe) });
    } },
  { mob: 'パンダの 赤ちゃん', name: 'くしゅん！', how: 'ちいさな パンダに なって くしゅん！ と くしゃみ',
    draw(g, t) {
      const sh = ease(seg(t, .9, 1.5)), sw = seg(t, 1.5, 1.6), sn = seg(t, 2.2, 2.6);
      if (sw < 1) mascotIdle(g, t, { sx: 1 - sh * .4, sy: 1 - sh * .4, col: e => e.c === EYE ? e.c : hash(e.x * 7 + e.y * 3) < sh ? (e.x >= 4 && e.x <= 7 ? '#1c1c1c' : '#f4f4f0') : e.c });
      else mobAt(g, M.bpanda, t);
      if (sn > 0 && sn < 1) { g.R(32 + sn * 6, GROUND - 7, 1.5, 1, '#9ad06a', 1 - sn); }
      g.T('くしゅん!', 32, 12, 5, '#ffffff', sn > 0 && sn < 1 ? 1 : 0);
    } },
  { mob: '緑の オウム', name: 'まねっこ おしゃべり', how: '「ハロー！」と 言うと 緑の オウムが まねをする',
    draw(g, t) {
      const say = seg(t, .8, 1.4), gr = seg(t, 1.5, 2.1), sw = ease(seg(t, 2.0, 2.4)), copy = seg(t, 2.6, 3.3);
      if (say > 0 && say < 1) bubble(g, 28, 20, 12, 1);
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 - gr * .3, sy: 1 - gr * .1, col: tint('#3ab03a', gr) });
      if (sw > 0) mobAt(g, M.gparrot, t, 22, { a: sw });
      if (copy > 0 && copy < 1) bubble(g, 28, 20, 12, 1);
      g.T('ハロー!', 34, 10, 5, '#ffffff', (say > 0 && say < 1) || (copy > 0 && copy < 1) ? 1 : 0);
    } },
  { mob: '子ブタ', name: 'ニンジンを 追いかけて', how: 'ニンジンを 見ると ちいさな ブタに なって トコトコ ついていく',
    draw(g, t) {
      const show = seg(t, .7, 1.0), sh = ease(seg(t, 1.0, 1.6)), sw = seg(t, 1.6, 1.7), run = seg(t, 1.8, 3.4);
      const cx = run > 0 ? 24 + Math.sin(run * Math.PI * 2) * 8 : 24;
      if (show > 0) carrot(g, cx + 12, GROUND - 10 + Math.sin(t * 4));
      if (sw < 1) mascotIdle(g, t, { sx: 1 - sh * .35, sy: 1 - sh * .35, col: tint('#f0a0a8', sh) });
      else mobAt(g, M.piglet, run > 0 && run < 1 ? t * 1.8 : t, cx);
      g.T('ブー', 24, 10, 5, '#ffffff', run > 0 && run < 1 ? 1 : 0);
    } },
  { mob: 'シャムネコ', name: 'ひなたぼっこ', how: 'おひさまの 光で ぽかぽか… のびをしたら シャムネコに',
    draw(g, t) {
      const sun = seg(t, .6, 1.1) * (1 - seg(t, 3.2, 3.6)), warm = seg(t, 1.1, 1.8), str = seg(t, 1.8, 2.2), sw = ease(seg(t, 2.1, 2.5));
      if (sun > 0) { g.disc(36, 23, 3, '#ffd040', sun); for (let i = 0; i < 3; i++) g.R(30 - i * 4, 25 + i * 4, 2, .8, '#ffe890', sun * .8); }
      if (sw < 1) mascotIdle(g, t, { a: 1 - sw, sx: 1 + Math.sin(str * Math.PI) * .25, sy: 1 - Math.sin(str * Math.PI) * .2, col: e => e.c === EYE ? (warm > .3 && warm < 1 ? '#e8dcc8' : e.c) : mix(e.c, '#e8dcc8', warm) });
      if (sw > 0) mobAt(g, M.siam, t, 22, { a: sw });
      g.T('ぽかぽか', 22, 10, 5, '#ffd040', warm > 0 && warm < 1 ? 1 : 0);
    } },
  { mob: '白い カエル', name: 'カエルの ちょうちん', how: '氷の上で 白い カエルに なって 小さな マグマキューブを ぱくっ → 光る ブロック',
    draw(g, t) {
      const ice = seg(t, .6, 1.0), wh = ease(seg(t, 1.0, 1.6)), mc = seg(t, 1.8, 2.3), eat = seg(t, 2.3, 2.6), lamp = seg(t, 2.7, 3.0);
      if (ice > 0) { g.R(8, GROUND - 1.5, 32, 1.5, '#cfeaff', ice); g.R(12, GROUND - 1.5, 6, .5, '#ffffff', ice); }
      if (wh < .5) mascotIdle(g, t, { col: tint('#e8e8e0', wh * 2) }); else mobAt(g, M.wfrog, t > 2.3 && t < 2.7 ? 1.0 : t, 20);
      puff(g, 22, 34, seg(t, 1.1, 1.6));
      if (mc > 0 && eat < .5) g.sprite(M.magma.sp, lerp(44, 34, ease(mc)), GROUND, { sx: .35, sy: .35 });
      if (eat > 0 && eat < 1) g.R(28, GROUND - 4.5, 6 * Math.sin(eat * Math.PI), 1, '#e86a8a');
      if (lamp > 0) { g.R(32, GROUND - 5, 5, 5, '#f8f0c0', lamp); g.R(32, GROUND - 5, 5, 1, '#fff8e0', lamp); g.R(33, GROUND - 3, 3, 1, '#e8d890', lamp); sparkle(g, 34.5, GROUND - 7, (t * 1.2) % 1, '#fff8c0'); }
      g.T('ぱくっ', 32, 12, 5, '#ff8aa8', eat > 0 && eat < 1 ? 1 : 0);
    } },
  { mob: 'ゾンビの 子ども', name: 'すばしっこい！', how: 'ちいさな ゾンビに なって ものすごい はやさで 走りまわる',
    draw(g, t) {
      const sh = ease(seg(t, .9, 1.5)), sw = seg(t, 1.5, 1.6), run = seg(t, 1.7, 3.3);
      if (sw < 1) mascotIdle(g, t, { sx: 1 - sh * .45, sy: 1 - sh * .45, col: tint('#5f9a45', sh) });
      else { const x = run > 0 && run < 1 ? 24 + Math.sin(run * Math.PI * 4) * 12 : 24; g.sprite(M.bzombie.sp, x, GROUND, { off: M.bzombie.off(run > 0 && run < 1 ? t * 2 : t) }); if (run > 0 && run < 1) for (let i = 1; i < 3; i++) g.R(x - Math.cos(run * Math.PI * 4) * i * 3 - 1, GROUND - 4 - i, 2, .6, '#c8c8c8', .7 - i * .2); }
      g.T('ダダダッ', 24, 10, 5, '#9fe08a', run > 0 && run < 1 ? 1 : 0);
    } },
  { mob: 'くらつき ストライダー', name: 'マグマの 上を おさんぽ', how: 'ストライダーに くらを のせて マグマの 上を のしのし',
    draw(g, t) {
      const lava = seg(t, .6, 1.0), mo = ease(seg(t, 1.0, 1.6)), sad = seg(t, 1.8, 2.2);
      if (lava > 0) { g.R(8, GROUND - 1, 32, 3, '#ff6a10', lava); g.R(10, GROUND - 1, 28, 1, '#ffcf3a', lava); }
      if (mo < 1) mascotIdle(g, t, { a: 1 - mo, col: tint('#a83a3a', mo) });
      if (mo > 0) mobAt(g, sad >= 1 ? M.sstrider : M.strider, t, 24 + (t > 2.4 ? Math.round(Math.sin((t - 2.4) * 2) * 3) : 0), { a: mo });
      if (sad > 0 && sad < 1) { const y = lerp(16, GROUND - 22, sad * sad); g.R(19.8, y, 8.4, 2.5, '#2a1a10'); g.R(19.8, y, 8.4, .7, '#c8a060'); }
      g.T('のしのし', 24, 10, 5, '#ffcf3a', t > 2.4 && t < 3.4 ? 1 : 0);
    } },
  { mob: 'なきむしガスト', name: 'ガストの なみだ', how: 'かなしくなって なみだが ぽろぽろ… 大きな ガストに なって なく',
    draw(g, t) {
      const sad = seg(t, .8, 1.4), up = ease(seg(t, 1.4, 2.0)), sw = ease(seg(t, 1.9, 2.4));
      if (sw < 1) g.sprite(MASCOT, 24, GROUND - up * 4 + (t < .8 ? bob(t) : 0), { a: 1 - sw, col: tint('#f0f0f0', up), off: e => e.c === EYE && sad > 0 ? [0, .6] : [0, 0] });
      if (sw > 0) mobAt(g, M.ghast, t, 24, { a: sw });
      const ex = sw > .5 ? [[19, GROUND - 23], [29, GROUND - 23]] : [[18, GROUND - 13], [28, GROUND - 13]];
      if (sad > 0) ex.forEach(([x, y], i) => { const ph = (t * 1.5 + i * .5) % 1; g.R(x, y + ph * 10, 1, 1.5, '#9ad0ff', 1 - ph); });
      g.T('しくしく', 24, 10, 5, '#9ad0ff', sad > 0 && sw < .5 ? 1 : 0);
    } },
  { mob: 'ゾンビ村人を なおす', name: '金のリンゴで もとどおり', how: 'ゾンビ村人に なったけど くすりと 金のリンゴで もとの 村人に',
    draw(g, t) {
      const z = seg(t, .8, 1.1), pot = seg(t, 1.3, 1.7), ap = seg(t, 1.8, 2.2), shake = seg(t, 2.2, 2.7), cure = seg(t, 2.7, 2.9);
      if (z < .5) mascotIdle(g, t); else if (cure < .5) mobAt(g, M.zvill, t, 24, shake > 0 && shake < 1 ? { off: () => [Math.round(Math.sin(t * 50) * .8), 0] } : {}); else villagerAt(g, t, 24, GROUND);
      puff(g, 24, 34, seg(t, .8, 1.4));
      if (pot > 0 && pot < 1) { const x = lerp(40, 26, pot), y = GROUND - 14 - Math.sin(pot * Math.PI) * 6; g.R(x - 1, y, 3, 3, '#8a8aa8'); g.R(x, y - 1.5, 1, 1.5, '#d8d8e8'); }
      if (ap > 0 && ap < 1) { const y = lerp(16, GROUND - 22, ap * ap); g.disc(30, Math.round(y), 2, '#f2c14e'); g.R(30, y - 3, .8, 1.5, '#5a3a20'); }
      if (shake > 0 && shake < 1) for (let i = 0; i < 6; i++) { const ph = (t * 1.5 + i / 6) % 1; g.R(16 + hash(i) * 16, GROUND - 2 - ph * 18, 1, 1, '#e86aa8', 1 - ph); }
      if (cure > 0) [[14, 22, 2.8], [34, 20, 3.0], [32, 34, 3.2]].forEach(([x, y, s]) => sparkle(g, x, y, seg(t, s, s + .5), '#5ff07a'));
      g.T('なおった!', 24, 10, 5, '#5ff07a', seg(t, 2.9, 3.1) - seg(t, 3.8, 4.1));
    } },
  { mob: '花を あげる アイアンゴーレム', name: 'やさしい ゴーレム', how: 'アイアンゴーレムに なって 村の 子どもに 赤い 花を プレゼント',
    draw(g, t) {
      const mo = seg(t, .9, 1.2), kid = ease(seg(t, 1.4, 2.0)), give = seg(t, 2.2, 2.6);
      if (mo < .5) mascotIdle(g, t); else mobAt(g, M.golem, t, 18, { off: e => kid >= 1 && e.x <= 1 && e.y >= 7 ? [give * 3, -give * 3] : [0, 0] });
      puff(g, 20, 34, seg(t, .9, 1.5));
      if (kid > 0) g.sprite(M.bvill.sp, lerp(46, 34, kid), GROUND, { off: M.bvill.off(kid < 1 ? t * 2 : t * .3) });
      if (give >= 1) { g.R(33.5, GROUND - 9, .8, 2.5, '#3a8a2a'); g.R(32.5, GROUND - 11, 2.6, 2.2, '#d02020'); heart(g, 33, 22 - ((t - 2.6) * 6) % 6, 1); }
      g.T('どうぞ', 26, 10, 5, '#ffffff', give > 0 && t < 3.4 ? 1 : 0);
    } },
  { mob: '毛がりした ヒツジ', name: 'チョキチョキ', how: 'もこもこの ヒツジに なって ハサミで チョキチョキ… すっきり',
    draw(g, t) {
      const mo = seg(t, .9, 1.2), cut = seg(t, 1.5, 2.4);
      if (mo < .5) mascotIdle(g, t);
      else { mobAt(g, M.shsheep, t, 24); mobAt(g, M.sheep, t, 24, { show: e => e.k === 'W' && hash(e.x * 7 + e.y * 3) >= cut }); }
      puff(g, 24, 34, seg(t, .9, 1.5));
      if (cut > 0 && cut < 1) { const x = 18 + Math.sin(t * 6) * 6, o = Math.floor(t * 10) % 2; g.R(x, 28 - o, 4, .8, '#c8c8d0'); g.R(x, 29 + o, 4, .8, '#c8c8d0'); g.R(x - 1.5, 27.5, 1.5, 1.5, '#d02020'); g.R(x - 1.5, 29.5, 1.5, 1.5, '#d02020'); }
      [[12, 2.0], [18, 2.2], [30, 2.4]].forEach(([x, s], i) => { const k = seg(t, s, s + .4); if (k > 0) { const y = lerp(30, GROUND - 4, ease(k)); g.R(x, y, 4, 4, '#f0f0f0'); g.R(x, y, 4, 1, '#ffffff'); } });
      g.T('チョキチョキ', 24, 10, 5, '#ffffff', cut > 0 && cut < 1 ? 1 : 0);
    } },
  { mob: 'ネザライトの スティーブ', name: 'かじ台で アップグレード', how: 'ダイヤの よろいが かじ台で 黒くて つよい ネザライトに',
    draw(g, t) {
      const mo = seg(t, .9, 1.2), table = seg(t, 1.3, 1.6) * (1 - seg(t, 3.0, 3.4)), up = seg(t, 1.8, 2.6);
      if (table > 0) { g.R(33, GROUND - 6, 8, 6, '#3a3a4a', table); g.R(33, GROUND - 6, 8, 1.5, '#6a5a4a', table); g.R(35, GROUND - 3, 4, 1, '#9a9aa8', table); }
      if (mo < .5) mascotIdle(g, t);
      else if (up <= 0) mobAt(g, M.dia, t, 22);
      else { const line = lerp(GROUND - 23, GROUND, up); g.clip(0, line, G, G, () => mobAt(g, M.dia, t, 22)); g.clip(0, 0, G, line, () => mobAt(g, M.netheri, t, 22)); }
      puff(g, 22, 34, seg(t, .9, 1.5));
      if (up > 0 && up < 1) { sparkle(g, 37, GROUND - 9, (t * 3) % 1, '#ffb070'); g.R(14, lerp(GROUND - 23, GROUND, up), 16, .6, '#ffb070'); }
      g.T('カーン', 36, 12, 5, '#ffffff', up > 0 && up < 1 ? 1 : 0);
    } },
  { mob: '雪がっせんの スノーゴーレム', name: 'ゆきがっせん', how: '雪玉を ぶつけられて まっしろ… スノーゴーレムに なって なげかえす',
    draw(g, t) {
      const hits = seg(t, .8, 1.8), sw = seg(t, 1.9, 2.2), thr = seg(t, 2.5, 3.1);
      if (sw < .5) mascotIdle(g, t, { col: tint('#f4f8fb', hits) }); else mobAt(g, M.snow, t, 20);
      puff(g, 22, 32, seg(t, 1.9, 2.5));
      for (let i = 0; i < 4; i++) { const k = seg(hits, i * .22, i * .22 + .25); if (k > 0 && k < 1) g.disc(lerp(44, 26, k), Math.round(GROUND - 8 - i * 2 - Math.sin(k * Math.PI) * 4), 1, '#ffffff'); }
      if (thr > 0 && thr < 1) [0, .3].forEach(d => { const k = seg(thr, d, d + .6); if (k > 0 && k < 1) g.disc(lerp(28, 46, k), Math.round(GROUND - 12 - Math.sin(k * Math.PI) * 5), 1, '#ffffff'); });
      g.T('ペシッ', 30, 12, 5, '#ffffff', hits > 0 && hits < 1 ? 1 : 0);
    } },
  { mob: 'カメの 赤ちゃん', name: 'すなはまの たまご', how: 'すなはまの たまごが ぷるぷる… かえった 赤ちゃんが 海へ むかう',
    draw(g, t) {
      const sand = seg(t, .6, 1.0), sink = ease(seg(t, 1.0, 1.5)), eggs = seg(t, 1.4, 1.7), wig = seg(t, 1.7, 2.3), sw = seg(t, 2.3, 2.4);
      if (sand > 0) { g.R(8, GROUND - 1, 22, 1.5, '#e8d8a0', sand); }
      if (sw >= 1) return mobAt(g, M.bturtles, t - 2.3);
      g.clip(0, 0, G, GROUND - 1, () => mascotIdle(g, t, { off: () => [0, sink * 18] }));
      if (eggs > 0) [16, 22, 28].forEach((x, i) => { const w = wig > 0 ? Math.round(Math.sin(t * 25 + i)) * .5 : 0; g.disc(x + w, GROUND - 3, 2, '#f4f0e0', eggs); if (wig > .6) g.R(x - 1 + w, GROUND - 4, 2, .5, '#8a7a5a'); });
      g.R(30, GROUND - 3, 11, 3, '#3a8ad0', .6 * sand); g.R(30, GROUND - 3, 11, .8, '#bfe6ff', sand);
      g.T('ぷるぷる', 24, 10, 5, '#ffffff', wig > 0 && wig < 1 ? 1 : 0);
    } },
  { mob: '弓の スケルトン', name: 'まとあて', how: 'まとが あらわれて スケルトンに なって 弓で トスッ',
    draw(g, t) {
      const tg = seg(t, .6, 1.0), mo = seg(t, 1.1, 1.4), draw = seg(t, 1.8, 2.3), fly = seg(t, 2.3, 2.6);
      if (tg > 0) { g.R(38, GROUND - 14, 4, 8, '#f0f0f0', tg); g.R(38, GROUND - 12, 4, 4, '#d02020', tg); g.R(39, GROUND - 11, 2, 2, '#f0f0f0', tg); g.R(39.5, GROUND - 6, 1, 6, '#6a4a2a', tg); }
      if (mo < .5) mascotIdle(g, t); else mobAt(g, { ...M.skel, extra: M.stray.extra }, t, 18);
      puff(g, 18, 34, seg(t, 1.1, 1.7));
      if (fly > 0 && fly < 1) { const x = lerp(14, 36, fly); g.R(x, GROUND - 10, 4, .6, '#8a5a30'); g.R(x + 4, GROUND - 10.2, 1, 1, '#c8c8d0'); }
      if (fly >= 1) { g.R(34, GROUND - 10, 4, .6, '#8a5a30'); sparkle(g, 40, GROUND - 10, seg(t, 2.6, 3.0), '#ffd84a'); }
      g.T('トスッ', 36, 18, 5, '#ffd84a', seg(t, 2.6, 2.7) - seg(t, 3.2, 3.5));
    } },
  { mob: 'シロクマの 親子', name: 'こぐまと おかあさん', how: '小さな シロクマに なったら おかあさんが むかえに きて いっしょに おさんぽ',
    draw(g, t) {
      const ice = seg(t, .6, 1.0), sh = ease(seg(t, 1.0, 1.6)), sw = seg(t, 1.6, 1.7), mom = ease(seg(t, 1.8, 2.6));
      if (ice > 0) g.R(8, GROUND - 1.5, 32, 1.5, '#cfeaff', ice);
      if (sw < 1) mascotIdle(g, t, { sx: 1 - sh * .4, sy: 1 - sh * .4, off: () => [sh * 11, 0], col: tint('#f4f4f0', sh) });
      else if (mom < 1) { g.sprite(M.polars.cub, 35, GROUND, { off: paws(8, 8)(t) }); if (mom > 0) g.sprite(M.polars.sp, lerp(-14, 20, mom), GROUND, { off: paws(8, 8)(t * 1.5) }); }
      else mobAt(g, M.polars, t);
      if (mom >= 1 && t < 3.2) heart(g, 26, 22 - ((t - 2.6) * 6) % 5, 1);
      g.T('ガオ〜', 30, 12, 5, '#ffffff', mom > .5 && mom < 1 ? 1 : 0);
    } },
];
})();

// ---------- オレンジのキャラクターが マイクラ風の すがたに変身する 20 とおり（いまの CC_EXTRA の 231〜250 番） ----------
const ORANGE_PATTERNS = (() => {
const EYE = '#1a1612';
// 文字の並びと色の表から形を作る（cs は 1マスの大きさ）
function mk(rows, pal, cs, seed = 7) {
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((k, x) => { if (k !== '.') { const p = [].concat(pal[k]); cells.push({ x, y, k, c: p[(rnd() * p.length) | 0] }); } }));
  return { w: Math.max(...rows.map(r => r.length)), h: rows.length, cells, cs };
}
// マス (x, y) の左上の場所（足もとの中心が (cx, by) のとき）
const cellAt = (sp, cx, by, x, y) => [cx + (x - sp.w / 2) * sp.cs, by - (sp.h - y) * sp.cs];

// 人の形（頭 8 段・体 6 段・足 5 段）
const LEGS = ['...PPPPPP...', '...PPdPPP...', '...PPdPPP...', '...PPdPPP...', '...KKKKKK...'];
const ALEX = mk([
  '..OOOOOOOO..', '..OOOOOOOO..', '..OSSSSSOO..', '..SWESSWEO..', '..SSSSSSSO..', '..SSSMMSSO..', '..SSSSSSOO..', '..SSSSSSOO..',
  '.GGGGGGGGGG.', '.GGGGGGGGGG.', '.SSGGGGGGSS.', '.SSGGGGGGSS.', '.SSGGGGGGSS.', '.SSBBBBBBSS.', ...LEGS,
], { O: ['#e8782a', '#d96a20', '#f08a34'], S: ['#f2c8a0', '#e8bc92'], W: '#ffffff', E: '#3fae4a', M: '#c88a70',
  G: ['#5fbf4a', '#4fa83c', '#6ccc58'], B: '#6b4a2a', P: ['#7a5230', '#6b4626'], d: '#5a3a1e', K: ['#5a5a5a', '#4a4a4a'] }, MS, 3);
const STEVE = mk([
  '..HHHHHHHH..', '..HHHHHHHH..', '..HSSSSSSH..', '..SSSSSSSS..', '..SWUSSUWS..', '..SSSNNSSS..', '..SSMSSMSS..', '..SSMMMMSS..',
  '.CCCCCCCCCC.', '.CCCCCCCCCC.', '.SSCCCCCCSS.', '.SSCCCCCCSS.', '.SSCCCCCCSS.', '.SSPPPPPPSS.', ...LEGS,
], { H: ['#3b2614', '#4a3018'], S: ['#c8946a', '#bd8a60'], W: '#ffffff', U: '#4a3a9a', N: '#9a6a48', M: '#6a4430',
  C: ['#2aa8c0', '#239aae', '#33b4cc'], P: ['#3a3fa0', '#2e3388'], d: '#22266a', K: ['#5a5a5a', '#4a4a4a'] }, MS, 5);
const SKELETON = mk([
  '..LLLLLLLL..', '..LLLLLLLL..', '..LLLLLLLL..', '..LKKLLKKL..', '..LLLDDLLL..', '..LLLLLLLL..', '..LDDDDDDL..', '..LLLLLLLL..',
  '.L..LLLL..L.', '.L..DLLD..L.', '.L..LLLL..L.', '.L..DLLD..L.', '.L..LLLL..L.', '.L...LL...L.',
  '....L..L....', '....L..L....', '....L..L....', '....L..L....', '....D..D....',
], { L: ['#c8c8c8', '#bdbdbd', '#d4d4d4'], K: '#2a2a2a', D: '#7a7a7a' }, MS, 9);
const NINJA = mk([
  '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..', '..KKKKKKKK..', '..KYYKKYYK..', '..RRRRRRRR..', '..RRRRRRRR..', '..RRRRRRRR..',
  '.RRKRRRRKRR.', '.RRRKRRKRRR.', '.RRRRKKRRRR.', '.RRRKRRKRRR.', '.RRKRRRRKRR.', '.KKRRRRRRKK.',
  '...RRRRRR...', '...RRdRRR...', '...RRdRRR...', '...RRdRRR...', '...KKKKKK...',
], { R: ['#d02a2a', '#c02424', '#dc3434'], K: '#1a1a1a', Y: '#ffd030', d: '#a01c1c' }, MS, 13);
// ブロックの人形（フィギュア）
const FIG = mk([
  '..YYYYYYYY..', '..YYYYYYYY..', '..YWKYYKWY..', '..YYYYYYYY..', '..YYYYYYYY..', '..YYMMMMYY..', '..YYYYYYYY..', '...nnnnnn...',
  '.TTTTTTTTTT.', '.TTTTTTTTTT.', 'TT.TTEETT.TT', 'TT.TEEEET.TT', 'hh.TTEETT.hh', '...BBBBBB...',
  '...BB..BB...', '...BB..BB...', '...BB..BB...', '...BB..BB...', '..BBB..BBB..',
], { Y: ['#d8a838', '#cca030'], K: '#1a1a1a', W: '#ffffff', M: '#8a5a20', n: '#c8902a', T: ['#e0c890', '#d4bc84'],
  E: ['#8a4a20', '#a05a28'], h: '#3a3a3a', B: ['#6a4a2a', '#5e4226'] }, MS, 17);
const VILL = mk([
  '..SSSSSSSS..', '..SSSSSSSS..', '..DDDDDDDD..', '..SWGSSGWS..', '..SSSNNSSS..', '..SSSNNSSS..', '..SSSNNSSS..', '..SSSNNSSS..',
  '..RRRRRRRR..', '.RRRRRRRRRR.', '.RAAAAAAAAR.', '.RAAAAAAAAR.', '.RRRRRRRRRR.',
  '..RRRdRRRR..', '..RRRdRRRR..', '..RRRdRRRR..', '..RRRdRRRR..', '..RRRdRRRR..', '..KKK..KKK..',
], { S: ['#c8946a', '#bd8a60'], D: '#4a3020', W: '#ffffff', G: '#3fae4a', N: ['#b07a54', '#a8724c'],
  R: ['#7a4a2a', '#6e4224', '#84522e'], A: ['#5e3a20', '#6a4226'], d: '#4e2e18', K: '#3a2a1a' }, MS, 19);
const ENDER = mk([
  '.BBBBBBBB.', '.BBBBBBBB.', '.BBBBBBBB.', '.BmMBBMmB.', '.BBBBBBBB.', '.BBBBBBBB.',
  ...Array(6).fill('B..BBBB..B'), ...Array(4).fill('B..B..B..B'), ...Array(4).fill('...B..B...'),
], { B: ['#141414', '#1c1a20', '#18161c'], m: '#e070ff', M: '#c040e0' }, 1.1, 23);
const GOLEM = mk([
  '....IIIIII....', '....IIIIII....', '....IRIIRI....', '....IIDDII....', '....IIDDII....', '.....IDDI.....',
  'IIIIIIIIIIIIII', 'IIIIIIIIIIIIII', 'IIIIVIIIIVIIII', 'II.IIIIIIII.II', 'II.IVIIIIII.II', 'II..IIIIII..II',
  'II..IIIIII..II', 'II..II..II..II', 'II..II..II..II', 'DD..II..II..DD', '....II..II....', '....IV..II....', '....II..II....', '....DD..DD....',
], { I: ['#d8d0c4', '#c8c0b4', '#e4ddd2', '#bfb6a8'], R: '#c02a2a', D: ['#9a9086', '#8a8076'], V: ['#4f8a3a', '#3d7a2e'] }, 1.1, 29);
const WITHER = mk([
  '......BBBBBB......', '......BBBBBB......', 'BBBB..BWBBWB..BBBB', 'WBBW..BBBBBB..WBBW', 'BBBB..BDDDDB..BBBB', 'BBBB..BBBBBB..BBBB',
  '..BBBBBBBBBBBBBB..', '........BB........', '.....BBBBBBBB.....', '........BB........', '.....BBBBBBBB.....',
  '........BB........', '.......BBB........', '.......BB.........', '........B.........',
], { B: ['#2a2a2e', '#1e1e22', '#343438'], W: '#e8f0ff', D: '#4a4a50' }, 1.2, 31);
// 動物
const CHICK = mk([
  '.WWW......', '.WKW......', 'OOWW......', '.RWWWWWWW.', '..WWWWWWWW', '..WWWWWWWW', '..WWWWWWW.', '...WWWWW..', '....Y..Y..', '...YY.YY..',
], { W: ['#ffffff', '#f0f0f0', '#e6e6e6'], K: '#1a1a1a', O: '#f0a020', R: '#d02a2a', Y: '#e0a020' }, 1.4, 37);
const PIGGY = mk([
  '.PPPPP......', '.PKPPPPPPPPP', 'NNPPPPPPPPPP', 'NNPPPPPPPPPP', '.PPPPPPPPPPP', '.PPPPPPPPPPP', '..QQ....QQ..', '..QQ....QQ..',
], { P: ['#f0a0a8', '#e8949c', '#f4acb4'], K: '#1a1a1a', N: '#d8707c', Q: ['#d88890', '#cc8088'] }, 1.5, 41);
const SHEEP = mk([
  '..WWWWWWWW..', 'FFWWWWWWWWWW', 'FKWWWWWWWWWW', 'FFWWWWWWWWWW', 'FNWWWWWWWWWW', '..WWWWWWWWW.', '..GG....GG..', '..GG....GG..',
], { W: ['#f4f4f4', '#e8e8e8', '#ffffff', '#dcdcdc'], F: ['#d8c8b0', '#cdbca2'], K: '#1a1a1a', N: '#c8a090', G: ['#d8c8b0', '#c8b8a0'] }, 1.5, 43);
const BEE = mk([
  '...ww..ww..', '..www.www..', 'YYYYKYYKYY.', 'EYYYKYYKYY.', 'YYYYKYYKYYS', 'YYYYKYYKYY.', '.L..L..L...',
], { w: ['#d0f0ff', '#e8f8ff'], Y: ['#f4c430', '#e8b420'], K: '#2a1e10', E: '#2a1e10', S: '#5a5a5a', L: '#2a1e10' }, 1.4, 47);
const SPIDER = mk([
  '.L...KKKKKK...L.', 'L.L..KKKKKK..L.L', 'L..LKKRKKRKKL..L', 'L..LKKKKKKKKL..L', 'L.L..KKKKKK..L.L', 'L.L..........L.L', 'L..............L',
], { L: ['#2a2420', '#342c26'], K: ['#2a2420', '#1e1a18', '#342c26'], R: '#e02a2a' }, 1.5, 53);
const DONKEY = mk([
  '..E.E.........', '..E.E.........', '.GGGGG........', '.GKGGG........', 'MMGGGGGGGGGGGT', 'MMGGGGGGGGGGGT',
  '...GGGGGGGGGG.', '...GGGGGGGGGG.', '...LL.....LL..', '...LL.....LL..', '...LL.....LL..',
], { E: ['#6a6a6a', '#5a5a5a'], G: ['#8a8a8a', '#7e7e7e', '#959595'], K: '#1a1a1a', M: ['#b8b0a0', '#aaa292'], T: '#4a4a4a', L: ['#6a6a6a', '#5e5e5e'] }, 1.4, 59);
// ブロック
const TNTB = mk([
  ...Array(4).fill('RRRRRRRRRRRRRR'),
  'WWWWWWWWWWWWWW', 'WKKKWKWWKWKKKW', 'WWKWWKKWKWWKWW', 'WWKWWKWKKWWKWW', 'WWKWWKWWKWWKWW', 'WWWWWWWWWWWWWW',
  ...Array(4).fill('RRRRRRRRRRRRRR'),
], { R: ['#d23a2a', '#b52a22', '#e04a34'], W: ['#f4f4f4', '#e8e8e8'], K: '#1a1a1a' }, 1.4, 61);
const PUMP = mk([
  '.....SS.....', 'OOOOOOOOOOOO', 'OOOOOOOOOOOO', 'OOFFOOOOFFOO', 'OOFFOOOOFFOO', 'OOOOOOOOOOOO',
  'OOOOOFFOOOOO', 'OOOOOOOOOOOO', 'OFFFFFFFFFFO', 'OFOFFOOFFOFO', 'OOOOOOOOOOOO', 'OOOOOOOOOOOO',
], { S: ['#4f8a3a', '#3d7a2e'], O: ['#e8892a', '#d97a20', '#f0962e', '#dc8226'], F: '#3a1a08' }, 1.6, 67);
// 道具
const PICK = mk([
  '...CCCCCC...', '.CCCCBBCCCC.', 'CCC..BB..CCC', 'CC...BB...CC', 'C....BB....C', ...Array(8).fill('.....BB.....'),
], { C: ['#4fd8e8', '#6fe8f4', '#3cc4d4'], B: ['#8a5a30', '#7a4a26'] }, 1.4, 71);
const SWORD = (() => {
  // ななめの剣：刃・ふち・つば・にぎり を マス目に書いてから形にする
  const a = Array.from({ length: 14 }, () => Array(14).fill('.'));
  const set = (x, y, k) => { if (x >= 0 && x < 14 && y >= 0 && y < 14) a[y][x] = k; };
  for (let k = 0; k <= 8; k++) { set(13 - k, k, 'C'); set(12 - k, k, 'c'); }
  for (let y = 0; y < 10; y++) for (let x = 3; x < 14; x++) if (a[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => 'Cc'.includes((a[y + dy] || [])[x + dx] || '.'))) a[y][x] = 'D';
  [[4, 9], [3, 8], [2, 7], [5, 10], [6, 11]].forEach(([x, y]) => set(x, y, 'B'));
  [[3, 10], [2, 11], [1, 12]].forEach(([x, y]) => set(x, y, 'H')); set(0, 13, 'P');
  return mk(a.map(r => r.join('')), { c: '#b8f8ff', C: ['#4fd8e8', '#3cc4d4'], D: '#1f6f80', B: '#3a4a4a', H: ['#8a5a30', '#7a4a26'], P: '#3a2a18' }, 1.4, 73);
})();

// それぞれの すがたの 待っている間の動き
const hum = cut => t => { const f = Math.floor(t * 2) % 2; return e => [0, e.y < cut && f ? -1 : 0]; }; // 体だけ ゆっくり上下
const legStep = (k, mid) => t => { const f = Math.floor(t * 4) % 2; return e => e.k === k ? [0, (e.x < mid ? f : 1 - f) ? -1 : 0] : [0, 0]; };
const SPR = {
  alex: { sp: ALEX, anim: hum(14) }, steve: { sp: STEVE, anim: hum(14) }, skeleton: { sp: SKELETON, anim: hum(14) },
  ninja: { sp: NINJA, anim: hum(14) }, fig: { sp: FIG, anim: hum(13) }, villager: { sp: VILL, anim: hum(8) }, enderman: { sp: ENDER, anim: hum(12) },
  chicken: { sp: CHICK, anim: t => { const p = (t % 1.6) > 1.2; return e => e.y <= 3 && e.x <= 3 ? [0, p ? 2 : 0] : [0, 0]; } }, // ときどき つつく
  pig: { sp: PIGGY, anim: legStep('Q', 6) }, sheep: { sp: SHEEP, anim: legStep('G', 6) }, donkey: { sp: DONKEY, anim: legStep('L', 7) },
  spider: { sp: SPIDER, anim: legStep('L', 8) },
  bee: { sp: BEE, lift: -8, float: true, anim: t => { const f = Math.floor(t * 16) % 2; return e => e.k === 'w' ? [0, f ? 1 : 0] : [0, 0]; } }, // はねを パタパタ
  golem: { sp: GOLEM, anim: t => { const f = Math.floor(t * 1.5) % 2; return e => (e.x <= 1 || e.x >= 12) && e.y >= 9 ? [0, f ? -1 : 0] : [0, 0]; } },
  wither: { sp: WITHER, lift: -3, float: true },
  tnt: { sp: TNTB },
  pumpkin: { sp: PUMP, col: t => e => e.k === 'F' ? mix('#ff9a20', '#ffe890', .5 + .5 * Math.sin(t * 13)) : e.c }, // 中のあかりが ゆらゆら
  sword: { sp: SWORD, lift: -4, float: true }, pick: { sp: PICK, lift: -4, float: true },
};
function pose(key, g, t, o = {}) {
  const d = SPR[key], fl = d.float ? Math.round(Math.sin(t * 3) * 1.5) : 0;
  g.sprite(d.sp, o.cx ?? 24, (o.by ?? GROUND) + (d.lift || 0) + fl, { off: d.anim && d.anim(t), col: d.col && d.col(t), ...o });
}
function sparkles(g, t, st, c = '#fff') { [[10, 14, 0], [38, 12, .2], [36, 30, .4], [12, 30, .6]].forEach(([x, y, d]) => sparkle(g, x, y, seg(t, st + d, st + d + .5), c)); }
function poof(g, cx, cy, k, r = 4) {
  if (k <= 0 || k >= 1) return;
  [[0, 0], [-6, 3], [6, 3], [-3, -5], [4, -4]].forEach(([dx, dy], i) =>
    g.disc(cx + dx * (1 + k * .4), cy + dy - k * 3, Math.round(2 + Math.sin(k * Math.PI) * r), i % 2 ? '#cfcfd8' : '#9a98a8', 1 - k));
}
// たまご（上の半分・下の半分を べつべつに動かせる）
function egg(g, cx, by, o = {}) {
  for (let yy = 0; yy < 14; yy++) {
    const p = (yy < 7 ? o.top : o.bot) || {};
    const ry = (yy - 6.5) / 7, w = Math.max(1, Math.round(5.5 * Math.sqrt(1 - ry * ry) * (yy < 6 ? .85 : 1)));
    const sh = Math.round((o.wob || 0) * (13 - yy) / 13 * 2) + (p.dx || 0), y = by - 14 + yy + (p.dy || 0), a = p.a ?? 1;
    g.R(cx - w + sh, y, w * 2, 1, '#f4efe2', a); g.R(cx + w - 2 + sh, y, 2, 1, '#d8cfb8', a);
  }
}
// まるいカプセルの 上半分・下半分
function halfDisc(g, cx, cy, r, top, c, a = 1) {
  for (let y = top ? -r : 0; y < (top ? 0 : r); y++) { const yy = y + .5, w = Math.floor(Math.sqrt(r * r - yy * yy) + .3); g.R(cx - w, cy + y, w * 2, 1, c, a); }
}
function ironBlock(g, x, y) { g.R(x, y, 6, 6, '#d8d0c4'); g.R(x, y, 6, 1, '#f0ebe2'); g.R(x, y + 5, 6, 1, '#a89e92'); g.R(x + 5, y, 1, 6, '#b4aa9e'); g.R(x + 1, y + 2, 3, 1, '#c0b8ac'); }
function diamond(g, x, y, a = 1) { g.R(x + 1, y, 2, 1, '#b8f8ff', a); g.R(x, y + 1, 4, 2, '#4fd8e8', a); g.R(x + 1, y + 3, 2, 1, '#2fa8b8', a); }

return [
  { mob: 'アレックス', name: 'オレンジつながり', how: 'オレンジの髪が のびて 緑の服の 女の子に',
    draw(g, t) {
      const k = seg(t, 1.0, 2.6);
      if (k < 1) mascotIdle(g, t, { a: 1 - ease(seg(t, 1.6, 2.6)) });
      // 上（髪）から下へ じゅんに 色がついていく
      if (k > 0) pose('alex', g, t, { show: e => e.y / ALEX.h < k, col: e => { const s = 1.0 + e.y / ALEX.h * 1.6; return mix('#d97757', e.c, seg(t, s, s + .4)); } });
      if (k > .1 && k < 1) g.T('ニョキ', 40, 8, 5, '#ffb04a');
      sparkles(g, t, 2.6, '#ffb04a');
    } },
  { mob: 'スティーブ', name: '青い服に お着がえ', how: '体が 服みたいに ぬげて 下から スティーブ',
    draw(g, t) {
      const off = ease(seg(t, 1.0, 1.8)), sin = seg(t, 1.1, 1.8);
      if (sin > 0) pose('steve', g, t, { a: sin, sy: lerp(.6, 1, ease(sin)) });
      if (off < 1) g.sprite(MASCOT, 24 + off * 14, GROUND + (t < 1 ? bob(t) : 0) - off * 44, { sx: 1 + off * .3, a: 1 - off * .3 });
      g.T('ぬぎっ', 12, 8, 5, '#ffffff', seg(t, 1.0, 1.1) - seg(t, 1.7, 2.0));
      sparkles(g, t, 2.0, '#7dd8ff');
    } },
  { mob: 'ニワトリ', name: 'たまごが パカッ', how: '跳ねて たまごになり ゆれて 割れたら ニワトリ',
    draw(g, t) {
      if (t < 1.2) { const j = seg(t, .8, 1.2), s = lerp(1, .6, j); g.sprite(MASCOT, 24, GROUND - Math.sin(j * Math.PI) * 8 + (t < .8 ? bob(t) : 0), { sx: s, sy: s }); }
      const c = seg(t, 2.4, 2.8);
      if (c > 0) { const s = lerp(.3, 1, ease(c)); pose('chicken', g, t, { sx: s, sy: s }); }
      if (t >= 1.2 && t < 2.9) {
        const wob = t > 1.4 && t < 2.2 ? Math.sin(t * 16) : 0, op = ease(seg(t, 2.4, 2.9));
        egg(g, 24, GROUND, { wob, top: { dx: -op * 10, dy: -op * 14, a: 1 - op }, bot: { a: 1 - op } });
        if (t >= 2.0 && t < 2.4) for (let i = -5; i < 5; i++) g.R(24 + i, GROUND - 7 + (i % 2 ? 0 : -1), 1, 1, '#8a7a60');
        if (wob) g.T('ゆら ゆら', 24, 10, 5, '#ffffff');
      }
      poof(g, 24, GROUND - 6, seg(t, 1.15, 1.5));
      g.T('パカッ', 38, 14, 6, '#ffd84a', seg(t, 2.4, 2.5) - seg(t, 3.0, 3.3));
      g.T('コッコッ', 36, 22, 5, '#ffffff', seg(t, 3.4, 3.6));
    } },
  { mob: 'ブタ', name: 'どろんこ ダイブ', how: '泥の水たまりに とびこむと ピンクの ブタに',
    draw(g, t) {
      const pud = seg(t, .5, .9) * (1 - seg(t, 3.4, 3.9));
      if (pud > 0) [[-1, 10, '#6e4a28'], [0, 14, '#5a3a1e'], [1, 10, '#4e3018']].forEach(([y, w, c]) => g.R(24 - w * pud, GROUND + 1 + y, w * pud * 2, 1, c));
      const j = seg(t, 1.0, 1.6);
      if (j < 1) g.clip(0, 0, G, GROUND, () => g.sprite(MASCOT, 24, GROUND + (t < 1 ? bob(t) : 0) - Math.sin(j * Math.PI) * 14 + Math.max(0, j - .5) * 36));
      const sp = seg(t, 1.6, 2.2);
      if (sp > 0 && sp < 1) for (let i = 0; i < 10; i++) { const an = Math.PI * (1.05 + .9 * i / 9), d = sp * (8 + hash(i) * 8); g.R(24 + Math.cos(an) * d, GROUND - 1 + Math.sin(an) * d + sp * sp * 12, 2, 2, i % 2 ? '#6e4a28' : '#8a6038', 1 - sp); }
      const rise = ease(seg(t, 2.2, 2.9));
      if (rise > 0) g.clip(0, 0, G, GROUND, () => pose('pig', g, t, { by: GROUND + (1 - rise) * 14, col: e => mix('#6e4a28', e.c, seg(t, 2.6, 3.4)) }));
      g.T('バシャッ', 24, 10, 6, '#c8a070', sp > 0 ? 1 - sp : 0);
      g.T('ぶひっ', 38, 18, 5, '#ffb8c0', seg(t, 3.3, 3.5));
    } },
  { mob: 'ヒツジ', name: '毛が もこもこ', how: '白い毛が ポコポコ増えて まるい ヒツジに',
    draw(g, t) {
      const k = seg(t, 1.0, 2.6), cs = SHEEP.cs;
      if (k < 1) mascotIdle(g, t, { a: 1 - seg(t, 1.8, 2.6) });
      if (t < 2.8) {
        for (const e of SHEEP.cells) {
          const st = 1.0 + hash(e.x * 7 + e.y * 13) * 1.6, a = seg(t, st, st + .2);
          if (a <= 0) continue;
          const s = cs * (1 + .8 * Math.sin(a * Math.PI)), x = 24 + (e.x - SHEEP.w / 2) * cs, y = GROUND - (SHEEP.h - e.y) * cs;
          g.R(x + cs / 2 - s / 2, y + cs / 2 - s / 2, s, s, e.c);
        }
      } else pose('sheep', g, t);
      g.T('もこ もこ', 24, 10, 5, '#ffffff', seg(t, 1.1, 1.3) - seg(t, 2.4, 2.7));
      g.T('メェ〜', 38, 20, 5, '#ffffff', seg(t, 3.2, 3.4));
    } },
  { mob: 'ミツバチ', name: '花から ブーン', how: '花の中に もぐると しましまの ハチが とびだす',
    draw(g, t) {
      const fx = 32, st = seg(t, .4, .8), pet = seg(t, .8, 1.0), sh = t > 1.6 && t < 2.0 ? (Math.floor(t * 20) % 2 ? 1 : -1) : 0;
      const w = seg(t, .8, 1.2), sk = ease(seg(t, 1.2, 1.6));
      if (sk < 1) g.sprite(MASCOT, lerp(lerp(24, 28, w), fx, sk), lerp(GROUND, GROUND - 11, sk) + (w > 0 && w < 1 ? walkFrame(t) : t < .8 ? bob(t) : 0), { sx: 1 - sk * .9, sy: 1 - sk * .9 });
      g.shake(sh, 0, () => {
        if (st > 0) g.R(fx, GROUND - 10 * st, 1, 10 * st, '#3f8f3a');
        if (st > .6) g.R(fx + 1, GROUND - 5, 2, 1, '#4fa83c');
        if (pet > 0) { [[-3, 0], [3, 0], [0, -3], [0, 3]].forEach(([dx, dy]) => g.R(fx - 1 + dx * pet, GROUND - 13 + dy * pet, 3, 3, '#ff8ab0')); g.R(fx - 1, GROUND - 13, 3, 3, '#ffe07a'); }
      });
      const fl = seg(t, 2.0, 3.2);
      if (fl > 0) pose('bee', g, t, { cx: lerp(fx, 22, ease(fl)) + Math.sin(fl * Math.PI * 3) * 6, by: GROUND + lerp(4, 0, fl) + Math.cos(fl * Math.PI * 3) * 3 });
      g.T('ブーン', 14, 10, 5, '#ffe07a', seg(t, 2.0, 2.2) - seg(t, 3.4, 3.8));
    } },
  { mob: 'エンダーマン', name: 'テレポート', how: 'むらさきの つぶに つつまれて 消え 背の高い すがたで あらわれる',
    draw(g, t) {
      const parts = (cx, cy, k, n) => { if (k <= 0 || k >= 1) return; for (let i = 0; i < n; i++) { const ph = (k * 1.5 + hash(i + 9)) % 1; g.R(cx + (hash(i) - .5) * 18, cy + 8 - ph * 26, 1, 1, i % 2 ? '#c06cff' : '#e0a8ff', 1 - ph); } };
      parts(24, GROUND - 10, seg(t, .8, 1.9), 14);
      if (t < 1.2 || (t < 1.7 && Math.sin(t * 50) > 0)) mascotIdle(g, t);
      if (t > 1.7 && t < 1.85) g.disc(24, GROUND - 8, 3, '#e0a8ff', .8);
      parts(30, GROUND - 18, seg(t, 1.8, 3.2), 18);
      if (t > 2.0 && (t > 2.4 || Math.sin(t * 50) > 0)) pose('enderman', g, t, { cx: 30 });
      g.T('シュン', 12, 8, 5, '#e0a8ff', seg(t, 1.7, 1.8) - seg(t, 2.2, 2.5));
    } },
  { mob: 'スケルトン', name: 'ほねほね 透視', how: '体が すけて 中の 骨だけ のこり 弓を かまえる',
    draw(g, t) {
      const x = seg(t, 1.0, 2.2), box = seg(t, .9, 1.1) - seg(t, 2.3, 2.6);
      if (box > 0) { g.R(12, 14, 24, GROUND - 14, '#123a2c', box * .8); g.R(12, 15 + ((t * 30) % (GROUND - 16)), 24, 1, '#7dffc0', box * .6); }
      const ma = t < 2.2 ? 1 - x * .85 : .15 * (1 - seg(t, 2.2, 2.4));
      if (ma > 0) mascotIdle(g, t, { a: ma });
      if (x > 0) pose('skeleton', g, t, { a: x, col: e => mix(e.c, '#9fffd0', .5 * (1 - seg(t, 2.2, 2.6))) });
      const bw = seg(t, 2.6, 2.9);
      if (bw > 0) { // 右手に 弓
        const [bx, by] = cellAt(SKELETON, 24, GROUND, 12, 12), c = '#8a5a30';
        g.R(bx, by - 4, 1, 9, c, bw); g.R(bx - 1, by - 5, 1, 1, c, bw); g.R(bx - 1, by + 5, 1, 1, c, bw); g.R(bx - 1.4, by - 4, .4, 9, '#e8e8e8', bw);
      }
      g.T('スケスケ', 24, 8, 5, '#9fffd0', box);
      g.T('カチャ', 40, 12, 5, '#ffffff', seg(t, 2.6, 2.8) - seg(t, 3.4, 3.8));
    } },
  { mob: 'クモ', name: '足が にょきにょき', how: 'ひくく 黒くなって 足が 8本 のびる',
    draw(g, t) {
      const sq = ease(seg(t, 1.0, 1.8));
      if (t < 1.8) mascotIdle(g, t, { sy: lerp(1, .6, sq), sx: lerp(1, 1.1, sq), col: e => e.c === EYE ? mix(e.c, '#ff2a2a', sq) : mix(e.c, '#2a2420', sq) });
      else {
        const lk = seg(t, 1.8, 2.6) * 1.1;
        pose('spider', g, t, { show: e => e.k !== 'L' || Math.abs(e.x - 7.5) / 8 < lk, col: e => e.k === 'R' && t > 2.6 ? mix('#e02a2a', '#ffa0a0', .5 + .5 * Math.sin(t * 10)) : e.c });
      }
      g.T('にょき にょき', 24, 16, 5, '#ffffff', seg(t, 1.8, 2.0) - seg(t, 2.6, 2.9));
    } },
  { mob: 'アイアンゴーレム', name: '鉄ブロック 組み立て', how: '鉄ブロック4つと カボチャが 落ちてきて T の字に くみあがる',
    draw(g, t) {
      const gone = seg(t, .8, 1.1);
      if (gone < 1) mascotIdle(g, t, { sx: 1 - gone, sy: 1 - gone });
      poof(g, 24, GROUND - 6, seg(t, .9, 1.4));
      const blocks = [[21, 36, 1.2], [15, 30, 1.45], [21, 30, 1.7], [27, 30, 1.95], [21, 24, 2.2, 1]];
      if (t < 2.75) blocks.forEach(([x, y, st, pk]) => {
        const k = seg(t, st, st + .25); if (k <= 0) return;
        const yy = lerp(-8, y, k * k);
        if (pk) { g.R(x, yy, 6, 6, '#e8892a'); g.R(x + 1, yy + 1, 1, 2, '#3a1a08'); g.R(x + 4, yy + 1, 1, 2, '#3a1a08'); g.R(x + 1, yy + 4, 4, 1, '#3a1a08'); g.R(x + 2.5, yy - 1, 1, 1, '#4f8a3a'); }
        else ironBlock(g, x, yy);
        if (k >= 1) g.T('ドン', x + 3, y - 3, 4, '#ffffff', 1 - seg(t, st + .25, st + .55));
      });
      const fl = seg(t, 2.6, 3.0);
      if (t >= 2.75) pose('golem', g, t);
      if (fl > 0 && fl < 1) g.disc(24, GROUND - 12, Math.round(4 + fl * 14), '#ffffff', (1 - fl) * .9);
    } },
  { mob: 'ウィザー', name: '頭が 3つ', how: '黒いけむりの中で 頭がふえて 3つになる',
    draw(g, t) {
      const dk = seg(t, 1.0, 1.6), sm = seg(t, 1.0, 2.8);
      g.R(0, 0, G, GROUND, '#000000', dk * .5 * (1 - seg(t, 3.6, 4.4)));
      if (sm > 0 && sm < 1) for (let i = 0; i < 7; i++) g.disc(24 + Math.cos(i + t * 2) * 12, GROUND - 14 + Math.sin(i * 2 + t * 3) * 8, Math.round(2 + Math.sin(sm * Math.PI) * 4), i % 2 ? '#3a3a40' : '#222228', .7 * (1 - sm));
      if (t < 2.0) mascotIdle(g, t, { a: 1 - seg(t, 1.6, 2.0), col: e => e.c === EYE ? e.c : mix(e.c, '#2a2a2e', dk) });
      if (t > 1.5) pose('wither', g, t, { show: e => {
        if (e.y >= 6) return t > 1.8 + (e.y - 6) * .06;   // 体は 上から じゅんに
        if (e.x >= 6 && e.x <= 11) return true;           // まん中の頭
        return t > 1.9 + (Math.abs(e.x - 8.5) - 5) * .08; // 左右の頭が 内がわから ふえる
      }, col: e => e.k === 'W' ? mix('#e8f0ff', '#8ab8ff', .5 + .5 * Math.sin(t * 8)) : e.c, a: seg(t, 1.5, 1.8) });
      g.T('ゴゴゴ', 40, 30, 5, '#b8b8c8', seg(t, 1.2, 1.4) - seg(t, 2.6, 2.9));
    } },
  { mob: '村人', name: '鼻が のびーる', how: '鼻が にゅっと のびて 茶色い ローブの 村人に',
    draw(g, t) {
      const fd = seg(t, 1.0, 1.6), ns = ease(seg(t, 1.7, 2.3)), rb = seg(t, 2.2, 2.9);
      if (fd < 1) mascotIdle(g, t, { a: 1 - fd });
      if (fd > 0) {
        pose('villager', g, t, { show: e => e.y < 8 && e.k !== 'N', a: fd });
        if (ns > 0) pose('villager', g, t, { show: e => e.k === 'N' && e.y <= 4 + ns * 3.99 });
        if (rb > 0) pose('villager', g, t, { show: e => e.y >= 8 && e.y < 8 + rb * 11 });
      }
      g.T('にゅっ', 38, 14, 5, '#ffffff', seg(t, 1.7, 1.8) - seg(t, 2.3, 2.6));
      g.T('ハァン', 38, 10, 5, '#ffe8b0', seg(t, 3.0, 3.2));
    } },
  { mob: 'TNT', name: '赤い箱に 変身', how: '四角くなって TNTに… 導火線が シューッ',
    draw(g, t) {
      const m = ease(seg(t, 1.0, 1.8)), x = seg(t, 1.8, 2.2), side = TNTB.w * TNTB.cs, top = GROUND - TNTB.h * TNTB.cs;
      if (x < 1) mascotIdle(g, t, { a: 1 - x, sx: lerp(1, side / 24, m), sy: lerp(1, side / 16, m), col: e => e.c === EYE ? e.c : mix(e.c, '#d23a2a', m) });
      if (x > 0) {
        const bl = t > 2.6 && Math.sin(t * (8 + seg(t, 2.6, 3.6) * 30)) > 0; // だんだん はやく チカチカ
        pose('tnt', g, t, { a: x, col: e => bl ? mix(e.c, '#ffffff', .7) : e.c });
        if (t > 2.2) { g.R(24, top - 3, 1, 3, '#3a3a3a'); if (Math.floor(t * 12) % 2) g.R(23, top - 5, 3, 2, '#ffd84a'); else g.R(24, top - 5, 1, 2, '#ffffff'); }
        g.T('シューッ', 38, 10, 5, '#ffd84a', seg(t, 2.4, 2.6));
      }
    } },
  { mob: 'ジャック・オ・ランタン', name: 'くりぬき カボチャ', how: '四角い カボチャになり 顔が くりぬかれて 光る',
    draw(g, t) {
      const lt = seg(t, 2.9, 3.3), m = ease(seg(t, 1.0, 1.8)), x = seg(t, 1.6, 2.0), side = PUMP.w * PUMP.cs;
      g.R(0, 0, G, GROUND, '#000000', lt * .45);
      if (x < 1) mascotIdle(g, t, { a: 1 - x, sx: lerp(1, side / 24, m), sy: lerp(1, side / 16, m), col: e => e.c === EYE ? mix(EYE, '#e8892a', m) : e.c });
      if (lt > 0) g.disc(24, GROUND - 10, 13, '#ffb020', lt * (.12 + .06 * Math.sin(t * 13)));
      if (x > 0) pose('pumpkin', g, t, { a: x, col: e => {
        if (e.k !== 'F') return e.c;
        if (lt > 0) return mix('#3a1a08', mix('#ff9a20', '#ffe890', .5 + .5 * Math.sin(t * 13)), lt);
        return hash(e.x * 5 + e.y * 11) < seg(t, 2.1, 2.8) ? '#3a1a08' : '#e8892a'; // ザクザク くりぬく
      } });
      g.T('ザク ザク', 24, 8, 5, '#ffffff', seg(t, 2.1, 2.2) - seg(t, 2.7, 2.9));
    } },
  { mob: 'ロバ', name: '耳が ぴょこん', how: '耳が 上にのびて 灰色の ロバに… パカパカ',
    draw(g, t) {
      const e = ease(seg(t, 1.0, 1.4)), gr = seg(t, 1.3, 1.9), x = seg(t, 2.0, 2.4);
      if (x < 1) {
        const ec = mix('#d97757', '#6a6a6a', gr), top = GROUND - 16 + bob(t);
        g.R(18, top - e * 8, 2, e * 8, ec, 1 - x); g.R(28, top - e * 8, 2, e * 8, ec, 1 - x);
        mascotIdle(g, t, { a: 1 - x, col: c => c.c === EYE ? EYE : mix(c.c, '#8a8a8a', gr) });
      }
      if (x > 0) pose('donkey', g, t, { a: x, cx: 24 + (t > 2.4 ? Math.sin((t - 2.4) * 1.4) * 6 : 0) });
      g.T('ぴょこん', 38, 8, 5, '#ffffff', seg(t, 1.2, 1.3) - seg(t, 1.8, 2.0));
      g.T('パカ パカ', 24, 8, 5, '#d8d0c0', seg(t, 2.8, 3.0));
    } },
  { mob: 'ダイヤの剣', name: '作業台で クラフト', how: 'マス目に とびこんで ダイヤの剣が できあがる',
    draw(g, t) {
      // 作業台の画面（左上の小さい案内役でも 見えるように 下のほうに出す）
      const pa = seg(t, .6, .9) - seg(t, 2.6, 3.0);
      if (pa > 0) {
        g.R(8, 20, 34, 19, '#c6c6c6', pa); g.R(8, 20, 34, 1, '#ffffff', pa); g.R(8, 38, 34, 1, '#555555', pa);
        const slot = (x, y) => { g.R(x, y, 4, 4, '#8b8b8b', pa); g.R(x, y, 4, .6, '#373737', pa); g.R(x, y, .6, 4, '#373737', pa); };
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) slot(11 + i * 5, 22 + j * 5);
        g.R(27, 28, 2, 1, '#8b8b8b', pa); g.R(29, 27, 1, 3, '#8b8b8b', pa); g.R(30, 28, 1, 1, '#8b8b8b', pa);
        slot(33, 27);
        // まん中の列に ダイヤ・ダイヤ・棒（剣の つくりかた）
        if (t > 1.5) diamond(g, 16, 27, pa);
        if (t > 1.7) diamond(g, 16, 22, pa);
        if (t > 1.9) for (let i = 0; i < 3; i++) g.R(18.5 - i, 32.5 + i, 1, 1, '#8a5a30', pa);
        if (t > 2.2 && t < 2.6) g.sprite(SWORD, 35, 31, { sx: .2, sy: .2 });
      }
      const j = ease(seg(t, 1.0, 1.5));
      if (t < 1.5) g.sprite(MASCOT, lerp(24, 18, j), lerp(GROUND + (t < 1 ? bob(t) : 0), 31, j) - Math.sin(j * Math.PI) * 8, { sx: lerp(1, .2, j), sy: lerp(1, .2, j) });
      const f = ease(seg(t, 2.6, 3.2));
      if (t >= 2.6 && t < 3.2) g.sprite(SWORD, lerp(35, 24, f), lerp(31, GROUND - 4, f), { sx: lerp(.2, 1, f), sy: lerp(.2, 1, f) });
      if (t >= 3.2) pose('sword', g, t);
      g.T('カチャ', 37, 30, 5, '#ffffff', seg(t, 2.2, 2.3) - seg(t, 2.6, 2.8));
      sparkles(g, t, 3.2, '#b8f8ff');
    } },
  { mob: 'つるはし', name: '地面を ほって', how: 'カンカン ほった 穴から つるはしが とびだす',
    draw(g, t) {
      const w = Math.round(seg(t, 1.0, 1.6) * 8 * (1 - seg(t, 3.2, 3.6)));
      if (w > 0) { g.R(24 - w, GROUND, w * 2, 3, '#1a1008'); g.R(24 - w + 1, GROUND + 3, w * 2 - 2, 1, '#1a1008'); }
      const tap = t > .8 && t < 1.6, ph = ((t - .8) * 5) % 1, dn = tap && ph < .3, s = ease(seg(t, 1.6, 2.0));
      if (s < 1) g.clip(0, 0, G, GROUND, () => g.sprite(MASCOT, 24, GROUND + s * 18 + (t < .8 ? bob(t) : 0), { sy: dn ? .85 : 1, sx: dn ? 1.1 : 1 }));
      if (tap) for (let i = 0; i < 3; i++) g.R(24 + (i - 1) * (6 + ph * 8), GROUND - 1 - Math.sin(ph * Math.PI) * 6, 1, 1, '#7a5230', 1 - ph);
      if (tap) g.T('カン', Math.floor((t - .8) * 5) % 2 ? 38 : 10, 18, 5, '#ffffff', ph < .6 ? 1 : 0);
      const p = seg(t, 2.3, 3.0);
      if (p > 0 && p < 1) { const k = 1 - (1 - p) * (1 - p); g.clip(0, 0, G, GROUND + 3, () => g.sprite(PICK, 24, lerp(GROUND + 26, GROUND - 4, k) - Math.sin(p * Math.PI) * 10, { sx: Math.max(.1, Math.abs(Math.cos(p * Math.PI * 3))) })); }
      if (p >= 1) pose('pick', g, t);
      g.T('ポーン', 38, 10, 5, '#b8f8ff', seg(t, 2.4, 2.5) - seg(t, 3.0, 3.3));
      sparkles(g, t, 3.0, '#b8f8ff');
    } },
  { mob: 'フィギュア', name: 'ガチャガチャ', how: 'カプセルに入って コロンと ころがり 開けたら フィギュア',
    draw(g, t) {
      const cy = GROUND - 11, come = ease(seg(t, 1.0, 1.4)), op = ease(seg(t, 2.4, 2.9)), m = seg(t, 2.45, 2.9);
      const cx = 24 + (t > 1.5 ? Math.sin((t - 1.5) * 8) * 5 * (1 - seg(t, 2.0, 2.4)) : 0);
      if (t < 2.45) { const s = lerp(1, .7, seg(t, 1.0, 1.4)); g.sprite(MASCOT, cx, t < 1 ? GROUND + bob(t) : GROUND - 4, { sx: s, sy: s }); }
      if (m > 0) { const s = ease(m) + Math.sin(m * Math.PI) * .15; pose('fig', g, t, { sx: s, sy: s }); }
      if (t > 1.0) {
        halfDisc(g, cx, cy, 11, false, '#ffffff', .35 * come * (1 - seg(t, 2.6, 3.0)));        // 下は すきとおっている
        halfDisc(g, cx, cy + lerp(-40, 0, come) - op * 30, 11, true, '#e04a6a', 1 - op);      // 上は 赤い ふた
        if (op <= 0) g.R(cx - 11, cy, 22, 1, '#8a2a40');
      }
      g.T('コロン', 38, 8, 5, '#ffffff', seg(t, 1.5, 1.6) - seg(t, 2.2, 2.4));
      g.T('ジャーン', 24, 6, 6, '#ffd84a', seg(t, 2.6, 2.8));
    } },
  { mob: '赤い にんじゃ', name: 'しゅっと 手裏剣', how: 'くるっと 回って 赤い にんじゃ… 手裏剣を シュッ',
    draw(g, t) {
      const s = seg(t, 1.0, 2.0), sx = s > 0 && s < 1 ? Math.max(.08, Math.abs(Math.cos(s * Math.PI * 6))) : 1;
      if (s < .5) mascotIdle(g, t, { sx });
      else pose('ninja', g, t, { sx, col: e => e.k === 'Y' && s >= 1 ? mix('#ffd030', '#ffffff', .5 + .5 * Math.sin(t * 10)) : e.c });
      if (s > 0 && s < 1) for (let i = 0; i < 3; i++) { g.R(8, 22 + i * 6, 5, 1, '#ffffff', .4); g.R(35, 25 + i * 6, 5, 1, '#ffffff', .4); }
      const k = seg(t, 2.4, 2.9);
      if (k > 0 && k < 1) { // 回りながら とんでいく 手裏剣
        const x = lerp(31, 50, k), y = lerp(33, 24, k), c = '#c8c8d0';
        g.R(x, y, 1, 1, '#ffffff');
        if (Math.floor(t * 20) % 2) { g.R(x - 2, y, 2, 1, c); g.R(x + 1, y, 2, 1, c); g.R(x, y - 2, 1, 2, c); g.R(x, y + 1, 1, 2, c); }
        else [[-1, -1], [1, -1], [-1, 1], [1, 1], [-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([dx, dy]) => g.R(x + dx, y + dy, 1, 1, c));
      }
      g.T('シュッ', 38, 14, 5, '#ffffff', seg(t, 2.4, 2.5) - seg(t, 3.0, 3.3));
    } },
  { mob: 'みんな', name: 'つぎつぎ チェンジ', how: 'いろんな すがたに どんどん変わって 最後は もどって ドヤ！',
    draw(g, t) {
      const list = ['villager', 'sheep', 'skeleton', 'chicken', 'pig', 'steve', 'alex', 'enderman', 'spider', 'bee',
        'golem', 'ninja', 'fig', 'donkey', 'tnt', 'pumpkin', 'wither', 'sword', 'pick'];
      const STEP = .14, t0 = .8, i = Math.floor((t - t0) / STEP), end = t0 + list.length * STEP;
      if (t < t0 || i >= list.length) mascotIdle(g, t); else pose(list[i], g, t);
      if (t >= t0 && t < end + STEP) poof(g, 24, GROUND - 8, ((t - t0) % STEP) / STEP * 2.5, 1.5); // 入れかわるたびに 小さく ポン
      g.T('ドヤ！', 24, 10, 7, '#ffd84a', seg(t, end + .1, end + .3));
      sparkles(g, t, end + .1, '#ffd84a');
    } },
];
})();

// ---------- オレンジのキャラクターが マイクラのぬいぐるみ風の すがたに変身する 2回目の 20 とおり（いまの CC_EXTRA の 251〜270 番） ----------
//   体の形（8×6 の体・小さなうで・4本の足）は そのままで、色・顔・耳やはねを かえて変身する。ピカッと金色に光ってから変わる
const [ORANGE2_PATTERNS, ORANGE3_PATTERNS, ORANGE4_PATTERNS] = (() => {
// 1マス＝2 の格子で描く。格子の (3, 8) が キャラクターの左上（見本の画面の (12, 26)）
const OX = 3, OY = 8;
const grid = (g, flash) => (x, y, w, h, c, a = 1) => g.R(12 + (x - OX) * 2, 26 + (y - OY) * 2, w * 2, h * 2, flash ? '#ffd84a' : c, a);
const STILL = { hop: 0, up: [false, false, false, false] };
// 歩き：もとのキャラクターと同じ 4コマ
function walk(u, sp = 1) { const f = Math.floor(u * 6 * sp) % 4; return { hop: f % 2 ? -1 : 0, up: [f === 1, f === 3, f === 3, f === 1] }; }
function legs(R, c, w, len = 2, y = OY + 6, xs = [2, 4, 7, 9]) { xs.forEach((x, i) => R(OX + x, y, 1, w.up[i] ? len - 1 : len, c)); }
function eyes(R, y, u, c = '#1a1612', xs = [3, 8]) { const b = (u % 3) > 2.85; xs.forEach(x => R(OX + x, y + (b ? .6 : 0), 1, b ? .4 : 1, c)); }
function creeperFace(R, y) {
  const k = '#111';
  R(OX + 3, y + 1, 2, 1, k); R(OX + 7, y + 1, 2, 1, k);
  R(OX + 5, y + 2, 2, 2, k); R(OX + 4, y + 3, 1, 2, k); R(OX + 7, y + 3, 1, 2, k);
}
const q4 = v => Math.round(v * 4) / 4;

// それぞれの すがた（u は 変身してからの時間・秒）
const FORMS = [
  { mob: 'クリーパー', name: 'シューッと ふくらむ', how: '緑の体に 黒い顔。白く光って ぷくっと ふくらむ', say: 'シュー…',
    form(R, u) {
      const w = walk(u, .8), boom = u > 1.0 && u < 1.6, flash = boom && Math.floor(u * 10) % 2;
      const c = flash ? '#f4fff0' : '#5cb848', d = '#3e8a30';
      legs(R, c, w); const y = OY + w.hop;
      if (boom) R(OX + 1.5, y - .5, 9, 7, c); else R(OX + 2, y, 8, 6, c);
      if (!flash) { R(OX + 2, y + 5, 1, 1, d); R(OX + 9, y, 1, 1, d); R(OX + 8, y + 4, 1, 1, d); }
      creeperFace(R, y);
    } },
  { mob: 'ダイヤクリーパー', name: 'キラキラ クリーパー', how: '水色の クリーパー。体の上を キラッと 光が 流れる', say: 'キラッ',
    form(R, u) {
      const w = walk(u, .8), c = '#6fd3f0'; legs(R, c, w); const y = OY + w.hop;
      R(OX + 2, y, 8, 6, c); R(OX + 2, y + 5, 8, 1, '#4fb0d8');
      creeperFace(R, y);
      const s = Math.floor(u * 8) % 14; if (s < 8) R(OX + 2 + s, y + (s % 3) + 1.5, .5, .5, '#ffffff');
    } },
  { mob: 'エンダーマン', name: 'ワープ', how: '黒い体に 紫の目。手足が 長くなって 消えて ワープ', say: 'シュン',
    form(R, u) {
      if (u > .8 && u < 1.05) { for (let i = 0; i < 6; i++) R(OX + 3 + ((i * 5 + Math.floor(u * 20)) % 7), OY - 2 + i * 2, .5, .5, '#c86cff'); return; }
      const dx = u >= 1.05 ? 2 : -1, Q = (x, y, ww, h, c, a) => R(x + dx, y, ww, h, c, a);
      const w = walk(u, .6), c = '#161219', y = OY - 3 + w.hop;
      Q(OX + 2, y, 8, 6, c); Q(OX + 3, y + 2, 2, 1, '#d27cff'); Q(OX + 7, y + 2, 2, 1, '#d27cff');
      Q(OX + 1, y + 3, 1, 6, c); Q(OX + 10, y + 3, 1, 6, c);
      Q(OX + 3, OY + 3, 1, w.up[0] ? 3 : 4, c); Q(OX + 8, OY + 3, 1, w.up[1] ? 3 : 4, c);
    } },
  { mob: 'ゾンビ', name: 'よたよた ゾンビ', how: '緑の顔・水色の服・青いズボン。うでを 前に出して よたよた', say: 'ウ〜',
    form(R, u) {
      const w = walk(u, .45), sk = '#5aa64a', sh = '#2fa6a6'; legs(R, '#3f45a6', w); const y = OY + w.hop;
      R(OX + 2, y, 8, 3, sk); R(OX + 2, y + 3, 8, 3, sh); eyes(R, y + 1, u);
      R(OX + 10, y + 3, 2, 1, sh); R(OX + 12, y + 3, 1, 1, sk); R(OX + 10, y + 5, 2, 1, sh); R(OX + 12, y + 5, 1, 1, sk);
    } },
  { mob: 'スケルトン', name: 'カタカタ 骨', how: '白い 骨の体に あばら骨。歩くと カタカタ ゆれる', say: 'カタカタ',
    form(R, u) {
      const w = walk(u), b = '#dcdcdc', dk = '#8a8a8a', dx = (Math.floor(u * 12) % 2) * .25, Q = (x, y, ww, h, c, a) => R(x + dx, y, ww, h, c, a);
      [2, 4, 7, 9].forEach((x, i) => Q(OX + x + .25, OY + 6, .5, w.up[i] ? 1 : 2, b));
      const y = OY + w.hop; Q(OX + 2, y, 8, 6, b);
      Q(OX + 3, y + 1, 2, 1, '#333'); Q(OX + 7, y + 1, 2, 1, '#333'); Q(OX + 5, y + 2, 2, .5, dk);
      Q(OX + 3, y + 3.5, 6, .25, dk); Q(OX + 3, y + 4.5, 6, .25, dk);
      Q(OX + .5, y + 2, 1.5, .5, b); Q(OX + 10, y + 2, 1.5, .5, b);
    } },
  { mob: '村人', name: 'ハァンと 首ふり', how: '大きな鼻と 茶色の服。うでを 組んで 首を ふる', say: 'ハァン',
    form(R, u) {
      const shake = u > .8 && u < 1.6 ? Math.round(Math.sin(u * 30)) * .5 : 0, Q = (x, y, w, h, c, a) => R(x + shake, y, w, h, c, a);
      const y = OY; legs(R, '#6e4a2c', STILL);
      Q(OX + 2, y, 8, 3, '#c4926e'); Q(OX + 2, y + 3, 8, 3, '#6e4a2c');
      Q(OX + 3, y + .25, 6, .5, '#3b2616');
      Q(OX + 3, y + 1, 1, 1, '#ffffff'); Q(OX + 4, y + 1, 1, 1, '#2e8b3c'); Q(OX + 7, y + 1, 1, 1, '#2e8b3c'); Q(OX + 8, y + 1, 1, 1, '#ffffff');
      Q(OX + 5, y + 1.5, 2, 2.5, '#a8724f'); Q(OX + 2, y + 4, 8, 1, '#5b3c22');
    } },
  { mob: 'スライム', name: 'ぽよんと はねる', how: '足のない 四角い体。中に 小さな四角。ぴょーん、ぺたっ', say: 'ぽよん',
    form(R, u) {
      const ph = u % 1, h = ph < .75 ? Math.sin(ph / .75 * Math.PI) * 4 : 0, sq = ph >= .75;
      const ww = sq ? 9 : 8, hh = sq ? 5 : 6, cx = OX + 6, bot = OY + 8 - q4(h), top = bot - hh;
      R(cx - ww / 2, top, ww, hh, '#7ccf5a', .75);
      R(cx - 2, top + 1.5, 4, hh - 2.5, '#4d9a36');
      R(cx - 1.5, top + 2, 1, 1, '#1f3a17'); R(cx + .5, top + 2, 1, 1, '#1f3a17'); R(cx - .5, top + 3.5, 1, .5, '#1f3a17');
    } },
  { mob: 'アレイ', name: 'ふわふわ アレイ', how: '水色の体に 白い はね。ふわふわ 浮かぶ', say: 'ふわ〜',
    form(R, u) {
      const y = OY - 2 + q4(Math.sin(u * 3)), fl = Math.floor(u * 8) % 2;
      R(OX - 1, y - 1 + fl, 3, 3 - fl, '#e8f6ff', .85); R(OX + 10, y - 1 + fl, 3, 3 - fl, '#e8f6ff', .85);
      R(OX + 2, y, 8, 6, '#6fd6ff'); R(OX + 2, y + 5, 8, 1, '#4cb8e6');
      eyes(R, y + 2, u, '#1b4a7a'); R(OX + 1, y + 3, 1, 2, '#6fd6ff'); R(OX + 10, y + 3, 1, 2, '#6fd6ff');
    } },
  { mob: 'ミツバチ', name: '8の字で ブーン', how: '黄色と 黒の しま・はね・針。8の字に ぶーんと 飛ぶ', say: 'ブーン',
    form(R, u) {
      const dx = q4(Math.sin(u * 3) * 1.5), dy = q4(Math.sin(u * 6)), Q = (x, y, w, h, c, a) => R(x + dx, y + dy, w, h, c, a);
      const y = OY - 1, fl = Math.floor(u * 12) % 2;
      Q(OX + 5, y - 2 + fl, 3, 2 - fl, '#dcf0ff', .9);
      Q(OX + 2, y, 8, 6, '#f2c430'); Q(OX + 6, y, 1, 6, '#3a2a14'); Q(OX + 8, y, 1, 6, '#3a2a14');
      Q(OX + 3, y + 1, 1, 2, '#222222'); Q(OX + 3, y + 1, .5, .5, '#ffffff'); Q(OX + 3, y - 1, .5, 1, '#3a2a14');
      Q(OX + 10, y + 3, 1, 1, '#222222');
      [3, 5, 7].forEach(x => Q(OX + x, y + 6, .5, 1, '#3a2a14'));
    } },
  { mob: 'ガスト', name: '大きな ガスト', how: '白い 大きな体に 足が 何本も。赤い目で 口を あける', say: 'ギャー',
    form(R, u) {
      const y = OY - 4 + q4(Math.sin(u * 2) * .75), angry = u > 1.0 && u < 1.8;
      [2, 4, 6, 8, 10].forEach((x, i) => R(OX + x - .5, y + 8, 1, 2 + Math.round((Math.sin(u * 4 + i) + 1) * 2) / 2, '#d8d8d8'));
      R(OX + 1, y, 10, 8, '#f2f2f2'); R(OX + 1, y + 7, 10, 1, '#d4d4d4'); R(OX + 10, y, 1, 8, '#dedede'); // 白い背景でも 形が わかるように 影
      if (angry) { R(OX + 3, y + 2, 2, 1, '#c02020'); R(OX + 7, y + 2, 2, 1, '#c02020'); R(OX + 4, y + 4, 4, 3, '#222222'); }
      else { R(OX + 3, y + 2.5, 2, .5, '#888888'); R(OX + 7, y + 2.5, 2, .5, '#888888'); R(OX + 5, y + 5, 2, 1, '#999999'); }
    } },
  { mob: 'オオカミ', name: 'しっぽ ふりふり', how: '白い体に 耳・黒い鼻・赤い首輪。しっぽを ふる', say: 'ワン',
    form(R, u) {
      const w = walk(u), c = '#e8e6e2'; legs(R, c, w); const y = OY + w.hop, wag = Math.floor(u * 6) % 2;
      R(OX + 2, y - 1, 2, 1, '#cfcac2'); R(OX + 8, y - 1, 2, 1, '#cfcac2');
      R(OX + 2, y, 8, 6, c); eyes(R, y + 1, u); R(OX + 5, y + 3, 2, 1, '#222222');
      R(OX + 2, y + 5, 8, 1, '#c83a3a'); R(OX + 10, y + 1 + wag, 2, 1, c);
    } },
  { mob: 'ネコ（茶トラ）', name: '歩いて ごろん', how: 'オレンジに 茶の しま・白い口元。歩いてから 寝ころぶ', say: 'すやぁ',
    form(R, u) {
      const c = '#e8913a', s = '#b5601c', sleep = u > 1.0;
      const w = sleep ? STILL : walk(u), y = sleep ? OY + 2 : OY + w.hop;
      if (!sleep) legs(R, c, w);
      R(OX + 2, y - 1, 2, 1, c); R(OX + 8, y - 1, 2, 1, c);
      R(OX + 2, y, 8, 6, c); R(OX + 4, y, 1, 2, s); R(OX + 6, y, 1, 1, s); R(OX + 7, y, 1, 2, s);
      R(OX + 4, y + 3, 4, 2, '#fff1dd'); R(OX + 5, y + 3, 2, 1, '#e07a80');
      if (sleep) {
        R(OX + 3, y + 1.5, 1, .25, '#3a2414'); R(OX + 8, y + 1.5, 1, .25, '#3a2414');
        const r = q4((u - 1.0) * 1.2); R(OX + 11, y - 1 - r, 1, 1, '#cfe0ff'); R(OX + 12.5, y - 3 - r, .5, .5, '#cfe0ff');
      } else eyes(R, y + 1, u, '#3aa04a');
      R(OX + 10, y + 3, 2, 1, c); R(OX + 11, y + 3, .5, 1, s);
    } },
  { mob: 'ヤマネコ', name: 'ササッと ダッシュ', how: '黄色に 茶色の ぶち・緑の目。ササッと 速く走る', say: 'ササッ',
    form(R, u) {
      const dx = q4(Math.min(3, -3 + u * 3.5)), Q = (x, y, w, h, c, a) => R(x + dx, y, w, h, c, a);
      const w = walk(u, 2.2), c = '#f2c54a', s = '#9c6418'; legs(Q, c, w); const y = OY + w.hop;
      Q(OX + 2, y - 1, 2, 1, c); Q(OX + 8, y - 1, 2, 1, c); Q(OX + 2, y, 8, 6, c);
      Q(OX + 5, y, 1, 1, s); Q(OX + 3, y + 4, 1, 1, s); Q(OX + 8, y + 4, 1, 1, s); Q(OX + 6, y + 5, 1, 1, s);
      eyes(Q, y + 1, u, '#2f9a3c'); Q(OX + 5, y + 3, 2, 1, '#e8a0a0');
    } },
  { mob: 'ブタ', name: 'ブーと 鼻あげ', how: 'ピンクの体に 大きな鼻。ブーと 鼻を 上げる', say: 'ブー',
    form(R, u) {
      const w = walk(u, .7), c = '#f2a5b5', up = u > .8 && u < 1.4 ? 1 : 0; legs(R, c, w); const y = OY + w.hop;
      R(OX + 2, y, 8, 6, c); eyes(R, y + 1, u);
      R(OX + 4, y + 3 - up, 4, 2, '#e07c92'); R(OX + 4.75, y + 3.75 - up, .5, .5, '#9a4a5a'); R(OX + 6.75, y + 3.75 - up, .5, .5, '#9a4a5a');
    } },
  { mob: 'キツネ', name: '雪に ジャンプ', how: 'とがった耳・白い口元・先が白い しっぽ。ぴょーんと とぶ', say: 'ぴょーん',
    form(R, u) {
      const jump = u > .8 && u < 1.8 ? Math.sin((u - .8) * Math.PI) * 3 : 0;
      const w = jump ? STILL : walk(u), c = '#e2742a', wt = '#fbf3e6', d = '#3a2418', y = OY + w.hop - q4(jump);
      legs(R, c, w, jump ? 1 : 2, jump ? y + 6 : OY + 6);
      R(OX + 2, y - 2, 2, 2, c); R(OX + 2, y - 2, 2, .75, d); R(OX + 8, y - 2, 2, 2, c); R(OX + 8, y - 2, 2, .75, d);
      R(OX + 2, y, 8, 6, c); R(OX + 3, y + 3, 6, 3, wt); eyes(R, y + 1.5, u); R(OX + 5, y + 3, 2, 1, d);
      R(OX + 10, y + 1, 3, 3, c); R(OX + 12, y + 1, 1, 3, wt);
    } },
  { mob: 'シロクマ', name: '立って ガオー', how: '白くて 大きな体・まるい耳・黒い鼻。立ち上がって うでを あげる', say: 'ガオー',
    form(R, u) {
      const c = '#f3f1ea', sd = '#d9d6cc', stand = u > .8 && u < 1.8, w = stand ? STILL : walk(u, .6);
      if (stand) { R(OX + 3, OY + 4, 1, 4, c); R(OX + 8, OY + 4, 1, 4, c); } else legs(R, c, w);
      const y = stand ? OY - 2 : OY + w.hop;
      R(OX + 2, y - 1, 1, 1, c); R(OX + 9, y - 1, 1, 1, c);
      R(OX + 2, y, 8, 6, c); eyes(R, y + 1, u); R(OX + 4, y + 3, 4, 2, sd); R(OX + 5, y + 3, 2, 1, '#222222');
      if (stand) { R(OX, y - 1, 2, 3, c); R(OX + 10, y - 1, 2, 3, c); } else { R(OX, y + 2, 2, 2, c); R(OX + 10, y + 2, 2, 2, c); }
    } },
  { mob: 'カエル（緑）', name: '舌を ぺろっ', how: '飛び出た目・横に 長い口。舌を ぺろっと 出す', say: 'ゲコ',
    form(R, u) {
      const c = '#6aa84f', y = OY, tg = u > .8 && u < 1.4 ? Math.min(3, Math.round((u - .8) * 12)) : 0;
      [2, 3, 8, 9].forEach(x => R(OX + x, OY + 6, 1, 1, c));
      R(OX + 2, y - 1, 2, 2, c); R(OX + 8, y - 1, 2, 2, c); R(OX + 3, y, 1, 1, '#111111'); R(OX + 8, y, 1, 1, '#111111');
      R(OX + 2, y + 1, 8, 5, c); R(OX + 3, y + 4, 6, 2, '#a8d47a'); R(OX + 3, y + 3, 6, .5, '#2d4a1e');
      if (tg) R(OX + 10, y + 3, tg, .75, '#e65a80');
    } },
  { mob: 'カエル（白・茶）', name: '色が かわる カエル', how: '白から 茶色に かわりながら ゲコッと 高く ジャンプ', say: 'ゲコッ',
    form(R, u) {
      const v = u >= 1.1, c = v ? '#c47e3e' : '#e9e4d6', b = v ? '#e0aa6c' : '#fffaf0';
      const ph = u % 1, h = ph > .4 && ph < .9 ? Math.sin((ph - .4) * 2 * Math.PI) * 5 : 0, y = OY - q4(h);
      [2, 3, 8, 9].forEach(x => R(OX + x, y + 6, 1, h > .5 ? 2 : 1, c));
      R(OX + 2, y - 1, 2, 2, c); R(OX + 8, y - 1, 2, 2, c); R(OX + 3, y, 1, 1, '#111111'); R(OX + 8, y, 1, 1, '#111111');
      R(OX + 2, y + 1, 8, 5, c); R(OX + 3, y + 4, 6, 2, b); R(OX + 3, y + 3, 6, .5, '#4a3a2a');
    } },
  { mob: 'ウーパールーパー', name: '4色で すいすい', how: '頭に ギザギザの エラ・長い しっぽ。ピンク・紫・水色・金に かわって 泳ぐ', say: 'すいすい',
    form(R, u) {
      const P = [['#f4a8c6', '#d8487a'], ['#b9a6ea', '#7b5ccf'], ['#cfe6f5', '#6a9fd0'], ['#f2c94c', '#e08a1e']];
      const [c, g] = P[Math.floor(u / .5) % 4], y = OY + q4(Math.sin(u * 4) * .5), wv = q4(Math.sin(u * 8) * .5);
      [1, 3, 7, 9].forEach((x, i) => R(OX + x, y + 6, 1, (Math.floor(u * 4) + i) % 2 ? 1 : .5, c));
      R(OX + 11, y + 2 + wv, 3, 2, c); R(OX + 11, y + 1.5 + wv, 3, .5, g);
      R(OX + 5, y + 2, 6, 4, c); R(OX, y + 1, 5, 5, c);
      R(OX, y, 1, 1, g); R(OX + 1, y - 1, 1, 1, g); R(OX + 3, y - 1, 1, 1, g); R(OX + 4, y, 1, 1, g);
      R(OX - 1, y + 2, 1, 1, g); R(OX - 1, y + 4, 1, 1, g);
      R(OX + 1, y + 2, 1, 1, '#222222'); R(OX + 3, y + 2, 1, 1, '#222222'); R(OX + 1.5, y + 4, 2, .25, g);
    } },
  { mob: 'ウサギ（白・黒）', name: 'ぴょこぴょこ ウサギ', how: '長い耳を 2本。白（赤い目）から 黒に かわって ぴょこぴょこ', say: 'ぴょこ',
    form(R, u) {
      const v = u >= 1.0, c = v ? '#2a2626' : '#f3f1ee', e = v ? '#e8e0d0' : '#d02a2a', inn = v ? '#4a3a3a' : '#f4b4c0';
      const ph = (u % .5) / .5, h = Math.sin(ph * Math.PI) * 2, y = OY - q4(h);
      [3, 4, 7, 8].forEach(x => R(OX + x, y + 6, 1, h > .3 ? 1 : 2, c));
      R(OX + 4, y - 3, 1, 4, c); R(OX + 7, y - 3, 1, 4, c); R(OX + 4.25, y - 2, .5, 2, inn); R(OX + 7.25, y - 2, .5, 2, inn);
      R(OX + 3, y + 1, 6, 5, c); R(OX + 4, y + 2, 1, 1, e); R(OX + 7, y + 2, 1, 1, e); R(OX + 5.5, y + 3.5, 1, .5, inn);
      R(OX + 9, y + 4, 1, 1, '#ffffff');
    } },
];

// ---------- 3回目の 20 とおり（いまの CC_EXTRA の 271〜290 番）。アイアンゴーレム・ニワトリ … ストライダー ----------
const FORMS3 = [
  { mob: 'アイアンゴーレム', name: 'お花を どうぞ', how: '白い鉄の体に 長いうで・つる。赤い花を さしだす', say: 'どうぞ',
    form(R, u) {
      const c = '#d8d0c4', dk = '#a89e92', w = walk(u, .4), y = OY + w.hop, give = u > .8;
      legs(R, dk, w);
      R(OX + 2, y, 8, 6, c); R(OX + 3, y + .5, 6, .5, dk); R(OX + 3, y + 1, 1, 1, '#7a1a1a'); R(OX + 8, y + 1, 1, 1, '#7a1a1a');
      R(OX + 5, y + 1.5, 2, 2.5, '#c0b6aa'); R(OX + 3, y + 4, 1, 2, '#4f8a3a'); R(OX + 8, y + 3, 1, 1, '#4f8a3a'); R(OX + 9, y + 4, 1, 1, '#3d7a2e');
      R(OX + .5, y + 2, 1.5, 5, c);
      if (give) { R(OX + 10, y + 3, 3, 1.5, c); R(OX + 13, y + 1, .5, 2.5, '#3d7a2e'); R(OX + 12.5, y, 1.5, 1.5, '#d83a2a'); R(OX + 13, y + .5, .5, .5, '#2a2a2a'); }
      else R(OX + 10, y + 2, 1.5, 5, c);
    } },
  { mob: 'ニワトリ', name: 'コツコツ つつく', how: '白い体・赤いトサカ・黄色いくちばし。地面を つついて はねを パタパタ', say: 'コケッ',
    form(R, u) {
      const c = '#f8f8f4', peck = u > .6 && u < 1.6 && Math.floor(u * 6) % 2, flap = u > 1.6 && Math.floor(u * 10) % 2, y = OY + 1 + (peck ? 1 : 0), dx = peck ? -.5 : 0;
      R(OX + 5, OY + 6, .5, 2, '#e0a020'); R(OX + 7, OY + 6, .5, 2, '#e0a020'); R(OX + 4.5, OY + 7.5, 1.5, .5, '#e0a020'); R(OX + 6.5, OY + 7.5, 1.5, .5, '#e0a020');
      R(OX + 3 + dx, y, 6, 5, c); R(OX + 3 + dx, y + 4.5, 6, .5, '#dcdcd4'); R(OX + 4 + dx, y - 1, 2, 1, '#d83a2a');
      R(OX + 2 + dx, y + 1.5, 1, 1, '#f0a020'); R(OX + 2.5 + dx, y + 2.5, .5, 1, '#d83a2a'); R(OX + 4 + dx, y + 1, 1, 1, '#1a1612');
      R(OX + 8 + dx, y + (flap ? .5 : 1.5), 1.5, flap ? 1.5 : 2, '#e4e4dc');
      [1, 1.8, 2.6].forEach((x, i) => { if (u < .6 + i * .3) R(OX + x - 1, OY + 7.5, .5, .5, '#c8a040'); });
    } },
  { mob: 'ウシ', name: 'モーと なく', how: '白黒の もよう・つの・ピンクの鼻。顔を 上げて モー', say: 'モー',
    form(R, u) {
      const c = '#f4f2ee', k = '#2a2422', w = walk(u, .6), moo = u > .8 && u < 1.4 ? 1 : 0, y = OY + w.hop;
      legs(R, c, w); [2, 4, 7, 9].forEach(x => R(OX + x, OY + 7.5, 1, .5, k));
      R(OX + 2, y - 1, 1, 1, '#e8dcc0'); R(OX + 9, y - 1, 1, 1, '#e8dcc0');
      R(OX + 2, y, 8, 6, c); R(OX + 2, y, 2, 2, k); R(OX + 8, y + 3, 2, 2, k); R(OX + 2, y + 4, 1, 2, k);
      eyes(R, y + 1.5, u, '#1a1612', [4, 7]);
      R(OX + 4, y + 3 - moo, 4, 2, '#f0b8b8'); R(OX + 4.75, y + 3.5 - moo, .5, .5, '#a06060'); R(OX + 6.75, y + 3.5 - moo, .5, .5, '#a06060');
      if (moo) R(OX + 5, y + 4, 2, .75, '#6a3030');
    } },
  { mob: 'ムーシュルーム', name: 'キノコが ポコッ', how: '赤い ウシ。背中に キノコが ポコッ ポコッと 生える', say: 'ポコッ',
    form(R, u) {
      const c = '#c8302a', w = walk(u, .5), y = OY + w.hop;
      legs(R, c, w);
      R(OX + 2, y, 8, 6, c); R(OX + 2, y + 4, 2, 2, '#e8dcd0'); R(OX + 8, y, 2, 1, '#e8dcd0');
      eyes(R, y + 1.5, u, '#1a1612', [4, 7]); R(OX + 4, y + 3, 4, 2, '#e8a0a0'); R(OX + 4.75, y + 3.5, .5, .5, '#904040'); R(OX + 6.75, y + 3.5, .5, .5, '#904040');
      [[3, .6], [7, 1.0]].forEach(([x, st]) => {
        const k = seg(u, st, st + .25); if (!k) return;
        const h = q4(k * 2);
        R(OX + x + 1, y - h + 1, 1, h, '#f0e8d8'); R(OX + x, y - h, 3, 1, '#d83a2a'); R(OX + x + .5, y - h, .5, .5, '#ffffff'); R(OX + x + 2, y - h + .5, .5, .5, '#ffffff');
      });
    } },
  { mob: 'ヒツジ', name: 'にじ色の 毛', how: '白い もこもこの毛が にじ色に どんどん かわる', say: 'メェ〜',
    form(R, u) {
      const RB = ['#f4f4f4', '#e84a4a', '#f0a030', '#f2d84a', '#6ccc58', '#4ab0e8', '#7a6ae0', '#d070d0'];
      const wool = u < .6 ? RB[0] : RB[1 + Math.floor((u - .6) / .2) % 7], w = walk(u, .5), y = OY + w.hop;
      legs(R, '#e0cdb0', w);
      R(OX + 2, y - .5, 8, 6.5, wool); R(OX + 1.5, y + 1, 1, 4, wool); R(OX + 9.5, y + 1, 1, 4, wool);
      R(OX + 3, y + 1, 3, 4, '#e0cdb0'); R(OX + 3.5, y + 2, .75, .75, '#1a1612'); R(OX + 5, y + 2, .75, .75, '#1a1612'); R(OX + 4, y + 3.5, 1, .5, '#c8a090');
    } },
  { mob: 'パンダ', name: 'くしゅん', how: '白い体に 黒い耳・目のまわり・手足。大きな くしゃみ', say: 'くしゅん',
    form(R, u) {
      const c = '#f4f4f0', k = '#2a2a2a', ah = u > .6 && u < 1.0, sn = u >= 1.0 && u < 1.3, w = ah || sn ? STILL : walk(u, .5);
      const y = OY + w.hop + (ah ? -.5 : 0) + (sn ? .5 : 0), dx = sn ? 1 : 0, Q = (x, yy, ww, h, cc, a) => R(x + dx, yy, ww, h, cc, a);
      legs(R, k, w);
      Q(OX + 2, y - 1, 2, 1, k); Q(OX + 8, y - 1, 2, 1, k);
      Q(OX + 2, y, 8, 6, c); Q(OX + 2, y + 5.5, 8, .5, '#d8d8d0'); Q(OX + 9.5, y, .5, 6, '#e0e0d8'); // 白い背景でも 形が わかるように 影
      Q(OX + 3, y + 1, 2, 2, k); Q(OX + 7, y + 1, 2, 2, k);
      if (sn) { Q(OX + 3, y + 2, 2, .25, '#ffffff'); Q(OX + 7, y + 2, 2, .25, '#ffffff'); }
      else { Q(OX + 3.5, y + 1.5, .75, .75, '#ffffff'); Q(OX + 7.5, y + 1.5, .75, .75, '#ffffff'); }
      Q(OX + 5, y + 3.5, 2, 1, k); Q(OX, y + 2, 2, 2, k); Q(OX + 10, y + 2, 2, 2, k);
      const p = seg(u, 1.0, 1.6); if (p > 0 && p < 1) R(OX + 1 - p * 4, y + 3.5 - p, 1, 1, '#9ad070', 1 - p);
    } },
  { mob: 'イカ', name: 'スミを プシュッ', how: '紺色の体に 足が 何本も。ゆらゆら 泳いで スミを はく', say: 'プシュ',
    form(R, u) {
      const c = '#2a4a7a', l = '#3a6aa0', y = OY - 2 + q4(Math.sin(u * 3) * .75);
      for (let i = 0; i < 4; i++) R(OX + 3.5 + i * 1.5, y + 6, 1, 2 + q4((Math.sin(u * 6 + i) + 1) * .5), l);
      R(OX + 3, y - 1, 6, 7, c); R(OX + 3, y - 1, 6, 1, l);
      R(OX + 3.5, y + 3, 1, 1, '#ffffff'); R(OX + 4, y + 3, .5, 1, '#1a1a1a'); R(OX + 7.5, y + 3, 1, 1, '#ffffff'); R(OX + 8, y + 3, .5, 1, '#1a1a1a');
      const k = seg(u, .9, 1.6);
      if (k > 0 && k < 1) [[0, 0], [-2, 1], [2, 1], [0, 2]].forEach(([dx, dy]) => R(OX + 6 + dx * (1 + k * 2) - 1, y + 9 + dy + k * 2, 2, 2, '#1a1a2a', 1 - k));
    } },
  { mob: 'グロウイカ', name: 'ピカピカ 光る', how: '水色の イカ。体の つぶが ピカピカ 光る', say: 'ピカピカ',
    form(R, u) {
      const c = '#1f8f8a', y = OY - 2 + q4(Math.sin(u * 3) * .75), glow = .5 + .5 * Math.sin(u * 6);
      for (let i = 0; i < 4; i++) R(OX + 3.5 + i * 1.5, y + 6, 1, 2 + q4((Math.sin(u * 6 + i) + 1) * .5), '#2aa8a0');
      R(OX + 3, y - 1, 6, 7, c);
      [[3.5, 0], [6.5, .5], [5, 2], [4, 4.5], [7.5, 4]].forEach(([x, yy]) => R(OX + x, y + yy, 1, 1, '#9fffe8', .3 + .7 * glow));
      R(OX + 4, y + 2.5, 1, 1.5, '#1a2a2a'); R(OX + 7, y + 2.5, 1, 1.5, '#1a2a2a');
    } },
  { mob: 'スノーゴーレム', name: '雪玉を ポイッ', how: '雪の体に カボチャの頭。雪玉を ポイッと なげる', say: 'ポイッ',
    form(R, u) {
      const y = OY, s = '#f4f8ff', tw = '#6a4a2a', th = u > .8 && u < 1.1;
      R(OX + 1, OY + 7.5, 10, .5, '#e0ecff');
      R(OX + 3, y + 2, 6, 6, s); R(OX + 3, y + 7.5, 6, .5, '#d0dcf0'); R(OX + 8.5, y + 2, .5, 6, '#d0dcf0');
      R(OX + 3, y - 3, 6, 5, '#e38a1d'); R(OX + 3, y - 3, 6, .5, '#f0a030');
      R(OX + 4, y - 2, 1, 1, '#5a2a00'); R(OX + 7, y - 2, 1, 1, '#5a2a00'); R(OX + 4, y, 4, .75, '#5a2a00');
      R(OX + 1, y + 3, 2, .5, tw); R(OX + 9, th ? y + 1 : y + 3, 2, .5, tw);
      const k = seg(u, 1.0, 1.7);
      if (k > 0 && k < 1) R(OX + 10 + k * 5, y + 1 - Math.sin(k * Math.PI) * 3, 1, 1, '#ffffff');
      if (k >= 1 && u < 1.9) R(OX + 15, y + 5, 1, 1, '#ffffff', 1 - seg(u, 1.7, 1.9));
    } },
  { mob: 'ブレイズ', name: '火の ぼうが くるくる', how: '黄色い頭の まわりを 火の ぼうが くるくる 回る', say: 'ボォッ',
    form(R, u) {
      const y = OY - 2 + q4(Math.sin(u * 2) * .75);
      for (let i = 0; i < 4; i++) { const a = u * 4 + i * Math.PI / 2, z = Math.sin(a); if (z < 0) R(OX + 5.5 + Math.cos(a) * 5, y + 5 + z * .8, 1, 2.5, '#c89020'); }
      R(OX + 3, y, 6, 5, '#f0c030'); R(OX + 3, y, 6, 1, '#f8d860');
      R(OX + 4, y + 2, 1, 1, '#4a2a00'); R(OX + 7, y + 2, 1, 1, '#4a2a00'); R(OX + 5, y + 3.5, 2, .5, '#8a5a10');
      for (let i = 0; i < 4; i++) { const a = u * 4 + i * Math.PI / 2, z = Math.sin(a); if (z >= 0) R(OX + 5.5 + Math.cos(a) * 5, y + 5 + z * .8, 1, 2.5, '#f8d040'); }
      for (let i = 0; i < 3; i++) { const ph = (u * .8 + i / 3) % 1; R(OX + 4 + i * 2, y - ph * 4, .75, .75, '#ff8a20', 1 - ph); }
    } },
  { mob: 'シュルカー', name: 'パカッと 開く', how: '紫の 箱。パカッと 開いて 中から 黄色い顔', say: 'パカッ',
    form(R, u) {
      const op = u > .6 && u < 1.7 ? Math.min(1, (u - .6) * 4, (1.7 - u) * 4) : 0, lid = q4(op * 2.5);
      R(OX + 2, OY + 4, 8, 4, '#8a5aa0'); R(OX + 2, OY + 7.5, 8, .5, '#6a3a80');
      if (op > .2) { R(OX + 4, OY + 3 - lid + 1.5, 4, lid + .5, '#f0e070'); R(OX + 5, OY + 3.5 - lid + 2, .5, .5, '#3a3a2a'); R(OX + 6.5, OY + 3.5 - lid + 2, .5, .5, '#3a3a2a'); }
      R(OX + 2, OY + 1 - lid, 8, 3, '#9a6ab0'); R(OX + 2, OY + 3.5 - lid, 8, .5, '#6a3a80'); R(OX + 4, OY + 2 - lid, 4, .5, '#b48ac8');
    } },
  { mob: 'ピグリン', name: '金が だいすき', how: 'ピンクの顔に 大きな鼻と 耳。金の インゴットを つかまえて ニッコリ', say: 'ピカピカ',
    form(R, u) {
      const c = '#e8a0a0', w = u < 1.2 ? walk(u, .6) : STILL, y = OY + w.hop, got = u >= 1.2;
      legs(R, '#6a4a2a', w);
      R(OX + 1, y + 1, 1, 2, c); R(OX + 10, y + 1, 1, 2, c); R(OX + 10, y + 3, 1, 1, '#f2c94c');
      R(OX + 2, y, 8, 6, c); R(OX + 2, y + 5, 8, 1, '#6a4a2a');
      if (got) { R(OX + 3, y + 1.5, 1, .25, '#1a1612'); R(OX + 8, y + 1.5, 1, .25, '#1a1612'); } else eyes(R, y + 1, u);
      R(OX + 4, y + 2.5, 4, 2, '#d07080'); R(OX + 4.75, y + 3, .5, .5, '#904050'); R(OX + 6.75, y + 3, .5, .5, '#904050');
      const k = seg(u, .6, 1.2);
      if (k < 1) { if (k > 0) R(OX + 5, y - 6 + k * 6, 2, 1, '#f2c94c'); }
      else { R(OX + 4.5, y + 4.5, 3, 1, '#f2c94c'); R(OX + 4.5, y + 4.5, 3, .25, '#fff2a0'); }
    } },
  { mob: 'ラマ', name: 'ペッと つば', how: '長い首に もようの じゅうたん。ペッと つばを とばす', say: 'ペッ',
    form(R, u) {
      const c = '#e8d8b8', w = walk(u, .5), y = OY + w.hop, sp = u > .9 && u < 1.15 ? 1 : 0;
      legs(R, c, w);
      R(OX + 2, y + 1, 8, 5, c); R(OX + 5, y + 1, 5, 2, '#d83a3a'); R(OX + 5, y + 2, 5, .5, '#f2c94c');
      R(OX + 2, y - 3, 3, 4, c); R(OX + 2, y - 4, 1, 1, c); R(OX + 4, y - 4, 1, 1, c);
      R(OX + 3, y - 2, .75, .75, '#1a1612'); R(OX + 1.5, y - 1 + sp * .5, 1.5, 1, '#d8c8a8');
      const k = seg(u, 1.0, 1.5); if (k > 0 && k < 1) R(OX + 1 - k * 4, y - 1 + k * k * 2, .75, .75, '#ffffff');
    } },
  { mob: 'カメ', name: 'たまごを ポン', how: '緑の こうら。のそのそ 歩いて たまごを ポンと うむ', say: 'よいしょ',
    form(R, u) {
      const sk = '#6ab04a', sh = '#3a8a3a', dx = q4(Math.min(u, 1.2) * -1.5) + 1, f = u < 1.2 ? Math.floor(u * 3) % 2 : 0, y = OY;
      const Q = (x, yy, w, h, c, a) => R(x + dx, yy, w, h, c, a);
      Q(OX + 3, y + 6 - f * .5, 1.5, 2 - (1 - f) * 0, sk); Q(OX + 8, y + 6 - (1 - f) * .5, 1.5, 2, sk);
      Q(OX + 2, y + 2, 8, 4, sh); Q(OX + 3, y + 1.5, 6, .5, sh); Q(OX + 4, y + 3, 1, 1, '#2a6a2a'); Q(OX + 7, y + 3, 1, 1, '#2a6a2a'); Q(OX + 5.5, y + 4, 1, 1, '#2a6a2a');
      Q(OX + 2, y + 5.5, 8, .5, '#c8b878');
      Q(OX, y + 3, 2, 2, sk); Q(OX + .5, y + 3.5, .5, .5, '#1a1612');
      if (u > 1.4) { const k = seg(u, 1.4, 1.6); R(OX + 11.5 + dx, OY + 8 - 1.5 * k, 1, 1.5 * k, '#f4f0e0'); R(OX + 11.5 + dx, OY + 8 - 1.5 * k, .5, .5, '#a0c8a0'); }
    } },
  { mob: 'ヤギ', name: 'ずつきジャンプ', how: '白い体に つのと ひげ。走って 大ジャンプ', say: 'メェッ！',
    form(R, u) {
      const c = '#efece4', run = u > .6 && u < 1.2, jp = u >= 1.2 && u < 1.8 ? Math.sin((u - 1.2) / .6 * Math.PI) * 4 : 0;
      const w = run ? walk(u, 2) : jp ? STILL : walk(u, .5), y = OY + w.hop - q4(jp), dx = q4(run ? (u - .6) * 2 : u >= 1.2 ? 1.2 : 0);
      const Q = (x, yy, ww, h, cc, a) => R(x + dx, yy, ww, h, cc, a);
      legs(Q, c, w, jp ? 1 : 2, jp ? y + 6 : OY + 6);
      Q(OX + 3, y - 2, 1, 2, '#9a9a92'); Q(OX + 8, y - 2, 1, 2, '#9a9a92');
      Q(OX + 2, y, 8, 6, c); Q(OX + 2, y + 5.5, 8, .5, '#d4d0c4'); Q(OX + 9.5, y, .5, 6, '#dedad0'); eyes(Q, y + 1.5, u, '#6a5a20'); Q(OX + 5, y + 3, 2, 1, '#c8b8a8'); Q(OX + 5.5, y + 5, 1, 1.5, '#dcd8cc');
    } },
  { mob: 'スニッファー', name: 'クンクン 種さがし', how: '大きな 赤い体に こけ。大きな鼻で クンクン、土を ほって 種を 見つける', say: 'クンクン',
    form(R, u) {
      const c = '#b5442e', w = walk(u, .3), y = OY + w.hop, dig = u > 1.0 && u < 1.6, sn = Math.floor(u * 8) % 2;
      legs(R, '#7a2a1e', w);
      R(OX + 1, y - 1, 11, 7, c); R(OX + 1, y - 2, 11, 1.5, '#4f8a3a'); R(OX + 3, y - 2.5, 2, .5, '#6cc04a'); R(OX + 8, y - 2.5, 2, .5, '#6cc04a');
      R(OX + 3, y + 1, 1, 1, '#1a1612'); R(OX + 6, y + 1, 1, 1, '#1a1612');
      R(OX - 1, y + 3 + (dig ? 2 : 0), 3, 2 + (sn ? .5 : 0), '#e0a040'); R(OX - .5, y + 3.5 + (dig ? 2 : 0), .5, .5, '#8a5a20');
      if (dig) for (let i = 0; i < 3; i++) { const ph = (u * 3 + i / 3) % 1; R(OX - 2 + i, OY + 7 - ph * 3, .75, .75, '#7a5230', 1 - ph); }
      if (u >= 1.6) { R(OX - 2, OY + 6.5, 1, 1.5, '#3f8f3a'); R(OX - 2.5, OY + 6.5, 2, .5, '#6cc04a'); }
    } },
  { mob: 'アルマジロ', name: 'まるまって コロコロ', how: 'ピンクの こうら。まるまって ボールになって コロコロ', say: 'まるっ',
    form(R, u) {
      const c = '#c88a70', b = '#a86a50', ball = u > .7 && u < 1.6;
      if (ball) {
        const dx = q4(Math.sin((u - .7) / .9 * Math.PI) * 3), cx = OX + 6 + dx, rot = Math.floor(u * 8) % 3;
        R(cx - 2.5, OY + 2.5, 5, 5.5, c); R(cx - 3, OY + 3.5, 6, 3.5, c);
        [0, 1.5, 3].forEach(d => R(cx - 3, OY + 3 + (d + rot * .5) % 4.5, 6, .5, b));
        return;
      }
      const w = walk(u, .6), y = OY + 1 + w.hop;
      legs(R, '#b07a60', w);
      R(OX + 3, y, 8, 5, c); [4.5, 6.5, 8.5].forEach(x => R(OX + x, y, .5, 5, b));
      R(OX + 1, y + 2, 2, 3, '#e0b0a0'); R(OX + 1.5, y + 1, 1, 1, '#e0b0a0'); R(OX + 1.5, y + 3, .5, .5, '#1a1612');
      R(OX + 11, y + 3, 1.5, 1, c);
    } },
  { mob: 'ラクダ', name: 'すわって ひとやすみ', how: 'こぶが 2つの 背の高い体。足を おって すわる', say: 'ふぅ',
    form(R, u) {
      const c = '#d8b070', sit = seg(u, .9, 1.3), w = sit ? STILL : walk(u, .4), y = OY - 2 + q4(sit * 2) + w.hop;
      const ll = 4 - q4(sit * 3); [3, 8].forEach((x, i) => R(OX + x, y + 6, 1, w.up[i * 3] ? ll - 1 : ll, '#c09a58'));
      if (sit) [2.5, 7.5].forEach(x => R(OX + x, OY + 7.5, 2, .5, '#c09a58', sit));
      R(OX + 3, y - 1.5, 2, 1.5, c); R(OX + 7, y - 1.5, 2, 1.5, c);
      R(OX + 2, y, 8, 6, c); R(OX + 3, y + 1, 1, 1, '#1a1612'); R(OX + 8, y + 1, 1, 1, '#1a1612'); R(OX + 4, y + 3, 4, 1.5, '#b89050');
    } },
  { mob: 'ウィザースケルトン', name: '石の剣で ブンッ', how: '黒い骨の体。石の剣を ブンッと ふる', say: 'ブンッ',
    form(R, u) {
      const b = '#2a2a2e', dk = '#5a5a60', w = walk(u, .5), y = OY - 1 + w.hop, sw = u > .9 && u < 1.3;
      [3, 8].forEach((x, i) => R(OX + x + .25, y + 6, .5, w.up[i * 3] ? 2 : 3, b));
      R(OX + 2, y, 8, 6, b); R(OX + 3, y + 1, 2, 1, '#0a0a0a'); R(OX + 7, y + 1, 2, 1, '#0a0a0a');
      R(OX + 3, y + 3.5, 6, .25, dk); R(OX + 3, y + 4.5, 6, .25, dk); R(OX + .5, y + 2, 1.5, .5, b);
      if (sw) { R(OX + 10, y + 2, 1.5, .5, b); R(OX + 11.5, y + 1.5, 5, 1, '#8a8a8a'); R(OX + 11, y + 1, .5, 2, '#6a4a2a'); for (let i = 0; i < 3; i++) R(OX + 13 + i, y - .5 + i * .5, .5, .5, '#ffffff', .6); }
      else { R(OX + 10, y + 2, .5, 2, b); R(OX + 10, y - 3, 1, 5, '#8a8a8a'); R(OX + 9.5, y + 2, 2, .5, '#6a4a2a'); }
    } },
  { mob: 'ストライダー', name: 'ブルブル ふるえる', how: '赤い体に 長い足。溶岩から 出ると 紫になって ブルブル', say: 'ブルブル',
    form(R, u) {
      const cold = seg(u, .9, 1.3), c = mix('#b83a3a', '#8a5aa8', cold), shiv = cold >= 1 && Math.floor(u * 14) % 2 ? .25 : 0;
      const w = cold ? STILL : walk(u, .5), y = OY - 2 + w.hop, Q = (x, yy, ww, h, cc, a) => R(x + shiv, yy, ww, h, cc, a);
      if (u < 1.3) R(OX, OY + 7, 12, 1, mix('#ff7a1a', '#7a5230', cold), 1 - cold * .7);
      [3, 8].forEach((x, i) => Q(OX + x, y + 5, 1, w.up[i * 3] ? 4 : 5, c));
      Q(OX + 2, y, 8, 5, c); [3, 5, 7, 9].forEach((x, i) => Q(OX + x, y - 1 - (i % 2) * .5, .5, 1 + (i % 2) * .5, c));
      Q(OX + 3, y + 1.5, 1, 1, '#1a1612'); Q(OX + 8, y + 1.5, 1, 1, '#1a1612'); Q(OX + 4, y + 3, 4, .5, '#5a1a1a');
    } },
];

// ---------- 4回目の 10 とおり（いまの CC_EXTRA の 291〜300 番）。ウマ・オウム … マグマキューブ ----------
const FORMS4 = [
  { mob: 'ウマ', name: 'パカラッと 走る', how: '茶色の体に こげ茶の たてがみ。パカラッと 走って 止まる', say: 'ヒヒーン',
    form(R, u) {
      const c = '#8a5a30', m = '#3a2414', run = u > .5 && u < 1.5, w = walk(u, run ? 2.2 : .5), y = OY - 1 + w.hop;
      const dx = q4(run ? -Math.sin((u - .5) * Math.PI) * 2.5 : 0), Q = (x, yy, ww, h, cc, a) => R(x + dx, yy, ww, h, cc, a);
      [2, 4, 7, 9].forEach((x, i) => Q(OX + x, y + 6, 1, w.up[i] ? 2 : 3, c)); [2, 4, 7, 9].forEach(x => Q(OX + x, OY + 7.5, 1, .5, '#2a1a10'));
      Q(OX + 2, y + 1, 9, 5, c); Q(OX + 11, y + 1 + (Math.floor(u * 6) % 2) * .5, 1, 3, m);
      Q(OX, y - 2, 3, 4, c); Q(OX - 1, y, 1.5, 2, '#7a4a26'); Q(OX + 1, y - 3, 1, 1, c); Q(OX + 3, y - 2, 1, 4, m); Q(OX + 1, y - 1, .75, .75, '#1a1612');
    } },
  { mob: 'オウム', name: 'ノリノリ ダンス', how: '赤い 小鳥。音楽に あわせて 色を かえながら ダンス', say: '♪',
    form(R, u) {
      const C = ['#e03a2a', '#3a6ad8', '#4ac04a', '#3ac8d8', '#a8a8a8'], dance = u > .5 && u < 1.8;
      const c = dance ? C[Math.floor((u - .5) / .26) % 5] : C[0], sw = dance ? (Math.floor(u * 5) % 2 ? .5 : -.5) : 0, y = OY + (dance && Math.floor(u * 5) % 2 ? .5 : 0);
      const Q = (x, yy, ww, h, cc, a) => R(x + sw, yy, ww, h, cc, a);
      R(OX + 5, OY + 6, .5, 2, '#5a5a5a'); R(OX + 6.5, OY + 6, .5, 2, '#5a5a5a');
      Q(OX + 4, y, 4, 6, c); Q(OX + 6, y - 1, 2, 1, c); Q(OX + 3, y + 1.5, 1, 1.5, '#f0c030'); Q(OX + 3, y + 2.5, .5, .5, '#2a2a2a');
      Q(OX + 4.5, y + 1, .75, .75, '#1a1612'); Q(OX + 7, y + 2, 1.5, 3, mix(c, '#000000', .25)); Q(OX + 7, y + 5, 1, 2, '#3a6ad8');
      if (dance) [[1, 0], [10, .5]].forEach(([x, d]) => { const ph = (u * 1.2 + d) % 1; R(OX + x, OY - 1 - ph * 3, 1, .75, '#9a6ae0', 1 - ph); R(OX + x + .75, OY - 2.5 - ph * 3, .25, 1.5, '#9a6ae0', 1 - ph); });
    } },
  { mob: 'コウモリ', name: 'さかさまから パタパタ', how: '天井に さかさまに ぶらさがって、パタパタ 飛び立つ', say: 'パタパタ',
    form(R, u) {
      const b = '#4a3a30', wg = '#2e2420';
      R(OX, OY - 4, 12, .5, '#7a6a5a');
      if (u < .7) {
        const y = OY - 3.5;
        R(OX + 5, y, 2, .5, wg); R(OX + 4.5, y + .5, 3, 3, b); R(OX + 4, y + .5, .5, 3, wg); R(OX + 7.5, y + .5, .5, 3, wg);
        R(OX + 5, y + 2.5, .5, .5, '#1a1612'); R(OX + 6.5, y + 2.5, .5, .5, '#1a1612'); R(OX + 5, y + 3.5, .5, .5, b); R(OX + 6.5, y + 3.5, .5, .5, b);
        return;
      }
      const k = u - .7, x = OX + 6 + q4(Math.sin(k * 3) * 3), y = OY - 1 + q4(Math.cos(k * 2.5) * 1.5), fl = Math.floor(u * 12) % 2;
      R(x - 1, y - 1, .5, 1, b); R(x + .5, y - 1, .5, 1, b); R(x - 1, y, 2, 2.5, b); R(x - .75, y + .5, .5, .5, '#e0e0a0'); R(x + .25, y + .5, .5, .5, '#e0e0a0');
      if (fl) { R(x - 4, y - 1, 3, 1, wg); R(x + 1, y - 1, 3, 1, wg); } else { R(x - 4, y + 1, 3, 1, wg); R(x + 1, y + 1, 3, 1, wg); R(x - 3, y, 2, 1, wg); R(x + 1, y, 2, 1, wg); }
    } },
  { mob: 'フグ', name: 'プクーッと ふくらむ', how: '黄色い 小さな魚。おどろくと トゲトゲに プクーッと ふくらむ', say: 'プクーッ',
    form(R, u) {
      const c = '#f2c94c', puff = u > .8 && u < 1.7, y = OY + 1 + q4(Math.sin(u * 3) * .5), fl = Math.floor(u * 6) % 2;
      if (puff) {
        R(OX + 2, y - 2, 8, 7, c); R(OX + 2, y + 3, 8, 2, '#f8e8a0');
        [[1, 0], [1, 3], [10, 0], [10, 3], [4, -3], [7, -3], [4, 5], [7, 5]].forEach(([x, yy]) => R(OX + x, y + yy, 1, 1, '#d8a020'));
        R(OX + 3, y - .5, 1, 1, '#1a1612'); R(OX + 3.5, y + 1.5, 1.5, .75, '#8a5a20');
      } else {
        R(OX + 4, y + 1, 4, 3, c); R(OX + 4, y + 3, 4, 1, '#f8e8a0'); R(OX + 8, y + 1 + fl * .5, 1, 2, '#e0b030');
        R(OX + 4.5, y + 1.5, .75, .75, '#1a1612'); R(OX + 5.5, y, 1, 1, '#e0b030');
      }
    } },
  { mob: 'イルカ', name: '水から ジャンプ', how: '青い 体の イルカ。水の中から ザブーンと ジャンプ', say: 'ザブーン',
    form(R, u) {
      const c = '#7a9ab8', bl = '#d8e4ee', jp = u > .5 && u < 1.5 ? Math.sin((u - .5) * Math.PI) * 5 : 0, y = OY + 3 - q4(jp), tilt = u > .5 && u < 1.5 ? (u < 1 ? -.5 : .5) : 0;
      R(OX + 1, y + 2 + tilt, 10, 3, c); R(OX + 1, y + 4 + tilt, 9, 1, bl); R(OX - 1, y + 3 + tilt * 2, 2, 1, c); R(OX + 5, y + 1, 2, 1, c);
      R(OX + 11, y + 1 - tilt, 1, 2, c); R(OX + 12, y + .5 - tilt, 1, 1, c); R(OX + 12, y + 2.5 - tilt, 1, 1, c); R(OX + 2, y + 2.5 + tilt, .75, .75, '#1a1612');
      R(OX - 2, OY + 6.5, 16, 1.5, '#3a8ad0', .55); R(OX - 2, OY + 6.5, 16, .25, '#bfe6ff', .9);
      const sp = seg(u, 1.4, 1.8); if (sp > 0 && sp < 1) [-2, 0, 2].forEach(d => R(OX + 6 + d * (1 + sp * 2), OY + 6 - Math.sin(sp * Math.PI) * 3, .75, .75, '#bfe6ff', 1 - sp));
    } },
  { mob: 'ウィッチ', name: 'ポーションを ゴクッ', how: 'とんがり ぼうしの 魔女。ピンクの ポーションを ゴクッと のむ', say: 'ゴクッ',
    form(R, u) {
      const w = walk(u, .4), y = OY + w.hop, drink = u > .8 && u < 1.4, glow = seg(u, 1.4, 1.9);
      legs(R, '#3a2a40', w);
      R(OX + 2, y + 3, 8, 3, '#4a2a5a'); R(OX + 2, y, 8, 3, '#c0906a'); R(OX + 3, y + 1, 1, 1, '#3a8a3a'); R(OX + 8, y + 1, 1, 1, '#3a8a3a');
      R(OX + 5, y + 1, 2, 3, '#a8724f'); R(OX + 6.5, y + 2.5, .5, .5, '#5a8a3a');
      R(OX + 1, y - 1, 10, 1, '#2a1a30'); R(OX + 3, y - 2, 6, 1, '#2a1a30'); R(OX + 4, y - 3, 4, 1, '#2a1a30'); R(OX + 5, y - 4, 2, 1, '#2a1a30'); R(OX + 3, y - 1.5, 6, .5, '#4a8a3a');
      if (drink) { R(OX + 5, y + 3, 2, 2, '#f070c0'); R(OX + 5.5, y + 2.5, 1, .5, '#a0a0b0'); }
      else if (u <= .8) { R(OX + 10, y + 3, 1.5, 2, '#f070c0'); R(OX + 10.25, y + 2.5, 1, .5, '#a0a0b0'); }
      if (glow > 0 && glow < 1) [[0, 1], [11, 0], [1, -3], [10, -3]].forEach(([x, yy]) => { R(OX + x - .25, y + yy, 1.5, .5, '#f070c0', 1 - glow); R(OX + x + .25, y + yy - .5, .5, 1.5, '#f070c0', 1 - glow); });
    } },
  { mob: 'ファントム', name: 'すいーっと 急降下', how: '青い つばさの 空のモブ。緑の目で すいーっと 急降下', say: 'ヒュー',
    form(R, u) {
      const c = '#4a5a8a', d = '#34406a', x = OX + 6 + q4(Math.sin(u * 2.5) * 3), y = OY - 3 + q4(u > .8 && u < 1.6 ? Math.sin((u - .8) / .8 * Math.PI) * 5 : 0), fl = Math.floor(u * 8) % 2;
      R(x - 2, y + 1, 4, 2, c); R(x - 3, y + 1.5, 1, 1, c); R(x + 2, y + 1.5, 2, 1, d); R(x + 4, y + 2, 1, .5, d);
      R(x - 1.5, y + 1.5, .5, .5, '#7aff7a'); R(x - .5, y + 1.5, .5, .5, '#7aff7a');
      if (fl) { R(x - 6, y, 4, 1, c); R(x + 2, y, 4, 1, c); R(x - 7, y - 1, 1, 1, d); R(x + 6, y - 1, 1, 1, d); }
      else { R(x - 6, y + 2, 4, 1, c); R(x + 2, y + 2, 4, 1, c); R(x - 7, y + 3, 1, 1, d); R(x + 6, y + 3, 1, 1, d); }
    } },
  { mob: 'ガーディアン', name: 'トゲと ビーム', how: '海の 青緑の モブ。オレンジの トゲを 出して 大きな目から ビーム', say: 'ビビビ',
    form(R, u) {
      const c = '#5aa898', y = OY - 1 + q4(Math.sin(u * 2) * .75), sp = u > .5 && u < 1.6 ? 1 : 0, bm = seg(u, .9, 1.5);
      if (sp) [[1, 1], [1, 4], [10.5, 1], [10.5, 4], [3, -1], [8, -1], [3, 6], [8, 6]].forEach(([x, yy]) => R(OX + x, y + yy, 1, 1, '#e08a3a'));
      R(OX + 2, y, 8, 6, c); R(OX + 2, y, 8, 1, '#7ac0b0'); R(OX + 2, y + 5, 8, 1, '#3a8878');
      R(OX + 4.5, y + 2, 3, 2, '#f4f0e0'); R(OX + 6 + (bm ? .5 : 0), y + 2.5, 1, 1, '#c84a2a');
      if (bm > 0 && bm < 1) R(OX + 7.5, y + 2.75, 6 * bm, .5, mix('#9a5ae0', '#ffe060', bm));
    } },
  { mob: 'ホグリン', name: 'ドドドと とっしん', how: 'ピンクの 大きな体に きば。頭を 下げて ドドドと とっしん', say: 'ドドド',
    form(R, u) {
      const c = '#c87a6a', ch = u > .7 && u < 1.5, w = walk(u, ch ? 2 : .5), y = OY + w.hop + (ch ? .5 : 0);
      const dx = q4(ch ? -Math.sin((u - .7) / .8 * Math.PI) * 3 : 0), Q = (x, yy, ww, h, cc, a) => R(x + dx, yy, ww, h, cc, a);
      legs(Q, '#9a5a4a', w);
      Q(OX + 1, y - 1, 10, 7, c); for (let i = 0; i < 5; i++) Q(OX + 4 + i * 1.5, y - 1.5, .75, 1, '#7a4a3a');
      Q(OX + 1, y + 1, 1, 1, '#1a1612'); Q(OX, y + 2.5, 3, 2, '#e09a8a'); Q(OX + .5, y + 3, .5, .5, '#7a3a30');
      Q(OX - .5, y + 1.5, .75, 1.5, '#f0ead8'); Q(OX + 2.5, y + 1.5, .75, 1.5, '#f0ead8');
      if (ch) for (let i = 0; i < 3; i++) R(OX + 11 + i, OY + 7 - (i % 2), .75, .75, '#a89a8a', .7);
    } },
  { mob: 'マグマキューブ', name: 'ぽよんと 開く', how: '黒い 四角に オレンジの すじ。はねると 体が 開いて 中が 光る', say: 'ぼよーん',
    form(R, u) {
      const ph = u % .9 / .9, h = ph < .7 ? Math.sin(ph / .7 * Math.PI) * 4 : 0, gap = q4(h > 1 ? (h - 1) / 3 * 1.5 : 0), sq = ph >= .7;
      const ww = sq ? 9 : 8, cx = OX + 6, bot = OY + 8 - q4(h), hh = 6;
      for (let i = 0; i < 3; i++) {
        const yy = bot - hh + i * 2 - (2 - i) * gap;
        R(cx - ww / 2, yy, ww, 2, '#5a1a10'); R(cx - ww / 2, yy + 1.5, ww, .5, gap ? '#ffb030' : '#f08a20');
      }
      if (gap) R(cx - 2, bot - hh + 1, 4, hh - 1, '#ffd060', .8);
      const top = bot - hh - 2 * gap; R(cx - 2, top + .5, 1, 1, '#ffe060'); R(cx + 1, top + .5, 1, 1, '#ffe060');
    } },
];

// 変身の流れ：オレンジ（〜1.2秒）→ ピカッと金色に光る（1.2〜1.6秒）→ 新しい すがた（勤務指定表の白い背景でも見える色）
const henshin = f => ({ mob: f.mob, name: f.name, how: f.how,
  draw(g, t) {
    if (t < 1.2) { mascotIdle(g, t); return; }
    const k = seg(t, 1.2, 1.6);
    if (k < 1) {
      if (k < .5) mascotIdle(g, t, { col: () => '#ffd84a' }); else f.form(grid(g, true), 0);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = 4 + k * 14; g.R(24 + Math.cos(a) * r, 32 + Math.sin(a) * r * .8, 1.5, 1.5, '#ffb04a'); }
      g.T('ピカッ', 24, 10, 6, '#ffd84a');
      return;
    }
    f.form(grid(g), t - 1.6);
    g.T(f.say, 24, 8, 5, '#ffffff', seg(t, 2.6, 2.8));
  } });
return [FORMS, FORMS3, FORMS4].map(list => list.map(henshin));
})();

// ---------- オレンジのキャラクターが HUNTER×HUNTER の90人に変身する（CC_EXTRA の 301〜390 番。1回目の30人が 301〜330、2回目の20人が 331〜350、3回目の20人が 351〜370、4回目の20人が 371〜390） ----------
//   十二支の12人（ピヨン … サイユウ）と ゴン・キルアたち18人。絵は 三大元素（sandai-genso）の 変身図鑑と 同じ。
//   その人ごとに 変わり方（金色に光る・上から・けむり など）と 決めの動き（パンチ・おじぎ など）が ちがう
const HXH_PATTERNS = (() => {
// 30人の すがた（d.b は体といっしょに動く、d.gn は地面の高さ。どちらも キャラクターの左上からの マス）
const ORANGE = '#d97757', EYE = '#1a1612';

// 小物の道具
const sleeve = (d, c) => { d.b(1, 2 + d.la, 1, 2, c); d.b(10, 2 + d.ra, 1, 2, c); };   // そで（手の先は残す）
const fullArm = (d, c) => { d.b(0, 2 + d.la, 2, 2, c); d.b(10, 2 + d.ra, 2, 2, c); };
function star(d, x, y, c) { d.b(x, y - .5, .5, 1.5, c); d.b(x - .5, y, 1.5, .5, c); }
function spots(d, list, c) { list.forEach(([x, y, w, h]) => d.b(x, y, w, h, c)); }

const COS = [
  { name: 'うさぎ', who: 'ピヨン', note: '卯（う）・オレンジの巻き毛と うさぎの耳', zodiac: '卯',
    front(d) {
      const tilt = Math.sin(d.t * 4) > .6 ? .5 : 0;
      d.b(3, -5 + tilt, 1.5, 5, '#f4f0f4'); d.b(7.5, -5, 1.5, 5, '#f4f0f4');
      d.b(3.5, -4.5 + tilt, .5, 3.5, '#ff9db8'); d.b(8, -4.5, .5, 3.5, '#ff9db8');
      d.b(1.6, -1, 8.8, 1.4, '#f08a30'); d.b(1.4, 0, 1.2, 2.6, '#f08a30'); d.b(9.4, 0, 1.2, 2.6, '#f08a30'); d.b(1, 2.2, 1, 1, '#f08a30'); d.b(10, 2.2, 1, 1, '#f08a30');
      d.b(2.6, 2, 1, .5, '#ff9db8'); d.b(8.4, 2, 1, .5, '#ff9db8');
      d.b(2, 3.5, 8, 2.5, '#2a2030'); d.b(2, 5.2, 8, .8, '#ff7ab8'); d.b(5, 3.5, 2, 1.7, '#f4f0f4');
      d.b(5, 3.5, .7, .7, EYE); d.b(6.3, 3.5, .7, .7, EYE); d.b(5.7, 3.7, .6, .4, EYE);
      d.b(5.5, 4.6, 1, .6, '#ff6aa0');
      sleeve(d, '#2a2030');
    },
    leg: i => i % 2 ? '#ff9db8' : '#2a2030' },

  { name: 'さむらい', who: 'サッチョウ', note: '午（うま）・長い黒髪と むらさきの着物・刀', zodiac: '午',
    back(d) { d.b(4.5, -1, 3, 1, '#3a3650'); d.b(10, -.5, 1.4, 6, '#3a3650'); },
    front(d) {
      d.b(2, -.6, 8, 1, '#3a3650'); d.b(5, -1.8, 2, 1.4, '#3a3650'); d.b(1.4, -.2, .8, 3, '#3a3650'); d.b(9.8, -.2, .8, 3, '#3a3650');
      d.b(2.6, .3, 1.6, .4, '#3a3650'); d.b(7.8, .3, 1.6, .4, '#3a3650'); d.b(0, 3.6 + d.la, 1, .4, '#2a3a4a'); d.b(11, 3.6 + d.ra, 1, .4, '#2a3a4a');
      d.b(2, 3, 8, 3, '#7a4fa8'); d.b(4, 3, 1, 1, '#4a2c78'); d.b(5, 3.5, 1, 1, '#4a2c78'); d.b(7, 3, 1, 1, '#4a2c78'); d.b(6, 3.5, 1, 1, '#4a2c78');
      d.b(2, 4.6, 8, .8, '#a0242a');
      d.b(7.5, 2.4, .6, 2.2, '#e8e2c8'); d.b(7.2, 4.4, 1.2, .4, '#c8a040');
      sleeve(d, '#7a4fa8');
    },
    leg: i => '#7a4fa8',
    legs(d) { d.gn(2, 6.5, .6, .6, '#e04a6a'); d.gn(9, 6.8, .6, .6, '#e04a6a'); } },

  { name: '黒いドレス', who: 'ゲル', note: '巳（み）・長い黒髪と 黒いドレス', zodiac: '巳',
    back(d) { d.b(1.5, -1, 9, 7, '#3a3650'); },
    front(d) {
      d.b(2, -1, 8, 1.2, '#3a3650'); d.b(2, 0, .8, 3.5, '#3a3650'); d.b(9.2, 0, .8, 3.5, '#3a3650');
      d.b(2.8, 3, 6.4, 3, '#0c0c10'); d.b(5, 3, 2, .6, ORANGE); d.b(5.5, 3.6, 1, .5, ORANGE);
      d.b(5.2, 2.3, 1.6, .4, '#8a2a5a');
      sleeve(d, '#0c0c10');
    },
    leg: () => '#0c0c10',
    legs(d) { d.gn(2, 6, 8, 2, '#0c0c10'); } },

  { name: '白い師匠', who: 'ボトバイ', note: '辰（たつ）・広がる白髪とひげ・赤い長いコート', zodiac: '辰',
    back(d) {
      d.b(-1, -2.5, 4, 4, '#eeeeee'); d.b(9, -2.5, 4, 4, '#eeeeee');
      [[-2, -3.5], [-1, -4.2], [1, -3.6], [10, -3.6], [12, -4.2], [13, -3.5], [-2, 0], [13, 0]].forEach(([x, y]) => d.b(x, y, 1.2, 1.4, '#eeeeee'));
    },
    front(d) {
      d.b(2, -.4, 1.6, 1.2, '#eeeeee'); d.b(8.4, -.4, 1.6, 1.2, '#eeeeee');
      d.b(2.5, .4, 2, .5, '#ffffff'); d.b(7.5, .4, 2, .5, '#ffffff');
      d.b(3.5, 2, 5, .8, '#dcdcdc'); d.b(3, 2.5, 1, .8, '#dcdcdc'); d.b(8, 2.5, 1, .8, '#dcdcdc');
      d.b(2, 3.3, 8, 2.7, '#c0262c'); d.b(5.7, 3.3, .6, 2.7, '#2a1a1a'); d.b(3, 4.4, 6, .4, '#2a1a1a');
      fullArm(d, '#2a2226'); d.b(0, 2 + d.la, 2, .6, '#c0262c'); d.b(10, 2 + d.ra, 2, .6, '#c0262c');
    },
    leg: () => '#c0262c',
    legs(d) { d.gn(1.6, 6, 8.8, 1.2, '#c0262c'); d.gn(5.7, 6, .6, 1.2, '#2a1a1a'); } },

  { name: 'アフロ', who: 'ギンタ', note: '未（ひつじ）・大きなアフロと はちまき・青い毛皮', zodiac: '未',
    back(d) {
      d.b(0, -6, 12, 1, '#1a1a1a'); d.b(-1, -5, 14, 6, '#1a1a1a'); d.b(1, -6.8, 10, 1, '#1a1a1a');
      [[0, -4], [3, -6], [6, -5], [9, -6], [11, -3], [1, -1], [5, -3], [8, -2]].forEach(([x, y]) => d.b(x, y, .6, .6, '#3a3a3a'));
    },
    front(d) {
      d.b(2, -.6, 8, 1, '#2f5fb8'); star(d, 5.8, -.3, '#ffd23a');
      d.b(4.5, 2.2, 3, 1.4, '#3a1a1a'); d.b(5, 2.8, 2, .6, '#c05a5a');
      d.b(3, 4, 6, 2, '#2a3f8a'); d.b(4.5, 4.4, 3, 1.2, '#c0262c'); d.b(5.6, 4.4, .8, 1.2, '#f4f4f4');
      d.b(1, 3, 10, 1.2, '#8fc8f0'); [1.5, 4, 6.5, 9].forEach(x => d.b(x, 3.8, 1.2, .6, '#b8e0ff'));
    },
    leg: () => '#2a3f8a' },

  { name: '牛のカウボーイ', who: 'ミザイストム', note: '丑（うし）・白黒もようの ぼうしと服', zodiac: '丑',
    front(d) {
      d.b(0, -1, 12, 1, '#f4f4f4'); d.b(3, -3.5, 6, 2.5, '#f4f4f4'); d.b(5.5, -3.5, 1, .6, '#d0d0d0');
      spots(d, [[3.5, -3, 1.2, .8], [7, -2.4, 1.2, 1], [1, -1, 1, .6], [9.5, -1, 1.2, .6]], '#1a1a1a');
      d.b(2, 0, .6, 2.5, '#1a1a1a'); d.b(9.4, 0, .6, 2.5, '#1a1a1a');
      d.b(2, 3, 8, 3, '#f4f4f4'); spots(d, [[2.5, 3.5, 1.5, 1], [7, 4.5, 2, 1], [4.5, 5, 1, .8]], '#1a1a1a');
      d.b(5.8, 3, .4, 3, '#c8a040');
      sleeve(d, '#f4f4f4');
    },
    leg: i => i === 1 || i === 2 ? '#1a1a1a' : '#f4f4f4' },

  { name: '羽の踊り子', who: 'クルック', note: '酉（とり）・羽かざりと 白いつばさ', zodiac: '酉',
    back(d) {
      const fl = Math.sin(d.t * 6) > 0 ? .5 : 0;
      d.b(-3, .5 - fl, 3, 2, '#f4f4f4'); d.b(-4, -.5 - fl, 2, 1.5, '#f4f4f4'); d.b(-2, 2.5, 2, 1, '#dde8f0');
      d.b(12, .5 - fl, 3, 2, '#f4f4f4'); d.b(14, -.5 - fl, 2, 1.5, '#f4f4f4'); d.b(12, 2.5, 2, 1, '#dde8f0');
      for (let i = -3; i <= 3; i++) {
        const an = -Math.PI / 2 + i * .32;
        for (let s = 1; s <= 5; s += .5) d.b(5.75 + Math.cos(an) * s, -1 + Math.sin(an) * s, .6, .6, s > 4 ? '#3cb0d8' : '#f4f4f4');
      }
    },
    front(d) {
      d.b(2, -1, 8, 1.3, '#3cb0d8'); d.b(4, -1.6, 4, .8, '#3cb0d8');
      d.b(3, .6, 1, .3, '#3c7ad8'); d.b(8, .6, 1, .3, '#3c7ad8'); d.b(5.2, 2.4, 1.6, .5, '#2a5ab8');
      d.b(3, 3.2, 2.4, 1, '#3a7fd0'); d.b(6.6, 3.2, 2.4, 1, '#3a7fd0'); d.b(3, 5, 6, 1, '#3a7fd0');
      d.b(0, 3 + d.la, 1, 1, '#2a4a8a'); d.b(11, 3 + d.ra, 1, 1, '#2a4a8a');
    },
    leg: () => '#2a4a8a' },

  { name: 'ツンツン金髪', who: 'カンザイ', note: '寅（とら）・ツンツン金髪と 黄色いしまの服', zodiac: '寅',
    front(d) {
      d.b(2, -1, 8, 1.4, '#ffd23a');
      [[2, -2.5, 1.4], [4, -3.4, 1.4], [6, -3, 1.4], [8, -2.4, 1.4], [1, -1.6, 1], [10, -1.5, 1]].forEach(([x, y, w]) => d.b(x, y, w, -y - .8, '#ffd23a'));
      d.b(2.6, 1.9, .4, .4, '#a0603a'); d.b(9, 1.9, .4, .4, '#a0603a');
      d.b(4, 2.2, 4, .8, EYE); d.b(4.3, 2.3, 3.4, .5, '#ffffff');
      d.b(2, 3.2, 8, 2.8, '#ffd23a'); [3, 4.5, 7.5, 9].forEach(x => d.b(x, 3.2, .3, 2.8, '#6a5a10'));
      d.b(5.5, 3.2, 1, 2.8, '#1a1a1a');
      sleeve(d, '#1a1a1a');
    },
    leg: () => '#ffd23a' },

  { name: '緑の髪とメガネ', who: 'チードル', note: '戌（いぬ）・犬の耳の白いずきんと メガネ', zodiac: '戌',
    back(d) { d.b(1.5, -1, 9, 5, '#2fa850'); },
    front(d) {
      d.b(2, -1, 8, 1.6, '#2fa850'); d.b(2, 0, .8, 3.5, '#2fa850'); d.b(9.2, 0, .8, 3.5, '#2fa850');
      d.b(1.2, -2.2, 9.6, 1.4, '#f4f4f4'); d.b(1, -1, 1, 4, '#f4f4f4'); d.b(10, -1, 1, 4, '#f4f4f4');
      d.b(1, -3.4, 2, 1.4, '#f4f4f4'); d.b(9, -3.4, 2, 1.4, '#f4f4f4'); d.b(1.5, -3, 1, .8, '#e0d4d8'); d.b(9.5, -3, 1, .8, '#e0d4d8');
      const fr = (x) => { d.b(x - .5, .4, 2, .3, '#3a3030'); d.b(x - .5, 1.9, 2, .3, '#3a3030'); d.b(x - .5, .4, .3, 1.8, '#3a3030'); d.b(x + 1.2, .4, .3, 1.8, '#3a3030'); };
      fr(3); fr(8); d.b(4.5, .9, 2.5, .3, '#3a3030');
      d.b(2.8, 3, 6.4, 3, '#a8e0c0'); d.b(5.5, 3, 1, 3, '#5fb888'); d.b(2.8, 3, 6.4, .5, '#5fb888');
      sleeve(d, '#a8e0c0');
    },
    leg: () => '#a8e0c0',
    legs(d) { d.gn(2, 6, 8, 1.6, '#a8e0c0'); d.gn(2, 7.2, 8, .4, '#5fb888'); } },

  { name: 'ニット帽とマフラー', who: 'ジン', note: '亥（い）・頭の布と 青いマフラー', zodiac: '亥',
    front(d) {
      d.b(1.5, -2.2, 9, 2.4, '#7d8a9a'); d.b(1.5, -.3, 9, .8, '#6a7686'); d.b(3, -2.2, .4, 2, '#6a7686'); d.b(6, -2.2, .4, 2, '#6a7686');
      d.b(2.6, .4, 1.6, .4, '#3a1a1a'); d.b(7.8, .4, 1.6, .4, '#3a1a1a');
      d.b(4.5, 2.4, 3, .4, '#5a2a1a');
      d.b(2, 4, 8, 2, '#7fa6d8'); d.b(2, 5, 8, .5, '#2a3f6a');
      d.b(1.5, 2.8, 9, 1.3, '#1f3a6e'); d.b(3, 3.8, 1.2, 2.2, '#1f3a6e');
      sleeve(d, '#7fa6d8');
    },
    leg: () => '#2a3f6a' },

  { name: 'ちゃいろのスーツ', who: 'パリストン', note: '子（ね）・金髪と しまもようのスーツ', zodiac: '子',
    front(d) {
      d.b(2, -1, 8, 1.4, '#f0d060'); d.b(1.6, -1.6, 5, .8, '#f0d060'); d.b(2, 0, .6, 1.5, '#f0d060');
      d.b(2, 3, 8, 3, '#7a4424'); [3, 4.2, 7.8, 9].forEach(x => d.b(x, 3, .2, 3, '#a8703a'));
      d.b(4.8, 3, 2.4, 1.6, '#f4f4f4'); d.b(5.6, 3, .8, 2.4, '#a0242a');
      sleeve(d, '#7a4424');
    },
    leg: () => '#6a3a1e' },

  { name: '猿の王さま', who: 'サイユウ', note: '申（さる）・金のかんむりと くるりしっぽ', zodiac: '申',
    back(d) {
      const sw = Math.sin(d.t * 5) * .6;
      for (let s = 0; s < 1; s += .06) {
        const x = 10 + s * 4 + Math.sin(s * 6) * 1.2 + sw * s, y = 5 - s * 5 + Math.cos(s * 6) * .5;
        d.b(x, y, .8, .8, '#8a5228');
      }
    },
    front(d) {
      d.b(2, -.6, 8, .9, '#8a5228');
      d.b(2.5, -2, 7, 1.2, '#f2c230'); [3, 5.4, 7.8].forEach(x => d.b(x, -3, 1, 1, '#f2c230')); d.b(5.6, -1.7, .6, .6, '#c0262c');
      d.b(.8, .4, 1.2, 1.4, '#c08850'); d.b(10, .4, 1.2, 1.4, '#c08850');
      d.b(3.6, 1.8, 4.8, 1.2, '#f0c890'); d.b(4.6, 2.3, 2.8, .4, '#6a3a1e');
      d.b(2, 3.2, 8, 2.8, '#1a1a1a'); d.b(4, 3.4, 4, 2.4, '#e8b060'); d.b(5.8, 3.4, .4, 2.4, '#c08840'); d.b(4, 4.6, 4, .3, '#c08840');
      d.b(2, 5.6, 8, .4, '#f2c230');
      sleeve(d, '#e8b060');
    },
    leg: () => '#1a1a1a',
    legs(d) { d.gn(2, 7, 8, .3, '#f2c230'); } },

  { name: 'ツンツン黒髪', who: 'ゴン', note: '先が緑のツンツン頭・緑の服と つりざお',
    back(d) {
      // つりざお（右手から上へ）と ゆれる糸
      for (let i = 0; i < 9; i++) d.b(11 + i * .45, 2.6 + d.ra - i * .8, .5, .5, '#a07040');
      const sw = Math.sin(d.t * 3) * .6;
      for (let i = 1; i < 6; i++) d.b(15 + sw * i / 5, -4.6 + d.ra + i * .9, .25, .6, '#d8d8e8');
    },
    front(d) {
      d.b(2, -1.4, 8, 1.8, '#3a3650');
      [[1.6, -3.2, 1.2], [3.2, -4.6, 1.3], [5.2, -5.4, 1.4], [7.2, -4.6, 1.3], [8.8, -3.2, 1.2], [.8, -1.6, 1], [10.2, -1.6, 1]].forEach(([x, y, w]) => {
        d.b(x, y, w, -y - 1, '#3a3650'); d.b(x, y, w, .6, '#2f8a3a');
      });
      d.b(4.6, 2.3, 2.8, .6, '#7a2a1a');
      d.b(2, 3, 8, 3, '#2fa040'); d.b(5.7, 3, .6, 2.2, '#c04a2a'); d.b(2, 5.3, 8, .7, '#1e6a2a');
      sleeve(d, '#2fa040');
    },
    leg: () => '#2fa040',
    legs(d) { d.gn(2, 7.2, 8, .8, '#2a5a2a'); } },

  { name: 'ツンツン銀髪', who: 'キルア', note: 'ふわふわの銀髪・水色のシャツと ヨーヨー',
    front(d) {
      d.b(1.6, -1.2, 8.8, 1.8, '#e8eaf4');
      [[1, -2.4], [2.6, -3.4], [4.6, -3.8], [6.6, -3.6], [8.4, -3], [10, -2]].forEach(([x, y]) => d.b(x, y, 1.4, -y - .8, '#e8eaf4'));
      d.b(1.2, 0, .8, 1.4, '#e8eaf4'); d.b(10, 0, .8, 1.4, '#e8eaf4');
      d.b(3, 1, 1, 1, '#3a6ad8'); d.b(8, 1, 1, 1, '#3a6ad8');
      d.b(4.8, 2.3, 2.4, .5, '#7a2a1a');
      d.b(2, 3, 8, 3, '#bcdcf4'); d.b(4.6, 3, 2.8, .7, '#1e3a8a'); d.b(5.4, 3.7, 1.2, .5, '#1e3a8a');
      sleeve(d, '#bcdcf4'); d.b(1, 3.4 + d.la, 1, .6, '#2a4ab0'); d.b(10, 3.4 + d.ra, 1, .6, '#2a4ab0');
      const yo = 2 + Math.abs(Math.sin(d.t * 5)) * 3.5;
      d.b(11.3, 4 + d.ra, .2, yo, '#d8d8e8'); d.b(10.8, 4 + d.ra + yo, 1.2, 1.2, '#9aa0b0');
    },
    eye: '#3a6ad8',
    leg: () => '#1e2a5a',
    legs(d) { d.gn(2, 7.2, 8, .8, '#6a3a8a'); } },

  { name: 'くさりの使い手', who: 'クラピカ', note: '金髪のおかっぱ・青い上着と くさり',
    back(d) { d.b(1.5, -1, 9, 4.5, '#f2d24a'); },
    front(d) {
      d.b(2, -1, 8, 1.4, '#f2d24a'); d.b(2, 0, .8, 2.8, '#f2d24a'); d.b(9.2, 0, .8, 2.8, '#f2d24a');
      d.b(3, 3, 6, 3, '#2a4ca8'); d.b(3.6, 3.4, 1, 1.8, '#f2c230'); d.b(7.4, 3.4, 1, 1.8, '#f2c230'); d.b(5.6, 3, .8, 1.2, '#c0262c');
      d.b(2, 3, 1, 3, '#f4f0e0'); d.b(9, 3, 1, 3, '#f4f0e0');
      sleeve(d, '#f4f0e0');
      for (let i = 0; i < 7; i++) {
        const x = 11.4 + Math.sin(d.t * 4) * i * .25, y = 4 + d.ra + i * .7;
        d.b(x, y, i % 2 ? .4 : .8, .5, '#9aa0aa');
      }
    },
    leg: () => '#2a4ca8' },

  { name: '奇術師', who: 'ヒソカ', note: 'ほおに星となみだ・トランプを ひらり',
    front(d) {
      d.b(2, -1, 8, 1.2, '#e8503a');
      [[2.5, -2.4], [4.5, -3], [6.5, -3], [8.5, -2.4]].forEach(([x, y]) => d.b(x, y, 1.2, -y - .8, '#e8503a'));
      star(d, 3.3, 2.3, '#ffcf3a'); d.b(8.3, 2, .5, .8, '#4ac0f0');
      d.b(2, 3, 8, 3, '#f4f0f4'); d.b(2, 4.6, 8, .8, '#e8503a');
      d.b(3, 3.4, 1, .8, '#3a2a6a'); d.b(7.6, 3.4, 1, .8, '#3a2a6a');
      sleeve(d, '#f4dce6');
      const fl = Math.floor(d.t * 3) % 3;
      for (let i = 0; i < 3; i++) {
        const x = 11.6 + i * .8, y = 1 + d.ra - i * .4 - (i === fl ? .4 : 0);
        d.b(x, y, .9, 1.3, '#f4f4f4'); d.b(x + .2, y + .4, .5, .5, i === 1 ? '#1a1a1a' : '#e02a3a');
      }
    },
    leg: () => '#f4f0f4' },

  { name: 'まるメガネのスーツ', who: 'レオリオ', note: 'まるメガネと こん色のスーツ・かばん',
    front(d) {
      d.b(2, -1, 8, 1.3, '#3a3650'); d.b(2, 0, .6, 1.2, '#3a3650'); d.b(9.4, 0, .6, 1.2, '#3a3650');
      const fr = (x) => { d.b(x - .4, .3, 1.8, .3, '#2a2a30'); d.b(x - .4, 1.7, 1.8, .3, '#2a2a30'); d.b(x - .4, .3, .3, 1.7, '#2a2a30'); d.b(x + 1.1, .3, .3, 1.7, '#2a2a30'); };
      fr(3); fr(8); d.b(4.4, .8, 3.3, .3, '#2a2a30');
      d.b(2, 3, 8, 3, '#1e2a5a'); d.b(4.8, 3, 2.4, 1.6, '#f4f4f4'); d.b(5.6, 3, .8, 2.4, '#c0262c');
      sleeve(d, '#1e2a5a');
      d.b(-1.2, 4 + d.la, 2.6, 2, '#8a5530'); d.b(-.3, 3.6 + d.la, .8, .4, '#5a3418');
    },
    leg: () => '#1e2a5a' },

  { name: 'ねこ耳', who: 'ネフェルピトー', note: '白いふわふわ髪と ねこ耳・ゆれるしっぽ',
    back(d) {
      const sw = Math.sin(d.t * 4) * .8;
      for (let s = 0; s < 1; s += .07) d.b(10 + s * 3, 5 - s * 6 + Math.sin(s * 3) * sw, .8, .8, '#c8c0dc');
    },
    front(d) {
      d.b(1.6, -1, 8.8, 1.8, '#ecebf4'); [[1.2, 0], [10, 0], [3, -1.5], [7, -1.5]].forEach(([x, y]) => d.b(x, y, 1, 1, '#ecebf4'));
      d.b(2, -2.6, 1.4, 1.6, '#ecebf4'); d.b(8.6, -2.6, 1.4, 1.6, '#ecebf4');
      d.b(2.4, -2.1, .6, 1, '#f4a0b8'); d.b(9, -2.1, .6, 1, '#f4a0b8');
      d.b(3, 1, 1, 1, '#d84a4a');  d.b(8, 1, 1, 1, '#d84a4a');
      d.b(2, 3, 8, 3, '#1e2a5a'); [[4, 3.6], [7.4, 3.6], [4, 4.8], [7.4, 4.8]].forEach(([x, y]) => d.b(x, y, .6, .6, '#f2c230'));
      sleeve(d, '#1e2a5a');
    },
    eye: '#d84a4a',
    leg: () => '#1e2a5a',
    legs(d) { d.gn(2, 7, 8, .4, '#d87a5a'); } },

  { name: '虫のかぶと', who: 'メルエム', note: '緑のかぶとと しっぽ',
    back(d) {
      const sw = Math.sin(d.t * 3) * .5;
      for (let s = 0; s < 1; s += .08) d.b(-1 - s * 3, 5 - s * 4 + Math.sin(s * 4) * sw, 1, 1, Math.floor(s * 10) % 3 ? '#4e8a62' : '#7a4fa8');
    },
    front(d) {
      d.b(1.5, -2.6, 9, 3, '#3d7a52'); d.b(1, -.2, 10, .7, '#2e5e3e'); d.b(3, -2.6, 6, .6, '#5aa070');
      d.b(2.5, -3.6, 1, 1.2, '#7a4fa8'); d.b(8.5, -3.6, 1, 1.2, '#7a4fa8');
      d.b(2, 3, 8, 3, '#8ab890'); d.b(5.8, 3.2, .4, 2.6, '#5a8a62'); d.b(3.5, 4.4, 5, .3, '#5a8a62');
      d.b(2, 3, 1.4, 3, '#1a1a1a'); d.b(8.6, 3, 1.4, 3, '#1a1a1a');
      fullArm(d, '#8ab890'); d.b(0, 2 + d.la, .6, 2, '#7a4fa8'); d.b(11.4, 2 + d.ra, .6, 2, '#7a4fa8');
    },
    skin: '#9ac8a0',
    leg: () => '#3d6a4a' },

  { name: '長老', who: 'ネテロ', note: '白いまゆと 長いひげ・ちょんまげ',
    front(d) {
      d.b(5.4, -2.2, 1.2, 2.2, '#f4f4f4'); d.b(5.2, -.6, 1.6, .5, '#3c7ad8');
      d.b(2.2, .2, 2.4, .6, '#f4f4f4'); d.b(2, .6, .8, 1, '#f4f4f4'); d.b(7.4, .2, 2.4, .6, '#f4f4f4'); d.b(9.2, .6, .8, 1, '#f4f4f4');
      d.b(2, 3, 8, 3, '#f4f0e8'); d.b(2, 4.8, 8, .6, '#7a8a9a');
      d.b(4, 2.2, 4, 2.6, '#f4f4f4'); d.b(4.6, 4.8, 2.8, 1, '#f4f4f4'); d.b(5.4, 5.8, 1.2, .8, '#f4f4f4');
      d.b(4, 2.2, 4, .4, '#dcdcdc');
      sleeve(d, '#f4f0e8');
    },
    leg: () => '#f4f0e8',
    legs(d) { d.gn(1.6, 7.4, 2, .6, '#3a2a1a'); d.gn(8.4, 7.4, 2, .6, '#3a2a1a'); } },

  { name: 'ちょうちょの羽', who: 'シャウアプフ', note: 'すきとおる羽で ひらひら',
    back(d) {
      const k = .55 + .45 * Math.abs(Math.sin(d.t * 6));
      d.a(.8, () => {
        d.b(2 - 6 * k, -2, 6 * k, 4, '#8a6ab8'); d.b(2 - 4 * k, 2, 4 * k, 3, '#7a5aa8');
        d.b(10, -2, 6 * k, 4, '#8a6ab8'); d.b(10, 2, 4 * k, 3, '#7a5aa8');
        d.b(2 - 4 * k, -1, 2 * k, 1.5, '#c8a8e8'); d.b(10 + 2 * k, -1, 2 * k, 1.5, '#c8a8e8');
      });
    },
    front(d) {
      d.b(2, -1, 8, 1.6, '#f2d24a'); d.b(2, 0, .8, 2.6, '#f2d24a'); d.b(9.2, 0, .8, 2.6, '#f2d24a');
      d.b(3, -3, .4, 2, '#1a1a1a'); d.b(2.4, -3.4, .8, .5, '#1a1a1a'); d.b(8.6, -3, .4, 2, '#1a1a1a'); d.b(8.8, -3.4, .8, .5, '#1a1a1a');
      d.b(2, 3, 8, 3, '#1a2448'); d.b(5.8, 3, .4, 3, '#0e1430'); d.b(2, 4.8, 8, .5, '#5a4a3a');
      sleeve(d, '#1a2448');
    },
    eye: '#c8a020',
    leg: () => '#1a2448' },

  { name: 'くるくるツインテール', who: 'ビスケ', note: 'くるくるツインテールと ピンクのドレス',
    back(d) {
      const bob = Math.sin(d.t * 5) > 0 ? .3 : 0;
      [-1.8, 11.8].forEach(x => { for (let i = 0; i < 5; i++) d.b(x - (i % 2 ? .3 : 0), -.5 + i * 1.1 + bob, 2 + (i % 2 ? .6 : 0), 1.1, i % 2 ? '#f0c830' : '#ffe060'); });
    },
    front(d) {
      d.b(2, -1, 8, 1.6, '#ffe060'); d.b(2, 0, .8, 1.4, '#ffe060'); d.b(9.2, 0, .8, 1.4, '#ffe060');
      d.b(.6, -1.6, 2.4, 1, '#ff5a9a'); d.b(9, -1.6, 2.4, 1, '#ff5a9a'); d.b(1.5, -1.4, .6, .6, '#c02a6a'); d.b(9.9, -1.4, .6, .6, '#c02a6a');
      d.b(2.6, 2, 1, .5, '#ff9db8'); d.b(8.4, 2, 1, .5, '#ff9db8');
      d.b(1.4, 3, 9.2, 1.8, '#e04a9a'); d.b(5, 3.2, 2, .8, '#ff9dc8');
      d.b(2, 4.8, 8, 1.2, '#ff7ab8'); d.b(5.8, 4.8, .4, 1.2, '#c02a6a');
    },
    leg: () => '#ff7ab8',
    legs(d) { d.gn(1, 6, 10, 1, '#ff7ab8'); d.gn(1, 6.8, 10, .4, '#ffe0f0'); } },

  { name: '十字の額', who: 'クロロ', note: 'おでこの十字・白い毛皮の黒いコートと 本',
    front(d) {
      d.b(2, -1.2, 8, 1.6, '#3a3650'); d.b(2, 0, .8, 1.4, '#3a3650'); d.b(9.2, 0, .8, 1.4, '#3a3650');
      d.b(5.8, -.1, .4, 1.3, '#3a3650'); d.b(5.4, .3, 1.2, .4, '#3a3650');
      d.b(2, 3, 8, 3, '#3a3650'); d.b(4.8, 3.4, 2.4, 2.6, '#3a3a6a'); d.b(5.8, 3.4, .4, 2.6, '#c8a040');
      d.b(1.4, 2.6, 3.4, 1.4, '#f4f0e8'); d.b(7.2, 2.6, 3.4, 1.4, '#f4f0e8');
      sleeve(d, '#3a3650');
      d.b(-1, 3.6 + d.la, 2.2, 2.6, '#8a4a2a'); d.b(-.8, 3.8 + d.la, 1.8, .3, '#e0c080');
    },
    leg: () => '#3a3650' },

  { name: '青いぼうし', who: 'カイト', note: '長い白髪と 大きな青いぼうし・大がま',
    back(d) {
      d.b(1, -1, 10, 7, '#e4e4ea');
      d.b(12, -5 + d.ra, .6, 10, '#7a5a3a'); d.b(12.6, -5 + d.ra, 2.6, .8, '#c8ccd8'); d.b(14.4, -4.2 + d.ra, .8, 1.4, '#c8ccd8');
    },
    front(d) {
      d.b(.6, -2, 10.8, 1.6, '#2a5ab8'); d.b(1.6, -3.2, 8.6, 1.4, '#3a6ad0'); d.b(1.6, -.5, 8.8, .6, '#1e4090');
      d.b(2, 0, .8, 3, '#e4e4ea'); d.b(9.2, 0, .8, 3, '#e4e4ea');
      d.b(2, 2.6, 8, 1, '#9aa8b0');
      d.b(2, 3.4, 8, 2.6, '#6a7a88'); d.b(5.6, 3.4, .8, 2.6, '#4a5a68');
      sleeve(d, '#6a7a88');
    },
    leg: () => '#4a5a68' },

  { name: '金のはちまき', who: 'アルカ', note: '長い黒髪と 金のヘアバンド・ピンクの着物',
    back(d) { d.b(1.4, -1, 9.2, 6.4, '#3a3650'); },
    front(d) {
      d.b(2, -1, 8, 1.4, '#3a3650'); d.b(2, 0, .8, 3.8, '#3a3650'); d.b(9.2, 0, .8, 3.8, '#3a3650');
      d.b(1.8, -1.6, 8.4, .7, '#e8b830');
      d.b(3, 1, 1, 1, '#3a6ad8'); d.b(8, 1, 1, 1, '#3a6ad8');
      d.b(2.8, 3, 6.4, 3, '#f4a0b8'); d.b(4.6, 3, 1, 1.2, '#f4f0f4'); d.b(6.4, 3, 1, 1.2, '#f4f0f4'); d.b(2.8, 4.6, 6.4, .7, '#c0262c');
      sleeve(d, '#f4a0b8');
    },
    eye: '#3a6ad8',
    leg: () => '#f4a0b8',
    legs(d) { d.gn(2, 6, 8, 1.4, '#f4a0b8'); } },

  { name: '大きな赤い体', who: 'モントゥトゥユピー', note: 'つのと 赤い体・ピンクのつばさ',
    back(d) {
      const fl = Math.sin(d.t * 6) > 0 ? .6 : 0;
      [[-4, -1], [-3, .4], [-2.4, 1.8]].forEach(([x, y], i) => d.b(x, y - fl, 3.4 - i * .4, 1, i % 2 ? '#e88aa0' : '#f4a8bc'));
      [[12.6, -1], [12.4, .4], [12.4, 1.8]].forEach(([x, y], i) => d.b(x, y - fl, 3.4 - i * .4, 1, i % 2 ? '#e88aa0' : '#f4a8bc'));
    },
    front(d) {
      d.b(2.6, -1.6, 1, 1.6, '#e8d8c0'); d.b(8.4, -1.6, 1, 1.6, '#e8d8c0');
      d.b(2.6, .4, 1.6, .4, '#c02a3a'); d.b(7.8, .4, 1.6, .4, '#c02a3a');
      d.b(4.4, 2.4, 3.2, .5, '#f4f0e8');
      d.b(3, 3.2, 2, 1.2, '#a01e2a'); d.b(7, 3.2, 2, 1.2, '#a01e2a'); d.b(4, 4.8, 4, .4, '#a01e2a');
    },
    skin: '#5a2a30', eye: '#f4d040',
    leg: () => '#4a1e24' },

  { name: '長い黒髪とピン', who: 'イルミ', note: 'まっすぐな長い黒髪・針を さした服',
    back(d) { d.b(1.2, -1, 9.6, 7.6, '#3a3650'); },
    front(d) {
      d.b(2, -1.2, 8, 1.6, '#3a3650'); d.b(2, 0, 1, 4, '#3a3650'); d.b(9, 0, 1, 4, '#3a3650');
      d.b(3, .8, 1, 1.2, EYE); d.b(8, .8, 1, 1.2, EYE);
      d.b(3, 3, 6, 3, '#3a5a4a'); d.b(5.8, 3, .4, 3, '#2a4034');
      [[3.6, 3.4], [7.4, 3.4], [4.4, 4.6], [6.8, 4.6]].forEach(([x, y]) => { d.b(x, y, .3, 1, '#c8ccd8'); d.b(x - .1, y - .2, .5, .3, '#e8e8f0'); });
      sleeve(d, '#3a5a4a');
    },
    leg: () => '#3a5a4a' },

  { name: '黒いマスク', who: 'フェイタン', note: '黒い服と 口かくし・かさを持って',
    back(d) {
      d.b(12, -3 + d.ra, .4, 6, '#3a3a40'); d.b(10.4, -4 + d.ra, 3.6, 1.2, '#2a2a30'); d.b(11.2, -4.6 + d.ra, 2, .6, '#2a2a30');
    },
    front(d) {
      d.b(2, -1.2, 8, 1.6, '#3a3650'); [[2, -1.8], [4.6, -2.2], [7.4, -1.8]].forEach(([x, y]) => d.b(x, y, 1.4, 1, '#3a3650'));
      d.b(2.6, .4, 1.6, .3, '#3a3650'); d.b(7.8, .4, 1.6, .3, '#3a3650');
      d.b(2, 2, 8, 4, '#1e1e24'); d.b(2, 2, 8, .4, '#3a3a44');
      d.b(3, 3.4, 6, .3, '#8a2030');
      sleeve(d, '#1e1e24');
    },
    leg: () => '#1e1e24' },

  { name: '盲目の名人', who: 'コムギ', note: 'とじた目・白いマントと 軍儀の盤',
    front(d) {
      d.b(2, -1, 8, 1.4, '#2a3a5a'); d.b(2, 0, .8, 1.6, '#2a3a5a'); d.b(9.2, 0, .8, 1.6, '#2a3a5a');
      d.b(3, 1, 1, 1, ORANGE); d.b(8, 1, 1, 1, ORANGE);
      d.b(2.6, 1.5, 1.8, .3, EYE); d.b(7.6, 1.5, 1.8, .3, EYE);
      d.b(5.2, 2, .4, .8, '#9ac8e8');
      d.b(1.6, 3, 8.8, 3, '#f0ece0'); d.b(5.4, 3, 1.2, .8, '#c8c0a8');
      sleeve(d, '#f0ece0');
      d.b(3, 4.4, 6, 1.6, '#c8a060'); for (let i = 0; i < 3; i++) d.b(3.6 + i * 1.8, 4.8, .6, .6, i === 1 ? '#1a1a1a' : '#f4f4f4');
    },
    leg: () => '#f0ece0' },

  { name: '竜のおじいちゃん', who: 'ゼノ', note: '白いまげと ひげ・「一日一殺」の服',
    front(d) {
      d.b(5, -2.4, 2, 1.6, '#e4e4ea'); d.b(2, -.6, 8, .9, '#e4e4ea'); d.b(1.6, 0, .8, 1.6, '#e4e4ea'); d.b(9.6, 0, .8, 1.6, '#e4e4ea');
      d.b(2.4, .3, 2, .4, '#e4e4ea'); d.b(7.6, .3, 2, .4, '#e4e4ea');
      d.b(3.6, 2.1, 4.8, .6, '#e4e4ea'); d.b(3.2, 2.5, .8, 1.2, '#e4e4ea'); d.b(8, 2.5, .8, 1.2, '#e4e4ea');
      d.b(2, 3, 8, 3, '#f4f0e8');
      [[4.4, 3.6], [4.4, 4.4], [6.4, 3.6], [6.4, 4.4]].forEach(([x, y]) => d.b(x, y, 1.2, .3, '#1a1a1a'));
      d.b(1.6, 2.8, 1.4, 3.2, '#3a7a5a'); d.b(9, 2.8, 1.4, 3.2, '#3a7a5a');
      sleeve(d, '#f4f0e8');
    },
    leg: () => '#3a3a44' },
];
// --- 格子に描く道具（1マス＝2。格子の (3, 8) が キャラクターの左上＝見本の画面の (12, 26)。ほかの変身と同じ） ---
const OX = 3, OY = 8, PX = OX + 6, PY = OY + 8;   // PX・PY：足もとの まんなか（大きさを変えるときの中心）
// 勤務指定表の白っぽい背景でも 白い所が見えるように、白に近い色は 少し灰色にする
const vis = c => { if (c[0] !== '#' || c.length !== 7) return c; const n = parseInt(c.slice(1), 16); return Math.min(n >> 16, (n >> 8) & 255, n & 255) > 214 ? mix(c, '#8a90a0', .3) : c; };
// 変身したすがたを描く。o：dx・dy（ずらす）、sx・sy（大きさ。-1 で左右反対）、a（うすさ）、flash（金色にぬる）
function drawCos(g, cos, u, mode, o = {}) {
  const sx = o.sx ?? 1, sy = o.sy ?? 1, dx = o.dx || 0, dy = o.dy || 0, A = o.a ?? 1;
  let alpha = 1;
  const R = (x, y, w, h, c, a = 1) => {
    let X = PX + (x - PX) * sx + dx, Y = PY + (y - PY) * sy + dy, W = w * sx, H = h * sy;
    if (W < 0) { X += W; W = -W; } if (H < 0) { Y += H; H = -H; }
    g.R(12 + (X - OX) * 2, 26 + (Y - OY) * 2, W * 2, H * 2, o.flash ? '#ffd84a' : vis(c), a * alpha * A);
  };
  const f = Math.floor(u * 6) % 4;
  const hop = mode === 'jump' ? -Math.abs(Math.sin(u * 7)) * 3 : (mode === 'still' ? 0 : (f % 2 ? -1 : 0));
  const y0 = OY + hop, wave = mode === 'talk' && Math.sin(u * 10) > 0 ? -1 : 0;
  const d = { t: u, mode, la: wave, ra: -wave,
    b: (x, y, w, h, c) => R(OX + x, y0 + y, w, h, c), gn: (x, y, w, h, c) => R(OX + x, OY + y, w, h, c),
    a: (al, fn) => { alpha = al; fn(); alpha = 1; } };
  if (cos.back) cos.back(d);
  const up = [f === 1, f === 3, f === 3, f === 1];
  [2, 4, 7, 9].forEach((x, i) => { const h = up[i] && mode === 'walk' ? 1 : 2; d.gn(x, 8 - h, 1, h, cos.leg ? cos.leg(i) : ORANGE); });
  if (cos.legs) cos.legs(d);
  d.b(2, 0, 8, 6, cos.skin || ORANGE); d.b(0, 2 + d.la, 2, 2, cos.skin || ORANGE); d.b(10, 2 + d.ra, 2, 2, cos.skin || ORANGE);
  const bl = (u % 3) > 2.85, ec = cos.eye || EYE;
  d.b(3, 1 + (bl ? .6 : 0), 1, bl ? .4 : 1, ec); d.b(8, 1 + (bl ? .6 : 0), 1, bl ? .4 : 1, ec);
  if (cos.front) cos.front(d);
}
// 格子の位置で 小物を描く（G：見本の画面の座標に直す）
const gx = x => 12 + (x - OX) * 2, gy = y => 26 + (y - OY) * 2;
const Rg = (g, x, y, w, h, c, a = 1) => g.R(gx(x), gy(y), w * 2, h * 2, vis(c), a);

// --- 変わり方（1.2〜1.7秒） ---
// flash：金色に光る／down：上から／up：下から／side：左から／spin：くるっと回る／smoke：けむり／grow：小さくなって大きくなる／blink：ちらちら入れかわる
function change(g, t, cos, tr) {
  const k = seg(t, 1.2, 1.7);
  const plain = (o = {}) => mascotIdle(g, t, o), after = (o = {}) => drawCos(g, cos, 0, 'still', o);
  if (tr === 'flash') {
    if (k < .5) plain({ col: () => '#ffd84a' }); else after({ flash: k < .8 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = 4 + k * 14; g.R(24 + Math.cos(a) * r, 32 + Math.sin(a) * r * .8, 1.5, 1.5, '#ffb04a'); }
  } else if (tr === 'down' || tr === 'up' || tr === 'side') {
    // 線の手前は 新しいすがた、むこうは もとのすがた
    const top = 6, bot = GROUND + 1, left = 4, right = 44;
    if (tr === 'side') {
      const x = left + (right - left) * k;
      g.clip(x, 0, G, G, () => plain()); g.clip(0, 0, x, G, () => after());
      g.R(x - .5, 12, 1, 31, '#ffd84a');
    } else {
      const y = tr === 'down' ? top + (bot - top) * k : bot - (bot - top) * k;
      if (tr === 'down') { g.clip(0, y, G, G, () => plain()); g.clip(0, 0, G, y, () => after()); }
      else { g.clip(0, 0, G, y, () => plain()); g.clip(0, y, G, G, () => after()); }
      g.R(6, y - .5, 36, 1, '#ffd84a');
    }
  } else if (tr === 'spin') {
    const s = Math.max(.1, Math.abs(Math.cos(k * Math.PI)));
    if (k < .5) plain({ sx: s }); else after({ sx: s });
  } else if (tr === 'smoke') {
    if (k < .5) plain(); else after();
    [[24, 34], [16, 37], [32, 37], [19, 28], [29, 27]].forEach(([x, y], i) =>
      g.disc(x, y - k * 2, Math.round(2 + Math.sin(k * Math.PI) * 5), i % 2 ? '#c8c8d4' : '#a8a8b8', 1 - k * .5));
  } else if (tr === 'grow') {
    if (k < .4) { const s = 1 - k / .4 * .9; plain({ sx: s, sy: s }); }
    else { const s = .1 + ease((k - .4) / .6) * .9; after({ sx: s, sy: s }); }
    sparkle(g, 24, 30, k, '#ffd84a');
  } else {   // blink
    if (k > .85 || Math.floor(k * 12) % 2) after(); else plain();
  }
}

// --- 30人の 変わり方・ひとこと・決めの動き（u は 変身してからの秒。だいたい 0〜1.9） ---
const DOT = (g, x, y, s, c, a = 1) => Rg(g, x - s / 2, y - s / 2, s, s, c, a);
const ACT = [
  { tr: 'grow', say: 'ぴょん', how: 'うさぎの耳と オレンジの巻き毛。左右に ぴょこぴょこ はねる',
    mot: u => ({ dx: Math.sin(u * Math.PI * 1.5) * 2, dy: -Math.abs(Math.sin(u * Math.PI * 3)) * 2 }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u + i * .33) % 1; DOT(g, 4 + i * 5, OY + 2 - q * 4, .8, '#e8687d', 1 - q); } } },
  { tr: 'side', say: 'シャキン', how: 'ちょんまげの さむらい。ふみこんで 刀で シャキン',
    mot: u => ({ dx: u < .6 ? -.4 : u < .8 ? -.4 + (u - .6) * 9 : Math.max(0, 1.4 - (u - .8) * 2) }),
    fx(g, u) { if (u > .6 && u < 1.1) for (let i = 0; i <= 10; i++) { const an = -1.2 + i * .24; DOT(g, PX + 6 + Math.cos(an) * 4, OY + 3 + Math.sin(an) * 4.5, .7, '#8a7ad8', 1 - (u - .6) * 2); } } },
  { tr: 'up', say: 'くねくね', how: '長い黒髪と 黒いドレス。へびのように ゆらゆら',
    mot: u => ({ dx: Math.sin(u * 7) * .6, mode: 'still' }) },
  { tr: 'flash', say: 'ドン！', how: '広がる白髪と ひげ・赤いコート。ドン！と 足ぶみ',
    mot: u => { const p = u % .8 / .8; return { dy: p < .5 ? -Math.sin(p * Math.PI) * 1.5 : 0, dx: p > .5 && p < .6 ? .4 : 0, mode: 'still' }; },
    fx(g, u) { const p = u % .8 / .8; if (p > .5 && p < .8) { DOT(g, OX + 1, PY - .3, 1.2, '#b8a890', 1 - p); DOT(g, OX + 11, PY - .3, 1.2, '#b8a890', 1 - p); } } },
  { tr: 'smoke', say: 'ぼよん', how: '大きなアフロと はちまき。びっくりして ぼよんぼよん',
    mot: u => { const w = Math.sin(u * 12) * .12 * Math.max(0, 1 - u / 2); return { sx: 1 - w, sy: 1 + w, mode: 'still' }; } },
  { tr: 'side', say: 'モ〜', how: '白黒もようの ぼうしと服。のっしのっし 歩いて ふり返る',
    mot: u => ({ dx: u < 1 ? Math.sin(u * Math.PI) * 3 : -Math.sin((u - 1) * Math.PI) * 2, sx: u < 1 ? 1 : -1, mode: 'walk' }) },
  { tr: 'down', say: 'バサッ', how: '羽かざりと 白いつばさ。羽ばたいて ふわりと 浮かぶ',
    mot: u => ({ dy: -Math.sin(Math.min(1, u / 1.9) * Math.PI) * 3, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u * .8 + i / 3) % 1; Rg(g, 3 + i * 5, OY + 2 + q * 6, 1.2, .5, '#3cb0d8', 1 - q); } } },
  { tr: 'blink', say: 'カキーン', how: 'ツンツン金髪と しまの服。バットで 打って カキーン',
    mot: () => ({ mode: 'still' }),
    fx(g, u) {
      const ang = u < .7 ? -2.3 : u < .85 ? -2.3 + (u - .7) / .15 * 3.6 : 1.3, x0 = OX + 11, y0 = OY + 3.5;
      for (let i = 0; i < 6; i++) DOT(g, x0 + Math.cos(ang) * i * .8, y0 + Math.sin(ang) * i * .8, .7, '#a87040');
      if (u < .75) DOT(g, 22 - u / .75 * 8, OY + 2.5, .8, '#9aa0b0'); else { const q = u - .75; DOT(g, x0 - q * 10, OY + 2 - q * 9, .8, '#9aa0b0', 1 - q * .6); }
    } },
  { tr: 'grow', say: 'フムフム', how: '犬の耳の白いずきんと メガネ。うなずいて メガネが キラッ',
    mot: u => ({ dy: Math.max(0, Math.sin(u * Math.PI * 4)) * .6, mode: 'still' }),
    fx(g, u) { if ((u > .5 && u < .65) || (u > 1.3 && u < 1.45)) { DOT(g, OX + 3.5, OY + 1.3, .8, '#ffffff'); DOT(g, OX + 8.5, OY + 1.3, .8, '#ffffff'); } } },
  { tr: 'side', say: 'ニッ', how: '頭の布と 青いマフラー。きょろきょろ 見回して ニッ',
    mot: u => ({ sx: u > .5 && u < 1 ? -1 : 1, dy: u > 1.3 ? -Math.abs(Math.sin(u * 12)) * .6 : 0, mode: 'still' }) },
  { tr: 'down', say: 'パチパチ', how: '金髪と しまのスーツ。ていねいに おじぎ。花びらが まう',
    mot: u => { const b = Math.max(0, Math.sin(u * Math.PI * 1.6)); return { sy: 1 - b * .12, dx: b * .4, mode: 'still' }; },
    fx(g, u) { for (let i = 0; i < 5; i++) { const q = (u * .6 + i / 5) % 1; Rg(g, 1 + i * 3.4 + Math.sin(u * 4 + i), OY - 4 + q * 12, .7, .5, '#d02a4a', 1 - q * .5); } } },
  { tr: 'up', say: 'ウキッ', how: '金のかんむりと しっぽ。くるっと ちゅうがえり',
    mot: u => { const p = Math.min(1, u / 1.2); return { dy: -Math.sin(p * Math.PI) * 3.5, sx: Math.max(.15, Math.abs(Math.cos(p * Math.PI * 2))) * (Math.cos(p * Math.PI * 2) < 0 ? -1 : 1), mode: 'still' }; } },
  { tr: 'flash', say: 'ジャジャン拳', how: '先が緑のツンツン頭。力を ためて グーで パンチ',
    mot: u => ({ dx: u < .9 ? (hash(Math.floor(u * 30)) - .5) * .5 : Math.min(1.5, (u - .9) * 12), mode: 'still' }),
    fx(g, u) { const k = u < .9 ? u / .9 : 1; DOT(g, OX + 12.5 + (u > .9 ? 1.5 : 0), OY + 3, 1 + k * 1.5, '#ffd84a', .6); if (u > .9) for (let i = 0; i < 3; i++) Rg(g, OX + 15 + (u - .9) * 4, OY + 1.5 + i * 1.2, 2, .4, '#f2c14e', 1.5 - u); } },
  { tr: 'blink', say: 'バチッ', how: 'ふわふわ銀髪と ヨーヨー。消えては あらわれる（残像）',
    mot: u => { const P = [0, -3, 3, -2, 0]; return { dx: P[Math.min(4, Math.floor(u * 2.5))], mode: 'still' }; },
    after: true },
  { tr: 'up', say: 'ジャラッ', how: '金髪のおかっぱと くさり。くさりを ふり回すと 目が 赤くなる',
    mot: () => ({ mode: 'still' }),
    fx(g, u) {
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + u * 9; DOT(g, PX + Math.cos(a) * 4, OY - 3 + Math.sin(a) * 1, .6, '#7a8090'); }
      if (u > .6) { Rg(g, OX + 3, OY + 1, 1, 1, '#e02a3a'); Rg(g, OX + 8, OY + 1, 1, 1, '#e02a3a'); }
    } },
  { tr: 'spin', say: '♠♥', how: 'ほおに星となみだ。トランプを 3まい 投げる',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u - i * .3) / .6; if (q < 0 || q > 1) continue; const x = OX + 13 + q * 8, y = OY + 2 + i - Math.sin(q * Math.PI) * 1.5; Rg(g, x, y, .9, 1.3, '#f4f4f4'); Rg(g, x + .25, y + .35, .4, .5, i === 1 ? '#1a1a1a' : '#e02a3a'); } } },
  { tr: 'down', say: 'ドゴッ', how: 'まるメガネと かばん。地面を なぐると こぶしが べつの所から 出る',
    mot: u => ({ dy: u < .5 ? -u : u < .7 ? .4 : 0, mode: 'still' }),
    fx(g, u) { if (u > .6 && u < 1.6) { const q = Math.sin((u - .6) * Math.PI); Rg(g, OX + 14, PY - q * 3, 1.5, q * 3, '#d97757'); Rg(g, OX + 13.7, PY - q * 3 - .2, 2.1, 1.2, '#d97757'); } } },
  { tr: 'grow', say: 'にゃ', how: '白い髪と ねこ耳・しっぽ。かがんで ぴょーんと とびかかる',
    mot: u => { if (u < .4) return { sy: 1 - u / .4 * .2, mode: 'still' }; const q = Math.min(1, (u - .4) / .6); return { dx: u < 1.4 ? q * 3 : 3 - (u - 1.4) * 6, dy: -Math.sin(q * Math.PI) * 3, mode: 'still' }; } },
  { tr: 'up', say: '…', how: '緑のかぶとと しっぽ。むらさきの オーラで うき上がる',
    mot: u => ({ dy: -Math.sin(Math.min(1, u / 1.9) * Math.PI) * 1.2, mode: 'still' }),
    before(g, u) { g.disc(24, 30, 11 + Math.round(Math.sin(u * 8)), '#6a3a9a', .3); } },
  { tr: 'flash', say: 'パン！', how: '白いまゆと ひげ。手を合わせると うしろに 金の光',
    mot: () => ({ mode: 'still' }),
    before(g, u) { const a = Math.min(1, u * 2); for (let i = 0; i < 9; i++) { const an = Math.PI + i / 8 * Math.PI; for (let r = 7; r < 12; r += 1.2) DOT(g, PX + Math.cos(an) * r, OY + 4 + Math.sin(an) * r * .8, .7, '#e0b030', a * .8); } } },
  { tr: 'blink', say: 'ひらひら', how: 'すきとおる羽。ふわふわ浮かんで ちょうちょが 飛ぶ',
    mot: u => ({ dy: -1 - Math.sin(u * 4), mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { const q = (u * .7 + i / 4) % 1, a = i / 4 * Math.PI * 2 + 1; const x = PX + Math.cos(a) * q * 9, y = OY + 3 + Math.sin(a) * q * 6, w = Math.floor(u * 10 + i) % 2 ? .7 : .35; Rg(g, x - w, y, w, .7, '#8a6ab8', 1 - q); Rg(g, x + .2, y, w, .7, '#8a6ab8', 1 - q); } } },
  { tr: 'smoke', say: 'キラッ☆', how: 'くるくるツインテール。かわいく ゆれて キラッ',
    mot: u => ({ dx: Math.sin(u * Math.PI * 2.5) * .6, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u + i / 3) % 1; Rg(g, 2 + i * 6, OY - 2 - q * 2, .4, 1.2, '#e8b020', 1 - q); Rg(g, 1.6 + i * 6, OY - 1.6 - q * 2, 1.2, .4, '#e8b020', 1 - q); } } },
  { tr: 'side', say: 'パラッ', how: 'おでこの十字と 白い毛皮。本が 浮かんで ひらく',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const o = Math.min(1, u * 2), x = OX - 3, y = OY + 2 - Math.sin(u * 3) * .4; Rg(g, x - 1.5 * o, y, 1.5 * o, 2.2, '#8a4a2a'); Rg(g, x, y, 1.5 * o, 2.2, '#8a4a2a'); if (o > .6) { Rg(g, x - 1.2 * o, y + .3, 1.1 * o, 1.6, '#f4ead0'); Rg(g, x + .1, y + .3, 1.1 * o, 1.6, '#f4ead0'); } for (let i = 0; i < 3; i++) { const q = (u * 1.5 + i / 3) % 1; DOT(g, x + (i - 1) * .8, y - q * 4, .5, '#a080e0', 1 - q); } } },
  { tr: 'spin', say: 'シュン', how: '青いぼうしと 大がま。大がまを ぐるりと ひとふり',
    mot: u => ({ sx: u > .3 && u < 1 ? (Math.cos((u - .3) / .7 * Math.PI * 2) < 0 ? -1 : 1) : 1, mode: 'still' }),
    fx(g, u) { if (u > .3 && u < 1.1) { const sp = (u - .3) / .7 * Math.PI * 2; for (let i = 0; i < 10; i++) DOT(g, PX + Math.cos(sp - i * .25) * 8, OY + 4 + Math.sin(sp - i * .25) * 2.5, .6, '#8a90a0', 1 - i / 10); } } },
  { tr: 'down', say: '♪', how: '長い黒髪と 金のヘアバンド。ぴょこぴょこ はねて 花が さく',
    mot: u => ({ dy: -Math.abs(Math.sin(u * Math.PI * 3)) * 1.2, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { if (u < i * .35) continue; const x = 1 + i * 5.5, y = PY - 1 - (i % 2) * 5, r = Math.min(1, (u - i * .35) * 3) * .8; Rg(g, x - r, y - r, r * 2, r * 2, '#ff8ab8'); DOT(g, x, y, .4, '#f2c14e'); } } },
  { tr: 'smoke', say: 'ガアア', how: 'つのと 赤い体・ピンクのつばさ。大きく ほえて ゆれる',
    mot: u => { const roar = u > .3 && u < 1.6; return { dx: roar ? (hash(Math.floor(u * 30)) - .5) * .8 : 0, sx: roar ? 1.1 : 1, sy: roar ? 1.1 : 1, mode: 'still' }; },
    fx(g, u) { if (u > .3 && u < 1.6) for (let i = 0; i < 2; i++) { const r = ((u * 2 + i / 2) % 1); for (let a = 0; a < 12; a++) DOT(g, PX + Math.cos(a / 12 * Math.PI * 2) * (4 + r * 7), OY + 3 + Math.sin(a / 12 * Math.PI * 2) * (3 + r * 5), .5, '#d03a2a', 1 - r); } } },
  { tr: 'side', say: '…', how: 'まっすぐな長い黒髪と 針。じっと見て 針を かまえる',
    mot: u => ({ dx: Math.min(1, u) * -.5, mode: 'still' }),
    fx(g, u) { if (u > .6) for (let i = 0; i < 3; i++) for (let s = 0; s < 4; s++) DOT(g, OX + 12 + s * .7, OY + 3.5 - i * .9 - s * .35, .35, '#7a8090', Math.min(1, (u - .6) * 4)); } },
  { tr: 'down', say: 'ゴゴゴ', how: '黒い服と 口かくし・かさ。頭の上に 赤い太陽が のぼる',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const k = Math.min(1, u / 1.2), y = OY - 4 - k * 2; g.disc(gx(PX), gy(y), Math.round(1 + k * 3), '#e84a2a'); g.disc(gx(PX) - 1, gy(y) - 1, Math.round(k * 2), '#ffb02e'); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + u * 2; DOT(g, PX + Math.cos(a) * (2.5 + k), y + Math.sin(a) * (2.5 + k), .5, '#ff8a3a', k); } } },
  { tr: 'blink', say: 'パチ', how: 'とじた目と 白いマント。おじぎして こまを パチッ',
    mot: u => { const b = Math.max(0, Math.sin(Math.min(1, u / 1.4) * Math.PI)); return { sy: 1 - b * .15, dx: b * .5, mode: 'still' }; },
    fx(g, u) { for (let i = 0; i < 3; i++) { if (u < .4 + i * .35) continue; const x = OX - 2 + i * 7.5; Rg(g, x, PY - 1, 1.4, 1, '#e8d8a8'); Rg(g, x + .4, PY - .7, .6, .3, '#3a2a1a'); } } },
  { tr: 'side', say: 'ゴオッ', how: '白いまげと ひげ。青い竜が 体のまわりを まわる',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const turn = u / 1.9 * Math.PI * 2.5; for (let i = 8; i >= 0; i--) { const a = turn - i * .28; DOT(g, PX + Math.sin(a) * 8, OY + 4 - Math.cos(a) * 6, i === 0 ? 1.4 : 1 - i * .05, i === 0 ? '#6ac8e8' : (i % 2 ? '#4aa8d0' : '#2a88b0')); } } },
];

// --- 1つの変身：オレンジ（〜1.2秒）→ その人の変わり方（〜1.7秒）→ 決めの動き ---
// ----- 2回目の 20人（331〜350 番） -----
COS.push(
  { name: 'メガネの師範', who: 'ウイング', note: 'くせっ毛と メガネ・はみ出たシャツ',
    front(d) {
      d.b(2, -1, 8, 1.4, '#2a2a3a'); [[3, -1.8], [5.6, -2.1], [8.4, -1.7]].forEach(([x, y]) => d.b(x, y, 1, 1, '#2a2a3a'));
      const fr = x => { d.b(x - .4, .3, 1.8, .3, '#3a3030'); d.b(x - .4, 1.7, 1.8, .3, '#3a3030'); d.b(x - .4, .3, .3, 1.7, '#3a3030'); d.b(x + 1.1, .3, .3, 1.7, '#3a3030'); };
      fr(3); fr(8); d.b(4.4, .8, 3.3, .3, '#3a3030');
      d.b(2, 3, 8, 3, '#f0f0f0'); d.b(2, 5.6, 3.2, 1, '#f0f0f0'); d.b(5.4, 3, 1.2, .8, '#c8c8d0'); d.b(5.8, 3.8, .4, 2, '#c8c8d0');
      sleeve(d, '#f0f0f0');
    },
    leg: () => '#3a3a50' },
  { name: '押忍の弟子', who: 'ズシ', note: '短い黒髪・白い道着と 黒帯',
    front(d) {
      d.b(2, -.6, 8, 1, '#1a1a1a'); d.b(2, .4, .6, .8, '#1a1a1a'); d.b(9.4, .4, .6, .8, '#1a1a1a');
      d.b(2, 3, 8, 3, '#f4f4f4'); d.b(4.4, 3, 1, 1.2, '#d8d8d8'); d.b(6.6, 3, 1, 1.2, '#d8d8d8'); d.b(2, 4.8, 8, .7, '#1a1a1a'); d.b(6.5, 5.4, .5, 1, '#1a1a1a');
      sleeve(d, '#f4f4f4');
    },
    leg: () => '#f4f4f4' },
  { name: '銀色の長い髪', who: 'シルバ', note: '足まで とどく 銀髪・こん色の服',
    back(d) { d.b(1, -1, 10, 9, '#c8ccd8'); d.b(.4, 3, 1, 5, '#c8ccd8'); d.b(10.6, 3, 1, 5, '#c8ccd8'); },
    front(d) {
      d.b(2, -1.2, 8, 1.6, '#d8dce8'); d.b(2, 0, .8, 3.2, '#d8dce8'); d.b(9.2, 0, .8, 3.2, '#d8dce8');
      d.b(2.6, .3, 1.8, .4, '#8a90a0'); d.b(7.6, .3, 1.8, .4, '#8a90a0');
      d.b(2.8, 3, 6.4, 3, '#2a3050'); d.b(4.6, 3, 2.8, 1, ORANGE); d.b(5.2, 3, 1.6, 1.6, ORANGE);
      sleeve(d, '#2a3050');
    },
    eye: '#3a6ad8',
    leg: () => '#2a3050' },
  { name: 'ゴーグルの母', who: 'キキョウ', note: '大きな ぼうしと ゴーグル・むらさきの ドレス',
    front(d) {
      d.b(-.6, -1.6, 13.2, 1.2, '#5a2a7a'); d.b(2, -3.6, 8, 2.2, '#6a3a8a'); d.b(2, -2.2, 8, .5, '#c8a040');
      d.b(1.8, .3, 8.4, 1.4, '#3a3a44'); d.b(3, .6, 6, .8, '#7ad0e8'); d.b(5.6, .7, .8, .6, '#e02a3a');
      d.b(2, 3, 8, 3, '#7a3a9a'); d.b(2, 3, 8, .6, '#f4f0f4'); d.b(5.6, 3.6, .8, 2.4, '#5a2a7a');
      sleeve(d, '#7a3a9a');
    },
    eye: '#7ad0e8',
    leg: () => '#7a3a9a',
    legs(d) { d.gn(1.2, 6, 9.6, 2, '#7a3a9a'); d.gn(1.2, 7.4, 9.6, .4, '#f4f0f4'); } },
  { name: 'まんまる', who: 'ミルキ', note: 'まんまるの体・短い黒髪・はちきれそうな シャツ',
    back(d) { d.b(1, 1.5, 10, 4.8, ORANGE); },
    front(d) {
      d.b(2, -.8, 8, 1.2, '#1e1e24'); d.b(2, .3, .6, .8, '#1e1e24'); d.b(9.4, .3, .6, .8, '#1e1e24');
      d.b(3.6, 2.2, .8, .4, '#e89a7a'); d.b(7.6, 2.2, .8, .4, '#e89a7a');
      d.b(1, 3, 10, 3.3, '#3a4a6a'); d.b(1, 5.8, 10, .5, ORANGE); d.b(5.6, 5.9, .8, .4, '#c86040');
      sleeve(d, '#3a4a6a');
    },
    leg: () => '#2a2a3a' },
  { name: 'おかっぱの着物', who: 'カルト', note: '黒いおかっぱ・白い着物と 紙のおうぎ',
    back(d) { d.b(1.6, -1, 8.8, 4.2, '#141418'); },
    front(d) {
      d.b(2, -1, 8, 1.6, '#141418'); d.b(2, 0, 1, 3.2, '#141418'); d.b(9, 0, 1, 3.2, '#141418');
      d.b(2.8, 3, 6.4, 3, '#f4f0f0'); [[3.4, 3.8], [7.6, 4.6], [5, 5.2]].forEach(([x, y]) => d.b(x, y, .7, .7, '#f4a0b8'));
      d.b(4.6, 3, 1, 1.2, '#c8c0c8'); d.b(6.4, 3, 1, 1.2, '#c8c0c8'); d.b(2.8, 4.4, 6.4, .6, '#7a2a4a');
      sleeve(d, '#f4f0f0');
      d.b(-1.2, 2.8 + d.la, 2, 1.4, '#f0e8d0'); d.b(-1.2, 2.8 + d.la, 2, .3, '#c8a060');
    },
    leg: () => '#f4f0f0',
    legs(d) { d.gn(2, 6, 8, 1.6, '#f4f0f0'); } },
  { name: 'ちょんまげの剣士', who: 'ノブナガ', note: 'ちょんまげと はちまき・水色の着物と 刀',
    front(d) {
      d.b(2, -.6, 8, 1, '#2a2a30'); d.b(5, -2, 2, 1.6, '#2a2a30'); d.b(1.8, -.2, 8.4, .6, '#f4f0e8'); d.b(9.8, -.2, 1.4, .4, '#f4f0e8');
      d.b(3.6, 2.3, 4.8, .4, '#5a3a2a');
      d.b(2, 3, 8, 3, '#8ac0d8'); d.b(4, 3, 1, 1.4, '#5a8aa8'); d.b(7, 3, 1, 1.4, '#5a8aa8'); d.b(2, 4.8, 8, .6, '#3a3a44');
      d.b(1.4, 4.2, 9.6, .5, '#2a2a30'); d.b(10.6, 4, .8, .9, '#c8a040');
      sleeve(d, '#8ac0d8');
    },
    leg: () => '#5a8aa8' },
  { name: 'ジャージの腕回し', who: 'フィンクス', note: '金色の短い髪・黒いジャージに 白い線',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#e8c840'); d.b(2, .3, .5, .6, '#e8c840'); d.b(9.5, .3, .5, .6, '#e8c840');
      d.b(2, 3, 8, 3, '#1e1e26'); d.b(2.6, 3, .4, 3, '#f4f4f4'); d.b(9, 3, .4, 3, '#f4f4f4'); d.b(5.8, 3, .4, 3, '#8a8a90');
      sleeve(d, '#1e1e26');
    },
    leg: () => '#1e1e26',
    legs(d) { d.gn(2.6, 6, .3, 2, '#f4f4f4'); d.gn(9.2, 6, .3, 2, '#f4f4f4'); } },
  { name: 'ケータイの笑顔', who: 'シャルナーク', note: '金髪・緑の上着と アンテナつきの ケータイ',
    front(d) {
      d.b(2, -1, 8, 1.5, '#f0d860'); d.b(2, .3, .7, 1.4, '#f0d860'); d.b(9.3, .3, .7, 1.4, '#f0d860');
      d.b(4.6, 2.2, 2.8, .5, '#5a2a1a');
      d.b(2, 3, 8, 3, '#4a8a5a'); d.b(4.8, 3, 2.4, 1.2, '#f4f4f4'); d.b(5.8, 3, .4, 3, '#2a5a3a');
      sleeve(d, '#4a8a5a');
      d.b(11.4, 1.6 + d.ra, 1, 1.6, '#2a2a30'); d.b(11.7, .6 + d.ra, .3, 1, '#2a2a30'); d.b(11.5, .4 + d.ra, .7, .3, '#e02a3a');
    },
    leg: () => '#3a3a44' },
  { name: '糸の使い手', who: 'マチ', note: 'むらさきの ポニーテール・着物と 糸',
    back(d) { d.b(8.6, -1.6, 3, 1.6, '#c86aa8'); d.b(10.6, -.6, 1.2, 3, '#c86aa8'); },
    front(d) {
      d.b(2, -1, 8, 1.4, '#c86aa8'); d.b(2, 0, .6, 1.6, '#c86aa8'); d.b(8.4, -1.4, 1, .8, '#3a3a44');
      d.b(2, 3, 8, 3, '#5a3a7a'); d.b(4, 3, 1, 1.4, '#3a2a5a'); d.b(7, 3, 1, 1.4, '#3a2a5a'); d.b(2, 4.6, 8, .6, '#e8d0e8');
      sleeve(d, '#5a3a7a');
    },
    leg: () => '#3a2a5a' },
  { name: '記憶の弾丸', who: 'パクノダ', note: '金色のボブ・黒いスーツと ピストル',
    front(d) {
      d.b(1.6, -1, 8.8, 1.6, '#e8c860'); d.b(1.6, 0, 1, 2.8, '#e8c860'); d.b(9.4, 0, 1, 2.8, '#e8c860');
      d.b(4.8, 2.3, 2.4, .4, '#a02a3a');
      d.b(2, 3, 8, 3, '#1e1e24'); d.b(4.6, 3, 2.8, 1.6, '#f4f4f4'); d.b(5.6, 3, .8, 2.6, '#1e1e24');
      sleeve(d, '#1e1e24');
    },
    leg: () => '#1e1e24' },
  { name: '毛皮の大男', who: 'ウボォーギン', note: 'ぼうぼうの 長い髪・毛皮の チョッキ',
    back(d) { d.b(-.6, -2.4, 13.2, 7, '#8a6a4a'); [[-1.4, 0], [12.4, 0], [0, -3.2], [10.4, -3.2], [5, -3.6]].forEach(([x, y]) => d.b(x, y, 1.4, 1.6, '#8a6a4a')); },
    front(d) {
      d.b(2, -1, 8, 1.4, '#7a5a3a'); d.b(2, .2, .7, 1.4, '#7a5a3a'); d.b(9.3, .2, .7, 1.4, '#7a5a3a');
      d.b(2.6, .3, 1.8, .4, '#3a2a1a'); d.b(7.6, .3, 1.8, .4, '#3a2a1a'); d.b(4, 2.2, 4, .6, '#3a1a1a');
      d.b(2, 3, 2.4, 3, '#d8c8a0'); d.b(7.6, 3, 2.4, 3, '#d8c8a0'); d.b(4.4, 3.6, 3.2, .3, '#c06848'); d.b(4.4, 4.6, 3.2, .3, '#c06848');
      d.b(2, 5.4, 8, .6, '#5a3a2a');
    },
    leg: () => '#5a4a3a' },
  { name: 'リーゼント', who: 'ナックル', note: '高い リーゼント・こげ茶の上着',
    front(d) {
      d.b(2, -1, 8, 1.4, '#1a1a1a'); d.b(1.6, -2.6, 6, 1.8, '#1a1a1a'); d.b(.8, -2.2, 1.4, 1.2, '#1a1a1a'); d.b(2, .2, .6, 1.2, '#1a1a1a'); d.b(9.4, .2, .6, 1.2, '#1a1a1a');
      d.b(2.6, .3, 1.8, .4, '#1a1a1a'); d.b(7.6, .3, 1.8, .4, '#1a1a1a');
      d.b(2, 3, 8, 3, '#6a4a2a'); d.b(4.8, 3, 2.4, 2, '#e8e0d0'); d.b(5.6, 3, .8, 2.2, '#8a2a3a');
      sleeve(d, '#6a4a2a');
    },
    leg: () => '#2a2a30' },
  { name: '煙のキセル', who: 'モラウ', note: 'はちまきと サングラス・大きな キセル',
    front(d) {
      d.b(2, -.6, 8, 1, '#3a3a40'); d.b(1.8, -.4, 8.4, .6, '#f4f0e8');
      d.b(2.4, .6, 3, 1, '#1a1a1a'); d.b(6.6, .6, 3, 1, '#1a1a1a'); d.b(5.4, .9, 1.2, .3, '#1a1a1a');
      d.b(3, 2.3, 6, .8, '#5a4a3a');
      d.b(2, 3, 8, 3, '#4a5a3a'); d.b(2, 3, 8, .5, '#3a4a2a'); d.b(5.6, 3.5, .8, 2.5, '#2a3a1a');
      sleeve(d, '#4a5a3a');
      d.b(10.8, -3 + d.ra, 1, 5, '#8a5a30'); d.b(10.2, -3.6 + d.ra, 2.2, 1, '#c8a040');
    },
    leg: () => '#3a4a2a' },
  { name: 'つるつる頭の忍者', who: 'ハンゾー', note: 'つるつるの頭・こい緑の 忍者の服',
    front(d) {
      d.b(3, -.1, 2, .5, '#f4c8a8');
      d.b(2.6, .3, 1.8, .4, '#3a2a1a'); d.b(7.6, .3, 1.8, .4, '#3a2a1a');
      d.b(2, 2.4, 8, 3.6, '#2a4a3a'); d.b(2, 2.4, 8, .5, '#1a3a2a'); d.b(2, 4.6, 8, .5, '#1a1a1a');
      sleeve(d, '#2a4a3a');
    },
    leg: () => '#2a4a3a',
    legs(d) { d.gn(2, 7, 8, .4, '#1a1a1a'); } },
  { name: '弓の名人', who: 'ポックル', note: '耳あての ぼうし・弓と 矢',
    front(d) {
      d.b(1.6, -2, 8.8, 2.4, '#8a6a4a'); d.b(1.6, -.2, 8.8, .6, '#6a4a2a'); d.b(1.4, .3, 1.2, 2.6, '#8a6a4a'); d.b(9.4, .3, 1.2, 2.6, '#8a6a4a');
      d.b(9, -3.4, .6, 1.8, '#e8e0d0'); d.b(9.4, -3.6, .4, .8, '#c84a3a');
      d.b(2, 3, 8, 3, '#4a7a4a'); d.b(2, 3, 8, .5, '#3a5a3a'); d.b(2.4, 3, .5, 3, '#8a5a30');
      sleeve(d, '#4a7a4a');
      for (let i = 0; i < 6; i++) d.b(-1.2 + Math.sin(i / 5 * Math.PI) * -1, i * .9 - .4 + d.la, .4, .9, '#8a5a30');
    },
    leg: () => '#3a5a3a' },
  { name: 'にやりの新人つぶし', who: 'トンパ', note: '大きな四角い はな・茶色の髪と ジュース',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#6a4a2a'); d.b(2, .2, .5, .7, '#6a4a2a'); d.b(9.5, .2, .5, .7, '#6a4a2a');
      d.b(5, 1.2, 2, 1.6, '#c86a50');
      d.b(3.6, 3.1, 4.8, .4, '#3a1a1a');
      d.b(2, 3.6, 8, 2.4, '#4a5a8a'); d.b(2, 3.6, 8, .4, '#3a4a7a');
      sleeve(d, '#4a5a8a');
      d.b(11, 2.6 + d.ra, 1.2, 1.6, '#3a7ad8'); d.b(11, 2.6 + d.ra, 1.2, .3, '#c8ccd8');
    },
    leg: () => '#3a3a44' },
  { name: '笛の音楽家', who: 'センリツ', note: 'ちょこんとした 髪・黒い服と 笛',
    front(d) {
      [[3, -1], [5.4, -1.6], [8, -1]].forEach(([x, y]) => d.b(x, y, .9, 1.4, '#8a6a4a'));
      d.b(2.6, .2, 1.8, .4, '#3a2a1a'); d.b(7.6, .2, 1.8, .4, '#3a2a1a');
      d.b(4, 2.2, 4, .8, '#f4f4f4'); d.b(4, 2.2, 4, .2, '#3a1a1a');
      d.b(2, 3.2, 8, 2.8, '#1e1e24'); d.b(5, 3.2, 2, .8, '#f4f4f4');
      sleeve(d, '#1e1e24');
      d.b(6.4, 2.6, 5.2, .5, '#c8a040'); [7.6, 9, 10.4].forEach(x => d.b(x, 2.6, .3, .3, '#5a3a10'));
    },
    leg: () => '#1e1e24' },
  { name: 'ピンクの うらない', who: 'ネオン', note: '長い ピンクの髪・フリルの ドレス',
    back(d) { d.b(1.2, -1, 9.6, 7, '#f08ab8'); },
    front(d) {
      d.b(2, -1, 8, 1.6, '#f08ab8'); d.b(2, 0, .8, 3.8, '#f08ab8'); d.b(9.2, 0, .8, 3.8, '#f08ab8');
      d.b(7.6, -1.6, 1.8, .9, '#f4f4f4'); d.b(8.2, -1.4, .6, .5, '#e02a6a');
      d.b(2.6, 2, 1, .5, '#ff9db8'); d.b(8.4, 2, 1, .5, '#ff9db8');
      d.b(2.8, 3, 6.4, 3, '#f4a0c8'); d.b(2.8, 3, 6.4, .5, '#f4f0f4'); d.b(2.8, 5.5, 6.4, .5, '#f4f0f4');
      sleeve(d, '#f4a0c8');
    },
    leg: () => '#f4a0c8',
    legs(d) { d.gn(1.6, 6, 8.8, 1.2, '#f4a0c8'); d.gn(1.6, 6.8, 8.8, .4, '#f4f0f4'); } },
  { name: 'ゴリラの使い手', who: 'ゴレイヌ', note: 'こげ茶の体・ゴリラの顔',
    front(d) {
      d.b(2, -.6, 8, 1.2, '#2a1e18');
      d.b(3, .6, 6, 2.6, '#8a6a50'); d.b(3, .8, 1, 1, EYE); d.b(8, .8, 1, 1, EYE); d.b(4.6, 1.8, 2.8, .6, '#3a2a20'); d.b(4.4, 2.6, 3.2, .3, '#2a1a10');
      d.b(2, 3.4, 8, 2.6, '#2a2a30'); d.b(5.6, 3.4, .8, 2.6, '#c8c8d0');
    },
    skin: '#4a3428', eye: '#4a3428',
    leg: () => '#2a2a30' },
);

// 2回目の 20人の 変わり方・ひとこと・決めの動き
ACT.push(
  { tr: 'side', say: 'わわっ', how: 'くせっ毛と メガネ・はみ出たシャツ。つまずいて メガネが キラッ',
    mot: u => ({ dx: u < .6 ? u * 2 : u < .8 ? 1.2 - (u - .6) * 3 : .6 - Math.min(.6, (u - .8)), dy: u > .5 && u < .7 ? .5 : 0, mode: 'still' }),
    fx(g, u) { if (u > 1.1 && u < 1.3) { DOT(g, OX + 3.5, OY + 1.2, .8, '#ffffff'); DOT(g, OX + 8.5, OY + 1.2, .8, '#ffffff'); } if (u > .5 && u < 1) DOT(g, OX + 11, OY - .5 + (u - .5) * 3, .6, '#7ad0ff', 1 - (u - .5) * 2); } },
  { tr: 'flash', say: '押忍！', how: '白い道着と 黒帯。押忍！と 正拳づき',
    mot: u => { const p = u % .5 / .5; return { dx: p > .3 && p < .6 ? .8 : 0, mode: 'still' }; },
    fx(g, u) { const p = u % .5 / .5; if (p > .3 && p < .6) for (let i = 0; i < 3; i++) Rg(g, OX + 13 + i * .3, OY + 2 + i * 1.2, 1.8, .3, '#f2c14e', .8); } },
  { tr: 'up', say: 'ゴゴゴ', how: '足までとどく 銀髪。じっと立つと こい オーラが 広がる',
    mot: () => ({ mode: 'still' }),
    before(g, u) { const k = Math.min(1, u); g.disc(24, 32, Math.round(6 + k * 7 + Math.sin(u * 10)), '#4a5a9a', .35 * k); } },
  { tr: 'spin', say: 'キーッ', how: '大きな ぼうしと ゴーグル。おこって ぷんぷん ゆれる',
    mot: u => ({ dx: u > .3 ? (hash(Math.floor(u * 25)) - .5) * .8 : 0, mode: 'still' }),
    fx(g, u) { if (u > .3) for (let i = 0; i < 2; i++) { const q = (u * 1.5 + i / 2) % 1; DOT(g, OX + 1 + i * 10, OY - 4 - q * 3, 1.2 - q * .6, '#c8c8d4', 1 - q); } } },
  { tr: 'smoke', say: 'もぐもぐ', how: 'まんまるの体。おかしを 食べて ぼよんと ゆれる',
    mot: u => { const w = Math.sin(u * 9) * .06; return { sx: 1 + w, sy: 1 - w, mode: 'still' }; },
    fx(g, u) { Rg(g, OX - 1.5, OY + 3, 1.8, 2.2, '#e85a3a'); Rg(g, OX - 1.3, OY + 3.2, 1.4, .5, '#f2c14e'); if (Math.floor(u * 4) % 2) DOT(g, OX + 6, OY + 3.4, .5, '#f2c14e'); } },
  { tr: 'down', say: 'ヒラヒラ', how: '黒いおかっぱと 白い着物。おうぎを ふると 紙が まう',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 6; i++) { const q = (u * 1.2 + i / 6) % 1; Rg(g, OX - 1 - q * 4 + i * .3, OY + 2 + Math.sin(q * 6 + i) * 2, .7, .5, i % 2 ? '#f4a0b8' : '#e8e0d0', 1 - q); } } },
  { tr: 'side', say: 'シャッ', how: 'ちょんまげと はちまき・水色の着物。かがんで 居合ぬき',
    mot: u => ({ sy: u < .7 ? .9 : 1, dy: u < .7 ? .3 : 0, dx: u > .7 && u < .9 ? 1 : 0, mode: 'still' }),
    fx(g, u) { if (u > .7 && u < 1.1) Rg(g, OX - 2, OY + 3.5, 16, .4, '#8a7ad8', 1 - (u - .7) * 2.5); } },
  { tr: 'flash', say: 'ぐるぐる', how: '金色の短い髪と 黒いジャージ。うでを ぐるぐる回して パンチ',
    mot: u => ({ dx: u > 1.2 && u < 1.5 ? 1.5 : 0, mode: 'still' }),
    fx(g, u) { if (u < 1.2) for (let i = 0; i < 5; i++) { const a = u * 18 - i * .4; DOT(g, OX + 11 + Math.cos(a) * 2, OY + 2.5 + Math.sin(a) * 2, .9, '#d97757', 1 - i * .18); } else if (u < 1.6) DOT(g, OX + 15, OY + 3, 1 + (u - 1.2) * 6, '#f2c14e', .6); } },
  { tr: 'blink', say: 'ピピッ', how: '金髪と 緑の上着。ケータイを 打つと 電波が 出る',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u * 1.5 + i / 3) % 1, r = 1 + q * 3; for (let a = -1; a <= 1; a += .5) DOT(g, OX + 12 + Math.cos(a - 1.57) * r * .6 + 0, OY - 1 - Math.sin(a + 1.57) * r * .3 - q * 2, .4, '#3cb0d8', 1 - q); } } },
  { tr: 'up', say: 'シュッ', how: 'むらさきの ポニーテール。糸を のばして ピンと はる',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const k = Math.min(1, u / .6); for (let i = 0; i < 3; i++) { const len = k * (8 + i * 2); for (let s = 0; s < len; s += .5) DOT(g, OX + 12 + s, OY + 2 + i * 1.2 - s * (i - 1) * .15, .25, '#b8b8c8'); } } },
  { tr: 'side', say: 'バン', how: '金色のボブと 黒いスーツ。ピストルで ポンポン うつ',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { Rg(g, OX + 12, OY + 2.6, 1.6, .7, '#2a2a30'); Rg(g, OX + 12, OY + 3.2, .6, .8, '#2a2a30'); for (let i = 0; i < 3; i++) { const q = (u - i * .45) / .5; if (q < 0 || q > 1) continue; DOT(g, OX + 14 + q * 8, OY + 2.9, .6, '#f2c14e'); if (q < .2) DOT(g, OX + 14, OY + 2.9, 1.2, '#ffb04a'); } } },
  { tr: 'grow', say: 'ウオォ', how: 'ぼうぼうの髪の 大男。大きな声で さけぶ',
    mot: u => ({ sx: 1.12, sy: 1.12, dx: u > .4 && u < 1.6 ? (hash(Math.floor(u * 30)) - .5) * .6 : 0, mode: 'still' }),
    fx(g, u) { if (u > .4 && u < 1.6) for (let i = 0; i < 2; i++) { const r = ((u * 2 + i / 2) % 1); for (let a = 0; a < 14; a++) DOT(g, PX + Math.cos(a / 14 * Math.PI * 2) * (5 + r * 7), OY + 2 + Math.sin(a / 14 * Math.PI * 2) * (4 + r * 5), .5, '#c86a3a', 1 - r); } } },
  { tr: 'smoke', say: 'ポッ', how: '高い リーゼント。パンチすると 小さな 時計が 浮かぶ',
    mot: u => ({ dx: u > .5 && u < .8 ? 1.2 : 0, mode: 'still' }),
    fx(g, u) { if (u > .7) { const k = Math.min(1, (u - .7) * 3), y = OY - 4 - k; Rg(g, PX + 4, y, 3, 3, '#c8a8e8', k); Rg(g, PX + 4.5, y + .5, 2, 2, '#f4f0f4', k); Rg(g, PX + 5.4, y + .8, .3, 1, '#3a2a5a', k); } } },
  { tr: 'smoke', say: 'プカー', how: 'はちまきと サングラス。キセルから けむりを ふく',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { const q = (u * .9 + i / 4) % 1; g.disc(gx(OX + 11 + q * 4), gy(OY - 4 - q * 4), Math.round(1 + q * 3), '#b8b8c4', .8 - q * .6); } } },
  { tr: 'blink', say: 'シュバッ', how: 'つるつる頭の 忍者。残像を のこして 走り、手裏剣を なげる',
    mot: u => ({ dx: u < .6 ? -u * 4 : u < 1 ? -2.4 + (u - .6) * 6 : 0, mode: 'still' }),
    after: true,
    fx(g, u) { if (u > 1) { const q = Math.min(1, (u - 1) / .6), x = OX + 13 + q * 8, a = u * 20; DOT(g, x, OY + 3, .5, '#5a5a6a'); DOT(g, x + Math.cos(a) * .7, OY + 3 + Math.sin(a) * .7, .5, '#8a8a9a'); DOT(g, x - Math.cos(a) * .7, OY + 3 - Math.sin(a) * .7, .5, '#8a8a9a'); } } },
  { tr: 'down', say: 'ヒュン', how: '耳あての ぼうし。弓を ひいて 矢を はなつ',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { if (u < .6) Rg(g, OX + 1, OY + 2.8, 1.5 + u * 2, .25, '#8a5a30'); else { const q = Math.min(1, (u - .6) / .5); Rg(g, OX - 2 - q * 10, OY + 2.8, 3, .25, '#8a5a30'); DOT(g, OX - 2 - q * 10, OY + 2.9, .5, '#9aa0b0'); } } },
  { tr: 'spin', say: 'どうぞ', how: '四角い はな。にやりと わらって ジュースを さし出す',
    mot: u => ({ dx: Math.min(.8, u * .8), mode: 'still' }),
    fx(g, u) { if (u > .8) for (let i = 0; i < 2; i++) { const q = (u * 1.4 + i / 2) % 1; DOT(g, OX + 1, OY - 1 + q * 2, .6, '#7ad0ff', 1 - q); } } },
  { tr: 'grow', say: '♪', how: 'ちょこんとした髪と 黒い服。笛を ふくと 音ぷが 流れる',
    mot: u => ({ dy: Math.sin(u * 6) * .3, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { const q = (u * .8 + i / 4) % 1, x = OX + 12 + q * 7, y = OY + 1 - q * 4 + Math.sin(q * 8) * .6; Rg(g, x, y + 1, .9, .7, '#5a3ab8', 1 - q); Rg(g, x + .6, y - .4, .3, 1.5, '#5a3ab8', 1 - q); } } },
  { tr: 'flash', say: 'キラリン', how: '長い ピンクの髪と フリルの ドレス。うらないの 星が 光る',
    mot: u => ({ dx: Math.sin(u * Math.PI * 2) * .4, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { const q = (u * 1.2 + i / 4) % 1, a = i / 4 * Math.PI * 2 + u * 2, x = PX + Math.cos(a) * 7, y = OY + 3 + Math.sin(a) * 4; Rg(g, x - .2, y - .6, .4, 1.6, '#f2c14e', 1 - q); Rg(g, x - .8, y - .2, 1.6, .4, '#f2c14e', 1 - q); } } },
  { tr: 'smoke', say: 'ウホッ', how: 'ゴリラの顔。白と黒の ゴリラを よび出して 入れかわる',
    mot: u => ({ dx: u > 1.2 ? -3 : 0, mode: 'still' }),
    fx(g, u) {
      if (u < .4) return;
      const gor = (x, c, f) => { Rg(g, x, PY - 4, 3, 3, c); Rg(g, x + .5, PY - 5, 2, 1.4, c); Rg(g, x - .6, PY - 3.2, .8, 2, c); Rg(g, x + 2.8, PY - 3.2, .8, 2, c); Rg(g, x + .4, PY - 1, .8, 1, c); Rg(g, x + 1.8, PY - 1, .8, 1, c); Rg(g, x + .8, PY - 4.6, 1.4, .8, f); };
      const swap = u > 1.2;
      gor(swap ? OX + 3 + 1.5 : OX - 4, '#2a2a2e', '#6a6a70'); gor(OX + 13, '#e8e8ec', '#a8a8b0');
    } },
);

// ----- 3回目の 20人（351〜370 番） -----
COS.push(
  { name: '掃除機のメガネ', who: 'シズク', note: 'まっすぐな前髪の 黒いボブ・大きな まるメガネ・黒い服',
    back(d) { d.b(1.2, -1.2, 9.6, 4.8, '#141418'); },
    front(d) {
      d.b(1.8, -1.6, 8.4, 2, '#141418'); d.b(1.4, 0, 1.4, 3.6, '#141418'); d.b(9.2, 0, 1.4, 3.6, '#141418'); d.b(1.6, -1.8, 8.8, .4, '#2a2a34');
      const gl = x => {
        d.a(.35, () => d.b(x - .7, .2, 2.4, 2.2, '#cfe8f4'));
        d.b(x - .8, .1, 2.6, .3, '#2a2a30'); d.b(x - .8, 2.2, 2.6, .3, '#2a2a30'); d.b(x - .8, .1, .3, 2.4, '#2a2a30'); d.b(x + 1.5, .1, .3, 2.4, '#2a2a30');
        d.b(x, 1, 1, 1, EYE);
      };
      gl(3); gl(8); d.b(4.7, 1, 2.6, .3, '#2a2a30');
      d.b(3, 2.7, .8, .3, '#f4a0b0'); d.b(8.2, 2.7, .8, .3, '#f4a0b0'); d.b(5.5, 2.5, 1, .3, '#8a3a3a');
      d.b(2, 3, 8, 3, '#1e1e24'); d.b(3.6, 3, 4.8, .6, '#2e2e38');
      sleeve(d, '#1e1e24');
    },
    leg: () => '#3a4a7a' },
  { name: 'ぬい目の大男', who: 'フランクリン', note: 'ぬい目のある顔・長い耳たぶ・こん色の服',
    front(d) {
      d.b(2, -.6, 8, .9, '#3a3a40');
      d.b(2.4, 1.6, 2, .25, '#5a3a3a'); d.b(7.6, 1.6, 2, .25, '#5a3a3a'); [3, 3.8, 8.2, 9].forEach(x => d.b(x, 1.4, .2, .7, '#5a3a3a'));
      d.b(1.2, 1, .8, 2.6, ORANGE); d.b(10, 1, .8, 2.6, ORANGE);
      d.b(2, 3, 8, 3, '#2a3a5a'); d.b(5.4, 3, 1.2, 1, '#e8e0d0');
      sleeve(d, '#2a3a5a');
    },
    leg: () => '#2a3a5a' },
  { name: '包帯の音楽家', who: 'ボノレノフ', note: '包帯で ぐるぐる巻きの体',
    front(d) {
      for (let y = -1; y < 6; y += 1) d.b(2, y, 8, .6, '#e8e0cc');
      d.b(2, -1.4, 8, .8, '#e8e0cc'); d.b(2.6, .9, 1.8, .9, '#3a2a1a'); d.b(7.6, .9, 1.8, .9, '#3a2a1a');
      [[3, 3.4], [6, 2.4], [8, 4.4], [4.5, 5]].forEach(([x, y]) => d.b(x, y, .6, .6, '#3a2a1a'));
      fullArm(d, '#e8e0cc'); d.b(0, 2.5 + d.la, 2, .3, '#c8bca0'); d.b(10, 2.5 + d.ra, 2, .3, '#c8bca0');
    },
    leg: () => '#e8e0cc' },
  { name: '髪で顔がかくれた', who: 'コルトピ', note: '長い 銀色の髪で 顔が かくれている・小さな体',
    back(d) { d.b(1, -1.4, 10, 8, '#d8d8e0'); },
    front(d) {
      d.b(1.4, -1.6, 9.2, 4.4, '#d8d8e0'); d.b(1.4, 2.8, 9.2, 2.6, '#c8c8d4');
      d.b(7.6, 1.2, 1.2, 1, EYE);
      d.b(2, 5.4, 8, .6, '#3a3a50');
    },
    eye: '#d8d8e0',
    leg: () => '#3a3a50' },
  { name: 'ボマー', who: 'ゲンスルー', note: '短い金髪・白いシャツ',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#e8d070'); d.b(2, .2, .5, .7, '#e8d070'); d.b(9.5, .2, .5, .7, '#e8d070');
      d.b(2.6, .3, 1.8, .3, '#5a4a20'); d.b(7.6, .3, 1.8, .3, '#5a4a20'); d.b(4, 2.3, 4, .4, '#5a2a1a');
      d.b(2, 3, 8, 3, '#f0f0f0'); d.b(5.6, 3, .8, 3, '#c8c8d0');
      sleeve(d, '#f0f0f0');
    },
    leg: () => '#4a4a5a' },
  { name: '豪速球', who: 'レイザー', note: 'うしろに流した 黒い長髪・日焼けした 体・黒い タンクトップ',
    back(d) { d.b(.8, -1.4, 10.4, 5, '#1a1a1a'); d.b(.2, 1, 1.4, 5.4, '#1a1a1a'); d.b(10.4, 1, 1.4, 5.4, '#1a1a1a'); [[1.6, -2.6], [4, -3], [6.6, -3], [9, -2.6]].forEach(([x, y]) => d.b(x, y, 1.4, 1.6, '#1a1a1a')); },
    front(d) {
      d.b(2, -1.2, 8, 1.2, '#1a1a1a');
      d.b(2.4, .2, 2.2, .5, '#1a1a1a'); d.b(7.4, .2, 2.2, .5, '#1a1a1a');
      d.b(4.2, 2.2, 3.6, .5, '#f4f4f4'); d.b(5.2, 2.7, 1.6, .9, '#1a1a1a');
      d.b(3, 3, 6, 3, '#1e1e24'); d.b(4.2, 3, 3.6, .7, '#b8784a');
      d.b(2, 5.4, 8, .6, '#3a3a44');
    },
    skin: '#b8784a',
    leg: () => '#3a3a44' },
  { name: 'フードの念使い', who: 'シュート', note: 'フードで 顔をかくす・左うでが ない',
    front(d) {
      d.b(1.4, -1.6, 9.2, 2.6, '#4a4a58'); d.b(1.4, -.2, 1.2, 3.6, '#4a4a58'); d.b(9.4, -.2, 1.2, 3.6, '#4a4a58'); d.b(2.6, -.4, 6.8, .8, '#2a2a34');
      d.b(2, 3, 8, 3, '#5a5a68'); d.b(5.6, 3, .8, 3, '#3a3a48');
      d.b(0, 2 + d.la, 2, 2, '#5a5a68'); d.b(10, 2 + d.ra, 1, 2, '#5a5a68');
    },
    leg: () => '#3a3a48' },
  { name: '空間の扉', who: 'ノヴ', note: '四角いメガネ・きっちりした スーツ',
    front(d) {
      d.b(2, -1, 8, 1.4, '#c8c8d0'); d.b(2, .2, .5, .6, '#c8c8d0'); d.b(9.5, .2, .5, .6, '#c8c8d0');
      d.b(2.4, .5, 2.2, 1.2, '#3a3a44'); d.b(7.4, .5, 2.2, 1.2, '#3a3a44'); d.b(2.7, .7, 1.6, .8, '#a8d8f0'); d.b(7.7, .7, 1.6, .8, '#a8d8f0'); d.b(4.6, .9, 2.8, .3, '#3a3a44');
      d.b(2, 3, 8, 3, '#3a3a50'); d.b(4.8, 3, 2.4, 1.4, '#f4f4f4'); d.b(5.6, 3, .8, 2.2, '#2a2a6a');
      sleeve(d, '#3a3a50');
    },
    eye: '#3a3a44',
    leg: () => '#3a3a50' },
  { name: 'タコの銃使い', who: 'イカルゴ', note: 'タコの体・ニット帽',
    front(d) {
      d.b(2, -2, 8, 2.4, '#3a5a8a'); d.b(2, -.4, 8, .6, '#2a4a7a');
      d.b(2, 2.8, 8, 3.2, '#e86a6a'); d.b(1, 4.8, 10, 1.2, '#e86a6a');
      [3, 5.5, 8].forEach(x => d.b(x, 3.8, .6, .6, '#f4a0a0'));
    },
    skin: '#e86a6a',
    leg: () => '#e86a6a',
    legs(d) { [1, 3, 5, 7, 9, 11].forEach((x, i) => d.gn(x - .5, 6 + (i % 2) * .4, 1, 1.6, '#e86a6a')); } },
  { name: 'カメレオン', who: 'メレオロン', note: 'カメレオンの顔・くるりと まいた しっぽ',
    back(d) { for (let s = 0; s < 1; s += .08) d.b(10 + Math.sin(s * 6) * 1.5 + s * 2, 5 - s * 3 + Math.cos(s * 6) * 1.2, .8, .8, '#5aa060'); },
    front(d) {
      d.b(2, -.6, 8, 1, '#4a8a50'); d.b(4, -1.4, 4, 1, '#4a8a50');
      d.b(2.4, .2, 2.2, 2, '#f4f0d0'); d.b(7.4, .2, 2.2, 2, '#f4f0d0');
      d.b(2, 3, 8, 3, '#e8e0c0'); d.b(2, 3, 8, .5, '#c8c0a0');
      sleeve(d, '#e8e0c0');
    },
    skin: '#6ab070',
    leg: () => '#4a8a50' },
  { name: 'コインの執事', who: 'ゴトー', note: '執事の 黒い服・メガネ',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#2a2a30'); d.b(2, .2, .5, .6, '#2a2a30'); d.b(9.5, .2, .5, .6, '#2a2a30');
      d.b(2.5, .4, 2, 1.3, '#a8d8f0', .7); d.b(7.5, .4, 2, 1.3, '#a8d8f0'); d.b(4.5, .8, 3, .3, '#3a3a44');
      d.b(2, 3, 8, 3, '#1a1a20'); d.b(4.6, 3, 2.8, 1.6, '#f4f4f4'); d.b(5.4, 3, 1.2, .5, '#1a1a20');
      sleeve(d, '#1a1a20'); d.b(.2, 3.3 + d.la, 1.4, .7, '#f4f4f4'); d.b(10.4, 3.3 + d.ra, 1.4, .7, '#f4f4f4');
    },
    leg: () => '#1a1a20' },
  { name: '杖のメイド', who: 'カナリア', note: '黒い髪・メイドの服と 長い杖',
    front(d) {
      d.b(2, -1, 8, 1.4, '#1e1e24'); d.b(2, .2, .7, 1.2, '#1e1e24'); d.b(9.3, .2, .7, 1.2, '#1e1e24'); d.b(3, -1.6, 6, .6, '#f4f4f4');
      d.b(2, 3, 8, 3, '#2a2a3a'); d.b(3.4, 3.4, 5.2, 2.6, '#f4f4f4'); d.b(3.4, 3.4, 5.2, .3, '#c8c8d0');
      sleeve(d, '#2a2a3a');
      d.b(11.2, -3 + d.ra, .5, 11, '#8a6a4a');
    },
    leg: () => '#2a2a3a' },
  { name: 'おばあさんメイド', who: 'ツボネ', note: '白い髪の おだんご・メイドの服',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#e8e8f0'); d.b(4.6, -2.2, 2.8, 1.6, '#e8e8f0');
      d.b(2.6, 1.6, 1.8, .25, '#a0604a'); d.b(7.6, 1.6, 1.8, .25, '#a0604a'); d.b(4.4, 2.4, 3.2, .3, '#a0604a');
      d.b(2, 3, 8, 3, '#2a2a3a'); d.b(3.4, 3.4, 5.2, 2.6, '#f4f4f4');
      sleeve(d, '#2a2a3a');
    },
    leg: () => '#2a2a3a' },
  { name: '口のない試験官', who: 'サトツ', note: 'くるりと まいた ひげ・口が ない・むらさきのスーツ',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#7a5a3a'); d.b(2, .2, .6, 1, '#7a5a3a'); d.b(9.4, .2, .6, 1, '#7a5a3a');
      d.b(3.4, 2, 5.2, .6, '#7a5a3a'); d.b(2.6, 1.6, 1, .6, '#7a5a3a'); d.b(8.4, 1.6, 1, .6, '#7a5a3a');
      d.b(2, 3, 8, 3, '#5a3a7a'); d.b(4.8, 3, 2.4, 1.4, '#f4f4f4'); d.b(5.6, 3, .8, 2, '#c8a040');
      sleeve(d, '#5a3a7a');
    },
    leg: () => '#5a3a7a' },
  { name: 'ピンクと緑の料理人', who: 'メンチ', note: 'ピンクと緑の髪・包丁',
    front(d) {
      d.b(2, -1, 4, 1.6, '#f08ab8'); d.b(6, -1, 4, 1.6, '#6ac07a'); [[2, -2.2], [5, -2.4], [8, -2.2]].forEach(([x, y], i) => d.b(x, y, 1.2, 1.4, i < 2 ? '#f08ab8' : '#6ac07a'));
      d.b(2, 3, 8, 3, '#1e1e24'); d.b(2, 4.6, 8, .5, '#f4f4f4');
      sleeve(d, '#1e1e24');
      d.b(11.2, 1 + d.ra, .5, 1.4, '#3a2a1a'); d.b(11, -.6 + d.ra, 1, 1.8, '#d8dce8');
    },
    leg: () => '#1e1e24' },
  { name: '大食いの巨体', who: 'ブハラ', note: 'とても大きな体・おなかが ぽっこり',
    back(d) { d.b(.4, .8, 11.2, 5.6, ORANGE); },
    front(d) {
      d.b(2, -.4, 8, .6, '#3a2a1a'); d.b(4, 2, 4, .6, '#7a2a1a');
      d.b(.4, 3.4, 11.2, 2.6, '#f4f4f4'); d.b(2, 4.4, 8, 1, '#e8e0cc'); d.b(.4, 5.6, 11.2, .6, '#3a5a8a');
    },
    leg: () => '#3a5a8a' },
  { name: '虎咬拳', who: 'カストロ', note: '長い髪・中国風の服',
    back(d) { d.b(1.4, -1, 9.2, 6, '#5a3a2a'); },
    front(d) {
      d.b(2, -1, 8, 1.6, '#5a3a2a'); d.b(2, 0, .7, 2.6, '#5a3a2a'); d.b(9.3, 0, .7, 2.6, '#5a3a2a');
      d.b(2, 3, 8, 3, '#e8e0c0'); d.b(5.6, 3, .8, 3, '#c8a040'); [3.6, 4.6].forEach(y => d.b(4.4, y, 3.2, .3, '#c8a040'));
      sleeve(d, '#e8e0c0');
    },
    leg: () => '#3a3a40' },
  { name: 'コマの体', who: 'ギド', note: '帽子と コマのような 一本足',
    front(d) {
      d.b(2.4, -2.4, 7.2, 2, '#3a3a4a'); d.b(1, -.6, 10, .7, '#3a3a4a');
      d.b(2, 3, 8, 3, '#c84a3a'); d.b(2, 3.8, 8, .5, '#f2c14e'); d.b(2, 5, 8, .5, '#3a6ad8');
      sleeve(d, '#c84a3a');
    },
    leg: () => 'rgba(0,0,0,0)',
    legs(d) { d.gn(3, 6, 6, .8, '#c84a3a'); d.gn(4.5, 6.8, 3, .6, '#8a8a90'); d.gn(5.6, 7.4, .8, .6, '#5a5a60'); } },
  { name: '変身する獣', who: 'キリコ', note: '毛むくじゃらの 体・大きな 口',
    back(d) { [[1, -1], [3.5, -2], [6.5, -2], [9, -1], [.4, 2], [10.6, 2]].forEach(([x, y]) => d.b(x, y, 1.4, 1.6, '#6a5a3a')); },
    front(d) {
      d.b(1.6, -.8, 8.8, 7, '#7a6a4a'); [[2.4, 3], [8, 2.6], [5, 4.6]].forEach(([x, y]) => d.b(x, y, 1.2, .4, '#5a4a2a'));
      d.b(3, 1, 1, 1, '#f2c14e'); d.b(8, 1, 1, 1, '#f2c14e');
      d.b(3.6, 2.6, 4.8, 1.2, '#2a1a10'); [4, 5.4, 6.8].forEach(x => d.b(x, 2.6, .6, .6, '#f4f4f4'));
      fullArm(d, '#7a6a4a');
    },
    eye: '#f2c14e',
    leg: () => '#6a5a3a' },
  { name: 'ボクサーのコアラ', who: 'コアラ', note: '丸い 耳・灰色の体・赤い グローブ',
    front(d) {
      d.b(.6, -.8, 2.6, 2.6, '#8a8a94'); d.b(8.8, -.8, 2.6, 2.6, '#8a8a94'); d.b(1.2, -.2, 1.4, 1.4, '#e8e0e8'); d.b(9.4, -.2, 1.4, 1.4, '#e8e0e8');
      d.b(5, 1.4, 2, 1.4, '#2a2a30');
      d.b(2, 3.4, 8, 2.6, '#a8a8b0'); d.b(2, 5.2, 8, .8, '#3a5a8a');
      d.b(-.4, 2 + d.la, 2.4, 2.2, '#d02a2a'); d.b(10, 2 + d.ra, 2.4, 2.2, '#d02a2a');
    },
    skin: '#9a9aa4',
    leg: () => '#8a8a94' },
);

// 3回目の 20人の 変わり方・ひとこと・決めの動き
ACT.push(
  { tr: 'blink', say: 'ズゴゴ', how: 'メガネと 黒いボブ。掃除機の デメちゃんで 吸いこむ',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const op = Math.floor(u * 6) % 2; Rg(g, OX + 11.6, OY + 1.4, 3.6, 3, '#7a7a8a'); Rg(g, OX + 11.6, OY + 1.4, 3.6, .5, '#9a9aaa'); Rg(g, OX + 12, OY + 1.8, 1.2, 1.2, '#f4f4f4'); Rg(g, OX + 13.6, OY + 1.8, 1.2, 1.2, '#f4f4f4'); Rg(g, OX + 12.4, OY + 2.2, .5, .6, '#1a1a1a'); Rg(g, OX + 14, OY + 2.2, .5, .6, '#1a1a1a'); Rg(g, OX + 12.2, OY + 3.4, 2.4, op ? .9 : .4, '#3a1a1a'); Rg(g, OX + 15.2, OY + 3, 2.6, .8, '#4a4a5a'); for (let i = 0; i < 4; i++) { const q = (u * 1.5 + i / 4) % 1; DOT(g, OX + 22 - q * 5, OY + 1 + i * 1.2 + (1 - q) * (i - 1.5), .6, '#b8b8c4', q); } } },
  { tr: 'grow', say: 'ダダダ', how: 'ぬい目の 大男。指の先から 念の弾を ダダダ',
    mot: u => ({ sx: 1.1, sy: 1.1, dx: u > .4 ? (hash(Math.floor(u * 30)) - .5) * .3 : 0, mode: 'still' }),
    fx(g, u) { if (u > .4) for (let i = 0; i < 5; i++) { const q = ((u - .4) * 3 + i / 5) % 1; DOT(g, OX + 13 + q * 10, OY + 2.8 + (i % 3 - 1) * .6, .7, '#f2c14e', 1 - q * .5); } } },
  { tr: 'up', say: '♪', how: '包帯の体。おどると 体の あなから 音が 鳴る',
    mot: u => ({ dx: Math.sin(u * Math.PI * 3) * .8, dy: -Math.abs(Math.sin(u * Math.PI * 3)) * .6, mode: 'talk' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u * 1.3 + i / 3) % 1, x = PX - 6 + i * 6, y = OY - 1 - q * 4; Rg(g, x, y + 1, .9, .7, '#5a3ab8', 1 - q); Rg(g, x + .6, y - .4, .3, 1.5, '#5a3ab8', 1 - q); } } },
  { tr: 'spin', say: 'コピー', how: '長い髪で 顔が かくれた 小さな体。さわった物を 2つに コピー',
    mot: u => ({ sx: .85, sy: .85, mode: 'still' }),
    fx(g, u) { const b = (x, a) => { Rg(g, x, PY - 2.4, 2.4, 2.4, '#c87a3a', a); Rg(g, x, PY - 2.4, 2.4, .6, '#e8a050', a); }; b(OX + 12.5, 1); if (u > .7) b(OX + 15.5, Math.min(1, (u - .7) * 3)); } },
  { tr: 'flash', say: 'ドカン', how: '短い金髪と 白いシャツ。手で つかむと ドカン',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { if (u < .8) Rg(g, OX + 12.5, OY + 2, 1.6, 1.6, '#7a8090'); else if (u < 1.5) { const k = (u - .8) / .7; g.disc(gx(OX + 13.3), gy(OY + 2.8), Math.round(1 + k * 5), k < .5 ? '#ffb02e' : '#a8a8b8', 1 - k * .6); } } },
  { tr: 'side', say: 'ビュン', how: 'うしろに流した長髪と 日焼けした体。ドッジボールの 豪速球',
    mot: u => ({ dx: u > .6 && u < .8 ? 1 : 0, mode: 'still' }),
    fx(g, u) { if (u < .6) g.disc(gx(OX + 13), gy(OY + 1.5), 2, '#e84a3a'); else { const q = Math.min(1, (u - .6) / .4); g.disc(gx(OX + 13 + q * 14), gy(OY + 2.5), 2, '#e84a3a'); for (let i = 1; i < 4; i++) Rg(g, OX + 13 + q * 14 - i * 1.5 - 1, OY + 2.3, 1, .4, '#f4f4f4', 1 - i * .25); } } },
  { tr: 'down', say: 'スゥ…', how: 'フードの念使い。浮かぶ 手が まわりを 飛ぶ',
    mot: u => ({ dy: -Math.sin(u * 3) * .4, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const a = u * 3 + i * 2.1, x = PX + Math.cos(a) * 8, y = OY + 3 + Math.sin(a) * 3; Rg(g, x - .8, y - .6, 1.6, 1.2, '#d97757'); Rg(g, x - .8, y - 1, .3, .5, '#d97757'); Rg(g, x - .2, y - 1.1, .3, .5, '#d97757'); Rg(g, x + .4, y - 1, .3, .5, '#d97757'); } } },
  { tr: 'side', say: 'ガチャ', how: '四角いメガネと スーツ。空中に とびらを 開けて 消える',
    mot: u => ({ a: u > 1.2 ? Math.max(0, 1 - (u - 1.2) * 2.5) : 1, dx: u > 1 ? (u - 1) * 3 : 0, mode: 'still' }),
    fx(g, u) { const k = Math.min(1, u / .6); Rg(g, OX + 12, PY - 7, 3.6, 7, '#3a3a44', k); Rg(g, OX + 12.4, PY - 6.6, 2.8 * Math.max(.2, 1 - Math.max(0, u - .6) * 2), 6.2, '#a8d8f0', k); DOT(g, OX + 14.4, PY - 3.4, .4, '#f2c14e', k); } },
  { tr: 'smoke', say: 'バン', how: 'タコの体と ニット帽。銃を かまえて ねらって うつ',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { Rg(g, OX + 11.6, OY + 2.6, 2.4, .8, '#2a2a30'); Rg(g, OX + 11.6, OY + 3.2, .7, .9, '#2a2a30'); if (u > .8) { const q = Math.min(1, (u - .8) * 2); DOT(g, OX + 15 + q * 8, OY + 2.9, .5, '#f2c14e'); if (q < .2) DOT(g, OX + 14.4, OY + 2.9, 1.2, '#ffb04a'); } } },
  { tr: 'grow', say: 'スゥ', how: 'カメレオンの顔と しっぽ。息を止めると すうっと 消える',
    mot: u => ({ a: u < .5 ? 1 : u < 1.2 ? 1 - (u - .5) / .7 * .9 : .1 + Math.min(.9, (u - 1.2) * 2), mode: 'still' }),
    fx(g, u) { if (u > .4 && u < .9) DOT(g, OX + 11, OY - 1, 1, '#c8c8d4', .7); } },
  { tr: 'spin', say: 'ピンッ', how: '執事の 黒い服と メガネ。コインを 指で はじく',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 2; i++) { const q = ((u + i * .5) % 1); DOT(g, OX + 11.5 + q * 3, OY + 1.5 - Math.sin(q * Math.PI) * 5, q < .1 ? .3 : .9, '#f2c14e'); } } },
  { tr: 'down', say: 'ここから先は', how: 'メイドの服と 長い杖。杖で 地面に 線を 引く',
    mot: u => ({ dx: u < .8 ? -u * 2 : -1.6 + (u - .8) * 1.3, mode: 'still' }),
    fx(g, u) { const k = Math.min(1, u / 1.4); Rg(g, OX - 2, PY + .2, k * 16, .4, '#c84a3a'); } },
  { tr: 'smoke', say: 'ブルン', how: '白い髪の おだんご。大きな バイクに 変身する',
    mot: u => ({ a: u < .7 ? 1 : 0, mode: 'still' }),
    fx(g, u) { if (u < .6) return; const k = Math.min(1, (u - .6) * 3), x = PX - 7 + (u > 1.3 ? (u - 1.3) * 4 : 0);
      g.disc(gx(x + 1.5), gy(PY - 1.6), 3, '#2a2a30', k); g.disc(gx(x + 12), gy(PY - 1.6), 3, '#2a2a30', k); Rg(g, x + 1.5, PY - 5, 10, 2.6, '#e8e8f0', k); Rg(g, x + 3, PY - 6.4, 5, 1.6, '#2a2a3a', k); Rg(g, x + 10, PY - 7, .5, 2.4, '#8a8a90', k); DOT(g, x + 12, PY - 4, .8, '#f2c14e', k); } },
  { tr: 'side', say: 'スタスタ', how: 'まいた ひげの 試験官。スタスタ 早歩きで 走りぬける',
    mot: u => ({ dx: u < 1.2 ? -Math.sin(u / 1.2 * Math.PI) * 4 : 0, mode: 'walk' }),
    fx(g, u) { if (u > .1 && u < 1.1) for (let i = 0; i < 3; i++) Rg(g, OX + 12 - Math.sin(u / 1.2 * Math.PI) * 4, OY + 2 + i * 1.6, 1.6, .3, '#c8c8d4', .7); } },
  { tr: 'flash', say: 'トントン', how: 'ピンクと緑の髪の 料理人。包丁で トントン、味見して ニッコリ',
    mot: u => ({ dy: u < 1.2 && Math.floor(u * 8) % 2 ? .2 : 0, mode: 'still' }),
    fx(g, u) { Rg(g, OX + 10.5, PY - 1, 6, .8, '#c8a060'); for (let i = 0; i < 3; i++) Rg(g, OX + 12 + i * 1.2, PY - 1.8, .9, .8, ['#e84a3a', '#5ab05a', '#f2c14e'][i]); if (u > 1.3) { DOT(g, OX + 1, OY + 1.2, .7, '#ff9db8'); DOT(g, OX + 11, OY + 1.2, .7, '#ff9db8'); } } },
  { tr: 'grow', say: 'ペロリ', how: 'とても大きな体。ブタの 丸焼きを ペロリと 食べる',
    mot: u => ({ sx: u > 1.2 ? 1.08 : 1, sy: u > 1.2 ? 1.05 : 1, mode: 'still' }),
    fx(g, u) { if (u < 1.1) { const k = 1 - Math.max(0, (u - .4) / .7); if (k > 0) { Rg(g, OX + 12, PY - 3, 4 * k, 2.4, '#c86a3a'); Rg(g, OX + 12, PY - 3, 4 * k, .6, '#e88a4a'); Rg(g, OX + 12 + 4 * k, PY - 2.4, .6, 1, '#c86a3a'); } } } },
  { tr: 'blink', say: 'ガッ', how: '長い髪の 武道家。分身して 虎咬拳',
    mot: u => ({ dx: u > 1 && u < 1.3 ? 1.2 : 0, mode: 'still' }),
    before(g, u) { if (u > .3 && u < 1.4) { const k = Math.min(1, (u - .3) * 3); drawCos(g, COS[66], u, 'still', { dx: -4 * k, a: .4 }); } },
    fx(g, u) { if (u > 1 && u < 1.4) for (let i = 0; i < 3; i++) Rg(g, OX + 12.5 + i * .5, OY + 1.5 + i, .4, 1.6, '#f2c14e', .9); } },
  { tr: 'spin', say: 'くるくる', how: '帽子と 一本足の コマの体。くるくる 回る',
    mot: u => { const s = Math.cos(u * 14); return { sx: Math.max(.2, Math.abs(s)) * (s < 0 ? -1 : 1), dx: Math.sin(u * 2) * 2, mode: 'still' }; },
    fx(g, u) { for (let i = 0; i < 3; i++) DOT(g, PX - 3 + i * 3 + Math.sin(u * 2) * 2, PY + .3, .5, '#c8c8d4', .6); } },
  { tr: 'smoke', say: 'ガルル', how: '毛むくじゃらの 獣。人の すがたと 獣を 行ったり来たり',
    mot: u => ({ a: Math.floor(u * 3) % 3 === 1 ? 0 : 1, mode: 'still' }),
    fx(g, u) { if (Math.floor(u * 3) % 3 === 1) mascotIdle(g, u); } },
  { tr: 'flash', say: 'シュッシュッ', how: '丸い耳と 赤い グローブ。シュッシュッと ボクシング',
    mot: u => ({ dx: Math.floor(u * 6) % 2 ? .6 : 0, dy: Math.sin(u * 12) * .2, mode: 'talk' }),
    fx(g, u) { if (Math.floor(u * 6) % 2) for (let i = 0; i < 2; i++) Rg(g, OX + 13.5 + i * .4, OY + 2.2 + i * 1.2, 1.5, .3, '#f4f4f4', .7); } },
);

// ----- 4回目の 20人（371〜390 番） -----
COS.push(
  { name: 'ゴンのおばさん', who: 'ミト', note: 'オレンジの髪・白いエプロン',
    back(d) { d.b(1.6, -1, 8.8, 3.6, '#c8603a'); },
    front(d) {
      d.b(2, -1.2, 8, 1.6, '#c8603a'); d.b(1.6, 0, .9, 2.6, '#c8603a'); d.b(9.5, 0, .9, 2.6, '#c8603a'); d.b(2, -1.2, 4, .5, '#e07a4a');
      d.b(4.8, 2.3, 2.4, .4, '#a03a2a');
      d.b(2, 3, 8, 3, '#5a8ac8'); d.b(3, 3.3, 6, 2.7, '#f4f4f4'); d.b(3, 4.4, 6, .3, '#c8c8d0');
      sleeve(d, '#5a8ac8');
    },
    leg: () => '#5a8ac8' },
  { name: '守衛のおじいさん', who: 'ゼブロ', note: '白い ひげの おじいさん・作業着',
    front(d) {
      d.b(2, -.4, 8, .8, '#e8e8f0'); d.b(2, .4, .5, 1, '#e8e8f0'); d.b(9.5, .4, .5, 1, '#e8e8f0');
      d.b(2.6, .3, 1.8, .4, '#e8e8f0'); d.b(7.6, .3, 1.8, .4, '#e8e8f0'); d.b(3.4, 2, 5.2, 1.6, '#e8e8f0');
      d.b(2, 3.4, 8, 2.6, '#6a7a5a'); d.b(2, 3.4, 8, .5, '#5a6a4a');
      sleeve(d, '#6a7a5a');
    },
    leg: () => '#4a5a3a' },
  { name: 'ハチの帽子', who: 'ポンズ', note: 'ハチの巣のような 大きな帽子・短い茶髪',
    front(d) {
      d.b(1, -3.2, 10, 3.6, '#c8a050'); [-2.6, -1.6, -.6].forEach(y => d.b(1, y, 10, .3, '#8a6a30')); d.b(4.6, -1.4, 2.8, 1.2, '#3a2a1a');
      d.b(1.6, .4, 1, 2.2, '#8a5a3a'); d.b(9.4, .4, 1, 2.2, '#8a5a3a');
      d.b(2, 3, 8, 3, '#7a8a5a'); d.b(5.6, 3, .8, 3, '#5a6a3a');
      sleeve(d, '#7a8a5a');
    },
    leg: () => '#5a5a4a' },
  { name: 'ひげの武道家', who: 'ボドロ', note: '口ひげの おじさん・白い 道着',
    front(d) {
      d.b(2, -.6, 8, 1, '#3a2a1a');
      d.b(2.6, .3, 1.8, .4, '#3a2a1a'); d.b(7.6, .3, 1.8, .4, '#3a2a1a'); d.b(3.4, 2.1, 5.2, .7, '#3a2a1a'); d.b(3, 2.5, 1, .8, '#3a2a1a'); d.b(8, 2.5, 1, .8, '#3a2a1a');
      d.b(2, 3.2, 8, 2.8, '#f0ece0'); d.b(4.4, 3.2, 1, 1.2, '#c8c4b8'); d.b(6.6, 3.2, 1, 1.2, '#c8c4b8'); d.b(2, 4.9, 8, .6, '#3a3a6a');
      sleeve(d, '#f0ece0');
    },
    leg: () => '#f0ece0' },
  { name: '吹き矢の狩人', who: 'ゲレタ', note: '羽かざりの はちまき・顔の もよう',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#2a1a10'); d.b(1.8, -.4, 8.4, .6, '#c84a3a'); d.b(8.6, -2.4, .7, 2.2, '#f2c14e'); d.b(9.4, -2, .6, 1.8, '#3a8ac8');
      d.b(2.4, 1.8, 1.4, .3, '#f4f4f4'); d.b(8.2, 1.8, 1.4, .3, '#f4f4f4');
      d.b(2, 3, 8, 3, '#8a6a3a'); [3, 5, 7].forEach(x => d.b(x, 3.6, 1, .5, '#c84a3a'));
      sleeve(d, '#8a6a3a');
    },
    leg: () => '#6a5a3a' },
  { name: '監獄の所長', who: 'リッポー', note: 'サングラス・とがった髪・きっちりした 服',
    front(d) {
      d.b(2, -1, 8, 1.4, '#2a2a30'); [[2.4, -2], [5, -2.4], [7.6, -2]].forEach(([x, y]) => d.b(x, y, 1.2, 1.4, '#2a2a30'));
      d.b(2.2, .5, 3.2, 1.2, '#1a1a1a'); d.b(6.6, .5, 3.2, 1.2, '#1a1a1a'); d.b(5.4, .8, 1.2, .3, '#1a1a1a');
      d.b(4.6, 2.4, 2.8, .4, '#5a2a1a');
      d.b(2, 3, 8, 3, '#4a5a6a'); d.b(5.6, 3, .8, 3, '#c8a040'); [3.6, 4.8].forEach(y => d.b(3, y, 1, .4, '#c8a040'));
      sleeve(d, '#4a5a6a');
    },
    leg: () => '#3a4a5a' },
  { name: '犬使い', who: 'スクワラ', note: '長めの 茶髪・ジャケット',
    front(d) {
      d.b(2, -1, 8, 1.6, '#7a4a2a'); d.b(1.6, 0, 1, 2.6, '#7a4a2a'); d.b(9.4, 0, 1, 2.6, '#7a4a2a');
      d.b(2, 3, 8, 3, '#5a6a8a'); d.b(4.8, 3, 2.4, 1.6, '#f4f4f4'); d.b(5.6, 3, .8, 3, '#3a4a6a');
      sleeve(d, '#5a6a8a');
    },
    leg: () => '#3a3a44' },
  { name: '俳句の念', who: 'バショウ', note: '口ひげと 着物・大きな 筆',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#1a1a1a'); d.b(5, -2, 2, 1.4, '#1a1a1a');
      d.b(3.4, 2.1, 5.2, .6, '#1a1a1a'); d.b(2.8, 2.5, 1.2, .5, '#1a1a1a'); d.b(8, 2.5, 1.2, .5, '#1a1a1a');
      d.b(2, 3, 8, 3, '#3a3a5a'); d.b(4, 3, 1, 1.4, '#5a5a7a'); d.b(7, 3, 1, 1.4, '#5a5a7a'); d.b(2, 4.6, 8, .6, '#c8a040');
      sleeve(d, '#3a3a5a');
      d.b(11.2, .4 + d.ra, .5, 3.2, '#8a5a30'); d.b(11.1, 3.4 + d.ra, .7, .9, '#1a1a1a');
    },
    leg: () => '#3a3a5a' },
  { name: '投げキッス', who: 'ヴェーゼ', note: '長い 金髪・赤い ドレス',
    back(d) { d.b(1.2, -1, 9.6, 6.6, '#e8c860'); },
    front(d) {
      d.b(2, -1, 8, 1.6, '#e8c860'); d.b(2, 0, .8, 3.6, '#e8c860'); d.b(9.2, 0, .8, 3.6, '#e8c860');
      d.b(5, 2.3, 2, .6, '#d02a4a');
      d.b(2.8, 3, 6.4, 3, '#c82a3a'); d.b(4.6, 3, 2.8, .6, ORANGE);
      sleeve(d, '#c82a3a');
    },
    leg: () => '#c82a3a',
    legs(d) { d.gn(2, 6, 8, 1.6, '#c82a3a'); } },
  { name: 'ひげの賞金首ハンター', who: 'ツェズゲラ', note: '口ひげと あごひげ・きっちりした スーツ',
    front(d) {
      d.b(2, -.8, 8, 1.2, '#4a3a2a'); d.b(2, .2, .5, .6, '#4a3a2a'); d.b(9.5, .2, .5, .6, '#4a3a2a');
      d.b(3.2, 2, 5.6, .6, '#4a3a2a'); d.b(4.6, 2.6, 2.8, .8, '#4a3a2a');
      d.b(2, 3.4, 8, 2.6, '#2a2a3a'); d.b(4.8, 3.4, 2.4, 1.2, '#f4f4f4'); d.b(5.6, 3.4, .8, 1.8, '#8a2a3a');
      sleeve(d, '#2a2a3a');
    },
    leg: () => '#2a2a3a' },
  { name: 'ぎょろ目の占い', who: 'パーム', note: 'ぼさぼさの 長い黒髪・大きな ぎょろ目',
    back(d) { d.b(.8, -1.4, 10.4, 7.6, '#1a1a22'); },
    front(d) {
      d.b(1.6, -1.6, 8.8, 2, '#1a1a22'); d.b(1.4, 0, 1.4, 4, '#1a1a22'); d.b(9.2, 0, 1.4, 4, '#1a1a22'); [[1, -2.2], [5, -2.4], [9, -2.2]].forEach(([x, y]) => d.b(x, y, 1.4, 1, '#1a1a22'));
      d.b(2.6, .4, 2, 1.6, '#f4f4f4'); d.b(7.4, .4, 2, 1.6, '#f4f4f4'); d.b(3.2, .8, .9, .9, EYE); d.b(8, .8, .9, .9, EYE);
      d.b(4.4, 2.5, 3.2, .3, '#8a2a3a');
      d.b(2.8, 3, 6.4, 3, '#3a2a4a');
      sleeve(d, '#3a2a4a');
    },
    leg: () => '#3a2a4a' },
  { name: 'オオカミの蟻', who: 'ウェルフィン', note: 'オオカミの 耳と 顔・つんつんの 髪',
    front(d) {
      d.b(2, -1.6, 1.6, 2, '#6a6a7a'); d.b(8.4, -1.6, 1.6, 2, '#6a6a7a'); d.b(2, -.6, 8, 1, '#8a8a9a'); [[3.6, -1.6], [5.4, -2], [7, -1.6]].forEach(([x, y]) => d.b(x, y, 1, 1.2, '#8a8a9a'));
      d.b(4.4, 1.8, 3.2, 1.2, '#e8e0d8'); d.b(5.4, 1.8, 1.2, .5, '#1a1a1a');
      d.b(2, 3.2, 8, 2.8, '#3a4a3a'); d.b(2, 3.2, 8, .5, '#2a3a2a');
      sleeve(d, '#3a4a3a');
    },
    eye: '#e8c040',
    leg: () => '#2a3a2a' },
  { name: 'チーターの蟻', who: 'ヂートゥ', note: 'チーターの もよう・長い しっぽ',
    back(d) { for (let s = 0; s < 1; s += .08) d.b(10 + s * 4, 4.4 - Math.sin(s * 3) * 2, .8, .8, s > .85 ? '#1a1a1a' : '#e8b040'); },
    front(d) {
      d.b(2.4, -1.2, 1.4, 1.4, '#e8b040'); d.b(8.2, -1.2, 1.4, 1.4, '#e8b040');
      spots(d, [[3, 3.4, .6, .6], [5, 4, .6, .6], [7.4, 3.6, .6, .6], [4, 5, .6, .6], [8, 5, .6, .6], [2.6, -.2, .5, .5], [9, -.2, .5, .5]], '#3a2a1a');
      d.b(3.4, 1.6, .5, 1.2, '#3a2a1a'); d.b(8.1, 1.6, .5, 1.2, '#3a2a1a');
    },
    skin: '#e8b040',
    leg: () => '#e8b040' },
  { name: 'サソリの女王', who: 'ザザン', note: '長い 黒髪・サソリの しっぽ',
    back(d) { const sw = Math.sin(d.t * 3) * .4; for (let s = 0; s < 1; s += .07) d.b(10 + Math.sin(s * 3) * 2, 5 - s * 8 + sw * s, 1, 1, '#5a2a4a'); d.b(10.8 + sw, -3.4, 1.4, 1, '#c8a040'); },
    front(d) {
      d.b(2, -1.2, 8, 1.6, '#1a1a22'); d.b(1.6, 0, 1, 3.6, '#1a1a22'); d.b(9.4, 0, 1, 3.6, '#1a1a22');
      d.b(5, 2.3, 2, .4, '#8a2a5a');
      d.b(2.8, 3, 6.4, 3, '#5a2a4a'); d.b(2.8, 3, 6.4, .5, '#c8a040');
      sleeve(d, '#5a2a4a');
    },
    eye: '#c84a8a',
    leg: () => '#5a2a4a' },
  { name: 'ライオンの蟻', who: 'レオル', note: 'ライオンの たてがみ・キャップ',
    back(d) { d.b(.6, -1.4, 10.8, 6, '#c87a2a'); [[0, 1], [11, 1], [0, -1], [11, -1]].forEach(([x, y]) => d.b(x, y, 1, 1.4, '#c87a2a')); },
    front(d) {
      d.b(2, -2.2, 8, 2, '#2a4a8a'); d.b(1, -.4, 6, .7, '#2a4a8a');
      d.b(4.4, 1.6, 3.2, 1.4, '#f0d0a0'); d.b(5.4, 1.6, 1.2, .6, '#3a2a1a');
      d.b(2, 3.2, 8, 2.8, '#e8e0d0'); d.b(5.6, 3.2, .8, 2.8, '#c8c0b0');
      sleeve(d, '#e8e0d0');
    },
    skin: '#e8a050',
    leg: () => '#3a3a44' },
  { name: 'タカの蟻', who: 'コルト', note: 'タカの 顔と くちばし・つばさ',
    back(d) { const fl = Math.sin(d.t * 6) > 0 ? .4 : 0; d.b(-2.4, 1 - fl, 2.4, 3.6, '#6a4a2a'); d.b(12, 1 - fl, 2.4, 3.6, '#6a4a2a'); d.b(-2, 4, 2, .8, '#4a3a1a'); d.b(12, 4, 2, .8, '#4a3a1a'); },
    front(d) {
      d.b(2, -.8, 8, 1.4, '#6a4a2a');
      d.b(5, 1.4, 2, 1.2, '#e8b030'); d.b(5.6, 2.6, .8, .6, '#c88a20');
      d.b(2, 3.2, 8, 2.8, '#f0e8d8'); [[3, 3.8], [5, 4.6], [7, 3.8]].forEach(([x, y]) => d.b(x, y, 1.2, .3, '#8a7a5a'));
      sleeve(d, '#6a4a2a');
    },
    skin: '#8a6a4a',
    leg: () => '#e8b030' },
  { name: '蟻の女王', who: '女王', note: '大きな おなか・王冠',
    back(d) { d.b(-.6, 2, 13.2, 4.8, '#5a7a4a'); d.b(-1.2, 3, 1, 2.6, '#4a6a3a'); },
    front(d) {
      d.b(2.6, -2.2, 6.8, 1.6, '#f2c14e'); [3, 5.4, 7.8].forEach(x => d.b(x, -3, 1.2, 1, '#f2c14e')); d.b(5.6, -1.8, .8, .8, '#c84a8a');
      d.b(2.6, 1.6, 1, .5, '#e8e0d0'); d.b(8.4, 1.6, 1, .5, '#e8e0d0');
      d.b(-.6, 3.4, 13.2, 3.2, '#6a8a5a'); [0, 3, 6, 9].forEach(x => d.b(x, 4.4, 2.4, .3, '#4a6a3a'));
    },
    skin: '#7a9a6a',
    leg: () => '#4a6a3a' },
  { name: 'アルカの もう一人', who: 'ナニカ', note: 'まっ黒な 目と 口・アルカの すがた',
    back(d) { d.b(1.4, -1, 9.2, 6.4, '#141418'); },
    front(d) {
      d.b(2, -1, 8, 1.4, '#141418'); d.b(2, 0, .8, 3.8, '#141418'); d.b(9.2, 0, .8, 3.8, '#141418'); d.b(1.8, -1.6, 8.4, .7, '#e8b830');
      d.b(2.6, .3, 2, 1.8, '#000000'); d.b(7.4, .3, 2, 1.8, '#000000'); d.b(4.4, 2.3, 3.2, 1, '#000000');
      d.b(2.8, 3, 6.4, 3, '#f4a0b8'); d.b(2.8, 4.6, 6.4, .7, '#c0262c');
      sleeve(d, '#f4a0b8');
    },
    eye: '#000000',
    leg: () => '#f4a0b8',
    legs(d) { d.gn(2, 6, 8, 1.4, '#f4a0b8'); } },
  { name: '小さな ひいおじいさん', who: 'マハ', note: '白い まゆと ひげ・小さな体・ゾルディックの 服',
    front(d) {
      d.b(2, -.4, 8, .8, '#e8e8f0'); d.b(2.2, .2, 2.6, .8, '#e8e8f0'); d.b(7.2, .2, 2.6, .8, '#e8e8f0'); d.b(3.6, 2, 4.8, 3, '#e8e8f0'); d.b(4.6, 5, 2.8, .8, '#e8e8f0');
      d.b(2, 3, 1.6, 3, '#3a4a6a'); d.b(8.4, 3, 1.6, 3, '#3a4a6a');
      sleeve(d, '#3a4a6a');
    },
    leg: () => '#3a4a6a' },
  { name: '針だらけの顔', who: 'ギタラクル', note: '顔じゅうに 針・とがった 髪・ゆったりした 服',
    front(d) {
      [[2, -2], [4, -2.8], [6, -3], [8, -2.6], [9.4, -1.8]].forEach(([x, y]) => d.b(x, y, 1, -y + .2, '#3a6a6a')); d.b(2, -.6, 8, 1, '#3a6a6a');
      [[2.6, .2], [4.6, -.2], [6.8, .1], [9, .4], [3.8, 2.2], [7.6, 2.4], [5.6, 2.6]].forEach(([x, y]) => { d.b(x, y - .8, .25, 1, '#c8ccd8'); d.b(x - .15, y - .9, .55, .3, '#e8e8f0'); });
      d.b(2, 3, 8, 3, '#6a5a8a'); d.b(2, 3, 8, .5, '#c8c8d8'); [3, 5, 7].forEach(x => d.b(x, 4, 1.4, .3, '#c8c8d8'));
      sleeve(d, '#6a5a8a');
    },
    leg: () => '#6a5a8a' },
);

// 4回目の 20人の 変わり方・ひとこと・決めの動き
ACT.push(
  { tr: 'down', say: 'ごはんよー', how: 'オレンジの髪と エプロン。おたまを ふって ごはんの 合図',
    mot: u => ({ mode: 'talk' }),
    fx(g, u) { const a = Math.sin(u * 8) * .6; Rg(g, OX + 12 + a * .5, OY + 1, .4, 3, '#a8a8b8'); Rg(g, OX + 11.4 + a * .5, OY + .4, 1.6, .9, '#a8a8b8'); for (let i = 0; i < 2; i++) { const q = (u + i / 2) % 1; DOT(g, OX - 1 + i * .8, OY + 1 - q * 4, .6, '#e8e8f0', 1 - q); } } },
  { tr: 'up', say: 'ぐぐぐ', how: '白いひげの おじいさん。「試しの門」を ぐぐっと 押して 開ける',
    mot: u => ({ dx: Math.min(1, u) * .8, dy: u < 1 ? (hash(Math.floor(u * 20)) - .5) * .2 : 0, mode: 'still' }),
    fx(g, u) { const k = Math.min(1, Math.max(0, (u - .3) / 1.2)); Rg(g, OX + 12.6 + k * 1.6, PY - 10, 5, 10, '#8a8a90'); Rg(g, OX + 12.6 + k * 1.6, PY - 10, 5, .6, '#a8a8b0'); Rg(g, OX + 14.6 + k * 1.6, PY - 6, 1, 1, '#5a5a60'); } },
  { tr: 'smoke', say: 'ブーン', how: 'ハチの巣の帽子。帽子から ハチが ブーンと 飛び出す',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { const q = (u * .8 + i / 4) % 1, a = i * 1.6 + u * 4, x = PX + Math.cos(a) * q * 9, y = OY - 3 + Math.sin(a) * q * 4 - q * 2; Rg(g, x - .4, y - .3, .8, .6, '#f2c14e', 1 - q * .5); Rg(g, x - .1, y - .3, .2, .6, '#1a1a1a', 1 - q * .5); Rg(g, x - .3, y - .8, .6, .4, '#e8f4ff', .7 - q * .5); } } },
  { tr: 'flash', say: 'ハッ', how: '口ひげの 武道家。型を ビシッと 決める',
    mot: u => ({ sy: u > .5 && u < 1.4 ? .9 : 1, dx: u > .9 && u < 1.4 ? .6 : 0, mode: 'still' }),
    fx(g, u) { if (u > .9 && u < 1.4) for (let i = 0; i < 3; i++) Rg(g, OX + 13 + i * .4, OY + 1.8 + i * 1.2, 2, .3, '#f2c14e', .8); } },
  { tr: 'side', say: 'フッ', how: '羽かざりの 狩人。吹き矢を フッと ふく',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { Rg(g, OX + 8, OY + 2.4, 6, .5, '#8a6a3a'); if (u > .6) { const q = Math.min(1, (u - .6) / .5); Rg(g, OX + 14 + q * 9, OY + 2.5, 1.2, .3, '#e8e0d0'); Rg(g, OX + 14 + q * 9, OY + 2.3, .4, .7, '#c84a3a'); } } },
  { tr: 'blink', say: '？', how: 'サングラスの 所長。なぞの カードを 出す',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const k = Math.min(1, u / .5), y = OY + 1 - k * 2; Rg(g, OX + 12, y, 2.6 * k, 3.4, '#f4f0e0'); if (k >= 1) { Rg(g, OX + 12.8, y + .6, 1, .4, '#c84a3a'); Rg(g, OX + 13.4, y + 1, .4, .8, '#c84a3a'); Rg(g, OX + 13, y + 2.2, .4, .4, '#c84a3a'); } } },
  { tr: 'down', say: 'ワンワン', how: '茶髪の 犬使い。犬たちが わんわん 集まってくる',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const k = Math.min(1, Math.max(0, (u - i * .3) / .6)), x = (i % 2 ? OX + 13 + i * 1.5 : OX - 4 - i * 1.5) + (i % 2 ? 1 : -1) * (1 - k) * 8, c = ['#8a5a30', '#e8e0d0', '#2a2a30'][i], hp = Math.floor(u * 6 + i) % 2 ? -.3 : 0; Rg(g, x, PY - 2.4 + hp, 3, 1.6, c, k); Rg(g, x + (i % 2 ? -.8 : 2.4), PY - 3.2 + hp, 1.4, 1.4, c, k); Rg(g, x + .3, PY - .8, .5, .8, c, k); Rg(g, x + 2.2, PY - .8, .5, .8, c, k); } } },
  { tr: 'spin', say: 'さらさら', how: '着物と 口ひげ。筆で 句を 書くと 文字が 光る',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const k = Math.min(1, u / 1.2); Rg(g, OX + 13, OY - 3, 2.4, 7, '#f4f0e0'); for (let i = 0; i < 3; i++) if (k > i / 3) Rg(g, OX + 13.6, OY - 2.4 + i * 2.2, 1.2, 1.4, '#1a1a1a'); if (u > 1.3) Rg(g, OX + 12.6, OY - 3.4, 3.2, 7.8, '#f2c14e', .3 + Math.sin(u * 10) * .15); } },
  { tr: 'flash', say: 'チュッ', how: '長い 金髪と 赤い ドレス。投げキッスで ハートが 飛ぶ',
    mot: u => ({ dx: Math.sin(u * 3) * .3, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u * .9 + i / 3) % 1, x = OX + 11 + q * 9, y = OY + 2 - q * 3 + Math.sin(q * 8) * .6; Rg(g, x, y, .5, .5, '#e8487d', 1 - q); Rg(g, x + 1, y, .5, .5, '#e8487d', 1 - q); Rg(g, x - .2, y + .5, 1.9, .5, '#e8487d', 1 - q); Rg(g, x + .3, y + 1, .9, .5, '#e8487d', 1 - q); } } },
  { tr: 'smoke', say: 'フッ', how: 'ひげの 賞金首ハンター。うでを 組んで ニヤリ、札束が ひらり',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 4; i++) { const q = (u * .7 + i / 4) % 1; Rg(g, OX + 1 + i * 3 + Math.sin(u * 3 + i), OY - 4 + q * 11, 1.6, .9, '#7ab07a', 1 - q * .4); } } },
  { tr: 'blink', say: 'ジーッ', how: 'ぼさぼさの 長い黒髪。水晶玉を のぞくと 光る',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { const gl = .4 + Math.abs(Math.sin(u * 4)) * .6; g.disc(gx(OX + 13.4), gy(OY + 2.4), 2, '#a8d8f0', gl); g.disc(gx(OX + 13), gy(OY + 2), 1, '#ffffff', gl); Rg(g, OX + 12.2, OY + 4.4, 2.4, .7, '#5a3a2a'); } },
  { tr: 'up', say: 'ピュン', how: 'オオカミの顔の 蟻。髪の毛から ミサイルが ピュン',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 3; i++) { const q = (u - i * .4) / .7; if (q < 0 || q > 1) continue; const x = PX - 2 + i * 2 + q * 8, y = OY - 2 - q * 6 + q * q * 3; Rg(g, x, y, 1.4, .5, '#8a8a9a'); Rg(g, x - .8, y, .8, .5, '#ffb04a', 1 - q); } } },
  { tr: 'side', say: 'ビュン', how: 'チーターの 蟻。目にも とまらぬ 速さで 走る',
    mot: u => ({ dx: u < .3 ? 0 : u < 1.3 ? Math.sin((u - .3) * Math.PI * 2) * 6 : 0, mode: 'walk' }),
    fx(g, u) { if (u > .3 && u < 1.3) { const x = PX + Math.sin((u - .3) * Math.PI * 2) * 6; for (let i = 1; i < 4; i++) Rg(g, x - 6 - i * 1.4, OY + 1 + i * 1.4, 1.6, .3, '#e8b040', .7 - i * .15); } } },
  { tr: 'grow', say: 'チクッ', how: '長い 黒髪の 女王。サソリの しっぽで チクッ',
    mot: u => ({ dx: u > .8 && u < 1.1 ? .4 : 0, mode: 'still' }),
    fx(g, u) { if (u > .8 && u < 1.2) DOT(g, OX + 14, OY - 2, 1.2, '#c84a8a', 1 - (u - .8) * 2.5); } },
  { tr: 'flash', say: 'ガオー', how: 'ライオンの たてがみと キャップ。大きな声で ガオー',
    mot: u => ({ sx: u > .4 && u < 1.4 ? 1.08 : 1, sy: u > .4 && u < 1.4 ? 1.08 : 1, mode: 'still' }),
    fx(g, u) { if (u > .4 && u < 1.4) for (let i = 0; i < 2; i++) { const r = ((u * 2 + i / 2) % 1); for (let a = -2; a <= 2; a++) DOT(g, OX + 12 + r * 6, OY + 2 + a * (1 + r), .5, '#c87a2a', 1 - r); } } },
  { tr: 'up', say: 'バサッ', how: 'タカの 顔と つばさ。つばさを 広げて 飛ぶ',
    mot: u => ({ dy: -Math.sin(Math.min(1, u / 1.9) * Math.PI) * 4, mode: 'still' }),
    fx(g, u) { for (let i = 0; i < 2; i++) { const q = (u + i / 2) % 1; Rg(g, OX + 2 + i * 7, PY - 6 + q * 6, 1.2, .4, '#6a4a2a', 1 - q); } } },
  { tr: 'grow', say: 'ころん', how: '大きな おなかの 女王。王冠が 光って 卵が ころん',
    mot: () => ({ mode: 'still' }),
    fx(g, u) { if (Math.floor(u * 4) % 2) { DOT(g, OX + 3, OY - 3, .8, '#ffffff'); DOT(g, OX + 9, OY - 3, .8, '#ffffff'); } for (let i = 0; i < 2; i++) { const k = Math.min(1, Math.max(0, (u - .4 - i * .6) / .5)); if (k > 0) g.disc(gx(OX - 2 - k * 2 - i * 2.4), gy(PY - 1), 1, '#f4f0e0', k); } } },
  { tr: 'blink', say: 'あい', how: 'まっ黒な 目と 口。手を のばすと 光る',
    mot: u => ({ dy: -Math.sin(u * 3) * .3, mode: 'still' }),
    fx(g, u) { if (u > .5) { const k = Math.min(1, (u - .5) * 2); g.disc(gx(OX + 13), gy(OY + 3), Math.round(1 + k * 2), '#f8f0c0', .7 * k); g.disc(gx(OX + 13), gy(OY + 3), Math.round(k * 1), '#ffffff', k); } } },
  { tr: 'smoke', say: 'ドン', how: '小さな ひいおじいさん。ちょこちょこ 歩いて オーラが ドン',
    mot: u => ({ sx: .85, sy: .85, dx: u < 1 ? Math.sin(u * Math.PI) * 2 : 0, mode: u < 1 ? 'walk' : 'still' }),
    before(g, u) { if (u > 1) { const k = Math.min(1, (u - 1) * 3); g.disc(24, 34, Math.round(4 + k * 9), '#4a5a9a', .35 * k); } } },
  { tr: 'spin', say: 'カタカタ', how: '顔じゅうに 針。カタカタと 首を かしげる',
    mot: u => ({ dx: Math.floor(u * 10) % 2 ? .3 : -.3, sx: Math.floor(u * 3) % 2 ? -1 : 1, mode: 'still' }) },
);

return COS.map((cos, i) => {
  const a = ACT[i];
  return { mob: cos.who, name: cos.name, how: a.how,
    draw(g, t) {
      if (t < 1.2) { mascotIdle(g, t); return; }
      if (t < 1.7) { change(g, t, cos, a.tr); return; }
      const u = t - 1.7, m = a.mot(u);
      if (a.before) a.before(g, u);
      if (a.after && u > .4) { const P = [0, -3, 3, -2, 0], n = Math.min(4, Math.floor(u * 2.5)); for (let j = Math.max(0, n - 2); j < n; j++) drawCos(g, cos, u, 'still', { dx: P[j], a: .3 }); }
      drawCos(g, cos, u, m.mode || 'talk', m);
      if (a.fx) a.fx(g, u);
      g.T(a.say, 24, 8, 5, '#ffffff', seg(t, 2.4, 2.6));
    } };
});
})();

window.CC_HENSHIN = { G, GROUND, hash, seg, makeG, creeper: CREEPER_PATTERNS, zombie: ZOMBIE_PATTERNS, villager: VILLAGER_PATTERNS, jockey: JOCKEY_PATTERNS, kazu: KAZU_PATTERNS, magu: MAGU_PATTERNS, newmob: NEWMOB_PATTERNS, orange: ORANGE_PATTERNS, orange2: ORANGE2_PATTERNS, orange3: ORANGE3_PATTERNS, orange4: ORANGE4_PATTERNS, hxh: HXH_PATTERNS.slice(0, 30), hxh2: HXH_PATTERNS.slice(30, 50), hxh3: HXH_PATTERNS.slice(50, 70), hxh4: HXH_PATTERNS.slice(70) };

// ---------- 案内役（index.html の左下）用に、コマの絵に書き出す ----------
// 見本の画面（48×48）の (24, 42) が、案内役の絵の足もとの中心 (12, 16) にくる。キャラクターの大きさは そのまま同じ
const RX = 12 - 24, RY = 16 - GROUND, STEP = 100, T0 = 0.8, T1 = 3.6;
const hex2 = a => Math.round(clamp(a) * 255).toString(16).padStart(2, '0');
function record(fn) {
  let rects = [], box = [-1e9, -1e9, 1e9, 1e9], dx = 0, dy = 0;
  const q = v => Math.round(v * 5) / 5;
  const g = makeG({
    R(x, y, w, h, c, a = 1) {
      if (a < .08 || w >= G) return; // 画面全体を光らせる・暗くするのは 案内役では使わない
      let x0 = Math.max(q(x) + dx, box[0]), y0 = Math.max(q(y) + dy, box[1]);
      const x1 = Math.min(q(x) + dx + q(w), box[2]), y1 = Math.min(q(y) + dy + q(h), box[3]);
      if (x1 - x0 < .1 || y1 - y0 < .1) return;
      rects.push([a < 1 ? c + hex2(a) : c, q(x0 + RX), q(y0 + RY), q(x1 - x0), q(y1 - y0)]);
    },
    T() {}, // 小さい案内役では 文字は出さない
    clip(x, y, w, h, f) { const b = box; box = [Math.max(b[0], x), Math.max(b[1], y), Math.min(b[2], x + w), Math.min(b[3], y + h)]; f(); box = b; },
    shake(sx, sy, f) { dx += Math.round(sx); dy += Math.round(sy); f(); dx -= Math.round(sx); dy -= Math.round(sy); },
  });
  fn(g);
  // 横にとなり合う同じ色のマスを 1 つにまとめて、絵を軽くする
  const out = [];
  for (const r of rects) {
    const p = out[out.length - 1];
    if (p && p[0] === r[0] && p[2] === r[2] && p[4] === r[4] && Math.abs(p[1] + p[3] - r[1]) < .05) p[3] = q(p[3] + r[3]);
    else out.push(r);
  }
  return out;
}
// 最後は 煙でポンと 元のキャラクターにもどる。★ためし：SMOKE が false の間は 煙を出さず、変身したすがたで おわる（true にもどすと 煙が出る）
const SMOKE = false;
function smoke(g, k) {
  [[24, 34, 0], [16, 38, 1], [32, 38, 2], [20, 28, 3], [28, 27, 4]].forEach(([x, y, i]) =>
    g.disc(x + (x - 24) * k * .3, y - k * 3, Math.round(3 + Math.sin(k * Math.PI) * 4), i % 2 ? '#cfcfd8' : '#9a98a8', 1 - k * .8));
}
function toMoves(list, kind, label) {
  return list.map(p => {
    const seq = [];
    for (let t = T0; t < T1 + 1e-6; t += STEP / 1000) {
      const fr = record(g => p.draw(g, t)), prev = seq[seq.length - 1];
      if (prev && JSON.stringify(prev[0]) === JSON.stringify(fr)) prev[1] += STEP; else seq.push([fr, STEP]);
    }
    seq[seq.length - 1][1] += 500; // 変身したすがたを少し見せる
    const last = seq[seq.length - 1][0];
    if (SMOKE) seq.push([[...last, ...record(g => smoke(g, .3))], 150], [record(g => smoke(g, .55)), 150],
      [[...record(g => mascotIdle(g, 0)), ...record(g => smoke(g, .8))], 150], [record(g => mascotIdle(g, 0)), 400]);
    return { grid: 'grid-henshin-' + kind, name: label + '：' + p.name, desc: p.how, seq, vb: '-12 -26 48 48' };
  });
}
window.CC_HENSHIN_MOVES = [...toMoves(CREEPER_PATTERNS, 'creeper', 'クリーパー'), ...toMoves(ZOMBIE_PATTERNS, 'zombie', 'ゾンビ'), ...toMoves(VILLAGER_PATTERNS, 'villager', '村人'), ...toMoves(JOCKEY_PATTERNS, 'jockey', 'チキンジョッキー'), ...toMoves(KAZU_PATTERNS, 'kazu', 'カズさん'), ...toMoves(MAGU_PATTERNS, 'magu', 'まぐにぃさん'),
  ...NEWMOB_PATTERNS.map(p => toMoves([p], 'newmob', p.mob)[0]), ...ORANGE_PATTERNS.map(p => toMoves([p], 'orange', p.mob)[0]),
  ...ORANGE2_PATTERNS.map(p => toMoves([p], 'orange2', p.mob)[0]), ...ORANGE3_PATTERNS.map(p => toMoves([p], 'orange3', p.mob)[0]),
  ...ORANGE4_PATTERNS.map(p => toMoves([p], 'orange4', p.mob)[0]),
  ...HXH_PATTERNS.map(p => toMoves([p], 'hxh', p.mob)[0])];
})();

// =============================================================
// キャラクターのいろいろな動き（マイクラふう 120個。見本は minecraft-ugoki.html と同じもの。いまは 150個 ＋ クリーパー・ゾンビ・村人・チキンジョッキーへの変身 40個 ＋ カズさん 10個 ＋ まぐにぃさん 10個 ＋ いろいろなモブへの変身 120個）
//   window.CC_EXTRA_ALL に 01〜400 の動きが入っている（いまは 51〜150 をのぞいた 300 個が window.CC_EXTRA）。.seq が [コマの絵, 長さ(ミリ秒)] の並び
// =============================================================
(function ccExtraMoves() {
// --- グローバル変数・共通描画関数 ---
const O = '#d97757', K = '#1a1612', PINK = '#e8687d', CHEEK = '#f2a0a8', GOLD = '#f2c14e';
const AQUA = '#7cc3ea', AQUA_IN = '#d6eefa', WHITE = '#f7f2ee', CAP = '#4a5fa8', QUILT = '#5b7bd5', QUILT2 = '#7d97e0';
const RED = '#e8452f', WATER = '#9fd3f0', IRON = '#5b5f6a', STICK = '#8b5a2b', WOOD = '#c98a4a', GEM = '#4fd1d9';
const ZZ = () => getComputedStyle(document.documentElement).getPropertyValue('--zz').trim() || '#6f7fa8';

const zee = (x, y, c) => [[c,x,y,3,1],[c,x+1,y+1,1,1],[c,x,y+2,3,1]];
const heart = (x, y) => [[PINK,x,y,2,1],[PINK,x+3,y,2,1],[PINK,x,y+1,5,1],[PINK,x+1,y+2,3,1],[PINK,x+2,y+3,1,1]];
const ques = (x, y) => [[O,x,y,3,1],[O,x+2,y+1,1,1],[O,x+1,y+2,1,1],[O,x+1,y+4,1,1]];
const note = (x, y) => [[O,x,y+2,2,2],[O,x+1,y-1,1,3],[O,x+2,y-1,1,1]];
const spark = (x, y) => [[GOLD,x+1,y,1,3],[GOLD,x,y+1,3,1]];
const bang = (x, y) => [[O,x,y,1,3],[O,x,y+4,1,1]];
const moon = (x, y) => [[GOLD,x+1,y,2,1],[GOLD,x,y+1,1,3],[GOLD,x+1,y+4,2,1]];
const sweat = (x, y) => [[WATER,x,y,1,2],[WATER,x-1,y+1,1,1]];
function bubble(x, y, s) {
  if (s === 1) return [[AQUA_IN,x,y,2,2],[AQUA,x,y,1,1]];
  if (s === 2) return [[AQUA_IN,x+1,y+1,2,2],[AQUA,x+1,y,2,1],[AQUA,x,y+1,1,2],[AQUA,x+3,y+1,1,2],[AQUA,x+1,y+3,2,1],[WHITE,x+1,y+1,1,1]];
  return [[AQUA_IN,x+1,y+1,4,4],[AQUA,x+2,y,2,1],[AQUA,x+1,y+1,1,1],[AQUA,x+4,y+1,1,1],[AQUA,x,y+2,1,2],[AQUA,x+5,y+2,1,2],[AQUA,x+1,y+4,1,1],[AQUA,x+4,y+4,1,1],[AQUA,x+2,y+5,2,1],[WHITE,x+2,y+2,1,1]];
}

// キャラクター本体描画
function fig(o = {}) {
  const dx = o.dx || 0, dy = o.dy || 0, sq = o.squash || 0, top = dy + sq, r = [];
  const R = (c, x, y, w, h) => r.push([c, x + dx, y, w, h]);
  if (o.pillow) R(WHITE, 0, top + 1, 24, 6);
  R(O, 4, top, 16, 12 - sq);
  const arm = (side, pose) => {
    if (pose === 'hi') R(O, side, top - 3, 4, 7);
    else if (pose === 'up') R(O, side, top, 4, 4);
    else R(O, side, top + 4, 4, 4);
  };
  arm(0, o.l); arm(20, o.r);
  const lift = o.lift || [];
  if (!o.nolegs) [4, 8, 14, 18].forEach((x, i) => lift.includes(i) ? R(O, x, dy + 12, 2, 2) : R(O, x, dy + 12, 2, 4));
  const ey = top + 2 + (sq ? 1 : 0), lk = o.look || 0;
  const eye = (x, kind) => {
    if (kind === 'closed') R(K, x + lk, ey + 1, 2, 1);
    else if (kind === 'happy') { R(K, x - 1, ey + 1, 1, 1); R(K, x, ey, 2, 1); R(K, x + 2, ey + 1, 1, 1); }
    else if (kind === 'big') R(K, x, ey - 1, 2, 3);
    else if (kind === 'angry') { const l = x < 12; R(K, l ? x : x + 1, ey, 1, 1); R(K, l ? x + 1 : x, ey + 1, 1, 1); R(K, x, ey + 2, 2, 1); }
    else if (kind === 'dizzy') { [[-1,-1],[1,-1],[0,0],[-1,1],[1,1]].forEach(([a, b]) => R(K, x + 1 + a, ey + b + 1, 1, 1)); }
    else R(K, x + lk, ey, 2, 2);
  };
  const e = o.eyes || 'open';
  eye(6, e === 'wink' ? 'closed' : e); eye(16, e === 'wink' ? 'open' : e);
  if (o.cheek) { R(CHEEK, 5, ey + 3, 2, 1); R(CHEEK, 17, ey + 3, 2, 1); }
  if (o.mouth === 'open') R(K, 11, ey + 4, 2, 2);
  else if (o.mouth === 'closed') R(K, 11, ey + 5, 2, 1);
  if (o.cap) {
    R(WHITE, 3, top - 1, 18, 2); R(CAP, 5, top - 3, 14, 2); R(CAP, 8, top - 5, 11, 2); R(CAP, 12, top - 7, 9, 2);
    R(CAP, 19, top - 6, 3, 2); R(WHITE, 22, top - 5, 2, 2);
  }
  if (o.quilt) {
    R(QUILT, -3, top + 6, 30, 16 - top - 6 + (o.dy || 0)); R(WHITE, -3, top + 6, 30, 2);
    [[0, 10], [8, 12], [16, 10], [24, 12]].forEach(([x, y]) => R(QUILT2, x - 2, top + y, 3, 2));
  }
  (o.extra || []).forEach(q => r.push(q));
  return r;
}

// ── 1. 基本の動き ──
const MOVES = [
  { grid: 'grid', name: 'ぴょんぴょん', desc: 'しゃがんでから元気にジャンプ', seq: [[fig(),700],[fig({squash:2}),140],[fig({dy:-3,l:'up',r:'up'}),80],[fig({dy:-7,l:'up',r:'up',lift:[0,1,2,3]}),140],[fig({dy:-8,l:'hi',r:'hi',eyes:'happy',lift:[0,1,2,3]}),160],[fig({dy:-7,l:'up',r:'up'}),100],[fig({dy:-3}),80],[fig({squash:2}),140],[fig(),260],[fig({squash:2}),120],[fig({dy:-4,l:'up',r:'up',lift:[0,1,2,3]}),120],[fig({dy:-5,l:'up',r:'up',eyes:'happy',lift:[0,1,2,3]}),140],[fig({dy:-3}),90],[fig({squash:2}),140],[fig(),600]] },
  { grid: 'grid', name: '手をふる', desc: 'にっこりしてバイバイ', seq: (() => { const s = [[fig(),700],[fig({eyes:'happy',cheek:true,r:'up'}),160]]; for(let i=0;i<6;i++)s.push([fig({eyes:'happy',cheek:true,r:i%2?'up':'hi'}),190]); s.push([fig({eyes:'happy',cheek:true}),400],[fig(),500]); return s;})() },
  { grid: 'grid', name: 'おやすみ', desc: '目をとじてすうすう', seq: (() => { const s = []; for(let i=0;i<8;i++){ const ex = [...zee(22,-2-(i%4)*2,ZZ())]; if(i%4>=2)ex.push(...zee(26,-9-(i%4-2)*2,ZZ())); s.push([fig({eyes:'closed',squash:i%2,extra:ex}),480]); } return s;})() },
  { grid: 'grid', name: 'ハート', desc: 'ハートがぽわん', seq: [[fig(),900],[fig({eyes:'closed'}),120],[fig(),300],[fig({eyes:'happy',cheek:true,extra:heart(10,-5)}),220],[fig({eyes:'happy',cheek:true,dy:-1,extra:heart(10,-7)}),220],[fig({eyes:'happy',cheek:true,extra:heart(10,-9)}),220],[fig({eyes:'happy',cheek:true,dy:-1,extra:heart(10,-11)}),260],[fig({eyes:'happy',cheek:true,extra:[...heart(5,-13),...heart(15,-12)]}),320],[fig({eyes:'happy',cheek:true}),500],[fig(),400]] },
  { grid: 'grid', name: 'きょろきょろ', desc: '左右を見てはてな', seq: [[fig(),600],[fig({look:-1}),450],[fig({look:1}),450],[fig({look:-1}),260],[fig({look:1}),260],[fig(),250],[fig({r:'up',extra:ques(21,-8)}),200],[fig({r:'up',dy:-1,extra:ques(21,-9)}),900],[fig(),500]] },
  { grid: 'grid', name: 'ダンス', desc: '音符に合わせてステップ', seq: (() => { const s = [[fig(),500]]; for(let i=0;i<8;i++){ const a=i%2===0; s.push([fig({dx:a?-1:1,l:a?'hi':'side',r:a?'side':'hi',lift:a?[0,2]:[1,3],eyes:'happy',extra:note(a?24:-4,-6-(i%3))}),260]); } s.push([fig(),500]); return s;})() },
  { grid: 'grid', name: 'やったー', desc: '両手を上げてキラキラ', seq: (() => { const s = [[fig(),600],[fig({squash:1}),120]]; for(let i=0;i<6;i++){ const a=i%2===0; s.push([fig({dy:a?-2:0,l:'hi',r:'hi',eyes:'happy',cheek:true,extra:a?[...spark(-3,-4),...spark(25,-2)]:[...spark(-2,2),...spark(24,-7)]}),220]); } s.push([fig({eyes:'happy'}),400],[fig(),400]); return s;})() }
];

// ── 2. おやすみのパターン ──
const SLEEPS = [
  { grid: 'grid-sleep', name: 'こっくりこっくり', desc: 'うとうとしてハッと起きる', seq: [[fig(),700],[fig({eyes:'closed'}),500],[fig(),250],[fig({eyes:'closed'}),600],[fig({eyes:'closed',squash:1}),500],[fig({eyes:'closed',squash:2}),700],[fig({dy:-1,extra:bang(22,-7)}),500],[fig({look:-1}),300],[fig({look:1}),300],[fig(),400],[fig({eyes:'closed'}),500],[fig({eyes:'closed',squash:1}),500],[fig({eyes:'closed',squash:2,extra:zee(22,-3,ZZ())}),900]] },
  { grid: 'grid-sleep', name: 'おふとん', desc: 'まくらとおふとんでぐっすり', seq: (() => { const s=[]; for(let i=0;i<8;i++){ const ex=zee(22,-3-(i%4)*2,ZZ()); if(i%4>=2)ex.push(...zee(26,-10-(i%4-2)*2,ZZ())); s.push([fig({eyes:'closed',pillow:true,quilt:true,squash:i%2,extra:ex}),520]); } return s;})() },
  { grid: 'grid-sleep', name: 'はなちょうちん', desc: 'ふくらんでパチン！', seq: (() => { const s=[]; for(let k=0;k<2;k++){s.push([fig({eyes:'closed',extra:bubble(13,7,1)}),450],[fig({eyes:'closed',squash:1,extra:bubble(13,8,1)}),450],[fig({eyes:'closed',extra:bubble(13,6,2)}),450],[fig({eyes:'closed',squash:1,extra:bubble(13,7,1)}),450]);} s.push([fig({eyes:'closed',extra:bubble(13,6,2)}),450],[fig({eyes:'closed',extra:bubble(12,5,3)}),700],[fig({dy:-2,l:'up',r:'up',extra:[...bang(22,-9),[AQUA,10,3,1,1],[AQUA,19,4,1,1],[AQUA,15,1,1,1]]}),450],[fig({look:-1}),300],[fig({look:1}),300],[fig({eyes:'closed'}),600]); return s;})() },
  { grid: 'grid-sleep', name: 'ナイトキャップ', desc: 'お月さまと星', seq: (() => { const s=[]; for(let i=0;i<8;i++){ const ex=[...moon(-6,-13),...(i%2?spark(26,-12):spark(-2,-4)),...(i%4<2?spark(24,2):[])]; s.push([fig({eyes:'closed',cap:true,squash:i%2,extra:ex}),560]); } return s;})() }
];

// ── 3. ★新しく追加した20個の動き（12〜31） ──
const NEW_MOVES = [
  { name: 'なわとび（ひっかかり）', desc: '跳んだ後、足にひっかかって目を回す', seq: [[fig({l:'up', r:'up'}), 300], [fig({dy:-3, l:'up', r:'up', lift:[0,1,2,3], extra:[[STICK,-2,13,28,1],[STICK,-2,1,1,12],[STICK,25,1,1,12]]}), 300], [fig({l:'up', r:'up', extra:[[STICK,-2,-6,28,1],[STICK,-2,-5,1,9],[STICK,25,-5,1,9]]}), 300], [fig({dy:-3, l:'up', r:'up', lift:[0,1,2,3], extra:[[STICK,-2,13,28,1],[STICK,-2,1,1,12],[STICK,25,1,1,12]]}), 300], [fig({l:'up', r:'up', squash:2, extra:[[STICK,4,13,16,1],[STICK,-2,1,1,12],[STICK,25,1,1,12]]}), 200], [fig({l:'up', r:'up', squash:1, eyes:'dizzy', extra:[...spark(4,-4), ...spark(18,-5)]}), 800]]},
  { name: '風船ガム', desc: 'ピンクのガムを膨らませてパチン！', seq: [[fig(), 400], [fig({extra:[[PINK, 10, 6, 4, 4]]}), 300], [fig({extra:[[PINK, 9, 5, 6, 6]]}), 300], [fig({extra:[[PINK, 7, 3, 10, 10]]}), 300], [fig({eyes:'big', extra:[[PINK, 8,2,2,2],[PINK, 14,4,2,2],[PINK, 10,8,2,2], ...spark(12,2)]}), 500], [fig({eyes:'wink', mouth:'open', extra:[[PINK, 8,2,2,2],[PINK, 14,4,2,2],[PINK, 10,8,2,2]]}), 800]]},
  { name: 'ペンキぬり', desc: 'ハケで空間にカラフルな色を塗る', seq: [[fig({r:'hi', extra:[[STICK,20,-2,2,6],['#7cc3ea',19,-4,4,3]]}), 400], [fig({r:'up', dx:-2, extra:[[STICK,20,4,2,6],['#7cc3ea',19,2,4,3], ['#7cc3ea',24,-2,4,2]]}), 300], [fig({l:'hi', r:'side', dx:-4, extra:[[STICK,2,-2,2,6],['#7cc3ea',1,-4,4,3], ['#7cc3ea',24,-2,4,2], ['#7cc3ea',18,2,4,2]]}), 300], [fig({eyes:'happy', cheek:true, extra:[['#7cc3ea',24,-2,4,2], ['#7cc3ea',18,2,4,2], ['#7cc3ea',4,-4,4,2]]}), 800]]},
  { name: 'フラフープ', desc: '腰で一生懸命回して汗をかく', seq: [[fig({extra: [['#e0475b', -2, 8, 28, 2]]}), 200], [fig({dx:1, squash:1, extra: [['#e0475b', -2, 9, 28, 2]]}), 200], [fig({extra: [['#e0475b', -2, 8, 28, 2], ...sweat(21,0)]}), 200], [fig({dx:-1, squash:1, extra: [['#e0475b', -2, 9, 28, 2]]}), 200], [fig({extra: [['#e0475b', -2, 8, 28, 2], ...sweat(21,1)]}), 200], [fig({eyes:'happy', cheek:true, extra: [['#e0475b', -2, 8, 28, 2]]}), 600]]},
  { name: 'スマホで自撮り', desc: 'スマホを片手にウインク＆ピース', seq: [[fig(), 400], [fig({r:'hi', extra: [[ '#2c3e70', 21, 2, 4, 7 ], [ WHITE, 22, 3, 2, 5 ]]}), 300], [fig({r:'hi', eyes:'wink', cheek:true, extra: [[ '#2c3e70', 21, 2, 4, 7 ], [ WHITE, 22, 3, 2, 5 ], ...spark(20, -2)]}), 200], [fig({r:'hi', eyes:'wink', cheek:true, extra: [[ '#2c3e70', 21, 2, 4, 7 ], [ WHITE, 22, 3, 2, 5 ]]}), 600]]},
  { name: '虫とり', desc: 'あみでそーっと近づき、えいっ！', seq: [[fig({r:'up', extra: [[STICK, 22, -2, 1, 14], [WHITE, 19, -8, 7, 6], [PINK, 28, -6, 2, 2]]}), 400], [fig({r:'up', dx:1, squash:1, extra: [[STICK, 22, -2, 1, 14], [WHITE, 19, -8, 7, 6], [PINK, 27, -6, 2, 2]]}), 400], [fig({r:'hi', dx:2, eyes:'big', extra: [[STICK, 24, 2, 1, 14], [WHITE, 21, 8, 7, 6], [PINK, 24, 4, 2, 2]]}), 200], [fig({r:'up', eyes:'happy', cheek:true, extra: [[STICK, 22, -2, 1, 14], [WHITE, 19, -8, 7, 6], [PINK, 22, -6, 2, 2]]}), 800]]},
  { name: '大玉ころがし', desc: '大きな赤い玉を一生懸命押す', seq: [[fig({r:'side', extra: [[RED, 20, 0, 16, 16], [WHITE, 24, 4, 4, 4]]}), 300], [fig({dx:2, squash:1, r:'side', extra: [[RED, 22, 0, 16, 16], [WHITE, 30, 8, 4, 4]]}), 300], [fig({dx:4, r:'side', extra: [[RED, 24, 0, 16, 16], [WHITE, 28, 4, 4, 4]]}), 300], [fig({dx:6, squash:1, eyes:'happy', r:'side', extra: [[RED, 26, 0, 16, 16], [WHITE, 34, 8, 4, 4]]}), 800]]},
  { name: 'トランポリン', desc: '高く跳ねて画面外へ、ドスンと戻る', seq: [[fig({extra: [['#3a322d', 0, 14, 24, 2], ['#4a6fb5', 2, 13, 20, 1]]}), 300], [fig({dy:-4, lift:[0,1,2,3], extra: [['#3a322d', 0, 14, 24, 2], ['#4a6fb5', 2, 13, 20, 1]]}), 300], [fig({dy:-10, lift:[0,1,2,3], r:'hi', l:'hi', extra: [['#3a322d', 0, 14, 24, 2], ['#4a6fb5', 2, 13, 20, 1]]}), 300], [fig({dy:-25, lift:[0,1,2,3], eyes:'happy', r:'hi', l:'hi', extra: [['#3a322d', 0, 14, 24, 2], ['#4a6fb5', 2, 13, 20, 1]]}), 400], [fig({squash:2, eyes:'dizzy', extra: [['#3a322d', 0, 14, 24, 2], ['#4a6fb5', 2, 13, 20, 1]]}), 600]]},
  { name: '本を読んでうとうと', desc: '読書中にZマークが出てハッと起きる', seq: [[fig({l:'up', r:'up', look:0, extra:[['#4a6fb5',7,8,10,5],[WHITE,8,8,4,4],[WHITE,12,8,4,4]]}), 800], [fig({l:'up', r:'up', eyes:'closed', squash:2, extra:[['#4a6fb5',7,8,10,5],[WHITE,8,8,4,4],[WHITE,12,8,4,4], ...zee(22,-3,ZZ())]}), 800], [fig({l:'hi', r:'hi', eyes:'big', dy:-2, extra:[['#4a6fb5',7,8,10,5],[WHITE,8,8,4,4],[WHITE,12,8,4,4], ...bang(23,-10)]}), 300], [fig({l:'up', r:'up', look:1, extra:[['#4a6fb5',7,8,10,5],[WHITE,8,8,4,4],[WHITE,12,8,4,4], ...sweat(21,0)]}), 400], [fig({l:'up', r:'up', look:0, extra:[['#4a6fb5',7,8,10,5],[WHITE,8,8,4,4],[WHITE,12,8,4,4]]}), 800]]},
  { name: 'シルクハットからハト', desc: '帽子を杖で叩くと白い鳥が飛び出す', seq: [[fig({l:'up', extra:[['#1a1612',18,8,10,8],[RED,18,14,10,2]]}), 400], [fig({l:'up', r:'hi', extra:[['#1a1612',18,8,10,8],[RED,18,14,10,2], [STICK,2,-2,1,10]]}), 300], [fig({l:'up', r:'hi', eyes:'big', extra:[['#1a1612',18,8,10,8],[RED,18,14,10,2], [STICK,20,4,1,10], ...spark(20,2)]}), 200], [fig({l:'up', r:'hi', eyes:'happy', cheek:true, extra:[['#1a1612',18,8,10,8],[RED,18,14,10,2], [WHITE,20,0,6,6],['#f2c14e',18,2,2,2],[K,22,2,1,1], ...spark(20,-2)]}), 800]]},
  { name: 'スケートボード', desc: 'スケボーで滑ってポンッとジャンプ', seq: [[fig({dx:-4, extra:[[IRON,-4,14,20,2],[K,-2,16,4,2],[K,10,16,4,2]]}), 200], [fig({dx:0, extra:[[IRON,0,14,20,2],[K,2,16,4,2],[K,14,16,4,2]]}), 200], [fig({dx:4, squash:1, extra:[[IRON,4,14,20,2],[K,6,16,4,2],[K,18,16,4,2]]}), 200], [fig({dx:8, dy:-6, lift:[0,1,2,3], l:'hi', r:'hi', eyes:'happy', extra:[[IRON,8,8,20,2],[K,10,10,4,2],[K,22,10,4,2]]}), 400], [fig({dx:14, eyes:'happy', cheek:true, extra:[[IRON,14,14,20,2],[K,16,16,4,2],[K,28,16,4,2]]}), 600]]},
  { name: 'ヨーヨー', desc: '犬のお散歩をして手に戻す', seq: [[fig({r:'up', extra:[[STICK,21,6,1,6],[RED,19,12,5,5],[WHITE,21,14,1,1]]}), 300], [fig({r:'up', dx:1, extra:[[STICK,21,6,1,6],[RED,19,12,5,5],[WHITE,21,14,1,1]]}), 300], [fig({r:'up', dx:2, extra:[[STICK,21,6,1,6],[RED,19,12,5,5],[WHITE,21,14,1,1]]}), 300], [fig({r:'up', dx:2, extra:[[STICK,21,6,1,0],[RED,19,6,5,5],[WHITE,21,8,1,1]]}), 200], [fig({r:'hi', dx:2, eyes:'happy', extra:[[RED,20,-2,5,5],[WHITE,22,0,1,1], ...spark(22,-4)]}), 600]]},
  { name: 'タピオカドリンク', desc: '巨大タピオカをポンッと吸い込む', seq: [[fig({extra:[['#e8c9a0',10,6,6,8],[K,11,12,2,2],[K,14,12,2,2],['#7cc3ea',12,2,2,6]]}), 400], [fig({mouth:'open', r:'up', l:'up', extra:[['#e8c9a0',10,6,6,8],[K,14,12,2,2],['#7cc3ea',12,2,2,6],[K,12,4,2,2]]}), 200], [fig({squash:1, mouth:'closed', extra:[['#e8c9a0',10,6,6,8],['#7cc3ea',12,2,2,6],[O,2,8,2,3],[O,20,8,2,3]]}), 300], [fig({eyes:'happy', cheek:true, mouth:'closed', extra:[['#e8c9a0',10,6,6,8],['#7cc3ea',12,2,2,6]]}), 800]]},
  { name: '虫眼鏡でたんけん', desc: '虫眼鏡で巨大な目になって探検', seq: [[fig({r:'up'}), 300], [fig({r:'hi', extra:[[IRON,16,4,2,8],[WHITE,8,0,8,8],[K,10,2,4,4]]}), 400], [fig({r:'hi', dx:1, extra:[[IRON,16,4,2,8],[WHITE,8,0,8,8],[K,10,2,4,4]]}), 400], [fig({r:'hi', dx:-1, extra:[[IRON,16,4,2,8],[WHITE,8,0,8,8],[K,10,2,4,4]]}), 400], [fig({r:'up', eyes:'happy', cheek:true, extra:[[IRON,22,6,2,8],[WHITE,14,2,8,8],[K,16,4,4,4]]}), 600]]},
  { name: '扇風機で「あー」', desc: '風を受けながら口をプルプル震わせる', seq: [[fig({extra:[[IRON,-8,6,4,8],['#7cc3ea',-10,2,8,8]]}), 300], [fig({mouth:'open', extra:[[IRON,-8,6,4,8],['#7cc3ea',-10,2,8,8],[WATER,-2,4,2,1],[WATER,-2,8,2,1]]}), 150], [fig({mouth:'closed', extra:[[IRON,-8,6,4,8],['#7cc3ea',-10,2,8,8]]}), 150], [fig({mouth:'open', extra:[[IRON,-8,6,4,8],['#7cc3ea',-10,2,8,8],[WATER,-2,4,2,1],[WATER,-2,8,2,1]]}), 150], [fig({eyes:'happy', extra:[[IRON,-8,6,4,8],['#7cc3ea',-10,2,8,8]]}), 600]]},
  { name: 'わたあめづくり', desc: '割り箸をくるくる回して大きくする', seq: [[fig({l:'up', extra:[[STICK,18,6,8,1]]}), 300], [fig({l:'up', extra:[[STICK,18,6,8,1],[PINK,14,4,4,4]]}), 300], [fig({l:'up', squash:1, extra:[[STICK,18,6,8,1],[PINK,12,2,8,8]]}), 300], [fig({l:'hi', eyes:'happy', cheek:true, extra:[[STICK,22,2,1,8],[PINK,16,-6,14,14]]}), 800]]},
  { name: 'もちつき', desc: '杵を振りかぶってペッタン！', seq: [[fig({dx:4, r:'hi', extra:[['#e8c9a0',4,10,10,6],[WHITE,5,9,8,2],[STICK,18,-4,2,10],[WOOD,14,-6,6,4]]}), 400], [fig({dx:4, r:'hi', extra:[['#e8c9a0',4,10,10,6],[WHITE,5,9,8,2],[STICK,18,-8,2,10],[WOOD,14,-10,6,4]]}), 300], [fig({dx:4, r:'up', squash:1, extra:[['#e8c9a0',4,10,10,6],[WHITE,5,9,8,2],[STICK,18,4,2,10],[WOOD,14,2,6,4],[WHITE,3,7,2,2],[WHITE,13,7,2,2]]}), 300], [fig({dx:4, r:'hi', eyes:'happy', cheek:true, extra:[['#e8c9a0',4,10,10,6],[WHITE,5,9,8,2],[STICK,18,-6,2,10],[WOOD,14,-8,6,4]]}), 800]]},
  { name: 'シャボン玉ツンツン', desc: 'シャボン玉を指で突いてパチン', seq: [[fig({extra: bubble(22, 0, 2)}), 400], [fig({r:'up', extra: bubble(20, 2, 2)}), 300], [fig({r:'hi', extra: bubble(18, 4, 2)}), 200], [fig({r:'hi', eyes:'big', extra: spark(18, 4)}), 300], [fig({r:'up', eyes:'happy', cheek:true}), 600]]},
  { name: 'ポップコーン', desc: '鍋からポンポンッ！と弾け飛ぶ', seq: [[fig({l:'up', r:'up', extra:[[IRON,8,8,8,6],[STICK,16,10,6,2]]}), 300], [fig({l:'up', r:'up', dx:1, extra:[[IRON,8,8,8,6],[STICK,16,10,6,2]]}), 150], [fig({l:'up', r:'up', dx:-1, extra:[[IRON,8,8,8,6],[STICK,16,10,6,2]]}), 150], [fig({l:'up', r:'up', eyes:'big', extra:[[IRON,8,8,8,6],[STICK,16,10,6,2],[GOLD,10,0,2,2],[GOLD,14,-4,2,2],[GOLD,6,-2,2,2]]}), 400], [fig({l:'up', r:'up', eyes:'happy', cheek:true, extra:[[IRON,8,8,8,6],[STICK,16,10,6,2],[GOLD,8,14,2,2],[GOLD,16,14,2,2]]}), 800]]},
  { name: 'たからさがし', desc: '探知機で宝箱を発見して大喜び', seq: [[fig({extra:[[IRON,20,6,2,8],[RED,18,14,6,2]]}), 300], [fig({dx:2, extra:[[IRON,20,6,2,8],[RED,18,14,6,2]]}), 300], [fig({dx:6, eyes:'big', extra:[[IRON,20,6,2,8],[RED,18,14,6,2], [WOOD,6,12,8,4],[GOLD,9,13,2,2], ...bang(16,-6)]}), 400], [fig({dx:6, l:'hi', r:'hi', eyes:'happy', cheek:true, extra:[[WOOD,6,12,8,4],[GOLD,9,13,2,2], [GEM,8,8,2,2],[GOLD,12,10,2,2], ...spark(6,6)]}), 800]]}
].map(m => { m.grid = 'grid-new'; return m; });

// ── 4. ごはんの絵 ──
const RICE = '#fbf8f2', NORI = '#2f3b2f', BOWL = '#c94b3c', NOODLE = '#f2d36b', STEAM_C = '#c9c2bc', SPONGE = '#f3d9a4', BERRY = '#e0475b', LEAF = '#5aa35a', TEA = '#6b9a5b', TEA_IN = '#b7d48a';
function onigiri(x, y, bite) {
  if (bite >= 3) return [[RICE, x+2, y+3, 2, 1], [NORI, x+2, y+4, 2, 1]];
  if (bite === 2) return [[RICE, x+3, y+2, 3, 1], [RICE, x+5, y+3, 1, 1], [NORI, x+3, y+3, 2, 2]];
  if (bite === 1) return [[RICE, x+3, y+1, 2, 1], [RICE, x+1, y+2, 5, 2], [NORI, x+1, y+3, 4, 2]];
  return [[RICE, x+2, y, 2, 1], [RICE, x+1, y+1, 4, 1], [RICE, x, y+2, 6, 2], [NORI, x+1, y+3, 4, 2]];
}
function ramen(x, y, left) {
  const r = [[BOWL, x, y+1, 14, 2], [BOWL, x+1, y+3, 12, 1], [BOWL, x+3, y+4, 8, 1], [RICE, x, y+2, 14, 1]];
  if (left > 0) r.push([NOODLE, x+1, y, 12, 1]);
  if (left > 1) r.push([NOODLE, x+3, y-1, 3, 1], [NOODLE, x+8, y-1, 3, 1]); return r;
}
const steam = (x, y, k) => [[STEAM_C, x+(k%2), y, 1, 2], [STEAM_C, x+1-(k%2), y-2, 1, 2], [STEAM_C, x+4-(k%2), y-1, 1, 2], [STEAM_C, x+3+(k%2), y-3, 1, 2]];
function cake(x, y, left) {
  const r = [[RICE, x-1, y+5, 10, 1]], w = [0, 3, 5, 8][left];
  if (w) r.push([RICE, x, y+1, w, 1], [SPONGE, x, y+2, w, 3], [RICE, x, y+3, w, 1]); return r;
}
const berry = (x, y) => [[BERRY, x, y, 2, 2], [LEAF, x, y-1, 2, 1]];
const cup = (x, y) => [[TEA, x, y, 4, 5], [TEA_IN, x, y, 4, 1], [RICE, x+1, y+2, 2, 1]];
const FOODS = [
  { grid: 'grid-food', name: 'おにぎり', desc: 'パクッもぐもぐ', seq: (() => { const s=[[fig({mouth:'closed',extra:onigiri(15,8,0)}),700]]; for(let b=0;b<3;b++){ s.push([fig({r:'up',mouth:'open',extra:onigiri(12,5,b)}),260],[fig({r:'up',mouth:'closed',extra:onigiri(12,5,b+1)}),160]); for(let c=0;c<3;c++) s.push([fig({eyes:'happy',mouth:c%2?'open':'closed',squash:c%2,extra:onigiri(15,8,b+1)}),200]); } s.push([fig({eyes:'happy',cheek:true,mouth:'closed',extra:heart(18,-5)}),800],[fig({eyes:'happy',cheek:true}),400]); return s;})() },
  { grid: 'grid-food', name: 'ラーメン', desc: 'ゆげの立つラーメン', seq: (() => { const s=[]; for(let k=0;k<3;k++) s.push([fig({extra:[...ramen(5,11,2),...steam(10,7-k,k)]}),300]); for(let n=0;n<2;n++){ s.push([fig({r:'up',mouth:'open',extra:[...ramen(5,11,2-n),[NOODLE,12,7,1,4],[STICK,21,0,1,7],[STICK,23,1,1,7]]}),300],[fig({eyes:'closed',r:'up',mouth:'open',extra:[...ramen(5,11,2-n),[NOODLE,12,8,1,3]]}),180],[fig({eyes:'closed',mouth:'closed',extra:[...ramen(5,11,1-n)]}),200]); for(let c=0;c<2;c++) s.push([fig({eyes:'happy',mouth:c?'open':'closed',squash:c,extra:[...ramen(5,11,1-n),...steam(10,6,c)]}),220]); } s.push([fig({eyes:'happy',cheek:true,l:'up',r:'up',extra:ramen(5,11,0)}),900]); return s;})() },
  { grid: 'grid-food', name: 'ショートケーキ', desc: 'いちごは最後にパクッ', seq: (() => { const s=[[fig({extra:[...cake(8,9,3),...berry(11,9)]}),600],[fig({eyes:'happy',extra:[...cake(8,9,3),...berry(11,9),...spark(-2,-2),...spark(24,-4)]}),600]]; for(let left=3;left>0;left--){ s.push([fig({r:'up',mouth:'open',extra:[...cake(8,9,left),...berry(11,9)]}),240],[fig({eyes:'happy',mouth:'closed',extra:[...cake(8,9,left-1),...berry(11,9)]}),200],[fig({eyes:'happy',mouth:'open',squash:1,extra:[...cake(8,9,left-1),...berry(11,9)]}),200]); } s.push([fig({r:'up',mouth:'open',extra:[...cake(8,9,0),...berry(11,6)]}),300],[fig({eyes:'happy',cheek:true,mouth:'closed',extra:cake(8,9,0)}),300],[fig({eyes:'happy',cheek:true,extra:[...cake(8,9,0),...heart(9,-6)]}),900]); return s;})() },
  { grid: 'grid-food', name: 'お茶', desc: 'あったかいお茶でほっとひと息', seq: (() => { const s=[]; for(let k=0;k<2;k++) s.push([fig({extra:[...cup(14,8),...steam(14,5-k,k)]}),400]); s.push([fig({r:'up',eyes:'closed',extra:[...cup(11,5),...steam(11,2,0)]}),500],[fig({r:'up',eyes:'closed',squash:1,extra:[...cup(11,6),...steam(11,3,1)]}),600],[fig({eyes:'happy',cheek:true,mouth:'closed',extra:cup(14,8)}),400],[fig({eyes:'happy',cheek:true,mouth:'open',extra:[...cup(14,8),[STEAM_C,13,4,2,1],[STEAM_C,15,3,2,1]]}),500],[fig({eyes:'happy',cheek:true,mouth:'closed',extra:cup(14,8)}),900]); return s;})() }
];

// ごはん追加分は省略せず統合
const DOUGH='#d9a066',ICING='#f29bb6',HOLE='#a8743f',SPRINK='#7cc3ea',CONE='#e0b26a',CONE_D='#b9874a',MELON='#e2474f',RIND='#4f9a4a',RIND_IN='#eef3dc',TAKO='#c98a4a',SAUCE='#6b3a1f',TRAY='#d8c19a',BUN='#e2a55a',LETTUCE='#7cc36a',PATTY='#7a4a2a',CHEESE='#f5c542',APPLE='#d8433f',PIZZA='#f5d26b',PEPPER='#c0392b',YAKI='#9a5b2e',PUDDING='#f6dc8a',CARAMEL='#9c5a1e',SPOON='#c9ccd3',BANANA='#f4d35e',BANANA_IN='#fbefc4';
function trim(rects, side, edge) { return rects.flatMap(([c, x, y, w, h]) => { if (side === 'left') { if (x + w <= edge) return []; const nx = Math.max(x, edge); return [[c, nx, y, w - (nx - x), h]]; } if (y + h <= edge) return []; const ny = Math.max(y, edge); return [[c, x, ny, w, h - (ny - y)]]; }); }
const donut=(x,y)=>[[DOUGH,x+1,y,4,1],[DOUGH,x,y+1,6,4],[DOUGH,x+1,y+5,4,1],[ICING,x+1,y,4,1],[ICING,x,y+1,6,2],[HOLE,x+2,y+2,2,2],[SPRINK,x+1,y+1,1,1],[RICE,x+4,y,1,1],[SPRINK,x+4,y+2,1,1]];
const softcream=(x,y)=>[[RICE,x+2,y,1,1],[RICE,x+1,y+1,3,1],[RICE,x,y+2,5,2],[STEAM_C,x+1,y+3,3,1],[CONE,x,y+4,5,1],[CONE,x+1,y+5,3,2],[CONE,x+2,y+7,1,1],[CONE_D,x+1,y+4,1,1],[CONE_D,x+3,y+4,1,1]];
const melon=(x,y)=>[[MELON,x+3,y,2,1],[MELON,x+1,y+1,6,1],[MELON,x,y+2,8,1],[RIND_IN,x,y+3,8,1],[RIND,x,y+4,8,1],[NORI,x+4,y+1,1,1],[NORI,x+2,y+2,1,1],[NORI,x+5,y+2,1,1]];
const burger=(x,y)=>[[BUN,x+1,y,5,1],[BUN,x,y+1,7,1],[RICE,x+2,y,1,1],[RICE,x+4,y,1,1],[LETTUCE,x,y+2,7,1],[CHEESE,x,y+3,7,1],[PATTY,x,y+4,7,1],[BUN,x,y+5,7,1],[BUN,x+1,y+6,5,1]];
const apple=(x,y)=>[[APPLE,x+1,y+1,4,1],[APPLE,x,y+2,6,3],[APPLE,x+1,y+5,4,1],[STICK,x+3,y,1,1],[LEAF,x+4,y-1,2,1],[RICE,x+1,y+2,1,1]];
const pizza=(x,y)=>[[PIZZA,x+4,y,2,1],[PIZZA,x+2,y+1,4,1],[PIZZA,x,y+2,6,2],[PIZZA,x+2,y+4,4,1],[PIZZA,x+4,y+5,2,1],[DOUGH,x+6,y,1,6],[PEPPER,x+3,y+2,1,1],[PEPPER,x+4,y+4,1,1],[PEPPER,x+5,y+1,1,1]];
const banana=(x,y)=>[[BANANA_IN,x+1,y,2,5],[BANANA,x,y+5,4,3],[BANANA,x-1,y+4,1,2],[BANANA,x+4,y+4,1,2],[CONE_D,x+1,y+8,2,1]];
const pudding=(x,y,s)=>{ const r=[[RICE,x-1,y+6,8,1]], top=y+[0,2,4,6][s]; return r.concat(trim([[CARAMEL,x+1,y,4,2],[PUDDING,x,y+2,6,4]],'top',top)); };
const takoyaki=(x,y,s)=>{ const r=[[TRAY,x,y+3,10,1],[TRAY,x+1,y+4,8,1]]; for(let i=s;i<3;i++)r.push([TAKO,x+i*3+1,y,3,3],[SAUCE,x+i*3+1,y,3,1],[RICE,x+i*3+2,y,1,1],[LEAF,x+i*3+3,y+1,1,1]); return r; };
const yakitori=(x,y,s)=>{ const r=[[TRAY,x,y+1,11,1]]; for(let i=s;i<3;i++)r.push([YAKI,x+i*3+1,y,2,3],[SAUCE,x+i*3+1,y,2,1]); return r; };

function eatHeld(sprite, W, H, side, end, extraEnd = []) {
  const at = (x, y, b) => b <= 0 ? sprite(x, y) : trim(sprite(x, y), side, side === 'left' ? x + Math.round(W * b / 3) : y + Math.round(H * b / 3));
  const rx = 16, ry = 9 - Math.max(0, H - 6), mx = 13, my = 7 - Math.round(H / 2);
  const s = [[fig({ mouth: 'closed', extra: at(rx, ry, 0) }), 650]];
  for (let b = 0; b < 3; b++) {
    s.push([fig({ r: 'up', mouth: 'open', extra: at(mx, my, b) }), 260]);
    s.push([fig({ r: 'up', mouth: 'closed', extra: at(mx, my, b + 1) }), 160]);
    for (let c = 0; c < 3; c++) s.push([fig({ eyes: 'happy', mouth: c % 2 ? 'open' : 'closed', squash: c % 2, extra: at(rx, ry, b + 1) }), 190]);
  }
  s.push([fig({ eyes: 'happy', cheek: true, mouth: 'closed', extra: [...end, ...extraEnd] }), 900], [fig({ eyes: 'happy', cheek: true }), 400]); return s;
}
function eatPlate(plate, morsel, end) {
  const s = [[fig({ extra: plate(0) }), 650], [fig({ eyes: 'happy', extra: [...plate(0), ...spark(-2, -2), ...spark(24, -3)] }), 450]];
  for (let b = 0; b < 3; b++) {
    s.push([fig({ r: 'up', mouth: 'open', extra: [...plate(b + 1), ...morsel] }), 280]);
    s.push([fig({ r: 'up', mouth: 'closed', extra: plate(b + 1) }), 160]);
    for (let c = 0; c < 3; c++) s.push([fig({ eyes: 'happy', mouth: c % 2 ? 'open' : 'closed', squash: c % 2, extra: plate(b + 1) }), 190]);
  }
  s.push([fig({ eyes: 'happy', cheek: true, mouth: 'closed', extra: [...plate(3), ...end] }), 900], [fig({ eyes: 'happy', cheek: true }), 400]); return s;
}
const FOODS2 = [
  { name: 'ドーナツ', desc: 'ピンクのドーナツをひと口ずつ', seq: eatHeld(donut, 6, 6, 'left', heart(9, -6)) },
  { name: 'ソフトクリーム', desc: '最後はコーンまで', seq: eatHeld(softcream, 5, 8, 'top', [...spark(-2, -3), ...spark(24, -5)]) },
  { name: 'すいか', desc: 'たねをぷっ', seq: (() => { const s=eatHeld(melon,8,5,'left',[],[]); s.splice(s.length-2,0,[fig({mouth:'open',extra:[[NORI,9,7,1,1]]}),160],[fig({mouth:'closed',extra:[[NORI,4,6,1,1]]}),160],[fig({eyes:'wink',extra:[[NORI,-3,5,1,1]]}),260]); return s; })() },
  { name: 'たこやき', desc: 'ハフハフ', seq: eatPlate(s => takoyaki(5, 11, s), [[TAKO, 12, 5, 3, 3], [SAUCE, 12, 5, 3, 1], ...steam(12, 2, 0)], [...steam(6, 7, 1)]) },
  { name: 'ハンバーガー', desc: 'がぶっ', seq: eatHeld(burger, 7, 7, 'left', heart(9, -6)) },
  { name: 'りんご', desc: 'しゃりしゃり', seq: eatHeld(apple, 6, 6, 'left', [[STICK, 18, 9, 1, 3], ...spark(24, -4)]) },
  { name: 'ピザ', desc: 'チーズをのばして', seq: (() => { const s=eatHeld(pizza,7,6,'left',heart(9,-6)); s.forEach(q=>{if(q[1]===160)q[0].push([PIZZA,13,7,3,1]);}); return s; })() },
  { name: 'やきとり', desc: 'くしから引っこぬく', seq: eatPlate(s => yakitori(6, 12, s), [[YAKI, 12, 6, 2, 3], [SAUCE, 12, 6, 2, 1], [TRAY, 14, 7, 6, 1]], heart(9, -6)) },
  { name: 'プリン', desc: 'ぷるぷる', seq: eatPlate(s => pudding(9, 9, s), [[SPOON, 13, 7, 6, 1], [PUDDING, 12, 6, 2, 2]], [...heart(9, -6), ...spark(-2, -2)]) },
  { name: 'バナナ', desc: 'かわをむいて', seq: eatHeld(banana, 4, 9, 'top', [[BANANA, 16, 13, 4, 2], [BANANA, 15, 12, 1, 2], [BANANA, 20, 12, 1, 2]]) },
].map(m => { m.grid = 'grid-food'; return m; });

const TUNA='#d84a4a',TUNA_L='#f08a8a',SAUSAGE='#b5452f',MUSTARD='#f5c542',CHOCO='#5a3a22',BATTER='#e0a04a',SHRIMP='#e0475b',CURRY='#b8742c',CARROT='#f08a3c',GYOZA='#f3dcae',DANGO_P='#f4a6c0',DANGO_G='#9ccc65',MELONPAN='#f2d36b',MELON_L='#d9b04a',FRYBOX='#d84a4a';
const sushi=(x,y)=>[[RICE,x,y+2,7,2],[STEAM_C,x+1,y+3,5,1],[TUNA,x,y,7,2],[TUNA_L,x+2,y,1,1],[TUNA_L,x+5,y+1,1,1]];
const hotdog=(x,y)=>[[BUN,x+1,y+2,7,2],[SAUSAGE,x,y+1,9,1],[MUSTARD,x+1,y,1,1],[MUSTARD,x+3,y,1,1],[MUSTARD,x+5,y,1,1],[MUSTARD,x+7,y,1,1]];
const cookie=(x,y)=>[[DOUGH,x+1,y,4,1],[DOUGH,x,y+1,6,4],[DOUGH,x+1,y+5,4,1],[CHOCO,x+1,y+1,1,1],[CHOCO,x+4,y+2,1,1],[CHOCO,x+2,y+3,1,1],[CHOCO,x+4,y+4,1,1]];
const ebifry=(x,y)=>[[BATTER,x+1,y,6,1],[BATTER,x,y+1,7,1],[BATTER,x+1,y+2,6,1],[CONE_D,x+2,y,1,1],[CONE_D,x+5,y+1,1,1],[SHRIMP,x+7,y,2,1],[SHRIMP,x+7,y+2,2,1],[SHRIMP,x+8,y+1,1,1]];
const dango=(x,y)=>[[DANGO_P,x,y,3,3],[RICE,x,y+3,3,3],[DANGO_G,x,y+6,3,3],[STICK,x+1,y+9,1,3]];
const taiyaki=(x,y)=>[[DOUGH,x+1,y,5,5],[DOUGH,x,y+1,1,3],[DOUGH,x+6,y+1,1,3],[DOUGH,x+7,y,1,5],[NORI,x+1,y+1,1,1],[HOLE,x+3,y+2,1,1],[HOLE,x+5,y+1,1,1],[HOLE,x+5,y+3,1,1]];
const melonpan=(x,y)=>[[MELONPAN,x+2,y,3,1],[MELONPAN,x+1,y+1,5,1],[MELONPAN,x,y+2,7,3],[MELON_L,x+2,y+2,1,3],[MELON_L,x+4,y+2,1,3],[MELON_L,x,y+3,7,1]];
const curry=(x,y,s)=>[[RICE,x-1,y+4,14,1], ...trim([[RICE,x,y+1,6,3],[CURRY,x+6,y+1,6,3],[CARROT,x+7,y+1,1,1],[MUSTARD,x+10,y+2,1,1]], 'left', x + s * 4)];
const gyoza=(x,y,s)=>{ const r=[[RICE,x-1,y+3,13,1]]; for(let i=s;i<3;i++)r.push([GYOZA,x+i*4,y+1,3,2],[GYOZA,x+i*4+1,y,1,1],[DOUGH,x+i*4,y+2,3,1]); return r; };
const fries=(x,y,s)=>{ const r=[[FRYBOX,x,y+3,6,4],[MUSTARD,x+2,y+4,2,1]]; [[1,0],[2,1],[3,0],[4,1],[2,-1],[4,-1]].slice(0,6-s*2).forEach(([dx,dy])=>r.push([MUSTARD,x+dx,y+dy,1,3])); return r; };
const FOODS3 = [
  { name: 'おすし', desc: 'まぐろのにぎり', seq: eatHeld(sushi, 7, 4, 'left', heart(9, -6)) },
  { name: 'ホットドッグ', desc: 'マスタードたっぷり', seq: eatHeld(hotdog, 9, 4, 'left', [...spark(-2, -3), ...spark(24, -5)]) },
  { name: 'クッキー', desc: 'さくさく', seq: eatHeld(cookie, 6, 6, 'left', [[DOUGH, 8, 13, 1, 1], [DOUGH, 15, 14, 1, 1], ...heart(9, -6)]) },
  { name: 'えびフライ', desc: 'しっぽだけ残る', seq: eatHeld(ebifry, 7, 3, 'left', [[SHRIMP, 22, 10, 2, 1], [SHRIMP, 22, 12, 2, 1], [SHRIMP, 23, 11, 1, 1]]) },
  { name: 'カレーライス', desc: 'スプーンでいっしょに', seq: eatPlate(s => curry(5, 11, s), [[SPOON, 13, 7, 6, 1], [RICE, 12, 6, 1, 1], [CURRY, 13, 6, 1, 1]], [...steam(10, 8, 0), ...heart(9, -6)]) },
  { name: 'ぎょうざ', desc: 'こんがりぎょうざ', seq: eatPlate(s => gyoza(6, 12, s), [[GYOZA, 12, 6, 3, 2], [DOUGH, 12, 7, 3, 1]], [...spark(-2, -3), ...spark(24, -4)]) },
  { name: 'おだんご', desc: '上から順番に', seq: eatHeld(dango, 3, 9, 'top', [[STICK, 17, 10, 1, 3], ...heart(9, -6)]) },
  { name: 'たいやき', desc: 'あたまからぱくっ', seq: eatHeld(taiyaki, 8, 5, 'left', [[DOUGH, 23, 9, 1, 3], ...spark(-2, -3)]) },
  { name: 'メロンパン', desc: 'さくさくメロンパン', seq: eatHeld(melonpan, 7, 5, 'left', [[MELONPAN, 9, 13, 1, 1], ...heart(9, -6)]) },
  { name: 'ポテト', desc: '1本ずつつまんで', seq: eatPlate(s => fries(16, 8, s), [[MUSTARD, 12, 4, 1, 4]], [...spark(-2, -3), ...spark(24, -5)]) }
].map(m => { m.grid = 'grid-food'; return m; });

// ── 5. 食べ方のパターン ──
const DISH='#4a6fb5',FIRE1='#e8452f',FIRE2='#f39c34',FIRE3='#f5d76e',UME='#c0392b';
const ricebowl=(x,y,s)=>{ const r=[[DISH,x,y+2,8,2],[DISH,x+1,y+4,6,1],[STEAM_C,x+3,y+3,2,1]]; const w=[6,4,2,0][s]; if(w)r.push([RICE,x+4-w/2,y,w,2]); return r; };
const glass=(x,y)=>[[WATER,x,y,3,4],[RICE,x,y,3,1]];
const fire=(x,y,k)=>k?[[FIRE1,x,y,4,3],[FIRE2,x+4,y,3,3],[FIRE3,x+7,y+1,2,1],[FIRE1,x+2,y-1,2,1]]:[[FIRE1,x,y,3,3],[FIRE2,x+3,y+1,3,2],[FIRE3,x+6,y+1,2,1]];
const puff=[[O,2,8,2,3],[O,20,8,2,3]], belly=[[O,1,8,3,4],[O,20,8,3,4],[O,6,12,12,1]], freeze=[[SPRINK,6,-4,1,2],[SPRINK,11,-5,1,2],[SPRINK,16,-4,1,2]];
const WAYS = [
  { name: 'ガツガツ', desc: 'すごいいきおいでかきこむ', seq: (() => { const s=[[fig({extra:ricebowl(8,10,0)}),500]]; for(let i=0;i<9;i++){ const st=Math.min(3,Math.floor(i/3)+1); s.push([fig({l:'up',r:'up',mouth:i%2?'closed':'open',squash:i%2,extra:[...ricebowl(8,8+(i%2),st-(i%3===2?0:1)),...(i%3===0?[[RICE,10,6,1,1],[RICE,14,5,1,1]]:[])]}),110]); } s.push([fig({eyes:'happy',cheek:true,mouth:'closed',extra:[...ricebowl(8,10,3),[RICE,13,7,1,1]]}),900],[fig({eyes:'happy'}),400]); return s;})() },
  { name: 'フーフー', desc: 'あついのでふーふー', seq: (() => { const s=[[fig({extra:[...takoyaki(5,11,2),...steam(10,6,0)]}),500],[fig({r:'up',extra:[[TAKO,15,6,3,3],...steam(15,3,1)]}),400]]; for(let k=0;k<3;k++) s.push([fig({r:'up',mouth:'open',extra:[[TAKO,15,6,3,3],[STEAM_C,13,7,1,1],[STEAM_C,11,6,1,1]]}),260],[fig({r:'up',mouth:'closed',extra:[[TAKO,15,6,3,3],...steam(15,4-k,k)]}),260]); s.push([fig({r:'up',mouth:'open',extra:[[TAKO,12,5,3,3]]}),220],[fig({eyes:'closed',mouth:'closed',extra:[...sweat(21,0)]}),300],[fig({eyes:'happy',mouth:'open',squash:1,extra:[...steam(11,3,0),...sweat(21,1)]}),300],[fig({eyes:'happy',cheek:true,mouth:'closed'}),800]); return s;})() },
  { name: 'からい！', desc: '口から火がでる', seq: (() => { const s=[[fig({extra:curry(5,11,0)}),500],[fig({r:'up',mouth:'open',extra:[...curry(5,11,1),[SPOON,13,7,6,1],[CURRY,13,6,1,1]]}),280],[fig({mouth:'closed',extra:curry(5,11,1)}),400],[fig({eyes:'closed',cheek:true,extra:[...curry(5,11,1),...sweat(3,1)]}),300]]; for(let k=0;k<4;k++) s.push([fig({eyes:'closed',cheek:true,mouth:'open',dy:k%2?0:-1,l:'hi',r:'hi',extra:[...fire(10,7,k%2),...sweat(3,1+k%2),...sweat(21,k%2)]}),180]); s.push([fig({r:'up',mouth:'open',extra:glass(12,4)}),600],[fig({eyes:'happy',mouth:'closed',extra:sweat(21,1)}),700]); return s;})() },
  { name: 'すっぱい', desc: 'うめぼしでしかめっつら', seq: (() => { const s=[[fig({r:'up',extra:[[UME,17,6,2,2],[LEAF,17,5,1,1]]}),600],[fig({r:'up',mouth:'open',extra:[[UME,12,6,2,2]]}),260],[fig({mouth:'closed'}),300]]; for(let k=0;k<8;k++) s.push([fig({eyes:'closed',squash:2,dx:k%2?1:-1,mouth:'closed',extra:[[SPRINK,-2,4+(k%2),1,3],[SPRINK,25,4+(k%2),1,3]]}),90]); s.push([fig({eyes:'closed',squash:1,mouth:'closed'}),500],[fig({eyes:'happy',mouth:'closed'}),700]); return s;})() },
  { name: 'つまみぐい', desc: 'まわりを見てこっそり', seq: [[fig({extra:cookie(15,10)}),500],[fig({look:-1,extra:cookie(15,10)}),450],[fig({look:1,extra:cookie(15,10)}),450],[fig({look:-1,extra:cookie(15,10)}),300],[fig({r:'up',mouth:'open',dx:1,extra:cookie(12,4)}),160],[fig({mouth:'closed',extra:puff}),300],[fig({eyes:'wink',mouth:'closed',extra:[...puff,...note(25,-6)]}),500],[fig({eyes:'happy',mouth:'closed',extra:[...puff,...note(27,-9)]}),500],[fig({eyes:'happy',mouth:'closed',squash:1}),300],[fig({eyes:'happy',cheek:true}),700]] },
  { name: 'おなかいっぱい', desc: 'おなかがぽっこり', seq: (() => { const s=[]; for(let k=0;k<4;k++) s.push([fig({l:'up',r:'up',mouth:k%2?'closed':'open',extra:ricebowl(8,10,Math.min(3,k))}),250]); s.push([fig({eyes:'happy',mouth:'closed',extra:[...belly,...ricebowl(8,12,3)]}),700],[fig({eyes:'happy',cheek:true,mouth:'open',squash:1,extra:[...belly,[STEAM_C,12,4,2,1]]}),500],[fig({eyes:'closed',cheek:true,extra:[...belly,...heart(9,-6)]}),900],[fig({eyes:'closed',extra:[...belly,...zee(22,-3,ZZ())]}),800]); return s;})() },
  { name: 'ひとくちで', desc: 'ハンバーガーをまるごと！', seq: [[fig({extra:burger(16,8)}),600],[fig({eyes:'happy',extra:[...burger(16,8),...spark(24,-3)]}),400],[fig({r:'hi',mouth:'open',extra:burger(12,3)}),300],[fig({mouth:'closed',extra:puff}),200],[fig({mouth:'closed',squash:1,extra:puff}),220],[fig({mouth:'closed',extra:puff}),220],[fig({mouth:'closed',squash:1,extra:puff}),220],[fig({eyes:'happy',mouth:'closed',extra:[[O,3,8,1,3],[O,20,8,1,3]]}),300],[fig({eyes:'happy',cheek:true,mouth:'open',extra:heart(9,-6)}),900]] },
  { name: 'あたまキーン', desc: 'アイスでキーン！', seq: (() => { const s=[[fig({extra:softcream(16,6)}),400]]; for(let k=0;k<4;k++) s.push([fig({r:'up',mouth:k%2?'closed':'open',extra:trim(softcream(13,1),'top',1+k*2)}),130]); s.push([fig({eyes:'closed',l:'hi',r:'hi',extra:[...freeze,...bang(23,-8)]}),300]); for(let k=0;k<6;k++) s.push([fig({eyes:'closed',l:'hi',r:'hi',dx:k%2?1:-1,extra:freeze}),90]); s.push([fig({eyes:'closed',squash:1}),500],[fig({eyes:'happy'}),600]); return s;})() },
  { name: 'おすそわけ', desc: 'はんぶんこしてどうぞ', seq: [[fig({extra:cookie(16,9)}),500],[fig({r:'up',eyes:'happy',extra:cookie(13,5)}),400],[fig({l:'up',r:'up',extra:[...trim(cookie(10,5),'left',13),[DOUGH,8,5,3,1],[DOUGH,7,6,4,4]]}),300],[fig({l:'up',r:'up',eyes:'happy',extra:[[DOUGH,-2,5,3,1],[DOUGH,-3,6,4,4],[CHOCO,-2,7,1,1],...trim(cookie(17,5),'left',20)]}),700],[fig({eyes:'happy',cheek:true,l:'up',extra:[[DOUGH,-2,5,3,1],[DOUGH,-3,6,4,4],...heart(-4,-4)]}),900],[fig({r:'up',mouth:'open',extra:trim(cookie(12,5),'left',15)}),260],[fig({eyes:'happy',mouth:'closed',squash:1}),300],[fig({eyes:'happy',cheek:true}),600]] },
  { name: 'いただきます', desc: 'いただきます→ごちそうさま', seq: [[fig({extra:ricebowl(8,10,0)}),500],[fig({l:'up',r:'up',eyes:'closed',extra:ricebowl(8,10,0)}),400],[fig({l:'up',r:'up',eyes:'closed',squash:2,extra:[...ricebowl(8,10,0),...spark(-2,-2),...spark(24,-3)]}),600],[fig({mouth:'open',r:'up',extra:ricebowl(8,10,1)}),250],[fig({mouth:'closed',eyes:'happy',extra:ricebowl(8,10,2)}),250],[fig({mouth:'open',r:'up',extra:ricebowl(8,10,2)}),250],[fig({mouth:'closed',eyes:'happy',extra:ricebowl(8,10,3)}),400],[fig({l:'up',r:'up',eyes:'closed',squash:2,extra:[...ricebowl(8,10,3),...heart(9,-6)]}),900],[fig({eyes:'happy',cheek:true}),500]] }
].map(m => { m.grid = 'grid-way'; return m; });

// ── 6. いろいろな動き その2 ──
const SCARF='#d84a4a',BOX='#c9a06a',BOX_D='#a87f4f',BOOK='#4a6fb5',UMB='#e0475b',UMB_D='#b8364a',BALL='#e0475b',CAN='#5a8fd0';
const vein=(x,y)=>[[RED,x,y,1,2],[RED,x+2,y,1,2],[RED,x-1,y+2,2,1],[RED,x+2,y+2,2,1]];
const drop=(x,y)=>[[WATER,x,y,1,2]];
const sun=(x,y)=>[[GOLD,x+1,y+1,4,4],[GOLD,x+2,y,2,1],[GOLD,x+2,y+5,2,1],[GOLD,x,y+2,1,2],[GOLD,x+5,y+2,1,2]];
const scarf=(t)=>[[SCARF,3,t+7,18,2],[SCARF,15,t+9,2,3],[RICE,6,t+7,1,2],[RICE,10,t+7,1,2]];
const book=(y)=>[[BOOK,7,y,10,5],[RICE,8,y,4,4],[RICE,12,y,4,4],[STEAM_C,9,y+1,2,1],[STEAM_C,13,y+1,2,1],[STEAM_C,9,y+2,2,1],[STEAM_C,13,y+2,2,1]];
const umbrella=[[UMB,4,-13,16,2],[UMB,0,-11,24,2],[UMB,-2,-9,28,2],[UMB_D,4,-9,2,2],[UMB_D,18,-9,2,2],[STICK,22,-7,1,12]];
const rain=k=>[[-4,4],[28,8],[-3,12],[0,-5],[27,-3]].map(([x,y])=>[WATER,x,y+(k%3)*2,1,2]);
const ball=(x,y)=>[[BALL,x,y,3,3],[RICE,x,y,1,1]];
const can=[[CAN,21,6,5,4],[CAN,26,5,3,1],[CAN,22,5,2,1]];
const flower=h=>[[LEAF,29,16-h,1,h],...(h>=3?[[PINK,28,15-h,3,1],[PINK,29,14-h,1,3],[GOLD,29,15-h,1,1]]:[[LEAF,28,15,1,1]])];
const dumbbell=y=>[[IRON,-1,y,26,1],[NORI,-3,y-1,2,3],[NORI,25,y-1,2,3]];
const legs2=[[O,4,14,2,2],[O,8,14,2,2],[O,14,14,2,2],[O,18,14,2,2]];
const orbit=k=>{const p=[[-4,-4],[10,-9],[24,-4],[10,-6]][k%4],q=[[24,-4],[10,-6],[-4,-4],[10,-9]][k%4];return[...spark(...p),...spark(...q)];};
const MOVES2 = [
  { name: 'くしゃみ', desc: 'はっくしょん！', seq: [[fig(), 600], [fig({ eyes: 'closed', mouth: 'open', dy: -1 }), 400], [fig({ eyes: 'closed', mouth: 'open', dy: -2, l: 'up', r: 'up' }), 500], [fig({ eyes: 'closed', mouth: 'open', squash: 2, dx: -1, extra: [[STEAM_C,9,8,1,1],[STEAM_C,13,9,1,1],[STEAM_C,11,10,1,1],[STEAM_C,15,8,1,1],...bang(23,-8)] }), 300], [fig({ eyes: 'closed', squash: 1 }), 300], [fig({ eyes: 'happy', mouth: 'closed' }), 700]] },
  { name: 'あくび', desc: 'ふぁ〜…ねむい', seq: [[fig(), 500], [fig({ eyes: 'closed', l: 'up', r: 'up', dy: -1, extra: [[K,10,6,4,3]] }), 900], [fig({ eyes: 'closed', l: 'hi', r: 'hi', dy: -1, extra: [[K,10,6,4,4], ...drop(19, 3)] }), 700], [fig({ eyes: 'closed', mouth: 'closed', extra: drop(19, 5) }), 500], [fig({ eyes: 'closed', squash: 1 }), 400], [fig(), 500]] },
  { name: 'のびー', desc: 'うーんとせのび', seq: [[fig(), 500], [fig({ l: 'up', r: 'up', eyes: 'closed' }), 300], [fig({ l: 'hi', r: 'hi', eyes: 'closed', dy: -2, extra: legs2 }), 900], [fig({ l: 'hi', r: 'hi', eyes: 'closed', dy: -2, dx: -1, extra: legs2 }), 400], [fig({ l: 'hi', r: 'hi', eyes: 'closed', dy: -2, dx: 1, extra: legs2 }), 400], [fig({ squash: 1, eyes: 'happy' }), 300], [fig({ eyes: 'happy', cheek: true }), 600]] },
  { name: 'おじぎ', desc: 'よろしくおねがいします', seq: [[fig(), 600], [fig({ squash: 2, eyes: 'closed' }), 250], [fig({ squash: 3, eyes: 'closed' }), 800], [fig({ squash: 1, eyes: 'closed' }), 200], [fig({ eyes: 'happy', cheek: true, extra: [...spark(-2, -2), ...spark(24, -4)] }), 900]] },
  { name: 'びっくり', desc: 'わっ！とおどろく', seq: [[fig(), 700], [fig({ eyes: 'big', mouth: 'open', dy: -4, l: 'hi', r: 'hi', lift: [0,1,2,3], extra: bang(23, -12) }), 250], [fig({ eyes: 'big', mouth: 'open', dy: -2, l: 'hi', r: 'hi', extra: bang(23, -10) }), 300], [fig({ eyes: 'big', mouth: 'closed', squash: 1, extra: [...sweat(21, 0)] }), 500], [fig({ eyes: 'big', extra: sweat(21, 1) }), 500], [fig({ eyes: 'closed' }), 200], [fig({ eyes: 'happy' }), 600]] },
  { name: 'ぷんぷん', desc: 'おこってじたばた', seq: (() => { const s = [[fig(), 500]]; for (let k=0;k<6;k++) s.push([fig({eyes:'angry',mouth:'closed',lift:k%2?[0,2]:[1,3],l:k%2?'up':'side',r:k%2?'side':'up',extra:[...vein(18,-3),[STEAM_C,2+(k%2),-4-(k%3),2,1],[STEAM_C,20-(k%2),-5-(k%3),2,1]]}),200]); s.push([fig({eyes:'angry',squash:1,extra:vein(18,-2)}),500],[fig({eyes:'closed'}),400],[fig(),400]); return s;})() },
  { name: 'えーん', desc: 'なみだがぽろぽろ', seq: (() => { const s = [[fig(), 400]]; for (let k=0;k<6;k++) s.push([fig({eyes:'closed',mouth:'open',squash:k%2,extra:[...drop(6,5+(k%3)*2),...drop(17,6+((k+1)%3)*2),...drop(4,9+(k%2)*3),...drop(19,10+((k+1)%2)*3)]}),250]); s.push([fig({eyes:'closed',mouth:'closed'}),400],[fig({eyes:'happy',cheek:true,l:'up',r:'up',extra:[...spark(-2,-2),...spark(24,-3)]}),900]); return s;})() },
  { name: 'てれてれ', desc: 'ほっぺを赤くして', seq: (() => { const s=[[fig(), 400]]; for(let k=0;k<6;k++)s.push([fig({eyes:'happy',cheek:true,look:k%2?1:-1,dx:k%2?1:-1,l:'up',r:'up',extra:heart(k%2?22:-4,-6-(k%3))}),330]); s.push([fig({eyes:'closed',cheek:true}),600]); return s;})() },
  { name: 'さむい', desc: 'マフラーでぶるぶる', seq: (() => { const s=[]; for(let k=0;k<8;k++)s.push([fig({eyes:'closed',mouth:'closed',dx:k%2?1:-1,squash:1,extra:[...scarf(1),[SPRINK,-3,2+k%2,1,3],[SPRINK,26,3-k%2,1,3],...(k%4<2?[[STEAM_C,11,12,2,1]]:[])]}),150]); s.push([fig({eyes:'happy',cheek:true,extra:scarf(0)}),900]); return s;})() },
  { name: 'あつい', desc: 'おひさまであせだく', seq: (() => { const s=[]; for(let k=0;k<6;k++)s.push([fig({eyes:'closed',mouth:'open',squash:k%2,r:k%2?'up':'hi',extra:[...sun(-7,-14),...sweat(3,1+(k%3)),...sweat(21,2+((k+1)%3)),...drop(12,13+(k%2))]}),300]); s.push([fig({eyes:'happy',extra:sun(-7,-14)}),600]); return s;})() },
  { name: 'かくれんぼ', desc: 'はこの中からちらっ', seq: (() => { const bx=[[BOX,-2,8,28,8],[BOX_D,-2,8,28,1],[BOX_D,11,9,2,7]]; return [[fig({extra:bx}),600],[fig({dy:3,eyes:'closed',nolegs:true,extra:bx}),300],[fig({dy:7,nolegs:true,extra:bx}),900],[fig({dy:5,look:-1,nolegs:true,extra:bx}),500],[fig({dy:5,look:1,nolegs:true,extra:bx}),500],[fig({dy:7,nolegs:true,extra:bx}),600],[fig({dy:-2,eyes:'happy',l:'hi',r:'hi',extra:[...bx,...spark(-2,-6),...spark(24,-7)]}),800],[fig({extra:bx}),500]];})() },
  { name: 'うたう', desc: 'ゆらゆら歌って', seq: (() => { const s=[]; for(let k=0;k<8;k++)s.push([fig({eyes:'closed',mouth:k%2?'open':'closed',dx:k%4<2?-1:1,extra:[...note(22,-4-(k%4)*2),...(k%4>=2?note(-4,-8-(k%2)*2):[])]}),300]); return s;})() },
  { name: '本を読む', desc: 'ページをめくる', seq: (() => { const s=[]; for(let k=0;k<3;k++)s.push([fig({l:'up',r:'up',look:0,extra:book(8)}),700],[fig({l:'up',r:'up',eyes:'closed',extra:book(8)}),120],[fig({l:'up',r:'hi',extra:[...book(8),[RICE,14,5,3,3]]}),250]); s.push([fig({l:'up',r:'up',eyes:'happy',extra:[...book(8),...bang(23,-8)]}),800]); return s;})() },
  { name: 'かさ', desc: 'あめの日にるんるん', seq: (() => { const s=[]; for(let k=0;k<9;k++)s.push([fig({r:'up',eyes:k%3===2?'happy':'open',lift:k%2?[0,2]:[1,3],dx:k%2,extra:[...umbrella,...rain(k)]}),250]); return s;})() },
  { name: 'ボールあそび', desc: 'あたまでポンポン', seq: (() => { const s=[], ys=[-4,-8,-11,-12,-11,-8]; for(let k=0;k<12;k++)s.push([fig({dy:ys[k%6]===-4?-1:0,look:0,eyes:ys[k%6]<-10?'open':'happy',extra:ball(10,ys[k%6])}),130]); s.push([fig({eyes:'big',extra:ball(26,12)}),400],[fig({eyes:'happy',extra:ball(26,13)}),500]); return s;})() },
  { name: '水やり', desc: 'おはなに水をあげる', seq: (() => { const s=[[fig({r:'up',extra:[...can,...flower(1)]}),500]]; for(let k=0;k<6;k++)s.push([fig({r:'up',dx:-1,extra:[...can,...drop(28,7+(k%2)*2),...drop(27,9-(k%2)*2),...flower(1+Math.floor(k/2)*2)]}),250]); s.push([fig({eyes:'happy',cheek:true,extra:[...flower(6),...heart(17,-6)]}),900]); return s;})() },
  { name: 'きんトレ', desc: 'ダンベルをよいしょ', seq: (() => { const s=[[fig({extra:dumbbell(7)}),400]]; for(let k=0;k<4;k++)s.push([fig({l:'up',r:'up',eyes:'angry',squash:1,extra:dumbbell(5)}),300],[fig({l:'hi',r:'hi',eyes:'closed',dy:-1,extra:[...dumbbell(-5),...(k>1?sweat(21,1):[])]}),400]); s.push([fig({eyes:'happy',extra:[...dumbbell(7),...sweat(21,2),...spark(-2,-3)]}),800]); return s;})() },
  { name: 'めがまわる', desc: '星がぐるぐる', seq: (() => { const s=[]; for(let k=0;k<6;k++)s.push([fig({look:k%2?1:-1,dx:[0,1,0,-1][k%4],l:k%2?'up':'side',r:k%2?'side':'up'}),140]); for(let k=0;k<8;k++)s.push([fig({eyes:'dizzy',dx:k%2?1:-1,squash:k%2,extra:orbit(k)}),220]); s.push([fig({eyes:'closed',squash:1}),400],[fig({eyes:'happy'}),500]); return s;})() },
  { name: 'シャボン玉', desc: 'ふーっとふく', seq: (() => { const s=[[fig({r:'up',extra:[[STICK,19,4,3,1]]}),500]]; for(let k=0;k<8;k++)s.push([fig({r:'up',mouth:k%4===0?'open':'closed',eyes:k>3?'happy':'open',extra:[[STICK,19,4,3,1],...bubble(22,1-k,2),...(k>2?bubble(25,4-(k-3)*2,3):[]),...(k>4?bubble(-5,2-(k-5)*2,2):[])]}),300]); return s;})() },
  { name: 'ピース', desc: 'ウインクしてピース！', seq: [[fig(),600],[fig({r:'up'}),150],[fig({r:'hi',eyes:'wink',cheek:true,extra:[[O,21,-6,1,2],[O,23,-6,1,2],...spark(-3,-3)]}),700],[fig({r:'hi',eyes:'wink',cheek:true,dy:-1,extra:[[O,21,-7,1,2],[O,23,-7,1,2],...spark(-2,-6),...spark(25,-10)]}),700],[fig({eyes:'happy'}),500]] }
].map(m => { m.grid = 'grid-more'; return m; });

// ── 7. いろいろな動き その3 ──
const rep = (n,ms,f) => Array.from({length:n},(_,k)=>[f(k),ms]);
const PURPLE='#9b6bd6',GREEN='#5aa35a';
const catEars=[[O,5,-3,2,1],[O,4,-2,4,2],[O,17,-3,2,1],[O,16,-2,4,2],[PINK,5,-2,2,1],[PINK,17,-2,2,1]],catMouth=[[K,10,6,1,1],[K,11,7,1,1],[K,12,6,1,1],[K,13,7,1,1],[K,14,6,1,1]];
const bunny=t=>[[O,6,t-8,2,8],[O,16,t-8,2,8],[PINK,6,t-6,1,5],[PINK,17,t-6,1,5]];
const shades=[[K,4,2,16,1],[K,5,2,5,3],[K,14,2,5,3],[RICE,6,2,1,1],[RICE,15,2,1,1]];
const tophat=y=>[[K,7,y-5,10,5],[K,4,y,16,1],[RED,7,y-1,10,1]];
const firework=(x,y,k,c)=>k===0?[[c,x,y,1,2]]:k===1?[[c,x,y-1,1,3],[c,x-1,y,3,1]]:[[c,x,y-4,1,2],[c,x,y+3,1,2],[c,x-4,y,2,1],[c,x+3,y,2,1],[c,x-3,y-3,1,1],[c,x+3,y-3,1,1],[c,x-3,y+3,1,1],[c,x+3,y+3,1,1]];
const flake=(x,y)=>[[RICE,x,y,1,1],[RICE,x-1,y+1,3,1],[RICE,x,y+2,1,1]];
const leafs=k=>[[-4,2],[8,-6],[20,-2],[-2,10]].map(([x,y],i)=>[LEAF,x+((k+i*3)%8)*4-6,y+(k%2),2,1]);
const ghost=[[RICE,3,-1,18,14],[RICE,3,13,3,2],[RICE,9,13,3,2],[RICE,15,13,3,2],[RICE,18,13,3,2],[K,8,4,2,2],[K,14,4,2,2]];
const wand=k=>[[STICK,22,-2,1,7],...spark(21,-5),...(k%2?[...spark(26,-9),...spark(15,-8)]:[...spark(27,-2),...spark(18,-11)])];
const guitar=[[WOOD,9,7,8,6],[K,12,9,2,2],[STICK,17,9,9,1],[STICK,25,8,2,3]];
const drum=[[RED,6,11,12,5],[RICE,6,10,12,1],[GOLD,6,13,12,1]];
const camera=[[IRON,10,3,8,6],[K,12,4,4,4],[STEAM_C,13,5,2,2],[RICE,16,2,2,1]];
const letter=open=>[[RICE,7,6,10,6],[STEAM_C,7,6,10,1],[STEAM_C,8,7,1,1],[STEAM_C,15,7,1,1],[STEAM_C,9,8,6,1],...(open?heart(10,0):[[PINK,11,8,2,2]])];
const gift=lid=>[[RED,7,9,10,7],[GOLD,11,9,2,7],[GOLD,7,11,10,1],[RED,6,9-lid,12,2],[GOLD,11,9-lid,2,2],[GOLD,9,7-lid,2,2],[GOLD,13,7-lid,2,2]];
const balloon=y=>[[PINK,22,y,5,5],[PINK,23,y-1,3,1],[PINK,23,y+5,3,1],[RICE,23,y+1,1,1],[STEAM_C,24,y+6,1,8]];
const shoot=k=>[[GOLD,28-k*4,-14+k*3,2,2],...(k>0?[[GOLD,30-k*4,-15+k*3,2,1]]:[]),...(k>1?[[GOLD,32-k*4,-16+k*3,1,1]]:[])];
const rod=[[STICK,22,3,1,1],[STICK,23,2,1,1],[STICK,24,1,1,1],[STICK,25,0,1,1],[STICK,26,-1,1,1],[STICK,27,-2,1,1],[STICK,28,-3,1,1]];
const fish=(x,y)=>[[CAN,x,y,4,2],[CAN,x+4,y-1,1,4],[K,x+1,y,1,1]];
const pom=(x,y)=>[[GOLD,x,y,3,3],[PINK,x+1,y+1,1,1],[PINK,x-1,y+1,1,1],[PINK,x+3,y+1,1,1]];
const bulb=on=>[[on?GOLD:STEAM_C,10,-11,4,4],[on?GOLD:STEAM_C,11,-12,2,1],[IRON,11,-7,2,1],...(on?[[GOLD,7,-12,1,1],[GOLD,16,-12,1,1],[GOLD,12,-15,1,2]]:[])];
const party=[[GOLD,10,-7,4,7],[GOLD,11,-9,2,2],[PINK,10,-4,4,1],[PINK,11,-7,2,1],[RICE,11,-11,2,2]];
const confetti=k=>[[-4,-6,PINK],[2,-12,GOLD],[18,-11,SPRINK],[26,-7,GREEN],[-2,4,PURPLE],[27,5,PINK]].map(([x,y,c],i)=>[c,x,y+((k+i)%4)*2,1,1]);
const speed=[[STEAM_C,-6,4,4,1],[STEAM_C,-5,8,3,1],[STEAM_C,-6,12,4,1]];
const MOVES3 = [
  { name: 'スキップ', desc: 'るんるんスキップ', seq: rep(10,200,k=>fig({dy:k%2?0:-2,dx:[0,1,2,1,0,-1,-2,-1,0,0][k],lift:k%2?[]:(k%4?[0,2]:[1,3]),eyes:'happy',extra:k%4===0?note(24,-6):[]})) },
  { name: 'ねこのまね', desc: 'ねこみみでにゃーん', seq: [[fig(),400],[fig({extra:catEars}),400],...rep(6,280,k=>fig({eyes:k%3===2?'closed':'happy',l:k%2?'up':'side',r:k%2?'side':'up',extra:[...catEars,...catMouth,...(k>2?heart(22,-7):[])]}))] },
  { name: 'うさぎのまね', desc: 'ぴょこぴょこ', seq: rep(10,200,k=>fig({dy:k%2?0:-2,squash:k%2,eyes:'happy',lift:k%2?[]:[0,1,2,3],extra:bunny(k%2?1:-2)})) },
  { name: 'サングラス', desc: 'サングラスをかけて', seq: [[fig(),500],[fig({extra:[[K,5,-6,5,3],[K,14,-6,5,3],[K,4,-6,16,1]]}),200],[fig({extra:[[K,5,-2,5,3],[K,14,-2,5,3],[K,4,-2,16,1]]}),150],[fig({extra:shades}),300],[fig({r:'hi',mouth:'closed',extra:[...shades,...spark(25,-6)]}),700],[fig({r:'hi',mouth:'closed',dy:-1,extra:[...shades,...spark(-3,-4),...spark(26,-9)]}),800]] },
  { name: 'シルクハット', desc: 'ぼうしを上げてごあいさつ', seq: [[fig({extra:tophat(-1)}),600],[fig({r:'up',extra:tophat(-3)}),250],[fig({r:'hi',eyes:'closed',squash:2,extra:tophat(-6)}),800],[fig({r:'up',eyes:'happy',extra:tophat(-3)}),250],[fig({eyes:'happy',cheek:true,extra:[...tophat(-1),...spark(25,-4)]}),800]] },
  { name: 'はなび', desc: '夜空にはなび', seq: rep(12,220,k=>fig({eyes:k>3?'happy':'open',look:0,extra:[...firework(-1,-6,Math.min(2,Math.max(0,k-1)),GOLD),...(k>4?firework(26,-9,Math.min(2,k-5),PINK):[]),...(k>7?firework(12,-12,Math.min(2,k-8),SPRINK):[])]})) },
  { name: 'ゆき', desc: 'ゆきがふってきて', seq: [...rep(8,260,k=>fig({l:k%2?'up':'side',r:k%2?'side':'up',look:k%2?-1:1,extra:[...flake(-3,-10+k*2),...flake(25,-13+k*2),...flake(11,-14+(k%4)*2)]})),[fig({eyes:'happy',l:'up',r:'up',cheek:true,extra:[...flake(1,-1),...flake(22,-1)]}),800]] },
  { name: 'かぜ', desc: 'はっぱといっしょに', seq: rep(10,200,k=>fig({dx:k%3===0?0:-1,eyes:'closed',l:'up',squash:k%2,extra:[...leafs(k),[STEAM_C,26,2+(k%3)*3,4,1],[STEAM_C,27,9-(k%2)*2,3,1]]})) },
  { name: 'おばけごっこ', desc: 'シーツをかぶって', seq: [[fig(),400],...rep(8,260,k=>fig({dy:k%2?-1:0,nolegs:true,extra:[...ghost.map(([c,x,y,w,h])=>[c,x+(k%4<2?0:1),y+(k%2?-1:0),w,h])]})),[fig({eyes:'happy',cheek:true}),700]] },
  { name: 'まほう', desc: 'まほうのステッキ', seq: [[fig({r:'up',extra:[[STICK,21,1,1,6]]}),400],...rep(8,220,k=>fig({r:'hi',eyes:k%2?'happy':'open',extra:wand(k)})),[fig({eyes:'happy',cheek:true,extra:heart(9,-6)}),700]] },
  { name: 'ギター', desc: 'ジャカジャーン！', seq: rep(10,230,k=>fig({r:k%2?'up':'side',eyes:'closed',mouth:k%2?'open':'closed',dx:k%4<2?0:1,extra:[...guitar,...note(24-(k%3),-4-(k%4)*2)]})) },
  { name: 'たいこ', desc: 'ドンドンたたく', seq: rep(10,180,k=>fig({l:k%2?'hi':'up',r:k%2?'up':'hi',eyes:k>5?'happy':'open',squash:k%2,extra:[...drum,...(k%2?[[STEAM_C,2,9,2,1]]:[[STEAM_C,20,9,2,1]])]})) },
  { name: 'カメラ', desc: 'はいチーズ！', seq: [[fig({r:'up',l:'up',extra:camera}),600],[fig({r:'up',l:'up',eyes:'closed',extra:camera}),300],[fig({r:'up',l:'up',extra:[...camera,[RICE,15,-2,1,3],[RICE,13,0,5,1],...spark(20,-6),...spark(8,-5)]}),200],[fig({eyes:'happy',extra:[[RICE,22,4,6,6],[SPRINK,23,5,4,2],[GREEN,23,7,4,2]]}),900]] },
  { name: 'てがみ', desc: 'おてがみをあける', seq: [[fig({l:'up',r:'up',extra:letter(false)}),700],[fig({l:'up',r:'up',eyes:'big',extra:letter(false)}),400],[fig({l:'up',r:'up',extra:letter(true)}),400],[fig({l:'up',r:'up',eyes:'happy',cheek:true,extra:[...letter(true),...heart(18,-6)]}),900]] },
  { name: 'プレゼント', desc: 'はこをあける', seq: [[fig({extra:gift(0)}),600],[fig({eyes:'happy',l:'up',r:'up',extra:gift(0)}),400],[fig({l:'up',r:'up',extra:gift(3)}),200],[fig({eyes:'big',l:'hi',r:'hi',dy:-1,extra:[...gift(6),...spark(10,-4),...spark(3,-8),...spark(19,-9)]}),600],[fig({eyes:'happy',cheek:true,l:'hi',r:'hi',extra:[...gift(6),...heart(9,-10)]}),800]] },
  { name: 'ふうせん', desc: 'ふわっとうく', seq: rep(10,260,k=>fig({r:'hi',dy:k<3?0:-[1,2,3,2,3,2,1][k-3]||0,eyes:k>3?'happy':'open',lift:k>3?[0,1,2,3]:[],extra:balloon(-12-(k>3?2:0))})) },
  { name: 'ながれぼし', desc: 'おねがいごと', seq: [...rep(6,160,k=>fig({look:1,extra:shoot(k)})),[fig({eyes:'closed',l:'up',r:'up',extra:spark(4,-6)}),900],[fig({eyes:'happy',cheek:true,extra:heart(9,-6)}),700]] },
  { name: 'つり', desc: 'つれた！', seq: [[fig({r:'up',extra:[...rod,[STEAM_C,29,-3,1,18]]}),900],[fig({r:'up',eyes:'closed',extra:[...rod,[STEAM_C,29,-3,1,18]]}),400],[fig({r:'up',eyes:'big',extra:[...rod,[STEAM_C,29,-3,1,18],...bang(23,-9)]}),300],[fig({r:'hi',dy:-1,extra:[...rod,[STEAM_C,29,-3,1,6],...fish(27,3)]}),300],[fig({r:'hi',eyes:'happy',cheek:true,extra:[...rod,[STEAM_C,29,-3,1,4],...fish(27,1),...spark(-3,-4)]}),900]] },
  { name: 'あっち！', desc: 'ゆびさし', seq: [[fig(),500],[fig({look:1}),400],[fig({look:1,eyes:'big',extra:bang(22,-8)}),300],[fig({look:1,r:'up',extra:[[O,24,0,4,2],[O,28,0,2,1]]}),900],[fig({look:1,r:'up',dx:1,extra:[[O,24,0,4,2],[O,28,0,2,1],...spark(28,-5)]}),600]] },
  { name: 'ころぶ', desc: 'つまずいてころん', seq: [[fig(),500],[fig({dx:2,lift:[3],eyes:'big'}),250],[fig({dx:3,squash:3,eyes:'dizzy',l:'up',r:'up',extra:[...spark(4,-4),...spark(18,-5)]}),700],[fig({squash:2,eyes:'closed',extra:drop(19,3)}),400],[fig({eyes:'happy',l:'hi',extra:spark(-3,-6)}),700]] },
  { name: 'おうえん', desc: 'フレー！フレー！', seq: rep(10,220,k=>fig({l:k%2?'hi':'up',r:k%2?'up':'hi',dy:k%4===0?-2:0,eyes:'happy',mouth:k%2?'open':'closed',extra:[...pom(k%2?-1:-1,k%2?-5:0),...pom(k%2?22:22,k%2?0:-5)]})) },
  { name: 'はくしゅ', desc: 'パチパチパチ', seq: [...rep(10,140,k=>fig({l:k%2?'up':'side',r:k%2?'up':'side',eyes:'happy',extra:k%2?[[GOLD,-2,1,2,1],[GOLD,24,1,2,1],[GOLD,-1,-1,1,1],[GOLD,24,-1,1,1]]:[]})),[fig({eyes:'happy',cheek:true}),600]] },
  { name: 'ためいき', desc: 'はぁ〜…', seq: [[fig(),500],[fig({eyes:'closed',dy:-1}),500],[fig({eyes:'closed',squash:2,mouth:'open',extra:[[STEAM_C,8,8,3,1],[STEAM_C,6,9,2,1]]}),500],[fig({eyes:'closed',squash:2,extra:[[STEAM_C,2,8,3,1],[STEAM_C,0,10,2,1]]}),600],[fig({eyes:'closed',squash:1}),500],[fig(),500]] },
  { name: 'ひらめき', desc: 'ピコーン！', seq: [[fig({look:1,r:'up',extra:bulb(false)}),700],[fig({look:1,r:'up',eyes:'closed',extra:bulb(false)}),400],[fig({eyes:'big',l:'hi',r:'hi',dy:-1,extra:bulb(true)}),600],[fig({eyes:'happy',l:'hi',r:'hi',extra:[...bulb(true),...spark(-3,-6),...spark(25,-6)]}),800]] },
  { name: 'かんがえちゅう', desc: 'うーん…てんてんてん', seq: [...rep(8,300,k=>fig({look:1,r:'up',eyes:k%4===3?'closed':'open',extra:[[ZZ(),15,-3,1,1],...(k%4>0?[[ZZ(),18,-5,2,2]]:[]),...(k%4>1?[[ZZ(),21,-8,3,3]]:[])]})),[fig({eyes:'happy',extra:bulb(true)}),600]] },
  { name: 'ハートをなげる', desc: 'えいっ！と投げる', seq: [[fig({eyes:'happy',cheek:true,extra:heart(15,4)}),400],[fig({r:'hi',eyes:'happy',cheek:true,extra:heart(21,-6)}),200],...rep(4,160,k=>fig({r:'up',eyes:'wink',cheek:true,extra:heart(24+k*2,-9-k*2)})),[fig({eyes:'happy',cheek:true,extra:[...heart(-5,-9),...heart(26,-12)]}),700]] },
  { name: 'かけっこ', desc: 'タタタタッ', seq: rep(12,110,k=>fig({dx:1,dy:k%2?0:-1,lift:k%2?[0,2]:[1,3],l:k%2?'up':'side',r:k%2?'side':'up',eyes:'angry',extra:[...speed,...(k%4===0?sweat(21,0):[])]})) },
  { name: 'なわとび', desc: 'ぴょんぴょん', seq: rep(8,230,k=>{const up=k%2===0;return fig({dy:up?-3:0,l:'up',r:'up',lift:up?[0,1,2,3]:[],eyes:k>4?'happy':'open',extra:up?[[STICK,-2,13,28,1],[STICK,-2,1,1,12],[STICK,25,1,1,12]]:[[STICK,-2,-6,28,1],[STICK,-2,-5,1,9],[STICK,25,-5,1,9]]});}) },
  { name: 'おいわい', desc: 'おめでとう！', seq: rep(10,220,k=>fig({l:k%2?'hi':'up',r:k%2?'up':'hi',dy:k%4===0?-1:0,eyes:'happy',cheek:true,extra:[...party.map(([c,x,y,w,h])=>[c,x,y+(k%4===0?-1:0),w,h]),...confetti(k)]})) },
  { name: 'まばたき', desc: 'パチパチ…ウインク', seq: [[fig(),700],[fig({eyes:'closed'}),100],[fig(),150],[fig({eyes:'closed'}),100],[fig(),500],[fig({eyes:'closed'}),100],[fig(),150],[fig({eyes:'wink',cheek:true,extra:spark(22,-3)}),700],[fig(),400]] }
].map(m => { m.grid = 'grid-more3'; return m; });

// ── 8. 仮装のパターン ──
const BROWN='#8b5a2b',NAVY='#2c3e70',NINJA='#2b2f3a',PUMPKIN='#f08a3c',PUMP_D='#d46f25',GLASS='#bfe3f5',BEIGE='#e8c9a0',MANE='#c9772e',BELT='#3a3a6a';
const poof=[[STEAM_C,-2,4,4,3],[STEAM_C,22,3,4,3],[STEAM_C,8,-4,5,3],[STEAM_C,3,12,4,3],[STEAM_C,17,12,4,3],[STEAM_C,10,14,4,2]];
function dress(name,desc,cos,o={}){
  const arms=o.arms||'wave', s=[[fig(),400],[fig({eyes:'closed',extra:poof}),250],[fig({eyes:'closed',extra:[...cos(0,0),...poof.slice(0,3)]}),200]];
  for(let k=0;k<6;k++){ const t=o.bob===false?0:(k%2?-1:0); s.push([fig({dy:t,eyes:o.eyes||(k%3===2?'closed':'happy'),mouth:o.mouth,dx:o.step?(k%2?1:-1):0,lift:o.stomp?(k%2?[0,1]:[2,3]):[],l:arms==='both'?(k%2?'hi':'up'):'side',r:arms==='none'?'side':(k%2?'up':'hi'),nolegs:o.nolegs,extra:cos(t,k)}),o.ms||280]); }
  s.push([fig({eyes:'happy',cheek:!o.nocheek,mouth:o.mouth,nolegs:o.nolegs,extra:[...cos(0,0),...spark(-4,-8),...spark(26,-10)]}),800]); return {grid:'grid-dress',name,desc,seq:s};
}
const DRESSES = [
  dress('まじょ', 'とんがりぼうし', (t,k)=>[[PURPLE,2,t-1,20,1],[PURPLE,6,t-4,12,3],[PURPLE,9,t-7,7,3],[PURPLE,12,t-9,4,2],[PURPLE,15,t-10,3,1],[GOLD,6,t-2,12,1],[STICK,25,t+1,1,11],[BOX,24,t+12,3,3],...(k%2?spark(27,t-4):[])],{arms:'none'}),
  dress('かいぞく', 'ヨーホー', (t,k)=>[[RED,4,t,16,2],[RED,20,t+1,3,1],[RED,21,t+2,2,1],[K,5,t+2,4,3],[K,9,t+2,11,1],[SPOON,25,t-3+(k%2),1,8],[GOLD,24,t+4+(k%2),3,1]]),
  dress('にんじゃ', 'しゅりけん', (t,k)=>[[NINJA,4,t,16,2],[NINJA,4,t+5,16,7],[NINJA,20,t+1,4,1],[NINJA,22,t+2,3,1],...(k%2?[[IRON,27,t-2,1,3],[IRON,26,t-1,3,1]]:[[IRON,26,t-2,1,1],[IRON,28,t-2,1,1],[IRON,27,t-1,1,1],[IRON,26,t,1,1],[IRON,28,t,1,1]])],{arms:'wave',eyes:'open',nocheek:true}),
  dress('おうさま', '赤いマント', (t)=>[[RED,1,t+8,3,8],[RED,20,t+8,3,8],[GOLD,6,t-3,12,3],[GOLD,6,t-5,2,2],[GOLD,11,t-5,2,2],[GOLD,16,t-5,2,2],[RED,11,t-2,2,1],[SPRINK,7,t-2,1,1],[SPRINK,16,t-2,1,1]],{arms:'none'}),
  dress('おひめさま', 'ティアラとドレス', (t)=>[[GOLD,8,t-2,8,1],[GOLD,11,t-3,2,1],[PINK,11,t-4,2,1],[PINK,2,t+9,20,5],[RICE,2,t+13,20,1],[RICE,8,t+9,8,1]],{arms:'both'}),
  dress('サンタさん', '白いおひげ', (t)=>[[RED,5,t-3,14,3],[RED,9,t-5,8,2],[RED,15,t-6,4,1],[RICE,19,t-7,2,2],[RICE,4,t-1,16,2],[RICE,6,t+6,12,4],[RICE,8,t+10,8,1]]),
  dress('トナカイ', '赤いはな', (t,k)=>[[BROWN,6,t-5,1,5],[BROWN,4,t-6,1,3],[BROWN,8,t-6,1,2],[BROWN,17,t-5,1,5],[BROWN,19,t-6,1,3],[BROWN,15,t-6,1,2],[k%2?RED:'#ff7b7b',11,t+5,2,2],...(k%2?[[GOLD,10,t+4,1,1],[GOLD,13,t+7,1,1]]:[])],{arms:'both'}),
  dress('かぼちゃ', 'かぼちゃおばけ', (t,k)=>[[PUMPKIN,2,t-1,20,9],[PUMP_D,8,t-1,1,9],[PUMP_D,15,t-1,1,9],[LEAF,11,t-3,2,2],[k%2?GOLD:K,6,t+2,3,2],[k%2?GOLD:K,15,t+2,3,2],[K,8,t+5,8,1],[K,9,t+6,2,1],[K,13,t+6,2,1]],{arms:'both'}),
  dress('ドラキュラ', '黒いマント', (t)=>[[K,0,t+3,4,12],[K,20,t+3,4,12],[RED,1,t+4,2,10],[RED,21,t+4,2,10],[K,3,t-1,3,4],[K,18,t-1,3,4],[K,4,t,16,1],[K,11,t+1,2,1],[RICE,10,t+6,1,2],[RICE,13,t+6,1,2]],{arms:'none',mouth:'closed'}),
  dress('ミイラ', 'ほうたいぐるぐる', (t)=>[[RICE,4,t+1,16,1],[RICE,4,t+4,3,1],[RICE,17,t+4,3,1],[RICE,4,t+7,16,1],[RICE,4,t+10,16,1],[STEAM_C,6,t+5,6,1],[STEAM_C,12,t+9,6,1],[RICE,0,t+5,4,1],[RICE,20,t+5,4,1]],{arms:'both',step:true,stomp:true}),
  dress('うちゅうひこうし', 'ヘルメット', (t,k)=>[[RICE,2,t-3,20,1],[RICE,1,t-2,1,11],[RICE,22,t-2,1,11],[RICE,2,t+9,20,1],[GLASS,3,t-2,3,1],[GLASS,3,t-1,1,2],[IRON,11,t-6,1,3],[k%2?RED:GOLD,11,t-7,1,1],...spark(-5,t-10+(k%3)),...spark(27,t-5-(k%3))],{arms:'both'}),
  dress('ロボット', 'ウィーン', (t,k)=>[[IRON,4,t,16,6],[k%2?GOLD:SPRINK,6,t+2,3,2],[k%2?GOLD:SPRINK,15,t+2,3,2],[IRON,11,t-3,2,3],[RED,11,t-4,2,1],[RICE,4,t+3,1,1],[RICE,19,t+3,1,1],[K,9,t+5,6,1]],{arms:'both',step:true,eyes:'closed',nocheek:true,ms:200}),
  dress('コックさん', 'フライパン', (t,k)=>[[RICE,6,t-6,12,4],[RICE,5,t-7,4,2],[RICE,10,t-8,4,2],[RICE,15,t-7,4,2],[STEAM_C,6,t-2,12,1],[STICK,21,t+6,3,1],[IRON,24,t+5,6,2],[RICE,25,t+1-(k%2)*4,3,2],[GOLD,26,t+1-(k%2)*4,1,1]],{arms:'none'}),
  dress('おいしゃさん', 'ちょうしんき', (t)=>[[RICE,4,t-1,16,1],[SPOON,10,t-3,4,3],[RICE,11,t-3,1,1],[RICE,2,t+7,2,5],[RICE,20,t+7,2,5],[IRON,7,t+6,1,4],[IRON,16,t+6,1,4],[IRON,7,t+10,10,1],[SPOON,11,t+10,2,2]],{arms:'none'}),
  dress('おまわりさん', 'バッジでピッ', (t,k)=>[[NAVY,4,t-2,16,3],[K,3,t+1,18,1],[GOLD,11,t-1,2,2],[GOLD,10,t+9,2,2],...(k%2?[[RICE,23,t+2,2,1],[STEAM_C,26,t+1,2,1],[STEAM_C,26,t+3,2,1]]:[])]),
  dress('しょうぼうし', '放水', (t,k)=>[[RED,4,t-3,16,4],[RED,2,t+1,20,1],[GOLD,11,t-2,2,2],[RED,20,t+8,6,1],[WATER,27,t+6-(k%2),3,1],[WATER,29,t+4+(k%2),2,1],[WATER,30,t+8,2,1]],{arms:'none'}),
  dress('ゆうびんやさん', '〒のぼうし', (t,k)=>[[NAVY,4,t-2,16,3],[K,3,t+1,18,1],[RED,10,t-2,4,1],[RED,10,t-1,4,1],[RED,11,t,2,1],[K,5,t+3,1,1],[K,6,t+4,14,1],[RED,20,t+8,6,5],[RICE,21,t+7,3,2],[PINK,22,t+7,1,1],...(k%2?[[RICE,-4,t+2-(k%4),4,3],[RED,-3,t+3-(k%4),1,1]]:[])]),
  dress('きょうりゅう', 'ガオー', (t,k)=>[[GREEN,6,t-2,2,2],[GREEN,10,t-3,2,3],[GREEN,14,t-2,2,2],[GREEN,22,t+10,5,2],[GREEN,26,t+8,2,3],...(k%2?[[K,10,t+5,4,3],[RICE,10,t+5,1,1],[RICE,13,t+5,1,1]]:[])],{arms:'both',stomp:true}),
  dress('ライオン', 'ガオーッ', (t,k)=>[[MANE,2,t-2,20,2],[MANE,1,t,3,9],[MANE,20,t,3,9],[MANE,3,t-3,4,1],[MANE,17,t-3,4,1],[K,11,t+5,2,1],...(k%2?[[K,10,t+6,4,2]]:[])],{arms:'both'}),
  dress('くま', 'まるいおみみ', (t)=>[[BROWN,4,t-2,4,3],[BROWN,16,t-2,4,3],[PINK,5,t-1,2,1],[PINK,17,t-1,2,1],[BEIGE,9,t+5,6,3],[K,11,t+5,2,1],[BEIGE,8,t+9,8,3]]),
  dress('ペンギン', 'よちよち', (t,k)=>[[K,4,t,16,2],[K,4,t,3,12],[K,17,t,3,12],[RICE,7,t+2,10,10],[K,8,t+3,2,2],[K,14,t+3,2,2],[GOLD,11,t+6,2,2],[K,0,t+4+(k%2?-2:0),4,4],[K,20,t+4+(k%2?0:-2),4,4]],{arms:'none',step:true,eyes:'open',nocheek:true}),
  dress('てんし', '白いはね', (t,k)=>[[GOLD,8,t-5,8,1],[GOLD,7,t-4,1,1],[GOLD,16,t-4,1,1],[GOLD,8,t-3,8,1],[RICE,-4,t+2-(k%2),4,6],[RICE,-6,t+3-(k%2),2,4],[RICE,24,t+2-(k%2),4,6],[RICE,28,t+3-(k%2),2,4]],{arms:'both'}),
  dress('あくま', 'いたずら', (t,k)=>[[RED,5,t-3,2,3],[RED,4,t-4,1,2],[RED,17,t-3,2,3],[RED,19,t-4,1,2],[RED,21,t+11,4,1],[RED,25,t+9-(k%2),1,3],[RED,24,t+8-(k%2),3,1]],{arms:'wave',eyes:'angry'}),
  dress('おすもうさん', 'どすこい', (t)=>[[K,10,t-3,4,3],[K,9,t-1,6,1],[BELT,4,t+9,16,3],[BELT,10,t+12,4,2],[RICE,11,t+12,1,2]],{arms:'both',stomp:true,bob:false}),
  dress('カウボーイ', 'ヒーハー', (t,k)=>[[BROWN,6,t-4,12,3],[BROWN,2,t-1,20,1],[K,6,t-2,12,1],[RED,8,t+7,8,2],...(k%2?[[STICK,24,t-6,6,1],[STICK,23,t-5,1,3],[STICK,30,t-5,1,3],[STICK,24,t-2,6,1]]:[[STICK,23,t-8,6,1],[STICK,22,t-7,1,3],[STICK,29,t-7,1,3],[STICK,23,t-4,6,1]])])
];

// ── 9. オリジナルキャラ（マジシャン） ──
const MG_HAIR='#b48ad8',MG_HAIR_D='#8a62b5',MG_SKIN='#f6e3d3',MG_SUIT='#5b3f8c',MG_SUIT_D='#43306a',MG_EYE='#3fae7a';
function mage(o={}){
  const dy=o.dy||0,r=[];const R=(c,x,y,w,h)=>r.push([c,x,y+dy,w,h]);
  R(MG_HAIR,6,0,12,2);R(MG_HAIR,5,-2,2,3);R(MG_HAIR,9,-3,2,3);R(MG_HAIR,13,-3,2,3);R(MG_HAIR,17,-2,2,3);R(MG_HAIR_D,6,1,12,1);
  R(MG_SKIN,7,2,10,5);R(MG_HAIR,6,2,1,3);R(MG_HAIR,17,2,1,3);
  const e=o.eyes||'open';
  if(e==='closed'||e==='grin'){R(K,9,4,2,1);R(K,13,4,2,1);}
  else{R(MG_EYE,9,4,2,1);R(K,9,3,2,1);if(e==='wink')R(K,13,4,2,1);else{R(MG_EYE,13,4,2,1);R(K,13,3,2,1);}}
  R(GOLD,8,5,1,1);R(SPRINK,15,5,1,1);R(K,11,6,e==='grin'?3:2,1);if(e==='grin')R(K,14,5,1,1);
  R(MG_SUIT,8,7,8,6);R(RICE,10,7,4,1);R(GOLD,8,10,8,1);R(MG_SUIT_D,11,8,2,2);
  const arm=(side,pose)=>{const x=side?16:5,hx=side?19:4;if(pose==='hi'){R(MG_SUIT,x,3,3,4);R(MG_SKIN,side?17:5,2,2,1);}else if(pose==='up'){R(MG_SUIT,x,6,3,2);R(MG_SKIN,hx,5,1,2);}else{R(MG_SUIT,x,8,3,3);R(MG_SKIN,side?17:5,11,2,1);}};
  arm(0,o.l);arm(1,o.r);
  R(MG_SUIT_D,9,13,2,2);R(MG_SUIT_D,13,13,2,2);R(K,8,15,3,1);R(K,13,15,3,1);
  if(o.card){r.push([RICE,o.card[0],o.card[1]+dy,3,4]);r.push([o.card[2]?RED:K,o.card[0]+1,o.card[1]+1+dy,1,2]);}
  (o.extra||[]).forEach(q=>r.push(q));return r;
}
const flyCard=(x,y)=>[[RICE,x,y,4,1],[RED,x+1,y,1,1]];
const ORIG = [
  { name: 'カードなげ', desc: 'シュッ！', seq: [[mage(),600],[mage({r:'up',card:[19,3,true]}),400],[mage({r:'up',eyes:'grin',card:[19,3,true]}),500],[mage({r:'hi',eyes:'grin',card:[18,-2,true]}),200],[mage({r:'up',eyes:'grin',extra:flyCard(22,2)}),90],[mage({r:'up',extra:flyCard(27,2)}),90],[mage({eyes:'wink',extra:[...flyCard(32,2),...spark(30,-4)]}),200],[mage({eyes:'wink'}),700]] },
  { name: 'シャッフル', desc: '両手でシャッフル', seq: (() => { const s=[[mage(),500]]; for(let k=0;k<8;k++)s.push([mage({l:'up',r:'up',eyes:k%4===3?'grin':'closed',extra:[[RICE,9,6-(k%2),3,4],[RICE,12,5+(k%2),3,4],[RED,10,7-(k%2),1,1],[K,13,6+(k%2),1,1],...(k%2?[[RICE,11,3,2,1]]:[])]}),160]); s.push([mage({r:'hi',eyes:'wink',card:[18,-2,false]}),800]); return s;})() },
  { name: 'ゆびの上のカード', desc: 'くるくる', seq: (() => { const s=[]; for(let k=0;k<8;k++)s.push([mage({r:'hi',eyes:k%4===0?'grin':'open',dy:k%2?0:0,extra:k%2?[[RICE,17,-5,3,4],[RED,18,-4,1,2]]:[[RICE,16,-3,5,1],[RED,18,-3,1,1]]}),200]); s.push([mage({r:'hi',eyes:'wink',extra:[[RICE,17,-5,3,4],[RED,18,-4,1,2],...spark(22,-9)]}),700]); return s;})() }
].map(m => { m.grid = 'grid-orig'; return m; });

// ── 10. なかまのキャラクター ──
const sc=(rects,k,ox,oy)=>rects.map(([c,x,y,w,h])=>[c,ox+x*k,oy+y*k,w*k,h*k]);
const rc=(rects,col)=>rects.map(r=>r[0]===O?[col,...r.slice(1)]:r);
const POST='#d8352f',POST_D='#a8261f',TAPE='#e9d8a6',CAT='#9a9aa6',CAT_D='#76768a',CHICK='#f5d33d',BEAK='#f08a3c';
const letterR=(x,y)=>[[RICE,x,y,4,3],[STEAM_C,x,y,4,1],[RED,x+3,y+1,1,1]];
const postbox=(o={})=>{ const t=o.sq?1:0,r=[[POST,6,t,12,14-t],[POST,7,t-1,10,1],[POST_D,6,12,12,2],[K,9,t+5,6,1],[RICE,10,8,4,1],[RICE,10,9,4,1],[RICE,11,10,2,2],[K,8,14,2,2],[K,14,14,2,2]]; if(o.eyes==='happy')r.push([K,8,t+2,3,1],[K,13,t+2,3,1]); else if(o.eyes==='closed')r.push([K,8,t+3,3,1],[K,13,t+3,3,1]); else r.push([K,9,t+1,2,2],[K,13,t+1,2,2]); return r.concat(o.extra||[]); };
const parcel=(o={})=>{ const dy=o.dy||0,l=o.lift||0,r=[[BOX,4,2+dy,16,11],[BOX_D,4,2+dy,16,1],[TAPE,11,2+dy,2,11],[RICE,5,9+dy,4,2],[RED,6,9+dy,1,1],[BOX_D,2,7+dy,2,2],[BOX_D,20,7+dy,2,2],[BOX_D,7,13+dy,2,l===1?1:3],[BOX_D,15,13+dy,2,l===2?1:3]]; if(o.eyes==='happy')r.push([K,7,6+dy,3,1],[K,14,6+dy,3,1]); else r.push([K,8,5+dy,2,2],[K,14,5+dy,2,2]); if(o.mouth)r.push([K,11,8+dy,2,1]); return r.concat(o.extra||[]); };
const bike=(k,dx)=>{ const s=k%2,r=[[K,0,11,6,5],[K,18,11,6,5],[IRON,2,13,2,1],[IRON,20,13,2,1],[IRON,s?3:2,s?12:13,1,s?3:1],[IRON,s?21:20,s?12:13,1,s?3:1],[POST,5,9,13,3],[POST,3,8,4,2],[K,8,7,7,2],[IRON,17,4,1,6],[IRON,16,4,3,1],[POST,0,3,6,5],[RICE,2,4,2,1],[RICE,2,5,2,1],[RICE,2,6,1,1],[GOLD,22,8,2,1]]; return r.map(([c,x,y,w,h])=>[c,x+dx,y,w,h]); };
const cat=(o={})=>{ const w=o.wag||0,r=[[CAT,5,0,14,8],[CAT,5,-2,3,2],[CAT,16,-2,3,2],[PINK,6,-1,1,1],[PINK,17,-1,1,1],[CAT,7,8,10,6],[CAT,8,14,2,2],[CAT,14,14,2,2],[CAT,17,8,2,5],[CAT,18+w,5,2,3],[CAT_D,9,8,1,6],[CAT_D,12,8,1,6],[PINK,11,5,2,1],[K,10,6,1,1],[K,13,6,1,1]]; if(o.eyes==='closed')r.push([K,7,3,3,1],[K,14,3,3,1]); else r.push([K,8,2,2,2],[K,14,2,2,2]); return r.concat(o.extra||[]); };
const chick=(o={})=>{ const dy=o.dy||0,f=o.flap?-2:0,r=[[CHICK,6,3+dy,12,10],[CHICK,8,0+dy,8,4],[CHICK,4,6+dy+f,2,4],[CHICK,18,6+dy+f,2,4],[BEAK,11,o.peck?6+dy:4+dy,2,2],[BEAK,8,13,2,3],[BEAK,14,13,2,3]]; r.push(o.eyes==='happy'?[K,8,2+dy,3,1]:[K,9,2+dy,2,2]); r.push(o.eyes==='happy'?[K,13,2+dy,3,1]:[K,13,2+dy,2,2]); return r.concat(o.extra||[]); };
const penguin=(o={})=>{ const dx=o.dx||0,f=o.flap?-2:0,r=[[K,6,0,12,14],[RICE,8,4,8,9],[RICE,8,2,3,2],[RICE,13,2,3,2],[K,9,2,2,2],[K,13,2,2,2],[GOLD,11,5,2,2],[K,3,5+f,3,6],[K,18,5+f,3,6],[GOLD,7,14,3,2],[GOLD,14,14,3,2]]; return r.map(([c,x,y,w,h])=>[c,x+dx,y,w,h]).concat(o.extra||[]); };
const onigiriKun=(o={})=>{ const dy=o.dy||0,r=[[RICE,10,0+dy,4,2],[RICE,8,2+dy,8,2],[RICE,6,4+dy,12,2],[RICE,4,6+dy,16,7],[NORI,7,9+dy,10,4],[PINK,6,8+dy,2,1],[PINK,16,8+dy,2,1],[RICE,1,o.arms?5+dy:8+dy,3,2],[RICE,20,o.arms?5+dy:8+dy,3,2],[K,8,13,2,3],[K,14,13,2,3]]; r.push(...(o.eyes==='happy'?[[K,7,6+dy,3,1],[K,14,6+dy,3,1]]:[[K,8,5+dy,2,2],[K,14,5+dy,2,2]])); return r.concat(o.extra||[]); };
const eggKun=(o={})=>{ const t=o.tilt||0,r=[[RICE,7+t,0,10,2],[RICE,5+t,2,14,10],[RICE,7,12,10,2],[STEAM_C,15+t,3,2,6],[K,8,14,2,2],[K,14,14,2,2]]; r.push(...(o.eyes==='closed'?[[K,8+t,6,3,1],[K,13+t,6,3,1]]:[[K,9+t,5,2,2],[K,13+t,5,2,2]])); if(o.crack)r.push([K,6+t,4,2,1],[K,8+t,3,2,1],[K,10+t,4,2,1],[K,12+t,3,2,1],[K,14+t,4,2,1],[K,16+t,3,2,1]); if(o.peek)r.push([CHICK,9,-3,6,4],[K,10,-2,1,1],[K,13,-2,1,1],[BEAK,11,-1,2,1]); return r.concat(o.extra||[]); };
const FRIENDS = [
  { name: '色ちがいの兄弟', desc: '青・オレンジ・みどり', seq: rep(9,220,k=>{const j=k%3;return[...sc(rc(fig({dy:j===0?-3:0,eyes:j===0?'happy':'open'}),'#5a8fd0'),.55,-6,3),...sc(fig({dy:j===1?-3:0,eyes:j===1?'happy':'open'}),.55,6,3),...sc(rc(fig({dy:j===2?-3:0,eyes:j===2?'happy':'open'}),'#5aa35a'),.55,18,3)];}) },
  { name: '親子', desc: 'てくてく', seq: rep(10,230,k=>[...fig({dx:-6,lift:k%2?[0,2]:[1,3],eyes:k%4===3?'happy':'open'}),...sc(fig({lift:k%2?[1,3]:[0,2],dy:k%2?-2:0,eyes:'happy'}),.45,20,8)]) },
  { name: 'ゆうびんポスト', desc: 'パクッ！', seq: [[postbox(),500],...[28,23,18].map(x=>[postbox({extra:letterR(x,4)}),160]),[postbox({extra:letterR(12,4)}),120],[postbox({sq:1,eyes:'closed'}),250],[postbox({eyes:'closed'}),200],[postbox({sq:1,eyes:'closed'}),250],[postbox({eyes:'happy',extra:heart(18,-6)}),800]] },
  { name: '小包', desc: 'ダンボールがおさんぽ', seq: rep(10,220,k=>parcel({dy:k%2?0:-1,lift:k%2?1:2,eyes:k>6?'happy':'open',mouth:k>6,extra:k>6?spark(22,-3):[]})) },
  { name: '配達バイク', desc: 'ブーン！', seq: [...rep(6,140,k=>[...bike(k,-30+k*5),[STEAM_C,-36+k*5,12,3,1]]),...rep(4,180,k=>[...bike(k,0),...(k%2?[[STEAM_C,-4,12,3,1],[STEAM_C,-7,11,2,1]]:[])]),[[...bike(0,0),...spark(26,-2)],600]] },
  { name: 'ねこ', desc: 'しっぽふりふり', seq: rep(10,230,k=>cat({wag:[0,1,2,1,0,-1,-2,-1,0,0][k],eyes:k===4||k===8?'closed':'open',extra:k>5?note(22,-6-(k%2)):[]})) },
  { name: 'ひよこ', desc: 'ぴよぴよ', seq: rep(10,200,k=>chick({dy:k%4===0?-2:0,flap:k%2,peck:k===6||k===7,eyes:k>7?'happy':'open',extra:k===7?[[GOLD,12,13,1,1]]:[]})) },
  { name: 'ペンギン', desc: 'よちよち', seq: rep(10,220,k=>penguin({dx:[-2,-1,0,1,2,2,1,0,-1,-2][k],flap:k>6&&k%2})) },
  { name: 'おにぎりくん', desc: 'ぴょんぴょん', seq: rep(8,230,k=>onigiriKun({dy:k%2?0:-2,arms:k%2===0,eyes:k%4===0?'happy':'open',extra:k%4===0?spark(22,-4):[]})) },
  { name: 'たまごくん', desc: 'パリッ！', seq: [...rep(6,200,k=>eggKun({tilt:[0,1,0,-1,0,1][k],eyes:k===3?'closed':'open'})),[eggKun({crack:true}),400],[eggKun({crack:true,peek:true}),900],[eggKun({crack:true,peek:true,extra:heart(18,-7)}),700],[eggKun({}),300]] },
  { name: 'まほうの花', desc: 'カードが花に', seq: [[mage({r:'up',card:[19,3,true]}),500],[mage({r:'up',eyes:'grin',card:[19,3,true]}),400],[mage({r:'up',eyes:'closed',extra:[[STEAM_C,18,1,5,3],[STEAM_C,17,3,2,2],[STEAM_C,22,4,2,2]]}),250],[mage({r:'up',eyes:'wink',extra:[[LEAF,20,2,1,5],[PINK,18,-1,5,3],[GOLD,20,0,1,1],...spark(24,-5)]}),900]] },
  { name: 'オレンジとマジシャン', desc: 'オレンジがキャッチ', seq: (() => { const mg=o=>sc(mage(o),.6,13,4),cc=o=>sc(fig(o),.55,-3,7); return [[[...cc({}),...mg({card:[19,3,true],r:'up'})],500],[[...cc({}),...mg({r:'hi',eyes:'grin',card:[18,-2,true]})],250],...[22,16,10].map(x=>[[...cc({eyes:'big'}),...mg({r:'up'}),[RICE,x,4,2,1]],120]),[[...cc({l:'hi',r:'hi',eyes:'happy',extra:[[RICE,1,-6,3,4],[RED,2,-5,1,2]]}),...mg({eyes:'wink'})],500],[[...cc({l:'hi',r:'hi',eyes:'happy',cheek:true,extra:[[RICE,1,-6,3,4],[RED,2,-5,1,2]]}),...mg({eyes:'grin'}),...heart(10,-8)],800]]; })() }
].map(m => { m.grid = 'grid-friends'; return m; });

// ── 11. ブロックの世界ふう ──
const GRASS='#5fae4a',GRASS_D='#4a8f3a',DIRT='#8b5e3c',DIRT_D='#6e4a2e',STONE='#8d8d8d',STONE_D='#6f6f6f',LOGB='#7a5532',LOGR='#c9a06a',SAND='#e3d29a',SAND_D='#cdb97e',BRICK='#b5523b',MORTAR='#d9cbb8',WOOL='#eeeeee',PIGC='#f2a7b5',PIG_D='#d9808f';
const eyes2=t=>[[K,6,t+2,2,2],[K,16,t+2,2,2]];
const body=(t,base,dots=[])=>[[base,4,t,16,12],...dots.map(([c,x,y,w=2,h=2])=>[c,x,t+y,w,h]),...eyes2(t)];
const pick=(x,y)=>[[STICK,x,y,1,7],[STONE,x-3,y,7,1],[STONE,x-3,y+1,1,1],[STONE,x+3,y+1,1,1]];
const sword=(x,y)=>[[GEM,x,y,1,6],[RICE,x,y,1,1],[STICK,x-1,y+6,3,1],[STICK,x,y+7,1,2]];
const BLOCKS = [
  dress('草ブロック', 'みどりの草', t=>body(t,DIRT,[[GRASS,4,0,16,3],[GRASS,5,3,2,1],[GRASS,10,3,1,2],[GRASS,15,3,2,1],[DIRT_D,7,7],[DIRT_D,13,9],[DIRT_D,17,6]]),{arms:'both'}),
  dress('土ブロック', 'ほっこり土', t=>body(t,DIRT,[[DIRT_D,6,6],[DIRT_D,12,4],[DIRT_D,16,8],[DIRT_D,9,10],[DIRT_D,14,1]])),
  dress('石ブロック', 'かたい石', t=>body(t,STONE,[[STONE_D,6,6,3,1],[STONE_D,12,1,3,1],[STONE_D,15,8,3,1],[STONE_D,8,10,2,1],[RICE,10,5,1,1]]),{stomp:true,bob:false}),
  dress('木の丸太', '年輪', t=>[...body(t,LOGB,[[LOGR,4,0,16,2],[LOGB,6,1,12,1],[DIRT_D,7,4,1,7],[DIRT_D,12,5,1,6],[DIRT_D,17,3,1,8]])],{arms:'both'}),
  dress('葉っぱ', 'わさわさ', (t,k)=>body(t,GRASS_D,[[GRASS,5,1],[GRASS,10,3],[GRASS,15,1],[GRASS,7,7],[GRASS,13,8],[GRASS,17,5],...(k%2?[[LEAF,-2,6+k%3,2,1],[LEAF,25,3,2,1]]:[])])),
  dress('砂ブロック', 'さらさら', (t,k)=>body(t,SAND,[[SAND_D,6,4,1,1],[SAND_D,11,7,1,1],[SAND_D,16,3,1,1],[SAND_D,8,10,1,1],[SAND_D,14,10,1,1],...(k%2?[[SAND,6,13,1,1],[SAND,16,14,1,1]]:[])])),
  dress('レンガ', 'がっしり', t=>body(t,BRICK,[[MORTAR,4,3,16,1],[MORTAR,4,7,16,1],[MORTAR,4,11,16,1],[MORTAR,10,0,1,3],[MORTAR,7,4,1,3],[MORTAR,15,4,1,3],[MORTAR,11,8,1,3]]),{stomp:true}),
  dress('ガラス', 'すきとおる', t=>[[GLASS,4,t,16,1],[GLASS,4,t+11,16,1],[GLASS,4,t,1,12],[GLASS,19,t,1,12],[RICE,7,t+3,1,3],[RICE,8,t+2,1,1],[RICE,15,t+7,2,1],...eyes2(t)],{arms:'both'}),
  dress('宝石の鉱石', '水色の宝石', (t,k)=>body(t,STONE,[[GEM,6,5],[GEM,13,2],[GEM,15,8],[GEM,9,9],...(k%2?[[RICE,13,2,1,1],[RICE,6,5,1,1]]:[])]).concat(k%2?spark(24,-4):[])),
  dress('金の鉱石', 'ピカピカ', (t,k)=>body(t,STONE,[[GOLD,7,5],[GOLD,14,3],[GOLD,11,9],[GOLD,16,8]]).concat(k%2?spark(-3,-3):[])),
  { name: 'つるはしでほる', desc: 'カンカン！', seq: (() => { const s=[]; for(let k=0;k<6;k++)s.push([fig({r:k%2?'up':'hi',eyes:'angry',extra:[...(k%2?pick(25,2):pick(22,-6)),[STONE,25,9,6,6],...(k>1?[[STONE_D,27,10,1,3],[STONE_D,28,12,2,1]]:[]),...(k>3?[[K,26,11,3,1],[K,29,13,1,2]]:[])]}),200]); s.push([fig({eyes:'happy',l:'hi',r:'hi',extra:[[GEM,10,-8,3,3],[RICE,10,-8,1,1],...spark(6,-10),...spark(15,-11)]}),900]); return s;})() },
  { name: '剣をかまえる', desc: 'えいっ！', seq: [[fig(),400],[fig({r:'up',extra:sword(22,0)}),300],[fig({r:'hi',eyes:'angry',extra:sword(21,-9)}),300],[fig({r:'up',eyes:'angry',dx:1,extra:[...sword(25,2),[RICE,27,0,1,6],[RICE,28,2,1,4]]}),200],[fig({r:'up',eyes:'happy',extra:[...sword(22,0),...spark(26,-6)]}),800]] },
  dress('かまど', 'ぽかぽか', (t,k)=>body(t,STONE,[[K,8,6,8,5],[k%2?RED:'#f39c34',9,8,6,3],[GOLD,11,9,2,2],[STONE_D,4,4,16,1]]).concat([[STEAM_C,10,t-3-(k%3),2,1],[STEAM_C,13,t-5+(k%2),2,1]]),{arms:'none'}),
  dress('作業台', 'ものづくり', (t,k)=>body(t,LOGR,[[LOGB,4,0,16,1],[LOGB,9,0,1,3],[LOGB,14,0,1,3],[LOGB,4,3,16,1],[IRON,6,6,3,3],[LOGB,14,6,3,4],...(k%2?[[STEAM_C,20,t-1,2,1]]:[])]),{arms:'both'}),
  { name: 'たからばこ', desc: '宝石ゲット', seq: (() => { const box=lid=>[[LOGB,4,4,16,10],[DIRT_D,4,8,16,1],[LOGB,4,2-lid,16,3],[DIRT_D,4,4-lid,16,1],[GOLD,11,6-(lid?0:0),2,3],[K,6,1-lid,2,2],[K,16,1-lid,2,2]]; return [[fig(),300],[fig({eyes:'closed',extra:poof}),250],[box(0),500],[box(0).map(([c,x,y,w,h])=>[c,x+1,y,w,h]),120],[box(0),120],[box(4),300],[[...box(4),[GEM,8,-4,3,3],[GOLD,13,-6,3,3],...spark(4,-9),...spark(18,-10)],900]]; })() },
  dress('ベッド', 'ねむねむ', (t,k)=>[[RED,-2,t+6,28,6],[RICE,-2,t+4,7,4],[LOGB,-3,t+4,1,10],[LOGB,26,t+7,1,7],[K,0,t+5,2,1],...zee(22,-2-(k%3)*2,ZZ())],{arms:'none',eyes:'closed',nolegs:true,nocheek:true}),
  dress('ケーキ', 'いちご', t=>body(t,SPONGE,[[RICE,4,0,16,3],[RICE,6,3,2,1],[RICE,12,3,1,2],[RICE,17,3,2,1],[BERRY,6,-2,2,2],[BERRY,11,-2,2,2],[BERRY,16,-2,2,2],['#d9b77a',4,8,16,1]]),{arms:'both'}),
  dress('ブタ', 'ピンクのブタ', (t,k)=>body(t,PIGC,[[PIG_D,9,5,6,4],[K,10,6,1,2],[K,13,6,1,2],[PIG_D,4,0,3,2],[PIG_D,17,0,3,2]]).concat(k%2?note(23,-6):[]),{stomp:true}),
  dress('ヒツジ', 'もこもこ', (t,k)=>[...body(t,WOOL,[[STEAM_C,6,6],[STEAM_C,13,9],[STEAM_C,16,3],[RICE,9,3,1,1]]),[STONE_D,8,t+1,8,6],[K,9,t+3,2,1],[K,13,t+3,2,1],[PIGC,11,t+5,2,1]],{arms:'none',step:true}),
  dress('ニワトリ', '赤いトサカ', (t,k)=>[...body(t,WOOL,[[RED,9,-2,6,2],[GOLD,10,4,4,2],[RED,11,6,2,2]]),...(k%2?[[WOOL,-1,t+4,5,3],[WOOL,20,t+4,5,3]]:[[WOOL,0,t+6,4,3],[WOOL,20,t+6,4,3]])],{arms:'none'})
].map(m => { m.grid = 'grid-block'; return m; });

// ── 12. ブロックの世界のなかまたち ──
const ZSKIN='#5f9e5a',ZSHIRT='#3e7fb5',ZPANTS='#3d3a8c',BONE='#d9d9d2',BONE_D='#a9a9a2',SPIDER='#3a3333',SLIME='#7cd35f',SLIME_L='#a8e88f',GOLEM='#9a9a90',MOSS='#6a9a4a',BEE='#f2c14e',WOLF='#d9d4cc',HORSE='#9a6a3c',SQUID='#2f4a7a',SHELL='#4f8a3a',FOX='#e07a35',BAT='#4a3a32',DRAGON='#6b4aa8',FISH='#e0a04a',PARROT='#d8433f',ROBE='#4a6fb5';
const mob=(n,ms,f)=>rep(n,ms,f);
const MOBS = [
  { name: 'ゾンビ', desc: 'のっしのっし', seq: mob(8,260,k=>[[ZSKIN,7,0,10,7],[K,9,3,2,1],[K,13,3,2,1],[K,10,5,4,1],[ZSHIRT,7,7,10,5],[ZSKIN,17,7-(k%2),7,3],[ZSKIN,0,8-((k+1)%2),7,3],[ZPANTS,8,12,3,k%2?3:4],[ZPANTS,13,12,3,k%2?4:3]].map(([c,x,y,w,h])=>[c,x+(k%4<2?0:1),y,w,h])) },
  { name: 'ガイコツ', desc: 'ゆみをかまえる', seq: mob(8,240,k=>[[BONE,8,0,8,7],[K,9,2,2,2],[K,13,2,2,2],[K,10,5,4,1],[BONE,11,7,2,6],[BONE,8,8,8,1],[BONE,8,10,8,1],[BONE,5,8,3,1],[BONE,16,8,3+(k%2),1],[BONE,9,13,1,3],[BONE,14,13,1,3],[STICK,20,4,1,9],[STICK,21,3,1,1],[STICK,21,13,1,1],[STEAM_C,20-(k%2)*2,8,1,1]]) },
  { name: 'クモ', desc: 'カサカサ', seq: mob(8,160,k=>{const u=k%2;return[[SPIDER,6,5,12,7],[SPIDER,8,3,8,3],[RED,9,6,2,1],[RED,13,6,2,1],[RED,10,8,1,1],[RED,13,8,1,1],...[0,1,2,3].flatMap(i=>[[SPIDER,1,6+i*2+(u?(i%2):-(i%2)),5,1],[SPIDER,18,6+i*2+(u?-(i%2):(i%2)),5,1]])].map(([c,x,y,w,h])=>[c,x+(k%4-1.5),y,w,h]);}) },
  { name: 'スライム', desc: 'ぽよーん', seq: mob(8,200,k=>{const h=[10,9,6,11,12,11,10,10][k],w=[16,17,20,14,13,14,16,16][k],y=16-h-[0,0,0,3,6,3,0,0][k];return[[SLIME,12-w/2,y,w,h],[SLIME_L,12-w/2+2,y+2,w-4,h-4],[K,12-w/2+3,y+2,2,2],[K,12+w/2-5,y+2,2,2],[K,11,y+h-4,2,1]];}) },
  { name: '石のゴーレム', desc: 'やさしい大男', seq: mob(8,280,k=>[[GOLEM,7,-2,10,7],[K,9,1,2,1],[K,13,1,2,1],[STONE_D,11,2,2,3],[GOLEM,4,5,16,7],[MOSS,6,6,3,2],[MOSS,15,9,2,2],[GOLEM,1,6,3,k%2?9:8],[GOLEM,20,6,3,k%2?8:9],[GOLEM,7,12,4,4],[GOLEM,13,12,4,4],...(k>5?[[PINK,1,2,3,2],[LEAF,2,4,1,2]]:[])]) },
  { name: 'ミツバチ', desc: 'ブーン', seq: mob(8,160,k=>{const y=[0,-2,-3,-2,0,1,0,-1][k];return[[BEE,5,4+y,14,8],[K,9,4+y,2,8],[K,14,4+y,2,8],[K,6,6+y,2,2],[RICE,7+(k%2),k%2?-1+y:1+y,6,3],[STEAM_C,7+(k%2),k%2?-1+y:1+y,2,1],[K,19,8+y,2,1],[PINK,22,12,3,2],[LEAF,23,14,1,2]];}) },
  { name: 'オオカミ', desc: 'ワン！', seq: mob(8,220,k=>[[WOLF,12,2,9,6],[WOLF,12,0,2,2],[WOLF,18,0,2,2],[K,14,4,1,1],[K,18,4,1,1],[K,20,5,2,1],[WOLF,3,6,14,6],[RED,12,8,6,1],[WOLF,4,12,2,4],[WOLF,8,12,2,k%2?3:4],[WOLF,12,12,2,4],[WOLF,15,12,2,k%2?4:3],[WOLF,0,k%2?4:6,4,2],...(k>4?bang(22,-6):[])]) },
  { name: 'ウシ', desc: 'モ〜', seq: mob(8,260,k=>[[RICE,3,4,15,8],[K,5,5,4,3],[K,12,8,4,3],[K,13,4,2,2],[RICE,16,2,7,7],[K,18,4,1,1],[K,21,4,1,1],[PINK,17,7+(k%2),6,2],[STEAM_C,16,1,1,2],[STEAM_C,22,1,1,2],[RICE,4,12,2,4],[RICE,8,12,2,4],[RICE,11,12,2,4],[RICE,15,12,2,4],...(k>5?note(25,-6):[])]) },
  { name: 'ウマ', desc: 'パカパカ', seq: mob(8,160,k=>{const u=k%2;return[[HORSE,3,4,14,7],[HORSE,15,0,4,8],[HORSE,17,-1,6,4],[K,20,0,1,1],[K,14,-1,2,6],[K,1,4,2,6-u],[HORSE,4,11,2,u?3:5],[HORSE,7,11,2,u?5:3],[HORSE,12,11,2,u?3:5],[HORSE,15,11,2,u?5:3],[K,4,u?14:16,2,1],[K,15,u?16:14,2,1]].map(([c,x,y,w,h])=>[c,x,y-(u?1:0),w,h]);}) },
  { name: 'イカ', desc: 'すいすい', seq: mob(8,220,k=>{const y=[0,-2,-4,-5,-4,-2,0,1][k],sp=k%4<2;return[[SQUID,7,y,10,9],[K,8,3+y,2,2],[K,14,3+y,2,2],...[0,1,2,3].map(i=>[SQUID,7+i*3+(sp?(i-1.5):0),9+y,1,sp?6:4]),[WATER,2,6-y,1,1],[WATER,21,2-y,1,1]];}) },
  { name: 'カメ', desc: 'のそのそ', seq: mob(8,320,k=>[[SHELL,5,4,14,7],[GRASS,7,5,4,2],[GRASS,13,5,4,2],[GRASS,10,8,4,2],[LEAF,19,6+(k%2),4,4],[K,21,7+(k%2),1,1],[LEAF,5,11,3,k%2?2:3],[LEAF,16,11,3,k%2?3:2],[SAND,0,14,24,2]].map(([c,x,y,w,h])=>[c,x+Math.floor(k/2)*0.5-1,y,w,h])) },
  { name: 'キツネ', desc: 'ふさふさ', seq: mob(8,200,k=>{const dy=k%4===1?-3:0;return[[FOX,13,1,8,6],[FOX,13,-1,2,2],[FOX,19,-1,2,2],[RICE,16,5,5,2],[K,15,3,1,1],[K,19,3,1,1],[K,20,5,1,1],[FOX,4,6,12,6],[RICE,7,10,6,2],[FOX,0,4,5,4],[RICE,0,4,2,2],[K,5,12,2,4],[K,13,12,2,4]].map(([c,x,y,w,h])=>[c,x,y+dy,w,h]);}) },
  { name: 'パンダ', desc: 'ささをもぐもぐ', seq: mob(8,280,k=>[[RICE,6,0,12,8],[K,6,-1,3,2],[K,15,-1,3,2],[K,8,3,3,2],[K,13,3,3,2],[RICE,9,3,1,1],[RICE,14,3,1,1],[K,11,6,2,1],[RICE,5,8,14,6],[K,5,8,14,2],[K,3,9,3,4],[K,18,9,3,4],[K,6,14,4,2],[K,14,14,4,2],[LEAF,20,2+(k%2),1,8],[LEAF,21,2+(k%2),2,1],[LEAF,21,5+(k%2),2,1]]) },
  { name: 'コウモリ', desc: 'ひらひら', seq: mob(8,150,k=>{const y=[0,-2,-1,1][k%4],up=k%2;return[[BAT,9,4+y,6,6],[BAT,9,2+y,2,2],[BAT,13,2+y,2,2],[RED,10,6+y,1,1],[RED,13,6+y,1,1],...(up?[[BAT,1,1+y,8,3],[BAT,15,1+y,8,3],[BAT,0,0+y,2,2],[BAT,22,0+y,2,2]]:[[BAT,1,6+y,8,3],[BAT,15,6+y,8,3],[BAT,0,8+y,2,2],[BAT,22,8+y,2,2]])];}) },
  { name: 'ゆきだるま', desc: 'ゆきの玉をぽいっ', seq: mob(8,240,k=>[[RICE,8,0,8,6],[K,9,2,2,2],[K,13,2,2,2],[CARROT,11,4,4,1],[RICE,6,6,12,10],[K,11,8,2,2],[K,11,12,2,2],[STICK,3,7-(k%2)*2,3,1],[STICK,18,7,4,1],...(k>3?[[RICE,22+(k-4)*2,4-(k-4),2,2]]:[]),...flake(-3,-6+k*2)]) },
  { name: 'ドラゴン', desc: 'ガオー', seq: mob(8,240,k=>{const up=k%2;return[[DRAGON,5,5,12,6],[DRAGON,15,1,7,6],[K,19,3,1,1],[RED,22,4,2,1],[DRAGON,0,7,5,2],[DRAGON,-3,8,3,1],[DRAGON,7,11,2,3],[DRAGON,13,11,2,3],...(up?[[DRAGON,6,-4,8,6],[PURPLE,7,-3,6,4]]:[[DRAGON,6,2,10,3],[PURPLE,7,3,8,1]]),...(k>5?[[FIRE1,25,3,3,2],[FIRE2,28,3,2,2]]:[])];}) },
  { name: 'ふわふわオバケ', desc: 'ふわふわ', seq: mob(8,240,k=>{const y=[0,-1,-2,-3,-2,-1,0,1][k];return[[RICE,6,y,12,12],[RICE,6,12+y,3,2],[RICE,11,12+y,3,2],[RICE,15,12+y,3,2],[K,8,4+y,2,3],[K,14,4+y,2,3],[K,11,8+y,2,2],[STEAM_C,18,2+y,1,8]].concat(k>5?[[RICE,4,6+y,2,2],[RICE,18,6+y,2,2]]:[]);}) },
  { name: '旅の商人', desc: 'なにか売ってる', seq: mob(8,280,k=>[[ROBE,7,-3,10,3],[ROBE,5,0,14,1],[MG_SKIN,8,1,8,6],[K,9,3,2,1],[K,13,3,2,1],[K,11,5,2,1],[ROBE,6,7,12,9],[GOLD,6,10,12,1],[MG_SKIN,4+(k%2),9,2,2],[BOX,0,10,5,4],[GEM,1,9,2,2],[GOLD,3,9,1,1],...(k>4?spark(2,4):[])]) },
  { name: 'さかな', desc: 'ぴちぴち', seq: mob(8,180,k=>{const y=[8,4,1,0,1,4,8,10][k];return[[FISH,6,y,10,5],[FISH,16,y+1,3,3],[FISH,19,y,2,5],[K,8,y+1,1,1],[RICE,10,y+2,4,1],[WATER,2,14,20,2],...(k===6||k===7?[[WATER,7,12,1,1],[WATER,16,11,1,1]]:[])];}) },
  { name: 'オウム', desc: 'おしゃべり', seq: mob(8,220,k=>[[PARROT,8,0,8,8],[GOLD,14,3,4,3],[K,10,2,2,2],[PARROT,6,8,10,6],[SPRINK,4,8+(k%2?-2:0),3,6],[SPRINK,16,8+(k%2?-2:0),3,6],[GOLD,9,14,2,2],[GOLD,13,14,2,2],[STICK,2,16,20,1],...(k%4<2?note(20,-6-(k%2)*2):[])].map(([c,x,y,w,h])=>[c,x,y-(k%4===0?1:0),w,h])) }
].map(m => {
  const a=m.seq[0][0], z=m.seq[m.seq.length-1][0];
  m.seq = [[fig(),500],[fig({eyes:'closed',extra:poof}),250],[[...a,...poof.slice(0,3)],200],...m.seq,...m.seq,[[...z,...poof],250]];
  m.grid = 'grid-mobs'; return m;
});

// ── 初期化・ループ処理 ──
// ── 13. マインクラフト風 20選（41〜60）：別のファイルから。描き方がちがうので、この中だけで使う ──
const MC2 = (() => {
// --- 基本カラーと描画エンジン ---
const O = '#d97757', K = '#1a1612', PINK = '#e8687d', CHEEK = '#f2a0a8', GOLD = '#f2c14e', WHITE = '#f7f2ee', RED = '#e8452f';
const MC_CART = '#7a7a7a', MC_RAIL = '#404040', MC_ELYTRA = '#a0a5b0', MC_BOW = '#6e4a2e', MC_SHIELD = '#505050', MC_PEARL = '#2fa88e', MC_PORTAL = '#b43cb4aa', MC_OBSIDIAN = '#2a104a', MC_TORCH = '#f5d76e';
const CREEPER = '#5fae4a', ENDERMAN = '#1a1612', VILLAGER = '#e3b286', AXOLOTL = '#f2b6c1', BLAZE = '#f5c542', WARDEN = '#1b2632', WARDEN_L = '#2fa88e', FROG = '#d9a066', ALLAY = '#7cc3ea', WITHER = '#2a2a2a', PIGLIN = '#f0b49c';
const MC_WOOD = '#8b5a2b', MC_POTION = '#d93b65', MC_ARROW = '#e0e0e0', MC_WATER = '#9fd3f0', MC_GOLD = '#f5d76e';

const spark = (x, y) => [[GOLD,x+1,y,1,3],[GOLD,x,y+1,3,1]];
const torchDark = c => [[c,2,-4,20,3],[c,-1,-1,26,15],[c,2,14,20,3]]; // 50番の暗闇（キャラのまわりだけ）
const bang = (x, y) => [[O,x,y,1,3],[O,x,y+4,1,1]];
const poof = [[MC_WATER,-2,4,4,3],[MC_WATER,22,3,4,3],[MC_WATER,8,-4,5,3],[MC_WATER,3,12,4,3],[MC_WATER,17,12,4,3],[MC_WATER,10,14,4,2]];

// いつものオレンジキャラを描画
function fig(o = {}) {
  const dx = o.dx || 0, dy = o.dy || 0, sq = o.squash || 0, top = dy + sq, r = [];
  const R = (c, x, y, w, h) => r.push([c, x + dx, y, w, h]);
  R(O, 4, top, 16, 12 - sq);
  const arm = (side, pose) => {
    if (pose === 'hi') R(O, side, top - 3, 4, 7);
    else if (pose === 'up') R(O, side, top, 4, 4);
    else R(O, side, top + 4, 4, 4);
  };
  arm(0, o.l); arm(20, o.r);
  if (!o.nolegs) [4, 8, 14, 18].forEach(x => R(O, x, dy + 12, 2, 4));
  const ey = top + 2 + (sq ? 1 : 0), lk = o.look || 0;
  const eye = (x, kind) => {
    if (kind === 'closed') R(K, x + lk, ey + 1, 2, 1);
    else if (kind === 'happy') { R(K, x - 1, ey + 1, 1, 1); R(K, x, ey, 2, 1); R(K, x + 2, ey + 1, 1, 1); }
    else if (kind === 'big') R(K, x, ey - 1, 2, 3);
    else if (kind === 'dizzy') { [[-1,-1],[1,-1],[0,0],[-1,1],[1,1]].forEach(([a, b]) => R(K, x + 1 + a, ey + b + 1, 1, 1)); }
    else R(K, x + lk, ey, 2, 2);
  };
  const e = o.eyes || 'open';
  eye(6, e); eye(16, e);
  if (o.cheek) { R(CHEEK, 5, ey + 3, 2, 1); R(CHEEK, 17, ey + 3, 2, 1); }
  if (o.mouth === 'open') R(K, 11, ey + 4, 2, 2);
  (o.extra || []).forEach(q => r.push(q));
  return r;
}

// --- マイクラ風パーツ・モブの描画 ---
const cart = x => [[MC_CART,x-2,8,20,6],[MC_CART,x,14,16,2],[MC_RAIL,-20,16,60,2],[MC_WOOD,-20,17,60,1]];
const elytra = [[MC_ELYTRA,4,0,16,4],[MC_ELYTRA,2,-2,4,8],[MC_ELYTRA,18,-2,4,8]];
const bow_draw = [[MC_BOW,20,2,2,10],[WHITE,19,2,1,10],[MC_ARROW,14,6,6,1]];
const bow_shoot = x => [[MC_BOW,20,2,2,10],[WHITE,21,2,1,10],[MC_ARROW,22+x,6,6,1]];
const shield = [[MC_SHIELD,14,0,4,12],[MC_WOOD,15,1,2,10]];
const potion = [[WHITE,12,4,2,2],[MC_POTION,11,6,4,4]];
const portal = [[MC_OBSIDIAN,-2,-4,20,2],[MC_OBSIDIAN,-2,-2,4,16],[MC_OBSIDIAN,14,-2,4,16],[MC_OBSIDIAN,-2,14,20,2],[MC_PORTAL,2,-2,12,16]];

const creeper = (x, c) => [[c,x,0,16,12],[K,x+4,4,2,2],[K,x+10,4,2,2],[K,x+6,6,4,4],[K,x+4,8,2,2],[K,x+10,8,2,2],[c,x,12,4,4],[c,x+12,12,4,4]];
const enderman = x => [[ENDERMAN,x+6,-8,12,18],[ENDERMAN,x+4,-8,2,16],[ENDERMAN,x+18,-8,2,16],[ENDERMAN,x+6,10,2,8],[ENDERMAN,x+16,10,2,8],[MC_PORTAL,x+8,-4,3,1],[MC_PORTAL,x+13,-4,3,1]];
const villager = x => [[VILLAGER,x+6,0,12,12],[K,x+8,4,2,2],[K,x+14,4,2,2],[VILLAGER,x+10,6,4,5],[MC_BOW,x+4,12,16,6],[MC_BOW,x+2,6,4,8],[MC_BOW,x+18,6,4,8],[MC_WOOD,x+4,10,16,4]];
const axolotl = x => [[AXOLOTL,x+2,8,20,6],[MC_POTION,x+0,6,2,4],[MC_POTION,x+22,6,2,4],[K,x+6,10,2,2],[K,x+16,10,2,2],[MC_POTION,x+20,10,4,2]];
const blaze = (x, k) => [[BLAZE,x+8,-2,8,8],[K,x+10,2,4,2],[BLAZE,x+4,6+(k%2)*2,2,8],[BLAZE,x+18,6-(k%2)*2,2,8],[BLAZE,x+8,10-(k%2)*2,2,8],[BLAZE,x+14,10+(k%2)*2,2,8]];
const warden = x => [[WARDEN,x+2,-4,20,16],[WARDEN_L,x+10,4,4,4],[WARDEN,x+0,12,6,6],[WARDEN,x+18,12,6,6],[WARDEN_L,x+-2,-8,4,6],[WARDEN_L,x+22,-8,4,6],[K,x+8,-2,8,6]];
const frog = (x, y) => [[FROG,x+4,y+8,16,8],[WHITE,x+6,y+14,12,2],[K,x+4,y+4,4,4],[K,x+16,y+4,4,4],[MC_GOLD,x+5,y+5,2,2],[MC_GOLD,x+17,y+5,2,2]];
const allay = (x, y) => [[ALLAY,x+8,y+2,8,10],[WHITE,x+6,y+4,4,6],[WHITE,x+14,y+4,4,6],[K,x+10,y+5,1,2],[K,x+13,y+5,1,2],[ALLAY,x+6,y+12,2,2],[ALLAY,x+16,y+12,2,2]];
const wither = x => [[WITHER,x+8,0,8,8],[WITHER,x+2,2,6,6],[WITHER,x+16,2,6,6],[WITHER,x+10,8,4,8],[K,x+10,2,4,1],[K,x+4,4,2,1],[K,x+18,4,2,1]];
const piglin = (x, arms) => [[PIGLIN,x+6,0,12,8],[MC_BOW,x+6,8,12,8],[PIGLIN,x+10,6,4,3],[K,x+8,3,2,1],[K,x+14,3,2,1],[WHITE,x+8,4,2,1],[WHITE,x+14,4,2,1],[MC_BOW,x+2,6,4,6],[MC_BOW,x+18,6,4,6], ...(arms?[[PIGLIN,x+2,12,4,2],[PIGLIN,x+18,12,4,2]]:[])];


// --- アニメーションデータ 20選 ---
const MC_MOVES = [
  // プレイヤーアクション（1〜10）
  { grid: 'grid-actions', name: 'トロッコに乗る', desc: 'レールの上をシャシャーッと進む', seq: [
    [fig({nolegs:true, dy:2, dx:-10, extra: cart(-10)}), 150], [fig({nolegs:true, dy:2, dx:-5, extra: cart(-5)}), 150],
    [fig({nolegs:true, dy:2, dx:0, extra: cart(0)}), 150], [fig({nolegs:true, dy:2, dx:5, extra: cart(5)}), 150],
    [fig({nolegs:true, dy:2, dx:10, extra: cart(10)}), 150], [fig({nolegs:true, dy:2, dx:15, extra: cart(15)}), 150]
  ]},
  { grid: 'grid-actions', name: 'エリトラで滑空', desc: '羽を広げて空をすーっと飛ぶ', seq: [
    [fig({squash:1, dy:-2, extra: elytra}), 200], [fig({squash:1, dy:-4, extra: elytra}), 200],
    [fig({squash:1, dy:-6, extra: elytra}), 200], [fig({squash:1, dy:-4, extra: elytra}), 200]
  ]},
  { grid: 'grid-actions', name: '弓矢でねらう', desc: '弓をギリギリと引いて、シュッ！', seq: [
    [fig({r:'up', extra: bow_draw}), 400], [fig({r:'hi', eyes:'angry', extra: bow_draw}), 400],
    [fig({r:'hi', eyes:'happy', extra: bow_shoot(4)}), 100], [fig({r:'hi', eyes:'happy', extra: bow_shoot(12)}), 100],
    [fig({r:'up', eyes:'happy', extra: bow_shoot(20)}), 400]
  ]},
  { grid: 'grid-actions', name: '盾でガード', desc: '矢が飛んできても盾でカンッ！', seq: [
    [fig({r:'up', extra: shield}), 300],
    [fig({r:'up', eyes:'closed', extra: [...shield, [MC_ARROW, 24, 4, 6, 1]]}), 150],
    [fig({r:'up', eyes:'closed', squash:1, dx:-1, extra: [...shield, ...spark(18, 2)]}), 150],
    [fig({r:'up', eyes:'happy', extra: [...shield, [MC_ARROW, 14, 12, 6, 1]]}), 500]
  ]},
  { grid: 'grid-actions', name: 'ポーションを飲む', desc: 'ゴクゴク飲んでパワーアップ', seq: [
    [fig({r:'up', extra: potion}), 400],
    [fig({r:'hi', mouth:'open', l:'up', extra: potion}), 300],
    [fig({eyes:'happy', cheek:true, extra: [[MC_POTION, 0, 0, 2, 2], [MC_POTION, 20, 2, 2, 2], [MC_POTION, 10, -6, 2, 2]]}), 200],
    [fig({eyes:'happy', cheek:true, extra: [[MC_POTION, -2, -4, 2, 2], [MC_POTION, 22, -2, 2, 2], [MC_POTION, 8, -10, 2, 2]]}), 600]
  ]},
  { grid: 'grid-actions', name: 'エンダーパール', desc: '投げて、落ちた場所へワープ！', seq: [
    [fig({r:'hi', extra: [[MC_PEARL, 16, -2, 3, 3]]}), 300],
    [fig({r:'up', extra: [[MC_PEARL, 24, -4, 3, 3]]}), 150], [fig({r:'up', extra: [[MC_PEARL, 32, -2, 3, 3]]}), 150],
    [fig({extra: poof}), 200], [fig({dx: 8, extra: poof}), 200], [fig({dx: 8, eyes:'happy', cheek:true}), 600]
  ]},
  { grid: 'grid-actions', name: '釣り', desc: '浮きが沈んで…ピチピチ釣れた！', seq: [
    [fig({r:'hi', extra:[[MC_BOW,16,-6,2,14],[WHITE,17,-6,8,1],[WHITE,24,-6,1,16], [RED,24,10,2,2]]}), 600],
    [fig({r:'hi', eyes:'big', extra:[[MC_BOW,16,-6,2,14],[WHITE,17,-6,8,1],[WHITE,24,-6,1,18], [RED,24,12,2,2], ...spark(24, 12)]}), 200],
    [fig({r:'up', eyes:'happy', extra:[[MC_BOW,20,-2,2,10],[WHITE,21,-2,6,1],[WHITE,27,-2,1,10], [MC_WATER, 26, 6, 4, 3]]}), 600]
  ]},
  { grid: 'grid-actions', name: 'ネザーゲート', desc: '紫のうずまきに吸い込まれる', seq: [
    [fig({extra: portal}), 400], [fig({eyes:'closed', squash:1, extra: portal}), 400],
    [fig({eyes:'dizzy', extra: portal}), 400], [fig({eyes:'closed', extra: [...portal, ...poof]}), 400]
  ]},
  { grid: 'grid-actions', name: 'スニーク', desc: 'しゃがんでそーっと歩く', seq: [
    [fig({squash:1, dy:2, dx:0, look:1}), 300], [fig({squash:1, dy:2, dx:1, look:1}), 300],
    [fig({squash:1, dy:2, dx:2, look:1}), 300], [fig({squash:1, dy:2, dx:3, look:1}), 300]
  ]},
  { grid: 'grid-actions', name: '松明を置く', desc: '暗闇に松明を置いて明るくする', seq: [
    [fig({extra: [...torchDark('#000000dd'), [MC_WOOD, 16, 8, 2, 6], [MC_GOLD, 16, 6, 2, 2], [RED, 16, 5, 2, 1]]}), 400],
    [fig({r:'up', extra: [...torchDark('#000000aa'), [MC_WOOD, 16, 8, 2, 6], [MC_GOLD, 16, 6, 2, 2], [RED, 16, 5, 2, 1]]}), 200],
    [fig({eyes:'happy', cheek:true, extra: [...torchDark('#00000044'), [MC_WOOD, 16, 8, 2, 6], [MC_GOLD, 16, 6, 2, 2], [RED, 16, 5, 2, 1], ...spark(16, 0)]}), 800]
  ]},

  // モブに変身（11〜20）
  { grid: 'grid-mobs', name: 'クリーパー風', desc: 'シュー…ドカンと爆発！', seq: [
    [creeper(4, CREEPER), 300], [creeper(4, WHITE), 150], [creeper(4, CREEPER), 150],
    [creeper(4, WHITE), 100], [creeper(4, CREEPER), 100],
    [[...creeper(4, WHITE), ...bang(10, 4)], 100], [poof, 400]
  ]},
  { grid: 'grid-mobs', name: 'エンダーマン風', desc: 'ブロックを持ってワープ', seq: [
    [enderman(4), 400],
    [[...enderman(4), [CREEPER, 10, 4, 8, 8]], 400],
    [poof, 200],
    [[...enderman(-2), [CREEPER, 4, 4, 8, 8]], 400]
  ]},
  { grid: 'grid-mobs', name: '村人風', desc: '腕を組んで「フンッ」と首を振る', seq: [
    [villager(4), 400],
    [villager(4).map(([c,x,y,w,h]) => [c, x, y-1, w, h]), 200],
    [villager(4), 400],
    [villager(4).map(([c,x,y,w,h]) => [c, x, y-1, w, h]), 200]
  ]},
  { grid: 'grid-mobs', name: 'ウーパールーパー風', desc: 'ピンクの体で水の中をスイスイ', seq: [
    [[...axolotl(4), [MC_WATER, -4, 12, 32, 2]], 300],
    [[...axolotl(6).map(([c,x,y,w,h])=>[c,x,y-1,w,h]), [MC_WATER, -4, 12, 32, 2]], 300],
    [[...axolotl(8), [MC_WATER, -4, 12, 32, 2]], 300],
    [[...axolotl(10).map(([c,x,y,w,h])=>[c,x,y-1,w,h]), [MC_WATER, -4, 12, 32, 2]], 300]
  ]},
  { grid: 'grid-mobs', name: 'ブレイズ風', desc: '黄色のロッドがぐるぐる回る', seq: [
    [blaze(4, 0), 200], [blaze(4, 1), 200], [blaze(4, 2), 200],
    [blaze(4, 3), 200], [[...blaze(4, 4), [RED, 12, 4, 4, 4]], 400]
  ]},
  { grid: 'grid-mobs', name: 'ウォーデン風', desc: '暗闇からぬっと現れ、ソナーを出す', seq: [
    [warden(4).map(([c,x,y,w,h])=>[c,x,y+10,w,h]), 300],
    [warden(4).map(([c,x,y,w,h])=>[c,x,y+5,w,h]), 300],
    [warden(4), 600],
    [[...warden(4), [MC_WATER, 8, -6, 8, 2], [MC_WATER, 6, -10, 12, 2]], 400]
  ]},
  { grid: 'grid-mobs', name: 'カエル風', desc: 'ゲコッ、と鳴いて高くジャンプ', seq: [
    [frog(4, 0), 400], [frog(4, 2), 200],
    [frog(4, -8), 300], [frog(4, 0), 400]
  ]},
  { grid: 'grid-mobs', name: 'アレイ風', desc: 'アイテムを抱えて青くフワフワ', seq: [
    [[...allay(4, 0), [MC_GOLD, 10, 8, 4, 4]], 200], [[...allay(4, -2), [MC_GOLD, 10, 6, 4, 4]], 200],
    [[...allay(4, 0), [MC_GOLD, 10, 8, 4, 4]], 200], [[...allay(4, -2), [MC_GOLD, 10, 6, 4, 4]], 200]
  ]},
  { grid: 'grid-mobs', name: 'ウィザー風', desc: '3つの頭で不気味に浮かぶ', seq: [
    [wither(4), 300], [wither(4).map(([c,x,y,w,h])=>[c,x,y-2,w,h]), 300],
    [wither(4), 300], [wither(4).map(([c,x,y,w,h])=>[c,x,y-2,w,h]), 300]
  ]},
  { grid: 'grid-mobs', name: 'ピグリン風', desc: '金塊（インゴット）をじっと見つめる', seq: [
    [[...piglin(4, false), [MC_GOLD, 18, 8, 4, 2]], 400],
    [[...piglin(4, false), [MC_GOLD, 18, 8, 4, 2]], 400],
    [[...piglin(4, true)], 600]
  ]}
];

// 後半のモブは、オレンジキャラからの変身エフェクト（煙）で包む
for(let i=10; i<20; i++) {
  const a = MC_MOVES[i].seq[0][0];
  const z = MC_MOVES[i].seq[MC_MOVES[i].seq.length-1][0];
  MC_MOVES[i].seq = [
    [fig(), 400],
    [fig({eyes:'closed', extra:poof}), 200],
    [[...a, ...poof], 200],
    ...MC_MOVES[i].seq,
    [[...z, ...poof], 200],
    [fig({eyes:'happy', cheek:true}), 400]
  ];
}
return MC_MOVES.map(m => ({ ...m, grid: m.grid === 'grid-actions' ? 'grid-mc-actions' : 'grid-mc-mobs', vb: '-12 -18 48 40' }));
})();

// ── 14. マイクラ風 追加30選（61〜90）：別のファイルから。描き方がちがうので、この中だけで使う ──
const MC3 = (() => {
// --- カラーパレット ---
const O='#d97757', K='#1a1612', W='#f7f2ee', W2='#e0e0e0', RED='#e8452f', GOLD='#f2c14e', PINK='#e8687d', CHEEK='#f2a0a8';
const DIA='#4fd1d9', WOOD='#8b5a2b', LEAF='#5aa35a', STONE='#8d8d8d', STONE_D='#6f6f6f';
const WATER='#3f76e4', FIRE='#f39c34', TNT='#d84a4a', SLIME='#7cd35f', PURPLE='#9b6bd6', NAVY='#2c3e70';

// --- エフェクト ---
const poof = [[WATER,-2,4,4,3],[WATER,22,3,4,3],[WATER,8,-4,5,3],[WATER,3,12,4,3],[WATER,17,12,4,3],[WATER,10,14,4,2]];
const spark = (x,y) => [[GOLD,x+1,y,1,3],[GOLD,x,y+1,3,1]];
const heart = (x,y) => [[PINK,x,y,2,1],[PINK,x+3,y,2,1],[PINK,x,y+1,5,1],[PINK,x+1,y+2,3,1],[PINK,x+2,y+3,1,1]];

// --- キャラクター描画エンジン ---
function fig(o={}) {
  const dx=o.dx||0, dy=o.dy||0, sq=o.sq||0, r=[];
  const R=(c,x,y,w,h)=>r.push([c,x+dx,y+dy,w,h]);
  if(!o.hbg) R(O,4,sq,16,12-sq); // hide body flag
  const lk=o.lk||0;
  const eye=(x,k)=>{
    if(k==='c') R(K,x+lk,sq+3,2,1); // closed
    else if(k==='h'){ R(K,x-1,sq+3,1,1); R(K,x,sq+2,2,1); R(K,x+2,sq+3,1,1); } // happy
    else if(k==='b') R(K,x,sq+1,2,3); // big
    else R(K,x+lk,sq+2,2,2); // open
  };
  const e=o.e||'o'; 
  if(!o.he) { eye(6,e); eye(16,e); } // hide eyes flag
  if(o.mouth) R(K,11,sq+6,2,2);
  if(o.cheek){ R(CHEEK,5,sq+5,2,1); R(CHEEK,17,sq+5,2,1); }
  if(!o.nl) [4,8,14,18].forEach(x=>R(O,x,12,2,4)); // no legs flag
  const arm=(side,p)=>{
    let x=side?20:0;
    if(p==='up') R(O,x,sq,4,4); else if(p==='hi') R(O,x,sq-3,4,7); else R(O,x,sq+4,4,4);
  };
  if(!o.ha) { arm(0,o.l); arm(1,o.r); } // hide arms flag
  return r.concat(o.ex||[]);
}

const rep = (n, ms, f) => Array.from({length:n}, (_, i) => [f(i), ms]);

// --- アニメーションデータ 30選 ---
const MOVES = [
  // 1. アイテム・アクション（10種）
  { grid:'grid-actions', name:'りんごをかじる', desc:'もぐもぐ、ハートがぽわん', seq: [
    [fig({r:'up', ex:[[RED,18,0,4,4],[LEAF,20,-1,2,1]]}), 400],
    [fig({r:'hi', mouth:1, ex:[[RED,16,2,4,4],[LEAF,18,1,2,1]]}), 200],
    [fig({r:'hi', sq:1, ex:[[RED,16,3,3,3],[RED,12,5,2,2]]}), 200],
    [fig({r:'up', e:'h', cheek:1, ex:[[RED,18,2,2,2], ...heart(8,-6)]}), 800]
  ]},
  { grid:'grid-actions', name:'水バケツ着地', desc:'落下直前に水を出してセーフ', seq: [
    [fig({dy:-20, l:'hi', r:'hi', e:'b'}), 200], [fig({dy:-10, l:'hi', r:'hi', e:'b'}), 100],
    [fig({dy:0, l:'hi', r:'hi', e:'c', ex:[[WATER,2,14,20,2]]}), 100],
    [fig({dy:0, sq:2, e:'c', ex:[[WATER,2,14,20,2],[WATER,0,12,4,4],[WATER,20,12,4,4]]}), 300],
    [fig({dy:0, e:'h', cheek:1, ex:[[WATER,2,14,20,2]]}), 600]
  ]},
  { grid:'grid-actions', name:'ボートをこぐ', desc:'木のボートでスイスイ', seq: rep(8, 200, i => {
    const oar = i%2 ? [[WOOD,12,12,12,2],[WOOD,0,12,12,2]] : [[WOOD,14,8,12,2],[WOOD,-2,8,12,2]];
    return fig({nl:1, dy:4, ex:[[WOOD,-4,12,32,4],[STONE_D,0,14,24,2], ...oar]});
  })},
  { grid:'grid-actions', name:'トライデント', desc:'狙いを定めてシュッと投げる', seq: [
    [fig({r:'up', ex:[[DIA,20,4,2,16],[DIA,18,4,6,2],[DIA,18,0,2,4],[DIA,22,0,2,4],[DIA,20,-2,2,6]]}), 400],
    [fig({r:'hi', e:'c', dx:-1, ex:[[DIA,22,8,2,16],[DIA,20,8,6,2],[DIA,20,4,2,4],[DIA,24,4,2,4],[DIA,22,2,2,6]]}), 400],
    [fig({r:'hi', e:'h', dx:1, ex:[[DIA,30,-6,2,16],[DIA,28,-6,6,2],[DIA,28,-10,2,4],[DIA,32,-10,2,4],[DIA,30,-12,2,6]]}), 150],
    [fig({e:'h', cheek:1}), 600]
  ]},
  { grid:'grid-actions', name:'ダイヤ装備', desc:'フル装備でピカピカに', seq: [
    [fig(), 300],
    [fig({ex:[[DIA,3,-2,18,4],[DIA,3,2,2,4],[DIA,19,2,2,4]]}), 300],
    [fig({ex:[[DIA,3,-2,18,4],[DIA,3,2,2,4],[DIA,19,2,2,4], [DIA,3,6,18,8]]}), 300],
    [fig({ex:[[DIA,3,-2,18,4],[DIA,3,2,2,4],[DIA,19,2,2,4], [DIA,3,6,18,8], [DIA,3,13,6,3],[DIA,15,13,6,3]]}), 300],
    [fig({e:'h', cheek:1, ex:[[DIA,3,-2,18,4],[DIA,3,2,2,4],[DIA,19,2,2,4], [DIA,3,6,18,8], [DIA,3,13,6,3],[DIA,15,13,6,3], ...spark(-4,-4), ...spark(24,-2)]}), 800]
  ]},
  { grid:'grid-actions', name:'望遠鏡', desc:'遠くの景色をズーム', seq: [
    [fig({r:'up', ex:[[GOLD,20,4,6,2]]}), 300],
    [fig({r:'hi', e:'c', ex:[[GOLD,14,4,8,2],[WOOD,22,3,2,4]]}), 200],
    [fig({r:'hi', e:'c', lk:1, ex:[[GOLD,14,4,8,2],[WOOD,22,3,2,4]]}), 400],
    [fig({r:'up', e:'b', ex:[[GOLD,20,4,6,2]]}), 400],
    [fig({e:'h'}), 500]
  ]},
  { grid:'grid-actions', name:'クワで耕す', desc:'土ブロックを畑に変える', seq: [
    [fig({r:'up', ex:[[WOOD,16,-2,2,10],[STONE,14,-2,4,2], [WOOD,0,14,24,4]]}), 400],
    [fig({r:'hi', e:'c', sq:1, ex:[[WOOD,22,6,2,10],[STONE,20,6,4,2], [WOOD,0,14,24,4]]}), 200],
    [fig({r:'up', e:'h', cheek:1, ex:[[WOOD,16,-2,2,10],[STONE,14,-2,4,2], [WOOD,0,14,24,4],[K,0,14,24,1]]}), 800]
  ]},
  { grid:'grid-actions', name:'ジュークボックス', desc:'レコードを入れてダンス', seq: rep(8, 200, i => {
    const box = [[WOOD,18,8,8,8],[STONE,20,10,4,4]];
    if(i===0) return fig({r:'up', ex:[[K,16,4,4,1], ...box]});
    if(i===1) return fig({ex:box});
    return fig({dx:i%2?-1:1, sq:i%2, l:i%2?'hi':'up', r:i%2?'up':'hi', e:'h', ex:[...box, [DIA,20,2-(i%4)*2,2,2], [PINK,18,-2-(i%4)*2,2,2]]});
  })},
  { grid:'grid-actions', name:'エンチャント', desc:'文字がフワフワ集まる', seq: rep(6, 250, i => {
    const table = [[NAVY,6,12,12,4],[RED,10,10,4,2],[W,10,8,4,2]];
    return fig({e:'b', ex:[...table, [PURPLE,2,6-(i%3)*2,1,1],[PURPLE,20,4+(i%2)*2,1,1],[PURPLE,12,2+(i%4),1,1]]});
  })},
  { grid:'grid-actions', name:'金床で修理', desc:'ハンマーでカンカン！', seq: rep(6, 200, i => {
    const anvil = [[STONE_D,4,12,16,4],[STONE_D,8,10,8,2],[STONE_D,2,6,20,4]];
    const hammer = i%2 ? [[WOOD,17,2,2,6],[STONE,15,0,6,2]] : [[WOOD,21,6,2,6],[STONE,19,4,6,2]];
    return fig({r:i%2?'hi':'up', e:i%2?'c':'o', sq:i%2, ex:[...anvil, ...hammer, ...(i%2?spark(12,2):[])]});
  })},

  // 2. ブロック・レッドストーン（10種）
  { grid:'grid-blocks', name:'TNT爆発', desc:'シュー…ドカン！', seq: [
    [fig({ex:[[TNT,6,8,12,8],[W,10,10,4,4]]}), 400],
    ...rep(4, 150, i => fig({e:'b', sq:i%2, ex:[[i%2?W:TNT,6,8,12,8],[W,10,10,4,4]]})),
    [[...poof, ...spark(4,4), ...spark(18,2)], 200],
    [fig({e:'dizzy', ex:[[K,4,4,6,2],[K,16,6,4,2],[K,10,0,4,2]]}), 800] // ススまみれ
  ]},
  { grid:'grid-blocks', name:'スライムブロック', desc:'ボヨーンと大ジャンプ', seq: [
    [fig({dy:-20, l:'hi', r:'hi', ex:[[SLIME,4,12,16,4]]}), 200],
    [fig({dy:0, sq:6, e:'c', ex:[[SLIME,4,12,16,4]]}), 200],
    [fig({dy:-15, l:'hi', r:'hi', e:'h', ex:[[SLIME,4,12,16,4]]}), 300],
    [fig({dy:0, sq:2, e:'c', ex:[[SLIME,4,12,16,4]]}), 200],
    [fig({dy:-5, l:'up', r:'up', e:'h', ex:[[SLIME,4,12,16,4]]}), 300]
  ]},
  { grid:'grid-blocks', name:'焚き火', desc:'煙がもくもく', seq: rep(8, 250, i => {
    const fire = [[WOOD,6,14,12,2],[FIRE,8,10,8,4], [FIRE,10,8,4,2]];
    return fig({r:'up', e:'h', ex:[...fire, [STONE_D, 11,4-(i%4)*2, 2,2], [STONE_D, 13,0-(i%4)*2, 2,2], [WOOD,20,6,8,1],[W,18,5,2,3]]});
  })},
  { grid:'grid-blocks', name:'鐘（ベル）', desc:'カンカン鳴らす', seq: rep(6, 200, i => {
    const bell = [[WOOD,8,0,8,2],[GOLD,10,2,4,6],[GOLD,9,8,6,2]];
    if(i===0) return fig({r:'up', ex:bell});
    return fig({r:'hi', e:'c', sq:1, ex:bell.map(([c,x,y,w,h])=>[c,x+(i%2?1:-1),y,w,h]).concat([[K,4,6,2,2],[K,18,6,2,2]])});
  })},
  { grid:'grid-blocks', name:'ピストン', desc:'ガシャンと押し出される', seq: [
    [fig({dx:0, ex:[[STONE,-12,6,8,10],[WOOD,-4,8,4,6]]}), 400],
    [fig({dx:8, e:'b', ex:[[STONE,-12,6,8,10],[WOOD,-4,8,12,6],[WOOD,-4,10,12,2]]}), 200],
    [fig({dx:8, e:'dizzy', ex:[[STONE,-12,6,8,10],[WOOD,-4,8,12,6],[WOOD,-4,10,12,2]]}), 600],
    [fig({dx:8, e:'h', ex:[[STONE,-12,6,8,10],[WOOD,-4,8,4,6]]}), 400]
  ]},
  { grid:'grid-blocks', name:'ディスペンサー', desc:'矢が飛んできてよける', seq: [
    [fig({ex:[[STONE,-6,6,8,8],[K,-4,8,4,4]]}), 400],
    [fig({dy:-4, e:'b', ex:[[STONE,-6,6,8,8],[K,-4,8,4,4], [W2,2,10,6,2]]}), 150],
    [fig({dy:-4, e:'b', lk:1, ex:[[STONE,-6,6,8,8],[K,-4,8,4,4], [W2,14,10,6,2]]}), 150],
    [fig({e:'c', sq:1, ex:[[STONE,-6,6,8,8],[K,-4,8,4,4], [W2,26,10,6,2]]}), 400],
    [fig({e:'h', cheek:1, ex:[[STONE,-6,6,8,8],[K,-4,8,4,4]]}), 600]
  ]},
  { grid:'grid-blocks', name:'トラップドア', desc:'パカッと開いて落下', seq: [
    [fig({ex:[[WOOD,6,14,12,2]]}), 500],
    [fig({e:'b', ex:[[WOOD,6,14,2,12]]}), 200], // open
    [fig({dy:10, l:'hi', r:'hi', e:'b', ex:[[WOOD,6,14,2,12]]}), 200],
    [fig({dy:20, l:'hi', r:'hi', e:'c', ex:[[WOOD,6,14,2,12]]}), 200],
    [fig({nl:1, hbg:1, he:1, ha:1, ex:[[WOOD,6,14,12,2]]}), 600] // closed & empty
  ]},
  { grid:'grid-blocks', name:'ビーコン', desc:'空へ伸びる光の柱', seq: [
    [fig({ex:[[DIA,2,14,20,2],[DIA,6,12,12,2],[W,10,8,4,4]]}), 500],
    [fig({e:'b', ex:[[DIA,2,14,20,2],[DIA,6,12,12,2],[W,10,8,4,4], [DIA,10,0,4,8]]}), 200],
    [fig({e:'h', cheek:1, l:'hi', r:'hi', ex:[[DIA,2,14,20,2],[DIA,6,12,12,2],[W,10,8,4,4], [DIA,10,-10,4,18]]}), 800]
  ]},
  { grid:'grid-blocks', name:'足場ブロック', desc:'スルスルとのぼる', seq: [
    [fig({ex:[[GOLD,8,8,8,8],[WOOD,8,8,2,8],[WOOD,14,8,2,8]]}), 400],
    [fig({dy:-4, l:'up', r:'up', ex:[[GOLD,8,8,8,8],[WOOD,8,8,2,8],[WOOD,14,8,2,8]]}), 200],
    [fig({dy:-8, l:'hi', r:'hi', ex:[[GOLD,8,8,8,8],[WOOD,8,8,2,8],[WOOD,14,8,2,8]]}), 200],
    [fig({dy:-12, e:'h', cheek:1, ex:[[GOLD,8,8,8,8],[WOOD,8,8,2,8],[WOOD,14,8,2,8]]}), 800]
  ]},
  { grid:'grid-blocks', name:'レッドストーン', desc:'レバーでランプを点灯', seq: [
    [fig({ex:[[STONE,0,14,6,2],[WOOD,2,10,2,4], [RED,6,14,10,2], [STONE_D,16,8,8,8]]}), 500],
    [fig({r:'up', sq:1, ex:[[STONE,0,14,6,2],[WOOD,4,10,2,4], [RED,6,14,10,2], [STONE_D,16,8,8,8]]}), 200],
    [fig({e:'h', cheek:1, ex:[[STONE,0,14,6,2],[WOOD,4,10,2,4], [O,6,14,10,2], [GOLD,16,8,8,8], ...spark(20,4)]}), 800]
  ]},

  // 3. モブに変身（10種）
  { grid:'grid-mobs', name:'スノウゴーレム風', desc:'雪玉をぽいっ', seq: rep(6, 250, i => {
    const sg = [[W,6,6,12,10],[W,8,16,8,2],[FIRE,8,0,8,6],[K,10,2,1,1],[K,13,2,1,1],[WOOD,2,8,4,2],[WOOD,18,8,4,2]];
    return fig({hbg:1, he:1, ha:1, nl:1, ex:[...sg, ...(i%2?[[W,24,6,4,4]]:[])]});
  })},
  { grid:'grid-mobs', name:'ガスト風', desc:'火の玉をドカン', seq: [
    ...rep(4, 250, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-2:0, ex:[[W,2,0,20,12],[W,4,12,2,4],[W,10,12,2,4],[W,18,12,2,4], [K,6,4,2,1],[K,16,4,2,1],[K,11,8,2,2]]})),
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-2, ex:[[W,2,0,20,12],[W,4,12,2,4],[W,10,12,2,4],[W,18,12,2,4], [RED,6,3,2,2],[RED,16,3,2,2],[K,10,7,4,4], [FIRE,10,12,4,4]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:0, ex:[[W,2,0,20,12],[W,4,12,2,4],[W,10,12,2,4],[W,18,12,2,4], [K,6,4,2,1],[K,16,4,2,1],[K,11,8,2,2], [FIRE,10,16,6,6]]}), 400]
  ]},
  { grid:'grid-mobs', name:'シュルカー風', desc:'カラを開いてチラッ', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PURPLE,4,8,16,8],[PURPLE,4,6,16,2]]}), 600],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PURPLE,4,8,16,8],[GOLD,10,4,4,4],[K,11,5,2,1],[PURPLE,4,2,16,2]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PURPLE,4,8,16,8],[GOLD,10,4,4,4],[K,11,5,2,1],[PURPLE,4,2,16,2], [W,18,2,4,4]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PURPLE,4,8,16,8],[PURPLE,4,6,16,2]]}), 600]
  ]},
  { grid:'grid-mobs', name:'ファントム風', desc:'空から急降下', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, dx:10, dy:-10, ex:[[NAVY,-2,0,28,4],[NAVY,10,-2,8,2],[LEAF,12,1,2,1]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, dx:0, dy:0, ex:[[NAVY,-2,0,28,4],[NAVY,10,-2,8,2],[LEAF,12,1,2,1]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dx:-10, dy:-10, ex:[[NAVY,-2,0,28,4],[NAVY,10,-2,8,2],[LEAF,12,1,2,1]]}), 300]
  ]},
  { grid:'grid-mobs', name:'イルカ風', desc:'水しぶきをあげてジャンプ', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, dy:8, ex:[[NAVY,4,0,16,6],[NAVY,0,2,4,2],[NAVY,10,-2,4,2],[K,6,2,1,1], [WATER,0,8,24,2]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:0, ex:[[NAVY,4,0,16,6],[NAVY,0,2,4,2],[NAVY,10,-2,4,2],[K,6,2,1,1], [WATER,0,12,24,2]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-4, ex:[[NAVY,4,0,16,6],[NAVY,0,2,4,2],[NAVY,10,-2,4,2],[K,6,2,1,1], [WATER,0,16,24,2]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:8, ex:[[NAVY,4,0,16,6],[NAVY,0,2,4,2],[NAVY,10,-2,4,2],[K,6,2,1,1], [WATER,0,8,24,2], ...spark(4,0)]}), 400]
  ]},
  { grid:'grid-mobs', name:'キツネ風', desc:'丸まって寝てからジャンプ', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[FIRE,6,10,12,6],[FIRE,2,8,4,4],[W,6,12,4,4],[K,7,14,2,1]]}), 500], // sleep
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[FIRE,6,6,12,6],[FIRE,18,8,6,4],[FIRE,4,2,6,6],[K,6,4,1,1],[K,8,4,1,1], [W,4,8,4,4]]}), 300], // awake
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-8, dx:4, ex:[[FIRE,6,6,12,6],[FIRE,18,8,6,4],[FIRE,4,2,6,6],[K,6,4,1,1],[K,8,4,1,1], [W,4,8,4,4]]}), 300], // leap
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[FIRE,6,6,12,6],[FIRE,18,8,6,4],[FIRE,4,2,6,6],[K,6,4,1,1],[K,8,4,1,1], [W,4,8,4,4]]}), 500] // land
  ]},
  { grid:'grid-mobs', name:'アイアンゴーレム風', desc:'赤いお花をどうぞ', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[W2,4,0,16,10],[W2,-2,0,6,14],[W2,20,0,6,14],[W2,6,-6,8,6],[K,8,-4,1,1],[K,11,-4,1,1],[LEAF,10,-2,1,2]]}), 500],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[W2,4,0,16,10],[W2,-2,0,6,10],[W2,20,0,6,14],[W2,6,-6,8,6],[K,8,-4,1,1],[K,11,-4,1,1],[LEAF,10,-2,1,2], [W2,-8,6,6,4],[RED,-10,4,2,2]]}), 800]
  ]},
  { grid:'grid-mobs', name:'ラヴァージャー風', desc:'首を伸ばしてガオー', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[STONE,2,4,20,10],[STONE_D,4,14,4,4],[STONE_D,16,14,4,4],[STONE,18,0,8,8],[K,20,2,1,1],[K,24,2,1,1]]}), 500],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[STONE,2,4,20,10],[STONE_D,4,14,4,4],[STONE_D,16,14,4,4],[STONE,24,0,8,8],[K,26,2,1,1],[K,30,2,1,1], [STONE,18,4,6,4]]}), 300], // extend
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[STONE,2,4,20,10],[STONE_D,4,14,4,4],[STONE_D,16,14,4,4],[STONE,18,0,8,8],[K,20,2,1,1],[K,24,2,1,1]]}), 500]
  ]},
  { grid:'grid-mobs', name:'ヤギ風', desc:'とんでもないジャンプ力', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[W,6,6,12,8],[W,4,14,2,2],[W,16,14,2,2],[W,16,2,6,6],[W2,22,0,2,2],[K,18,4,1,1]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:2, ex:[[W,6,6,12,8],[W,4,14,2,2],[W,16,14,2,2],[W,16,2,6,6],[W2,22,0,2,2],[K,18,4,1,1]]}), 200], // squash
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-30, ex:[[W,6,6,12,8],[W,4,14,2,2],[W,16,14,2,2],[W,16,2,6,6],[W2,22,0,2,2],[K,18,4,1,1]]}), 400], // jump
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[W,6,6,12,8],[W,4,14,2,2],[W,16,14,2,2],[W,16,2,6,6],[W2,22,0,2,2],[K,18,4,1,1]]}), 500]
  ]},
  { grid:'grid-mobs', name:'エンダードラゴン風', desc:'大きな羽ではばたく', seq: rep(8, 150, i => {
    const wing = i%2 ? [[NAVY,-6,2,10,2],[NAVY,20,2,10,2]] : [[NAVY,-4,8,8,4],[NAVY,20,8,8,4]];
    return fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-2:0, ex:[[K,4,4,16,8],[K,10,0,4,4],[PURPLE,10,2,1,1],[PURPLE,13,2,1,1], ...wing]});
  })}
];

// 後半のモブは、オレンジキャラからの変身エフェクト（煙）で包む
for(let i=20; i<30; i++) {
  const a = MOVES[i].seq[0][0];
  const z = MOVES[i].seq[MOVES[i].seq.length-1][0];
  MOVES[i].seq = [
    [fig(), 400],
    [fig({e:'c', ex:poof}), 200],
    [[...a, ...poof], 200],
    ...MOVES[i].seq,
    [[...z, ...poof], 200],
    [fig({e:'h', cheek:1}), 400]
  ];
}
const G = { 'grid-actions': 'grid-mc3-actions', 'grid-blocks': 'grid-mc3-blocks', 'grid-mobs': 'grid-mc3-mobs' };
return MOVES.map(m => ({ ...m, grid: G[m.grid], vb: '-12 -18 48 40' }));
})();

// ── 15. マイクラ風 完全30選（91〜120）：別のファイルから。描き方がちがうので、この中だけで使う ──
const MC4 = (() => {
const O='#d97757', K='#1a1612', W='#f7f2ee', W2='#e0e0e0', RED='#e8452f', GOLD='#f2c14e', PINK='#e8687d', CHEEK='#f2a0a8';
const DIA='#4fd1d9', WOOD='#8b5a2b', LEAF='#5aa35a', STONE='#8d8d8d', STONE_D='#6f6f6f', WATER='#3f76e4', FIRE='#f39c34';
const LAVA='#cf3000', CACTUS='#517d26', HONEY='#f2af29', WEB='#dddddd', OBS='#1c1326', SOUL='#5c3a21', CART='#7a7a7a', RAIL='#404040';
const PIG_Z='#eaa7a7', Z_GRN='#5fae4a', BONE='#d9d9d2', PURPLE='#9b6bd6', L_PURPLE='#c5a3ff', GREEN='#3e8948', WITHER_K='#222222', GRAY='#999999';

const poof = [[WATER,-2,4,4,3],[WATER,22,3,4,3],[WATER,8,-4,5,3],[WATER,3,12,4,3],[WATER,17,12,4,3],[WATER,10,14,4,2]];
const spark = (x,y) => [[GOLD,x+1,y,1,3],[GOLD,x,y+1,3,1]];
const zz = (x,y) => [[L_PURPLE,x,y,3,1],[L_PURPLE,x+1,y+1,1,1],[L_PURPLE,x,y+2,3,1]];

function fig(o={}) {
  const dx=o.dx||0, dy=o.dy||0, sq=o.sq||0, r=[];
  const R=(c,x,y,w,h)=>r.push([c,x+dx,y+dy,w,h]);
  if(!o.hbg) R(O,4,sq,16,12-sq);
  const lk=o.lk||0;
  const eye=(x,k)=>{
    if(k==='c') R(K,x+lk,sq+3,2,1); else if(k==='h'){ R(K,x-1,sq+3,1,1); R(K,x,sq+2,2,1); R(K,x+2,sq+3,1,1); }
    else if(k==='b') R(K,x,sq+1,2,3); else if(k==='d'){ [[-1,-1],[1,-1],[0,0],[-1,1],[1,1]].forEach(([a,b])=>R(K,x+1+a,sq+b+2,1,1)); }
    else R(K,x+lk,sq+2,2,2);
  };
  if(!o.he) { eye(6,o.e||'o'); eye(16,o.e||'o'); }
  if(o.mouth) R(K,11,sq+6,2,2);
  if(o.cheek){ R(CHEEK,5,sq+5,2,1); R(CHEEK,17,sq+5,2,1); }
  if(!o.nl) [4,8,14,18].forEach(x=>R(O,x,12,2,4));
  const arm=(side,p)=>{ let x=side?20:0; if(p==='up') R(O,x,sq,4,4); else if(p==='hi') R(O,x,sq-3,4,7); else R(O,x,sq+4,4,4); };
  if(!o.ha) { arm(0,o.l); arm(1,o.r); }
  return r.concat(o.ex||[]);
}

const rep = (n, ms, f) => Array.from({length:n}, (_, i) => [f(i), ms]);

const MOVES = [
  // --- 1. アイテム・アクション ---
  { grid:'grid-actions', name:'釣竿で引き寄せる', desc:'ヒット！アイテムを釣り上げる', seq: [
    [fig({r:'up', ex:[[WOOD,16,-6,2,14],[W2,17,-6,8,1],[W2,24,-6,1,16]]}), 500],
    [fig({r:'hi', e:'b', ex:[[WOOD,16,-6,2,14],[W2,17,-6,8,1],[W2,24,-6,1,16], [WATER,22,10,6,2]]}), 200],
    [fig({r:'hi', e:'h', ex:[[WOOD,18,-4,2,14],[W2,19,-4,6,1],[W2,24,-4,1,10], [WATER,22,10,6,2], [GOLD,22,-2,4,4]]}), 200],
    [fig({e:'h', cheek:1, ex:[[GOLD,14,8,4,4], ...spark(18,6)]}), 800]
  ]},
  { grid:'grid-actions', name:'ハサミでチョキ', desc:'羊毛や葉っぱを刈り取る', seq: rep(6, 200, i => {
    const shears = i%2 ? [[STONE_D,16,6,6,2],[STONE_D,18,4,2,6]] : [[STONE_D,18,6,6,2],[STONE_D,20,4,2,6]];
    return fig({r:i%2?'hi':'up', e:'c', sq:i%2, ex:[...shears, [W,24,6,6,6], ...(i%2?spark(24,4):[])]});
  })},
  { grid:'grid-actions', name:'黒曜石を掘る', desc:'固くてなかなか掘れない…', seq: [
    ...rep(6, 300, i => fig({r:i%2?'hi':'up', e:'c', sq:i%2, ex:[...(i%2?[[WOOD,16,-2,2,10],[DIA,14,-2,6,2]]:[[WOOD,20,6,2,10],[DIA,18,6,6,2]]), [OBS,24,8,8,8], ...(i%2?spark(22,6):[])]})),
    [fig({e:'h', cheek:1, ex:[[OBS,14,8,6,6], ...spark(14,4), [WATER,5,4,2,2]]}), 800]
  ]},
  { grid:'grid-actions', name:'雪玉を投げる', desc:'ポイッと投げて当てる', seq: [
    [fig({r:'up', ex:[[W,18,6,4,4]]}), 300], [fig({r:'hi', e:'c', ex:[[W,16,0,4,4]]}), 200], [fig({r:'hi', e:'o', ex:[[W,26,0,4,4]]}), 150],
    [fig({r:'hi', e:'o', ex:[[W,36,2,4,4]]}), 150], [fig({e:'h', ex:[[W,40,6,6,6], [W2,38,4,2,2], [W2,42,4,2,2]]}), 600]
  ]},
  { grid:'grid-actions', name:'骨粉で木を育てる', desc:'苗木が一瞬で大きな木に', seq: [
    [fig({r:'up', ex:[[W,18,6,2,2], [LEAF,24,12,2,2],[WOOD,24,14,2,2]]}), 400], [fig({r:'hi', e:'c', sq:1, ex:[[LEAF,24,12,2,2],[WOOD,24,14,2,2], [W,22,10,2,2],[W,26,12,2,2]]}), 200],
    [fig({e:'b', ex:[[WOOD,24,6,2,10], [LEAF,20,0,10,8], [LEAF,18,2,14,4], ...spark(22,4)]}), 800]
  ]},
  { grid:'grid-actions', name:'地図を見る', desc:'両手で持ってキョロキョロ', seq: [
    [fig({l:'up', r:'up', ex:[[W2,8,4,12,10],[W,9,5,10,8],[WATER,10,6,4,4],[LEAF,14,8,4,4]]}), 400], [fig({l:'up', r:'up', lk:-1, ex:[[W2,6,4,12,10],[W,7,5,10,8],[WATER,8,6,4,4],[LEAF,12,8,4,4]]}), 400],
    [fig({l:'up', r:'up', lk:1, ex:[[W2,10,4,12,10],[W,11,5,10,8],[WATER,12,6,4,4],[LEAF,16,8,4,4]]}), 400], [fig({l:'up', r:'up', e:'h', ex:[[W2,8,4,12,10],[W,9,5,10,8],[WATER,10,6,4,4],[LEAF,14,8,4,4]]}), 600]
  ]},
  { grid:'grid-actions', name:'コンパス', desc:'赤い針がぐるぐる回る', seq: rep(8, 200, i => {
    const needle = i%4===0 ? [[RED,15,6,2,2]] : i%4===1 ? [[RED,16,7,2,2]] : i%4===2 ? [[RED,15,8,2,2]] : [[RED,14,7,2,2]];
    return fig({r:'up', e:i>5?'h':'o', ex:[[STONE,13,5,6,6], [W2,14,6,4,4], ...needle]});
  })},
  { grid:'grid-actions', name:'エリトラ花火', desc:'空中で花火を使って加速', seq: [
    [fig({dy:-4, ex:[[STONE,2,0,4,8],[STONE,18,0,4,8]]}), 400], [fig({dy:-4, r:'hi', ex:[[STONE,2,0,4,8],[STONE,18,0,4,8], [RED,20,-2,2,8],[W,20,4,2,2]]}), 300],
    [fig({dy:-4, dx:8, e:'h', l:'hi', r:'hi', ex:[[STONE,2,0,4,8],[STONE,18,0,4,8], ...spark(-4,4), ...spark(-8,8)]}), 200], [fig({dy:-4, dx:16, e:'h', l:'hi', r:'hi', ex:[[STONE,2,0,4,8],[STONE,18,0,4,8], ...spark(-12,4)]}), 600]
  ]},
  { grid:'grid-actions', name:'ベッドで寝る', desc:'リスポーン地点を設定', seq: [
    [fig({ex:[[RED,0,12,12,4],[W,12,12,6,4],[WOOD,0,16,2,2],[WOOD,16,16,2,2]]}), 500], [fig({nl:1, dy:4, e:'c', ex:[[RED,0,8,12,4],[W,12,8,6,4],[WOOD,0,12,2,2],[WOOD,16,12,2,2], ...zz(14,-2)]}), 500],
    [fig({nl:1, dy:4, e:'c', sq:1, ex:[[RED,0,8,12,4],[W,12,8,6,4],[WOOD,0,12,2,2],[WOOD,16,12,2,2], ...zz(18,-6)]}), 500], [fig({e:'h', cheek:1, ex:[[RED,0,12,12,4],[W,12,12,6,4],[WOOD,0,16,2,2],[WOOD,16,16,2,2]]}), 600]
  ]},
  { grid:'grid-actions', name:'ケーキを食べる', desc:'一切れずつパクパク', seq: [
    [fig({ex:[[W,16,10,10,6], [RED,18,8,2,2],[RED,22,8,2,2]]}), 500], [fig({r:'up', mouth:1, ex:[[W,18,10,8,6], [RED,22,8,2,2]]}), 200],
    [fig({r:'up', e:'c', sq:1, ex:[[W,18,10,8,6], [RED,22,8,2,2]]}), 200], [fig({r:'up', mouth:1, ex:[[W,20,10,6,6], [RED,22,8,2,2]]}), 200],
    [fig({e:'h', cheek:1, ex:[[W,20,10,6,6], [RED,22,8,2,2], ...[[PINK,8,-6,2,1],[PINK,11,-6,2,1],[PINK,8,-5,5,1],[PINK,9,-4,3,1],[PINK,10,-3,1,1]] ]}), 800]
  ]},

  // --- 2. ブロック・ギミック ---
  { grid:'grid-blocks', name:'ドリップリーフ', desc:'乗っていると傾いて落ちる', seq: [
    [fig({dy:-4, ex:[[LEAF,0,12,24,2],[LEAF,10,14,4,8]]}), 400], [fig({dy:-4, e:'b', ex:[[LEAF,0,13,24,2],[LEAF,10,15,4,8]]}), 200],
    [fig({dy:-4, e:'b', ex:[[LEAF,0,15,24,2],[LEAF,10,17,4,8]]}), 200], [fig({dy:4, l:'hi', r:'hi', e:'d', ex:[[LEAF,0,16,24,4],[LEAF,10,18,4,8]]}), 400],
    [fig({e:'c', ex:[[LEAF,0,12,24,2],[LEAF,10,14,4,8]]}), 600]
  ]},
  { grid:'grid-blocks', name:'サボテン', desc:'触るとチクッとして痛い', seq: [
    [fig({ex:[[CACTUS,20,4,8,12],[K,19,6,1,2],[K,28,8,1,2],[K,19,12,1,2]]}), 500], [fig({dx:2, e:'b', ex:[[CACTUS,18,4,8,12],[K,17,6,1,2],[K,26,8,1,2],[K,17,12,1,2]]}), 200],
    [fig({dx:2, e:'c', sq:1, ex:[[CACTUS,18,4,8,12],[K,17,6,1,2],[K,26,8,1,2],[K,17,12,1,2], [RED,4,0,16,12]]}), 200],
    [fig({dx:-2, l:'hi', r:'hi', e:'d', ex:[[CACTUS,22,4,8,12],[K,21,6,1,2],[K,30,8,1,2],[K,21,12,1,2], [WATER,10,2,2,4]]}), 600]
  ]},
  { grid:'grid-blocks', name:'溶岩を避ける', desc:'熱い溶岩をジャンプで飛び越す', seq: [
    [fig({ex:[[LAVA,16,14,12,2],[FIRE,18,10,2,4]]}), 400], [fig({sq:2, e:'c', ex:[[LAVA,16,14,12,2],[FIRE,20,12,2,2]]}), 200],
    [fig({dy:-12, dx:8, l:'hi', r:'hi', e:'b', ex:[[LAVA,8,14,12,2],[FIRE,10,10,2,4]]}), 300], [fig({dx:16, e:'h', cheek:1, ex:[[LAVA,0,14,12,2],[FIRE,4,12,2,2]]}), 600]
  ]},
  { grid:'grid-blocks', name:'ハチミツブロック', desc:'壁をズルズル滑り落ちる', seq: [
    [fig({dy:-16, r:'up', ex:[[HONEY,22, -20, 8, 40]]}), 200], [fig({dy:-12, r:'up', e:'c', ex:[[HONEY,22, -20, 8, 40]]}), 200],
    [fig({dy:-8, r:'up', e:'c', ex:[[HONEY,22, -20, 8, 40]]}), 200], [fig({dy:-4, r:'up', e:'c', ex:[[HONEY,22, -20, 8, 40]]}), 200],
    [fig({dy:0, e:'h', cheek:1, ex:[[HONEY,22, -20, 8, 40]]}), 600]
  ]},
  { grid:'grid-blocks', name:'クモの巣', desc:'引っかかってなかなか進めない', seq: [
    [fig({dx:-8, ex:[[WEB, 4, 4, 16, 16]]}), 300], [fig({dx:-6, sq:1, e:'c', l:'up', r:'up', ex:[[WEB, 4, 4, 16, 16]]}), 300],
    [fig({dx:-4, sq:0, e:'c', l:'up', r:'up', ex:[[WEB, 4, 4, 16, 16]]}), 300], [fig({dx:-2, sq:1, e:'c', l:'hi', r:'hi', ex:[[WEB, 4, 4, 16, 16]]}), 300],
    [fig({dx:2, e:'h', cheek:1, ex:[[WEB, -4, 4, 16, 16]]}), 600]
  ]},
  { grid:'grid-blocks', name:'音ブロック', desc:'叩くと音符が飛び出す', seq: rep(6, 200, i => {
    const box = [[WOOD,20,8,8,8],[K,22,10,4,4]];
    if(i===0) return fig({r:'up', ex:box});
    if(i%2!==0) return fig({r:'hi', e:'c', sq:1, ex:[...box, [PINK,22,0,4,4],[PINK,26,4,2,2]]});
    return fig({r:'up', e:'h', ex:[...box, [GREEN,20,-4,4,4],[GREEN,24,0,2,2]]});
  })},
  { grid:'grid-blocks', name:'エンダーチェスト', desc:'開けると紫のパーティクル', seq: [
    [fig({ex:[[OBS,12,8,12,8], [GREEN,16,10,4,2]]}), 400], [fig({e:'b', ex:[[OBS,12,8,12,8], [GREEN,16,10,4,2], [PURPLE,14,4,2,2]]}), 200],
    [fig({l:'up', r:'up', e:'h', cheek:1, ex:[[OBS,12,8,12,8], [GREEN,16,10,4,2], [PURPLE,10,2,2,2],[PURPLE,20,0,2,2],[PURPLE,16,-4,2,2]]}), 800]
  ]},
  { grid:'grid-blocks', name:'ソウルサンド', desc:'足が遅くなる不気味な砂', seq: [
    [fig({dx:-4, ex:[[SOUL,-10,14,40,4], [K,0,15,2,2],[K,12,15,2,2],[K,20,15,2,2]]}), 400], [fig({dx:-2, sq:1, e:'c', ex:[[SOUL,-10,14,40,4], [K,0,15,2,2],[K,12,15,2,2],[K,20,15,2,2]]}), 400],
    [fig({dx:0, sq:0, e:'c', ex:[[SOUL,-10,14,40,4], [K,0,15,2,2],[K,12,15,2,2],[K,20,15,2,2]]}), 400], [fig({dx:2, sq:1, e:'b', ex:[[SOUL,-10,14,40,4], [K,0,15,2,2],[K,12,15,2,2],[K,20,15,2,2]]}), 400]
  ]},
  { grid:'grid-blocks', name:'トロッコ脱線', desc:'レールが途切れてドスン', seq: [
    [fig({nl:1, dx:-8, dy:2, ex:[[CART,-10,8,20,6],[RAIL,-20,14,30,2]]}), 200], [fig({nl:1, dx:0, dy:2, ex:[[CART,-2,8,20,6],[RAIL,-20,14,26,2]]}), 200],
    [fig({nl:1, dx:8, dy:8, e:'b', l:'hi', r:'hi', ex:[[CART,6,14,20,6],[RAIL,-20,14,20,2]]}), 200], [fig({nl:1, dx:12, dy:12, e:'d', sq:2, ex:[[CART,10,18,20,6],[RAIL,-20,14,20,2], ...spark(16,10)]}), 600]
  ]},
  { grid:'grid-blocks', name:'アメジスト', desc:'歩くとシャラシャラ音が鳴る', seq: rep(8, 200, i => fig({dx:i%2?-1:1, sq:i%2, e:'h', ex:[[PURPLE,-10,14,40,4], [L_PURPLE,i*4-4,12,4,2], ...spark(i*4-6,8)]}))},

  // --- 3. モブキャラクターに変身 ---
  { grid:'grid-mobs', name:'ゾンビピグリン', desc:'金の剣を持った中立モブ', seq: rep(8, 250, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-1:0, ex:[[PIG_Z,4,0,6,12], [Z_GRN,10,0,6,12], [K,6,4,2,1], [K,12,4,2,1], [BONE,7,12,2,4], [Z_GRN,13,12,2,4], [GOLD,20,2,2,12], ...(i%2?[[GOLD,18,10,6,2]]:[[GOLD,18,12,6,2]])]}))},
  { grid:'grid-mobs', name:'スケルトンホース', desc:'骨だけの馬', seq: rep(8, 200, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-1:0, ex:[[BONE,2,4,16,6], [BONE,16,0,4,8], [BONE,18,-1,6,4], [K,21,0,1,1], [K,15,-1,2,6], [BONE,4,10,2,6], [BONE,8,10,2,6], [BONE,12,10,2,6], [BONE,16,10,2,6]]}))},
  { grid:'grid-mobs', name:'ウミガメ', desc:'緑の甲羅でのんびり這う', seq: rep(8, 300, i => fig({hbg:1, he:1, ha:1, nl:1, dx:i%2?1:0, ex:[[GREEN,4,8,14,6], [Z_GRN,18,10,6,4], [K,21,11,1,1], [Z_GRN,6,14,4,2], [Z_GRN,14,14,4,2], [WATER, -10, 16, 40, 2]]}))},
  { grid:'grid-mobs', name:'ストライダー', desc:'溶岩の上を歩く赤いモブ', seq: rep(8, 250, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-2:0, ex:[[RED,4,2,16,10], [STONE_D,8,12,2,8], [STONE_D,14,12,2,8], [K,6,6,2,2], [K,16,6,2,2], [K,10,10,4,1], [LAVA, -10, 18, 40, 4]]}))},
  { grid:'grid-mobs', name:'マグマキューブ', desc:'層が分かれてジャンプ', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[K,4,4,16,12],[RED,4,4,16,4],[RED,4,8,16,4],[RED,4,12,16,4], [FIRE,8,6,2,2],[FIRE,14,6,2,2]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:2, ex:[[K,4,6,16,10],[RED,4,6,16,3],[RED,4,9,16,3],[RED,4,12,16,4], [FIRE,8,7,2,2],[FIRE,14,7,2,2]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-8, ex:[[K,6,-2,12,16],[RED,4,-2,16,4],[RED,4,4,16,4],[RED,4,10,16,4], [FIRE,8,0,2,2],[FIRE,14,0,2,2]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[K,4,4,16,12],[RED,4,4,16,4],[RED,4,8,16,4],[RED,4,12,16,4], [FIRE,8,6,2,2],[FIRE,14,6,2,2]]}), 400]
  ]},
  { grid:'grid-mobs', name:'ピリジャー', desc:'クロスボウを構える略奪者', seq: rep(8, 250, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-1:0, ex:[[STONE,6,0,12,12], [K,8,4,2,2], [K,14,4,2,2], [STONE_D,10,6,4,4], [STONE,6,12,4,4], [STONE,14,12,4,4], [WOOD,16,6,8,2], [STONE_D,22,4,2,6], [W2,24,6,2,2]]}))},
  { grid:'grid-mobs', name:'ラマ', desc:'長い首でツバをペッ！', seq: [
    ...rep(4, 200, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-1:0, ex:[[W,10,-6,6,12], [W,6,6,14,8], [STONE_D,10,-2,6,4], [K,14,-4,1,1], [W,6,14,2,4],[W,16,14,2,4]]})),
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[W,10,-6,6,12], [W,6,6,14,8], [STONE_D,10,-2,6,4], [K,14,-4,1,1], [W,6,14,2,4],[W,16,14,2,4], [W2,18,-4,4,2]]}), 150],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[W,10,-6,6,12], [W,6,6,14,8], [STONE_D,10,-2,6,4], [K,14,-4,1,1], [W,6,14,2,4],[W,16,14,2,4], [W2,24,-4,4,2]]}), 150]
  ]},
  { grid:'grid-mobs', name:'コウモリ', desc:'逆さまにぶら下がって飛ぶ', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-6, ex:[[SOUL,10,0,6,8], [SOUL,8,6,2,2], [SOUL,16,6,2,2], [K,11,2,1,1], [K,14,2,1,1], [STONE_D, -10,-8,40,4]]}), 600],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:0, ex:[[SOUL,10,4,6,6], [SOUL,4,4,6,4], [SOUL,16,4,6,4], [K,11,6,1,1], [K,14,6,1,1], [STONE_D, -10,-8,40,4]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-2, ex:[[SOUL,10,4,6,6], [SOUL,6,0,4,4], [SOUL,16,0,4,4], [K,11,6,1,1], [K,14,6,1,1], [STONE_D, -10,-8,40,4]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:0, ex:[[SOUL,10,4,6,6], [SOUL,4,4,6,4], [SOUL,16,4,6,4], [K,11,6,1,1], [K,14,6,1,1], [STONE_D, -10,-8,40,4]]}), 200]
  ]},
  { grid:'grid-mobs', name:'シルバーフィッシュ', desc:'石の中から現れて進む', seq: rep(8, 200, i => fig({hbg:1, he:1, ha:1, nl:1, dx:i%2?1:0, ex:[[GRAY,6,12,6,4], [STONE_D,12,13,4,3], [GRAY,16,14,4,2], [K,10,13,1,1]].map(([c,x,y,w,h])=>[c,x,y-(i%2),w,h])}))},
  { grid:'grid-mobs', name:'ウィザースケルトン', desc:'黒くて背が高いスケルトン', seq: rep(8, 250, i => fig({hbg:1, he:1, ha:1, nl:1, dy:i%2?-1:0, ex:[[WITHER_K,8,-4,8,8], [K,10,0,4,2], [WITHER_K,11,4,2,8], [WITHER_K,8,5,8,2], [WITHER_K,10,12,1,6], [WITHER_K,13,12,1,6], [STONE,16,2,2,10], [STONE_D,14,10,6,2]]}))}
];

// モブキャラクター（20〜29番）に変身エフェクト（煙/水しぶき）を追加
for(let i=20; i<30; i++) {
  const a = MOVES[i].seq[0][0], z = MOVES[i].seq[MOVES[i].seq.length-1][0];
  MOVES[i].seq = [[fig(),400], [fig({e:'c',ex:poof}),200], [[...a,...poof],200], ...MOVES[i].seq, [[...z,...poof],200], [fig({e:'h',cheek:1}),400]];
}
const G = { 'grid-actions': 'grid-mc4-actions', 'grid-blocks': 'grid-mc4-blocks', 'grid-mobs': 'grid-mc4-mobs' };
return MOVES.map(m => ({ ...m, grid: G[m.grid], vb: '-12 -18 48 40' }));
})();
// ── 16. マイクラ風 第4弾（121〜150）：別のファイルから。121〜140＝戦闘・冒険アクション／オモシロ・ギミック、141〜150＝モブに変身 第2弾 ──
const MC5 = (() => {
const O='#d97757', K='#1a1612', W='#f7f2ee', W2='#e0e0e0', RED='#e8452f', GOLD='#f2c14e', PINK='#e8687d', CHEEK='#f2a0a8';
const WOOD='#8b5a2b', GRAY='#999999', STONE_D='#6f6f6f', WATER='#3f76e4', FIRE='#f39c34', CYAN='#1da6a6', COP='#b87333';
const L_PURPLE='#c5a3ff', OBS='#1c1326', DIA='#4fd1d9', BROWN='#5c3a21', LEAF='#5aa35a', SLIME='#70c050', TNT='#d03020';
const ANVIL='#404040', ICE='#90d0f0', SKULK='#004050', SKULK_L='#10a0a0', PURPLE='#9b6bd6';
const GREEN='#3e8948', CREEPER='#50b040', ENDER='#101015', AXO='#ff99bb', WARDEN='#0d2830';
const PUMPKIN='#e87810', FOX='#e06818', DROWNED='#207868';

const poof = [[WATER,-2,4,4,3],[WATER,22,3,4,3],[WATER,8,-4,5,3],[WATER,3,12,4,3],[WATER,17,12,4,3],[WATER,10,14,4,2]];
const spark = (x,y) => [[GOLD,x+1,y,1,3],[GOLD,x,y+1,3,1]];
const zz = (x,y) => [[L_PURPLE,x,y,3,1],[L_PURPLE,x+1,y+1,1,1],[L_PURPLE,x,y+2,3,1]];

function fig(o={}) {
  const dx=o.dx||0, dy=o.dy||0, sq=o.sq||0, r=[];
  const R=(c,x,y,w,h)=>r.push([c,x+dx,y+dy,w,h]);
  if(!o.hbg) R(O,4,sq,16,12-sq);
  const lk=o.lk||0;
  const eye=(x,k)=>{
    if(k==='c') R(K,x+lk,sq+3,2,1); else if(k==='h'){ R(K,x-1,sq+3,1,1); R(K,x,sq+2,2,1); R(K,x+2,sq+3,1,1); }
    else if(k==='b') R(K,x,sq+1,2,3); else if(k==='d'){ [[-1,-1],[1,-1],[0,0],[-1,1],[1,1]].forEach(([a,b])=>R(K,x+1+a,sq+b+2,1,1)); }
    else R(K,x+lk,sq+2,2,2);
  };
  if(!o.he) { eye(6,o.e||'o'); eye(16,o.e||'o'); }
  if(o.mouth) R(K,11,sq+6,2,2);
  if(o.cheek){ R(CHEEK,5,sq+5,2,1); R(CHEEK,17,sq+5,2,1); }
  if(!o.nl) [4,8,14,18].forEach(x=>R(O,x,12,2,4));
  const arm=(side,p)=>{ let x=side?20:0; if(p==='up') R(O,x,sq,4,4); else if(p==='hi') R(O,x,sq-3,4,7); else R(O,x,sq+4,4,4); };
  if(!o.ha) { arm(0,o.l); arm(1,o.r); }
  return r.concat(o.ex||[]);
}

const rep = (n, ms, f) => Array.from({length:n}, (_, i) => [f(i), ms]);

const MOVES = [
  // --- 1. 戦闘・冒険アクション (1〜10) ---
  { grid:'grid-actions', name:'盾でガード', desc:'飛んできた矢をカンッ！と弾く', seq: [
    [fig({ex:[[GRAY,13,1,10,1],[GRAY,13,16,10,1],[GRAY,12,2,1,14],[GRAY,22,2,1,14],[WOOD,13,2,9,14]]}), 400],
    [fig({sq:1, e:'c', ex:[[GRAY,13,1,10,1],[GRAY,13,16,10,1],[GRAY,12,2,1,14],[GRAY,22,2,1,14],[WOOD,13,2,9,14], [STONE_D,30,8,2,2],[WOOD,32,8,6,2],[W,38,7,2,4]]}), 200],
    [fig({sq:1, e:'c', ex:[[GRAY,13,1,10,1],[GRAY,13,16,10,1],[GRAY,12,2,1,14],[GRAY,22,2,1,14],[WOOD,13,2,9,14], [STONE_D,23,8,2,2],[WOOD,25,8,6,2],[W,31,7,2,4]]}), 100],
    [fig({ex:[[GRAY,13,1,10,1],[GRAY,13,16,10,1],[GRAY,12,2,1,14],[GRAY,22,2,1,14],[WOOD,13,2,9,14], [STONE_D,26,14,2,2],[WOOD,28,14,6,2],[W,34,13,2,4], ...spark(22,6)]}), 400],
    [fig({e:'h', cheek:1, ex:[[GRAY,13,1,10,1],[GRAY,13,16,10,1],[GRAY,12,2,1,14],[GRAY,22,2,1,14],[WOOD,13,2,9,14]]}), 600]
  ]},
  { grid:'grid-actions', name:'弓を射る', desc:'ギリギリ…と引き絞って放つ', seq: [
    [fig({r:'up', ex:[[WOOD,20,2,2,12],[W2,22,2,1,12]]}), 400],
    [fig({r:'hi', e:'c', ex:[[WOOD,18,2,2,12],[W2,19,2,6,1],[W2,19,13,6,1],[W2,24,2,1,12], [STONE_D,16,7,2,2],[WOOD,18,7,6,2],[W,24,6,2,4]]}), 400],
    [fig({r:'hi', e:'c', sq:1, ex:[[WOOD,16,2,2,12],[W2,17,2,10,1],[W2,17,13,10,1],[W2,26,2,1,12], [STONE_D,14,7,2,2],[WOOD,16,7,10,2],[W,26,6,2,4]]}), 400],
    [fig({r:'hi', e:'b', ex:[[WOOD,18,2,2,12],[W2,19,2,6,1],[W2,19,13,6,1],[W2,24,2,1,12], [STONE_D,30,7,2,2],[WOOD,32,7,10,2],[W,42,6,2,4]]}), 200],
    [fig({e:'h', cheek:1, ex:[[WOOD,20,2,2,12],[W2,22,2,1,12]]}), 600]
  ]},
  { grid:'grid-actions', name:'トライデント投擲', desc:'シュバッ！と投げる', seq: [
    [fig({r:'hi', ex:[[CYAN,20,-6,2,16], [CYAN,18,-6,6,2], [CYAN,18,-8,2,2], [CYAN,22,-8,2,2]]}), 400],
    [fig({r:'hi', dx:-2, sq:1, e:'c', ex:[[CYAN,18,-6,2,16], [CYAN,16,-6,6,2], [CYAN,16,-8,2,2], [CYAN,20,-8,2,2]]}), 300],
    [fig({r:'hi', dx:2, e:'b', ex:[[CYAN,30,-2,16,2], [CYAN,30,-4,2,6], [CYAN,28,-4,2,2], [CYAN,28,0,2,2]]}), 200],
    [fig({e:'h', cheek:1}), 600]
  ]},
  { grid:'grid-actions', name:'ポーション', desc:'ゴクゴク飲んでパワーアップ', seq: [
    [fig({r:'up', ex:[[W,18,6,6,6], [W2,20,4,2,2], [PINK,18,8,6,4]]}), 400],
    [fig({r:'up', mouth:1, ex:[[W,20,4,6,6], [W2,22,2,2,2], [PINK,20,6,6,4]]}), 200],
    [fig({r:'up', e:'c', sq:1, mouth:1, ex:[[W,20,4,6,6], [W2,22,2,2,2], [PINK,20,7,6,3]]}), 200],
    [fig({e:'h', cheek:1, ex:[[W,18,6,6,6], [W2,20,4,2,2], ...zz(2,2), ...zz(20,-4)]}), 800]
  ]},
  { grid:'grid-actions', name:'望遠鏡', desc:'遠くを見つけてビックリ', seq: [
    [fig({l:'up', r:'up', ex:[[COP,12,6,8,4], [GOLD,10,6,2,4], [GOLD,20,6,2,4]]}), 400],
    [fig({l:'hi', r:'hi', ex:[[COP,12,2,8,4], [GOLD,10,2,2,4], [GOLD,20,2,2,4]]}), 400],
    [fig({l:'hi', r:'hi', sq:1, e:'b', ex:[[COP,12,3,8,4], [GOLD,10,3,2,4], [GOLD,20,3,2,4]]}), 400],
    [fig({e:'h', cheek:1, ex:[[COP,12,6,8,4], [GOLD,10,6,2,4], [GOLD,20,6,2,4]]}), 600]
  ]},
  { grid:'grid-actions', name:'金のリンゴ', desc:'食べるとオーラを纏う', seq: [
    [fig({ex:[[GOLD,18,8,6,6], [LEAF,20,6,2,2]]}), 400],
    [fig({r:'up', mouth:1, ex:[[GOLD,18,8,5,6], [LEAF,20,6,2,2]]}), 200],
    [fig({r:'up', e:'c', sq:1, mouth:1, ex:[[GOLD,18,8,4,6], [LEAF,20,6,2,2]]}), 200],
    [fig({e:'h', cheek:1, ex:[...spark(2,2), ...spark(20,0), ...spark(-4,10), ...spark(24,14)]}), 800]
  ]},
  { grid:'grid-actions', name:'ボートを漕ぐ', desc:'オールをえっほえっほと漕ぐ', seq: [
    [fig({nl:1, r:'up', ex:[[WOOD,-4,12,28,6], [WOOD,-8,10,4,2], [WOOD,24,10,4,2], [WATER,-12,16,44,4], [WOOD,12,6,10,2]]}), 300],
    [fig({nl:1, dx:1, r:'hi', e:'c', sq:1, ex:[[WOOD,-4,12,28,6], [WOOD,-8,10,4,2], [WOOD,24,10,4,2], [WATER,-12,16,44,4], [WOOD,16,4,2,12], [WATER,16,14,4,2]]}), 300],
    [fig({nl:1, dx:2, r:'up', ex:[[WOOD,-4,12,28,6], [WOOD,-8,10,4,2], [WOOD,24,10,4,2], [WATER,-12,16,44,4], [WOOD,12,6,10,2]]}), 300],
    [fig({nl:1, dx:3, r:'hi', e:'h', cheek:1, sq:1, ex:[[WOOD,-4,12,28,6], [WOOD,-8,10,4,2], [WOOD,24,10,4,2], [WATER,-12,16,44,4], [WOOD,16,4,2,12], [WATER,16,14,4,2]]}), 300]
  ]},
  { grid:'grid-actions', name:'マシュマロ焼き', desc:'火に近づけすぎて焦がす', seq: [
    [fig({r:'up', ex:[[WOOD,22,14,8,2],[FIRE,24,10,4,4], [WOOD,10,6,12,1],[W,22,5,4,3]]}), 400],
    [fig({r:'up', e:'c', sq:1, ex:[[WOOD,22,14,8,2],[FIRE,24,10,4,4], [WOOD,12,8,12,1],[W,24,7,4,3]]}), 400],
    [fig({r:'up', e:'b', ex:[[WOOD,22,14,8,2],[FIRE,24,10,4,4], [WOOD,12,8,12,1],[BROWN,24,7,4,3], [GRAY,24,3,4,2]]}), 400],
    [fig({l:'hi', r:'up', e:'d', ex:[[WOOD,22,14,8,2],[FIRE,24,10,4,4], [WOOD,10,6,12,1],[BROWN,22,5,4,3]]}), 600]
  ]},
  { grid:'grid-actions', name:'エンチャント', desc:'本がフワフワ浮いて文字を吸収', seq: [
    [fig({dx:-4, ex:[[OBS,24,10,12,6],[RED,24,8,12,2],[W,28,6,4,2]]}), 400],
    [fig({dx:-4, e:'o', ex:[[OBS,24,10,12,6],[RED,24,8,12,2],[W,28,4,4,2], [W2,26,2,8,2]]}), 200],
    [fig({dx:-4, e:'b', sq:1, ex:[[OBS,24,10,12,6],[RED,24,8,12,2],[W,28,2,4,2], [W2,26,0,8,2], [L_PURPLE,20,4,2,2], [L_PURPLE,22,0,2,2]]}), 400],
    [fig({dx:-4, e:'h', cheek:1, ex:[[OBS,24,10,12,6],[RED,24,8,12,2],[W,28,6,4,2], ...spark(10,2)]}), 600]
  ]},
  { grid:'grid-actions', name:'スニーク歩き', desc:'足音を立てないようにこっそり', seq: rep(8, 200, i => fig({dx:i*2-4, dy:3, sq:1, e:i%2?'c':'o', l:'up', r:'hi', ex:[]}))},

  // --- 2. オモシロ・ギミック (11〜20) ---
  { grid:'grid-blocks', name:'スライムブロック', desc:'ボヨーン！と大ジャンプ', seq: [
    [fig({ex:[[SLIME,6,12,12,4]]}), 400],
    [fig({dy:2, sq:2, e:'c', ex:[[SLIME,6,13,12,3]]}), 200],
    [fig({dy:-12, l:'hi', r:'hi', e:'b', ex:[[SLIME,6,12,12,4]]}), 300],
    [fig({dy:-16, l:'hi', r:'hi', e:'h', cheek:1, ex:[[SLIME,6,12,12,4]]}), 400],
    [fig({dy:0, e:'h', ex:[[SLIME,6,12,12,4]]}), 400]
  ]},
  { grid:'grid-blocks', name:'ピストン', desc:'ガシャン！と横に押し出される', seq: [
    [fig({dx:-6, ex:[[WOOD,22,4,4,12],[GRAY,18,6,4,8]]}), 400],
    [fig({dx:-6, sq:1, e:'c', ex:[[WOOD,22,4,4,12],[GRAY,18,6,4,8]]}), 200],
    [fig({dx:6, l:'hi', r:'hi', e:'b', ex:[[WOOD,22,4,4,12],[WOOD,14,8,8,4],[GRAY,10,6,4,8]]}), 300],
    [fig({dx:10, e:'d', cheek:1, ex:[[WOOD,22,4,4,12],[GRAY,18,6,4,8]]}), 500]
  ]},
  { grid:'grid-blocks', name:'TNT爆発', desc:'シューー…と焦って逃げる', seq: [
    [fig({r:'up', ex:[[TNT,20,8,8,8],[W,22,6,4,2],[FIRE,23,3,2,3]]}), 400],
    [fig({dx:-4, l:'hi', r:'hi', e:'b', ex:[[TNT,20,8,8,8],[W,22,6,4,2],[FIRE,23,2,2,4]]}), 200],
    [fig({dx:-12, l:'hi', r:'hi', e:'d', ex:[[TNT,20,8,8,8],[W2,20,8,8,8],[FIRE,23,1,2,5]]}), 200],
    [fig({dx:-16, l:'hi', r:'hi', e:'d', ex:[[FIRE,16,0,16,16],[RED,18,2,12,12], ...spark(12,4)]}), 500]
  ]},
  { grid:'grid-blocks', name:'ネザーポータル', desc:'紫のモヤモヤに吸い込まれる', seq: [
    [fig({ex:[[OBS,16,-4,4,24],[OBS,28,-4,4,24],[PURPLE,20,-4,8,24]]}), 400],
    [fig({dx:2, e:'b', ex:[[OBS,16,-4,4,24],[OBS,28,-4,4,24],[PURPLE,20,-4,8,24],[L_PURPLE,18,4,4,4]]}), 300],
    [fig({dx:6, sq:1, e:'c', ex:[[OBS,16,-4,4,24],[OBS,28,-4,4,24],[PURPLE,20,-4,8,24],[L_PURPLE,22,2,6,6]]}), 300],
    [fig({ex:[[OBS,16,-4,4,24],[OBS,28,-4,4,24],[PURPLE,20,-4,8,24],[L_PURPLE,20,0,8,16]]}), 600]
  ]},
  { grid:'grid-blocks', name:'シュルカーの弾', desc:'当たってフワフワ浮遊', seq: [
    [fig({ex:[[PURPLE,22,6,4,4],[L_PURPLE,21,5,6,6]]}), 400],
    [fig({sq:1, e:'c', ex:[[PURPLE,18,6,4,4], ...spark(16,4)]}), 200],
    [fig({dy:-6, l:'hi', r:'hi', e:'b', ex:[...zz(8,16),...zz(16,16)]}), 300],
    [fig({dy:-12, l:'hi', r:'hi', e:'h', cheek:1, ex:[...zz(6,20),...zz(18,20)]}), 600]
  ]},
  { grid:'grid-blocks', name:'金床落下', desc:'上からドスン！とペチャンコ', seq: [
    [fig({ex:[[ANVIL,8,-16,8,6]]}), 300],
    [fig({e:'b', ex:[[ANVIL,8,-6,8,6]]}), 200],
    [fig({e:'b', ex:[[ANVIL,8,0,8,6]]}), 100],
    [fig({sq:3, dy:4, e:'d', l:'hi', r:'hi', ex:[[ANVIL,8,6,8,6], ...spark(4,10)]}), 600]
  ]},
  { grid:'grid-blocks', name:'トラップドア', desc:'パタン！と下に落っこちる', seq: [
    [fig({ex:[[WOOD,-4,12,32,2]]}), 400],
    [fig({sq:1, e:'b', ex:[[WOOD,-4,12,32,2]]}), 200],
    [fig({dy:4, l:'hi', r:'hi', e:'d', ex:[[WOOD,12,12,2,12]]}), 300],
    [fig({dy:12, l:'hi', r:'hi', e:'d', ex:[[WOOD,12,12,2,12]]}), 500]
  ]},
  { grid:'grid-blocks', name:'氷で滑る', desc:'ツルツル滑って豪快に転ぶ', seq: [
    [fig({dx:-8, ex:[[ICE,-20,14,50,2]]}), 300],
    [fig({dx:-2, r:'hi', e:'b', ex:[[ICE,-20,14,50,2]]}), 200],
    [fig({dx:4, dy:2, sq:2, l:'hi', r:'hi', e:'d', ex:[[ICE,-20,14,50,2]]}), 200],
    [fig({dx:10, dy:6, sq:3, e:'d', ex:[[ICE,-20,14,50,2], ...spark(18,12)]}), 600]
  ]},
  { grid:'grid-blocks', name:'ディスペンサー', desc:'飛んできた矢を間一髪で避ける', seq: [
    [fig({ex:[[GRAY,20,4,8,10],[K,22,8,4,2]]}), 400],
    [fig({ex:[[GRAY,20,4,8,10],[K,22,8,4,2],[STONE_D,14,8,4,2],[W,18,7,2,4]]}), 150],
    [fig({dy:4, sq:2, e:'c', ex:[[GRAY,20,4,8,10],[K,22,8,4,2],[STONE_D,6,8,4,2],[W,10,7,2,4]]}), 300],
    [fig({e:'h', cheek:1, ex:[[GRAY,20,4,8,10],[K,22,8,4,2]]}), 600]
  ]},
  { grid:'grid-blocks', name:'スカルクセンサー', desc:'音を立ててブルブル反応', seq: [
    [fig({ex:[[SKULK,18,8,10,6],[SKULK_L,20,4,2,4],[SKULK_L,26,4,2,4]]}), 400],
    [fig({sq:1, r:'hi', e:'b', ex:[[SKULK,18,8,10,6],[SKULK_L,20,4,2,4],[SKULK_L,26,4,2,4]]}), 200],
    [fig({sq:1, r:'hi', e:'c', ex:[[SKULK,18,8,10,6],[SKULK_L,20,2,2,6],[SKULK_L,26,2,2,6],...spark(20,0)]}), 400],
    [fig({l:'hi', r:'hi', e:'d', ex:[[SKULK,18,8,10,6],[SKULK_L,20,2,2,6],[SKULK_L,26,2,2,6],...spark(20,-2)]}), 600]
  ]},

  // --- 3. モブに変身 第2弾 (21〜30) ---
  { grid:'grid-mobs', name:'クリーパー風', desc:'シューー…と膨らんでドカン！', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[CREEPER,6,0,12,12],[K,8,3,2,3],[K,14,3,2,3],[K,10,6,4,4],[CREEPER,6,12,4,4],[CREEPER,14,12,4,4]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-2, ex:[[W2,4,-2,16,14],[K,8,3,2,3],[K,14,3,2,3],[K,10,6,4,4],[CREEPER,6,12,4,4],[CREEPER,14,12,4,4]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-4, ex:[[FIRE,0,-6,24,20],[RED,2,-4,20,16],...spark(4,0)]}), 500]
  ]},
  { grid:'grid-mobs', name:'エンダーマン風', desc:'紫のパーティクルを出して瞬間移動', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[ENDER,8,-6,8,22],[PURPLE,9,-2,2,1],[PURPLE,13,-2,2,1]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[ENDER,8,-6,8,22],[PURPLE,9,-2,2,1],[PURPLE,13,-2,2,1],...zz(4,-4),...zz(16,-2)]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dx:12, ex:[[ENDER,8,-6,8,22],[PURPLE,9,-2,2,1],[PURPLE,13,-2,2,1],...zz(10,-4)]}), 500]
  ]},
  { grid:'grid-mobs', name:'ウーパールーパー風', desc:'ダメージを受けて死んだふり', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[AXO,4,8,14,6],[RED,2,6,3,4],[RED,17,6,3,4],[K,7,10,1,1],[K,14,10,1,1]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:3, ex:[[AXO,4,8,14,6],[RED,2,6,3,4],[RED,17,6,3,4],[K,7,10,2,1],[K,14,10,2,1]]}), 600]
  ]},
  { grid:'grid-mobs', name:'ウォーデン風', desc:'地面からゴゴゴ…と這い出る', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, dy:12, ex:[[WARDEN,4,0,16,12],[SKULK_L,2,-4,4,6],[SKULK_L,18,-4,4,6],[CYAN,9,4,6,4]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:6, ex:[[WARDEN,4,0,16,12],[SKULK_L,2,-4,4,6],[SKULK_L,18,-4,4,6],[CYAN,9,4,6,4]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:0, ex:[[WARDEN,4,0,16,12],[SKULK_L,2,-4,4,6],[SKULK_L,18,-4,4,6],[CYAN,9,4,6,4],[WARDEN,6,12,4,4],[WARDEN,14,12,4,4]]}), 600]
  ]},
  { grid:'grid-mobs', name:'スライム風', desc:'ペチャン、ペチャンと跳ねる', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[SLIME,6,4,12,10],[K,8,8,2,2],[K,14,8,2,2]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:3, ex:[[SLIME,4,7,16,7],[K,7,10,2,2],[K,15,10,2,2]]}), 150],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-8, ex:[[SLIME,7,0,10,14],[K,8,4,2,2],[K,14,4,2,2]]}), 300],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[SLIME,6,4,12,10],[K,8,8,2,2],[K,14,8,2,2]]}), 300]
  ]},
  { grid:'grid-mobs', name:'スノウゴーレム風', desc:'カボチャを被って雪玉を投げる', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PUMPKIN,6,0,12,10],[K,8,4,2,2],[K,14,4,2,2],[W,8,10,8,6]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PUMPKIN,6,0,12,10],[K,8,4,2,2],[K,14,4,2,2],[W,8,10,8,6],[W,18,6,3,3]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[PUMPKIN,6,0,12,10],[K,8,4,2,2],[K,14,4,2,2],[W,8,10,8,6],[W,26,8,3,3]]}), 400]
  ]},
  { grid:'grid-mobs', name:'ガスト風', desc:'涙を流しながら火の玉を吐く', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-2, ex:[[W,4,0,16,12],[K,7,4,2,2],[K,15,4,2,2],[WATER,7,7,2,3],[WATER,15,7,2,3],[W,6,12,2,4],[W,10,12,2,5],[W,14,12,2,4]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-2, ex:[[W,4,0,16,12],[RED,7,4,2,2],[RED,15,4,2,2],[RED,10,8,4,3],[FIRE,18,7,4,4]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:-2, ex:[[W,4,0,16,12],[RED,7,4,2,2],[RED,15,4,2,2],[FIRE,26,6,6,6],...spark(24,4)]}), 500]
  ]},
  { grid:'grid-mobs', name:'ファントム風', desc:'空から急降下してくる', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, dx:-12, dy:-12, ex:[[SKULK,6,4,12,6],[SKULK_L,0,4,6,2],[SKULK_L,18,4,6,2],[GREEN,12,5,2,2]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dx:-4, dy:-4, ex:[[SKULK,6,4,12,6],[SKULK_L,2,0,4,4],[SKULK_L,18,0,4,4],[GREEN,12,5,2,2]]}), 200],
    [fig({hbg:1, he:1, ha:1, nl:1, dx:4, dy:4, ex:[[SKULK,6,4,12,6],[SKULK_L,0,4,6,2],[SKULK_L,18,4,6,2],[GREEN,12,5,2,2]]}), 400]
  ]},
  { grid:'grid-mobs', name:'キツネ風', desc:'くるっと丸まってスヤスヤ寝る', seq: [
    [fig({hbg:1, he:1, ha:1, nl:1, ex:[[FOX,6,2,12,8],[W,6,8,12,2],[K,8,5,2,2],[K,14,5,2,2],[FOX,4,0,4,3],[FOX,14,0,4,3]]}), 400],
    [fig({hbg:1, he:1, ha:1, nl:1, dy:3, ex:[[FOX,6,4,10,8],[W,14,4,4,8],[K,8,7,2,1],[K,12,7,2,1],...zz(16,0)]}), 600]
  ]},
  { grid:'grid-mobs', name:'ドラウンド風', desc:'トライデントを構えて水中を泳ぐ', seq: rep(8, 250, i => fig({hbg:1, he:1, ha:1, nl:1, dx:i%2?2:0, ex:[[DROWNED,6,4,12,8],[CYAN,8,6,2,2],[CYAN,14,6,2,2],[DROWNED,4,12,4,2],[DROWNED,14,12,4,2],[CYAN,18,-2,2,14],[WATER,-10,14,40,2]]}))}
];

// モブに変身（20〜29番）に変身エフェクト（煙）を追加
for(let i=20; i<30; i++) {
  const a = MOVES[i].seq[0][0], z = MOVES[i].seq[MOVES[i].seq.length-1][0];
  MOVES[i].seq = [[fig(),400], [fig({e:'c',ex:poof}),200], [[...a,...poof],200], ...MOVES[i].seq, [[...z,...poof],200], [fig({e:'h',cheek:1}),400]];
}
const G = { 'grid-actions': 'grid-mc5-actions', 'grid-blocks': 'grid-mc5-blocks', 'grid-mobs': 'grid-mc5-mobs' };
return MOVES.map(m => ({ ...m, grid: G[m.grid], vb: '-12 -18 48 40' }));
})();


// ぜんぶで 490 個（401〜490 は HUNTER×HUNTER の90人への変身。151〜400 は 上の ccHenshin のクリーパー・ゾンビ・村人・チキンジョッキーへの変身と、カズさん・まぐにぃさんの装備と動き、いろいろなモブへの変身、オレンジのキャラクターの マイクラ風の変身 20 個 × 3 と 10 個）
window.CC_EXTRA_ALL = [...BLOCKS, ...MOBS, ...MC2, ...MC3, ...MC4, ...MC5, ...(window.CC_HENSHIN_MOVES || [])];
// ★いまは 51〜150 番（MC2〜MC5 のあたり）を いったん取りのぞいて、390 個にする（データは CC_EXTRA_ALL に そのまま残している）
//   番号は つめて 1〜390 になる（もとの 151〜490 が 51〜390）。もどすときは HIDE を [] にする
const HIDE = [51, 150]; // 取りのぞく もとの番号（はじめ・おわり）
window.CC_EXTRA = window.CC_EXTRA_ALL.filter((_, i) => !HIDE.length || i + 1 < HIDE[0] || i + 1 > HIDE[1]);
})();
(function ccTyping() {
  // svg.cc-anim は 毎回さがす（このファイルを 絵より先に読みこんでも、あとから絵を足しても 動くように）
  // 各コマの絵：「色の記号 + x,y,幅,高さ をスペース区切り」を | でつないだもの
  //   O=体のオレンジ  D=横を向いたときの影  G=ノートパソコン  K=目
  const FRAMES = ["O4,0,16,2 4,2,2,2 8,2,8,2 18,2,2,2 0,4,24,4 4,8,16,4 4,12,2,4 8,12,2,4 14,12,2,4 18,12,2,4|K6,2,2,2 16,2,2,2","O4,1,16,2 0,3,20,2 0,5,16,1 18,5,2,2 0,6,6,1 9,6,7,1 4,7,19,3 4,10,18,1 4,11,16,2 4,13,2,3 8,13,2,3 14,13,2,3 18,13,2,3|K16,5,2,2 6,6,3,1","O4,1,16,2 0,3,20,2 0,5,16,1 18,5,2,2 0,6,6,1 9,6,7,1 4,7,16,1 4,8,19,3 4,11,18,1 4,12,16,1 4,13,2,3 8,13,2,3 14,13,2,3 18,13,2,3|K16,5,2,2 6,6,3,1","O4,0,16,2 4,2,2,2 8,2,8,2 18,2,6,2 4,4,20,1 0,5,24,1 0,6,23,1 0,7,22,1 0,8,20,1 4,9,16,3 4,12,2,4 8,12,2,4 14,12,2,4 18,12,2,4|G21,-3,2,1 21,-2,4,1 23,-1,5,1 25,0,3,1 21,1,7,1|K6,2,2,2 16,2,2,2","O20,-1,4,1 4,0,20,2 4,2,2,2 8,2,8,2 18,2,6,1 18,3,2,1 4,4,16,1 0,5,20,4 4,9,16,3 4,12,2,4 8,12,2,4 14,12,2,4 18,12,2,4|G26,-7,1,5 21,-2,6,1|K6,2,2,2 16,2,2,2","O4,0,16,3 4,3,2,1 8,3,8,2 18,3,2,2 0,4,6,1 0,5,22,1 0,6,23,1 0,7,22,1 4,8,18,1 4,9,20,3 4,12,2,4 8,12,2,4 14,12,2,4 18,12,2,4|G30,3,2,1 29,4,4,1 28,5,5,1 28,6,4,1 22,7,9,1 22,8,7,1|K6,3,2,2 16,3,2,2","O4,0,16,3 4,3,2,2 8,3,8,2 18,3,2,2 0,5,20,4 4,9,20,3 4,12,2,4 8,12,2,4 14,12,2,4 18,12,6,1 18,13,2,3|G32,10,1,1 31,11,2,1 30,12,2,1 29,13,2,1 28,14,2,1 23,15,6,1|K6,3,2,2 16,3,2,2","O4,0,16,3 0,3,6,2 8,3,8,2 18,3,2,1 18,4,6,1 0,5,24,2 4,7,20,1 4,8,16,4 4,12,2,4 8,12,2,4 14,12,2,4 18,12,2,4|G32,12,2,1 30,13,2,1 28,14,2,1 23,15,6,1|K6,3,2,2 16,3,2,2","O8,-4,4,2 18,-4,4,2 7,-2,5,1 18,-2,5,1 7,-1,16,3 7,2,14,1 7,3,1,2 10,3,8,2 20,3,1,2 7,5,14,7 6,12,1,4 9,12,2,4 15,12,2,4 19,12,2,4|D5,-1,2,13 5,12,1,4|G32,9,1,1 31,10,2,1 30,11,2,1 29,12,2,1 28,13,2,1 23,14,6,1|K8,3,2,2 18,3,2,2","O10,1,12,3 23,3,2,1 10,4,2,3 14,4,6,3 23,4,3,2 24,6,2,1 10,7,12,3 25,7,1,1 10,10,16,2 10,12,2,2 16,12,2,2 20,12,6,2 9,14,3,1 15,14,3,1 19,14,7,1 9,15,2,1 15,15,2,1 19,15,2,1|D6,1,4,11 22,2,1,4 22,6,2,1 22,7,3,1 22,8,4,1 6,12,2,2 5,14,3,1 5,15,2,1|G32,10,1,1 31,11,2,1 30,12,2,1 29,13,2,1 28,14,2,1 23,15,6,1|K12,4,2,3 20,4,2,3","O10,2,12,3 10,5,2,2 14,5,6,2 10,7,12,1 10,8,15,4 10,12,12,1 10,13,2,1 16,13,2,1 20,13,2,1 9,14,3,1 15,14,3,1 19,14,3,1 9,15,2,1 15,15,2,1 19,15,2,1|D6,2,4,11 25,9,1,3 22,12,4,1 6,13,2,1 5,14,3,1 5,15,2,1|G32,9,1,1 31,10,2,1 30,11,2,1 29,12,2,1 28,13,2,1 23,14,6,1|K12,5,2,2 20,5,2,2","O10,2,12,3 10,5,2,2 14,5,6,2 10,7,15,4 10,11,12,2 10,13,2,1 16,13,2,1 20,13,2,1 9,14,3,1 15,14,3,1 19,14,3,1 9,15,2,1 15,15,2,1 19,15,2,1|D6,2,4,11 22,12,4,3 6,13,2,1 5,14,3,1 5,15,2,1|G32,10,1,1 31,11,2,1 30,12,2,1 29,13,2,1 28,14,2,1 23,15,6,1|K12,5,2,2 20,5,2,2","O10,2,12,3 10,5,2,2 14,5,6,2 10,7,12,2 10,9,15,4 10,13,2,1 16,13,2,1 20,13,5,1 9,14,3,1 15,14,3,1 19,14,3,1 9,15,2,1 15,15,2,1 19,15,2,1|D6,2,4,11 22,7,4,2 25,9,1,3 6,13,2,1 5,14,3,1 5,15,2,1|G32,10,1,1 31,11,2,1 30,12,2,1 29,13,2,1 28,14,2,1 23,15,6,1|K12,5,2,2 20,5,2,2","O10,2,12,3 10,5,2,2 14,5,6,2 10,7,15,4 10,11,12,2 10,13,2,1 16,13,2,1 20,13,2,1 9,14,3,1 15,14,3,1 19,14,3,1 9,15,2,1 15,15,2,1 19,15,2,1 22,15,4,1|D6,2,4,11 22,12,4,3 6,13,2,1 5,14,3,1 5,15,2,1|G32,10,1,1 31,11,2,1 30,12,2,1 29,13,2,1 28,14,2,1 26,15,3,1|K12,5,2,2 20,5,2,2","O10,2,12,3 10,5,2,2 14,5,6,2 10,7,12,2 10,9,15,3 10,12,16,1 10,13,2,1 16,13,2,1 20,13,6,1 9,14,3,1 15,14,3,1 19,14,7,1 9,15,2,1 15,15,2,1 19,15,2,1 22,15,4,1|D6,2,4,11 22,7,4,2 25,9,1,3 6,13,2,1 5,14,3,1 5,15,2,1|G32,10,1,1 31,11,2,1 30,12,2,1 29,13,2,1 28,14,2,1 26,15,3,1|K12,5,2,2 20,5,2,2","O9,1,12,3 22,3,2,1 9,4,2,3 13,4,6,3 22,4,3,2 23,6,2,1 9,7,12,2 24,7,1,1 9,9,14,1 9,10,16,2 10,12,2,2 16,12,2,2 19,12,7,1 20,13,6,1 9,14,3,1 15,14,3,1 19,14,7,1 9,15,2,1 15,15,2,1 19,15,2,1|D5,1,4,11 21,2,1,4 21,6,2,1 21,7,3,1 21,8,4,1 6,12,2,2 5,14,3,1 5,15,2,1|G31,6,1,1 30,7,2,1 29,8,2,1 28,9,2,1 27,10,2,1 25,11,3,1|K11,4,2,3 19,4,2,3","O6,0,14,3 6,3,2,1 10,3,8,2 2,5,5,4 8,5,14,1 8,6,15,1 8,7,16,1 8,8,18,2 6,10,15,1 6,11,14,1 8,12,2,4 14,12,2,4 18,12,2,4|D4,0,2,4 4,4,4,1 7,5,1,4 4,9,4,1 4,10,2,6|G22,5,2,1 23,6,2,1 24,7,3,1 26,8,2,2 21,10,7,1|K8,3,2,2 18,3,2,2","O4,1,16,2 0,3,20,2 0,5,6,2 8,5,8,2 18,5,2,2 4,7,16,1 4,8,19,3 4,11,18,1 4,12,16,1 4,13,2,3 8,13,2,3 14,13,2,3 18,13,2,3|K6,5,2,2 16,5,2,2","O4,1,16,2 0,3,20,2 0,5,6,2 8,5,8,2 18,5,2,2 4,7,16,1 4,8,18,4 4,12,16,1 4,13,2,3 8,13,2,3 14,13,2,3 18,13,2,3|K6,5,2,2 16,5,2,2","O4,0,16,2 4,2,2,2 8,2,8,2 18,2,2,2 4,4,16,1 0,5,24,4 4,9,16,3 4,12,2,4 8,12,2,4 14,12,2,4 18,12,2,4|K6,2,2,2 16,2,2,2"];
  // [コマ番号, 長さ（1/30秒単位）] の順番（動画と同じ。最初の60＝2秒は正面で止まっている）
  const SEQ = [[0,60],[1,3],[2,2],[1,3],[2,5],[3,2],[4,5],[5,3],[6,2],[7,2],[8,3],[9,3],[10,2],[11,3],[12,2],[10,3],[11,2],[12,3],[10,2],[11,3],[12,3],[10,2],[11,3],[12,2],[10,3],[11,2],[12,3],[10,2],[13,2],[14,3],[15,2],[16,3],[17,5],[18,3],[19,2],[0,29]];
  const COLOR = { O: '#d97757', D: '#b46348', G: '#8a8a8a', K: '#1a1612' };
  const svgOf = FRAMES.map(f => f.split('|').map(part => {
    const fill = COLOR[part[0]];
    return part.slice(1).split(' ').map(r => {
      const [x, y, w, h] = r.split(',');
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
    }).join('');
  }).join(''));
  const total = SEQ.reduce((s, q) => s + q[1], 0);
  // data-skip="60" を付けた絵（オープニング）は、最初の止まっている2秒を飛ばしてすぐ打ちはじめる
  const shown = new Map();
  function frameAt(t) {
    t %= total;
    for (const [f, len] of SEQ) { if (t < len) return f; t -= len; }
    return SEQ[0][0];
  }
  // 夜の0時〜朝7時は「おやすみ」：目をとじて、すうすう息をして、Zが浮かぶ（0.48秒ごとに8コマ）
  const SLEEP0 = svgOf.length, rect = (x, y, w, h, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
  const zee = (x, y) => rect(x, y, 3, 1, '#8fa3d6') + rect(x + 1, y + 1, 1, 1, '#8fa3d6') + rect(x, y + 2, 3, 1, '#8fa3d6');
  for (let i = 0; i < 8; i++) {
    const s = i % 2, k = i % 4, o = COLOR.O;
    // 寝ているときは右に5マスずらして、体を下の「Claude Code」の文字の真ん中にそろえる（絵の幅34マスの真ん中＝17）
    svgOf.push('<g transform="translate(5,0)">' + rect(4, s, 16, 12 - s, o) + rect(0, s + 4, 4, 4, o) + rect(20, s + 4, 4, 4, o) +
      [4, 8, 14, 18].map(x => rect(x, 12, 2, 4, o)).join('') +
      rect(6, s * 2 + 3, 2, 1, COLOR.K) + rect(16, s * 2 + 3, 2, 1, COLOR.K) +
      zee(22, -1 - k) + (k >= 2 ? zee(26, -6 - (k - 2)) : '') + '</g>');
  }
  // 朝7時〜夜0時は、最初にパソコンを1回打ったあとは、マイクラふうの動き（いまは 390 個）から ずっと出す（出し方は 自己紹介の画面で えらぶ）。動き（見本ページの番号）からランダムに1つを1回だけ入れる
  const TYPE_MS = total * 1000 / 30, EVERY = 1;
  let mv = null, typeOff = 0, nextAt = TYPE_MS * EVERY, done = 0, last = -1;
  const RUN = Infinity;   // 最初にパソコンを1回打ったあとは、ずっとランダムな動きを続ける
  // 一度出た動きは、ぜんぶ一周するまで出さない（混ぜた順番で1つずつ出す。一周したら、また混ぜなおす）
  //   残りの順番はこの端末に覚えておくので、アプリを閉じて開き直しても続きから出る
  // ★CHECK_ORDER（「新しい順」をえらんだとき true）の間は ランダムではなく、いちばん新しい動き（最後の番号）から順番に出す
  //   （390 → 389 → … → 1 → また 390）。新しい順の間は 続きを覚えないので、アプリを開くたびに いちばん新しい番号から始まる
  // ★SHOW_NO が true の間は、ランダムでも 左上に いま出ている動きの番号を出す（false にすると 番号を消す）
  // ★動きの出し方（順番）は 自己紹介の画面で えらべる（window.CC_ORDER.set）。えらんだものは この端末に覚える
  //   new … いちばん新しい番号から順番（390 → 389 → … → 1）／ all … 全部からランダム
  //   '1-100' などの はんい … その番号の中だけで ランダム
  const SHOW_NO = true, ORDER_KEY = 'ccMoveOrder';
  const ORDERS = [['new', '新しい順'], ['all', '全部ランダム'], ['1-100', '1〜100'], ['101-200', '101〜200'], ['201-300', '201〜300'], ['301-330', '301〜330'], ['331-350', '331〜350'], ['351-370', '351〜370'], ['371-390', '371〜390']];
  let order = 'new';
  try { const o = localStorage.getItem(ORDER_KEY); if (ORDERS.some(([k]) => k === o)) order = o; } catch (e) {}
  let CHECK_ORDER = order === 'new';
  const bagKey = () => 'ccMoveBag_' + order;
  let bag = [];
  function loadBag() {
    bag = [];
    if (!CHECK_ORDER) try { const b = JSON.parse(localStorage.getItem(bagKey()) || '[]'); if (Array.isArray(b) && b.every(i => Number.isInteger(i) && i >= 0 && i < window.CC_EXTRA.length)) bag = b; } catch (e) {}
  }
  loadBag();
  // いまの出し方で 出してよい番号（0 から数える）
  function pool() {
    const all = window.CC_EXTRA.map((_, i) => i), m = /^(\d+)-(\d+)$/.exec(order);
    return m ? all.filter(i => i + 1 >= +m[1] && i + 1 <= +m[2]) : all;
  }
  function nextPick() {
    if (!bag.length) {
      bag = pool();   // 最後から取り出すので、このままだと 新しい番号から順番になる
      if (!CHECK_ORDER) for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (!CHECK_ORDER && bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];   // 一周のつなぎ目でも同じ動きを続けない
    }
    last = bag.pop();
    if (!CHECK_ORDER) try { localStorage.setItem(bagKey(), JSON.stringify(bag)); } catch (e) {}
    return last;
  }
  // 自己紹介の画面から 出し方を変える。変えたら すぐ 次の動きを その出し方で始める
  window.CC_ORDER = {
    list: ORDERS, get: () => order,
    set(k) {
      if (!ORDERS.some(([o]) => o === k)) return;
      order = k; CHECK_ORDER = k === 'new';
      try { localStorage.setItem(ORDER_KEY, k); } catch (e) {}
      loadBag(); last = -1; mv = null; nextAt = performance.now();
    },
  };
  function extraFrame(now) {
    if (!mv) {
      if (now < nextAt) return null;
      const n = 1 + nextPick();   // 一周するまで同じ動きは出ない
      const seq = window.CC_EXTRA[n - 1].seq;
      const name = window.CC_EXTRA[n - 1].name || '';
      mv = { n, t0: now, seq, total: seq.reduce((s, q) => s + q[1], 0), label: name.split('：')[0],
             html: seq.map(q => '<g transform="translate(5,0)">' + q[0].map(([c, x, y, w, h]) => rect(x, y, w, h, c)).join('') + '</g>') };
      // ★チェック用：CHECK_ORDER か SHOW_NO が true の間は 左上に いま出ている動きの番号を出す
      if (CHECK_ORDER || SHOW_NO) mv.html = mv.html.map(h => h + '<text x="0.3" y="-3.2" font-size="4" font-weight="bold" fill="#c0502a" stroke="#ffffff" stroke-width="0.6" paint-order="stroke">' + n + '</text>');
    }
    let t = now - mv.t0;
    if (t >= mv.total) {   // 1回おわったら、パソコンを打つ動きを最初から（また1回打ったら次の動き）
      mv = null; done = (done + 1) % RUN;
      if (done) { nextAt = now; return extraFrame(now); }   // 続けて次の動き
      typeOff = Math.floor(now / (1000 / 30)); nextAt = now + TYPE_MS * EVERY; return null;
    }
    for (let k = 0; k < mv.seq.length; k++) { if (t < mv.seq[k][1]) return mv.html[k]; t -= mv.seq[k][1]; }
    return mv.html[0];
  }
  let shownLabel = null;
  function draw(now) {
    const base = Math.floor(now / (1000 / 30));
    const hour = new Date().getHours();
    const extra = (hour >= 7 || window.CC_AWAKE) && window.CC_EXTRA ? extraFrame(now) : null;   // ときどき入る動き
    const night = new Date().getHours() < 7 && !window.CC_AWAKE;
    // 動きの名前（「ゴン：ツンツン黒髪」なら「ゴン」）を、ページの .cc-move-name に出す。パソコンを打つ・ねている間は 空にする
    const label = extra && mv ? mv.label : '';
    if (label !== shownLabel) { shownLabel = label; window.CC_MOVE_NAME = label; document.querySelectorAll('.cc-move-name').forEach(el => { el.textContent = label; }); }
    document.querySelectorAll('svg.cc-anim').forEach(s => {
      if (extra) { if (shown.get(s) !== extra) { s.innerHTML = extra; shown.set(s, extra); } return; }
      const id = night ? SLEEP0 + Math.floor(now / 480) % 8 : frameAt(base - typeOff + (+s.dataset.skip || 0));
      if (shown.get(s) !== id) { s.innerHTML = svgOf[id]; shown.set(s, id); }
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
