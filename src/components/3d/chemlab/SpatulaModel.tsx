import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export const SpatulaModel: React.FC<ModelProps> = ({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/chemlab/spatula.glb');

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive
      object={clone}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
    />
  );
};

useGLTF.preload('/models/chemlab/spatula.glb');
