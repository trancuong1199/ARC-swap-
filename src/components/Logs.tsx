import React, { useState, useSyncExternalStore } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, Filter } from 'lucide-react';
import { getApiLogs, subscribeToApiLogs } from '../lib/ApiLogger';

const mockChartData = [
  { time: '08:00', errorCount: 0, successRate: 100 },
  { time: '12:00', errorCount: 0, successRate: 100 },
  { time: '01:00', errorCount: 0, successRate: 100 },
  { time: '06:00', errorCount: 0, successRate: 100 },
  { time: '11:00', errorCount: 0, successRate: 100 },
  { time: '04:00', errorCount: 0, successRate: 100 },
  { time: '05:00', errorCount: 1, successRate: 83.33 },
  { time: '07:00', errorCount: 0, successRate: 100 },
];

const mockRequests = [
  {
    id: 'ce3616f1-e830-4881-afc3-9d8e7b1a2c3d',
    status: 200,
    method: 'GET',
    path: '/v1/w3s/config/entity/publicKey',
    date: '2026-06-02',
    time: '07:04:13 GMT+7'
  },
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    status: 400,
    method: 'POST',
    path: '/v1/w3s/developer/walletSets',
    date: '2026-06-02',
    time: '07:02:15 GMT+7'
  },
  {
    id: 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3c2d1e0f',
    status: 200,
    method: 'GET',
    path: '/v1/w3s/config/entity/publicKey',
    date: '2026-06-02',
    time: '07:00:10 GMT+7'
  },
  {
    id: '98765432-1234-5678-abcd-ef0123456789',
    status: 201,
    method: 'POST',
    path: '/v1/w3s/smart-contracts/templates/deploy',
    date: '2026-06-01',
    time: '23:15:45 GMT+7'
  },
  {
    id: '12345678-90ab-cdef-1234-567890abcdef',
    status: 200,
    method: 'GET',
    path: '/v1/w3s/smart-contracts/0x123...abc',
    date: '2026-06-01',
    time: '23:16:10 GMT+7'
  },
];

export const Logs: React.FC = () => {

  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const realLogs = useSyncExternalStore(subscribeToApiLogs, getApiLogs);
  
  // Combine real logs with mock data, so the user sees their live transactions at the top!
  const displayRequests = [...realLogs, ...mockRequests];

  // Compute metrics
  const totalRequests = displayRequests.length;
  const clientErrors = displayRequests.filter(r => r.status >= 400 && r.status < 500).length;
  const serverErrors = displayRequests.filter(r => r.status >= 500).length;
  const successCount = displayRequests.filter(r => r.status >= 200 && r.status < 300).length;
  const successRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(2) : '0.00';
  const latency = totalRequests > 0 ? Math.floor(80 + (totalRequests * 2.5)) % 150 + 50 : 0;

  const dynamicChartData = [...displayRequests].reverse().map((req, i, arr) => {
    const successUpToNow = arr.slice(0, i + 1).filter(r => r.status >= 200 && r.status < 300).length;
    const rate = ((successUpToNow / (i + 1)) * 100).toFixed(2);
    return {
      time: req.time.split(' ')[0].substring(0, 5),
      errorCount: req.status >= 400 ? 1 : 0,
      successRate: parseFloat(rate)
    };
  }).slice(-15);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '100%' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">API Logs</h2>
          <p className="page-subtitle">Circle Smart Contracts & Web3 Services API Activity</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
          <button 
            className={`app-kit-tab ${network === 'testnet' ? 'active' : ''}`} 
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            onClick={() => setNetwork('testnet')}
          >
            Testnet
          </button>
          <button 
            className={`app-kit-tab ${network === 'mainnet' ? 'active' : ''}`} 
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            onClick={() => setNetwork('mainnet')}
          >
            Mainnet
          </button>
        </div>
      </div>

      {network === 'mainnet' ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Filter size={24} color="#71717a" />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>No Mainnet Data Available</h3>
          <p style={{ color: '#a1a1aa', maxWidth: '400px', margin: '0 auto' }}>
            Your Circle Developer Account is currently in Sandbox mode. Switch back to Testnet to view API logs, or upgrade your account to access Mainnet Web3 Services.
          </p>
        </div>
      ) : (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Metrics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{totalRequests}</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Total Requests</div>
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginTop: '0.5rem' }}>{latency} <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 'normal' }}>milliseconds</span></div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Latency</div>
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginTop: '0.5rem' }}>{clientErrors}</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Client-side Errors</div>
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginTop: '0.5rem' }}>{serverErrors}</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Server-side Errors</div>
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginTop: '0.5rem' }}>{successRate} %</div>
            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Success rate</div>
          </div>
        </div>

        {/* Chart Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>API Calls</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#ef4444' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div> ERROR COUNT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#22c55e' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div> SUCCESS RATE
              </div>
              <button className="action-btn" style={{ padding: '4px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                Last 24 hours <ChevronDown size={14} />
              </button>
            </div>
          </div>
          
          <div style={{ height: '400px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicChartData.length > 0 ? dynamicChartData : mockChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                
                {/* Left Y-Axis for Error Count */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  domain={[0, 1]}
                  ticks={[0, 0.5, 1]}
                  dx={-10}
                />
                
                {/* Right Y-Axis for Success Rate */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  dx={10}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                
                <Line yAxisId="right" type="linear" dataKey="successRate" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line yAxisId="left" type="linear" dataKey="errorCount" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Requests List */}
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', fontWeight: '600' }}>Requests</h3>
          
          <div style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            June 2, 2026
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {displayRequests.map((req) => (
              <div key={req.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }} className="hover:bg-white/5">
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '70px' }}>
                    <span style={{ 
                      color: req.status === 200 || req.status === 201 ? '#22c55e' : '#ef4444', 
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {req.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e4e4e7' }}>{req.method}</span>
                  </div>
                  
                  <div style={{ color: '#a1a1aa', fontSize: '0.9rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                    {req.path}
                  </div>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#71717a', textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {req.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        </div>
      )}
    </div>
  );
};
