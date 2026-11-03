import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2 } from 'lucide-react';
import { LabScene, CameraPreset, LabSceneHandle } from './components/3d/LabScene';
import { LabHeader } from './components/ui/LabHeader';
import { StepGuide } from './components/ui/StepGuide';
import { MeasurementsPanel } from './components/ui/MeasurementsPanel';
import { CameraControls } from './components/ui/CameraControls';
import { TelemetryConsole } from './components/ui/TelemetryConsole';
import { TITRATION_STEPS, calculateTitrationPH, getPhenolphthaleinColor } from './data/titrationExperiment';
import { XAPIStatement, getStopcockFlowParameters, PipetteState } from './types/lab';
import { soundEngine } from './audio/SpatialSoundEngine';
import { voiceoverEngine } from './audio/VoiceoverEngine';

export const App: React.FC = () => {
  // Navigation & Camera
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [cameraTrigger, setCameraTrigger] = useState<number>(0);
  const labSceneRef = useRef<LabSceneHandle>(null);

  const handleSelectPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    setCameraTrigger((prev) => prev + 1);
  };

  // Experiment State Machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Spoken voiceover & accessibility subtitle state
  const [isVoiceMuted, setIsVoiceMuted] = useState(() => voiceoverEngine.getIsMuted());
  const [instructorSubtitle, setInstructorSubtitle] = useState('');

  // Meniscus Parallax Verification (Deliverable 1.2)
  const [buretteParallaxAngleDeg, setBuretteParallaxAngleDeg] = useState(0);
  const [pipetteParallaxAngleDeg, setPipetteParallaxAngleDeg] = useState(0);

  // Volumetric Pipetting & Preparation Subsystems (Phase 1 Deliverables 1.2, 1.3, 1.4)
  const [pipetteState, setPipetteState] = useState<PipetteState>('rack');
  const [pipetteVolumeMl, setPipetteVolumeMl] = useState(0);
  const pipetteVolumeRef = useRef(0);
  const [bulbCompressed, setBulbCompressed] = useState(false);
  const [isFlaskRinsed, setIsFlaskRinsed] = useState(false);
  const [isFunnelMounted, setIsFunnelMounted] = useState(false);

  // Simulation physical parameters
  const [isFlaskDocked, setIsFlaskDocked] = useState(false);
  const [flaskDropsAdded, setFlaskDropsAdded] = useState(0);
  const [stopcockAngle, setStopcockAngle] = useState(0); // 0° (closed) to 90° (fully open)
  const [hasHangingDrop, setHasHangingDrop] = useState(false);
  const [hasTipBubble, setHasTipBubble] = useState(true); // Air pocket trapped in nozzle tip
  const [buretteVolumeMl, setBuretteVolumeMl] = useState(50.0);
  const [flaskVolumeMl, setFlaskVolumeMl] = useState(0.0);
  const [isSwirling, setIsSwirling] = useState(false);

  // Flow dynamics derived from stopcock angle
  const flowParams = getStopcockFlowParameters(stopcockAngle);
  const dropAccumulatorRef = useRef(0);
  const nearEndpointWarnedRef = useRef(false);

  // Computed chemical values
  const [pH, setPH] = useState(7.0);
  const [liquidColor, setLiquidColor] = useState('#bae6fd');
  const [liquidOpacity, setLiquidOpacity] = useState(0.65);

  // Telemetry stream
  const [telemetryLogs, setTelemetryLogs] = useState<XAPIStatement[]>([]);

  const emitXAPI = useCallback((verb: string, object: string, details?: string) => {
    const newStatement: XAPIStatement = {
      id: `stmt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      verb,
      object,
      result: {
        success: true,
        details,
      },
    };
    setTelemetryLogs((prev) => [newStatement, ...prev.slice(0, 49)]);
  }, []);

  // Timer interval
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Voiceover Step Guidance Trigger
  useEffect(() => {
    voiceoverEngine.speakStepGuidance(currentStepIndex);
  }, [currentStepIndex]);

  // Subscribe to real-time voiceover subtitles
  useEffect(() => {
    return voiceoverEngine.subscribeSubtitles((text) => {
      setInstructorSubtitle(text);
    });
  }, []);

  // Initial mount telemetry statement
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      emitXAPI('initialized', 'virtual_lab:chem_titration_01', 'Student session started');
    }
  }, [emitXAPI]);

  // Continuous and dropwise fluid dynamics simulation loop
  useEffect(() => {
    if (stopcockAngle === 0 || buretteVolumeMl <= 0 || !isFlaskDocked) {
      dropAccumulatorRef.current = 0;
      soundEngine.stopStream();
      return;
    }

    const dt = 0.05; // 50ms per physics step (20 Hz)
    const interval = setInterval(() => {
      if (flowParams.regime === 'micro_drop') {
        setHasHangingDrop(true);
        soundEngine.stopStream();
        return;
      }

      let deltaVolume = 0;
      if (flowParams.regime === 'stream') {
        deltaVolume = flowParams.flowRateMlPerSec * dt;
        soundEngine.updateStream(flowParams.flowRateMlPerSec);
      } else if (flowParams.regime === 'dropwise') {
        soundEngine.stopStream();
        dropAccumulatorRef.current += flowParams.dropsPerSec * dt;
        if (dropAccumulatorRef.current >= 1.0) {
          dropAccumulatorRef.current -= 1.0;
          deltaVolume = 0.050; // DIN standard drop
          soundEngine.playDropPlop();
        }
      }

      if (deltaVolume <= 0) return;

      setBuretteVolumeMl((prevBurette) => {
        if (prevBurette <= 0) {
          setStopcockAngle(0);
          soundEngine.stopStream();
          return 0;
        }

        const nextBurette = Math.max(0, prevBurette - deltaVolume);
        const dispensed = 50.0 - nextBurette;

        setFlaskVolumeMl((prevFlask) => prevFlask + deltaVolume);

        // Update pH & Color based on dispensed NaOH
        const newPH = calculateTitrationPH(dispensed, 25.0, 0.100);
        setPH(newPH);

        const visual = getPhenolphthaleinColor(newPH, flaskDropsAdded);
        setLiquidColor(visual.color);
        setLiquidOpacity(visual.opacity);

        // Near endpoint warning
        if (dispensed >= 23.5 && dispensed <= 24.2 && !nearEndpointWarnedRef.current) {
          nearEndpointWarnedRef.current = true;
          voiceoverEngine.speakWarning('near_endpoint');
        }

        // Check for over-titration warning
        if (dispensed > 26.5 && mistakes === 0) {
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(70, s - 15));
          voiceoverEngine.speakWarning('over_titrated');
          emitXAPI('warning_triggered', 'chemistry:over_titrated', `Exceeded equivalence window (${dispensed.toFixed(2)} mL)`);
        }

        return nextBurette;
      });
    }, 50);

    return () => {
      clearInterval(interval);
      soundEngine.stopStream();
    };
  }, [stopcockAngle, buretteVolumeMl, isFlaskDocked, flowParams.regime, flowParams.flowRateMlPerSec, flowParams.dropsPerSec, flaskDropsAdded, mistakes, emitXAPI]);

  // Handle Stopcock Angle Adjustment
  const handleSetStopcockAngle = useCallback((newAngle: number) => {
    const angle = Math.max(0, Math.min(90, Math.round(newAngle)));
    setStopcockAngle(angle);
    soundEngine.playStopcockCreak();

    if (angle >= 5 && angle < 20) {
      setHasHangingDrop(true);
    } else if (angle >= 20) {
      setHasHangingDrop(false);
    }

    if (angle > 0 && hasTipBubble) {
      voiceoverEngine.speakWarning('tip_bubble');
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(70, s - 5));
      emitXAPI('warning_triggered', 'burette_stopcock', 'Dispensed titrant with air pocket trapped in delivery tip');
    }

    const nextParams = getStopcockFlowParameters(angle);
    emitXAPI('adjusted_stopcock', 'burette_stopcock', `Angle set to ${angle}° [${nextParams.regime.toUpperCase()}]`);

    // Check endpoint completion when closing valve in Step 5
    if (angle === 0 && currentStepIndex === 5) {
      const dispensed = 50.0 - buretteVolumeMl;

      // Parallax verification penalty if reading obliquely
      if (Math.abs(buretteParallaxAngleDeg) > 2.5) {
        voiceoverEngine.speakWarning('parallax_error');
        setMistakes((m) => m + 1);
        setScore((s) => Math.max(70, s - 5));
        emitXAPI('warning_triggered', 'parallax_error', `Read burette with parallax error (${buretteParallaxAngleDeg}° oblique)`);
      }

      if (dispensed >= 24.2 && dispensed <= 26.0) {
        setIsCompleted(true);
        setCurrentStepIndex(6);
        soundEngine.playSuccessChime();
        emitXAPI('completed_experiment', 'acid_base_titration', `Success with score ${score}% (V = ${dispensed.toFixed(2)} mL)`);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  }, [hasTipBubble, buretteVolumeMl, currentStepIndex, buretteParallaxAngleDeg, score, emitXAPI]);

  // Discrete Drop Precision Actions
  const handleDispenseSingleDrop = useCallback(() => {
    if (buretteVolumeMl <= 0 || !isFlaskDocked) return;
    const dropVol = 0.050;
    const nextBurette = Math.max(0, buretteVolumeMl - dropVol);
    const dispensed = 50.0 - nextBurette;
    setBuretteVolumeMl(nextBurette);
    setFlaskVolumeMl((prev) => prev + dropVol);
    setHasHangingDrop(false);
    soundEngine.playDropPlop();

    const newPH = calculateTitrationPH(dispensed, 25.0, 0.100);
    setPH(newPH);
    const visual = getPhenolphthaleinColor(newPH, flaskDropsAdded);
    setLiquidColor(visual.color);
    setLiquidOpacity(visual.opacity);

    emitXAPI('dispensed_single_drop', 'burette_stopcock', `Added 0.050 mL; V_total = ${dispensed.toFixed(2)} mL`);
  }, [buretteVolumeMl, isFlaskDocked, flaskDropsAdded, emitXAPI]);

  const handleTapHangingDrop = useCallback(() => {
    if (!hasHangingDrop || buretteVolumeMl <= 0 || !isFlaskDocked) return;
    const beadVol = 0.015;
    const nextBurette = Math.max(0, buretteVolumeMl - beadVol);
    const dispensed = 50.0 - nextBurette;
    setBuretteVolumeMl(nextBurette);
    setFlaskVolumeMl((prev) => prev + beadVol);
    setHasHangingDrop(false);
    soundEngine.playDropPlop([0, 0.05, 0.18], 0.16);

    const newPH = calculateTitrationPH(dispensed, 25.0, 0.100);
    setPH(newPH);
    const visual = getPhenolphthaleinColor(newPH, flaskDropsAdded);
    setLiquidColor(visual.color);
    setLiquidOpacity(visual.opacity);

    emitXAPI('tapped_hanging_drop', 'burette_tip', `Transferred 0.015 mL hanging bead; V_total = ${dispensed.toFixed(2)} mL`);
  }, [hasHangingDrop, buretteVolumeMl, isFlaskDocked, flaskDropsAdded, emitXAPI]);

  // Purge Tip Air Bubble into Waste Beaker
  const handlePurgeTipBubble = useCallback(() => {
    soundEngine.playBubblePurge([0, 0.15, 0.18]);
    setHasTipBubble(false);
    emitXAPI('purged_bubble', 'burette_tip', 'Dislodged air pocket into waste beaker');
  }, [emitXAPI]);

  // ================= VOLUMETRIC PIPETTING HANDLERS (Deliverable 1.2) =================
  const handlePressValveA = useCallback(() => {
    console.log('[DEBUG] handlePressValveA called');
    setBulbCompressed(true);
    soundEngine.playBulbValve('A');
    emitXAPI('compressed_bulb', 'pipette_filler', 'Expelled air from rubber bulb reservoir');
  }, [emitXAPI]);

  const handlePressValveS = useCallback(() => {
    console.log('[DEBUG] handlePressValveS called. bulbCompressed:', bulbCompressed, 'pipetteState:', pipetteState);
    soundEngine.playBulbValve('S');
    if (!bulbCompressed) {
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(70, s - 5));
      voiceoverEngine.speakWarning('missing_valve_a');
      emitXAPI('warning_triggered', 'pipette_filler', 'Must squeeze Valve A to expel air before suction');
      return;
    }

    const current = pipetteVolumeRef.current;
    const nextVol = Math.min(26.0, Number((current + 1.25).toFixed(2)));
    pipetteVolumeRef.current = nextVol;
    setPipetteVolumeMl(nextVol);

    if (pipetteState === 'rack') {
      setPipetteState('in_stock');
    } else if (nextVol >= 24.95) {
      setPipetteState('aligning');
    } else {
      setPipetteState('aspirating');
    }

    emitXAPI('suction_analyte', 'volumetric_pipette', `Drawing liquid: ${nextVol.toFixed(2)} mL`);
  }, [bulbCompressed, pipetteState, emitXAPI]);

  const handlePressValveE = useCallback(() => {
    console.log('[DEBUG] handlePressValveE called');
    soundEngine.playBulbValve('E');
    const current = pipetteVolumeRef.current;
    const nextVol = Math.max(0, Number((current - 0.10).toFixed(2)));
    pipetteVolumeRef.current = nextVol;
    setPipetteVolumeMl(nextVol);

    if (nextVol >= 24.95 && nextVol <= 25.05) {
      emitXAPI('aligned_meniscus', 'volumetric_pipette', 'Meniscus bottom sits tangent to Class AS graduation mark (25.00 mL)');
      if (currentStepIndex === 0) {
        setCurrentStepIndex(1);
      }
    }
  }, [currentStepIndex, emitXAPI]);

  const handleMovePipetteToStock = useCallback(() => {
    console.log('[DEBUG] handleMovePipetteToStock called');
    setPipetteState('in_stock');
    soundEngine.playGlassClink([-0.34, 0.08, 0.30], 0.25);
    emitXAPI('positioned_pipette', 'stock_beaker', 'Submerged delivery jet into 0.100 M HCl stock solution');
  }, [emitXAPI]);

  const handleAlignMeniscus = useCallback(() => {
    if (Math.abs(pipetteParallaxAngleDeg) > 2.5) {
      voiceoverEngine.speakWarning('parallax_error');
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(70, s - 5));
      emitXAPI('warning_triggered', 'parallax_error', `Aligned meniscus with parallax error (${pipetteParallaxAngleDeg}° oblique)`);
    }

    soundEngine.playBulbValve('E');
    pipetteVolumeRef.current = 25.00;
    setPipetteVolumeMl(25.00);
    setPipetteState('aligning');
    emitXAPI('aligned_meniscus', 'volumetric_pipette', 'Meniscus bottom sits tangent to Class AS graduation mark (25.00 mL)');
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  }, [pipetteParallaxAngleDeg, currentStepIndex, emitXAPI]);

  const handleTransferPipetteToFlask = useCallback(() => {
    setPipetteState('above_flask');
    emitXAPI('transferred_pipette', 'erlenmeyer_flask', 'Positioned pipette above flask neck');
  }, [emitXAPI]);

  const handleDrainPipetteToFlask = useCallback(() => {
    setPipetteState('draining');
    const flaskClinkPos: [number, number, number] = isFlaskDocked ? [0.014, 0.115, 0.18] : [-0.166, 0.115, 0.30];
    soundEngine.playGlassClink(flaskClinkPos, 0.25);
    emitXAPI('draining_analyte', 'volumetric_pipette', 'Draining 25.00 mL aliquot against inner flask wall (DIN ISO 648 Ex + 15s)');

    setTimeout(() => {
      setFlaskVolumeMl(25.00);
      pipetteVolumeRef.current = 0;
      setPipetteVolumeMl(0);
      setPipetteState('finished');
      setPH(1.0); // 0.100 M HCl in flask
      soundEngine.playDropPlop(isFlaskDocked ? [0, 0.05, 0.18] : [-0.18, 0.05, 0.30], 0.35);
      emitXAPI('dispensed_analyte', 'erlenmeyer_flask', 'Delivered exactly 25.00 mL of 0.100 M HCl into flask');
      if (currentStepIndex === 1) {
        setCurrentStepIndex(2);
      }
    }, 1400);
  }, [isFlaskDocked, currentStepIndex, emitXAPI]);

  // Handle Free-hand Pipette 3D State changes
  const handlePipetteStateChange = useCallback((newState: PipetteState) => {
    setPipetteState(newState);
    emitXAPI('dragged_apparatus', 'volumetric_pipette', `Placed into socket [${newState.toUpperCase()}]`);
  }, [emitXAPI]);

  // ================= WASH BOTTLE HANDLER (Deliverable 1.3) =================
  const handleSquirtWashBottle = useCallback(() => {
    setIsFlaskRinsed(true);
    setFlaskVolumeMl((prev) => prev + (prev > 0 ? 2.0 : 0));
    emitXAPI('rinsed_flask', 'wash_bottle', 'Flushed flask neck with 2.0 mL DI water');
    if (currentStepIndex === 2) {
      setCurrentStepIndex(3);
    }
  }, [currentStepIndex, emitXAPI]);

  // Indicator Drop Handler
  const handleAddIndicatorDrop = () => {
    if (flaskDropsAdded >= 3) return;

    const nextDrops = flaskDropsAdded + 1;
    setFlaskDropsAdded(nextDrops);
    emitXAPI('interacted', 'phenolphthalein_bottle', `Dispensed indicator drop #${nextDrops}`);

    if (nextDrops === 3 && currentStepIndex === 3) {
      setCurrentStepIndex(4);
      emitXAPI('completed_step', 'step_04:standardized_indicator', 'Indicator standardized in flask');
    }
  };

  // Flask Mount Handler
  const handleSnapFlaskToBurette = () => {
    setIsFlaskDocked(true);
    soundEngine.playGlassClink([0, 0.02, 0.18], 0.3);
    emitXAPI('docked', 'erlenmeyer_flask', 'Mounted under burette socket on contrast tile');
    if (currentStepIndex === 4) {
      setCurrentStepIndex(5);
      setCameraPreset('titration');
      emitXAPI('completed_step', 'step_05:mount_flask', 'Ready for titration');
    }
  };

  const handleToggleValve = () => {
    if (!isFlaskDocked) return;
    handleSetStopcockAngle(stopcockAngle > 0 ? 0 : 30);
  };

  const handleToggleSwirl = () => {
    const nextSwirling = !isSwirling;
    setIsSwirling(nextSwirling);
    if (nextSwirling) {
      soundEngine.startStirrer(isFlaskDocked ? [0, 0.02, 0.18] : [-0.18, 0.02, 0.30]);
    } else {
      soundEngine.stopStirrer();
    }
    emitXAPI(nextSwirling ? 'started_swirl' : 'stopped_swirl', 'erlenmeyer_flask');
  };

  const handleToggleVoice = useCallback(() => {
    const next = !isVoiceMuted;
    setIsVoiceMuted(next);
    voiceoverEngine.setMuted(next);
  }, [isVoiceMuted]);

  // Real-time Meniscus Parallax Angle Telemetry Update
  const handleParallaxUpdate = useCallback((buretteAngle: number, pipetteAngle: number) => {
    setBuretteParallaxAngleDeg(buretteAngle);
    setPipetteParallaxAngleDeg(pipetteAngle);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleSetStopcockAngle(stopcockAngle > 0 ? 0 : 30);
          break;
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          handleSetStopcockAngle(Math.min(90, stopcockAngle + 5));
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          handleSetStopcockAngle(Math.max(0, stopcockAngle - 5));
          break;
        case 'Digit1':
          handleSetStopcockAngle(0);
          break;
        case 'Digit2':
          handleSetStopcockAngle(15);
          break;
        case 'Digit3':
          handleSetStopcockAngle(30);
          break;
        case 'Digit4':
          handleSetStopcockAngle(90);
          break;
        case 'KeyD':
          handleDispenseSingleDrop();
          break;
        case 'KeyT':
          handleTapHangingDrop();
          break;
        case 'KeyA':
          handlePressValveA();
          break;
        case 'KeyR':
          handleSquirtWashBottle();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopcockAngle, handleSetStopcockAngle, handleDispenseSingleDrop, handleTapHangingDrop, handlePressValveA, handleSquirtWashBottle]);

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setScore(100);
    setMistakes(0);
    setElapsedSeconds(0);
    setPipetteState('rack');
    pipetteVolumeRef.current = 0;
    setPipetteVolumeMl(0);
    setBulbCompressed(false);
    setIsFlaskRinsed(false);
    setIsFlaskDocked(false);
    setFlaskDropsAdded(0);
    setStopcockAngle(0);
    setHasHangingDrop(false);
    setHasTipBubble(true);
    setIsFunnelMounted(false);
    dropAccumulatorRef.current = 0;
    nearEndpointWarnedRef.current = false;
    setBuretteVolumeMl(50.0);
    setFlaskVolumeMl(0.0);
    setIsSwirling(false);
    setPH(7.0);
    setLiquidColor('#bae6fd');
    setLiquidOpacity(0.65);
    handleSelectPreset('overview');
    soundEngine.stopStream();
    soundEngine.stopStirrer();
    emitXAPI('reset_session', 'virtual_lab:chem_titration_01', 'Reset apparatus to clean state');
  };

  return (
    <div className="lab-app-container">
      {/* Top Navigation & Status Bar */}
      <LabHeader
        score={score}
        elapsedSeconds={elapsedSeconds}
        onReset={handleReset}
        isVoiceMuted={isVoiceMuted}
        onToggleVoice={handleToggleVoice}
      />

      {/* Main Canvas & Overlay Viewport */}
      <main className="lab-viewport">
        {/* Floating Instructor Voiceover HUD Prompt Bar */}
        {instructorSubtitle && (
          <div className="instructor-voice-hud">
            <div className="instructor-hud-icon">
              <Volume2 size={16} />
            </div>
            <div className="instructor-hud-text">
              <span className="instructor-hud-speaker">Lab Instructor:</span>
              {instructorSubtitle}
            </div>
          </div>
        )}

        {/* 3D WebGL Canvas */}
        <LabScene
          ref={labSceneRef}
          cameraPreset={cameraPreset}
          cameraTrigger={cameraTrigger}
          onSelectPreset={handleSelectPreset}
          buretteVolumeMl={buretteVolumeMl}
          stopcockAngle={stopcockAngle}
          flowRegime={flowParams.regime}
          dropsPerSec={flowParams.dropsPerSec}
          hasHangingDrop={hasHangingDrop}
          hasTipBubble={hasTipBubble}
          onSetStopcockAngle={handleSetStopcockAngle}
          onToggleValve={handleToggleValve}
          flaskVolumeMl={flaskVolumeMl}
          liquidColor={liquidColor}
          liquidOpacity={liquidOpacity}
          isSwirling={isSwirling}
          isFlaskDocked={isFlaskDocked}
          onSnapFlaskToBurette={handleSnapFlaskToBurette}
          onSwirlFlaskToggle={handleToggleSwirl}
          onAddIndicatorDrop={handleAddIndicatorDrop}
          flaskDropsAdded={flaskDropsAdded}
          pipetteState={pipetteState}
          pipetteVolumeMl={pipetteVolumeMl}
          bulbCompressed={bulbCompressed}
          onPressValveA={handlePressValveA}
          onPressValveS={handlePressValveS}
          onPressValveE={handlePressValveE}
          onPipetteStateChange={handlePipetteStateChange}
          onSquirtWashBottle={handleSquirtWashBottle}
          isFunnelMounted={isFunnelMounted}
          onToggleFunnel={() => setIsFunnelMounted((prev) => !prev)}
          onParallaxUpdate={handleParallaxUpdate}
        />

        {/* Floating Camera Angle Selector & Zoom Controls */}
        <CameraControls
          currentPreset={cameraPreset}
          onSelectPreset={handleSelectPreset}
          onZoomIn={() => labSceneRef.current?.zoomIn()}
          onZoomOut={() => labSceneRef.current?.zoomOut()}
          onResetView={() => handleSelectPreset('overview')}
        />

        {/* Floating Side Panels */}
        <div className="lab-overlay-sidebar">
          <StepGuide
            steps={TITRATION_STEPS}
            currentStepIndex={currentStepIndex}
            isCompleted={isCompleted}
            mistakes={mistakes}
          />

          <MeasurementsPanel
            buretteVolumeMl={buretteVolumeMl}
            flaskVolumeMl={flaskVolumeMl}
            flaskDropsAdded={flaskDropsAdded}
            pH={pH}
            isSwirling={isSwirling}
            stopcockAngle={stopcockAngle}
            flowRegime={flowParams.regime}
            flowRateMlPerSec={flowParams.flowRateMlPerSec}
            dropsPerSec={flowParams.dropsPerSec}
            hasHangingDrop={hasHangingDrop}
            hasTipBubble={hasTipBubble}
            isFlaskDocked={isFlaskDocked}
            onSnapFlaskToBurette={handleSnapFlaskToBurette}
            onSetStopcockAngle={handleSetStopcockAngle}
            onToggleValve={handleToggleValve}
            onDispenseSingleDrop={handleDispenseSingleDrop}
            onTapHangingDrop={handleTapHangingDrop}
            onPurgeTipBubble={handlePurgeTipBubble}
            onToggleSwirl={handleToggleSwirl}
            onAddIndicatorDrop={handleAddIndicatorDrop}
            pipetteState={pipetteState}
            pipetteVolumeMl={pipetteVolumeMl}
            bulbCompressed={bulbCompressed}
            isFlaskRinsed={isFlaskRinsed}
            onPressValveA={handlePressValveA}
            onPressValveS={handlePressValveS}
            onPressValveE={handlePressValveE}
            onMovePipetteToStock={handleMovePipetteToStock}
            onTransferPipetteToFlask={handleTransferPipetteToFlask}
            onDrainPipetteToFlask={handleDrainPipetteToFlask}
            onSquirtWashBottle={handleSquirtWashBottle}
            onAlignMeniscus={handleAlignMeniscus}
            buretteParallaxAngleDeg={buretteParallaxAngleDeg}
            pipetteParallaxAngleDeg={pipetteParallaxAngleDeg}
          />
        </div>
      </main>

      {/* Bottom Collapsible xAPI LMS Telemetry Drawer */}
      <TelemetryConsole logs={telemetryLogs} />
    </div>
  );
};
