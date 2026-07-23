const fs = require("fs");

const cssFile = "src/pages/OrderTracking.css";
let cssContent = fs.readFileSync(cssFile, "utf8");

// Remove the vertical timeline CSS we added earlier and replace with horizontal CSS
const startStr = "/* HORIZONTAL TIMELINE */";
const endStr = ".erp-grid-2col {";

const startIndex = cssContent.indexOf(startStr);
const endIndex = cssContent.indexOf("/* 2-Column Grid */", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const oldCss = cssContent.substring(startIndex, endIndex);
    const newCss = `
/* COMPACT HORIZONTAL STEPPER */
.workflow-stepper-container {
    padding: 30px 20px 60px;
    width: 100%;
}

.workflow-stepper {
    display: flex;
    justify-content: space-between;
    position: relative;
    width: 100%;
}

/* Connecting line across all steps */
.workflow-stepper::before {
    content: '';
    position: absolute;
    top: 14px; /* Center of the 28px circles */
    left: 14px;
    right: 14px;
    height: 2px;
    background: #cbd5e1;
    z-index: 0;
}

.workflow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    cursor: pointer;
    z-index: 1;
    width: 12.5%; /* 8 steps = 100/8 */
}

/* Base Circle */
.step-indicator {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border: 2px solid #cbd5e1;
    z-index: 2;
    transition: all 0.2s ease;
    color: #94a3b8;
    position: relative;
    font-size: 13px;
    font-weight: 700;
}

/* Completed */
.workflow-step.completed .step-indicator {
    background: #10b981;
    border-color: #10b981;
    color: white;
}
/* Overwrite the background line for completed segments */
.workflow-step.completed::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: #10b981;
    z-index: 0;
}
.workflow-step:last-child::after {
    display: none;
}

/* Current */
.workflow-step.current .step-indicator {
    width: 34px;
    height: 34px;
    background: #eff6ff;
    border-color: #3b82f6;
    color: #3b82f6;
    font-size: 15px;
    margin-top: -3px; /* Align centers */
}

.pulse-ring {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid rgba(59, 130, 246, 0.4);
    animation: pulse-border 2s infinite;
}
@keyframes pulse-border {
    0% { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0; }
}

/* Step name below */
.step-label-small {
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-align: center;
    margin-top: 12px;
    line-height: 1.2;
    max-width: 80px;
}
.workflow-step.current .step-label-small {
    color: #0f172a;
    font-weight: 700;
}

/* Popover Tooltip */
.step-popover {
    position: absolute;
    bottom: calc(100% + 15px);
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    padding: 12px;
    width: max-content;
    max-width: 220px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 50;
    pointer-events: none;
}

.step-popover.open {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
}

.popover-arrow {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: white;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
}

.popover-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.popover-title {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
}

/* Mobile Scrollable View */
@media (max-width: 992px) {
    .workflow-stepper {
        overflow-x: auto;
        padding-bottom: 10px;
        justify-content: flex-start;
    }
    
    .workflow-step {
        min-width: 100px;
    }
    
    .workflow-stepper::before {
        width: calc(100px * 8 - 14px); /* Approximate width based on min-width */
    }
}
`;
    cssContent = cssContent.replace(oldCss, newCss);
    fs.writeFileSync(cssFile, cssContent);
}

const jsxFile = "src/pages/OrderTracking.jsx";
let jsxContent = fs.readFileSync(jsxFile, "utf8");

// Add state
if (!jsxContent.includes("activePopover")) {
    jsxContent = jsxContent.replace(
        "const [itemsVerification, setItemsVerification] = useState({});", 
        "const [itemsVerification, setItemsVerification] = useState({});\n    const [activePopover, setActivePopover] = useState(null);"
    );
}

// Add useEffect for initial popover
if (!jsxContent.includes("setActivePopover(activeIndex)")) {
    const useEffectEnd = jsxContent.indexOf("fetchData();", jsxContent.indexOf("useEffect(() => {"));
    if (useEffectEnd !== -1) {
        jsxContent = jsxContent.replace(
            "fetchData();",
            "fetchData();\n        if (order && order.workflow) {\n            const activeIndex = order.workflow.findIndex(w => w.status === 'In Progress');\n            if (activeIndex !== -1) setActivePopover(activeIndex);\n        }"
        );
    }
}

const startJsxStr = `<div className="workflow-stepper-container">`;
const endJsxStr = `</section>`;

const startJsxIndex = jsxContent.indexOf(startJsxStr);
const endJsxIndex = jsxContent.indexOf(endJsxStr, startJsxIndex);

if (startJsxIndex !== -1 && endJsxIndex !== -1) {
    const oldJsx = jsxContent.substring(startJsxIndex, endJsxIndex);
    const newJsx = `<div className="workflow-stepper-container">
                        <div className="workflow-stepper">
                            {workflow.map((stageObj, index) => {
                                let statusClass = "waiting";
                                
                                if (stageObj.status === "Completed") {
                                    statusClass = "completed";
                                } else if (stageObj.status === "In Progress") {
                                    statusClass = "current";
                                } else if (stageObj.status === "Issue" || stageObj.status === "Rejected") {
                                    statusClass = "error";
                                }
                                
                                const isPopoverOpen = activePopover === index || (activePopover === null && statusClass === "current");

                                return (
                                    <div 
                                        key={stageObj.stage + index} 
                                        className={\`workflow-step \${statusClass}\`}
                                        onMouseEnter={() => setActivePopover(index)}
                                        onClick={() => setActivePopover(index)}
                                        onMouseLeave={() => {
                                            // Optional: close on leave, or let it stay until another is hovered
                                            // setActivePopover(null)
                                        }}
                                    >
                                        <div className="step-indicator">
                                            {statusClass === "completed" ? (
                                                <CheckCircle size={16} strokeWidth={3} />
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                            {statusClass === "current" && <div className="pulse-ring"></div>}
                                        </div>
                                        
                                        <div className="step-label-small">{stageObj.stage}</div>
                                        
                                        {/* Popover Tooltip */}
                                        <div className={\`step-popover \${isPopoverOpen ? "open" : ""}\`}>
                                            <div className="popover-arrow"></div>
                                            <div className="popover-content">
                                                <div className="popover-title">{stageObj.stage}</div>
                                                <div className="step-subtext" style={{ flexDirection: 'row' }}>
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
                                                        <span style={{ textAlign: "left" }}>{stageObj.remarks}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                `;
    jsxContent = jsxContent.replace(oldJsx, newJsx);
    fs.writeFileSync(jsxFile, jsxContent);
}
