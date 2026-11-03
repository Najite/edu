import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Realistic Laboratory Environment & Furniture
import { ModernLabBench } from './ModernLabBench';
import { WallMonitors } from './WallMonitors';
import { LabAccessories } from './LabAccessories';
import { TestTubeRack } from './TestTubeRack';

// Real Authenticated 3D Scientific Equipment Models (ChemLab)
import { CentrifugeModel } from './chemlab/CentrifugeModel';
import { AnalyticalBalanceModel } from './chemlab/AnalyticalBalanceModel';
import { LabOvenModel } from './chemlab/LabOvenModel';
import { ReagentBottleModel } from './chemlab/ReagentBottleModel';
import { VialRackModel } from './chemlab/VialRackModel';

// High-Fidelity Models & Realistic Equipment
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
import { StockBeaker } from './StockBeaker';
import { TitrantBeaker } from './TitrantBeaker';
import { GlassFunnel } from './GlassFunnel';
import { PipetteStand } from './PipetteStand';
import { WasteBeaker } from './WasteBeaker';
import { WashBottle } from './WashBottle';
import { VolumetricPipette } from './VolumetricPipette';
import { FlowRegime, PipetteState } from '../../types/lab';
import { soundEngine } from '../../audio/SpatialSoundEngine';

export type CameraPreset = 'overview' | 'titration' | 'burette' | 'pipette';

export interface LabSceneHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

// Calibrated ergonomic camera angles
export const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [-0.08, 0.82, 1.95], target: [-0.08, 0.32, 0.12] },
  titration: { pos: [0.0, 0.26, 0.68], target: [0.0, 0.14, 0.18] },
  burette: { pos: [0.02, 0.54, 0.54], target: [0.0, 0.52, 0.18] },
  pipette: { pos: [-0.34, 0.38, 0.72], target: [-0.34, 0.16, 0.28] },
};

// Real-Time Audio Listener tied to Three.js camera position & orientation
const AudioListenerUpdater: React.FC = () => {
  const forwardVec = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    camera.getWorldDirection(forwardVec.current);
    upVec.current.copy(camera.up);
    soundEngine.updateListener(
      camera.position.x, camera.position.y, camera.position.z,
      forwardVec.current.x, forwardVec.current.y, forwardVec.current.z,
      upVec.current.x, upVec.current.y, upVec.current.z
    );
  });

  return null;
};

// Real-Time Meniscus Parallax Angle Tracker
const ParallaxTracker: React.FC<{
  buretteVolumeMl: number;
  onParallaxUpdate?: (buretteAngle: number, pipetteAngle: number) => void;
}> = ({ buretteVolumeMl, onParallaxUpdate }) => {
  const lastUpdateRef = useRef(0);

  useFrame(({ camera }) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 60) return;
    lastUpdateRef.current = now;

    // Burette Meniscus World Y: 0.45 + (0.350 - ((50 - V)/50)*0.480)
    const dispensedFraction = Math.max(0, Math.min(1, (50.0 - buretteVolumeMl) / 50.0));
    const buretteMeniscusY = 0.45 + (0.350 - dispensedFraction * 0.480);
    const buretteDistH = Math.sqrt(camera.position.x ** 2 + (camera.position.z - 0.18) ** 2);
    const buretteDeltaY = camera.position.y - buretteMeniscusY;
    const buretteAngleDeg = Math.atan2(buretteDeltaY, buretteDistH) * (180 / Math.PI);

    // Pipette calibration line World Y: ~0.334 m
    const pipetteDistH = Math.sqrt((camera.position.x - (-0.34)) ** 2 + (camera.position.z - 0.30) ** 2);
    const pipetteDeltaY = camera.position.y - 0.334;
    const pipetteAngleDeg = Math.atan2(pipetteDeltaY, pipetteDistH) * (180 / Math.PI);

    onParallaxUpdate?.(
      Number(buretteAngleDeg.toFixed(1)),
      Number(pipetteAngleDeg.toFixed(1))
    );
  });

  return null;
};

// Optical Sight Reticle Guideline at Burette Meniscus Level
const OpticalSightGuideline: React.FC<{ buretteVolumeMl: number; active: boolean }> = ({ buretteVolumeMl, active }) => {
  if (!active) return null;
  const dispensedFraction = Math.max(0, Math.min(1, (50.0 - buretteVolumeMl) / 50.0));
  const meniscusY = 0.45 + (0.350 - dispensedFraction * 0.480);

  return (
    <group position={[0, meniscusY, 0.18]}>
      {/* Fine Cyan Sight Line across meniscus width */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0003, 0.0003, 0.05, 8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} depthTest={false} />
      </mesh>
      {/* Outer Sight Crosshair Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.015, 0.016, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} depthTest={false} />
      </mesh>
    </group>
  );
};

interface CameraAnimatorProps {
  preset: CameraPreset;
  trigger?: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const CameraAnimator: React.FC<CameraAnimatorProps> = ({ preset, trigger = 0, controlsRef }) => {
  const isTransitioningRef = useRef(false);
  const targetPosRef = useRef(new THREE.Vector3());
  const targetLookRef = useRef(new THREE.Vector3());

  // Initiate smooth transition when preset or trigger changes
  useEffect(() => {
    const targetConfig = CAMERA_PRESETS[preset];
    if (targetConfig) {
      targetPosRef.current.set(...targetConfig.pos);
      targetLookRef.current.set(...targetConfig.target);
      isTransitioningRef.current = true;
    }
  }, [preset, trigger]);

  // Hook into OrbitControls events to auto-yield on manual drag/scroll
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const stopTransition = () => {
      isTransitioningRef.current = false;
    };

    controls.addEventListener('start', stopTransition);
    return () => {
      controls.removeEventListener('start', stopTransition);
    };
  }, [controlsRef]);

  useFrame((state, delta) => {
    if (!isTransitioningRef.current) return;

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetPosRef.current.x, 6, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetPosRef.current.y, 6, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetPosRef.current.z, 6, delta);

    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetLookRef.current.x, 6, delta);
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetLookRef.current.y, 6, delta);
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, targetLookRef.current.z, 6, delta);
      controlsRef.current.update();
    }

    const posDist = state.camera.position.distanceTo(targetPosRef.current);
    const lookDist = controlsRef.current
      ? controlsRef.current.target.distanceTo(targetLookRef.current)
      : 0;

    if (posDist < 0.005 && lookDist < 0.005) {
      state.camera.position.copy(targetPosRef.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookRef.current);
        controlsRef.current.update();
      }
      isTransitioningRef.current = false;
    }
  });

  return null;
};

export interface LabSceneProps {
  cameraPreset: CameraPreset;
  cameraTrigger?: number;
  onSelectPreset?: (preset: CameraPreset) => void;
  buretteVolumeMl: number;
  stopcockAngle: number;
  flowRegime: FlowRegime;
  dropsPerSec: number;
  hasHangingDrop: boolean;
  hasTipBubble?: boolean;
  onSetStopcockAngle: (angle: number) => void;
  onToggleValve?: () => void;
  flaskVolumeMl: number;
  liquidColor: string;
  liquidOpacity: number;
  isSwirling: boolean;
  isFlaskDocked: boolean;
  onSnapFlaskToBurette: () => void;
  onSwirlFlaskToggle: () => void;
  onAddIndicatorDrop: () => void;
  flaskDropsAdded: number;

  // Volumetric Pipette & Wash Bottle (Phase 1 Deliverables 1.2, 1.3, 1.4)
  pipetteState: PipetteState;
  pipetteVolumeMl: number;
  bulbCompressed: boolean;
  onPressValveA: () => void;
  onPressValveS: () => void;
  onPressValveE: () => void;
  onPipetteStateChange?: (state: PipetteState) => void;
  onSquirtWashBottle: () => void;

  // Funnel & Preparation Sequence
  isFunnelMounted?: boolean;
  onToggleFunnel?: () => void;

  // Parallax Telemetry
  onParallaxUpdate?: (buretteAngle: number, pipetteAngle: number) => void;
}

export const LabScene = React.forwardRef<LabSceneHandle, LabSceneProps>(
  (
    {
      cameraPreset,
      cameraTrigger = 0,
      onSelectPreset,
      buretteVolumeMl,
      stopcockAngle,
      flowRegime,
      dropsPerSec,
      hasHangingDrop,
      hasTipBubble = false,
      onSetStopcockAngle,
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
      pipetteState,
      pipetteVolumeMl,
      bulbCompressed,
      onPressValveA,
      onPressValveS,
      onPressValveE,
      onPipetteStateChange,
      onSquirtWashBottle,
      isFunnelMounted = false,
      onParallaxUpdate,
    },
    ref
  ) => {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (!controlsRef.current) return;
        const camera = controlsRef.current.object;
        const target = controlsRef.current.target;
        const offset = camera.position.clone().sub(target);
        offset.multiplyScalar(0.78);
        if (offset.length() >= 0.08) {
          camera.position.copy(target).add(offset);
          controlsRef.current.update();
        }
      },
      zoomOut: () => {
        if (!controlsRef.current) return;
        const camera = controlsRef.current.object;
        const target = controlsRef.current.target;
        const offset = camera.position.clone().sub(target);
        offset.multiplyScalar(1.28);
        if (offset.length() <= 6.5) {
          camera.position.copy(target).add(offset);
          controlsRef.current.update();
        }
      },
      resetView: () => {
        onSelectPreset?.('overview');
      },
    }));

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Canvas
          shadows
          camera={{ position: [-0.08, 0.88, 2.05], fov: 45 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          style={{ background: '#0f172a' }}
        >
          <CameraAnimator preset={cameraPreset} trigger={cameraTrigger} controlsRef={controlsRef} />

          {/* Real-time Image-Based Lighting from City HDR */}
          <Environment preset="city" />

          {/* Studio Lighting Setup for Borosilicate Glass Realism */}
          <ambientLight intensity={0.55} color="#f8fafc" />
          <directionalLight
            position={[3.5, 4.8, 3.0]}
            intensity={1.2}
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
          <pointLight position={[-2.5, 2.5, 1.2]} intensity={0.3} color="#bfdbfe" />
          <pointLight position={[2.5, 2.5, 1.2]} intensity={0.3} color="#f8fafc" />
          <pointLight position={[0, 2.4, 0.8]} intensity={0.45} color="#ffffff" />

          {/* Floor & Bench Contact Shadows */}
          <ContactShadows
            position={[0, -0.787, 0]}
            opacity={0.65}
            scale={12}
            blur={1.8}
            far={1.8}
            resolution={1024}
            color="#0b1120"
          />

          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.45}
            scale={5.5}
            blur={1.4}
            far={0.6}
            resolution={1024}
            color="#1e293b"
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enableRotate={true}
            enablePan={true}
            screenSpacePanning={true}
            enableZoom={true}
            minDistance={0.08}
            maxDistance={6.0}
            minPolarAngle={0.05}
            maxPolarAngle={Math.PI / 2 + 0.05}
          />

          {/* Realistic Architectural Environment */}
          <ModernLabBench />
          <WallMonitors />
          <LabAccessories />

          {/* High-Fidelity 3D Laboratory Apparatus Models */}
          <React.Suspense fallback={null}>
            <CentrifugeModel position={[-0.82, 0.0, 0.14]} rotation={[0, 0.15, 0]} scale={0.52} />
            <AnalyticalBalanceModel position={[-2.1, 0.0, -0.22]} rotation={[0, 0.4, 0]} scale={1.1} />
            <LabOvenModel position={[-2.1, 0.0, -0.72]} rotation={[-Math.PI / 2, 0, 0]} scale={0.45} />
            <ReagentBottleModel position={[-0.26, 0.3725, -0.24]} rotation={[-Math.PI / 2, 0, 0]} scale={1.0} amber={true} />
            <ReagentBottleModel position={[-0.15, 0.3725, -0.24]} rotation={[-Math.PI / 2, 0, 0]} scale={1.0} amber={false} />
            <VialRackModel position={[-0.88, 0.3725, -0.24]} rotation={[-Math.PI / 2, 0, 0]} scale={0.9} />
            <TestTubeRack position={[0.22, 0.7725, -0.24]} />
            <TestTubeRack position={[0.75, 0.7725, -0.24]} />
            <TestTubeRack position={[0.75, 0.3725, -0.24]} />
            <MicroscopeModel position={[1.32, 0.0, 0.14]} rotation={[0, -0.42, 0]} scale={0.68} />
            <ChemistrySetModel position={[1.68, 0.0, -0.05]} rotation={[0, -0.22, 0]} scale={0.65} />
            <ModernLabLaptop position={[0.86, 0.0, 0.18]} rotation={[0, -0.32, 0]} scale={0.90} />
            <ModernLabNotebook position={[0.50, 0.0, 0.24]} rotation={[0, 0.08, 0]} scale={0.92} />
            <RealStoolModel position={[0.10, -0.7875, 0.72]} rotation={[0, 0.3, 0]} scale={0.72} />
          </React.Suspense>

          {/* Spatial Audio Tracking */}
          <AudioListenerUpdater />

          {/* Meniscus Parallax Angle Telemetry */}
          <ParallaxTracker
            buretteVolumeMl={buretteVolumeMl}
            onParallaxUpdate={onParallaxUpdate}
          />

          {/* Optical Sight Guideline at Burette Meniscus Level */}
          <OpticalSightGuideline
            buretteVolumeMl={buretteVolumeMl}
            active={cameraPreset === 'burette'}
          />

          {/* ================= INTERACTIVE TITRATION APPARATUS ================= */}
          <RetortStand position={[0, 0.0, 0.18]} />

          <SocketVisualizer
            position={[0, 0.022, 0.18]}
            active={!isFlaskDocked}
            label="Place Flask Here"
            onClick={onSnapFlaskToBurette}
          />

          {/* Burette with Variable Flow Stopcock & Schellbach Refraction */}
          <Burette
            position={[0, 0.45, 0.18]}
            volumeMl={buretteVolumeMl}
            stopcockAngle={stopcockAngle}
            flowRegime={flowRegime}
            onSetStopcockAngle={onSetStopcockAngle}
            onToggleValve={onToggleValve}
            hasHangingDrop={hasHangingDrop}
            hasTipBubble={hasTipBubble}
          />

          {/* Glass Liquid Funnel for Burette Loading */}
          <GlassFunnel
            isMountedOnBurette={isFunnelMounted}
            position={[0.18, 0.0, 0.12]}
          />

          {/* Dynamic Multi-Regime Droplet / Stream Effect */}
          <DropletEffect
            regime={flowRegime}
            dropsPerSec={dropsPerSec}
            hasHangingDrop={hasHangingDrop}
            color="#38bdf8"
            zPos={0.18}
          />

          {/* 250 mL Analyte Erlenmeyer Flask */}
          <ErlenmeyerFlask
            position={isFlaskDocked ? [0, 0.021, 0.18] : [-0.18, 0.0, 0.30]}
            volumeMl={flaskVolumeMl}
            liquidColor={liquidColor}
            liquidOpacity={liquidOpacity}
            isSwirling={isSwirling}
            isDockedUnderBurette={isFlaskDocked}
            onSnapToBurette={onSnapFlaskToBurette}
            onSwirlToggle={onSwirlFlaskToggle}
            targetSocketPos={[0, 0.021, 0.18]}
          />

          {/* Waste Beaker for Tip Air-Bubble Purge */}
          <WasteBeaker position={[0.14, 0.0, 0.22]} />

          {/* Laboratory Acrylic / Steel Pipette Stand */}
          <PipetteStand position={[-0.50, 0.0, 0.28]} />

          {/* Stock Beaker: 0.100 M HCl Analyte */}
          <StockBeaker
            position={[-0.34, 0.0, 0.30]}
            volumeMl={150}
            highlighted={pipetteState === 'in_stock' || pipetteState === 'aspirating'}
          />

          {/* Titrant Beaker: 0.100 M NaOH Titrant Stock */}
          <TitrantBeaker
            position={[0.26, 0.0, 0.14]}
            volumeMl={180}
          />

          {/* Class AS 25.00 mL Volumetric Pipette with 3-Valve Bulb */}
          <VolumetricPipette
            pipetteState={pipetteState}
            aspiratedVolumeMl={pipetteVolumeMl}
            bulbCompressed={bulbCompressed}
            isFlaskDocked={isFlaskDocked}
            flaskPos={isFlaskDocked ? [0, 0.021, 0.18] : [-0.18, 0.0, 0.30]}
            stockPos={[-0.34, 0.0, 0.30]}
            standPos={[-0.50, 0.025, 0.28]}
            onPressValveA={onPressValveA}
            onPressValveS={onPressValveS}
            onPressValveE={onPressValveE}
            onStateChange={onPipetteStateChange}
          />

          {/* Deionized Water (DI H2O) LDPE Wash Bottle */}
          <WashBottle
            position={[-0.34, 0.0, 0.14]}
            targetFlaskPos={isFlaskDocked ? [0, 0.15, 0.18] : [-0.18, 0.15, 0.30]}
            onSquirt={onSquirtWashBottle}
          />

          {/* Indicator Dropper Bottle with Removable Glass Dropper */}
          <IndicatorBottle
            position={[0.22, 0.0, 0.26]}
            targetFlaskPos={isFlaskDocked ? [0, 0.18, 0.18] : [-0.18, 0.18, 0.30]}
            onAddDrop={onAddIndicatorDrop}
            disabled={flaskDropsAdded >= 3}
          />
        </Canvas>
      </div>
    );
  }
);

LabScene.displayName = 'LabScene';
