const fs = require("fs");
const path = require("path");

const cssFile = "src/pages/OrderTracking.css";
let cssContent = fs.readFileSync(cssFile, "utf8");

// We need to replace the entire .workflow-stepper to .workflow-step.error section
const startStr = ".workflow-stepper {";
const endStr = ".erp-grid-2col {";

const startIndex = cssContent.indexOf(startStr);
const endIndex = cssContent.indexOf("/* 2-Column Grid */", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const oldCss = cssContent.substring(startIndex, endIndex);
    const newCss = `
.workflow-stepper {
    display: flex;
    flex-direction: column;
    padding: 20px 10px;
    position: relative;
}

.workflow-step {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    position: relative;
    padding-bottom: 32px;
    width: 100%;
}

.workflow-step:last-child {
    padding-bottom: 0;
}

.step-indicator-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 16px;
    position: relative;
    width: 36px;
}

.step-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border: 2px solid #cbd5e1;
    z-index: 2;
    transition: all 0.3s ease;
    flex-shrink: 0;
    color: #94a3b8;
}

.step-connector {
    position: absolute;
    top: 32px;
    left: 17px;
    width: 2px;
    height: calc(100% + 8px);
    z-index: 1;
}

.step-connector.solid {
    background: #10b981;
}

.step-connector.dashed {
    background: transparent;
    border-left: 2px dashed #cbd5e1;
}

.step-details-container {
    display: flex;
    flex-direction: column;
    padding-top: 5px;
    flex: 1;
}

.step-label {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
}

/* Completed */
.workflow-step.completed .step-indicator {
    background: #10b981;
    border-color: #10b981;
    color: white;
}
.workflow-step.completed .step-label { 
    color: #475569; 
    font-weight: 500; 
}

/* Current */
.workflow-step.current {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
    border-radius: 8px;
    margin-left: -12px;
    padding-left: 12px;
    padding-top: 12px;
    padding-bottom: 44px;
}
.workflow-step.current .step-connector {
    left: 29px;
    top: 44px;
}
.workflow-step.current .step-indicator {
    width: 36px;
    height: 36px;
    background: #eff6ff;
    border-color: #3b82f6;
    color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
.workflow-step.current .step-label { 
    color: #0f172a; 
    font-weight: 700; 
    font-size: 15px; 
}

/* Error */
.workflow-step.error .step-indicator { 
    background: #fef2f2; 
    border-color: #ef4444; 
    color: #ef4444;
}
.workflow-step.error .step-label { color: #ef4444; }

/* Pulse Animation for Current */
@keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.icon-spin {
    animation: spin-slow 3s linear infinite;
}

/* Subtext & Badges */
.step-subtext {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.role-pill {
    background: #f1f5f9;
    color: #64748b;
    padding: 2px 8px;
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

/* Action Tag */
.action-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 12px;
    color: #475569;
    font-weight: 500;
    margin-top: 6px;
}
.action-tag.completed {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
}

`;
    cssContent = cssContent.replace(oldCss, newCss);
    fs.writeFileSync(cssFile, cssContent);
}

const jsxFile = "src/pages/OrderTracking.jsx";
let jsxContent = fs.readFileSync(jsxFile, "utf8");

if (!jsxContent.includes("Loader2")) {
    jsxContent = jsxContent.replace("Loader,", "Loader, Loader2,");
}

const startJsxStr = `<div className="workflow-stepper">`;
const endJsxStr = `</section>`;

const startJsxIndex = jsxContent.indexOf(startJsxStr);
const endJsxIndex = jsxContent.indexOf(endJsxStr, startJsxIndex);

if (startJsxIndex !== -1 && endJsxIndex !== -1) {
    const oldJsx = jsxContent.substring(startJsxIndex, endJsxIndex);
    const newJsx = `<div className="workflow-stepper">
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

                            return (
                                <motion.div 
                                    key={stageObj.stage + index} 
                                    className={\`workflow-step \${statusClass}\`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div className="step-indicator-container">
                                        <div className="step-indicator">
                                            {statusClass === "waiting" ? <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "transparent", border: "2px solid #cbd5e1" }} /> : 
                                             <IconComponent size={statusClass === "current" ? 18 : 16} strokeWidth={2.5} className={statusClass === "current" ? "icon-spin" : ""} />}
                                        </div>
                                        {index < workflow.length - 1 && (
                                            <div className={\`step-connector \${statusClass === "completed" ? "solid" : "dashed"}\`} />
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
                                            <div>
                                                <div className={\`action-tag \${statusClass === "completed" ? "completed" : ""}\`}>
                                                    {statusClass === "completed" ? <CheckCircle size={12} /> : <Activity size={12} />}
                                                    <span>{stageObj.remarks}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                `;
    jsxContent = jsxContent.replace(oldJsx, newJsx);
    if (!jsxContent.includes(" Circle,")) {
        jsxContent = jsxContent.replace("CheckCircle,", "CheckCircle, Circle,");
    }
    fs.writeFileSync(jsxFile, jsxContent);
}

console.log("Timeline UI replaced with redesign.");
