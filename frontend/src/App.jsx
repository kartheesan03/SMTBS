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
import AuditLogs from './pages/AuditLogs';

import GlobalHeader from './components/GlobalHeader';

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Materials = React.lazy(() => import('./pages/Materials'));
const MyMaterials = React.lazy(() => import('./pages/MyMaterials'));
const AddMaterial = React.lazy(() => import('./pages/AddMaterial'));
const MaterialDetails = React.lazy(() => import('./pages/MaterialDetails'));

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
const MasterAttendance = React.lazy(() => import('./pages/MasterAttendance'));
const HRReports = React.lazy(() => import('./pages/HRReports'));
const TrainingDevelopment = React.lazy(() => import('./pages/TrainingDevelopment'));
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
const MyLeaveHistory = React.lazy(() => import('./pages/MyLeaveHistory'));
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
const BarcodeManagement = React.lazy(() => import('./pages/BarcodeManagement'));
const GPSTracking = React.lazy(() => import('./pages/GPSTracking'));
const OrderKanban = React.lazy(() => import('./pages/OrderKanban'));
const AccessDenied = React.lazy(() => import('./pages/AccessDenied'));
const CustomerDetails = React.lazy(() => import('./pages/CustomerDetails'));
const CustomerProfileSettings = React.lazy(() => import('./pages/CustomerProfileSettings'));
const EmployeeDetails = React.lazy(() => import('./pages/EmployeeDetails'));
const Invoices = React.lazy(() => import('./pages/Invoices'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const VendorDetails = React.lazy(() => import('./pages/VendorDetails'));
const FinancialOperations = React.lazy(() => import('./pages/FinancialOperations'));
const OrderManagement = React.lazy(() => import('./pages/OrderManagement'));
const Leads = React.lazy(() => import('./pages/Leads'));
const SalesPipeline = React.lazy(() => import('./pages/SalesPipeline'));
import ErrorBoundary from './components/ErrorBoundary';

const CompleteCustomerProfile = React.lazy(() => import('./pages/CompleteCustomerProfile'));
const CompleteVendorProfile = React.lazy(() => import('./pages/CompleteVendorProfile'));
const ComingSoonPage = React.lazy(() => import('./pages/ComingSoonPage'));
const TaskCalendar = React.lazy(() => import('./pages/TaskCalendar'));
const Projects = React.lazy(() => import('./pages/Projects'));
const CustomerDashboard = React.lazy(() => import('./pages/CustomerDashboard'));
const VendorDashboard = React.lazy(() => import('./pages/VendorDashboard'));
const RevenueDashboard = React.lazy(() => import('./pages/RevenueDashboard'));
const CustomerNewOrder = React.lazy(() => import('./pages/CustomerNewOrder'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const Quotations = React.lazy(() => import('./pages/Quotations'));
const CreateQuotation = React.lazy(() => import('./pages/CreateQuotation'));
const QuotationDetails = React.lazy(() => import('./pages/QuotationDetails'));
const EmployeeScanner = React.lazy(() => import('./pages/EmployeeScanner'));
const SalesGoals = React.lazy(() => import('./pages/SalesGoals'));
const HolidayCalendar = React.lazy(() => import('./pages/HolidayCalendar'));
const Recruitment = React.lazy(() => import('./pages/Recruitment'));
const LeaveBalance = React.lazy(() => import('./pages/LeaveBalance'));

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
        
        const theme = localStorage.getItem('theme');
        if (theme === 'Dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
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
                        <GlobalHeader 
                            onOpenModuleLauncher={() => setIsModuleLauncherOpen(true)}
                            onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
                        />
                    </>
                )}
                <React.Suspense fallback={<div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>}>
                <div className="app-content">

                <Routes>
                    <Route path="/settings/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
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
                        <ProtectedRoute requiredPermission="hrms:employeeData:view">
                            <HRMS />
                        </ProtectedRoute>
                    } />
                    <Route path="/hrms/add-employee" element={
                        <ProtectedRoute requiredPermission="hrms:employeeData:view">
                            <AddEmployee />
                        </ProtectedRoute>
                    } />
                    <Route path="/employees/:id/edit" element={<ProtectedRoute requiredPermission="hrms:employeeData:view"><AddEmployee isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/employees/:id" element={<ProtectedRoute requiredPermission="hrms:employeeData:view"><EmployeeDetails /></ProtectedRoute>} />
                    <Route path="/employees/new" element={<ProtectedRoute requiredPermission="hrms:employeeData:view"><AddEmployee /></ProtectedRoute>} />
                    
                    <Route path="/materials/new" element={<ProtectedRoute requiredPermission="view_hrms"><AddMaterial /></ProtectedRoute>} />
                    <Route path="/materials/barcode" element={<ProtectedRoute><BarcodeManagement /></ProtectedRoute>} />
                    <Route path="/gps-tracking" element={<ProtectedRoute><GPSTracking /></ProtectedRoute>} />
                    <Route path="/materials/gps" element={<Navigate to="/gps-tracking" replace />} />
                    <Route path="/my-materials/gps" element={<ProtectedRoute requiredPermission="view_materials_self"><ComingSoonPage title="GPS Tracking" subtitle="GPS location tracking is available for admin users." /></ProtectedRoute>} />

                    <Route path="/materials/:id/edit" element={<ProtectedRoute requiredPermission="manage_materials"><AddMaterial isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/materials/:id" element={<ProtectedRoute requiredPermission="view_materials"><MaterialDetails /></ProtectedRoute>} />
                    <Route path="/materials" element={<ProtectedRoute requiredPermission="view_materials"><Materials /></ProtectedRoute>} />
                    <Route path="/my-materials" element={<Navigate to="/my-materials/inventory" replace />} />
                    <Route path="/my-materials/inventory" element={<ProtectedRoute requiredPermission="view_materials_self"><MyMaterials /></ProtectedRoute>} />
                    <Route path="/my-materials/requests" element={<ProtectedRoute requiredPermission="view_materials_self"><MyMaterials /></ProtectedRoute>} />
                    <Route path="/my-materials/stock" element={<ProtectedRoute requiredPermission="view_materials_self"><MyMaterials /></ProtectedRoute>} />
                    <Route path="/my-materials/barcode" element={<ProtectedRoute requiredPermission="view_materials_self"><EmployeeScanner /></ProtectedRoute>} />
                    <Route path="/payroll" element={<ProtectedRoute requiredPermission="hrms:payroll:view"><Payroll /></ProtectedRoute>} />
                    <Route path="/payroll/generate" element={<ProtectedRoute requiredPermission="hrms:payroll:generate"><GeneratePayroll /></ProtectedRoute>} />
                    <Route path="/payroll/payment/:id" element={<ProtectedRoute requiredPermission="hrms:payroll:view"><PayrollPayment /></ProtectedRoute>} />
                    <Route path="/payslips" element={<ProtectedRoute requiredPermission="hrms:payroll:view"><Payslips /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/attendance/master" element={<ProtectedRoute requiredPermission="hrms:attendance:view"><MasterAttendance /></ProtectedRoute>} />
                    <Route path="/hr-reports" element={<ProtectedRoute requiredPermission="view_hrms"><HRReports /></ProtectedRoute>} />
                    <Route path="/team-performance" element={<ProtectedRoute requiredPermission="hrms:performance:view"><TeamPerformance /></ProtectedRoute>} />
                    <Route path="/erp" element={<ProtectedRoute requiredPermission="view_erp"><ERP /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute requiredPermission="view_erp"><OrderManagement /></ProtectedRoute>} />
                    <Route path="/orders/purchase" element={<ProtectedRoute requiredPermission="view_erp"><OrderManagement /></ProtectedRoute>} />
                    <Route path="/orders/select-type" element={<OrderCreationRoute><SelectOrderType /></OrderCreationRoute>} />
                    <Route path="/erp/customers/select" element={<OrderCreationRoute><SelectCustomer /></OrderCreationRoute>} />
                    <Route path="/erp/vendors/select" element={<OrderCreationRoute><SelectVendor /></OrderCreationRoute>} />
                    <Route path="/orders/create/:orderType" element={<OrderCreationRoute><CreateOrder /></OrderCreationRoute>} />
                    <Route path="/orders/:orderId/tracking" element={<ProtectedRoute requiredPermission="view_erp"><OrderTracking /></ProtectedRoute>} />
                    <Route path="/customer/orders/:orderId/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                    <Route path="/vendor/orders/:orderId/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                    <Route path="/order-kanban" element={<ProtectedRoute><OrderKanban /></ProtectedRoute>} />
                    <Route path="/tracking-overview" element={<ProtectedRoute><TrackingDashboard /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute requiredPermission="view_crm"><Customers /></ProtectedRoute>} />
                    <Route path="/crm/add-customer" element={<ProtectedRoute requiredPermission="view_crm"><AddCustomer /></ProtectedRoute>} />
                    
                    {/* Sales Dashboard Quick Action Routes */}
                    <Route path="/crm/leads" element={<ProtectedRoute requiredPermission="view_crm"><Leads /></ProtectedRoute>} />
                    <Route path="/crm/pipeline" element={<ProtectedRoute requiredPermission="view_crm"><SalesPipeline /></ProtectedRoute>} />
                    <Route path="/crm/customers" element={<ProtectedRoute requiredPermission="view_crm"><Customers directoryOnly={true} /></ProtectedRoute>} />
                    <Route path="/customers" element={<Navigate to="/crm/customers" replace />} />
                    <Route path="/sales/revenue" element={<ProtectedRoute requiredPermission="view_crm"><RevenueDashboard /></ProtectedRoute>} />
                    <Route path="/sales/goals" element={<ProtectedRoute requiredPermission="view_crm"><SalesGoals /></ProtectedRoute>} />
                    <Route path="/quotations" element={<ProtectedRoute requiredPermission="view_crm"><Quotations /></ProtectedRoute>} />
                    <Route path="/quotations/create" element={<ProtectedRoute requiredPermission="view_crm"><CreateQuotation /></ProtectedRoute>} />
                    <Route path="/quotations/:id" element={<ProtectedRoute requiredPermission="view_crm"><QuotationDetails /></ProtectedRoute>} />
                    
                    <Route path="/vendors" element={<ProtectedRoute requiredPermission="view_erp"><Vendors /></ProtectedRoute>} />
                    <Route path="/vendors/add-vendor" element={<ProtectedRoute requiredPermission="view_erp"><AddVendor /></ProtectedRoute>} />
                    <Route path="/vendors/:id/edit" element={<ProtectedRoute requiredPermission="view_erp"><AddVendor isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/vendors/:id" element={<ProtectedRoute requiredPermission="view_erp"><VendorDetails /></ProtectedRoute>} />
                    <Route path="/customers/new" element={<ProtectedRoute requiredPermission="view_crm"><AddCustomer /></ProtectedRoute>} />
                    <Route path="/customers/:id/edit" element={<ProtectedRoute requiredPermission="view_crm"><AddCustomer isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/customers/:id" element={<ProtectedRoute requiredPermission="view_crm"><CustomerDetails /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/invoices" element={<ProtectedRoute requiredPermission="view_erp"><Invoices /></ProtectedRoute>} />
                    <Route path="/customer/profile-settings" element={<ProtectedRoute requiredPermission="view_crm"><CustomerProfileSettings /></ProtectedRoute>} />
                    <Route path="/access-denied" element={<AccessDenied />} />
                    <Route path="/analytics" element={<ProtectedRoute requiredPermission="view_reports"><Reports /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/finance" element={<ProtectedRoute requiredPermission="view_reports"><FinancialOperations /></ProtectedRoute>} />


                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute requiredPermission="view_settings"><UserManagement /></ProtectedRoute>} />
                    <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/my-attendance" element={<Navigate to="/attendance" replace />} />
                    <Route path="/leave-management" element={<ProtectedRoute requiredPermission="hrms:leave:view"><LeaveManagement /></ProtectedRoute>} />
                    <Route path="/leave-management/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
                    <Route path="/my-salary" element={<ProtectedRoute requiredPermission="hrms:mySalary:view"><MySalaryPage /></ProtectedRoute>} />
                    <Route path="/stock-requests" element={<ProtectedRoute><StockRequests /></ProtectedRoute>} />

                    {/* HR Module — Coming Soon Pages */}
                    <Route path="/coming-soon/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
                    <Route path="/coming-soon/training" element={<ProtectedRoute><TrainingDevelopment /></ProtectedRoute>} />
                    <Route path="/coming-soon/holiday-calendar" element={<ProtectedRoute><HolidayCalendar /></ProtectedRoute>} />

                    <Route path="/complete-customer-profile" element={<ProtectedRoute requiredPermission="view_crm"><CompleteCustomerProfile /></ProtectedRoute>} />
                    <Route path="/complete-vendor-profile" element={<ProtectedRoute requiredPermission="view_erp"><CompleteVendorProfile /></ProtectedRoute>} />
                    <Route path="/customer/new-order" element={<ProtectedRoute requiredPermission="view_crm"><CustomerNewOrder /></ProtectedRoute>} />

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
                    <Route path="/leave-management/history" element={<ProtectedRoute><MyLeaveHistory /></ProtectedRoute>} />
                    <Route path="/leave-management/balance" element={<ProtectedRoute><LeaveBalance /></ProtectedRoute>} />
                    
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
                    <Route path="/erp/finance" element={<ProtectedRoute><FinancialOperations /></ProtectedRoute>} />
                    <Route path="/erp/assets" element={<ProtectedRoute><ComingSoonPage title="Assets" /></ProtectedRoute>} />
                    
                    <Route path="/tasks/assigned" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/tasks/completed" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/tasks/pending" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/tasks/calendar" element={<ProtectedRoute><TaskCalendar /></ProtectedRoute>} />
                    <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                    
                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/support/history" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/support/kb" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    
                    <Route path="/notifications/system" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/notifications/approvals" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/notifications/stock" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    
                    <Route path="/profile/security" element={<ProtectedRoute><ComingSoonPage title="Change Password" /></ProtectedRoute>} />
                    <Route path="/profile/security-settings" element={<ProtectedRoute><ComingSoonPage title="Security Settings" /></ProtectedRoute>} />
                    
                    <Route path="/settings/roles" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/settings/system" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/settings/audit-logs" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/settings/integrations" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/settings/notifications" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
