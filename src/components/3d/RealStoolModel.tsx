import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface RealStoolModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealStoolModel: React.FC<RealStoolModelProps> = ({
  position = [0.15, -0.7875, 0.74],
  rotation = [0, 0.3, 0],
  scale = 0.72,
}) => {
  const { scene } = useGLTF('/models/metal_stool_01/metal_stool_01_1k.gltf');

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

useGLTF.preload('/models/metal_stool_01/metal_stool_01_1k.gltf');
