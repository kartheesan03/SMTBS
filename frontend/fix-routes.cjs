const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = '<Route path="/quotations" element={<ProtectedRoute requiredPermission="view_crm"><ComingSoonPage title="Quotations" subtitle="Quotation and proposal generation will be enabled soon." /></ProtectedRoute>} />';

const missingRoutes = `
                    <Route path="/vendors" element={<ProtectedRoute requiredPermission="manage_materials"><Vendors /></ProtectedRoute>} />
                    <Route path="/vendors/new" element={<ProtectedRoute requiredPermission="manage_materials"><AddVendor /></ProtectedRoute>} />
                    <Route path="/vendors/:id" element={<ProtectedRoute requiredPermission="manage_materials"><VendorDetails /></ProtectedRoute>} />
                    <Route path="/vendors/:id/edit" element={<ProtectedRoute requiredPermission="manage_materials"><AddVendor isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/vendors/add-vendor" element={<Navigate to="/vendors/new" replace />} />
                    <Route path="/analytics" element={<ProtectedRoute requiredPermission="view_reports"><Reports /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/tasks" element={<Navigate to="/my-tasks" replace />} />
                    <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/my-attendance" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
                    <Route path="/my-salary" element={<ProtectedRoute><MySalaryPage /></ProtectedRoute>} />
                    <Route path="/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
                    <Route path="/leave-management/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
                    <Route path="/stock-requests" element={<ProtectedRoute><StockRequests /></ProtectedRoute>} />

                    <Route path="/complete-customer-profile" element={<ProtectedRoute requiredPermission="view_customer_portal"><CompleteCustomerProfile /></ProtectedRoute>} />
                    <Route path="/complete-vendor-profile" element={<ProtectedRoute requiredPermission="view_vendor_portal"><CompleteVendorProfile /></ProtectedRoute>} />
                    <Route path="/customer/new-order" element={<ProtectedRoute requiredPermission="view_customer_portal"><CustomerNewOrder /></ProtectedRoute>} />
`;

content = content.replace(targetStr, targetStr + missingRoutes);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored App.jsx');
