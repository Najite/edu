import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TitrantBeakerProps {
  position?: [number, number, number];
  volumeMl?: number;
  onClick?: () => void;
  highlighted?: boolean;
}

/**
 * 250 mL Pyrex Griffin Beaker containing 0.100 M NaOH Standardized Titrant Solution.
 */
export const TitrantBeaker: React.FC<TitrantBeakerProps> = ({
  position = [0.28, 0.0, 0.14],
  volumeMl = 200,
  onClick,
  highlighted = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 250 mL Griffin Beaker Borosilicate Lathe Geometry
  const beakerGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.002),
      new THREE.Vector2(0.040, 0.002),
      new THREE.Vector2(0.044, 0.006),
      new THREE.Vector2(0.044, 0.108),
      new THREE.Vector2(0.046, 0.111),
      new THREE.Vector2(0.044, 0.112),
      new THREE.Vector2(0.0422, 0.108),
      new THREE.Vector2(0.0422, 0.006),
      new THREE.Vector2(0.038, 0.004),
      new THREE.Vector2(0, 0.004),
    ];
    const geo = new THREE.LatheGeometry(points, 48);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Liquid lathe geometry
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
      ctx.fillStyle = '#0284c7';
      ctx.fillText('0.100 M NaOH', 255, 240);

      ctx.fillStyle = '#334155';
      ctx.font = '13px monospace';
      ctx.fillText('TITRANT STOCK', 255, 268);
      ctx.fillText('Class A 250 mL', 255, 290);
      ctx.fillText('± 5% APPROX', 255, 310);

      // Graduation ticks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 3;
      const ticks = [50, 100, 150, 200];
      ticks.forEach((vol) => {
        const y = 430 - ((vol - 50) / 150) * 230;
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(85, y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${vol}`, 95, y + 6);
      });
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (highlighted) {
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, position[1] + 0.008, 6, delta);
    } else {
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, position[1], 8, delta);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Highlight ring under base */}
      {highlighted && (
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.045, 0.052, 32]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Double-walled Borosilicate Griffin Beaker Body */}
      <mesh geometry={beakerGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.99}
          roughness={0.02}
          ior={1.517}
          thickness={0.03}
          specularIntensity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Spout Pouring Lip */}
      <mesh position={[0, 0.111, 0.044]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.006, 0.008, 12, 1, true, 0, Math.PI]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.98}
          roughness={0.02}
          ior={1.517}
        />
      </mesh>

      {/* White Ceramic PYREX Marking Spot & Scale Decal */}
      <mesh position={[0, 0.054, 0]}>
        <cylinderGeometry args={[0.0443, 0.0443, 0.088, 36, 1, true, -Math.PI / 3, (2 * Math.PI) / 3]} />
        <meshBasicMaterial map={labelTexture} transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>

      {/* 0.100 M NaOH Titrant Stock Solution */}
      {volumeMl > 0 && (
        <group>
          <mesh geometry={liquidGeometry}>
            <meshPhysicalMaterial
              color="#38bdf8"
              transmission={0.82}
              roughness={0.05}
              ior={1.333}
              thickness={0.03}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Meniscus curve */}
          <mesh position={[0, liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.0418, 32]} />
            <meshPhysicalMaterial
              color="#7dd3fc"
              transmission={0.7}
              roughness={0.04}
              ior={1.333}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

