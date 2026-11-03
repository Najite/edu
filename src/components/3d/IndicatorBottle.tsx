import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IndicatorBottleProps {
  position?: [number, number, number];
  onAddDrop: () => void;
  disabled?: boolean;
}

export const IndicatorBottle: React.FC<IndicatorBottleProps> = ({
  position = [0.45, 0.025, 0.15],
  onAddDrop,
  disabled = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimeRef = useRef(0);

  useFrame((_, delta) => {
    if (isAnimating && groupRef.current) {
      animTimeRef.current += delta * 6;
      groupRef.current.position.y = 0.025 + Math.sin(animTimeRef.current) * 0.04;
      if (animTimeRef.current >= Math.PI) {
        setIsAnimating(false);
        animTimeRef.current = 0;
        groupRef.current.position.y = 0.025;
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!disabled && !isAnimating) {
      setIsAnimating(true);
      onAddDrop();
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!disabled) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {hovered && !disabled && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.13, 16]} />
          <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.4} />
        </mesh>
      )}

      {/* Amber Glass Cylindrical Bottle Body */}
      <mesh castShadow position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.07, 20]} />
        <meshStandardMaterial
          color="#78350f"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* White Bottle Label */}
      <group position={[0, 0.035, 0.027]}>
        <mesh>
          <planeGeometry args={[0.032, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Screw Neck */}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.015, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Rubber Pipette Bulb Cap */}
      <mesh position={[0, 0.095, 0]}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.8} />
      </mesh>

      {/* Dropper Pipette Tip */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.003, 0.002, 0.06, 8]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};
