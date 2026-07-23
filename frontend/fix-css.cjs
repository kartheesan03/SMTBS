const fs = require("fs");
const cssFile = "src/pages/OrderTracking.css";
let content = fs.readFileSync(cssFile, "utf8");

if (!content.includes(".role-pill {")) {
    const cssToAdd = `
.step-subtext {
    display: flex;
    align-items: center;
    gap: 8px;
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
`;
    content = content.replace("/* Mobile Scrollable View */", cssToAdd + "\n/* Mobile Scrollable View */");
    fs.writeFileSync(cssFile, content);
}
