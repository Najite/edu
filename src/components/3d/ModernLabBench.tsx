import React, { useMemo } from 'react';
import { createLaboratoryTilePBR } from '../../utils/textureGenerator';
import { createLabCountertopTexture } from '../../utils/labTextures';

export const ModernLabBench: React.FC = () => {
  const tileTextures = useMemo(() => createLaboratoryTilePBR(12, 1024), []);
  const countertopTexture = useMemo(() => createLabCountertopTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      {/* ================= CLEANROOM VINYL/EPOXY FLOOR ================= */}
      <mesh receiveShadow position={[0, -0.788, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* ================= CLEANROOM TILE BACKSPLASH & WALL ================= */}
      {/* Ceramic laboratory wall tiles with fine grout & normal bump */}
      <mesh receiveShadow position={[0, 1.2, -2.18]}>
        <planeGeometry args={[16, 4.5]} />
        <meshStandardMaterial
          map={tileTextures.albedo}
          normalMap={tileTextures.normal}
          roughnessMap={tileTextures.roughness}
          roughness={0.25}
          metalness={0.03}
        />
      </mesh>

      {/* Sanitary Cove Baseboard Trim */}
      <mesh position={[0, -0.74, -2.17]}>
        <boxGeometry args={[16, 0.1, 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Laboratory Utility Raceway / Service Trunking along backsplash */}
      <group position={[0, 0.15, -1.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.12, 0.05]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Electrical Outlets along the raceway */}
        {[-1.6, -0.8, 0.6, 1.5].map((x, i) => (
          <group key={`outlet-${i}`} position={[x, 0, 0.028]}>
            <mesh>
              <boxGeometry args={[0.07, 0.08, 0.015]} />
              <meshStandardMaterial color="#475569" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.009]}>
              <boxGeometry args={[0.06, 0.07, 0.006]} />
              <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Laboratory Gas & Vacuum Turret Taps */}
        {[-1.2, 1.1].map((x, i) => (
          <group key={`tap-${i}`} position={[x, 0.08, 0.02]}>
            <mesh>
              <cylinderGeometry args={[0.014, 0.018, 0.08, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
            </mesh>
            {/* Gas - Blue knob */}
            <mesh position={[-0.025, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.004, 0.035, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.92} />
            </mesh>
            <mesh position={[-0.045, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.008, 12]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </mesh>
            {/* Vacuum - Yellow knob */}
            <mesh position={[0.025, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.004, 0.035, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.92} />
            </mesh>
            <mesh position={[0.045, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.008, 12]} />
              <meshStandardMaterial color="#eab308" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= SOLID CHEMICAL-RESISTANT EPOXY BENCHTOP ================= */}
      {/* Heavy-duty 30mm Trespa TopLab chemical-resistant black/charcoal countertop */}
      <mesh receiveShadow castShadow position={[0, -0.025, 0]}>
        <boxGeometry args={[4.2, 0.05, 1.3]} />
        <meshStandardMaterial
          map={countertopTexture}
          color="#1e242b"
          roughness={0.36}
          metalness={0.05}
        />
      </mesh>

      {/* Countertop Front Anti-Spill Marine Edge Trim */}
      <mesh position={[0, -0.025, 0.652]}>
        <boxGeometry args={[4.22, 0.052, 0.012]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Left Return Extended Countertop (L-Shape Return) */}
      <mesh receiveShadow castShadow position={[-2.4, -0.025, -0.45]}>
        <boxGeometry args={[1.0, 0.05, 2.2]} />
        <meshStandardMaterial
          map={countertopTexture}
          color="#1e242b"
          roughness={0.36}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[-2.902, -0.025, -0.45]}>
        <boxGeometry args={[0.012, 0.052, 2.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Left Return Lower Supporting Cabinetry */}
      <mesh castShadow receiveShadow position={[-2.4, -0.41, -0.45]}>
        <boxGeometry args={[0.92, 0.66, 2.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[-2.4, -0.74, -0.45]}>
        <boxGeometry args={[0.90, 0.1, 2.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* ================= LOWER MAIN BENCH CABINETRY ================= */}
      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[4.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, -0.41, 0]}>
        <boxGeometry args={[4.1, 0.66, 1.15]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Left Bank of 3 Drawers */}
      {[-0.58, -0.38, -0.18].map((y, idx) => (
        <group key={`drawer-left-${idx}`} position={[-1.35, y, 0.58]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.72, 0.17, 0.02]} />
            <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.045, 0.012]}>
            <boxGeometry args={[0.22, 0.015, 0.012]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
          </mesh>
        </group>
      ))}

      {/* Center Bank of 3 Drawers */}
      {[-0.58, -0.38, -0.18].map((y, idx) => (
        <group key={`drawer-center-${idx}`} position={[-0.45, y, 0.58]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.72, 0.17, 0.02]} />
            <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.045, 0.012]}>
            <boxGeometry args={[0.22, 0.015, 0.012]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
          </mesh>
        </group>
      ))}

      {/* Right Double Storage Cupboard Doors */}
      <group position={[0.85, -0.4, 0.58]}>
        <mesh castShadow receiveShadow position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.76, 0.58, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[-0.08, 0.08, 0.015]}>
          <cylinderGeometry args={[0.006, 0.006, 0.16, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.15} />
        </mesh>

        <mesh castShadow receiveShadow position={[0.4, 0, 0]}>
          <boxGeometry args={[0.76, 0.58, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0.08, 0.08, 0.015]}>
          <cylinderGeometry args={[0.006, 0.006, 0.16, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.15} />
        </mesh>
      </group>

      {/* ================= OVERHEAD SERVICE SHELVING SYSTEM ================= */}
      {/* Heavy-duty vertical extruded anodized aluminum struts */}
      {[-1.6, -0.65, 0.45, 1.55].map((x, idx) => (
        <group key={`strut-${idx}`} position={[x, 0.48, -0.32]}>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.038, 0.98, 0.038]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Shelf Tier 1 (Lower shelf: y = 0.36) */}
      <mesh receiveShadow castShadow position={[0, 0.36, -0.28]}>
        <boxGeometry args={[3.8, 0.025, 0.34]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.375, -0.11]}>
        <boxGeometry args={[3.8, 0.015, 0.01]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Shelf Tier 2 (Upper shelf: y = 0.76) */}
      <mesh receiveShadow castShadow position={[0, 0.76, -0.28]}>
        <boxGeometry args={[3.8, 0.025, 0.34]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.775, -0.11]}>
        <boxGeometry args={[3.8, 0.015, 0.01]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
};
