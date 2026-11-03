import React from 'react';
import * as THREE from 'three';

interface RetortStandProps {
  position?: [number, number, number];
}

/**
 * Photorealistic Heavy Cast-Iron Laboratory Retort Stand with Articulated 3-Prong Clamps.
 * Features:
 * - High-mass cast-iron base (31cm x 23cm) with perimeter 45° chamfer and dark powder-coat finish.
 * - 4 molded neoprene rubber leveling feet with threaded brass adjustment screws.
 * - Recessed glazed white porcelain contrast plate with laser-etched circular registration crosshairs.
 * - Precision-machined 304 stainless steel support rod (12mm dia, 85cm height) with acorn top cap.
 * - Two authentic die-cast alloy articulated burette clamps:
 *   - Upper Clamp at y = 0.81m (securing the burette top neck above 0 mL)
 *   - Lower Clamp at y = 0.30m (securing the reinforced glass stem below 50 mL, above the stopcock)
 *   - Entire 0-50 mL graduated scale column (y = 0.32 to 0.80) is 100% unobstructed for clear reading.
 *   - Clamp adjustment screws and yokes are positioned strictly behind the glassware, preventing clipping.
 *   - Jaws feature natural cork protective liners clasping the tube safely from the sides/rear.
 */
export const RetortStand: React.FC<RetortStandProps> = ({ position = [0, 0.0, 0.18] }) => {
  // Support rod mounting position on base
  const rodX = -0.12;
  const rodZ = -0.05;

  // Vector from vertical rod to burette center [0, y, 0]
  const dx = 0.12;
  const dz = 0.05;
  const armAngle = Math.atan2(dz, dx); // ~0.3948 rad (22.6°)

  // Reusable Articulated Burette Clamp Component
  const renderBuretteClamp = (clampY: number, keySuffix: string) => {
    // Extension arm length: from rod to yoke (stops 2.6cm before tube center)
    const armLength = 0.104;
    // Yoke body position along the arm vector
    const yokeX = rodX + Math.cos(armAngle) * armLength; // -0.024
    const yokeZ = rodZ + Math.sin(armAngle) * armLength; // -0.010

    return (
      <group key={`clamp-${keySuffix}`} position={[0, clampY, 0]}>
        {/* ================= 1. DIE-CAST ALLOY BOSSHEAD (ON ROD) ================= */}
        <group position={[rodX, 0, rodZ]}>
          {/* Main Bosshead Body */}
          <mesh castShadow>
            <boxGeometry args={[0.026, 0.034, 0.026]} />
            <meshStandardMaterial color="#334155" roughness={0.38} metalness={0.75} />
          </mesh>
          {/* V-groove relief slot */}
          <mesh position={[0, 0, 0.012]}>
            <boxGeometry args={[0.014, 0.036, 0.003]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Rod Clamping Nickel-Plated T-Screw (Points outward at -X) */}
          <group position={[-0.018, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.0035, 0.0035, 0.022, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.12} />
            </mesh>
            <mesh position={[-0.008, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.007, 0.007, 0.004, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.25} />
            </mesh>
            <mesh position={[-0.016, 0, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.034, 12]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.1} />
            </mesh>
            <mesh position={[-0.016, 0.017, 0]}>
              <sphereGeometry args={[0.0035, 12, 8]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} />
            </mesh>
            <mesh position={[-0.016, -0.017, 0]}>
              <sphereGeometry args={[0.0035, 12, 8]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} />
            </mesh>
          </group>

          {/* Arm Clamping T-Screw (Points backwards at -Z) */}
          <group position={[0, 0, -0.018]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.0035, 0.0035, 0.020, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0, -0.014]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.030, 12]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} />
            </mesh>
          </group>
        </group>

        {/* ================= 2. EXTENSION ARM ROD ================= */}
        {/* Solid ground stainless rod reaching from bosshead to clamp yoke */}
        <mesh
          position={[(rodX + yokeX) / 2, 0, (rodZ + yokeZ) / 2]}
          rotation={[0, -armAngle, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.0048, 0.0048, armLength, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.97} roughness={0.08} />
        </mesh>

        {/* ================= 3. SWIVEL CLAMP YOKE (BEHIND TUBE) ================= */}
        {/* Yoke sits 2.6cm away from the glass center */}
        <group position={[yokeX, 0, yokeZ]} rotation={[0, -armAngle, 0]}>
          {/* Cast yoke body */}
          <mesh position={[-0.008, 0, 0]}>
            <boxGeometry args={[0.018, 0.024, 0.020]} />
            <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.28} />
          </mesh>

          {/* Knurled Brass Central Tension Adjustment Screw (Points strictly BACKWARDS away from glass) */}
          <group position={[-0.022, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.007, 0.007, 0.016, 20]} />
              <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.2} />
            </mesh>
            {/* Stainless compression spring */}
            <mesh position={[0.007, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.0045, 0.0045, 0.010, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        </group>

        {/* ================= 4. THREE-PRONG CLAMP JAWS WITH CORK LINERS ================= */}
        {/* Centered around the glass tube [0, 0, 0], clasping from rear/sides with front open */}
        <group position={[0, 0, 0]}>
          {/* Upper Double Prongs (at y = +0.012) */}
          <group position={[0, 0.012, 0]}>
            {/* Left Prong */}
            <mesh rotation={[Math.PI / 2, 0, -armAngle - 0.35]}>
              <torusGeometry args={[0.0155, 0.0024, 12, 24, Math.PI * 0.55]} />
              <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.28} />
            </mesh>
            {/* Left Natural Cork Protective Liner */}
            <mesh rotation={[Math.PI / 2, 0, -armAngle - 0.32]}>
              <torusGeometry args={[0.0142, 0.0015, 10, 20, Math.PI * 0.50]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} metalness={0.02} />
            </mesh>

            {/* Right Prong */}
            <mesh rotation={[Math.PI / 2, 0, -armAngle + 0.35]}>
              <torusGeometry args={[0.0155, 0.0024, 12, 24, Math.PI * 0.55]} />
              <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.28} />
            </mesh>
            {/* Right Cork Protective Liner */}
            <mesh rotation={[Math.PI / 2, 0, -armAngle + 0.38]}>
              <torusGeometry args={[0.0142, 0.0015, 10, 20, Math.PI * 0.50]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} metalness={0.02} />
            </mesh>
          </group>

          {/* Lower Single Opposing Prong (at y = -0.012) */}
          <group position={[0, -0.012, 0]}>
            <mesh rotation={[Math.PI / 2, 0, -armAngle - 0.05]}>
              <torusGeometry args={[0.0155, 0.0026, 12, 24, Math.PI * 0.85]} />
              <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.28} />
            </mesh>
            {/* Lower Cork Liner */}
            <mesh rotation={[Math.PI / 2, 0, -armAngle]}>
              <torusGeometry args={[0.0142, 0.0016, 10, 20, Math.PI * 0.78]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} metalness={0.02} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group position={position}>
      {/* ================= 4 MOLDED NEOPRENE RUBBER LEVELING FEET ================= */}
      {[
        [-0.135, 0.0025, -0.095],
        [0.135, 0.0025, -0.095],
        [-0.135, 0.0025, 0.095],
        [0.135, 0.0025, 0.095],
      ].map(([x, y, z], idx) => (
        <group key={`foot-${idx}`} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.012, 0.014, 0.005, 16]} />
            <meshStandardMaterial color="#090d16" roughness={0.92} metalness={0.05} />
          </mesh>
          {/* Inner brass leveling screw stud */}
          <mesh position={[0, 0.003, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.004, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* ================= HEAVY CAST-IRON SUPPORT BASE ================= */}
      {/* Main heavy cast-iron rectangular chassis with dark textured powder-coat */}
      <mesh castShadow receiveShadow position={[0, 0.012, 0]}>
        <boxGeometry args={[0.31, 0.016, 0.23]} />
        <meshStandardMaterial
          color="#18202c"
          roughness={0.72}
          metalness={0.38}
        />
      </mesh>

      {/* Perimeter 45-degree machined bevel chamfer */}
      <mesh position={[0, 0.0205, 0]}>
        <boxGeometry args={[0.302, 0.003, 0.222]} />
        <meshStandardMaterial color="#2d3748" roughness={0.55} metalness={0.45} />
      </mesh>

      {/* Raised outer retaining lip around the recessed porcelain plate tray */}
      <mesh position={[0, 0.0225, 0.01]}>
        <boxGeometry args={[0.216, 0.002, 0.176]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Cast Manufacturer Badge on front-left bevel */}
      <group position={[-0.08, 0.021, 0.104]}>
        <mesh>
          <planeGeometry args={[0.08, 0.009]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
        </mesh>
      </group>

      {/* ================= GLAZED WHITE PORCELAIN CONTRAST PLATE ================= */}
      {/* High-gloss pure white porcelain tile recessed into the cast iron base */}
      <mesh receiveShadow position={[0, 0.023, 0.01]}>
        <boxGeometry args={[0.21, 0.003, 0.17]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.06}
          metalness={0.02}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          specularColor="#ffffff"
          specularIntensity={1.0}
        />
      </mesh>

      {/* Laser-etched alignment crosshairs on the white porcelain plate */}
      <group position={[0, 0.0248, 0.01]}>
        {/* Subtle center alignment circle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.068, 0.069, 48]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Fine crosshair registration ticks */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0.074, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.009, 0.0014]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.65} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= MACHINED ROD MOUNTING BUSHING COLLAR ================= */}
      {/* Heavy hexagonal machined steel boss collar threaded into base */}
      <group position={[rodX, 0.026, rodZ]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.014, 0.015, 0.014, 6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Knurled lock-ring */}
        <mesh position={[0, 0.006, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.005, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.94} roughness={0.25} />
        </mesh>
      </group>

      {/* ================= VERTICAL 304 STAINLESS STEEL SUPPORT ROD ================= */}
      {/* 12mm ground solid rod (85cm height) */}
      <mesh castShadow position={[rodX, 0.45, rodZ]}>
        <cylinderGeometry args={[0.0065, 0.0065, 0.85, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.97}
          roughness={0.08}
        />
      </mesh>

      {/* Acorn safety dome cap at top */}
      <mesh position={[rodX, 0.876, rodZ]}>
        <sphereGeometry args={[0.0065, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.97} roughness={0.08} />
      </mesh>

      {/* ================= TWO ARTICULATED BURETTE CLAMPS ================= */}
      {/* 
        Upper Clamp: y = 0.81 (grips burette upper neck at y = +0.36 above 0 mL mark)
        Lower Clamp: y = 0.30 (grips burette stem at y = -0.15 below 50 mL mark, above stopcock)
        Leaves the entire 0-50 mL graduated scale column completely clear and unobstructed!
      */}
      {renderBuretteClamp(0.81, 'upper')}
      {renderBuretteClamp(0.30, 'lower')}
    </group>
  );
};
