import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

/**
 * AppInitContext — Global application initialization state
 *
 * Architecture:
 *  - `appReady` is DERIVED synchronously from `readyForUserId` vs current user id.
 *    This eliminates the React render-cycle race where appReady=true briefly
 *    fires for an authenticated user before the useEffect runs setAppReady(false).
 *
 *  - For unauthenticated users (login/landing): appReady=true immediately.
 *  - For authenticated users: appReady=true only after parallel API calls complete
 *    for THAT specific user's id/email.
 *
 *  - All role-specific API calls are fired in parallel via Promise.all().
 *  - Results are cached in window for 90s to avoid duplicate requests on re-renders.
 *  - On logout, cache is cleared.
 */
export const AppInitContext = createContext({
    appReady: false,
    initError: null,
    retryInit: () => {},
    dashboardData: null,
    employees: [],
    leads: [],
    orders: [],
    customers: [],
    tasks: [],
    leavesData: [],
    salariesData: [],
    myTasks: [],
    attendStats: null,
    salary: null,
    leaveBalance: null,
    customerProfile: null,
    customerOrders: [],
    vendorProfile: null,
    vendorMaterials: [],
    vendorOrders: [],
});

const INIT_CACHE_KEY = '__smtbms_init_cache__';
const CACHE_TTL_MS = 90000; // 90 seconds

export const AppInitProvider = ({ children }) => {
    const { user, loading: authLoading } = useContext(AuthContext);

    // `readyForUserId` stores the userId/email for which init has completed.
    // `appReady` is DERIVED from this — fully synchronous, no render-cycle flash.
    const [readyForUserId, setReadyForUserId] = useState(null);
    const [initError, setInitError] = useState(null);

    // Pre-fetched data
    const [dashboardData, setDashboardData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [leads, setLeads] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);
    
    // Employee-role specific
    const [myTasks, setMyTasks] = useState([]);
    const [attendStats, setAttendStats] = useState(null);
    const [salary, setSalary] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);
    
    // Customer-role specific
    const [customerProfile, setCustomerProfile] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    
    // Vendor-role specific
    const [vendorProfile, setVendorProfile] = useState(null);
    const [vendorMaterials, setVendorMaterials] = useState([]);
    const [vendorOrders, setVendorOrders] = useState([]);

    // Stable user identifier — used to track which user we're initialized for
    const getUserId = useCallback((u) => {
        if (!u) return null;
        return u._id || u.id || u.email || 'anonymous';
    }, []);

    // DERIVED — synchronous, no render flash
    const appReady = useMemo(() => {
        if (authLoading) return false;
        if (!user) return true; // Not logged in — show login/landing page immediately
        return readyForUserId === getUserId(user);
    }, [authLoading, user, readyForUserId, getUserId]);

    const runInit = useCallback(async (targetUser) => {
        if (!targetUser) return;

        const userId = getUserId(targetUser);
        setInitError(null);

        // Check window cache first
        const now = Date.now();
        const cached = window[INIT_CACHE_KEY];
        if (cached && cached.userId === userId && (now - cached.ts < CACHE_TTL_MS)) {
            setDashboardData(cached.dashboardData);
            setEmployees(cached.employees);
            setLeads(cached.leads);
            setOrders(cached.orders);
            setCustomers(cached.customers);
            setTasks(cached.tasks);
            setLeavesData(cached.leavesData);
            setSalariesData(cached.salariesData);
            setMyTasks(cached.myTasks || []);
            setAttendStats(cached.attendStats || null);
            setSalary(cached.salary || null);
            setLeaveBalance(cached.leaveBalance || null);
            setCustomerProfile(cached.customerProfile || null);
            setCustomerOrders(cached.customerOrders || []);
            setVendorProfile(cached.vendorProfile || null);
            setVendorMaterials(cached.vendorMaterials || []);
            setVendorOrders(cached.vendorOrders || []);
            setReadyForUserId(userId);
            return;
        }

        try {
            const role = (targetUser.role || '').toLowerCase();
            const isAdminLike = role === 'admin' || role === 'super admin';
            const isHR = role === 'hr';
            const isSales = role === 'sales';
            const isManager = role === 'manager';
            const isEmployee = role === 'employee';
            const isCustomer = role === 'customer';
            const isVendor = role === 'vendor';

            // Always fetch dashboard stats for every authenticated user
            const requests = [
                API.get('/dashboard/stats').catch(() => ({ data: {} })),
            ];

            // ── Employees list ──────────────────────────────────────────────
            if (isAdminLike || isHR || isManager || isSales) {
                requests.push(API.get('/employees').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Leads ───────────────────────────────────────────────────────
            if (isAdminLike || isSales || isManager) {
                requests.push(API.get('/leads').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Orders ──────────────────────────────────────────────────────
            if (isAdminLike || isSales || isManager) {
                requests.push(API.get('/orders').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Customers ───────────────────────────────────────────────────
            if (isAdminLike || isSales || isManager) {
                requests.push(API.get('/customers').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Tasks ───────────────────────────────────────────────────────
            if (isAdminLike || isSales || isHR || isManager) {
                requests.push(API.get('/tasks').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Leaves ──────────────────────────────────────────────────────
            if (isAdminLike || isHR || isManager) {
                requests.push(API.get('/leaves').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Salaries ────────────────────────────────────────────────────
            if (isAdminLike || isHR || isManager) {
                requests.push(API.get('/salaries').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
            }

            // ── Employee-specific routes ────────────────────────────────────
            if (isEmployee) {
                requests.push(API.get('/tasks/my').catch(() => ({ data: [] })));
                requests.push(API.get('/attendance/my-history').catch(() => ({ data: [] })));
                requests.push(API.get('/salaries/my').catch(() => ({ data: null })));
                requests.push(API.get('/leaves/balance').catch(() => ({ data: null })));
            } else {
                requests.push(Promise.resolve({ data: [] }));
                requests.push(Promise.resolve({ data: [] }));
                requests.push(Promise.resolve({ data: null }));
                requests.push(Promise.resolve({ data: null }));
            }
            
            // ── Customer-specific routes ────────────────────────────────────
            if (isCustomer) {
                requests.push(API.get('/customers/profile').catch(() => ({ data: null })));
                requests.push(API.get('/orders/customer').catch(() => ({ data: [] })));
            } else {
                requests.push(Promise.resolve({ data: null }));
                requests.push(Promise.resolve({ data: [] }));
            }
            
            // ── Vendor-specific routes ──────────────────────────────────────
            if (isVendor) {
                requests.push(API.get('/vendors/my-profile').catch(() => ({ data: null })));
            } else {
                requests.push(Promise.resolve({ data: null }));
            }

            const [
                dashR, empR, leadsR, ordR, custR, taskR, lvR, salR,
                myTaskR, attR, mySalR, lvBalR, custProfR, custOrdR, vendProfR
            ] = await Promise.all(requests);

            // Build employee attendance stats
            const attArr = Array.isArray(attR.data) ? attR.data : [];
            const present = attArr.filter(a => a.status === 'Present' || a.checkIn).length;
            const computedAttendStats = isEmployee
                ? { total: attArr.length, present, pct: attArr.length > 0 ? Math.round((present / attArr.length) * 100) : 0, attArr }
                : null;

            const result = {
                userId,
                ts: Date.now(),
                dashboardData: dashR.data || {},
                employees: Array.isArray(empR.data) ? empR.data : [],
                leads: Array.isArray(leadsR.data) ? leadsR.data : [],
                orders: Array.isArray(ordR.data) ? ordR.data : [],
                customers: Array.isArray(custR.data) ? custR.data : [],
                tasks: Array.isArray(taskR.data) ? taskR.data : [],
                leavesData: Array.isArray(lvR.data) ? lvR.data : [],
                salariesData: Array.isArray(salR.data) ? salR.data : [],
                myTasks: Array.isArray(myTaskR.data)
                    ? myTaskR.data.filter(t => t.status !== 'Completed').slice(0, 5)
                    : [],
                attendStats: computedAttendStats,
                salary: mySalR.data || null,
                leaveBalance: lvBalR.data || null,
                customerProfile: custProfR.data || null,
                customerOrders: Array.isArray(custOrdR.data) ? custOrdR.data : [],
                vendorProfile: vendProfR.data?.vendor || null,
                vendorMaterials: vendProfR.data?.materials || [],
                vendorOrders: vendProfR.data?.orders || [],
            };

            // Cache in window
            window[INIT_CACHE_KEY] = result;

            setDashboardData(result.dashboardData);
            setEmployees(result.employees);
            setLeads(result.leads);
            setOrders(result.orders);
            setCustomers(result.customers);
            setTasks(result.tasks);
            setLeavesData(result.leavesData);
            setSalariesData(result.salariesData);
            setMyTasks(result.myTasks);
            setAttendStats(result.attendStats);
            setSalary(result.salary);
            setLeaveBalance(result.leaveBalance);
            setCustomerProfile(result.customerProfile);
            setCustomerOrders(result.customerOrders);
            setVendorProfile(result.vendorProfile);
            setVendorMaterials(result.vendorMaterials);
            setVendorOrders(result.vendorOrders);

            // Mark ready for this specific user — this is what makes appReady=true
            setReadyForUserId(userId);
        } catch (err) {
            console.error('[AppInit] Failed to initialize application data:', err);
            setInitError(err?.message || 'Failed to load application data. Please check your connection.');
        }
    }, [getUserId]);

    // Trigger init when auth state resolves
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            // Logged out — clear everything. appReady derives to true for !user.
            window[INIT_CACHE_KEY] = null;
            setReadyForUserId(null);
            setInitError(null);
            setDashboardData(null);
            setEmployees([]);
            setLeads([]);
            setOrders([]);
            setCustomers([]);
            setTasks([]);
            setLeavesData([]);
            setSalariesData([]);
            setMyTasks([]);
            setAttendStats(null);
            setSalary(null);
            setLeaveBalance(null);
            setCustomerProfile(null);
            setCustomerOrders([]);
            setVendorProfile(null);
            setVendorMaterials([]);
            setVendorOrders([]);
            return;
        }

        // Authenticated — run init for this user
        const userId = getUserId(user);
        if (readyForUserId !== userId) {
            runInit(user);
        }
    }, [authLoading, user, getUserId]);
    // NOTE: do NOT include readyForUserId or runInit in deps — would cause loops

    const retryInit = useCallback(() => {
        if (user) {
            window[INIT_CACHE_KEY] = null; // Force clear cache on retry
            setInitError(null);
            runInit(user);
        }
    }, [user, runInit]);

    return (
        <AppInitContext.Provider value={{
            appReady,
            initError,
            retryInit,
            dashboardData,
            employees,
            leads,
            orders,
            customers,
            tasks,
            leavesData,
            salariesData,
            myTasks,
            attendStats,
            salary,
            leaveBalance,
            customerProfile,
            customerOrders,
            vendorProfile,
            vendorMaterials,
            vendorOrders,
        }}>
            {children}
        </AppInitContext.Provider>
    );
};
