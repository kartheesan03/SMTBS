const fs = require('fs');
const path = require('path');

const cssPath = 'C:/Users/Admin/Documents/project/frontend/src/index.css';
let content = fs.readFileSync(cssPath, 'utf8');

const buttonCSS = `
/* 3. Buttons */
.btn-primary, .btn-secondary, .btn-outline, .ui-button, .action-btn, .btn-save, .btn-cancel, .btn-secondary-light, .qa-btn, .btn-approve, .btn-reject {
  display: inline-flex !important; align-items: center !important; justify-content: center !important;
  gap: 8px !important; height: 42px !important; padding: 0 20px !important;
  font-family: 'Inter', sans-serif !important; font-size: 14px !important; font-weight: 500 !important;
  border-radius: var(--radius-md) !important; cursor: pointer !important;
  transition: all 0.2s ease !important; outline: none !important; white-space: nowrap !important;
  border: none !important;
}
.btn-primary, .btn-save, .btn-approve {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
  position: relative !important;
  overflow: hidden !important;
  border: none !important;
  letter-spacing: 0.3px !important;
}
.btn-primary::after, .btn-save::after, .btn-approve::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 50% !important;
  height: 100% !important;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent) !important;
  transform: skewX(-20deg) !important;
  transition: all 0.5s ease !important;
}
.btn-primary:hover:not(:disabled), .btn-save:hover:not(:disabled), .btn-approve:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%) !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5) !important;
  transform: translateY(-2px) !important;
}
.btn-primary:hover:not(:disabled)::after, .btn-save:hover:not(:disabled)::after, .btn-approve:hover:not(:disabled)::after {
  left: 150% !important;
}
.btn-secondary, .btn-outline, .btn-cancel, .btn-secondary-light {
  background-color: var(--bg-surface) !important;
  color: var(--text-heading) !important;
  border: 1px solid var(--border-strong) !important;
  box-shadow: var(--shadow-sm) !important;
}
.btn-secondary:hover:not(:disabled), .btn-outline:hover:not(:disabled), .btn-cancel:hover, .btn-secondary-light:hover {
  background-color: var(--bg-hover) !important;
  color: var(--text-heading) !important;
}
.btn-primary:disabled, .btn-secondary:disabled, button:disabled {
  opacity: 0.6 !important; cursor: not-allowed !important; transform: none !important; box-shadow: none !important;
}
`;

content = content.replace('/* 4. Inputs & Forms */', buttonCSS + '\n/* 4. Inputs & Forms */');
fs.writeFileSync(cssPath, content);
console.log('CSS fixed');
