import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface StockBeakerProps {
  position?: [number, number, number];
  volumeMl?: number;
  onClick?: () => void;
  highlighted?: boolean;
}

export const StockBeaker: React.FC<StockBeakerProps> = ({
  position = [-0.42, 0.0, 0.32],
  volumeMl = 150,
  onClick,
  highlighted = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 250 mL Griffin Beaker Borosilicate Lathe Geometry
  const beakerGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      // Base center
      new THREE.Vector2(0, 0.002),
      new THREE.Vector2(0.040, 0.002),
      // Heel radius
      new THREE.Vector2(0.044, 0.006),
      // Cylindrical outer wall
      new THREE.Vector2(0.044, 0.108),
      // Flared rim & beaded lip
      new THREE.Vector2(0.046, 0.111),
      new THREE.Vector2(0.044, 0.112),
      // Inner wall (1.8mm borosilicate thickness)
      new THREE.Vector2(0.0422, 0.108),
      new THREE.Vector2(0.0422, 0.006),
      // Inner base floor
      new THREE.Vector2(0.038, 0.004),
      new THREE.Vector2(0, 0.004),
    ];

    const geo = new THREE.LatheGeometry(points, 48);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Liquid lathe geometry (150 mL in a 250 mL beaker)
  const liquidHeight = Math.min(0.095, Math.max(0.015, (volumeMl / 250) * 0.095));
  const liquidGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.0045),
      new THREE.Vector2(0.0418, 0.0045),
      new THREE.Vector2(0.0418, liquidHeight),
      new THREE.Vector2(0, liquidHeight),
    ];
    const geo = new THREE.LatheGeometry(points, 36);
    geo.computeVertexNormals();
    return geo;
  }, [liquidHeight]);

  // Ceramic label texture with graduations
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // White ceramic marking spot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.roundRect(140, 160, 230, 240, 12);
      ctx.fill();

      // Border line
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.roundRect(144, 164, 222, 232, 10);
      ctx.stroke();

      // Text header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PYREX®', 255, 205);

      ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
      ctx.fillStyle = '#b91c1c';
      ctx.fillText('0.100 M HCl', 255, 240);

      ctx.fillStyle = '#334155';
      ctx.font = '13px monospace';
      ctx.fillText('ANALYTE STOCK', 255, 268);
      ctx.fillText('Class A 250 mL', 255, 290);
      ctx.fillText('± 5% APPROX', 255, 310);

      // Graduation ticks on the left side
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 3;
      const ticks = [50, 100, 150, 200];
      ticks.forEach((vol) => {
        const y = 430 - (vol / 250) * 320;
        ctx.beginPath();
        ctx.moveTo(70, y);
        ctx.lineTo(110, y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${vol}`, 60, y + 6);
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    if (highlighted && groupRef.current) {
      const s = 1.0 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Borosilicate Glass Beaker Body */}
      <mesh geometry={beakerGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.98}
          roughness={0.03}
          ior={1.517}
          thickness={0.035}
          specularIntensity={1.0}
          specularColor="#ffffff"
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          attenuationColor="#f1f5f9"
          attenuationDistance={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceramic Label & Graduations Decal Cylinder */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.0442, 0.0442, 0.088, 36, 1, true, -Math.PI / 3, (2 * Math.PI) / 3]} />
        <meshBasicMaterial
          map={labelTexture}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Clear Aqueous Acid Solution (HCl) */}
      <mesh geometry={liquidGeometry}>
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.95}
          roughness={0.01}
          ior={1.333} // Water refractive index
          thickness={0.04}
          specularIntensity={0.8}
          attenuationColor="#bae6fd"
          attenuationDistance={0.5}
        />
      </mesh>

      {/* Meniscus Ring Highlight */}
      <mesh position={[0, liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.039, 0.0418, 36]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
