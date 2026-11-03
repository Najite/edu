import React from 'react';
import { useGLTF } from '@react-three/drei';

interface RealDeskModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealDeskModel: React.FC<RealDeskModelProps> = ({
  position = [0, -0.4, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/metal_office_desk/metal_office_desk_1k.gltf');

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

useGLTF.preload('/models/metal_office_desk/metal_office_desk_1k.gltf');

