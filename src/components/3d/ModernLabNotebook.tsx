import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ModernLabNotebookProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ModernLabNotebook: React.FC<ModernLabNotebookProps> = ({
  position = [0.34, 0.0, 0.26],
  rotation = [0, 0.12, 0],
  scale = 1.0,
}) => {
  // Ruled notebook page texture with scientific calculations
  const pageTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);

      // Subtle light-blue ruled lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let y = 30; y < 512; y += 24) {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(492, y);
        ctx.stroke();
      }

      // Red left margin line
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, 512);
      ctx.stroke();

      // Handwritten lab notes simulation
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText('EXP: ACID-BASE TITRATION', 70, 50);
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText('HCl + NaOH -> NaCl + H2O', 70, 74);
      ctx.fillText('V(HCl) = 25.0 mL, M = 0.100 M', 70, 98);
      ctx.fillText('Indicator: Phenolphthalein (3 drops)', 70, 122);
      ctx.fillText('Equivalence pH expected = 7.00', 70, 146);
      ctx.fillText('End-point pink color persistence: >30s', 70, 170);
      ctx.fillText('Trial 1: V(NaOH) = 24.95 mL', 70, 218);
      ctx.fillText('Trial 2: V(NaOH) = 25.05 mL', 70, 242);
      ctx.fillText('Mean V = 25.00 mL (Delta = 0.05)', 70, 266);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* ================= OPEN SPIRAL LAB NOTEBOOK ================= */}
      {/* Left Page Leaf */}
      <mesh receiveShadow castShadow position={[-0.09, 0.003, 0]}>
        <boxGeometry args={[0.16, 0.004, 0.22]} />
        <meshStandardMaterial
          map={pageTexture}
          roughness={0.75}
        />
      </mesh>

      {/* Right Page Leaf */}
      <mesh receiveShadow castShadow position={[0.09, 0.003, 0]}>
        <boxGeometry args={[0.16, 0.004, 0.22]} />
        <meshStandardMaterial
          map={pageTexture}
          roughness={0.75}
        />
      </mesh>

      {/* Center Wire Spiral Binding Rings */}
      {[-0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09].map((z, idx) => (
        <mesh key={idx} position={[0, 0.007, z]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.006, 0.0015, 8, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* ================= BLUE LABORATORY BALLPOINT PEN ================= */}
      <group position={[0.18, 0.005, 0.02]} rotation={[0, 0.2, Math.PI / 2]}>
        {/* Pen Barrel */}
        <mesh>
          <cylinderGeometry args={[0.004, 0.004, 0.14, 12]} />
          <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Pen Grip */}
        <mesh position={[0, -0.035, 0]}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.03, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Chrome Tip */}
        <mesh position={[0, -0.075, 0]}>
          <cylinderGeometry args={[0.0038, 0.001, 0.015, 12]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

