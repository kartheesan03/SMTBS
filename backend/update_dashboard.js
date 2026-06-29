const fs = require('fs');

try {
    let content = fs.readFileSync('c:/Users/Admin/Documents/project/backend/src/controllers/dashboardcontroller.js', 'utf8');

    const helperCode = `
const generateTrend = (base, count = 7) => {
    return Array.from({length: count}, (_, i) => Math.max(0, base + Math.floor(Math.random() * 10 - 5)));
};
`;

    if(!content.includes('generateTrend')) {
      content = content.replace('const getDashboardStats', helperCode + '\nconst getDashboardStats');
    }

    content = content.replace(
      'const [totalEmployees, totalOrders, totalCustomers, activeCustomers, totalVendors] = await Promise.all([',
      `const [totalEmployees, totalOrders, totalCustomers, activeCustomers, totalVendors] = await Promise.all([`
    );

    content = content.replace(
      'stats = { totalMaterials: activeMaterialsCount, totalEmployees, totalOrders, totalCustomers, activeCustomers, totalVendors };',
      `stats = { 
                    totalMaterials: activeMaterialsCount, 
                    totalEmployees, 
                    totalOrders, 
                    totalCustomers, 
                    activeCustomers, 
                    totalVendors,
                    trends: {
                        employees: generateTrend(totalEmployees),
                        materials: generateTrend(activeMaterialsCount),
                        customers: generateTrend(totalCustomers),
                        orders: generateTrend(totalOrders),
                        revenue: generateTrend(50000), // Will be updated later
                        attendance: generateTrend(85), // Percentage
                        payroll: generateTrend(100000)
                    }
                };`
    );

    content = content.replace(
      'revenue = (revenueResult && revenueResult.length > 0) ? revenueResult[0].total : 0;',
      `revenue = (revenueResult && revenueResult.length > 0) ? revenueResult[0].total : 0;
                if(stats.trends) stats.trends.revenue = generateTrend(revenue / 10);`
    );

    content = content.replace(
      'data = {',
      `data = {
                hrStats: {
                    totalEmployees: stats.totalEmployees || 0,
                    attendanceRate: '92%',
                    onLeave: 2,
                    newJoiners: 1,
                    attendanceHistory: Array.from({length: 7}, (_, i) => ({
                        name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                        employees: Math.max(0, (stats.totalEmployees || 10) - Math.floor(Math.random() * 3))
                    })),
                    employeeDistribution: [
                        { name: 'Engineering', value: Math.floor((stats.totalEmployees || 10) * 0.4), percentage: 40, color: '#3b82f6' },
                        { name: 'Sales', value: Math.floor((stats.totalEmployees || 10) * 0.3), percentage: 30, color: '#10b981' },
                        { name: 'HR', value: Math.floor((stats.totalEmployees || 10) * 0.1), percentage: 10, color: '#f59e0b' },
                        { name: 'Operations', value: Math.floor((stats.totalEmployees || 10) * 0.2), percentage: 20, color: '#ef4444' }
                    ]
                },`
    );

    fs.writeFileSync('c:/Users/Admin/Documents/project/backend/src/controllers/dashboardcontroller.js', content);
    console.log('Successfully updated dashboardcontroller.js');
} catch (e) {
    console.error('Failed to update dashboardcontroller.js:', e);
}
