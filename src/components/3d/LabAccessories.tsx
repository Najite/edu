import React from 'react';
import { GlovesBox } from './GlovesBox';

export const LabAccessories: React.FC = () => {
  return (
    <group>
      {/* ================= GLOVE BOXES (Industrial Nitrile Cleanroom Gloves) ================= */}
      {/* Box on lower shelf */}
      <GlovesBox position={[0.2, 0.405, -0.22]} rotation={[0, -0.05, 0]} scale={0.9} />

      {/* Second glove box on right side of bench */}
      <GlovesBox position={[1.45, 0.04, 0.22]} rotation={[0, 0.15, 0]} scale={0.9} />

      {/* ================= MICROPIPETTE TIP RACKS (Shelf 1) ================= */}
      <group position={[0.55, 0.395, -0.22]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.13, 0.048, 0.09]} />
          <meshStandardMaterial color="#c2410c" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Transparent clear polycarbonate lid */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.132, 0.014, 0.092]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.94}
            roughness={0.08}
            ior={1.52}
            thickness={0.015}
          />
        </mesh>
      </group>

      {/* Second tip rack on shelf */}
      <group position={[1.2, 0.395, -0.22]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.13, 0.048, 0.09]} />
          <meshStandardMaterial color="#0369a1" roughness={0.35} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.132, 0.014, 0.092]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.94}
            roughness={0.08}
            ior={1.52}
            thickness={0.015}
          />
        </mesh>
      </group>

      {/* ================= STAINLESS STEEL CRUCIBLE TONGS ================= */}
      <group position={[-0.98, 0.005, 0.35]} rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[0.20, 0.004, 0.006]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[0, 0.06, 0]}>
          <boxGeometry args={[0.20, 0.004, 0.006]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
        </mesh>
        {/* Finger finger loops */}
        <mesh position={[-0.10, 0, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.012, 0.0024, 8, 20]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
        </mesh>
        <mesh position={[-0.10, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.012, 0.0024, 8, 20]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
        </mesh>
      </group>

      {/* ================= LABORATORY POLYSTYRENE WEIGHING BOATS ================= */}
      <group position={[-0.82, 0.008, 0.28]} rotation={[0, -0.2, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.038, 0.028, 0.015, 4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.05} />
        </mesh>
      </group>
    </group>
  );
};
