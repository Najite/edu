import React from 'react';
import { RotateCcw, Award, Clock, Beaker, ShieldCheck, Volume2, VolumeX } from 'lucide-react';

interface LabHeaderProps {
  score: number;
  elapsedSeconds: number;
  onReset: () => void;
  isVoiceMuted?: boolean;
  onToggleVoice?: () => void;
}

export const LabHeader: React.FC<LabHeaderProps> = ({
  score,
  elapsedSeconds,
  onReset,
  isVoiceMuted = false,
  onToggleVoice,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <header className="lab-header">
      <div className="lab-header-left">
        <div className="lab-logo-badge">
          <Beaker className="icon-blue" size={22} />
        </div>
        <div>
          <div className="lab-title-row">
            <h1 className="lab-title">Acid-Base Titration Lab</h1>
            <span className="lab-mode-pill">
              <ShieldCheck size={13} style={{ marginRight: 4 }} />
              Guided Learning
            </span>
          </div>
          <p className="lab-subtitle">Determination of 0.100 M HCl Concentration using 0.100 M NaOH Standard</p>
        </div>
      </div>

      <div className="lab-header-right">
        <div className="header-stat-chip">
          <Clock size={16} className="text-slate-400" />
          <span className="mono-stat">{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="header-stat-chip">
          <Award size={16} className="text-amber-400" />
          <span className="mono-stat font-bold text-emerald-400">{score} pts</span>
        </div>

        {onToggleVoice && (
          <button
            className={`btn-secondary ${isVoiceMuted ? 'opacity-60' : ''}`}
            onClick={onToggleVoice}
            title={isVoiceMuted ? 'Unmute Laboratory Instructor Voice' : 'Mute Instructor Voice'}
          >
            {isVoiceMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isVoiceMuted ? 'Voice Off' : 'Voice On'}</span>
          </button>
        )}

        <button className="btn-secondary" onClick={onReset} title="Reset Experiment">
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};

