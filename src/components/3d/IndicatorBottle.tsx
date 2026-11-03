import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { createReagentLabelTexture } from '../../utils/labTextures';
import { soundEngine } from '../../audio/SpatialSoundEngine';

interface IndicatorBottleProps {
  position?: [number, number, number];
  targetFlaskPos?: [number, number, number];
  onAddDrop: () => void;
  disabled?: boolean;
}

/**
 * 60 mL Amber Glass Indicator Dropper Bottle with Removable Glass Dropper
 * Features:
 * - Direct 3D Raycast Dragging: Lift dropper pipette out of amber bottle and carry over flask.
 * - Squeeze-to-Dispense: Interactive rubber bulb compression dispensing single droplets.
 * - Spatial Acoustic Plop: Procedural fluid plop at flask position upon droplet impact.
 * - Auto-Seat: Re-seats into bottle mouth upon release.
 */
export const IndicatorBottle: React.FC<IndicatorBottleProps> = ({
  position = [0.22, 0.0, 0.26],
  targetFlaskPos = [-0.18, 0.18, 0.30],
  onAddDrop,
  disabled = false,
}) => {
  const bottleGroupRef = useRef<THREE.Group>(null);
  const dropperGroupRef = useRef<THREE.Group>(null);
  const bulbRef = useRef<THREE.Mesh>(null);
  const fallingDropRef = useRef<THREE.Mesh>(null);

  const [isDraggingDropper, setIsDraggingDropper] = useState(false);
  const [isAboveFlask, setIsAboveFlask] = useState(false);
  const [isDispensing, setIsDispensing] = useState(false);

  const currentDropperPos = useRef(new THREE.Vector3(...position));
  const animProgress = useRef(0);
  const dropTriggered = useRef(false);

  const labelTexture = useMemo(() => createReagentLabelTexture(), []);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.16), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Amber bottle Lathe cross-section
  const bottleGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.002),
      new THREE.Vector2(0.021, 0.002),
      new THREE.Vector2(0.025, 0.006),
      new THREE.Vector2(0.026, 0.015),
      new THREE.Vector2(0.026, 0.060),
      new THREE.Vector2(0.024, 0.070),
      new THREE.Vector2(0.018, 0.076),
      new THREE.Vector2(0.0135, 0.080),
      new THREE.Vector2(0.0135, 0.092),
      new THREE.Vector2(0.010, 0.092),
      new THREE.Vector2(0.010, 0.080),
      new THREE.Vector2(0.024, 0.058),
      new THREE.Vector2(0.024, 0.015),
      new THREE.Vector2(0.020, 0.005),
      new THREE.Vector2(0, 0.005),
    ];
    const geo = new THREE.LatheGeometry(points, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Trigger automated or manual dispensing arc
  const triggerDispenseArc = () => {
    if (disabled || isDispensing) return;
    setIsDispensing(true);
    animProgress.current = 0;
    dropTriggered.current = false;
  };

  useFrame((_, delta) => {
    if (!dropperGroupRef.current) return;

    const homePos = new THREE.Vector3(...position);
    const targetPos = new THREE.Vector3(...targetFlaskPos);

    if (isDispensing) {
      animProgress.current += delta * 1.0;
      const p = Math.min(1.0, animProgress.current);

      if (p < 0.25) {
        // Lift out of bottle
        const ease = THREE.MathUtils.smoothstep(p / 0.25, 0, 1);
        dropperGroupRef.current.position.set(
          homePos.x,
          homePos.y + ease * 0.12,
          homePos.z
        );
      } else if (p < 0.50) {
        // Carry to flask
        const ease = THREE.MathUtils.smoothstep((p - 0.25) / 0.25, 0, 1);
        dropperGroupRef.current.position.set(
          THREE.MathUtils.lerp(homePos.x, targetPos.x, ease),
          homePos.y + 0.12 + Math.sin(ease * Math.PI) * 0.03,
          THREE.MathUtils.lerp(homePos.z, targetPos.z, ease)
        );
      } else if (p < 0.75) {
        // Squeeze & drop
        const t = (p - 0.50) / 0.25;
        dropperGroupRef.current.position.copy(targetPos);

        const squeeze = 1 - Math.sin(t * Math.PI) * 0.35;
        if (bulbRef.current) {
          bulbRef.current.scale.set(squeeze, squeeze * 0.8, squeeze);
        }

        if (t > 0.45 && !dropTriggered.current) {
          dropTriggered.current = true;
          onAddDrop();
          soundEngine.playDropPlop([targetPos.x, 0.04, targetPos.z], 0.26);
        }

        if (fallingDropRef.current) {
          fallingDropRef.current.visible = true;
          fallingDropRef.current.position.y = -0.04 - t * 0.07;
        }
      } else {
        // Return to bottle
        const ease = THREE.MathUtils.smoothstep((p - 0.75) / 0.25, 0, 1);
        if (fallingDropRef.current) fallingDropRef.current.visible = false;
        if (bulbRef.current) bulbRef.current.scale.set(1, 1, 1);

        dropperGroupRef.current.position.set(
          THREE.MathUtils.lerp(targetPos.x, homePos.x, ease),
          THREE.MathUtils.lerp(targetPos.y, homePos.y, ease),
          THREE.MathUtils.lerp(targetPos.z, homePos.z, ease)
        );

        if (p >= 1.0) {
          setIsDispensing(false);
          soundEngine.playGlassClink([homePos.x, 0.08, homePos.z], 0.18);
        }
      }
    } else if (isDraggingDropper) {
      dropperGroupRef.current.position.lerp(currentDropperPos.current, delta * 15.0);
    } else {
      // Resting inside bottle
      dropperGroupRef.current.position.lerp(homePos, delta * 8.0);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (disabled) return;

    if (isAboveFlask) {
      // Squeeze bulb while held above flask
      if (bulbRef.current) bulbRef.current.scale.set(0.7, 0.6, 0.7);
      onAddDrop();
      soundEngine.playDropPlop([targetFlaskPos[0], 0.04, targetFlaskPos[2]], 0.28);
      setTimeout(() => {
        if (bulbRef.current) bulbRef.current.scale.set(1, 1, 1);
      }, 180);
    } else {
      setIsDraggingDropper(true);
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {}
      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingDropper) return;
    e.stopPropagation();

    const intersect = new THREE.Vector3();
    raycaster.setFromCamera(e.pointer, e.camera);
    raycaster.ray.intersectPlane(dragPlane, intersect);

    if (intersect) {
      currentDropperPos.current.set(intersect.x, 0.16, intersect.z);

      const distFlask = new THREE.Vector2(intersect.x - targetFlaskPos[0], intersect.z - targetFlaskPos[2]).length();
      if (distFlask < 0.18) {
        setIsAboveFlask(true);
        currentDropperPos.current.set(targetFlaskPos[0], targetFlaskPos[1], targetFlaskPos[2]);
      } else {
        setIsAboveFlask(false);
      }
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (isDraggingDropper) {
      e.stopPropagation();
      setIsDraggingDropper(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      document.body.style.cursor = 'auto';

      if (isAboveFlask) {
        // User released above flask: dispense drop then return
        onAddDrop();
        soundEngine.playDropPlop([targetFlaskPos[0], 0.04, targetFlaskPos[2]], 0.28);
      }
      setIsAboveFlask(false);
    }
  };

  return (
    <group ref={bottleGroupRef} position={position}>
      {/* ================= AMBER GLASS REAGENT BOTTLE ================= */}
      <mesh
        geometry={bottleGeometry}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          triggerDispenseArc();
        }}
      >
        <meshPhysicalMaterial
          color="#78350f"
          transmission={0.65}
          roughness={0.08}
          ior={1.54}
          thickness={0.03}
          specularIntensity={1.0}
          clearcoat={0.8}
          attenuationColor="#451a03"
          attenuationDistance={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Phenolphthalein Indicator Solution in Bottle */}
      <mesh position={[0, 0.032, 0]}>
        <cylinderGeometry args={[0.023, 0.023, 0.056, 24]} />
        <meshPhysicalMaterial
          color="#fef08a"
          transmission={0.85}
          roughness={0.05}
          ior={1.333}
          thickness={0.02}
        />
      </mesh>

      {/* GHS Hazardous Reagent Label Decal */}
      <mesh position={[0, 0.036, 0]}>
        <cylinderGeometry args={[0.0264, 0.0264, 0.046, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial map={labelTexture} transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>

      {/* ================= REMOVABLE GLASS DROPPER PIPETTE ================= */}
      <group
        ref={dropperGroupRef}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={() => {
          if (!disabled) document.body.style.cursor = isDraggingDropper ? 'grabbing' : 'grab';
        }}
        onPointerOut={() => {
          if (!isDraggingDropper) document.body.style.cursor = 'auto';
        }}
      >
        {/* Black Threaded Collar Fitting */}
        <mesh position={[0, 0.088, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.016, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Vulcanized Rubber Squeeze Teat / Bulb */}
        <mesh ref={bulbRef} position={[0, 0.112, 0]} castShadow>
          <sphereGeometry args={[0.011, 20, 20]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Borosilicate Glass Dropper Pipette Stem */}
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.0032, 0.0016, 0.09, 16]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.98}
            roughness={0.02}
            ior={1.517}
            thickness={0.015}
          />
        </mesh>

        {/* Dropper Tip Liquid Column */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.002, 0.001, 0.03, 12]} />
          <meshPhysicalMaterial color="#fef08a" transmission={0.9} roughness={0.05} ior={1.333} />
        </mesh>

        {/* Detaching / Falling Indicator Droplet */}
        <mesh ref={fallingDropRef} position={[0, -0.04, 0]} visible={false}>
          <sphereGeometry args={[0.0022, 12, 12]} />
          <meshPhysicalMaterial color="#f472b6" transmission={0.75} roughness={0.05} ior={1.333} />
        </mesh>
      </group>
    </group>
  );
};
