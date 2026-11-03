import React, { useState } from 'react';
import { ExperimentStep } from '../../types/lab';
import { CheckCircle2, HelpCircle, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';

interface StepGuideProps {
  steps: ExperimentStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  mistakes: number;
  onAdvanceManual?: () => void;
}

export const StepGuide: React.FC<StepGuideProps> = ({
  steps,
  currentStepIndex,
  isCompleted,
  mistakes,
}) => {
  const [showHint, setShowHint] = useState(false);
  const currentStep = steps[currentStepIndex] || steps[steps.length - 1];

  return (
    <div className="step-guide-card">
      {/* Step Progress Tracker */}
      <div className="step-tracker">
        {steps.map((s, idx) => {
          const isDone = idx < currentStepIndex || isCompleted;
          const isCurrent = idx === currentStepIndex && !isCompleted;
          return (
            <div key={s.index} className="step-tracker-item">
              <div
                className={`step-circle ${
                  isDone ? 'step-circle-done' : isCurrent ? 'step-circle-current' : 'step-circle-pending'
                }`}
              >
                {isDone ? <CheckCircle2 size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`step-line ${isDone ? 'step-line-done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="step-body">
        <div className="step-meta">
          <span className="step-badge">
            {isCompleted ? 'COMPLETED' : `STEP ${currentStepIndex + 1} OF ${steps.length}`}
          </span>
          {mistakes > 0 && (
            <span className="step-warning-badge">
              <AlertTriangle size={12} style={{ marginRight: 4 }} />
              {mistakes} warning{mistakes > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <h3 className="step-title">{isCompleted ? 'Lab Protocol Complete!' : currentStep.title}</h3>
        <p className="step-instruction">
          {isCompleted
            ? 'You have successfully executed the quantitative titration protocol and verified stoichiometric equivalence.'
            : currentStep.instruction}
        </p>

        {/* Hint Accordion */}
        {!isCompleted && (
          <div className="hint-container">
            <button
              className="hint-toggle-btn"
              onClick={() => setShowHint(!showHint)}
            >
              <HelpCircle size={15} />
              <span>{showHint ? 'Hide Guidance' : 'Need Guidance?'}</span>
              <ChevronRight
                size={14}
                style={{
                  transform: showHint ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  marginLeft: 'auto',
                }}
              />
            </button>
            {showHint && (
              <div className="hint-body">
                <Sparkles size={14} className="icon-amber" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{currentStep.hint}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

