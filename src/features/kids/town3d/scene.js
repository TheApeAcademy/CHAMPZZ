/* eslint-disable */
// 3D Champ Town scene, from the Claude Design "Champ Town 3D" screen, wrapped so
// it mounts into a page and cleans up after itself. Navigation goes through
// opts.room(id) / opts.link(designHref), which map onto real Champ Town routes.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BUILDERS, mat } from './buildings.js';
import { INTERIORS, setKidName } from './interiors.js';

export function mountTown(root, opts) {
setKidName(opts.name);
let stopped = false, raf = 0;
const offs = [];
const on = (t, f, o) => { window.addEventListener(t, f, o); offs.push(() => window.removeEventListener(t, f, o)); };


const PLACES = [
  { id: 'class', label: 'My Class', x: 34, y: 18, s: 1, body: 'Your class: this Sunday\u2019s lesson, class work and the Class Cup.', verse: 'The battle is the Lord\u2019s · 1 Samuel 17:47' },
  { id: 'messages', label: 'My Teacher', x: 75, y: 16, s: 1, body: 'Chat with your teacher. Grown-ups on your club team can read every message.', verse: 'Let your speech be alway with grace · Colossians 4:6' },
  { id: 'ears', label: 'Talk to Someone', x: 14, y: 22, s: 1, body: 'A safe place to share a worry. You can keep your name hidden.', verse: 'Casting all your care upon him · 1 Peter 5:7' },
  { id: 'game', label: 'The Arena', x: 73, y: 33, s: 1, body: 'Six Bible games and the Live Bible Quiz. Play, learn, and earn points for your class.', verse: 'Thy word have I hid in mine heart · Psalm 119:11' },
  { id: 'profile', label: 'Champ Card', x: 36, y: 47, s: 1, body: 'Your Champ Card and faith record: lessons, verses, streak and badges.', verse: 'Let no man despise thy youth · 1 Timothy 4:12' },
  { id: 'bible', label: 'Sunday School', x: 80, y: 58, s: 1, body: 'Every Sunday of the year, Faith Quest, reading plans and Champ Buddy.', verse: 'Thy word is a lamp unto my feet · Psalm 119:105' },
  { id: 'home', label: 'My House', x: 32, y: 76, s: 1.05, body: 'Your tablet, today\u2019s quests, points and streak. Welcome home!', verse: 'Be strong and of a good courage · Joshua 1:9' },
  { id: 'leaderboard', label: 'Hall of Champs', x: 78, y: 85, s: 1, body: 'See who\u2019s shining in your class this week and this term.', verse: 'Whatsoever ye do, do it heartily · Colossians 3:23' },
];
const MW = 34, MD = 61;
const toWorld = (x, y) => new THREE.Vector3((x / 100 - .5) * MW, 0, (y / 100 - .5) * MD);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
root.prepend(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xBFE3F7); scene.fog = new THREE.Fog(0xBFE3F7, 45, 110);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 300);

scene.add(new THREE.HemisphereLight(0xEAF6FF, 0x6B8F4A, 1.1));
const sun = new THREE.DirectionalLight(0xFFF2D6, 2.4); sun.position.set(-18, 30, 14); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 40, bottom: -40, near: 1, far: 90 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
scene.add(sun);

// terrain
const hill = (x, z) => { const r = Math.hypot(x / (MW * .75), z / (MD * .7)); const edge = Math.max(0, r - 1); return edge * edge * 6; };
const gGeo = new THREE.PlaneGeometry(120, 150, 120, 150); gGeo.rotateX(-Math.PI / 2);
const pos = gGeo.attributes.position, col = new Float32Array(pos.count * 3), c1 = new THREE.Color(0x86C24F), c2 = new THREE.Color(0x6AAE3E), c3 = new THREE.Color(0x9AD067);
for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), h = hill(x, z); pos.setY(i, h); const n = (Math.sin(x * 1.7) * Math.cos(z * 1.3) + 1) / 2; const c = c1.clone().lerp(h > .5 ? c2 : c3, n * .6); col.set([c.r, c.g, c.b], i * 3); }
gGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); gGeo.computeVertexNormals();
const ground = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); ground.name = 'ground'; ground.receiveShadow = true; scene.add(ground);

// ===== map scenery (matches the flat Champ Town map) =====
const P = (x, y) => toWorld(x, y);
const stoneM = mat('cobble', 0xCFC7B6, { r: .9 }), stoneD = mat('cobble-dark', 0xB8AE98, { r: .9 }), sandM = mat('sand', 0xE3CC95, { r: .95 }), wallM = mat('wall-stone', 0xC9C3B5, { r: .9, flat: true }), wallTop = mat('wall-top', 0xDAD5C9, { r: .9 }), hedgeM = mat('hedge', 0x4E9A36, { r: .9 }), purple = mat('lamp-purple', 0x5B3B8C, { r: .45 }), lampGlow = mat('lamp-glow', 0xFFE7A8, { e: 0xFFD27A, ei: 1.3 }), woodM = mat('wood', 0x9C6A3C, { r: .8 }), waterM = mat('water', 0x6FAFD6, { r: .08, m: .15 }), lawnM = mat('lawn-light', 0xA9D46E, { r: .95 }), soilM = mat('bed-soil', 0x7A4E2C, { r: .95 });
function flatPatch(name, cx, cy, rx, rz, m, y = .03, seg = 48) { const g = new THREE.Mesh(new THREE.CircleGeometry(1, seg), m); g.name = name; g.rotation.x = -Math.PI / 2; const w = P(cx, cy); g.position.set(w.x, y, w.z); g.scale.set(rx, rz, 1); g.receiveShadow = true; scene.add(g); return g; }
// cobblestone path
const PATH = [[57, -2], [53, 7], [47, 17], [44, 25], [47, 31], [58, 36], [70, 40], [68, 46], [58, 50], [46, 55], [38, 60], [37, 65], [47, 70], [62, 75], [65, 81], [59, 88], [52, 94], [50, 103]];
const curve = new THREE.CatmullRomCurve3(PATH.map(([x, y]) => P(x, y)), false, 'catmullrom', .5);
{ const N = 600, v = [], idx = []; for (let i = 0; i <= N; i++) { const t = i / N, p = curve.getPoint(t), tg = curve.getTangent(t), n = new THREE.Vector3(-tg.z, 0, tg.x).normalize().multiplyScalar(1.7); v.push(p.x + n.x, .025, p.z + n.z, p.x - n.x, .025, p.z - n.z); if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, sandM); m.name = 'path-bed'; m.receiveShadow = true; scene.add(m);
  const cg = new THREE.BoxGeometry(.62, .08, .44); let k = 0;
  for (let i = 0; i < 520; i++) { const t = i / 520, p = curve.getPoint(t), tg = curve.getTangent(t), n = new THREE.Vector3(-tg.z, 0, tg.x).normalize(); for (const off of [-1.05, -.35, .35, 1.05]) { const jitter = (Math.sin(i * 12.9 + off * 7) * .5) * .25; const c = new THREE.Mesh(cg, (k++ % 3) ? stoneM : stoneD); c.position.set(p.x + n.x * (off + jitter), .06, p.z + n.z * (off + jitter)); c.rotation.y = Math.atan2(tg.x, tg.z) + Math.sin(i * 3.1 + off) * .25; c.scale.set(.8 + Math.abs(Math.sin(i + off)) * .4, 1, .8 + Math.abs(Math.cos(i * 2 + off)) * .35); c.receiveShadow = true; if (i % 3 === 0 || Math.abs(off) < 1) scene.add(c); } } }
// sandy plaza + side patch
flatPatch('plaza-sand', 71, 28, 6.2, 5.4, sandM, .02); flatPatch('east-patch', 86, 58, 5.2, 3.6, sandM, .02);
flatPatch('round-lawn', 36, 80, 5.2, 4.2, lawnM, .015);
// stone walls along arcs
function wallArc(name, cx, cy, rx, rz, a0, a1, h = .55) { const w = P(cx, cy), n = Math.max(6, Math.round(Math.abs(a1 - a0) * Math.max(rx, rz) / .7)); for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i + .5) / n; const b = new THREE.Mesh(new THREE.BoxGeometry(.75, h, .5), wallM); b.position.set(w.x + Math.cos(a) * rx, h / 2, w.z + Math.sin(a) * rz); b.rotation.y = -a + Math.PI / 2; b.castShadow = b.receiveShadow = true; b.name = name; scene.add(b); const t = new THREE.Mesh(new THREE.BoxGeometry(.8, .08, .56), wallTop); t.position.copy(b.position); t.position.y = h + .04; t.rotation.y = b.rotation.y; scene.add(t); } }
function wallLine(name, x0, y0, x1, y1, h = .55) { const a = P(x0, y0), b = P(x1, y1), len = a.distanceTo(b), n = Math.max(2, Math.round(len / .75)); for (let i = 0; i < n; i++) { const p = a.clone().lerp(b, (i + .5) / n); const m = new THREE.Mesh(new THREE.BoxGeometry(len / n - .04, h, .5), wallM); m.position.set(p.x, h / 2, p.z); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); m.castShadow = m.receiveShadow = true; m.name = name; scene.add(m); const t = new THREE.Mesh(new THREE.BoxGeometry(len / n, .08, .56), wallTop); t.position.set(p.x, h + .04, p.z); t.rotation.y = m.rotation.y; scene.add(t); } }
wallArc('plaza-wall', 71, 28, 7.2, 6.4, -1.7, .95); wallLine('wall-mid', 47, 49, 64, 42); wallLine('wall-east', 68, 66, 102, 69); wallLine('wall-short', 57, 72, 57, 79); wallLine('wall-nw', 3, 9, 3, 21);
{ const pd = P(71, 27); const p1 = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, .3, 48), wallTop); p1.position.set(pd.x, .15, pd.z); p1.receiveShadow = p1.castShadow = true; scene.add(p1); }
// stone arch
{ const w = P(36, 32), g = new THREE.Group(); g.name = 'stone-arch'; for (const s2 of [-1, 1]) { const col = new THREE.Mesh(new THREE.BoxGeometry(.7, 2.3, .7), wallM); col.position.set(s2 * 1.2, 1.15, 0); col.castShadow = true; g.add(col); } const arc = new THREE.Mesh(new THREE.TorusGeometry(1.2, .36, 10, 24, Math.PI), wallM); arc.position.y = 2.3; arc.castShadow = true; g.add(arc); g.position.copy(w); g.rotation.y = .5; scene.add(g); }
// hedges
function hedge(name, x0, y0, x1, y1) { const a = P(x0, y0), b = P(x1, y1), len = a.distanceTo(b), n = Math.max(2, Math.round(len / .8)); for (let i = 0; i < n; i++) { const p = a.clone().lerp(b, (i + .5) / n); const m = new THREE.Mesh(new THREE.SphereGeometry(.62, 14, 10), hedgeM); m.position.set(p.x, .5, p.z); m.scale.set(1.1, .9, 1); m.castShadow = m.receiveShadow = true; m.name = name; scene.add(m); } }
hedge('hedge-pond', 14, 49.5, 37, 50); hedge('hedge-curve-a', 42, 35, 52, 37); hedge('hedge-curve-b', 52, 37, 63, 41); hedge('hedge-plaza-e', 80, 34, 92, 30); hedge('hedge-plaza-e2', 92, 30, 96, 24); hedge('hedge-east', 68, 52, 78, 51); hedge('hedge-east2', 90, 56, 97, 62); hedge('hedge-garden', 8, 88, 25, 92);
// ponds
function pond(name, cx, cy, rx, rz) { const w = P(cx, cy); const water = new THREE.Mesh(new THREE.CircleGeometry(1, 40), waterM); water.rotation.x = -Math.PI / 2; water.position.set(w.x, .06, w.z); water.scale.set(rx, rz, 1); water.name = name; scene.add(water); const rim = new THREE.Mesh(new THREE.TorusGeometry(1, .09, 8, 48), wallTop); rim.rotation.x = -Math.PI / 2; rim.scale.set(rx, rz, 1); rim.position.set(w.x, .07, w.z); scene.add(rim); }
pond('pond-north', 19, 9, 2.6, 1.9); pond('pond-west', 17, 44, 4.2, 2.6);
{ const w = P(15, 4), g = new THREE.Group(); g.name = 'mirror'; const fr = new THREE.Mesh(new THREE.TorusGeometry(.75, .1, 10, 32), mat('gold', 0xE2B24A, { r: .3, m: .5 })); fr.scale.set(.8, 1.1, 1); fr.position.y = 1.4; g.add(fr); const gl = new THREE.Mesh(new THREE.CircleGeometry(.7, 32), mat('mirror-glass', 0xBFE3F7, { r: .05, m: .5 })); gl.scale.set(.8, 1.1, 1); gl.position.set(0, 1.4, .01); g.add(gl); const leg = new THREE.Mesh(new THREE.CylinderGeometry(.05, .08, .7, 8), mat('gold', 0xE2B24A)); leg.position.y = .35; g.add(leg); g.position.copy(w); scene.add(g); }
// lamp posts & signposts
function lamp(x, y) { const w = P(x, y), g = new THREE.Group(); g.name = 'lamp'; const post = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, 1.8, 10), purple); post.position.y = .9; post.castShadow = true; g.add(post); const head = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .35, 8), purple); head.position.y = 1.95; g.add(head); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), lampGlow); bulb.position.y = 1.95; g.add(bulb); const cap = new THREE.Mesh(new THREE.ConeGeometry(.2, .18, 8), purple); cap.position.y = 2.2; g.add(cap); g.position.copy(w); scene.add(g); }
[[61, 2], [61, 19], [36, 21], [41, 50], [40, 64], [61, 85]].forEach(([x, y]) => lamp(x, y));
function sign(x, y, rot) { const w = P(x, y), g = new THREE.Group(); g.name = 'signpost'; const post = new THREE.Mesh(new THREE.BoxGeometry(.16, 2, .16), purple); post.position.y = 1; post.castShadow = true; g.add(post); for (const [yy, dx, r] of [[1.65, .45, .1], [1.3, -.4, -.15]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.95, .22, .06), purple); b.position.set(dx, yy, 0); b.rotation.z = r; b.castShadow = true; g.add(b); } const knob = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), mat('gold', 0xE2B24A)); knob.position.y = 2.05; g.add(knob); g.position.copy(w); g.rotation.y = rot; scene.add(g); }
sign(45, 6, .3); sign(50, 57, -.2);
// benches & birdbath & mailbox
function bench(x, y, rot) { const w = P(x, y), g = new THREE.Group(); g.name = 'bench'; for (let i = 0; i < 3; i++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(1.5, .07, .16), woodM); sl.position.set(0, .45, -.18 + i * .18); sl.castShadow = true; g.add(sl); } const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, .35, .07), woodM); back.position.set(0, .75, -.3); g.add(back); for (const sx of [-.65, .65]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .5), woodM); lg.position.set(sx, .22, -.05); g.add(lg); } g.position.copy(w); g.rotation.y = rot; scene.add(g); }
bench(26, 23, -.4); bench(75, 72, .5);
{ const w = P(27, 54), g = new THREE.Group(); g.name = 'birdbath'; const st = new THREE.Mesh(new THREE.CylinderGeometry(.12, .25, .8, 12), wallTop); st.position.y = .4; g.add(st); const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.5, .3, .18, 20), wallTop); bowl.position.y = .88; g.add(bowl); const wt = new THREE.Mesh(new THREE.CircleGeometry(.42, 20), waterM); wt.rotation.x = -Math.PI / 2; wt.position.y = .98; g.add(wt); g.position.copy(w); g.traverse(o => o.castShadow = true); scene.add(g); }
{ const w = P(64, 93), g = new THREE.Group(); g.name = 'mailbox'; const post = new THREE.Mesh(new THREE.BoxGeometry(.12, .9, .12), woodM); post.position.y = .45; g.add(post); const bx = new THREE.Mesh(new THREE.CapsuleGeometry(.2, .45, 6, 12), mat('mailbox-white', 0xF2F2F2, { r: .4 })); bx.rotation.z = Math.PI / 2; bx.position.y = 1.02; g.add(bx); const flag = new THREE.Mesh(new THREE.BoxGeometry(.05, .3, .12), mat('mail-flag', 0xE0403A)); flag.position.set(.25, 1.2, 0); g.add(flag); g.position.copy(w); scene.add(g); }
// garden beds with fences
function bed(name, cx, cy, w2, d2, rot, crops) { const w = P(cx, cy), g = new THREE.Group(); g.name = name; const soil = new THREE.Mesh(new THREE.BoxGeometry(w2, .2, d2), soilM); soil.position.y = .1; soil.receiveShadow = true; g.add(soil);
  for (let i = 0; i < crops.length * 6; i++) { const c = crops[i % crops.length]; const x = -w2 / 2 + .4 + (i % 6) * ((w2 - .8) / 5), z = -d2 / 2 + .4 + Math.floor(i / 6) * ((d2 - .8) / Math.max(1, crops.length - 1)); const p = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), mat('crop-' + c.toString(16), c, { r: .8 })); p.position.set(x, .3, z); p.castShadow = true; g.add(p); }
  for (let i = 0; i <= Math.round(w2 / .35); i++) { const pk = new THREE.Mesh(new THREE.BoxGeometry(.08, .5, .05), woodM); pk.position.set(-w2 / 2 + i * .35, .25, -d2 / 2 - .1); g.add(pk); }
  g.position.copy(w); g.rotation.y = rot; scene.add(g); }
bed('veg-bed', 16, 65, 6, 3, .45, [0x3E8A3A, 0xD9442E, 0x5DA03A, 0xE07B2C]); bed('flower-bed', 24, 87, 5.4, 2.8, .4, [0x8B5CF6, 0xF2B33D, 0xFFFFFF, 0xFF5A3C]); bed('top-bed', 36, 6, 4.4, 1.8, 0, [0xFF8FB3, 0x8B5CF6, 0xF2B33D]); bed('side-bed', 8, 15, 1.8, 4, .1, [0xFF5A3C, 0x8B5CF6]);
// purple-post fences along the bottom
function fence(name, pts) { for (let s2 = 0; s2 < pts.length - 1; s2++) { const a = P(...pts[s2]), b = P(...pts[s2 + 1]), len = a.distanceTo(b), n = Math.round(len / .45); const ang = -Math.atan2(b.z - a.z, b.x - a.x);
  for (let i = 0; i <= n; i++) { const p = a.clone().lerp(b, i / n); const post = new THREE.Mesh(new THREE.BoxGeometry(.14, i % 6 === 0 ? 1.1 : .85, .1), i % 6 === 0 ? purple : woodM); post.position.set(p.x, i % 6 === 0 ? .55 : .42, p.z); post.rotation.y = ang; post.castShadow = true; scene.add(post); if (i % 6 === 0) { const k2 = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), purple); k2.position.set(p.x, 1.15, p.z); scene.add(k2); } }
  for (const yy of [.35, .68]) { const r2 = new THREE.Mesh(new THREE.BoxGeometry(len, .07, .05), woodM); const m2 = a.clone().lerp(b, .5); r2.position.set(m2.x, yy, m2.z); r2.rotation.y = ang; scene.add(r2); } } }
fence('fence-sw', [[0, 84], [20, 92], [43, 98]]);
// entrance gate
{ const gL = P(43.5, 99), gR = P(57.5, 98.5), mid = gL.clone().lerp(gR, .5), span = gL.distanceTo(gR), g = new THREE.Group(); g.name = 'welcome-gate';
  const pillarM = mat('gate-purple', 0x5B3B8C, { r: .45 }), goldM = mat('gold', 0xE2B24A, { r: .3, m: .5 });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.9, 4.6, .9), pillarM); p.position.set(sx * span / 2, 2.3, 0); p.castShadow = true; g.add(p); const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, .25, 1.1), goldM); cap.position.set(sx * span / 2, 4.7, 0); g.add(cap); const ball = new THREE.Mesh(new THREE.SphereGeometry(.32, 16, 12), goldM); ball.position.set(sx * span / 2, 5.1, 0); ball.castShadow = true; g.add(ball); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(span / 2, .22, 12, 48, Math.PI), pillarM); arch.position.y = 4.6; arch.castShadow = true; g.add(arch);
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 300; const cx = cv.getContext('2d');
  cx.fillStyle = '#0B1026'; cx.beginPath(); cx.roundRect(8, 8, 1008, 284, 60); cx.fill(); cx.lineWidth = 14; cx.strokeStyle = '#F2B33D'; cx.stroke();
  cx.fillStyle = '#F2B33D'; cx.textAlign = 'center'; cx.font = '900 54px "Nunito Sans", sans-serif'; cx.fillText('WELCOME TO', 512, 100);
  cx.fillStyle = '#FFF8EC'; cx.font = 'italic 900 150px Archivo, sans-serif'; cx.save(); cx.translate(512, 250); cx.scale(.62, 1); cx.fillText('CHAMPZZ TOWN', 0, 0); cx.restore();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const boardW = span * .92, board = new THREE.Mesh(new THREE.BoxGeometry(boardW, boardW * 300 / 1024, .2), [pillarM, pillarM, pillarM, pillarM, new THREE.MeshStandardMaterial({ map: tex, roughness: .5 }), new THREE.MeshStandardMaterial({ map: tex, roughness: .5 })]);
  board.position.y = 4.95 + span * .12; board.castShadow = true; board.name = 'gate-sign'; g.add(board); g.userData.tex = tex;
  g.position.set(mid.x, 0, mid.z); g.rotation.y = -Math.atan2(gR.z - gL.z, gR.x - gL.x); scene.add(g);
  document.fonts && document.fonts.ready.then(() => { cx.clearRect(0, 0, 1024, 300); cx.fillStyle = '#0B1026'; cx.beginPath(); cx.roundRect(8, 8, 1008, 284, 60); cx.fill(); cx.lineWidth = 14; cx.strokeStyle = '#F2B33D'; cx.stroke(); cx.fillStyle = '#F2B33D'; cx.textAlign = 'center'; cx.font = '900 54px "Nunito Sans", sans-serif'; cx.fillText('WELCOME TO', 512, 100); cx.fillStyle = '#FFF8EC'; cx.font = 'italic 900 150px Archivo, sans-serif'; cx.save(); cx.translate(512, 250); cx.scale(.62, 1); cx.fillText('CHAMPZZ TOWN', 0, 0); cx.restore(); tex.needsUpdate = true; });
} fence('fence-se', [[58, 97], [75, 93], [92, 89]]);
// buildings
const picks = [], groups = {};
PLACES.forEach(p => {
  const g = BUILDERS[p.id](); const w = toWorld(p.x, p.y); g.position.copy(w); g.scale.multiplyScalar(p.s * 1.7);
  g.rotation.y = 0; g.userData.place = p; scene.add(g); groups[p.id] = g;
  g.traverse(o => { if (o.isMesh) { o.userData.place = p; picks.push(o); } });
  const box = new THREE.Box3().setFromObject(g); p.top = box.max.y; p.world = w;
});

// big leafy trees from the map
const trunkM = mat('trunk', 0x8A5A35, { r: .85 }), leafA = mat('leaf-a', 0x5FA83E, { r: .85 }), leafB = mat('leaf-b', 0x74B84A, { r: .85 }), willowM = mat('willow', 0x8CC152, { r: .9 });
function bigTree(x, y, s, willow) { const w = P(x, y), g = new THREE.Group(); g.name = willow ? 'willow' : 'oak';
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.28 * s, .45 * s, 2.6 * s, 12), trunkM); tr.position.y = 1.3 * s; tr.castShadow = true; g.add(tr);
  const n = willow ? 9 : 11; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = (i % 2 ? 1.2 : .7) * s; const b = new THREE.Mesh(new THREE.SphereGeometry((willow ? .95 : 1.1) * s, 16, 12), willow ? willowM : (i % 3 ? leafA : leafB)); b.position.set(Math.cos(a) * r, (2.9 + Math.sin(i * 1.7) * .4) * s, Math.sin(a) * r); if (willow) b.scale.y = 1.6; b.castShadow = true; g.add(b); }
  const top = new THREE.Mesh(new THREE.SphereGeometry(1.3 * s, 16, 12), leafA); top.position.y = 3.6 * s; top.castShadow = true; g.add(top); g.position.copy(w); scene.add(g); }
[[16, 28, 1.25], [8, 58, 1.05], [90, 46, 1.15], [92, 79, 1], [7, 79, 1.05], [5, 3, .9], [16, -1, .8], [40, -1, .8], [97, 14, .9], [8, 98, 1], [88, 98, 1.1]].forEach(([x, y, k]) => bigTree(x, y, k));
bigTree(83, 6, 1.15, true);
const rnd = (() => { let s2 = 7; return () => (s2 = (s2 * 9301 + 49297) % 233280) / 233280; })();
const fCols = [0xFF5A3C, 0xF2B33D, 0xFFFFFF, 0xFF8FB3, 0x8B5CF6], fGeo = new THREE.SphereGeometry(.08, 6, 4);
for (let i = 0; i < 160; i++) { const w = P(rnd() * 100, rnd() * 100); const f = new THREE.Mesh(fGeo, mat('flower-' + (i % 5), fCols[i % 5], { r: .6 })); f.position.set(w.x, .08, w.z); scene.add(f); }
// a ring of soft hills beyond the map so the town sits in a valley
for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, h = new THREE.Mesh(new THREE.SphereGeometry(9 + rnd() * 6, 20, 12), mat('far-hill', 0x7DB548, { r: 1 })); h.position.set(Math.cos(a) * 46, -4, Math.sin(a) * 52); h.scale.y = .55; h.receiveShadow = true; scene.add(h); }
// clouds
const clouds = []; const cloudM = mat('cloud', 0xFFFFFF, { r: 1 });
for (let i = 0; i < 9; i++) { const c = new THREE.Group(); for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1 + rnd() * 1.2, 14, 10), cloudM); p.position.set(k * 1.3 - 2.6, rnd() * .6, rnd() * .8); c.add(p); } c.position.set((rnd() - .5) * 110, 16 + rnd() * 8, -55 - rnd() * 25); c.userData.v = .3 + rnd() * .5; scene.add(c); clouds.push(c); }

// labels
const labelsEl = document.getElementById('labels');
PLACES.forEach(p => { const el = document.createElement('button'); el.className = 'lbl'; el.type = 'button'; el.textContent = p.label; el.onclick = () => select(p); labelsEl.appendChild(el); p.el = el; });

// controls & modes
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08; controls.maxPolarAngle = Math.PI * .47; controls.minDistance = 6; controls.maxDistance = 75; controls.target.set(0, 0, 4);
let mode = 'aerial', fly = null, tourI = 0, tourT = 0, selected = null;
const walk = { pos: new THREE.Vector3(), yaw: 0, pitch: -.05, keys: {} };
function flyTo(pos, target, dur = 1.3) { fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), s: performance.now(), d: dur * 1000 }; }
function viewFor(p, dist = 14) { const w = p.world, t = new THREE.Vector3(w.x, p.top * .45, w.z); const dir = new THREE.Vector3(w.x * .15, 0, 1).normalize(); return { pos: t.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * .55, 0)), target: t }; }
function fitAerial() {
  const land = innerWidth / innerHeight > 1.05, pitch = land ? .95 : 1.05, target = new THREE.Vector3(0, 0, 0);
  const dir = land ? new THREE.Vector3(Math.cos(pitch), Math.sin(pitch), 0) : new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch));
  const pts = []; for (const [x, y] of [[0, 0], [100, 0], [0, 100], [100, 100], [50, 0], [50, 100], [0, 50], [100, 50]]) { const w = toWorld(x, y); pts.push(w.clone(), w.clone().setY(5)); }
  const cam = camera.clone(); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  const topM = 1 - 2 * 84 / innerHeight, botM = -1 + 2 * 16 / innerHeight, sideM = 1 - 2 * 10 / innerWidth;
  const fits = d => { cam.position.copy(target).addScaledVector(dir, d); cam.up.set(land ? -1 : 0, 0, land ? 0 : -1).set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld(); return pts.every(p => { const q = p.clone().project(cam); return q.z < 1 && q.x > -sideM && q.x < sideM && q.y < topM && q.y > botM; }); };
  let lo = 10, hi = 200; for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  // re-centre vertically: shift target so the map is centred in the usable band
  cam.position.copy(target).addScaledVector(dir, hi); cam.lookAt(target); cam.updateMatrixWorld();
  let minY = 1, maxY = -1; pts.forEach(p => { const q = p.clone().project(cam); minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y); });
  const want = (topM + botM) / 2, have = (minY + maxY) / 2; const shift = (have - want) * hi * Math.tan(cam.fov * Math.PI / 360) * .9;
  const up = new THREE.Vector3(); cam.getWorldDirection(up); const screenUp = new THREE.Vector3().crossVectors(new THREE.Vector3().crossVectors(up, cam.up).normalize(), up).normalize();
  const tgt = target.clone().addScaledVector(new THREE.Vector3(screenUp.x, 0, screenUp.z).normalize(), shift); tgt.y = 0;
  return { pos: tgt.clone().addScaledVector(dir, hi), target: tgt, dist: hi };
}
function setFog(d) { scene.fog.near = d * .9; scene.fog.far = d * 2.8; }
const hintSeen = new Set(); let hintT; function flashHint(force) { const key = (inside ? 'in-' + inside.p.id : mode); if (!force && hintSeen.has(key)) { document.getElementById('hint').style.opacity = 0; return; } hintSeen.add(key); const h = document.getElementById('hint'); h.style.opacity = 1; clearTimeout(hintT); hintT = setTimeout(() => h.style.opacity = 0, 4500); }
function setMode(m) {
  mode = m; document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
  const touch = matchMedia('(pointer: coarse)').matches;
  document.getElementById('pad').classList.toggle('show', false);
  document.getElementById('joy').classList.toggle('show', m === 'walk' && touch);
  const hint = document.getElementById('hint');
  controls.enabled = m === 'orbit' || m === 'aerial';
  if (m === 'aerial') { setFog(fitAerial().dist); controls.maxPolarAngle = Math.PI * .32; { const f = fitAerial(); flyTo(f.pos, f.target); }; hint.textContent = 'The whole town from above. Tap a building, or drag to slide around.'; controls.enableRotate = false; controls.screenSpacePanning = false; }
  if (m === 'orbit') { setFog(45); controls.maxPolarAngle = Math.PI * .47; controls.enableRotate = true; flyTo(new THREE.Vector3(16, 18, 30), new THREE.Vector3(0, 1, 4)); hint.textContent = 'Drag to turn, pinch or scroll to zoom, right-drag to slide.'; }
  if (m === 'tour') { setFog(45); tourI = 0; tourT = 0; const v = viewFor(PLACES[0]); flyTo(v.pos, v.target, 1.6); hint.textContent = 'Sit back. The camera visits every building.'; showPanel(PLACES[0]); }
  if (m === 'walk') { setFog(45); const gt = P(50.5, 121); walk.pos.set(gt.x, 1.6, gt.z); walk.yaw = 0; walk.pitch = .1; walk.pitch = -.05; fly = null; hidePanel(); hint.textContent = matchMedia('(pointer: coarse)').matches ? 'Drag the white button to walk. Drag anywhere else to look around. Walk up to a building to visit.' : 'Walk with the arrow keys or W A S D. Drag to look around. Walk up to a building to visit.'; }
  if (m !== 'tour' && m !== 'walk') hidePanel();
  flashHint();
}
document.querySelectorAll('#modes button').forEach(b => b.onclick = async () => { if (inside) await exitBuilding(); setMode(b.dataset.mode); });

// panel
const panel = document.getElementById('panel');
function showPanel(p) { selected = p; document.getElementById('pkicker').textContent = p.verse; document.getElementById('ptitle').textContent = p.label; document.getElementById('pbody').textContent = p.body; panel.classList.add('show'); setPanelMode(false); PLACES.forEach(q => q.el.classList.toggle('on', q === p)); }
function hidePanel() { selected = null; panel.classList.remove('show'); PLACES.forEach(q => q.el.classList.remove('on')); }
document.getElementById('pclose').onclick = () => { if (inside) return exitBuilding(); hidePanel(); if (mode === 'tour') setMode('orbit'); };
document.getElementById('penter').onclick = () => selected && enterBuilding(selected);
function setPanelMode(isIn) { panel.classList.toggle('mini', isIn); panel.classList.toggle('side', !isIn && innerWidth >= 760); document.getElementById('penter').style.display = isIn ? 'none' : ''; const o = document.getElementById('popen'); o.style.display = isIn ? '' : 'none'; document.getElementById('pclose').textContent = isIn ? 'Step outside' : 'Keep exploring'; }
// ----- interiors -----
let inside = null; const interiorCache = {}; let hidden = [];
const fadeEl = document.getElementById('fade'); const fade = (on) => new Promise(res => { fadeEl.classList.toggle('on', on); setTimeout(res, 470); });
function doorView(p) { const w = p.world, front = new THREE.Vector3(w.x, 1.6, w.z + 3.6); return { pos: front, target: new THREE.Vector3(w.x, 1.4, w.z) }; }
async function enterBuilding(p) {
  if (inside) return; const prevMode = mode; if (mode === 'tour' || mode === 'walk') { mode = 'orbit'; document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === 'orbit')); document.getElementById('pad').classList.remove('show'); document.getElementById('joy').classList.remove('show'); }
  controls.enabled = false; const v = viewFor(p, 9); flyTo(v.pos, v.target, .9); await new Promise(res => setTimeout(res, 900));
  const d = doorView(p); flyTo(d.pos, d.target, .8); await new Promise(res => setTimeout(res, 650)); await fade(true);
  let g = interiorCache[p.id]; if (!g) { g = INTERIORS[p.id](p); g.position.set(0, -300, 0); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(g); interiorCache[p.id] = g; }
  hidden = scene.children.filter(o => o !== g && !o.isLight && o.visible); hidden.forEach(o => o.visible = false); Object.values(interiorCache).forEach(x => x.visible = x === g); g.visible = true;
  inside = { p, g, prevMode }; scene.fog.near = 200; scene.fog.far = 400; scene.background.set(0x1A1F3D); sun.intensity = .4;
  fly = null; controls.enabled = false; inside.pos = new THREE.Vector3(0, -300 + 1.55, 3.6); inside.yaw = 0; inside.pitch = -.05;
  g.updateMatrixWorld(true);
  if (!g.userData.rings) { g.userData.rings = []; (g.userData.hot || []).forEach(h => { if (!h.obj) return; const wp = h.at ? new THREE.Vector3(h.at[0], -300 + h.at[1], h.at[2]) : new THREE.Box3().setFromObject(h.obj).getCenter(new THREE.Vector3()); h.wp = wp; const ring = new THREE.Mesh(new THREE.TorusGeometry(.55, .04, 8, 40), new THREE.MeshBasicMaterial({ color: 0xF2B33D, transparent: true, opacity: .9 })); ring.rotation.x = -Math.PI / 2; ring.position.set(wp.x, -300 + .04, wp.z); g.add(ring); g.userData.rings.push(ring); h.obj.traverse(o => { if (o.isMesh) o.userData.hot = h; }); }); }
  buildRoomTags(g); tagEls.forEach(t => t.el.style.display = 'none');
  const touch = matchMedia('(pointer: coarse)').matches; document.getElementById('pad').classList.toggle('show', false); document.getElementById('joy').classList.toggle('show', touch);
  document.getElementById('dock').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === p.id));
  showPanel(p); setPanelMode(true); document.getElementById('pkicker').textContent = 'Inside · ' + p.verse; document.getElementById('popen').textContent = 'Open ' + p.label + ' →'; document.getElementById('popen').href = opts.room(p.id);
  document.getElementById('hint').textContent = 'You’re inside ' + p.label + '. Walk with the ' + (matchMedia('(pointer: coarse)').matches ? 'white button' : 'arrow keys') + ' and go up to anything with a gold ring.'; flashHint(); PLACES.forEach(q => q.el.style.display = 'none');
  await fade(false);
}
async function exitBuilding() {
  if (!inside) return; const p = inside.p; await fade(true);
  roomTags.forEach(r => r.el.remove()); roomTags = []; tagEls.forEach(t => t.el.style.display = '');
  useEl.classList.remove('show'); curHot = null; document.getElementById('pad').classList.remove('show'); document.getElementById('joy').classList.remove('show');
  inside.g.visible = false; hidden.forEach(o => o.visible = true); hidden = []; inside = null; scene.background.set(0xBFE3F7); setFog(45); sun.intensity = 2.4; PLACES.forEach(q => q.el.style.display = '');
  controls.minDistance = 6; controls.maxDistance = 75; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * .47; controls.enablePan = true;
  const d = doorView(p); camera.position.copy(d.pos).add(new THREE.Vector3(0, 3, 6)); controls.target.copy(d.target); setMode('orbit'); showPanel(p); await fade(false);
}
// ----- small labels for scenery + room objects -----
const SCENE_TAGS = []; const _unusedTags = [['Welcome gate', 50.5, 99, 6.5], ['Prayer pond', 17, 44, 1], ['Mirror pond', 19, 9, 2.6], ['Stone arch', 36, 32, 3.4], ['Town square', 71, 28, 1.2], ['Vegetable garden', 16, 65, 1], ['Flower garden', 24, 87, 1], ['Bird bath', 27, 54, 1.4], ['Mailbox', 64, 93, 1.6], ['Bench', 26, 23, 1.2], ['Bench', 75, 72, 1.2], ['Signpost', 50, 57, 2.4]];
const tagEls = SCENE_TAGS.map(([t, x, y, h]) => { const el = document.createElement('span'); el.className = 'tag'; el.textContent = t; labelsEl.appendChild(el); const w = P(x, y); return { el, pos: new THREE.Vector3(w.x, h, w.z) }; });
let roomTags = [];
const NAMES = { 'sofa-seat': 'Sofa', 'armchair-seat': 'Armchair', shelf: 'Bookshelf', 'class-shelf': 'Bookshelf', 'cabin-shelf': 'Bookshelf', fridge: 'Fridge', 'table-frame': 'Smart table', 'tv-stand': 'TV stand', 'tablet-big': 'Big tablet', chalkboard: 'Memory verse board', 'desk-top': 'Desk', 'teacher-desk': 'Teacher\u2019s desk', apple: 'Apple', fireplace: 'Fireplace', 'writing-desk': 'Writing desk', phone: 'Phone to my teacher', 'beanbag-0': 'Bean bag', 'beanbag-1': 'Bean bag', 'beanbag-2': 'Bean bag', 'nook-trunk': 'Heart tree', 'podium-0': 'Verse Scramble', 'podium-1': 'Memory Match', 'podium-2': 'Word Search', 'podium-3': 'Ark Catch', 'neon-ring': 'Quiz stage', 'giant-card': 'My Champ Card', 'frame-0': 'Photo', 'frame-2': 'Heroes wall', pew: 'Pew', lectern: 'Lectern', 'open-bible': 'Open Bible', 'stained-2': 'Stained glass', 'medal-1': 'Gold medal', 'medal-2': '2nd place', 'medal-3': '3rd place', 'podium-step': 'Podium', banner: 'Banner', pot: 'Plant', rug: 'Rug', 'ceiling-lamp': 'Lamp', 'coffee-table': 'Coffee table', 'sign-CHAMP ARENA': 'Big screen', 'card-stand': 'Card stand' };
function buildRoomTags(g) { g.updateMatrixWorld(true); roomTags.forEach(r => r.el.remove()); roomTags = []; const used = new Set(), box = new THREE.Box3(), c = new THREE.Vector3();
  const add = (label, obj, h) => { box.setFromObject(obj); box.getCenter(c); const key = label + Math.round(c.x) + Math.round(c.z); if (used.has(label) && !h && /Pew|Desk|Bean bag|Photo|Banner|Plant/.test(label)) return; if (used.has(key)) return; used.add(label); used.add(key); const el = document.createElement('span'); el.className = 'tag'; el.textContent = label; labelsEl.appendChild(el); roomTags.push({ el, h, pos: new THREE.Vector3(c.x, Math.min(box.max.y + .3, -300 + 3.6), c.z) }); };
  (g.userData.hot || []).forEach(h => { if (h.obj) add(h.label, h.obj, h); });
  g.traverse(o => { const lab = NAMES[o.name]; if (!lab) return; const hotOwner = (g.userData.hot || []).some(h => { let p = o; while (p) { if (p === h.obj) return true; p = p.parent; } return false; }); if (!hotOwner) add(lab, o, null); });
}
function _oldBuildRoomTags(g) { roomTags.forEach(r => r.el.remove()); roomTags = (g.userData.hot || []).filter(h => h.wp).map(h => { const el = document.createElement('span'); el.className = 'tag'; el.textContent = h.label.replace(/^(Use|Open|See|Play|Read|Start|Take|Share|Look at|Visit|Host|Rest on|Warm up by|Message|Pick) (the |my |this |a )?/i, m => m).replace(/^./, c => c.toUpperCase()); labelsEl.appendChild(el); const top = new THREE.Box3().setFromObject(h.obj).max.y; return { el, h, pos: new THREE.Vector3(h.wp.x, Math.max(top, -300 + 1) + .35, h.wp.z) }; }); }
function placeTag(o, maxD) { camera.updateMatrixWorld(); tmp.copy(o.pos); const d = camera.position.distanceTo(tmp); tmp.project(camera); const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05 && d < maxD; o.el.style.opacity = vis ? 1 : 0; o.el.style.left = ((tmp.x + 1) / 2 * innerWidth) + 'px'; o.el.style.top = Math.max(100, (1 - tmp.y) / 2 * innerHeight) + 'px'; }
// ----- hotspots -----
const useEl = document.getElementById('use'); let curHot = null;
const tabletEl = document.getElementById('tablet');
document.getElementById('tabletApps').innerHTML = [['Sunday School', '#8B5CF6', 'Sunday School.dc.html'], ['Arena', '#2F5BFF', 'Champ Arena.dc.html'], ['Bible Heroes', '#F2B33D', 'Champ Collection.html'], ['Champ Card', '#6FA3D8', 'Champ Town Village.dc.html?from=3d#profile'], ['My Teacher', '#1E8F5A', 'Champ Town Village.dc.html?from=3d#messages'], ['Talk to Someone', '#FF8FB3', 'Champ Town Village.dc.html?from=3d#ears'], ['Hall of Champs', '#F2B33D', 'Champ Town Village.dc.html?from=3d#leaderboard'], ['Clubhouse', '#FF5A3C', 'Clubhouse.dc.html']].map(([n, c, h]) => `<a href="${opts.link(h)}"><span style="background:${c}"><svg width="40%" viewBox="0 0 24 24" fill="#FFF8EC" aria-hidden="true"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg></span>${n}</a>`).join('');
document.getElementById('tabletX').onclick = () => tabletEl.classList.remove('show');
let fireOn = true;
function toastMsg(t) { const h = document.getElementById('hint'); h.textContent = t; flashHint(true); }
function useHot(h) { if (!h) return; const a = h.act;
  if (a === 'table') return tabletEl.classList.add('show');
  if (a === 'fire') { fireOn = !fireOn; inside.g.traverse(o => { if (o.name === 'fire') o.visible = fireOn; if (o.isPointLight && o.color.getHex() === 0xFF8A3D) o.intensity = fireOn ? 8 : 0; }); return toastMsg(fireOn ? 'Cosy! The fire is warm.' : 'The fire is out.'); }
  if (a.startsWith('room:')) { location.href = opts.room(a.slice(5)); return; }
  if (a.startsWith('link:')) { location.href = opts.link(a.slice(5)); return; }
  if (a.startsWith('say:')) return toastMsg(a.slice(4)); }
useEl.onclick = () => useHot(curHot);
on('keydown', e => { if (inside && (e.code === 'KeyE' || e.code === 'Enter') && curHot) { e.preventDefault(); useHot(curHot); } if (e.code === 'Escape') tabletEl.classList.remove('show'); });
// ----- dock -----
document.getElementById('dockT').onclick = () => { const d = document.getElementById('dock'), t = document.getElementById('dockT'), hid = d.classList.toggle('hide'); t.setAttribute('aria-expanded', !hid); t.setAttribute('aria-label', hid ? 'Show building bar' : 'Hide building bar'); t.firstElementChild.style.transform = hid ? 'rotate(180deg)' : ''; };
const DOCK_IMG = { class: 'village-class-house1', messages: 'village-messages-teacherhome', ears: 'village-ears-hearttree', game: 'village-game-rocket', profile: 'village-profile-card', bible: 'village-bible-book', home: 'village-home-brickbuilding', leaderboard: 'feature-leaderboard' };
const dockEl = document.getElementById('dock');
['home', 'class', 'bible', 'game', 'leaderboard', 'profile', 'messages', 'ears'].forEach(id => { const p = PLACES.find(q => q.id === id); const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id; b.innerHTML = `<img alt="" src="/placeholders/landing/${DOCK_IMG[id]}.webp"><span>${p.label}</span>`; b.onclick = async () => { if (inside) { if (inside.p === p) return; await exitBuilding(); } enterBuilding(p); }; dockEl.appendChild(b); });
function select(p) { if (mode === 'walk') { walk.pos.set(p.world.x, 1.6, p.world.z + 9); walk.yaw = 0; showPanel(p); return; } if (mode === 'tour') setMode('orbit'); const v = viewFor(p, 14); flyTo(v.pos, v.target); showPanel(p); }

// picking
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, yaw: walk.yaw, pitch: walk.pitch, iyaw: inside && inside.pos ? inside.yaw : 0, ipitch: inside && inside.pos ? inside.pitch : 0 }; });
renderer.domElement.addEventListener('pointermove', e => { if (inside && inside.pos && down) { inside.yaw = down.iyaw - (e.clientX - down.x) * .005; inside.pitch = Math.max(-.8, Math.min(.6, down.ipitch - (e.clientY - down.y) * .004)); return; } if (mode === 'walk' && down) { walk.yaw = down.yaw - (e.clientX - down.x) * .005; walk.pitch = Math.max(-.9, Math.min(.6, down.pitch - (e.clientY - down.y) * .004)); } });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6; down = null; if (moved) return;
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  if (inside) { const hh = ray.intersectObjects(inside.g.children, true).find(x => x.object.userData.hot); if (hh) useHot(hh.object.userData.hot); return; } const hit = ray.intersectObjects(picks, false)[0]; if (hit) select(hit.object.userData.place);
});
renderer.domElement.addEventListener('pointerleave', () => { down = null; });

// walk input
const KEYMAP = { ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', KeyQ: 'sl', KeyE: 'sr' };
on('keydown', e => { const k = KEYMAP[e.code]; if (!k || e.target.closest && e.target.closest('input,textarea')) return; walk.keys[k] = true; e.preventDefault(); if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); }, true);
on('blur', () => { walk.keys = {}; });
on('keyup', e => { const k = KEYMAP[e.code]; if (k) walk.keys[k] = false; }, true);
// joystick
const joyEl = document.getElementById('joy'), knob = document.getElementById('knob'); const joy = { x: 0, y: 0, id: null };
function joyMove(e) { const r2 = joyEl.getBoundingClientRect(), cx = r2.left + r2.width / 2, cy = r2.top + r2.height / 2, max = r2.width / 2 - 20; let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > max) { dx *= max / d; dy *= max / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / max; joy.y = dy / max; }
joyEl.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); joyEl.classList.add('active'); joyMove(e); });
joyEl.addEventListener('pointermove', e => { if (e.pointerId === joy.id) joyMove(e); });
const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; joyEl.classList.remove('active'); };
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => joyEl.addEventListener(ev, joyEnd));
document.querySelectorAll('#pad button').forEach(b => { const k = b.dataset.k; b.addEventListener('pointerdown', e => { e.preventDefault(); walk.keys[k] = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => walk.keys[k] = false)); });

on('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (mode === 'aerial') { const f = fitAerial(); setFog(f.dist); flyTo(f.pos, f.target, .4); } });

// loop
const clock = new THREE.Clock(), tmp = new THREE.Vector3();
camera.position.set(0, 70, 50); controls.target.set(0, 0, 3);
function loop() {
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 70) c.position.x = -70; });
  scene.traverse(o => { if (o.userData.flame) o.scale.y = 1 + Math.sin(t * 22 + o.id) * .12; if (o.userData.float) o.position.y += Math.sin(t * 2 + o.id) * .002; });
  if (groups.game) groups.game.children.find(c => c.name === 'robot').position.y = 3.15 + Math.sin(t * 2) * .08;
  if (groups.ears) groups.ears.rotation.y = Math.sin(t * .6) * .06;
  if (fly) { const k = Math.min(1, (performance.now() - fly.s) / fly.d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.t0, fly.t1, e); if (k >= 1) fly = null; }
  if (mode === 'tour' && !fly) { tourT += dt; if (tourT > 4.2) { tourT = 0; tourI = (tourI + 1) % PLACES.length; const v = viewFor(PLACES[tourI], 14); flyTo(v.pos, v.target, 1.8); showPanel(PLACES[tourI]); } else { const p = PLACES[tourI], a = tourT * .12; const v = viewFor(p, 14); const off = v.pos.clone().sub(v.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), a); camera.position.copy(v.target).add(off); controls.target.copy(v.target); } }
  if (inside && inside.pos) {
    const sp = 3.4 * dt, k = walk.keys; if (k.l) inside.yaw += 1.8 * dt; if (k.r) inside.yaw -= 1.8 * dt;
    const fwd = new THREE.Vector3(-Math.sin(inside.yaw), 0, -Math.cos(inside.yaw)), side = new THREE.Vector3(Math.cos(inside.yaw), 0, -Math.sin(inside.yaw));
    if (k.f) inside.pos.addScaledVector(fwd, sp); if (k.b) inside.pos.addScaledVector(fwd, -sp); if (k.sl) inside.pos.addScaledVector(side, -sp); if (k.sr) inside.pos.addScaledVector(side, sp);
    if (joy.x || joy.y) { inside.pos.addScaledVector(fwd, -joy.y * sp * 1.1); inside.pos.addScaledVector(side, joy.x * sp * .8); inside.yaw -= joy.x * dt; }
    inside.pos.x = Math.max(-5.3, Math.min(5.3, inside.pos.x)); inside.pos.z = Math.max(-4.2, Math.min(4.4, inside.pos.z));
    camera.position.copy(inside.pos); camera.lookAt(tmp.set(inside.pos.x - Math.sin(inside.yaw) * Math.cos(inside.pitch), inside.pos.y + Math.sin(inside.pitch), inside.pos.z - Math.cos(inside.yaw) * Math.cos(inside.pitch)));
    let best = null, bd = 2.8; (inside.g.userData.hot || []).forEach(h => { if (!h.wp) return; const d = Math.hypot(h.wp.x - inside.pos.x, h.wp.z - inside.pos.z), dir = new THREE.Vector3(h.wp.x - inside.pos.x, 0, h.wp.z - inside.pos.z).normalize(); if (d < bd && dir.dot(fwd) > .2) { bd = d; best = h; } });
    (inside.g.userData.rings || []).forEach((rg, n) => { rg.scale.setScalar(1 + Math.sin(t * 3 + n) * .08); rg.material.opacity = .55 + Math.sin(t * 3 + n) * .35; });
    if (best !== curHot) { curHot = best; if (best) { useEl.innerHTML = (matchMedia('(pointer: coarse)').matches ? '<kbd>Tap</kbd>' : '<kbd>E</kbd>') + best.label; useEl.classList.add('show'); } else useEl.classList.remove('show'); }
    const rr = []; roomTags.forEach(o => { placeTag(o, o.h ? 9 : 5.5); if (o.el.style.opacity === '1') { const x0 = parseFloat(o.el.style.left), y0 = parseFloat(o.el.style.top), w0 = o.el.offsetWidth || 80; if (rr.some(q => Math.abs(q.x - x0) < (q.w + w0) / 2 + 4 && Math.abs(q.y - y0) < 22)) o.el.style.opacity = 0; else rr.push({ x: x0, y: y0, w: w0 }); } o.el.classList.toggle('near', !!o.h && o.h === curHot); o.el.style.fontSize = o.h ? '12px' : '11px'; o.el.style.background = o.h ? '' : 'rgba(11,16,38,.78)'; o.el.style.color = o.h ? '' : '#FFF8EC'; o.el.style.borderColor = o.h ? '' : 'rgba(255,248,236,.6)'; });
    renderer.render(scene, camera); (stopped ? 0 : (raf = requestAnimationFrame(loop))); return;
  }
  if (mode === 'walk') {
    const sp = 6 * dt; if (walk.keys.l) walk.yaw += 1.8 * dt; if (walk.keys.r) walk.yaw -= 1.8 * dt;
    const fwd = new THREE.Vector3(-Math.sin(walk.yaw), 0, -Math.cos(walk.yaw)), side = new THREE.Vector3(Math.cos(walk.yaw), 0, -Math.sin(walk.yaw));
    if (walk.keys.f) walk.pos.addScaledVector(fwd, sp); if (walk.keys.b) walk.pos.addScaledVector(fwd, -sp);
    if (walk.keys.sl) walk.pos.addScaledVector(side, -sp); if (walk.keys.sr) walk.pos.addScaledVector(side, sp);
    if (joy.x || joy.y) { walk.pos.addScaledVector(fwd, -joy.y * sp * 1.1); walk.pos.addScaledVector(side, joy.x * sp * .8); walk.yaw -= joy.x * 1.1 * dt; }
    walk.pos.x = Math.max(-30, Math.min(30, walk.pos.x)); walk.pos.z = Math.max(-40, Math.min(MD / 2 + 16, walk.pos.z));
    for (const p of PLACES) { const d = Math.hypot(walk.pos.x - p.world.x, walk.pos.z - p.world.z); if (d < 4) { const n = tmp.set(walk.pos.x - p.world.x, 0, walk.pos.z - p.world.z).normalize(); walk.pos.x = p.world.x + n.x * 4; walk.pos.z = p.world.z + n.z * 4; } }
    const nearP = PLACES.find(p => Math.hypot(walk.pos.x - p.world.x, walk.pos.z - p.world.z) < 7.5);
    if (nearP && selected !== nearP) showPanel(nearP); else if (!nearP && selected) hidePanel();
    walk.pos.y = 1.6 + hill(walk.pos.x, walk.pos.z) + (walk.keys.f || walk.keys.b || joy.y ? Math.abs(Math.sin(t * 9)) * .05 : 0);
    camera.position.copy(walk.pos); camera.lookAt(tmp.set(walk.pos.x - Math.sin(walk.yaw) * Math.cos(walk.pitch), walk.pos.y + Math.sin(walk.pitch), walk.pos.z - Math.cos(walk.yaw) * Math.cos(walk.pitch)));
  } else {
    const k = walk.keys; if ((k.f || k.b || k.l || k.r) && mode !== 'tour' && !inside) { fly = null; const sp2 = 18 * dt, f2 = new THREE.Vector3().subVectors(controls.target, camera.position).setY(0).normalize(), s2 = new THREE.Vector3(-f2.z, 0, f2.x), mv = new THREE.Vector3(); if (k.f) mv.add(f2); if (k.b) mv.sub(f2); if (k.r) mv.add(s2); if (k.l) mv.sub(s2); mv.multiplyScalar(sp2); camera.position.add(mv); controls.target.add(mv); }
    controls.update(); }
  const placedR = []; [...PLACES].sort((a, b) => b.world.z - a.world.z).forEach(p => { tmp.set(p.world.x, p.top + .6, p.world.z).project(camera); const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1; const sy = (1 - tmp.y) / 2 * innerHeight; const far = mode === 'walk' && Math.hypot(camera.position.x - p.world.x, camera.position.z - p.world.z) > 22; const sx = (tmp.x + 1) / 2 * innerWidth, pr = panel.classList.contains('show') ? panel.getBoundingClientRect() : null, underPanel = pr && sx > pr.left - 40 && sx < pr.right + 40 && sy > pr.top - 10 && sy < pr.bottom + 24, dockTop = document.getElementById('dock').classList.contains('hide') ? innerHeight : innerHeight - 92; const w0 = p.el.offsetWidth || 90, box = { l: sx - w0 / 2, r: sx + w0 / 2, t: sy - 28, b: sy };
      const blockers = [pr, document.getElementById('modes').getBoundingClientRect(), document.querySelector('#top .chip').getBoundingClientRect()].filter(Boolean);
      const blocked = blockers.some(q => box.r > q.left - 6 && box.l < q.right + 6 && box.b > q.top - 6 && box.t < q.bottom + 6);
      const clear = sy > 84 && sy < dockTop && !far && !blocked; p.el.style.opacity = vis && clear ? (mode === 'walk' ? .85 : 1) : 0; p.el.style.pointerEvents = vis && clear ? 'auto' : 'none'; p.el.style.left = ((tmp.x + 1) / 2 * innerWidth) + 'px'; p.el.style.top = sy + 'px'; if (vis && clear) { const x0 = sx, y0 = sy, hit = placedR.some(q => Math.abs(q.x - x0) < (q.w + w0) / 2 + 4 && Math.abs(q.y - y0) < 24); if (hit && p !== selected) { p.el.style.opacity = 0; p.el.style.pointerEvents = 'none'; } else placedR.push({ x: x0, y: y0, w: w0 }); } });
  tagEls.forEach(o => placeTag(o, mode === 'walk' ? 26 : mode === 'aerial' ? 0 : 40));
  renderer.render(scene, camera); (stopped ? 0 : (raf = requestAnimationFrame(loop)));
}
{ const at = new URLSearchParams(location.search).get('at'), ap = at && PLACES.find(p => p.id === at); if (ap) { setMode('orbit'); const d = doorView(ap); camera.position.copy(d.pos).add(new THREE.Vector3(0, 4, 8)); controls.target.copy(d.target); fly = null; showPanel(ap); } else setMode((location.hash || '').slice(1) || 'walk'); }
loop();
requestAnimationFrame(() => document.getElementById('loading').classList.add('done'));

return () => {
  stopped = true; cancelAnimationFrame(raf); offs.forEach((f) => f());
  try { renderer.dispose(); renderer.domElement.remove(); } catch {}
};
}
