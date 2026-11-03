import React from 'react';
import { useGLTF } from '@react-three/drei';

interface LabRoomModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const LabRoomModel: React.FC<LabRoomModelProps> = ({
  position = [0, -0.7875, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
}) => {
  const { scene } = useGLTF('/models/lab_room.glb');

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      receiveShadow
    />
  );
};

useGLTF.preload('/models/lab_room.glb');

