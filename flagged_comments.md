# Flagged Commented-Out Code

### File: C:\Users\Admin\Documents\project\frontend\src\components\ui\DataTable.jsx
- `// { label, icon: Icon, onClick }`
- `// (row) => ReactNode`

### File: C:\Users\Admin\Documents\project\frontend\src\pages\GPSTracking.jsx
- `// Fix for default leaflet icons not showing correctly sometimes`

### File: C:\Users\Admin\Documents\project\frontend\src\pages\OrderKanban.jsx
- `// Fix Leaflet icons`

### File: C:\Users\Admin\Documents\project\frontend\src\pages\OrderTracking.jsx
- `// Optional: close on leave, or let it stay until another is hovered`

### File: C:\Users\Admin\Documents\project\backend\src\config\mongoose-bridge.js
- `// Support { $lte: ['$colA', '$colB'] } → colA <= colB`
- `// In Mongoose nested: .populate({ path: 'employee', populate: { path: 'userId' } })`

### File: C:\Users\Admin\Documents\project\backend\src\controllers\authController.js
- `// NOTE: Mongoose-bridge automatically wraps this query into { where: { email } }. `
- `// Passing { where: { email } } manually causes Sequelize to receive { where: { where: { email } } } which crashes it.`

### File: C:\Users\Admin\Documents\project\backend\src\controllers\employeeController.js
- `// Create User (let User hooks:beforeSave handle hashed password automatically)`

### File: C:\Users\Admin\Documents\project\backend\src\controllers\ordercontroller.js
- `// array of { materialId, status, remarks }`

### File: C:\Users\Admin\Documents\project\backend\src\models\Order.js
- `// { lat, lng, timestamp }`
- `// array of { lat, lng, timestamp }`

### File: C:\Users\Admin\Documents\project\backend\src\models\PurchaseRequest.js
- `// { materialId, quantity, name, sku }`

### File: C:\Users\Admin\Documents\project\backend\src\models\StockRequest.js
- `// Will store JSON stringified array of { status, timestamp, user }`

### File: C:\Users\Admin\Documents\project\backend\src\services\documentProcessor.js
- `// const response = await axios.post('http://localhost:8000/ocr', { url: documentUrl });`
- `// return response.data.text;`

### File: C:\Users\Admin\Documents\project\backend\src\services\gpsSimulator.js
- `// { orderId: currentRouteIndex }`
- `// Don't auto complete the order status, let the employee do it, but mark arrived`

