import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Droplet, Package, AlertTriangle } from 'lucide-react';

export default function Dashboard({ store }) {
    const { inventory, metrics } = store;

    // Simple quick stats calculating Waste
    const totalWastedItems = inventory.reduce((sum, item) => sum + item.wasted, 0);

    return (
        <div className="flex-col gap-6">

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>

                <MetricCard
                    title="Total Juices Sold"
                    value={metrics.totalJuicesSold}
                    icon={Droplet}
                    color="var(--accent-orange)"
                />

                <MetricCard
                    title="Net Profit"
                    value={`$${metrics.netProfit.toFixed(2)}`}
                    icon={TrendingUp}
                    color="var(--accent-green)"
                />

                <MetricCard
                    title="Total Expenses"
                    value={`$${metrics.totalExpenses.toFixed(2)}`}
                    icon={TrendingDown}
                    color="var(--accent-purple)"
                />

                <MetricCard
                    title="Items Wasted"
                    value={totalWastedItems}
                    icon={AlertTriangle}
                    color="var(--accent-red)"
                />

            </div>

            {/* Main Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>

                {/* Inventory Analytics Panel */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                        <h2>Inventory Analytics</h2>
                        <Package size={20} color="var(--accent-orange)" />
                    </div>

                    <div className="flex-col gap-4">
                        {inventory.map(item => {
                            const totalUsedAndWasted = item.used + item.wasted;
                            // Avoid division by zero
                            const usagePercent = item.totalStock > 0 ? (totalUsedAndWasted / item.totalStock) * 100 : 0;
                            const wastePercent = totalUsedAndWasted > 0 ? (item.wasted / totalUsedAndWasted) * 100 : 0;

                            return (
                                <div key={item.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                    <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {(item.totalStock - item.used - item.wasted)} {item.unit} left
                                        </span>
                                    </div>

                                    {/* Progress Bar Container */}
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                        {/* Used Bar */}
                                        <div style={{ width: `${usagePercent * ((item.used) / (totalUsedAndWasted || 1))}%`, background: 'var(--accent-orange)', height: '100%' }} />
                                        {/* Wasted Bar */}
                                        <div style={{ width: `${usagePercent * ((item.wasted) / (totalUsedAndWasted || 1))}%`, background: 'var(--accent-red)', height: '100%' }} />
                                    </div>

                                    <div className="flex justify-between" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                        <span style={{ color: 'var(--accent-orange)' }}>Used: {item.used} {item.unit}</span>
                                        <span style={{ color: 'var(--accent-red)' }}>Wasted: {item.wasted} {item.unit}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity Panel */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                        <h2>Overview</h2>
                        <DollarSign size={20} color="var(--accent-green)" />
                    </div>
                    <div className="flex-col gap-4">
                        <div style={{ padding: '1rem', borderLeft: '3px solid var(--accent-green)', background: 'rgba(0,0,0,0.2)', borderRadius: '0 8px 8px 0' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Income</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>${(metrics.totalIncome || 0).toFixed(2)}</h3>
                        </div>

                        <div style={{ padding: '1rem', borderLeft: '3px solid var(--accent-orange)', background: 'rgba(0,0,0,0.2)', borderRadius: '0 8px 8px 0' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pending / Unpaid</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem', color: 'var(--accent-orange)' }}>
                                {metrics.totalPendingCups} cups (${(metrics.totalPendingAmount || 0).toFixed(2)})
                            </h3>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
                            Keeping an eye on waste helps maximize your profit margins! Try to keep the red bars on the inventory analytics as low as possible.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color }) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: `3px solid ${color}` }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{title}</h3>
                <div style={{ background: `${color}20`, padding: '0.5rem', borderRadius: '8px' }}>
                    <Icon size={20} color={color} />
                </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {value}
            </p>
        </div>
    );
}
