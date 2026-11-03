import { ExperimentStep, LabState } from '../types/lab';

export const TITRATION_STEPS: ExperimentStep[] = [
  {
    index: 0,
    title: 'Position Analyte Flask',
    instruction: 'Drag the 250 mL Erlenmeyer flask (containing 25 mL of 0.1 M HCl) and place it directly on the stand base under the burette tip.',
    detailedHelp: 'Click and drag the flask onto the illuminated circular snap zone on the base plate of the retort stand.',
    targetObject: 'flask_01',
    hint: 'Hover the flask over the glowing target directly under the burette clamp.',
    validationCheck: (state: LabState) => {
      // Checked dynamically by socket occupation
      return state.currentStepIndex > 0;
    },
  },
  {
    index: 1,
    title: 'Add Indicator Drops',
    instruction: 'Add 3 drops of Phenolphthalein indicator solution into the Erlenmeyer flask.',
    detailedHelp: 'Click on the Phenolphthalein dropper bottle to dispense drops into the flask.',
    targetObject: 'indicator_bottle',
    hint: 'You need exactly 3 drops of indicator for accurate titration detection.',
    validationCheck: (state: LabState) => {
      return state.flaskDropsAdded >= 3;
    },
  },
  {
    index: 2,
    title: 'Begin Dropwise Titration',
    instruction: 'Turn the burette stopcock valve to begin dispensing 0.1 M NaOH titrant into the analyte flask.',
    detailedHelp: 'Click the burette valve or use the Dispense button. Watch the volume decrease and keep swirling.',
    targetObject: 'burette_01',
    hint: 'Equivalence point occurs when 25.0 mL of NaOH is dispensed (burette reads 25.0 mL).',
    validationCheck: (state: LabState) => {
      return state.buretteVolumeMl <= 35.0; // Started dispensing
    },
  },
  {
    index: 3,
    title: 'Reach Equivalence Point (Endpoint)',
    instruction: 'Continue dispensing slowly until the solution in the flask turns a persistent, faint pink color (around 24.5 - 25.5 mL added), then close the valve.',
    detailedHelp: 'Close the valve when you see the color shift. Do not over-titrate into deep purple!',
    targetObject: 'burette_01',
    hint: 'Close the valve when the titrant dispensed reaches ~25.0 mL (pH jumps from ~3.0 to ~8.2).',
    validationCheck: (state: LabState) => {
      const dispensed = 50.0 - state.buretteVolumeMl;
      return !state.buretteValveOpen && dispensed >= 24.0 && dispensed <= 26.5;
    },
  },
  {
    index: 4,
    title: 'Titration Protocol Completed',
    instruction: 'Congratulations! You have successfully determined the neutralization endpoint. Record your final titration volume and review your score.',
    detailedHelp: 'Final volume: 25.0 mL NaOH neutralized 25.0 mL HCl. Molarity confirmed as 0.100 M.',
    targetObject: 'flask_01',
    hint: 'Lab protocol is complete. Review your performance in the telemetry console.',
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

