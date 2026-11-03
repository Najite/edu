import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { soundEngine } from '../../audio/SpatialSoundEngine';

interface WashBottleProps {
  position?: [number, number, number];
  targetFlaskPos?: [number, number, number];
  onSquirt?: () => void;
}

/**
 * 500 mL LDPE Deionized Water (DI H2O) Laboratory Wash Bottle
 * Features:
 * - Free-Hand 3D Raycast Plane Dragging: Pick up and navigate anywhere on bench.
 * - Kinematic Snap: Snaps into tilted rinsing posture when brought within 0.22 m of Erlenmeyer flask mouth.
 * - Squeeze Dynamics: Visual elastic compression of flexible LDPE body.
 * - Fine DI Water Jet: Procedural curved water jet with high-frequency acoustic spray synthesis.
 * - Complete Quantitative Wash: Rinses splashes down into the solution ensuring total transfer.
 */
export const WashBottle: React.FC<WashBottleProps> = ({
  position = [-0.34, 0.0, 0.14],
  targetFlaskPos = [-0.18, 0.15, 0.30],
  onSquirt,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const streamRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isNearFlask, setIsNearFlask] = useState(false);
  const [isSquirting, setIsSquirting] = useState(false);

  const currentPosRef = useRef(new THREE.Vector3(...position));
  const currentRotRef = useRef(new THREE.Euler(0, 0, 0));
  const squirtProgress = useRef(0);
  const hasTriggeredSquirt = useRef(false);

  // Dragging plane at hand manipulation height y = 0.12
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.12), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // LDPE Wash Bottle Body Geometry (cylindrical with rounded shoulders)
  const bottleGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.002),
      new THREE.Vector2(0.034, 0.002),
      new THREE.Vector2(0.038, 0.008),
      new THREE.Vector2(0.038, 0.140),
      new THREE.Vector2(0.036, 0.155),
      new THREE.Vector2(0.025, 0.170),
      new THREE.Vector2(0.015, 0.178),
      new THREE.Vector2(0.015, 0.195),
      new THREE.Vector2(0, 0.195),
    ];
    const geo = new THREE.LatheGeometry(points, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Swan-neck delivery tube curve
  const tubeCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.195, 0),
      new THREE.Vector3(0, 0.225, 0),
      new THREE.Vector3(0.025, 0.250, 0),
      new THREE.Vector3(0.060, 0.245, 0),
      new THREE.Vector3(0.080, 0.215, 0),
      new THREE.Vector3(0.088, 0.175, 0), // Nozzle tip pointing down
    ]);
  }, []);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(tubeCurve, 32, 0.0035, 12, false);
  }, [tubeCurve]);

  // Label Decal Texture
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(20, 20, 472, 216);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, 26, 460, 204);
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 32px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DEIONIZED WATER', 256, 80);
      ctx.font = 'bold 44px "Inter", sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.fillText('DI H₂O', 256, 138);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('FOR RINSING & FLASK CLEANING', 256, 180);
      ctx.fillText('500 mL LDPE', 256, 205);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Trigger Squirting action
  const triggerSquirt = () => {
    if (isSquirting) return;
    setIsSquirting(true);
    squirtProgress.current = 0;
    hasTriggeredSquirt.current = false;
    soundEngine.playWashBottleSquirt([targetFlaskPos[0], targetFlaskPos[1], targetFlaskPos[2]]);
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const homePos = new THREE.Vector3(...position);
    const rinseTarget = new THREE.Vector3(
      targetFlaskPos[0] - 0.085,
      targetFlaskPos[1] + 0.02,
      targetFlaskPos[2]
    );

    if (isSquirting) {
      squirtProgress.current += delta * 0.9;
      const p = Math.min(1.0, squirtProgress.current);

      if (p < 0.25) {
        // Glide into spray pose
        const ease = THREE.MathUtils.smoothstep(p / 0.25, 0, 1);
        groupRef.current.position.set(
          THREE.MathUtils.lerp(groupRef.current.position.x, rinseTarget.x, ease),
          THREE.MathUtils.lerp(groupRef.current.position.y, rinseTarget.y, ease),
          THREE.MathUtils.lerp(groupRef.current.position.z, rinseTarget.z, ease)
        );
        groupRef.current.rotation.z = THREE.MathUtils.lerp(0, -0.42, ease);
      } else if (p < 0.75) {
        // Squeeze & spray
        const t = (p - 0.25) / 0.50;
        groupRef.current.position.set(
          rinseTarget.x + Math.sin(t * Math.PI * 2) * 0.01,
          rinseTarget.y,
          rinseTarget.z + Math.cos(t * Math.PI * 2) * 0.01
        );
        groupRef.current.rotation.z = -0.42;

        const squeeze = 1.0 - Math.sin(t * Math.PI) * 0.16;
        if (bodyRef.current) {
          bodyRef.current.scale.set(squeeze, 1.0, squeeze);
        }

        if (streamRef.current) {
          streamRef.current.visible = true;
          streamRef.current.scale.set(1, 1, 1);
        }

        if (t > 0.4 && !hasTriggeredSquirt.current) {
          hasTriggeredSquirt.current = true;
          onSquirt?.();
        }
      } else {
        // Recover
        const ease = THREE.MathUtils.smoothstep((p - 0.75) / 0.25, 0, 1);
        if (streamRef.current) streamRef.current.visible = false;
        if (bodyRef.current) bodyRef.current.scale.set(1, 1, 1);

        if (!isDragging) {
          groupRef.current.position.lerp(homePos, ease);
          groupRef.current.rotation.z = THREE.MathUtils.lerp(-0.42, 0, ease);
        }
        if (p >= 1.0) {
          setIsSquirting(false);
        }
      }
    } else if (isDragging) {
      groupRef.current.position.lerp(currentPosRef.current, delta * 15.0);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, currentRotRef.current.z, delta * 12.0);
    } else {
      // Resting on bench at home position
      groupRef.current.position.lerp(homePos, delta * 8.0);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 8.0);
      if (bodyRef.current) bodyRef.current.scale.set(1, 1, 1);
      if (streamRef.current) streamRef.current.visible = false;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isNearFlask) {
      triggerSquirt();
    } else {
      setIsDragging(true);
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {}
      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    const intersect = new THREE.Vector3();
    raycaster.setFromCamera(e.pointer, e.camera);
    raycaster.ray.intersectPlane(dragPlane, intersect);

    if (intersect) {
      currentPosRef.current.set(intersect.x, 0.08, intersect.z);

      // Proximity to flask lip
      const distFlask = new THREE.Vector2(intersect.x - targetFlaskPos[0], intersect.z - targetFlaskPos[2]).length();
      if (distFlask < 0.20) {
        setIsNearFlask(true);
        currentRotRef.current.set(0, 0, -0.42); // Auto-tilt into mouth
      } else {
        setIsNearFlask(false);
        currentRotRef.current.set(0, 0, 0);
      }
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      document.body.style.cursor = 'auto';

      if (isNearFlask) {
        triggerSquirt();
      }
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
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
      {/* Squeeze trigger glow when hovered near flask */}
      {isNearFlask && (
        <mesh position={[0, 0.10, 0]}>
          <cylinderGeometry args={[0.044, 0.044, 0.12, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} wireframe />
        </mesh>
      )}

      {/* ================= TRANSLUCENT LDPE WASH BOTTLE BODY ================= */}
      <mesh ref={bodyRef} geometry={bottleGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#f8fafc"
          transmission={0.82}
          roughness={0.22}
          ior={1.42}
          thickness={0.015}
          specularIntensity={0.6}
          clearcoat={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Internal DI Water Cavity */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.13, 24]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.92}
          roughness={0.05}
          ior={1.333}
          thickness={0.02}
        />
      </mesh>

      {/* DI Water Label Decal */}
      <mesh position={[0, 0.072, 0]}>
        <cylinderGeometry args={[0.0384, 0.0384, 0.075, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial map={labelTexture} transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>

      {/* Blue Polypropylene Screw Cap */}
      <mesh position={[0, 0.185, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.020, 24]} />
        <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Polypropylene Swan-Neck Delivery Tube */}
      <mesh geometry={tubeGeometry} castShadow>
        <meshPhysicalMaterial
          color="#bae6fd"
          transmission={0.88}
          roughness={0.12}
          ior={1.49}
          thickness={0.008}
        />
      </mesh>

      {/* Fine DI Water Jet Spray */}
      <mesh
        ref={streamRef}
        position={[0.13, 0.12, 0]}
        rotation={[0, 0, -Math.PI / 3]}
        visible={false}
      >
        <cylinderGeometry args={[0.0012, 0.0022, 0.11, 12]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.90}
          roughness={0.05}
          ior={1.333}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
};
