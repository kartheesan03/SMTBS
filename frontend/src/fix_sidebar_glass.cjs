const fs = require('fs');
let css = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', 'utf8');

// Update app-layout
css = css.replace(
  /\.app-layout\s*\{[^}]*\}/,
  `.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  /* Beautiful pastel mesh gradient background */
  background-color: #f1f0fb;
  background-image: 
    radial-gradient(at 0% 0%, hsla(253,16%,7%,0) 0, transparent 50%), 
    radial-gradient(at 50% 0%, hsla(225,39%,30%,0) 0, transparent 50%), 
    radial-gradient(at 100% 0%, hsla(339,49%,30%,0) 0, transparent 50%);
  background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
  padding: 16px;
  gap: 16px;
}`
);

// Update app-main
css = css.replace(
  /\.app-main\s*\{[^}]*\}/,
  `.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.5);
}`
);

// Update topbar inside main
css = css.replace(
  /\.app-topbar\s*\{[^}]*\}/,
  `.app-topbar {
  height: var(--topbar-height);
  background: transparent;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 40;
}`
);

const start = css.indexOf('/* Sidebar */');
const end = css.indexOf('/* Main Content Area */');

if (start !== -1 && end !== -1) {
  const newSidebarCSS = `/* Sidebar */
.app-sidebar {
  width: var(--sidebar-width);
  background: rgba(255, 255, 255, 0.35); /* Super translucent */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #1e293b;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.3);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.app-sidebar.collapsed .sidebar-header {
  padding: 0;
  justify-content: center;
}

.sidebar-brand {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
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
  padding: 16px 20px;
}

.sidebar-search {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 10px 14px;
  color: #0f172a;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.sidebar-search:focus-within {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.sidebar-search input {
  background: transparent;
  border: none;
  color: #0f172a;
  width: 100%;
  outline: none;
  font-size: 14px;
  font-weight: 500;
}

.sidebar-search input::placeholder {
  color: #64748b;
  font-weight: 400;
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
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  color: #475569;
  transition: color 0.2s;
}

.nav-section-header:hover {
  color: #0f172a;
}

.nav-section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 800;
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
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  white-space: nowrap;
}

.app-sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 14px;
}

.nav-link-text {
  transition: opacity 0.2s;
}

.app-sidebar.collapsed .nav-link-text,
.app-sidebar.collapsed .nav-link-badge {
  display: none;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.6);
  color: #0f172a;
  transform: translateX(4px);
}

.nav-link.active {
  background-color: #ffffff;
  color: #2563eb;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.nav-link.active::before {
  display: none; /* No ugly border line, the white pill is enough */
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-sidebar.collapsed .sidebar-footer {
  padding: 20px 10px;
  align-items: center;
}

.user-profile-sm {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.user-profile-sm:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

.app-sidebar.collapsed .user-profile-sm {
  background: transparent;
  border: none;
  padding: 4px;
  box-shadow: none;
}

.app-sidebar.collapsed .user-info-sm {
  display: none;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.user-info-sm {
  overflow: hidden;
}

.user-info-sm h4 {
  font-size: 14px;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 700;
}
.user-info-sm p {
  font-size: 12px;
  color: #475569;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.collapse-toggle {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.9);
  color: #475569;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.collapse-toggle:hover {
  background: #ffffff;
  color: #0f172a;
  transform: scale(1.05);
}

.tooltip-container {
  position: relative;
}

.tooltip {
  position: absolute;
  left: calc(100% + 16px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 1);
}

.app-sidebar.collapsed .nav-link:hover .tooltip,
.app-sidebar.collapsed .user-profile-sm:hover .tooltip {
  opacity: 1;
  visibility: visible;
  left: calc(100% + 12px);
}

`;
  css = css.slice(0, start) + newSidebarCSS + css.slice(end);
  fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', css);
  console.log('CSS updated to floating glass island successfully');
} else {
  console.log('Could not find markers');
}
