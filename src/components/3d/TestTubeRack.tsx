import React from 'react';
import * as THREE from 'three';

interface TestTubeRackProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const TestTubeRack: React.FC<TestTubeRackProps> = ({
  position = [0.15, 0.45, -0.1],
  rotation = [0, 0, 0],
}) => {
  // Realistic laboratory solutions (Copper sulfate, Iron(III) chloride, Potassium permanganate, Distilled H2O)
  const reagents = [
    { color: '#0284c7', label: '0.1M CuSO4', fill: 0.72 },
    { color: '#b45309', label: '0.1M FeCl3', fill: 0.65 },
    { color: '#7e22ce', label: '0.05M KMnO4', fill: 0.58 },
    { color: '#e0f2fe', label: 'DI Water', fill: 0.8 },
    { color: '#059669', label: '0.1M NiSO4', fill: 0.62 },
    { color: '#e0f2fe', label: '0.1M HCl', fill: 0.7 },
  ];

  return (
    <group position={position} rotation={rotation}>
      {/* ================= LABORATORY POLYPROPYLENE MOLDED RACK ================= */}
      {/* Heavy base tray with stabilizing lip */}
      <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
        <boxGeometry args={[0.26, 0.008, 0.08]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.08} />
      </mesh>

      {/* Middle Alignment Plate with circular holes */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.26, 0.006, 0.08]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.35} metalness={0.08} />
      </mesh>

      {/* Top Retention Deck */}
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[0.26, 0.008, 0.08]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.08} />
      </mesh>

      {/* End Support Upright Walls with ergonomic finger carry grips */}
      {[-0.125, 0.125].map((x, i) => (
        <group key={`end-${i}`} position={[x, 0.05, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.008, 0.10, 0.08]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.08} />
          </mesh>
          {/* Ergonomic handle cutout slot */}
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.01, 0.018, 0.038]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Center stabilizing vertical column */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.09, 8]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
      </mesh>

      {/* ================= 6 BOROSILICATE GLASS TEST TUBES (16 x 150 mm) ================= */}
      {reagents.map((reagent, idx) => {
        const xPos = -0.095 + idx * 0.038;
        const tubeHeight = 0.13;
        const liquidH = tubeHeight * reagent.fill;

        return (
          <group key={`tube-${idx}`} position={[xPos, 0.07, 0]}>
            {/* Outer Glass Cylinder */}
            <mesh castShadow>
              <cylinderGeometry args={[0.0085, 0.0085, tubeHeight, 24, 1, true]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.98}
                roughness={0.03}
                ior={1.517}
                thickness={0.02}
                clearcoat={1.0}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Test Tube Hemispherical Glass Bottom */}
            <mesh position={[0, -tubeHeight / 2, 0]}>
              <sphereGeometry args={[0.0085, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.98}
                roughness={0.03}
                ior={1.517}
                thickness={0.02}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Flared Fire-Polished Glass Rim at Top */}
            <mesh position={[0, tubeHeight / 2, 0]}>
              <torusGeometry args={[0.0085, 0.0012, 8, 24]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.98} roughness={0.03} ior={1.517} />
            </mesh>

            {/* White Ceramic Frosted Writing Area */}
            <mesh position={[0, 0.02, 0.0088]}>
              <planeGeometry args={[0.012, 0.026]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>

            {/* Chemical Liquid Inside */}
            <mesh position={[0, -tubeHeight / 2 + liquidH / 2, 0]}>
              <cylinderGeometry args={[0.0075, 0.0075, liquidH, 20]} />
              <meshPhysicalMaterial
                color={reagent.color}
                transmission={0.68}
                roughness={0.06}
                ior={1.333}
                transparent
                opacity={0.88}
              />
            </mesh>

            {/* Meniscus surface */}
            <mesh position={[0, -tubeHeight / 2 + liquidH, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.0075, 20]} />
              <meshPhysicalMaterial
                color={reagent.color}
                transmission={0.5}
                roughness={0.04}
                transparent
                opacity={0.92}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
