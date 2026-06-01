import React from 'react';
import { Droplet, TrendingUp, AlertCircle } from 'lucide-react';

export const Pools: React.FC = () => {
  const pools = [
    { pair: 'ARC / USDC', tvl: '$4.2M', apr: '12.4%', volume: '$1.1M' },
    { pair: 'EURC / USDC', tvl: '$8.5M', apr: '5.2%', volume: '$3.4M' },
    { pair: 'ARC / ETH', tvl: '$1.8M', apr: '18.7%', volume: '$450K' },
    { pair: 'USYC / USDC', tvl: '$12.1M', apr: '8.4%', volume: '$2.2M' },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Droplet color="var(--accent-primary)" />
            Liquidity Pools
          </h2>
          <p className="page-subtitle">Provide liquidity to Arc Testnet pools and earn fees.</p>
        </div>
        <button className="wallet-button" style={{ background: 'var(--accent-gradient)' }}>
          Create New Position
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pool</th>
              <th>TVL</th>
              <th>Volume (24h)</th>
              <th style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                APR <TrendingUp size={14} className="text-success" />
              </th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool, idx) => (
              <tr key={idx}>
                <td>
                  <div className="pool-pair">
                    {pool.pair}
                  </div>
                </td>
                <td>{pool.tvl}</td>
                <td>{pool.volume}</td>
                <td className="text-success font-bold">{pool.apr}</td>
                <td className="text-right">
                  <button className="action-btn">
                    Add Liquidity
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box">
        <AlertCircle color="#bfdbfe" size={20} />
        <p className="info-text">
          <strong>Note:</strong> All pools listed here are deployed on the Arc Testnet. Adding liquidity will utilize your testnet tokens and simulate earning real yields.
        </p>
      </div>
    </div>
  );
};
