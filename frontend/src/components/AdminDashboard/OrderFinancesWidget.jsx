import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea
} from 'recharts';
import './OrderFinancesWidget.css';

const data = [
  { name: 'Jan', sales: 12000, purchases: 1100 },
  { name: 'Feb', sales: 15000, purchases: 1300 },
  { name: 'Mar', sales: 14000, purchases: 1200 },
  { name: 'Apr', sales: 18000, purchases: 1500 },
  { name: 'May', sales: 22000, purchases: 1800 },
  { name: 'Jun', sales: 20000, purchases: 1600 },
  { name: 'Jul', sales: 24000, purchases: 2000 },
  { name: 'Aug', sales: 75000, purchases: 5700 }, // Spike!
  { name: 'Sep', sales: 26000, purchases: 2200 },
  { name: 'Oct', sales: 28000, purchases: 2400 },
  { name: 'Nov', sales: 30000, purchases: 2500 },
  { name: 'Dec', sales: 32000, purchases: 2700 },
];

const formatCurrency = (value) => {
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(value % 1000 !== 0 ? 1 : 0)}k`;
  }
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bx-of-custom-tooltip">
        <div className="bx-of-tooltip-label">{label}</div>
        
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="bx-of-tooltip-item">
            <div className="bx-of-tooltip-name">
              <span 
                style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: entry.dataKey === 'purchases' ? '50%' : '2px',
                  backgroundColor: entry.color 
                }}
              ></span>
              {entry.name}
            </div>
            <div className="bx-of-tooltip-value">
              {formatCurrency(entry.value)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const OrderFinancesWidget = () => {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const navigate = useNavigate();

  // Gradient definitions are injected via SVG defs below
  return (
    <div className="bx-of-panel">
      <div className="bx-of-header">
        <div className="bx-of-title-container">
          <h2 className="bx-of-title">Order Finances</h2>
          <p className="bx-of-subtitle">Receivable vs Payable Analytics</p>
        </div>
        <div className="bx-of-controls">
          <select className="bx-of-year-selector" defaultValue="2026">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <a href="#" className="bx-of-link" onClick={(e) => {
            e.preventDefault();
            navigate('/finance');
          }}>
            View details →
          </a>
        </div>
      </div>

      <div className="bx-of-legend-container">
        <div className="bx-of-legend-item">
          <div className="bx-of-legend-dot sales"></div>
          Receivable (Sales)
        </div>
        <div className="bx-of-legend-item">
          <div className="bx-of-legend-dot purchases"></div>
          Payable (Purchases)
        </div>
      </div>

      <div className="bx-of-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onMouseMove={(state) => {
              if (state?.isTooltipActive) {
                if (hoveredMonth !== state.activeLabel) {
                  setHoveredMonth(state.activeLabel);
                }
              } else {
                if (hoveredMonth !== null) {
                  setHoveredMonth(null);
                }
              }
            }}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="colorSalesHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            
            {/* Left Y-Axis for Sales (0-80k) */}
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => val === 0 ? '0' : formatCurrency(val)}
              domain={[0, 80000]}
              ticks={[0, 20000, 40000, 60000, 80000]}
            />
            
            {/* Right Y-Axis for Purchases (0-6k) */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => val === 0 ? '0' : formatCurrency(val)}
              domain={[0, 6000]}
              ticks={[0, 1500, 3000, 4500, 6000]}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }} // Disable default cursor since we use ReferenceArea
            />

            {/* Subtle background highlight for the active/hovered month or specifically August */}
            {hoveredMonth && (
               <ReferenceArea yAxisId="left" x1={hoveredMonth} x2={hoveredMonth} fill="#f1f5f9" fillOpacity={0.5} />
            )}
            
            {/* If not hovering, highlight August statically as a demo feature */}
            {!hoveredMonth && (
               <ReferenceArea yAxisId="left" x1="Aug" x2="Aug" fill="#f8fafc" fillOpacity={1} />
            )}

            <Bar 
              yAxisId="left" 
              dataKey="sales" 
              name="Sales" 
              barSize={32}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={hoveredMonth === entry.name ? "url(#colorSalesHover)" : "url(#colorSales)"} 
                />
              ))}
            </Bar>
            
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="purchases" 
              name="Purchases" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#f97316' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#ffffff', stroke: '#f97316' }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderFinancesWidget;
