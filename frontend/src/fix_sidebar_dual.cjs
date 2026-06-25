const fs = require('fs');
let css = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', 'utf8');

// Update app-layout for Dual Tier
css = css.replace(
  /\.app-layout\s*\{[^}]*\}/,
  `.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f1f5f9;
}`
);

// Update app-main for Dual Tier
css = css.replace(
  /\.app-main\s*\{[^}]*\}/,
  `.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
  border-top-left-radius: 20px;
  box-shadow: -5px 0 25px rgba(0,0,0,0.05);
}`
);

const start = css.indexOf('/* Sidebar */');
const end = css.indexOf('/* Main Content Area */');

if (start !== -1 && end !== -1) {
  const newSidebarCSS = `/* Sidebar */
.dual-sidebar {
  display: flex;
  height: 100%;
  flex-shrink: 0;
  z-index: 50;
}

/* Tier 1 - Dark Icon Strip */
.sidebar-tier1 {
  width: 72px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 16px;
  border-right: 1px solid rgba(255,255,255,0.05);
}

.tier1-brand {
  margin-bottom: 24px;
}

.tier1-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
}

.tier1-item {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #94a3b8;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tier1-item:hover {
  background: rgba(255,255,255,0.1);
  color: #f8fafc;
}

.tier1-item.active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37,99,235,0.4);
}

.tier1-footer {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
}

.tier1-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid #1e293b;
}

.tier1-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Tooltips for Tier 1 */
.tooltip-container {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(10px);
  background: #1e293b;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.tier1-item:hover + .tooltip,
.tier1-avatar:hover + .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(5px);
}

/* Tier 2 - Secondary Light Menu */
.sidebar-tier2 {
  width: 240px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.tier2-header h2 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 24px 0;
  letter-spacing: -0.3px;
}

.tier2-search {
  display: flex;
  align-items: center;
  background: #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  gap: 8px;
  margin-bottom: 24px;
}

.tier2-search input {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 13px;
  color: #0f172a;
}

.tier2-search input::placeholder {
  color: #64748b;
}

.tier2-nav {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tier2-nav::-webkit-scrollbar { display: none; }
.tier2-nav { -ms-overflow-style: none; scrollbar-width: none; }

.tier2-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.tier2-link:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tier2-link.active {
  background: #e0e7ff;
  color: #4338ca;
}

.tier2-badge {
  margin-left: auto;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
}

.tier2-footer {
  margin-top: auto;
  padding-top: 16px;
}

.tier2-logout {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.tier2-logout:hover {
  background: #fee2e2;
  color: #b91c1c;
}

`;
  css = css.slice(0, start) + newSidebarCSS + css.slice(end);
  fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', css);
  console.log('Dual-tier CSS updated successfully');
} else {
  console.log('Could not find markers');
}
