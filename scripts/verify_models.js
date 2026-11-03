import fs from 'node:fs';
import path from 'node:path';

const models = [
  'hotplate_stirrer.glb',
  'centrifuge.glb',
  'analytical_balance.glb',
  'lab_oven.glb',
  'lab_shelf_2tier.glb',
  'vial_rack.glb',
  'reagent_bottle_amber.glb',
  'reagent_bottle_clear.glb',
  'spatula.glb'
];

for (const m of models) {
  const p = path.join('public/models/chemlab', m);
  const exists = fs.existsSync(p);
  const size = exists ? fs.statSync(p).size : 0;
  console.log(`${m}: exists=${exists}, size=${(size/1024).toFixed(1)} KB`);
}

