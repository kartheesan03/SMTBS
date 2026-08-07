import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
const SAMPLE_DATA = [];
const COLORS = {
  netProfit: '#0F6F5C',
  revenue: '#B8862B',
  expenses: '#B24C29',
  bg: '#FBFAF7',
  border: '#E6E2D8',
  text: '#1B2430',
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
          borderLeft: `4px solid ${COLORS.revenue}`,
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(27, 36, 48, 0.08)',
          fontFamily: "'Inter', sans-serif",
          color: COLORS.text,
          minWidth: '200px',
        }}
      >
        <div
          style={{
            borderBottom: `1px dashed ${COLORS.border}`,
            paddingBottom: '8px',
            marginBottom: '8px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '11px',
          }}
        >
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                  }}
                />
                <span style={{ fontSize: '13px', color: '#555' }}>{entry.name}</span>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {formatCurrency(entry.value, currencySymbol)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
const StatCard = ({ title, value, color, active, onClick, currencySymbol, compact }) => {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: compact ? '12px' : '24px',
        border: `1px solid ${COLORS.border}`,
        borderTop: `4px solid ${color}`,
        background: active ? '#fff' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: active ? 1 : 0.6,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: compact ? '10px' : '12px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: COLORS.text,
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {title}
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            background: active ? color : 'transparent',
            transition: 'background 0.2s',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: compact ? '20px' : '32px',
          fontWeight: 400,
          color: COLORS.text,
        }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: compact ? '16px' : '24px', opacity: 0.7, marginRight: '4px' }}>
          {currencySymbol}
        </span>
        {value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
      </div>
    </div>
  );
};
export default function LedgerChart({
  data = SAMPLE_DATA,
  currencySymbol = '$',
  periodLabel = 'FY 2026',
  compact = false,
  hideHeader = false,
}) {
  const [activeSeries, setActiveSeries] = useState({
    netProfit: true,
    revenue: true,
    expenses: true,
  });
  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const totals = data.reduce(
    (acc, row) => ({
      revenue: acc.revenue + (row.revenue || 0),
      expenses: acc.expenses + (row.expenses || 0),
      netProfit: acc.netProfit + (row.netProfit || 0),
    }),
    { revenue: 0, expenses: 0, netProfit: 0 }
  );
  return (
    <div
      style={{
        padding: compact ? '16px' : '40px',
        color: COLORS.text,
        height: '100%',
        minHeight: compact ? '300px' : '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '16px' : '32px',
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;400;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
          .ledger-chart-wrapper * {
            box-sizing: border-box;
          }
        `}
      </style>
      <div className="ledger-chart-wrapper" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {!hideHeader && (
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: compact ? '20px' : '36px',
                  fontWeight: 300,
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.5px',
                }}
              >
                Financial Ledger
              </h2>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: compact ? '12px' : '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  opacity: 0.6,
                }}
              >
                {periodLabel}
              </div>
            </div>
          </div>
        )}
        {/* Legend / Stat Cards */}
        <div style={{ display: 'flex', gap: compact ? '8px' : '16px', marginBottom: compact ? '16px' : '40px' }}>
          <StatCard
            title="Net Profit"
            value={totals.netProfit}
            color={COLORS.netProfit}
            active={activeSeries.netProfit}
            onClick={() => toggleSeries('netProfit')}
            currencySymbol={currencySymbol}
            compact={compact}
          />
          <StatCard
            title="Revenue"
            value={totals.revenue}
            color={COLORS.revenue}
            active={activeSeries.revenue}
            onClick={() => toggleSeries('revenue')}
            currencySymbol={currencySymbol}
            compact={compact}
          />
          <StatCard
            title="Expenses"
            value={totals.expenses}
            color={COLORS.expenses}
            active={activeSeries.expenses}
            onClick={() => toggleSeries('expenses')}
            currencySymbol={currencySymbol}
            compact={compact}
          />
        </div>
        {/* Area Chart */}
        <div style={{ height: compact ? '150px' : '400px', width: '100%', minHeight: compact ? '150px' : '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: compact ? -10 : 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.netProfit} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.netProfit} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expenses} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.expenses} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={COLORS.border}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                interval={compact ? 1 : 'preserveStartEnd'}
                tick={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: compact ? 10 : 12,
                  fill: COLORS.text,
                  opacity: 0.7,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={compact ? 35 : 60}
                tick={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: compact ? 10 : 12,
                  fill: COLORS.text,
                  opacity: 0.7,
                }}
                tickFormatter={(val) => `${val / 1000}k`}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip currencySymbol={currencySymbol} />}
                cursor={{ stroke: COLORS.border, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              {activeSeries.expenses && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke={COLORS.expenses}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              )}
              {activeSeries.revenue && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={COLORS.revenue}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              )}
              {activeSeries.netProfit && (
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit"
                  stroke={COLORS.netProfit}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNetProfit)"
                  activeDot={{ r: 6, fill: COLORS.netProfit, stroke: COLORS.bg, strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
