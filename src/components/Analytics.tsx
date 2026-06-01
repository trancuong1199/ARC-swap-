import React from 'react';
import { NetworkStats } from './NetworkStats';
import { BarChart3, Activity } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <BarChart3 color="var(--accent-secondary)" />
            Protocol Analytics
          </h2>
          <p className="page-subtitle">Real-time data indexed from the Arc Testnet using Goldsky Subgraphs.</p>
        </div>
      </div>

      {/* Main Stats Component */}
      <NetworkStats />

      {/* Additional Mock Analytics content */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h3 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
          <Activity size={20} color="#60a5fa" />
          Network Activity (24h)
        </h3>
        
        {/* Mock Chart Area */}
        <div className="chart-container">
          {/* Creating some random mock bars */}
          {[40, 60, 30, 80, 50, 90, 70, 100, 60, 85, 45, 75, 55, 95].map((height, i) => (
            <div 
              key={i} 
              className="chart-bar"
              style={{ height: `${height}%` }}
              title={`Volume: $${(height * 12345).toLocaleString()}`}
            ></div>
          ))}
        </div>
        <div className="chart-labels">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
};
