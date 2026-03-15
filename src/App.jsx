import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import FinancialTracker from './components/FinancialTracker';
import Analytics from './components/Analytics';
import Auth from './components/Auth';
import { useStore } from './hooks/useStore';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const store = useStore();

  if (!store.currentUser) {
    return <Auth onLogin={store.actions.login} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard store={store} />;
      case 'inventory':
        return <InventoryManager store={store} />;
      case 'financials':
        return <FinancialTracker store={store} />;
      case 'analytics':
        return <Analytics store={store} />;
      case 'settings':
        return (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Settings Coming Soon</h2>
          </div>
        );
      default:
        return <Dashboard store={store} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} store={store}>
      {renderContent()}
    </Layout>
  );
}

export default App;
