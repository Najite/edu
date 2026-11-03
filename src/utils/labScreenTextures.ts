import * as THREE from 'three';

/**
 * Creates high-resolution procedural textures for laboratory screens,
 * monitors, and consumables to achieve photorealistic rendering.
 */

// 1. High-Tech Bioinformatics / Wall Monitor Texture
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

      // Top strand node
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y1, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bottom strand node
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(x, y2, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Data panels and telemetry text
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 36px "Segoe UI", Roboto, monospace';
    ctx.fillText('ANALYTICAL CHEMISTRY SYSTEM v4.2', 60, 90);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '22px "Segoe UI", Roboto, monospace';
    ctx.fillText('TELEMETRY: TITRATION CALORIMETRY & SPECTROPHOTOMETRY', 60, 130);

    // Readout metrics boxes
    const metrics = [
      { label: 'EQUIVALENCE VOL', val: '25.00 mL' },
      { label: 'CALCULATED pH', val: '7.00 pH' },
      { label: 'TITRANT MOLARITY', val: '0.100 M' },
      { label: 'LAB TEMPERATURE', val: '21.4 °C' },
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

// 2. High-Tech Chemical Laboratory Analysis Screen for Laptop
export function createLaptopSlideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep slate modern lab dark mode UI
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, 1024, 640);

    // Top Navigation Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 1024, 64);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 1024, 64);

    // Status dots
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(28, 32, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(48, 32, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(68, 32, 6, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText('ChemLab Pro 2026 — Acid-Base Titration Real-Time Monitor', 100, 39);

    // Main Titration Sigmoid Curve Plot (Left Area)
    const gx = 60, gy = 100, gw = 540, gh = 440;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy, gw, gh);

    // Grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    for (let x = gx + 40; x < gx + gw; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke();
    }
    for (let y = gy + 40; y < gy + gh; y += 40) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();
    }

    // Sigmoid Titration Curve (HCl + NaOH)
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#38bdf8';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const v = i * 0.5; // 0 to 50 mL
      // Sigmoid formula around V=25
      const ph = 1.0 + 12.0 / (1.0 + Math.exp(-(v - 25.0) * 0.6));
      const px = gx + 40 + (v / 50.0) * (gw - 60);
      const py = gy + gh - 40 - (ph / 14.0) * (gh - 60);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Equivalence Point Marker (V=25.0, pH=7.0)
    const eqX = gx + 40 + (25.0 / 50.0) * (gw - 60);
    const eqY = gy + gh - 40 - (7.0 / 14.0) * (gh - 60);
    ctx.fillStyle = '#ec4899';
    ctx.beginPath(); ctx.arc(eqX, eqY, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText('Equivalence Point (pH 7.00 @ 25.0 mL)', eqX + 14, eqY - 10);

    // Graph labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Segoe UI", monospace';
    ctx.fillText('pH 14', gx + 8, gy + 30);
    ctx.fillText('pH 7', gx + 12, eqY + 5);
    ctx.fillText('pH 0', gx + 12, gy + gh - 15);
    ctx.fillText('0 mL', gx + 35, gy + gh + 22);
    ctx.fillText('25 mL (Equiv)', eqX - 45, gy + gh + 22);
    ctx.fillText('50 mL', gx + gw - 35, gy + gh + 22);

    // Right Side Information Panel
    const rx = 640;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rx, 100, 340, 440);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(rx, 100, 340, 440);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('Experiment Protocol', rx + 24, 140);

    ctx.font = '16px "Segoe UI", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('HCl(aq) + NaOH(aq) → NaCl + H2O', rx + 24, 180);

    const specs = [
      { k: 'Analyte:', v: '25.0 mL of 0.100 M HCl' },
      { k: 'Titrant:', v: '0.100 M NaOH' },
      { k: 'Indicator:', v: 'Phenolphthalein (3 drops)' },
      { k: 'Color Range:', v: 'Colorless → Faint Pink' },
      { k: 'V(Titrant) Dispensed:', v: 'Live Telemetry Active' },
      { k: 'Target Window:', v: '24.8 mL — 25.2 mL' },
    ];

    specs.forEach((s, idx) => {
      const sy = 230 + idx * 46;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillText(s.k, rx + 24, sy);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 15px "Segoe UI", monospace';
      ctx.fillText(s.v, rx + 24, sy + 22);
    });

    // Bottom telemetry bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 580, 1024, 60);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px "Segoe UI", monospace';
    ctx.fillText('● SYSTEM ONLINE — SENSORS CALIBRATED — READY FOR DISPENSING', 60, 616);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// 3. Realistic Gloves Box Decal Texture
export function createGlovesBoxTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep royal blue medical packaging
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 256);

    // Cyan accent wave
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.bezierCurveTo(150, 120, 300, 200, 512, 140);
    ctx.lineTo(512, 256);
    ctx.lineTo(0, 256);
    ctx.fill();

    // Text & Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillText('X3200 PRO', 30, 60);

    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('Nitrile Examination Gloves', 30, 95);

    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Powder-Free • Textured Grip • Chemical Resistant', 30, 125);
    ctx.fillText('100 Pieces • Non-Sterile • Size M', 30, 150);

    // Oval dispenser perforation outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(380, 100, 80, 45, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
