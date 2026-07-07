import os
import re

dir_path = 'c:/Users/Admin/Documents/project/frontend/src/pages'
count = 0

old_pattern = re.compile(
    r'<div className=\{`ent-module-card [^>]+>\s*<div>\s*<div className=\"ent-card-header\">\s*<span className=\"ent-card-title\"[^>]*>\{title\}</span>\s*<div className=\"ent-card-icon-wrapper\">\s*(?:\{Icon && )?<Icon[^>]+>(?:\})?\s*</div>\s*</div>\s*<div className=\"ent-card-value\">\{val\}</div>\s*<div[^>]*>\s*[^<]+\s*</div>\s*</div>\s*<div>\s*<div[^>]*>\s*<div[^>]*></div>\s*Updated Today\s*</div>\s*</div>\s*</div>', 
    re.DOTALL
)

replacement = """<div className={`ent-module-card ${typeof themeClass !== 'undefined' ? themeClass : (color ? `ent-theme-${color}` : 'ent-theme-primary')}`}>
            <div className="ent-card-icon-wrapper">
                {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            
            <div className="ent-card-title" title={title}>{title}</div>
            
            <div className="ent-card-value-area">
                <div className="ent-card-value">{val}</div>
                <div className="ent-card-status-badge" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--ent-text-secondary)', fontWeight: 500 }} title="Monitoring Level">
                    Monitoring Level
                </div>
            </div>
            
            <div className="ent-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', height: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                        Updated Today
                    </div>
                </div>
            </div>
        </div>"""

for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.jsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if 'ent-module-card' in content:
                new_content = old_pattern.sub(replacement, content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f'Updated {f}')
                    count += 1

print(f"Total files updated: {count}")
