import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DropletEffectProps {
  active: boolean;
  color?: string;
  speed?: number;
  zPos?: number;
}

export const DropletEffect: React.FC<DropletEffectProps> = ({
  active,
  color = '#38bdf8',
  zPos = 0.2,
}) => {
  const dropRef1 = useRef<THREE.Mesh>(null);
  const dropRef2 = useRef<THREE.Mesh>(null);

  const topY = 0.40;
  const bottomY = 0.19;
  const distance = topY - bottomY;

  useFrame((state) => {
    if (!active) return;
    const time = state.clock.getElapsedTime();

    if (dropRef1.current) {
      const progress1 = (time * 3.2) % 1;
      dropRef1.current.position.y = topY - progress1 * distance;
      dropRef1.current.scale.setScalar(0.7 + Math.sin(progress1 * Math.PI) * 0.3);
    }

    if (dropRef2.current) {
      const progress2 = (time * 3.2 + 0.5) % 1;
      dropRef2.current.position.y = topY - progress2 * distance;
      dropRef2.current.scale.setScalar(0.7 + Math.sin(progress2 * Math.PI) * 0.3);
    }
  });

  if (!active) return null;

  return (
    <group position={[0, 0, zPos]}>
      <mesh ref={dropRef1} position={[0, topY, 0]}>
        <sphereGeometry args={[0.004, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      <mesh ref={dropRef2} position={[0, topY, 0]}>
        <sphereGeometry args={[0.004, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};
