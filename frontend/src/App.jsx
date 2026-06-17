import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Menu, X } from 'lucide-react';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Materials from './pages/Materials';

import OrderTracking from './pages/OrderTracking';
import HRMS from './pages/HRMS';
import AddEmployee from './pages/AddEmployee';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import SalesDashboard from './pages/SalesDashboard';
import TeamPerformance from './pages/TeamPerformance';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import HRReports from './pages/HRReports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import ERP from './pages/ERP';
import Vendors from './pages/Vendors';
import NotificationsPage from './pages/Notifications';
import MyTasks from './pages/MyTasks';
import MyAttendance from './pages/MyAttendance';
import GeneratePayroll from './pages/GeneratePayroll';
import PayrollPayment from './pages/PayrollPayment';
import Payslips from './pages/Payslips';
import LeaveManagement from './pages/LeaveManagement';
import MySalaryPage from './pages/MySalary';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import AddVendor from './pages/AddVendor';
import Support from './pages/Support';
import StockRequests from './pages/StockRequests';
import CreateOrder from './pages/CreateOrder';
import SelectOrderType from './pages/SelectOrderType';
import SelectCustomer from './pages/SelectCustomer';
import SelectVendor from './pages/SelectVendor';
import ErrorBoundary from './components/ErrorBoundary';

import CompleteCustomerProfile from './pages/CompleteCustomerProfile';
import CompleteVendorProfile from './pages/CompleteVendorProfile';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';

const AppContent = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        if (user) {
            document.body.classList.add('logged-in');
        } else {
            document.body.classList.remove('logged-in');
        }
        return () => {
            document.body.classList.remove('logged-in');
        };
    }, [user]);

    if (loading) return <div className="app-loading">Loading...</div>;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`app-layout`}>
            {user && (
                <>
                    <header className="mobile-header">
                        <button onClick={toggleSidebar} className="menu-toggle">
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2>SMTBMS</h2>
                    </header>
                    <Sidebar 
                        logout={logout} 
                        isOpen={isSidebarOpen} 
                        onClose={() => setIsSidebarOpen(false)} 
                    />
                    {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
                </>
            )}
            <main className={`main-content ${user ? 'with-sidebar' : ''}`}>
                {user && <Topbar />}
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
                        <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'HR']}>
                            <HRMS />
                        </ProtectedRoute>
                    } />
                    <Route path="/hrms/add-employee" element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'HR']}>
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
                    <Route path="/orders/select-type" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><SelectOrderType /></ProtectedRoute>} />
                    <Route path="/erp/customers/select" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><SelectCustomer /></ProtectedRoute>} />
                    <Route path="/erp/vendors/select" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><SelectVendor /></ProtectedRoute>} />
                    <Route path="/orders/create/:orderType" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><CreateOrder /></ProtectedRoute>} />
                    <Route path="/orders/:orderId/tracking" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'HR', 'Employee', 'Customer']}><OrderTracking /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><Customers /></ProtectedRoute>} />
                    <Route path="/crm/add-customer" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><AddCustomer /></ProtectedRoute>} />
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
                    <Route path="/stock-requests" element={<ProtectedRoute><StockRequests /></ProtectedRoute>} />

                    <Route path="/complete-customer-profile" element={<ProtectedRoute allowedRoles={['Customer']}><CompleteCustomerProfile /></ProtectedRoute>} />
                    <Route path="/complete-vendor-profile" element={<ProtectedRoute allowedRoles={['Vendor']}><CompleteVendorProfile /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            <style jsx="true">{`
                .app-layout {
                    display: flex;
                    min-height: 100vh;
                    flex-direction: column;
                }

                .mobile-header {
                    display: none;
                    height: 60px;
                    background: var(--bg-card);
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 900;
                    padding: 0 20px;
                    align-items: center;
                    justify-content: space-between;
                }
                .mobile-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--primary);
                    margin: 0;
                    letter-spacing: 0.5px;
                }
                .menu-toggle {
                    background: transparent;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                }
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    z-index: 950;
                    backdrop-filter: blur(2px);
                }
                
                .main-content {
                    flex: 1;
                    transition: all 0.3s ease;
                    width: 100%;
                }

                /* ── Desktop: 2-column (Sidebar 260 + Content) ── */
                .main-content.with-sidebar {
                    margin-left: 260px;
                    width: calc(100% - 260px);
                    background-color: var(--bg-body);
                }
                .p-30 { padding: 30px; }

                /* ── Mobile: Sidebar hidden ── */
                @media (max-width: 768px) {
                    .app-layout {
                        flex-direction: column;
                    }
                    .mobile-header {
                        display: flex;
                    }
                    .main-content.with-sidebar {
                        margin-left: 0;
                        width: 100%;
                        padding-top: 0;
                    }
                    .p-30 {
                        padding: 16px;
                    }
                }
            `}</style>
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
                            <AppContent />
                        </Router>
                    </NotificationProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
};

export default App;
