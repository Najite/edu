import React from 'react';
import { Gauge, Droplets, Waves, Sliders, ChevronRight, Zap, Pipette, Sparkles, CheckCircle2, AlertTriangle, Eye, FlaskConical } from 'lucide-react';
import { FlowRegime, PipetteState } from '../../types/lab';

export interface MeasurementsPanelProps {
  buretteVolumeMl: number;
  flaskVolumeMl: number;
  flaskDropsAdded: number;
  pH: number;
  isSwirling: boolean;
  stopcockAngle: number;
  flowRegime: FlowRegime;
  flowRateMlPerSec: number;
  dropsPerSec: number;
  hasHangingDrop: boolean;
  hasTipBubble?: boolean;
  isFlaskDocked: boolean;
  onSnapFlaskToBurette?: () => void;
  onSetStopcockAngle: (angle: number) => void;
  onToggleValve?: () => void;
  onDispenseSingleDrop: () => void;
  onTapHangingDrop: () => void;
  onPurgeTipBubble?: () => void;
  onToggleSwirl: () => void;
  onAddIndicatorDrop: () => void;

  // Pipetting & Preparation Subsystems (Phase 1 Deliverables 1.2, 1.3, 1.4)
  pipetteState: PipetteState;
  pipetteVolumeMl: number;
  bulbCompressed: boolean;
  isFlaskRinsed: boolean;
  onPressValveA: () => void;
  onPressValveS: () => void;
  onPressValveE: () => void;
  onMovePipetteToStock: () => void;
  onTransferPipetteToFlask: () => void;
  onDrainPipetteToFlask: () => void;
  onSquirtWashBottle: () => void;
  onAlignMeniscus?: () => void;

  // Meniscus Parallax Angle Telemetry
  buretteParallaxAngleDeg?: number;
  pipetteParallaxAngleDeg?: number;
}

export const MeasurementsPanel: React.FC<MeasurementsPanelProps> = ({
  buretteVolumeMl,
  flaskVolumeMl,
  flaskDropsAdded,
  pH,
  isSwirling,
  stopcockAngle,
  flowRegime,
  flowRateMlPerSec,
  dropsPerSec,
  hasHangingDrop,
  hasTipBubble = false,
  isFlaskDocked,
  onSnapFlaskToBurette,
  onSetStopcockAngle,
  onDispenseSingleDrop,
  onTapHangingDrop,
  onPurgeTipBubble,
  onToggleSwirl,
  onAddIndicatorDrop,
  pipetteState,
  pipetteVolumeMl,
  bulbCompressed,
  isFlaskRinsed,
  onPressValveA,
  onPressValveS,
  onPressValveE,
  onMovePipetteToStock,
  onTransferPipetteToFlask,
  onDrainPipetteToFlask,
  onSquirtWashBottle,
  onAlignMeniscus,
  buretteParallaxAngleDeg = 0,
  pipetteParallaxAngleDeg = 0,
}) => {
  const dispensedNaOH = Math.max(0, 50.0 - buretteVolumeMl);

  const getPHColorClass = (val: number) => {
    if (val < 6.5) return 'ph-acidic';
    if (val >= 6.5 && val <= 7.5) return 'ph-neutral';
    if (val > 7.5 && val <= 8.6) return 'ph-endpoint';
    return 'ph-alkaline';
  };

  const getRegimeBadge = () => {
    switch (flowRegime) {
      case 'closed':
        return { label: 'CLOSED', className: 'flow-badge-closed' };
      case 'micro_drop':
        return { label: 'MICRO-DROP', className: 'flow-badge-micro' };
      case 'dropwise':
        return {
          label: `DROPWISE (${dropsPerSec.toFixed(1)} d/s)`,
          className: 'flow-badge-dropwise',
        };
      case 'stream':
        return {
          label: `STREAM (${flowRateMlPerSec.toFixed(2)} mL/s)`,
          className: 'flow-badge-stream',
        };
    }
  };

  const badge = getRegimeBadge();
  const isMeniscusAligned = pipetteVolumeMl >= 24.95 && pipetteVolumeMl <= 25.05;
  const isBuretteEyeLevel = Math.abs(buretteParallaxAngleDeg) <= 2.0;
  const isPipetteEyeLevel = Math.abs(pipetteParallaxAngleDeg) <= 2.0;

  return (
    <div className="measurements-card">
      <div className="card-header-row">
        <Gauge size={16} className="icon-blue" />
        <h3 className="card-title">Analytical Measurements</h3>
      </div>

      {/* Primary Analytics Grid */}
      <div className="analytics-grid">
        {/* Burette Volume with Live Meniscus Parallax Readout */}
        <div className="gauge-box">
          <span className="gauge-label">Burette Reading</span>
          <div className="gauge-value-row">
            <span className="gauge-number">{buretteVolumeMl.toFixed(2)}</span>
            <span className="gauge-unit">mL</span>
          </div>
          <span className="gauge-sub">Dispensed: {dispensedNaOH.toFixed(2)} mL</span>
          <div
            className={`parallax-badge ${isBuretteEyeLevel ? 'parallax-pass' : 'parallax-fail'}`}
            title={
              isBuretteEyeLevel
                ? 'Camera aligned horizontally with meniscus apex (DIN standard optical reading)'
                : 'Parallax error: Viewing obliquely causes volume reading error'
            }
          >
            {isBuretteEyeLevel ? (
              <span className="badge-content">
                <Eye size={11} style={{ marginRight: 3 }} />
                Eye-Level ({buretteParallaxAngleDeg > 0 ? `+${buretteParallaxAngleDeg}` : buretteParallaxAngleDeg}°)
              </span>
            ) : (
              <span className="badge-content">
                <AlertTriangle size={11} style={{ marginRight: 3 }} />
                Parallax ({buretteParallaxAngleDeg > 0 ? `+${buretteParallaxAngleDeg}` : buretteParallaxAngleDeg}°)
              </span>
            )}
          </div>
        </div>

        {/* Digital pH Metrology */}
        <div className="gauge-box">
          <span className="gauge-label">Solution pH</span>
          <div className="gauge-value-row">
            <span className={`gauge-number ${getPHColorClass(pH)}`}>
              {pH.toFixed(2)}
            </span>
            <span className="gauge-unit">pH</span>
          </div>
          <span className="gauge-sub">
            {pH < 7 ? 'Acidic' : pH < 8.2 ? 'Neutral' : 'Equivalence Endpoint'}
          </span>
        </div>

        {/* Flask Volume */}
        <div className="gauge-box">
          <span className="gauge-label">Flask Volume</span>
          <div className="gauge-value-row">
            <span className="gauge-number">{flaskVolumeMl.toFixed(2)}</span>
            <span className="gauge-unit">mL</span>
          </div>
          <span className="gauge-sub">{flaskVolumeMl < 24 ? 'Pending Analyte Transfer' : '25.00 mL Analyte + Titrant'}</span>
        </div>

        {/* Indicator Drops Added */}
        <div className="gauge-box">
          <span className="gauge-label">Indicator Drops</span>
          <div className="gauge-value-row">
            <span className="gauge-number">{flaskDropsAdded}</span>
            <span className="gauge-unit">/ 3 drops</span>
          </div>
          <span className="gauge-sub">{flaskDropsAdded >= 3 ? 'Standardized' : 'Pending 3 Drops'}</span>
        </div>
      </div>

      {/* ================= VOLUMETRIC PIPETTING CONTROLLER (Deliverable 1.2) ================= */}
      <div className="pipette-controller-box">
        <div className="stopcock-header-row">
          <div className="stopcock-title-group">
            <Pipette size={14} className="icon-blue" />
            <span className="stopcock-label">25 mL Volumetric Pipette (Class AS)</span>
          </div>
          <div className="stopcock-status-group">
            <span className={`flow-status-badge ${isMeniscusAligned ? 'flow-badge-endpoint' : 'flow-badge-dropwise'}`}>
              {pipetteState.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Meniscus Alignment Readout & Parallax Guard */}
        <div className="pipette-readout-row">
          <div className="pipette-vol-info">
            <span className="pipette-vol-label">Pipette Liquid:</span>
            <span className="pipette-vol-val">{pipetteVolumeMl.toFixed(2)} mL</span>
            <span className="pipette-vol-target">/ 25.00 mL (Mark)</span>
          </div>
          <div className="meniscus-tags-group">
            {isMeniscusAligned && (
              <div className="meniscus-aligned-tag">
                <CheckCircle2 size={13} style={{ marginRight: 4 }} />
                <span>Meniscus Aligned</span>
              </div>
            )}
            <div
              className={`parallax-mini-badge ${isPipetteEyeLevel ? 'parallax-pass' : 'parallax-fail'}`}
              title="Camera elevation relative to the etched calibration ring on the upper stem"
            >
              <Eye size={10} style={{ marginRight: 3 }} />
              <span>Sight: {pipetteParallaxAngleDeg > 0 ? `+${pipetteParallaxAngleDeg}` : pipetteParallaxAngleDeg}°</span>
            </div>
          </div>
        </div>

        {/* 3-Valve Safety Rubber Bulb Controls */}
        <div className="bulb-valves-row">
          <button
            className={`bulb-valve-btn ${bulbCompressed ? 'bulb-compressed' : ''}`}
            onClick={onPressValveA}
            title="Valve A: Compress bulb to discharge air (Aspirate preparation)"
          >
            <strong>A</strong>
            <span>Air Expel {bulbCompressed ? '(Ready)' : ''}</span>
          </button>

          <button
            className="bulb-valve-btn"
            disabled={pipetteState === 'rack' || pipetteState === 'finished'}
            onClick={onPressValveS}
            title="Valve S: Suction liquid from beaker into pipette barrel"
          >
            <strong>S</strong>
            <span>Suction (+Vol)</span>
          </button>

          <button
            className="bulb-valve-btn"
            disabled={pipetteVolumeMl <= 0}
            onClick={onPressValveE}
            title="Valve E: Exhaust / drain liquid down to calibration mark or into flask"
          >
            <strong>E</strong>
            <span>Exhaust (-Vol)</span>
          </button>
        </div>

        {/* Pipette Manipulation Actions */}
        <div className="pipette-actions-row">
          {pipetteState === 'rack' && (
            <button className="btn-precision" onClick={onMovePipetteToStock}>
              Submerge in 0.1M HCl Beaker
            </button>
          )}

          {['in_stock', 'aspirating', 'aligning'].includes(pipetteState) && (
            <>
              {pipetteVolumeMl > 25.05 && onAlignMeniscus && (
                <button
                  className="btn-precision btn-precision-highlight"
                  onClick={onAlignMeniscus}
                  title="Align bottom of concave meniscus tangent to 25.00 mL line"
                >
                  Align to 25.00 mL Line (Valve E)
                </button>
              )}
              <button
                className={`btn-precision ${isMeniscusAligned ? 'btn-precision-highlight' : ''}`}
                disabled={!isMeniscusAligned}
                onClick={onTransferPipetteToFlask}
              >
                Transfer to Erlenmeyer Flask
              </button>
            </>
          )}

          {pipetteState === 'above_flask' && (
            <button className="btn-precision btn-precision-highlight" onClick={onDrainPipetteToFlask}>
              Drain 25.00 mL into Flask (Ex + 15s)
            </button>
          )}
        </div>
      </div>

      {/* ================= WASH BOTTLE & DEIONIZED WATER RINSE (Deliverable 1.3) ================= */}
      <div className="wash-bottle-box">
        <div className="stopcock-header-row">
          <div className="stopcock-title-group">
            <Sparkles size={14} className="icon-blue" />
            <span className="stopcock-label">Deionized Water Wash Bottle</span>
          </div>
          <span className={`flow-status-badge ${isFlaskRinsed ? 'flow-badge-endpoint' : 'flow-badge-closed'}`}>
            {isFlaskRinsed ? 'WALLS RINSED' : 'UNRINSED'}
          </span>
        </div>
        <div className="wash-action-row">
          <button className="btn-precision" onClick={onSquirtWashBottle}>
            Squeeze Wash Bottle (Rinse Flask Neck)
          </button>
          <span className="wash-hint">Pure DI H₂O preserves moles of acid while ensuring total quantitative transfer.</span>
        </div>
      </div>

      {/* ================= VARIABLE FLOW STOPCOCK CONTROLLER ================= */}
      <div className="stopcock-controller-box">
        <div className="stopcock-header-row">
          <div className="stopcock-title-group">
            <Sliders size={14} className="icon-blue" />
            <span className="stopcock-label">Burette Stopcock Flow</span>
          </div>
          <div className="stopcock-status-group">
            <span className={`flow-status-badge ${badge.className}`}>{badge.label}</span>
            <span className="stopcock-angle-readout">{stopcockAngle}°</span>
          </div>
        </div>

        {/* Continuous Flow Slider (0° to 90°) */}
        <div className="stopcock-slider-container">
          <input
            type="range"
            min="0"
            max="90"
            step="1"
            value={stopcockAngle}
            disabled={!isFlaskDocked || buretteVolumeMl <= 0}
            onChange={(e) => onSetStopcockAngle(Number(e.target.value))}
            className="stopcock-slider"
          />
          <div className="slider-ticks-row">
            <span onClick={() => onSetStopcockAngle(0)} className="tick-label">0° (Closed)</span>
            <span onClick={() => onSetStopcockAngle(15)} className="tick-label">15° (Micro)</span>
            <span onClick={() => onSetStopcockAngle(30)} className="tick-label">30° (Dropwise)</span>
            <span onClick={() => onSetStopcockAngle(90)} className="tick-label">90° (Stream)</span>
          </div>
        </div>

        {/* Regime Quick-Select Pill Buttons */}
        <div className="regime-preset-row">
          <button
            className={`regime-btn ${flowRegime === 'closed' ? 'regime-btn-active' : ''}`}
            disabled={!isFlaskDocked || buretteVolumeMl <= 0}
            onClick={() => onSetStopcockAngle(0)}
            title="Close valve completely (0°)"
          >
            Closed
          </button>
          <button
            className={`regime-btn ${flowRegime === 'micro_drop' ? 'regime-btn-active' : ''}`}
            disabled={!isFlaskDocked || buretteVolumeMl <= 0}
            onClick={() => onSetStopcockAngle(15)}
            title="Micro-drop hanging bead (15°, ~0.015 mL)"
          >
            Micro-Drop
          </button>
          <button
            className={`regime-btn ${flowRegime === 'dropwise' ? 'regime-btn-active' : ''}`}
            disabled={!isFlaskDocked || buretteVolumeMl <= 0}
            onClick={() => onSetStopcockAngle(30)}
            title="Dropwise titration (30°, 0.05 mL/drop)"
          >
            Dropwise
          </button>
          <button
            className={`regime-btn ${flowRegime === 'stream' ? 'regime-btn-active' : ''}`}
            disabled={!isFlaskDocked || buretteVolumeMl <= 0}
            onClick={() => onSetStopcockAngle(90)}
            title="Continuous rapid stream (90°, 1.8 mL/s)"
          >
            Stream
          </button>
        </div>

        {/* Precision Single-Drop & Tap Actions */}
        <div className="precision-actions-row">
          <button
            className="btn-precision"
            disabled={!isFlaskDocked || buretteVolumeMl <= 0}
            onClick={onDispenseSingleDrop}
            title="Dispense exactly 1 drop (0.05 mL) for precise equivalence point determination"
          >
            <Zap size={13} style={{ marginRight: 4 }} />
            <span>+1 Single Drop (0.05 mL)</span>
          </button>

          {(hasHangingDrop || flowRegime === 'micro_drop') && (
            <button
              className="btn-precision btn-precision-highlight"
              onClick={onTapHangingDrop}
              title="Deposit the hanging droplet on the nozzle tip into the flask"
            >
              <ChevronRight size={13} style={{ marginRight: 3 }} />
              <span>Tap Hanging Drop (0.015 mL)</span>
            </button>
          )}
        </div>

        {/* Tip Air Bubble Purge Action */}
        {hasTipBubble && onPurgeTipBubble && (
          <div style={{ marginTop: 8 }}>
            <button
              className="btn-precision btn-precision-highlight"
              onClick={onPurgeTipBubble}
              style={{ width: '100%', justifyContent: 'center' }}
              title="Dislodge trapped air bubble in nozzle tip into the waste beaker before titrating"
            >
              <Zap size={13} style={{ marginRight: 4 }} />
              <span>Purge Tip Air Bubble (Flush to Waste)</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Secondary Controls Bar */}
      <div className="controls-action-bar">
        {!isFlaskDocked ? (
          <button
            className="btn-action btn-action-highlight"
            onClick={onSnapFlaskToBurette}
            title="Place Erlenmeyer flask onto retort stand base plate under burette nozzle"
          >
            <FlaskConical size={16} />
            <span>Place Flask Under Burette</span>
          </button>
        ) : (
          <button
            className={`btn-action ${isSwirling ? 'btn-swirl-active' : 'btn-secondary'}`}
            onClick={onToggleSwirl}
          >
            <Waves size={16} />
            <span>{isSwirling ? 'Stop Swirling' : 'Swirl Flask'}</span>
          </button>
        )}

        <button
          className="btn-action btn-secondary"
          disabled={flaskDropsAdded >= 3}
          onClick={onAddIndicatorDrop}
        >
          <Droplets size={16} />
          <span>Add Indicator ({3 - flaskDropsAdded} left)</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Guide */}
      <div className="keyboard-shortcuts-hint">
        <span>Shortcuts: <strong>Space</strong> (Toggle) • <strong>↑/↓</strong> (Flow Angle) • <strong>1-4</strong> (Regimes) • <strong>D</strong> (Drop) • <strong>T</strong> (Tap)</span>
      </div>
    </div>
  );
};
