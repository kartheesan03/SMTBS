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
import AuditLogs from './pages/AuditLogs';
import Warehouses from './pages/Warehouses';
import MaterialReports from './pages/MaterialReports';

import GlobalHeader from './components/GlobalHeader';
import { AriaProvider, AriaContext } from './context/AriaContext';

// Retry wrapper for lazy imports — handles stale chunks after Vercel redeploys
const lazyRetry = (importFn) => {
  // Use the import function string as a stable key so each chunk tracks its own retry
  const key = 'chunk_reload_' + btoa(importFn.toString().slice(0, 80)).replace(/[^a-z0-9]/gi, '');
  return React.lazy(() =>
    importFn().catch((err) => {
      const isChunkError =
        (err?.message || '').includes('Failed to fetch dynamically imported module') ||
        (err?.message || '').includes('Loading chunk') ||
        err?.name === 'ChunkLoadError';

      if (isChunkError) {
        const alreadyRetried = sessionStorage.getItem(key);
        if (!alreadyRetried) {
          sessionStorage.setItem(key, 'true');
          window.location.reload();
          // Never resolve — keep React in Suspense until the page reloads
          return new Promise(() => {});
        }
        // Second failure: clear flag and fall through to throw
        sessionStorage.removeItem(key);
      }
      // Non-chunk error or second attempt failed — surface it
      throw err;
    })
  );
};

// Pages
const Dashboard = lazyRetry(() => import('./pages/Dashboard'));
const Login = lazyRetry(() => import('./pages/Login'));
const Register = lazyRetry(() => import('./pages/Register'));
const PublicPlaceholder = lazyRetry(() => import('./pages/PublicPlaceholder'));
const Materials = lazyRetry(() => import('./pages/Materials'));
const MyMaterials = lazyRetry(() => import('./pages/MyMaterials'));
const AddMaterial = lazyRetry(() => import('./pages/AddMaterial'));
const MaterialDetails = lazyRetry(() => import('./pages/MaterialDetails'));

const OrderTracking = lazyRetry(() => import('./pages/OrderTracking'));
const TrackingDashboard = lazyRetry(() => import('./pages/TrackingDashboard'));
const HRMS = lazyRetry(() => import('./pages/HRMS'));
const AddEmployee = lazyRetry(() => import('./pages/AddEmployee'));
const AdminDashboard = lazyRetry(() => import('./pages/AdminDashboard'));
const EmployeeDashboard = lazyRetry(() => import('./pages/EmployeeDashboard'));
const HRDashboard = lazyRetry(() => import('./pages/HRDashboard'));
const ManagerDashboard = lazyRetry(() => import('./pages/ManagerDashboard'));
const SalesDashboard = lazyRetry(() => import('./pages/SalesDashboard'));
const TeamPerformance = lazyRetry(() => import('./pages/TeamPerformance'));
const Payroll = lazyRetry(() => import('./pages/Payroll'));
const Attendance = lazyRetry(() => import('./pages/Attendance'));
const MasterAttendance = lazyRetry(() => import('./pages/MasterAttendance'));
const HRReports = lazyRetry(() => import('./pages/HRReports'));
const TrainingDevelopment = lazyRetry(() => import('./pages/TrainingDevelopment'));
const Settings = lazyRetry(() => import('./pages/Settings'));
const AttendanceSettings = lazyRetry(() => import('./pages/AttendanceSettings'));
const LeaveSettings = lazyRetry(() => import('./pages/LeaveSettings'));
const PayrollSettings = lazyRetry(() => import('./pages/PayrollSettings'));
const BackupRestore = lazyRetry(() => import('./pages/BackupRestore'));
const Profile = lazyRetry(() => import('./pages/Profile'));
const Reports = lazyRetry(() => import('./pages/Reports'));
const ERP = lazyRetry(() => import('./pages/ERP'));
const Vendors = lazyRetry(() => import('./pages/Vendors'));
const NotificationsPage = lazyRetry(() => import('./pages/Notifications'));
const MyTasks = lazyRetry(() => import('./pages/MyTasks'));
const MyAttendance = lazyRetry(() => import('./pages/MyAttendance'));
const GeneratePayroll = lazyRetry(() => import('./pages/GeneratePayroll'));
const PayrollPayment = lazyRetry(() => import('./pages/PayrollPayment'));
const Payslips = lazyRetry(() => import('./pages/Payslips'));
const LeaveManagement = lazyRetry(() => import('./pages/LeaveManagement'));
const MyLeaveHistory = lazyRetry(() => import('./pages/MyLeaveHistory'));
const ApplyLeave = lazyRetry(() => import('./pages/ApplyLeave'));
const MySalaryPage = lazyRetry(() => import('./pages/MySalary'));
const Customers = lazyRetry(() => import('./pages/Customers'));
const AddCustomer = lazyRetry(() => import('./pages/AddCustomer'));
const AddVendor = lazyRetry(() => import('./pages/AddVendor'));
const Support = lazyRetry(() => import('./pages/Support'));

const AdminTickets = lazyRetry(() => import('./pages/AdminTickets'));
const SaaSAdminDashboard = lazyRetry(() => import('./components/SaaSAdminDashboard'));
const StockRequests = lazyRetry(() => import('./pages/StockRequests'));
const CreateOrder = lazyRetry(() => import('./pages/CreateOrder'));
const SelectOrderType = lazyRetry(() => import('./pages/SelectOrderType'));
const SelectCustomer = lazyRetry(() => import('./pages/SelectCustomer'));
const SelectVendor = lazyRetry(() => import('./pages/SelectVendor'));
const BarcodeManagement = lazyRetry(() => import('./pages/BarcodeManagement'));
const GPSTracking = lazyRetry(() => import('./pages/GPSTracking'));
const OrderKanban = lazyRetry(() => import('./pages/OrderKanban'));
const AccessDenied = lazyRetry(() => import('./pages/AccessDenied'));
const CustomerDetails = lazyRetry(() => import('./pages/CustomerDetails'));
const CustomerProfileSettings = lazyRetry(() => import('./pages/CustomerProfileSettings'));
const EmployeeDetails = lazyRetry(() => import('./pages/EmployeeDetails'));
const Invoices = lazyRetry(() => import('./pages/Invoices'));
const OrderDetails = lazyRetry(() => import('./pages/OrderDetails'));
const VendorDetails = lazyRetry(() => import('./pages/VendorDetails'));
const FinancialOperations = lazyRetry(() => import('./pages/FinancialOperations'));
const OrderManagement = lazyRetry(() => import('./pages/OrderManagement'));
const Leads = lazyRetry(() => import('./pages/Leads'));
const SalesPipeline = lazyRetry(() => import('./pages/SalesPipeline'));
const InvoicePage = lazyRetry(() => import('./pages/InvoicePage'));
import ErrorBoundary from './components/ErrorBoundary';

const CompleteCustomerProfile = lazyRetry(() => import('./pages/CompleteCustomerProfile'));
const CompleteVendorProfile = lazyRetry(() => import('./pages/CompleteVendorProfile'));
const ComingSoonPage = lazyRetry(() => import('./pages/ComingSoonPage'));
const OCR = lazyRetry(() => import('./pages/OCR'));
const TaskCalendar = lazyRetry(() => import('./pages/TaskCalendar'));
const Projects = lazyRetry(() => import('./pages/Projects'));
const CustomerDashboard = lazyRetry(() => import('./pages/CustomerDashboard'));
const VendorDashboard = lazyRetry(() => import('./pages/VendorDashboard'));
const RevenueDashboard = lazyRetry(() => import('./pages/RevenueDashboard'));
const CustomerNewOrder = lazyRetry(() => import('./pages/CustomerNewOrder'));
const UserManagement = lazyRetry(() => import('./pages/UserManagement'));
const Quotations = lazyRetry(() => import('./pages/Quotations'));
const CreateQuotation = lazyRetry(() => import('./pages/CreateQuotation'));
const QuotationDetails = lazyRetry(() => import('./pages/QuotationDetails'));
const EmployeeScanner = lazyRetry(() => import('./pages/EmployeeScanner'));
const SalesGoals = lazyRetry(() => import('./pages/SalesGoals'));
const HolidayCalendar = lazyRetry(() => import('./pages/HolidayCalendar'));
const Recruitment = lazyRetry(() => import('./pages/Recruitment'));
const LeaveBalance = lazyRetry(() => import('./pages/LeaveBalance'));
const LandingPage = lazyRetry(() => import('./pages/LandingPage'));
const AriaCommandCenter = lazyRetry(() => import('./pages/AriaCommandCenter'));

// Social Network Pages
const SocialLayout = lazyRetry(() => import('./pages/social/SocialLayout'));
const SocialHub = lazyRetry(() => import('./pages/social/SocialHub'));
const SocialProfile = lazyRetry(() => import('./pages/social/SocialProfile'));
const MyNetwork = lazyRetry(() => import('./pages/social/MyNetwork'));
const SocialMessages = lazyRetry(() => import('./pages/social/SocialMessages'));

const SupportWrapper = () => {
    const { user } = React.useContext(AuthContext);
    const role = (user?.role || '').toLowerCase();
    if (['admin', 'manager', 'hr'].includes(role)) {
        return <AdminTickets />;
    }
    return <Support />;
};


const AuthMicrosoftCallback = lazyRetry(() => import('./pages/AuthMicrosoftCallback'));
const AppContent = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const { isOpen: isAriaOpen, openAria, closeAria } = useContext(AriaContext);
    const location = useLocation();
    const isSocialRoute = location.pathname.startsWith('/social');
    
    // Navigation State
    const [isModuleLauncherOpen, setIsModuleLauncherOpen] = useState(false);

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
                if (isAriaOpen) {
                    closeAria();
                } else {
                    openAria();
                }
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
            {user && !isSocialRoute && <FarmakuSidebar />}
            <main className="app-main">
                {user && !isSocialRoute && (
                    <>
                        <ModuleLauncher 
                            isOpen={isModuleLauncherOpen} 
                            onClose={() => setIsModuleLauncherOpen(false)} 
                        />
                        <GlobalHeader 
                            onOpenModuleLauncher={() => setIsModuleLauncherOpen(true)}
                            onOpenCommandCenter={() => openAria()}
                        />
                    </>
                )}
                <React.Suspense fallback={<div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>}>
                <div className="app-content">

                <Routes>
                    <Route path="/settings/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
                    {/* Public Routes */}
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route path="/auth/microsoft/callback" element={<AuthMicrosoftCallback />} />
                    <Route path="/features" element={<PublicPlaceholder title="Features" />} />
                    <Route path="/pricing" element={<PublicPlaceholder title="Pricing" />} />
                    <Route path="/faq" element={<PublicPlaceholder title="FAQ" />} />
                    <Route path="/help" element={<PublicPlaceholder title="Help" />} />
                    
                    {/* Root Route - Landing Page if not logged in, Dashboard if logged in */}
                    <Route path="/" element={
                        !user ? (
                            <LandingPage />
                        ) : (
                            (() => {
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
                            })()
                        )
                    } />
                    
                    {/* HRMS Routes */}
                    <Route path="/hrms" element={
                        <ProtectedRoute requiredPermission="hrms:employeeData:view">
                            <HRMS />
                        </ProtectedRoute>
                    } />
                    <Route path="/hrms/add-employee" element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="hrms:employeeData:view">
                            <AddEmployee />
                        </ProtectedRoute>
                    } />
                    <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="hrms:employeeData:view"><AddEmployee isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/employees/:id" element={<ProtectedRoute requiredPermission="hrms:employeeData:view"><EmployeeDetails /></ProtectedRoute>} />
                    <Route path="/employees/new" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="hrms:employeeData:view"><AddEmployee /></ProtectedRoute>} />
                    
                    <Route path="/materials/new" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AddMaterial /></ProtectedRoute>} />
                    <Route path="/materials/barcode" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'sales']}><BarcodeManagement /></ProtectedRoute>} />
                    <Route path="/gps-tracking" element={<ProtectedRoute><GPSTracking /></ProtectedRoute>} />
                    <Route path="/materials/gps" element={<Navigate to="/gps-tracking" replace />} />
                    <Route path="/my-materials/gps" element={<ProtectedRoute requiredPermission="view_materials_self"><ComingSoonPage title="GPS Tracking" subtitle="GPS location tracking is available for admin users." /></ProtectedRoute>} />

                    <Route path="/materials/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AddMaterial isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                    <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
                    
                    <Route path="/tracking-overview" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}><TrackingDashboard /></ProtectedRoute>} />
                    
                    <Route path="/my-materials" element={<Navigate to="/my-materials/inventory" replace />} />
                    <Route path="/my-materials/requests" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}><MyMaterials /></ProtectedRoute>} />
                    <Route path="/my-materials/inventory" element={<ProtectedRoute allowedRoles={['employee']}><MyMaterials /></ProtectedRoute>} />
                    <Route path="/my-materials/stock" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><MyMaterials /></ProtectedRoute>} />
                    <Route path="/my-materials/barcode" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeScanner /></ProtectedRoute>} />
                    
                    {/* Placeholder routes for new Material Tracking RBAC items */}
                    <Route path="/warehouses" element={<ProtectedRoute requiredPermission="manage_materials"><Warehouses /></ProtectedRoute>} />
                    <Route path="/reports/materials" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><MaterialReports /></ProtectedRoute>} />
                    <Route path="/payroll" element={<ProtectedRoute requiredPermission="hrms:payroll:view"><Payroll /></ProtectedRoute>} />
                    <Route path="/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
                    <Route path="/my-salary" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
                    <Route path="/payroll/generate" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="hrms:payroll:generate"><GeneratePayroll /></ProtectedRoute>} />
                    <Route path="/payroll/payment/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="hrms:payroll:view"><PayrollPayment /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/attendance/master" element={<ProtectedRoute requiredPermission="hrms:attendance:view"><MasterAttendance /></ProtectedRoute>} />
                    <Route path="/hr-reports" element={<ProtectedRoute requiredPermission="view_hrms"><HRReports /></ProtectedRoute>} />
                    <Route path="/team-performance" element={<ProtectedRoute requiredPermission="hrms:performance:view"><TeamPerformance /></ProtectedRoute>} />
                    <Route path="/erp" element={<ProtectedRoute requiredPermission="view_erp"><ERP /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute requiredPermission="view_erp"><OrderManagement /></ProtectedRoute>} />
                    <Route path="/orders/purchase" element={<ProtectedRoute requiredPermission="view_erp"><OrderManagement /></ProtectedRoute>} />
                    <Route path="/orders/select-type" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'sales']}><OrderCreationRoute><SelectOrderType /></OrderCreationRoute></ProtectedRoute>} />
                    <Route path="/erp/customers/select" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'sales']}><OrderCreationRoute><SelectCustomer /></OrderCreationRoute></ProtectedRoute>} />
                    <Route path="/erp/vendors/select" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'sales']}><OrderCreationRoute><SelectVendor /></OrderCreationRoute></ProtectedRoute>} />
                    <Route path="/orders/create/:orderType" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'sales']}><OrderCreationRoute><CreateOrder /></OrderCreationRoute></ProtectedRoute>} />
                    <Route path="/orders/:orderId/tracking" element={<ProtectedRoute requiredPermission="view_erp"><OrderTracking /></ProtectedRoute>} />
                    <Route path="/customer/orders/:orderId/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                    <Route path="/vendor/orders/:orderId/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                    <Route path="/order-kanban" element={<ProtectedRoute><OrderKanban /></ProtectedRoute>} />
                    <Route path="/tracking-overview" element={<ProtectedRoute><TrackingDashboard /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute requiredPermission="view_crm"><Customers /></ProtectedRoute>} />
                    <Route path="/crm/add-customer" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'sales']} requiredPermission="view_crm"><AddCustomer /></ProtectedRoute>} />
                    
                    {/* Sales Dashboard Quick Action Routes */}
                    <Route path="/crm/leads" element={<ProtectedRoute requiredPermission="view_crm"><Leads /></ProtectedRoute>} />
                    <Route path="/crm/pipeline" element={<ProtectedRoute requiredPermission="view_crm"><SalesPipeline /></ProtectedRoute>} />
                    <Route path="/crm/customers" element={<ProtectedRoute requiredPermission="view_crm"><Customers directoryOnly={true} /></ProtectedRoute>} />
                    <Route path="/customers" element={<Navigate to="/crm/customers" replace />} />
                    <Route path="/sales/revenue" element={<ProtectedRoute requiredPermission="view_crm"><RevenueDashboard /></ProtectedRoute>} />
                    <Route path="/sales/goals" element={<ProtectedRoute requiredPermission="view_crm"><SalesGoals /></ProtectedRoute>} />
                    <Route path="/quotations" element={<ProtectedRoute requiredPermission="view_crm"><Quotations /></ProtectedRoute>} />
                    <Route path="/quotations/create" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'sales']} requiredPermission="view_crm"><CreateQuotation /></ProtectedRoute>} />
                    <Route path="/quotations/:id" element={<ProtectedRoute requiredPermission="view_crm"><QuotationDetails /></ProtectedRoute>} />
                    
                    <Route path="/vendors" element={<ProtectedRoute requiredPermission="view_erp"><Vendors /></ProtectedRoute>} />
                    <Route path="/vendors/add-vendor" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_erp"><AddVendor /></ProtectedRoute>} />
                    <Route path="/vendors/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_erp"><AddVendor isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/vendors/:id" element={<ProtectedRoute requiredPermission="view_erp"><VendorDetails /></ProtectedRoute>} />
                    <Route path="/customers/new" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_crm"><AddCustomer /></ProtectedRoute>} />
                    <Route path="/customers/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_crm"><AddCustomer isEditMode={true} /></ProtectedRoute>} />
                    <Route path="/customers/:id" element={<ProtectedRoute requiredPermission="view_crm"><CustomerDetails /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/invoice/:invoiceId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
                    <Route path="/invoices" element={<ProtectedRoute requiredPermission="view_erp"><Invoices /></ProtectedRoute>} />
                    <Route path="/customer/profile-settings" element={<ProtectedRoute requiredPermission="view_crm"><CustomerProfileSettings /></ProtectedRoute>} />
                    <Route path="/access-denied" element={<AccessDenied />} />
                    <Route path="/analytics" element={<ProtectedRoute requiredPermission="view_reports"><Reports /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/finance" element={<ProtectedRoute requiredPermission="view_reports"><FinancialOperations /></ProtectedRoute>} />


                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/admin-tickets-new" element={<ProtectedRoute><SaaSAdminDashboard /></ProtectedRoute>} />
                    <Route path="/ocr" element={<ProtectedRoute><OCR /></ProtectedRoute>} />
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
                    <Route path="/coming-soon/:feature" element={<ProtectedRoute><ComingSoonPage title="Coming Soon" subtitle="This feature is currently under development." /></ProtectedRoute>} />

                    <Route path="/complete-customer-profile" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_crm"><CompleteCustomerProfile /></ProtectedRoute>} />
                    <Route path="/complete-vendor-profile" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_erp"><CompleteVendorProfile /></ProtectedRoute>} />
                    <Route path="/customer/new-order" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']} requiredPermission="view_crm"><CustomerNewOrder /></ProtectedRoute>} />

                    {/* New Routing for DualSidebar Structure */}
                    <Route path="/attendance/my" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
                    <Route path="/attendance/daily" element={<ProtectedRoute><ComingSoonPage title="Daily Attendance" subtitle="Track daily presence" /></ProtectedRoute>} />
                    <Route path="/attendance/monthly" element={<ProtectedRoute><ComingSoonPage title="Monthly Attendance" subtitle="Aggregated monthly records" /></ProtectedRoute>} />
                    <Route path="/attendance/history" element={<ProtectedRoute><ComingSoonPage title="Check-In History" subtitle="Detailed check-in logs" /></ProtectedRoute>} />
                    <Route path="/attendance/late" element={<ProtectedRoute><ComingSoonPage title="Late Attendance" subtitle="Monitor late arrivals" /></ProtectedRoute>} />
                    
                    <Route path="/settings/departments" element={<ProtectedRoute><ComingSoonPage title="Departments" subtitle="Manage organizational units" /></ProtectedRoute>} />
                    <Route path="/settings/designations" element={<ProtectedRoute><ComingSoonPage title="Designations" subtitle="Manage job titles" /></ProtectedRoute>} />
                    
                    <Route path="/leave-management/pending" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><LeaveManagement filter="Pending" /></ProtectedRoute>} />
                    <Route path="/leave-management/approve" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><LeaveManagement /></ProtectedRoute>} />
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
                    
                    <Route path="/support" element={<ProtectedRoute><SupportWrapper /></ProtectedRoute>} />
                    <Route path="/support/admin" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><AdminTickets /></ProtectedRoute>} />
                    <Route path="/support/history" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/support/kb" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    
                    <Route path="/notifications/system" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/notifications/approvals" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/notifications/stock" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    
                    <Route path="/profile/security" element={<ProtectedRoute><ComingSoonPage title="Change Password" /></ProtectedRoute>} />
                    <Route path="/profile/security-settings" element={<ProtectedRoute><ComingSoonPage title="Security Settings" /></ProtectedRoute>} />
                    
                    <Route path="/settings/roles" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><Settings /></ProtectedRoute>} />
                    <Route path="/settings/system" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><Settings /></ProtectedRoute>} />
                    <Route path="/settings/audit-logs" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><Settings /></ProtectedRoute>} />
                    <Route path="/settings/integrations" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><Settings /></ProtectedRoute>} />
                    <Route path="/settings/notifications" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><Settings /></ProtectedRoute>} />
                    <Route path="/settings/backup" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><BackupRestore /></ProtectedRoute>} />
                    <Route path="/settings/attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><AttendanceSettings /></ProtectedRoute>} />
                    <Route path="/settings/leave" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><LeaveSettings /></ProtectedRoute>} />
                    <Route path="/settings/payroll" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'hr']}><PayrollSettings /></ProtectedRoute>} />

                    {/* Social Network Routes wrapped in SocialLayout */}
                    <Route path="/social" element={<ProtectedRoute><SocialLayout><SocialHub /></SocialLayout></ProtectedRoute>} />
                    <Route path="/social/network" element={<ProtectedRoute><SocialLayout><MyNetwork /></SocialLayout></ProtectedRoute>} />
                    <Route path="/social/messages" element={<ProtectedRoute><SocialLayout><SocialMessages /></SocialLayout></ProtectedRoute>} />
                    <Route path="/social/profile/:id" element={<ProtectedRoute><SocialLayout><SocialProfile /></SocialLayout></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                </div>
                </React.Suspense>
                
                {/* Global Aria AI Assistant Window */}
                {user && <AriaCommandCenter />}
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
                            <AriaProvider>
                                <Toaster position="top-right" />
                                <AppContent />
                            </AriaProvider>
                        </Router>
                    </NotificationProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
};

export default App;
