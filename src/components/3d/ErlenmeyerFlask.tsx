import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { createFlaskCeramicBadgeTexture } from '../../utils/labTextures';

interface ErlenmeyerFlaskProps {
  position: [number, number, number];
  volumeMl: number;
  liquidColor: string;
  liquidOpacity: number;
  isSwirling: boolean;
  isDockedUnderBurette: boolean;
  onSnapToBurette: () => void;
  onSwirlToggle: () => void;
  targetSocketPos?: [number, number, number];
}

export const ErlenmeyerFlask: React.FC<ErlenmeyerFlaskProps> = ({
  position,
  volumeMl,
  liquidColor,
  liquidOpacity,
  isSwirling,
  isDockedUnderBurette,
  onSnapToBurette,
  onSwirlToggle,
  targetSocketPos = [0, 0.021, 0.18],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidMeshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentPos, setCurrentPos] = useState<[number, number, number]>(position);

  const ceramicBadgeTexture = useMemo(() => createFlaskCeramicBadgeTexture(), []);

  // Plane for drag-and-drop raycasting
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.05), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // 1. Double-Walled Borosilicate Glass Lathe Geometry (Height ~ 14.5 cm)
  const flaskGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      // Base center dimple
      new THREE.Vector2(0, 0.002),
      new THREE.Vector2(0.058, 0.002),
      // Heel radius
      new THREE.Vector2(0.068, 0.010),
      new THREE.Vector2(0.070, 0.018),
      // Conical body wall
      new THREE.Vector2(0.030, 0.098),
      // Throat transition
      new THREE.Vector2(0.024, 0.112),
      // Neck cylinder
      new THREE.Vector2(0.024, 0.142),
      // Flared rim & beaded lip
      new THREE.Vector2(0.028, 0.147),
      new THREE.Vector2(0.029, 0.150),
      new THREE.Vector2(0.0265, 0.151),
      new THREE.Vector2(0.0225, 0.149),
      // Inner neck cavity
      new THREE.Vector2(0.021, 0.142),
      new THREE.Vector2(0.021, 0.112),
      // Inner conical wall (2.5mm glass thickness)
      new THREE.Vector2(0.027, 0.098),
      new THREE.Vector2(0.066, 0.018),
      new THREE.Vector2(0.064, 0.011),
      // Inner base floor
      new THREE.Vector2(0.055, 0.005),
      new THREE.Vector2(0, 0.005),
    ];

    const geo = new THREE.LatheGeometry(points, 48);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Dynamic Liquid Height (from 25 mL to 80 mL)
  const normalizedVol = Math.max(0.1, Math.min(1.2, volumeMl / 50.0));
  const liquidHeight = 0.022 + normalizedVol * 0.035;
  const liquidTopRadius = 0.066 - (liquidHeight / 0.10) * 0.039;

  // 2. Liquid Cavity Geometry
  const liquidGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.0055),
      new THREE.Vector2(0.054, 0.0055),
      new THREE.Vector2(0.063, 0.012),
      new THREE.Vector2(0.065, 0.018),
      new THREE.Vector2(liquidTopRadius, liquidHeight),
      new THREE.Vector2(0, liquidHeight),
    ];

    const geo = new THREE.LatheGeometry(points, 36);
    geo.computeVertexNormals();
    return geo;
  }, [liquidHeight, liquidTopRadius]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDragging) {
      // Handled in pointer move
    } else if (isDockedUnderBurette) {
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetSocketPos[0], 10, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetSocketPos[1], 10, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetSocketPos[2], 10, delta);

      if (isSwirling) {
        const time = state.clock.getElapsedTime() * 9;
        groupRef.current.rotation.x = Math.sin(time) * 0.06;
        groupRef.current.rotation.z = Math.cos(time) * 0.06;

        if (liquidMeshRef.current) {
          liquidMeshRef.current.rotation.y += delta * 12;
        }
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0, 8, delta);
        groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, 0, 8, delta);
      }
    } else {
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, currentPos[0], 10, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, currentPos[1], 10, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, currentPos[2], 10, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0, 8, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, 0, 8, delta);
    }
  });

  const dragStartScreen = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isDockedUnderBurette) {
      setIsDragging(true);
      dragStartScreen.current = { x: e.clientX, y: e.clientY };
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {}
    } else {
      onSwirlToggle();
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}

      const dx = dragStartScreen.current ? Math.abs(e.clientX - dragStartScreen.current.x) : 0;
      const dy = dragStartScreen.current ? Math.abs(e.clientY - dragStartScreen.current.y) : 0;
      const isSimpleClick = dx < 6 && dy < 6;

      if (groupRef.current) {
        const dist = groupRef.current.position.distanceTo(new THREE.Vector3(...targetSocketPos));
        if (dist < 0.35 || isSimpleClick) {
          onSnapToBurette();
        } else {
          setCurrentPos(position);
        }
      }
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && groupRef.current) {
      const intersectionPoint = new THREE.Vector3();
      raycaster.setFromCamera(e.pointer, e.camera);
      raycaster.ray.intersectPlane(dragPlane, intersectionPoint);
      if (intersectionPoint) {
        groupRef.current.position.x = intersectionPoint.x;
        groupRef.current.position.z = intersectionPoint.z;
        groupRef.current.position.y = 0.06;
      }
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* ================= DOUBLE-WALLED BOROSILICATE GLASS BODY ================= */}
      <mesh geometry={flaskGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.99}
          roughness={0.025}
          ior={1.517}
          thickness={0.045}
          specularIntensity={1.0}
          specularColor="#ffffff"
          clearcoat={1.0}
          clearcoatRoughness={0.025}
          attenuationColor="#f8fafc"
          attenuationDistance={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ================= PYREX CERAMIC ENAMEL GRADUATION BADGE ================= */}
      <group position={[0, 0.072, 0.048]} rotation={[0.39, 0, 0]}>
        <mesh>
          <planeGeometry args={[0.050, 0.050]} />
          <meshBasicMaterial
            map={ceramicBadgeTexture}
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ================= LIQUID INSIDE FLASK ================= */}
      <mesh ref={liquidMeshRef} geometry={liquidGeometry}>
        <meshPhysicalMaterial
          color={liquidColor}
          transmission={0.7}
          roughness={0.06}
          ior={1.333}
          clearcoat={0.8}
          transparent
          opacity={Math.max(0.7, liquidOpacity)}
          attenuationColor={liquidColor}
          attenuationDistance={0.08}
        />
      </mesh>

      {/* Meniscus Concave Liquid Surface Ring */}
      <mesh position={[0, liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[liquidTopRadius * 0.85, liquidTopRadius, 32]} />
        <meshPhysicalMaterial
          color={liquidColor}
          transmission={0.5}
          roughness={0.03}
          ior={1.333}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle tactile glow halo when dragging or hovering */}
      {(hovered || isDragging) && !isDockedUnderBurette && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.070, 0.076, 36]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
