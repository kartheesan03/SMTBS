import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AttendanceChart = ({ data, pct }) => {
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Employee Attendance</h3>
      </div>
      <div className="dash-card-content" style={{ height: '240px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center-text">
          <span className="donut-pct">{pct}%</span>
          <span className="donut-label">Present</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
