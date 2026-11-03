import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'chemlab/hotplate_stirrer.glb',
  'chemlab/centrifuge.glb',
  'chemlab/analytical_balance.glb',
  'chemlab/lab_oven.glb',
  'chemlab/reagent_bottle_amber.glb',
  'chemlab/spatula.glb',
  'microscope/industrial_microscope_1k.gltf',
  'classic_laptop/classic_laptop_1k.gltf',
  'binder_notebook/binder_notebook_1k.gltf',
  'metal_stool_01/metal_stool_01_1k.gltf'
];

const loader = new GLTFLoader();

for (const f of files) {
  const p = path.join('public/models', f);
  const data = fs.readFileSync(p);
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

  loader.parse(arrayBuffer, '', (gltf) => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    console.log(`\n${f}:`);
    console.log(`  Size [W, H, D]: [${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)}]`);
    console.log(`  Min: [${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)}]`);
    console.log(`  Max: [${box.max.x.toFixed(3)}, ${box.max.y.toFixed(3)}, ${box.max.z.toFixed(3)}]`);
  }, (err) => {
    console.error(`Error parsing ${f}:`, err);
  });
}

