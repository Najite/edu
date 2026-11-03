import React from 'react';
import { Camera, Eye, ZoomIn } from 'lucide-react';
import { CameraPreset } from '../3d/LabScene';

interface CameraControlsProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  currentPreset,
  onSelectPreset,
}) => {
  return (
    <div className="camera-pill-bar">
      <span className="camera-bar-label">
        <Camera size={14} style={{ marginRight: 6 }} />
        Camera:
      </span>
      <button
        className={`btn-pill ${currentPreset === 'overview' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('overview')}
      >
        <Eye size={13} />
        <span>Overview</span>
      </button>
      <button
        className={`btn-pill ${currentPreset === 'titration' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('titration')}
      >
        <ZoomIn size={13} />
        <span>Reaction Close-up</span>
      </button>
      <button
        className={`btn-pill ${currentPreset === 'burette' ? 'btn-pill-active' : ''}`}
        onClick={() => onSelectPreset('burette')}
      >
        <ZoomIn size={13} />
        <span>Burette Scale</span>
      </button>
    </div>
  );
};

