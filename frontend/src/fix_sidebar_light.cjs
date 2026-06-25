const fs = require('fs');
let css = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', 'utf8');

const start = css.indexOf('/* Sidebar */');
const end = css.indexOf('/* Main Content Area */');

if (start !== -1 && end !== -1) {
  const newSidebarCSS = `/* Sidebar */
.app-sidebar {
  width: var(--sidebar-width);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #475569;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.app-sidebar.collapsed .sidebar-header {
  padding: 0;
  justify-content: center;
}

.sidebar-brand {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
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
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 12px;
  color: #0f172a;
  gap: 10px;
  transition: all 0.2s;
}

.sidebar-search:focus-within {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.sidebar-search input {
  background: transparent;
  border: none;
  color: #0f172a;
  width: 100%;
  outline: none;
  font-size: 13px;
}

.sidebar-search input::placeholder {
  color: #94a3b8;
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
  color: #94a3b8;
  transition: color 0.2s;
}

.nav-section-header:hover {
  color: #475569;
}

.nav-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
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
  padding: 10px 12px;
  border-radius: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  white-space: nowrap;
}

.app-sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}

.nav-link-text {
  transition: opacity 0.2s;
}

.app-sidebar.collapsed .nav-link-text,
.app-sidebar.collapsed .nav-link-badge {
  display: none;
}

.nav-link:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.nav-link.active {
  background-color: #eff6ff;
  color: #2563eb;
}

.nav-link.active::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 4px;
  background: #2563eb;
  border-radius: 0 4px 4px 0;
}

.app-sidebar.collapsed .nav-link.active::before {
  left: 0;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
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
  padding: 8px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.user-profile-sm:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.user-info-sm {
  overflow: hidden;
}

.user-info-sm h4 {
  font-size: 13px;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 600;
}
.user-info-sm p {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.collapse-toggle {
  background: #f1f5f9;
  border: 1px solid transparent;
  color: #64748b;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-toggle:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.tooltip-container {
  position: relative;
}

.tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: #0f172a;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
  console.log('CSS updated to light theme successfully');
} else {
  console.log('Could not find markers');
}
