import React from 'react';
import { useGLTF } from '@react-three/drei';

interface ChemistrySetModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ChemistrySetModel: React.FC<ChemistrySetModelProps> = ({
  position = [-0.65, 0.04, 0.28],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/chemistry_set/chemistry_set_1k.gltf');

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

useGLTF.preload('/models/chemistry_set/chemistry_set_1k.gltf');

