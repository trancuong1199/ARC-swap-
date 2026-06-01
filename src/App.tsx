import { useState, useEffect, useCallback } from 'react';
import { SwapWidget } from './components/SwapWidget';
import { NetworkStats } from './components/NetworkStats';
import { ArcAppKit } from './components/ArcAppKit';
import { Pools } from './components/Pools';
import { Analytics } from './components/Analytics';
import { Activity, Layers, Repeat, Wallet } from 'lucide-react';

type ViewState = 'swap' | 'pools' | 'analytics';

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

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('swap');
  const [activeWidget, setActiveWidget] = useState<'lifi' | 'native'>('native');
  const [address, setAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<any>(null);
  // const [availableWallets, setAvailableWallets] = useState<EIP6963ProviderDetail[]>([]);

  // EIP-6963: Listen for wallets announcing themselves
  useEffect(() => {
    const discovered: EIP6963ProviderDetail[] = [];

    const handleAnnounce = (event: any) => {
      const detail: EIP6963ProviderDetail = event.detail;
      console.log('Discovered wallet:', detail.info.name, detail.info.rdns);
      // Avoid duplicates
      if (!discovered.find(w => w.info.uuid === detail.info.uuid)) {
        discovered.push(detail);
        // setAvailableWallets([...discovered]);

        // Auto-select MetaMask if found
        if (detail.info.rdns === 'io.metamask' || detail.info.name.toLowerCase().includes('metamask')) {
          console.log('Auto-selecting MetaMask provider');
          setWalletProvider(detail.provider);
        }
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounce);
    // Trigger all installed wallets to announce
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounce);
    };
  }, []);

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
        <div className="nav-brand">
          <Activity color="#3b82f6" />
          ARC Swap
        </div>

        <div className="nav-links">
          <a
            className={`nav-link ${currentView === 'swap' ? 'active' : ''}`}
            onClick={() => setCurrentView('swap')}
          >
            Swap
          </a>
          <a
            className={`nav-link ${currentView === 'pools' ? 'active' : ''}`}
            onClick={() => setCurrentView('pools')}
          >
            Pools
          </a>
          <a
            className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            Analytics
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
          <NetworkStats />

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

      {currentView === 'pools' && (
        <main className="page-view">
          <Pools />
        </main>
      )}

      {currentView === 'analytics' && (
        <main className="page-view">
          <Analytics />
        </main>
      )}
    </div>
  );
}

export default App;
