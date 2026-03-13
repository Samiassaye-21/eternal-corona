import React, { useState, useMemo } from 'react';
import { Plus, Package, Trash2, CheckSquare, AlertTriangle, Search, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

const CATEGORIES = ['All', 'Fruits', 'Drinks & Extras', 'Supplies'];

export default function InventoryManager({ store }) {
    const { inventory, actions } = store;
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [newItem, setNewItem] = useState({ name: '', category: 'Fruits', unit: 'kg', totalStock: 0 });

    // Filter and group
    const filteredItems = useMemo(() => {
        let items = inventory;
        if (activeCategory !== 'All') {
            items = items.filter(i => i.category === activeCategory);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(term));
        }
        return items;
    }, [inventory, activeCategory, searchTerm]);

    // Stats
    const lowStockItems = inventory.filter(item => {
        const available = item.totalStock - item.used - item.wasted;
        return available > 0 && available <= (item.lowThreshold || 5);
    });

    const outOfStockItems = inventory.filter(item => {
        const available = item.totalStock - item.used - item.wasted;
        return available <= 0;
    });

    const totalItemsTracked = inventory.length;
    const totalAvailable = inventory.reduce((sum, i) => sum + Math.max(0, i.totalStock - i.used - i.wasted), 0);

    const handleAddNewSubmit = (e) => {
        e.preventDefault();
        actions.addInventoryItem({
            ...newItem,
            totalStock: Number(newItem.totalStock)
        });
        setIsAddingNew(false);
        setNewItem({ name: '', category: 'Fruits', unit: 'kg', totalStock: 0 });
    };

    // Group items by category
    const groupedItems = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [filteredItems]);

    return (
        <div className="flex-col gap-6">

            {/* Header */}
            <div className="flex justify-between items-center glass-panel" style={{ padding: '1.5rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={24} color="var(--accent-orange)" />
                        Store Inventory
                    </h2>
                    <p style={{ marginTop: '0.25rem' }}>Manage your fruits, drinks, cups & supplies — see what's in stock at a glance.</p>
                </div>

                <button
                    className="flex items-center gap-2"
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    style={{
                        background: isAddingNew ? 'rgba(255,255,255,0.1)' : 'var(--accent-orange)',
                        padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '500'
                    }}
                >
                    <Plus size={18} /> {isAddingNew ? 'Cancel' : 'Add Custom Item'}
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid var(--accent-blue)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Items Tracked</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>{totalItemsTracked}</p>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid var(--accent-green)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>In Stock</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem', color: 'var(--accent-green)' }}>
                        {inventory.filter(i => (i.totalStock - i.used - i.wasted) > 0).length} items
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid var(--accent-orange)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Low Stock</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem', color: 'var(--accent-orange)' }}>
                        {lowStockItems.length} items
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '3px solid var(--accent-red)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Out of Stock</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem', color: 'var(--accent-red)' }}>
                        {outOfStockItems.length} items
                    </p>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div style={{
                    padding: '1rem 1.5rem', borderRadius: '12px',
                    background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'
                }}>
                    <AlertTriangle size={20} color="var(--accent-orange)" />
                    <span style={{ fontWeight: '600', color: 'var(--accent-orange)' }}>Low Stock Alert:</span>
                    {lowStockItems.map(item => (
                        <span key={item.id} style={{
                            fontSize: '0.85rem', background: 'rgba(249, 115, 22, 0.2)',
                            padding: '0.2rem 0.6rem', borderRadius: '12px', color: 'var(--accent-orange)'
                        }}>
                            {item.emoji} {item.name} ({(item.totalStock - item.used - item.wasted)} {item.unit} left)
                        </span>
                    ))}
                </div>
            )}

            {/* Search & Category Filter */}
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                <div className="flex items-center gap-2" style={{
                    background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)', flex: '0 0 260px'
                }}>
                    <Search size={18} color="var(--text-secondary)" />
                    <input
                        type="text" placeholder="Search items..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            background: 'none', border: 'none', outline: 'none',
                            color: 'var(--text-primary)', fontSize: '0.9rem', width: '100%'
                        }}
                    />
                </div>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '500',
                            background: activeCategory === cat ? 'var(--accent-orange)' : 'rgba(255,255,255,0.08)',
                            color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                            border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Add New Item Form */}
            {isAddingNew && (
                <form onSubmit={handleAddNewSubmit} className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Add Custom Item</h3>
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        <div className="input-group" style={{ flex: '1 1 200px' }}>
                            <label className="input-label">Item Name</label>
                            <input
                                className="input-field" required
                                value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="e.g., Strawberry"
                            />
                        </div>
                        <div className="input-group" style={{ flex: '0 0 160px' }}>
                            <label className="input-label">Category</label>
                            <select className="input-field" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                <option value="Fruits">Fruits</option>
                                <option value="Drinks & Extras">Drinks & Extras</option>
                                <option value="Supplies">Supplies</option>
                            </select>
                        </div>
                        <div className="input-group" style={{ flex: '0 0 100px' }}>
                            <label className="input-label">Unit</label>
                            <select className="input-field" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
                                <option value="kg">kg</option>
                                <option value="pcs">pcs</option>
                                <option value="liters">liters</option>
                                <option value="bottles">bottles</option>
                                <option value="packs">packs</option>
                            </select>
                        </div>
                        <div className="input-group" style={{ flex: '0 0 120px' }}>
                            <label className="input-label">Initial Stock</label>
                            <input
                                className="input-field" type="number" required min="0" step="0.1"
                                value={newItem.totalStock} onChange={e => setNewItem({ ...newItem, totalStock: e.target.value })}
                            />
                        </div>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                type="submit"
                                style={{ background: 'var(--accent-orange)', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}
                            >
                                <Plus size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                Add
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Inventory Grid by Category */}
            {Object.keys(groupedItems).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No items found. Try a different search or category.</p>
                </div>
            ) : (
                Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {category} ({items.length})
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {items.map(item => (
                                <InventoryCard
                                    key={item.id}
                                    item={item}
                                    onUpdate={(updates) => actions.updateInventory(item.id, updates)}
                                    onDelete={() => actions.deleteInventoryItem(item.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}

        </div>
    );
}

// ─── Inventory Card Component ───
function InventoryCard({ item, onUpdate, onDelete }) {
    const [quickAmount, setQuickAmount] = useState('');
    const [activeAction, setActiveAction] = useState(null); // 'restock', 'use', 'waste'
    const [showDelete, setShowDelete] = useState(false);

    const available = Math.max(0, item.totalStock - item.used - item.wasted);
    const usagePercent = item.totalStock > 0 ? ((item.used + item.wasted) / item.totalStock) * 100 : 0;
    const isLow = available > 0 && available <= (item.lowThreshold || 5);
    const isOut = available <= 0 && item.totalStock > 0;
    const isEmpty = item.totalStock <= 0;

    const statusColor = isOut ? 'var(--accent-red)' : isLow ? 'var(--accent-orange)' : 'var(--accent-green)';
    const statusLabel = isOut ? 'OUT' : isLow ? 'LOW' : isEmpty ? '—' : 'OK';

    const handleQuickAction = (type) => {
        const amt = Number(quickAmount);
        if (!amt || amt <= 0) return;

        if (type === 'restock') {
            onUpdate({ totalStock: item.totalStock + amt });
        } else if (type === 'use') {
            if (amt <= available) onUpdate({ used: item.used + amt });
            else return;
        } else if (type === 'waste') {
            if (amt <= available) onUpdate({ wasted: item.wasted + amt });
            else return;
        }
        setQuickAmount('');
        setActiveAction(null);
    };

    const handleReset = () => {
        onUpdate({ totalStock: 0, used: 0, wasted: 0 });
        setShowDelete(false);
    };

    return (
        <div
            className="glass-panel"
            style={{
                padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                borderLeft: `3px solid ${statusColor}`,
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
        >
            {/* Top Row: Name + Status */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>{item.emoji || '📦'}</span>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{item.name}</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem',
                    borderRadius: '6px', background: `${statusColor}25`, color: statusColor
                }}>
                    {statusLabel}
                </span>
            </div>

            {/* Stock Bar */}
            <div>
                <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Available: <strong style={{ color: 'var(--text-primary)' }}>{available}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>of {item.totalStock} total</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${item.totalStock > 0 ? (item.used / item.totalStock) * 100 : 0}%`, background: 'var(--accent-orange)', height: '100%', transition: 'width 0.4s ease' }} />
                    <div style={{ width: `${item.totalStock > 0 ? (item.wasted / item.totalStock) * 100 : 0}%`, background: 'var(--accent-red)', height: '100%', transition: 'width 0.4s ease' }} />
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.65rem', marginTop: '0.3rem' }}>
                    <span style={{ color: 'var(--accent-orange)' }}>Used: {item.used}</span>
                    <span style={{ color: 'var(--accent-red)' }}>Wasted: {item.wasted}</span>
                </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                <button
                    onClick={() => setActiveAction(activeAction === 'restock' ? null : 'restock')}
                    title="Restock"
                    style={{
                        flex: 1, padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                        background: activeAction === 'restock' ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                        color: activeAction === 'restock' ? 'white' : 'var(--accent-green)'
                    }}
                >
                    <ArrowUp size={14} /> Restock
                </button>
                <button
                    onClick={() => setActiveAction(activeAction === 'use' ? null : 'use')}
                    title="Use"
                    style={{
                        flex: 1, padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                        background: activeAction === 'use' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.05)',
                        color: activeAction === 'use' ? 'white' : 'var(--accent-orange)'
                    }}
                >
                    <ArrowDown size={14} /> Use
                </button>
                <button
                    onClick={() => setActiveAction(activeAction === 'waste' ? null : 'waste')}
                    title="Waste"
                    style={{
                        flex: 1, padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                        background: activeAction === 'waste' ? 'var(--accent-red)' : 'rgba(255,255,255,0.05)',
                        color: activeAction === 'waste' ? 'white' : 'var(--accent-red)'
                    }}
                >
                    <Trash2 size={14} /> Waste
                </button>
                <button
                    onClick={() => setShowDelete(!showDelete)}
                    title="Reset"
                    style={{
                        padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)'
                    }}
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* Quick Amount Input */}
            {activeAction && (
                <div className="flex items-center gap-2 animate-fade-in" style={{
                    background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px'
                }}>
                    <input
                        type="number" step="0.1" min="0.1" autoFocus
                        value={quickAmount} onChange={e => setQuickAmount(e.target.value)}
                        placeholder={activeAction === 'restock' ? 'Add qty' : 'Qty'}
                        style={{
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white', padding: '0.5rem', borderRadius: '6px', width: '80px',
                            fontSize: '0.9rem', outline: 'none'
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') handleQuickAction(activeAction); }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                    <button
                        onClick={() => handleQuickAction(activeAction)}
                        style={{
                            marginLeft: 'auto',
                            background: activeAction === 'waste' ? 'var(--accent-red)' : activeAction === 'use' ? 'var(--accent-orange)' : 'var(--accent-green)',
                            padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem',
                            color: 'white'
                        }}
                    >
                        Go
                    </button>
                </div>
            )}

            {/* Reset Confirmation */}
            {showDelete && (
                <div className="flex items-center gap-2 animate-fade-in" style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.75rem', borderRadius: '8px'
                }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)' }}>Reset all stock data?</span>
                    <button
                        onClick={handleReset}
                        style={{ marginLeft: 'auto', background: 'var(--accent-red)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => setShowDelete(false)}
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
