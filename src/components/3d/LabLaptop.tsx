import React from 'react';

interface LabLaptopProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const LabLaptop: React.FC<LabLaptopProps> = ({
  position = [1.05, 0.02, 0.35],
  rotation = [0, -0.35, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Laptop Base (Keyboard Chassis) */}
      <mesh castShadow receiveShadow position={[0, 0.008, 0]}>
        <boxGeometry args={[0.32, 0.016, 0.22]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Keyboard recessed area */}
      <mesh position={[0, 0.017, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.26, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Trackpad */}
      <mesh position={[0, 0.017, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.2} />
      </mesh>

      {/* Laptop Screen Lid - Tilted Open */}
      <group position={[0, 0.016, -0.11]} rotation={[-0.32, 0, 0]}>
        {/* Screen Bezel Lid */}
        <mesh castShadow position={[0, 0.11, 0]}>
          <boxGeometry args={[0.32, 0.22, 0.01]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Screen Display Panel (Glowing "DNA Replication" presentation like reference photo) */}
        <mesh position={[0, 0.11, 0.006]}>
          <planeGeometry args={[0.29, 0.19]} />
          <meshStandardMaterial
            color="#052e16" // Dark green biology slide background
            emissive="#15803d"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>

        {/* Slide Title Bar */}
        <mesh position={[0, 0.18, 0.007]}>
          <planeGeometry args={[0.26, 0.025]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>

        {/* Slide Diagram Elements (Representing DNA Double Helix Graphic) */}
        <mesh position={[0.06, 0.1, 0.007]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#86efac" />
        </mesh>
      </group>
    </group>
  );
};
