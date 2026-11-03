import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SocketVisualizerProps {
  position: [number, number, number];
  active: boolean;
  label?: string;
  onClick?: () => void;
}

export const SocketVisualizer: React.FC<SocketVisualizerProps> = ({
  position,
  active,
  onClick,
}) => {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (active && haloRef.current) {
      const pulse = 0.45 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  if (!active) return null;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Precision etched alignment ring on the porcelain tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.068, 0.070, 48]} />
        <meshBasicMaterial
          color="#2563eb"
          side={THREE.DoubleSide}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Crosshair alignment tick marks */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.074, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.010, 0.0018]} />
            <meshBasicMaterial color="#2563eb" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Gentle soft ambient placement target glow on the tile */}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0008, 0]}>
        <circleGeometry args={[0.067, 36]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
};
