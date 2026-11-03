import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ModernLabNotebookProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ModernLabNotebook: React.FC<ModernLabNotebookProps> = ({
  position = [0.46, 0.0, 0.25],
  rotation = [0, 0.10, 0],
  scale = 1.0,
}) => {
  // Scientific quadrille grid paper texture with student's titration calculations
  const pageTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Off-white scientific notebook paper
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1024, 768);

      // Subtle light-cyan quadrille grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 768); ctx.stroke();
      }
      for (let y = 0; y < 768; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
      }

      // Red left margin line
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(90, 0); ctx.lineTo(90, 768); ctx.stroke();

      // Center spine shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(490, 0, 44, 768);

      // Student's handwritten lab notes & calculations
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText('LAB REPORT: ACID-BASE TITRATION', 110, 68);

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Date: 2026-11-03   |   Station: Titration-01', 110, 104);
      ctx.fillText('Analyte: 25.00 mL HCl (0.100 M)', 110, 140);
      ctx.fillText('Titrant: Standardized NaOH (~0.100 M)', 110, 176);
      ctx.fillText('Indicator: Phenolphthalein (3 drops)', 110, 212);

      ctx.fillStyle = '#1e40af';
      ctx.fillText('REACTION: HCl + NaOH -> NaCl + H2O', 110, 260);
      ctx.fillText('Equivalence Point Expected: pH 7.00', 110, 296);
      ctx.fillText('Stoichiometry: n(HCl) = n(NaOH)', 110, 332);

      // Right Page Data Table
      ctx.fillStyle = '#0f172a';
      ctx.fillText('EXPERIMENTAL RUNS & DATA:', 560, 68);
      ctx.fillText('Trial 1: V(init)=50.0  V(final)=25.05', 560, 110);
      ctx.fillText('         V(dispensed) = 24.95 mL', 560, 140);
      ctx.fillText('Trial 2: V(dispensed) = 25.05 mL', 560, 180);
      ctx.fillText('Mean Volume = 25.00 mL +/- 0.05', 560, 220);
      ctx.fillText('End-point faint pink persisted >30s', 560, 260);
      ctx.fillText('Result: Standardized M(NaOH)=0.100M', 560, 300);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* ================= OPEN WIRE-O SPIRAL LAB NOTEBOOK ================= */}
      {/* Heavy navy blue polymer back cover */}
      <mesh castShadow receiveShadow position={[0, 0.003, 0]}>
        <boxGeometry args={[0.26, 0.004, 0.19]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Stack of thick paper pages */}
      <mesh receiveShadow position={[0, 0.006, 0]}>
        <boxGeometry args={[0.252, 0.004, 0.182]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Top Printed Notebook Open Pages */}
      <mesh position={[0, 0.0082, 0]}>
        <planeGeometry args={[0.25, 0.18]} />
        <meshStandardMaterial
          map={pageTexture}
          roughness={0.7}
        />
      </mesh>

      {/* Twin-Loop Wire-O Spine Rings */}
      {[-0.08, -0.06, -0.04, -0.02, 0, 0.02, 0.04, 0.06, 0.08].map((z, idx) => (
        <group key={`spiral-${idx}`} position={[0, 0.009, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.0055, 0.001, 8, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ================= STAINLESS STEEL LAB BALLPOINT PEN ================= */}
      <group position={[0.145, 0.0045, 0]} rotation={[0, 0.05, 0]}>
        {/* Pen Barrel (Stainless Steel) */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.14, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
        </mesh>
        {/* Rubber Grip Section */}
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.035, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
        {/* Chrome Tip Cone */}
        <mesh position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.001, 0.015, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.97} roughness={0.08} />
        </mesh>
        {/* Pocket Clip */}
        <mesh position={[0.0045, 0, -0.045]}>
          <boxGeometry args={[0.0015, 0.003, 0.045]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Click plunger button */}
        <mesh position={[0, 0, -0.073]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.008, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
        </mesh>
      </group>
    </group>
  );
};
