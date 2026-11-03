import React from 'react';
import { useGLTF } from '@react-three/drei';

interface RealCabinetModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealCabinetModel: React.FC<RealCabinetModelProps> = ({
  position = [1.2, -0.4, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/drawer_cabinet/drawer_cabinet_1k.gltf');

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

useGLTF.preload('/models/drawer_cabinet/drawer_cabinet_1k.gltf');

