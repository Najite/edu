import { ExperimentStep, LabState } from '../types/lab';

export const TITRATION_STEPS: ExperimentStep[] = [
  {
    index: 0,
    title: 'Aspirate 25.00 mL Analyte with Pipette',
    instruction: 'Use the 25 mL Class AS volumetric pipette to draw 0.100 M HCl from the stock beaker. Compress bulb (Valve A), draw solution above graduation line (Valve S), then align the bottom of the meniscus with the calibration mark (Valve E).',
    detailedHelp: 'Click Valve A to expel air, hold Valve S to draw liquid up into the pipette barrel, and use Valve E to drain until the bottom of the curved meniscus sits tangent to the circular etched ring.',
    targetObject: 'volumetric_pipette',
    hint: 'Accurate analytical titrations require exact volumetric transfer (±0.03 mL). Ensure the meniscus is tangent to the line.',
    validationCheck: (state: LabState) => {
      return state.pipetteVolumeMl >= 24.95 && state.pipetteVolumeMl <= 25.05;
    },
  },
  {
    index: 1,
    title: 'Transfer Analyte into Erlenmeyer Flask',
    instruction: 'Transfer the pipette over the 250 mL Erlenmeyer flask and drain (Valve E). Hold the tip against the inner flask wall for 15 seconds to ensure complete DIN drainage.',
    detailedHelp: 'Click "Drain to Flask" (Valve E) to release the 25.00 mL aliquot into the flask. Do not blow out the remaining residual droplet in the tip (calibrated for delivery Ex + 15s).',
    targetObject: 'volumetric_pipette',
    hint: 'Volumetric pipettes are calibrated to retain a tiny droplet in the tip via capillary action. Never blow it out.',
    validationCheck: (state: LabState) => {
      return state.flaskVolumeMl >= 24.5;
    },
  },
  {
    index: 2,
    title: 'Rinse Flask Neck with DI Water',
    instruction: 'Use the deionized water wash bottle to rinse down the neck and inside walls of the flask.',
    detailedHelp: 'Click the DI water wash bottle to squirt a fine jet around the flask mouth. Adding pure water ensures all acid enters the solution without changing the moles of H+.',
    targetObject: 'wash_bottle',
    hint: 'DI water adds volume but zero moles of solute, preserving titration stoichiometry.',
    validationCheck: (state: LabState) => {
      return state.isFlaskRinsed;
    },
  },
  {
    index: 3,
    title: 'Add Phenolphthalein Indicator',
    instruction: 'Add 3 drops of Phenolphthalein indicator solution into the Erlenmeyer flask.',
    detailedHelp: 'Click on the dropper bottle to dispense 3 drops into the flask. Swirl gently to mix.',
    targetObject: 'indicator_bottle',
    hint: 'Phenolphthalein is clear in acidic conditions and turns faint pink at pH 8.2 - 8.6.',
    validationCheck: (state: LabState) => {
      return state.flaskDropsAdded >= 3;
    },
  },
  {
    index: 4,
    title: 'Mount Flask on Titration Stand',
    instruction: 'Place the Erlenmeyer flask onto the white contrast tile beneath the burette tip.',
    detailedHelp: 'Drag the flask or click the snap target beneath the burette clamp.',
    targetObject: 'flask_01',
    hint: 'The white tile provides optical contrast to detect the faint pink color transition.',
    validationCheck: (state: LabState) => {
      return state.isFlaskDocked;
    },
  },
  {
    index: 5,
    title: 'Titrate with NaOH to Equivalence Endpoint',
    instruction: 'Open the burette stopcock and titrate dropwise with 0.100 M NaOH until a faint pink blush persists for at least 30 seconds upon swirling (V ≈ 25.0 mL).',
    detailedHelp: 'Use stream mode for the initial rapid addition, then transition to dropwise (30°) and single drops (D) or micro-drop taps (T) near the endpoint.',
    targetObject: 'burette_01',
    hint: 'Equivalence point occurs at exactly 25.00 mL of NaOH added. Stop as soon as the color turns faint pink (pH ~ 8.2).',
    validationCheck: (state: LabState) => {
      const dispensed = 50.0 - state.buretteVolumeMl;
      return state.stopcockAngle === 0 && dispensed >= 24.2 && dispensed <= 26.0;
    },
  },
  {
    index: 6,
    title: 'Titration Protocol Completed',
    instruction: 'Congratulations! You have achieved an accurate endpoint. Record the initial (0.00 mL), final (25.00 mL), and net volume (ΔV) in your lab notebook.',
    detailedHelp: 'Net titrant volume: 25.00 mL. Analyte concentration confirmed: C_acid = (C_base × V_base) / V_acid = 0.100 M.',
    targetObject: 'flask_01',
    hint: 'Check your digital notebook and review the telemetry console.',
    validationCheck: () => true,
  },
];

/**
 * Calculates theoretical pH curve for Strong Acid (HCl) - Strong Base (NaOH) titration
 * Analyte: 25.0 mL of 0.100 M HCl = 0.0025 moles H+
 * Titrant: 0.100 M NaOH
 */
export function calculateTitrationPH(dispensedNaOH_ml: number, initialHCl_ml = 25.0, molarity = 0.100): number {
  const molesHClInitial = (initialHCl_ml / 1000) * molarity;
  const molesNaOHAdded = (dispensedNaOH_ml / 1000) * molarity;
  const totalVolumeL = (initialHCl_ml + dispensedNaOH_ml) / 1000;

  if (molesNaOHAdded < molesHClInitial) {
    // Excess H+ remaining
    const molesHRemaining = molesHClInitial - molesNaOHAdded;
    const concH = molesHRemaining / totalVolumeL;
    return Math.max(1.0, -Math.log10(concH));
  } else if (Math.abs(molesNaOHAdded - molesHClInitial) < 0.00001) {
    // Exact equivalence point
    return 7.0;
  } else {
    // Excess OH-
    const molesOHExcess = molesNaOHAdded - molesHClInitial;
    const concOH = molesOHExcess / totalVolumeL;
    const pOH = -Math.log10(concOH);
    return Math.min(13.0, 14.0 - pOH);
  }
}

/**
 * Phenolphthalein color response:
 * pH < 8.2: Clear/Colorless
 * pH 8.2 - 10.0: Faint pink transitioning to bright magenta
 * pH > 10.0: Deep vibrant pink/purple
 */
export function getPhenolphthaleinColor(pH: number, dropsAdded: number): { color: string; opacity: number } {
  if (dropsAdded === 0) {
    // No indicator added: remains clear water
    return { color: '#e0f2fe', opacity: 0.35 };
  }

  if (pH < 8.0) {
    // Acidic: clear with subtle sheen
    return { color: '#e0f2fe', opacity: 0.4 };
  } else if (pH >= 8.0 && pH < 8.6) {
    // Ideal End Point: Faint persistent pink!
    return { color: '#f472b6', opacity: 0.65 };
  } else if (pH >= 8.6 && pH < 9.5) {
    // Slightly over-titrated: Noticeable pink
    return { color: '#ec4899', opacity: 0.75 };
  } else {
    // Grossly over-titrated: Vivid deep magenta/fuchsia
    return { color: '#db2777', opacity: 0.88 };
  }
}

