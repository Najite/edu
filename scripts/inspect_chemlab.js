import fs from 'node:fs';
import path from 'node:path';

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
  console.log(`\n=== ${f} ===`);
  console.log('Meshes:', gltf.meshes ? gltf.meshes.length : 0);
  console.log('Materials:', gltf.materials ? gltf.materials.length : 0);
  console.log('Images:', gltf.images ? gltf.images.length : 0);
  if (gltf.materials) {
    console.log('Material names:', gltf.materials.map(m => m.name));
  }
}

