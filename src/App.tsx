import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CameraCard } from './components/dashboard/CameraCard';
import { WeatherAndQuickToggles } from './components/dashboard/WeatherAndQuickToggles';
import { AirConditionerCard } from './components/dashboard/AirConditionerCard';
import { MyRoomsSection } from './components/dashboard/MyRoomsSection';
import { EnergyChartCard } from './components/dashboard/EnergyChartCard';
import { TransportPage } from './components/transport/TransportPage';
import { SettingsAndMigrationView } from './components/settings/SettingsAndMigrationView';
import {
  AnalyticsView,
  NotificationsView,
  SchedulesView,
} from './components/views/SecondaryViews';

const DashboardContent: React.FC = () => {
  const { activeNav } = useDashboard();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-workspace">
        <Header />

        <main className="workspace-body">
          {activeNav === 'dashboard' && (
            <div className="home-dashboard-grid">
              <div className="dashboard-left-main">
                <div className="dashboard-top-pair">
                  <CameraCard />
                  <WeatherAndQuickToggles />
                </div>
                <MyRoomsSection />
              </div>

              <div className="dashboard-right-col">
                <AirConditionerCard />
                <EnergyChartCard />
              </div>
            </div>
          )}

          {activeNav === 'transport' && <TransportPage />}
          {activeNav === 'analytics' && <AnalyticsView />}
          {activeNav === 'messages' && <NotificationsView />}
          {activeNav === 'calendar' && <SchedulesView />}
          {activeNav === 'docs' && (
            <SettingsAndMigrationView defaultTab="migration" />
          )}
          {activeNav === 'settings' && (
            <SettingsAndMigrationView defaultTab="ha" />
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default App;

