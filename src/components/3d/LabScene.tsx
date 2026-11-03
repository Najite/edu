import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Realistic Laboratory Environment & Furniture
import { ModernLabBench } from './ModernLabBench';
import { WallMonitors } from './WallMonitors';
import { LabAccessories } from './LabAccessories';
import { TestTubeRack } from './TestTubeRack';

// Real Authenticated 3D Scientific Equipment Models
import { HotplateStirrerModel } from './chemlab/HotplateStirrerModel';
import { CentrifugeModel } from './chemlab/CentrifugeModel';
import { AnalyticalBalanceModel } from './chemlab/AnalyticalBalanceModel';
import { LabOvenModel } from './chemlab/LabOvenModel';
import { ReagentBottleModel } from './chemlab/ReagentBottleModel';
import { VialRackModel } from './chemlab/VialRackModel';
import { SpatulaModel } from './chemlab/SpatulaModel';

// High-Fidelity 1K PBR Models (Poly Haven)
import { MicroscopeModel } from './MicroscopeModel';
import { ChemistrySetModel } from './ChemistrySetModel';
import { ModernLabLaptop } from './ModernLabLaptop';
import { ModernLabNotebook } from './ModernLabNotebook';
import { RealStoolModel } from './RealStoolModel';

// Interactive Titration Apparatus
import { RetortStand } from './RetortStand';
import { Burette } from './Burette';
import { ErlenmeyerFlask } from './ErlenmeyerFlask';
import { IndicatorBottle } from './IndicatorBottle';
import { DropletEffect } from './DropletEffect';
import { SocketVisualizer } from './SocketVisualizer';

export type CameraPreset = 'overview' | 'titration' | 'burette';

interface CameraAnimatorProps {
  preset: CameraPreset;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

// Elevated 3/4 perspective matching the reference photo
const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [-0.08, 1.15, 2.35], target: [-0.08, 0.42, 0.1] },
  titration: { pos: [0.0, 0.38, 0.95], target: [0.0, 0.22, 0.18] },
  burette: { pos: [0.15, 0.68, 0.78], target: [0.0, 0.62, 0.18] },
};

const CameraAnimator: React.FC<CameraAnimatorProps> = ({ preset, controlsRef }) => {
  const targetConfig = CAMERA_PRESETS[preset];

  useFrame((state, delta) => {
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetConfig.pos[0], 5, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetConfig.pos[1], 5, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetConfig.pos[2], 5, delta);

    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetConfig.target[0], 5, delta);
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetConfig.target[1], 5, delta);
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, targetConfig.target[2], 5, delta);
      controlsRef.current.update();
    }
  });

  return null;
};

interface LabSceneProps {
  cameraPreset: CameraPreset;
  buretteVolumeMl: number;
  buretteValveOpen: boolean;
  onToggleValve: () => void;
  flaskVolumeMl: number;
  liquidColor: string;
  liquidOpacity: number;
  isSwirling: boolean;
  isFlaskDocked: boolean;
  onSnapFlaskToBurette: () => void;
  onSwirlFlaskToggle: () => void;
  onAddIndicatorDrop: () => void;
  flaskDropsAdded: number;
}

export const LabScene: React.FC<LabSceneProps> = ({
  cameraPreset,
  buretteVolumeMl,
  buretteValveOpen,
  onToggleValve,
  flaskVolumeMl,
  liquidColor,
  liquidOpacity,
  isSwirling,
  isFlaskDocked,
  onSnapFlaskToBurette,
  onSwirlFlaskToggle,
  onAddIndicatorDrop,
  flaskDropsAdded,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [-0.08, 1.15, 2.35], fov: 46 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ background: '#0b1120' }}
      >
        <CameraAnimator preset={cameraPreset} controlsRef={controlsRef} />

        {/* Real-time Image-Based Lighting from City HDR */}
        <Environment preset="city" />

        {/* Studio Lighting Setup for Photorealism */}
        <ambientLight intensity={0.45} color="#f8fafc" />
        <directionalLight
          position={[3.8, 5.2, 3.2]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
          shadow-camera-left={-3.5}
          shadow-camera-right={3.5}
          shadow-camera-top={3.5}
          shadow-camera-bottom={-3.5}
        />
        {/* Soft fill and accent lighting */}
        <pointLight position={[-2.5, 2.8, 1.2]} intensity={0.35} color="#bfdbfe" />
        <pointLight position={[2.5, 2.8, 1.2]} intensity={0.35} color="#f8fafc" />
        <pointLight position={[0, 2.2, 0.4]} intensity={0.85} color="#ffffff" />

        {/* Ground Floor Contact Shadows */}
        <ContactShadows
          position={[0, -0.787, 0]}
          opacity={0.65}
          scale={12}
          blur={1.8}
          far={1.8}
          resolution={1024}
          color="#0b1120"
        />

        {/* Benchtop Equipment Contact Shadows */}
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.55}
          scale={5.5}
          blur={1.4}
          far={0.6}
          resolution={1024}
          color="#1e293b"
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 6}
          minDistance={0.5}
          maxDistance={3.8}
        />

        {/* ================= LABORATORY BENCH & ROOM ENVIRONMENT ================= */}
        <ModernLabBench />
        <WallMonitors />
        <LabAccessories />

        {/* ================= AUTHENTIC PRE-TEXTURED 3D SCIENTIFIC MODELS ================= */}
        <React.Suspense fallback={null}>
          {/* 1. IKA RCT Digital Magnetic Hot Plate Stirrer (Bench Left) */}
          <HotplateStirrerModel
            position={[-1.25, 0.0, 0.16]}
            rotation={[-Math.PI / 2, 0, 0.12]}
            scale={1.05}
          />

          {/* Stainless Steel Lab Spatula lying beside hotplate */}
          <SpatulaModel
            position={[-0.96, 0.005, 0.28]}
            rotation={[0, 0.35, 0]}
            scale={1.1}
          />

          {/* 2. Eppendorf 5910 Ri Laboratory Centrifuge (Bench Center-Left) */}
          <CentrifugeModel
            position={[-0.68, 0.0, 0.14]}
            rotation={[0, 0.15, 0]}
            scale={0.52}
          />

          {/* 3. Ohaus Pioneer PX224E Analytical Balance with Draft Shield (Left Extension) */}
          <AnalyticalBalanceModel
            position={[-2.3, 0.0, -0.22]}
            rotation={[0, 0.4, 0]}
            scale={1.1}
          />

          {/* 4. Binder Laboratory Drying Oven / Incubator (Shelf 2 Center) */}
          <LabOvenModel
            position={[-0.48, 0.76, -0.26]}
            rotation={[0, 0, 0]}
            scale={0.42}
          />

          {/* 5. Duran GL45 Amber & Clear Chemical Reagent Bottles (Shelf 1) */}
          <ReagentBottleModel
            position={[-0.26, 0.36, -0.24]}
            scale={1.0}
            amber={true}
          />
          <ReagentBottleModel
            position={[-0.15, 0.36, -0.24]}
            scale={1.0}
            amber={false}
          />

          {/* 6. Laboratory Vial Rack (Shelf 1 Left) */}
          <VialRackModel
            position={[-0.88, 0.36, -0.24]}
            rotation={[0, 0, 0]}
            scale={0.9}
          />

          {/* 7. Test Tube Racks with Borosilicate Glass Tubes */}
          <TestTubeRack position={[0.2, 0.76, -0.24]} />
          <TestTubeRack position={[0.85, 0.76, -0.24]} />
          <TestTubeRack position={[0.85, 0.36, -0.24]} />

          {/* 8. Poly Haven Cast-Metal Industrial Microscope (Bench Right) */}
          <MicroscopeModel
            position={[1.42, 0.0, 0.12]}
            rotation={[0, -0.42, 0]}
            scale={0.68}
          />

          {/* 9. Poly Haven Chemistry Glassware Set (Bench Right Background) */}
          <ChemistrySetModel
            position={[1.82, 0.0, -0.05]}
            rotation={[0, -0.22, 0]}
            scale={0.65}
          />

          {/* 10. Modern Slim Laptop running glowing DNA Replication slide (Bench Center-Right) */}
          <ModernLabLaptop
            position={[0.74, 0.0, 0.18]}
            rotation={[0, -0.32, 0]}
            scale={0.92}
          />

          {/* 11. Laboratory Spiral Notebook with Handwritten Notes & Pen (Bench Center-Right) */}
          <ModernLabNotebook
            position={[0.34, 0.0, 0.26]}
            rotation={[0, 0.12, 0]}
            scale={0.95}
          />

          {/* 12. Heavy Cast-Iron Swivel Laboratory Stool (Foreground Floor) */}
          <RealStoolModel
            position={[0.15, -0.7875, 0.74]}
            rotation={[0, 0.3, 0]}
            scale={0.95}
          />
        </React.Suspense>

        {/* ================= INTERACTIVE TITRATION EXPERIMENT APPARATUS ================= */}
        {/* Mounted centrally on the desk surface */}
        <RetortStand position={[0, 0.0, 0.18]} />

        <SocketVisualizer
          position={[0, 0.035, 0.2]}
          active={!isFlaskDocked}
          label="Place Flask Here"
        />

        <Burette
          position={[0, 0.62, 0.18]}
          volumeMl={buretteVolumeMl}
          valveOpen={buretteValveOpen}
          onToggleValve={onToggleValve}
        />

        <DropletEffect active={buretteValveOpen && buretteVolumeMl > 0} color="#38bdf8" zPos={0.18} />

        <ErlenmeyerFlask
          position={isFlaskDocked ? [0, 0.035, 0.2] : [-0.38, 0.035, 0.26]}
          volumeMl={flaskVolumeMl}
          liquidColor={liquidColor}
          liquidOpacity={liquidOpacity}
          isSwirling={isSwirling}
          isDockedUnderBurette={isFlaskDocked}
          onSnapToBurette={onSnapFlaskToBurette}
          onSwirlToggle={onSwirlFlaskToggle}
          targetSocketPos={[0, 0.035, 0.2]}
        />

        <IndicatorBottle
          position={[0.38, 0.0, 0.22]}
          onAddDrop={onAddIndicatorDrop}
          disabled={flaskDropsAdded >= 3}
        />
      </Canvas>
    </div>
  );
};
