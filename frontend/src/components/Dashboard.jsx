import React, { useState, useEffect } from 'react';
import { monitoringAPI } from '../services/api';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, healthRes] = await Promise.all([
        monitoringAPI.getMetrics(),
        monitoringAPI.getHealth()
      ]);
      setMetrics(metricsRes.data);
      setHealth(healthRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Monitoring Dashboard</h2>
      
      <div className="health-section">
        <h3>System Health</h3>
        <div className={`status-badge ${health?.status}`}>
          {health?.status?.toUpperCase()}
        </div>
        <p>Success Rate: {health?.system?.successRate}%</p>
        <p>Uptime: {Math.floor((health?.system?.uptime || 0) / 1000)}s</p>
      </div>

      <div className="metrics-section">
        <h3>Action Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Total Actions</h4>
            <p className="metric-value">{metrics?.actions?.total || 0}</p>
          </div>
          <div className="metric-card">
            <h4>Successful</h4>
            <p className="metric-value success">{metrics?.actions?.successful || 0}</p>
          </div>
          <div className="metric-card">
            <h4>Failed</h4>
            <p className="metric-value failed">{metrics?.actions?.failed || 0}</p>
          </div>
          <div className="metric-card">
            <h4>Avg Execution Time</h4>
            <p className="metric-value">
              {Math.round(metrics?.performance?.averageExecutionTime || 0)}ms
            </p>
          </div>
        </div>
      </div>

      <div className="health-checks">
        <h3>Health Checks</h3>
        {health?.checks && Object.entries(health.checks).map(([name, check]) => (
          <div key={name} className="health-check">
            <span className="check-name">{name}</span>
            <span className={`check-status ${check.status}`}>{check.status}</span>
            <span className="check-message">{check.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
