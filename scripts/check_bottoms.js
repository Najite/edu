import fs from 'node:fs';
import path from 'node:path';

const files = [
  'hotplate_stirrer.glb',
  'centrifuge.glb',
  'analytical_balance.glb',
  'lab_oven.glb',
  'vial_rack.glb',
  'reagent_bottle_amber.glb',
  'spatula.glb'
];

for (const f of files) {
  const buf = fs.readFileSync(path.join('public/models/chemlab', f));
  const jsonLen = buf.readUInt32LE(12);
  const jsonChunk = buf.slice(20, 20 + jsonLen).toString('utf8');
  const gltf = JSON.parse(jsonChunk);

  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let minX = Infinity, maxX = -Infinity;

  if (gltf.accessors) {
    gltf.accessors.forEach(acc => {
      if (acc.min && acc.max && acc.type === 'VEC3') {
        minX = Math.min(minX, acc.min[0]);
        maxX = Math.max(maxX, acc.max[0]);
        minY = Math.min(minY, acc.min[1]);
        maxY = Math.max(maxY, acc.min[1]);
        minZ = Math.min(minZ, acc.min[2]);
        maxZ = Math.max(maxZ, acc.min[2]);
      }
    });
  }

  console.log(`${f}:`);
  console.log(`  X: [${minX.toFixed(3)}, ${maxX.toFixed(3)}]`);
  console.log(`  Y: [${minY.toFixed(3)}, ${maxY.toFixed(3)}] (bottom at ${minY.toFixed(3)})`);
  console.log(`  Z: [${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`);
}

