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
  const tubeColors = ['#bae6fd', '#fbcfe8', '#fef08a', '#bae6fd', '#bbf7d0', '#e9d5ff'];

  return (
    <group position={position} rotation={rotation}>
      {/* Acrylic Rack Base Plate */}
      <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
        <boxGeometry args={[0.26, 0.008, 0.09]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.8}
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Middle Support Tier */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.26, 0.006, 0.09]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.8}
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Top Tier with Test Tube Apertures */}
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[0.26, 0.008, 0.09]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.8}
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Rack End Support Walls */}
      {[-0.125, 0.125].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.008, 0.1, 0.09]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.8}
            transparent
            opacity={0.5}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* 6 Glass Test Tubes with Liquid Samples */}
      {[-0.09, -0.054, -0.018, 0.018, 0.054, 0.09].map((x, index) => (
        <group key={index} position={[x, 0.075, 0]}>
          {/* Glass tube cylinder */}
          <mesh>
            <cylinderGeometry args={[0.009, 0.009, 0.13, 16, 1, true]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.92}
              transparent
              opacity={0.35}
              roughness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Hemispherical rounded bottom */}
          <mesh position={[0, -0.065, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.009, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.92}
              transparent
              opacity={0.35}
              roughness={0.05}
            />
          </mesh>

          {/* Liquid sample inside */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.06, 12]} />
            <meshStandardMaterial
              color={tubeColors[index % tubeColors.length]}
              roughness={0.15}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

