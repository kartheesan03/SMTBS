const fs = require('fs');
const cssFile = 'src/index.css';

let css = fs.readFileSync(cssFile, 'utf8');

const globalButtons = `
/* GLOBAL PREMIUM BUTTONS */
.app-main:not(:has(.login-wrapper)) .btn-primary {
    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 12px 28px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: pointer !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
    position: relative !important;
    overflow: hidden !important;
    letter-spacing: 0.3px !important;
    text-shadow: none !important;
}

.app-main:not(:has(.login-wrapper)) .btn-primary::after {
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

.app-main:not(:has(.login-wrapper)) .btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5) !important;
    background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%) !important;
}

.app-main:not(:has(.login-wrapper)) .btn-primary:hover::after {
    left: 150% !important;
}

.app-main:not(:has(.login-wrapper)) .btn-secondary {
    background: transparent !important;
    color: #64748b !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    text-shadow: none !important;
}

.app-main:not(:has(.login-wrapper)) .btn-secondary:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border-color: #94a3b8 !important;
}
`;

if (!css.includes('GLOBAL PREMIUM BUTTONS')) {
    fs.writeFileSync(cssFile, css + '\n' + globalButtons);
    console.log('Added global buttons successfully.');
} else {
    console.log('Global buttons already exist.');
}
