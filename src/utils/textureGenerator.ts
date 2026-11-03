import * as THREE from 'three';

/**
 * Procedurally generates subtle, realistic PBR textures for laboratory tiles:
 * - Soft off-white ceramic surface with gentle grout lines
 * - Subtle normal bump map for gentle depth
 * - Realistic roughness map (glossy glaze with matte grout)
 */
export function createLaboratoryTilePBR(gridSize = 6, size = 512): {
  albedo: THREE.CanvasTexture;
  normal: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;

  const roughnessCanvas = document.createElement('canvas');
  roughnessCanvas.width = size;
  roughnessCanvas.height = size;
  const rCtx = roughnessCanvas.getContext('2d')!;

  // Subtle clean porcelain off-white tile
  aCtx.fillStyle = '#f1f5f9';
  aCtx.fillRect(0, 0, size, size);

  nCtx.fillStyle = '#8080ff';
  nCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#333333'; // Glossy glaze (roughness ~ 0.2)
  rCtx.fillRect(0, 0, size, size);

  const tileSize = size / gridSize;
  const groutWidth = 2; // Very fine, subtle grout line (not thick bars)

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const px = x * tileSize;
      const py = y * tileSize;

      // Subtle light-grey grout
      aCtx.fillStyle = '#cbd5e1';
      aCtx.fillRect(px, py, tileSize, groutWidth);
      aCtx.fillRect(px, py, groutWidth, tileSize);

      // Subtle normal bevel
      nCtx.fillStyle = '#8a80f0';
      nCtx.fillRect(px, py, groutWidth, tileSize);
      nCtx.fillStyle = '#808af0';
      nCtx.fillRect(px, py, tileSize, groutWidth);

      // Grout roughness
      rCtx.fillStyle = '#999999';
      rCtx.fillRect(px, py, tileSize, groutWidth);
      rCtx.fillRect(px, py, groutWidth, tileSize);
    }
  }

  const albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  const roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);

  [albedoTexture, normalTexture, roughnessTexture].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
    t.needsUpdate = true;
  });

  return {
    albedo: albedoTexture,
    normal: normalTexture,
    roughness: roughnessTexture,
  };
}
