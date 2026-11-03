import React, { useMemo } from 'react';
import * as THREE from 'three';

interface WasteBeakerProps {
  position?: [number, number, number];
  onClick?: () => void;
}

export const WasteBeaker: React.FC<WasteBeakerProps> = ({
  position = [0.14, 0.0, 0.22],
  onClick,
}) => {
  // 100 mL Griffin Beaker Geometry (height ~ 7.5cm)
  const beakerGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.002),
      new THREE.Vector2(0.026, 0.002),
      new THREE.Vector2(0.029, 0.005),
      new THREE.Vector2(0.029, 0.072),
      new THREE.Vector2(0.031, 0.075),
      new THREE.Vector2(0.029, 0.076),
      new THREE.Vector2(0.0275, 0.072),
      new THREE.Vector2(0.0275, 0.005),
      new THREE.Vector2(0.024, 0.003),
      new THREE.Vector2(0, 0.003),
    ];
    const geo = new THREE.LatheGeometry(points, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Ceramic Decal
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fillRect(10, 10, 236, 108);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 14, 228, 100);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('WASTE', 128, 50);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('BURETTE TIP PURGE', 128, 76);
      ctx.fillText('100 mL Pyrex', 128, 96);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group position={position} onClick={onClick}>
      {/* Borosilicate Glass Body */}
      <mesh geometry={beakerGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.97}
          roughness={0.03}
          ior={1.517}
          thickness={0.025}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Red Hazard / Waste Decal */}
      <mesh position={[0, 0.038, 0]}>
        <cylinderGeometry args={[0.0292, 0.0292, 0.035, 24, 1, true, -Math.PI / 3, (2 * Math.PI) / 3]} />
        <meshBasicMaterial map={labelTexture} transparent opacity={0.92} side={THREE.DoubleSide} />
      </mesh>

      {/* Residual Waste Fluid Floor */}
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.027, 0.027, 0.010, 20]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.9}
          roughness={0.05}
          ior={1.333}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
};

