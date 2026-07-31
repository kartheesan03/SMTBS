import React from 'react';
import { Check, Circle } from 'lucide-react';
import './RichComponents.css';

const WorkflowStepper = ({ steps, currentStep }) => {
    return (
        <div className="ai-workflow-stepper">
            {steps.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                
                return (
                    <div key={idx} className={`stepper-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="stepper-icon-container">
                            {isCompleted ? (
                                <div className="stepper-icon completed"><Check size={14} /></div>
                            ) : isActive ? (
                                <div className="stepper-icon active"><div className="inner-dot"></div></div>
                            ) : (
                                <div className="stepper-icon pending"><Circle size={14} /></div>
                            )}
                            {idx < steps.length - 1 && <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />}
                        </div>
                        <div className="stepper-content">
                            <h5>{step.label}</h5>
                            {step.description && <p>{step.description}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default WorkflowStepper;
