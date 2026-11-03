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

export interface LabState {
  currentStepIndex: number;
  isCompleted: boolean;
  score: number;
  mistakes: number;
  elapsedSeconds: number;
  
  // Experiment specific values
  buretteValveOpen: boolean;
  buretteVolumeMl: number; // Starts at 50ml, drains down
  flaskVolumeMl: number;   // Starts at 25ml (analyte)
  flaskDropsAdded: number; // Phenolphthalein drops
  flaskPH: number;
  isFlaskSwirling: boolean;
  
  // Telemetry stream
  telemetryLogs: XAPIStatement[];
}

