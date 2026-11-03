import * as THREE from 'three';

/**
 * Creates high-resolution procedural textures for laboratory screens,
 * monitors, and consumables to achieve photorealistic rendering.
 */

// 1. High-Tech Bioinformatics / DNA Wall Monitor Texture
export function createBioinformaticsScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep slate-blue/cyan high-tech background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0, '#040d1a');
    bgGrad.addColorStop(0.5, '#081e36');
    bgGrad.addColorStop(1, '#020b14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Glowing cyan/blue DNA Double Helix
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#38bdf8';

    const centerY = 480;
    const amplitude = 120;
    const period = 280;

    for (let x = 60; x < 960; x += 16) {
      const y1 = centerY + Math.sin(x / period * Math.PI * 2) * amplitude;
      const y2 = centerY - Math.sin(x / period * Math.PI * 2) * amplitude;

      // Base pair rungs
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();

      // Nodes on strands
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(x, y1, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(x, y2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Secondary vertical DNA helix in upper corner
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#06b6d4';
    for (let y = 80; y < 380; y += 12) {
      const x1 = 820 + Math.sin(y / 140 * Math.PI * 2) * 45;
      const x2 = 820 - Math.sin(y / 140 * Math.PI * 2) * 45;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }
    ctx.restore();

    // Data panels and telemetry text
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 36px "Segoe UI", Roboto, monospace';
    ctx.fillText('GENOMIC SEQUENCING MATRIX v4.2', 60, 90);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '22px "Segoe UI", Roboto, monospace';
    ctx.fillText('SAMPLE ID: H-SAPIENS-CHR-07  |  STATUS: ACTIVE REAL-TIME ANALYSIS', 60, 130);

    // Readout metrics boxes
    const metrics = [
      { label: 'BASE CALL ACCURACY', val: '99.98%' },
      { label: 'ELECTROPHORESIS VOLTAGE', val: '124.5 V' },
      { label: 'HOMOLOGY SCORE', val: '0.942 Q' },
      { label: 'MELTING TEMP (Tm)', val: '78.4 °C' },
    ];

    metrics.forEach((m, i) => {
      const bx = 60 + i * 224;
      const by = 820;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(bx, by, 208, 120);
      ctx.strokeRect(bx, by, 208, 120);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "Segoe UI", monospace';
      ctx.fillText(m.label, bx + 14, by + 36);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px "Segoe UI", monospace';
      ctx.fillText(m.val, bx + 14, by + 84);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 2. Educational "DNA Replication" Slide for Laptop Screen
export function createLaptopSlideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Dark chalkboard green background matching the reference image
    ctx.fillStyle = '#1e3a2f';
    ctx.fillRect(0, 0, 1024, 768);

    // Subtle border
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 984, 728);

    // Title: "DNA Replication"
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 54px "Segoe UI", serif';
    ctx.fillText('DNA Replication', 60, 110);

    // Bullet points
    ctx.fillStyle = '#f0fdf4';
    ctx.font = '28px "Segoe UI", sans-serif';
    ctx.fillText('• DNA must be copied or replicated before', 60, 190);
    ctx.fillText('   cell division', 60, 230);

    ctx.fillText('• Each new cell will then have an identical', 60, 310);
    ctx.fillText('   copy of the DNA', 60, 350);

    // 3D Replication Fork Diagram on the right side
    const forkX = 720;

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4ade80';

    // Parent DNA helix
    for (let y = 140; y < 400; y += 14) {
      const x1 = forkX + Math.sin(y / 40) * 35;
      const x2 = forkX - Math.sin(y / 40) * 35;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    // Replication Fork split strands
    for (let y = 400; y < 680; y += 14) {
      const splitDist = (y - 400) * 0.45;
      const leftX = forkX - splitDist + Math.sin(y / 35) * 20;
      const rightX = forkX + splitDist + Math.sin(y / 35) * 20;

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(leftX, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(rightX, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Labels for Helicase & Polymerase
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'italic bold 22px "Segoe UI", sans-serif';
    ctx.fillText('Helicase (Unwinding)', 460, 420);
    ctx.fillText('DNA Polymerase', 460, 520);
    ctx.fillText('Leading & Lagging Strands', 460, 620);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3. Nitrile Gloves Box ("X3200 Industrial Nitrile Gloves")
export function createGlovesBoxTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep royal blue medical packaging box
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 256);

    // Darker corner shading
    ctx.fillStyle = '#172554';
    ctx.fillRect(0, 0, 80, 256);

    // Large brand text
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 48px "Arial Black", sans-serif';
    ctx.fillText('X3200', 100, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('Industrial Nitrile Gloves', 105, 125);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('Powder-Free  •  Latex-Free  •  100 Gloves', 105, 160);

    // Glove silhouette / perforated oval dispenser
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(320, 205, 110, 32, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
