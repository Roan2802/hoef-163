// Meubelcatalogus — IKEA-geïnspireerde items met kleur-/materiaalvarianten.
// Origin: vloer-items = midden op vloer; wand-items (mount:'wall') = achterkant tegen wand op z=0, front naar +z.
import * as THREE from 'three';

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts });

function box(parent, m, w, h, d, x, y, z, tint = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  if (tint) mesh.userData.tint = true;
  parent.add(mesh);
  return mesh;
}
function cyl(parent, m, r0, r1, h, x, y, z, seg = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function legs4(g, w, d, h, t, c = 0x2f2f2f) {
  const m = mat(c);
  for (const [px, pz] of [[-w / 2 + t, -d / 2 + t], [w / 2 - t, -d / 2 + t], [-w / 2 + t, d / 2 - t], [w / 2 - t, d / 2 - t]])
    box(g, m, t, h, t, px, h / 2, pz);
}

// kleurpaletten
const STOF = [['Grijs', 0x6f7d8c], ['Antraciet', 0x44494f], ['Beige', 0xcfc4ae], ['Blauw', 0x3f5871], ['Groen', 0x55695a], ['Terracotta', 0xa9745a]];
const HOUTWIT = [['Wit', 0xf2f0ea], ['Eiken', 0xc8a16b], ['Zwartbruin', 0x3a3028], ['Berken', 0xe0cba8]];
const METAAL = [['Zwart', 0x2b2b2b], ['Wit', 0xf2f0ea], ['Messing', 0xb89a5a]];
const KLEED = [['Beige', 0xb9a88f], ['Grijs', 0x8a8d90], ['Donkerblauw', 0x3a4a63], ['Terracotta', 0xb07050], ['Groen', 0x5f7561]];
const KUNST = [['Terracotta', 0xb96a4b], ['Blauw', 0x39597a], ['Groen', 0x4f6b52], ['Okergeel', 0xc9982f], ['Zwart-wit', 0x2e2e2e]];

function sofaBase(g, C, w, d, arms = true) {
  const f = mat(C, { roughness: 0.95 });
  box(g, f, w, 0.4, d, 0, 0.2, 0, true);
  box(g, f, w, 0.45, 0.24, 0, 0.6, -d / 2 + 0.13, true);
  if (arms) { box(g, f, 0.2, 0.32, d, -w / 2 + 0.1, 0.54, 0, true); box(g, f, 0.2, 0.32, d, w / 2 - 0.1, 0.54, 0, true); }
  const n = Math.max(2, Math.round(w / 0.62));
  for (let i = 0; i < n; i++) {
    const cw = (w - (arms ? 0.44 : 0.04)) / n;
    box(g, mat(C, { roughness: 0.95 }), cw - 0.04, 0.13, d - 0.3, -((w - (arms ? 0.44 : 0.04)) / 2) + cw * (i + 0.5), 0.465, 0.06, true);
  }
  legs4(g, w - 0.06, d - 0.06, 0.1, 0.05);
}

function kastBase(g, C, w, h, d, doors) {
  box(g, mat(C), w, h, d, 0, h / 2, 0, true);
  const dm = mat(C, { roughness: 0.65 });
  for (let i = 0; i < doors; i++)
    box(g, dm, w / doors - 0.02, h - 0.04, 0.018, -w / 2 + (w / doors) * (i + 0.5), h / 2, d / 2 + 0.012, true);
  const knob = mat(0x9a9a9a, { metalness: 0.7, roughness: 0.3 });
  for (let i = 0; i < doors; i++)
    box(g, knob, 0.018, 0.1, 0.025, -w / 2 + (w / doors) * (i + 0.5) + (i % 2 ? -1 : 1) * (w / doors / 2 - 0.05), h / 2, d / 2 + 0.03);
}

function ladekast(g, C, w, h, d, rows) {
  box(g, mat(C), w, h, d, 0, h / 2, 0, true);
  for (let i = 0; i < rows; i++) {
    box(g, mat(C, { roughness: 0.6 }), w - 0.06, h / rows - 0.035, 0.015, 0, (h / rows) * (i + 0.5), d / 2 + 0.01, true);
    box(g, mat(0x8a8a8a, { metalness: 0.7 }), 0.18, 0.02, 0.02, 0, (h / rows) * (i + 0.5), d / 2 + 0.025);
  }
}

function openvak(g, C, w, h, d, cols, rows) {
  const m = mat(C);
  box(g, m, w, 0.03, d, 0, h - 0.015, 0, true); box(g, m, w, 0.03, d, 0, 0.015, 0, true);
  for (let i = 0; i <= cols; i++) box(g, m, 0.03, h, d, -w / 2 + (w / cols) * i, h / 2, 0, true);
  for (let j = 1; j < rows; j++) box(g, m, w - 0.03, 0.03, d, 0, (h / rows) * j, 0, true);
}

function tafel(g, C, w, d, h, rond = false) {
  if (rond) {
    cyl(g, mat(C, { roughness: 0.55 }), w / 2, w / 2, 0.035, 0, h, 0, 28).userData.tint = true;
    cyl(g, mat(0x2f2f2f), 0.04, 0.06, h, 0, h / 2, 0);
  } else {
    box(g, mat(C, { roughness: 0.55 }), w, 0.035, d, 0, h, 0, true);
    legs4(g, w, d, h, 0.045, 0x6b5236);
  }
}

function stoel(g, C, frameC = 0x6b5236) {
  box(g, mat(C, { roughness: 0.7 }), 0.42, 0.04, 0.42, 0, 0.45, 0, true);
  box(g, mat(C, { roughness: 0.7 }), 0.42, 0.42, 0.035, 0, 0.69, -0.19, true);
  legs4(g, 0.4, 0.4, 0.45, 0.035, frameC);
}

function bed(g, C, w) {
  box(g, mat(C), w + 0.1, 0.3, 2.1, 0, 0.2, 0, true);
  box(g, mat(0xf2efe8, { roughness: 0.97 }), w - 0.02, 0.2, 1.98, 0, 0.45, 0);
  box(g, mat(0xe6e1d5, { roughness: 0.98 }), w - 0.06, 0.1, 1.2, 0, 0.55, 0.3);
  box(g, mat(0xffffff, { roughness: 0.98 }), Math.max(w / 2 - 0.1, 0.5), 0.1, 0.45, w > 1 ? -w / 4 : 0, 0.58, -0.65);
  if (w > 1) box(g, mat(0xffffff, { roughness: 0.98 }), w / 2 - 0.1, 0.1, 0.45, w / 4, 0.58, -0.65);
  box(g, mat(C), w + 0.1, 0.75, 0.06, 0, 0.55, -1.07, true);
}

function lampVoet(g, C, h) {
  cyl(g, mat(C), 0.14, 0.16, 0.02, 0, 0.01, 0).userData.tint = true;
  if (h > 0.05) cyl(g, mat(C), 0.012, 0.012, h, 0, h / 2, 0).userData.tint = true;
}

function schilderij(g, C, w, h) {
  box(g, mat(0x2b2b2b), w, h, 0.03, 0, 0, 0.015);
  box(g, mat(C, { roughness: 0.9 }), w - 0.06, h - 0.06, 0.012, 0, 0, 0.032, true);
  box(g, mat(0xe8e2d4, { roughness: 0.9 }), (w - 0.06) * 0.45, (h - 0.06) * 0.3, 0.013, w * 0.12, h * 0.18, 0.034);
  box(g, mat(0x1f1f1f, { roughness: 0.9 }), (w - 0.06) * 0.25, (h - 0.06) * 0.5, 0.013, -w * 0.18, -h * 0.1, 0.034);
}

export const CATALOG = {
  // ---------- banken & fauteuils ----------
  kivik3: { label: 'KIVIK 3-zits', cat: 'Banken', colors: STOF, build: (g, C) => sofaBase(g, C, 2.28, 0.95) },
  klippan2: { label: 'KLIPPAN 2-zits', cat: 'Banken', colors: STOF, build: (g, C) => sofaBase(g, C, 1.8, 0.88) },
  soderhamn: {
    label: 'SÖDERHAMN hoekbank', cat: 'Banken', colors: STOF, build: (g, C) => {
      sofaBase(g, C, 2.4, 0.99, false);
      const f = mat(C, { roughness: 0.95 });
      box(g, f, 0.99, 0.4, 1.5, 0.705, 0.2, 1.24, true);
      box(g, f, 0.24, 0.45, 1.5, 1.08, 0.6, 1.24, true);
      box(g, f, 0.85, 0.13, 1.4, 0.62, 0.465, 1.22, true);
    }
  },
  poang: {
    label: 'POÄNG fauteuil', cat: 'Banken', colors: STOF, build: (g, C) => {
      const fr = mat(0xc8a16b);
      box(g, fr, 0.06, 0.4, 0.7, -0.3, 0.25, 0); box(g, fr, 0.06, 0.4, 0.7, 0.3, 0.25, 0);
      box(g, fr, 0.66, 0.04, 0.06, 0, 0.42, -0.3);
      const k = mat(C, { roughness: 0.95 });
      box(g, k, 0.56, 0.1, 0.62, 0, 0.42, 0.04, true);
      box(g, k, 0.56, 0.62, 0.1, 0, 0.78, -0.3, true);
    }
  },
  strandmon: {
    label: 'STRANDMON oorfauteuil', cat: 'Banken', colors: STOF, build: (g, C) => {
      const f = mat(C, { roughness: 0.92 });
      box(g, f, 0.72, 0.38, 0.7, 0, 0.3, 0, true);
      box(g, f, 0.72, 0.75, 0.18, 0, 0.78, -0.28, true);
      box(g, f, 0.16, 0.5, 0.6, -0.3, 0.55, 0, true); box(g, f, 0.16, 0.5, 0.6, 0.3, 0.55, 0, true);
      box(g, f, 0.2, 0.25, 0.18, -0.26, 1.08, -0.28, true); box(g, f, 0.2, 0.25, 0.18, 0.26, 1.08, -0.28, true);
      legs4(g, 0.6, 0.6, 0.12, 0.04, 0x6b5236);
    }
  },
  // ---------- stoelen ----------
  teodores: { label: 'TEODORES stoel', cat: 'Stoelen', colors: [['Wit', 0xf2f0ea], ['Groen', 0x55695a], ['Geel', 0xc9982f], ['Zwart', 0x2b2b2b]], build: (g, C) => stoel(g, C, 0x2b2b2b) },
  ingolf: { label: 'INGOLF stoel', cat: 'Stoelen', colors: HOUTWIT, build: (g, C) => stoel(g, C, 0x8a7048) },
  odger: {
    label: 'ODGER kuipstoel', cat: 'Stoelen', colors: [['Antraciet', 0x44494f], ['Blauw', 0x3f5871], ['Beige', 0xcfc4ae]], build: (g, C) => {
      const k = mat(C, { roughness: 0.7 });
      cyl(g, k, 0.23, 0.2, 0.06, 0, 0.45, 0, 22).userData.tint = true;
      const rug = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.35, 22, 1, true, Math.PI * 0.75, Math.PI), k);
      rug.position.set(0, 0.62, 0); rug.castShadow = true; rug.userData.tint = true; g.add(rug);
      legs4(g, 0.36, 0.36, 0.44, 0.03, 0x6b5236);
    }
  },
  nilsolle: {
    label: 'NILSOLLE barkruk', cat: 'Stoelen', colors: HOUTWIT, build: (g, C) => {
      cyl(g, mat(C), 0.17, 0.17, 0.035, 0, 0.74, 0).userData.tint = true;
      legs4(g, 0.32, 0.32, 0.73, 0.03, 0x8a7048);
    }
  },
  markus: {
    label: 'MARKUS bureaustoel', cat: 'Stoelen', colors: [['Zwart', 0x2b2b2b], ['Grijs', 0x6f7d8c]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.8 }), 0.48, 0.08, 0.46, 0, 0.48, 0, true);
      box(g, mat(C, { roughness: 0.8 }), 0.46, 0.62, 0.08, 0, 0.85, -0.21, true);
      cyl(g, mat(0x2f2f2f), 0.03, 0.03, 0.36, 0, 0.28, 0);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const poot = box(g, mat(0x2f2f2f), 0.3, 0.025, 0.04, Math.sin(a) * 0.15, 0.05, Math.cos(a) * 0.15);
        poot.rotation.y = a;
      }
    }
  },
  // ---------- tafels ----------
  lack: { label: 'LACK salontafel', cat: 'Tafels', colors: HOUTWIT, build: (g, C) => { box(g, mat(C, { roughness: 0.5 }), 0.9, 0.045, 0.55, 0, 0.42, 0, true); legs4(g, 0.86, 0.51, 0.42, 0.05, 0x2f2f2f); } },
  lisabo: { label: 'LISABO eettafel 140', cat: 'Tafels', colors: [['Essen', 0xd9bb8a], ['Zwart', 0x2b2b2b]], build: (g, C) => tafel(g, C, 1.4, 0.78, 0.74) },
  melltorp: { label: 'MELLTORP tafel 75', cat: 'Tafels', colors: [['Wit', 0xf2f0ea]], build: (g, C) => tafel(g, C, 0.75, 0.75, 0.74) },
  norden: { label: 'Ronde eettafel ⌀110', cat: 'Tafels', colors: HOUTWIT, build: (g, C) => tafel(g, C, 1.1, 1.1, 0.74, true) },
  micke: {
    label: 'MICKE bureau', cat: 'Tafels', colors: [['Wit', 0xf2f0ea], ['Zwartbruin', 0x3a3028]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.55 }), 1.05, 0.035, 0.5, 0, 0.74, 0, true);
      box(g, mat(C), 0.3, 0.5, 0.46, 0.36, 0.49, 0, true);
      legs4(g, 1.0, 0.46, 0.73, 0.035, 0x9a9a9a);
      box(g, mat(0x1a1a1a, { roughness: 0.3 }), 0.6, 0.36, 0.025, -0.1, 1.0, -0.15);
    }
  },
  // ---------- bedden ----------
  malm160: { label: 'MALM bed 160×200', cat: 'Bedden', colors: HOUTWIT, build: (g, C) => bed(g, C, 1.6) },
  malm140: { label: 'MALM bed 140×200', cat: 'Bedden', colors: HOUTWIT, build: (g, C) => bed(g, C, 1.4) },
  bed90: { label: 'Bed 90×200', cat: 'Bedden', colors: STOF, build: (g, C) => bed(g, C, 0.9) },
  malmNacht: { label: 'MALM nachtkastje', cat: 'Bedden', colors: HOUTWIT, build: (g, C) => ladekast(g, C, 0.5, 0.55, 0.4, 2) },
  // ---------- kasten & opbergen ----------
  pax200: { label: 'PAX garderobekast 200', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => kastBase(g, C, 2.0, 2.36, 0.6, 4) },
  pax100: { label: 'PAX garderobekast 100', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => kastBase(g, C, 1.0, 2.36, 0.6, 2) },
  billy: {
    label: 'BILLY boekenkast', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => {
      openvak(g, C, 0.8, 2.02, 0.28, 1, 6);
      for (let i = 0; i < 5; i++) for (let b = 0; b < 6; b++)
        box(g, mat([0xc0392b, 0x2980b9, 0x27ae60, 0xc9982f, 0x8e44ad, 0x7f8c8d][(i * 7 + b * 3) % 6]), 0.045, 0.24, 0.17, -0.3 + b * 0.105, 0.18 + i * 0.335, 0);
    }
  },
  kallax22: { label: 'KALLAX 2×2', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => openvak(g, C, 0.77, 0.77, 0.39, 2, 2) },
  kallax42: { label: 'KALLAX 4×2 (laag)', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => openvak(g, C, 1.47, 0.77, 0.39, 4, 2) },
  besta: { label: 'BESTÅ tv-meubel 180 + TV', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => { kastBase(g, C, 1.8, 0.42, 0.42, 3); box(g, mat(0x111111, { roughness: 0.3 }), 1.25, 0.72, 0.04, 0, 0.85, 0); } },
  hemnes8: { label: 'HEMNES ladekast 8', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => ladekast(g, C, 1.6, 0.95, 0.5, 3) },
  malm6: { label: 'MALM ladekast 6', cat: 'Kasten', colors: HOUTWIT, build: (g, C) => ladekast(g, C, 0.8, 1.23, 0.48, 6) },
  vittsjo: {
    label: 'VITTSJÖ stellingkast', cat: 'Kasten', colors: [['Zwart', 0x2b2b2b], ['Wit', 0xf2f0ea]], build: (g, C) => {
      for (let i = 0; i < 4; i++) box(g, mat(0x9a6b48, { roughness: 0.5 }), 0.5, 0.025, 0.36, 0, 0.05 + i * 0.48, 0);
      for (const [px, pz] of [[-0.24, -0.17], [0.24, -0.17], [-0.24, 0.17], [0.24, 0.17]])
        box(g, mat(C, { metalness: 0.6, roughness: 0.4 }), 0.02, 1.5, 0.02, px, 0.75, pz, true);
    }
  },
  // ---------- keuken ----------
  eiland: {
    label: 'Keukeneiland 180×90', cat: 'Keuken', colors: [['Wit', 0xf2f0ea], ['Antraciet', 0x44494f], ['Groen', 0x55695a]], build: (g, C) => {
      kastBase(g, C, 1.8, 0.88, 0.9, 3);
      box(g, mat(0xd9bb8a, { roughness: 0.45 }), 1.9, 0.04, 1.0, 0, 0.91, 0);
    }
  },
  keukenkast: { label: 'METOD hoge kast', cat: 'Keuken', colors: HOUTWIT, build: (g, C) => kastBase(g, C, 0.6, 2.2, 0.6, 1) },
  koffiezet: {
    label: 'Koffiezetapparaat', cat: 'Keuken', colors: [['Zwart', 0x222222], ['RVS', 0x9a9da0], ['Rood', 0x8e2f2f]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.4 }), 0.22, 0.34, 0.26, 0, 0.17, 0, true);
      box(g, mat(0x1a1a1a), 0.16, 0.12, 0.14, 0, 0.1, 0.04);
    }
  },
  magnetron: {
    label: 'Magnetron', cat: 'Keuken', colors: [['Zwart', 0x222222], ['RVS', 0x9a9da0]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.4 }), 0.48, 0.28, 0.35, 0, 0.14, 0, true);
      box(g, mat(0x111111, { roughness: 0.2 }), 0.3, 0.2, 0.01, -0.05, 0.14, 0.18);
    }
  },
  broodrooster: { label: 'Broodrooster', cat: 'Keuken', colors: [['RVS', 0x9a9da0], ['Zwart', 0x222222], ['Crème', 0xe8dfc8]], build: (g, C) => box(g, mat(C, { roughness: 0.35, metalness: 0.4 }), 0.26, 0.18, 0.16, 0, 0.09, 0, true) },
  waterkoker: { label: 'Waterkoker', cat: 'Keuken', colors: [['RVS', 0x9a9da0], ['Zwart', 0x222222]], build: (g, C) => { cyl(g, mat(C, { roughness: 0.35, metalness: 0.4 }), 0.085, 0.1, 0.22, 0, 0.11, 0).userData.tint = true; } },
  fruitschaal: {
    label: 'Fruitschaal', cat: 'Keuken', colors: [['Zwart', 0x2b2b2b], ['Wit', 0xf2f0ea]], build: (g, C) => {
      cyl(g, mat(C), 0.14, 0.09, 0.07, 0, 0.035, 0).userData.tint = true;
      for (const [c, x, z] of [[0xd4762c, -0.04, 0], [0xc23b22, 0.04, 0.02], [0x7aa12e, 0, -0.04], [0xe8c547, 0.02, 0.05]]) {
        const a = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), mat(c, { roughness: 0.6 }));
        a.position.set(x, 0.09, z); a.castShadow = true; g.add(a);
      }
    }
  },
  snijplank: {
    label: 'Snijplank + messenblok', cat: 'Keuken', colors: [['Bamboe', 0xd0a868]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.6 }), 0.35, 0.02, 0.24, 0, 0.01, 0, true);
      box(g, mat(0x3a3028), 0.1, 0.2, 0.06, 0.2, 0.1, 0);
    }
  },
  // ---------- badkamer & sanitair ----------
  toilet: {
    label: 'Wandcloset + reservoir', cat: 'Badkamer', colors: [['Wit', 0xffffff]], build: (g, C) => {
      box(g, mat(0xeceae6), 0.45, 1.0, 0.16, 0, 0.5, -0.08);
      box(g, mat(C, { roughness: 0.25 }), 0.37, 0.38, 0.52, 0, 0.41, 0.26, true);
      box(g, mat(C, { roughness: 0.25 }), 0.39, 0.05, 0.54, 0, 0.62, 0.26, true);
      box(g, mat(0xd5d5d0, { metalness: 0.3 }), 0.18, 0.08, 0.01, 0, 0.9, 0.005);
    }
  },
  godmorgon: {
    label: 'GODMORGON wastafelmeubel', cat: 'Badkamer', colors: HOUTWIT, build: (g, C) => {
      box(g, mat(C), 0.8, 0.45, 0.45, 0, 0.58, 0, true);
      box(g, mat(C, { roughness: 0.6 }), 0.74, 0.17, 0.015, 0, 0.49, 0.23, true);
      box(g, mat(C, { roughness: 0.6 }), 0.74, 0.17, 0.015, 0, 0.68, 0.23, true);
      box(g, mat(0xffffff, { roughness: 0.2 }), 0.82, 0.1, 0.47, 0, 0.85, 0);
      cyl(g, mat(0xc0c3c6, { metalness: 0.8, roughness: 0.25 }), 0.014, 0.014, 0.25, 0, 1.0, -0.12);
    }
  },
  spiegelkast: {
    label: 'Spiegelkast 60', cat: 'Badkamer', mount: 'wall', defH: 1.65, colors: [['Wit', 0xf2f0ea], ['Zwart', 0x2b2b2b]], build: (g, C) => {
      box(g, mat(C), 0.6, 0.7, 0.14, 0, 0, 0.07, true);
      box(g, mat(0xcfd8dc, { metalness: 0.95, roughness: 0.04 }), 0.56, 0.64, 0.01, 0, 0, 0.145);
    }
  },
  handdoekrek: {
    label: 'Handdoekrek (wand)', cat: 'Badkamer', mount: 'wall', defH: 1.2, colors: METAAL, build: (g, C) => {
      const m = mat(C, { metalness: 0.8, roughness: 0.3 });
      box(g, m, 0.6, 0.02, 0.02, 0, 0, 0.1, true);
      box(g, m, 0.02, 0.02, 0.1, -0.28, 0, 0.05, true); box(g, m, 0.02, 0.02, 0.1, 0.28, 0, 0.05, true);
      box(g, mat(0x7da3c0, { roughness: 0.95 }), 0.35, 0.4, 0.02, -0.08, -0.21, 0.105);
    }
  },
  wasmand: { label: 'Wasmand', cat: 'Badkamer', colors: [['Naturel', 0xc9b385], ['Grijs', 0x8a8d90]], build: (g, C) => { cyl(g, mat(C, { roughness: 0.95 }), 0.22, 0.18, 0.55, 0, 0.275, 0).userData.tint = true; } },
  badmat: { label: 'Badmat', cat: 'Badkamer', colors: KLEED, build: (g, C) => box(g, mat(C, { roughness: 1 }), 0.8, 0.015, 0.5, 0, 0.008, 0, true) },
  // ---------- verlichting ----------
  ranarp: {
    label: 'RANARP vloerlamp', cat: 'Verlichting', colors: METAAL, build: (g, C) => {
      lampVoet(g, C, 1.45);
      const kap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.18, 18, 1, true), mat(C, { side: THREE.DoubleSide }));
      kap.position.set(0.1, 1.5, 0); kap.rotation.z = -0.4; kap.userData.tint = true; g.add(kap);
      const peer = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), mat(0xfff2cc, { emissive: 0xffdf99, emissiveIntensity: 0.8 }));
      peer.position.set(0.13, 1.46, 0); g.add(peer);
    }
  },
  regolit: {
    label: 'Booglamp', cat: 'Verlichting', colors: METAAL, build: (g, C) => {
      cyl(g, mat(C), 0.16, 0.18, 0.025, 0, 0.012, 0).userData.tint = true;
      const boog = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.012, 8, 24, Math.PI / 2), mat(C));
      boog.position.set(0, 0.02, 0); boog.userData.tint = true; g.add(boog);
      const kap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), mat(0xf5e9d4, { emissive: 0xffe2b0, emissiveIntensity: 0.4 }));
      kap.position.set(0.88, 0.9, 0); g.add(kap);
    }
  },
  navlinge: {
    label: 'Bureaulamp', cat: 'Verlichting', colors: METAAL, build: (g, C) => {
      lampVoet(g, C, 0.35);
      const kap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(C));
      kap.position.set(0.05, 0.37, 0); kap.rotation.z = -0.7; kap.userData.tint = true; g.add(kap);
    }
  },
  wandlamp: {
    label: 'Wandlamp', cat: 'Verlichting', mount: 'wall', defH: 1.8, colors: METAAL, build: (g, C) => {
      box(g, mat(C), 0.1, 0.16, 0.03, 0, 0, 0.015, true);
      const kap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 14, 1, true), mat(C, { side: THREE.DoubleSide }));
      kap.position.set(0, 0, 0.1); kap.userData.tint = true; g.add(kap);
      const peer = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mat(0xfff2cc, { emissive: 0xffdf99, emissiveIntensity: 0.8 }));
      peer.position.set(0, -0.03, 0.1); g.add(peer);
    }
  },
  // ---------- wand ----------
  schilderijGroot: { label: 'Schilderij 100×70', cat: 'Wand', mount: 'wall', defH: 1.55, colors: KUNST, build: (g, C) => schilderij(g, C, 1.0, 0.7) },
  schilderijKlein: { label: 'Schilderij 50×70', cat: 'Wand', mount: 'wall', defH: 1.55, colors: KUNST, build: (g, C) => schilderij(g, C, 0.5, 0.7) },
  fotolijstjes: {
    label: 'Fotolijstjes (3)', cat: 'Wand', mount: 'wall', defH: 1.55, colors: [['Zwart', 0x2b2b2b], ['Goud', 0xb89a5a], ['Wit', 0xf2f0ea]], build: (g, C) => {
      const fotos = [0x9db4c0, 0xc7b9a5, 0x778877];
      [[-0.3, 0.05, 0.24, 0.3], [0, -0.05, 0.3, 0.24], [0.32, 0.06, 0.2, 0.26]].forEach(([x, y, w, h], i) => {
        box(g, mat(C), w, h, 0.02, x, y, 0.01, true);
        box(g, mat(fotos[i], { roughness: 0.9 }), w - 0.04, h - 0.04, 0.012, x, y, 0.022);
      });
    }
  },
  wandklok: {
    label: 'Wandklok', cat: 'Wand', mount: 'wall', defH: 1.9, colors: METAAL, build: (g, C) => {
      const r = cyl(g, mat(C), 0.16, 0.16, 0.03, 0, 0, 0.015, 24); r.rotation.x = Math.PI / 2; r.userData.tint = true;
      const w = cyl(g, mat(0xf6f4ee), 0.14, 0.14, 0.01, 0, 0, 0.032, 24); w.rotation.x = Math.PI / 2;
      box(g, mat(0x222222), 0.012, 0.09, 0.005, 0, 0.045, 0.04);
      box(g, mat(0x222222), 0.07, 0.012, 0.005, 0.03, 0, 0.04);
    }
  },
  lackplank: {
    label: 'LACK wandplank 110', cat: 'Wand', mount: 'wall', defH: 1.4, colors: HOUTWIT, build: (g, C) => {
      box(g, mat(C, { roughness: 0.5 }), 1.1, 0.05, 0.26, 0, 0, 0.13, true);
      box(g, mat(0xc0392b), 0.04, 0.2, 0.14, -0.4, 0.125, 0.1);
      box(g, mat(0x2980b9), 0.04, 0.22, 0.14, -0.35, 0.135, 0.1);
      cyl(g, mat(0x88a06a), 0.05, 0.04, 0.12, 0.3, 0.085, 0.13);
    }
  },
  spiegelrond: {
    label: 'Spiegel rond ⌀60', cat: 'Wand', mount: 'wall', defH: 1.6, colors: METAAL, build: (g, C) => {
      const ring = cyl(g, mat(C, { metalness: 0.6, roughness: 0.35 }), 0.31, 0.31, 0.02, 0, 0, 0.012, 28); ring.rotation.x = Math.PI / 2; ring.userData.tint = true;
      const sp = cyl(g, mat(0xcfd8dc, { metalness: 0.95, roughness: 0.04 }), 0.28, 0.28, 0.012, 0, 0, 0.026, 28); sp.rotation.x = Math.PI / 2;
    }
  },
  spiegelGroot: {
    label: 'Spiegel 60×160', cat: 'Wand', mount: 'wall', defH: 1.1, colors: METAAL, build: (g, C) => {
      box(g, mat(C), 0.62, 1.62, 0.025, 0, 0, 0.012, true);
      box(g, mat(0xcfd8dc, { metalness: 0.95, roughness: 0.04 }), 0.56, 1.56, 0.012, 0, 0, 0.028);
    }
  },
  kapstok: {
    label: 'Kapstok (wand)', cat: 'Wand', mount: 'wall', defH: 1.7, colors: HOUTWIT, build: (g, C) => {
      box(g, mat(C), 0.7, 0.08, 0.03, 0, 0, 0.015, true);
      for (let i = 0; i < 4; i++) {
        const h = cyl(g, mat(0x8a8a8a, { metalness: 0.7 }), 0.012, 0.012, 0.1, -0.26 + i * 0.17, -0.03, 0.06);
        h.rotation.x = Math.PI / 2.6;
      }
    }
  },
  tvwand: {
    label: 'TV 55″ wandmontage', cat: 'Wand', mount: 'wall', defH: 1.35, colors: [['Zwart', 0x111111]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.3 }), 1.24, 0.72, 0.05, 0, 0, 0.04, true);
      box(g, mat(0x222a33, { roughness: 0.15, metalness: 0.4 }), 1.18, 0.66, 0.01, 0, 0, 0.07);
    }
  },
  stopcontact: {
    label: 'Stopcontact (dubbel)', cat: 'Wand', mount: 'wall', defH: 0.3, colors: [['Wit', 0xf4f2ec], ['Zwart', 0x2b2b2b]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.5 }), 0.16, 0.085, 0.012, 0, 0, 0.006, true);
      for (const dx of [-0.038, 0.038]) {
        const c = cyl(g, mat(C === 0x2b2b2b ? 0x1c1c1c : 0xe6e3da), 0.028, 0.028, 0.014, dx, 0, 0.008, 14);
        c.rotation.x = Math.PI / 2;
      }
    }
  },
  // ---------- raamdecoratie ----------
  gordijnen: {
    label: 'Gordijnen 200', cat: 'Raamdecoratie', mount: 'wall', defH: 1.32, colors: [['Linnen', 0xd8cfbd], ['Grijs', 0x767b80], ['Groen', 0x55695a], ['Terracotta', 0xa9745a], ['Donkerblauw', 0x33415a]], build: (g, C) => {
      box(g, mat(0x2b2b2b), 2.1, 0.03, 0.03, 0, 1.26, 0.09);
      const st = mat(C, { roughness: 0.98 });
      for (const dx of [-0.78, 0.78]) {
        const p = box(g, st, 0.5, 2.48, 0.05, dx, 0, 0.07, true);
        p.scale.z = 1.4;
      }
    }
  },
  vitrage: {
    label: 'Vitrage 200', cat: 'Raamdecoratie', mount: 'wall', defH: 1.32, colors: [['Wit', 0xffffff]], build: (g, C) => {
      box(g, mat(0xd9d9d9), 2.1, 0.025, 0.025, 0, 1.26, 0.06);
      const doek = box(g, new THREE.MeshStandardMaterial({ color: C, roughness: 0.95, transparent: true, opacity: 0.45 }), 2.0, 2.45, 0.02, 0, 0, 0.05, true);
      doek.castShadow = false;
    }
  },
  rolgordijn: {
    label: 'Rolgordijn 120', cat: 'Raamdecoratie', mount: 'wall', defH: 1.9, colors: [['Wit', 0xf2f0ea], ['Grijs', 0x8a8d90], ['Zwart', 0x2b2b2b], ['Zand', 0xcfc4ae]], build: (g, C) => {
      cyl(g, mat(0xbfbfbf, { metalness: 0.4 }), 0.035, 0.035, 1.22, 0, 0, 0.05).rotation.z = Math.PI / 2;
      box(g, mat(C, { roughness: 0.9 }), 1.18, 1.1, 0.012, 0, -0.58, 0.05, true);
      box(g, mat(0x9a9a9a), 1.18, 0.02, 0.02, 0, -1.13, 0.055);
    }
  },
  jaloezie: {
    label: 'Jaloezie 120 (hout)', cat: 'Raamdecoratie', mount: 'wall', defH: 1.9, colors: HOUTWIT, build: (g, C) => {
      box(g, mat(C), 1.22, 0.05, 0.06, 0, 0, 0.04, true);
      for (let i = 1; i <= 22; i++) {
        const lam = box(g, mat(C, { roughness: 0.7 }), 1.18, 0.012, 0.05, 0, -i * 0.075, 0.04, true);
        lam.rotation.x = 0.45;
      }
    }
  },
  // ---------- balkon ----------
  balkonbankje: {
    label: 'Balkonbankje', cat: 'Balkon', colors: HOUTWIT, build: (g, C) => {
      for (let i = 0; i < 4; i++) box(g, mat(C, { roughness: 0.7 }), 1.1, 0.03, 0.08, 0, 0.42, -0.15 + i * 0.1, true);
      for (let i = 0; i < 3; i++) box(g, mat(C, { roughness: 0.7 }), 1.1, 0.08, 0.025, 0, 0.62 + i * 0.12, -0.2, true);
      legs4(g, 1.0, 0.4, 0.41, 0.04, 0x4a4a4a);
    }
  },
  bistroset: {
    label: 'Bistroset (tafel + 2 stoelen)', cat: 'Balkon', colors: METAAL, build: (g, C) => {
      cyl(g, mat(C, { metalness: 0.5, roughness: 0.4 }), 0.3, 0.3, 0.02, 0, 0.7, 0).userData.tint = true;
      cyl(g, mat(C), 0.02, 0.03, 0.7, 0, 0.35, 0).userData.tint = true;
      for (const dx of [-0.55, 0.55]) {
        cyl(g, mat(C, { metalness: 0.5, roughness: 0.4 }), 0.17, 0.17, 0.02, dx, 0.45, 0).userData.tint = true;
        legs4(g, 0.3, 0.3, 0.44, 0.02, C);
        g.children.slice(-4).forEach(p => p.position.x += dx);
        box(g, mat(C), 0.32, 0.4, 0.02, dx, 0.65, -0.15, true);
      }
    }
  },
  buitenkleed: { label: 'Buitenkleed', cat: 'Balkon', colors: KLEED, build: (g, C) => box(g, mat(C, { roughness: 1 }), 1.7, 0.01, 1.2, 0, 0.005, 0, true) },
  plantenbak: {
    label: 'Plantenbak (hek)', cat: 'Balkon', colors: [['Antraciet', 0x44494f], ['Terracotta', 0x9c5b3c], ['Wit', 0xf2f0ea]], build: (g, C) => {
      box(g, mat(C), 0.6, 0.18, 0.2, 0, 0.6, 0, true);
      for (let i = 0; i < 5; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat([0xd45a7a, 0xe8c547, 0xc23b52, 0xe88a3a, 0x8a5ad4][i], { roughness: 0.8 }));
        b.position.set(-0.22 + i * 0.11, 0.74, 0); b.castShadow = true; g.add(b);
      }
      box(g, mat(0x4a8a50, { roughness: 0.95 }), 0.56, 0.08, 0.16, 0, 0.7, 0);
    }
  },
  loungestoel: {
    label: 'Loungestoel buiten', cat: 'Balkon', colors: [['Grijs rotan', 0x8a8d90], ['Naturel rotan', 0xc9b385], ['Zwart', 0x2b2b2b]], build: (g, C) => {
      box(g, mat(C, { roughness: 0.95 }), 0.7, 0.35, 0.7, 0, 0.2, 0, true);
      box(g, mat(C, { roughness: 0.95 }), 0.7, 0.5, 0.15, 0, 0.55, -0.27, true);
      box(g, mat(0xe6e1d5, { roughness: 0.98 }), 0.6, 0.1, 0.55, 0, 0.42, 0.04);
    }
  },
  lantaarn: {
    label: 'Lantaarn + kaars', cat: 'Balkon', colors: METAAL, build: (g, C) => {
      box(g, mat(C), 0.16, 0.02, 0.16, 0, 0.01, 0, true);
      for (const [dx, dz] of [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]])
        box(g, mat(C), 0.012, 0.24, 0.012, dx, 0.14, dz, true);
      box(g, mat(C), 0.16, 0.02, 0.16, 0, 0.26, 0, true);
      cyl(g, mat(0xf5ecd0, { emissive: 0xffd98a, emissiveIntensity: 0.5 }), 0.035, 0.035, 0.1, 0, 0.07, 0);
    }
  },
  // ---------- decoratie ----------
  kleedRH: { label: 'Vloerkleed 240×170', cat: 'Decoratie', colors: KLEED, build: (g, C) => box(g, mat(C, { roughness: 1 }), 2.4, 0.012, 1.7, 0, 0.006, 0, true) },
  kleedRond: { label: 'Vloerkleed rond ⌀200', cat: 'Decoratie', colors: KLEED, build: (g, C) => { cyl(g, mat(C, { roughness: 1 }), 1.0, 1.0, 0.012, 0, 0.006, 0, 36).userData.tint = true; } },
  monstera: {
    label: 'Monstera (groot)', cat: 'Decoratie', colors: [['Terracotta pot', 0x9c5b3c], ['Witte pot', 0xf2f0ea], ['Zwarte pot', 0x2b2b2b]], build: (g, C) => {
      cyl(g, mat(C), 0.16, 0.13, 0.3, 0, 0.15, 0).userData.tint = true;
      cyl(g, mat(0x5d4037), 0.02, 0.03, 0.6, 0, 0.6, 0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const blad = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mat(0x3d7a44, { roughness: 0.85 }));
        blad.scale.set(1, 0.5, 0.7); blad.position.set(Math.sin(a) * 0.22, 0.85 + (i % 3) * 0.12, Math.cos(a) * 0.22);
        blad.castShadow = true; g.add(blad);
      }
    }
  },
  fejka: {
    label: 'FEJKA plantje', cat: 'Decoratie', colors: [['Wit', 0xf2f0ea], ['Terracotta', 0x9c5b3c]], build: (g, C) => {
      cyl(g, mat(C), 0.07, 0.055, 0.12, 0, 0.06, 0).userData.tint = true;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat(0x4a8a50, { roughness: 0.9 }));
      b.position.y = 0.2; b.castShadow = true; g.add(b);
    }
  },
  vaas: {
    label: 'Vaas met takken', cat: 'Decoratie', colors: [['Wit', 0xf2f0ea], ['Blauw', 0x3f5871], ['Amber', 0xc28f3a]], build: (g, C) => {
      cyl(g, mat(C, { roughness: 0.3 }), 0.05, 0.08, 0.28, 0, 0.14, 0).userData.tint = true;
      for (let i = 0; i < 3; i++) cyl(g, mat(0x6a8a4a), 0.004, 0.004, 0.3, -0.02 + i * 0.02, 0.4, i * 0.01);
    }
  },
  boeken: {
    label: 'Stapel boeken', cat: 'Decoratie', colors: [['Mix', 0xc0392b]], build: (g) => {
      [[0xc0392b, 0], [0x2980b9, 1], [0xc9982f, 2], [0x55695a, 3]].forEach(([c, i]) =>
        box(g, mat(c, { roughness: 0.8 }), 0.22 - i * 0.015, 0.03, 0.16, (i % 2) * 0.015, 0.015 + i * 0.03, 0));
    }
  },
  prullenbak: { label: 'Prullenbak', cat: 'Decoratie', colors: METAAL, build: (g, C) => { cyl(g, mat(C, { metalness: 0.5, roughness: 0.4 }), 0.13, 0.11, 0.35, 0, 0.175, 0).userData.tint = true; } },
  kussens: {
    label: 'Sierkussens (2)', cat: 'Decoratie', colors: STOF, build: (g, C) => {
      box(g, mat(C, { roughness: 0.97 }), 0.45, 0.14, 0.45, -0.1, 0.07, 0, true);
      const k2 = box(g, mat(C, { roughness: 0.97 }), 0.4, 0.13, 0.4, 0.18, 0.065, 0.1, true);
      k2.rotation.y = 0.5;
    }
  },
};

export const CATEGORIES = [...new Set(Object.values(CATALOG).map(d => d.cat))];

export function createFurniture(type, colorHex = null) {
  const def = CATALOG[type];
  if (!def) return null;
  const g = new THREE.Group();
  g.name = `meubel:${type}`;
  const C = colorHex ?? def.colors[0][1];
  g.userData = { furniture: true, type, color: C, mount: def.mount ?? 'floor', defH: def.defH ?? 0 };
  def.build(g, C);
  return g;
}

export function recolorFurniture(group, colorHex) {
  const def = CATALOG[group.userData.type];
  if (!def) return;
  group.clear();
  def.build(group, colorHex);
  group.userData.color = colorHex;
}
