import React from 'react';
import { useGLTF } from '@react-three/drei';

interface RealStoolModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealStoolModel: React.FC<RealStoolModelProps> = ({
  position = [0.2, -0.4, 0.85],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/metal_stool_01/metal_stool_01_1k.gltf');

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    />
  );
};

useGLTF.preload('/models/metal_stool_01/metal_stool_01_1k.gltf');

