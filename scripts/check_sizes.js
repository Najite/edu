import fs from 'node:fs';
import path from 'node:path';

// Parse min/max from accessors of primitives
const files = [
  'hotplate_stirrer.glb',
  'centrifuge.glb',
  'analytical_balance.glb',
  'lab_oven.glb',
  'lab_shelf_2tier.glb',
  'vial_rack.glb',
  'reagent_bottle_amber.glb',
  'spatula.glb'
];

for (const f of files) {
  const buf = fs.readFileSync(path.join('public/models/chemlab', f));
  const jsonLen = buf.readUInt32LE(12);
  const jsonChunk = buf.slice(20, 20 + jsonLen).toString('utf8');
  const gltf = JSON.parse(jsonChunk);

  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];

  if (gltf.accessors) {
    gltf.accessors.forEach(acc => {
      if (acc.min && acc.max && acc.type === 'VEC3') {
        min[0] = Math.min(min[0], acc.min[0]);
        min[1] = Math.min(min[1], acc.min[1]);
        min[2] = Math.min(min[2], acc.min[2]);
        max[0] = Math.max(max[0], acc.max[0]);
        max[1] = Math.max(max[1], acc.max[1]);
        max[2] = Math.max(max[2], acc.max[2]);
      }
    });
  }

  const size = [
    (max[0] - min[0]).toFixed(3),
    (max[1] - min[1]).toFixed(3),
    (max[2] - min[2]).toFixed(3)
  ];

  console.log(`${f} -> size [W, H, D]: [${size.join(', ')}] meters, min: [${min.map(n => n.toFixed(3)).join(', ')}]`);
}

