import { render, screen } from '@testing-library/react';
import App from './App';

test('renders automation bot framework header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Automation Bot Framework/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders navigation tabs', () => {
  render(<App />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Action Replay/i)).toBeInTheDocument();
  expect(screen.getByText(/AI Acceleration/i)).toBeInTheDocument();
});
