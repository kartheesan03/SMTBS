const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TrackingDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const oldSelect = `<select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
              <option value="">All Locations</option>
              <option value="warehouse 1">Warehouse 1</option>
              <option value="warehouse 2">Warehouse 2</option>
              <option value="warehouse 3">Warehouse 3</option>
              <option value="warehouse 4">Warehouse 4</option>
            </select>`;

const newSelect = `
            {(() => {
              const uniqueLocations = [...new Set(movements.map(m => m.materialLocation).filter(Boolean))].sort();
              return (
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
                  <option value="">All Locations</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                  ))}
                </select>
              );
            })()}`;

content = content.replace(oldSelect, newSelect);

// Let's also do movement types just in case they meant that too, although movement types are usually an ENUM.
const oldTypeSelect = `<select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
              <option value="">All Movement Types</option>
              <option value="in">IN</option>
              <option value="out">OUT</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>`;

const newTypeSelect = `
            {(() => {
              const uniqueTypes = [...new Set(movements.map(m => m.type).filter(Boolean))].sort();
              return (
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", textTransform: 'capitalize' }}>
                  <option value="">All Movement Types</option>
                  {uniqueTypes.map(t => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              );
            })()}`;

content = content.replace(oldTypeSelect, newTypeSelect);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully patched TrackingDashboard.jsx to remove hardcoded filters');
