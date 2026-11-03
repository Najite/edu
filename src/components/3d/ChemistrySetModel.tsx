import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ChemistrySetModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ChemistrySetModel: React.FC<ChemistrySetModelProps> = ({
  position = [1.82, 0.0, -0.05],
  rotation = [0, -0.22, 0],
  scale = 0.65,
}) => {
  const { scene } = useGLTF('/models/chemistry_set/chemistry_set_1k.gltf');

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

useGLTF.preload('/models/chemistry_set/chemistry_set_1k.gltf');
