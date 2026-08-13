const fs = require('fs');
const path = require('path');

const cssPath = 'c:/Users/Admin/Documents/project/frontend/src/components/AdminDashboard/DashboardLayout.css';
let css = fs.readFileSync(cssPath, 'utf8');

const newCSS = `
/* ═══════════════════════════════════════
   PERFECT MASTER LAYOUT GRID
   ═══════════════════════════════════════ */
.db-master-grid {
  display: grid;
  grid-template-columns: 9fr 3fr;
  gap: var(--db-gap);
  margin-bottom: var(--db-gap);
}

.db-left-pane {
  display: flex;
  flex-direction: column;
  gap: var(--db-gap);
}

.db-right-pane {
  display: flex;
  flex-direction: column;
}

.db-bottom-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--db-gap);
}

/* ═══════════════════════════════════════
   BENTO COLUMNS
   ═══════════════════════════════════════ */
.db-col-2 { grid-column: span 2; }
.db-col-3 { grid-column: span 3; }
.db-col-4 { grid-column: span 4; }
.db-col-6 { grid-column: span 6; }
.db-col-8 { grid-column: span 8; }
.db-col-9 { grid-column: span 9; }
.db-col-12 { grid-column: span 12; }

@media (max-width: 1400px) {
  .db-master-grid { grid-template-columns: 1fr; }
  .db-bottom-grid { grid-template-columns: repeat(6, 1fr); }
  .db-col-2 { grid-column: span 3; }
  .db-col-3 { grid-column: span 3; }
}

@media (max-width: 1024px) {
  .db-bottom-grid { grid-template-columns: 1fr; }
  .db-col-2, .db-col-3, .db-col-4, .db-col-6, .db-col-8, .db-col-9 { grid-column: span 12; }
}

/* Fix flex stretching */
.db-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.db-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.db-chart-wrap {
  flex: 1;
  min-height: 220px;
  width: 100%;
  display: flex;
  align-items: flex-end;
}
.db-donut-wrap {
  width: 100%;
  height: 200px;
  margin: auto;
}
`;

// Append the new layout system to the end of CSS
css += newCSS;
fs.writeFileSync(cssPath, css);
console.log('CSS updated with perfect grid layout');
