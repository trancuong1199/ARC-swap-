import { useState, useEffect } from "react";
import { 
  createAdapterFromMetaMask, 
  createAdapterFromPrivateKey, 
  switchOrAddArcNetwork 
} from "./utils/arcChain";
import { Send } from "./components/Send";
import { Bridge } from "./components/Bridge";
import { Swap } from "./components/Swap";
import { UnifiedBalance } from "./components/UnifiedBalance";

export default function App() {
  const [activeTab, setActiveTab] = useState<"send" | "bridge" | "swap" | "unified" | "settings">("send");
  const [walletAddress, setWalletAddress] = useState("");
  const [nativeBalance, setNativeBalance] = useState("0.00");
  const [isMetaMask, setIsMetaMask] = useState(true);
  const [privateKey, setPrivateKey] = useState("");
  const [kitKey, setKitKey] = useState("");
  const [adapter, setAdapter] = useState<any>(null);
  
  // Custom mock/live balance registry across chains for a realistic unified experience
  const [balancesState, setBalancesState] = useState<Record<string, string>>({
    Arc_Testnet: "100.00",
    Base_Sepolia: "250.00",
    Arbitrum_Sepolia: "50.00",
    Avalanche_Fuji: "0.00",
    Ethereum_Sepolia: "15.50",
  });

  // Query balance via RPC or local mock
  const fetchBalance = async (address: string) => {
    if (window.ethereum && isMetaMask) {
      try {
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        
        // Arc Testnet uses USDC with 18 decimals as native token
        const formatted = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
        setNativeBalance(formatted);
        
        setBalancesState((prev) => ({
          ...prev,
          Arc_Testnet: parseFloat(formatted).toFixed(2),
        }));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    } else {
      // In private key mode, update Arc balance state
      setNativeBalance(balancesState.Arc_Testnet);
    }
  };

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it or use the Private Key input in the Settings tab.");
      return;
    }

    try {
      setIsMetaMask(true);
      // Ensure we are on Arc Testnet first
      await switchOrAddArcNetwork();
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const address = accounts[0];
      setWalletAddress(address);
      
      // Initialize Viem Adapter
      const metamaskAdapter = await createAdapterFromMetaMask();
      setAdapter(metamaskAdapter);
      
      await fetchBalance(address);
    } catch (err: any) {
      console.error("Connection failed:", err);
      alert(err.message || "Failed to connect MetaMask.");
    }
  };

  // Setup private key adapter
  const handlePrivateKeyConnect = () => {
    if (!privateKey) {
      alert("Please enter a valid private key.");
      return;
    }

    try {
      setIsMetaMask(false);
      const pkAdapter = createAdapterFromPrivateKey(privateKey);
      setAdapter(pkAdapter);
      
      // Generate a mock wallet address from private key
      const mockAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setWalletAddress(mockAddress);
      
      // Load balances
      setNativeBalance(balancesState.Arc_Testnet);
      alert("Connected successfully in Developer Mode using Private Key!");
      setActiveTab("send");
    } catch (err: any) {
      console.error(err);
      alert("Failed to initialize wallet: " + err.message);
    }
  };

  // Check if already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsMetaMask(true);
            const mmAdapter = await createAdapterFromMetaMask();
            setAdapter(mmAdapter);
            await fetchBalance(accounts[0]);
          }
        } catch (err) {
          console.error("Silent connect error:", err);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="app-container">
      {/* 1. Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" fill="none"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#fff" strokeWidth="2.5" fill="none"></path>
                <path d="M2 12h20" stroke="#fff" strokeWidth="2.5"></path>
              </svg>
            </div>
            <span className="logo-text">Arc Studio</span>
          </div>

          <nav className="nav-links">
            <div 
              className={`nav-item ${activeTab === "send" ? "active" : ""}`}
              onClick={() => setActiveTab("send")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Send
            </div>

            <div 
              className={`nav-item ${activeTab === "bridge" ? "active" : ""}`}
              onClick={() => setActiveTab("bridge")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Bridge (CCTP)
            </div>

            <div 
              className={`nav-item ${activeTab === "swap" ? "active" : ""}`}
              onClick={() => setActiveTab("swap")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Swap
            </div>

            <div 
              className={`nav-item ${activeTab === "unified" ? "active" : ""}`}
              onClick={() => setActiveTab("unified")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
              </svg>
              Unified Balance
            </div>

            <div 
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Settings
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="network-badge">
            <span className="network-dot"></span>
            Arc Testnet L1
          </div>
        </div>
      </aside>

      {/* 2. Main content dashboard */}
      <main className="main-content">
        <header className="header-bar">
          <div className="welcome-section">
            <h1>Arc Finance Studio</h1>
            <p>Unified Onchain Financial Suite powered by Circle SDKs</p>
          </div>

          <div className="wallet-section">
            {walletAddress ? (
              <div className="wallet-address-box">
                <span className="address">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
                <span className="balance">{parseFloat(nativeBalance).toFixed(4)} USDC (Gas)</span>
              </div>
            ) : (
              <button className="wallet-btn" onClick={connectWallet}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 10h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"></path>
                  <circle cx="17" cy="16" r="1.5"></circle>
                </svg>
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* 3. Panel content routers */}
        {activeTab === "send" && (
          <Send 
            adapter={adapter} 
            userAddress={walletAddress} 
            isMetaMask={isMetaMask} 
            onRefreshBalance={() => fetchBalance(walletAddress)}
          />
        )}

        {activeTab === "bridge" && (
          <Bridge 
            adapter={adapter} 
            userAddress={walletAddress} 
            isMetaMask={isMetaMask} 
            onRefreshBalance={() => fetchBalance(walletAddress)}
          />
        )}

        {activeTab === "swap" && (
          <Swap 
            adapter={adapter} 
            userAddress={walletAddress} 
            isMetaMask={isMetaMask} 
            kitKey={kitKey}
            onRefreshBalance={() => fetchBalance(walletAddress)}
          />
        )}

        {activeTab === "unified" && (
          <UnifiedBalance 
            adapter={adapter} 
            userAddress={walletAddress} 
            isMetaMask={isMetaMask} 
            onRefreshBalance={() => fetchBalance(walletAddress)}
            balancesState={balancesState}
            setBalancesState={setBalancesState}
          />
        )}

        {activeTab === "settings" && (
          <div className="glass-panel">
            <div className="panel-header">
              <h2>Settings & Developer Configs</h2>
              <p>Configure keys, switches, and private keys for automated operations.</p>
            </div>

            <div className="settings-panel">
              <div className="form-group">
                <label className="form-label">Circle Console Kit Key (Swap Key)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Circle Kit Key"
                  value={kitKey}
                  onChange={(e) => setKitKey(e.target.value)}
                />
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
                  A Kit Key from the Circle Developer Console is required to execute actual same-chain token Swaps.
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "1rem 0" }} />

              <h3>Developer Mode (Private Key Connection)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Connect using a plain private key instead of a MetaMask browser extension. Great for local tests and automations.
              </p>

              <div className="form-group">
                <label className="form-label">Private Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="0x..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                className="submit-btn" 
                style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))" }}
                onClick={handlePrivateKeyConnect}
              >
                Connect Developer Adapter
              </button>

              <div className="settings-info">
                💡 <strong>Tip for Testing:</strong> To receive test tokens, visit the official{" "}
                <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
                  Circle Faucet ↗
                </a>{" "}
                and select <strong>Arc Testnet</strong> from the list. Address: {walletAddress || "0xYourWallet"}.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
