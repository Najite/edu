import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface RealNotebookModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealNotebookModel: React.FC<RealNotebookModelProps> = ({
  position = [0.34, 0.002, 0.26],
  rotation = [0, 0.12, 0],
  scale = 0.95,
}) => {
  const { scene } = useGLTF('/models/binder_notebook/binder_notebook_1k.gltf');

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    />
  );
};

useGLTF.preload('/models/binder_notebook/binder_notebook_1k.gltf');
