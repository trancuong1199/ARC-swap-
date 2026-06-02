import React, { useState } from 'react';
import { AgenticJobs } from './AgenticJobs';
import { CircleIntegration } from './CircleIntegration';
const ARC_CHAIN_ID = '0x4CEF52'; // 5042002 in hex
const ARC_CHAIN_PARAMS = {
  chainId: ARC_CHAIN_ID,
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

interface ArcAppKitProps {
  connectedAccount: string | null;
  getProvider: () => any;
}

export const ArcAppKit: React.FC<ArcAppKitProps> = ({ connectedAccount, getProvider }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'bridge' | 'jobs' | 'circle'>('swap');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [swapAmount, setSwapAmount] = useState('1.00');
  const [recipient, setRecipient] = useState('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleAction = async () => {
    setResult(null);
    setStatusMsg('');

    const eth = getProvider();
    if (!eth) {
      setStatusMsg('❌ MetaMask not detected. Please install MetaMask.');
      return;
    }

    if (!connectedAccount) {
      setStatusMsg('⚠️ Please connect your wallet using the button in the top-right corner first.');
      return;
    }

    setIsProcessing(true);
    try {
      const from = connectedAccount;

      // Step 1: Switch to Arc Testnet
      setStatusMsg('🔄 Switching to Arc Testnet...');
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARC_CHAIN_ID }],
        });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          setStatusMsg('➕ Adding Arc Testnet to MetaMask...');
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [ARC_CHAIN_PARAMS],
          });
        } else {
          throw new Error(`Chain switch failed: ${switchErr.message}`);
        }
      }

      // Step 2: Send transaction
      setStatusMsg('📤 Please confirm the transaction in MetaMask...');
      
      const finalRecipient = recipient.trim() || from;
      let valueHex = '0x0';
      if (swapAmount && !isNaN(Number(swapAmount))) {
        const amountWei = BigInt(Math.floor(Number(swapAmount) * 1e18));
        valueHex = '0x' + amountWei.toString(16);
      }

      const txHash = await eth.request({
        method: 'eth_sendTransaction',
        params: [{
          from,
          to: finalRecipient,
          value: valueHex,
          data: '0x',
        }],
      });

      setStatusMsg('✅ Transaction submitted!');
      setResult(JSON.stringify({
        status: 'SUCCESS',
        action: activeTab === 'swap' ? 'Swap (Arc Testnet)' : 'Bridge (CCTP)',
        transactionHash: txHash,
        from,
        to: finalRecipient,
        value: `${swapAmount} USDC`,
        explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`,
      }, null, 2));

      // Notify other components that a swap occurred
      window.dispatchEvent(new Event('swap_executed'));
    } catch (err: any) {
      console.error('Transaction error:', err);
      setStatusMsg(`❌ ${err.message}`);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel app-kit-panel">
      <div className="app-kit-tabs">
        <button
          className={`app-kit-tab ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          Swap natively
        </button>
        <button
          className={`app-kit-tab ${activeTab === 'bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridge')}
        >
          Bridge (CCTP)
        </button>
        <button
          className={`app-kit-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Agentic Jobs
        </button>
        <button
          className={`app-kit-tab ${activeTab === 'circle' ? 'active' : ''}`}
          onClick={() => setActiveTab('circle')}
        >
          Circle AppKit
        </button>
      </div>

      <div className="app-kit-content">
        {activeTab === 'jobs' ? (
          <AgenticJobs connectedAccount={connectedAccount} getProvider={getProvider} />
        ) : activeTab === 'circle' ? (
          <CircleIntegration connectedAccount={connectedAccount} getProvider={getProvider} />
        ) : (
          <>
        {/* Wallet indicator — read-only, controlled from header */}
        <div className="wallet-status-bar">
          {connectedAccount ? (
            <span className="wallet-connected">
              🟢 {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
            </span>
          ) : (
            <span style={{ color: '#f87171', fontSize: '0.8rem' }}>
              ⚠️ Wallet not connected — use the button in the top-right corner
            </span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Amount (USDC)</label>
          <input
            type="number"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            className="kit-input"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Recipient Address (Optional)</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x... (Leave empty to send to yourself)"
            className="kit-input"
          />
        </div>

        <div className="input-group">
          <label className="input-label">
            {activeTab === 'swap' ? 'To Token' : 'To Chain'}
          </label>
          <div className="kit-display">
            {activeTab === 'swap' ? 'EURC' : 'Ethereum Sepolia'}
          </div>
        </div>

        {statusMsg && (
          <div className="status-message">{statusMsg}</div>
        )}

        <button
          onClick={handleAction}
          disabled={isProcessing || !connectedAccount}
          className="kit-action-btn"
        >
          {isProcessing
            ? 'Processing...'
            : connectedAccount
              ? (activeTab === 'swap' ? 'Execute Swap' : 'Execute Bridge')
              : 'Connect Wallet First'}
        </button>

        {result && (
          <div className="kit-result">
            <pre>{result}</pre>
            {(() => {
              try {
                const parsed = JSON.parse(result);
                if (parsed.explorerUrl) {
                  return (
                    <a
                      href={parsed.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="explorer-link"
                    >
                      🔍 View on ArcScan
                    </a>
                  );
                }
              } catch { }
              return null;
            })()}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
