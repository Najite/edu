import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const assetsToDownload = [
  {
    name: 'hotplate_stirrer.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/expansion_batch05/t4_measure/ika_plate_rctdigital/model.glb',
  },
  {
    name: 'centrifuge.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/basic40_batch02/t3_analytical/eppendorf_5910ri/model.glb',
  },
  {
    name: 'analytical_balance.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/PX224E/PX224E.glb',
  },
  {
    name: 'lab_oven.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/basic40_batch02/t1_thermal/binder_vd56/model.glb',
  },
  {
    name: 'reagent_bottle_amber.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/containers/duran_gl45_250ml_amber/model.glb',
  },
  {
    name: 'reagent_bottle_clear.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/containers/duran_gl45_500ml_clear/model.glb',
  },
  {
    name: 'spatula.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/tools/bochem_spatula_3340/model.glb',
  },
  {
    name: 'weighing_boat.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/tools/globe_weighing_boat_3620/model.glb',
  },
  {
    name: 'lab_shelf_2tier.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/furniture/trippnt_step_shelf_2tier/model.glb',
  },
  {
    name: 'vial_rack.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/racks/mn_702503_vial_rack_23mm/model.glb',
  },
  {
    name: 'pcr_plate.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/consumables/biorad_hardshell_pcr_plate_96/model.glb',
  },
  {
    name: 'cuvette.glb',
    url: 'https://huggingface.co/datasets/MBZUAI/ChemLab-Assets/resolve/main/assets/labware/consumables/brand_ps_macro_cuvette_759005/model.glb',
  },
];

const destDir = path.resolve('public/models/chemlab');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (currUrl) => {
      https.get(currUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          const nextUrl = new URL(response.headers.location, currUrl).href;
          get(nextUrl);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed with status ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    };
    get(url);
  });
}

async function main() {
  console.log(`Checking ${assetsToDownload.length} ChemLab assets...`);
  for (const asset of assetsToDownload) {
    const dest = path.join(destDir, asset.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${asset.name} (${fs.statSync(dest).size} bytes)`);
      continue;
    }
    console.log(`Downloading ${asset.name}...`);
    try {
      await downloadFile(asset.url, dest);
      console.log(`✓ Saved ${asset.name} (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`✗ Error downloading ${asset.name}:`, e.message);
    }
  }
  console.log('All downloads completed!');
}

main();
