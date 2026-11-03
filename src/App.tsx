import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { LabScene, CameraPreset } from './components/3d/LabScene';
import { LabHeader } from './components/ui/LabHeader';
import { StepGuide } from './components/ui/StepGuide';
import { MeasurementsPanel } from './components/ui/MeasurementsPanel';
import { CameraControls } from './components/ui/CameraControls';
import { TelemetryConsole } from './components/ui/TelemetryConsole';
import { TITRATION_STEPS, calculateTitrationPH, getPhenolphthaleinColor } from './data/titrationExperiment';
import { XAPIStatement } from './types/lab';

export const App: React.FC = () => {
  // Navigation & Camera
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Experiment State Machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Simulation physical parameters
  const [isFlaskDocked, setIsFlaskDocked] = useState(false);
  const [flaskDropsAdded, setFlaskDropsAdded] = useState(0);
  const [buretteValveOpen, setBuretteValveOpen] = useState(false);
  const [buretteVolumeMl, setBuretteVolumeMl] = useState(50.0);
  const [flaskVolumeMl, setFlaskVolumeMl] = useState(25.0);
  const [isSwirling, setIsSwirling] = useState(false);

  // Computed chemical values
  const [pH, setPH] = useState(1.0);
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

  // Initial mount telemetry statement
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      emitXAPI('initialized', 'virtual_lab:chem_titration_01', 'Student session started');
    }
  }, [emitXAPI]);

  // Titration dispensing simulation loop
  useEffect(() => {
    if (!buretteValveOpen) return;

    const interval = setInterval(() => {
      setBuretteVolumeMl((prevBurette) => {
        if (prevBurette <= 0) {
          setBuretteValveOpen(false);
          return 0;
        }

        const dropAmount = 0.15; // mL per tick
        const nextBurette = Math.max(0, prevBurette - dropAmount);
        const dispensed = 50.0 - nextBurette;

        setFlaskVolumeMl(25.0 + dispensed);

        // Update pH & Color
        const newPH = calculateTitrationPH(dispensed);
        setPH(newPH);

        const visual = getPhenolphthaleinColor(newPH, flaskDropsAdded);
        setLiquidColor(visual.color);
        setLiquidOpacity(visual.opacity);

        // Auto-advance from Step 2 to Step 3 when dispensing starts
        if (currentStepIndex === 2 && dispensed > 0.5) {
          setCurrentStepIndex(3);
          emitXAPI('transitioned_step', 'step_03:reach_endpoint', `Titration commenced at ${dispensed.toFixed(1)} mL`);
        }

        // Check for over-titration warning
        if (dispensed > 26.5 && mistakes === 0) {
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(70, s - 15));
          emitXAPI('warning_triggered', 'chemistry:over_titrated', `Exceeded equivalence window (${dispensed.toFixed(1)} mL)`);
        }

        return nextBurette;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [buretteValveOpen, currentStepIndex, flaskDropsAdded, mistakes, emitXAPI]);

  // Handlers
  const handleSnapFlaskToBurette = () => {
    setIsFlaskDocked(true);
    emitXAPI('docked', 'erlenmeyer_flask', 'Mounted under burette socket');
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
      setCameraPreset('titration');
      emitXAPI('completed_step', 'step_01:position_flask', '10 points awarded');
    }
  };

  const handleAddIndicatorDrop = () => {
    if (flaskDropsAdded >= 3) return;

    const nextDrops = flaskDropsAdded + 1;
    setFlaskDropsAdded(nextDrops);
    emitXAPI('interacted', 'phenolphthalein_bottle', `Dispensed drop #${nextDrops}`);

    if (nextDrops === 3 && currentStepIndex === 1) {
      setCurrentStepIndex(2);
      emitXAPI('completed_step', 'step_02:add_indicator', 'Indicator standardized');
    }
  };

  const handleToggleValve = () => {
    if (!isFlaskDocked) return;

    const nextState = !buretteValveOpen;
    setBuretteValveOpen(nextState);

    emitXAPI(nextState ? 'opened_valve' : 'closed_valve', 'burette_stopcock', `Level at ${buretteVolumeMl.toFixed(1)} mL`);

    // Check endpoint completion when closing the valve in Step 3
    if (!nextState && currentStepIndex === 3) {
      const dispensed = 50.0 - buretteVolumeMl;
      if (dispensed >= 24.2 && dispensed <= 26.0) {
        setIsCompleted(true);
        setCurrentStepIndex(4);
        emitXAPI('completed_experiment', 'acid_base_titration', `Success with score ${score}% (V = ${dispensed.toFixed(1)} mL)`);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleToggleSwirl = () => {
    setIsSwirling((prev) => !prev);
    emitXAPI(isSwirling ? 'stopped_swirl' : 'started_swirl', 'erlenmeyer_flask');
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setScore(100);
    setMistakes(0);
    setElapsedSeconds(0);
    setIsFlaskDocked(false);
    setFlaskDropsAdded(0);
    setBuretteValveOpen(false);
    setBuretteVolumeMl(50.0);
    setFlaskVolumeMl(25.0);
    setIsSwirling(false);
    setPH(1.0);
    setLiquidColor('#bae6fd');
    setLiquidOpacity(0.65);
    setCameraPreset('overview');
    emitXAPI('reset_session', 'virtual_lab:chem_titration_01', 'Reset apparatus to clean state');
  };

  return (
    <div className="lab-app-container">
      {/* Top Navigation & Status Bar */}
      <LabHeader
        score={score}
        elapsedSeconds={elapsedSeconds}
        onReset={handleReset}
      />

      {/* Main Canvas & Overlay Viewport */}
      <main className="lab-viewport">
        {/* 3D WebGL Canvas */}
        <LabScene
          cameraPreset={cameraPreset}
          buretteVolumeMl={buretteVolumeMl}
          buretteValveOpen={buretteValveOpen}
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
        />

        {/* Floating Camera Angle Selector */}
        <CameraControls
          currentPreset={cameraPreset}
          onSelectPreset={setCameraPreset}
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
            buretteValveOpen={buretteValveOpen}
            isFlaskDocked={isFlaskDocked}
            onToggleValve={handleToggleValve}
            onToggleSwirl={handleToggleSwirl}
            onAddIndicatorDrop={handleAddIndicatorDrop}
          />
        </div>
      </main>

      {/* Bottom Collapsible xAPI LMS Telemetry Drawer */}
      <TelemetryConsole logs={telemetryLogs} />
    </div>
  );
};

