import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createBioinformaticsScreenTexture } from '../../utils/labScreenTextures';

export const WallMonitors: React.FC = () => {
  const bioScreenTexture = useMemo(() => createBioinformaticsScreenTexture(), []);

  return (
    <group position={[0, 0, -1.9]}>
      {/* ================= LEFT WALL MOUNTED DISPLAY ================= */}
      <group position={[-1.7, 1.25, 0]}>
        {/* Bezel frame */}
        <mesh castShadow>
          <boxGeometry args={[0.78, 0.5, 0.03]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Screen with Glowing Bioinformatics Telemetry */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.74, 0.46]} />
          <meshStandardMaterial
            map={bioScreenTexture}
            emissive={new THREE.Color('#38bdf8')}
            emissiveMap={bioScreenTexture}
            emissiveIntensity={0.65}
            roughness={0.15}
          />
        </mesh>
        {/* Wall mount arm */}
        <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
      </group>

      {/* ================= CENTER-RIGHT DUAL STACKED BIOINFORMATICS DISPLAY ================= */}
      <group position={[0.35, 1.35, 0]}>
        {/* Upper Screen - DNA Helix bioinformatics */}
        <group position={[0, 0.28, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.5, 0.03]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[0.78, 0.46]} />
            <meshStandardMaterial
              map={bioScreenTexture}
              emissive={new THREE.Color('#38bdf8')}
              emissiveMap={bioScreenTexture}
              emissiveIntensity={0.7}
              roughness={0.15}
            />
          </mesh>
        </group>

        {/* Lower Screen - Molecular Analysis */}
        <group position={[0, -0.26, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.5, 0.03]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[0.78, 0.46]} />
            <meshStandardMaterial
              map={bioScreenTexture}
              emissive={new THREE.Color('#0284c7')}
              emissiveMap={bioScreenTexture}
              emissiveIntensity={0.65}
              roughness={0.15}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
