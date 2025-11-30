/**
 * XPBar Component Usage Example
 * 
 * This file demonstrates how to integrate the XPBar component into your application.
 */

import XPBar from './XPBar';

// Example 1: Basic usage in a dashboard
function Dashboard({ theme }) {
  return (
    <div className="dashboard">
      <h2>Your Progress</h2>
      <XPBar theme={theme} />
    </div>
  );
}

// Example 2: Usage in a header or sidebar
function Sidebar({ theme }) {
  return (
    <aside className="sidebar">
      <div className="user-stats">
        <XPBar theme={theme} />
      </div>
    </aside>
  );
}

// Example 3: Usage in a gamification dashboard
function GamificationDashboard({ theme }) {
  return (
    <div className="gamification-dashboard">
      <div className="stats-section">
        <h1>Your Journey</h1>
        <XPBar theme={theme} />
        {/* Other gamification components */}
      </div>
    </div>
  );
}

export { Dashboard, Sidebar, GamificationDashboard };
