import React from 'react';
import { Users, Calendar, Clock, Box, ShoppingCart, DollarSign, Target, CheckSquare } from 'lucide-react';

const StatBox = ({ title, value, icon: Icon, colorClass, highlight }) => (
  <div className={`dash-stat-box ${highlight ? 'stat-highlight' : ''}`}>
    <div className={`stat-icon-wrapper ${colorClass}`}>
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="stat-content">
      <div className="stat-val">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  </div>
);

const StatisticsGrid = ({ stats, attendance }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="dash-statistics-grid">
      <StatBox title="Total Employees" value={stats.totalEmployees || 0} icon={Users} colorClass="bg-blue" />
      <StatBox title="Present Today" value={`${attendance.total} (${attendance.pct}%)`} icon={Clock} colorClass="bg-green" />
      <StatBox title="Pending Leaves" value={stats.pendingLeaves || 0} icon={Calendar} colorClass="bg-orange" />
      <StatBox title="Active Materials" value={stats.activeMaterials || 0} icon={Box} colorClass="bg-purple" />
      
      <StatBox title="Open PO Orders" value={stats.openPoOrders || 0} icon={ShoppingCart} colorClass="bg-cyan" />
      <StatBox title="Today's Revenue" value={formatCurrency(stats.todaysRevenue || 0)} icon={DollarSign} colorClass="bg-green" highlight />
      <StatBox title="Monthly Sales" value={formatCurrency(stats.monthlySales || 0)} icon={Target} colorClass="bg-indigo" />
      <StatBox title="Pending Tasks" value={stats.pendingTasks || 0} icon={CheckSquare} colorClass="bg-pink" />
    </div>
  );
};

export default StatisticsGrid;
