const fs = require('fs');

let content = fs.readFileSync('src/controllers/dashboardcontroller.js', 'utf8');

// We will rename getDashboardStats to computeDashboardStats
content = content.replace('const getDashboardStats = async (req, res) => {', 'const computeDashboardStats = async (req, res) => {');

// We will append getDashboardStats at the end
const cacheLogic = `
// --- CACHE LAYER ---
const cache = new Map();

const getDashboardStats = async (req, res) => {
  const userId = req.user.id;
  
  if (cache.has(userId)) {
    const cachedData = cache.get(userId);
    // If cache is less than 60 seconds old, return it instantly
    if (Date.now() - cachedData.timestamp < 60000) {
      return res.json(cachedData.data);
    }
  }

  // If cache is missing or expired, we compute it. 
  // To prevent the 10-second timeout on the frontend, if there is a STALE cache, we return the stale cache IMMEDIATELY and compute in background!
  if (cache.has(userId)) {
    // Return stale data immediately
    res.json(cache.get(userId).data);
    
    // Compute in background
    const dummyRes = {
      json: (data) => {
        cache.set(userId, { data, timestamp: Date.now() });
      },
      status: () => dummyRes
    };
    computeDashboardStats(req, dummyRes).catch(console.error);
    return;
  }

  // If there is NO cache at all (very first load), we MUST wait for it.
  // But wait, the user will time out in 10s. So we will start computing, and if it takes more than 8s, we return a partial/empty stats object, but keep computing!
  // Actually, we'll just wait for it. The frontend might time out, but the cache will populate.
  
  const dummyRes = {
    json: (data) => {
      cache.set(userId, { data, timestamp: Date.now() });
      if (!res.headersSent) {
        res.json(data);
      }
    },
    status: (code) => {
      if (!res.headersSent) res.status(code);
      return dummyRes;
    }
  };

  computeDashboardStats(req, dummyRes).catch(err => {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  });
};

module.exports = {
  getDashboardStats,
};
`;

content = content.replace(/module\.exports\s*=\s*\{\s*getDashboardStats,?\s*\};?/g, '');
content += cacheLogic;

fs.writeFileSync('src/controllers/dashboardcontroller.js', content);
console.log('Cache injected!');
