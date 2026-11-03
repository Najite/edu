import React from 'react';

interface PipetteStandProps {
  position?: [number, number, number];
}

export const PipetteStand: React.FC<PipetteStandProps> = ({
  position = [-0.50, 0.0, 0.28],
}) => {
  return (
    <group position={position}>
      {/* Heavy Steel / Acrylic Base Plate */}
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.10, 0.012, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Drip Tray Dish on Base */}
      <mesh position={[0, 0.013, 0]}>
        <cylinderGeometry args={[0.035, 0.032, 0.004, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Upright Support Rod (Chrome-plated steel) */}
      <mesh position={[0, 0.18, -0.038]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.35, 16]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* Lower Stem Guide Ring */}
      <group position={[0, 0.12, -0.01]}>
        <mesh position={[0, 0, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.035, 12]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.016, 0.003, 12, 24, Math.PI * 1.5]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* Upper Pipette Holding Clamp / Cradle */}
      <group position={[0, 0.28, -0.01]}>
        <mesh position={[0, 0, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.035, 12]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Semi-circular cradle with white silicone rubber grips */}
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.012, 0.0032, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

