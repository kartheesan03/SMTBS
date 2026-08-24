import React from 'react';
import { Activity, DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, icon: Icon, color, trend, trendValue, sparkData }) => {
  return (
    <div className={`dash-kpi-card ${color}`}>
      <div className="kpi-header">
        <div className="kpi-icon-wrapper">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {trendValue && (
          <div className={`kpi-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      
      <div className="kpi-body">
        <h3 className="kpi-value">{value}</h3>
        <p className="kpi-title">{title}</p>
      </div>

      {sparkData && sparkData.length > 0 && (
        <div className="kpi-sparkline">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="currentColor" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="currentColor" fillOpacity={1} fill={`url(#color-${color})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const KPIGrid = ({ stats, sparkData, profitTrendPct }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="dash-kpi-grid">
      <KPICard 
        title="System Health" 
        value="100%" 
        icon={Activity} 
        color="kpi-green" 
      />
      <KPICard 
        title="Revenue Today" 
        value={formatCurrency(stats?.todaysRevenue || 0)} 
        icon={DollarSign} 
        color="kpi-purple"
        trend={profitTrendPct >= 0 ? 'up' : 'down'}
        trendValue={Math.abs(profitTrendPct)}
        sparkData={sparkData}
      />
      <KPICard 
        title="Orders Today" 
        value={stats?.todaysOrders || 0} 
        icon={ShoppingCart} 
        color="kpi-orange" 
      />
      <KPICard 
        title="Active Employees" 
        value={stats?.totalEmployees || 0} 
        icon={Users} 
        color="kpi-blue" 
      />
    </div>
  );
};

export default KPIGrid;
