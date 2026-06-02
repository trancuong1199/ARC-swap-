import { useState, useEffect, useCallback } from 'react';
import { SwapWidget } from './components/SwapWidget';
import { NetworkStats } from './components/NetworkStats';
import { ArcAppKit } from './components/ArcAppKit';
import { Faucet } from './components/Faucet';
import { Logs } from './components/Logs';
import { Analytics } from './components/Analytics';
import { CircleSmartContracts } from './components/CircleSmartContracts';
import { Activity, Layers, Repeat, Wallet } from 'lucide-react';

type ViewState = 'swap' | 'logs' | 'analytics' | 'faucet' | 'contracts';

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

function getInitialView(): ViewState {
  const path = window.location.pathname.replace(/^\//, '');
  const validViews: ViewState[] = ['swap', 'logs', 'analytics', 'faucet', 'contracts'];
  if (validViews.includes(path as ViewState)) {
    return path as ViewState;
  }
  return 'swap';
}

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    window.history.pushState({}, '', `/${view === 'swap' ? '' : view}`);
  };
  const [activeWidget, setActiveWidget] = useState<'lifi' | 'native'>('native');
  const [address, setAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<any>(null);
  // const [availableWallets, setAvailableWallets] = useState<EIP6963ProviderDetail[]>([]);

  // EIP-6963: Listen for wallets announcing themselves
  useEffect(() => {
    const discovered: EIP6963ProviderDetail[] = [];

    const handleAnnounce = async (event: any) => {
      const detail: EIP6963ProviderDetail = event.detail;
      console.log('Discovered wallet:', detail.info.name, detail.info.rdns);
      // Avoid duplicates
      if (!discovered.find(w => w.info.uuid === detail.info.uuid)) {
        discovered.push(detail);

        // Auto-select MetaMask if found
        if (detail.info.rdns === 'io.metamask' || detail.info.name.toLowerCase().includes('metamask')) {
          console.log('Auto-selecting MetaMask provider');
          setWalletProvider(detail.provider);

          // Auto-connect if previously connected
          try {
            const accounts = await detail.provider.request({ method: 'eth_accounts' });
            if (Array.isArray(accounts) && accounts.length > 0) {
              setAddress(accounts[0]);
            }
          } catch (e) { }
        }
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounce);
    };
  }, []);

  // Fallback: Attempt to auto-connect with window.ethereum if EIP-6963 is slow or missing
  useEffect(() => {
    const attemptAutoConnect = async () => {
      try {
        const eth = (window as any).ethereum;
        if (eth && !walletProvider) {
          const accounts = await eth.request({ method: 'eth_accounts' });
          if (Array.isArray(accounts) && accounts.length > 0) {
            setAddress(accounts[0]);
          }
        }
      } catch (err) { }
    };
    // Delay slightly to give EIP-6963 precedence
    setTimeout(attemptAutoConnect, 500);
  }, [walletProvider]);

  // Fallback: if EIP-6963 found nothing, fall back to window.ethereum
  const getFallbackProvider = useCallback(() => {
    const eth = (window as any).ethereum;
    if (!eth) return null;
    // If providers array exists, try to find MetaMask
    if (Array.isArray(eth.providers)) {
      const mm = eth.providers.find((p: any) => p.isMetaMask === true);
      return mm || eth.providers[0];
    }
    return eth;
  }, []);

  const getProvider = useCallback((): any => {
    if (walletProvider) return walletProvider;
    return getFallbackProvider();
  }, [walletProvider, getFallbackProvider]);

  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      alert('No wallet extension found.\n\nPlease install MetaMask from metamask.io and refresh the page.');
      return;
    }

    console.log('Connecting with provider:', provider);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      console.log('Accounts:', accounts);
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAddress(accounts[0]);
      } else {
        alert('No accounts returned. Please unlock MetaMask first.');
      }
    } catch (err: any) {
      console.error('Connect error:', err);
      if (err.code === 4001) {
        // User rejected
        alert('Connection rejected. Please click "Connect Wallet" and approve in MetaMask.');
      } else {
        alert(`Connection failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar animate-fade-in">
        <div className="nav-brand" onClick={() => navigateTo('swap')} style={{ cursor: 'pointer' }}>
          <Activity color="#3b82f6" />
          ARC Finance Studio
        </div>

        <div className="nav-links">
          <a
            className={`nav-link ${currentView === 'swap' ? 'active' : ''}`}
            onClick={() => navigateTo('swap')}
          >
            Swap
          </a>
          <a
            className={`nav-link ${currentView === 'logs' ? 'active' : ''}`}
            onClick={() => navigateTo('logs')}
          >
            API Logs
          </a>
          <a
            className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => navigateTo('analytics')}
          >
            Analytics
          </a>
          <a
            className={`nav-link ${currentView === 'faucet' ? 'active' : ''}`}
            onClick={() => navigateTo('faucet')}
          >
            Faucet
          </a>
          <a
            className={`nav-link ${currentView === 'contracts' ? 'active' : ''}`}
            onClick={() => navigateTo('contracts')}
          >
            Contracts
          </a>
        </div>

        <div className="header-controls">
          <div className="status-pulse">
            <div className="pulse-dot"></div>
            Arc Testnet
          </div>
          <button onClick={connectWallet} className="wallet-button">
            <Wallet size={16} />
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      {currentView === 'swap' && (
        <main className="main-grid">
          <NetworkStats connectedAccount={address} />

          <div className="widget-switcher-container">
            <div className="glass-panel widget-switcher">
              <button
                onClick={() => setActiveWidget('native')}
                className={`switcher-btn ${activeWidget === 'native' ? 'active' : ''}`}
              >
                <Layers size={18} />
                Native Arc
              </button>
              <button
                onClick={() => setActiveWidget('lifi')}
                className={`switcher-btn ${activeWidget === 'lifi' ? 'active' : ''}`}
              >
                <Repeat size={18} />
                Universal (LI.FI)
              </button>
            </div>

            <div className="animate-fade-in">
              {activeWidget === 'native'
                ? <ArcAppKit connectedAccount={address} getProvider={getProvider} />
                : <SwapWidget />}
            </div>
          </div>
        </main>
      )}

      {currentView === 'logs' && (
        <main className="page-view">
          <Logs />
        </main>
      )}

      {currentView === 'analytics' && (
        <main className="page-view">
          <Analytics />
        </main>
      )}

      {currentView === 'faucet' && (
        <main className="page-view">
          <Faucet connectedAccount={address} />
        </main>
      )}

      {currentView === 'contracts' && (
        <main className="page-view">
          <CircleSmartContracts />
        </main>
      )}
    </div>
  );
}

export default App;
