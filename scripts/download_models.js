import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicModelsDir = path.resolve(__dirname, '../public/models');

const ASSETS_TO_DOWNLOAD = [
  'metal_office_desk',
  'drawer_cabinet',
  'classic_laptop',
  'metal_stool_01',
  'binder_notebook',
];

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await fetch(url, { headers: { 'User-Agent': 'EduSim/1.0' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function downloadAsset(assetId) {
  console.log(`Fetching manifest for ${assetId}...`);
  const metaRes = await fetch(`https://api.polyhaven.com/files/${assetId}`, {
    headers: { 'User-Agent': 'EduSim/1.0' },
  });
  const meta = await metaRes.json();
  const gltfData = meta.gltf['1k'].gltf;

  const targetDir = path.join(publicModelsDir, assetId);
  const gltfFileName = `${assetId}_1k.gltf`;
  const gltfFilePath = path.join(targetDir, gltfFileName);

  console.log(`Downloading ${gltfFileName}...`);
  await downloadFile(gltfData.url, gltfFilePath);

  for (const [relPath, fileInfo] of Object.entries(gltfData.include)) {
    const destFilePath = path.join(targetDir, relPath);
    console.log(`Downloading ${assetId} -> ${relPath}...`);
    await downloadFile(fileInfo.url, destFilePath);
  }

  console.log(`✓ Completed ${assetId}`);
}

async function main() {
  for (const asset of ASSETS_TO_DOWNLOAD) {
    try {
      await downloadAsset(asset);
    } catch (e) {
      console.error(`Error downloading ${asset}:`, e);
    }
  }
  console.log('All 3D models downloaded successfully!');
}

main();

