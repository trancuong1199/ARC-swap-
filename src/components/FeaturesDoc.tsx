import { Activity, Layers, Wallet, Droplets, FileCode2, BarChart3, Receipt, ExternalLink } from 'lucide-react';
import React from 'react';

export const FeaturesDoc: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)', lineHeight: '1.6' }}>
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', marginBottom: '1rem', color: 'var(--brand-primary)' }}>
          <Activity size={36} />
          ARC Finance Studio Features
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          Welcome to ARC Finance Studio! This documentation provides an overview of all the features available in our platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Swap Feature */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Layers size={28} color="#3b82f6" />
            <h3 style={{ margin: 0 }}>Swap & Exchange</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Seamlessly exchange tokens across different networks.
            <ul>
              <li><strong>Native Arc:</strong> Fast and low-cost swaps directly on the Arc network.</li>
              <li><strong>Universal (LI.FI):</strong> Cross-chain bridging and swapping powered by LI.FI for ultimate liquidity.</li>
            </ul>
          </p>
        </div>

        {/* Payments Feature */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Receipt size={28} color="#10b981" />
            <h3 style={{ margin: 0 }}>Payments</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Send and receive stablecoin payments securely. We integrate with <strong>Circle</strong> to provide enterprise-grade USDC transfers, making cross-border payments instant and extremely cheap.
          </p>
        </div>

        {/* Analytics Feature */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <BarChart3 size={28} color="#f59e0b" />
            <h3 style={{ margin: 0 }}>Analytics</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track the pulse of the market. View real-time charts, network statistics, trading volumes, and token price histories all in one comprehensive dashboard.
          </p>
        </div>

        {/* API Logs Feature */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Activity size={28} color="#8b5cf6" />
            <h3 style={{ margin: 0 }}>API Logs</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            For developers and power users. Monitor your on-chain interactions, RPC requests, and transaction statuses in real-time to debug and trace your Web3 activities.
          </p>
        </div>

        {/* Faucet Feature */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Droplets size={28} color="#06b6d4" />
            <h3 style={{ margin: 0 }}>Testnet Faucet</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Get started on the Arc Testnet without spending real money. Request free test tokens directly to your wallet to try out swaps, payments, and smart contracts risk-free.
          </p>
        </div>

        {/* Contracts Feature */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <FileCode2 size={28} color="#ef4444" />
            <h3 style={{ margin: 0 }}>Smart Contracts</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Interact directly with deployed smart contracts. This includes managing Circle CCTP (Cross-Chain Transfer Protocol) contracts and verifying your token allowances and permissions.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Wallet size={48} color="#3b82f6" style={{ flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Multi-Wallet Support</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              ARC Finance Studio seamlessly connects with your favorite Web3 wallets. We support the latest EIP-6963 standard, which automatically detects all installed wallets (like MetaMask, OKX, Phantom, etc.) so you can choose exactly which one to connect with.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <ExternalLink size={48} color="#10b981" style={{ flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Official ARC Resources</h2>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
              Learn more about the ARC ecosystem and how to integrate with our protocols:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="https://docs.arc.io/" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={16} /> Official ARC Documentation
              </a>
              <a href="https://docs.arc.io/arc-chain" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={16} /> ARC Chain Details
              </a>
              <a href="https://docs.arc.io/integrate" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={16} /> Integration Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
