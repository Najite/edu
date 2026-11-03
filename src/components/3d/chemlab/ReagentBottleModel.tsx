import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ReagentBottleModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  amber?: boolean;
}

export const ReagentBottleModel: React.FC<ReagentBottleModelProps> = ({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  scale = 1.0,
  amber = true,
}) => {
  const modelPath = amber
    ? '/models/chemlab/reagent_bottle_amber.glb'
    : '/models/chemlab/reagent_bottle_clear.glb';
  const { scene } = useGLTF(modelPath);

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

useGLTF.preload('/models/chemlab/reagent_bottle_amber.glb');
useGLTF.preload('/models/chemlab/reagent_bottle_clear.glb');
