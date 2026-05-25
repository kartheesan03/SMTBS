import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { Menu, X } from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Materials from './pages/Materials';
import HRMS from './pages/HRMS';
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
import Reports from './pages/Reports';
import ERP from './pages/ERP';
import CRM from './pages/CRM';
import Vendors from './pages/Vendors';
import NotificationsPage from './pages/Notifications';
import MyTasks from './pages/MyTasks';
import MyAttendance from './pages/MyAttendance';
import LeaveManagement from './pages/LeaveManagement';
import MySalaryPage from './pages/MySalary';
import Customers from './pages/Customers';
import SalesPipeline from './pages/SalesPipeline';
import FollowUps from './pages/FollowUps';

const AppContent = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return <div className="app-loading">Loading...</div>;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="app-layout">
            {user && (
                <>
                    <header className="mobile-header">
                        <button onClick={toggleSidebar} className="menu-toggle">
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="title-gradient">SMTBMS</h2>
                        <div style={{ width: 24 }}></div> {/* Spacer */}
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
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    
                    {/* Protected Root Route - Dispatches to correct dashboard */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            {user?.role === 'Admin' ? <AdminDashboard /> : 
                             user?.role === 'HR' ? <HRDashboard /> :
                             user?.role === 'Manager' ? <ManagerDashboard /> : 
                             user?.role === 'Sales' ? <SalesDashboard /> : 
                             user?.role === 'Employee' ? <EmployeeDashboard /> : <Dashboard />}
                        </ProtectedRoute>
                    } />
                    
                    {/* Role Specific Protected Routes */}
                    <Route path="/materials" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}><Materials /></ProtectedRoute>} />
                    <Route path="/hrms" element={<ProtectedRoute allowedRoles={['Admin', 'HR']}><HRMS /></ProtectedRoute>} />
                    <Route path="/payroll" element={<ProtectedRoute allowedRoles={['Admin', 'HR']}><Payroll /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}><Attendance /></ProtectedRoute>} />
                    <Route path="/hr-reports" element={<ProtectedRoute allowedRoles={['Admin', 'HR']}><HRReports /></ProtectedRoute>} />
                    <Route path="/team-performance" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><TeamPerformance /></ProtectedRoute>} />
                    <Route path="/erp" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}><ERP /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><CRM /></ProtectedRoute>} />
                    <Route path="/vendors" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}><Vendors /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'HR']}><Reports /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                    {/* Sales Routes */}
                    <Route path="/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><Customers /></ProtectedRoute>} />
                    <Route path="/sales-pipeline" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><SalesPipeline /></ProtectedRoute>} />
                    <Route path="/follow-ups" element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}><FollowUps /></ProtectedRoute>} />

                    {/* Employee Routes */}
                    <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                    <Route path="/my-attendance" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
                    <Route path="/my-salary" element={<ProtectedRoute><MySalaryPage /></ProtectedRoute>} />
                    <Route path="/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />

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
                    background: var(--glass);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 900;
                    padding: 0 20px;
                    align-items: center;
                    justify-content: space-between;
                }
                .menu-toggle {
                    background: transparent;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 950;
                    backdrop-filter: blur(2px);
                }
                .main-content {
                    flex: 1;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                .main-content.with-sidebar {
                    margin-left: 260px;
                    width: calc(100% - 260px);
                    background-color: var(--dash-bg, #f1f5f9);
                }
                .p-30 { padding: 30px; }

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
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;
