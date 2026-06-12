import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { buildApartment, DIM } from './apartment.js';
import { CATALOG, CATEGORIES, createFurniture, recolorFurniture } from './furniture.js';

const IS_TOUCH = matchMedia('(pointer: coarse)').matches;
const $ = id => document.getElementById(id);

// ---------- scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd8e8);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(78, innerWidth / innerHeight, 0.05, 200);
camera.rotation.order = 'YXZ';

const sun = new THREE.DirectionalLight(0xfff2dd, 3.2);
sun.position.set(3, 9, 16);
sun.target.position.set(DIM.W / 2, 0, DIM.D / 2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xcfe5f5, 0x8c7b66, 0.5));

const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x7da064, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.set(DIM.W / 2, -6.5, DIM.D / 2);
ground.receiveShadow = true;
scene.add(ground);

// ---------- appartement (herbouwbaar) ----------
let mode = 'edit';
let apt = null, colliders = [], ceiling = null, matRef = null;
let wallMeshes = [];
let wallColor = null;
let kitchenOpt = { front: null, top: null };
function rebuildApartment() {
  if (apt) scene.remove(apt);
  const style = $('slideToggle')?.checked ? 'schuif' : 'draai';
  const r = buildApartment({ document, withFixtures: true, doorStyle: style, kitchen: kitchenOpt });
  apt = r.group; ceiling = r.ceiling; matRef = r.materials;
  colliders.length = 0; colliders.push(...r.colliders);
  if (wallColor) matRef.wall.color.set(wallColor);
  wallMeshes = [];
  apt.traverse(o => { if (o.userData?.wall) wallMeshes.push(o); });
  ceiling.visible = mode === 'walk' || $('ceilToggle').checked;
  scene.add(apt);
}
rebuildApartment();

const furnitureGroup = new THREE.Group();
furnitureGroup.name = 'inrichting';
scene.add(furnitureGroup);

// ---------- besturing ----------
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(DIM.W / 2, 1, DIM.D / 2);
camera.position.set(DIM.W / 2 + 4.5, 8.5, DIM.D / 2 + 7.5);
orbit.update();

const walk = new PointerLockControls(camera, renderer.domElement);
const keys = {};
const EYE = 1.65;
let walkPos = new THREE.Vector3(DIM.W / 2, EYE, 6.5);
let yaw = Math.PI, pitch = 0; // touch-look

function setMode(m) {
  mode = m;
  $('modeBtn').textContent = m === 'edit' ? 'Rondlopen' : 'Inrichten';
  $('sidebar').classList.remove('open');
  $('catBtn').style.display = m === 'edit' ? '' : 'none';
  $('viewsBar').style.display = m === 'edit' ? '' : 'none';
  $('crosshair').style.display = m === 'walk' ? 'block' : 'none';
  ceiling.visible = (m === 'walk') || $('ceilToggle').checked;
  select(null);
  if (m === 'walk') {
    camera.position.copy(walkPos);
    yaw = Math.PI; pitch = 0;
    camera.rotation.set(pitch, yaw, 0);
    orbit.enabled = false;
    if (!IS_TOUCH) walk.lock();
  } else {
    walkPos.copy(camera.position);
    if (!IS_TOUCH) walk.unlock();
    orbit.enabled = true;
    setView('overzicht');
  }
}
walk.addEventListener('unlock', () => { if (mode === 'walk' && !IS_TOUCH) setMode('edit'); });
$('modeBtn').onclick = () => setMode(mode === 'edit' ? 'walk' : 'edit');

// view-presets
const VIEWS = {
  overzicht: [[DIM.W / 2 + 4.5, 8.5, DIM.D / 2 + 7.5], [DIM.W / 2, 1, DIM.D / 2]],
  plattegrond: [[DIM.W / 2, 13, DIM.D / 2 + 0.01], [DIM.W / 2, 0, DIM.D / 2]],
  woonkamer: [[1.0, 1.6, 4.5], [4.2, 1.0, 8.2]],
  slaapkamer: [[2.4, 1.6, 2.6], [5.0, 1.0, 4.2]],
  badkamer: [[3.6, 1.6, 1.95], [2.3, 1.0, 0.3]],
  balkon: [[2.6, 1.8, 10.3], [2.6, 1.0, 7.0]],
};
function setView(name) {
  const [p, t] = VIEWS[name];
  camera.position.set(...p);
  orbit.target.set(...t);
  orbit.update();
  document.querySelectorAll('#viewsBar button').forEach(b => b.classList.toggle('active', b.dataset.v === name));
}
document.querySelectorAll('#viewsBar button').forEach(b => b.onclick = () => setView(b.dataset.v));

addEventListener('keydown', e => {
  if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'edit' ? 'walk' : 'edit'); return; }
  keys[e.code] = true;
  if (mode === 'edit' && selected) {
    if (e.code === 'KeyR') rotateSel(Math.PI / 4);
    if (e.code === 'KeyE') rotateSel(-Math.PI / 4);
    if (e.code === 'BracketRight') nudgeY(0.05);
    if (e.code === 'BracketLeft') nudgeY(-0.05);
    if (e.code === 'Delete' || e.code === 'Backspace') deleteSel();
    if (e.code === 'Escape') select(null);
    // pijltjes: cm-precies verplaatsen (Shift = 10 cm). Wand-item: ↑/↓ = hoogte.
    if (e.code.startsWith('Arrow')) {
      e.preventDefault();
      const step = e.shiftKey ? 0.10 : 0.01;
      const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
      tryTransform(selected, () => {
        if (e.code === 'ArrowLeft') selected.position.addScaledVector(right, -step);
        if (e.code === 'ArrowRight') selected.position.addScaledVector(right, step);
        if (selected.userData.mount === 'wall') {
          if (e.code === 'ArrowUp') selected.position.y += step;
          if (e.code === 'ArrowDown') selected.position.y -= step;
        } else {
          if (e.code === 'ArrowUp') selected.position.addScaledVector(fwd, step);
          if (e.code === 'ArrowDown') selected.position.addScaledVector(fwd, -step);
        }
      });
      saveLayout();
    }
  }
});
addEventListener('keyup', e => keys[e.code] = false);

function collides(p) {
  const r = 0.22;
  const me = new THREE.Box3(new THREE.Vector3(p.x - r, 0.3, p.z - r), new THREE.Vector3(p.x + r, 1.9, p.z + r));
  return colliders.some(b => b.intersectsBox(me));
}
const clock = new THREE.Clock();
const joy = { id: null, x: 0, y: 0, hold: false, moved: false, timer: null };
function updateWalk(dt) {
  const speed = (keys.ShiftLeft ? 4.2 : 2.2) * dt;
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
  const dir = new THREE.Vector3();
  if (keys.KeyW || keys.ArrowUp) dir.add(fwd);
  if (keys.KeyS || keys.ArrowDown) dir.sub(fwd);
  if (keys.KeyD || keys.ArrowRight) dir.add(right);
  if (keys.KeyA || keys.ArrowLeft) dir.sub(right);
  if (IS_TOUCH && joy.hold) dir.add(fwd); // vinger vasthouden = vooruit lopen
  if (dir.lengthSq() < 0.0001) return;
  dir.normalize().multiplyScalar(speed);
  const p = camera.position;
  const tryX = p.clone(); tryX.x += dir.x;
  if (!collides(tryX)) p.x = tryX.x;
  const tryZ = p.clone(); tryZ.z += dir.z;
  if (!collides(tryZ)) p.z = tryZ.z;
  p.y = EYE;
}

// touch: slepen = rondkijken, vasthouden (zonder slepen) = vooruit lopen; slepen tijdens lopen = sturen
renderer.domElement.addEventListener('touchstart', e => {
  if (mode !== 'walk') return;
  const t = e.changedTouches[0];
  if (joy.id != null) return;
  joy.id = t.identifier; joy.x = t.clientX; joy.y = t.clientY; joy.moved = false;
  joy.timer = setTimeout(() => { if (!joy.moved) joy.hold = true; }, 220);
}, { passive: true });
renderer.domElement.addEventListener('touchmove', e => {
  if (mode !== 'walk') return;
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== joy.id) continue;
    const dxm = t.clientX - joy.x, dym = t.clientY - joy.y;
    if (Math.abs(dxm) + Math.abs(dym) > 9) joy.moved = true;
    yaw -= dxm * 0.005;
    pitch = Math.max(-1.4, Math.min(1.4, pitch - dym * 0.005));
    camera.rotation.set(pitch, yaw, 0);
    joy.x = t.clientX; joy.y = t.clientY;
  }
}, { passive: false });
renderer.domElement.addEventListener('touchend', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) {
      clearTimeout(joy.timer);
      joy.id = null; joy.hold = false; joy.moved = false;
    }
  }
});

// ---------- catalogus UI ----------
const catalogEl = $('catalog');
for (const cat of CATEGORIES) {
  const det = document.createElement('details');
  det.open = cat === 'Banken';
  const sum = document.createElement('summary');
  sum.textContent = cat;
  det.appendChild(sum);
  for (const [type, def] of Object.entries(CATALOG).filter(([, d]) => d.cat === cat)) {
    const b = document.createElement('button');
    b.innerHTML = `${def.label}<span class="sw">${def.colors.slice(0, 4).map(c => `<i style="background:#${c[1].toString(16).padStart(6, '0')}"></i>`).join('')}</span>`;
    b.onclick = () => { startGhost(type); if (innerWidth < 700) $('sidebar').classList.remove('open'); };
    det.appendChild(b);
  }
  catalogEl.appendChild(det);
}
$('catBtn').onclick = () => $('sidebar').classList.toggle('open');

// muurverf
const WALLPAINT = [['Wit', '#f4f1ec'], ['Warm wit', '#efe9dd'], ['Greige', '#d8d0c2'], ['Salie', '#b8c4ad'], ['Terracotta', '#c89180'], ['Denim', '#92a7b8'], ['Antraciet', '#5a5e63']];
const wpEl = $('wallpaint');
for (const [n, c] of WALLPAINT) {
  const b = document.createElement('button');
  b.className = 'swatch'; b.style.background = c; b.title = n;
  b.onclick = () => { wallColor = c; matRef.wall.color.set(c); saveLayout(); };
  wpEl.appendChild(b);
}

// keuken: vaste plek, front- en werkbladkleur instelbaar
const KFRONT = [['Wit', 0xf2f0ea], ['Eiken', 0xc8a16b], ['Salie', 0x7d8b74], ['Antraciet', 0x44494f], ['Zwartbruin', 0x3a3028]];
const KBLAD = [['Eiken', 0xd9bb8a], ['Licht steen', 0xe8e6e0], ['Antraciet', 0x3a3c3e]];
function kitchenSwatches(elId, list, key) {
  const el = $(elId);
  for (const [n, c] of list) {
    const b = document.createElement('button');
    b.className = 'swatch'; b.style.background = '#' + c.toString(16).padStart(6, '0'); b.title = n;
    b.onclick = () => { kitchenOpt[key] = c; rebuildApartment(); saveLayout(); };
    el.appendChild(b);
  }
}
kitchenSwatches('kitchenFront', KFRONT, 'front');
kitchenSwatches('kitchenTop', KBLAD, 'top');

let snap = true;
$('snapToggle').onchange = e => snap = e.target.checked;
$('ceilToggle').onchange = e => { if (mode === 'edit') ceiling.visible = e.target.checked; };
$('slideToggle').onchange = () => { rebuildApartment(); saveLayout(); };
ceiling.visible = false;

// ---------- plaatsen / selecteren ----------
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let selected = null, dragging = false, ghost = null;

// meubels mogen niet door muren (wand-items hangen juist óp muren)
const bb = new THREE.Box3();
function wouldCollide(obj) {
  if (obj.userData.mount === 'wall') return false;
  bb.setFromObject(obj);
  bb.min.y += 0.03; // vloerkleed/poten net boven plint laten tellen
  return colliders.some(c => c.intersectsBox(bb));
}
// plaatsen kan alleen binnen de woning of op het balkon
function insideHome(o) {
  const { x, z } = o.position;
  const inApt = x > 0.02 && x < 5.115 && z > 0.02 && z < 8.28;
  const inBalk = x > -0.26 && x < 5.39 && z >= 8.28 && z < 10.48;
  return inApt || inBalk;
}
function tryTransform(obj, fn) {
  const p = obj.position.clone(), r = obj.rotation.y;
  fn();
  obj.position.y = obj.userData.mount === 'wall' ? Math.max(0.15, Math.min(2.4, obj.position.y)) : 0;
  obj.updateMatrixWorld(true);
  if ((obj.userData.mount !== 'wall' && !insideHome(obj)) || wouldCollide(obj)) {
    obj.position.copy(p); obj.rotation.y = r;
    obj.updateMatrixWorld(true);
    return false;
  }
  return true;
}

function setOpacity(g, op) {
  g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = op < 1; o.material.opacity = op; } });
}
function startGhost(type) {
  if (ghost) furnitureGroup.remove(ghost);
  ghost = createFurniture(type);
  setOpacity(ghost, 0.55);
  ghost.userData.ghost = true;
  const def = CATALOG[type];
  ghost.position.set(DIM.W / 2, def.mount === 'wall' ? def.defH : 0, 6.5);
  furnitureGroup.add(ghost);
}
const snapV = v => snap ? Math.round(v / 0.05) * 0.05 : v;

function pointerRay(e) {
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
}
function placeOnPointer(obj, e) {
  pointerRay(e);
  if (obj.userData.mount === 'wall') {
    const hits = ray.intersectObjects(wallMeshes, false);
    if (!hits.length) return;
    const h = hits[0];
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
    n.y = 0; n.normalize();
    obj.position.set(
      snapV(h.point.x) + n.x * 0.015,
      Math.max(0.15, Math.min(2.4, snapV(h.point.y))),
      snapV(h.point.z) + n.z * 0.015
    );
    obj.rotation.y = Math.atan2(n.x, n.z);
  } else {
    const pt = new THREE.Vector3();
    if (!ray.ray.intersectPlane(floorPlane, pt)) return;
    tryTransform(obj, () => obj.position.set(snapV(pt.x), 0, snapV(pt.z)));
  }
}

function select(obj) {
  if (selected) selected.traverse(o => o.material?.emissive?.setHex(0));
  selected = obj;
  if (selected) {
    selected.traverse(o => o.material?.emissive?.setHex(0x224466));
    const def = CATALOG[selected.userData.type];
    $('selName').textContent = def?.label ?? '';
    const sw = $('selColors'); sw.innerHTML = '';
    for (const [n, c] of def?.colors ?? []) {
      const b = document.createElement('button');
      b.className = 'swatch' + (selected.userData.color === c ? ' on' : '');
      b.style.background = '#' + c.toString(16).padStart(6, '0'); b.title = n;
      b.onclick = () => {
        recolorFurniture(selected, c);
        selected.traverse(o => o.material?.emissive?.setHex(0x224466));
        select(selected);
        saveLayout();
      };
      sw.appendChild(b);
    }
    $('btnUp').style.display = $('btnDown').style.display = selected.userData.mount === 'wall' ? '' : 'none';
    $('selPanel').style.display = 'flex';
  } else if ($('selPanel')) {
    $('selPanel').style.display = 'none';
  }
}
function rotateSel(a) { if (selected) { tryTransform(selected, () => selected.rotation.y += a); saveLayout(); } }
function nudgeY(d) {
  if (selected?.userData.mount === 'wall') {
    selected.position.y = Math.max(0.15, Math.min(2.4, selected.position.y + d));
    saveLayout();
  }
}
function deleteSel() { if (selected) { furnitureGroup.remove(selected); select(null); saveLayout(); } }
$('btnRotL').onclick = () => rotateSel(Math.PI / 4);
$('btnRotR').onclick = () => rotateSel(-Math.PI / 4);
$('btnUp').onclick = () => nudgeY(0.1);
$('btnDown').onclick = () => nudgeY(-0.1);
$('btnDel').onclick = deleteSel;

renderer.domElement.addEventListener('pointermove', e => {
  if (mode !== 'edit') return;
  if (ghost) placeOnPointer(ghost, e);
  else if (dragging && selected) { placeOnPointer(selected, e); orbit.enabled = false; }
});
renderer.domElement.addEventListener('pointerdown', e => {
  if (mode !== 'edit' || (e.pointerType === 'mouse' && e.button !== 0)) return;
  if (ghost) {
    placeOnPointer(ghost, e);
    setOpacity(ghost, 1);
    delete ghost.userData.ghost;
    select(ghost);
    ghost = null;
    saveLayout();
    return;
  }
  pointerRay(e);
  const hits = ray.intersectObjects(furnitureGroup.children, true);
  if (hits.length) {
    let g = hits[0].object;
    while (g.parent !== furnitureGroup) g = g.parent;
    select(g);
    dragging = true;
  } else select(null);
});
addEventListener('pointerup', () => { if (dragging) { dragging = false; orbit.enabled = mode === 'edit'; saveLayout(); } });

// ---------- opslaan / laden ----------
function layoutJSON() {
  return JSON.stringify({
    wallColor,
    kitchen: kitchenOpt,
    sliding: $('slideToggle').checked,
    items: furnitureGroup.children.filter(c => !c.userData.ghost).map(c => ({
      type: c.userData.type, color: c.userData.color,
      x: c.position.x, y: c.position.y, z: c.position.z, ry: c.rotation.y,
    })),
  }, null, 1);
}
function saveLayout() { localStorage.setItem('hoef163-layout-v2', layoutJSON()); }
function loadLayout(json) {
  try {
    const data = JSON.parse(json);
    const items = Array.isArray(data) ? data : data.items;
    if (data.wallColor) { wallColor = data.wallColor; matRef.wall.color.set(wallColor); }
    let needRebuild = false;
    if (data.kitchen && (data.kitchen.front || data.kitchen.top)) { kitchenOpt = data.kitchen; needRebuild = true; }
    if (data.sliding != null && data.sliding !== $('slideToggle').checked) {
      $('slideToggle').checked = data.sliding;
      needRebuild = true;
    }
    if (needRebuild) rebuildApartment();
    furnitureGroup.clear();
    for (const it of items ?? []) {
      const f = createFurniture(it.type, it.color);
      if (!f) continue;
      f.position.set(it.x, it.y ?? 0, it.z);
      f.rotation.y = it.ry;
      furnitureGroup.add(f);
    }
  } catch { /* leeg */ }
}
const saved = localStorage.getItem('hoef163-layout-v2');
if (saved) loadLayout(saved);

$('saveBtn').onclick = () => download(new Blob([layoutJSON()], { type: 'application/json' }), 'hoef163-inrichting.json');
$('loadBtn').onclick = () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
  inp.onchange = async () => { loadLayout(await inp.files[0].text()); saveLayout(); };
  inp.click();
};
$('clearBtn').onclick = () => { furnitureGroup.clear(); select(null); saveLayout(); };

// ---------- export ----------
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function exportScene() {
  const root = new THREE.Group();
  root.name = 'HOEF-163';
  root.add(apt.clone(true), furnitureGroup.clone(true));
  return root;
}
$('expGlb').onclick = () => new GLTFExporter().parse(exportScene(), r => download(new Blob([r], { type: 'model/gltf-binary' }), 'HOEF-163.glb'), console.error, { binary: true });
$('expObj').onclick = () => download(new Blob([new OBJExporter().parse(exportScene())], { type: 'text/plain' }), 'HOEF-163.obj');
$('expStl').onclick = () => download(new Blob([new STLExporter().parse(exportScene())], { type: 'text/plain' }), 'HOEF-163.stl');

// debug-camera: ?shot=x,y,z,tx,ty,tz
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  const [x, y, z, tx, ty, tz] = shot.split(',').map(Number);
  camera.position.set(x, y, z);
  orbit.target.set(tx, ty, tz);
  orbit.update();
  ceiling.visible = true;
}

// ---------- lus ----------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'walk' && (walk.isLocked || IS_TOUCH)) updateWalk(dt);
  renderer.render(scene, camera);
});
