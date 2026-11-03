import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { createLaptopSlideTexture } from '../../utils/labScreenTextures';

interface RealLaptopModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const RealLaptopModel: React.FC<RealLaptopModelProps> = ({
  position = [0.85, 0.0, 0.2],
  rotation = [0, -0.3, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/classic_laptop/classic_laptop_1k.gltf');
  const slideTexture = useMemo(() => createLaptopSlideTexture(), []);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (
          child.name === 'classic_laptop_screen' ||
          (child.material && (child.material as THREE.Material).name === 'classic_laptop_screen')
        ) {
          child.material = new THREE.MeshStandardMaterial({
            map: slideTexture,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: slideTexture,
            emissiveIntensity: 0.5,
            roughness: 0.2,
          });
        }
      }
    });
    return clone;
  }, [scene, slideTexture]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    />
  );
};

useGLTF.preload('/models/classic_laptop/classic_laptop_1k.gltf');
