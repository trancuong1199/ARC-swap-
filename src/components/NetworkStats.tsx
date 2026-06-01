import { useState, useEffect } from 'react';
import { Activity, BarChart2, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface NetworkStatsProps {
  connectedAccount: string | null;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ connectedAccount }) => {
  const [stats] = useState({
    volume24h: '$1,245,600',
    totalSwaps: '8,432',
    tvl: '$4,500,000'
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (!connectedAccount) {
      setTransactions([]);
      return;
    }

    const fetchTxs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://testnet.arcscan.app/api?module=account&action=txlist&address=${connectedAccount}&sort=desc&page=${page}&offset=${ITEMS_PER_PAGE}`);
        const data = await res.json();
        if (data && data.result && Array.isArray(data.result)) {
          setTransactions(data.result);
        } else {
          setTransactions([]); // End of pages
        }
      } catch (err) {
        console.error("Error fetching txs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTxs();
    
    // Listen for manual swap trigger
    const handleSwapExecuted = () => {
      // Poll multiple times to ensure we catch the Arcscan indexing delay
      setTimeout(fetchTxs, 2000);
      setTimeout(fetchTxs, 5000);
      setTimeout(fetchTxs, 10000);
    };
    window.addEventListener('swap_executed', handleSwapExecuted);
    
    // Auto-refresh every 10 seconds for the current page
    const interval = setInterval(fetchTxs, 10000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('swap_executed', handleSwapExecuted);
    };
  }, [connectedAccount, page]);

  // Fallback mock data if not connected
  const mockRecentSwaps = [
    { id: 1, route: 'USDC (Eth) → ARC', amount: '500 ARC', time: '2 mins ago' },
    { id: 2, route: 'USDT (Poly) → ARC', amount: '1,200 ARC', time: '5 mins ago' },
    { id: 3, route: 'ETH → USDC (Arc)', amount: '3,450 USDC', time: '12 mins ago' },
    { id: 4, route: 'ARC → MATIC', amount: '850 MATIC', time: '18 mins ago' },
  ];

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

      <div className="recent-swaps glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="recent-swaps-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="#8b5cf6" /> Recent Transactions
          </div>
          {connectedAccount && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                style={{ background: 'transparent', border: 'none', color: page === 1 ? '#555' : '#8b5cf6', cursor: page === 1 ? 'not-allowed' : 'pointer', padding: '0.25rem' }}
              >
                <ChevronLeft size={24} />
              </button>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E2E8F0', margin: '0 0.5rem' }}>Page {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={transactions.length < ITEMS_PER_PAGE || loading}
                style={{ background: 'transparent', border: 'none', color: transactions.length < ITEMS_PER_PAGE ? '#555' : '#8b5cf6', cursor: transactions.length < ITEMS_PER_PAGE ? 'not-allowed' : 'pointer', padding: '0.25rem' }}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          {!connectedAccount ? (
            mockRecentSwaps.map(swap => (
              <div key={swap.id} className="swap-item">
                <div className="swap-info">
                  <div className="swap-route">{swap.route}</div>
                  <div className="swap-time">{swap.time}</div>
                </div>
                <div className="swap-amount">+{swap.amount}</div>
              </div>
            ))
          ) : loading && transactions.length === 0 ? (
            <div style={{ padding: '2rem 1rem', color: '#A0A2A4', textAlign: 'center' }}>Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '2rem 1rem', color: '#A0A2A4', textAlign: 'center' }}>No transactions found on this page.</div>
          ) : (
            transactions.map((tx: any) => {
              const isError = tx.isError === "1";
              const timeStr = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
              return (
                <div 
                  key={tx.hash} 
                  className="swap-item" 
                  style={{ opacity: isError ? 0.6 : 1 }}
                  onClick={() => window.open(`https://testnet.arcscan.app/tx/${tx.hash}`, '_blank')}
                >
                  <div className="swap-info" style={{ overflow: 'hidden' }}>
                    <div className="swap-route" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Tx: {tx.hash.slice(0, 15)}...
                    </div>
                    <div className="swap-time">{timeStr}</div>
                  </div>
                  <div className="swap-amount" style={{ color: isError ? '#ef4444' : '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    {isError ? 'Failed' : 'Success'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
