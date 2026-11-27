// 3D Champ Town buildings, from the Claude Design 'Champ Town 3D' screen. Procedural three.js models, no external assets.
import * as THREE from 'three';

const M = {};
export function mat(name, color, o = {}) {
  if (M[name]) return M[name];
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? .7, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: o.op != null, opacity: o.op ?? 1, flatShading: !!o.flat });
  m.name = name; M[name] = m; return m;
}
export function mesh(name, geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material); m.name = name; m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}
const box = (n, w, h, d, m, x, y, z) => mesh(n, new THREE.BoxGeometry(w, h, d), m, x, y, z);
const cyl = (n, rt, rb, h, m, x, y, z, seg = 24) => mesh(n, new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
const sph = (n, r, m, x, y, z, seg = 24) => mesh(n, new THREE.SphereGeometry(r, seg, Math.max(8, seg * .6 | 0)), m, x, y, z);
function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
const ext = (shape, depth, bevel = .06) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 18 }); g.center(); return g; };
function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -.5); s.bezierCurveTo(-.15, -.32, -.62, -.05, -.62, .22); s.bezierCurveTo(-.62, .5, -.3, .62, 0, .38);
  s.bezierCurveTo(.3, .62, .62, .5, .62, .22); s.bezierCurveTo(.62, -.05, .15, -.32, 0, -.5); return s;
}
function tree(name, x, z, s = 1, g = 0x5DA03A) {
  const t = new THREE.Group(); t.name = name;
  t.add(cyl(name + '-trunk', .07 * s, .1 * s, .7 * s, mat('trunk', 0x8A5A35), 0, .35 * s, 0, 8));
  const leaf = mat('leaf-' + g.toString(16), g, { r: .85 });
  t.add(sph(name + '-crown', .42 * s, leaf, 0, .92 * s, 0, 14)); t.add(sph(name + '-crown2', .3 * s, leaf, .22 * s, .78 * s, .1 * s, 12)); t.add(sph(name + '-crown3', .28 * s, leaf, -.2 * s, .8 * s, -.08 * s, 12));
  t.position.set(x, 0, z); return t;
}
function gable(name, w, h, d, m) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return mesh(name, g, m);
}
function island(name, w, d, h = .4) {
  const g = new THREE.Group(); g.name = name;
  g.add(box(name + '-soil', w, h, d, mat('soil', 0x8A5A35), 0, h / 2, 0));
  g.add(box(name + '-grass', w + .04, .12, d + .04, mat('grass', 0x7DB548, { r: .9 }), 0, h + .04, 0));
  return g;
}

// ---------- My Class: brownstone ----------
export function brownstone() {
  const g = new THREE.Group(); g.name = 'my-class';
  const brick = mat('brick', 0xB0613C, { r: .85 }), trim = mat('stone-trim', 0xEFE5D2), glass = mat('glass', 0x5A8DBE, { r: .15, m: .2 }), iron = mat('iron', 0x1E2230, { r: .5, m: .6 }), walk = mat('sidewalk', 0xB8BCC4), road = mat('road', 0x5B6170);
  g.add(box('road', 6.4, .12, 1.4, road, 0, .06, 2.4)); g.add(box('sidewalk', 6.4, .2, 4.2, walk, 0, .1, -.4));
  for (let i = -2; i <= 2; i++) g.add(box('crossing-' + i, .5, .02, 1.2, mat('paint', 0xF4F1EA), i * 1.2, .13, 2.4));
  const W = 3.6, H = 4.4, D = 2.6, y0 = .2;
  g.add(box('facade', W, H, D, brick, 0, y0 + H / 2, -.6));
  for (let f = 0; f < 4; f++) {
    g.add(box('band-' + f, W + .06, .08, D + .06, trim, 0, y0 + 1 + f * 1.05, -.6));
    for (let c = 0; c < 4; c++) {
      const x = -1.26 + c * .84, y = y0 + .55 + f * 1.05;
      g.add(box(`win-frame-${f}-${c}`, .5, .72, .06, trim, x, y, -.6 + D / 2 + .02));
      g.add(box(`win-glass-${f}-${c}`, .38, .58, .06, glass, x, y, -.6 + D / 2 + .045));
      g.add(box(`win-sill-${f}-${c}`, .58, .06, .14, trim, x, y - .4, -.6 + D / 2 + .06));
    }
    for (let c = 0; c < 3; c++) {
      const z = -1.4 + c * .8, y = y0 + .55 + f * 1.05;
      g.add(box(`side-frame-${f}-${c}`, .06, .72, .5, trim, W / 2 + .02, y, z)); g.add(box(`side-glass-${f}-${c}`, .06, .58, .38, glass, W / 2 + .045, y, z));
    }
  }
  g.add(box('cornice', W + .3, .28, D + .3, trim, 0, y0 + H + .12, -.6));
  g.add(box('parapet-front', W + .1, .3, .1, brick, 0, y0 + H + .4, -.6 + D / 2)); g.add(box('parapet-back', W + .1, .3, .1, brick, 0, y0 + H + .4, -.6 - D / 2));
  g.add(box('parapet-l', .1, .3, D, brick, -W / 2, y0 + H + .4, -.6)); g.add(box('parapet-r', .1, .3, D, brick, W / 2, y0 + H + .4, -.6));
  g.add(box('roof-pool', 2.4, .05, 1.5, mat('pool', 0x6EC3EE, { r: .1, m: .1 }), -.2, y0 + H + .3, -.6)); g.add(box('roof-vent', .3, .3, .3, trim, 1.1, y0 + H + .42, -1.2));
  for (const sx of [-.8, .8]) {
    g.add(box('door-' + sx, .5, .9, .06, mat('door', 0x2A1E1A), sx, y0 + .75, -.6 + D / 2 + .03));
    for (let st = 0; st < 4; st++) g.add(box(`stoop-${sx}-${st}`, .7, .12, .25, trim, sx, y0 + .06 + st * .12, .95 - st * .2));
    for (const rx of [-.36, .36]) { const rail = box(`rail-${sx}-${rx}`, .04, .04, 1, iron, sx + rx, y0 + .62, .66); rail.rotation.x = .48; g.add(rail); g.add(box(`post-${sx}-${rx}`, .04, .5, .04, iron, sx + rx, y0 + .3, 1.1)); }
  }
  g.add(tree('class-tree-l', -2.6, .6, 1.2)); g.add(tree('class-tree-r', 2.6, .6, 1.2));
  return g;
}

// ---------- My Teacher: log cabin ----------
export function cabin() {
  const g = island('my-teacher', 5, 4.4);
  const log = mat('log', 0xA46A33, { r: .8 }), log2 = mat('log-dark', 0x8C5626, { r: .8 }), roof = mat('roof-plank', 0x7A4A22, { r: .85 }), glass = mat('glass', 0x5A8DBE, { r: .15, m: .2 }), frame = mat('frame-wood', 0x5E3A1A);
  const by = .52, Wd = 2.8, Dp = 2.1;
  for (let i = 0; i < 8; i++) {
    const y = by + .14 + i * .24, m = i % 2 ? log2 : log;
    const fl = cyl('log-front-' + i, .13, .13, Wd + .3, m, 0, y, Dp / 2, 12); fl.rotation.z = Math.PI / 2; g.add(fl);
    const bl = fl.clone(); bl.name = 'log-back-' + i; bl.position.z = -Dp / 2; g.add(bl);
    const ll = cyl('log-left-' + i, .13, .13, Dp + .3, m, -Wd / 2, y + .12, 0, 12); ll.rotation.x = Math.PI / 2; g.add(ll);
    const rl = ll.clone(); rl.name = 'log-right-' + i; rl.position.x = Wd / 2; g.add(rl);
  }
  g.add(box('cabin-core', Wd - .1, 1.9, Dp - .1, log2, 0, by + 1, 0));
  const top = by + 2.05;
  const gl = gable('gable-front', Dp + .2, 1.1, .1, log); gl.rotation.y = Math.PI / 2; gl.position.set(-Wd / 2, top, 0); g.add(gl);
  const gr = gl.clone(); gr.name = 'gable-back'; gr.position.x = Wd / 2; g.add(gr);
  const ang = Math.atan2(1.1, 1.15), len = Math.hypot(1.15, 1.1) + .35;
  for (const s of [-1, 1]) { const rp = new THREE.Group(); rp.name = 'roof-side-' + s; rp.position.set(0, top + 1.1, 0); rp.rotation.x = s * ang;
    const pl = box('roof-' + s, Wd + .7, .12, len, roof, 0, .08, s * len / 2); rp.add(pl);
    for (let k = 1; k < 5; k++) rp.add(box(`shingle-${s}-${k}`, Wd + .72, .05, .05, log2, 0, .16, s * k * len / 5));
    g.add(rp); }
  const ridge = cyl('ridge', .09, .09, Wd + .8, log2, 0, top + 1.2, 0, 12); ridge.rotation.z = Math.PI / 2; g.add(ridge);
  g.add(box('chimney', .36, 1, .36, mat('chimney-stone', 0x8B7D73), .8, top + .9, -.5));
  g.add(box('door', .55, 1.05, .08, frame, -.5, by + .55, Dp / 2 + .14));
  for (const x of [.55]) { g.add(box('win-frame', .7, .55, .08, frame, x, by + 1.05, Dp / 2 + .14)); g.add(box('win-glass', .56, .42, .08, glass, x, by + 1.05, Dp / 2 + .17)); }
  g.add(box('loft-frame', .4, .35, .08, frame, 0, top + .4, 0)); g.children.at(-1).position.set(-Wd / 2 - .06, top + .4, 0); g.children.at(-1).rotation.y = Math.PI / 2;
  const porch = box('porch', 3.2, .1, .6, log, 0, by + .05, Dp / 2 + .45); g.add(porch);
  for (let i = 0; i < 6; i++) { const st = box('stair-' + i, .9, .06, .3, log, -.5, by - .05 - i * .02, Dp / 2 + .9 + i * .25); st.rotation.x = .15; g.add(st); }
  g.add(tree('cabin-tree-1', -2, -1.6, .8, 0x4F9A3A)); g.add(tree('cabin-tree-2', 2.05, .9, .9)); g.add(tree('cabin-tree-3', 1.4, 1.7, .6, 0x4F9A3A));
  g.add(box('crate', .3, .3, .3, log, -1.85, .67, .9));
  for (const [x, z, s] of [[1.6, 1.85, .22], [1.95, 1.6, .15], [-1.5, 1.8, .18]]) { const r = mesh('rock', new THREE.DodecahedronGeometry(s, 0), mat('rock', 0xA8A39A, { flat: true }), x, .55 + s * .6, z); g.add(r); }
  return g;
}

// ---------- Talk to Someone: heart tree ----------
export function heartTree() {
  const g = new THREE.Group(); g.name = 'talk-to-someone';
  const bark = mat('bark-tan', 0xC98B5E, { r: .6 }), pink = mat('heart-pink', 0xFF5C8A, { r: .35 }), pink2 = mat('heart-rose', 0xFF86A8, { r: .35 });
  g.add(cyl('root-flare', .5, .85, .35, bark, 0, .17, 0, 32));
  g.add(cyl('trunk', .2, .38, 2.4, bark, 0, 1.5, 0, 24));
  const br = [[-.55, 2.6, 0, .7], [.6, 2.7, .1, -.75], [0, 3.1, .15, 0], [-.3, 2.9, -.3, .4]];
  br.forEach(([x, y, z, rz], i) => { const b = cyl('branch-' + i, .08, .14, 1.3, bark, x * .55, y - .25, z * .5, 12); b.rotation.z = rz; b.rotation.x = z; g.add(b); });
  const hg = ext(heartShape(), .22, .07);
  const pts = [[0, 3.95, 0, 1.1], [-.95, 3.45, .2, .85], [.95, 3.5, .1, .9], [-.5, 4.3, -.2, .75], [.55, 4.35, -.1, .8], [-1.3, 2.95, .3, .6], [1.35, 2.95, .2, .65], [0, 3.35, .55, .7], [-.4, 3.7, -.6, .7], [.45, 3.8, -.55, .65], [0, 4.7, .05, .6]];
  pts.forEach(([x, y, z, s], i) => { const h = mesh('heart-' + i, hg, i % 3 ? pink : pink2, x, y, z); h.scale.setScalar(s); h.rotation.set(-.1 + z * .3, Math.atan2(x, 1.2) * .6, x * -.15); g.add(h); });
  [[-.9, 1.9, .5, .35], [.85, 1.4, .4, .3], [1.1, 2.2, -.2, .28]].forEach(([x, y, z, s], i) => { const h = mesh('falling-heart-' + i, hg, pink, x, y, z); h.scale.setScalar(s); h.rotation.z = (i - 1) * .4; h.userData.float = true; g.add(h); });
  g.scale.setScalar(.85); return g;
}

// ---------- The Arena: robot on a rocket ----------
export function rocket() {
  const g = new THREE.Group(); g.name = 'the-arena';
  const white = mat('rocket-white', 0xEEF1F8, { r: .3 }), purple = mat('rocket-purple', 0x8B5CF6, { r: .3 }), blue = mat('robot-blue', 0x2F5BFF, { r: .35 }), visor = mat('visor', 0x16204A, { r: .15, m: .3 }), glow = mat('eye-glow', 0x8FD3FF, { e: 0x57A6FF, ei: 2.2 }), flame = mat('flame', 0x7FE8FF, { e: 0x3FD4FF, ei: 2.5, op: .85 });
  const rk = new THREE.Group(); rk.name = 'rocket';
  const prof = [[0, -1.6], [.5, -1.55], [.68, -1.1], [.75, -.2], [.72, .6], [.58, 1.2], [.0, 1.25]].map(([r, y]) => new THREE.Vector2(r, y));
  rk.add(mesh('rocket-body', new THREE.LatheGeometry(prof, 40), white));
  const nose = mesh('rocket-nose', new THREE.LatheGeometry([[0, 0], [.6, 0], [.52, .5], [.3, .95], [0, 1.15]].map(([r, y]) => new THREE.Vector2(r, y)), 40), purple, 0, 1.1, 0); rk.add(nose);
  const ring = mesh('porthole-ring', new THREE.TorusGeometry(.28, .07, 16, 40), mat('porthole-blue', 0x4F86FF, { r: .25 }), 0, .2, .72); rk.add(ring);
  rk.add(mesh('porthole-glass', new THREE.CircleGeometry(.26, 32), mat('porthole-glass', 0xBFE3FF, { r: .05, m: .3 }), 0, .2, .735));
  for (let i = 0; i < 3; i++) { const f = box('fin-' + i, .1, .8, .6, purple, 0, -1.25, 0); f.geometry.translate(0, 0, .55); f.rotation.y = i * Math.PI * 2 / 3; rk.add(f); }
  rk.add(cyl('nozzle', .38, .5, .3, mat('nozzle', 0x9AA3B8, { r: .35, m: .3 }), 0, -1.72, 0, 28));
  const fl = mesh('flame-outer', new THREE.ConeGeometry(.42, 1.3, 24, 1, true), flame, 0, -2.5, 0); fl.rotation.x = Math.PI; fl.userData.flame = true; rk.add(fl);
  const fi = mesh('flame-inner', new THREE.ConeGeometry(.22, .8, 18), mat('flame-core', 0xFFFFFF, { e: 0xBFF4FF, ei: 3 }), 0, -2.2, 0); fi.rotation.x = Math.PI; fi.userData.flame = true; rk.add(fi);
  rk.rotation.z = -1.05; rk.position.set(0, 2.2, 0); g.add(rk);
  const bot = new THREE.Group(); bot.name = 'robot';
  bot.add(sph('robot-body', .48, white, 0, 0, 0, 32));
  bot.add(sph('robot-head', .62, white, -.1, .85, 0, 32));
  const v = sph('robot-visor', .5, visor, -.1, .85, .3, 32); v.scale.set(1, .75, .75); bot.add(v);
  bot.add(sph('eye-l', .09, glow, -.3, .9, .68, 16)); bot.add(sph('eye-r', .09, glow, .1, .9, .68, 16));
  for (const s of [-1, 1]) bot.add(cyl('ear-' + s, .14, .14, .14, blue, -.1 + s * .62, .85, 0, 20)).children.at(-1).rotation.set(0, 0, Math.PI / 2);
  const armR = mesh('arm-raised', new THREE.CapsuleGeometry(.12, .6, 6, 14), blue, .45, .5, 0); armR.rotation.z = -2.4; bot.add(armR);
  bot.add(sph('hand-raised', .16, blue, .85, .95, 0, 16));
  const armL = mesh('arm-hold', new THREE.CapsuleGeometry(.12, .5, 6, 14), blue, -.45, -.1, .2); armL.rotation.z = .9; bot.add(armL);
  const leg = mesh('leg', new THREE.CapsuleGeometry(.14, .4, 6, 14), blue, .1, -.5, .35); leg.rotation.x = 1.2; bot.add(leg);
  bot.position.set(-.45, 3.15, .1); bot.rotation.y = .25; g.add(bot);
  g.add(cyl('launch-pad', 1.1, 1.3, .2, mat('pad', 0x2A2F4A, { r: .5, m: .4 }), .6, .1, 0, 40));
  g.add(mesh('pad-ring', new THREE.TorusGeometry(1.05, .05, 8, 48), mat('pad-light', 0xF2B33D, { e: 0xF2B33D, ei: .8 }), .6, .22, 0)); g.children.at(-1).rotation.x = Math.PI / 2;
  return g;
}

// ---------- Champ Card: ID badge ----------
export function badge() {
  const g = new THREE.Group(); g.name = 'champ-card';
  const blue = mat('badge-blue', 0x6FA3D8, { r: .35 }), cream = mat('badge-cream', 0xF5ECD9, { r: .6 }), skin = mat('badge-person', 0xB9773F, { r: .5 }), line = mat('badge-line', 0xE6DCC6, { r: .6 });
  const card = new THREE.Group(); card.name = 'card';
  card.add(mesh('badge-frame', ext(rrShape(2.6, 2, .38), .18, .08), blue));
  card.add(mesh('badge-panel', ext(rrShape(2.15, 1.55, .22), .04, .03), cream, 0, -.05, .14));
  card.add(sph('person-head', .26, skin, -.55, .05, .2, 24));
  const sh = mesh('person-body', new THREE.SphereGeometry(.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), skin, -.55, -.62, .18); sh.scale.set(1, .85, .45); card.add(sh);
  [.3, 0, -.3].forEach((y, i) => card.add(mesh('info-line-' + i, ext(rrShape(.8 - i * .1, .14, .07), .04, .02), line, .45 - i * .05, y + .05, .2)));
  card.add(mesh('clip-loop', new THREE.TorusGeometry(.22, .07, 12, 32, Math.PI), blue, 0, 1.08, 0));
  card.add(box('clip-tab', .5, .22, .14, blue, 0, 1.06, 0));
  card.position.y = 1.35; card.rotation.x = -.12; g.add(card);
  g.add(box('stand-base', 1.4, .12, .7, mat('stand', 0x2A2F4A, { r: .4, m: .3 }), 0, .06, -.1));
  g.add(box('stand-post', .12, .5, .12, mat('stand', 0x2A2F4A), 0, .3, -.25));
  return g;
}

// ---------- Sunday School: purple book ----------
export function book() {
  const g = new THREE.Group(); g.name = 'sunday-school';
  const cover = mat('book-cover', 0x8B5CF6, { r: .3 }), cover2 = mat('book-cover-deep', 0x6D3FE0, { r: .3 }), pages = mat('book-pages', 0xEDE6FF, { r: .7 }), gold = mat('book-gold', 0xF2B33D, { r: .35, m: .3 });
  const W = 2.2, H = 2.8, T = .14;
  const back = mesh('back-cover', ext(rrShape(W, H, .2), T, .05), cover2); back.geometry.translate(W / 2, 0, 0); back.rotation.y = .55; g.add(back);
  const pg = box('page-block', W - .15, H - .2, .5, pages, 0, 0, 0); pg.geometry.translate((W - .15) / 2, 0, .2); pg.rotation.y = .55; g.add(pg);
  const loose = box('loose-pages', W - .25, H - .3, .12, pages, 0, 0, 0); loose.geometry.translate((W - .25) / 2, 0, 0); loose.rotation.y = -.15; g.add(loose);
  const front = mesh('front-cover', ext(rrShape(W, H, .2), T, .05), cover); front.geometry.translate(W / 2, 0, 0); front.rotation.y = -.75; g.add(front);
  const hole = mesh('cover-handle', ext(rrShape(.9, .22, .1), .03, .02), mat('book-handle', 0xC9B5FF, { r: .4 })); hole.geometry.translate(W * .55, H * .36, T); hole.rotation.y = -.75; g.add(hole);
  const cross = new THREE.Group(); cross.name = 'cover-cross';
  cross.add(box('cross-v', .12, .7, .04, gold, 0, 0, 0)); cross.add(box('cross-h', .44, .12, .04, gold, 0, .12, 0));
  cross.position.set(0, -.15, 0); const pivot = new THREE.Group(); pivot.name = 'cross-pivot'; pivot.add(cross); cross.position.set(W * .55, -.2, T + .02); pivot.rotation.y = -.75; g.add(pivot);
  g.add(cyl('spine', .16, .16, H, cover2, 0, 0, 0, 24));
  g.position.y = H / 2 + .05; const wrap = new THREE.Group(); wrap.name = 'sunday-school'; g.name = 'book'; wrap.add(g);
  wrap.add(cyl('book-plinth', 1.6, 1.7, .1, mat('plinth', 0xE9DCC0, { r: .8 }), .4, .05, .3, 40));
  return wrap;
}

// ---------- My House: cottage ----------
export function cottage() {
  const g = new THREE.Group(); g.name = 'my-house';
  const stone = mat('base-stone', 0xE6E1D6, { r: .8 }), grassM = mat('grass', 0x7DB548, { r: .9 }), wall = mat('cottage-wall', 0xEEDDBB, { r: .85 }), roof = mat('slate-roof', 0x4C515C, { r: .7 }), white = mat('white-paint', 0xFAF7F0, { r: .6 }), glass = mat('glass', 0x5A8DBE, { r: .15, m: .2 }), door = mat('door-wood', 0x8A4E24);
  g.add(box('base', 6.2, .35, 5.2, stone, 0, .17, 0)); g.add(box('lawn', 6, .1, 5, grassM, 0, .4, 0));
  const y = .45, W = 2.8, D = 2.3, H = 1.7;
  g.add(box('walls', W, H, D, wall, 0, y + H / 2, -.3));
  const rf = gable('roof-mass', D + .5, 1.3, W + .5, roof); rf.rotation.y = Math.PI / 2; rf.position.set(0, y + H, -.3); g.add(rf);
  const gw = gable('gable-wall', D, 1.05, W - .02, wall); gw.rotation.y = Math.PI / 2; gw.position.set(0, y + H, -.3); g.add(gw);
  const ft = gable('front-gable', 1.5, .9, .5, roof); ft.position.set(.4, y + H - .1, .9); g.add(ft);
  g.add(box('front-bay', 1.3, H - .1, .5, wall, .4, y + (H - .1) / 2, .85));
  g.add(box('chimney', .35, 1.2, .35, mat('chimney-brick', 0xA0573A), -.8, y + H + .9, -.6));
  g.add(box('door', .45, .8, .06, door, .4, y + .4, 1.13)); g.add(box('door-frame', .55, .9, .04, white, .4, y + .45, 1.11));
  g.add(box('win-l-frame', .58, .58, .06, white, -.85, y + .95, D / 2 - .3 + .03)); g.add(box('win-l-glass', .44, .44, .06, glass, -.85, y + .95, D / 2 - .3 + .06));
  const sf = box('win-side-frame', .06, .58, .58, white, W / 2 + .03, y + .95, -.3); g.add(sf); g.add(box('win-side-glass', .06, .44, .44, glass, W / 2 + .06, y + .95, -.3));
  g.add(box('win-bay-frame', .5, .4, .06, white, .4, y + 1.3, 1.12)); g.add(box('win-bay-glass', .38, .28, .06, glass, .4, y + 1.3, 1.15));
  g.add(box('step', .8, .1, .35, stone, .4, y + .05, 1.3)); g.add(box('path', .7, .02, 1.4, mat('path-stone', 0xD8CBB0), .4, y + .02, 2));
  for (let i = 0; i < 22; i++) { const x = -2.9 + i * .28; if (x > .0 && x < .8) continue; g.add(box('picket-f-' + i, .06, .38, .04, white, x, y + .19, 2.45)); }
  g.add(box('fence-rail-f', 5.8, .05, .03, white, 0, y + .26, 2.44));
  for (let i = 0; i < 16; i++) { g.add(box('picket-l-' + i, .04, .38, .06, white, -2.9, y + .19, 2.35 - i * .3)); g.add(box('picket-r-' + i, .04, .38, .06, white, 2.9, y + .19, 2.35 - i * .3)); }
  g.add(tree('house-tree-l', -2.2, -.9, 1.4, 0x4F9A3A)); g.add(tree('house-tree-r', 2.1, -1.4, 1.6)); g.add(tree('house-tree-b', 1.3, -2, 1.1, 0x4F9A3A));
  for (const [x, z, c] of [[-1.7, 1.4, 0x5DA03A], [1.6, 1.3, 0x5DA03A], [1.2, 1.9, 0xC2443A]]) g.add(sph('bush', .28, mat('bush-' + c.toString(16), c, { r: .9 }), x, y + .2, z, 12));
  return g;
}

// ---------- Hall of Champs: trophy ----------
export function trophy() {
  const g = new THREE.Group(); g.name = 'hall-of-champs';
  const gold = mat('trophy-gold', 0xF2B33D, { r: .3, m: .35 }), wood = mat('trophy-base', 0x6B4226, { r: .6 }), blue = mat('rosette-blue', 0x2F5BFF, { r: .4 });
  g.add(box('base-low', 1.8, .4, 1.4, wood, 0, .2, 0)); g.add(box('base-top', 1.4, .3, 1.05, wood, 0, .55, 0));
  g.add(box('plaque', .8, .18, .02, gold, 0, .25, .71));
  g.add(cyl('stem-foot', .32, .45, .2, gold, 0, .8, 0, 36)); g.add(cyl('stem', .1, .14, .7, gold, 0, 1.2, 0, 24)); g.add(sph('stem-knot', .17, gold, 0, 1.45, 0, 24));
  const cup = new THREE.LatheGeometry([[0, 0], [.2, .02], [.5, .25], [.78, .7], [.9, 1.25], [.92, 1.4], [.86, 1.42], [.8, 1.3], [.68, .78], [.4, .34], [0, .3]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
  g.add(mesh('cup', cup, gold, 0, 1.55, 0));
  for (const s of [-1, 1]) { const h = mesh('handle-' + s, new THREE.TorusGeometry(.38, .09, 16, 32, Math.PI * 1.2), gold, s * .95, 2.35, 0); h.rotation.z = s > 0 ? -Math.PI * .6 : Math.PI * 1.6; g.add(h); }
  const ro = new THREE.Group(); ro.name = 'rosette';
  ro.add(cyl('rosette-disc', .34, .34, .08, blue, 0, 0, 0, 24)); ro.children[0].rotation.x = Math.PI / 2;
  ro.add(cyl('rosette-center', .2, .2, .1, mat('rosette-light', 0x6E8BFF, { r: .4 }), 0, 0, .02, 24)); ro.children[1].rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { const t = box('ribbon-' + s, .16, .55, .03, blue, s * .12, -.4, 0); t.rotation.z = s * .25; ro.add(t); }
  ro.position.set(-.35, 2.1, .82); ro.rotation.y = -.2; g.add(ro);
  return g;
}

export const BUILDERS = { class: brownstone, messages: cabin, ears: heartTree, game: rocket, profile: badge, bible: book, home: cottage, leaderboard: trophy };
