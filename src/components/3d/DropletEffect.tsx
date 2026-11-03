import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowRegime } from '../../types/lab';

interface DropletEffectProps {
  regime: FlowRegime;
  dropsPerSec?: number;
  hasHangingDrop?: boolean;
  color?: string;
  zPos?: number;
}

/**
 * Photorealistic Fluid Dynamics & Droplet Delivery Effect.
 * Implements PraxiLabs variable flow regimes:
 * 1. Stream: Continuous laminar fluid column from tip to flask with surface ripple.
 * 2. Dropwise: Gravity-accelerated discrete droplets (0.05 mL) with aerodynamic stretching.
 * 3. Micro-drop: Surface-tension suspended hanging bead at the nozzle tip.
 * 4. Closed: No fluid emission.
 */
export const DropletEffect: React.FC<DropletEffectProps> = ({
  regime,
  dropsPerSec = 1.5,
  hasHangingDrop = false,
  color = '#38bdf8',
  zPos = 0.18,
}) => {
  const streamRef = useRef<THREE.Mesh>(null);
  const streamRippleRef = useRef<THREE.Mesh>(null);
  const dropRef1 = useRef<THREE.Group>(null);
  const dropRef2 = useRef<THREE.Group>(null);
  const dropRippleRef = useRef<THREE.Mesh>(null);
  const hangingDropRef = useRef<THREE.Mesh>(null);

  // Delivery tip orifice (y = 0.178) to flask analyte liquid surface (y = 0.065)
  const topY = 0.178;
  const bottomY = 0.065;
  const totalDrop = topY - bottomY; // 0.113 m
  const streamCenterY = (topY + bottomY) / 2;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Continuous Laminar Stream Animation
    if (regime === 'stream') {
      if (streamRef.current) {
        // High-frequency subtle surface wave oscillation
        const wave = 1.0 + Math.sin(time * 35) * 0.06;
        streamRef.current.scale.set(wave, 1.0, wave);
      }
      if (streamRippleRef.current) {
        const rippleScale = 1.0 + Math.sin(time * 20) * 0.25;
        streamRippleRef.current.scale.set(rippleScale, rippleScale, 1.0);
      }
    }

    // 2. Dropwise Titration Animation (Discrete droplets)
    if (regime === 'dropwise') {
      const cycleSpeed = Math.max(0.6, dropsPerSec);

      // Droplet 1: Primary gravity fall (y = y0 - 0.5 * g * t^2)
      if (dropRef1.current) {
        const p1 = (time * cycleSpeed) % 1;
        const fall1 = p1 * p1 * totalDrop;
        dropRef1.current.position.y = topY - fall1;
        // Aerodynamic droplet elongation during fall
        dropRef1.current.scale.set(0.82, 1.0 + p1 * 1.1, 0.82);
        dropRef1.current.visible = p1 < 0.98;
      }

      // Droplet 2: Offset second droplet (for higher drops/sec regimes)
      if (dropRef2.current) {
        if (cycleSpeed > 1.6) {
          const p2 = (time * cycleSpeed + 0.5) % 1;
          const fall2 = p2 * p2 * totalDrop;
          dropRef2.current.position.y = topY - fall2;
          dropRef2.current.scale.set(0.82, 1.0 + p2 * 1.1, 0.82);
          dropRef2.current.visible = p2 < 0.98;
        } else {
          dropRef2.current.visible = false;
        }
      }

      // Surface impact ripple
      if (dropRippleRef.current) {
        const impactPhase = (time * cycleSpeed) % 1;
        if (impactPhase > 0.85) {
          const rP = (impactPhase - 0.85) / 0.15;
          dropRippleRef.current.visible = true;
          dropRippleRef.current.scale.set(1.0 + rP * 2.0, 1.0 + rP * 2.0, 1.0);
        } else {
          dropRippleRef.current.visible = false;
        }
      }
    }

    // 3. Hanging Micro-Drop Surface Tension Animation
    if (hangingDropRef.current) {
      if (regime === 'micro_drop' || hasHangingDrop) {
        hangingDropRef.current.visible = true;
        const breath = 1.0 + Math.sin(time * 4) * 0.05;
        hangingDropRef.current.scale.set(breath, breath * 1.15, breath);
      } else {
        hangingDropRef.current.visible = false;
      }
    }
  });

  return (
    <group position={[0, 0, zPos]}>
      {/* ================= 1. HANGING MICRO-DROP BEAD AT NOZZLE TIP ================= */}
      <mesh ref={hangingDropRef} position={[0, topY - 0.002, 0]} visible={false}>
        <sphereGeometry args={[0.0022, 16, 16]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.78}
          roughness={0.04}
          ior={1.333}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ================= 2. CONTINUOUS LAMINAR FLUID STREAM ================= */}
      {regime === 'stream' && (
        <group>
          {/* Main stream fluid cylinder */}
          <mesh ref={streamRef} position={[0, streamCenterY, 0]}>
            <cylinderGeometry args={[0.0016, 0.0013, totalDrop, 16]} />
            <meshPhysicalMaterial
              color={color}
              transmission={0.72}
              roughness={0.05}
              ior={1.333}
              clearcoat={1.0}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Inner core refractive highlight */}
          <mesh position={[0, streamCenterY, 0]}>
            <cylinderGeometry args={[0.0008, 0.0006, totalDrop, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>

          {/* Liquid surface impingement ripple ring */}
          <mesh
            ref={streamRippleRef}
            position={[0, bottomY + 0.001, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.002, 0.007, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* ================= 3. DROPWISE FLUID DROPLETS ================= */}
      {regime === 'dropwise' && (
        <group>
          {/* Droplet 1 */}
          <group ref={dropRef1} position={[0, topY, 0]}>
            <mesh>
              <sphereGeometry args={[0.0025, 16, 16]} />
              <meshPhysicalMaterial
                color={color}
                transmission={0.78}
                roughness={0.04}
                ior={1.333}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>

          {/* Droplet 2 */}
          <group ref={dropRef2} position={[0, topY, 0]}>
            <mesh>
              <sphereGeometry args={[0.0025, 16, 16]} />
              <meshPhysicalMaterial
                color={color}
                transmission={0.78}
                roughness={0.04}
                ior={1.333}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>

          {/* Liquid surface impact ripple */}
          <mesh
            ref={dropRippleRef}
            position={[0, bottomY + 0.001, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
          >
            <ringGeometry args={[0.0015, 0.006, 20]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};
