import React from 'react';
import { Camera, Eye, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { CameraPreset } from '../3d/LabScene';

export interface CameraControlsProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  currentPreset,
  onSelectPreset,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  return (
    <div className="camera-pill-bar">
      <span className="camera-bar-label">
        <Camera size={14} style={{ marginRight: 6 }} />
        Camera:
      </span>

      {/* Preset Viewpoints */}
      <button
        className={`btn-pill ${currentPreset === 'overview' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('overview')}
        title="Overview camera angle (wide bench view)"
      >
        <Eye size={13} />
        <span>Overview</span>
      </button>
      <button
        className={`btn-pill ${currentPreset === 'titration' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('titration')}
        title="Reaction & Flask close-up angle"
      >
        <ZoomIn size={13} />
        <span>Reaction Close-up</span>
      </button>
      <button
        className={`btn-pill ${currentPreset === 'burette' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('burette')}
        title="Burette scale & meniscus reading angle"
      >
        <ZoomIn size={13} />
        <span>Burette Scale</span>
      </button>
      <button
        className={`btn-pill ${currentPreset === 'pipette' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('pipette')}
        title="Pipette & analyte preparation area"
      >
        <ZoomIn size={13} />
        <span>Pipette Prep</span>
      </button>

      {/* Visual Divider */}
      <div className="camera-bar-divider" />

      {/* Interactive Zoom In / Pan In */}
      {onZoomIn && (
        <button
          className="btn-pill"
          onClick={onZoomIn}
          title="Pan in / Zoom in closer (also scroll wheel up)"
        >
          <ZoomIn size={13} />
          <span>In</span>
        </button>
      )}

      {/* Interactive Zoom Out / Pan Out */}
      {onZoomOut && (
        <button
          className="btn-pill"
          onClick={onZoomOut}
          title="Pan out / Zoom out further (also scroll wheel down)"
        >
          <ZoomOut size={13} />
          <span>Out</span>
        </button>
      )}

      {/* Reset Camera View */}
      {onResetView && (
        <button
          className="btn-pill"
          onClick={onResetView}
          title="Reset camera to default overview"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      )}

      {/* Helpful Navigation Shortcut Hints */}
      <span
        className="camera-nav-hint"
        title="Free 3D navigation: Left-drag to orbit/rotate, Right-drag to pan around, Scroll wheel to zoom in/out"
      >
        <Move size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
        Right-drag to pan • Scroll to zoom
      </span>
    </div>
  );
};
