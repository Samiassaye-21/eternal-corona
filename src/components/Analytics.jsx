import React, { useRef, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

export default function Analytics({ store }) {
    const { sales, expenses } = store;

    // Get last 7 days of data
    const chartData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });

            const daySales = sales.filter(s => s.date === dateStr);
            const dayExpenses = expenses.filter(e => e.date === dateStr);

            const revenue = daySales.reduce((sum, s) => sum + (s.amount || 0), 0);
            const shiftExp = daySales.reduce((sum, s) => sum + (s.dailyExpense || 0), 0);
            const opExp = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const totalExp = shiftExp + opExp;
            const cups = daySales.reduce((sum, s) => sum + (s.cupsUsed || 0), 0);
            const pendingCups = daySales.reduce((sum, s) => sum + (s.pendingCups || 0), 0);

            days.push({ date: dateStr, label: dayLabel, revenue, expense: totalExp, cups, pendingCups, net: revenue - totalExp });
        }
        return days;
    }, [sales, expenses]);

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

    // Summary for the 7-day period
    const summary = useMemo(() => {
        const totals = chartData.reduce((acc, d) => {
            acc.revenue += d.revenue;
            acc.expense += d.expense;
            acc.cups += d.cups;
            acc.pendingCups += d.pendingCups;
            return acc;
        }, { revenue: 0, expense: 0, cups: 0, pendingCups: 0 });
        return { ...totals, net: totals.revenue - totals.expense };
    }, [chartData]);

    // Top employees in last 7 days
    const employeeStats = useMemo(() => {
        const dateRange = chartData.map(d => d.date);
        const relevantSales = sales.filter(s => dateRange.includes(s.date) && s.employee);
        const map = {};
        relevantSales.forEach(s => {
            if (!map[s.employee]) map[s.employee] = { name: s.employee, sales: 0, revenue: 0 };
            map[s.employee].sales += s.juicesSold || 0;
            map[s.employee].revenue += s.amount || 0;
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue);
    }, [sales, chartData]);

    return (
        <div className="flex-col gap-6">

            {/* Header */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={24} color="var(--accent-orange)" />
                    Analytics — Last 7 Days
                </h2>
                <p style={{ marginTop: '0.25rem' }}>Revenue trends, expenses, and employee performance.</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <SummaryCard label="Total Revenue" value={`$${summary.revenue.toLocaleString()}`} color="var(--accent-green)" icon={TrendingUp} />
                <SummaryCard label="Total Expenses" value={`$${summary.expense.toLocaleString()}`} color="var(--accent-purple)" icon={TrendingDown} />
                <SummaryCard label="Net Profit" value={`$${summary.net.toLocaleString()}`} color={summary.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'} icon={DollarSign} />
                <SummaryCard label="Cups Used" value={summary.cups.toLocaleString()} color="var(--accent-orange)" icon={BarChart3} />
            </div>

            {/* Chart + Employee Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                {/* Bar Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Daily Revenue</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '220px', paddingBottom: '2rem', position: 'relative' }}>
                        {chartData.map((day, i) => {
                            const barHeight = maxRevenue > 0 ? (day.revenue / maxRevenue) * 180 : 0;
                            const expBarHeight = maxRevenue > 0 ? (day.expense / maxRevenue) * 180 : 0;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                                    {/* Revenue value on hover area */}
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', minHeight: '1rem' }}>
                                        {day.revenue > 0 && `$${(day.revenue / 1000).toFixed(1)}k`}
                                    </div>
                                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '180px' }}>
                                        {/* Revenue bar */}
                                        <div
                                            style={{
                                                width: '24px',
                                                height: `${barHeight}px`,
                                                background: 'linear-gradient(to top, var(--accent-green), rgba(132, 204, 22, 0.6))',
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.5s ease',
                                                minHeight: day.revenue > 0 ? '4px' : '0px'
                                            }}
                                        />
                                        {/* Expense bar */}
                                        <div
                                            style={{
                                                width: '16px',
                                                height: `${expBarHeight}px`,
                                                background: 'linear-gradient(to top, var(--accent-purple), rgba(217, 70, 239, 0.5))',
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.5s ease',
                                                minHeight: day.expense > 0 ? '4px' : '0px'
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.2' }}>
                                        {day.label.split(', ')[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-4" style={{ marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-green)' }} /> Revenue
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-purple)' }} /> Expenses
                        </span>
                    </div>
                </div>

                {/* Employee Leaderboard */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Users size={20} color="var(--accent-blue)" />
                        Top Employees
                    </h3>
                    {employeeStats.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No employee data yet. Add employee names when logging sales.</p>
                    ) : (
                        <div className="flex-col gap-3">
                            {employeeStats.map((emp, i) => (
                                <div key={emp.name} style={{
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    borderLeft: i === 0 ? '3px solid var(--accent-orange)' : '3px solid rgba(255,255,255,0.1)'
                                }}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span style={{
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: i === 0 ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.75rem', fontWeight: 'bold'
                                            }}>
                                                {i + 1}
                                            </span>
                                            <span style={{ fontWeight: '600' }}>{emp.name}</span>
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                            ${emp.revenue.toLocaleString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginLeft: '2.5rem' }}>
                                        {emp.sales} juices sold
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

function SummaryCard({ label, value, color, icon: Icon }) {
    return (
        <div className="glass-panel" style={{ padding: '1.25rem', borderTop: `3px solid ${color}` }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                <div style={{ background: `${color}20`, padding: '0.4rem', borderRadius: '8px' }}>
                    <Icon size={18} color={color} />
                </div>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</p>
        </div>
    );
}
