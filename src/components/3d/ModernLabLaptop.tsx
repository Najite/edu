import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createLaptopSlideTexture } from '../../utils/labScreenTextures';

interface ModernLabLaptopProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ModernLabLaptop: React.FC<ModernLabLaptopProps> = ({
  position = [0.84, 0.0, 0.20],
  rotation = [0, -0.32, 0],
  scale = 0.92,
}) => {
  const slideTexture = useMemo(() => createLaptopSlideTexture(), []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* ================= LAPTOP BASE CHASSIS ================= */}
      {/* Sleek space-gray CNC aluminum bottom unibody case */}
      <mesh castShadow receiveShadow position={[0, 0.006, 0]}>
        <boxGeometry args={[0.34, 0.010, 0.23]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* Rubber feet underneath */}
      {[
        [-0.14, 0.0005, -0.09],
        [0.14, 0.0005, -0.09],
        [-0.14, 0.0005, 0.09],
        [0.14, 0.0005, 0.09],
      ].map(([x, y, z], idx) => (
        <mesh key={`foot-${idx}`} position={[x, y, z]}>
          <cylinderGeometry args={[0.008, 0.008, 0.002, 12]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      ))}

      {/* Recessed Keyboard Well Deck */}
      <mesh position={[0, 0.0112, -0.025]}>
        <planeGeometry args={[0.30, 0.125]} />
        <meshStandardMaterial color="#0f172a" roughness={0.65} />
      </mesh>

      {/* Individual Backlit Chiclet Key Rows */}
      {[-0.068, -0.046, -0.024, -0.002, 0.020].map((z, rowIdx) => (
        <group key={`row-${rowIdx}`} position={[0, 0.0125, z]}>
          <mesh>
            <boxGeometry args={[0.29, 0.002, 0.017]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Glass Precision Trackpad */}
      <mesh position={[0, 0.0114, 0.068]}>
        <planeGeometry args={[0.11, 0.068]} />
        <meshStandardMaterial color="#334155" roughness={0.15} metalness={0.6} />
      </mesh>

      {/* Trackpad subtle chamfer border */}
      <mesh position={[0, 0.0113, 0.068]}>
        <planeGeometry args={[0.114, 0.072]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* ================= DISPLAY LID (Angled back at 112 deg) ================= */}
      <group position={[0, 0.011, -0.113]} rotation={[-1.22, 0, 0]}>
        {/* Aluminum Outer Display Shell */}
        <mesh castShadow position={[0, 0.115, -0.003]}>
          <boxGeometry args={[0.34, 0.23, 0.006]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Display Glass Front Bezel */}
        <mesh position={[0, 0.115, 0.0005]}>
          <planeGeometry args={[0.334, 0.224]} />
          <meshStandardMaterial color="#020617" roughness={0.1} />
        </mesh>

        {/* Glowing ChemLab Pro Widescreen IPS Display */}
        <mesh position={[0, 0.115, 0.0012]}>
          <planeGeometry args={[0.32, 0.20]} />
          <meshStandardMaterial
            map={slideTexture}
            emissive={new THREE.Color('#38bdf8')}
            emissiveMap={slideTexture}
            emissiveIntensity={0.65}
            roughness={0.12}
          />
        </mesh>

        {/* WebCam lens dot & green activity LED */}
        <mesh position={[0, 0.222, 0.001]}>
          <circleGeometry args={[0.0018, 12]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.006, 0.222, 0.001]}>
          <circleGeometry args={[0.0008, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>
    </group>
  );
};
