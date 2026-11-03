import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

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
  targetSocketPos = [0, 0.06, 0.2],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentPos, setCurrentPos] = useState<[number, number, number]>(position);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.06);
  const raycaster = new THREE.Raycaster();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isDragging) {
      // Handled in pointer move
    } else if (isDockedUnderBurette) {
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetSocketPos[0], 10, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetSocketPos[1], 10, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetSocketPos[2], 10, delta);

      if (isSwirling) {
        const time = state.clock.getElapsedTime() * 8;
        groupRef.current.rotation.x = Math.sin(time) * 0.08;
        groupRef.current.rotation.z = Math.cos(time) * 0.08;
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0, 8, delta);
        groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, 0, 8, delta);
      }
    } else {
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, currentPos[0], 10, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, currentPos[1], 10, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, currentPos[2], 10, delta);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isDockedUnderBurette) {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } else {
      onSwirlToggle();
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

      if (groupRef.current) {
        const dist = groupRef.current.position.distanceTo(new THREE.Vector3(...targetSocketPos));
        if (dist < 0.28) {
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
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      if (intersectionPoint) {
        groupRef.current.position.x = intersectionPoint.x;
        groupRef.current.position.z = intersectionPoint.z;
        groupRef.current.position.y = 0.12;
      }
    }
  };

  const normalizedVolume = Math.min(1, Math.max(0.2, volumeMl / 80.0));
  const liquidHeight = 0.055 * normalizedVolume;

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
      {/* Visual outline/beacon when hovered or dragging */}
      {(hovered || isDragging) && (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.18, 16]} />
          <meshBasicMaterial
            color={isDockedUnderBurette ? '#a855f7' : '#38bdf8'}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Glass Body: Conical Base with realistic glass refraction */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.032, 0.078, 0.1, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transmission={0.85}
          transparent
          opacity={0.55}
          roughness={0.05}
          ior={1.52}
          reflectivity={0.8}
          thickness={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass Neck: Cylinder */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.05, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transmission={0.85}
          transparent
          opacity={0.55}
          roughness={0.05}
          ior={1.52}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass Beaded Lip at Mouth */}
      <mesh position={[0, 0.145, 0]}>
        <torusGeometry args={[0.026, 0.0035, 12, 32]} />
        <meshStandardMaterial
          color="#93c5fd"
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Glass Flat Heavy Bottom */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.077, 32]} />
        <meshPhysicalMaterial
          color="#bfdbfe"
          transmission={0.8}
          transparent
          opacity={0.7}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Graduated volumetric marks on glass */}
      {[0.03, 0.055, 0.08].map((y, i) => (
        <group key={i} position={[0, y, 0.045 + (0.1 - y) * 0.35]}>
          <mesh rotation={[0.35, 0, 0]}>
            <planeGeometry args={[0.025, 0.002]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Liquid volume inside the flask */}
      <mesh position={[0, 0.005 + liquidHeight / 2, 0]}>
        <cylinderGeometry args={[0.065, 0.075, liquidHeight, 24]} />
        <meshStandardMaterial
          color={liquidColor}
          transparent
          opacity={Math.max(0.65, liquidOpacity)}
          roughness={0.15}
        />
      </mesh>

      {/* Sharp Meniscus Surface Ring */}
      <mesh position={[0, 0.005 + liquidHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.065, 24]} />
        <meshStandardMaterial
          color={liquidColor}
          transparent
          opacity={0.9}
          roughness={0.08}
        />
      </mesh>

      {/* White ceramic label patch */}
      <group position={[0, 0.06, 0.062]} rotation={[0.35, 0, 0]}>
        <mesh>
          <planeGeometry args={[0.04, 0.022]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
};
