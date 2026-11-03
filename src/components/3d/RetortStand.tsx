import React from 'react';

interface RetortStandProps {
  position?: [number, number, number];
}

export const RetortStand: React.FC<RetortStandProps> = ({ position = [0, 0.0, 0.18] }) => {
  // Math for clamp arm connecting rod [-0.13, 0.65, -0.06] to burette [0, 0.65, 0]
  const armAngle = Math.atan2(0.06, 0.13); // ~0.432 rad

  return (
    <group position={position}>
      {/* Heavy cast-iron rectangular base plate */}
      <mesh castShadow receiveShadow position={[0, 0.012, 0]}>
        <boxGeometry args={[0.34, 0.024, 0.24]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.82}
          roughness={0.3}
        />
      </mesh>

      {/* Porcelain white tile plate on base (high contrast for titration end-point) */}
      <mesh receiveShadow position={[0, 0.025, 0.02]}>
        <boxGeometry args={[0.22, 0.004, 0.18]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.12}
          metalness={0.02}
        />
      </mesh>

      {/* Vertical chrome support rod */}
      <mesh castShadow position={[-0.13, 0.58, -0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 1.15, 16]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.96}
          roughness={0.08}
        />
      </mesh>

      {/* ================= LOWER BURETTE CLAMP (At y = 0.65) ================= */}
      <group position={[-0.13, 0.65, -0.06]}>
        {/* Bosshead clamp body attached to vertical rod */}
        <mesh castShadow>
          <boxGeometry args={[0.032, 0.04, 0.032]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.5} />
        </mesh>

        {/* Clamp thumb screw */}
        <mesh position={[-0.024, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.028, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
        <mesh position={[-0.038, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.008, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* Horizontal extension rod pointing directly towards burette at [0, 0.65, 0] */}
        <mesh
          position={[0.065, 0, 0.03]}
          rotation={[0, -armAngle, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.006, 0.006, 0.145, 12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.08} />
        </mesh>

        {/* Red rubber-coated clamp jaws wrapping around vertical glass burette at [0, 0.65, 0] */}
        <group position={[0.13, 0, 0.06]}>
          {/* Clamp center body */}
          <mesh position={[-0.018, 0, 0]}>
            <boxGeometry args={[0.02, 0.03, 0.015]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Upper Jaw Ring wrapping around the vertical burette tube */}
          <mesh position={[0, 0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.022, 0.004, 12, 24, Math.PI * 1.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} />
          </mesh>
          {/* Lower Jaw Ring */}
          <mesh position={[0, -0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.022, 0.004, 12, 24, Math.PI * 1.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ================= UPPER STABILIZING CLAMP (At y = 0.92) ================= */}
      <group position={[-0.13, 0.92, -0.06]}>
        <mesh castShadow>
          <boxGeometry args={[0.028, 0.035, 0.028]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh
          position={[0.065, 0, 0.03]}
          rotation={[0, -armAngle, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.005, 0.005, 0.145, 12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.08} />
        </mesh>
        <group position={[0.13, 0, 0.06]}>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.022, 0.0035, 12, 24, Math.PI * 1.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
