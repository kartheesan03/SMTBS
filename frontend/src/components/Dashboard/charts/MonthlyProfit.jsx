import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MonthlyProfit = ({ data, profit, trendPct }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="dash-card">
      <div className="dash-card-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h3 className="dash-card-title">Monthly Profit</h3>
          <div className="profit-val-row">
            <span className="profit-val">{formatCurrency(profit)}</span>
            {trendPct && (
              <span className={`profit-trend ${trendPct >= 0 ? 'text-green' : 'text-red'}`}>
                {trendPct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(trendPct)}%
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="dash-card-content" style={{ height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val/1000}k`} />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }}
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#10b981' : '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyProfit;
