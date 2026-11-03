import React, { useMemo } from 'react';
import * as THREE from 'three';

interface GlassFunnelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isMountedOnBurette?: boolean;
}

/**
 * 60° Borosilicate Glass Laboratory Liquid Funnel
 * Used for bubble-free titrant loading into the top of the 50 mL burette.
 */
export const GlassFunnel: React.FC<GlassFunnelProps> = ({
  position = [0.18, 0.0, 0.12],
  rotation = [0, 0, 0],
  scale = 0.85,
  isMountedOnBurette = false,
}) => {
  // Funnel Lathe Profile
  const funnelGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      // Bottom stem tip (fire-polished beveled tip)
      new THREE.Vector2(0.0035, 0.0),
      new THREE.Vector2(0.0048, 0.0),
      // Long lower stem
      new THREE.Vector2(0.0048, 0.055),
      // 60° flared conical cone
      new THREE.Vector2(0.026, 0.095),
      new THREE.Vector2(0.030, 0.100),
      // Flared beaded rim
      new THREE.Vector2(0.0315, 0.102),
      new THREE.Vector2(0.029, 0.103),
      new THREE.Vector2(0.0275, 0.100),
      // Inner conical wall
      new THREE.Vector2(0.024, 0.094),
      new THREE.Vector2(0.0035, 0.055),
      // Inner stem bore
      new THREE.Vector2(0.0035, 0.0),
    ];
    const geo = new THREE.LatheGeometry(points, 32);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // If mounted on burette: sits inside burette top mouth at [0, 0.45 + 0.415 = 0.865, 0.18]
  const finalPos: [number, number, number] = isMountedOnBurette
    ? [0, 0.845, 0.18]
    : position;

  return (
    <group position={finalPos} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh geometry={funnelGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.99}
          roughness={0.02}
          ior={1.517}
          thickness={0.02}
          specularIntensity={1.0}
          clearcoat={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

