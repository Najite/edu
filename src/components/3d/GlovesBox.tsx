import React, { useMemo } from 'react';
import { createGlovesBoxTexture } from '../../utils/labScreenTextures';

interface GlovesBoxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const GlovesBox: React.FC<GlovesBoxProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const boxTexture = useMemo(() => createGlovesBoxTexture(), []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Box Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.08, 0.12]} />
        <meshStandardMaterial
          color="#1e3a8a"
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>
      {/* Front Label Decal with "X3200 Industrial Nitrile Gloves" */}
      <mesh position={[0, 0, 0.061]}>
        <planeGeometry args={[0.21, 0.075]} />
        <meshStandardMaterial
          map={boxTexture}
          roughness={0.4}
        />
      </mesh>
      {/* Top Dispenser Decal */}
      <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.21, 0.11]} />
        <meshStandardMaterial
          map={boxTexture}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};
