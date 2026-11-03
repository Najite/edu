import React from 'react';
import { useGLTF } from '@react-three/drei';

interface MicroscopeModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const MicroscopeModel: React.FC<MicroscopeModelProps> = ({
  position = [-0.85, 0.04, 0.28],
  rotation = [0, 0.4, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/microscope/industrial_microscope_1k.gltf');

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

useGLTF.preload('/models/microscope/industrial_microscope_1k.gltf');

