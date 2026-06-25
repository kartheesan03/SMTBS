const fs = require('fs');
let css = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', 'utf8');

// Update .nav-link.active style
css = css.replace(
  /\.nav-link\.active\s*\{[^}]*\}/g,
  `.nav-link.active {
  background-color: rgba(255, 255, 255, 0.5);
  color: #2563eb;
  box-shadow: none;
}`
);

// Restore the before pseudo element
css = css.replace(
  /\.nav-link\.active::before\s*\{[^}]*\}/g,
  `.nav-link.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 4px;
  background: #2563eb;
  border-radius: 0 4px 4px 0;
  display: block;
}`
);

// Tweak hover state to be less pill-like
css = css.replace(
  /\.nav-link:hover\s*\{[^}]*\}/g,
  `.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  color: #0f172a;
  transform: none;
}`
);

fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', css);
console.log('done');
