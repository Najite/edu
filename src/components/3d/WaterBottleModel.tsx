import React from 'react';
import { useGLTF } from '@react-three/drei';

interface WaterBottleModelProps {
  position?: [number, number, number];
  scale?: number;
}

export const WaterBottleModel: React.FC<WaterBottleModelProps> = ({
  position = [-0.15, 0.04, 0.28],
  scale = 0.85,
}) => {
  const { scene } = useGLTF('/models/water_bottle.glb');

  return (
    <primitive
      object={scene}
      position={position}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    />
  );
};

useGLTF.preload('/models/water_bottle.glb');

