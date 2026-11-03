import React from 'react';
import { GlovesBox } from './GlovesBox';

export const LabAccessories: React.FC = () => {
  return (
    <group>
      {/* ================= GLOVE BOXES (Matching "X3200 Industrial Nitrile Gloves" in photo) ================= */}
      {/* Box on lower shelf */}
      <GlovesBox position={[0.2, 0.405, -0.22]} rotation={[0, -0.05, 0]} scale={0.9} />

      {/* Second glove box on right side of bench */}
      <GlovesBox position={[1.45, 0.04, 0.22]} rotation={[0, 0.15, 0]} scale={0.9} />

      {/* ================= ORANGE PIPETTE TIP RACK (Shelf 1) ================= */}
      <group position={[0.55, 0.395, -0.22]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.13, 0.05, 0.09]} />
          <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.05} />
        </mesh>
        {/* Transparent clear lid */}
        <mesh position={[0, 0.032, 0]}>
          <boxGeometry args={[0.132, 0.015, 0.092]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} transparent opacity={0.4} roughness={0.1} />
        </mesh>
      </group>

      {/* Second tip rack on right shelf */}
      <group position={[1.2, 0.395, -0.22]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.13, 0.05, 0.09]} />
          <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.05} />
        </mesh>
      </group>

      {/* ================= CRUCIBLE TONGS (Benchtop next to hotplate) ================= */}
      <group position={[-0.95, 0.005, 0.35]} rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0, -0.012]}>
          <boxGeometry args={[0.22, 0.004, 0.008]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0, 0.012]} rotation={[0, 0.08, 0]}>
          <boxGeometry args={[0.22, 0.004, 0.008]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[-0.11, 0, -0.018]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.014, 0.003, 8, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} />
        </mesh>
        <mesh position={[-0.11, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.014, 0.003, 8, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} />
        </mesh>
      </group>

      {/* ================= SMARTPHONE (Beside Centrifuge) ================= */}
      <group position={[-0.32, 0.004, 0.36]} rotation={[0, 0.12, 0]}>
        <mesh position={[0, 0.003, 0]}>
          <boxGeometry args={[0.075, 0.007, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.8} />
        </mesh>
        {/* Screen glass */}
        <mesh position={[0, 0.007, 0]}>
          <planeGeometry args={[0.068, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.05} metalness={0.5} />
        </mesh>
      </group>

      {/* ================= BLUE ERGONOMIC LAB STOOL (LEFT) ================= */}
      <group position={[-1.75, -0.7875, 0.85]}>
        {/* Round padded seat cushion */}
        <mesh castShadow position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
          <meshStandardMaterial color="#2563eb" roughness={0.45} />
        </mesh>
        {/* Center pneumatic gas lift cylinder */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.44, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Chrome base foot ring */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.01, 8, 24]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* 5-Star Caster Base Legs */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0.14, 0.04, 0]}>
                <boxGeometry args={[0.26, 0.03, 0.04]} />
                <meshStandardMaterial color="#1e293b" roughness={0.5} />
              </mesh>
              {/* Caster Wheel */}
              <mesh position={[0.25, 0.02, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ================= SHELF GLASSWARE: FLASKS & BLUE FUNNEL ================= */}
      {/* Volumetric flask with blue funnel on top shelf (left) */}
      <group position={[-1.15, 0.77, -0.26]}>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.015, 0.06, 0.14, 24]} />
          <meshPhysicalMaterial color="#e0f2fe" transmission={0.9} transparent opacity={0.4} roughness={0.05} />
        </mesh>
        {/* Blue Powder Funnel in mouth */}
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.045, 0.012, 0.07, 20]} />
          <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Second Erlenmeyer Flask on top shelf */}
      <group position={[-0.95, 0.77, -0.26]}>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.015, 0.06, 0.14, 24]} />
          <meshPhysicalMaterial color="#e0f2fe" transmission={0.9} transparent opacity={0.4} roughness={0.05} />
        </mesh>
      </group>
    </group>
  );
};
