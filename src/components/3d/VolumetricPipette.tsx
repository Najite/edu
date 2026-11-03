import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { soundEngine } from '../../audio/SpatialSoundEngine';

export type PipetteKinematicState =
  | 'rack'
  | 'in_stock'
  | 'aspirating'
  | 'aligning'
  | 'above_flask'
  | 'draining'
  | 'finished';

interface VolumetricPipetteProps {
  position?: [number, number, number];
  pipetteState: PipetteKinematicState;
  aspiratedVolumeMl: number; // 0 to 26 mL (25.00 is calibrated line)
  bulbCompressed: boolean;
  isFlaskDocked?: boolean;
  flaskPos?: [number, number, number];
  stockPos?: [number, number, number];
  standPos?: [number, number, number];
  onPressValveA: () => void;
  onPressValveS: () => void;
  onPressValveE: () => void;
  onStateChange?: (state: PipetteKinematicState) => void;
}

/**
 * Photorealistic DIN ISO 648 Class AS 25.00 mL Volumetric Pipette
 * Features:
 * - Direct 3D Raycast Plane Dragging: Free-hand movement across benchtop.
 * - Spatial Snapping: Docks to Stock Beaker, Erlenmeyer Flask, or Pipette Stand.
 * - Interactive 3-Valve Rubber Bulb: Clickable Valves A, S, E directly in 3D scene.
 * - 45° DIN Drainage Angle when positioned touching flask inner wall.
 * - Authentic amber ceramic graduation ring & Class AS etched decal.
 * - Concave fluid meniscus tracking aspirated volume.
 */
export const VolumetricPipette: React.FC<VolumetricPipetteProps> = ({
  position = [-0.50, 0.025, 0.28],
  pipetteState,
  aspiratedVolumeMl,
  bulbCompressed,
  isFlaskDocked = false,
  flaskPos = isFlaskDocked ? [0.0, 0.021, 0.18] : [-0.18, 0.0, 0.30],
  stockPos = [-0.34, 0.0, 0.30],
  standPos = [-0.50, 0.025, 0.28],
  onPressValveA,
  onPressValveS,
  onPressValveE,
  onStateChange,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHoverTarget, setDragHoverTarget] = useState<'stock' | 'flask' | 'stand' | null>(null);

  const currentPosRef = useRef(new THREE.Vector3(...position));
  const currentRotRef = useRef(new THREE.Euler(0, 0, 0));

  // Raycasting plane at y = 0.22 (hand manipulation height)
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.22), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Compute resting target coordinate based on state
  const getDockCoordinates = (): { pos: THREE.Vector3; rot: THREE.Euler } => {
    switch (pipetteState) {
      case 'rack':
      case 'finished':
        return {
          pos: new THREE.Vector3(standPos[0], standPos[1], standPos[2]),
          rot: new THREE.Euler(0, 0, 0),
        };
      case 'in_stock':
      case 'aspirating':
      case 'aligning':
        return {
          pos: new THREE.Vector3(stockPos[0], stockPos[1] + 0.022, stockPos[2]),
          rot: new THREE.Euler(0, 0, 0),
        };
      case 'above_flask':
        return {
          pos: new THREE.Vector3(flaskPos[0], flaskPos[1] + 0.18, flaskPos[2]),
          rot: new THREE.Euler(0, 0, 0),
        };
      case 'draining':
        // 45° angle resting against inner flask neck rim (DIN ISO 648)
        return {
          pos: new THREE.Vector3(flaskPos[0] + 0.014, flaskPos[1] + 0.115, flaskPos[2]),
          rot: new THREE.Euler(0, 0, -0.45),
        };
    }
  };

  // 1. DIN ISO 648 Class AS 25.00 mL Borosilicate Glass Lathe Geometry
  const pipetteGlassGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0.0012, 0.0),
      new THREE.Vector2(0.0022, 0.0),
      new THREE.Vector2(0.0035, 0.06),
      new THREE.Vector2(0.0042, 0.14),
      new THREE.Vector2(0.009, 0.16),
      new THREE.Vector2(0.015, 0.18),
      new THREE.Vector2(0.016, 0.24),
      new THREE.Vector2(0.015, 0.30),
      new THREE.Vector2(0.008, 0.32),
      new THREE.Vector2(0.0042, 0.34),
      new THREE.Vector2(0.0042, 0.44),
      new THREE.Vector2(0.0052, 0.442),
      new THREE.Vector2(0.0032, 0.442),
      new THREE.Vector2(0.0030, 0.34),
      new THREE.Vector2(0.007, 0.32),
      new THREE.Vector2(0.0135, 0.30),
      new THREE.Vector2(0.0145, 0.24),
      new THREE.Vector2(0.0135, 0.18),
      new THREE.Vector2(0.007, 0.16),
      new THREE.Vector2(0.0030, 0.14),
      new THREE.Vector2(0.0020, 0.06),
      new THREE.Vector2(0.0008, 0.0),
    ];
    const geo = new THREE.LatheGeometry(points, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. Class AS Amber Decal Texture
  const calibrationTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 256);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 115, 512, 26);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('25 mL ± 0.03 mL Class AS', 256, 65);
      ctx.fillText('Ex + 15s  20°C  DIN ISO 648', 256, 95);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // 3. Fluid Column inside Pipette
  const fluidHeight = useMemo(() => {
    if (aspiratedVolumeMl <= 0) return 0;
    if (aspiratedVolumeMl <= 5) {
      return (aspiratedVolumeMl / 5) * 0.15;
    } else if (aspiratedVolumeMl <= 20) {
      return 0.15 + ((aspiratedVolumeMl - 5) / 15) * 0.15;
    } else {
      return 0.30 + ((aspiratedVolumeMl - 20) / 6) * 0.10;
    }
  }, [aspiratedVolumeMl]);

  // Frame update
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!isDragging) {
      const target = getDockCoordinates();
      groupRef.current.position.lerp(target.pos, delta * 7.0);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, target.rot.x, delta * 7.0);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, target.rot.y, delta * 7.0);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, target.rot.z, delta * 7.0);
    } else {
      groupRef.current.position.lerp(currentPosRef.current, delta * 15.0);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, currentRotRef.current.x, delta * 15.0);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, currentRotRef.current.y, delta * 15.0);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, currentRotRef.current.z, delta * 15.0);
    }
  });

  // Pointer drag events
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    const intersect = new THREE.Vector3();
    raycaster.setFromCamera(e.pointer, e.camera);
    raycaster.ray.intersectPlane(dragPlane, intersect);

    if (intersect) {
      currentPosRef.current.set(intersect.x, 0.16, intersect.z);

      // Check proximity to Stock Beaker, Flask, and Pipette Stand
      const distStock = new THREE.Vector2(intersect.x - stockPos[0], intersect.z - stockPos[2]).length();
      const distFlask = new THREE.Vector2(intersect.x - flaskPos[0], intersect.z - flaskPos[2]).length();
      const distStand = new THREE.Vector2(intersect.x - standPos[0], intersect.z - standPos[2]).length();

      if (distStock < 0.16) {
        setDragHoverTarget('stock');
        currentRotRef.current.set(0, 0, 0);
      } else if (distFlask < 0.18) {
        setDragHoverTarget('flask');
        currentRotRef.current.set(0, 0, -0.45); // Preview 45° tilt
      } else if (distStand < 0.14) {
        setDragHoverTarget('stand');
        currentRotRef.current.set(0, 0, 0);
      } else {
        setDragHoverTarget(null);
        currentRotRef.current.set(0, 0, 0);
      }
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
    document.body.style.cursor = 'auto';

    if (groupRef.current) {
      const pos = groupRef.current.position;
      const distStock = new THREE.Vector2(pos.x - stockPos[0], pos.z - stockPos[2]).length();
      const distFlask = new THREE.Vector2(pos.x - flaskPos[0], pos.z - flaskPos[2]).length();
      const distStand = new THREE.Vector2(pos.x - standPos[0], pos.z - standPos[2]).length();

      if (distStock < 0.16) {
        soundEngine.playGlassClink([stockPos[0], 0.08, stockPos[2]], 0.28);
        onStateChange?.('in_stock');
      } else if (distFlask < 0.18) {
        soundEngine.playGlassClink([flaskPos[0], 0.12, flaskPos[2]], 0.32);
        onStateChange?.(aspiratedVolumeMl > 0 ? 'draining' : 'above_flask');
      } else if (distStand < 0.14) {
        soundEngine.playGlassClink([standPos[0], 0.08, standPos[2]], 0.20);
        onStateChange?.('rack');
      }
    }
    setDragHoverTarget(null);
  };

  const handleValveClick = (valve: 'A' | 'S' | 'E', fn: () => void, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    soundEngine.playBulbValve(valve);
    fn();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[0.82, 0.82, 0.82]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => {
        document.body.style.cursor = isDragging ? 'grabbing' : 'grab';
      }}
      onPointerOut={() => {
        if (!isDragging) document.body.style.cursor = 'auto';
      }}
    >
      {/* Visual Hover Target Ring while Dragging */}
      {isDragging && dragHoverTarget && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.03, 0.038, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      )}

      {/* ================= BOROSILICATE GLASS PIPETTE BODY ================= */}
      <mesh geometry={pipetteGlassGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.98}
          roughness={0.02}
          ior={1.517}
          thickness={0.02}
          specularIntensity={1.0}
          clearcoat={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Amber Calibration Ring & Class AS Specification Etching (Height y = 0.380) */}
      <mesh position={[0, 0.380, 0]}>
        <cylinderGeometry args={[0.00425, 0.00425, 0.028, 32, 1, true]} />
        <meshBasicMaterial map={calibrationTexture} transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* ================= LIQUID COLUMN INSIDE PIPETTE ================= */}
      {fluidHeight > 0.01 && (
        <group>
          {fluidHeight <= 0.30 ? (
            <mesh position={[0, fluidHeight / 2, 0]}>
              <cylinderGeometry args={[fluidHeight > 0.16 ? 0.013 : 0.0028, 0.001, fluidHeight, 16]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transmission={0.92}
                roughness={0.05}
                ior={1.333}
                thickness={0.02}
              />
            </mesh>
          ) : (
            <>
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.014, 0.0015, 0.30, 24]} />
                <meshPhysicalMaterial
                  color="#e0f2fe"
                  transmission={0.92}
                  roughness={0.05}
                  ior={1.333}
                  thickness={0.02}
                />
              </mesh>
              <mesh position={[0, 0.30 + (fluidHeight - 0.30) / 2, 0]}>
                <cylinderGeometry args={[0.003, 0.003, fluidHeight - 0.30, 16]} />
                <meshPhysicalMaterial
                  color="#e0f2fe"
                  transmission={0.92}
                  roughness={0.05}
                  ior={1.333}
                  thickness={0.02}
                />
              </mesh>
            </>
          )}

          {/* Realistic Concave Meniscus at Fluid Top */}
          <mesh position={[0, fluidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, fluidHeight > 0.30 ? 0.003 : 0.0135, 24]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* ================= 3-VALVE SAFETY RUBBER PIPETTE FILLER BULB ================= */}
      <group position={[0, 0.44, 0]}>
        {/* Rubber collar fitting over glass stem */}
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.0068, 0.0062, 0.024, 20]} />
          <meshStandardMaterial color="#ea580c" roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Lower stem suction valve S button */}
        <group position={[0, 0.026, 0.007]} onClick={(e) => handleValveClick('S', onPressValveS, e)}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.0055, 0.0055, 0.004, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.5} />
          </mesh>
        </group>

        {/* Main Vulcanized Rubber Squeeze Bulb */}
        <mesh
          position={[0, 0.055, 0]}
          scale={[bulbCompressed ? 0.72 : 1.0, bulbCompressed ? 0.85 : 1.0, bulbCompressed ? 0.72 : 1.0]}
        >
          <sphereGeometry args={[0.022, 24, 24]} />
          <meshStandardMaterial color="#f97316" roughness={0.65} metalness={0.04} />
        </mesh>

        {/* Top air discharge valve A button */}
        <group position={[0, 0.082, 0]} onClick={(e) => handleValveClick('A', onPressValveA, e)}>
          <mesh>
            <cylinderGeometry args={[0.0055, 0.0055, 0.008, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.5} />
          </mesh>
        </group>

        {/* Side exhaust / drain valve E branch and button */}
        <group position={[0.016, 0.024, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <mesh position={[0.008, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 0.016, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
          <group position={[0.017, 0, 0]} onClick={(e) => handleValveClick('E', onPressValveE, e)}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.0055, 0.0055, 0.005, 16]} />
              <meshStandardMaterial color="#c2410c" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
