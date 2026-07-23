const fs = require("fs");

const cssFile = "src/pages/OrderTracking.css";
let cssContent = fs.readFileSync(cssFile, "utf8");

// Remove the vertical timeline CSS we added earlier and replace with horizontal CSS
const startStr = ".workflow-stepper {";
const endStr = ".erp-grid-2col {";

const startIndex = cssContent.indexOf(startStr);
const endIndex = cssContent.indexOf("/* 2-Column Grid */", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const oldCss = cssContent.substring(startIndex, endIndex);
    const newCss = `
/* HORIZONTAL TIMELINE */
.workflow-stepper-container {
    padding: 24px 0 40px;
    width: 100%;
}

.workflow-stepper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    row-gap: 60px;
    position: relative;
}

.workflow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    text-align: center;
    padding: 0 10px;
}

/* Background emphasis for active stage */
.workflow-step.current::before {
    content: '';
    position: absolute;
    top: -20px;
    bottom: -20px;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%);
    border-radius: 12px;
    z-index: 0;
}

.step-indicator-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 48px;
    z-index: 2;
}

.step-indicator {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border: 2px solid #cbd5e1;
    z-index: 3;
    transition: all 0.3s ease;
    color: #94a3b8;
    position: relative;
}

/* Connectors */
.step-connector {
    position: absolute;
    top: 24px; /* Center of the 48px container */
    left: calc(50% + 18px); /* Start at edge of circle */
    width: calc(100% - 36px);
    height: 3px;
    z-index: 1;
}

.step-connector.solid {
    background: #10b981;
}
.step-connector.active-line {
    background: #3b82f6; /* Blue for segment leading to active */
}
.step-connector.dashed {
    background: transparent;
    border-top: 2px dashed #cbd5e1;
    height: 0;
}

/* Row connector from step 4 to step 5 */
.row-connector-svg {
    position: absolute;
    top: 24px;
    left: 50%;
    width: 100%;
    height: calc(100% + 60px); /* spans the row gap */
    z-index: 1;
    pointer-events: none;
}
.row-connector-path {
    fill: none;
    stroke-width: 3;
}
.row-connector-path.solid { stroke: #10b981; }
.row-connector-path.active-line { stroke: #3b82f6; }
.row-connector-path.dashed { stroke: #cbd5e1; stroke-dasharray: 6 6; stroke-width: 2; }


.step-details-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 16px;
    z-index: 2;
}

.step-label {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.2;
}

/* States */
.workflow-step.completed .step-indicator {
    background: #10b981;
    border-color: #10b981;
    color: white;
}
.workflow-step.completed .step-label { color: #334155; }

.workflow-step.current .step-indicator {
    width: 44px;
    height: 44px;
    background: #eff6ff;
    border-color: #3b82f6;
    color: #3b82f6;
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.15);
}
.workflow-step.current .step-label { color: #0f172a; font-size: 15px; }

.workflow-step.error .step-indicator { 
    background: #fef2f2; 
    border-color: #ef4444; 
    color: #ef4444;
}

.workflow-step.waiting .step-indicator {
    background: transparent;
    border: 2px solid #cbd5e1;
}

@keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.icon-spin {
    animation: spin-slow 2.5s linear infinite;
}

.step-subtext {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}

.role-pill {
    background: #f1f5f9;
    color: #64748b;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
}

.status-text {
    font-size: 12px;
    font-weight: 600;
}
.status-text.completed { color: #10b981; }
.status-text.current { color: #3b82f6; }
.status-text.waiting { color: #94a3b8; }
.status-text.error { color: #ef4444; }

.action-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    color: #475569;
    font-weight: 500;
    margin-top: 4px;
    max-width: 150px;
}
.action-tag.completed {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
}

/* Mobile Scrollable View */
@media (max-width: 992px) {
    .workflow-stepper {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 24px;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
    }
    
    .workflow-stepper::-webkit-scrollbar {
        height: 6px;
    }
    .workflow-stepper::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
    }

    .workflow-step {
        min-width: 220px;
        scroll-snap-align: center;
    }
    
    /* Hide the SVG wrap connector on mobile since it's a single row */
    .row-connector-svg {
        display: none;
    }
}

`;
    cssContent = cssContent.replace(oldCss, newCss);
    fs.writeFileSync(cssFile, cssContent);
}

const jsxFile = "src/pages/OrderTracking.jsx";
let jsxContent = fs.readFileSync(jsxFile, "utf8");

const startJsxStr = `<div className="workflow-stepper">`;
const endJsxStr = `</section>`;

const startJsxIndex = jsxContent.indexOf(startJsxStr);
const endJsxIndex = jsxContent.indexOf(endJsxStr, startJsxIndex);

if (startJsxIndex !== -1 && endJsxIndex !== -1) {
    const oldJsx = jsxContent.substring(startJsxIndex, endJsxIndex);
    const newJsx = `<div className="workflow-stepper-container">
                        <div className="workflow-stepper">
                            {workflow.map((stageObj, index) => {
                                let statusClass = "waiting";
                                let IconComponent = Circle;
                                
                                if (stageObj.status === "Completed") {
                                    statusClass = "completed";
                                    IconComponent = CheckCircle;
                                } else if (stageObj.status === "In Progress") {
                                    statusClass = "current";
                                    IconComponent = Loader2;
                                } else if (stageObj.status === "Issue" || stageObj.status === "Rejected") {
                                    statusClass = "error";
                                    IconComponent = AlertCircle;
                                }
                                
                                // Determine connector line style
                                let nextStage = workflow[index + 1];
                                let connectorClass = "dashed";
                                if (nextStage) {
                                    if (statusClass === "completed" && nextStage.status === "Completed") {
                                        connectorClass = "solid";
                                    } else if (statusClass === "completed" && (nextStage.status === "In Progress" || nextStage.status === "Issue")) {
                                        connectorClass = "active-line";
                                    }
                                }

                                const isNode4 = index === 3;
                                const showConnectorLine = index !== 3 && index !== workflow.length - 1;

                                return (
                                    <motion.div 
                                        key={stageObj.stage + index} 
                                        className={\`workflow-step \${statusClass}\`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <div className="step-indicator-container">
                                            <div className="step-indicator">
                                                {statusClass === "waiting" ? null : 
                                                 <IconComponent size={statusClass === "current" ? 22 : 18} strokeWidth={2.5} className={statusClass === "current" ? "icon-spin" : ""} />}
                                            </div>
                                            
                                            {/* Standard Horizontal Line */}
                                            {showConnectorLine && (
                                                <div className={\`step-connector \${connectorClass}\`} />
                                            )}

                                            {/* Wrap-around SVG for Node 4 to Node 5 (Desktop Only) */}
                                            {isNode4 && (
                                                <svg className="row-connector-svg" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                    {/* Path: Start at right of circle, go right, curve down, go left all the way, curve down, go right to node 5 */}
                                                    <path 
                                                        className={\`row-connector-path \${connectorClass}\`}
                                                        d="M 50,0 Q 100,0 100,20 L 100,80 Q 100,100 50,100 L -250,100 Q -300,100 -300,120 L -300,160 Q -300,180 -250,180 L -150,180" 
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        
                                        <div className="step-details-container">
                                            <div className="step-label">{stageObj.stage}</div>
                                            
                                            <div className="step-subtext">
                                                <span className="role-pill">{stageObj.role}</span>
                                                <span className={\`status-text \${statusClass}\`}>
                                                    {stageObj.status !== "Upcoming" 
                                                        ? \`\${stageObj.status} \${stageObj.updatedBy ? \`by \${stageObj.updatedBy}\` : ""}\` 
                                                        : "Upcoming"}
                                                </span>
                                            </div>
                                            
                                            {stageObj.remarks && (
                                                <div className={\`action-tag \${statusClass === "completed" ? "completed" : ""}\`}>
                                                    {statusClass === "completed" ? <CheckCircle size={12} /> : <Activity size={12} />}
                                                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }} title={stageObj.remarks}>{stageObj.remarks}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                `;
    jsxContent = jsxContent.replace(oldJsx, newJsx);
    fs.writeFileSync(jsxFile, jsxContent);
}

console.log("Horizontal Timeline UI injected.");
