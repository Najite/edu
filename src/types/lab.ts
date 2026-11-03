export type EquipmentType = 
  | 'erlenmeyer_flask'
  | 'burette'
  | 'indicator_bottle'
  | 'retort_stand'
  | 'beaker';

export interface Vector3Coord {
  x: number;
  y: number;
  z: number;
}

export interface SocketPoint {
  id: string;
  name: string;
  position: [number, number, number];
  acceptedTypes: EquipmentType[];
  occupiedBy?: string;
  highlighted?: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  position: [number, number, number];
  rotation?: [number, number, number];
  currentSocketId?: string;
  isDraggable: boolean;
  volumeMl: number;
  maxVolumeMl: number;
  liquidColor: string;
  liquidOpacity: number;
  pH: number;
}

export interface ExperimentStep {
  index: number;
  title: string;
  instruction: string;
  detailedHelp: string;
  targetObject: string;
  validationCheck: (state: LabState) => boolean;
  hint: string;
}

export interface XAPIStatement {
  id: string;
  timestamp: string;
  verb: string;
  object: string;
  result?: {
    success: boolean;
    score?: number;
    details?: string;
  };
}

export type FlowRegime = 'closed' | 'micro_drop' | 'dropwise' | 'stream';

export interface StopcockFlowParams {
  regime: FlowRegime;
  flowRateMlPerSec: number;
  dropsPerSec: number;
  isFlowing: boolean;
  hangingDropVolumeMl?: number;
}

export function getStopcockFlowParameters(angleDegrees: number): StopcockFlowParams {
  const angle = Math.max(0, Math.min(90, angleDegrees));
  if (angle < 5) {
    return {
      regime: 'closed',
      flowRateMlPerSec: 0,
      dropsPerSec: 0,
      isFlowing: false,
    };
  } else if (angle < 20) {
    return {
      regime: 'micro_drop',
      flowRateMlPerSec: 0,
      dropsPerSec: 0,
      isFlowing: true,
      hangingDropVolumeMl: 0.015,
    };
  } else if (angle < 45) {
    const progress = (angle - 20) / 25; // 0 to 1
    const dropsPerSec = 0.8 + progress * 2.2; // 0.8 to 3.0 drops/sec
    const dropVolumeMl = 0.050; // DIN standard drop volume
    return {
      regime: 'dropwise',
      flowRateMlPerSec: dropsPerSec * dropVolumeMl,
      dropsPerSec,
      isFlowing: true,
    };
  } else {
    const progress = (angle - 45) / 45; // 0 to 1
    const flowRateMlPerSec = 0.20 + progress * progress * 1.60; // 0.20 to 1.80 mL/s
    return {
      regime: 'stream',
      flowRateMlPerSec,
      dropsPerSec: 0,
      isFlowing: true,
    };
  }
}

export type PipetteState =
  | 'rack'
  | 'in_stock'
  | 'aspirating'
  | 'aligning'
  | 'above_flask'
  | 'draining'
  | 'finished';

export interface LabState {
  currentStepIndex: number;
  isCompleted: boolean;
  score: number;
  mistakes: number;
  elapsedSeconds: number;
  
  // Experiment specific values
  buretteValveOpen: boolean;
  stopcockAngle: number; // 0 to 90 degrees
  flowRegime: FlowRegime;
  hasHangingDrop: boolean;
  hasTipBubble: boolean;
  buretteVolumeMl: number; // Starts at 50ml, drains down
  flaskVolumeMl: number;   // Starts at 0, filled to 25ml with pipette
  flaskDropsAdded: number; // Phenolphthalein drops
  flaskPH: number;
  isFlaskSwirling: boolean;
  isFlaskDocked: boolean;
  isFlaskRinsed: boolean;

  // Volumetric Pipetting (Phase 1, Deliverable 1.2)
  pipetteState: PipetteState;
  pipetteVolumeMl: number; // 0 to 26 mL (25.00 mL calibrated line)
  pipetteBulbCompressed: boolean;
  
  // Telemetry stream
  telemetryLogs: XAPIStatement[];
}

