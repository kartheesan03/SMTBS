import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
const CURRENT_YEAR_MOCK = [];
const LAST_YEAR_MOCK = [];
const COLORS = {
  bg: '#FFFFFF',
  border: '#E2E8F0',
  muted: '#64748B',
  text: '#0F172A',
  accent: '#2563EB',
  secondary: '#94A3B8'
};
const formatCurrency = (val, sym) =>
  `${sym}${val.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          fontFamily: "'Inter', sans-serif",
          color: COLORS.text,
          minWidth: '220px',
        }}
      >
        <div
          style={{
            borderBottom: `1px solid ${COLORS.border}`,
            paddingBottom: '10px',
            marginBottom: '12px',
            fontSize: '13px',
            color: COLORS.muted,
            fontWeight: 500
          }}
        >
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {payload.map((entry) => {
            const isCurrent = entry.dataKey === 'current';
            const color = isCurrent ? COLORS.accent : COLORS.secondary;
            return (
              <div
                key={entry.dataKey}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      background: isCurrent ? color : 'transparent',
                      border: `2px solid ${color}`,
                      borderRadius: '2px'
                    }}
                  />
                  <span style={{ fontSize: '13px', color: COLORS.muted }}>
                    {isCurrent ? 'Current Year' : 'Last Year'}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: isCurrent ? COLORS.text : COLORS.muted
                  }}
                >
                  {formatCurrency(entry.value, currencySymbol)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
const StatBlock = ({ title, value, color, isCurrent, active, onClick, currencySymbol }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        border: `1px solid ${active ? color : COLORS.border}`,
        borderRadius: '8px',
        background: active ? `${color}0A` : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        opacity: active ? 1 : 0.5,
        minWidth: '240px'
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
          color: COLORS.muted,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            background: isCurrent ? color : 'transparent',
            border: `2px solid ${color}`,
            borderRadius: '2px',
          }}
        />
        {title}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '32px',
          fontWeight: 700,
          color: COLORS.text,
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px'
        }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', color: COLORS.muted }}>
          {currencySymbol}
        </span>
        {value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
      </div>
    </div>
  );
};
export default function NetProfitChart({
  currentYearData = CURRENT_YEAR_MOCK,
  lastYearData = LAST_YEAR_MOCK,
  currencySymbol = '₹',
}) {
  const [activeSeries, setActiveSeries] = useState({
    current: true,
    last: true,
  });
  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const chartData = useMemo(() => {
    return currentYearData.map((curr, idx) => {
      const last = lastYearData[idx] || { netProfit: 0 };
      return {
        month: curr.month,
        current: curr.netProfit,
        last: last.netProfit,
      };
    });
  }, [currentYearData, lastYearData]);
  const currentTotal = currentYearData.reduce((acc, curr) => acc + (curr.netProfit || 0), 0);
  const lastTotal = lastYearData.reduce((acc, curr) => acc + (curr.netProfit || 0), 0);
  return (
    <div
      style={{
        background: COLORS.bg,
        padding: '40px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        color: COLORS.text,
        minHeight: '550px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .net-profit-chart * {
            box-sizing: border-box;
          }
        `}
      </style>
      <div className="net-profit-chart" style={{ width: '100%', margin: '0 auto' }}>
        {/* Header Stat Blocks (Legend) */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <StatBlock
            title="Net Profit — Current Year"
            value={currentTotal}
            color={COLORS.accent}
            isCurrent={true}
            active={activeSeries.current}
            onClick={() => toggleSeries('current')}
            currencySymbol={currencySymbol}
          />
          <StatBlock
            title="Net Profit — Last Year"
            value={lastTotal}
            color={COLORS.secondary}
            isCurrent={false}
            active={activeSeries.last}
            onClick={() => toggleSeries('last')}
            currencySymbol={currencySymbol}
          />
        </div>
        {/* Chart */}
        <div style={{ height: '380px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={COLORS.border}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fill: COLORS.muted,
                }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fill: COLORS.muted,
                }}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1).replace('.0', '')}k` : val}
                dx={-5}
              />
              <Tooltip
                content={<CustomTooltip currencySymbol={currencySymbol} />}
                cursor={{ stroke: COLORS.border, strokeWidth: 1 }}
              />
              {activeSeries.last && (
                <Line
                  type="monotone"
                  dataKey="last"
                  name="Last Year"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  dot={{ r: 3, fill: COLORS.bg, stroke: COLORS.secondary, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: COLORS.bg, stroke: COLORS.secondary, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}
              {activeSeries.current && (
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Current Year"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCurrent)"
                  activeDot={{ r: 5, fill: COLORS.accent, stroke: COLORS.bg, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
