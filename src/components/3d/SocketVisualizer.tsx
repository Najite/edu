import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SocketVisualizerProps {
  position: [number, number, number];
  active: boolean;
  label?: string;
}

export const SocketVisualizer: React.FC<SocketVisualizerProps> = ({
  position,
  active,
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (active && ringRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.12;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  if (!active) return null;

  return (
    <group position={position}>
      {/* Animated target snap pulse ring on the surface */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.065, 0.08, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Target inner indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.064, 32]} />
        <meshBasicMaterial
          color="#0284c7"
          side={THREE.DoubleSide}
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Vertical subtle indicator beacon beam */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.16, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
};

