import React, { useState, useEffect } from "react";
import { AppKit } from "@circle-fin/app-kit";
import { SUPPORTED_CHAINS, switchOrAddNetwork } from "../utils/arcChain";

interface UnifiedBalanceProps {
  adapter: any;
  userAddress: string;
  isMetaMask: boolean;
  onRefreshBalance: () => void;
  balancesState: Record<string, string>;
  setBalancesState: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const CHAIN_NETWORK_DETAILS: Record<string, { chainIdHex: string; chainName: string; rpcUrl: string; symbol: string; decimals: number; explorer: string }> = {
  Arc_Testnet: {
    chainIdHex: "0x4cef52",
    chainName: "Arc Testnet",
    rpcUrl: "https://rpc.testnet.arc.network",
    symbol: "USDC",
    decimals: 18,
    explorer: "https://testnet.arcscan.app",
  },
  Base_Sepolia: {
    chainIdHex: "0x14a34",
    chainName: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    symbol: "ETH",
    decimals: 18,
    explorer: "https://sepolia.basescan.org",
  },
  Arbitrum_Sepolia: {
    chainIdHex: "0x66eee",
    chainName: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    symbol: "ETH",
    decimals: 18,
    explorer: "https://sepolia.arbiscan.io",
  },
  Avalanche_Fuji: {
    chainIdHex: "0x2a",
    chainName: "Avalanche Fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    symbol: "AVAX",
    decimals: 18,
    explorer: "https://testnet.snowtrace.io",
  },
  Ethereum_Sepolia: {
    chainIdHex: "0xaa36a7",
    chainName: "Ethereum Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    symbol: "ETH",
    decimals: 18,
    explorer: "https://sepolia.etherscan.io",
  },
};

export const UnifiedBalance: React.FC<UnifiedBalanceProps> = ({
  adapter,
  userAddress,
  isMetaMask,
  onRefreshBalance,
  balancesState,
  setBalancesState,
}) => {
  const [activeTab, setActiveTab] = useState<"deposit" | "spend">("deposit");
  const [depChain, setDepChain] = useState("Base_Sepolia");
  const [depAmount, setDepAmount] = useState("");
  
  const [spendChain, setSpendChain] = useState("Arc_Testnet");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendRecipient, setSpendRecipient] = useState(userAddress);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string; txHash?: string } | null>(null);

  // Auto-fill recipient when userAddress changes
  useEffect(() => {
    if (userAddress && !spendRecipient) {
      setSpendRecipient(userAddress);
    }
  }, [userAddress]);

  // Aggregated USDC Balance
  const totalUnifiedUSDC = Object.values(balancesState).reduce((acc, val) => acc + parseFloat(val || "0"), 0);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adapter) {
      setStatus({ type: "error", msg: "Please connect your wallet first." });
      return;
    }
    if (!depAmount) {
      setStatus({ type: "error", msg: "Please enter a deposit amount." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", msg: "Preparing deposit process..." });

    try {
      // If MetaMask is used, switch to the selected Deposit Chain
      if (isMetaMask) {
        setStatus({ type: "info", msg: `Switching network to ${depChain.replace("_", " ")} in MetaMask...` });
        const netInfo = CHAIN_NETWORK_DETAILS[depChain];
        if (netInfo) {
          const switched = await switchOrAddNetwork(
            netInfo.chainIdHex,
            netInfo.chainName,
            netInfo.rpcUrl,
            netInfo.symbol,
            netInfo.decimals,
            netInfo.explorer
          );
          if (!switched) {
            throw new Error(`Failed to switch MetaMask to ${netInfo.chainName}.`);
          }
        }
      }

      setStatus({ type: "info", msg: `Depositing ${depAmount} USDC from ${depChain.replace("_", " ")} to Unified Balance...` });

      const kit = new AppKit();
      
      const result = await kit.unifiedBalance.deposit({
        from: {
          adapter,
          chain: depChain as any,
        },
        amount: depAmount,
        token: "USDC",
      });

      console.log("Deposit result:", result);

      setStatus({
        type: "success",
        msg: `Successfully deposited ${depAmount} USDC into your Unified Balance!`,
        txHash: (result as any).txHash || (result as any).transactionHash || (result as any).id || (typeof result === "string" ? result : undefined),
      });

      // Update state
      setBalancesState((prev) => ({
        ...prev,
        [depChain]: (parseFloat(prev[depChain] || "0") - parseFloat(depAmount)).toFixed(2),
        Arc_Testnet: (parseFloat(prev.Arc_Testnet || "0") + parseFloat(depAmount)).toFixed(2), // Add to virtual
      }));

      setDepAmount("");
      onRefreshBalance();
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: "error",
        msg: `${err.message || "An error occurred during deposit."}\n\n[DEMO MODE] Would you like to run a mock simulation of this deposit?`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adapter) {
      setStatus({ type: "error", msg: "Please connect your wallet first." });
      return;
    }
    if (!spendAmount || !spendRecipient) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }
    if (parseFloat(spendAmount) > totalUnifiedUSDC) {
      setStatus({ type: "error", msg: "Insufficient Unified Balance." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", msg: "Preparing spend transaction..." });

    try {
      setStatus({ type: "info", msg: `Spending ${spendAmount} USDC from Unified Balance to ${spendChain.replace("_", " ")}...` });

      const kit = new AppKit();
      
      const result = await kit.unifiedBalance.spend({
        amount: spendAmount,
        from: {
          adapter,
        },
        to: {
          adapter,
          chain: spendChain as any,
          recipientAddress: spendRecipient,
        },
      });

      console.log("Spend result:", result);

      setStatus({
        type: "success",
        msg: `Successfully spent ${spendAmount} USDC from Unified Balance to ${spendChain.replace("_", " ")}!`,
        txHash: (result as any).txHash || (result as any).transactionHash || (result as any).id || (typeof result === "string" ? result : undefined),
      });

      // Update state
      setBalancesState((prev) => ({
        ...prev,
        Arc_Testnet: (parseFloat(prev.Arc_Testnet || "0") - parseFloat(spendAmount)).toFixed(2),
        [spendChain]: (parseFloat(prev[spendChain] || "0") + parseFloat(spendAmount)).toFixed(2),
      }));

      setSpendAmount("");
      onRefreshBalance();
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: "error",
        msg: `${err.message || "An error occurred during spend."}\n\n[DEMO MODE] Would you like to run a mock simulation of this spend?`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDeposit = () => {
    setLoading(true);
    setStatus({ type: "info", msg: "[SIMULATION] Routing funds to Circle Gateway. Estimating gas..." });
    
    setTimeout(() => {
      setLoading(false);
      const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setStatus({
        type: "success",
        msg: `[SIMULATED] Successfully deposited ${depAmount} USDC from ${depChain.replace("_", " ")} into your Unified Balance!`,
        txHash: mockTxHash,
      });

      setBalancesState((prev) => {
        const nextVal = Math.max(0, parseFloat(prev[depChain] || "0") - parseFloat(depAmount)).toFixed(2);
        return {
          ...prev,
          [depChain]: nextVal,
        };
      });

      setDepAmount("");
      onRefreshBalance();
    }, 2000);
  };

  const handleSimulateSpend = () => {
    setLoading(true);
    setStatus({ type: "info", msg: "[SIMULATION] Initiating smart contract execution for multi-source spend..." });
    
    setTimeout(() => {
      setLoading(false);
      const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setStatus({
        type: "success",
        msg: `[SIMULATED] Successfully spent ${spendAmount} USDC from Unified Balance! Funds are now available on ${spendChain.replace("_", " ")}.`,
        txHash: mockTxHash,
      });

      setBalancesState((prev) => {
        const nextVal = (parseFloat(prev[spendChain] || "0") + parseFloat(spendAmount)).toFixed(2);
        return {
          ...prev,
          [spendChain]: nextVal,
        };
      });

      setSpendAmount("");
      onRefreshBalance();
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* 1. Aggregated Balances Header */}
      <div className="balance-grid">
        <div className="balance-card-summary total">
          <label>Unified Spendable USDC</label>
          <div className="value highlight">{totalUnifiedUSDC.toFixed(2)} USDC</div>
          <div className="sub">Aggregated from all connected blockchains</div>
        </div>

        <div className="balance-card-summary">
          <label>Arc Testnet Balance</label>
          <div className="value">{parseFloat(balancesState.Arc_Testnet || "0").toFixed(2)} USDC</div>
          <div className="sub">Native L1 Gas & Liquidity</div>
        </div>

        <div className="balance-card-summary">
          <label>Base Sepolia Balance</label>
          <div className="value">{parseFloat(balancesState.Base_Sepolia || "0").toFixed(2)} USDC</div>
          <div className="sub">Circle Bridge Partner</div>
        </div>
      </div>

      {/* 2. Individual Chain Breakdowns */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
            </svg>
            Multichain Asset Allocations
          </h2>
          <p>This aggregates USDC across multiple testnets into a single spending dashboard.</p>
        </div>

        {SUPPORTED_CHAINS.map((c) => (
          <div className="unified-balance-card" key={c.id}>
            <div className="chain-info">
              <div className="chain-logo-mock">
                {c.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="chain-details">
                <h4>{c.name}</h4>
                <p>{c.isArc ? "L1 Native chain" : "Supported CCTP chain"}</p>
              </div>
            </div>
            <div className="chain-balance-value">
              {parseFloat(balancesState[c.id] || "0").toFixed(2)} USDC
            </div>
          </div>
        ))}
      </div>

      {/* 3. Deposit & Spend Tabs */}
      <div className="glass-panel">
        <div className="tabs-container">
          <button
            type="button"
            className={`tab-btn ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("deposit");
              setStatus(null);
            }}
          >
            Deposit Funds
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "spend" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("spend");
              setStatus(null);
            }}
          >
            Spend Funds
          </button>
        </div>

        {activeTab === "deposit" ? (
          <form onSubmit={handleDeposit}>
            <div className="form-group">
              <label className="form-label">Source Chain (Deposit from)</label>
              <select
                className="form-select"
                value={depChain}
                onChange={(e) => setDepChain(e.target.value)}
                disabled={loading}
              >
                {SUPPORTED_CHAINS.filter(c => !c.isArc).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Amount</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  className="form-input"
                  placeholder="0.00"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="input-suffix">USDC</span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !userAddress || !depAmount}>
              {loading && <div className="spinner"></div>}
              {loading ? "Depositing..." : `Deposit ${depAmount || "0"} USDC to Unified Balance`}
            </button>

            {status?.type === "error" && (
              <button
                type="button"
                className="submit-btn"
                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", marginTop: "1rem" }}
                onClick={handleSimulateDeposit}
                disabled={loading}
              >
                Run Demo Deposit Simulation 🚀
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleSpend}>
            <div className="form-group">
              <label className="form-label">Destination Chain (Spend to)</label>
              <select
                className="form-select"
                value={spendChain}
                onChange={(e) => setSpendChain(e.target.value)}
                disabled={loading}
              >
                {SUPPORTED_CHAINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={spendRecipient}
                onChange={(e) => setSpendRecipient(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Spend Amount</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  className="form-input"
                  placeholder="0.00"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="input-suffix">USDC</span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !userAddress || !spendAmount}>
              {loading && <div className="spinner"></div>}
              {loading ? "Spending..." : `Spend ${spendAmount || "0"} USDC from Unified Balance`}
            </button>

            {status?.type === "error" && (
              <button
                type="button"
                className="submit-btn"
                style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))", marginTop: "1rem" }}
                onClick={handleSimulateSpend}
                disabled={loading}
              >
                Run Demo Spend Simulation 🚀
              </button>
            )}
          </form>
        )}

        {status && (
          <div className={`status-box ${status.type}`}>
            <div style={{ fontWeight: 600 }}>
              {status.type === "success" && "✓ Success"}
              {status.type === "error" && "⚠ Error"}
              {status.type === "info" && "ℹ Processing"}
            </div>
            <div style={{ whiteSpace: "pre-line" }}>{status.msg}</div>
            {status.txHash && !status.msg.includes("[SIMULATED]") && (
              <div style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
                Tx Hash:{" "}
                <a
                  href={`https://testnet.arcscan.app/tx/${status.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {status.txHash} ↗
                </a>
              </div>
            )}
            {status.txHash && status.msg.includes("[SIMULATED]") && (
              <div style={{ marginTop: "0.25rem", fontSize: "0.8rem", opacity: 0.7 }}>
                Mock Tx Hash: <span style={{ fontFamily: "monospace" }}>{status.txHash.substring(0, 16)}...</span> (Simulated on Client)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
