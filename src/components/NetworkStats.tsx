import { useState } from 'react';
import { Activity, BarChart2, Zap } from 'lucide-react';

export const NetworkStats = () => {
  // Using mocked data to demonstrate the intended UI based on Goldsky GraphQL data
  const [stats] = useState({
    volume24h: '$1,245,600',
    totalSwaps: '8,432',
    tvl: '$4,500,000'
  });

  const [recentSwaps] = useState([
    { id: 1, route: 'USDC (Eth) → ARC', amount: '500 ARC', time: '2 mins ago' },
    { id: 2, route: 'USDT (Poly) → ARC', amount: '1,200 ARC', time: '5 mins ago' },
    { id: 3, route: 'ETH → USDC (Arc)', amount: '3,450 USDC', time: '12 mins ago' },
    { id: 4, route: 'ARC → MATIC', amount: '850 MATIC', time: '18 mins ago' },
  ]);

  return (
    <div className="animate-fade-in">
      <div className="stats-container">
        <div className="stat-card glass-panel">
          <div className="stat-title"><BarChart2 size={16} /> 24H Volume</div>
          <div className="stat-value">{stats.volume24h}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-title"><Activity size={16} /> Total Swaps</div>
          <div className="stat-value">{stats.totalSwaps}</div>
        </div>
      </div>

      <div className="recent-swaps glass-panel">
        <div className="recent-swaps-header">
          <Zap size={20} color="#8b5cf6" /> Live Goldsky Feed
        </div>
        
        {recentSwaps.map(swap => (
          <div key={swap.id} className="swap-item">
            <div className="swap-info">
              <div className="swap-route">{swap.route}</div>
              <div className="swap-time">{swap.time}</div>
            </div>
            <div className="swap-amount">+{swap.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
