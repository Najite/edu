import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createLaptopSlideTexture } from '../../utils/labScreenTextures';

interface ModernLabLaptopProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ModernLabLaptop: React.FC<ModernLabLaptopProps> = ({
  position = [0.72, 0.0, 0.18],
  rotation = [0, -0.32, 0],
  scale = 1.0,
}) => {
  const slideTexture = useMemo(() => {
    const tex = createLaptopSlideTexture();
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* ================= LAPTOP BASE CHASSIS ================= */}
      {/* Main sleek dark charcoal aluminum lower case */}
      <mesh castShadow receiveShadow position={[0, 0.007, 0]}>
        <boxGeometry args={[0.36, 0.012, 0.25]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Recessed Keyboard Deck Area */}
      <mesh position={[0, 0.0135, -0.03]}>
        <planeGeometry args={[0.32, 0.13]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Chiclet Keypad Grid Representation */}
      {[-0.07, -0.045, -0.02, 0.005, 0.03].map((z, rowIdx) => (
        <mesh key={rowIdx} position={[0, 0.0145, z]}>
          <boxGeometry args={[0.31, 0.002, 0.018]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
      ))}

      {/* Modern Centered Touchpad */}
      <mesh position={[0, 0.0135, 0.075]}>
        <planeGeometry args={[0.11, 0.07]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Laptop Status LEDs & Logo */}
      <mesh position={[-0.14, 0.0135, 0.09]}>
        <circleGeometry args={[0.002, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* ================= ANGLED DISPLAY LID ================= */}
      {/* Screen opens tilted back around ~105 degrees (tilt angle -0.28 rad) */}
      <group position={[0, 0.012, -0.125]} rotation={[-0.28, 0, 0]}>
        {/* Lid Rear Shell (Anodized Slate Metal) */}
        <mesh castShadow position={[0, 0.115, -0.004]}>
          <boxGeometry args={[0.36, 0.24, 0.008]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* Thin Display Bezel */}
        <mesh position={[0, 0.115, 0.001]}>
          <planeGeometry args={[0.355, 0.235]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} />
        </mesh>

        {/* Web Camera Aperture */}
        <mesh position={[0, 0.228, 0.0015]}>
          <circleGeometry args={[0.002, 12]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* High-Definition 16:9 Display Screen with "DNA Replication" Slide */}
        <mesh position={[0, 0.115, 0.002]}>
          <planeGeometry args={[0.34, 0.215]} />
          <meshStandardMaterial
            map={slideTexture}
            emissive={new THREE.Color('#ffffff')}
            emissiveMap={slideTexture}
            emissiveIntensity={0.85}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
};

