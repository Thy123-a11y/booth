/* ===== THÔNG SỐ (đơn vị mét) ===== */
const R = 6;      // cạnh lục giác = chiều dài vách
const H = 3.6;    // chiều cao vách (đổi tại đây nếu cần)
const T = 0.18;   // độ dày vách
const vec = a => { a *= Math.PI / 180; return { x: Math.cos(a), z: -Math.sin(a) } };

/* ===== SCENE ===== */
const app = document.getElementById('app');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1e9dc);
const cam = new THREE.PerspectiveCamera(40, 1, .1, 100);
const ren = new THREE.WebGLRenderer({ antialias: true });
ren.setPixelRatio(Math.min(devicePixelRatio, 2));
ren.shadowMap.enabled = true;
app.appendChild(ren.domElement);
scene.add(new THREE.HemisphereLight(0xfff3df, 0x8a6a4a, .9));
const sun = new THREE.DirectionalLight(0xffffff, .75);
sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 35 });
scene.add(sun);

/* ===== HELPERS ===== */
const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .8 }, o));
const RED = M(0x8e1f2b), CREAM = M(0xf0e4cd), WOOD = M(0xa8733f), DARK = M(0x5a3520), BAM = M(0xc89a52), GREEN = M(0x3d6b3a), POT = M(0xdcd2c0);
function add(p, geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m }
const box = (p, w, h, d, mat, x, y, z) => add(p, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
const cyl = (p, rt, rb, h, mat, x, y, z, s = 24) => add(p, new THREE.CylinderGeometry(rt, rb, h, s), mat, x, y, z);
const ball = (p, r, mat, x, y, z) => add(p, new THREE.SphereGeometry(r, 16, 12), mat, x, y, z);
function tex(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t }
function plane(p, w, h, map, x, y, z, rx = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: .9 })); m.position.set(x, y, z); m.rotation.x = rx; p.add(m); return m }
const tx = (g, s, x, y, sz, col, al = 'center', wt = '700', st = '') => { g.fillStyle = col; g.textAlign = al; g.font = `${st} ${wt} ${sz}px "Be Vietnam Pro",Georgia,serif`; g.fillText(s, x, y) };

/* ===== TEXTURE ===== */
const kvTex = () => tex(512, 640, (g, w, h) => {
  g.fillStyle = '#8e1f2b'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f1d9c0'; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28);
  g.beginPath(); g.arc(310, 250, 44, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(248, 220); g.lineTo(310, 165); g.lineTo(372, 220); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(250, 340); g.quadraticCurveTo(310, 280, 390, 340); g.lineTo(410, 480); g.lineTo(230, 480); g.closePath(); g.stroke();
  g.beginPath(); g.ellipse(262, 440, 36, 28, -.6, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(284, 418); g.lineTo(390, 215); g.stroke();
  tx(g, 'Hát', 120, 150, 70, '#f6e6d0', 'center', '700', 'italic');
  tx(g, 'Xẩm', 160, 225, 70, '#f6e6d0', 'center', '700', 'italic');
  tx(g, 'DÒNG CHẢY VĂN HÓA DÂN GIAN', w / 2, 575, 19, '#f1d9c0');
});
const info = (t, ls) => tex(400, 560, (g, w, h) => {
  g.fillStyle = '#f3e6cf'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8e1f2b'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  tx(g, t, w / 2, 72, 36, '#8e1f2b');
  ls.forEach((l, i) => tx(g, l, 36, 140 + i * 44, 24, '#5a2a20', 'left', '500'));
});
const photoTex = () => tex(300, 240, (g, w, h) => {
  g.fillStyle = '#d8c7a4'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#4b3a2b';
  [60, 120, 180, 235].forEach((x, i) => { g.beginPath(); g.arc(x, 110 + (i % 2) * 8, 20, 0, 7); g.fill(); g.fillRect(x - 24, 130 + (i % 2) * 8, 48, 90) });
});
const qrTex = () => tex(256, 400, (g, w, h) => {
  g.fillStyle = '#8e1f2b'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.fillRect(48, 40, 160, 160);
  g.fillStyle = '#000';
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if ((i * 7 + j * 13 + i * j) % 3 === 0) g.fillRect(56 + i * 14.4, 48 + j * 14.4, 12, 12);
  tx(g, 'Quét mã', w / 2, 250, 24, '#f6e6d0'); tx(g, 'trải nghiệm', w / 2, 280, 24, '#f6e6d0');
  tx(g, 'Hát Xẩm', w / 2, 340, 40, '#f6e6d0', 'center', '700', 'italic');
});
const screenTex = () => tex(256, 160, (g, w, h) => {
  g.fillStyle = '#e8d9bd'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#8e1f2b'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(16 + i * 80, 16 + j * 70, 68, 58);
});
const matTex = c1 => tex(256, 256, (g, w, h) => {
  g.fillStyle = c1; g.fillRect(0, 0, w, h); g.strokeStyle = '#0003'; g.lineWidth = 2;
  for (let i = 0; i < w; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke() }
});
const floorTex = tex(512, 512, (g, w, h) => {
  g.fillStyle = '#b7824a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#c08a52' : '#ad7843'; g.fillRect(0, i * 32, w, 30) }
});

/* ===== SÀN LỤC GIÁC ĐỀU ===== */
const floor = add(scene, new THREE.CylinderGeometry(R, R, .2, 6), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .8 }), 0, -.1, 0);
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;

/* ===== 3 VÁCH NGĂN THẲNG (120°) ===== */
const wmat = [RED, RED, RED, RED, CREAM, CREAM];
[90, 210, 330].forEach(th => {
  const d = vec(th);
  const w = new THREE.Mesh(new THREE.BoxGeometry(R, H, T), wmat);
  w.position.set(d.x * R / 2, H / 2, d.z * R / 2); w.rotation.y = th * Math.PI / 180;
  w.castShadow = w.receiveShadow = true; scene.add(w);
  box(scene, .4, H + .1, .4, RED, d.x * R, H / 2, d.z * R);
});
box(scene, .4, H + .1, .4, RED, 0, H / 2, 0);

/* ===== KHUNG TỌA ĐỘ CHO MẶT VÁCH =====
   frame(góc vách, góc phân giác phòng): local +z = hướng vào phòng,
   u(a) = vị trí dọc vách, a tính từ tâm (0) ra đầu vách (6). */
function frame(th, rb) {
  const d = vec(th), r = vec(rb); let n = { x: -d.z, z: d.x };
  if (n.x * r.x + n.z * r.z < 0) { n.x *= -1; n.z *= -1 }
  const g = new THREE.Group(), f = Math.atan2(n.x, n.z);
  g.position.set(d.x * R / 2 + n.x * T / 2, 0, d.z * R / 2 + n.z * T / 2); g.rotation.y = f;
  const s = Math.cos(f) * d.x - Math.sin(f) * d.z;
  g.u = a => s * (a - R / 2); scene.add(g); return g;
}
function plant(p, x, z, s = 1) { cyl(p, .17 * s, .13 * s, .3 * s, POT, x, .15 * s, z, 12); [[0, .6, 0], [.12, .5, .05], [-.1, .45, -.05]].forEach(o => ball(p, .2 * s, GREEN, x + o[0] * s, o[1] * s + .1, z + o[2] * s)) }
function lantern(p, x, y, z) { ball(p, .22, M(0xffd9a0, { emissive: 0xffa040, emissiveIntensity: .8 }), x, y, z); cyl(p, .01, .01, .4, DARK, x, y + .35, z, 6) }
function bench(p, x, z, len = 1.3) { box(p, len, .06, .35, DARK, x, .42, z); box(p, .08, .4, .3, DARK, x - len / 2 + .1, .2, z); box(p, .08, .4, .3, DARK, x + len / 2 - .1, .2, z) }

/* ===== ẢNH GỐC ĐÃ NẮN PHẲNG ===== */
const IMG={kv:"images/kv.jpg",r2:"images/r2.jpg",r3l:"images/r3l.jpg",r3r:"images/r3r.jpg"};
const TL=new THREE.TextureLoader();
function pic(p,k,w,h,x,y,z){const t=TL.load(IMG[k]);t.anisotropy=8;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);p.add(m);return m}

/* ===== CHẶNG 1 – NGHE XẨM: sân khấu quay vào vách 90°, nằm trong lục giác ===== */
const A = frame(90, 150), u1 = A.u;
pic(A,'kv',2.6,3.25,u1(2.7),1.95,.02);
box(A, 3.4, .3, 2.2, WOOD, u1(2.7), .15, 1.3);
plane(A, 2.6, 1.6, matTex('#b89a68'), u1(2.7), .31, 1.45, -Math.PI / 2);
box(A, 1.5, .18, .3, DARK, u1(2.2), .39, 1.0); box(A, 1.4, .07, .14, M(0x3b2416), u1(2.2), .52, 1.0);
const dn = cyl(A, .24, .24, .07, M(0xc9985a), u1(3.1), 1.0, 1.35); dn.rotation.x = Math.PI / 2;
box(A, .06, 1.0, .05, DARK, u1(3.1), 1.65, 1.35);
cyl(A, .3, .3, .45, M(0xb3232d), u1(3.9), .55, 1.3);
lantern(A, u1(1.1), 2.5, .5); lantern(A, u1(4.5), 2.5, .5);
plant(A, u1(1.0), .5); plant(A, u1(4.7), .5);
[1.7, 3.2].forEach(a => { bench(A, u1(a), 3.1); bench(A, u1(a), 3.8) });
const B = frame(210, 150);
for (let a = .8, i = 0; a < 5.6; a += .17, i++) { const h = 2.5 + (i % 3) * .15; cyl(B, .07, .07, h, BAM, B.u(a), h / 2, .12, 8) }
box(B, 4.9, .08, .1, DARK, B.u(3.2), 1.2, .2); box(B, 4.9, .08, .1, DARK, B.u(3.2), 2.2, .2);
lantern(B, B.u(2.0), 2.3, .6); plant(B, B.u(4.8), .6, 1.1);

/* ===== CHẶNG 2 – HIỂU XẨM: tường trưng bày chia đôi, mỗi nửa nằm trên một vách ===== */
const C = frame(90, 30), D = frame(330, 30);
function half(p,k,a,x0){const t=TL.load(IMG[k]);t.anisotropy=8;t.repeat.set(.5,1);t.offset.set(x0,0);const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,3.4),new THREE.MeshBasicMaterial({map:t}));m.position.set(p.u(a),1.8,.02);p.add(m)}
half(C,'r2',2.3,0); half(D,'r2',2.3,.5);
[[D,2.6,1.4],[D,4.4,1.1]].forEach(([f,a,z]) => {
  box(f, .8, .9, .5, DARK, f.u(a), .45, z);
  plane(f, .7, .44, screenTex(), f.u(a), 1.0, z + .05, -.55);
});
plant(C, C.u(5.6), .5); plant(D, D.u(5.6), .5);

/* ===== CHẶNG 3 – TRIỂN LÃM & CHECK-IN: giữ nguyên bố cục ===== */
const E = frame(210, 270), F = frame(330, 270);
pic(E,'r3l',R,H,0,H/2,.02); pic(F,'r3r',R,H,0,H/2,.02);
box(E, .9, 1.7, .06, DARK, E.u(2.8), .85, 2.3); plane(E, .8, 1.5, qrTex(), E.u(2.8), .95, 2.34);
bench(E, E.u(5.0), 1.9);
plane(F, 3.0, 1.8, matTex('#a98655'), F.u(4.1), .012, 1.3, -Math.PI / 2);

/* ===== NHÃN CHẶNG ===== */
const rooms = [[150, '1 · Nghe Xẩm'], [30, '2 · Hiểu Xẩm'], [270, '3 · Lưu dấu Xẩm']];
const labels = rooms.map(([rb, t]) => { const e = document.createElement('div'); e.className = 'lb'; e.textContent = 'Chặng ' + t; app.appendChild(e); const v = vec(rb); e.p = new THREE.Vector3(v.x * 3.6, H + .5, v.z * 3.6); return e });

/* ===== ĐIỀU KHIỂN (xoay – zoom – chụm) ===== */
const S = { az: .35, po: 1.0, d: 17, tx: 0, tz: 0 }, G = Object.assign({}, S);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ptr = new Map(); let pd = 0;
ren.domElement.addEventListener('pointerdown', e => { ren.domElement.setPointerCapture(e.pointerId); ptr.set(e.pointerId, e); pd = 0 });
ren.domElement.addEventListener('pointerup', e => ptr.delete(e.pointerId));
ren.domElement.addEventListener('pointercancel', e => ptr.delete(e.pointerId));
ren.domElement.addEventListener('pointermove', e => {
  const o = ptr.get(e.pointerId); if (!o) return;
  if (ptr.size === 1) { G.az -= (e.clientX - o.clientX) * .006; G.po = clamp(G.po - (e.clientY - o.clientY) * .006, .03, 1.5); S.az = G.az; S.po = G.po }
  else if (ptr.size === 2) {
    const o2 = [...ptr.values()].find(p => p.pointerId !== e.pointerId);
    const before = Math.hypot(o.clientX - o2.clientX, o.clientY - o2.clientY), after = Math.hypot(e.clientX - o2.clientX, e.clientY - o2.clientY);
    G.d = clamp(G.d * before / after, 6, 30); S.d = G.d;
  }
  ptr.set(e.pointerId, e);
});
ren.domElement.addEventListener('wheel', e => { e.preventDefault(); G.d = clamp(G.d * (1 + e.deltaY * .001), 6, 30) }, { passive: false });
document.querySelectorAll('#bar button').forEach(b => b.onclick = () => {
  const v = b.dataset.v; let t;
  if (v === 'all') t = { az: .35, po: 1.0, d: 17, tx: 0, tz: 0 };
  else if (v === 'top') t = { az: S.az, po: .03, d: 16, tx: 0, tz: 0 };
  else { const rb = rooms[v - 1][0], r = vec(rb); t = { az: Math.atan2(r.x, r.z), po: 1.05, d: 11, tx: r.x * 1.8, tz: r.z * 1.8 } }
  t.az = S.az + ((t.az - S.az + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  Object.assign(G, t);
});

function resize() { const w = innerWidth, h = innerHeight; ren.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); if (w < h) { S.d = G.d = Math.max(G.d, 22) } }
addEventListener('resize', resize); resize();

(function loop() {
  requestAnimationFrame(loop);
  for (const k in S) S[k] += (G[k] - S[k]) * .1;
  cam.position.set(S.tx + S.d * Math.sin(S.po) * Math.sin(S.az), 1.2 + S.d * Math.cos(S.po), S.tz + S.d * Math.sin(S.po) * Math.cos(S.az));
  cam.lookAt(S.tx, 1.2, S.tz);
  ren.render(scene, cam);
  const w = innerWidth, h = innerHeight;
  labels.forEach(l => { const p = l.p.clone().project(cam); l.style.left = (p.x * .5 + .5) * w + 'px'; l.style.top = (-p.y * .5 + .5) * h + 'px' });
})();
