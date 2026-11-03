import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

interface ReagentBottleModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  amber?: boolean;
}

export const ReagentBottleModel: React.FC<ReagentBottleModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  amber = true,
}) => {
  const modelPath = amber
    ? '/models/chemlab/reagent_bottle_amber.glb'
    : '/models/chemlab/reagent_bottle_clear.glb';
  const { scene } = useGLTF(modelPath);
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

useGLTF.preload('/models/chemlab/reagent_bottle_amber.glb');
useGLTF.preload('/models/chemlab/reagent_bottle_clear.glb');

