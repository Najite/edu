import React from 'react';

export const LabBench: React.FC = () => {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Heavy epoxy resin lab benchtop */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.08, 1.8]} />
        <meshStandardMaterial
          color="#1e2430"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Front wood trim / edging */}
      <mesh position={[0, -0.01, 0.91]}>
        <boxGeometry args={[3.22, 0.06, 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Ceramic tile backsplash / wall behind bench */}
      <mesh position={[0, 0.9, -0.9]}>
        <boxGeometry args={[3.4, 1.8, 0.04]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Lab Safety Warning Sign on Back Wall */}
      <group position={[0.9, 1.1, -0.87]}>
        <mesh>
          <planeGeometry args={[0.5, 0.3]} />
          <meshStandardMaterial color="#fef08a" roughness={0.5} />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.53, 0.33]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Steel support legs */}
      <mesh position={[-1.5, -0.5, -0.8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.92, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.5, -0.5, -0.8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.92, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-1.5, -0.5, 0.8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.92, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.5, -0.5, 0.8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.92, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

