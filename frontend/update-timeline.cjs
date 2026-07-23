const fs = require("fs");
const file = "src/pages/OrderTracking.jsx";
let content = fs.readFileSync(file, "utf8");

const startStr = `<div className="workflow-stepper">`;
const endStr = `</section>`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const oldBlock = content.substring(startIndex, endIndex);

    const newBlock = `<div className="workflow-stepper">
                        {workflow.map((stageObj, index) => {
                            let statusClass = "waiting";
                            let IconComponent = Clock;
                            
                            if (stageObj.status === "Completed") {
                                statusClass = "completed";
                                IconComponent = CheckCircle;
                            } else if (stageObj.status === "In Progress") {
                                statusClass = "current";
                                IconComponent = Activity;
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
                                            {statusClass === "waiting" ? <div className="dot" /> : <IconComponent size={16} strokeWidth={2.5} />}
                                        </div>
                                        {index < workflow.length - 1 && <div className="step-connector" />}
                                    </div>
                                    <div className="step-details-container">
                                        <div className="step-label">{stageObj.stage}</div>
                                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                            {stageObj.status !== "Upcoming" ? (
                                                <span>{stageObj.role} • {stageObj.status} {stageObj.updatedBy ? \`by \${stageObj.updatedBy}\` : ""}</span>
                                            ) : (
                                                <span>{stageObj.role} • Upcoming</span>
                                            )}
                                        </div>
                                        {stageObj.remarks && (
                                            <div style={{ 
                                                fontSize: "12px", 
                                                color: statusClass === "error" ? "#ef4444" : "#475569", 
                                                fontStyle: "italic", 
                                                marginTop: "4px",
                                                background: statusClass === "error" ? "#fef2f2" : "#f1f5f9",
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                display: "inline-block"
                                            }}>
                                                "{stageObj.remarks}"
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                `;
                
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(file, content);
    console.log("Timeline UI replaced successfully.");
} else {
    console.log("Could not find the target block to replace.");
}
