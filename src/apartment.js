// Appartement 163 (type 2.1, 2e verdieping, hoek) — HOEF! Ede
// Gereconstrueerd uit verkooptekening VP.14 (1:50). Maten in meters.
// Assenstelsel: X = west→oost, Z = noord→zuid, Y = hoogte. Binnenmaat 5.135 × 8.30, plafond 2.60.
import * as THREE from 'three';

export const DIM = {
  W: 5.135,          // binnenbreedte
  D: 8.30,           // binnendiepte
  H: 2.60,           // vrije hoogte
  extWall: 0.30,
  intWall: 0.07,
  doorW: 0.93,
  doorH: 2.30,
  balconyD: 1.95,
  balconyZ0: 8.60,   // buitenkant zuidgevel
};

export const ROOMS = [
  { name: 'Entree / hal', x0: 0, z0: 0, x1: 2.00, z1: 3.97 },
  { name: 'Badkamer', x0: 2.07, z0: 0, x1: 3.97, z1: 2.20 },
  { name: 'Berging', x0: 4.04, z0: 0, x1: 5.135, z1: 2.20 },
  { name: 'Techniek', x0: 0, z0: 2.27, x1: 0.92, z1: 3.97 },
  { name: 'Slaapkamer', x0: 2.07, z0: 2.27, x1: 5.135, z1: 4.77 },
  { name: 'Woonkamer / keuken', x0: 0, z0: 4.04, x1: 5.135, z1: 8.30 },
];

// ---------- materialen ----------
function plankTexture(doc) {
  const c = doc.createElement('canvas'); c.width = 1024; c.height = 1024;
  const g = c.getContext('2d');
  const tones = ['#c8a16b', '#bd9460', '#d2ab77', '#c39a63', '#cfa670', '#b88f5c'];
  const plankW = 1024 / 6;
  for (let i = 0; i < 6; i++) {
    let y = i % 2 ? -300 : 0;
    while (y < 1024) {
      const len = 300 + ((i * 7919 + y * 31) % 400);
      g.fillStyle = tones[(i + y) % tones.length];
      g.fillRect(i * plankW, y, plankW - 3, len - 3);
      // nerf
      g.strokeStyle = 'rgba(120,80,40,0.25)'; g.lineWidth = 1.2;
      for (let k = 0; k < 7; k++) {
        g.beginPath();
        const gx = i * plankW + 8 + k * (plankW / 8);
        g.moveTo(gx, y + 4);
        g.bezierCurveTo(gx + 9, y + len * 0.3, gx - 9, y + len * 0.6, gx + 4, y + len - 6);
        g.stroke();
      }
      y += len;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(2.4, 2.4); t.anisotropy = 8;
  return t;
}

// Tegelpatch van 0.6×0.6 m. Wandtegel 30×60 halfsteens (techn. omschrijving §13), vloertegel 30×30.
function tileTexture(doc, color, line, style) {
  const c = doc.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, 512, 512);
  // subtiele tint-variatie per tegel
  const shade = (x, y, w, h, i) => {
    g.fillStyle = `rgba(${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},0.025)`;
    g.fillRect(x, y, w, h);
  };
  g.strokeStyle = line; g.lineWidth = 3;
  const L = (x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  if (style === 'wand3060') {
    // 2 rijen van 0.3 hoog; bovenste rij halfsteens verschoven
    shade(0, 256, 512, 256, 0); shade(0, 0, 256, 256, 1); shade(256, 0, 256, 256, 0);
    L(0, 0, 512, 0); L(0, 256, 512, 256); L(0, 512, 512, 512);
    L(0, 0, 0, 512); L(512, 0, 512, 512); L(256, 0, 256, 256);
  } else {
    // 2×2 tegels van 0.3
    shade(0, 0, 256, 256, 0); shade(256, 256, 256, 256, 0); shade(256, 0, 256, 256, 1); shade(0, 256, 256, 256, 1);
    L(256, 0, 256, 512); L(0, 256, 512, 256);
    L(0, 0, 0, 512); L(512, 0, 512, 512); L(0, 0, 512, 0); L(0, 512, 512, 512);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function createMaterials(doc) {
  const tex = !!doc;
  const M = {
    wall: new THREE.MeshStandardMaterial({ color: 0xf4f1ec, roughness: 0.93 }),
    extWall: new THREE.MeshStandardMaterial({ color: 0xb45f3c, roughness: 0.88 }), // baksteen
    ceiling: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.95 }), // spackspuitwerk
    floorWood: new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : 0xc8a16b, roughness: 0.55 }),
    floorTile: new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : 0x33363a, roughness: 0.35 }), // antraciet 30x30
    wallTile: new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : 0xf6f6f4, roughness: 0.25 }),  // mat wit 30x60
    concrete: new THREE.MeshStandardMaterial({ color: 0xb9b6b0, roughness: 0.9 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x2b2d2f, roughness: 0.5, metalness: 0.3 }), // kunststof antraciet
    glass: new THREE.MeshPhysicalMaterial({ color: 0xdfeef2, roughness: 0.05, metalness: 0, transmission: tex ? 0.92 : 0, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
    door: new THREE.MeshStandardMaterial({ color: 0xfbfbf9, roughness: 0.6 }), // boarddeur wit
    steel: new THREE.MeshStandardMaterial({ color: 0x8c9094, roughness: 0.35, metalness: 0.85 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
    counter: new THREE.MeshStandardMaterial({ color: 0x3a3c3e, roughness: 0.45 }),
    cabinet: new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 }),
    appliance: new THREE.MeshStandardMaterial({ color: 0x4a4d50, roughness: 0.4, metalness: 0.6 }),
    mirror: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.05, metalness: 0.9 }),
  };
  if (tex) {
    M.floorWood.map = plankTexture(doc);
    // antraciet zwart 30×30 (vloer), mat wit 30×60 (wand) — patch = 0.6 m, repeat per vlak op ware grootte
    M.floorTile.map = tileTexture(doc, '#33363a', '#222427', 'vloer3030');
    M.wallTile.map = tileTexture(doc, '#f4f4f1', '#d8d8d2', 'wand3060');
  }
  return M;
}

// ---------- hulpfuncties ----------
function box(parent, mat, w, h, d, x, y, z, name) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  if (name) m.name = name;
  parent.add(m);
  return m;
}

// Muur langs X of Z met openingen [{from,to,bottom,top}] (coördinaten langs de muuras).
function wall(parent, mat, axis, a0, a1, at, th, h, openings = [], colliders) {
  const ops = [...openings].sort((p, q) => p.from - q.from);
  const segs = [];
  let cur = a0;
  for (const o of ops) {
    if (o.from > cur) segs.push({ a: cur, b: o.from, y0: 0, y1: h });
    if (o.top < h) segs.push({ a: o.from, b: o.to, y0: o.top, y1: h });       // latei
    if (o.bottom > 0) segs.push({ a: o.from, b: o.to, y0: 0, y1: o.bottom }); // borstwering
    cur = o.to;
  }
  if (cur < a1) segs.push({ a: cur, b: a1, y0: 0, y1: h });
  for (const s of segs) {
    const len = s.b - s.a, hh = s.y1 - s.y0, mid = (s.a + s.b) / 2, ym = (s.y0 + s.y1) / 2;
    if (len <= 0.001 || hh <= 0.001) continue;
    const m = axis === 'x'
      ? box(parent, mat, len, hh, th, mid, ym, at + th / 2)
      : box(parent, mat, th, hh, len, at + th / 2, ym, mid);
    m.userData.wall = true; // doelvlak voor wand-items (ophangen)
    if (colliders && s.y0 < 1.2) {
      const b = new THREE.Box3().setFromObject(m);
      colliders.push(b);
    }
  }
}

function windowUnit(parent, M, axis, a0, a1, at, th, bottom, top, mullions = 1, colliders = null) {
  const f = 0.06, len = a1 - a0;
  const mk = (la, lb, y0, y1, wOrD) => {
    if (axis === 'x') box(parent, M.frame, lb - la, y1 - y0, th + 0.02, (la + lb) / 2, (y0 + y1) / 2, at + th / 2);
    else box(parent, M.frame, th + 0.02, y1 - y0, lb - la, at + th / 2, (y0 + y1) / 2, (la + lb) / 2);
  };
  mk(a0, a0 + f, bottom, top); mk(a1 - f, a1, bottom, top);
  mk(a0, a1, bottom, bottom + f); mk(a0, a1, top - f, top);
  for (let i = 1; i < mullions; i++) {
    const p = a0 + (len * i) / mullions;
    mk(p - f / 2, p + f / 2, bottom, top);
  }
  const g = axis === 'x'
    ? box(parent, M.glass, len - 2 * f, top - bottom - 2 * f, 0.02, (a0 + a1) / 2, (bottom + top) / 2, at + th / 2)
    : box(parent, M.glass, 0.02, top - bottom - 2 * f, len - 2 * f, at + th / 2, (bottom + top) / 2, (a0 + a1) / 2);
  g.castShadow = false;
  if (colliders) {
    colliders.push(axis === 'x'
      ? new THREE.Box3(new THREE.Vector3(a0, bottom, at), new THREE.Vector3(a1, top, at + th))
      : new THREE.Box3(new THREE.Vector3(at, bottom, a0), new THREE.Vector3(at + th, top, a1)));
  }
}

function innerDoor(parent, M, axis, a0, at, open = 0, style = 'draai', slideDir = 1) {
  const { doorW, doorH } = DIM;
  // kozijn
  const f = 0.05, th = DIM.intWall + 0.03;
  const mk = (la, lb, y0, y1) => {
    if (axis === 'x') box(parent, M.frame, lb - la, y1 - y0, th, (la + lb) / 2, (y0 + y1) / 2, at);
    else box(parent, M.frame, th, y1 - y0, lb - la, at, (y0 + y1) / 2, (la + lb) / 2);
  };
  mk(a0 - f, a0, 0, doorH + f); mk(a0 + doorW, a0 + doorW + f, 0, doorH + f); mk(a0 - f, a0 + doorW + f, doorH, doorH + f);

  if (style === 'schuif') {
    // rail boven de opening + opengeschoven blad naast de opening
    const railA = slideDir > 0 ? a0 - f : a0 - doorW, railB = slideDir > 0 ? a0 + 2 * doorW : a0 + doorW + f;
    const off = th / 2 + 0.035;
    const slid = slideDir > 0 ? a0 + doorW + 0.02 : a0 - doorW - 0.02;
    if (axis === 'x') {
      box(parent, M.steel, railB - railA, 0.05, 0.05, (railA + railB) / 2, doorH + 0.10, at + off);
      const leaf = box(parent, M.door, doorW, doorH + 0.05, 0.035, slid + doorW / 2, (doorH + 0.05) / 2, at + off);
      box(parent, M.steel, 0.025, 0.30, 0.05, slid + (slideDir > 0 ? 0.08 : doorW - 0.08), 1.05, at + off + 0.03);
      return leaf;
    } else {
      box(parent, M.steel, 0.05, 0.05, railB - railA, at + off, doorH + 0.10, (railA + railB) / 2);
      const leaf = box(parent, M.door, 0.035, doorH + 0.05, doorW, at + off, (doorH + 0.05) / 2, slid + doorW / 2);
      box(parent, M.steel, 0.05, 0.30, 0.025, at + off + 0.03, 1.05, slid + (slideDir > 0 ? 0.08 : doorW - 0.08));
      return leaf;
    }
  }

  // draaideur, scharnier bij a0
  const pivot = new THREE.Group();
  if (axis === 'x') pivot.position.set(a0, 0, at); else pivot.position.set(at, 0, a0);
  parent.add(pivot);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(axis === 'x' ? doorW : 0.04, doorH, axis === 'x' ? 0.04 : doorW), M.door);
  leaf.position.set(axis === 'x' ? doorW / 2 : 0, doorH / 2, axis === 'x' ? 0 : doorW / 2);
  leaf.castShadow = leaf.receiveShadow = true;
  pivot.add(leaf);
  // klink
  const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12), M.steel);
  kn.rotation.z = Math.PI / 2;
  kn.position.set(axis === 'x' ? doorW - 0.08 : 0.05, 1.05, axis === 'x' ? 0.05 : doorW - 0.08);
  pivot.add(kn);
  pivot.rotation.y = open;
  return pivot;
}

// ---------- vaste inrichting ----------
function buildBathroom(g, M) {
  // douchehoek NW van badkamer (90x90) met glaswand
  box(g, M.glass, 0.02, 2.0, 0.95, 3.02, 1.0, 0.50).castShadow = false;
  box(g, M.steel, 0.03, 0.03, 0.95, 3.02, 2.0, 0.50);
  const drain = box(g, M.steel, 0.7, 0.012, 0.08, 2.55, 0.008, 0.12);
  drain.receiveShadow = true;
  // regendouche
  box(g, M.steel, 0.025, 1.1, 0.025, 2.55, 1.75, 0.10);
  box(g, M.steel, 0.30, 0.012, 0.30, 2.55, 2.28, 0.28);
  // wastafelmeubel + spiegel (zuidwand badkamer)
  box(g, M.cabinet, 0.90, 0.45, 0.46, 3.45, 0.70, 1.94);
  box(g, M.white, 0.90, 0.10, 0.48, 3.45, 0.97, 1.93);
  box(g, M.steel, 0.04, 0.25, 0.04, 3.45, 1.12, 1.80);
  box(g, M.mirror, 0.80, 0.70, 0.02, 3.45, 1.65, 2.18);
  // wandcloset oostzijde
  box(g, M.white, 0.38, 0.40, 0.53, 3.72, 0.42, 0.45);
  box(g, M.white, 0.40, 0.12, 0.40, 3.72, 0.55, 0.42);
}

function buildKitchen(g, M) {
  // keukenblok langs westwand woonkamer, z 4.25–7.35
  const z0 = 4.25, z1 = 7.35, d = 0.62;
  box(g, M.cabinet, d, 0.85, z1 - z0, d / 2, 0.425, (z0 + z1) / 2);
  box(g, M.counter, d + 0.03, 0.04, z1 - z0 + 0.03, d / 2, 0.89, (z0 + z1) / 2);
  // spoelbak + kraan
  box(g, M.steel, 0.40, 0.015, 0.45, 0.31, 0.905, 5.05);
  const kr = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), M.steel);
  kr.position.set(0.12, 1.07, 5.05); g.add(kr);
  // kookplaat
  box(g, M.appliance, 0.50, 0.012, 0.58, 0.31, 0.90, 6.30);
  // bovenkasten
  box(g, M.cabinet, 0.35, 0.70, z1 - z0, 0.175, 1.95, (z0 + z1) / 2);
  // hoge kast + koelkast + boiler-kolom aan zuidkant strook
  box(g, M.cabinet, 0.62, 2.20, 0.85, 0.31, 1.10, 7.80);
  box(g, M.appliance, 0.56, 0.95, 0.02, 0.31, 1.40, 7.385);
}

function buildTech(g, M) {
  box(g, M.appliance, 0.60, 1.80, 0.65, 0.32, 0.90, 2.62, 'warmtepomp');
  box(g, M.white, 0.60, 0.85, 0.60, 0.32, 0.425, 3.55, 'wasmachine');
  box(g, M.white, 0.60, 0.85, 0.60, 0.32, 1.28, 3.55, 'droger');
  box(g, M.appliance, 0.30, 0.10, 0.30, 0.32, 0.05, 3.55);
}

function buildMeterkast(g, M) {
  box(g, M.cabinet, 0.55, 2.30, 0.40, 1.72, 1.15, 0.21, 'meterkast');
}

// ---------- hoofdopbouw ----------
export function buildApartment({ document: doc = null, withFixtures = true, doorStyle = 'draai' } = {}) {
  const { W, D, H, extWall: E, intWall: I, doorH, balconyD, balconyZ0 } = DIM;
  const M = createMaterials(doc);
  const g = new THREE.Group();
  g.name = 'HOEF-Ede-Appartement-163';
  const colliders = [];

  // vloeren
  const woodAreas = [
    [0, 0, 2.00, 3.97], [0, 2.27, 0.92, 3.97],            // hal + techniek (PVC, zelfde kleur ok→) — techniek apart
    [2.07, 2.27, 5.135, 4.77],                            // slaapkamer
    [0, 3.97, 5.135, 8.30],                               // woonkamer
  ];
  // hal/slaapkamer/woonkamer hout (iets boven de betonplaat → geen z-fighting)
  for (const [x0, z0, x1, z1] of woodAreas) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.floorWood);
    f.rotation.x = -Math.PI / 2;
    f.position.set((x0 + x1) / 2, 0.012, (z0 + z1) / 2);
    f.receiveShadow = true; f.name = 'vloer';
    g.add(f);
  }
  // tegelmateriaal op ware grootte per vlak (patch = 0.6 m)
  const tiledMat = (base, w, h) => {
    if (!base.map) return base;
    const m = base.clone();
    m.map = base.map.clone();
    m.map.repeat.set(w / 0.6, h / 0.6);
    m.map.needsUpdate = true;
    return m;
  };
  // badkamer + berging tegelvloer
  for (const [x0, z0, x1, z1] of [[2.07, 0, 3.97, 2.20], [4.04, 0, 5.135, 2.20]]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), tiledMat(M.floorTile, x1 - x0, z1 - z0));
    f.rotation.x = -Math.PI / 2;
    f.position.set((x0 + x1) / 2, 0.013, (z0 + z1) / 2);
    f.receiveShadow = true; f.name = 'vloer-tegels';
    g.add(f);
  }
  // dragende betonvloer eronder
  box(g, M.concrete, W + 2 * E, 0.25, D + 2 * E, W / 2, -0.125, D / 2).name = 'vloerplaat';

  // plafond (apart zichtbaar/verbergbaar)
  const ceil = new THREE.Group(); ceil.name = 'plafond';
  const cp = new THREE.Mesh(new THREE.PlaneGeometry(W + 2 * E, D + 2 * E), M.ceiling);
  cp.rotation.x = Math.PI / 2; cp.position.set(W / 2, H, D / 2); cp.receiveShadow = true;
  ceil.add(cp);
  box(ceil, M.concrete, W + 2 * E, 0.25, D + 2 * E, W / 2, H + 0.14, D / 2);
  g.add(ceil);

  // --- buitenmuren ---
  // noord (gang/galerij): voordeur x 0.53–1.46
  wall(g, M.wall, 'x', -E, W + E, -E, E, H, [{ from: 0.53, to: 1.46, bottom: 0, top: doorH }], colliders);
  innerDoor(g, M, 'x', 0.53, 0, 0).children[0].material = M.frame; // voordeur antraciet
  // west (woningscheidend)
  wall(g, M.wall, 'z', -E, D + E, -E, E, H, [], colliders);
  // oost (kopgevel, ramen): berging, slaapkamer, woonkamer
  wall(g, M.extWall, 'z', -E, D + E, W, E, H, [
    { from: 0.45, to: 1.45, bottom: 1.05, top: 2.35 },
    { from: 2.60, to: 4.40, bottom: 0.45, top: 2.35 },
    { from: 5.10, to: 8.10, bottom: 0.30, top: 2.35 },
  ], colliders);
  windowUnit(g, M, 'z', 0.45, 1.45, W, E, 1.05, 2.35, 1, colliders);
  windowUnit(g, M, 'z', 2.60, 4.40, W, E, 0.45, 2.35, 2, colliders);
  windowUnit(g, M, 'z', 5.10, 8.10, W, E, 0.30, 2.35, 3, colliders);
  // zuid (balkonpui): glas x 0.40–4.90, alleen deuropening x 2.72–3.62 doorloopbaar
  wall(g, M.extWall, 'x', -E, W + E, D, E, H, [{ from: 0.40, to: 4.90, bottom: 0, top: 2.35 }], colliders);
  windowUnit(g, M, 'x', 0.40, 2.70, D, E, 0, 2.35, 2, colliders);
  windowUnit(g, M, 'x', 3.64, 4.90, D, E, 0, 2.35, 1, colliders);
  // balkondeur: kozijn zonder glasvulling, blad staat open naar het balkon
  const bf = 0.06;
  box(g, M.frame, 0.02 + bf, 2.35, E + 0.02, 2.71, 1.175, D + E / 2);
  box(g, M.frame, 0.02 + bf, 2.35, E + 0.02, 3.63, 1.175, D + E / 2);
  box(g, M.frame, 3.62 - 2.72, bf, E + 0.02, 3.17, 2.35 - bf / 2, D + E / 2);
  const bdPivot = new THREE.Group();
  bdPivot.position.set(2.72, 0, D + E - 0.02);
  g.add(bdPivot);
  const bdW = 0.90;
  const bdLeaf = new THREE.Group();
  bdPivot.add(bdLeaf);
  box(bdLeaf, M.frame, bdW, 2.35, 0.05, bdW / 2, 1.175, 0);
  const bdGlass = box(bdLeaf, M.glass, bdW - 0.12, 2.35 - 0.24, 0.02, bdW / 2, 1.175, 0);
  bdGlass.castShadow = false;
  bdPivot.rotation.y = -1.25; // open naar balkon

  // --- binnenwanden ---
  // badkamer westwand + deur (vanuit hal)
  wall(g, M.wall, 'z', 0, 2.20, 2.00, I, H, [{ from: 1.17, to: 2.10, bottom: 0, top: doorH }], colliders);
  innerDoor(g, M, 'z', 1.17, 2.035, -1.45, doorStyle, -1);
  // badkamer/berging scheiding
  wall(g, M.wall, 'z', 0, 2.20, 3.97, I, H, [], colliders);
  // zuidwand badkamer+berging, met bergingdeur (vanuit slaapkamer)
  wall(g, M.wall, 'x', 2.07, 5.135, 2.20, I, H, [{ from: 4.10, to: 5.03, bottom: 0, top: doorH }], colliders);
  innerDoor(g, M, 'x', 4.10, 2.235, 1.45, doorStyle, -1);
  // slaapkamer westwand
  wall(g, M.wall, 'z', 2.27, 4.84, 2.00, I, H, [], colliders);
  // slaapkamer zuidwand + deur oostzijde (vanuit woonkamer)
  wall(g, M.wall, 'x', 2.07, 5.135, 4.77, I, H, [{ from: 4.05, to: 4.98, bottom: 0, top: doorH }], colliders);
  innerDoor(g, M, 'x', 4.05, 4.805, -1.45, doorStyle, -1);
  // techniek: oostwand + deur, noordwand
  wall(g, M.wall, 'z', 2.27, 3.97, 0.92, I, H, [{ from: 2.90, to: 3.83, bottom: 0, top: doorH }], colliders);
  innerDoor(g, M, 'z', 2.90, 0.955, -0.9, doorStyle, -1);
  wall(g, M.wall, 'x', 0, 0.92, 2.20, I, H, [], colliders);
  wall(g, M.wall, 'x', 0, 0.92, 3.97, I, H, [], colliders); // techniek zuidwand
  // hal zuidwand + deur naar woonkamer
  wall(g, M.wall, 'x', 0.92, 2.07, 3.97, I, H, [{ from: 0.99, to: 1.92, bottom: 0, top: doorH }].filter(o => o.from >= 0.92), colliders);
  innerDoor(g, M, 'x', 0.99, 4.005, -1.45, doorStyle, -1);

  // badkamer wandtegels mat wit 30×60 tot plafond (techn. omschrijving)
  const bt = (w, h, x, y, z, ry = 0) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tiledMat(M.wallTile, w, h));
    p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; g.add(p);
  };
  bt(1.90, H, 3.02, H / 2, 0.012, 0);                 // noord
  bt(1.90, H, 3.02, H / 2, 2.188, Math.PI);           // zuid
  bt(2.20, H, 2.082, H / 2, 1.10, Math.PI / 2);       // west
  bt(2.20, H, 3.958, H / 2, 1.10, -Math.PI / 2);      // oost
  // hardstenen (kunststeen) dorpel antraciet bij badkamerdeur
  box(g, M.counter, 0.11, 0.025, 0.93, 2.035, 0.0125, 1.635, 'dorpel');

  // --- balkon (zuid) ---
  const bal = new THREE.Group(); bal.name = 'balkon';
  box(bal, M.concrete, W + 2 * E, 0.22, balconyD, W / 2, -0.13, balconyZ0 + balconyD / 2, 'balkonplaat');
  // hekwerk: glas + stalen leuning, zuid + oost; west privacyscherm
  const railH = 1.10, zR = balconyZ0 + balconyD;
  const rail = (axis, a0, a1, at) => {
    const len = a1 - a0;
    const glass = axis === 'x'
      ? box(bal, M.glass, len, railH - 0.12, 0.015, (a0 + a1) / 2, (railH - 0.12) / 2 + 0.04, at)
      : box(bal, M.glass, 0.015, railH - 0.12, len, at, (railH - 0.12) / 2 + 0.04, (a0 + a1) / 2);
    glass.castShadow = false;
    if (axis === 'x') box(bal, M.steel, len, 0.05, 0.06, (a0 + a1) / 2, railH, at);
    else box(bal, M.steel, 0.06, 0.05, len, at, railH, (a0 + a1) / 2);
    const n = Math.max(2, Math.round(len / 1.2) + 1);
    for (let i = 0; i < n; i++) {
      const p = a0 + (len * i) / (n - 1);
      if (axis === 'x') box(bal, M.steel, 0.04, railH, 0.04, p, railH / 2, at);
      else box(bal, M.steel, 0.04, railH, 0.04, at, railH / 2, p);
    }
  };
  rail('x', -E, W + E, zR - 0.03);
  rail('z', balconyZ0, zR, W + E - 0.03);
  box(bal, M.wall, 0.08, 2.20, balconyD, -E + 0.04, 1.10, balconyZ0 + balconyD / 2, 'privacyscherm');
  g.add(bal);

  // balkon-colliders (randen)
  colliders.push(new THREE.Box3(new THREE.Vector3(-E, 0, zR - 0.05), new THREE.Vector3(W + E, 2, zR + 0.2)));
  colliders.push(new THREE.Box3(new THREE.Vector3(W + E - 0.06, 0, balconyZ0), new THREE.Vector3(W + E + 0.2, 2, zR)));
  colliders.push(new THREE.Box3(new THREE.Vector3(-E - 0.2, 0, balconyZ0), new THREE.Vector3(-E + 0.1, 2, zR)));

  if (withFixtures) {
    buildBathroom(g, M);
    buildKitchen(g, M);
    buildTech(g, M);
    buildMeterkast(g, M);
  }

  return { group: g, colliders, materials: M, ceiling: ceil };
}
