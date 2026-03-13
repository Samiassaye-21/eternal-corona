import React, { useState, useMemo } from 'react';
import { DollarSign, Droplet, Plus, List, TrendingDown, Printer, Download, Calendar, User } from 'lucide-react';

// ─── Date Filter Helpers ───
function getDateRange(filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    switch (filter) {
        case 'today': return { from: todayStr, to: todayStr };
        case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 6);
            return { from: weekAgo.toISOString().split('T')[0], to: todayStr };
        }
        case 'month': {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { from: monthStart.toISOString().split('T')[0], to: todayStr };
        }
        default: return null; // 'all'
    }
}

function filterByDate(items, range) {
    if (!range) return items;
    return items.filter(item => item.date >= range.from && item.date <= range.to);
}

// ─── CSV Export Helpers ───
function downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function exportSalesCSV(sales) {
    const headers = ['Date', 'Shift', 'Employee', 'Cups Used', 'Beu Cups', 'Juices Sold', 'Revenue ($)', 'Daily Expense ($)', 'Cash ($)', 'Transfer ($)', 'Pending Cups', 'Pending ($)'];
    const rows = sales.map(s => [
        s.date, s.shift, s.employee || '', s.cupsUsed, s.beuCups, s.juicesSold,
        s.amount, s.dailyExpense || 0, s.cash || 0, s.transfer || 0,
        s.pendingCups || 0, (s.pendingCups || 0) * 170
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`maraki_sales_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

function exportExpensesCSV(expenses) {
    const headers = ['Date', 'Category', 'Description', 'Amount ($)'];
    const rows = expenses.map(e => [e.date, e.category, `"${e.description || ''}"`, e.amount]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(`maraki_expenses_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

// ─── Main Component ───
export default function FinancialTracker({ store }) {
    const { sales, expenses, inventory, usage, actions } = store;
    const [activeView, setActiveView] = useState('sales');
    const [resolvingSale, setResolvingSale] = useState(null);
    const [dateFilter, setDateFilter] = useState('all');

    const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);
    const filteredSales = useMemo(() => filterByDate(sales, dateRange), [sales, dateRange]);
    const filteredExpenses = useMemo(() => filterByDate(expenses, dateRange), [expenses, dateRange]);
    const filteredUsage = useMemo(() => filterByDate(usage || [], dateRange), [usage, dateRange]);

    const filterButtons = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
        { id: 'all', label: 'All Time' },
    ];

    return (
        <div className="flex-col gap-6">

            <div className="flex justify-between items-center glass-panel" style={{ padding: '1.5rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={24} color="var(--accent-green)" />
                        Financial Tracker
                    </h2>
                    <p style={{ marginTop: '0.25rem' }}>Log your daily sales and operational expenses.</p>
                </div>

                <div className="flex gap-2" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '12px' }}>
                    <button
                        onClick={() => setActiveView('sales')}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: activeView === 'sales' ? 'var(--accent-green)' : 'transparent',
                            color: activeView === 'sales' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        <Droplet size={18} /> Sales
                    </button>
                    <button
                        onClick={() => setActiveView('expenses')}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: activeView === 'expenses' ? 'var(--accent-purple)' : 'transparent',
                            color: activeView === 'expenses' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        <TrendingDown size={18} /> Expenses
                    </button>
                    <button
                        onClick={() => setActiveView('usage')}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: activeView === 'usage' ? 'var(--accent-orange)' : 'transparent',
                            color: activeView === 'usage' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        <Droplet size={18} /> Usage
                    </button>
                    {activeView === 'sales' && (
                        <>
                            <button
                                onClick={() => window.print()}
                                className="print-hide"
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'white', color: 'black', marginLeft: '0.5rem'
                                }}
                            >
                                <Printer size={18} /> Print
                            </button>
                            <button
                                onClick={() => exportSalesCSV(filteredSales)}
                                className="print-hide"
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'var(--accent-blue)', color: 'white'
                                }}
                            >
                                <Download size={18} /> CSV
                            </button>
                        </>
                    )}
                    {activeView === 'expenses' && (
                        <button
                            onClick={() => exportExpensesCSV(filteredExpenses)}
                            className="print-hide"
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'var(--accent-blue)', color: 'white', marginLeft: '0.5rem'
                            }}
                        >
                            <Download size={18} /> CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Date Filter Bar */}
            <div className="flex items-center gap-3 print-hide" style={{ flexWrap: 'wrap' }}>
                <Calendar size={18} color="var(--text-secondary)" />
                {filterButtons.map(btn => (
                    <button
                        key={btn.id}
                        onClick={() => setDateFilter(btn.id)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '500',
                            background: dateFilter === btn.id ? 'var(--accent-orange)' : 'rgba(255,255,255,0.08)',
                            color: dateFilter === btn.id ? 'white' : 'var(--text-secondary)',
                            border: dateFilter === btn.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

                {/* Entry Form */}
                <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    {activeView === 'sales' ? (
                        <SaleForm onAdd={actions.addSale} inventory={inventory} />
                    ) : activeView === 'expenses' ? (
                        <ExpenseForm onAdd={actions.addExpense} />
                    ) : (
                        <UsageForm onAdd={actions.addUsage} inventory={inventory} />
                    )}
                </div>

                {/* History List */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex items-center gap-2 mb-4" style={{ marginBottom: '1.5rem' }}>
                        <List size={20} color="var(--text-secondary)" />
                        <h3>
                            {activeView === 'sales'
                                ? 'Recent Sales'
                                : activeView === 'expenses'
                                ? 'Recent Expenses'
                                : 'Recent Usage'}
                        </h3>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {activeView === 'sales'
                                ? filteredSales.length
                                : activeView === 'expenses'
                                ? filteredExpenses.length
                                : filteredUsage.length}{' '}
                            records
                        </span>
                    </div>

                    <div className="flex-col gap-3">
                        {activeView === 'sales' ? (
                            filteredSales.length === 0 ? <p className="text-muted">No sales logged for this period.</p> :
                                filteredSales.map(sale => (
                                    <div key={sale.id} className="flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p style={{ fontWeight: '500' }}>{sale.juicesSold} Juices Sold</p>
                                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{sale.shift} Shift</span>
                                                {sale.employee && (
                                                    <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.2)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <User size={12} /> {sale.employee}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{sale.date} • {sale.cupsUsed} Cups Used, {sale.beuCups} Beu</p>
                                            <div className="flex gap-4 mt-1" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Cash: <strong style={{ color: 'var(--text-primary)' }}>${sale.cash || 0}</strong></span>
                                                <span style={{ color: 'var(--text-secondary)' }}>Transfer: <strong style={{ color: 'var(--text-primary)' }}>${sale.transfer || 0}</strong></span>
                                                {(sale.pendingCups || 0) > 0 && <span style={{ color: 'var(--accent-orange)' }}>Pending: <strong>{sale.pendingCups} cups (${(sale.pendingCups * 170).toLocaleString()})</strong></span>}
                                                {sale.dailyExpense > 0 && <span style={{ color: 'var(--accent-purple)' }}>Shift Expense: <strong>${sale.dailyExpense}</strong></span>}
                                            </div>
                                        </div>
                                        <div className="flex-col items-end gap-2">
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                                +${(sale.amount || 0).toFixed(2)}
                                            </div>
                                            {(sale.pendingCups || 0) > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setResolvingSale(sale)}
                                                    style={{
                                                        background: 'var(--accent-orange)', color: 'white',
                                                        fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                                                    }}
                                                >
                                                    Resolve Pending
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                        ) : activeView === 'expenses' ? (
                            filteredExpenses.length === 0 ? (
                                <p className="text-muted">No expenses logged for this period.</p>
                            ) : (
                                filteredExpenses.map(exp => (
                                    <div
                                        key={exp.id}
                                        className="flex justify-between items-center"
                                        style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p style={{ fontWeight: '500' }}>{exp.category}</p>
                                                <span
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                    }}
                                                >
                                                    {exp.description}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exp.date}</p>
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                                            -${exp.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : filteredUsage.length === 0 ? (
                            <p className="text-muted">No usage logged for this period.</p>
                        ) : (
                            filteredUsage.map(entry => {
                                const item = (inventory || []).find(i => i.id === entry.itemId);
                                return (
                                    <div
                                        key={entry.id}
                                        className="flex justify-between items-center"
                                        style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p style={{ fontWeight: '500' }}>
                                                    {item ? `${item.name} (${item.unit})` : 'Item removed'}
                                                </p>
                                                <span
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                    }}
                                                >
                                                    {entry.category}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {entry.date} • {entry.quantity} {item?.unit || ''}
                                            </p>
                                            {entry.note && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {entry.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {resolvingSale && (
                <PendingPaymentModal
                    sale={resolvingSale}
                    onClose={() => setResolvingSale(null)}
                    onResolve={(payData) => {
                        actions.resolvePendingSale(resolvingSale.id, payData);
                        setResolvingSale(null);
                    }}
                />
            )}

            {/* Print Only View */}
            <DailyReportPrintView sales={sales} />

        </div>
    );
}

// ─── Sale Form ───
function SaleForm({ onAdd, inventory }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [shift, setShift] = useState('Day');
    const [employee, setEmployee] = useState('');
    const [cupsUsed, setCupsUsed] = useState('');
    const [beuCups, setBeuCups] = useState('');
    const [pendingCups, setPendingCups] = useState('');
    const [showIngredients, setShowIngredients] = useState(false);

    // Ingredient usage tracking: { itemId: quantity }
    const [ingredientUsage, setIngredientUsage] = useState({});

    // Payment Fields
    const [cash, setCash] = useState('');
    const [transfer, setTransfer] = useState('');
    const [dailyExpense, setDailyExpense] = useState('');

    // Items available for ingredient picking (exclude cups — auto-handled)
    const pickableItems = (inventory || []).filter(i => i.id !== 'cups' && i.id !== 'lids' && i.id !== 'straws' && i.id !== 'napkins');

    const updateIngredient = (id, value) => {
        setIngredientUsage(prev => {
            const num = Number(value);
            if (!num || num <= 0) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }
            return { ...prev, [id]: num };
        });
    };

    const juicesSold = Math.max(0, (Number(cupsUsed) || 0) - (Number(beuCups) || 0));
    const amount = juicesSold * 170;
    const expenseNum = Number(dailyExpense) || 0;
    const pendingCupsNum = Number(pendingCups) || 0;
    const pendingAmount = pendingCupsNum * 170;
    const expectedFromWorker = Math.max(0, amount - expenseNum - pendingAmount);

    const cashNum = Number(cash) || 0;
    const transferNum = Number(transfer) || 0;
    const totalPaid = cashNum + transferNum;

    const ingredientCount = Object.keys(ingredientUsage).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            date,
            shift,
            employee: employee.trim(),
            cupsUsed: Number(cupsUsed),
            beuCups: Number(beuCups),
            juicesSold,
            amount,
            cash: cashNum,
            transfer: transferNum,
            pendingCups: pendingCupsNum,
            dailyExpense: expenseNum,
            ingredientsUsed: { ...ingredientUsage }
        });
        setCupsUsed('');
        setBeuCups('');
        setCash('');
        setTransfer('');
        setDailyExpense('');
        setPendingCups('');
        setEmployee('');
        setIngredientUsage({});
        setShowIngredients(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex-col gap-4">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-green)' }}>Log New Sale</h3>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Date</label>
                    <input
                        className="input-field" type="date" required
                        value={date} onChange={e => setDate(e.target.value)}
                    />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Shift</label>
                    <select className="input-field" value={shift} onChange={e => setShift(e.target.value)}>
                        <option value="Day">Day</option>
                        <option value="Night">Night</option>
                    </select>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={14} /> Employee Name
                </label>
                <input
                    className="input-field" type="text"
                    value={employee} onChange={e => setEmployee(e.target.value)}
                    placeholder="e.g. Abebe, Sara"
                />
            </div>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Cups Used</label>
                    <input
                        className="input-field" type="number" required min="1"
                        value={cupsUsed} onChange={e => setCupsUsed(e.target.value)}
                    />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Beu Cups (Wasted/Defect)</label>
                    <input
                        className="input-field" type="number" required min="0"
                        value={beuCups} onChange={e => setBeuCups(e.target.value)}
                    />
                </div>
            </div>

            {/* Calculated Revenue Box */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Calculated Revenue Target</p>
                <div className="flex justify-between items-center" style={{ marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: '500' }}>{juicesSold} Juices × $170</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                        ${amount.toFixed(2)}
                    </span>
                </div>
                {(expenseNum > 0 || pendingCupsNum > 0) && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}>
                        {expenseNum > 0 && (
                            <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--accent-purple)' }}>− Daily Expense</span>
                                <span style={{ color: 'var(--accent-purple)' }}>-${expenseNum}</span>
                            </div>
                        )}
                        {pendingCupsNum > 0 && (
                            <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--accent-orange)' }}>− Pending ({pendingCupsNum} cups × $170)</span>
                                <span style={{ color: 'var(--accent-orange)' }}>-${pendingAmount}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontWeight: 'bold' }}>Expected from Worker</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>${expectedFromWorker.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Pending Cups (Unpaid)</label>
                    <input
                        className="input-field" type="number" min="0"
                        value={pendingCups} onChange={e => setPendingCups(e.target.value)}
                        placeholder="0"
                    />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label" style={{ color: 'var(--accent-purple)' }}>Shift Expense</label>
                    <input
                        className="input-field" type="number" min="0" step="0.01"
                        value={dailyExpense} onChange={e => setDailyExpense(e.target.value)}
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Cash Received</label>
                    <input
                        className="input-field" type="number" min="0" step="0.01"
                        value={cash} onChange={e => setCash(e.target.value)}
                        placeholder="0"
                    />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Transfer Received</label>
                    <input
                        className="input-field" type="number" min="0" step="0.01"
                        value={transfer} onChange={e => setTransfer(e.target.value)}
                        placeholder="0"
                    />
                </div>
            </div>

            {totalPaid > expectedFromWorker && expectedFromWorker > 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>
                    Note: Total paid exceeds expected amount (Tip/Extra).
                </p>
            )}

            <button
                type="submit" className="flex items-center justify-center gap-2"
                style={{ background: 'var(--accent-green)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', marginTop: '0.5rem' }}
            >
                <Plus size={18} /> Add Sale
            </button>
        </form>
    );
}

// ─── Expense Form ───
function ExpenseForm({ onAdd }) {
    const [category, setCategory] = useState('Restock');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            date: new Date().toISOString().split('T')[0],
            category,
            amount: Number(amount),
            description
        });
        setAmount('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex-col gap-4">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-purple)' }}>Log New Expense</h3>
            <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Restock">Ingredient Restock</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Rent/Utilities">Rent/Utilities</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Misc">Misc</option>
                </select>
            </div>
            <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <input
                    className="input-field" type="text" placeholder="e.g., Bought oranges from market"
                    value={description} onChange={e => setDescription(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label className="input-label">Amount ($)</label>
                <input
                    className="input-field" type="number" required min="0" step="0.01"
                    value={amount} onChange={e => setAmount(e.target.value)}
                />
            </div>
            <button
                type="submit" className="flex items-center justify-center gap-2"
                style={{ background: 'var(--accent-purple)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', marginTop: '1rem' }}
            >
                <Plus size={18} /> Add Expense
            </button>
        </form>
    );
}

// ─── Usage Form ───
function UsageForm({ onAdd, inventory }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [itemId, setItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('Ingredients');
    const [note, setNote] = useState('');

    const usableItems = (inventory || []).filter(i => i.id !== 'cups' && i.id !== 'lids' && i.id !== 'straws' && i.id !== 'napkins');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!itemId) return;

        onAdd({
            date,
            itemId,
            quantity: Number(quantity),
            category,
            note: note.trim(),
        });

        setQuantity('');
        setNote('');
    };

    const selectedItem = usableItems.find(i => i.id === itemId);

    return (
        <form onSubmit={handleSubmit} className="flex-col gap-4">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-orange)' }}>Log Daily Usage</h3>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Date</label>
                    <input
                        className="input-field"
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Item</label>
                <select
                    className="input-field"
                    required
                    value={itemId}
                    onChange={e => setItemId(e.target.value)}
                >
                    <option value="">Select item...</option>
                    {usableItems.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.emoji} {item.name} ({item.totalStock - item.used - item.wasted} {item.unit} left)
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Quantity Used</label>
                    <input
                        className="input-field"
                        type="number"
                        required
                        min="0.1"
                        step="0.1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                    />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Usage Type</label>
                    <select
                        className="input-field"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="Ingredients">Ingredients for Orders</option>
                        <option value="Staff Drink">Staff Drink</option>
                        <option value="Free Sample">Free Sample</option>
                        <option value="Waste">Spoiled / Waste</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {selectedItem && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Current available: <strong>{Math.max(0, selectedItem.totalStock - selectedItem.used - selectedItem.wasted)} {selectedItem.unit}</strong>
                </p>
            )}

            <div className="input-group">
                <label className="input-label">Note (Optional)</label>
                <input
                    className="input-field"
                    type="text"
                    placeholder="e.g., Staff drink for night shift"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="flex items-center justify-center gap-2"
                style={{
                    background: 'var(--accent-orange)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    marginTop: '0.5rem',
                }}
            >
                <Plus size={18} /> Add Usage
            </button>
        </form>
    );
}

// ─── Pending Payment Modal (Cups-Based) ───
function PendingPaymentModal({ sale, onClose, onResolve }) {
    const [method, setMethod] = useState('Cash');
    const [cupsBack, setCupsBack] = useState(sale.pendingCups.toString());

    const cupsNum = Math.min(Number(cupsBack) || 0, sale.pendingCups);
    const amountBack = cupsNum * 170;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cupsNum <= 0) return;

        const isCash = method === 'Cash';
        onResolve({
            cupsResolved: cupsNum,
            cash: isCash ? amountBack : 0,
            transfer: !isCash ? amountBack : 0
        });
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="glass-panel w-full" style={{ padding: '2rem', maxWidth: '400px', borderTop: '3px solid var(--accent-orange)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-orange)' }}>Resolve Pending Payment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    This sale has <strong>{sale.pendingCups} pending cups</strong> (${(sale.pendingCups * 170).toLocaleString()}).
                    How many cups are being paid back?
                </p>

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label">Cups Paying Back</label>
                        <input
                            className="input-field" type="number" required min="1" max={sale.pendingCups}
                            value={cupsBack} onChange={e => setCupsBack(e.target.value)}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            = <strong style={{ color: 'var(--accent-green)' }}>${amountBack.toLocaleString()}</strong> ({cupsNum} × $170)
                        </p>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Payment Method</label>
                        <select className="input-field" value={method} onChange={e => setMethod(e.target.value)}>
                            <option value="Cash">Cash</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                    </div>

                    <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' }}>
                            Cancel
                        </button>
                        <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent-orange)', color: 'white', fontWeight: 'bold' }}>
                            Pay {cupsNum} Cups
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Print View ───
function DailyReportPrintView({ sales }) {
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(s => s.date === today);

    const metrics = todaysSales.reduce((acc, sale) => {
        acc.totalRevenue += Number(sale.amount) || 0;
        acc.totalCash += Number(sale.cash) || 0;
        acc.totalTransfer += Number(sale.transfer) || 0;
        acc.totalPendingCups += Number(sale.pendingCups) || 0;
        acc.totalCups += Number(sale.cupsUsed) || 0;
        acc.totalBeu += Number(sale.beuCups) || 0;
        acc.totalExpense += Number(sale.dailyExpense) || 0;

        if (sale.shift === 'Day') acc.dayCups += Number(sale.cupsUsed) || 0;
        if (sale.shift === 'Night') acc.nightCups += Number(sale.cupsUsed) || 0;

        return acc;
    }, { totalRevenue: 0, totalCash: 0, totalTransfer: 0, totalPendingCups: 0, totalCups: 0, totalBeu: 0, totalExpense: 0, dayCups: 0, nightCups: 0 });

    const totalPendingAmount = metrics.totalPendingCups * 170;

    return (
        <div className="print-show" style={{ display: 'none', padding: '2rem', color: 'black' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/maraki-logo.png" alt="Logo" style={{ height: '50px' }} />
                    <h1 style={{ margin: 0, color: 'black' }}>Maraki Juice</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, color: 'black' }}>Daily Income Report</h2>
                    <p style={{ margin: 0, color: 'black' }}>Date: {new Date(today).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Metrics Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>Total Expected Revenue</p>
                    <h2 style={{ margin: '0.5rem 0 0 0' }}>${metrics.totalRevenue.toFixed(2)}</h2>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>Cash Received</p>
                    <h2 style={{ margin: '0.5rem 0 0 0' }}>${metrics.totalCash.toFixed(2)}</h2>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>Transfers Received</p>
                    <h2 style={{ margin: '0.5rem 0 0 0' }}>${metrics.totalTransfer.toFixed(2)}</h2>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>Pending ({metrics.totalPendingCups} cups)</p>
                    <h2 style={{ margin: '0.5rem 0 0 0', color: totalPendingAmount > 0 ? 'red' : 'black' }}>${totalPendingAmount.toFixed(2)}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: '#ffe4e6' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>Total Shift Expenses</p>
                    <h2 style={{ margin: '0.5rem 0 0 0', color: '#e11d48' }}>${metrics.totalExpense.toFixed(2)}</h2>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: '#ecfdf5' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>Net Cash in Register (Cash - Expense)</p>
                    <h2 style={{ margin: '0.5rem 0 0 0', color: '#059669' }}>${(metrics.totalCash - metrics.totalExpense).toFixed(2)}</h2>
                </div>
            </div>

            {/* Inventory Usage */}
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Inventory Usage</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Total Cups Used</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Day Shift Cups</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Night Shift Cups</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Wasted (Beu) Cups</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '0.75rem', border: '1px solid #ccc', fontWeight: 'bold' }}>{metrics.totalCups}</td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>{metrics.dayCups}</td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>{metrics.nightCups}</td>
                        <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>{metrics.totalBeu}</td>
                    </tr>
                </tbody>
            </table>

            {/* Detailed Log */}
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Shift Logs</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Shift</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Employee</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Cups - Beu</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Total $</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Cash</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Transfer</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Expense</th>
                        <th style={{ padding: '0.75rem', border: '1px solid #ccc' }}>Pending Cups</th>
                    </tr>
                </thead>
                <tbody>
                    {todaysSales.length === 0 ? (
                        <tr><td colSpan="8" style={{ padding: '1rem', textAlign: 'center', border: '1px solid #ccc' }}>No sales logged today.</td></tr>
                    ) : (
                        todaysSales.map(sale => (
                            <tr key={sale.id}>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>{sale.shift}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>{sale.employee || '—'}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>{sale.cupsUsed} - {sale.beuCups}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc', fontWeight: 'bold' }}>${sale.amount.toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>${(sale.cash || 0).toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc' }}>${(sale.transfer || 0).toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc', color: 'red' }}>${(sale.dailyExpense || 0).toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #ccc', color: (sale.pendingCups || 0) > 0 ? 'red' : 'inherit' }}>
                                    {sale.pendingCups || 0} cups
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '0.5rem' }}>Manager Signature</div>
                <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '0.5rem' }}>Date</div>
            </div>
        </div>
    );
}
