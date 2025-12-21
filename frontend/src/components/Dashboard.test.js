import { render } from '@testing-library/react';
import Dashboard from './Dashboard';

jest.mock('../services/api', () => ({
  monitoringAPI: {
    getMetrics: jest.fn(() => Promise.resolve({
      data: {
        actions: { total: 10, successful: 9, failed: 1 },
        performance: { averageExecutionTime: 150, executionTimes: [100, 200] },
        system: { uptime: 10000, startTime: Date.now() - 10000 }
      }
    })),
    getHealth: jest.fn(() => Promise.resolve({
      data: {
        status: 'healthy',
        system: { successRate: '90.00', uptime: 10000 },
        checks: {}
      }
    }))
  }
}));

describe('Dashboard Component', () => {
  test('renders dashboard title', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText(/Monitoring Dashboard/i)).toBeInTheDocument();
  });
});
