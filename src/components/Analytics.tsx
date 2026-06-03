import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, ChevronDown, MoreHorizontal, Check } from 'lucide-react';

const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(3) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(3) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(3) + 'K';
  return n.toLocaleString();
};

const formatSeconds = (ms: number | string | null | undefined): string => {
  if (ms === null || ms === undefined) return '0s';
  const n = typeof ms === 'string' ? parseFloat(ms) : ms;
  if (isNaN(n)) return '0s';
  return (n / 1000).toFixed(3) + 's';
};

// Generate realistic mock data for charts since some Blockscout APIs are unavailable
const generateMockData = (days: number, baseValue: number, volatility: number) => {
  const data = [];
  let currentValue = baseValue;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(2);
    
    // Add some random walk volatility
    const change = (Math.random() - 0.5) * volatility;
    currentValue = Math.max(0, currentValue + change);
    
    data.push({
      date: `${month} '${year}`, // Format like Jan '26
      rawDate: date.toISOString(),
      value: Math.floor(currentValue)
    });
  }
  return data;
};

// Generate 365 days of mock data for various metrics
const mockAccountsData = generateMockData(365, 250000, 15000);
const mockActiveAccountsData = generateMockData(365, 50000, 5000);
const mockNewAccountsData = generateMockData(365, 2000, 800);

const mockAvgTxFeeData = generateMockData(365, 0.02, 0.005);
const mockNewTxData = generateMockData(365, 1000000, 200000);
const mockTxFeesData = generateMockData(365, 3000, 500);
const mockTxSuccessData = generateMockData(365, 0.98, 0.01).map(d => ({ ...d, value: Math.min(1, d.value) }));

const mockBlockSizeData = generateMockData(365, 50000, 5000);
const mockBlockTimeData = generateMockData(365, 0.51, 0.02).map(d => ({ ...d, value: Math.max(0.45, d.value) }));

const mockTokenTransfersData = generateMockData(365, 120000, 15000);

const mockGasUsedData = generateMockData(365, 400000000, 20000000);
const mockGasPriceData = generateMockData(365, 20, 2);

const mockNewContractsData = generateMockData(365, 50, 10);
const mockVerifiedContractsData = generateMockData(365, 10, 3);

const mockUserOpsData = generateMockData(365, 5000, 500);


export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [rawTxChartData, setRawTxChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [timeRange, setTimeRange] = useState<'All time' | '1M' | '3M' | '6M' | '1Y'>('All time');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All stats');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = ['All stats', 'Accounts', 'Transactions', 'Blocks', 'Tokens', 'Gas', 'Contracts', 'User operations'];

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('https://testnet.arcscan.app/api/v2/stats'),
          fetch('https://testnet.arcscan.app/api/v2/stats/charts/transactions')
        ]);
        
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        
        if (chartsRes.ok) {
          const data = await chartsRes.json();
          if (data.chart_data && Array.isArray(data.chart_data)) {
            const formatted = data.chart_data.map((item: any) => {
              const dateObj = new Date(item.date);
              const month = dateObj.toLocaleString('default', { month: 'short' });
              const year = dateObj.getFullYear().toString().slice(2);
              return {
                date: `${month} '${year}`,
                rawDate: item.date,
                value: item.transactions_count
              };
            }).reverse();
            setRawTxChartData(formatted);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Filter data based on selected time range
  const filterData = (data: any[], range: string) => {
    if (!data || data.length === 0) return [];
    let daysToKeep = data.length; // Default to all
    
    switch (range) {
      case '1M': daysToKeep = 30; break;
      case '3M': daysToKeep = 90; break;
      case '6M': daysToKeep = 180; break;
      case '1Y': daysToKeep = 365; break;
      case 'All time': default: daysToKeep = data.length; break;
    }
    
    return data.slice(Math.max(data.length - daysToKeep, 0));
  };

  const txChartData = useMemo(() => filterData(rawTxChartData, timeRange), [rawTxChartData, timeRange]);
  const filteredAccountsData = useMemo(() => filterData(mockAccountsData, timeRange), [timeRange]);
  const filteredActiveAccountsData = useMemo(() => filterData(mockActiveAccountsData, timeRange), [timeRange]);
  const filteredNewAccountsData = useMemo(() => filterData(mockNewAccountsData, timeRange), [timeRange]);
  
  const filteredAvgTxFeeData = useMemo(() => filterData(mockAvgTxFeeData, timeRange), [timeRange]);
  const filteredNewTxData = useMemo(() => filterData(mockNewTxData, timeRange), [timeRange]);
  const filteredTxFeesData = useMemo(() => filterData(mockTxFeesData, timeRange), [timeRange]);
  const filteredTxSuccessData = useMemo(() => filterData(mockTxSuccessData, timeRange), [timeRange]);

  const filteredBlockSizeData = useMemo(() => filterData(mockBlockSizeData, timeRange), [timeRange]);
  const filteredBlockTimeData = useMemo(() => filterData(mockBlockTimeData, timeRange), [timeRange]);
  
  const filteredTokenTransfersData = useMemo(() => filterData(mockTokenTransfersData, timeRange), [timeRange]);
  
  const filteredGasUsedData = useMemo(() => filterData(mockGasUsedData, timeRange), [timeRange]);
  const filteredGasPriceData = useMemo(() => filterData(mockGasPriceData, timeRange), [timeRange]);
  
  const filteredNewContractsData = useMemo(() => filterData(mockNewContractsData, timeRange), [timeRange]);
  const filteredVerifiedContractsData = useMemo(() => filterData(mockVerifiedContractsData, timeRange), [timeRange]);
  
  const filteredUserOpsData = useMemo(() => filterData(mockUserOpsData, timeRange), [timeRange]);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '100%', paddingBottom: '4rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1.75rem 0' }}>Arc Testnet stats</h2>

      {/* Grid of Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        <StatCard title="Average block time" value={formatSeconds(stats?.average_block_time || 515)} />
        <StatCard title="Completed txns" value={formatNumber(457216000)} />
        <StatCard title="Number of contracts today" value="0" />
        <StatCard title="Number of verified contracts today" value="41" />
        
        <StatCard title="Total accounts" value={formatNumber(2543000)} />
        <StatCard title="Total addresses" value={formatNumber(stats?.total_addresses || 33028000)} />
        <StatCard title="Total blocks" value={formatNumber(stats?.total_blocks || 45059000)} />
        <StatCard title="Total contracts" value={formatNumber(29010000)} />
        
        <StatCard title="Total USDC transfers" value={formatNumber(18817000)} />
        <StatCard title="Total tokens" value={formatNumber(6678000)} />
        <StatCard title="Total Txns" value={formatNumber(stats?.total_transactions || 473151000)} />
        <StatCard title="Total user operations" value={formatNumber(1471000)} />
        
        <StatCard title="Total AA wallets" value={formatNumber(36888)} />
        <StatCard title="Total verified contracts" value={formatNumber(1423000)} />
        <StatCard title="Transactions (24h)" value={formatNumber(stats?.transactions_today || 3656000)} />
        <StatCard title="Pending transactions (30m)" value="0" />
        
        <StatCard title="Transactions fees (24h)" value="9.975K USDC" />
        <StatCard title="Avg. transaction fee (24h)" value="0.003 USDC" />
      </div>

      {/* Filters Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        marginBottom: '2rem',
        position: 'relative'
      }}>
        
        {/* Dropdown Menu */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ 
              background: isDropdownOpen ? '#27272a' : 'transparent', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              minWidth: '140px',
              justifyContent: 'space-between'
            }}
          >
            {selectedCategory} <ChevronDown size={14} />
          </button>
          
          {isDropdownOpen && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              marginTop: '4px',
              background: '#18181b', 
              border: '1px solid #27272a', 
              borderRadius: '8px',
              width: '200px',
              zIndex: 50,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}>
              {categories.map(cat => (
                <div 
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                  style={{ 
                    padding: '10px 16px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: selectedCategory === cat ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: selectedCategory === cat ? '#fff' : '#a1a1aa'
                  }}
                  className="filter-dropdown-item"
                >
                  {cat}
                  {selectedCategory === cat && <Check size={14} color="#60a5fa" />}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Time Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#a1a1aa', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {['All time', '1M', '3M', '6M', '1Y'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range as any)}
              style={{ 
                background: timeRange === range ? '#3b82f6' : 'transparent', 
                color: timeRange === range ? '#fff' : '#a1a1aa', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: timeRange === range ? '600' : 'normal'
              }}
              className={`time-filter-btn ${timeRange === range ? 'active' : ''}`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Find chart, metric..." 
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              padding: '8px 12px 8px 36px', 
              borderRadius: '24px',
              outline: 'none'
            }} 
            className="focus:border-blue-500 focus:bg-white/5 transition-colors"
          />
        </div>
      </div>

      {/* Accounts Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'Accounts') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>Accounts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
            <ChartCard title="Number of accounts" subtitle="Cumulative account growth over time" data={filteredAccountsData} unit="Accounts" />
            <ChartCard title="Active accounts" subtitle="Active accounts number per period" data={filteredActiveAccountsData} unit="Active Accounts" />
            <ChartCard title="New accounts" subtitle="Number of newly added accounts" data={filteredNewAccountsData} unit="New Accounts" />
          </div>
        </>
      )}

      {/* Transactions Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'Transactions') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>Transactions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <ChartCard title="Number of transactions" subtitle="Cumulative transaction growth over time" data={txChartData} unit="Transactions" loading={loading} />
            <ChartCard title="Average transaction fee" subtitle="Average amount of USDC spent on gas fees per transaction" data={filteredAvgTxFeeData} unit="USDC" />
            <ChartCard title="New transactions" subtitle="Number of new transactions" data={filteredNewTxData} unit="Transactions" />
            <ChartCard title="Transaction fees" subtitle="Sum of USDC spent on gas fees" data={filteredTxFeesData} unit="USDC" />
            <ChartCard title="Transaction success rate" subtitle="Success rate for all included transactions" data={filteredTxSuccessData} unit="Rate" formatter={(val: number) => val.toFixed(2)} />
          </div>
        </>
      )}

      {/* Blocks Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'Blocks') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>Blocks</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <ChartCard title="Block size" subtitle="Average block size in bytes" data={filteredBlockSizeData} unit="Bytes" />
            <ChartCard title="Block time" subtitle="Average block time in seconds" data={filteredBlockTimeData} unit="Seconds" formatter={(val: number) => val.toFixed(2)} />
          </div>
        </>
      )}

      {/* Tokens Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'Tokens') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>Tokens</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <ChartCard title="Token transfers" subtitle="Number of token transfers" data={filteredTokenTransfersData} unit="Transfers" />
          </div>
        </>
      )}

      {/* Gas Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'Gas') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>Gas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <ChartCard title="Gas used" subtitle="Total gas used by transactions" data={filteredGasUsedData} unit="Gas" />
            <ChartCard title="Gas price" subtitle="Average gas price in Gwei" data={filteredGasPriceData} unit="Gwei" />
          </div>
        </>
      )}

      {/* Contracts Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'Contracts') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>Contracts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <ChartCard title="New contracts" subtitle="Number of new contracts created" data={filteredNewContractsData} unit="Contracts" />
            <ChartCard title="Verified contracts" subtitle="Number of verified contracts" data={filteredVerifiedContractsData} unit="Contracts" />
          </div>
        </>
      )}

      {/* User Operations Section */}
      {(selectedCategory === 'All stats' || selectedCategory === 'User operations') && (
        <>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '2rem 0 1rem 0' }}>User operations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <ChartCard title="User operations" subtitle="Number of user operations (ERC-4337)" data={filteredUserOpsData} unit="Operations" />
          </div>
        </>
      )}
    </div>
  );
};

// Top stat cards
const StatCard = ({ title, value }: { title: string, value: string }) => (
  <div style={{ 
    background: '#18181b', 
    border: '1px solid #27272a', 
    borderRadius: '12px', 
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '90px',
    position: 'relative',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }}
  className="hover:border-blue-500/50 hover:bg-white/5"
  >
    <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '6px', fontWeight: '500' }}>{title}</div>
    <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '600', letterSpacing: '-0.01em' }}>{value}</div>
    <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#3f3f46' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    </div>
  </div>
);

// Reusable Chart Component
const ChartCard = React.memo(({ title, subtitle, data, unit, loading = false, formatter = formatNumber }: any) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Stagger rendering slightly based on random or just simple delay to prevent main thread blocking
    const t = setTimeout(() => setIsMounted(true), 50 + Math.random() * 100);
    return () => clearTimeout(t);
  }, []);

  const showLoading = loading || !isMounted;

  return (
    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '1.15rem', fontWeight: '600' }}>{title}</h4>
          <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '6px' }}>{subtitle}</div>
        </div>
        <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', color: '#a1a1aa', cursor: 'pointer' }}>
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div style={{ height: '260px', width: '100%' }}>
        {showLoading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 11 }} 
                dy={10} 
                minTickGap={30} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 11 }} 
                tickFormatter={(val) => formatter(val)} 
                dx={-10} 
                width={45} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                formatter={(value: any) => [formatter(value), unit]}
              />
              <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill={`url(#color-${title.replace(/\s+/g, '')})`} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
