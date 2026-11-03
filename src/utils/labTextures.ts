import * as THREE from 'three';

/**
 * High-fidelity procedural PBR textures for scientific laboratory glassware,
 * equipment labels, ceramic surfaces, and epoxy countertops.
 */

/**
 * 1. Precision Burette 50 mL Glass Graduations (DIN EN ISO 385 Class AS)
 * Produces crisp, high-contrast permanent cobalt blue & black ceramic enamel
 * markings with large legible numbers (0 to 50), 0.1 mL sub-division ticks,
 * and standard DIN/ISO laboratory specification stamps.
 */
export function createBuretteScaleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 4096;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 1024, 4096);

    // Deep high-contrast laboratory black-blue enamel
    const textColor = '#0f172a';
    const numberColor = '#0369a1';
    const lineColor = '#0284c7';
    const outlineColor = 'rgba(255, 255, 255, 0.95)';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Header scientific laboratory markings near top (above 0 mL mark, centered at X = 512)
    ctx.font = 'bold 44px "Arial", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('PYREX ®', 512, 90);

    ctx.font = 'bold 30px "Arial", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText('CLASS AS', 512, 142);

    ctx.font = 'bold 26px "Arial", sans-serif';
    ctx.fillText('50 : 0.10 mL', 512, 190);
    ctx.fillText('Ex 20°C  ±0.05', 512, 235);
    ctx.fillText('DIN EN ISO 385', 512, 280);
    ctx.fillText('BORO 3.3', 512, 325);

    // Scale graduation lines:
    // Mathematically calibrated to 3D cylinder:
    // 0.00 mL mark at canvas Y = 372 (world y = 0.350)
    // 50.00 mL mark at canvas Y = 3947 (world y = -0.130)
    const startY = 372;
    const endY = 3947;
    const totalMarks = 50;
    const spanY = endY - startY;

    // Line right anchor (centered in camera view)
    const lineRight = 650;
    const numberX = 480; // Right-aligned numbers to the left of graduation marks

    for (let ml = 0; ml <= totalMarks; ml++) {
      const y = startY + (ml / totalMarks) * spanY;

      // Major numbered mark (every 5 mL)
      if (ml % 5 === 0) {
        const lineLeft = 495;

        // White contrast underlay for line
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(lineLeft - 4, y);
        ctx.lineTo(lineRight + 4, y);
        ctx.stroke();

        // Primary line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 7.0;
        ctx.beginPath();
        ctx.moveTo(lineLeft, y);
        ctx.lineTo(lineRight, y);
        ctx.stroke();

        // Bold large numeral (0, 5, 10, ... 50)
        ctx.font = 'bold 56px "Arial", sans-serif';
        ctx.textAlign = 'right';

        // White halo outline for maximum contrast
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 9;
        ctx.strokeText(`${ml}`, numberX, y);

        // Number fill
        ctx.fillStyle = textColor;
        ctx.fillText(`${ml}`, numberX, y);
      } else {
        // 1 mL intermediate mark
        const lineLeft = 525;

        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(lineLeft - 2, y);
        ctx.lineTo(lineRight + 2, y);
        ctx.stroke();

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(lineLeft, y);
        ctx.lineTo(lineRight, y);
        ctx.stroke();

        // Intermediate 1 mL number
        ctx.font = 'bold 36px "Arial", sans-serif';
        ctx.textAlign = 'right';

        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 7;
        ctx.strokeText(`${ml}`, numberX, y);

        ctx.fillStyle = numberColor;
        ctx.fillText(`${ml}`, numberX, y);
      }

      // 0.1 mL minor ticks (10 sub-divisions between mL marks)
      if (ml < totalMarks) {
        for (let sub = 1; sub <= 9; sub++) {
          const subY = y + (sub / 10) * (spanY / totalMarks);
          const isMid = sub === 5;
          const tickLeft = isMid ? 560 : 585;

          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = isMid ? 5.5 : 4;
          ctx.beginPath();
          ctx.moveTo(tickLeft - 1, subY);
          ctx.lineTo(lineRight + 1, subY);
          ctx.stroke();

          ctx.strokeStyle = lineColor;
          ctx.lineWidth = isMid ? 3.8 : 2.4;
          ctx.beginPath();
          ctx.moveTo(tickLeft, subY);
          ctx.lineTo(lineRight, subY);
          ctx.stroke();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 2. Precision 250 mL Erlenmeyer Flask Ceramic White Enamel Badge
 * Includes Duran / Pyrex brand logo, 250 mL volume rating, graduation marks,
 * and frosted pencil writing patch.
 */
export function createFlaskCeramicBadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 1024, 1024);

    // Frosted white ceramic writing rectangle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(140, 160, 420, 240, 12);
    ctx.fill();

    // Lab write-in lines on the patch
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, 250);
    ctx.lineTo(520, 250);
    ctx.moveTo(180, 330);
    ctx.lineTo(520, 330);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "Arial", sans-serif';
    ctx.fillText('SAMPLE / DATE:', 180, 210);

    // Brand and volume markings
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Arial", sans-serif';
    ctx.fillText('PYREX ®', 140, 460);

    ctx.font = 'bold 36px "Arial", sans-serif';
    ctx.fillText('250 mL', 140, 515);

    ctx.font = '22px "Arial", sans-serif';
    ctx.fillText('BORO 3.3  •  No. 4980', 140, 555);
    ctx.fillText('APPROX. VOLUMES', 140, 590);

    // Graduation scale lines (50, 100, 150, 200, 250 mL)
    const marks = [
      { vol: 200, y: 640 },
      { vol: 150, y: 720 },
      { vol: 100, y: 800 },
      { vol: 50, y: 880 },
    ];

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';

    marks.forEach((m) => {
      ctx.beginPath();
      ctx.moveTo(140, m.y);
      ctx.lineTo(340, m.y);
      ctx.stroke();

      ctx.font = 'bold 32px "Arial", sans-serif';
      ctx.fillText(`${m.vol}`, 360, m.y + 10);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 3. GHS Hazardous Chemical Reagent Bottle Label (Phenolphthalein 1.0%)
 * Realistic chemical laboratory label with barcode, chemical formula,
 * GHS safety diamonds, and storage instructions.
 */
export function createReagentLabelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // White label stock
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 768);

    // Subtle label border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 984, 728);

    // Top primary header banner (Dark blue safety banner)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(20, 20, 984, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Arial", sans-serif';
    ctx.fillText('CHEMICAL REAGENT / INDICATOR', 50, 85);

    // Chemical Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 52px "Arial", sans-serif';
    ctx.fillText('PHENOLPHTHALEIN', 50, 200);

    ctx.font = 'bold 30px "Arial", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('0.1% w/v Solution in 95% Ethanol', 50, 250);
    ctx.fillText('pH Range 8.2 (Colorless) — 10.0 (Vibrant Pink)', 50, 290);

    // Divider line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 315);
    ctx.lineTo(974, 315);
    ctx.stroke();

    // Data specs grid
    ctx.font = '24px "Arial", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Formula: C20H14O4', 50, 360);
    ctx.fillText('Formula Weight: 318.32 g/mol', 50, 395);
    ctx.fillText('CAS No.: 77-09-8', 50, 430);
    ctx.fillText('UN Number: UN1170, Class 3, PG II', 50, 465);

    ctx.fillText('Lot Number: 2026-CH-9182', 50, 520);
    ctx.fillText('Expiry Date: 2028-11', 50, 555);
    ctx.fillText('Net Quantity: 50 mL (1.7 fl oz)', 50, 590);

    // Draw GHS Warning Diamond 1 (Flame - Flammable liquid)
    drawGHSDiamond(ctx, 740, 420, 65, '🔥', '#dc2626');

    // Draw GHS Warning Diamond 2 (Health Hazard / Silhouette)
    drawGHSDiamond(ctx, 890, 420, 65, '⚠️', '#dc2626');

    // Bottom barcode simulation
    ctx.fillStyle = '#0f172a';
    for (let x = 50; x < 450; x += 6) {
      const w = ((x * 13) % 5 === 0) ? 4 : 2;
      ctx.fillRect(x, 630, w, 60);
    }
    ctx.font = '18px monospace';
    ctx.fillText('*IND-77098-50ML*', 50, 710);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function drawGHSDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  symbol: string,
  borderColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);

  // White background square rotated 45 deg
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-size / 2, -size / 2, size, size);

  // Red border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 7;
  ctx.strokeRect(-size / 2, -size / 2, size, size);

  ctx.restore();

  // Symbol inside
  ctx.fillStyle = '#000000';
  ctx.font = '40px "Segoe UI Emoji", "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, cx, cy);
}

/**
 * 4. Realistic Chemical-Resistant Epoxy Benchtop Texture
 * Generates subtle specular variation and micro-surface roughness
 * characteristic of dark matte laboratory countertops (Trespa / Durcon).
 */
export function createLabCountertopTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep charcoal base
    ctx.fillStyle = '#1e242b';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle micro-fleck texture
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }

    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.needsUpdate = true;
  return texture;
}
