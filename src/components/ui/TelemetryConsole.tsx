import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Check, Activity } from 'lucide-react';
import { XAPIStatement } from '../../types/lab';

interface TelemetryConsoleProps {
  logs: XAPIStatement[];
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`telemetry-drawer ${isOpen ? 'telemetry-drawer-open' : ''}`}>
      <button
        className="telemetry-bar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="telemetry-bar-left">
          <Terminal size={15} className="text-emerald-400" />
          <span className="telemetry-title">LMS / xAPI Telemetry Feed</span>
          <span className="telemetry-count-badge">{logs.length} statements</span>
        </div>
        <div className="telemetry-bar-right">
          <Activity size={13} className="pulse-green" />
          <span className="telemetry-status-text">LRS Connected</span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="telemetry-content">
          {logs.length === 0 ? (
            <div className="telemetry-empty">No telemetry statements emitted yet. Perform an action in the lab.</div>
          ) : (
            <div className="telemetry-list">
              {logs.map((log) => (
                <div key={log.id} className="telemetry-item">
                  <span className="telemetry-timestamp">{log.timestamp}</span>
                  <span className="telemetry-verb">{log.verb}</span>
                  <span className="telemetry-object">{log.object}</span>
                  {log.result && (
                    <span className="telemetry-result">
                      <Check size={12} className="text-emerald-400" />
                      {log.result.details}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

