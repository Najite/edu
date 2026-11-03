import fs from 'node:fs';
import path from 'node:path';

// Check the scene nodes of each GLTF
const files = [
  'hotplate_stirrer.glb',
  'centrifuge.glb',
  'analytical_balance.glb',
  'lab_oven.glb'
];

for (const f of files) {
  const buf = fs.readFileSync(path.join('public/models/chemlab', f));
  const jsonLen = buf.readUInt32LE(12);
  const jsonChunk = buf.slice(20, 20 + jsonLen).toString('utf8');
  const gltf = JSON.parse(jsonChunk);
  console.log(`\n=== ${f} Nodes ===`);
  if (gltf.nodes) {
    gltf.nodes.slice(0, 5).forEach(n => {
      console.log(`Node: ${n.name}, rotation: ${n.rotation}, translation: ${n.translation}, scale: ${n.scale}`);
    });
  }
}

