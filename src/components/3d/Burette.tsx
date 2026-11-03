import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BuretteProps {
  position?: [number, number, number];
  volumeMl: number; // 0 to 50
  valveOpen: boolean;
  onToggleValve: () => void;
}

export const Burette: React.FC<BuretteProps> = ({
  position = [0, 0.65, 0.18],
  volumeMl,
  valveOpen,
  onToggleValve,
}) => {
  const valveRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (valveRef.current) {
      const targetRotation = valveOpen ? Math.PI / 2 : 0;
      valveRef.current.rotation.y = THREE.MathUtils.damp(
        valveRef.current.rotation.y,
        targetRotation,
        8,
        delta
      );
    }
  });

  const maxTubeHeight = 0.52;
  const fillFraction = Math.max(0, Math.min(1, volumeMl / 50.0));
  const liquidHeight = maxTubeHeight * fillFraction;
  const liquidCenterY = -0.26 + liquidHeight / 2 + 0.12;

  return (
    <group position={position}>
      {/* Outer transparent glass tube with visible glass refraction */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.018, 0.018, maxTubeHeight, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transmission={0.88}
          opacity={0.5}
          transparent
          roughness={0.06}
          ior={1.52}
          reflectivity={0.8}
          thickness={0.02}
        />
      </mesh>

      {/* Graduation Volume Measurement Ticks (Bold White) */}
      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((mark) => {
        const yPos = 0.12 + 0.24 - (mark / 50.0) * maxTubeHeight;
        const isMajor = mark % 10 === 0;
        return (
          <group key={mark} position={[0, yPos, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.0181, isMajor ? 0.0195 : 0.0188, 24]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {/* Internal Liquid Column (NaOH Titrant - Clear sky blue) */}
      {fillFraction > 0.005 && (
        <mesh position={[0, liquidCenterY, 0]}>
          <cylinderGeometry args={[0.016, 0.016, Math.max(0.005, liquidHeight), 20]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.7}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Lower Glass Funnel transition to Stopcock */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.018, 0.008, 0.04, 16]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transmission={0.85}
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Stopcock housing / barrel */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.042, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Interactive Stopcock Valve Handle */}
      <group
        ref={valveRef}
        position={[0, -0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onToggleValve();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0, 0.024]}>
          <boxGeometry args={[0.01, 0.042, 0.016]} />
          <meshStandardMaterial
            color={hovered ? '#38bdf8' : valveOpen ? '#ef4444' : '#0284c7'}
            roughness={0.2}
          />
        </mesh>

        {hovered && (
          <mesh position={[0, 0, 0.024]}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.5} />
          </mesh>
        )}
      </group>

      {/* Bottom Fine Nozzle Dispenser Tip */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.007, 0.003, 0.06, 16]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transmission={0.85}
          transparent
          opacity={0.6}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};
