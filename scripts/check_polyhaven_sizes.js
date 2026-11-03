import fs from 'node:fs';
import path from 'node:path';

const files = [
  'metal_office_desk/metal_office_desk_1k.gltf',
  'drawer_cabinet/drawer_cabinet_1k.gltf',
  'metal_stool_01/metal_stool_01_1k.gltf',
  'classic_laptop/classic_laptop_1k.gltf',
  'binder_notebook/binder_notebook_1k.gltf',
  'microscope/industrial_microscope_1k.gltf',
  'chemistry_set/chemistry_set_1k.gltf'
];

for (const f of files) {
  const p = path.join('public/models', f);
  const gltf = JSON.parse(fs.readFileSync(p, 'utf8'));
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
  console.log(`${f} -> size: [${size.join(', ')}], min: [${min.map(n => n.toFixed(3)).join(', ')}], max: [${max.map(n => n.toFixed(3)).join(', ')}]`);
}

