const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('C:/Users/Admin/Documents/project/frontend/src/pages/*Dashboard.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it has rd-hero
    if (content.includes('className="rd-hero"')) {
        console.log('Migrating: ' + path.basename(file));
        
        // Add import
        if (!content.includes('WelcomeBanner')) {
            content = content.replace(
                "import { LoadingState, ErrorState, EmptyState } from '../components/DataStates';", 
                "import WelcomeBanner from '../components/ui/WelcomeBanner';\nimport { LoadingState, ErrorState, EmptyState } from '../components/DataStates';"
            );
        }

        // We will just do a simple string extraction
        const heroStart = content.indexOf('<div className="rd-hero">');
        
        // Find the matching end div for rd-hero
        let openDivs = 0;
        let pos = heroStart;
        while (pos < content.length) {
            if (content.substr(pos, 4) === '<div') openDivs++;
            if (content.substr(pos, 5) === '</div') openDivs--;
            pos++;
            if (openDivs === 0 && pos > heroStart + 5) break;
        }
        const heroEnd = pos + 4; // include the rest of </div>
        
        const heroContent = content.substring(heroStart, heroEnd);
        
        // Extract pieces using regex
        const subtitleMatch = heroContent.match(/&nbsp;·&nbsp;\s*([^<]+)<\/div>/);
        const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "Here's your overview";
        
        // Extract badges
        const badges = [];
        const neutralMatch = heroContent.match(/<span className="rd-hero-badge badge-neutral">([\s\S]*?)<\/span>/);
        if (neutralMatch) {
            const iconMatch = neutralMatch[1].match(/<([A-Za-z]+)\s+size=\{14\}\s*\/>/);
            const textMatch = neutralMatch[1].replace(/<[^>]+>/g, '').trim();
            if (iconMatch) badges.push(`{ icon: ${iconMatch[1]}, text: \`${textMatch.replace('{', '${')}\`, type: 'neutral' }`);
        }
        const statusMatch = heroContent.match(/<span className="rd-hero-badge badge-status">([\s\S]*?)<\/span>/);
        if (statusMatch) {
            const textMatch = statusMatch[1].replace(/<[^>]+>/g, '').trim();
            badges.push(`{ type: 'status', text: \`${textMatch.replace('{', '${')}\` }`);
        }

        // Extract right visual
        const visualMatch = heroContent.match(/<div className="rd-hero-visual">([\s\S]*?)<\/div>\s*<div className="rd-hero-actions-col">/);
        const visualContent = visualMatch ? visualMatch[1].trim() : '';

        // Extract actions
        const actions = [];
        const btn1Match = heroContent.match(/<button className="hero-action-btn primary" onClick=\{([^}]+)\}>([\s\S]*?)<\/button>/);
        if (btn1Match) {
            const iconMatch = btn1Match[2].match(/<([A-Za-z]+)\s+size=\{15\}\s*\/>/);
            const textMatch = btn1Match[2].replace(/<[^>]+>/g, '').trim();
            actions.push(`{ label: '${textMatch}', icon: ${iconMatch ? iconMatch[1] : 'null'}, variant: 'primary', onClick: ${btn1Match[1]} }`);
        }
        const btn2Match = heroContent.match(/<button className="hero-action-btn secondary" onClick=\{([^}]+)\}>([\s\S]*?)<\/button>/);
        if (btn2Match) {
            const iconMatch = btn2Match[2].match(/<([A-Za-z]+)\s+size=\{15\}\s*\/>/);
            const textMatch = btn2Match[2].replace(/<[^>]+>/g, '').trim();
            actions.push(`{ label: '${textMatch}', icon: ${iconMatch ? iconMatch[1] : 'null'}, variant: 'secondary', onClick: ${btn2Match[1]} }`);
        }

        const newBanner = `
                <WelcomeBanner 
                    user={user}
                    greeting={\`\${getGreeting()}\`}
                    subtitle={\`\${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${subtitle}\`}
                    badges={[
                        ${badges.join(',\n                        ')}
                    ]}
                    rightVisuals={
                        <>
                            ${visualContent.replace(/\n/g, '\n                            ')}
                        </>
                    }
                    actions={[
                        ${actions.join(',\n                        ')}
                    ]}
                />`;
                
        content = content.substring(0, heroStart) + newBanner.trim() + content.substring(heroEnd);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Saved: ' + path.basename(file));
    }
});
