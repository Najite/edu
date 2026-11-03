import React from 'react';

interface CentrifugeProps {
  position?: [number, number, number];
}

export const Centrifuge: React.FC<CentrifugeProps> = ({ position = [0.4, 0.12, 0.35] }) => {
  return (
    <group position={position}>
      {/* Main Centrifuge Body - Smooth White Plastic Housing */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.34, 0.22, 0.36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Top Lid with Circular Window / Latch */}
      <mesh castShadow position={[0, 0.115, 0.02]}>
        <cylinderGeometry args={[0.13, 0.13, 0.015, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Lid Center Glass Inspection Window */}
      <mesh position={[0, 0.124, 0.02]}>
        <cylinderGeometry args={[0.045, 0.045, 0.005, 24]} />
        <meshPhysicalMaterial color="#334155" roughness={0.1} transmission={0.7} transparent opacity={0.6} />
      </mesh>
      {/* Lid Latch Release Button */}
      <mesh position={[0, 0.118, 0.16]}>
        <boxGeometry args={[0.04, 0.01, 0.02]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>

      {/* Slanted Front Control Bezel */}
      <group position={[0, -0.01, 0.182]} rotation={[-0.2, 0, 0]}>
        {/* Bezel faceplate */}
        <mesh>
          <planeGeometry args={[0.32, 0.14]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>

        {/* Digital LCD Screen (Speed / Time display) */}
        <mesh position={[0, 0.03, 0.002]}>
          <planeGeometry args={[0.14, 0.045]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Rotary Knobs & Push Buttons (Matching the 4 blue circular dials in the photo) */}
        {[-0.09, -0.03, 0.03, 0.09].map((x, idx) => (
          <group key={idx} position={[x, -0.03, 0.006]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.3} />
            </mesh>
            {/* Center dot */}
            <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.005, 12]} />
              <meshStandardMaterial color="#e0f2fe" />
            </mesh>
          </group>
        ))}

        {/* Start / Stop Indicator LEDs */}
        <mesh position={[-0.12, 0.03, 0.002]}>
          <circleGeometry args={[0.005, 12]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <mesh position={[-0.12, 0.01, 0.002]}>
          <circleGeometry args={[0.005, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Rubber anti-vibration feet */}
      {[-0.14, 0.14].map((x) =>
        [-0.15, 0.15].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.115, z]}>
            <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
};

