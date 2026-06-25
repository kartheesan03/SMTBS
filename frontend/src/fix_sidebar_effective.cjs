const fs = require('fs');
let css = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', 'utf8');

const start = css.indexOf('/* Sidebar */');
const end = css.indexOf('/* Main Content Area */');

if (start !== -1 && end !== -1) {
  const newSidebarCSS = `/* Sidebar */
.app-sidebar {
  width: var(--sidebar-width);
  background: #09090b; /* Zinc 950 - Ultra dark */
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #a1a1aa; /* Zinc 400 */
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.app-sidebar.collapsed .sidebar-header {
  padding: 0;
  justify-content: center;
}

.sidebar-brand {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: opacity 0.2s;
}

.app-sidebar.collapsed .sidebar-brand-text {
  display: none;
}

.sidebar-search-container {
  padding: 16px 20px;
}

.sidebar-search {
  display: flex;
  align-items: center;
  background: #18181b; /* Zinc 900 */
  border: 1px solid #27272a; /* Zinc 800 */
  border-radius: 8px;
  padding: 8px 12px;
  color: #e4e4e7;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.sidebar-search:focus-within {
  border-color: #3f3f46;
  background: #27272a;
}

.sidebar-search input {
  background: transparent;
  border: none;
  color: #fff;
  width: 100%;
  outline: none;
  font-size: 13px;
}

.sidebar-search input::placeholder {
  color: #71717a;
}

.app-sidebar.collapsed .sidebar-search-container {
  padding: 16px;
}

.app-sidebar.collapsed .sidebar-search input {
  display: none;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav::-webkit-scrollbar { display: none; }
.sidebar-nav { -ms-overflow-style: none; scrollbar-width: none; }

.nav-section {
  margin-bottom: 16px;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  color: #71717a;
  transition: color 0.2s;
}

.nav-section-header:hover {
  color: #a1a1aa;
}

.nav-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin: 0;
}

.app-sidebar.collapsed .nav-section-header {
  justify-content: center;
}
.app-sidebar.collapsed .nav-section-title,
.app-sidebar.collapsed .nav-section-toggle {
  display: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  color: #a1a1aa;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  white-space: nowrap;
}

.app-sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 10px;
}

.nav-link-text {
  transition: opacity 0.2s;
}

.app-sidebar.collapsed .nav-link-text,
.app-sidebar.collapsed .nav-link-badge {
  display: none;
}

.nav-link:hover {
  background-color: #18181b;
  color: #fafafa;
}

.nav-link.active {
  background-color: #27272a;
  color: #fff;
  font-weight: 600;
}

.nav-link.active::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 3px;
  background: #fafafa;
  border-radius: 0 4px 4px 0;
}

.app-sidebar.collapsed .nav-link.active::before {
  left: 0;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-sidebar.collapsed .sidebar-footer {
  padding: 16px 8px;
  align-items: center;
}

.user-profile-sm {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
  background: transparent;
  border-radius: 8px;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.user-profile-sm:hover {
  background: #18181b;
  border-color: #27272a;
}

.app-sidebar.collapsed .user-profile-sm {
  background: transparent;
  border: none;
  padding: 4px;
}

.app-sidebar.collapsed .user-info-sm {
  display: none;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.user-info-sm {
  overflow: hidden;
}

.user-info-sm h4 {
  font-size: 13px;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 500;
}
.user-info-sm p {
  font-size: 11px;
  color: #71717a;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.collapse-toggle {
  background: transparent;
  border: 1px solid transparent;
  color: #71717a;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-toggle:hover {
  background: #27272a;
  color: #fff;
}

.tooltip-container {
  position: relative;
}

.tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: #27272a;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
  border: 1px solid #3f3f46;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.app-sidebar.collapsed .nav-link:hover .tooltip,
.app-sidebar.collapsed .user-profile-sm:hover .tooltip {
  opacity: 1;
  visibility: visible;
  left: calc(100% + 8px);
}

`;
  css = css.slice(0, start) + newSidebarCSS + css.slice(end);
  fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', css);
  console.log('CSS updated to effective ultra-dark theme successfully');
} else {
  console.log('Could not find markers');
}
