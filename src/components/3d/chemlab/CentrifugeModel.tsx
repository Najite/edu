import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

interface ModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export const CentrifugeModel: React.FC<ModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/chemlab/centrifuge.glb');
  const clone = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={clone}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      castShadow
      receiveShadow
    />
  );
};

useGLTF.preload('/models/chemlab/centrifuge.glb');

