import React from 'react';

interface HotplateStirrerProps {
  position?: [number, number, number];
}

export const HotplateStirrer: React.FC<HotplateStirrerProps> = ({ position = [-0.75, 0.04, 0.35] }) => {
  return (
    <group position={position}>
      {/* Heavy Die-Cast Aluminum Base Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.26, 0.07, 0.28]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Side Ventilation Grilles */}
      {[-0.131, 0.131].map((x, i) => (
        <group key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[0.18, 0.04]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
        </group>
      ))}

      {/* Ceramic Coated Top Heating Surface Plate */}
      <mesh castShadow receiveShadow position={[0.02, 0.042, -0.02]}>
        <cylinderGeometry args={[0.08, 0.08, 0.012, 32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Angled Front Control Faceplate */}
      <group position={[0, -0.005, 0.142]} rotation={[-0.25, 0, 0]}>
        <mesh>
          <planeGeometry args={[0.25, 0.06]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} /> {/* Blue front bezel */}
        </mesh>

        {/* Digital Speed & Temp Display */}
        <mesh position={[-0.05, 0.008, 0.002]}>
          <planeGeometry args={[0.07, 0.026]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Temperature & RPM Rotary Knobs */}
        <group position={[0.04, 0, 0.006]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.012, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
        <group position={[0.08, 0, 0.006]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.012, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Support rod mount bosshead at back right */}
      <mesh position={[0.1, 0.04, -0.11]}>
        <cylinderGeometry args={[0.01, 0.01, 0.03, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
    </group>
  );
};

