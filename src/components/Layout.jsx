import { LayoutDashboard, PackageOpen, DollarSign, BarChart3, Settings } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab, store }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory', icon: PackageOpen },
        { id: 'financials', label: 'Financials', icon: DollarSign },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
        <>
            <aside className="sidebar">
                <div className="app-logo">
                    <img src="/maraki-logo.png" alt="Maraki Juice Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                    <span style={{ marginLeft: '0.25rem' }}>Maraki Juice</span>
                </div>

                <nav className="flex-col gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div>
                        <h1 style={{ textTransform: 'capitalize' }}>{activeTab} Overview</h1>
                        <p>Welcome back! Here's what's happening today.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {store?.currentUser && (
                            <div className="glass-panel" style={{ padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                                <span style={{ opacity: 0.8 }}>Signed in as</span>{' '}
                                <strong>{store.currentUser.name}</strong>
                                {store.currentUser.role ? ` (${store.currentUser.role})` : null}
                            </div>
                        )}
                    </div>
                </header>

                <div className="animate-fade-in" style={{ flex: 1 }}>
                    {/* We will route based on activeTab in App.jsx later, for now Layout wraps children */}
                    {children}
                </div>
            </main>
        </>
    );
}
