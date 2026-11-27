/* eslint-disable */
// 3D Champ Town interiors and their hotspots, from the Claude Design 'Champ Town 3D' screen.
import * as THREE from 'three';
import { mat } from './buildings.js';

let KID_NAME = 'Champ';
/** The signed-in kid's first name, shown on the smart table. */
export function setKidName(name) { KID_NAME = String(name || 'Champ').slice(0, 24); }

const mk = (n, g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.name = n; o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
const B = (n, w, h, d, m, x, y, z) => mk(n, new THREE.BoxGeometry(w, h, d), m, x, y, z);
const Cy = (n, r1, r2, h, m, x, y, z, s = 24) => mk(n, new THREE.CylinderGeometry(r1, r2, h, s), m, x, y, z);
const Sp = (n, r, m, x, y, z) => mk(n, new THREE.SphereGeometry(r, 20, 14), m, x, y, z);
function label(text, w = 4, h = 1, bg = '#0B1026', fg = '#FFF8EC', font = 'italic 900 120px Archivo, sans-serif', sub) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * h / w); const x = cv.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = font; x.save(); x.translate(512, cv.height * (sub ? .4 : .5)); x.scale(.7, 1); x.fillText(text, 0, 0); x.restore();
  if (sub) { x.font = '700 44px "Nunito Sans", sans-serif'; x.fillStyle = '#F2B33D'; x.fillText(sub, 512, cv.height * .78); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return mk('sign-' + text, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .6 }));
}
function shell(name, { floor, wall, w = 12, d = 10, h = 4.2, rug, windowCol = 0xBFE3F7, win = true }) {
  const g = new THREE.Group(); g.name = name;
  g.add(B('floor', w, .2, d, mat('floor-' + floor.toString(16), floor, { r: .75 }), 0, -.1, 0));
  const wm = mat('wall-' + wall.toString(16), wall, { r: .9 });
  g.add(B('wall-back', w, h, .2, wm, 0, h / 2, -d / 2)); g.add(B('wall-left', .2, h, d, wm, -w / 2, h / 2, 0)); g.add(B('wall-right', .2, h, d, wm, w / 2, h / 2, 0));
  g.add(B('skirting', w, .18, .24, mat('skirting', 0xFFFDF7), 0, .09, -d / 2 + .02));
  if (win) for (const x of [-w / 3, w / 3]) { g.add(B('window-frame', 2, 1.6, .1, mat('frame-white', 0xFFFDF7), x, h * .58, -d / 2 + .12)); g.add(B('window-sky', 1.7, 1.3, .1, mat('window-sky', windowCol, { e: windowCol, ei: .5, r: .2 }), x, h * .58, -d / 2 + .16)); }
  if (rug) { const r = mk('rug', new THREE.CircleGeometry(2.6, 40), mat('rug-' + rug.toString(16), rug, { r: 1 })); r.rotation.x = -Math.PI / 2; r.position.y = .02; g.add(r); }
  const lamp = Cy('ceiling-lamp', .5, .7, .4, mat('lamp-shade', 0xF2B33D, { e: 0xF2B33D, ei: .3 }), 0, h - .3, 0); g.add(lamp);
  const L = new THREE.PointLight(0xFFE7B8, 14, 16, 1.6); L.position.set(0, h - .6, 0); L.castShadow = true; g.add(L);
  g.userData = { w, d, h }; return g;
}
const sofa = (n, x, z, c, ry = 0) => { const g = new THREE.Group(); const m = mat('sofa-' + c.toString(16), c, { r: .9 }); g.add(B(n + '-seat', 2.4, .5, 1, m, 0, .35, 0)); g.add(B(n + '-back', 2.4, .8, .3, m, 0, .8, -.4)); for (const s of [-1, 1]) g.add(B(n + '-arm', .3, .65, 1, m, s * 1.2, .5, 0)); g.position.set(x, 0, z); g.rotation.y = ry; return g; };
const shelf = (n, x, z, ry = 0, w = 2) => { const g = new THREE.Group(); const wd = mat('shelf-wood', 0x9C6A3C, { r: .8 }); g.add(B(n, w, 2.4, .4, wd, 0, 1.2, 0)); const cols = [0xFF5A3C, 0x2F5BFF, 0xF2B33D, 0x1E8F5A, 0x8B5CF6];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) g.add(B('book', .18, .4 + (i % 3) * .06, .3, mat('book-' + (i % 5), cols[(i + r) % 5], { r: .7 }), -w / 2 + .25 + i * .24, .35 + r * .55, .05)); g.position.set(x, 0, z); g.rotation.y = ry; return g; };
const plant = (x, z) => { const g = new THREE.Group(); g.add(Cy('pot', .3, .22, .5, mat('pot', 0xC2643A), 0, .25, 0)); g.add(Sp('leaves', .55, mat('leaf-a', 0x5FA83E, { r: .85 }), 0, .9, 0)); g.position.set(x, 0, z); return g; };
const desk = (x, z, c = 0xD9B98B) => { const g = new THREE.Group(); const m = mat('desk-' + c.toString(16), c, { r: .7 }); g.add(B('desk-top', 1.2, .08, .7, m, 0, .75, 0)); for (const [a, b] of [[-.5, -.28], [.5, -.28], [-.5, .28], [.5, .28]]) g.add(Cy('desk-leg', .03, .03, .75, mat('steel', 0x6B7080, { m: .5, r: .4 }), a, .37, b, 8)); g.add(B('chair-seat', .5, .06, .5, mat('chair-blue', 0x2F5BFF), 0, .45, .55)); g.add(B('chair-back', .5, .5, .06, mat('chair-blue', 0x2F5BFF), 0, .72, .78)); g.position.set(x, 0, z); return g; };

export function hot(g, obj, label, act, at) { (g.userData.hot = g.userData.hot || []).push({ obj, label, act, at }); }
function smartTable(g, x, z) { const t = new THREE.Group(); t.name = 'smart-table';
  const wood = mat('table-oak', 0xC28A55, { r: .6 }), metal = mat('steel', 0x6B7080, { m: .5, r: .4 });
  t.add(B('table-frame', 2.6, .12, 1.6, wood, 0, .9, 0)); for (const [a, b] of [[-1.15, -.65], [1.15, -.65], [-1.15, .65], [1.15, .65]]) t.add(Cy('table-leg', .06, .05, .9, metal, a, .45, b, 10));
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 600; const c = cv.getContext('2d'); c.fillStyle = '#0B1026'; c.fillRect(0, 0, 1024, 600);
  const apps = [['Sunday School', '#8B5CF6'], ['Arena', '#2F5BFF'], ['Heroes', '#F2B33D'], ['Champ Card', '#6FA3D8'], ['My Teacher', '#1E8F5A'], ['Talk', '#FF8FB3'], ['Hall', '#F2B33D'], ['Clubhouse', '#FF5A3C']];
  apps.forEach(([n, col], k) => { const cx = 140 + (k % 4) * 248, cy = 170 + Math.floor(k / 4) * 250; c.fillStyle = col; c.beginPath(); c.roundRect(cx - 70, cy - 70, 140, 140, 36); c.fill(); c.fillStyle = '#FFF8EC'; c.font = '800 30px "Nunito Sans", sans-serif'; c.textAlign = 'center'; c.fillText(n, cx, cy + 115); });
  c.fillStyle = '#F2B33D'; c.font = 'italic 900 46px Archivo, sans-serif'; c.textAlign = 'left'; c.fillText('Good to see you, ' + KID_NAME, 40, 56);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const scr = mk('table-screen', new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xFFFFFF, emissiveMap: tex, emissiveIntensity: .55, roughness: .2 })); scr.rotation.x = -Math.PI / 2; scr.position.y = .965; t.add(scr);
  t.position.set(x, 0, z); g.add(t); return t; }
export const INTERIORS = {
  home(p) { const g = shell('interior-home', { floor: 0xC9A27A, wall: 0xFFE6B8, rug: 0xFF8FB3 });
    g.add(sofa('sofa', -2.2, 1.6, 0x2F5BFF, Math.PI * .5)); g.add(shelf('shelf', -4.8, -2, Math.PI / 2)); g.add(plant(4.8, -4)); g.add(plant(-4.8, 3.6));
    g.add(B('tv-stand', 3, .6, .6, mat('shelf-wood', 0x9C6A3C), 0, .3, -4.4)); const tab = B('tablet-big', 2.6, 1.6, .1, mat('tablet-frame', 0xE4E7EC, { r: .3 }), 0, 1.6, -4.5); g.add(tab); g.add(B('tablet-screen', 2.4, 1.4, .02, mat('tablet-screen', 0x1A1F3D, { e: 0x2F5BFF, ei: .35 }), 0, 1.6, -4.44));
    const s = label('WELCOME HOME', 2.2, .6, '#1A1F3D', '#FFF8EC', 'italic 900 150px Archivo'); s.position.set(0, 1.75, -4.42); g.add(s);
    const tbl = smartTable(g, 2.6, 1.2); hot(g, tbl, 'Use the smart table', 'table');
    const fr = new THREE.Group(); fr.add(B('fridge', 1, 2.1, .8, mat('fridge-white', 0xF3F4F6, { r: .3 }), 0, 1.05, 0)); fr.add(B('fridge-handle', .05, .6, .05, mat('steel', 0x6B7080), .38, 1.4, .42)); for (let k = 0; k < 4; k++) fr.add(B('magnet-note', .26, .3, .02, mat('note-' + k, [0xFFE6B8, 0xDDE4FF, 0xDCF5E6, 0xFCE1EC][k], { r: .8 }), -.25 + (k % 2) * .3, 1.2 + Math.floor(k / 2) * .45, .41)); fr.position.set(-4.9, 0, -3.8); fr.rotation.y = Math.PI / 2; g.add(fr); hot(g, fr, 'Open the Fridge', 'link:Clubhouse.dc.html');
    hot(g, tab, 'Open My House', 'room:home'); const sh = g.children.find(c => c.children && c.children.some(k => k.name === 'shelf')); if (sh) hot(g, sh, 'Pick a reading plan', 'link:Sunday School.dc.html#reading');
    const so = g.children.find(c => c.children && c.children.some(k => k.name === 'sofa-seat')); if (so) hot(g, so, 'Rest on the sofa', 'say:"I will both lay me down in peace, and sleep." Psalm 4:8');
    return g; },
  class(p) { const g = shell('interior-class', { floor: 0xDCC9A6, wall: 0xDCF5E6, win: false });
    g.add(B('chalkboard', 6, 2.2, .1, mat('chalk-green', 0x1F4D3A, { r: .9 }), 0, 2.2, -4.85)); const v = label('THE BATTLE IS THE LORD\u2019S', 5.4, 1.4, '#1F4D3A', '#FFF8EC', '900 92px "Nunito Sans"', '1 SAMUEL 17:47 · MEMORY VERSE'); v.position.set(0, 2.2, -4.78); g.add(v);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) g.add(desk(-3 + c * 3, -1 + r * 2.4));
    const td = B('teacher-desk', 2.2, .9, 1, mat('shelf-wood', 0x9C6A3C), 3.8, .45, -3.4); g.add(td); g.add(Sp('apple', .14, mat('apple', 0xD9442E), 3.6, 1.04, -3.3)); const cs = shelf('class-shelf', -5.8, 1.5, Math.PI / 2, 2.4); g.add(cs);
    hot(g, v, 'Read the memory verse', 'say:"The battle is the Lord\u2019s." 1 Samuel 17:47. Say it three times!', [0, 1, -3.6]); hot(g, td, 'Open My Class', 'room:class'); hot(g, cs, 'Start Faith Quest', 'link:Sunday School.dc.html#quest'); return g; },
  messages(p) { const g = shell('interior-teacher', { floor: 0x8A5A35, wall: 0xC88A45, rug: 0xB3263E, windowCol: 0xFFD27A });
    g.add(B('fireplace', 2.6, 2, .8, mat('chimney-stone', 0x8B7D73, { flat: true }), 0, 1, -4.5)); g.add(B('fire-hole', 1.4, 1, .2, mat('soot', 0x1A1210), 0, .7, -4.08));
    g.add(Sp('fire', .35, mat('fire', 0xFF8A3D, { e: 0xFF6A1A, ei: 2 }), 0, .55, -4.1)); const fl = new THREE.PointLight(0xFF8A3D, 8, 8); fl.position.set(0, .8, -3.6); g.add(fl);
    g.add(sofa('armchair', -2.4, 1, 0x1E8F5A, Math.PI * .8)); g.add(shelf('cabin-shelf', 5.8, 0, -Math.PI / 2, 2.4));
    const wd = B('writing-desk', 1.8, .8, .9, mat('shelf-wood', 0x9C6A3C), 3, .4, -3); g.add(wd); g.add(B('phone', .3, .55, .04, mat('phone-black', 0x111111, { r: .2 }), 3, .95, -3)); g.add(B('phone-screen', .26, .48, .01, mat('phone-glow', 0x2F5BFF, { e: 0x2F5BFF, ei: .8 }), 3, .95, -2.975));
    hot(g, wd, 'Message my teacher', 'room:messages'); const fp = g.children.find(c => c.name === 'fireplace'); hot(g, fp, 'Warm up by the fire', 'fire'); return g; },
  ears(p) { const g = shell('interior-ears', { floor: 0xF6D7DF, wall: 0xFCE1EC, rug: 0xFFFFFF, windowCol: 0xFFE6F0 });
    const pink = mat('bean-pink', 0xFF8FB3, { r: .95 }), mint = mat('bean-mint', 0x7EE0B5, { r: .95 }), lav = mat('bean-lav', 0xB58AD6, { r: .95 });
    [[-2, 1, pink], [0, 1.8, mint], [2, 1, lav]].forEach(([x, z, m], i) => { const b = Sp('beanbag-' + i, .8, m, x, .45, z); b.scale.y = .6; g.add(b); });
    const tr = Cy('nook-trunk', .3, .45, 3.6, mat('bark-tan', 0xC98B5E), 0, 1.8, -3.6); g.add(tr);
    for (let i = 0; i < 9; i++) { const h = Sp('heart-light', .35, mat('heart-pink', 0xFF5C8A, { e: 0xFF5C8A, ei: .4 }), Math.cos(i) * 1.6, 3.4 + Math.sin(i * 2) * .4, -3.6 + Math.sin(i) * .6); g.add(h); }
    const s = label('YOU ARE NOT ALONE', 4, .9, '#FCE1EC', '#B3263E', 'italic 900 130px Archivo', '1 PETER 5:7'); s.position.set(-3.2, 2.6, -4.88); g.add(s); hot(g, tr, 'Share a worry', 'room:ears'); const bb = g.children.find(c => c.name === 'beanbag-1'); hot(g, bb, 'Take three slow breaths', 'say:Breathe in... and out. "Casting all your care upon him; for he careth for you." 1 Peter 5:7'); return g; },
  game(p) { const g = shell('interior-arena', { floor: 0x161B3A, wall: 0x0B1026, windowCol: 0x2F5BFF, win: false });
    const ring = mk('neon-ring', new THREE.TorusGeometry(2.6, .06, 8, 64), mat('neon-gold', 0xF2B33D, { e: 0xF2B33D, ei: 2 })); ring.rotation.x = -Math.PI / 2; ring.position.y = .03; g.add(ring);
    const scr = label('CHAMP ARENA', 7, 2.2, '#2F5BFF', '#FFF8EC', 'italic 900 200px Archivo', 'PSALM 119:11 · THY WORD HAVE I HID IN MINE HEART'); scr.position.set(0, 2.4, -4.85); g.add(scr); hot(g, scr, 'Host the Live Bible Quiz', 'link:Champ Arena.dc.html#quiz', [0, 1, -4]);
    [['#FF5A3C', -3.2, 'scramble', 'Verse Scramble'], ['#B58AD6', -1.1, 'match', 'Memory Match'], ['#7EE0B5', 1.1, 'word', 'Word Search'], ['#A8BCFF', 3.2, 'ark', 'Ark Catch']].forEach(([c, x, gk, gn], i) => { const pd = Cy('podium-' + i, .5, .6, .9, mat('podium-' + i, new THREE.Color(c).getHex(), { r: .4 }), x, .45, 0); g.add(pd); hot(g, pd, 'Play ' + gn, 'link:Champ Arena.dc.html#' + gk); g.add(Cy('buzzer-' + i, .22, .26, .14, mat('buzzer', 0xFF5A3C, { e: 0xFF5A3C, ei: .5 }), x, .97, 0)); });
    for (const x of [-5.5, 5.5]) { const sp = new THREE.SpotLight(x < 0 ? 0xB58AD6 : 0x2F5BFF, 30, 14, .5, .6); sp.position.set(x, 4, 2); sp.target.position.set(0, 0, -1); g.add(sp, sp.target); } return g; },
  profile(p) { const g = shell('interior-card', { floor: 0xE9DDBF, wall: 0xDDE4FF });
    for (let i = 0; i < 5; i++) { const x = -4 + i * 2; g.add(B('frame-' + i, 1.5, 1, .08, mat('frame-gold', 0xF2B33D, { r: .3, m: .4 }), x, 2.3, -4.88)); g.add(B('frame-in-' + i, 1.3, .8, .02, mat('frame-in-' + i, [0x2F5BFF, 0xFF5A3C, 0x1E8F5A, 0xB58AD6, 0xF2B33D][i], { r: .6 }), x, 2.3, -4.83)); }
    const card = B('giant-card', 2.6, 1.6, .2, mat('badge-blue', 0x6FA3D8), 0, 1.6, -1.5); card.rotation.y = .2; g.add(card); g.add(Cy('card-stand', .5, .7, .9, mat('stand', 0x2A2F4A), 0, .45, -1.5)); hot(g, card, 'Open my Champ Card', 'room:profile'); hot(g, g.children.find(c => c.name === 'frame-2'), 'See my Bible Heroes', 'link:Champ Collection.html', [0, 1, -4]); return g; },
  bible(p) { const g = shell('interior-chapel', { floor: 0xB88A5A, wall: 0xFFF5DC, windowCol: 0xB58AD6, win: false });
    const glassCols = [0xFF5A3C, 0xF2B33D, 0x2F5BFF, 0x1E8F5A, 0x8B5CF6]; for (let i = 0; i < 5; i++) g.add(B('stained-' + i, .5, 2, .05, mat('stained-' + i, glassCols[i], { e: glassCols[i], ei: .6, r: .2 }), -1 + i * .5, 2.6, -4.86));
    for (let r = 0; r < 3; r++) for (const s of [-1, 1]) { g.add(B('pew', 3.2, .5, .8, mat('shelf-wood', 0x9C6A3C), s * 2.4, .45, -.4 + r * 1.6)); g.add(B('pew-back', 3.2, .7, .12, mat('shelf-wood', 0x9C6A3C), s * 2.4, .9, 0 + r * 1.6)); }
    g.add(B('lectern', .9, 1.2, .6, mat('desk-d9b98b', 0xD9B98B), 0, .6, -3.4)); const bk = B('open-bible', 1, .08, .7, mat('book-pages', 0xEDE6FF), 0, 1.26, -3.4); bk.rotation.x = -.3; g.add(bk); hot(g, bk, 'Open this Sunday\u2019s lesson', 'link:Sunday School.dc.html#sundays'); hot(g, g.children.find(c => c.name === 'stained-2'), 'Look at the stained glass', 'say:"Thy word is a lamp unto my feet, and a light unto my path." Psalm 119:105', [0, 1, -4]);
    const s = label('THY WORD IS A LAMP', 4.4, .8, '#FFF5DC', '#6B2C91', 'italic 900 130px Archivo', 'PSALM 119:105'); s.position.set(-3.6, 3.3, -4.88); g.add(s); return g; },
  leaderboard(p) { const g = shell('interior-hall', { floor: 0x2A2F4A, wall: 0x161B3A, windowCol: 0xF2B33D, win: false });
    [[0, 1.4, 0xF2B33D, '1'], [-1.8, 1, 0xC9CBE0, '2'], [1.8, .7, 0xD9884A, '3']].forEach(([x, h, c, n]) => { g.add(B('podium-' + n, 1.6, h, 1.4, mat('podium-step', 0xFFFDF7, { r: .5 }), x, h / 2, -1)); g.add(Sp('medal-' + n, .3, mat('medal-' + n, c, { r: .3, m: .6 }), x, h + .35, -1)); });
    for (const x of [-4.5, 4.5]) { g.add(B('banner', 1.3, 2.6, .05, mat('banner-blue', 0x2F5BFF), x, 2.4, -4.86)); }
    const s = label('HALL OF CHAMPS', 5, 1, '#161B3A', '#F2B33D', 'italic 900 170px Archivo', 'COLOSSIANS 3:23'); s.position.set(0, 3.1, -4.88); g.add(s); hot(g, g.children.find(c => c.name === 'podium-1'), 'See this week\u2019s champs', 'room:leaderboard'); hot(g, g.children.find(c => c.name === 'banner'), 'Visit my Bible Heroes', 'link:Champ Collection.html', [-4.5, 1, -4]); return g; },
};
