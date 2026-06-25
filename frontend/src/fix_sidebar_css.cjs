const fs = require('fs');
let css = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', 'utf8');

const start = css.indexOf('/* Sidebar */');
const end = css.indexOf('/* Main Content Area */');

if (start !== -1 && end !== -1) {
  const newSidebarCSS = `/* Sidebar */
.app-sidebar {
  width: var(--sidebar-width);
  background: rgba(11, 15, 25, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--sidebar-text);
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: 88px;
}

.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.app-sidebar.collapsed .sidebar-header {
  padding: 0;
  justify-content: center;
}

.sidebar-brand {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 800;
  color: #FFF;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.2s;
}

.app-sidebar.collapsed .sidebar-brand-text {
  display: none;
}

.sidebar-search-container {
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sidebar-search {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 8px 12px;
  color: #FFF;
  gap: 10px;
  transition: all 0.2s;
}

.sidebar-search:focus-within {
  border-color: var(--primary);
  background: rgba(255,255,255,0.08);
}

.sidebar-search input {
  background: transparent;
  border: none;
  color: #FFF;
  width: 100%;
  outline: none;
  font-size: 14px;
}

.sidebar-search input::placeholder {
  color: rgba(255,255,255,0.4);
}

.app-sidebar.collapsed .sidebar-search-container {
  padding: 16px 20px;
}

.app-sidebar.collapsed .sidebar-search input {
  display: none;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-nav::-webkit-scrollbar { display: none; }
.sidebar-nav { -ms-overflow-style: none; scrollbar-width: none; }

.nav-section {
  margin-bottom: 12px;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  transition: color 0.2s;
}

.nav-section-header:hover {
  color: #FFF;
}

.nav-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
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

.app-sidebar.collapsed .nav-section-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  width: 24px;
  margin: 12px auto;
  display: block;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--sidebar-text);
  font-size: 14px;
  font-weight: 500;
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
  background-color: rgba(255,255,255,0.05);
  color: #FFF;
}

.nav-link.active {
  background-color: var(--primary-glass);
  color: var(--primary);
  font-weight: 600;
}

.nav-link.active::before {
  content: "";
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background: var(--primary);
  border-radius: 0 4px 4px 0;
}

.app-sidebar.collapsed .nav-link.active::before {
  left: 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  transition: background 0.2s;
  border: 1px solid rgba(255,255,255,0.05);
}

.user-profile-sm:hover {
  background: rgba(255,255,255,0.08);
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
  background: linear-gradient(135deg, var(--primary), var(--purple));
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info-sm {
  overflow: hidden;
}

.user-info-sm h4 {
  font-size: 13px;
  color: #FFF;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.user-info-sm p {
  font-size: 11px;
  color: var(--sidebar-text);
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.collapse-toggle {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--sidebar-text);
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
  background: rgba(255,255,255,0.1);
  color: #FFF;
}

.tooltip-container {
  position: relative;
}

.tooltip {
  position: absolute;
  left: calc(100% + 16px);
  top: 50%;
  transform: translateY(-50%);
  background: #1E293B;
  color: #FFF;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
  box-shadow: var(--shadow-md);
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
  console.log('CSS updated successfully');
} else {
  console.log('Could not find markers in index.css');
}
