import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MicroscopeModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const MicroscopeModel: React.FC<MicroscopeModelProps> = ({
  position = [1.42, 0.0, 0.12],
  rotation = [0, -0.42, 0],
  scale = 0.68,
}) => {
  const { scene } = useGLTF('/models/microscope/industrial_microscope_1k.gltf');

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

useGLTF.preload('/models/microscope/industrial_microscope_1k.gltf');
