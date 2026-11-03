import React from 'react';
import { Gauge, Droplets, Play, Pause, Waves } from 'lucide-react';

interface MeasurementsPanelProps {
  buretteVolumeMl: number;
  flaskVolumeMl: number;
  flaskDropsAdded: number;
  pH: number;
  isSwirling: boolean;
  buretteValveOpen: boolean;
  isFlaskDocked: boolean;
  onToggleValve: () => void;
  onToggleSwirl: () => void;
  onAddIndicatorDrop: () => void;
}

export const MeasurementsPanel: React.FC<MeasurementsPanelProps> = ({
  buretteVolumeMl,
  flaskVolumeMl,
  flaskDropsAdded,
  pH,
  isSwirling,
  buretteValveOpen,
  isFlaskDocked,
  onToggleValve,
  onToggleSwirl,
  onAddIndicatorDrop,
}) => {
  const dispensedNaOH = Math.max(0, 50.0 - buretteVolumeMl);

  // Determine pH color tag
  const getPHColorClass = (val: number) => {
    if (val < 6.5) return 'ph-acidic';
    if (val >= 6.5 && val <= 7.5) return 'ph-neutral';
    if (val > 7.5 && val <= 8.6) return 'ph-endpoint';
    return 'ph-alkaline';
  };

  return (
    <div className="measurements-card">
      <div className="measurements-header">
        <Gauge size={18} className="icon-blue" />
        <h4 className="measurements-title">Instrumentation & Controls</h4>
      </div>

      <div className="gauges-grid">
        {/* Burette Reading Gauge */}
        <div className="gauge-box">
          <span className="gauge-label">Burette Level</span>
          <div className="gauge-value-row">
            <span className="gauge-number">{buretteVolumeMl.toFixed(1)}</span>
            <span className="gauge-unit">mL</span>
          </div>
          <span className="gauge-sub">Dispensed: {dispensedNaOH.toFixed(1)} mL NaOH</span>
        </div>

        {/* Digital pH Meter */}
        <div className="gauge-box">
          <span className="gauge-label">Analyte pH</span>
          <div className="gauge-value-row">
            <span className={`gauge-number ${getPHColorClass(pH)}`}>{pH.toFixed(2)}</span>
            <span className="gauge-unit">pH</span>
          </div>
          <span className="gauge-sub">
            {pH < 7 ? 'Acidic Solution' : pH < 8.5 ? 'Equivalence Zone' : 'Alkaline Solution'}
          </span>
        </div>

        {/* Total Flask Volume */}
        <div className="gauge-box">
          <span className="gauge-label">Flask Volume</span>
          <div className="gauge-value-row">
            <span className="gauge-number">{flaskVolumeMl.toFixed(1)}</span>
            <span className="gauge-unit">mL</span>
          </div>
          <span className="gauge-sub">Initial 25.0 mL HCl</span>
        </div>

        {/* Indicator Drops Added */}
        <div className="gauge-box">
          <span className="gauge-label">Indicator Drops</span>
          <div className="gauge-value-row">
            <span className="gauge-number">{flaskDropsAdded}</span>
            <span className="gauge-unit">/ 3 drops</span>
          </div>
          <span className="gauge-sub">{flaskDropsAdded >= 3 ? 'Ready for Titration' : 'Pending Addition'}</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="controls-action-bar">
        <button
          className={`btn-action ${buretteValveOpen ? 'btn-valve-active' : 'btn-primary'}`}
          disabled={!isFlaskDocked || buretteVolumeMl <= 0}
          onClick={onToggleValve}
        >
          {buretteValveOpen ? <Pause size={16} /> : <Play size={16} />}
          <span>{buretteValveOpen ? 'Stop Dispense' : 'Dispense NaOH'}</span>
        </button>

        <button
          className={`btn-action ${isSwirling ? 'btn-swirl-active' : 'btn-secondary'}`}
          disabled={!isFlaskDocked}
          onClick={onToggleSwirl}
        >
          <Waves size={16} />
          <span>{isSwirling ? 'Stop Swirl' : 'Swirl Flask'}</span>
        </button>

        <button
          className="btn-action btn-secondary"
          disabled={flaskDropsAdded >= 3}
          onClick={onAddIndicatorDrop}
        >
          <Droplets size={16} />
          <span>Add Drop ({3 - flaskDropsAdded} left)</span>
        </button>
      </div>
    </div>
  );
};
