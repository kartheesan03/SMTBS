const fs = require('fs');

let content = fs.readFileSync('src/controllers/dashboardcontroller.js', 'utf8');

// Block 1: Lines 81-95
content = content.replace(
`      const salesCount = await Order.countDocuments({ orderType: "sales" });
      const purchaseCount = await Order.countDocuments({
        orderType: "purchase",
      });
      const activeOrdersCount = await Order.countDocuments({
        status: {
          $nin: [
            "Completed",
            "Delivered",
            "Workflow Completed",
            "Invoice Generated",
            "Cancelled",
          ],
        },
      });`,
`      const [salesCount, purchaseCount, activeOrdersCount] = await Promise.all([
        Order.countDocuments({ orderType: "sales" }),
        Order.countDocuments({ orderType: "purchase" }),
        Order.countDocuments({
          status: {
            $nin: [
              "Completed",
              "Delivered",
              "Workflow Completed",
              "Invoice Generated",
              "Cancelled",
            ],
          },
        })
      ]);`
);

// Block 2: Analytics object awaits
content = content.replace(
`          activeProjects: await Order.countDocuments({
            status: { $in: ["Pending", "Processing"] },
          }),
          pendingApprovals:
            (await Order.countDocuments({ status: "Awaiting Approval" })) +
            (await Leave.countDocuments({ status: "Pending" })),`,
`          activeProjects: await Order.countDocuments({ status: { $in: ["Pending", "Processing"] } }),
          pendingApprovals: (await Order.countDocuments({ status: "Awaiting Approval" })) + (await Leave.countDocuments({ status: "Pending" })),`
);

// We need to pull them out.
const analyticsFind = `      const analytics = {
        healthMetrics: {
          orderFulfillment: Math.round(
            (fulfilledOrderCount / (totalOrderCount || 1)) * 100
          ),
          activeProjects: await Order.countDocuments({
            status: { $in: ["Pending", "Processing"] },
          }),
          pendingApprovals:
            (await Order.countDocuments({ status: "Awaiting Approval" })) +
            (await Leave.countDocuments({ status: "Pending" })),
          teamProductivity: 0,
        },
        actionableInsights: [
          {
            type: "low_stock",
            message: \`\${lowStockMaterials.length} items need reordering\`,
          },
        ],
        quickStats: {
          pendingOrders: await Order.countDocuments({
            status: { $in: ["Pending", "Processing"] },
          }),
          pendingSalaries: await Salary.countDocuments({
            status: "Awaiting Approval",
          }),
          pendingCustomers: await Customer.countDocuments({
            status: "Pending Review",
          }),
        },`;
        
const analyticsReplace = `      const [activeProjects, approvalsOrders, approvalsLeaves, pendingOrdersCount, pendingSalariesCount, pendingCustomersCount] = await Promise.all([
          Order.countDocuments({ status: { $in: ["Pending", "Processing"] } }),
          Order.countDocuments({ status: "Awaiting Approval" }),
          Leave.countDocuments({ status: "Pending" }),
          Order.countDocuments({ status: { $in: ["Pending", "Processing"] } }),
          Salary.countDocuments({ status: "Awaiting Approval" }),
          Customer.countDocuments({ status: "Pending Review" }),
      ]);
      const analytics = {
        healthMetrics: {
          orderFulfillment: Math.round(
            (fulfilledOrderCount / (totalOrderCount || 1)) * 100
          ),
          activeProjects: activeProjects,
          pendingApprovals: approvalsOrders + approvalsLeaves,
          teamProductivity: 0,
        },
        actionableInsights: [
          {
            type: "low_stock",
            message: \`\${lowStockMaterials.length} items need reordering\`,
          },
        ],
        quickStats: {
          pendingOrders: pendingOrdersCount,
          pendingSalaries: pendingSalariesCount,
          pendingCustomers: pendingCustomersCount,
        },`;
content = content.replace(analyticsFind, analyticsReplace);

// Block 3: customerStats (around line 640)
const custStatsFind = `      const customerStats = {
        totalCustomers: await Customer.countDocuments(),
        activeCustomers: await Customer.countDocuments({ status: "Active" }),
        customerSegments: [
          {
            name: "Active",
            value: await Customer.countDocuments({ status: "Active" }),
            color: "#10b981",
          },
          {
            name: "Pending",
            value: await Customer.countDocuments({ status: "Pending Review" }),
            color: "#f59e0b",
          },
          {
            name: "Inactive",
            value: await Customer.countDocuments({ status: "Inactive" }),
            color: "#ef4444",
          },
        ],
      };`;
const custStatsReplace = `      const [totCust, actCust, pendCust, inactCust] = await Promise.all([
          Customer.countDocuments(),
          Customer.countDocuments({ status: "Active" }),
          Customer.countDocuments({ status: "Pending Review" }),
          Customer.countDocuments({ status: "Inactive" })
      ]);
      const customerStats = {
        totalCustomers: totCust,
        activeCustomers: actCust,
        customerSegments: [
          { name: "Active", value: actCust, color: "#10b981" },
          { name: "Pending", value: pendCust, color: "#f59e0b" },
          { name: "Inactive", value: inactCust, color: "#ef4444" },
        ],
      };`;
content = content.replace(custStatsFind, custStatsReplace);

// Block 4: Vendor stats
const vendStatsFind = `      const vendorStats = {
        totalVendors: await Vendor.countDocuments(),
        activeVendors: await Vendor.countDocuments({ status: "Active" }),
        vendorSegments: [
          {
            name: "Active",
            value: await Vendor.countDocuments({ status: "Active" }),
            color: "#10b981",
          },
          {
            name: "Pending",
            value: await Order.countDocuments({ status: "Awaiting Approval" }),
            color: "#f59e0b",
          },
        ],
      };`;
const vendStatsReplace = `      const [totVend, actVend, pendOrd] = await Promise.all([
          Vendor.countDocuments(),
          Vendor.countDocuments({ status: "Active" }),
          Order.countDocuments({ status: "Awaiting Approval" })
      ]);
      const vendorStats = {
        totalVendors: totVend,
        activeVendors: actVend,
        vendorSegments: [
          { name: "Active", value: actVend, color: "#10b981" },
          { name: "Pending", value: pendOrd, color: "#f59e0b" },
        ],
      };`;
content = content.replace(vendStatsFind, vendStatsReplace);

fs.writeFileSync('src/controllers/dashboardcontroller.js', content);
console.log('Done refactoring obvious sequential awaits!');
