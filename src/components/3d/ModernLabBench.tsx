import React from 'react';

export const ModernLabBench: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* ================= CLEANROOM EPOXY FLOOR ================= */}
      <mesh receiveShadow position={[0, -0.788, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* ================= CLEANROOM BACK & SIDE WALLS ================= */}
      {/* Back Wall - Neutral Cleanroom Matte Wall */}
      <mesh position={[0, 1.2, -2.2]}>
        <planeGeometry args={[16, 4.5]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.65}
          metalness={0.02}
        />
      </mesh>

      {/* Wall Baseboard Trim */}
      <mesh position={[0, -0.74, -2.19]}>
        <boxGeometry args={[16, 0.1, 0.02]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>

      {/* ================= MAIN BENCHTOP (Top surface flush at y = 0.0) ================= */}
      {/* Light grey durable chemical-resistant solid resin epoxy slab */}
      <mesh receiveShadow castShadow position={[0, -0.025, 0]}>
        <boxGeometry args={[4.2, 0.05, 1.3]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.42} metalness={0.02} />
      </mesh>

      {/* Benchtop dark edge trim for visual contrast */}
      <mesh position={[0, -0.025, 0.652]}>
        <boxGeometry args={[4.22, 0.052, 0.012]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Left Extended Bench (L-Shape Return) */}
      <mesh receiveShadow castShadow position={[-2.4, -0.025, -0.45]}>
        <boxGeometry args={[1.0, 0.05, 2.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh position={[-2.902, -0.025, -0.45]}>
        <boxGeometry args={[0.012, 0.052, 2.22]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* ================= LOWER CABINETRY & DRAWERS ================= */}
      {/* Base Cabinet Plinth (Kick plate) */}
      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[4.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Main Cabinet Carcass Bodies (White / Light Grey) */}
      <mesh castShadow receiveShadow position={[0, -0.41, 0]}>
        <boxGeometry args={[4.1, 0.66, 1.15]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* Drawer Unit 1 (Left - Powder/Steel Blue drawers) */}
      {[-0.58, -0.38, -0.18].map((y, idx) => (
        <group key={`drawer-left-${idx}`} position={[-1.35, y, 0.58]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.72, 0.17, 0.02]} />
            <meshStandardMaterial color="#365470" roughness={0.38} metalness={0.12} />
          </mesh>
          <mesh position={[0, 0.02, 0.015]}>
            <boxGeometry args={[0.16, 0.02, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Drawer Unit 2 (Center - Steel Blue drawers) */}
      {[-0.58, -0.38, -0.18].map((y, idx) => (
        <group key={`drawer-center-${idx}`} position={[-0.45, y, 0.58]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.72, 0.17, 0.02]} />
            <meshStandardMaterial color="#365470" roughness={0.38} metalness={0.12} />
          </mesh>
          <mesh position={[0, 0.02, 0.015]}>
            <boxGeometry args={[0.16, 0.02, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Right Double Cupboard Doors */}
      <group position={[0.85, -0.4, 0.58]}>
        <mesh castShadow receiveShadow position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.76, 0.58, 0.02]} />
          <meshStandardMaterial color="#2d4860" roughness={0.38} metalness={0.12} />
        </mesh>
        <mesh position={[-0.08, 0.08, 0.015]}>
          <cylinderGeometry args={[0.007, 0.007, 0.14, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>

        <mesh castShadow receiveShadow position={[0.4, 0, 0]}>
          <boxGeometry args={[0.76, 0.58, 0.02]} />
          <meshStandardMaterial color="#2d4860" roughness={0.38} metalness={0.12} />
        </mesh>
        <mesh position={[0.08, 0.08, 0.015]}>
          <cylinderGeometry args={[0.007, 0.007, 0.14, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* ================= DUAL-TIER OVERHEAD SHELVING SYSTEM (Pushed back to z = -0.32) ================= */}
      {[-1.6, -0.65, 0.45, 1.55].map((x, idx) => (
        <group key={`upright-${idx}`} position={[x, 0.48, -0.32]}>
          {/* Main vertical steel strut */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.98, 0.05]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Shelf 1 Gusset Bracket */}
          <mesh position={[0, -0.12, 0.04]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.035, 0.12, 0.035]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} />
          </mesh>
          {/* Shelf 2 Gusset Bracket */}
          <mesh position={[0, 0.28, 0.04]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.035, 0.12, 0.035]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Shelf Tier 1 (Lower shelf: y = 0.36) */}
      <mesh receiveShadow castShadow position={[0, 0.36, -0.28]}>
        <boxGeometry args={[3.8, 0.025, 0.34]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.42} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.38, -0.11]}>
        <boxGeometry args={[3.8, 0.025, 0.012]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Shelf Tier 2 (Upper shelf: y = 0.76) */}
      <mesh receiveShadow castShadow position={[0, 0.76, -0.28]}>
        <boxGeometry args={[3.8, 0.025, 0.34]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.42} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0.78, -0.11]}>
        <boxGeometry args={[3.8, 0.025, 0.012]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
};
