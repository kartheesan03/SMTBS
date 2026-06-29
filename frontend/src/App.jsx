import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import FarmakuSidebar from './components/FarmakuSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import OrderCreationRoute from './components/OrderCreationRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import ModuleLauncher from './components/ModuleLauncher';
import CommandCenter from './components/CommandCenter';
import GlobalBackButton from './components/GlobalBackButton';

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Materials = React.lazy(() => import('./pages/Materials'));

const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const TrackingDashboard = React.lazy(() => import('./pages/TrackingDashboard'));
const HRMS = React.lazy(() => import('./pages/HRMS'));
const AddEmployee = React.lazy(() => import('./pages/AddEmployee'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const EmployeeDashboard = React.lazy(() => import('./pages/EmployeeDashboard'));
const HRDashboard = React.lazy(() => import('./pages/HRDashboard'));
const ManagerDashboard = React.lazy(() => import('./pages/ManagerDashboard'));
const SalesDashboard = React.lazy(() => import('./pages/SalesDashboard'));
const TeamPerformance = React.lazy(() => import('./pages/TeamPerformance'));
const Payroll = React.lazy(() => import('./pages/Payroll'));
const Attendance = React.lazy(() => import('./pages/Attendance'));
const HRReports = React.lazy(() => import('./pages/HRReports'));
const Settings = React.lazy(() => import('./pages/Settings'));
const BackupRestore = React.lazy(() => import('./pages/BackupRestore'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Reports = React.lazy(() => import('./pages/Reports'));
const ERP = React.lazy(() => import('./pages/ERP'));
const Vendors = React.lazy(() => import('./pages/Vendors'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications'));
const MyTasks = React.lazy(() => import('./pages/MyTasks'));
const MyAttendance = React.lazy(() => import('./pages/MyAttendance'));
const GeneratePayroll = React.lazy(() => import('./pages/GeneratePayroll'));
const PayrollPayment = React.lazy(() => import('./pages/PayrollPayment'));
const Payslips = React.lazy(() => import('./pages/Payslips'));
const LeaveManagement = React.lazy(() => import('./pages/LeaveManagement'));
const ApplyLeave = React.lazy(() => import('./pages/ApplyLeave'));
const MySalaryPage = React.lazy(() => import('./pages/MySalary'));
const Customers = React.lazy(() => import('./pages/Customers'));
const AddCustomer = React.lazy(() => import('./pages/AddCustomer'));
const AddVendor = React.lazy(() => import('./pages/AddVendor'));
const Support = React.lazy(() => import('./pages/Support'));
const StockRequests = React.lazy(() => import('./pages/StockRequests'));
const CreateOrder = React.lazy(() => import('./pages/CreateOrder'));
const SelectOrderType = React.lazy(() => import('./pages/SelectOrderType'));
const SelectCustomer = React.lazy(() => import('./pages/SelectCustomer'));
const SelectVendor = React.lazy(() => import('./pages/SelectVendor'));
import ErrorBoundary from './components/ErrorBoundary';

const CompleteCustomerProfile = React.lazy(() => import('./pages/CompleteCustomerProfile'));
const CompleteVendorProfile = React.lazy(() => import('./pages/CompleteVendorProfile'));
const ComingSoonPage = React.lazy(() => import('./pages/ComingSoonPage'));
const CustomerDashboard = React.lazy(() => import('./pages/CustomerDashboard'));
const VendorDashboard = React.lazy(() => import('./pages/VendorDashboard'));
const RevenueDashboard = React.lazy(() => import('./pages/RevenueDashboard'));
const CustomerNewOrder = React.lazy(() => import('./pages/CustomerNewOrder'));

const AppContent = () => {
    const { user, loading, logout } = useContext(AuthContext);
    
    // New Navigation States
    const [isModuleLauncherOpen, setIsModuleLauncherOpen] = useState(false);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);

    useEffect(() => {
        if (user) {
            document.body.classList.add('logged-in');
        } else {
            document.body.classList.remove('logged-in');
        }
        return () => {
            document.body.classList.remove('logged-in');
        };
    }, [user]);

    // Global keyboard shortcut for Command Center
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandCenterOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const handleOpenModuleLauncher = () => setIsModuleLauncherOpen(true);
        window.addEventListener('openModuleLauncher', handleOpenModuleLauncher);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('openModuleLauncher', handleOpenModuleLauncher);
        };
    }, []);

    if (loading) return <div className="app-loading">Loading...</div>;

    return (
        <div className="app-layout">
            {user && <FarmakuSidebar />}
            <main className="app-main">
                {user && (
                    <>
                        <ModuleLauncher 
                            isOpen={isModuleLauncherOpen} 
                            onClose={() => setIsModuleLauncherOpen(false)} 
                        />
                        <CommandCenter 
                            isOpen={isCommandCenterOpen} 
                            onClose={() => setIsCommandCenterOpen(false)} 
                        />
                    </>
                )}
                <React.Suspense fallback={<div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>}>
                <div className="app-content">
                {user && <GlobalBackButton />}
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    
                    {/* Protected Root Route - Dispatches to correct dashboard */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            {(() => {
                                const r = user?.role ? user.role.toLowerCase() : '';
                                const isSuperAdmin = user?.email === 'admin@smtbms.com' || r === 'super admin';
                                if (isSuperAdmin || r === 'admin') return <AdminDashboard />;
                                if (r === 'hr') return <HRDashboard />;
                                if (r === 'manager') return <ManagerDashboard />;
                                if (r === 'sales') return <SalesDashboard />;
                                if (r === 'employee') return <EmployeeDashboard />;
                                if (r === 'customer') return <CustomerDashboard />;
                                if (r === 'vendor') return <VendorDashboard />;
                                return <Dashboard />;
                            })()}
                        </ProtectedRoute>
                    } />
                    
                    {/* HRMS Routes */}
                    <Route path="/hrms" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'HR', 'Manager']}>
                            <HRMS />
                        </ProtectedRoute>
                    } />
                    <Route path="/hrms/add-employee" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'HR', 'Manager']}>
                            <AddEmployee />
                        </ProtectedRoute>
                    } />
                    
                    {/* Role Specific Protected Routes */}
                    <Route path="/materials" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'Employee']}><Materials /></ProtectedRoute>} />
                    <Route path="/payroll" element={<ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}><Payroll /></ProtectedRoute>} />
                    <Route path="/payroll/generate" element={<ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}><GeneratePayroll /></ProtectedRoute>} />
                    <Route path="/payroll/payment/:id" element={<ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}><PayrollPayment /></ProtectedRoute>} />
                    <Route path="/payslips" element={<ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}><Payslips /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}><Attendance /></ProtectedRoute>} />
                    <Route path="/hr-reports" element={<ProtectedRoute allowedRoles={['Admin', 'HR']}><HRReports /></ProtectedRoute>} />
                    <Route path="/team-performance" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><TeamPerformance /></ProtectedRoute>} />
                    <Route path="/erp" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'HR', 'Employee']}><ERP /></ProtectedRoute>} />
                    <Route path="/orders" element={<Navigate to="/erp" replace />} />
                    <Route path="/orders/select-type" element={<OrderCreationRoute><SelectOrderType /></OrderCreationRoute>} />
                    <Route path="/erp/customers/select" element={<OrderCreationRoute><SelectCustomer /></OrderCreationRoute>} />
                    <Route path="/erp/vendors/select" element={<OrderCreationRoute><SelectVendor /></OrderCreationRoute>} />
                    <Route path="/orders/create/:orderType" element={<OrderCreationRoute><CreateOrder /></OrderCreationRoute>} />
                    <Route path="/orders/:orderId/tracking" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'HR', 'Employee', 'Customer']}><OrderTracking /></ProtectedRoute>} />
                    <Route path="/tracking-overview" element={<ProtectedRoute><TrackingDashboard /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><Customers /></ProtectedRoute>} />
                    <Route path="/crm/add-customer" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><AddCustomer /></ProtectedRoute>} />
                    
                    {/* Sales Dashboard Quick Action Routes */}
                    <Route path="/crm/leads" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><ComingSoonPage title="Lead Management" subtitle="The Lead Management module is currently under development." /></ProtectedRoute>} />
                    <Route path="/crm/pipeline" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><ComingSoonPage title="Pipeline Overview" subtitle="The visual sales pipeline is being assembled." /></ProtectedRoute>} />
                    <Route path="/crm/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><Customers directoryOnly={true} /></ProtectedRoute>} />
                    <Route path="/customers" element={<Navigate to="/crm/customers" replace />} />
                    <Route path="/sales/revenue" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><RevenueDashboard /></ProtectedRoute>} />
                    <Route path="/sales/goals" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><ComingSoonPage title="Sales Goals" subtitle="Sales targeting and team goals will be available shortly." /></ProtectedRoute>} />
                    <Route path="/quotations" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><ComingSoonPage title="Quotations" subtitle="Quotation and proposal generation will be enabled soon." /></ProtectedRoute>} />
                    
                    <Route path="/vendors" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}><Vendors /></ProtectedRoute>} />
                    <Route path="/vendors/add-vendor" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}><AddVendor /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'HR']}><Reports /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />


                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/my-attendance" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
                    <Route path="/my-salary" element={<ProtectedRoute><MySalaryPage /></ProtectedRoute>} />
                    <Route path="/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
                    <Route path="/leave-management/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
                    <Route path="/stock-requests" element={<ProtectedRoute><StockRequests /></ProtectedRoute>} />

                    <Route path="/complete-customer-profile" element={<ProtectedRoute allowedRoles={['Customer']}><CompleteCustomerProfile /></ProtectedRoute>} />
                    <Route path="/complete-vendor-profile" element={<ProtectedRoute allowedRoles={['Vendor']}><CompleteVendorProfile /></ProtectedRoute>} />
                    <Route path="/customer/new-order" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerNewOrder /></ProtectedRoute>} />

                    {/* New Routing for DualSidebar Structure */}
                    <Route path="/attendance/my" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
                    <Route path="/attendance/daily" element={<ProtectedRoute><ComingSoonPage title="Daily Attendance" subtitle="Track daily presence" /></ProtectedRoute>} />
                    <Route path="/attendance/monthly" element={<ProtectedRoute><ComingSoonPage title="Monthly Attendance" subtitle="Aggregated monthly records" /></ProtectedRoute>} />
                    <Route path="/attendance/history" element={<ProtectedRoute><ComingSoonPage title="Check-In History" subtitle="Detailed check-in logs" /></ProtectedRoute>} />
                    <Route path="/attendance/late" element={<ProtectedRoute><ComingSoonPage title="Late Attendance" subtitle="Monitor late arrivals" /></ProtectedRoute>} />
                    
                    <Route path="/settings/departments" element={<ProtectedRoute><ComingSoonPage title="Departments" subtitle="Manage organizational units" /></ProtectedRoute>} />
                    <Route path="/settings/designations" element={<ProtectedRoute><ComingSoonPage title="Designations" subtitle="Manage job titles" /></ProtectedRoute>} />
                    
                    <Route path="/leave-management/pending" element={<ProtectedRoute><LeaveManagement filter="Pending" /></ProtectedRoute>} />
                    <Route path="/leave-management/approve" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
                    <Route path="/leave-management/history" element={<ProtectedRoute><ComingSoonPage title="Leave History" subtitle="Past leave records" /></ProtectedRoute>} />
                    <Route path="/leave-management/balance" element={<ProtectedRoute><ComingSoonPage title="Leave Balance" subtitle="Employee accruals and balances" /></ProtectedRoute>} />
                    
                    <Route path="/reports/attendance" element={<ProtectedRoute><HRReports /></ProtectedRoute>} />
                    <Route path="/reports/payroll" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/reports/leave" element={<ProtectedRoute><ComingSoonPage title="Leave Reports" /></ProtectedRoute>} />
                    <Route path="/reports/materials" element={<ProtectedRoute><ComingSoonPage title="Material Reports" /></ProtectedRoute>} />
                    <Route path="/reports/vendors" element={<ProtectedRoute><ComingSoonPage title="Vendor Reports" /></ProtectedRoute>} />
                    <Route path="/reports/inventory" element={<ProtectedRoute><ComingSoonPage title="Inventory Reports" /></ProtectedRoute>} />
                    <Route path="/reports/employees" element={<ProtectedRoute><HRReports /></ProtectedRoute>} />
                    
                    <Route path="/materials/categories" element={<ProtectedRoute><ComingSoonPage title="Categories" /></ProtectedRoute>} />
                    <Route path="/materials/units" element={<ProtectedRoute><ComingSoonPage title="Units" /></ProtectedRoute>} />
                    <Route path="/materials/warehouse" element={<ProtectedRoute><ComingSoonPage title="Warehouse" /></ProtectedRoute>} />
                    <Route path="/materials/movement" element={<ProtectedRoute><ComingSoonPage title="Inward / Outward" /></ProtectedRoute>} />
                    
                    <Route path="/vendors/history" element={<ProtectedRoute><ComingSoonPage title="Purchase History" /></ProtectedRoute>} />
                    
                    <Route path="/crm/opportunities" element={<ProtectedRoute><ComingSoonPage title="Opportunities" /></ProtectedRoute>} />
                    <Route path="/crm/follow-ups" element={<ProtectedRoute><ComingSoonPage title="Follow-ups" /></ProtectedRoute>} />
                    <Route path="/crm/history" element={<ProtectedRoute><ComingSoonPage title="Customer History" /></ProtectedRoute>} />
                    
                    <Route path="/erp/purchase" element={<ProtectedRoute><ERP /></ProtectedRoute>} />
                    <Route path="/erp/sales" element={<ProtectedRoute><ERP /></ProtectedRoute>} />
                    <Route path="/erp/inventory" element={<ProtectedRoute><ComingSoonPage title="Inventory" /></ProtectedRoute>} />
                    <Route path="/erp/finance" element={<ProtectedRoute><ComingSoonPage title="Finance" /></ProtectedRoute>} />
                    <Route path="/erp/assets" element={<ProtectedRoute><ComingSoonPage title="Assets" /></ProtectedRoute>} />
                    
                    <Route path="/tasks/assigned" element={<ProtectedRoute><ComingSoonPage title="Assigned Tasks" /></ProtectedRoute>} />
                    <Route path="/tasks/completed" element={<ProtectedRoute><ComingSoonPage title="Completed Tasks" /></ProtectedRoute>} />
                    <Route path="/tasks/pending" element={<ProtectedRoute><ComingSoonPage title="Pending Tasks" /></ProtectedRoute>} />
                    <Route path="/tasks/calendar" element={<ProtectedRoute><ComingSoonPage title="Task Calendar" /></ProtectedRoute>} />
                    
                    <Route path="/support/history" element={<ProtectedRoute><ComingSoonPage title="Ticket History" /></ProtectedRoute>} />
                    <Route path="/support/kb" element={<ProtectedRoute><ComingSoonPage title="Knowledge Base" /></ProtectedRoute>} />
                    
                    <Route path="/notifications/system" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/notifications/approvals" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/notifications/stock" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    
                    <Route path="/profile/security" element={<ProtectedRoute><ComingSoonPage title="Change Password" /></ProtectedRoute>} />
                    <Route path="/profile/security-settings" element={<ProtectedRoute><ComingSoonPage title="Security Settings" /></ProtectedRoute>} />
                    
                    <Route path="/settings/roles" element={<ProtectedRoute><ComingSoonPage title="Roles & Permissions" /></ProtectedRoute>} />
                    <Route path="/settings/system" element={<ProtectedRoute><ComingSoonPage title="System Configuration" /></ProtectedRoute>} />
                    <Route path="/settings/backup" element={<ProtectedRoute><BackupRestore /></ProtectedRoute>} />
                    <Route path="/settings/attendance" element={<ProtectedRoute><ComingSoonPage title="Attendance Settings" /></ProtectedRoute>} />
                    <Route path="/settings/leave" element={<ProtectedRoute><ComingSoonPage title="Leave Policies" /></ProtectedRoute>} />
                    <Route path="/settings/payroll" element={<ProtectedRoute><ComingSoonPage title="Payroll Settings" /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                </div>
                </React.Suspense>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <AuthProvider>
                    <NotificationProvider>
                        <Router>
                            <Toaster position="top-right" />
                            <AppContent />
                        </Router>
                    </NotificationProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
};

export default App;
