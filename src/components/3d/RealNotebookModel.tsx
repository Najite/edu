import React from 'react';
import { useGLTF } from '@react-three/drei';

interface RealNotebookModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealNotebookModel: React.FC<RealNotebookModelProps> = ({
  position = [0.35, 0.38, 0.28],
  rotation = [0, 0.2, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/binder_notebook/binder_notebook_1k.gltf');

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

useGLTF.preload('/models/binder_notebook/binder_notebook_1k.gltf');

